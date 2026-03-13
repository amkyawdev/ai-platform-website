/**
 * AI API - AI Provider Integration via Cloudflare Worker
 * AmkyawDev AI Power Platform
 */

class AIAPI {
    constructor() {
        this.cache = new Map();
        this.requestQueue = [];
        this.isProcessing = false;
        this.workerUrl = WORKER_URL || 'https://amkyawdev.mysvm.workers.dev';
    }

    /**
     * Set API key for provider
     */
    setApiKey(provider, key) {
        // Store in localStorage for persistence
        const keys = Storage.get(STORAGE_KEYS.apiKeys, {});
        keys[provider] = key;
        Storage.set(STORAGE_KEYS.apiKeys, keys);
    }

    /**
     * Get API key for provider
     */
    getApiKey(provider) {
        const keys = Storage.get(STORAGE_KEYS.apiKeys, {});
        return keys[provider];
    }

    /**
     * Make API request via Cloudflare Worker
     */
    async request(endpoint, options = {}) {
        const { method = 'POST', body, retries = APP_CONFIG.retry.maxAttempts } = options;
        
        // Check cache for GET requests
        const cacheKey = `${endpoint}:${JSON.stringify(body)}`;
        if (method === 'POST' && APP_CONFIG.features.caching) {
            const cached = this.cache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hour cache
                return cached.data;
            }
        }

        let lastError;
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await this._makeRequest(endpoint, {
                    method,
                    body
                });

                // Cache successful responses
                if (APP_CONFIG.features.caching && response) {
                    this.cache.set(cacheKey, {
                        data: response,
                        timestamp: Date.now()
                    });
                }

                return response;
            } catch (error) {
                lastError = error;
                console.error(`Request attempt ${attempt} failed:`, error);

                if (attempt < retries && this._shouldRetry(error)) {
                    const delay = APP_CONFIG.retry.delay * Math.pow(APP_CONFIG.retry.backoffMultiplier, attempt - 1);
                    await Utils.sleep(delay);
                }
            }
        }

        throw lastError;
    }

    /**
     * Make the actual HTTP request to Cloudflare Worker
     */
    async _makeRequest(endpoint, options) {
        const { method, body } = options;
        
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

        try {
            const response = await fetch(`${this.workerUrl}${endpoint}`, {
                ...config,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new APIError(response.status, error.message || 'Request failed', error);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new APIError(408, 'Request timeout');
            }
            throw error;
        }
    }

    /**
     * Check if error should trigger retry
     */
    _shouldRetry(error) {
        if (error instanceof APIError) {
            // Retry on timeout, rate limit, or server errors
            return [408, 429, 500, 502, 503, 504].includes(error.status);
        }
        return true;
    }

    /**
     * Chat completion via Worker
     */
    async chat(messages, options = {}) {
        const { model = APP_CONFIG.defaults.model, temperature = APP_CONFIG.defaults.temperature, maxTokens = APP_CONFIG.defaults.maxTokens, stream = false } = options;

        const body = {
            action: 'chat',
            model,
            messages,
            temperature,
            max_tokens: maxTokens,
            stream
        };

        if (stream) {
            return this._streamChat(body);
        }

        const result = await this.request('/api/chat', { body });
        return result.response || result.content || result.text;
    }

    /**
     * Stream chat completion
     */
    async *_streamChat(body) {
        const response = await fetch(`${this.workerUrl}/api/chat/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data: ')) continue;
                
                const data = trimmed.slice(6);
                if (data === '[DONE]') return;

                try {
                    const parsed = JSON.parse(data);
                    const content = parsed.token || parsed.content || parsed.delta || '';
                    if (content) yield content;
                } catch (e) {
                    // Skip invalid JSON
                }
            }
        }
    }

    /**
     * Image generation via Worker (DALL-E / Stable Diffusion)
     */
    async generateImage(prompt, options = {}) {
        const { size = '1024x1024', quality = 'standard', n = 1, model = 'dall-e-3' } = options;

        const body = {
            action: 'image',
            model,
            prompt,
            n,
            size,
            quality
        };

        const result = await this.request('/api/image', { body });
        
        return result.images || result.data || [{
            url: result.url || result.image_url,
            revisedPrompt: result.revised_prompt || prompt
        }];
    }

    /**
     * Audio transcription via Worker (Whisper)
     */
    async transcribeAudio(audioFile, options = {}) {
        const { language = 'my', prompt = '' } = options;

        const formData = new FormData();
        formData.append('file', audioFile);
        formData.append('language', language);
        if (prompt) formData.append('prompt', prompt);

        const response = await fetch(`${this.workerUrl}/api/transcribe`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        return result.text || result.transcription;
    }

    /**
     * Text to speech via Worker
     */
    async textToSpeech(text, options = {}) {
        const { voice = 'alloy', model = 'tts-1', speed = 1.0 } = options;

        const body = {
            action: 'tts',
            model,
            voice,
            input: text,
            speed
        };

        const result = await this.request('/api/tts', { body });
        
        // Return audio URL or blob
        if (result.audio_url) {
            return result.audio_url;
        }
        
        // Return base64 audio
        if (result.audio) {
            const blob = this._base64ToBlob(result.audio, 'audio/mpeg');
            return URL.createObjectURL(blob);
        }
        
        throw new Error('No audio returned');
    }

    /**
     * Translation via Worker
     */
    async translate(text, targetLang, sourceLang = 'auto') {
        const body = {
            action: 'translate',
            text,
            target_lang: targetLang,
            source_lang: sourceLang
        };

        const result = await this.request('/api/translate', { body });
        return result.translated_text || result.translation || result.text;
    }

    /**
     * Sentiment analysis via Worker
     */
    async analyzeSentiment(text) {
        const body = {
            action: 'sentiment',
            text
        };

        const result = await this.request('/api/analyze', { body });
        
        return result.sentiment || {
            sentiment: result.label || 'neutral',
            score: result.score || 0.5,
            emotions: result.emotions || []
        };
    }

    /**
     * Summarization via Worker
     */
    async summarize(text, options = {}) {
        const { maxLength = 200, style = 'balanced' } = options;
        
        const body = {
            action: 'summarize',
            text,
            max_length: maxLength,
            style
        };

        const result = await this.request('/api/summarize', { body });
        return result.summary || result.summarized_text || result.text;
    }

    /**
     * Video generation (if supported)
     */
    async generateVideo(prompt, options = {}) {
        const { duration = 5, model = 'kling' } = options;

        const body = {
            action: 'video',
            model,
            prompt,
            duration
        };

        const result = await this.request('/api/video', { body });
        return result.video_url || result.url || result;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get cache size
     */
    getCacheSize() {
        return this.cache.size;
    }

    /**
     * Helper: Convert base64 to Blob
     */
    _base64ToBlob(base64, mimeType) {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    }
}

/**
 * API Error class
 */
class APIError extends Error {
    constructor(status, message, details = null) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.details = details;
    }
}

// Export
const aiAPI = new AIAPI();
if (typeof window !== 'undefined') {
    window.AIAPI = AIAPI;
    window.APIError = APIError;
    window.aiAPI = aiAPI;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AIAPI, APIError, aiAPI };
}

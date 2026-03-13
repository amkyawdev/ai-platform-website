/**
 * AI API - AI Provider Integration
 * AmkyawDev AI Power Platform
 */

class AIAPI {
    constructor() {
        this.apiKeys = Storage.get(STORAGE_KEYS.apiKeys, {});
        this.cache = new Map();
        this.requestQueue = [];
        this.isProcessing = false;
    }

    /**
     * Set API key for provider
     */
    setApiKey(provider, key) {
        this.apiKeys[provider] = key;
        Storage.set(STORAGE_KEYS.apiKeys, this.apiKeys);
    }

    /**
     * Get API key for provider
     */
    getApiKey(provider) {
        return this.apiKeys[provider];
    }

    /**
     * Make API request with retry logic
     */
    async request(provider, endpoint, options = {}) {
        const { method = 'POST', body, headers = {}, retries = APP_CONFIG.retry.maxAttempts } = options;
        
        // Check cache for GET requests
        const cacheKey = `${provider}:${endpoint}:${JSON.stringify(body)}`;
        if (method === 'POST' && APP_CONFIG.features.caching) {
            const cached = this.cache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hour cache
                return cached.data;
            }
        }

        let lastError;
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await this._makeRequest(provider, endpoint, {
                    method,
                    body,
                    headers
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
     * Make the actual HTTP request
     */
    async _makeRequest(provider, endpoint, options) {
        const { method, body, headers } = options;
        const baseUrl = API_CONFIG.providers[provider];
        
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        // Add API key for OpenAI
        if (provider === 'openai' && this.apiKeys.openai) {
            config.headers['Authorization'] = `Bearer ${this.apiKeys.openai}`;
        }

        // Add API key for Anthropic
        if (provider === 'anthropic' && this.apiKeys.anthropic) {
            config.headers['x-api-key'] = this.apiKeys.anthropic;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

        try {
            const response = await fetch(`${baseUrl}${endpoint}`, {
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
     * Chat completion
     */
    async chat(messages, options = {}) {
        const { model = APP_CONFIG.defaults.model, temperature = APP_CONFIG.defaults.temperature, maxTokens = APP_CONFIG.defaults.maxTokens, stream = false } = options;

        let provider = 'openai';
        let endpoint = '/chat/completions';
        let body = {
            model,
            messages,
            temperature,
            max_tokens: maxTokens,
            stream
        };

        // Handle different providers
        if (model.startsWith('claude')) {
            provider = 'anthropic';
            endpoint = '/messages';
            body = {
                model: model.replace('claude-3-', 'claude-3-'),
                messages: messages.map(m => ({
                    role: m.role === 'assistant' ? 'assistant' : m.role,
                    content: m.content
                })),
                max_tokens: maxTokens,
                temperature
            };
        } else if (model.startsWith('llama')) {
            provider = 'cohere';
            endpoint = '/generate';
            body = {
                model,
                prompt: messages.map(m => `${m.role}: ${m.content}`).join('\n'),
                max_tokens: maxTokens,
                temperature
            };
        }

        if (stream) {
            return this._streamChat(provider, endpoint, body);
        }

        const result = await this.request(provider, endpoint, { body });
        
        if (provider === 'anthropic') {
            return result.content[0].text;
        }
        
        return result.choices[0].message.content;
    }

    /**
     * Stream chat completion
     */
    async *_streamChat(provider, endpoint, body) {
        const { method = 'POST', headers = {} } = {};
        const baseUrl = API_CONFIG.providers[provider];
        
        const config = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        if (provider === 'openai' && this.apiKeys.openai) {
            config.headers['Authorization'] = `Bearer ${this.apiKeys.openai}`;
        }

        body.stream = true;
        config.body = JSON.stringify(body);

        const response = await fetch(`${baseUrl}${endpoint}`, config);
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
                    const content = parsed.choices?.[0]?.delta?.content || parsed.content || '';
                    if (content) yield content;
                } catch (e) {
                    // Skip invalid JSON
                }
            }
        }
    }

    /**
     * Image generation (DALL-E)
     */
    async generateImage(prompt, options = {}) {
        const { size = '1024x1024', quality = 'standard', n = 1 } = options;

        const body = {
            prompt,
            n,
            size,
            quality
        };

        const result = await this.request('openai', '/images/generations', { body });
        
        return result.data.map(item => ({
            url: item.url,
            revisedPrompt: item.revised_prompt
        }));
    }

    /**
     * Audio transcription
     */
    async transcribeAudio(audioFile, options = {}) {
        const { language = 'my', prompt = '' } = options;

        const formData = new FormData();
        formData.append('file', audioFile);
        formData.append('model', 'whisper-1');
        formData.append('language', language);
        if (prompt) formData.append('prompt', prompt);

        const response = await fetch(`${API_CONFIG.providers.openai}/audio/transcriptions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKeys.openai}`
            },
            body: formData
        });

        const result = await response.json();
        return result.text;
    }

    /**
     * Text to speech
     */
    async textToSpeech(text, options = {}) {
        const { voice = 'alloy', model = 'tts-1', speed = 1.0 } = options;

        const body = {
            model,
            voice,
            input: text,
            speed
        };

        const response = await fetch(`${API_CONFIG.providers.openai}/audio/speech`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKeys.openai}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    }

    /**
     * Translation
     */
    async translate(text, targetLang, sourceLang = 'auto') {
        const messages = [
            { role: 'system', content: `You are a translator. Translate the following text to ${targetLang}.` },
            { role: 'user', content: text }
        ];

        return this.chat(messages);
    }

    /**
     * Sentiment analysis
     */
    async analyzeSentiment(text) {
        const messages = [
            { role: 'system', content: 'Analyze the sentiment of the following text. Return a JSON with "sentiment" (positive/negative/neutral), "score" (0-1), and "emotions" (array of emotions).' },
            { role: 'user', content: text }
        ];

        const result = await this.chat(messages);
        
        try {
            return JSON.parse(result);
        } catch {
            return {
                sentiment: 'neutral',
                score: 0.5,
                emotions: []
            };
        }
    }

    /**
     * Summarization
     */
    async summarize(text, options = {}) {
        const { maxLength = 200, style = 'balanced' } = options;
        
        const messages = [
            { role: 'system', content: `Summarize the following text in approximately ${maxLength} words. Style: ${style}.` },
            { role: 'user', content: text }
        ];

        return this.chat(messages);
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

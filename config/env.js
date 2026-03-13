/**
 * Environment Configuration
 * AmkyawDev AI Power Platform
 */

// Cloudflare Worker API URL
const WORKER_URL = 'https://amkyawdev.mysvm.workers.dev';

// API Configuration
const API_CONFIG = {
    // Cloudflare Worker API URL
    workerUrl: WORKER_URL,
    
    // API Keys (set these in your environment or Cloudflare Workers secrets)
    apiKeys: {
        gemini: '',    // GEMINI_API_KEY
        openai: '',    // OPENAI_API_KEY
        stability: '', // STABILITY_KEY
        zai: ''       // ZAI_API_KEY
    },
    
    // Default timeout in ms
    timeout: 30000,
    
    // Retry configuration
    retry: {
        maxAttempts: 3,
        delay: 1000,
        backoffMultiplier: 2
    }
};

// App Configuration
const APP_CONFIG = {
    name: 'AmkyawDev',
    version: '1.0.0',
    description: 'AI Power Platform',
    
    // Features
    features: {
        streaming: true,
        caching: true,
        retry: true,
        offline: false,
        voiceInput: true,
        textToSpeech: true,
        imageGeneration: true,
        transcription: true
    },
    
    // Default settings
    defaults: {
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 2048,
        topP: 1.0,
        responseStyle: 'balanced',
        language: 'my'
    },
    
    // Token limits per model
    tokenLimits: {
        'gpt-4': 8192,
        'gpt-4-32k': 32768,
        'gpt-3.5-turbo': 4096,
        'gpt-3.5-turbo-16k': 16384,
        'gemini-pro': 32768,
        'claude-3-opus': 200000,
        'claude-3-sonnet': 200000,
        'llama-3-70b': 8192,
        'llama-3-8b': 8192,
        'stable-diffusion': 1024
    },
    
    // Pricing (per 1M tokens)
    pricing: {
        input: {
            'gpt-4': 30.00,
            'gpt-3.5-turbo': 0.50,
            'gemini-pro': 0.00,
            'claude-3-opus': 15.00,
            'claude-3-sonnet': 3.00,
            'llama-3-70b': 0.80
        },
        output: {
            'gpt-4': 60.00,
            'gpt-3.5-turbo': 1.50,
            'gemini-pro': 0.00,
            'claude-3-opus': 75.00,
            'claude-3-sonnet': 15.00,
            'llama-3-70b': 0.80
        }
    }
};

// Storage Keys
const STORAGE_KEYS = {
    user: 'amkyawdev_user',
    settings: 'amkyawdev_settings',
    chatHistory: 'amkyawdev_chat_history',
    apiKeys: 'amkyawdev_api_keys',
    cache: 'amkyawdev_cache',
    language: 'amkyawdev_language'
};

// Export for use in other files
if (typeof window !== 'undefined') {
    window.API_CONFIG = API_CONFIG;
    window.APP_CONFIG = APP_CONFIG;
    window.STORAGE_KEYS = STORAGE_KEYS;
    window.WORKER_URL = WORKER_URL;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, APP_CONFIG, STORAGE_KEYS, WORKER_URL };
}

/**
 * Environment Configuration
 * AmkyawDev AI Power Platform
 */

// API Configuration
const API_CONFIG = {
    // Backend API URL
    apiUrl: 'http://localhost:3000/api',
    
    // AI Provider Endpoints
    providers: {
        openai: 'https://api.openai.com/v1',
        anthropic: 'https://api.anthropic.com/v1',
        cohere: 'https://api.cohere.ai/v1'
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
        'claude-3-opus': 200000,
        'claude-3-sonnet': 200000,
        'llama-3-70b': 8192,
        'llama-3-8b': 8192
    },
    
    // Pricing (per 1M tokens)
    pricing: {
        input: {
            'gpt-4': 30.00,
            'gpt-3.5-turbo': 0.50,
            'claude-3-opus': 15.00,
            'claude-3-sonnet': 3.00,
            'llama-3-70b': 0.80
        },
        output: {
            'gpt-4': 60.00,
            'gpt-3.5-turbo': 1.50,
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
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, APP_CONFIG, STORAGE_KEYS };
}

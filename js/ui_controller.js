/**
 * UI Controller - UI Management
 * AmkyawDev AI Power Platform
 */

class UIController {
    constructor() {
        this.currentLanguage = Storage.get(STORAGE_KEYS.language, 'my');
        this.translations = {};
    }

    /**
     * Initialize UI
     */
    init() {
        this._setupLanguageToggle();
        this._loadTranslations();
        this._applyLanguage();
    }

    /**
     * Set up language toggle
     */
    _setupLanguageToggle() {
        const langToggle = document.getElementById('language-toggle');
        if (langToggle) {
            langToggle.addEventListener('click', () => {
                this.toggleLanguage();
            });
        }
    }

    /**
     * Load translations
     */
    _loadTranslations() {
        this.translations = {
            my: {
                nav: {
                    home: 'ပင်မစာမျက်နှာ',
                    chat: 'ချက်ခ်',
                    dashboard: 'ဒက်ရှ်ဘုတ်',
                    login: 'ဝင်ရန်',
                    logout: 'ထွက်ရန်'
                },
                hero: {
                    subtitle: 'AI Power Platform',
                    description: 'မြန်မာဘာသာစကားအထူးပံ့ပိုးပါ့မယ်။ မြန်မာလို မေးလျှင် မြန်မာလိုပြန်ဖြေပါ့မယ်။',
                    startChat: 'စချက်ခ်လုပ်ရန်',
                    signUp: 'အကောင့်ဖွင့်ရန်'
                },
                features: {
                    title: 'အင်္ဂါရပ်များ',
                    chat: { title: 'စာသားထုတ်လုပ်ခြင်း', desc: 'မြန်မာလိုပါဝင်သော ဘာသာစကားများအားလုံးကို ထောက်ပံ့ပါ့မယ်။' },
                    image: { title: 'ပုံဆွဲခြင်း', desc: 'DALL-E နည်းပါးဖြင့် ပါမောက္ခချက်ပါ့မယ်။' },
                    audio: { title: 'အသံဖိုင်ပြောင်းခြင်း', desc: 'အသံဖိုင်များကို စာသားအဖြစ်ပြောင်းလဲပါ့မယ်။' },
                    tts: { title: 'စာသားပြောင်းခြင်း', desc: 'စာသားများကို အသံဖိုင်အဖြစ်ပြောင်းလဲပါ့မယ်။' },
                    translation: { title: 'ဘာသာပြန်ခြင်း', desc: 'ဘာသာစကားများအားလုံးကို အလွယ်တကူပြန်ပါ့မယ်။' },
                    summary: { title: 'အကျဉ်းချုပ်ခြင်း', desc: 'အရှည်ကြီးစာများကို အကျဉ်းချုပ်ပါ့မယ်။' }
                },
                models: {
                    title: 'မော်ဒယ်များ',
                    gpt4: 'အဆင့်မြင့်ဆုံးမော်ဒယ်',
                    gpt35: 'မြန်ဆန်ပါ့မယ်။',
                    claude: 'ပါးလွှာပါ့မယ်။',
                    llama: 'ဖွင့်ပါဝင်သော မော်ဒယ်'
                },
                chat: {
                    newChat: 'ချက်ခ်အသစ်',
                    history: 'ချက်ခ်မှတ်တမ်း',
                    welcome: 'AmkyawDev မှ မင်္ဂလာပါ',
                    welcomeDesc: 'မေးလျှင်းလိုသောအရာကို ရိုက်ပါ့မယ်။ မြန်မာလို မေးလျှင် မြန်မာလိုပြန်ဖြေပါ့မယ်။',
                    placeholder: 'မေးလျှင်းလိုသောအရာကို ရိုက်ပါ့မယ်...',
                    tokens: 'Token များ:',
                    model: 'မော်ဒယ်:',
                    loading: 'တင်နေပါ့မယ်...'
                },
                settings: {
                    title: 'ဆက်တင်များ',
                    temperature: 'Temperature:',
                    maxTokens: 'Max Tokens:',
                    responseStyle: 'ပြန်လည်ဖော်ပြပါ့မယ်:',
                    style: { concise: 'တိုတယ်', balanced: 'ပါးလွှား', detailed: 'အသေးစိတ်' },
                    features: 'အင်္ဂါရပ်များ:',
                    streaming: 'Streaming',
                    caching: 'Caching',
                    retry: 'Retry'
                },
                auth: {
                    loginTitle: 'ဝင်ရန်',
                    loginDesc: 'အကောင့်ဝင်ပါ့မယ်။',
                    email: 'အီးမေးလ်',
                    password: 'စကားဝှက်',
                    rememberMe: 'မှတ်ထားပါ့မယ်။',
                    forgotPassword: 'စကားဝှက်မေ့သလား',
                    loginBtn: 'ဝင်ရန်',
                    or: 'သို့မဟုတ်',
                    googleLogin: 'Google ဖြင့်ဝင်ရန်',
                    noAccount: 'အကောင့်မရှိပါသလား?',
                    signUp: 'အကောင့်ဖွင့်ရန်',
                    featuresTitle: 'AmkyawDev အင်္ဂါရပ်များ',
                    feature1: 'မြန်မာဘာသာစကားအထူးပံ့ပိုး',
                    feature2: 'အဆင့်မြင့် AI မော်ဒယ်များ',
                    feature3: 'ချက်ခ်၊ ပါမောက္ခချက်၊ ဘာသာပြန်',
                    feature4: 'လုံခြုံပါဝင်သော အချက်အလက်များ'
                },
                dashboard: {
                    overview: 'အနှစ်ချုပ်',
                    settings: 'ဆက်တင်များ',
                    apiKeys: 'API Key များ',
                    history: 'မှတ်တမ်း',
                    usage: 'အသုံးပါဝင်မှု',
                    overviewTitle: 'ဒက်ရှ်ဘုတ်',
                    totalChats: 'စုစုပါင်း ချက်ခ်',
                    totalTokens: 'စုစုပါင်း Token',
                    totalTime: 'စုစုပါင်း အချိန်',
                    totalImages: 'စုစုပါင်း ပါမောက္ခချက်',
                    activityChart: 'လုပ်ငန်းစာရင်း',
                    settingsTitle: 'ဆက်တင်များ',
                    apiKeysTitle: 'API Key များ',
                    historyTitle: 'မှတ်တမ်း',
                    usageTitle: 'အသုံးပါဝင်မှု',
                    search: 'ရှာဖွေရန်...',
                    allTypes: 'အားလုံး',
                    noHistory: 'မှတ်တမ်းမရှိပါ့မယ်။'
                },
                footer: {
                    rights: 'အားလုံးအခွင့်အရေးမှန်ကန်ပါ့မယ်။'
                }
            },
            en: {
                nav: {
                    home: 'Home',
                    chat: 'Chat',
                    dashboard: 'Dashboard',
                    login: 'Login',
                    logout: 'Logout'
                },
                hero: {
                    subtitle: 'AI Power Platform',
                    description: 'Special support for Myanmar language. Ask in Myanmar, get answer in Myanmar.',
                    startChat: 'Start Chatting',
                    signUp: 'Sign Up'
                },
                features: {
                    title: 'Features',
                    chat: { title: 'Text Generation', desc: 'Supports all languages including Myanmar.' },
                    image: { title: 'Image Generation', desc: 'Generate images with DALL-E.' },
                    audio: { title: 'Audio Transcription', desc: 'Convert audio files to text.' },
                    tts: { title: 'Text to Speech', desc: 'Convert text to audio files.' },
                    translation: { title: 'Translation', desc: 'Translate between all languages.' },
                    summary: { title: 'Summarization', desc: 'Summarize long texts.' }
                },
                models: {
                    title: 'Models',
                    gpt4: 'Most Advanced Model',
                    gpt35: 'Fast Response',
                    claude: 'Efficient',
                    llama: 'Open Source Model'
                },
                chat: {
                    newChat: 'New Chat',
                    history: 'Chat History',
                    welcome: 'Welcome to AmkyawDev',
                    welcomeDesc: 'Ask me anything. Ask in Myanmar, get answer in Myanmar.',
                    placeholder: 'Type your message...',
                    tokens: 'Tokens:',
                    model: 'Model:',
                    loading: 'Loading...'
                },
                settings: {
                    title: 'Settings',
                    temperature: 'Temperature:',
                    maxTokens: 'Max Tokens:',
                    responseStyle: 'Response Style:',
                    style: { concise: 'Concise', balanced: 'Balanced', detailed: 'Detailed' },
                    features: 'Features:',
                    streaming: 'Streaming',
                    caching: 'Caching',
                    retry: 'Retry'
                },
                auth: {
                    loginTitle: 'Login',
                    loginDesc: 'Sign in to your account.',
                    email: 'Email',
                    password: 'Password',
                    rememberMe: 'Remember me',
                    forgotPassword: 'Forgot password?',
                    loginBtn: 'Login',
                    or: 'OR',
                    googleLogin: 'Sign in with Google',
                    noAccount: "Don't have an account?",
                    signUp: 'Sign Up',
                    featuresTitle: 'AmkyawDev Features',
                    feature1: 'Myanmar Language Support',
                    feature2: 'Advanced AI Models',
                    feature3: 'Chat, Image, Translation',
                    feature4: 'Secure Data'
                },
                dashboard: {
                    overview: 'Overview',
                    settings: 'Settings',
                    apiKeys: 'API Keys',
                    history: 'History',
                    usage: 'Usage',
                    overviewTitle: 'Dashboard',
                    totalChats: 'Total Chats',
                    totalTokens: 'Total Tokens',
                    totalTime: 'Total Time',
                    totalImages: 'Total Images',
                    activityChart: 'Activity',
                    settingsTitle: 'Settings',
                    apiKeysTitle: 'API Keys',
                    historyTitle: 'History',
                    usageTitle: 'Usage',
                    search: 'Search...',
                    allTypes: 'All Types',
                    noHistory: 'No history yet.'
                },
                footer: {
                    rights: 'All rights reserved.'
                }
            }
        };
    }

    /**
     * Apply current language
     */
    _applyLanguage() {
        // Update language toggle button
        const langToggle = document.getElementById('language-toggle');
        if (langToggle) {
            const langCode = langToggle.querySelector('.lang-code');
            if (langCode) {
                langCode.textContent = this.currentLanguage === 'my' ? 'မြန်မာ' : 'English';
            }
        }

        // Update all translatable elements
        this._updateTranslations();
    }

    /**
     * Update all translations on page
     */
    _updateTranslations() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            if (translation) {
                el.textContent = translation;
            }
        });

        // Update placeholders
        const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
        placeholders.forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const translation = this.getTranslation(key);
            if (translation) {
                el.placeholder = translation;
            }
        });
    }

    /**
     * Get translation by key
     */
    getTranslation(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return key;
            }
        }
        
        return value;
    }

    /**
     * Toggle language
     */
    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'my' ? 'en' : 'my';
        Storage.set(STORAGE_KEYS.language, this.currentLanguage);
        this._applyLanguage();
        
        // Emit language change event
        document.dispatchEvent(new CustomEvent('language:change', {
            detail: { language: this.currentLanguage }
        }));
    }

    /**
     * Set language
     */
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            Storage.set(STORAGE_KEYS.language, lang);
            this._applyLanguage();
        }
    }

    /**
     * Show toast message
     */
    showToast(message, type = 'info', duration = 3000) {
        // Remove existing toast
        const existing = document.querySelector('.toast-message');
        if (existing) existing.remove();

        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast-message toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${this._getToastIcon(type)}</span>
            <span class="toast-text">${message}</span>
        `;

        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => toast.classList.add('show'), 10);

        // Hide toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    /**
     * Get toast icon
     */
    _getToastIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    /**
     * Show loading overlay
     */
    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loading-indicator');
        if (overlay) {
            overlay.classList.remove('hidden');
            const text = overlay.querySelector('p');
            if (text) text.textContent = message;
        }
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        const overlay = document.getElementById('loading-indicator');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    /**
     * Update user menu
     */
    updateUserMenu(user) {
        const loginBtn = document.getElementById('login-btn');
        const userMenu = document.getElementById('user-menu');

        if (user) {
            if (loginBtn) loginBtn.classList.add('hidden');
            if (userMenu) {
                userMenu.classList.remove('hidden');
                const avatar = userMenu.querySelector('.avatar-letter');
                if (avatar) {
                    avatar.textContent = user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U';
                }
            }
        } else {
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (userMenu) userMenu.classList.add('hidden');
        }
    }
}

// Create global instance
const uiController = new UIController();

// Export
if (typeof window !== 'undefined') {
    window.UIController = UIController;
    window.uiController = uiController;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UIController, uiController };
}

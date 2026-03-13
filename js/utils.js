/**
 * Utils - Utility Functions
 * AmkyawDev AI Power Platform
 */

/**
 * Utility Functions
 */
const Utils = {
    /**
     * Generate unique ID
     */
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Format date
     */
    formatDate: (date, locale = 'my-MM') => {
        const d = new Date(date);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return d.toLocaleDateString(locale, options);
    },

    /**
     * Format time
     */
    formatTime: (date) => {
        const d = new Date(date);
        return d.toLocaleTimeString('my-MM', { hour: '2-digit', minute: '2-digit' });
    },

    /**
     * Format datetime
     */
    formatDateTime: (date) => {
        return `${Utils.formatDate(date)} ${Utils.formatTime(date)}`;
    },

    /**
     * Debounce function
     */
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function
     */
    throttle: (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Deep clone object
     */
    deepClone: (obj) => {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Get nested property
     */
    getNestedValue: (obj, path, defaultValue = undefined) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
    },

    /**
     * Set nested property
     */
    setNestedValue: (obj, path, value) => {
        const parts = path.split('.');
        const last = parts.pop();
        const target = parts.reduce((acc, part) => acc[part] = acc[part] || {}, obj);
        target[last] = value;
    },

    /**
     * Capitalize first letter
     */
    capitalize: (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * Truncate string
     */
    truncate: (str, length = 50, suffix = '...') => {
        if (str.length <= length) return str;
        return str.substring(0, length - suffix.length) + suffix;
    },

    /**
     * Escape HTML
     */
    escapeHtml: (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Unescape HTML
     */
    unescapeHtml: (str) => {
        const div = document.createElement('div');
        div.innerHTML = str;
        return div.textContent;
    },

    /**
     * Copy to clipboard
     */
    copyToClipboard: async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Failed to copy:', err);
            return false;
        }
    },

    /**
     * Download file
     */
    downloadFile: (content, filename, type = 'text/plain') => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },

    /**
     * Read file as text
     */
    readFileAsText: (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    },

    /**
     * Get random item from array
     */
    randomItem: (arr) => {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    /**
     * Shuffle array
     */
    shuffle: (arr) => {
        const result = [...arr];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    },

    /**
     * Remove duplicates from array
     */
    unique: (arr) => {
        return [...new Set(arr)];
    },

    /**
     * Group array by key
     */
    groupBy: (arr, key) => {
        return arr.reduce((acc, item) => {
            const group = typeof key === 'function' ? key(item) : item[key];
            acc[group] = acc[group] || [];
            acc[group].push(item);
            return acc;
        }, {});
    },

    /**
     * Sleep/delay
     */
    sleep: (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Check if online
     */
    isOnline: () => {
        return navigator.onLine;
    },

    /**
     * Get browser info
     */
    getBrowser: () => {
        const ua = navigator.userAgent;
        if (ua.indexOf('Firefox') > -1) return 'Firefox';
        if (ua.indexOf('Chrome') > -1) return 'Chrome';
        if (ua.indexOf('Safari') > -1) return 'Safari';
        if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) return 'IE';
        return 'Unknown';
    },

    /**
     * Get OS info
     */
    getOS: () => {
        const ua = navigator.userAgent;
        if (ua.indexOf('Win') > -1) return 'Windows';
        if (ua.indexOf('Mac') > -1) return 'MacOS';
        if (ua.indexOf('Linux') > -1) return 'Linux';
        if (ua.indexOf('Android') > -1) return 'Android';
        if (ua.indexOf('iOS') > -1) return 'iOS';
        return 'Unknown';
    }
};

/**
 * Storage Helper
 */
const Storage = {
    /**
     * Get item from localStorage
     */
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    },

    /**
     * Set item in localStorage
     */
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    },

    /**
     * Remove item from localStorage
     */
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    },

    /**
     * Clear all localStorage
     */
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    },

    /**
     * Get item from sessionStorage
     */
    sessionGet: (key, defaultValue = null) => {
        try {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Session storage get error:', error);
            return defaultValue;
        }
    },

    /**
     * Set item in sessionStorage
     */
    sessionSet: (key, value) => {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Session storage set error:', error);
            return false;
        }
    }
};

/**
 * Event Emitter
 */
class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    off(event, listener) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(l => l !== listener);
    }

    emit(event, ...args) {
        if (!this.events[event]) return;
        this.events[event].forEach(listener => listener(...args));
    }

    once(event, listener) {
        const wrapper = (...args) => {
            listener(...args);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }
}

// Export
if (typeof window !== 'undefined') {
    window.Utils = Utils;
    window.Storage = Storage;
    window.EventEmitter = EventEmitter;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Utils, Storage, EventEmitter };
}

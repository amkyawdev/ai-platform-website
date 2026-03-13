/**
 * Memory System - Chat History & Context Management
 * AmkyawDev AI Power Platform
 */

class MemorySystem {
    constructor() {
        this.shortTermMemory = [];
        this.longTermMemory = Storage.get('amkyawdev_long_term_memory', {});
        this.maxShortTermSize = 10;
    }

    /**
     * Add to short-term memory
     */
    addToShortTerm(message) {
        this.shortTermMemory.push(message);
        
        // Trim if exceeds max size
        if (this.shortTermMemory.length > this.maxShortTermSize) {
            this.shortTermMemory.shift();
        }
    }

    /**
     * Get short-term memory
     */
    getShortTermMemory() {
        return [...this.shortTermMemory];
    }

    /**
     * Clear short-term memory
     */
    clearShortTermMemory() {
        this.shortTermMemory = [];
    }

    /**
     * Save important info to long-term memory
     */
    saveToLongTerm(key, value) {
        this.longTermMemory[key] = {
            value,
            timestamp: new Date().toISOString()
        };
        Storage.set('amkyawdev_long_term_memory', this.longTermMemory);
    }

    /**
     * Get from long-term memory
     */
    getFromLongTerm(key) {
        return this.longTermMemory[key]?.value;
    }

    /**
     * Get all long-term memory keys
     */
    getLongTermKeys() {
        return Object.keys(this.longTermMemory);
    }

    /**
     * Clear long-term memory
     */
    clearLongTermMemory(key = null) {
        if (key) {
            delete this.longTermMemory[key];
        } else {
            this.longTermMemory = {};
        }
        Storage.set('amkyawdev_long_term_memory', this.longTermMemory);
    }

    /**
     * Build context for AI
     */
    buildContext() {
        const context = [];
        
        // Add long-term memory as context
        const importantKeys = ['user_name', 'user_preferences', 'last_conversation'];
        importantKeys.forEach(key => {
            const value = this.getFromLongTerm(key);
            if (value) {
                context.push({
                    role: 'system',
                    content: `User info: ${key} = ${value}`
                });
            }
        });
        
        // Add recent short-term memory
        context.push(...this.getShortTermMemory());
        
        return context;
    }

    /**
     * Extract and save important info from conversation
     */
    extractImportantInfo(messages) {
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage || lastMessage.role !== 'user') return;

        // Check for name
        const nameMatch = lastMessage.content.match(/ငါ့နာမည်.*?(?:ဟုတ်ပါ့မယ်|ပါ့မယ်)[\s:]*([၀-၉a-zA-Z]+)/i);
        if (nameMatch) {
            this.saveToLongTerm('user_name', nameMatch[1]);
        }

        // Check for preferences
        const prefMatch = lastMessage.content.match(/(?:နှစ်သက်|သဘောကျ)[\s:]*([၀-၉a-zA-Z]+)/i);
        if (prefMatch) {
            this.saveToLongTerm('user_preferences', prefMatch[1]);
        }
    }

    /**
     * Get memory statistics
     */
    getStats() {
        return {
            shortTermCount: this.shortTermMemory.length,
            longTermCount: Object.keys(this.longTermMemory).length,
            maxShortTermSize: this.maxShortTermSize
        };
    }
}

// Export
const memorySystem = new MemorySystem();
if (typeof window !== 'undefined') {
    window.MemorySystem = MemorySystem;
    window.memorySystem = memorySystem;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MemorySystem, memorySystem };
}

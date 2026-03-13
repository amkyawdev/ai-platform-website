/**
 * Prompt Engine - AI Prompt Management
 * AmkyawDev AI Power Platform
 */

class PromptEngine {
    constructor() {
        this.templates = this._loadTemplates();
        this.customPrompts = Storage.get('amkyawdev_custom_prompts', {});
    }

    /**
     * Load default prompt templates
     */
    _loadTemplates() {
        return {
            default: `သင့်အား မြန်မာဘာသာစကားဖြင့် ပြန်လည်ဖော်ပြပါ့မယ်။
- သင့်အား အင်္ဂလိပ်လိုမေးလျှင် အင်္ဂလိပ်လိုပြန်ဖြေပါ့မယ်။
- မြန်မာလိုမေးလျှင် မြန်မာလိုပြန်ဖြေပါ့မယ်။
- ပါးလွှားတဲ့ အဖြေများပါဝင်ပါ့မယ်။`,

            creative: `သင့်အား မြန်မာဘာသာစကားဖြင့် ပြန်လည်ဖော်ပြပါ့မယ်။
သင့်အဖြေများသည် စိတ်ကူးပါဝင်ပပါ့မယ်။
စာသားများသည် စိတ်လှုပ်ရှားဖွယ်ရာများပါဝင်ပါ့မယ်။`,

            technical: `သင့်အား မြန်မာဘာသာစကားဖြင့် ပြန်လည်ဖော်ပြပါ့မယ်။
သင့်အဖြေများသည် နည်းပါးပါဝင်ပါ့မယ်။
သတင်းအရာများသည် မှန်ကန်ပါဝင်ပါ့မယ်။`,

            code: `သင့်အား မြန်မာဘာသာစကားဖြင့် ပြန်လည်ဖော်ပြပါ့မယ်။
ကုဒ်များသည် ရှင်းလင်းပပါဝင်ပါ့မယ်။
ရှင်းလင်းတဲ့ ရှပ်ရှင်းများပါဝင်ပါ့မယ်။`,

            translate: `သင့်အား ဘာသာပြန်လုပ်ပါ့မယ်။
မူရင်းစာသားသည် သင့်အဖြေများထဲမှာ ပါဝင်ပါ့မယ်။
ဘာသာပြန်ပါဝင်သော အဖြေများပါဝင်ပါ့မယ်။`,

            summarize: `သင့်အား အကျဉ်းချုပ်လုပ်ပါ့မယ်။
အဓိကအချက်များသည် ပါဝင်ပါ့မယ်။
အနှစ်ချုပ်သည် တိုတယ်ပါဝင်ပါ့မယ်။`,

            sentiment: `သင့်အား စိတ်ခံစားချက်ခွဲခြမ်းစိတ်ဖြာလုပ်ပါ့မယ်။
ပါဝင်သော စိတ်ခံစားချက်များသည် ဖော်ပြပါ့မယ်။`,

            qa: `သင့်အား မေးခွန်းအဖြေလုပ်ပါ့မယ်။
ပါဝင်သော အဖြေများသည် ရှင်းလင်းပါဝင်ပါ့မယ်။
သတင်းအရာများသည် မှန်ကန်ပါဝင်ပါ့မယ်။`
        };
    }

    /**
     * Get prompt by type
     */
    getPrompt(type = 'default', customData = {}) {
        let prompt = this.customPrompts[type] || this.templates[type] || this.templates.default;
        
        // Replace placeholders
        Object.keys(customData).forEach(key => {
            prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), customData[key]);
        });
        
        return prompt;
    }

    /**
     * Set custom prompt
     */
    setCustomPrompt(type, prompt) {
        this.customPrompts[type] = prompt;
        Storage.set('amkyawdev_custom_prompts', this.customPrompts);
    }

    /**
     * Reset prompt to default
     */
    resetPrompt(type) {
        delete this.customPrompts[type];
        Storage.set('amkyawdev_custom_prompts', this.customPrompts);
    }

    /**
     * Build messages for chat
     */
    buildMessages(userMessage, options = {}) {
        const { type = 'default', context = [], customData = {} } = options;
        
        const messages = [
            { role: 'system', content: this.getPrompt(type, customData) }
        ];
        
        // Add context
        messages.push(...context);
        
        // Add user message
        messages.push({ role: 'user', content: userMessage });
        
        return messages;
    }

    /**
     * Detect prompt type from message
     */
    detectType(message) {
        const lowerMessage = message.toLowerCase();
        
        // Translation patterns
        if (lowerMessage.includes('ပြန်လိုက်ပါ့မယ်') || 
            lowerMessage.includes('translate') ||
            lowerMessage.includes('ဘာသာပြန်')) {
            return 'translate';
        }
        
        // Summarization patterns
        if (lowerMessage.includes('အကျဉ်းချုပ်') || 
            lowerMessage.includes('summarize') ||
            lowerMessage.includes('အနှစ်ချုပ်')) {
            return 'summarize';
        }
        
        // Sentiment patterns
        if (lowerMessage.includes်('စိတ်ခံစားချက်') || 
            lowerMessage.includes('sentiment') ||
            lowerMessage.includes('ခွဲခြမ်းစိတ်ဖြာ')) {
            return 'sentiment';
        }
        
        // Code patterns
        if (lowerMessage.includes('code') || 
            lowerMessage.includes('ကုဒ်') ||
            lowerMessage.includes('function') ||
            lowerMessage.includes('def ')) {
            return 'code';
        }
        
        // QA patterns
        if (lowerMessage.includes('?') || 
            lowerMessage.includes('မေးခွန်း') ||
            lowerMessage.includes('what') ||
            lowerMessage.includes('why') ||
            lowerMessage.includes('how')) {
            return 'qa';
        }
        
        return 'default';
    }

    /**
     * Get all template types
     */
    getTypes() {
        return Object.keys(this.templates);
    }
}

// Export
const promptEngine = new PromptEngine();
if (typeof window !== 'undefined') {
    window.PromptEngine = PromptEngine;
    window.promptEngine = promptEngine;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PromptEngine, promptEngine };
}

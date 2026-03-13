/**
 * Chat Engine - Chat Management
 * AmkyawDev AI Power Platform
 */

class ChatEngine {
    constructor() {
        this.currentChat = null;
        this.chats = Storage.get(STORAGE_KEYS.chatHistory, []);
        this.settings = this._loadSettings();
        this.eventEmitter = new EventEmitter();
        this.isGenerating = false;
    }

    /**
     * Load chat settings
     */
    _loadSettings() {
        const defaultSettings = {
            model: APP_CONFIG.defaults.model,
            temperature: APP_CONFIG.defaults.temperature,
            maxTokens: APP_CONFIG.defaults.maxTokens,
            responseStyle: APP_CONFIG.defaults.responseStyle,
            streaming: APP_CONFIG.features.streaming,
            caching: APP_CONFIG.features.caching,
            retry: APP_CONFIG.features.retry
        };

        return Storage.get(STORAGE_KEYS.settings, defaultSettings);
    }

    /**
     * Create new chat
     */
    createChat(title = 'New Chat') {
        const chat = {
            id: Utils.generateId(),
            title,
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            model: this.settings.model,
            settings: { ...this.settings }
        };

        this.chats.unshift(chat);
        this._saveChats();
        this.currentChat = chat;
        this.eventEmitter.emit('chat:created', chat);
        
        return chat;
    }

    /**
     * Load existing chat
     */
    loadChat(chatId) {
        const chat = this.chats.find(c => c.id === chatId);
        if (chat) {
            this.currentChat = chat;
            this.eventEmitter.emit('chat:loaded', chat);
            return chat;
        }
        return null;
    }

    /**
     * Delete chat
     */
    deleteChat(chatId) {
        const index = this.chats.findIndex(c => c.id === chatId);
        if (index !== -1) {
            this.chats.splice(index, 1);
            this._saveChats();
            
            if (this.currentChat?.id === chatId) {
                this.currentChat = null;
            }
            
            this.eventEmitter.emit('chat:deleted', chatId);
            return true;
        }
        return false;
    }

    /**
     * Update chat title
     */
    updateChatTitle(chatId, title) {
        const chat = this.chats.find(c => c.id === chatId);
        if (chat) {
            chat.title = title;
            chat.updatedAt = new Date().toISOString();
            this._saveChats();
            this.eventEmitter.emit('chat:updated', chat);
            return chat;
        }
        return null;
    }

    /**
     * Add message to current chat
     */
    addMessage(role, content, metadata = {}) {
        if (!this.currentChat) {
            this.createChat();
        }

        const message = {
            id: Utils.generateId(),
            role,
            content,
            timestamp: new Date().toISOString(),
            ...metadata
        };

        this.currentChat.messages.push(message);
        this.currentChat.updatedAt = new Date().toISOString();
        
        // Update chat title if it's the first message
        if (this.currentChat.messages.length === 2 && role === 'user') {
            this.currentChat.title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
        }
        
        this._saveChats();
        this.eventEmitter.emit('message:add', message);
        
        return message;
    }

    /**
     * Send message and get AI response
     */
    async sendMessage(content, options = {}) {
        if (this.isGenerating) {
            throw new Error('Already generating response');
        }

        // Add user message
        this.addMessage('user', content);

        // Show typing indicator
        this.eventEmitter.emit('typing:start');

        this.isGenerating = true;

        try {
            // Prepare messages for API
            const messages = this._prepareMessages();
            
            // Get response from AI
            let response;
            const chatOptions = {
                model: options.model || this.settings.model,
                temperature: options.temperature || this.settings.temperature,
                maxTokens: options.maxTokens || this.settings.maxTokens,
                stream: this.settings.streaming
            };

            if (this.settings.streaming) {
                response = await this._streamResponse(messages, chatOptions);
            } else {
                response = await aiAPI.chat(messages, chatOptions);
            }

            // Add AI response
            this.addMessage('assistant', response, {
                model: chatOptions.model,
                tokens: this._estimateTokens(response)
            });

            return response;
        } catch (error) {
            console.error('Chat error:', error);
            this.eventEmitter.emit('error', error);
            
            // Add error message
            this.addMessage('assistant', `အမှားတစ်ခုခုဖြစ်ပါ့မယ်။: ${error.message}`, {
                isError: true
            });
            
            throw error;
        } finally {
            this.isGenerating = false;
            this.eventEmitter.emit('typing:stop');
        }
    }

    /**
     * Stream response from AI
     */
    async _streamResponse(messages, options) {
        let fullResponse = '';
        
        const stream = await aiAPI.chat(messages, {
            ...options,
            stream: true
        });

        // Create placeholder message
        const placeholderMessage = this.addMessage('assistant', '', {
            model: options.model,
            isStreaming: true
        });

        for await (const chunk of stream) {
            fullResponse += chunk;
            
            // Update message content
            const messageIndex = this.currentChat.messages.findIndex(m => m.id === placeholderMessage.id);
            if (messageIndex !== -1) {
                this.currentChat.messages[messageIndex].content = fullResponse;
                this.eventEmitter.emit('message:stream', {
                    message: this.currentChat.messages[messageIndex],
                    fullResponse
                });
            }
        }

        // Final update
        const finalIndex = this.currentChat.messages.findIndex(m => m.id === placeholderMessage.id);
        if (finalIndex !== -1) {
            this.currentChat.messages[finalIndex].isStreaming = false;
            this.currentChat.messages[finalIndex].tokens = this._estimateTokens(fullResponse);
            this._saveChats();
        }

        return fullResponse;
    }

    /**
     * Prepare messages for API
     */
    _prepareMessages() {
        if (!this.currentChat) return [];

        // Add system prompt based on settings
        const systemPrompt = this._buildSystemPrompt();
        
        return [
            { role: 'system', content: systemPrompt },
            ...this.currentChat.messages.map(m => ({
                role: m.role,
                content: m.content
            }))
        ];
    }

    /**
     * Build system prompt
     */
    _buildSystemPrompt() {
        const style = this.settings.responseStyle;
        let stylePrompt = '';

        switch (style) {
            case 'concise':
                stylePrompt = 'ပါးလွှားတဲ့ အဖြေများပါဝင်ပါ့မယ်။';
                break;
            case 'detailed':
                stylePrompt = 'အသေးစိတ်ပါဝင်သော အဖြေများပါဝင်ပါ့မယ်။';
                break;
            default:
                stylePrompt = 'ပါးလွှားပါဝင်သော အဖြေများပါဝင်ပါ့မယ်။';
        }

        return `သင့်အား မြန်မာဘာသာစကားဖြင့် ပြန်လည်ဖော်ပြပါ့မယ်။ ${stylePrompt} သင့်အား အင်္ဂလိပ်လိုမေးလျှင် အင်္ဂလိပ်လိုပြန်ဖြေပါ့မယ်။ မြန်မာလိုမေးလျှင် မြန်မာလိုပြန်ဖြေပါ့မယ်။`;
    }

    /**
     * Estimate token count (rough estimate)
     */
    _estimateTokens(text) {
        // Rough estimate: 1 token ≈ 4 characters for Myanmar text
        return Math.ceil(text.length / 4);
    }

    /**
     * Get all chats
     */
    getChats() {
        return this.chats;
    }

    /**
     * Get current chat
     */
    getCurrentChat() {
        return this.currentChat;
    }

    /**
     * Get chat list (for sidebar)
     */
    getChatList() {
        return this.chats.map(chat => ({
            id: chat.id,
            title: chat.title,
            updatedAt: chat.updatedAt,
            messageCount: chat.messages.length
        }));
    }

    /**
     * Clear current chat
     */
    clearCurrentChat() {
        if (this.currentChat) {
            this.currentChat.messages = [];
            this.currentChat.updatedAt = new Date().toISOString();
            this._saveChats();
            this.eventEmitter.emit('chat:cleared');
        }
    }

    /**
     * Update settings
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        Storage.set(STORAGE_KEYS.settings, this.settings);
        this.eventEmitter.emit('settings:updated', this.settings);
    }

    /**
     * Get settings
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * Save chats to storage
     */
    _saveChats() {
        Storage.set(STORAGE_KEYS.chatHistory, this.chats);
    }

    /**
     * Export chat history
     */
    exportChat(chatId) {
        const chat = this.chats.find(c => c.id === chatId);
        if (chat) {
            const data = JSON.stringify(chat, null, 2);
            Utils.downloadFile(data, `chat-${chatId}.json`, 'application/json');
        }
    }

    /**
     * Import chat
     */
    async importChat(file) {
        try {
            const text = await Utils.readFileAsText(file);
            const chat = JSON.parse(text);
            
            chat.id = Utils.generateId();
            chat.importedAt = new Date().toISOString();
            
            this.chats.unshift(chat);
            this._saveChats();
            
            return chat;
        } catch (error) {
            throw new Error('Invalid chat file');
        }
    }

    /**
     * On event
     */
    on(event, callback) {
        this.eventEmitter.on(event, callback);
    }

    /**
     * Off event
     */
    off(event, callback) {
        this.eventEmitter.off(event, callback);
    }
}

// Export
const chatEngine = new ChatEngine();
if (typeof window !== 'undefined') {
    window.ChatEngine = ChatEngine;
    window.chatEngine = chatEngine;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChatEngine, chatEngine };
}

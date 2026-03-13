/**
 * App - Main Application
 * AmkyawDev AI Power Platform
 */

class App {
    constructor() {
        this.initialized = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.initialized) return;

        try {
            // Initialize UI
            uiController.init();

            // Initialize Router
            this._setupRoutes();

            // Set up event listeners
            this._setupEventListeners();

            // Check authentication
            await this._checkAuth();

            this.initialized = true;
            console.log('AmkyawDev App initialized');
        } catch (error) {
            console.error('App initialization error:', error);
        }
    }

    /**
     * Set up routes
     */
    _setupRoutes() {
        router
            .add('/', () => this._renderHome())
            .add('/chat', () => this._renderChat())
            .add('/chat.html', () => this._renderChat())
            .add('/login', () => this._renderLogin())
            .add('/login.html', () => this._renderLogin())
            .add('/dashboard', () => this._renderDashboard())
            .add('/dashboard.html', () => this._renderDashboard())
            .start();
    }

    /**
     * Set up event listeners
     */
    _setupEventListeners() {
        // Handle logout
        document.addEventListener('click', (e) => {
            if (e.target.closest('#logout-btn')) {
                this._handleLogout();
            }
        });

        // Handle language change
        document.addEventListener('language:change', (e) => {
            this._onLanguageChange(e.detail.language);
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            uiController.showToast('အင်တာနက်ပါပါ့မယ်။', 'success');
        });

        window.addEventListener('offline', () => {
            uiController.showToast('အင်တာနက်မရှိပါ့မယ်။', 'warning');
        });

        // Chat input handling
        this._setupChatInput();
    }

    /**
     * Set up chat input
     */
    _setupChatInput() {
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');

        if (chatInput && sendBtn) {
            // Handle send
            const sendMessage = async () => {
                const content = chatInput.value.trim();
                if (!content || chatEngine.isGenerating) return;

                chatInput.value = '';
                await this._handleSendMessage(content);
            };

            // Send button click
            sendBtn.addEventListener('click', sendMessage);

            // Enter to send
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });

            // Auto-resize textarea
            chatInput.addEventListener('input', () => {
                chatInput.style.height = 'auto';
                chatInput.style.height = Math.min(chatInput.scrollHeight, 200) + 'px';
            });
        }
    }

    /**
     * Handle send message
     */
    async _handleSendMessage(content) {
        try {
            const response = await chatEngine.sendMessage(content);
            this._renderMessages();
            this._updateTokenCount();
        } catch (error) {
            console.error('Send message error:', error);
            uiController.showToast('မေးလျှင်းလိုက်ခြင်းမှားယွင်းပါ့မယ်။', 'error');
        }
    }

    /**
     * Render home page
     */
    _renderHome() {
        console.log('Rendering home page');
    }

    /**
     * Render chat page
     */
    _renderChat() {
        console.log('Rendering chat page');
        
        // Load chat history
        this._loadChatHistory();
        
        // Set up chat events
        this._setupChatEvents();
    }

    /**
     * Set up chat events
     */
    _setupChatEvents() {
        // New chat button
        const newChatBtn = document.getElementById('new-chat-btn');
        if (newChatBtn) {
            newChatBtn.addEventListener('click', () => {
                chatEngine.createChat();
                this._renderMessages();
                this._updateChatList();
            });
        }

        // Clear chat button
        const clearBtn = document.getElementById('clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                chatEngine.clearCurrentChat();
                this._renderMessages();
            });
        }

        // Model select
        const modelSelect = document.getElementById('model-select');
        if (modelSelect) {
            modelSelect.addEventListener('change', (e) => {
                chatEngine.updateSettings({ model: e.target.value });
            });
        }

        // Settings inputs
        const temperatureInput = document.getElementById('temperature');
        if (temperatureInput) {
            temperatureInput.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                document.getElementById('temperature-value').textContent = value;
                chatEngine.updateSettings({ temperature: value });
            });
        }

        // Listen for chat events
        chatEngine.on('message:add', () => {
            this._renderMessages();
        });

        chatEngine.on('message:stream', (data) => {
            this._renderStreamingMessage(data.fullResponse);
        });

        chatEngine.on('typing:start', () => {
            this._showTypingIndicator();
        });

        chatEngine.on('typing:stop', () => {
            this._hideTypingIndicator();
        });

        chatEngine.on('chat:created', () => {
            this._updateChatList();
        });

        chatEngine.on('chat:deleted', () => {
            this._updateChatList();
        });
    }

    /**
     * Load chat history
     */
    _loadChatHistory() {
        const chatList = document.getElementById('chat-list');
        if (!chatList) return;

        const chats = chatEngine.getChatList();
        
        if (chats.length === 0) {
            chatList.innerHTML = '<li class="chat-list-item">ချက်ခ်မရှိပါ့မယ်။</li>';
            return;
        }

        chatList.innerHTML = chats.map(chat => `
            <li class="chat-list-item ${chatEngine.getCurrentChat()?.id === chat.id ? 'active' : ''}" 
                data-chat-id="${chat.id}">
                <span class="icon">💬</span>
                <span class="title">${Utils.escapeHtml(chat.title)}</span>
            </li>
        `).join('');

        // Add click handlers
        chatList.querySelectorAll('.chat-list-item').forEach(item => {
            item.addEventListener('click', () => {
                const chatId = item.dataset.chatId;
                chatEngine.loadChat(chatId);
                this._renderMessages();
                this._updateChatList();
            });

            // Right-click to delete
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const chatId = item.dataset.chatId;
                if (confirm('ဤချက်ခ်ကို ဖျက်လိုပါသလား?')) {
                    chatEngine.deleteChat(chatId);
                }
            });
        });
    }

    /**
     * Update chat list
     */
    _updateChatList() {
        this._loadChatHistory();
    }

    /**
     * Render messages
     */
    _renderMessages() {
        const container = document.getElementById('chat-messages');
        if (!container) return;

        const chat = chatEngine.getCurrentChat();
        
        if (!chat || chat.messages.length === 0) {
            container.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-icon">🤖</div>
                    <h2 data-i18n="chat.welcome">AmkyawDev မှ မင်္ဂလာပါ</h2>
                    <p data-i18n="chat.welcomeDesc">မေးလျှင်းလိုသောအရာကို ရိုက်ပါ့မယ်။ မြန်မာလို မေးလျှင် မြန်မာလိုပြန်ဖြေပါ့မယ်။</p>
                </div>
            `;
            return;
        }

        const messagesHtml = chat.messages.map(msg => this._renderMessage(msg)).join('');
        container.innerHTML = messagesHtml;
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    /**
     * Render single message
     */
    _renderMessage(message) {
        const avatar = message.role === 'user' ? '👤' : '🤖';
        
        return `
            <div class="message ${message.role}">
                <div class="message-avatar">${avatar}</div>
                <div class="message-content ${message.isError ? 'error' : ''}">
                    ${message.content}
                </div>
            </div>
        `;
    }

    /**
     * Render streaming message
     */
    _renderStreamingMessage(content) {
        const messages = document.getElementById('chat-messages');
        if (!messages) return;

        const lastMessage = messages.querySelector('.message:last-child .message-content');
        if (lastMessage) {
            lastMessage.innerHTML = content + '<span class="cursor"></span>';
            messages.scrollTop = messages.scrollHeight;
        }
    }

    /**
     * Show typing indicator
     */
    _showTypingIndicator() {
        const messages = document.getElementById('chat-messages');
        if (!messages) return;

        const existing = messages.querySelector('.typing-indicator');
        if (existing) return;

        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = '<span></span><span></span><span></span>';
        messages.appendChild(indicator);
        messages.scrollTop = messages.scrollHeight;
    }

    /**
     * Hide typing indicator
     */
    _hideTypingIndicator() {
        const indicator = document.querySelector('.typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    /**
     * Update token count
     */
    _updateTokenCount() {
        const chat = chatEngine.getCurrentChat();
        if (!chat) return;

        const totalTokens = chat.messages.reduce((sum, msg) => {
            return sum + (msg.tokens || 0);
        }, 0);

        const tokenEl = document.getElementById('token-count');
        if (tokenEl) {
            tokenEl.textContent = totalTokens;
        }
    }

    /**
     * Render login page
     */
    _renderLogin() {
        console.log('Rendering login page');
    }

    /**
     * Render dashboard page
     */
    _renderDashboard() {
        console.log('Rendering dashboard page');
        
        // Check if user is logged in
        if (!firebaseAuth.isAuthenticated()) {
            router.redirect('/login.html');
            return;
        }

        // Load dashboard data
        this._loadDashboardData();
    }

    /**
     * Load dashboard data
     */
    _loadDashboardData() {
        const chats = chatEngine.getChats();
        
        // Update stats
        const totalChats = document.getElementById('total-chats');
        if (totalChats) totalChats.textContent = chats.length;

        const totalTokens = document.getElementById('total-tokens');
        if (totalTokens) {
            const tokens = chats.reduce((sum, chat) => {
                return sum + chat.messages.reduce((s, m) => s + (m.tokens || 0), 0);
            }, 0);
            totalTokens.textContent = tokens.toLocaleString();
        }
    }

    /**
     * Check authentication
     */
    async _checkAuth() {
        try {
            await firebaseAuth.init();
            
            firebaseAuth.addAuthListener((user) => {
                uiController.updateUserMenu(user);
                
                if (user) {
                    console.log('User logged in:', user.email);
                } else {
                    console.log('User logged out');
                }
            });
        } catch (error) {
            console.error('Auth check error:', error);
        }
    }

    /**
     * Handle logout
     */
    async _handleLogout() {
        try {
            await firebaseAuth.signOut();
            uiController.showToast('ထွက်ပါ့မယ်။', 'success');
            router.redirect('/');
        } catch (error) {
            console.error('Logout error:', error);
            uiController.showToast('ထွက်တာမှားယွင်းပါ့မယ်။', 'error');
        }
    }

    /**
     * Handle language change
     */
    _onLanguageChange(language) {
        console.log('Language changed to:', language);
        // Re-render current page
        const path = router.getCurrentPath();
        router.navigate(path, { replace: true });
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
    
    // Make app globally accessible
    window.app = app;
});

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { App };
}

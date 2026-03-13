/**
 * Firebase Auth - Authentication Module
 * AmkyawDev AI Power Platform
 */

class FirebaseAuth {
    constructor() {
        this.currentUser = null;
        this.listeners = [];
        this.initialized = false;
    }

    /**
     * Initialize Firebase Auth
     */
    async init() {
        if (this.initialized) return;

        try {
            await initFirebase();
            
            // Set up auth state listener
            firebaseAuth.onAuthStateChanged((user) => {
                this.currentUser = user;
                this._notifyListeners(user);
            });

            this.initialized = true;
        } catch (error) {
            console.error('Firebase initialization error:', error);
            throw error;
        }
    }

    /**
     * Sign in with email and password
     */
    async signInWithEmail(email, password) {
        await this.init();
        const result = await firebaseAuth.signInWithEmail(email, password);
        return result;
    }

    /**
     * Sign up with email and password
     */
    async signUpWithEmail(email, password) {
        await this.init();
        const result = await firebaseAuth.signUpWithEmail(email, password);
        
        // Send verification email
        if (result.user) {
            await result.user.sendEmailVerification();
        }
        
        return result;
    }

    /**
     * Sign in with Google
     */
    async signInWithGoogle() {
        await this.init();
        const result = await firebaseAuth.signInWithGoogle();
        return result;
    }

    /**
     * Sign out
     */
    async signOut() {
        await firebaseAuth.signOut();
        this.currentUser = null;
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.currentUser;
    }

    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(email) {
        await this.init();
        await firebaseAuth.sendPasswordResetEmail(email);
    }

    /**
     * Update user profile
     */
    async updateProfile(profile) {
        if (!this.currentUser) {
            throw new Error('No user logged in');
        }
        
        await firebaseAuth.updateProfile(this.currentUser, profile);
        
        // Reload user to get updated info
        await this.currentUser.reload();
        this.currentUser = firebaseAuth.getCurrentUser();
    }

    /**
     * Add auth state listener
     */
    addAuthListener(callback) {
        this.listeners.push(callback);
        
        // Call immediately with current state
        if (this.currentUser) {
            callback(this.currentUser);
        }
        
        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    /**
     * Notify all listeners
     */
    _notifyListeners(user) {
        this.listeners.forEach(callback => callback(user));
    }

    /**
     * Get user display name
     */
    getDisplayName() {
        return this.currentUser?.displayName || this.currentUser?.email?.split('@')[0] || 'User';
    }

    /**
     * Get user email
     */
    getEmail() {
        return this.currentUser?.email || '';
    }

    /**
     * Get user photo URL
     */
    getPhotoURL() {
        return this.currentUser?.photoURL || null;
    }

    /**
     * Get user ID token
     */
    async getIdToken() {
        if (!this.currentUser) {
            throw new Error('No user logged in');
        }
        return await this.currentUser.getIdToken();
    }

    /**
     * Link with Google
     */
    async linkWithGoogle() {
        await this.init();
        const provider = new window.firebase.auth.GoogleAuthProvider();
        return await this.currentUser.linkWithPopup(provider);
    }

    /**
     * Unlink Google provider
     */
    async unlinkGoogle() {
        if (!this.currentUser) {
            throw new Error('No user logged in');
        }
        return await this.currentUser.unlink('google.com');
    }

    /**
     * Delete account
     */
    async deleteAccount() {
        if (!this.currentUser) {
            throw new Error('No user logged in');
        }
        await this.currentUser.delete();
        this.currentUser = null;
    }
}

// Create global instance
const firebaseAuth = new FirebaseAuth();

// Export
if (typeof window !== 'undefined') {
    window.FirebaseAuth = FirebaseAuth;
    window.firebaseAuth = firebaseAuth;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FirebaseAuth, firebaseAuth };
}

/**
 * Firebase Configuration
 * AmkyawDev AI Power Platform
 * 
 * ⚠️ Security Notice: This is a client-side configuration.
 * For production, consider using Firebase App Check and server-side validation.
 */

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAr7Hv2ApKtNTxF11MhT5cuWeg_Dgsh0TY",
    authDomain: "smart-burme-app.firebaseapp.com",
    projectId: "smart-burme-app",
    storageBucket: "smart-burme-app.appspot.com",
    messagingSenderId: "851502425686",
    appId: "1:851502425686:web:f29e0e1dfa84794b4abdf7"
};

// Initialize Firebase (will be loaded from CDN)
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;

/**
 * Initialize Firebase
 * Loads Firebase SDK from CDN and initializes the app
 */
async function initFirebase() {
    return new Promise((resolve, reject) => {
        // Check if Firebase is already loaded
        if (window.firebase && window.firebase.apps && window.firebase.apps.length > 0) {
            firebaseApp = window.firebase.apps[0];
            firebaseAuth = window.firebase.auth();
            resolve({ app: firebaseApp, auth: firebaseAuth });
            return;
        }

        // Wait for Firebase SDK to load
        const checkFirebase = setInterval(() => {
            if (window.firebase) {
                clearInterval(checkFirebase);
                try {
                    firebaseApp = window.firebase.initializeApp(firebaseConfig);
                    firebaseAuth = window.firebase.auth();
                    resolve({ app: firebaseApp, auth: firebaseAuth });
                } catch (error) {
                    reject(error);
                }
            }
        }, 100);

        // Timeout after 10 seconds
        setTimeout(() => {
            clearInterval(checkFirebase);
            reject(new Error('Firebase SDK failed to load'));
        }, 10000);
    });
}

/**
 * Firebase Auth Helper Functions
 */
const firebaseAuthHelper = {
    /**
     * Sign in with email and password
     */
    signInWithEmail: async (email, password) => {
        try {
            const result = await firebaseAuth.signInWithEmailAndPassword(email, password);
            return result;
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    },

    /**
     * Sign up with email and password
     */
    signUpWithEmail: async (email, password) => {
        try {
            const result = await firebaseAuth.createUserWithEmailAndPassword(email, password);
            return result;
        } catch (error) {
            console.error('Sign up error:', error);
            throw error;
        }
    },

    /**
     * Sign in with Google
     */
    signInWithGoogle: async () => {
        try {
            const provider = new window.firebase.auth.GoogleAuthProvider();
            const result = await firebaseAuth.signInWithPopup(provider);
            return result;
        } catch (error) {
            console.error('Google sign in error:', error);
            throw error;
        }
    },

    /**
     * Sign out
     */
    signOut: async () => {
        try {
            await firebaseAuth.signOut();
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    },

    /**
     * Get current user
     */
    getCurrentUser: () => {
        return firebaseAuth.currentUser;
    },

    /**
     * Listen for auth state changes
     */
    onAuthStateChanged: (callback) => {
        return firebaseAuth.onAuthStateChanged(callback);
    },

    /**
     * Send password reset email
     */
    sendPasswordResetEmail: async (email) => {
        try {
            await firebaseAuth.sendPasswordResetEmail(email);
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    },

    /**
     * Update user profile
     */
    updateProfile: async (user, profile) => {
        try {
            await user.updateProfile(profile);
        } catch (error) {
            console.error('Profile update error:', error);
            throw error;
        }
    }
};

// Export for global use
if (typeof window !== 'undefined') {
    window.firebaseConfig = firebaseConfig;
    window.firebaseApp = firebaseApp;
    window.firebaseAuth = firebaseAuthHelper;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebaseConfig, firebaseAuthHelper };
}

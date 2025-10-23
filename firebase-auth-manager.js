/**
 * Firebase-Enhanced AuthManager for CareLuva
 * This replaces the mock authentication with real Firebase Authentication
 */

class FirebaseAuthManager {
    constructor() {
        this.viewModel = new AppViewModel();
        this.cleanupFunctions = [];
        this.auth = null;
        this.db = null;
        this.isInitialized = false;
    }

    async init() {
        console.log('FirebaseAuthManager initializing...');
        
        // Wait for Firebase to be available
        await this.waitForFirebase();
        
        this.setupEventListeners();
        this.setupAuthStateListener();
        this.isInitialized = true;
        
        console.log('FirebaseAuthManager initialized successfully');
    }

    async waitForFirebase() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds max wait
            
            const checkFirebase = () => {
                attempts++;
                
                if (window.firebase && window.firebase.auth && window.firebase.db) {
                    this.auth = window.firebase.auth;
                    this.db = window.firebase.db;
                    console.log('Firebase AuthManager: Firebase services loaded successfully');
                    resolve();
                } else if (attempts >= maxAttempts) {
                    console.error('Firebase AuthManager: Timeout waiting for Firebase services');
                    reject(new Error('Firebase services not available'));
                } else {
                    console.log(`Firebase AuthManager: Waiting for Firebase services... (${attempts}/${maxAttempts})`);
                    setTimeout(checkFirebase, 100);
                }
            };
            checkFirebase();
        });
    }

    setupEventListeners() {
        // Listen for registration events
        const registrationHandler = (event) => {
            this.handleRegistration(event.detail);
        };
        document.addEventListener('provider:register', registrationHandler);
        this.cleanupFunctions.push(() => {
            document.removeEventListener('provider:register', registrationHandler);
        });

        // Listen for login events
        const loginHandler = (event) => {
            this.handleLogin(event.detail);
        };
        document.addEventListener('provider:login', loginHandler);
        this.cleanupFunctions.push(() => {
            document.removeEventListener('provider:login', loginHandler);
        });
    }

    setupAuthStateListener() {
        if (this.auth) {
            this.auth.onAuthStateChanged((user) => {
                if (user) {
                    console.log('User authenticated:', user.email);
                    this.viewModel.setProviderUser({
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        emailVerified: user.emailVerified
                    });
                } else {
                    console.log('User not authenticated');
                    this.viewModel.setProviderUser(null);
                }
            });
        }
    }

    async handleRegistration(formData) {
        try {
            this.viewModel.setProviderLoading(true);
            this.viewModel.clearProviderError();

            if (!this.isInitialized) {
                throw new Error('Firebase not initialized');
            }

            // Import Firebase functions
            const { createUserWithEmailAndPassword, updateProfile } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js');
            const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');

            // Create user account
            const userCredential = await createUserWithEmailAndPassword(
                this.auth,
                formData.email,
                formData.password
            );

            // Update user profile
            await updateProfile(userCredential.user, {
                displayName: formData.clinicName
            });

            // Save provider data to Firestore
            await setDoc(doc(this.db, 'providers', userCredential.user.uid), {
                uid: userCredential.user.uid,
                email: formData.email,
                clinicName: formData.clinicName,
                phone: formData.phone,
                licenseNumber: formData.licenseNumber,
                specialization: formData.specialization,
                isVerified: false,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            this.viewModel.setProviderLoading(false);

            // Emit success event
            EventUtils.createCustomEvent('provider:registrationSuccess', { 
                user: userCredential.user,
                providerData: formData
            });

            console.log('Provider registration successful:', userCredential.user.email);

        } catch (error) {
            console.error('Registration error:', error);
            this.viewModel.setProviderError(this.getErrorMessage(error));
            this.viewModel.setProviderLoading(false);
            EventUtils.createCustomEvent('provider:registrationError', { error: this.getErrorMessage(error) });
        }
    }

    async handleLogin(credentials) {
        try {
            this.viewModel.setProviderLoading(true);
            this.viewModel.clearProviderError();

            if (!this.isInitialized) {
                throw new Error('Firebase not initialized');
            }

            // Import Firebase functions
            const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js');
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');

            // Sign in user
            const userCredential = await signInWithEmailAndPassword(
                this.auth,
                credentials.email,
                credentials.password
            );

            // Get provider data from Firestore
            const providerDoc = await getDoc(doc(this.db, 'providers', userCredential.user.uid));
            const providerData = providerDoc.exists() ? providerDoc.data() : null;

            this.viewModel.setProviderLoading(false);

            // Emit success event
            EventUtils.createCustomEvent('provider:loginSuccess', { 
                user: userCredential.user,
                providerData: providerData
            });

            console.log('Provider login successful');
        } catch (error) {
            console.error('Login error:', error);
            this.viewModel.setProviderError(this.getErrorMessage(error));
            this.viewModel.setProviderLoading(false);
            EventUtils.createCustomEvent('provider:loginError', { error: this.getErrorMessage(error) });
        }
    }

    async signOut() {
        try {
            const { signOut } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js');
            await signOut(this.auth);
            console.log('User signed out successfully');
        } catch (error) {
            console.error('Sign out error:', error);
        }
    }

    async sendEmailVerification() {
        try {
            if (this.auth.currentUser) {
                const { sendEmailVerification } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js');
                await sendEmailVerification(this.auth.currentUser);
                console.log('Email verification sent');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Email verification error:', error);
            return false;
        }
    }

    getErrorMessage(error) {
        switch (error.code) {
            case 'auth/email-already-in-use':
                return 'This email is already registered. Please use a different email or try logging in.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters long.';
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/user-not-found':
                return 'No account found with this email address.';
            case 'auth/wrong-password':
                return 'Incorrect password. Please try again.';
            case 'auth/too-many-requests':
                return 'Too many failed attempts. Please try again later.';
            case 'auth/network-request-failed':
                return 'Network error. Please check your internet connection.';
            default:
                return error.message || 'An unexpected error occurred. Please try again.';
        }
    }

    destroy() {
        this.cleanupFunctions.forEach(cleanup => cleanup());
    }
}

// Export for use in other modules
window.FirebaseAuthManager = FirebaseAuthManager;

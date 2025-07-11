/**
 * Authentication Modal - Handles the login/signup modal UI and interactions
 */

import { AuthManager } from './AuthManager.mjs';

export class AuthModal {
    constructor(authManager, onAuthSuccess, notificationManager = null) {
        this.authManager = authManager;
        this.onAuthSuccess = onAuthSuccess;
        this.notificationManager = notificationManager;
        this.modal = null;
        this.mainContainer = null;
        this.cont = null;

        this.init();
    }

    /**
     * Initialize the auth modal
     */
    init() {
        this.modal = document.getElementById('authModal');
        this.mainContainer = document.querySelector('.main-container');

        this.setupEventListeners();
    }

    /**
     * Setup all event listeners for the modal
     */
    setupEventListeners() {
        // Tab switching
        const authTabs = document.querySelectorAll('.auth-tab');
        authTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabType = tab.getAttribute('data-tab');
                this.switchTab(tabType);
            });
        });

        // Toggle buttons in form footers
        const toggleSignup = document.querySelector('.toggle-signup');
        const toggleSignin = document.querySelector('.toggle-signin');

        if (toggleSignup) {
            toggleSignup.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab('signup');
            });
        }

        if (toggleSignin) {
            toggleSignin.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab('signin');
            });
        }

        // Close button
        const closeBtn = document.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideModal();
            });
        }

        // Form submissions
        this.setupLoginForm();
        this.setupSignupForm();

        // File input enhancement
        this.setupFileInput();

        // Keyboard support
        this.setupKeyboardHandlers();
    }

    /**
     * Switch between signin and signup tabs
     * @param {string} tabType - 'signin' or 'signup'
     */
    switchTab(tabType) {
        // Update tab buttons
        const authTabs = document.querySelectorAll('.auth-tab');
        authTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-tab') === tabType) {
                tab.classList.add('active');
            }
        });

        // Update form containers
        const formContainers = document.querySelectorAll('.auth-form-container');
        formContainers.forEach(container => {
            container.classList.remove('active');
        });

        const targetContainer = document.querySelector(`.${tabType}-form`);
        if (targetContainer) {
            targetContainer.classList.add('active');
        }
    }

    /**
     * Handle login form submission
     */
    async handleLoginSubmit() {
        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;

        if (!email || !password) {
            this.showNotification('Please fill in all fields', 'warning');
            return;
        }

        const result = await this.authManager.login(email, password);

        if (result.success) {
            this.showNotification('Login successful!', 'success');
            this.hideModal();
            if (this.onAuthSuccess) {
                this.onAuthSuccess(result.user);
            }
        } else {
            this.showNotification('Login failed. Please check your credentials.', 'error');
        }
    }

    /**
     * Setup login form submission
     */
    setupLoginForm() {
        const signInBtn = document.querySelector('.signin-submit');
        const emailInput = document.getElementById('signin-email');
        const passwordInput = document.getElementById('signin-password');

        // Button click handler
        if (signInBtn) {
            signInBtn.addEventListener('click', async () => {
                await this.handleLoginSubmit();
            });
        }

        // Enter key handlers for input fields
        if (emailInput) {
            emailInput.addEventListener('keydown', async (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    await this.handleLoginSubmit();
                }
            });
        }

        if (passwordInput) {
            passwordInput.addEventListener('keydown', async (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    await this.handleLoginSubmit();
                }
            });
        }
    }

    /**
     * Handle signup form submission
     */
    async handleSignupSubmit() {
        const formData = this.getSignupFormData();

        // Validate form data
        const validation = this.authManager.validateRegistrationData(formData);
        if (!validation.valid) {
            this.showNotification(validation.error, 'warning');
            return;
        }

        // Validate avatar file
        const avatarInput = document.getElementById("signup-avatar");
        if (avatarInput.files.length > 0) {
            const avatarValidation = this.authManager.validateAvatarFile(avatarInput.files[0]);
            if (!avatarValidation.valid) {
                this.showNotification(avatarValidation.error, 'warning');
                return;
            }
        }

        // Create FormData for submission
        const submitFormData = new FormData();
        submitFormData.append("username", formData.username);
        submitFormData.append("email", formData.email);
        submitFormData.append("password", formData.password);

        if (avatarInput.files.length > 0) {
            submitFormData.append("avatar", avatarInput.files[0]);
        }

        const result = await this.authManager.register(submitFormData);

        if (result.success) {
            this.showNotification('Registration successful! Welcome to the forum!', 'success');
            this.hideModal();
            if (this.onAuthSuccess) {
                this.onAuthSuccess(result.user);
            }
        } else {
            this.showNotification(`Registration failed: ${result.error}`, 'error');
        }
    }

    /**
     * Setup signup form submission
     */
    setupSignupForm() {
        const signUpBtn = document.querySelector('.signup-submit');
        const usernameInput = document.getElementById('signup-username');
        const emailInput = document.getElementById('signup-email');
        const passwordInput = document.getElementById('signup-password');
        const confirmPasswordInput = document.getElementById('signup-confirm');

        // Button click handler
        if (signUpBtn) {
            signUpBtn.addEventListener('click', async () => {
                await this.handleSignupSubmit();
            });
        }

        // Enter key handlers for input fields
        const inputs = [usernameInput, emailInput, passwordInput, confirmPasswordInput];
        inputs.forEach(input => {
            if (input) {
                input.addEventListener('keydown', async (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        await this.handleSignupSubmit();
                    }
                });
            }
        });
    }

    /**
     * Get signup form data
     * @returns {Object} - Form data object
     */
    getSignupFormData() {
        return {
            username: document.getElementById('signup-username').value.trim(),
            email: document.getElementById('signup-email').value.trim(),
            password: document.getElementById('signup-password').value,
            confirmPassword: document.getElementById('signup-confirm').value
        };
    }

    /**
     * Show the modal with login form
     */
    showLoginModal() {
        this.mainContainer.classList.add('blur');
        this.modal.classList.remove('hidden');
        document.body.classList.add('modal-open');
        this.switchTab('signin');
    }

    /**
     * Show the modal with signup form
     */
    showSignupModal() {
        this.mainContainer.classList.add('blur');
        this.modal.classList.remove('hidden');
        document.body.classList.add('modal-open');
        this.switchTab('signup');
    }

    /**
     * Hide the modal
     */
    hideModal() {
        this.mainContainer.classList.remove('blur');
        this.modal.classList.add('hidden');
        document.body.classList.remove('modal-open');

        // Reset forms
        this.resetForms();
    }

    /**
     * Reset all forms
     */
    resetForms() {
        const forms = document.querySelectorAll('.auth-form-container form');
        forms.forEach(form => {
            if (form.reset) {
                form.reset();
            }
        });

        // Reset file input text
        const fileInputText = document.querySelector('.file-input-text');
        if (fileInputText) {
            fileInputText.textContent = 'Choose file or drag here';
        }
    }

    /**
     * Setup file input enhancement
     */
    setupFileInput() {
        const fileInput = document.getElementById('signup-avatar');
        const fileInputText = document.querySelector('.file-input-text');
        const fileInputWrapper = document.querySelector('.file-input-wrapper');

        if (fileInput && fileInputText && fileInputWrapper) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    fileInputText.textContent = `Selected: ${file.name}`;
                } else {
                    fileInputText.textContent = 'Choose file or drag here';
                }
            });

            // Drag and drop functionality
            fileInputWrapper.addEventListener('dragover', (e) => {
                e.preventDefault();
                fileInputWrapper.style.borderColor = 'var(--bg-color)';
                fileInputWrapper.style.backgroundColor = '#f8f9fa';
            });

            fileInputWrapper.addEventListener('dragleave', (e) => {
                e.preventDefault();
                fileInputWrapper.style.borderColor = '#e5e5e5';
                fileInputWrapper.style.backgroundColor = 'transparent';
            });

            fileInputWrapper.addEventListener('drop', (e) => {
                e.preventDefault();
                fileInputWrapper.style.borderColor = '#e5e5e5';
                fileInputWrapper.style.backgroundColor = 'transparent';

                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    fileInput.files = files;
                    fileInputText.textContent = `Selected: ${files[0].name}`;
                }
            });
        }
    }

    /**
     * Setup keyboard handlers
     */
    setupKeyboardHandlers() {
        document.addEventListener('keydown', (e) => {
            // Close modal on Escape key
            if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
                this.hideModal();
            }
        });
    }

    /**
     * Show notification using the notification manager or fallback to alert
     * @param {string} message - Message to display
     * @param {string} type - Notification type: 'success', 'error', 'warning', 'info'
     */
    showNotification(message, type = 'info') {
        if (this.notificationManager) {
            this.notificationManager.showToast(message, type);
        } else {
            // Fallback to browser alert if notification manager is not available
            alert(message);
        }
    }

    /**
     * Set the notification manager (for dependency injection)
     * @param {NotificationManager} notificationManager - Notification manager instance
     */
    setNotificationManager(notificationManager) {
        this.notificationManager = notificationManager;
    }
}

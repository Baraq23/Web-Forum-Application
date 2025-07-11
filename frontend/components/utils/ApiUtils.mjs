/**
 * API utility functions for the forum application
 */

export class ApiUtils {
    // Base URL for API calls
    // For local development and serve-based Docker: use localhost:8080
    // For nginx-based Docker: use relative URLs (empty string)
    static BASE_URL = window.location.hostname === 'localhost' && window.location.port === '8000'
        ? 'http://localhost:8080'
        : '';

    static notificationManager = null;

    /**
     * Makes a GET request to the API
     * @param {string} endpoint - API endpoint
     * @param {boolean} includeCredentials - Whether to include credentials
     * @returns {Promise<any>} - Response data
     */
    static async get(endpoint, includeCredentials = false) {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (includeCredentials) {
            options.credentials = 'include';
        }

        const response = await fetch(`${this.BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Makes a POST request to the API
     * @param {string} endpoint - API endpoint
     * @param {any} data - Data to send
     * @param {boolean} includeCredentials - Whether to include credentials
     * @param {boolean} isFormData - Whether data is FormData
     * @returns {Promise<any>} - Response data
     */
    static async post(endpoint, data, includeCredentials = false, isFormData = false) {
        const options = {
            method: 'POST',
            body: isFormData ? data : JSON.stringify(data)
        };

        if (!isFormData) {
            options.headers = {
                'Content-Type': 'application/json',
            };
        }

        if (includeCredentials) {
            options.credentials = 'include';
        }

        const response = await fetch(`${this.BASE_URL}${endpoint}`, options);
        
        // Handle text responses for debugging
        const responseText = await response.text();
        let responseData;
        
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            if (!response.ok) {
                throw new Error(`Server error: ${responseText}`);
            }
            responseData = responseText;
        }

        if (!response.ok) {
            throw new Error(responseData.error || `HTTP error! Status: ${response.status}`);
        }

        return { response, data: responseData };
    }

    /**
     * Handles common error scenarios with context-specific messages
     * @param {Error} error - The error to handle
     * @param {string} context - Context where error occurred
     * @param {boolean} showNotification - Whether to show a notification automatically
     */
    static handleError(error, context = '', showNotification = false) {
        console.error(`Error in ${context}:`, error);

        let errorInfo;

        if (error.message.includes('401')) {
            // Provide context-specific unauthorized messages
            if (context.includes('login') || context.includes('authentication')) {
                errorInfo = {
                    requiresAuth: false,
                    message: 'Invalid email or password. Please check your credentials and try again.',
                    suggestion: 'Don\'t have an account? Sign up to get started!'
                };
            } else if (context.includes('post') || context.includes('comment') || context.includes('reaction')) {
                errorInfo = {
                    requiresAuth: true,
                    message: 'You need to be logged in to perform this action.',
                    suggestion: 'Please log in or create an account to continue.'
                };
            } else {
                errorInfo = {
                    requiresAuth: true,
                    message: 'Authentication required. Please log in to continue.',
                    suggestion: 'Log in to access this feature.'
                };
            }
        } else if (error.message.includes('403')) {
            errorInfo = {
                requiresAuth: false,
                message: 'You don\'t have permission to perform this action.',
                suggestion: 'Contact an administrator if you believe this is an error.'
            };
        } else if (error.message.includes('404')) {
            if (context.includes('post')) {
                errorInfo = {
                    requiresAuth: false,
                    message: 'This post could not be found. It may have been deleted.',
                    suggestion: 'Try refreshing the page or go back to the main feed.'
                };
            } else {
                errorInfo = {
                    requiresAuth: false,
                    message: 'The requested content was not found.',
                    suggestion: 'Please check the URL or try again later.'
                };
            }
        } else if (error.message.includes('422')) {
            errorInfo = {
                requiresAuth: false,
                message: 'The information provided is invalid or incomplete.',
                suggestion: 'Please check all required fields and try again.'
            };
        } else if (error.message.includes('429')) {
            errorInfo = {
                requiresAuth: false,
                message: 'Too many requests. Please slow down.',
                suggestion: 'Wait a moment before trying again.'
            };
        } else if (error.message.includes('500')) {
            errorInfo = {
                requiresAuth: false,
                message: 'Server error occurred. This is not your fault.',
                suggestion: 'Please try again in a few minutes. If the problem persists, contact support.'
            };
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
            errorInfo = {
                requiresAuth: false,
                message: 'Network connection problem.',
                suggestion: 'Please check your internet connection and try again.'
            };
        } else {
            // Try to extract meaningful error from response
            let message = error.message;
            if (message.includes('Failed to fetch')) {
                message = 'Unable to connect to the server.';
            }

            errorInfo = {
                requiresAuth: false,
                message: message,
                suggestion: 'Please try again or contact support if the problem continues.'
            };
        }

        // Show notification if requested and notification manager is available
        if (showNotification && this.notificationManager && !errorInfo.requiresAuth) {
            this.notificationManager.error(errorInfo.message);
        }

        return errorInfo;
    }

    /**
     * Set the notification manager for global error handling
     * @param {NotificationManager} notificationManager - Notification manager instance
     */
    static setNotificationManager(notificationManager) {
        this.notificationManager = notificationManager;
    }

    /**
     * Show a success notification for API operations
     * @param {string} message - Success message
     */
    static showSuccess(message) {
        if (this.notificationManager) {
            this.notificationManager.success(message);
        }
    }

    /**
     * Show an error notification for API operations
     * @param {string} message - Error message
     */
    static showError(message) {
        if (this.notificationManager) {
            this.notificationManager.error(message);
        }
    }

    /**
     * Show an info notification for API operations
     * @param {string} message - Info message
     */
    static showInfo(message) {
        if (this.notificationManager) {
            this.notificationManager.info(message);
        }
    }

    /**
     * Show a warning notification for API operations
     * @param {string} message - Warning message
     */
    static showWarning(message) {
        if (this.notificationManager) {
            this.notificationManager.warning(message);
        }
    }
}

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
     * Handles common error scenarios
     * @param {Error} error - The error to handle
     * @param {string} context - Context where error occurred
     * @param {boolean} showNotification - Whether to show a notification automatically
     */
    static handleError(error, context = '', showNotification = false) {
        console.error(`Error in ${context}:`, error);

        let errorInfo;
        if (error.message.includes('401')) {
            errorInfo = { requiresAuth: true, message: 'Please log in to continue.' };
        } else if (error.message.includes('403')) {
            errorInfo = { requiresAuth: false, message: 'You do not have permission to perform this action.' };
        } else if (error.message.includes('404')) {
            errorInfo = { requiresAuth: false, message: 'The requested resource was not found.' };
        } else if (error.message.includes('500')) {
            errorInfo = { requiresAuth: false, message: 'Server error. Please try again later.' };
        } else if (error.message.includes('Network')) {
            errorInfo = { requiresAuth: false, message: 'Network error. Please check your connection.' };
        } else {
            errorInfo = { requiresAuth: false, message: error.message };
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

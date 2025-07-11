/**
 * Forum Application - Main Entry Point
 * This file now imports and orchestrates modular components
 */

import { App } from './components/core/App.mjs';

// Global app instance
let forumApp = null;

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
    try {
        console.log('Initializing Forum Application...');
        forumApp = new App();

        // Make app instance globally available for debugging
        window.forumApp = forumApp;

    } catch (error) {
        console.error('Failed to initialize Forum Application:', error);
        showInitializationError('Failed to load the application. Please refresh the page.');
    }
});

/**
 * Show initialization error with a styled modal instead of browser alert
 * @param {string} message - Error message to display
 */
function showInitializationError(message) {
    // Create a simple error modal since NotificationManager might not be available
    const errorModal = document.createElement('div');
    errorModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: 'Segoe UI', sans-serif;
    `;

    errorModal.innerHTML = `
        <div style="
            background: white;
            border-radius: 12px;
            padding: 24px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            text-align: center;
        ">
            <div style="
                width: 60px;
                height: 60px;
                background: #fef2f2;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 16px;
                color: #dc2626;
                font-size: 24px;
            ">
                ⚠️
            </div>
            <h2 style="
                color: #111827;
                margin: 0 0 12px 0;
                font-size: 20px;
                font-weight: 600;
            ">Application Error</h2>
            <p style="
                color: #6b7280;
                margin: 0 0 24px 0;
                line-height: 1.5;
            ">${message}</p>
            <button onclick="window.location.reload()" style="
                background: #3b82f6;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                margin-right: 8px;
            ">Refresh Page</button>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
            ">Dismiss</button>
        </div>
    `;

    document.body.appendChild(errorModal);
}

// Export for potential external use
export { forumApp };

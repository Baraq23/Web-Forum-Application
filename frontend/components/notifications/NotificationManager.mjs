/**
 * Notification Manager - Handles all types of notifications and alerts
 * Replaces browser alert(), confirm(), and prompt() with structured UI components
 */

export class NotificationManager {
    constructor() {
        this.toastContainer = null;
        this.modalContainer = null;
        this.init();
    }

    /**
     * Initialize the notification system
     */
    init() {
        this.createToastContainer();
        this.createModalContainer();
        this.injectStyles();
    }

    /**
     * Create toast notification container
     */
    createToastContainer() {
        this.toastContainer = document.createElement('div');
        this.toastContainer.id = 'toast-container';
        this.toastContainer.className = 'toast-container';
        document.body.appendChild(this.toastContainer);
    }

    /**
     * Create modal container for alerts and confirmations
     */
    createModalContainer() {
        this.modalContainer = document.createElement('div');
        this.modalContainer.id = 'notification-modal-container';
        this.modalContainer.className = 'notification-modal-container hidden';
        document.body.appendChild(this.modalContainer);
    }

    /**
     * Show a toast notification
     * @param {string} message - Message to display
     * @param {string} type - Type: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duration in milliseconds (0 for persistent)
     */
    showToast(message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = this.getToastIcon(type);
        toast.innerHTML = `
            <div class="toast-content">
                <i class="${icon}"></i>
                <span class="toast-message">${message}</span>
                <button class="toast-close" aria-label="Close notification">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add close functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.removeToast(toast));

        // Add to container
        this.toastContainer.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('toast-show'), 10);

        // Auto-remove if duration is set
        if (duration > 0) {
            setTimeout(() => this.removeToast(toast), duration);
        }

        return toast;
    }

    /**
     * Remove a toast notification
     * @param {HTMLElement} toast - Toast element to remove
     */
    removeToast(toast) {
        if (!toast || !toast.parentNode) return;
        
        toast.classList.add('toast-hide');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    /**
     * Show an alert modal (replacement for alert())
     * @param {string} message - Message to display
     * @param {string} title - Modal title
     * @param {string} type - Type: 'success', 'error', 'warning', 'info'
     * @returns {Promise} - Resolves when modal is closed
     */
    showAlert(message, title = 'Alert', type = 'info') {
        return new Promise((resolve) => {
            const modal = this.createModal({
                title,
                message,
                type,
                buttons: [
                    {
                        text: 'OK',
                        class: 'btn-primary',
                        action: () => {
                            this.hideModal();
                            resolve(true);
                        }
                    }
                ]
            });

            this.showModal(modal);
        });
    }

    /**
     * Show a confirmation modal (replacement for confirm())
     * @param {string} message - Message to display
     * @param {string} title - Modal title
     * @param {Object} options - Options for confirm dialog
     * @returns {Promise<boolean>} - Resolves with true/false
     */
    showConfirm(message, title = 'Confirm', options = {}) {
        const defaultOptions = {
            confirmText: 'OK',
            cancelText: 'Cancel',
            type: 'warning'
        };
        const opts = { ...defaultOptions, ...options };

        return new Promise((resolve) => {
            const modal = this.createModal({
                title,
                message,
                type: opts.type,
                buttons: [
                    {
                        text: opts.cancelText,
                        class: 'btn-secondary',
                        action: () => {
                            this.hideModal();
                            resolve(false);
                        }
                    },
                    {
                        text: opts.confirmText,
                        class: 'btn-primary',
                        action: () => {
                            this.hideModal();
                            resolve(true);
                        }
                    }
                ]
            });

            this.showModal(modal);
        });
    }

    /**
     * Show a prompt modal (replacement for prompt())
     * @param {string} message - Message to display
     * @param {string} title - Modal title
     * @param {string} defaultValue - Default input value
     * @returns {Promise<string|null>} - Resolves with input value or null
     */
    showPrompt(message, title = 'Input Required', defaultValue = '') {
        return new Promise((resolve) => {
            const inputId = 'prompt-input-' + Date.now();
            const modal = this.createModal({
                title,
                message,
                type: 'info',
                customContent: `
                    <div class="prompt-input-container">
                        <input type="text" id="${inputId}" class="prompt-input" value="${defaultValue}" placeholder="Enter value...">
                    </div>
                `,
                buttons: [
                    {
                        text: 'Cancel',
                        class: 'btn-secondary',
                        action: () => {
                            this.hideModal();
                            resolve(null);
                        }
                    },
                    {
                        text: 'OK',
                        class: 'btn-primary',
                        action: () => {
                            const input = document.getElementById(inputId);
                            const value = input ? input.value.trim() : '';
                            this.hideModal();
                            resolve(value);
                        }
                    }
                ]
            });

            this.showModal(modal);

            // Focus input after modal is shown
            setTimeout(() => {
                const input = document.getElementById(inputId);
                if (input) {
                    input.focus();
                    input.select();
                }
            }, 100);
        });
    }

    /**
     * Create a modal element
     * @param {Object} config - Modal configuration
     * @returns {HTMLElement} - Modal element
     */
    createModal(config) {
        const { title, message, type, customContent, buttons } = config;
        const icon = this.getModalIcon(type);

        const modal = document.createElement('div');
        modal.className = 'notification-modal';
        modal.innerHTML = `
            <div class="notification-modal-content">
                <div class="notification-modal-header">
                    <div class="notification-modal-icon ${type}">
                        <i class="${icon}"></i>
                    </div>
                    <h3 class="notification-modal-title">${title}</h3>
                    <button class="notification-modal-close" aria-label="Close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="notification-modal-body">
                    <p class="notification-modal-message">${message}</p>
                    ${customContent || ''}
                </div>
                <div class="notification-modal-footer">
                    ${buttons.map(btn => `
                        <button class="notification-modal-btn ${btn.class}" data-action="${buttons.indexOf(btn)}">
                            ${btn.text}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Add event listeners
        const closeBtn = modal.querySelector('.notification-modal-close');
        closeBtn.addEventListener('click', () => {
            this.hideModal();
            // If there's a cancel action, trigger it
            const cancelBtn = buttons.find(btn => btn.class.includes('secondary'));
            if (cancelBtn) cancelBtn.action();
        });

        // Add button event listeners
        const actionBtns = modal.querySelectorAll('.notification-modal-btn');
        actionBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => buttons[index].action());
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal();
                const cancelBtn = buttons.find(btn => btn.class.includes('secondary'));
                if (cancelBtn) cancelBtn.action();
            }
        });

        return modal;
    }

    /**
     * Show a modal
     * @param {HTMLElement} modal - Modal element to show
     */
    showModal(modal) {
        this.modalContainer.innerHTML = '';
        this.modalContainer.appendChild(modal);
        this.modalContainer.classList.remove('hidden');
        
        // Add blur effect to main content
        const mainContainer = document.querySelector('.main-container');
        if (mainContainer) {
            mainContainer.classList.add('blur');
        }
        
        document.body.classList.add('modal-open');
        
        // Focus management for accessibility
        setTimeout(() => {
            const firstButton = modal.querySelector('.notification-modal-btn');
            if (firstButton) firstButton.focus();
        }, 100);
    }

    /**
     * Hide the current modal
     */
    hideModal() {
        this.modalContainer.classList.add('hidden');
        
        // Remove blur effect from main content
        const mainContainer = document.querySelector('.main-container');
        if (mainContainer) {
            mainContainer.classList.remove('blur');
        }
        
        document.body.classList.remove('modal-open');
        
        setTimeout(() => {
            this.modalContainer.innerHTML = '';
        }, 300);
    }

    /**
     * Get icon for toast type
     * @param {string} type - Toast type
     * @returns {string} - Icon class
     */
    getToastIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    /**
     * Get icon for modal type
     * @param {string} type - Modal type
     * @returns {string} - Icon class
     */
    getModalIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-times-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    /**
     * Inject notification styles
     */
    injectStyles() {
        if (document.getElementById('notification-styles')) return;

        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            /* Toast Notifications */
            .toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
                pointer-events: none;
            }

            .toast {
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                border-left: 4px solid;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
                pointer-events: all;
                max-width: 100%;
                word-wrap: break-word;
            }

            .toast.toast-show {
                opacity: 1;
                transform: translateX(0);
            }

            .toast.toast-hide {
                opacity: 0;
                transform: translateX(100%);
            }

            .toast-success { border-left-color: #10b981; }
            .toast-error { border-left-color: #ef4444; }
            .toast-warning { border-left-color: #f59e0b; }
            .toast-info { border-left-color: #3b82f6; }

            .toast-content {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                gap: 12px;
            }

            .toast-content i:first-child {
                font-size: 18px;
                flex-shrink: 0;
            }

            .toast-success .toast-content i:first-child { color: #10b981; }
            .toast-error .toast-content i:first-child { color: #ef4444; }
            .toast-warning .toast-content i:first-child { color: #f59e0b; }
            .toast-info .toast-content i:first-child { color: #3b82f6; }

            .toast-message {
                flex: 1;
                font-size: 14px;
                line-height: 1.4;
                color: #374151;
            }

            .toast-close {
                background: none;
                border: none;
                color: #9ca3af;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s ease;
                flex-shrink: 0;
            }

            .toast-close:hover {
                background: #f3f4f6;
                color: #6b7280;
            }

            /* Notification Modals */
            .notification-modal-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .notification-modal-container:not(.hidden) {
                opacity: 1;
                visibility: visible;
            }

            .notification-modal {
                background: white;
                border-radius: 12px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow: hidden;
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }

            .notification-modal-container:not(.hidden) .notification-modal {
                transform: scale(1);
            }

            .notification-modal-content {
                display: flex;
                flex-direction: column;
            }

            .notification-modal-header {
                display: flex;
                align-items: center;
                padding: 20px 24px 16px;
                gap: 12px;
                border-bottom: 1px solid #e5e7eb;
            }

            .notification-modal-icon {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                flex-shrink: 0;
            }

            .notification-modal-icon.success {
                background: #dcfce7;
                color: #16a34a;
            }

            .notification-modal-icon.error {
                background: #fef2f2;
                color: #dc2626;
            }

            .notification-modal-icon.warning {
                background: #fef3c7;
                color: #d97706;
            }

            .notification-modal-icon.info {
                background: #dbeafe;
                color: #2563eb;
            }

            .notification-modal-title {
                flex: 1;
                font-size: 18px;
                font-weight: 600;
                color: #111827;
                margin: 0;
            }

            .notification-modal-close {
                background: none;
                border: none;
                color: #9ca3af;
                cursor: pointer;
                padding: 8px;
                border-radius: 6px;
                transition: all 0.2s ease;
                font-size: 16px;
            }

            .notification-modal-close:hover {
                background: #f3f4f6;
                color: #6b7280;
            }

            .notification-modal-body {
                padding: 16px 24px 20px;
            }

            .notification-modal-message {
                font-size: 14px;
                line-height: 1.5;
                color: #374151;
                margin: 0 0 16px 0;
            }

            .prompt-input-container {
                margin-top: 16px;
            }

            .prompt-input {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
                transition: border-color 0.2s ease;
            }

            .prompt-input:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .notification-modal-footer {
                display: flex;
                gap: 8px;
                justify-content: flex-end;
                padding: 16px 24px 20px;
                border-top: 1px solid #e5e7eb;
            }

            .notification-modal-btn {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                min-width: 80px;
            }

            .notification-modal-btn.btn-primary {
                background: #3b82f6;
                color: white;
            }

            .notification-modal-btn.btn-primary:hover {
                background: #2563eb;
            }

            .notification-modal-btn.btn-secondary {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
            }

            .notification-modal-btn.btn-secondary:hover {
                background: #e5e7eb;
            }

            /* Mobile responsiveness */
            @media (max-width: 640px) {
                .toast-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }

                .notification-modal {
                    width: 95%;
                    margin: 20px;
                }

                .notification-modal-header,
                .notification-modal-body,
                .notification-modal-footer {
                    padding-left: 16px;
                    padding-right: 16px;
                }

                .notification-modal-footer {
                    flex-direction: column;
                }

                .notification-modal-btn {
                    width: 100%;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /**
     * Clear all notifications
     */
    clearAll() {
        // Clear all toasts
        const toasts = this.toastContainer.querySelectorAll('.toast');
        toasts.forEach(toast => this.removeToast(toast));

        // Hide modal if open
        this.hideModal();
    }

    /**
     * Convenience methods for common notification types
     */
    success(message, duration = 4000) {
        return this.showToast(message, 'success', duration);
    }

    error(message, duration = 6000) {
        return this.showToast(message, 'error', duration);
    }

    warning(message, duration = 5000) {
        return this.showToast(message, 'warning', duration);
    }

    info(message, duration = 4000) {
        return this.showToast(message, 'info', duration);
    }
}

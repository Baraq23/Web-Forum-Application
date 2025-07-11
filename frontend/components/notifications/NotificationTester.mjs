/**
 * Notification System Tester - For testing and validating the notification system
 */

export class NotificationTester {
    constructor(notificationManager) {
        this.notificationManager = notificationManager;
    }

    /**
     * Test all toast notification types
     */
    testToastNotifications() {
        console.log('Testing toast notifications...');
        
        // Test different types with delays
        setTimeout(() => {
            this.notificationManager.success('This is a success notification! 🎉');
        }, 100);

        setTimeout(() => {
            this.notificationManager.info('This is an info notification with some longer text to test wrapping behavior.');
        }, 600);

        setTimeout(() => {
            this.notificationManager.warning('This is a warning notification ⚠️');
        }, 1100);

        setTimeout(() => {
            this.notificationManager.error('This is an error notification with a longer message to test how it handles multiple lines and text wrapping.');
        }, 1600);

        setTimeout(() => {
            this.notificationManager.showToast('This is a persistent notification (click X to close)', 'info', 0);
        }, 2100);
    }

    /**
     * Test alert modal
     */
    async testAlertModal() {
        console.log('Testing alert modal...');
        
        const result = await this.notificationManager.showAlert(
            'This is a test alert modal. It replaces the browser alert() function with a styled, accessible modal.',
            'Test Alert',
            'info'
        );
        
        console.log('Alert result:', result);
        return result;
    }

    /**
     * Test confirmation modal
     */
    async testConfirmModal() {
        console.log('Testing confirmation modal...');
        
        const result = await this.notificationManager.showConfirm(
            'Do you want to proceed with this test? This replaces the browser confirm() function.',
            'Test Confirmation',
            {
                confirmText: 'Yes, Proceed',
                cancelText: 'Cancel',
                type: 'warning'
            }
        );
        
        console.log('Confirm result:', result);
        return result;
    }

    /**
     * Test prompt modal
     */
    async testPromptModal() {
        console.log('Testing prompt modal...');
        
        const result = await this.notificationManager.showPrompt(
            'Please enter your name. This replaces the browser prompt() function.',
            'Test Prompt',
            'John Doe'
        );
        
        console.log('Prompt result:', result);
        return result;
    }

    /**
     * Test error scenarios
     */
    testErrorScenarios() {
        console.log('Testing error scenarios...');
        
        // Test authentication error
        setTimeout(() => {
            this.notificationManager.error('Authentication failed. Please log in again.');
        }, 100);

        // Test validation error
        setTimeout(() => {
            this.notificationManager.warning('Please fill in all required fields.');
        }, 600);

        // Test network error
        setTimeout(() => {
            this.notificationManager.error('Network error. Please check your connection and try again.');
        }, 1100);

        // Test server error
        setTimeout(() => {
            this.notificationManager.error('Server error. Please try again later.');
        }, 1600);
    }

    /**
     * Test accessibility features
     */
    testAccessibility() {
        console.log('Testing accessibility features...');
        
        // Test keyboard navigation
        this.notificationManager.showAlert(
            'Use Tab to navigate between buttons, Enter to activate, and Escape to close.',
            'Accessibility Test',
            'info'
        );
    }

    /**
     * Test mobile responsiveness
     */
    testMobileResponsiveness() {
        console.log('Testing mobile responsiveness...');
        
        // Show multiple notifications to test stacking
        this.notificationManager.info('Mobile test 1: Short message');
        
        setTimeout(() => {
            this.notificationManager.warning('Mobile test 2: This is a longer message to test how notifications behave on smaller screens with limited width.');
        }, 300);

        setTimeout(() => {
            this.notificationManager.success('Mobile test 3: Another notification');
        }, 600);
    }

    /**
     * Test notification clearing
     */
    testNotificationClearing() {
        console.log('Testing notification clearing...');
        
        // Show multiple notifications
        this.notificationManager.info('Notification 1');
        this.notificationManager.warning('Notification 2');
        this.notificationManager.error('Notification 3');
        
        // Clear all after 3 seconds
        setTimeout(() => {
            console.log('Clearing all notifications...');
            this.notificationManager.clearAll();
        }, 3000);
    }

    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('🧪 Starting comprehensive notification system tests...');
        
        // Test 1: Toast notifications
        console.log('\n1. Testing toast notifications...');
        this.testToastNotifications();
        
        // Wait a bit before next test
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Test 2: Alert modal
        console.log('\n2. Testing alert modal...');
        await this.testAlertModal();
        
        // Test 3: Confirmation modal
        console.log('\n3. Testing confirmation modal...');
        const confirmResult = await this.testConfirmModal();
        
        if (confirmResult) {
            // Test 4: Prompt modal (only if user confirmed)
            console.log('\n4. Testing prompt modal...');
            await this.testPromptModal();
        }
        
        // Test 5: Error scenarios
        console.log('\n5. Testing error scenarios...');
        this.testErrorScenarios();
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Test 6: Mobile responsiveness
        console.log('\n6. Testing mobile responsiveness...');
        this.testMobileResponsiveness();
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test 7: Notification clearing
        console.log('\n7. Testing notification clearing...');
        this.testNotificationClearing();
        
        console.log('\n✅ All notification tests completed!');
        
        // Final success message
        setTimeout(() => {
            this.notificationManager.success('All notification system tests completed successfully! 🎉');
        }, 4000);
    }

    /**
     * Create test buttons for manual testing
     */
    createTestInterface() {
        // Check if test interface already exists
        if (document.getElementById('notification-test-interface')) {
            return;
        }

        const testInterface = document.createElement('div');
        testInterface.id = 'notification-test-interface';
        testInterface.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 9998;
            font-family: 'Segoe UI', sans-serif;
            max-width: 300px;
        `;

        testInterface.innerHTML = `
            <h4 style="margin: 0 0 12px 0; color: #374151; font-size: 14px;">Notification Tests</h4>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <button id="test-toasts" style="padding: 6px 12px; border: 1px solid #d1d5db; border-radius: 4px; background: white; cursor: pointer; font-size: 12px;">Test Toasts</button>
                <button id="test-alert" style="padding: 6px 12px; border: 1px solid #d1d5db; border-radius: 4px; background: white; cursor: pointer; font-size: 12px;">Test Alert</button>
                <button id="test-confirm" style="padding: 6px 12px; border: 1px solid #d1d5db; border-radius: 4px; background: white; cursor: pointer; font-size: 12px;">Test Confirm</button>
                <button id="test-prompt" style="padding: 6px 12px; border: 1px solid #d1d5db; border-radius: 4px; background: white; cursor: pointer; font-size: 12px;">Test Prompt</button>
                <button id="test-errors" style="padding: 6px 12px; border: 1px solid #d1d5db; border-radius: 4px; background: white; cursor: pointer; font-size: 12px;">Test Errors</button>
                <button id="test-all" style="padding: 6px 12px; border: 1px solid #3b82f6; border-radius: 4px; background: #3b82f6; color: white; cursor: pointer; font-size: 12px; font-weight: 500;">Run All Tests</button>
                <button id="close-tests" style="padding: 6px 12px; border: 1px solid #ef4444; border-radius: 4px; background: #ef4444; color: white; cursor: pointer; font-size: 12px;">Close</button>
            </div>
        `;

        // Add event listeners
        testInterface.querySelector('#test-toasts').addEventListener('click', () => this.testToastNotifications());
        testInterface.querySelector('#test-alert').addEventListener('click', () => this.testAlertModal());
        testInterface.querySelector('#test-confirm').addEventListener('click', () => this.testConfirmModal());
        testInterface.querySelector('#test-prompt').addEventListener('click', () => this.testPromptModal());
        testInterface.querySelector('#test-errors').addEventListener('click', () => this.testErrorScenarios());
        testInterface.querySelector('#test-all').addEventListener('click', () => this.runAllTests());
        testInterface.querySelector('#close-tests').addEventListener('click', () => testInterface.remove());

        document.body.appendChild(testInterface);
    }
}

// Global function to create test interface (for console access only)
window.createNotificationTests = function() {
    if (window.forumApp && window.forumApp.getNotificationManager) {
        const tester = new NotificationTester(window.forumApp.getNotificationManager());
        tester.createTestInterface();
        console.log('Notification test interface created! You can also run: window.testNotifications()');

        // Make tester globally available
        window.notificationTester = tester;
        window.testNotifications = () => tester.runAllTests();
    } else {
        console.error('Forum app or notification manager not available');
    }
};

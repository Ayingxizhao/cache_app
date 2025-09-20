/**
 * Notification System Component
 * Provides toast notifications, alerts, and user feedback
 */

class NotificationSystem {
    constructor() {
        this.notifications = new Map();
        this.container = null;
        this.maxNotifications = 5;
        this.defaultDuration = 5000; // 5 seconds
        this.init();
    }

    init() {
        this.createContainer();
        this.setupStyles();
        this.setupEventListeners();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
    }

    setupStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                pointer-events: none;
            }

            .notification {
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                margin-bottom: 12px;
                padding: 16px;
                pointer-events: auto;
                transform: translateX(100%);
                transition: all 0.3s ease;
                border-left: 4px solid #e5e7eb;
                position: relative;
                overflow: hidden;
            }

            .notification.show {
                transform: translateX(0);
            }

            .notification.success {
                border-left-color: #10b981;
            }

            .notification.info {
                border-left-color: #3b82f6;
            }

            .notification.warning {
                border-left-color: #f59e0b;
            }

            .notification.error {
                border-left-color: #ef4444;
            }

            .notification.progress {
                border-left-color: #8b5cf6;
            }

            .notification-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 8px;
            }

            .notification-title {
                font-weight: 600;
                font-size: 14px;
                color: #111827;
                margin: 0;
            }

            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                padding: 0;
                margin-left: 8px;
                color: #6b7280;
                font-size: 18px;
                line-height: 1;
            }

            .notification-close:hover {
                color: #374151;
            }

            .notification-message {
                font-size: 13px;
                color: #4b5563;
                margin: 0 0 8px 0;
                line-height: 1.4;
            }

            .notification-details {
                font-size: 12px;
                color: #6b7280;
                margin: 0 0 8px 0;
                line-height: 1.3;
            }

            .notification-progress {
                margin: 8px 0;
            }

            .notification-progress-bar {
                width: 100%;
                height: 4px;
                background: #e5e7eb;
                border-radius: 2px;
                overflow: hidden;
            }

            .notification-progress-fill {
                height: 100%;
                background: #3b82f6;
                transition: width 0.3s ease;
                border-radius: 2px;
            }

            .notification-progress-text {
                font-size: 11px;
                color: #6b7280;
                margin-top: 4px;
            }

            .notification-actions {
                display: flex;
                gap: 8px;
                margin-top: 12px;
            }

            .notification-action {
                padding: 6px 12px;
                border: none;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .notification-action.primary {
                background: #3b82f6;
                color: white;
            }

            .notification-action.primary:hover {
                background: #2563eb;
            }

            .notification-action.secondary {
                background: #f3f4f6;
                color: #374151;
            }

            .notification-action.secondary:hover {
                background: #e5e7eb;
            }

            .notification-action.danger {
                background: #ef4444;
                color: white;
            }

            .notification-action.danger:hover {
                background: #dc2626;
            }

            .notification-action.success {
                background: #10b981;
                color: white;
            }

            .notification-action.success:hover {
                background: #059669;
            }

            .notification-icon {
                display: inline-block;
                width: 20px;
                height: 20px;
                margin-right: 8px;
                vertical-align: middle;
            }

            .notification-icon.success::before {
                content: "✓";
                color: #10b981;
                font-weight: bold;
            }

            .notification-icon.info::before {
                content: "ℹ";
                color: #3b82f6;
                font-weight: bold;
            }

            .notification-icon.warning::before {
                content: "⚠";
                color: #f59e0b;
                font-weight: bold;
            }

            .notification-icon.error::before {
                content: "✕";
                color: #ef4444;
                font-weight: bold;
            }

            .notification-icon.progress::before {
                content: "⟳";
                color: #8b5cf6;
                font-weight: bold;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            .notification-fade-out {
                opacity: 0;
                transform: translateX(100%);
            }

            @media (max-width: 480px) {
                .notification-container {
                    left: 10px;
                    right: 10px;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Listen for custom notification events
        document.addEventListener('showNotification', (event) => {
            this.show(event.detail);
        });

        document.addEventListener('updateNotification', (event) => {
            this.update(event.detail.id, event.detail.updates);
        });

        document.addEventListener('dismissNotification', (event) => {
            this.dismiss(event.detail.id);
        });
    }

    show(options) {
        const notification = this.createNotification(options);
        this.notifications.set(notification.id, notification);
        this.container.appendChild(notification.element);
        
        // Trigger show animation
        setTimeout(() => {
            notification.element.classList.add('show');
        }, 10);

        // Auto-dismiss if not persistent
        if (!notification.persistent && notification.duration > 0) {
            setTimeout(() => {
                this.dismiss(notification.id);
            }, notification.duration);
        }

        // Limit number of notifications
        this.limitNotifications();

        return notification.id;
    }

    createNotification(options) {
        const id = options.id || this.generateId();
        const element = document.createElement('div');
        element.className = `notification ${options.type || 'info'}`;
        element.setAttribute('data-id', id);

        const icon = options.type ? `<span class="notification-icon ${options.type}"></span>` : '';
        
        element.innerHTML = `
            <div class="notification-header">
                <h4 class="notification-title">${icon}${options.title || 'Notification'}</h4>
                <button class="notification-close" onclick="notificationSystem.dismiss('${id}')">&times;</button>
            </div>
            ${options.message ? `<p class="notification-message">${options.message}</p>` : ''}
            ${options.details ? `<p class="notification-details">${options.details}</p>` : ''}
            ${options.progress ? this.createProgressHTML(options.progress) : ''}
            ${options.actions ? this.createActionsHTML(options.actions, id) : ''}
        `;

        return {
            id,
            element,
            type: options.type || 'info',
            title: options.title || 'Notification',
            message: options.message || '',
            details: options.details || '',
            progress: options.progress || null,
            actions: options.actions || [],
            persistent: options.persistent || false,
            duration: options.duration || this.defaultDuration,
            timestamp: Date.now()
        };
    }

    createProgressHTML(progress) {
        const percent = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;
        return `
            <div class="notification-progress">
                <div class="notification-progress-bar">
                    <div class="notification-progress-fill" style="width: ${percent}%"></div>
                </div>
                <div class="notification-progress-text">
                    ${progress.current}/${progress.total} (${Math.round(percent)}%) - ${progress.status || 'In progress'}
                </div>
            </div>
        `;
    }

    createActionsHTML(actions, notificationId) {
        const actionsHTML = actions.map(action => {
            const onclick = action.callback ? 
                `onclick="notificationSystem.handleAction('${notificationId}', '${action.id}', '${action.callback}')"` : 
                `onclick="notificationSystem.handleAction('${notificationId}', '${action.id}')"`;
            
            return `<button class="notification-action ${action.style || 'secondary'}" ${onclick}>${action.label}</button>`;
        }).join('');

        return `<div class="notification-actions">${actionsHTML}</div>`;
    }

    update(id, updates) {
        const notification = this.notifications.get(id);
        if (!notification) return false;

        // Update notification data
        Object.assign(notification, updates);

        // Recreate the element with updated content
        const newElement = this.createNotification(notification);
        notification.element.parentNode.replaceChild(newElement.element, notification.element);
        notification.element = newElement.element;

        return true;
    }

    dismiss(id) {
        const notification = this.notifications.get(id);
        if (!notification) return false;

        // Add fade-out animation
        notification.element.classList.add('notification-fade-out');
        
        setTimeout(() => {
            if (notification.element.parentNode) {
                notification.element.parentNode.removeChild(notification.element);
            }
            this.notifications.delete(id);
        }, 300);

        return true;
    }

    dismissAll() {
        this.notifications.forEach((notification, id) => {
            this.dismiss(id);
        });
    }

    handleAction(notificationId, actionId, callback) {
        const notification = this.notifications.get(notificationId);
        if (!notification) return;

        // Emit custom event for action handling
        const event = new CustomEvent('notificationAction', {
            detail: {
                notificationId,
                actionId,
                callback,
                notification: notification
            }
        });
        document.dispatchEvent(event);

        // If callback is provided, execute it
        if (callback && typeof window[callback] === 'function') {
            window[callback](notificationId, actionId);
        }
    }

    limitNotifications() {
        if (this.notifications.size > this.maxNotifications) {
            const oldestNotification = Array.from(this.notifications.values())
                .sort((a, b) => a.timestamp - b.timestamp)[0];
            this.dismiss(oldestNotification.id);
        }
    }

    generateId() {
        return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Convenience methods for common notification types
    success(title, message, options = {}) {
        return this.show({
            type: 'success',
            title,
            message,
            duration: 3000,
            ...options
        });
    }

    info(title, message, options = {}) {
        return this.show({
            type: 'info',
            title,
            message,
            duration: 5000,
            ...options
        });
    }

    warning(title, message, options = {}) {
        return this.show({
            type: 'warning',
            title,
            message,
            duration: 7000,
            ...options
        });
    }

    error(title, message, options = {}) {
        return this.show({
            type: 'error',
            title,
            message,
            persistent: true,
            ...options
        });
    }

    progress(title, message, total, options = {}) {
        return this.show({
            type: 'progress',
            title,
            message,
            progress: {
                current: 0,
                total,
                percent: 0,
                status: 'Starting...'
            },
            persistent: true,
            ...options
        });
    }

    // Update progress notification
    updateProgress(id, current, status) {
        const notification = this.notifications.get(id);
        if (!notification || !notification.progress) return false;

        const progress = {
            current,
            total: notification.progress.total,
            percent: notification.progress.total > 0 ? (current / notification.progress.total) * 100 : 0,
            status: status || notification.progress.status
        };

        return this.update(id, { progress });
    }

    // Complete progress notification
    completeProgress(id, message) {
        const updates = {
            type: 'success',
            title: message || 'Operation completed',
            message: 'Operation completed successfully',
            persistent: false,
            progress: {
                current: this.notifications.get(id)?.progress?.total || 100,
                total: this.notifications.get(id)?.progress?.total || 100,
                percent: 100,
                status: 'Completed'
            }
        };

        this.update(id, updates);
        
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            this.dismiss(id);
        }, 3000);
    }

    // Fail progress notification
    failProgress(id, message) {
        const updates = {
            type: 'error',
            title: message || 'Operation failed',
            message: 'Operation failed',
            persistent: true,
            progress: {
                status: 'Failed'
            }
        };

        this.update(id, updates);
    }

    // Get all active notifications
    getAll() {
        return Array.from(this.notifications.values());
    }

    // Get notifications by type
    getByType(type) {
        return Array.from(this.notifications.values()).filter(n => n.type === type);
    }

    // Get notification count
    getCount() {
        return this.notifications.size;
    }
}

// Global notification system instance
const notificationSystem = new NotificationSystem();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSystem;
}

// Global functions for easy access
window.showNotification = (options) => notificationSystem.show(options);
window.showSuccess = (title, message, options) => notificationSystem.success(title, message, options);
window.showInfo = (title, message, options) => notificationSystem.info(title, message, options);
window.showWarning = (title, message, options) => notificationSystem.warning(title, message, options);
window.showError = (title, message, options) => notificationSystem.error(title, message, options);
window.showProgress = (title, message, total, options) => notificationSystem.progress(title, message, total, options);
window.updateProgress = (id, current, status) => notificationSystem.updateProgress(id, current, status);
window.completeProgress = (id, message) => notificationSystem.completeProgress(id, message);
window.failProgress = (id, message) => notificationSystem.failProgress(id, message);
window.dismissNotification = (id) => notificationSystem.dismiss(id);
window.dismissAllNotifications = () => notificationSystem.dismissAll();

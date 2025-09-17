// Notification System for Cache App
class NotificationSystem {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.defaultDuration = 5000;
        this.maxNotifications = 5;
    }
    
    createContainer() {
        if (this.container) return this.container;
        
        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        this.container.innerHTML = `
            <div class="notification-stack"></div>
        `;
        
        document.body.appendChild(this.container);
        return this.container;
    }
    
    show(notification) {
        this.createContainer();
        
        const id = notification.id || this.generateId();
        const duration = notification.duration || this.defaultDuration;
        
        const notificationElement = this.createNotificationElement(id, notification);
        const stack = this.container.querySelector('.notification-stack');
        
        // Remove oldest notifications if we exceed max
        while (stack.children.length >= this.maxNotifications) {
            const oldest = stack.firstChild;
            this.remove(oldest.dataset.id);
        }
        
        stack.appendChild(notificationElement);
        this.notifications.set(id, notificationElement);
        
        // Animate in
        requestAnimationFrame(() => {
            notificationElement.classList.add('show');
        });
        
        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.remove(id);
            }, duration);
        }
        
        return id;
    }
    
    createNotificationElement(id, notification) {
        const element = document.createElement('div');
        element.className = `notification notification-${notification.type || 'info'}`;
        element.dataset.id = id;
        
        const icon = this.getIcon(notification.type);
        const title = notification.title || this.getDefaultTitle(notification.type);
        
        element.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${icon}</div>
                <div class="notification-body">
                    <div class="notification-title">${title}</div>
                    <div class="notification-message">${notification.message}</div>
                    ${notification.details ? `<div class="notification-details">${notification.details}</div>` : ''}
                </div>
                <button class="notification-close" onclick="notificationSystem.remove('${id}')">
                    <span>×</span>
                </button>
            </div>
            <div class="notification-progress"></div>
        `;
        
        // Add click handler for close button
        element.querySelector('.notification-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.remove(id);
        });
        
        // Add click handler for notification body (if it's clickable)
        if (notification.onClick) {
            element.style.cursor = 'pointer';
            element.addEventListener('click', () => {
                notification.onClick();
                this.remove(id);
            });
        }
        
        return element;
    }
    
    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            loading: '⏳',
            scan: '🔍',
            backup: '💾',
            delete: '🗑️',
            restore: '🔄'
        };
        return icons[type] || icons.info;
    }
    
    getDefaultTitle(type) {
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Information',
            loading: 'Loading',
            scan: 'Scan',
            backup: 'Backup',
            delete: 'Delete',
            restore: 'Restore'
        };
        return titles[type] || 'Notification';
    }
    
    remove(id) {
        const element = this.notifications.get(id);
        if (!element) return;
        
        element.classList.add('hide');
        
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.notifications.delete(id);
        }, 300); // Match CSS transition duration
    }
    
    removeAll() {
        this.notifications.forEach((element, id) => {
            this.remove(id);
        });
    }
    
    generateId() {
        return 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Convenience methods
    success(message, options = {}) {
        return this.show({
            type: 'success',
            message,
            duration: 3000,
            ...options
        });
    }
    
    error(message, options = {}) {
        return this.show({
            type: 'error',
            message,
            duration: 8000,
            ...options
        });
    }
    
    warning(message, options = {}) {
        return this.show({
            type: 'warning',
            message,
            duration: 5000,
            ...options
        });
    }
    
    info(message, options = {}) {
        return this.show({
            type: 'info',
            message,
            duration: 4000,
            ...options
        });
    }
    
    loading(message, options = {}) {
        return this.show({
            type: 'loading',
            message,
            duration: 0, // Don't auto-remove loading notifications
            ...options
        });
    }
    
    // Progress notifications
    showProgress(id, title, message, progress = 0) {
        const notification = this.notifications.get(id);
        if (notification) {
            // Update existing notification
            const progressBar = notification.querySelector('.notification-progress');
            const messageEl = notification.querySelector('.notification-message');
            
            progressBar.style.width = `${progress}%`;
            messageEl.textContent = message;
        } else {
            // Create new progress notification
            return this.show({
                id,
                type: 'loading',
                title,
                message,
                duration: 0,
                progress
            });
        }
    }
    
    completeProgress(id, message, type = 'success') {
        const notification = this.notifications.get(id);
        if (notification) {
            notification.className = `notification notification-${type}`;
            notification.querySelector('.notification-icon').textContent = this.getIcon(type);
            notification.querySelector('.notification-message').textContent = message;
            
            // Auto-remove after success
            setTimeout(() => {
                this.remove(id);
            }, 3000);
        }
    }
    
    // Toast-style notifications
    toast(message, type = 'info', duration = 3000) {
        return this.show({
            type,
            message,
            duration,
            title: null // No title for toast
        });
    }
    
    // Action notifications with buttons
    showAction(title, message, actions = []) {
        const id = this.generateId();
        const element = this.createNotificationElement(id, {
            type: 'info',
            title,
            message,
            duration: 0
        });
        
        // Add action buttons
        if (actions.length > 0) {
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'notification-actions';
            
            actions.forEach(action => {
                const button = document.createElement('button');
                button.className = `btn btn-sm ${action.class || 'btn-outline'}`;
                button.textContent = action.text;
                button.addEventListener('click', () => {
                    if (action.handler) {
                        action.handler();
                    }
                    this.remove(id);
                });
                actionsContainer.appendChild(button);
            });
            
            element.querySelector('.notification-body').appendChild(actionsContainer);
        }
        
        const stack = this.container.querySelector('.notification-stack');
        stack.appendChild(element);
        this.notifications.set(id, element);
        
        requestAnimationFrame(() => {
            element.classList.add('show');
        });
        
        return id;
    }
}

// Create global notification system instance
window.notificationSystem = new NotificationSystem();

// Export for use in other modules
export { NotificationSystem };
window.NotificationSystem = NotificationSystem;

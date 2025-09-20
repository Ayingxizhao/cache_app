/**
 * Loading State Component
 * Provides loading indicators, progress bars, and loading states
 */

class LoadingManager {
    constructor() {
        this.loadingStates = new Map();
        this.overlays = new Map();
        this.progressBars = new Map();
        this.init();
    }

    init() {
        this.setupStyles();
        this.setupEventListeners();
    }

    setupStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .loading-overlay.show {
                opacity: 1;
                visibility: visible;
            }

            .loading-content {
                background: white;
                border-radius: 12px;
                padding: 24px;
                text-align: center;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                max-width: 400px;
                width: 90%;
            }

            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #e5e7eb;
                border-top: 4px solid #3b82f6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 16px;
            }

            .loading-spinner.small {
                width: 20px;
                height: 20px;
                border-width: 2px;
                margin: 0 auto 8px;
            }

            .loading-spinner.large {
                width: 60px;
                height: 60px;
                border-width: 6px;
                margin: 0 auto 24px;
            }

            .loading-text {
                font-size: 16px;
                font-weight: 500;
                color: #374151;
                margin: 0 0 8px 0;
            }

            .loading-subtext {
                font-size: 14px;
                color: #6b7280;
                margin: 0;
            }

            .loading-progress {
                margin: 16px 0;
            }

            .loading-progress-bar {
                width: 100%;
                height: 8px;
                background: #e5e7eb;
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 8px;
            }

            .loading-progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #3b82f6, #1d4ed8);
                transition: width 0.3s ease;
                border-radius: 4px;
            }

            .loading-progress-text {
                font-size: 12px;
                color: #6b7280;
                text-align: center;
            }

            .loading-actions {
                margin-top: 16px;
                display: flex;
                gap: 8px;
                justify-content: center;
            }

            .loading-action {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .loading-action.secondary {
                background: #f3f4f6;
                color: #374151;
            }

            .loading-action.secondary:hover {
                background: #e5e7eb;
            }

            .loading-action.danger {
                background: #ef4444;
                color: white;
            }

            .loading-action.danger:hover {
                background: #dc2626;
            }

            .loading-inline {
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }

            .loading-inline .loading-spinner {
                margin: 0;
                width: 16px;
                height: 16px;
                border-width: 2px;
            }

            .loading-inline .loading-text {
                margin: 0;
                font-size: 14px;
            }

            .loading-button {
                position: relative;
                overflow: hidden;
            }

            .loading-button .loading-spinner {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                margin: 0;
                width: 16px;
                height: 16px;
                border-width: 2px;
            }

            .loading-button.loading .button-text {
                opacity: 0;
            }

            .loading-button.loading .loading-spinner {
                opacity: 1;
            }

            .loading-button .loading-spinner {
                opacity: 0;
                transition: opacity 0.2s ease;
            }

            .loading-skeleton {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: skeleton-loading 1.5s infinite;
                border-radius: 4px;
            }

            .loading-skeleton.text {
                height: 16px;
                margin: 4px 0;
            }

            .loading-skeleton.title {
                height: 24px;
                margin: 8px 0;
            }

            .loading-skeleton.paragraph {
                height: 14px;
                margin: 6px 0;
            }

            .loading-skeleton.button {
                height: 36px;
                width: 100px;
            }

            .loading-skeleton.card {
                height: 200px;
                border-radius: 8px;
            }

            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            @keyframes skeleton-loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }

            .loading-dots {
                display: inline-flex;
                gap: 4px;
            }

            .loading-dots .dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #3b82f6;
                animation: loading-dots 1.4s infinite ease-in-out;
            }

            .loading-dots .dot:nth-child(1) { animation-delay: -0.32s; }
            .loading-dots .dot:nth-child(2) { animation-delay: -0.16s; }

            @keyframes loading-dots {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1); }
            }

            .loading-pulse {
                animation: loading-pulse 2s infinite;
            }

            @keyframes loading-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            @media (max-width: 480px) {
                .loading-content {
                    margin: 20px;
                    padding: 20px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Listen for custom loading events
        document.addEventListener('showLoading', (event) => {
            this.show(event.detail);
        });

        document.addEventListener('updateLoading', (event) => {
            this.update(event.detail.id, event.detail.updates);
        });

        document.addEventListener('hideLoading', (event) => {
            this.hide(event.detail.id);
        });
    }

    show(options) {
        const id = options.id || this.generateId();
        const overlay = this.createOverlay(id, options);
        
        this.overlays.set(id, overlay);
        document.body.appendChild(overlay.element);
        
        // Trigger show animation
        setTimeout(() => {
            overlay.element.classList.add('show');
        }, 10);

        return id;
    }

    createOverlay(id, options) {
        const element = document.createElement('div');
        element.className = 'loading-overlay';
        element.setAttribute('data-loading-id', id);

        const spinnerSize = options.spinnerSize || 'medium';
        const spinnerClass = `loading-spinner ${spinnerSize}`;
        
        let progressHTML = '';
        if (options.progress) {
            progressHTML = this.createProgressHTML(options.progress);
        }

        let actionsHTML = '';
        if (options.actions) {
            actionsHTML = this.createActionsHTML(options.actions, id);
        }

        element.innerHTML = `
            <div class="loading-content">
                <div class="${spinnerClass}"></div>
                <h3 class="loading-text">${options.title || 'Loading...'}</h3>
                ${options.message ? `<p class="loading-subtext">${options.message}</p>` : ''}
                ${progressHTML}
                ${actionsHTML}
            </div>
        `;

        return {
            id,
            element,
            title: options.title || 'Loading...',
            message: options.message || '',
            progress: options.progress || null,
            actions: options.actions || [],
            cancellable: options.cancellable || false,
            timestamp: Date.now()
        };
    }

    createProgressHTML(progress) {
        const percent = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;
        return `
            <div class="loading-progress">
                <div class="loading-progress-bar">
                    <div class="loading-progress-fill" style="width: ${percent}%"></div>
                </div>
                <div class="loading-progress-text">
                    ${progress.current}/${progress.total} (${Math.round(percent)}%) - ${progress.status || 'In progress'}
                </div>
            </div>
        `;
    }

    createActionsHTML(actions, loadingId) {
        const actionsHTML = actions.map(action => {
            const onclick = action.callback ? 
                `onclick="loadingManager.handleAction('${loadingId}', '${action.id}', '${action.callback}')"` : 
                `onclick="loadingManager.handleAction('${loadingId}', '${action.id}')"`;
            
            return `<button class="loading-action ${action.style || 'secondary'}" ${onclick}>${action.label}</button>`;
        }).join('');

        return `<div class="loading-actions">${actionsHTML}</div>`;
    }

    update(id, updates) {
        const overlay = this.overlays.get(id);
        if (!overlay) return false;

        // Update overlay data
        Object.assign(overlay, updates);

        // Update the element content
        const content = overlay.element.querySelector('.loading-content');
        if (content) {
            const spinnerSize = updates.spinnerSize || 'medium';
            const spinnerClass = `loading-spinner ${spinnerSize}`;
            
            let progressHTML = '';
            if (overlay.progress) {
                progressHTML = this.createProgressHTML(overlay.progress);
            }

            let actionsHTML = '';
            if (overlay.actions) {
                actionsHTML = this.createActionsHTML(overlay.actions, id);
            }

            content.innerHTML = `
                <div class="${spinnerClass}"></div>
                <h3 class="loading-text">${overlay.title}</h3>
                ${overlay.message ? `<p class="loading-subtext">${overlay.message}</p>` : ''}
                ${progressHTML}
                ${actionsHTML}
            `;
        }

        return true;
    }

    hide(id) {
        const overlay = this.overlays.get(id);
        if (!overlay) return false;

        overlay.element.classList.remove('show');
        
        setTimeout(() => {
            if (overlay.element.parentNode) {
                overlay.element.parentNode.removeChild(overlay.element);
            }
            this.overlays.delete(id);
        }, 300);

        return true;
    }

    hideAll() {
        this.overlays.forEach((overlay, id) => {
            this.hide(id);
        });
    }

    handleAction(loadingId, actionId, callback) {
        const overlay = this.overlays.get(loadingId);
        if (!overlay) return;

        // Emit custom event for action handling
        const event = new CustomEvent('loadingAction', {
            detail: {
                loadingId,
                actionId,
                callback,
                overlay: overlay
            }
        });
        document.dispatchEvent(event);

        // If callback is provided, execute it
        if (callback && typeof window[callback] === 'function') {
            window[callback](loadingId, actionId);
        }
    }

    // Progress management
    showProgress(title, message, total, options = {}) {
        return this.show({
            title,
            message,
            progress: {
                current: 0,
                total,
                percent: 0,
                status: 'Starting...'
            },
            cancellable: options.cancellable || false,
            ...options
        });
    }

    updateProgress(id, current, status) {
        const overlay = this.overlays.get(id);
        if (!overlay || !overlay.progress) return false;

        const progress = {
            current,
            total: overlay.progress.total,
            percent: overlay.progress.total > 0 ? (current / overlay.progress.total) * 100 : 0,
            status: status || overlay.progress.status
        };

        return this.update(id, { progress });
    }

    completeProgress(id, message) {
        const updates = {
            title: message || 'Operation completed',
            message: 'Operation completed successfully',
            progress: {
                current: this.overlays.get(id)?.progress?.total || 100,
                total: this.overlays.get(id)?.progress?.total || 100,
                percent: 100,
                status: 'Completed'
            }
        };

        this.update(id, updates);
        
        // Auto-hide after 2 seconds
        setTimeout(() => {
            this.hide(id);
        }, 2000);
    }

    failProgress(id, message) {
        const updates = {
            title: message || 'Operation failed',
            message: 'Operation failed',
            progress: {
                status: 'Failed'
            }
        };

        this.update(id, updates);
    }

    // Inline loading states
    showInline(element, text = 'Loading...') {
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading-inline';
        loadingElement.innerHTML = `
            <div class="loading-spinner"></div>
            <span class="loading-text">${text}</span>
        `;
        
        element.style.position = 'relative';
        element.appendChild(loadingElement);
        
        return loadingElement;
    }

    hideInline(loadingElement) {
        if (loadingElement && loadingElement.parentNode) {
            loadingElement.parentNode.removeChild(loadingElement);
        }
    }

    // Button loading states
    setButtonLoading(button, loading = true) {
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
            
            if (!button.querySelector('.loading-spinner')) {
                const spinner = document.createElement('div');
                spinner.className = 'loading-spinner';
                button.appendChild(spinner);
            }
        } else {
            button.classList.remove('loading');
            button.disabled = false;
            
            const spinner = button.querySelector('.loading-spinner');
            if (spinner) {
                spinner.remove();
            }
        }
    }

    // Skeleton loading
    createSkeleton(type, className = '') {
        const skeleton = document.createElement('div');
        skeleton.className = `loading-skeleton ${type} ${className}`;
        return skeleton;
    }

    showSkeleton(container, skeletonConfig) {
        container.innerHTML = '';
        
        skeletonConfig.forEach(config => {
            const skeleton = this.createSkeleton(config.type, config.className);
            if (config.width) {
                skeleton.style.width = config.width;
            }
            if (config.height) {
                skeleton.style.height = config.height;
            }
            container.appendChild(skeleton);
        });
    }

    hideSkeleton(container) {
        const skeletons = container.querySelectorAll('.loading-skeleton');
        skeletons.forEach(skeleton => skeleton.remove());
    }

    // Loading dots animation
    createLoadingDots() {
        const dots = document.createElement('div');
        dots.className = 'loading-dots';
        dots.innerHTML = `
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        `;
        return dots;
    }

    // Pulse animation
    addPulse(element) {
        element.classList.add('loading-pulse');
    }

    removePulse(element) {
        element.classList.remove('loading-pulse');
    }

    generateId() {
        return 'loading_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Get all active loading states
    getAll() {
        return Array.from(this.overlays.values());
    }

    // Get loading count
    getCount() {
        return this.overlays.size;
    }

    // Check if loading
    isLoading(id = null) {
        if (id) {
            return this.overlays.has(id);
        }
        return this.overlays.size > 0;
    }
}

// Global loading manager instance
const loadingManager = new LoadingManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingManager;
}

// Global functions for easy access
window.showLoading = (options) => loadingManager.show(options);
window.hideLoading = (id) => loadingManager.hide(id);
window.showProgress = (title, message, total, options) => loadingManager.showProgress(title, message, total, options);
window.updateProgress = (id, current, status) => loadingManager.updateProgress(id, current, status);
window.completeProgress = (id, message) => loadingManager.completeProgress(id, message);
window.failProgress = (id, message) => loadingManager.failProgress(id, message);
window.setButtonLoading = (button, loading) => loadingManager.setButtonLoading(button, loading);
window.showSkeleton = (container, config) => loadingManager.showSkeleton(container, config);
window.hideSkeleton = (container) => loadingManager.hideSkeleton(container);
window.addPulse = (element) => loadingManager.addPulse(element);
window.removePulse = (element) => loadingManager.removePulse(element);

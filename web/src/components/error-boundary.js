/**
 * Error Boundary Component
 * Provides error handling and recovery mechanisms for JavaScript errors
 */

class ErrorBoundary {
    constructor(options = {}) {
        this.options = {
            onError: options.onError || this.defaultErrorHandler,
            onRecover: options.onRecover || this.defaultRecoverHandler,
            fallbackUI: options.fallbackUI || this.defaultFallbackUI,
            retryAttempts: options.retryAttempts || 3,
            retryDelay: options.retryDelay || 1000,
            logErrors: options.logErrors !== false,
            showErrorUI: options.showErrorUI !== false,
            ...options
        };
        
        this.errorCount = 0;
        this.lastError = null;
        this.retryCount = 0;
        this.isRecovering = false;
        
        this.init();
    }

    init() {
        this.setupGlobalErrorHandlers();
        this.setupStyles();
        this.setupEventListeners();
    }

    setupGlobalErrorHandlers() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.handleError(event.error, {
                type: 'javascript',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                message: event.message
            });
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, {
                type: 'promise',
                message: event.reason?.message || 'Unhandled promise rejection'
            });
        });
    }

    setupStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .error-boundary {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .error-boundary.show {
                opacity: 1;
                visibility: visible;
            }

            .error-boundary-content {
                background: white;
                border-radius: 12px;
                padding: 24px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                text-align: center;
            }

            .error-boundary-icon {
                width: 64px;
                height: 64px;
                background: #fee2e2;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 16px;
                font-size: 32px;
                color: #dc2626;
            }

            .error-boundary-title {
                font-size: 20px;
                font-weight: 600;
                color: #111827;
                margin: 0 0 8px 0;
            }

            .error-boundary-message {
                font-size: 14px;
                color: #6b7280;
                margin: 0 0 16px 0;
                line-height: 1.5;
            }

            .error-boundary-details {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 12px;
                margin: 16px 0;
                text-align: left;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 12px;
                color: #374151;
                max-height: 200px;
                overflow-y: auto;
            }

            .error-boundary-actions {
                display: flex;
                gap: 12px;
                justify-content: center;
                margin-top: 20px;
            }

            .error-boundary-action {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .error-boundary-action.primary {
                background: #3b82f6;
                color: white;
            }

            .error-boundary-action.primary:hover {
                background: #2563eb;
            }

            .error-boundary-action.secondary {
                background: #f3f4f6;
                color: #374151;
            }

            .error-boundary-action.secondary:hover {
                background: #e5e7eb;
            }

            .error-boundary-action.danger {
                background: #ef4444;
                color: white;
            }

            .error-boundary-action.danger:hover {
                background: #dc2626;
            }

            .error-boundary-retry {
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }

            .error-boundary-retry .loading-spinner {
                width: 16px;
                height: 16px;
                border: 2px solid #e5e7eb;
                border-top: 2px solid #3b82f6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            .error-boundary-inline {
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 6px;
                padding: 12px;
                margin: 8px 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .error-boundary-inline-icon {
                color: #dc2626;
                font-size: 16px;
            }

            .error-boundary-inline-message {
                color: #991b1b;
                font-size: 14px;
                flex: 1;
            }

            .error-boundary-inline-action {
                background: none;
                border: none;
                color: #dc2626;
                cursor: pointer;
                font-size: 12px;
                text-decoration: underline;
            }

            .error-boundary-inline-action:hover {
                color: #991b1b;
            }

            .error-boundary-stack {
                background: #1f2937;
                color: #f9fafb;
                border-radius: 6px;
                padding: 12px;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 11px;
                line-height: 1.4;
                text-align: left;
                max-height: 300px;
                overflow-y: auto;
                margin: 12px 0;
            }

            .error-boundary-stack-line {
                margin: 2px 0;
            }

            .error-boundary-stack-line.current {
                background: #dc2626;
                color: white;
                padding: 2px 4px;
                border-radius: 2px;
            }

            .error-boundary-stack-line.function {
                color: #60a5fa;
            }

            .error-boundary-stack-line.file {
                color: #a78bfa;
            }

            .error-boundary-stack-line.line-number {
                color: #9ca3af;
            }

            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            @media (max-width: 480px) {
                .error-boundary-content {
                    margin: 20px;
                    padding: 20px;
                }

                .error-boundary-actions {
                    flex-direction: column;
                }

                .error-boundary-action {
                    width: 100%;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Listen for custom error events
        document.addEventListener('errorBoundaryError', (event) => {
            this.handleError(event.detail.error, event.detail.context);
        });

        document.addEventListener('errorBoundaryRecover', (event) => {
            this.handleRecover(event.detail);
        });
    }

    handleError(error, context = {}) {
        this.errorCount++;
        this.lastError = { error, context, timestamp: Date.now() };

        if (this.options.logErrors) {
            console.error('Error Boundary caught error:', error, context);
        }

        // Call custom error handler
        if (this.options.onError) {
            this.options.onError(error, context);
        }

        // Show error UI if enabled
        if (this.options.showErrorUI) {
            this.showErrorUI(error, context);
        }

        // Attempt recovery if configured
        if (this.options.retryAttempts > 0 && this.retryCount < this.options.retryAttempts) {
            setTimeout(() => {
                this.attemptRecovery();
            }, this.options.retryDelay);
        }
    }

    showErrorUI(error, context) {
        // Remove existing error UI
        this.hideErrorUI();

        const errorUI = this.createErrorUI(error, context);
        document.body.appendChild(errorUI);

        // Show with animation
        setTimeout(() => {
            errorUI.classList.add('show');
        }, 10);
    }

    createErrorUI(error, context) {
        const errorUI = document.createElement('div');
        errorUI.className = 'error-boundary';
        errorUI.setAttribute('data-error-boundary', 'true');

        const stackTrace = this.formatStackTrace(error);
        const errorDetails = this.formatErrorDetails(error, context);

        errorUI.innerHTML = `
            <div class="error-boundary-content">
                <div class="error-boundary-icon">⚠</div>
                <h2 class="error-boundary-title">Something went wrong</h2>
                <p class="error-boundary-message">
                    An unexpected error occurred. We're working to fix this issue.
                </p>
                ${errorDetails}
                ${stackTrace}
                <div class="error-boundary-actions">
                    <button class="error-boundary-action primary" onclick="errorBoundary.retry()">
                        <span class="error-boundary-retry">
                            <span class="retry-text">Try Again</span>
                        </span>
                    </button>
                    <button class="error-boundary-action secondary" onclick="errorBoundary.reload()">
                        Reload Page
                    </button>
                    <button class="error-boundary-action secondary" onclick="errorBoundary.hideErrorUI()">
                        Dismiss
                    </button>
                </div>
            </div>
        `;

        return errorUI;
    }

    formatErrorDetails(error, context) {
        const details = [];
        
        if (error.message) {
            details.push(`<strong>Error:</strong> ${error.message}`);
        }
        
        if (context.type) {
            details.push(`<strong>Type:</strong> ${context.type}`);
        }
        
        if (context.filename) {
            details.push(`<strong>File:</strong> ${context.filename}`);
        }
        
        if (context.lineno) {
            details.push(`<strong>Line:</strong> ${context.lineno}`);
        }
        
        if (context.colno) {
            details.push(`<strong>Column:</strong> ${context.colno}`);
        }
        
        if (context.url) {
            details.push(`<strong>URL:</strong> ${context.url}`);
        }
        
        if (context.userAgent) {
            details.push(`<strong>User Agent:</strong> ${context.userAgent}`);
        }

        if (details.length === 0) {
            return '';
        }

        return `
            <div class="error-boundary-details">
                ${details.join('<br>')}
            </div>
        `;
    }

    formatStackTrace(error) {
        if (!error.stack) {
            return '';
        }

        const stackLines = error.stack.split('\n').slice(1); // Remove error message line
        const formattedLines = stackLines.map(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('at ')) {
                const match = trimmed.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
                if (match) {
                    const [, functionName, file, line, column] = match;
                    return `
                        <div class="error-boundary-stack-line">
                            <span class="error-boundary-stack-line function">${functionName}</span>
                            <span class="error-boundary-stack-line file">${file}</span>
                            <span class="error-boundary-stack-line line-number">:${line}:${column}</span>
                        </div>
                    `;
                }
            }
            return `<div class="error-boundary-stack-line">${trimmed}</div>`;
        }).join('');

        return `
            <div class="error-boundary-stack">
                <strong>Stack Trace:</strong>
                ${formattedLines}
            </div>
        `;
    }

    hideErrorUI() {
        const existingUI = document.querySelector('[data-error-boundary="true"]');
        if (existingUI) {
            existingUI.classList.remove('show');
            setTimeout(() => {
                if (existingUI.parentNode) {
                    existingUI.parentNode.removeChild(existingUI);
                }
            }, 300);
        }
    }

    retry() {
        this.attemptRecovery();
    }

    reload() {
        window.location.reload();
    }

    attemptRecovery() {
        if (this.isRecovering) {
            return;
        }

        this.isRecovering = true;
        this.retryCount++;

        // Update retry button to show loading state
        const retryButton = document.querySelector('.error-boundary-action.primary');
        if (retryButton) {
            retryButton.innerHTML = `
                <span class="error-boundary-retry">
                    <div class="loading-spinner"></div>
                    <span class="retry-text">Retrying...</span>
                </span>
            `;
            retryButton.disabled = true;
        }

        // Call custom recovery handler
        if (this.options.onRecover) {
            this.options.onRecover(this.lastError, this.retryCount);
        }

        // Hide error UI
        setTimeout(() => {
            this.hideErrorUI();
            this.isRecovering = false;
        }, 1000);
    }

    // Inline error display
    showInlineError(container, error, options = {}) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-boundary-inline';
        
        const message = options.message || error.message || 'An error occurred';
        const showDetails = options.showDetails !== false;
        
        errorElement.innerHTML = `
            <span class="error-boundary-inline-icon">⚠</span>
            <span class="error-boundary-inline-message">${message}</span>
            ${showDetails ? `<button class="error-boundary-inline-action" onclick="errorBoundary.showErrorDetails('${error.message}')">Details</button>` : ''}
        `;
        
        container.appendChild(errorElement);
        
        return errorElement;
    }

    showErrorDetails(errorMessage) {
        // Show error details in a modal or notification
        if (typeof showError === 'function') {
            showError('Error Details', errorMessage);
        } else {
            alert(`Error Details: ${errorMessage}`);
        }
    }

    // Wrap functions with error handling
    wrapFunction(fn, context = {}) {
        return (...args) => {
            try {
                return fn.apply(this, args);
            } catch (error) {
                this.handleError(error, {
                    ...context,
                    function: fn.name || 'anonymous',
                    arguments: args
                });
                throw error;
            }
        };
    }

    // Wrap async functions with error handling
    wrapAsyncFunction(fn, context = {}) {
        return async (...args) => {
            try {
                return await fn.apply(this, args);
            } catch (error) {
                this.handleError(error, {
                    ...context,
                    function: fn.name || 'anonymous',
                    arguments: args
                });
                throw error;
            }
        };
    }

    // Default handlers
    defaultErrorHandler(error, context) {
        console.error('Error Boundary:', error, context);
    }

    defaultRecoverHandler(errorInfo, retryCount) {
        console.log(`Recovery attempt ${retryCount}:`, errorInfo);
    }

    defaultFallbackUI(error, context) {
        return `
            <div class="error-fallback">
                <h3>Something went wrong</h3>
                <p>Please try refreshing the page.</p>
            </div>
        `;
    }

    // Utility methods
    reset() {
        this.errorCount = 0;
        this.lastError = null;
        this.retryCount = 0;
        this.isRecovering = false;
        this.hideErrorUI();
    }

    getErrorCount() {
        return this.errorCount;
    }

    getLastError() {
        return this.lastError;
    }

    isInErrorState() {
        return this.errorCount > 0;
    }

    // Static methods for global error handling
    static setupGlobalErrorBoundary(options = {}) {
        if (!window.errorBoundary) {
            window.errorBoundary = new ErrorBoundary(options);
        }
        return window.errorBoundary;
    }

    static wrapComponent(component, errorBoundary) {
        return {
            ...component,
            componentDidCatch: (error, errorInfo) => {
                errorBoundary.handleError(error, {
                    ...errorInfo,
                    type: 'react'
                });
            }
        };
    }
}

// Global error boundary instance
const errorBoundary = new ErrorBoundary();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorBoundary;
}

// Global functions for easy access
window.handleError = (error, context) => errorBoundary.handleError(error, context);
window.showErrorUI = (error, context) => errorBoundary.showErrorUI(error, context);
window.hideErrorUI = () => errorBoundary.hideErrorUI();
window.wrapFunction = (fn, context) => errorBoundary.wrapFunction(fn, context);
window.wrapAsyncFunction = (fn, context) => errorBoundary.wrapAsyncFunction(fn, context);
window.showInlineError = (container, error, options) => errorBoundary.showInlineError(container, error, options);

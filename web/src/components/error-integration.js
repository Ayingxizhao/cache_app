/**
 * Error Integration Component
 * Demonstrates how to integrate the error handling system with cache operations
 */

class ErrorIntegration {
    constructor() {
        this.app = null; // Will be set when Wails app is available
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupErrorHandling();
    }

    setupEventListeners() {
        // Listen for Wails app events
        document.addEventListener('DOMContentLoaded', () => {
            // Wait for Wails app to be available
            this.waitForWailsApp();
        });

        // Listen for custom error events
        document.addEventListener('errorBoundaryError', (event) => {
            this.handleFrontendError(event.detail.error, event.detail.context);
        });

        // Listen for notification actions
        document.addEventListener('notificationAction', (event) => {
            this.handleNotificationAction(event.detail);
        });

        // Listen for loading actions
        document.addEventListener('loadingAction', (event) => {
            this.handleLoadingAction(event.detail);
        });
    }

    setupErrorHandling() {
        // Setup global error handling for API calls
        this.originalFetch = window.fetch;
        window.fetch = this.wrapFetch.bind(this);

        // Setup error handling for async operations
        this.setupAsyncErrorHandling();
    }

    async waitForWailsApp() {
        // Wait for Wails app to be available
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!window.go && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (window.go && window.go.main && window.go.main.App) {
            this.app = window.go.main.App;
            console.log('Wails app connected successfully');
            this.setupAppErrorHandling();
        } else {
            console.error('Failed to connect to Wails app');
            showError('Connection Error', 'Failed to connect to the application backend');
        }
    }

    setupAppErrorHandling() {
        // Wrap all app methods with error handling
        this.wrapAppMethods();
    }

    wrapAppMethods() {
        if (!this.app) return;

        // List of methods to wrap
        const methodsToWrap = [
            'ScanCacheLocation',
            'ScanMultipleCacheLocations',
            'GetCacheLocationsFromConfig',
            'BackupFiles',
            'DeleteFilesWithBackup',
            'RestoreSession',
            'GetBackupManifest',
            'GetSystemInfo',
            'GetErrorSummary',
            'GetNotificationSummary',
            'ShowNotification',
            'UpdateNotification',
            'DismissNotification',
            'ClearErrors',
            'ClearNotifications'
        ];

        methodsToWrap.forEach(methodName => {
            if (typeof this.app[methodName] === 'function') {
                const originalMethod = this.app[methodName];
                this.app[methodName] = this.wrapAppMethod(originalMethod, methodName);
            }
        });
    }

    wrapAppMethod(originalMethod, methodName) {
        return async (...args) => {
            const loadingId = this.showOperationLoading(methodName);
            
            try {
                const result = await originalMethod.apply(this.app, args);
                
                // Handle successful result
                this.handleSuccessfulOperation(methodName, result);
                
                return result;
            } catch (error) {
                // Handle error
                this.handleOperationError(methodName, error, args);
                throw error;
            } finally {
                // Hide loading
                this.hideOperationLoading(loadingId);
            }
        };
    }

    wrapFetch(originalFetch) {
        return async (...args) => {
            try {
                const response = await originalFetch.apply(window, args);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                return response;
            } catch (error) {
                this.handleNetworkError(error, args);
                throw error;
            }
        };
    }

    setupAsyncErrorHandling() {
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleUnhandledRejection(event.reason);
        });

        // Handle async errors in setTimeout/setInterval
        this.wrapTimers();
    }

    wrapTimers() {
        const originalSetTimeout = window.setTimeout;
        const originalSetInterval = window.setInterval;

        window.setTimeout = (callback, delay, ...args) => {
            return originalSetTimeout(() => {
                try {
                    callback.apply(this, args);
                } catch (error) {
                    this.handleTimerError(error, 'setTimeout');
                }
            }, delay);
        };

        window.setInterval = (callback, delay, ...args) => {
            return originalSetInterval(() => {
                try {
                    callback.apply(this, args);
                } catch (error) {
                    this.handleTimerError(error, 'setInterval');
                }
            }, delay);
        };
    }

    // Operation-specific error handling
    showOperationLoading(operation) {
        const operationNames = {
            'ScanCacheLocation': 'Scanning Cache Location',
            'ScanMultipleCacheLocations': 'Scanning Multiple Locations',
            'GetCacheLocationsFromConfig': 'Loading Cache Locations',
            'BackupFiles': 'Creating Backup',
            'DeleteFilesWithBackup': 'Deleting Files',
            'RestoreSession': 'Restoring Files',
            'GetBackupManifest': 'Loading Backup Manifest',
            'GetSystemInfo': 'Loading System Info',
            'GetErrorSummary': 'Loading Error Summary',
            'GetNotificationSummary': 'Loading Notification Summary',
            'ShowNotification': 'Showing Notification',
            'UpdateNotification': 'Updating Notification',
            'DismissNotification': 'Dismissing Notification',
            'ClearErrors': 'Clearing Errors',
            'ClearNotifications': 'Clearing Notifications'
        };

        const title = operationNames[operation] || operation;
        return showLoading({
            title: title,
            message: 'Please wait...',
            cancellable: false
        });
    }

    hideOperationLoading(loadingId) {
        if (loadingId) {
            hideLoading(loadingId);
        }
    }

    handleSuccessfulOperation(operation, result) {
        const successMessages = {
            'ScanCacheLocation': 'Cache location scanned successfully',
            'ScanMultipleCacheLocations': 'Multiple locations scanned successfully',
            'GetCacheLocationsFromConfig': 'Cache locations loaded successfully',
            'BackupFiles': 'Files backed up successfully',
            'DeleteFilesWithBackup': 'Files deleted successfully',
            'RestoreSession': 'Files restored successfully',
            'GetBackupManifest': 'Backup manifest loaded successfully',
            'GetSystemInfo': 'System info loaded successfully',
            'GetErrorSummary': 'Error summary loaded successfully',
            'GetNotificationSummary': 'Notification summary loaded successfully',
            'ShowNotification': 'Notification shown successfully',
            'UpdateNotification': 'Notification updated successfully',
            'DismissNotification': 'Notification dismissed successfully',
            'ClearErrors': 'Errors cleared successfully',
            'ClearNotifications': 'Notifications cleared successfully'
        };

        const message = successMessages[operation] || 'Operation completed successfully';
        
        // Show success notification for important operations
        if (['ScanCacheLocation', 'ScanMultipleCacheLocations', 'BackupFiles', 'DeleteFilesWithBackup', 'RestoreSession'].includes(operation)) {
            showSuccess('Success', message);
        }
    }

    handleOperationError(operation, error, args) {
        console.error(`Error in ${operation}:`, error);

        // Parse error message
        let errorMessage = 'An unexpected error occurred';
        let errorDetails = '';

        if (typeof error === 'string') {
            errorMessage = error;
        } else if (error && error.message) {
            errorMessage = error.message;
            errorDetails = error.stack || '';
        }

        // Show error notification
        showError('Operation Failed', errorMessage);

        // Log error details
        if (errorDetails) {
            console.error('Error details:', errorDetails);
        }

        // Send error to backend for logging
        this.logErrorToBackend(operation, error, args);
    }

    handleNetworkError(error, args) {
        console.error('Network error:', error);
        
        showError('Network Error', 'Failed to connect to the server. Please check your internet connection.');
        
        // Log network error
        this.logErrorToBackend('NetworkRequest', error, { url: args[0] });
    }

    handleUnhandledRejection(reason) {
        console.error('Unhandled promise rejection:', reason);
        
        showError('Unexpected Error', 'An unexpected error occurred. Please refresh the page if the problem persists.');
        
        // Log unhandled rejection
        this.logErrorToBackend('UnhandledRejection', reason, {});
    }

    handleTimerError(error, timerType) {
        console.error(`Error in ${timerType}:`, error);
        
        showError('Timer Error', `An error occurred in a ${timerType} callback`);
        
        // Log timer error
        this.logErrorToBackend(timerType, error, {});
    }

    handleFrontendError(error, context) {
        console.error('Frontend error:', error, context);
        
        showError('Frontend Error', error.message || 'An error occurred in the frontend');
        
        // Log frontend error
        this.logErrorToBackend('FrontendError', error, context);
    }

    handleNotificationAction(eventDetail) {
        const { notificationId, actionId, callback } = eventDetail;
        
        console.log('Notification action:', { notificationId, actionId, callback });
        
        // Handle specific actions
        switch (actionId) {
            case 'retry':
                this.retryLastOperation();
                break;
            case 'dismiss':
                dismissNotification(notificationId);
                break;
            case 'details':
                this.showErrorDetails(eventDetail.notification);
                break;
            default:
                console.log('Unknown notification action:', actionId);
        }
    }

    handleLoadingAction(eventDetail) {
        const { loadingId, actionId, callback } = eventDetail;
        
        console.log('Loading action:', { loadingId, actionId, callback });
        
        // Handle specific actions
        switch (actionId) {
            case 'cancel':
                this.cancelOperation(loadingId);
                break;
            case 'retry':
                this.retryLastOperation();
                break;
            default:
                console.log('Unknown loading action:', actionId);
        }
    }

    // Utility methods
    async logErrorToBackend(operation, error, context) {
        if (!this.app || typeof this.app.LogError !== 'function') {
            return;
        }

        try {
            const errorData = {
                operation: operation,
                error: {
                    message: error.message || String(error),
                    stack: error.stack || '',
                    name: error.name || 'Error'
                },
                context: context,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };

            await this.app.LogError(JSON.stringify(errorData));
        } catch (logError) {
            console.error('Failed to log error to backend:', logError);
        }
    }

    retryLastOperation() {
        // This would need to be implemented based on your specific needs
        console.log('Retrying last operation...');
        showInfo('Retry', 'Retrying the last operation...');
    }

    cancelOperation(loadingId) {
        if (loadingId) {
            hideLoading(loadingId);
        }
        showInfo('Cancelled', 'Operation cancelled by user');
    }

    showErrorDetails(notification) {
        if (notification && notification.details) {
            showError('Error Details', notification.details);
        }
    }

    // Cache operation wrappers with enhanced error handling
    async scanCacheLocation(locationID, locationName, path) {
        if (!this.app) {
            throw new Error('App not available');
        }

        try {
            const result = await this.app.ScanCacheLocation(locationID, locationName, path);
            
            // Parse result to get progress ID
            const resultData = JSON.parse(result);
            if (resultData.progress_id) {
                this.trackProgress(resultData.progress_id, 'scan');
            }
            
            return result;
        } catch (error) {
            this.handleOperationError('ScanCacheLocation', error, [locationID, locationName, path]);
            throw error;
        }
    }

    async scanMultipleLocations(locations) {
        if (!this.app) {
            throw new Error('App not available');
        }

        try {
            const locationsJSON = JSON.stringify(locations);
            const result = await this.app.ScanMultipleCacheLocations(locationsJSON);
            
            // Parse result to get progress ID
            const resultData = JSON.parse(result);
            if (resultData.progress_id) {
                this.trackProgress(resultData.progress_id, 'scan_multiple');
            }
            
            return result;
        } catch (error) {
            this.handleOperationError('ScanMultipleCacheLocations', error, [locations]);
            throw error;
        }
    }

    async backupFiles(files, operation) {
        if (!this.app) {
            throw new Error('App not available');
        }

        try {
            const filesJSON = JSON.stringify(files);
            const result = await this.app.BackupFiles(filesJSON, operation);
            
            // Parse result to get progress ID
            const resultData = JSON.parse(result);
            if (resultData.progress_id) {
                this.trackProgress(resultData.progress_id, 'backup');
            }
            
            return result;
        } catch (error) {
            this.handleOperationError('BackupFiles', error, [files, operation]);
            throw error;
        }
    }

    async deleteFilesWithBackup(files, operation) {
        if (!this.app) {
            throw new Error('App not available');
        }

        try {
            const filesJSON = JSON.stringify(files);
            const result = await this.app.DeleteFilesWithBackup(filesJSON, operation);
            
            // Parse result to get progress ID
            const resultData = JSON.parse(result);
            if (resultData.progress_id) {
                this.trackProgress(resultData.progress_id, 'delete');
            }
            
            return result;
        } catch (error) {
            this.handleOperationError('DeleteFilesWithBackup', error, [files, operation]);
            throw error;
        }
    }

    trackProgress(progressId, operationType) {
        if (!progressId) return;

        const interval = setInterval(async () => {
            try {
                if (!this.app || typeof this.app.GetProgress !== 'function') {
                    clearInterval(interval);
                    return;
                }

                const progressResult = await this.app.GetProgress(progressId);
                const progressData = JSON.parse(progressResult);

                if (progressData.status === 'completed') {
                    clearInterval(interval);
                    completeProgress(progressId, progressData.message || 'Operation completed');
                } else if (progressData.status === 'failed') {
                    clearInterval(interval);
                    failProgress(progressId, progressData.message || 'Operation failed');
                } else if (progressData.status === 'cancelled') {
                    clearInterval(interval);
                    failProgress(progressId, 'Operation cancelled');
                } else if (progressData.current !== undefined && progressData.total !== undefined) {
                    updateProgress(progressId, progressData.current, progressData.status || 'In progress');
                }
            } catch (error) {
                console.error('Error tracking progress:', error);
                clearInterval(interval);
            }
        }, 1000); // Check every second
    }

    // Error recovery methods
    async recoverFromError(error, context) {
        console.log('Attempting error recovery:', error, context);

        // Show recovery options to user
        const recoveryOptions = this.getRecoveryOptions(error, context);
        
        if (recoveryOptions.length > 0) {
            showNotification({
                type: 'warning',
                title: 'Error Recovery',
                message: 'We can try to recover from this error. What would you like to do?',
                actions: recoveryOptions,
                persistent: true
            });
        }
    }

    getRecoveryOptions(error, context) {
        const options = [];

        // Add retry option for recoverable errors
        if (this.isRetryableError(error)) {
            options.push({
                id: 'retry',
                label: 'Try Again',
                style: 'primary',
                callback: 'retryOperation'
            });
        }

        // Add refresh option for connection errors
        if (this.isConnectionError(error)) {
            options.push({
                id: 'refresh',
                label: 'Refresh Page',
                style: 'secondary',
                callback: 'refreshPage'
            });
        }

        // Add reset option for state errors
        if (this.isStateError(error)) {
            options.push({
                id: 'reset',
                label: 'Reset State',
                style: 'secondary',
                callback: 'resetState'
            });
        }

        return options;
    }

    isRetryableError(error) {
        const retryableErrors = [
            'timeout',
            'network',
            'temporary',
            'rate limit',
            'server error'
        ];

        const errorMessage = error.message?.toLowerCase() || '';
        return retryableErrors.some(keyword => errorMessage.includes(keyword));
    }

    isConnectionError(error) {
        const connectionErrors = [
            'network',
            'connection',
            'fetch',
            'http'
        ];

        const errorMessage = error.message?.toLowerCase() || '';
        return connectionErrors.some(keyword => errorMessage.includes(keyword));
    }

    isStateError(error) {
        const stateErrors = [
            'state',
            'session',
            'authentication',
            'authorization'
        ];

        const errorMessage = error.message?.toLowerCase() || '';
        return stateErrors.some(keyword => errorMessage.includes(keyword));
    }
}

// Global error integration instance
const errorIntegration = new ErrorIntegration();

// Global recovery functions
window.retryOperation = () => {
    errorIntegration.retryLastOperation();
};

window.refreshPage = () => {
    window.location.reload();
};

window.resetState = () => {
    // Clear local storage and reload
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorIntegration;
}

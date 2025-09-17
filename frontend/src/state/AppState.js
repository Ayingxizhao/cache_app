// Centralized State Management for Cache App
class AppState {
    constructor() {
        this.state = {
            // System status
            systemStatus: 'ready',
            systemMessage: 'Ready',
            
            // Scan state
            isScanning: false,
            scanProgress: null,
            scanResults: null,
            lastScanResult: null,
            
            // Cleaner state
            selectedFiles: new Set(),
            fileFilters: {
                safetyLevel: 'all',
                sizeRange: 'all',
                searchTerm: ''
            },
            
            // Backup state
            backupSessions: [],
            backupStats: {
                totalSessions: 0,
                totalFiles: 0,
                totalSize: 0
            },
            
            // Settings state
            settings: {
                backupLocation: '',
                retentionPolicy: 30,
                safeAgeThreshold: 7,
                cautionAgeThreshold: 30,
                largeFileThreshold: 100,
                concurrentScans: 3,
                backgroundProcessing: true,
                autoBackup: true,
                confirmDeletions: true
            },
            
            // UI state
            currentSection: 'scanner',
            notifications: [],
            modals: {
                fileDetails: { open: false, file: null },
                deletionConfirmation: { open: false, data: null },
                backupDetails: { open: false, session: null },
                settings: { open: false }
            },
            
            // Cache locations
            cacheLocations: [],
            
            // Error state
            errors: []
        };
        
        this.listeners = new Map();
        this.history = [];
        this.maxHistorySize = 50;
    }
    
    // Subscribe to state changes
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);
        
        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(key);
            if (callbacks) {
                callbacks.delete(callback);
                if (callbacks.size === 0) {
                    this.listeners.delete(key);
                }
            }
        };
    }
    
    // Notify listeners of state changes
    notify(key, oldValue, newValue) {
        const callbacks = this.listeners.get(key);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(newValue, oldValue, key);
                } catch (error) {
                    console.error(`Error in state listener for ${key}:`, error);
                }
            });
        }
    }
    
    // Get current state
    getState() {
        return { ...this.state };
    }
    
    // Get specific state value
    get(key) {
        return this.state[key];
    }
    
    // Set state value
    set(key, value) {
        const oldValue = this.state[key];
        this.state[key] = value;
        
        // Add to history
        this.addToHistory(key, oldValue, value);
        
        // Notify listeners
        this.notify(key, oldValue, value);
    }
    
    // Update nested state
    update(key, updater) {
        const oldValue = this.state[key];
        const newValue = typeof updater === 'function' ? updater(oldValue) : updater;
        this.set(key, newValue);
    }
    
    // Add to history
    addToHistory(key, oldValue, newValue) {
        this.history.push({
            key,
            oldValue,
            newValue,
            timestamp: Date.now()
        });
        
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }
    
    // Undo last change
    undo() {
        if (this.history.length === 0) return false;
        
        const lastChange = this.history.pop();
        this.state[lastChange.key] = lastChange.oldValue;
        this.notify(lastChange.key, lastChange.newValue, lastChange.oldValue);
        return true;
    }
    
    // System status management
    setSystemStatus(status, message) {
        this.set('systemStatus', status);
        this.set('systemMessage', message);
    }
    
    // Scan state management
    setScanning(isScanning) {
        this.set('isScanning', isScanning);
        this.setSystemStatus(isScanning ? 'scanning' : 'ready', 
                           isScanning ? 'Scanning in progress...' : 'Ready');
    }
    
    setScanProgress(progress) {
        this.set('scanProgress', progress);
    }
    
    setScanResults(results) {
        console.log('AppState: Setting scan results:', results);
        this.set('scanResults', results);
        this.set('lastScanResult', results);
    }
    
    // File selection management
    selectFile(filePath) {
        const selectedFiles = new Set(this.state.selectedFiles);
        selectedFiles.add(filePath);
        this.set('selectedFiles', selectedFiles);
    }
    
    deselectFile(filePath) {
        const selectedFiles = new Set(this.state.selectedFiles);
        selectedFiles.delete(filePath);
        this.set('selectedFiles', selectedFiles);
    }
    
    selectAllFiles(files) {
        const selectedFiles = new Set(files.map(f => f.path));
        this.set('selectedFiles', selectedFiles);
    }
    
    clearSelection() {
        this.set('selectedFiles', new Set());
    }
    
    // Filter management
    setFileFilter(filterType, value) {
        this.update('fileFilters', filters => ({
            ...filters,
            [filterType]: value
        }));
    }
    
    // Backup state management
    setBackupSessions(sessions) {
        this.set('backupSessions', sessions);
        this.updateBackupStats(sessions);
    }
    
    updateBackupStats(sessions) {
        const stats = sessions.reduce((acc, session) => ({
            totalSessions: acc.totalSessions + 1,
            totalFiles: acc.totalFiles + session.totalFiles,
            totalSize: acc.totalSize + session.totalSize
        }), { totalSessions: 0, totalFiles: 0, totalSize: 0 });
        
        this.set('backupStats', stats);
    }
    
    // Settings management
    updateSettings(newSettings) {
        this.update('settings', settings => ({
            ...settings,
            ...newSettings
        }));
    }
    
    resetSettings() {
        this.set('settings', {
            backupLocation: '',
            retentionPolicy: 30,
            safeAgeThreshold: 7,
            cautionAgeThreshold: 30,
            largeFileThreshold: 100,
            concurrentScans: 3,
            backgroundProcessing: true,
            autoBackup: true,
            confirmDeletions: true
        });
    }
    
    // Notification management
    addNotification(notification) {
        const notifications = [...this.state.notifications];
        const id = Date.now() + Math.random();
        notifications.push({
            id,
            timestamp: Date.now(),
            ...notification
        });
        this.set('notifications', notifications);
        
        // Auto-remove after duration
        if (notification.duration) {
            setTimeout(() => {
                this.removeNotification(id);
            }, notification.duration);
        }
    }
    
    removeNotification(id) {
        const notifications = this.state.notifications.filter(n => n.id !== id);
        this.set('notifications', notifications);
    }
    
    clearNotifications() {
        this.set('notifications', []);
    }
    
    // Modal management
    openModal(modalType, data = null) {
        this.update('modals', modals => ({
            ...modals,
            [modalType]: { open: true, data }
        }));
    }
    
    closeModal(modalType) {
        this.update('modals', modals => ({
            ...modals,
            [modalType]: { open: false, data: null }
        }));
    }
    
    // Error management
    addError(error) {
        const errors = [...this.state.errors];
        errors.push({
            id: Date.now() + Math.random(),
            timestamp: Date.now(),
            message: error.message || error,
            details: error.details || null,
            type: error.type || 'error'
        });
        this.set('errors', errors);
        
        // Also add as notification
        this.addNotification({
            type: 'error',
            title: 'Error',
            message: error.message || error,
            duration: 5000
        });
    }
    
    removeError(id) {
        const errors = this.state.errors.filter(e => e.id !== id);
        this.set('errors', errors);
    }
    
    clearErrors() {
        this.set('errors', []);
    }
    
    // Cache locations management
    setCacheLocations(locations) {
        this.set('cacheLocations', locations);
    }
    
    // Navigation management
    setCurrentSection(section) {
        this.set('currentSection', section);
    }
    
    // Utility methods
    getSelectedFilesCount() {
        return this.state.selectedFiles.size;
    }
    
    getSelectedFilesSize() {
        // This would need to be calculated from the actual file data
        // For now, return 0
        return 0;
    }
    
    isFileSelected(filePath) {
        return this.state.selectedFiles.has(filePath);
    }
    
    // Persistence
    saveToStorage() {
        try {
            const stateToSave = {
                settings: this.state.settings,
                fileFilters: this.state.fileFilters
            };
            localStorage.setItem('cacheAppState', JSON.stringify(stateToSave));
        } catch (error) {
            console.error('Failed to save state to storage:', error);
        }
    }
    
    loadFromStorage() {
        try {
            const savedState = localStorage.getItem('cacheAppState');
            if (savedState) {
                const parsed = JSON.parse(savedState);
                if (parsed.settings) {
                    this.update('settings', settings => ({
                        ...settings,
                        ...parsed.settings
                    }));
                }
                if (parsed.fileFilters) {
                    this.set('fileFilters', parsed.fileFilters);
                }
            }
        } catch (error) {
            console.error('Failed to load state from storage:', error);
        }
    }
    
    // Debug methods
    getHistory() {
        return [...this.history];
    }
    
    getListeners() {
        const result = {};
        this.listeners.forEach((callbacks, key) => {
            result[key] = callbacks.size;
        });
        return result;
    }
    
    // Initialize state
    initialize() {
        this.loadFromStorage();
        
        // Set up auto-save
        setInterval(() => {
            this.saveToStorage();
        }, 30000); // Save every 30 seconds
        
        // Set up error handling
        window.addEventListener('error', (event) => {
            this.addError({
                message: event.error?.message || 'Unknown error',
                details: event.error?.stack,
                type: 'javascript'
            });
        });
        
        // Set up unhandled promise rejection handling
        window.addEventListener('unhandledrejection', (event) => {
            this.addError({
                message: event.reason?.message || 'Unhandled promise rejection',
                details: event.reason?.stack,
                type: 'promise'
            });
        });
    }
}

// Create global state instance
window.appState = new AppState();

// Export for use in other modules
export { AppState };
window.AppState = AppState;

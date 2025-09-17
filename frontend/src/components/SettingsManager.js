// Settings Management Component for Cache App
class SettingsManager {
    constructor(appState) {
        this.appState = appState;
        this.settings = appState.get('settings');
        this.defaultSettings = {
            backupLocation: '',
            retentionPolicy: 30,
            safeAgeThreshold: 7,
            cautionAgeThreshold: 30,
            largeFileThreshold: 100,
            concurrentScans: 3,
            backgroundProcessing: true,
            autoBackup: true,
            confirmDeletions: true,
            showNotifications: true,
            theme: 'dark',
            language: 'en',
            logLevel: 'info',
            maxLogSize: 10,
            autoCleanup: false,
            cleanupInterval: 7
        };
    }
    
    // Initialize settings UI
    initializeSettingsUI() {
        const settingsSection = document.getElementById('settings-section');
        if (!settingsSection) return;
        
        settingsSection.innerHTML = this.createSettingsHTML();
        this.bindSettingsEvents();
        this.loadCurrentSettings();
    }
    
    createSettingsHTML() {
        return `
            <div class="settings-content">
                <div class="settings-sections">
                    <div class="settings-section">
                        <h3>Backup Settings</h3>
                        <div class="setting-group">
                            <label class="setting-label">Backup Location:</label>
                            <div class="setting-control">
                                <input type="text" id="backupLocation" class="form-input" readonly>
                                <button id="changeBackupLocation" class="btn btn-outline">Change</button>
                            </div>
                        </div>
                        <div class="setting-group">
                            <label class="setting-label">Retention Policy:</label>
                            <select id="retentionPolicy" class="form-select">
                                <option value="7">7 days</option>
                                <option value="30">30 days</option>
                                <option value="90">90 days</option>
                                <option value="365">1 year</option>
                                <option value="0">Never delete</option>
                            </select>
                        </div>
                        <div class="setting-group">
                            <label class="setting-label">Auto Backup:</label>
                            <input type="checkbox" id="autoBackup" class="form-checkbox">
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h3>Safety Settings</h3>
                        <div class="setting-group">
                            <label class="setting-label">Safe Age Threshold:</label>
                            <input type="number" id="safeAgeThreshold" class="form-input" min="1" max="365">
                            <span class="setting-unit">days</span>
                        </div>
                        <div class="setting-group">
                            <label class="setting-label">Caution Age Threshold:</label>
                            <input type="number" id="cautionAgeThreshold" class="form-input" min="1" max="365">
                            <span class="setting-unit">days</span>
                        </div>
                        <div class="setting-group">
                            <label class="setting-label">Large File Threshold:</label>
                            <input type="number" id="largeFileThreshold" class="form-input" min="1" max="10000">
                            <span class="setting-unit">MB</span>
                        </div>
                        <div class="setting-group">
                            <label class="setting-label">Confirm Deletions:</label>
                            <input type="checkbox" id="confirmDeletions" class="form-checkbox">
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h3>Performance Settings</h3>
                        <div class="setting-group">
                            <label class="setting-label">Concurrent Scans:</label>
                            <input type="number" id="concurrentScans" class="form-input" min="1" max="10">
                        </div>
                        <div class="setting-group">
                            <label class="setting-label">Background Processing:</label>
                            <input type="checkbox" id="backgroundProcessing" class="form-checkbox">
                        </div>
                        <div class="setting-group">
                            <label class="setting-label">Auto Cleanup:</label>
                            <input type="checkbox" id="autoCleanup" class="form-checkbox">
                        </div>
                        <div class="setting-group">
                            <label class="setting-label">Cleanup Interval:</label>
                            <input type="number" id="cleanupInterval" class="form-input" min="1" max="30">
                            <span class="setting-unit">days</span>
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h3>Interface Settings</h3>
                        <div class="setting-group">
                            <label class="setting-label">Theme:</label>
                            <select id="theme" class="form-select">
                                <option value="dark">Dark</option>
                                <option value="light">Light</option>
                                <option value="auto">Auto</option>
                            </select>
                        </div>
                        <div class="setting-group">
                            <label class="setting-label">Language:</label>
                            <select id="language" class="form-select">
                                <option value="en">English</option>
                                <option value="es">Español</option>
                                <option value="fr">Français</option>
                                <option value="de">Deutsch</option>
                            </select>
                        </div>
                        <div class="setting-group">
                            <label class="setting-label">Show Notifications:</label>
                            <input type="checkbox" id="showNotifications" class="form-checkbox">
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h3>Logging Settings</h3>
                        <div class="setting-group">
                            <label class="setting-label">Log Level:</label>
                            <select id="logLevel" class="form-select">
                                <option value="debug">Debug</option>
                                <option value="info">Info</option>
                                <option value="warn">Warning</option>
                                <option value="error">Error</option>
                            </select>
                        </div>
                        <div class="setting-group">
                            <label class="setting-label">Max Log Size:</label>
                            <input type="number" id="maxLogSize" class="form-input" min="1" max="100">
                            <span class="setting-unit">MB</span>
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h3>Actions</h3>
                        <div class="settings-actions">
                            <button id="saveSettings" class="btn btn-primary">
                                <span class="btn-icon">💾</span>
                                Save Settings
                            </button>
                            <button id="resetSettings" class="btn btn-outline">
                                <span class="btn-icon">🔄</span>
                                Reset to Defaults
                            </button>
                            <button id="exportSettings" class="btn btn-secondary">
                                <span class="btn-icon">📤</span>
                                Export Settings
                            </button>
                            <button id="importSettings" class="btn btn-secondary">
                                <span class="btn-icon">📥</span>
                                Import Settings
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    bindSettingsEvents() {
        // Save settings
        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });
        
        // Reset settings
        document.getElementById('resetSettings').addEventListener('click', () => {
            this.resetSettings();
        });
        
        // Export settings
        document.getElementById('exportSettings').addEventListener('click', () => {
            this.exportSettings();
        });
        
        // Import settings
        document.getElementById('importSettings').addEventListener('click', () => {
            this.importSettings();
        });
        
        // Change backup location
        document.getElementById('changeBackupLocation').addEventListener('click', () => {
            this.changeBackupLocation();
        });
        
        // Auto-save on change
        const inputs = document.querySelectorAll('#settings-section input, #settings-section select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.autoSave();
            });
        });
    }
    
    loadCurrentSettings() {
        const settings = this.appState.get('settings');
        
        // Backup settings
        document.getElementById('backupLocation').value = settings.backupLocation || '';
        document.getElementById('retentionPolicy').value = settings.retentionPolicy || 30;
        document.getElementById('autoBackup').checked = settings.autoBackup !== false;
        
        // Safety settings
        document.getElementById('safeAgeThreshold').value = settings.safeAgeThreshold || 7;
        document.getElementById('cautionAgeThreshold').value = settings.cautionAgeThreshold || 30;
        document.getElementById('largeFileThreshold').value = settings.largeFileThreshold || 100;
        document.getElementById('confirmDeletions').checked = settings.confirmDeletions !== false;
        
        // Performance settings
        document.getElementById('concurrentScans').value = settings.concurrentScans || 3;
        document.getElementById('backgroundProcessing').checked = settings.backgroundProcessing !== false;
        document.getElementById('autoCleanup').checked = settings.autoCleanup || false;
        document.getElementById('cleanupInterval').value = settings.cleanupInterval || 7;
        
        // Interface settings
        document.getElementById('theme').value = settings.theme || 'dark';
        document.getElementById('language').value = settings.language || 'en';
        document.getElementById('showNotifications').checked = settings.showNotifications !== false;
        
        // Logging settings
        document.getElementById('logLevel').value = settings.logLevel || 'info';
        document.getElementById('maxLogSize').value = settings.maxLogSize || 10;
    }
    
    saveSettings() {
        try {
            const newSettings = this.collectSettingsFromUI();
            this.appState.updateSettings(newSettings);
            this.appState.saveToStorage();
            
            // Apply theme if changed
            if (newSettings.theme !== this.settings.theme) {
                this.applyTheme(newSettings.theme);
            }
            
            window.notificationSystem.success('Settings saved successfully!', {
                title: 'Settings',
                duration: 3000
            });
            
        } catch (error) {
            console.error('Failed to save settings:', error);
            window.notificationSystem.error('Failed to save settings: ' + error.message, {
                title: 'Error',
                duration: 5000
            });
        }
    }
    
    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
            this.appState.resetSettings();
            this.loadCurrentSettings();
            
            window.notificationSystem.success('Settings reset to defaults', {
                title: 'Settings Reset',
                duration: 3000
            });
        }
    }
    
    exportSettings() {
        try {
            const settings = this.appState.get('settings');
            const dataBlob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `cache-app-settings-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            window.notificationSystem.success('Settings exported successfully', {
                title: 'Export',
                duration: 3000
            });
            
        } catch (error) {
            console.error('Failed to export settings:', error);
            window.notificationSystem.error('Failed to export settings: ' + error.message, {
                title: 'Error',
                duration: 5000
            });
        }
    }
    
    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const settings = JSON.parse(e.target.result);
                    this.validateAndImportSettings(settings);
                } catch (error) {
                    console.error('Failed to parse settings file:', error);
                    window.notificationSystem.error('Invalid settings file format', {
                        title: 'Import Error',
                        duration: 5000
                    });
                }
            };
            reader.readAsText(file);
        });
        
        input.click();
    }
    
    validateAndImportSettings(settings) {
        try {
            // Validate settings structure
            const validKeys = Object.keys(this.defaultSettings);
            const importedKeys = Object.keys(settings);
            
            // Check if all required keys are present
            const missingKeys = validKeys.filter(key => !importedKeys.includes(key));
            if (missingKeys.length > 0) {
                throw new Error(`Missing required settings: ${missingKeys.join(', ')}`);
            }
            
            // Validate values
            if (settings.retentionPolicy < 0 || settings.retentionPolicy > 3650) {
                throw new Error('Invalid retention policy value');
            }
            
            if (settings.safeAgeThreshold < 1 || settings.safeAgeThreshold > 365) {
                throw new Error('Invalid safe age threshold');
            }
            
            if (settings.cautionAgeThreshold < 1 || settings.cautionAgeThreshold > 365) {
                throw new Error('Invalid caution age threshold');
            }
            
            if (settings.largeFileThreshold < 1 || settings.largeFileThreshold > 10000) {
                throw new Error('Invalid large file threshold');
            }
            
            if (settings.concurrentScans < 1 || settings.concurrentScans > 10) {
                throw new Error('Invalid concurrent scans value');
            }
            
            // Import valid settings
            this.appState.updateSettings(settings);
            this.loadCurrentSettings();
            
            window.notificationSystem.success('Settings imported successfully', {
                title: 'Import',
                duration: 3000
            });
            
        } catch (error) {
            console.error('Failed to import settings:', error);
            window.notificationSystem.error('Failed to import settings: ' + error.message, {
                title: 'Import Error',
                duration: 5000
            });
        }
    }
    
    changeBackupLocation() {
        // In a real implementation, this would open a folder picker
        const newLocation = prompt('Enter new backup location path:', this.appState.get('settings').backupLocation);
        if (newLocation && newLocation.trim()) {
            document.getElementById('backupLocation').value = newLocation.trim();
            this.autoSave();
        }
    }
    
    collectSettingsFromUI() {
        return {
            backupLocation: document.getElementById('backupLocation').value,
            retentionPolicy: parseInt(document.getElementById('retentionPolicy').value),
            safeAgeThreshold: parseInt(document.getElementById('safeAgeThreshold').value),
            cautionAgeThreshold: parseInt(document.getElementById('cautionAgeThreshold').value),
            largeFileThreshold: parseInt(document.getElementById('largeFileThreshold').value),
            concurrentScans: parseInt(document.getElementById('concurrentScans').value),
            backgroundProcessing: document.getElementById('backgroundProcessing').checked,
            autoBackup: document.getElementById('autoBackup').checked,
            confirmDeletions: document.getElementById('confirmDeletions').checked,
            showNotifications: document.getElementById('showNotifications').checked,
            theme: document.getElementById('theme').value,
            language: document.getElementById('language').value,
            logLevel: document.getElementById('logLevel').value,
            maxLogSize: parseInt(document.getElementById('maxLogSize').value),
            autoCleanup: document.getElementById('autoCleanup').checked,
            cleanupInterval: parseInt(document.getElementById('cleanupInterval').value)
        };
    }
    
    autoSave() {
        // Debounced auto-save
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            try {
                const newSettings = this.collectSettingsFromUI();
                this.appState.updateSettings(newSettings);
            } catch (error) {
                console.error('Auto-save failed:', error);
            }
        }, 1000);
    }
    
    applyTheme(theme) {
        const body = document.body;
        const root = document.documentElement;
        
        // Remove existing theme classes
        body.classList.remove('theme-dark', 'theme-light', 'theme-auto');
        
        // Apply new theme
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            body.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
        } else {
            body.classList.add(`theme-${theme}`);
        }
        
        // Update CSS custom properties
        if (theme === 'light') {
            root.style.setProperty('--primary-bg', '#ffffff');
            root.style.setProperty('--secondary-bg', '#f8f9fa');
            root.style.setProperty('--text-primary', '#212529');
            root.style.setProperty('--text-secondary', '#6c757d');
        } else {
            root.style.setProperty('--primary-bg', '#1e1e1e');
            root.style.setProperty('--secondary-bg', '#2d2d2d');
            root.style.setProperty('--text-primary', '#ffffff');
            root.style.setProperty('--text-secondary', '#a0a0a0');
        }
    }
    
    // Get setting value
    getSetting(key) {
        return this.appState.get('settings')[key];
    }
    
    // Set setting value
    setSetting(key, value) {
        this.appState.updateSettings({ [key]: value });
    }
    
    // Validate settings
    validateSettings(settings) {
        const errors = [];
        
        if (settings.retentionPolicy < 0 || settings.retentionPolicy > 3650) {
            errors.push('Retention policy must be between 0 and 3650 days');
        }
        
        if (settings.safeAgeThreshold < 1 || settings.safeAgeThreshold > 365) {
            errors.push('Safe age threshold must be between 1 and 365 days');
        }
        
        if (settings.cautionAgeThreshold < 1 || settings.cautionAgeThreshold > 365) {
            errors.push('Caution age threshold must be between 1 and 365 days');
        }
        
        if (settings.largeFileThreshold < 1 || settings.largeFileThreshold > 10000) {
            errors.push('Large file threshold must be between 1 and 10000 MB');
        }
        
        if (settings.concurrentScans < 1 || settings.concurrentScans > 10) {
            errors.push('Concurrent scans must be between 1 and 10');
        }
        
        return errors;
    }
}

// Export for use in other modules
export { SettingsManager };
window.SettingsManager = SettingsManager;

// Settings Form Component
class SettingsForm {
    constructor() {
        this.currentSettings = null;
        this.currentCategory = 'backup';
        this.isLoading = false;
        
        // Import Wails functions
        this.wails = window.go?.main?.App || {};
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadSettings();
        this.setupFormValidation();
    }

    setupEventListeners() {
        // Category navigation
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchCategory(e.target.dataset.category);
            });
        });

        // Form submissions
        document.getElementById('backup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBackupSettings();
        });

        document.getElementById('safety-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSafetySettings();
        });

        document.getElementById('performance-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePerformanceSettings();
        });

        document.getElementById('privacy-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePrivacySettings();
        });

        document.getElementById('ui-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveUISettings();
        });

        // Reset buttons
        document.getElementById('reset-backup').addEventListener('click', () => {
            this.resetCategorySettings('backup');
        });

        document.getElementById('reset-safety').addEventListener('click', () => {
            this.resetCategorySettings('safety');
        });

        document.getElementById('reset-performance').addEventListener('click', () => {
            this.resetCategorySettings('performance');
        });

        document.getElementById('reset-privacy').addEventListener('click', () => {
            this.resetCategorySettings('privacy');
        });

        document.getElementById('reset-ui').addEventListener('click', () => {
            this.resetCategorySettings('ui');
        });

        // Global actions
        document.getElementById('export-settings').addEventListener('click', () => {
            this.exportSettings();
        });

        document.getElementById('import-settings').addEventListener('click', () => {
            this.importSettings();
        });

        document.getElementById('reset-all-settings').addEventListener('click', () => {
            this.resetAllSettings();
        });

        // File input for import
        document.getElementById('import-file-input').addEventListener('change', (e) => {
            this.handleImportFile(e.target.files[0]);
        });

        // Browse button for backup location
        document.getElementById('browse-backup-location').addEventListener('click', () => {
            this.browseBackupLocation();
        });
    }

    async loadSettings() {
        try {
            this.showLoading(true);
            const result = await this.wails.GetSettings();
            this.currentSettings = JSON.parse(result);
            this.populateForms();
            this.showMessage('Settings loaded successfully', 'success');
        } catch (error) {
            console.error('Failed to load settings:', error);
            this.showMessage('Failed to load settings: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    populateForms() {
        if (!this.currentSettings) return;

        // Populate backup form
        this.populateForm('backup-form', this.currentSettings.backup);
        
        // Populate safety form
        this.populateForm('safety-form', this.currentSettings.safety);
        
        // Populate performance form
        this.populateForm('performance-form', this.currentSettings.performance);
        
        // Populate privacy form
        this.populateForm('privacy-form', this.currentSettings.privacy);
        
        // Populate UI form
        this.populateForm('ui-form', this.currentSettings.ui);
    }

    populateForm(formId, data) {
        const form = document.getElementById(formId);
        if (!form || !data) return;

        Object.keys(data).forEach(key => {
            const element = form.querySelector(`[name="${key}"]`);
            if (!element) return;

            if (element.type === 'checkbox') {
                element.checked = data[key];
            } else if (element.type === 'number') {
                element.value = data[key];
            } else {
                element.value = data[key];
            }
        });
    }

    async saveBackupSettings() {
        try {
            this.showLoading(true);
            const formData = this.getFormData('backup-form');
            const result = await this.wails.UpdateBackupSettings(JSON.stringify(formData));
            const response = JSON.parse(result);
            
            if (response.status === 'success') {
                this.showMessage('Backup settings saved successfully', 'success');
                this.currentSettings.backup = response.settings;
            } else {
                this.showMessage('Failed to save backup settings', 'error');
            }
        } catch (error) {
            console.error('Failed to save backup settings:', error);
            this.showMessage('Failed to save backup settings: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async saveSafetySettings() {
        try {
            this.showLoading(true);
            const formData = this.getFormData('safety-form');
            const result = await this.wails.UpdateSafetySettings(JSON.stringify(formData));
            const response = JSON.parse(result);
            
            if (response.status === 'success') {
                this.showMessage('Safety settings saved successfully', 'success');
                this.currentSettings.safety = response.settings;
            } else {
                this.showMessage('Failed to save safety settings', 'error');
            }
        } catch (error) {
            console.error('Failed to save safety settings:', error);
            this.showMessage('Failed to save safety settings: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async savePerformanceSettings() {
        try {
            this.showLoading(true);
            const formData = this.getFormData('performance-form');
            const result = await this.wails.UpdatePerformanceSettings(JSON.stringify(formData));
            const response = JSON.parse(result);
            
            if (response.status === 'success') {
                this.showMessage('Performance settings saved successfully', 'success');
                this.currentSettings.performance = response.settings;
            } else {
                this.showMessage('Failed to save performance settings', 'error');
            }
        } catch (error) {
            console.error('Failed to save performance settings:', error);
            this.showMessage('Failed to save performance settings: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async savePrivacySettings() {
        try {
            this.showLoading(true);
            const formData = this.getFormData('privacy-form');
            const result = await this.wails.UpdatePrivacySettings(JSON.stringify(formData));
            const response = JSON.parse(result);
            
            if (response.status === 'success') {
                this.showMessage('Privacy settings saved successfully', 'success');
                this.currentSettings.privacy = response.settings;
            } else {
                this.showMessage('Failed to save privacy settings', 'error');
            }
        } catch (error) {
            console.error('Failed to save privacy settings:', error);
            this.showMessage('Failed to save privacy settings: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async saveUISettings() {
        try {
            this.showLoading(true);
            const formData = this.getFormData('ui-form');
            const result = await this.wails.UpdateUISettings(JSON.stringify(formData));
            const response = JSON.parse(result);
            
            if (response.status === 'success') {
                this.showMessage('UI settings saved successfully', 'success');
                this.currentSettings.ui = response.settings;
            } else {
                this.showMessage('Failed to save UI settings', 'error');
            }
        } catch (error) {
            console.error('Failed to save UI settings:', error);
            this.showMessage('Failed to save UI settings: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    getFormData(formId) {
        const form = document.getElementById(formId);
        const formData = new FormData(form);
        const data = {};

        for (let [key, value] of formData.entries()) {
            const element = form.querySelector(`[name="${key}"]`);
            if (element.type === 'checkbox') {
                data[key] = element.checked;
            } else if (element.type === 'number') {
                data[key] = parseInt(value);
            } else {
                data[key] = value;
            }
        }

        return data;
    }

    switchCategory(category) {
        // Update navigation
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.settings-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${category}-settings`).classList.add('active');

        this.currentCategory = category;
    }

    async resetCategorySettings(category) {
        if (!confirm(`Are you sure you want to reset ${category} settings to defaults?`)) {
            return;
        }

        try {
            this.showLoading(true);
            
            // Get default settings for the category
            const defaultSettings = this.getDefaultSettings();
            const categoryData = defaultSettings[category];
            
            // Update the form
            this.populateForm(`${category}-form`, categoryData);
            
            // Save the reset settings
            const methodName = `Update${category.charAt(0).toUpperCase() + category.slice(1)}Settings`;
            const result = await this.wails[methodName](JSON.stringify(categoryData));
            const response = JSON.parse(result);
            
            if (response.status === 'success') {
                this.showMessage(`${category} settings reset to defaults`, 'success');
                this.currentSettings[category] = response.settings;
            } else {
                this.showMessage(`Failed to reset ${category} settings`, 'error');
            }
        } catch (error) {
            console.error(`Failed to reset ${category} settings:`, error);
            this.showMessage(`Failed to reset ${category} settings: ` + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async resetAllSettings() {
        if (!confirm('Are you sure you want to reset ALL settings to defaults? This cannot be undone.')) {
            return;
        }

        try {
            this.showLoading(true);
            const result = await this.wails.ResetSettings();
            const response = JSON.parse(result);
            
            if (response.status === 'success') {
                this.currentSettings = response.settings;
                this.populateForms();
                this.showMessage('All settings reset to defaults', 'success');
            } else {
                this.showMessage('Failed to reset settings', 'error');
            }
        } catch (error) {
            console.error('Failed to reset settings:', error);
            this.showMessage('Failed to reset settings: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async exportSettings() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `cache-app-settings-${timestamp}.json`;
            
            // Create download link
            const blob = new Blob([JSON.stringify(this.currentSettings, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showMessage('Settings exported successfully', 'success');
        } catch (error) {
            console.error('Failed to export settings:', error);
            this.showMessage('Failed to export settings: ' + error.message, 'error');
        }
    }

    importSettings() {
        document.getElementById('import-file-input').click();
    }

    async handleImportFile(file) {
        if (!file) return;

        try {
            this.showLoading(true);
            const text = await file.text();
            const importedSettings = JSON.parse(text);
            
            // Validate the imported settings
            const validationResult = await this.wails.ValidateSettings(text);
            const validation = JSON.parse(validationResult);
            
            if (!validation.is_valid) {
                this.showMessage('Invalid settings file: ' + validation.errors.join(', '), 'error');
                return;
            }
            
            // Update settings
            const result = await this.wails.UpdateSettings(text);
            const response = JSON.parse(result);
            
            if (response.status === 'success') {
                this.currentSettings = response.settings;
                this.populateForms();
                this.showMessage('Settings imported successfully', 'success');
            } else {
                this.showMessage('Failed to import settings', 'error');
            }
        } catch (error) {
            console.error('Failed to import settings:', error);
            this.showMessage('Failed to import settings: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async browseBackupLocation() {
        // This would typically open a folder picker dialog
        // For now, we'll just show a message
        this.showMessage('Folder picker not implemented yet', 'info');
    }

    getDefaultSettings() {
        return {
            backup: {
                default_location: "",
                custom_location: "",
                use_custom_location: false,
                retention_days: 30,
                max_backup_size_mb: 1024,
                auto_cleanup: true,
                cleanup_threshold_days: 7,
                compress_backups: true,
                verify_integrity: true,
                create_manifest: true
            },
            safety: {
                default_safe_level: "Safe",
                require_confirmation: true,
                show_safety_warnings: true,
                confirm_deletion: true,
                confirm_large_files: true,
                confirm_system_files: true,
                large_file_threshold_mb: 100,
                safe_age_threshold_days: 30,
                caution_age_threshold_days: 7,
                protect_system_paths: true,
                protect_user_data: true,
                protect_dev_files: true
            },
            performance: {
                scan_depth: 5,
                max_file_size_mb: 500,
                concurrent_scans: 3,
                scan_timeout_seconds: 300,
                max_memory_usage_mb: 512,
                enable_caching: true,
                cache_size_mb: 64,
                update_interval_ms: 1000,
                show_progress: true,
                verbose_logging: false
            },
            privacy: {
                enable_cloud_ai: false,
                share_analytics: false,
                share_crash_reports: false,
                collect_usage_stats: false,
                collect_error_logs: true,
                collect_performance: false,
                retain_logs_days: 7,
                retain_stats_days: 30,
                auto_delete_old_data: true
            },
            ui: {
                theme: "auto",
                language: "en",
                font_size: 14,
                window_width: 1024,
                window_height: 768,
                remember_window_size: true,
                show_notifications: true,
                notification_sound: true,
                notification_duration_ms: 3000,
                high_contrast: false,
                reduce_animations: false,
                screen_reader: false
            }
        };
    }

    setupFormValidation() {
        // Add real-time validation for numeric inputs
        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('input', (e) => {
                this.validateNumberInput(e.target);
            });
        });

        // Add validation for dependent fields
        this.setupDependentValidation();
    }

    validateNumberInput(input) {
        const min = parseInt(input.min);
        const max = parseInt(input.max);
        const value = parseInt(input.value);

        if (value < min || value > max) {
            input.classList.add('invalid');
            this.showFieldError(input, `Value must be between ${min} and ${max}`);
        } else {
            input.classList.remove('invalid');
            this.clearFieldError(input);
        }
    }

    setupDependentValidation() {
        // Cleanup threshold should be less than retention days
        const retentionDays = document.getElementById('retention-days');
        const cleanupThreshold = document.getElementById('cleanup-threshold');

        if (retentionDays && cleanupThreshold) {
            const validateCleanup = () => {
                const retention = parseInt(retentionDays.value);
                const cleanup = parseInt(cleanupThreshold.value);
                
                if (cleanup > retention) {
                    cleanupThreshold.classList.add('invalid');
                    this.showFieldError(cleanupThreshold, 'Cleanup threshold must be less than retention days');
                } else {
                    cleanupThreshold.classList.remove('invalid');
                    this.clearFieldError(cleanupThreshold);
                }
            };

            retentionDays.addEventListener('input', validateCleanup);
            cleanupThreshold.addEventListener('input', validateCleanup);
        }

        // Caution age threshold should be less than safe age threshold
        const safeAgeThreshold = document.getElementById('safe-age-threshold');
        const cautionAgeThreshold = document.getElementById('caution-age-threshold');

        if (safeAgeThreshold && cautionAgeThreshold) {
            const validateCaution = () => {
                const safe = parseInt(safeAgeThreshold.value);
                const caution = parseInt(cautionAgeThreshold.value);
                
                if (caution > safe) {
                    cautionAgeThreshold.classList.add('invalid');
                    this.showFieldError(cautionAgeThreshold, 'Caution threshold must be less than safe threshold');
                } else {
                    cautionAgeThreshold.classList.remove('invalid');
                    this.clearFieldError(cautionAgeThreshold);
                }
            };

            safeAgeThreshold.addEventListener('input', validateCaution);
            cautionAgeThreshold.addEventListener('input', validateCaution);
        }
    }

    showFieldError(input, message) {
        this.clearFieldError(input);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        
        input.parentNode.appendChild(errorDiv);
    }

    clearFieldError(input) {
        const existingError = input.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    showLoading(show) {
        this.isLoading = show;
        document.body.classList.toggle('loading', show);
        
        // Disable all form buttons
        document.querySelectorAll('button').forEach(btn => {
            btn.disabled = show;
        });
    }

    showMessage(message, type = 'info') {
        const messagesContainer = document.getElementById('status-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        
        messagesContainer.appendChild(messageDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SettingsForm();
});

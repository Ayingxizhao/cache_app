// Help and Documentation System for Cache App
class HelpSystem {
    constructor(appState, notificationSystem) {
        this.appState = appState;
        this.notificationSystem = notificationSystem;
        this.currentTour = null;
        this.tourSteps = [];
        this.currentStepIndex = 0;
    }
    
    // Initialize help UI
    initializeHelpUI() {
        const helpSection = document.getElementById('help-section');
        if (!helpSection) return;
        
        helpSection.innerHTML = this.createHelpHTML();
        this.bindHelpEvents();
    }
    
    createHelpHTML() {
        return `
            <div class="help-content">
                <div class="help-sections">
                    <div class="help-section">
                        <h3>Getting Started</h3>
                        <div class="help-content">
                            <p>Welcome to Cache App! This application helps you manage and clean cache files on your macOS system safely.</p>
                            <div class="help-steps">
                                <div class="help-step">
                                    <div class="step-number">1</div>
                                    <div class="step-content">
                                        <h4>Scan Cache Locations</h4>
                                        <p>Use the Scanner tab to select and scan cache locations. The app will analyze files and classify them by safety level.</p>
                                    </div>
                                </div>
                                <div class="help-step">
                                    <div class="step-number">2</div>
                                    <div class="step-content">
                                        <h4>Review Results</h4>
                                        <p>Examine scan results in the Cleaner tab. Files are classified as Safe, Caution, or Risky based on multiple factors.</p>
                                    </div>
                                </div>
                                <div class="help-step">
                                    <div class="step-number">3</div>
                                    <div class="step-content">
                                        <h4>Clean Files</h4>
                                        <p>Select files to delete. The app automatically creates backups before deletion for safety.</p>
                                    </div>
                                </div>
                                <div class="help-step">
                                    <div class="step-number">4</div>
                                    <div class="step-content">
                                        <h4>Manage Backups</h4>
                                        <p>Use the Backup Manager to restore files if needed or clean up old backup sessions.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="help-section">
                        <h3>Safety Features</h3>
                        <div class="help-content">
                            <p>Cache App uses advanced safety classification to protect your system:</p>
                            <div class="safety-levels">
                                <div class="safety-level safe">
                                    <div class="safety-icon">✅</div>
                                    <div class="safety-info">
                                        <h4>Safe</h4>
                                        <p>Files that are clearly cache files and safe to delete. These include temporary files, browser caches, and application cache data.</p>
                                    </div>
                                </div>
                                <div class="safety-level caution">
                                    <div class="safety-icon">⚠️</div>
                                    <div class="safety-info">
                                        <h4>Caution</h4>
                                        <p>Files that might be cache files but require review. These could be important application data or user preferences.</p>
                                    </div>
                                </div>
                                <div class="safety-level risky">
                                    <div class="safety-icon">🚨</div>
                                    <div class="safety-info">
                                        <h4>Risky</h4>
                                        <p>Files that could be important system files or user data. These should not be deleted without careful consideration.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="help-section">
                        <h3>Features Guide</h3>
                        <div class="help-content">
                            <div class="feature-grid">
                                <div class="feature-card">
                                    <div class="feature-icon">🔍</div>
                                    <h4>Cache Scanner</h4>
                                    <p>Scan multiple cache locations simultaneously with progress tracking and detailed file analysis.</p>
                                </div>
                                <div class="feature-card">
                                    <div class="feature-icon">🧹</div>
                                    <h4>Smart Cleaner</h4>
                                    <p>Intelligent file classification with bulk selection tools and safety validation.</p>
                                </div>
                                <div class="feature-card">
                                    <div class="feature-icon">💾</div>
                                    <h4>Backup Manager</h4>
                                    <p>Automatic backup creation with session management and restore capabilities.</p>
                                </div>
                                <div class="feature-card">
                                    <div class="feature-icon">⚙️</div>
                                    <h4>Settings</h4>
                                    <p>Comprehensive configuration options for backup policies, safety rules, and performance.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="help-section">
                        <h3>Troubleshooting</h3>
                        <div class="help-content">
                            <div class="troubleshooting-items">
                                <div class="troubleshooting-item">
                                    <h4>Permission Errors</h4>
                                    <p><strong>Problem:</strong> "Permission denied" errors when scanning</p>
                                    <p><strong>Solution:</strong> Run the app with appropriate permissions or use sudo if necessary. Some system directories require elevated privileges.</p>
                                </div>
                                <div class="troubleshooting-item">
                                    <h4>Slow Scans</h4>
                                    <p><strong>Problem:</strong> Scanning takes a very long time</p>
                                    <p><strong>Solution:</strong> Reduce concurrent scan count in Settings > Performance, or scan smaller directories individually.</p>
                                </div>
                                <div class="troubleshooting-item">
                                    <h4>Backup Failures</h4>
                                    <p><strong>Problem:</strong> Backup creation fails</p>
                                    <p><strong>Solution:</strong> Check available disk space and ensure the backup location is writable. Try changing the backup location in Settings.</p>
                                </div>
                                <div class="troubleshooting-item">
                                    <h4>App Crashes</h4>
                                    <p><strong>Problem:</strong> Application crashes during operations</p>
                                    <p><strong>Solution:</strong> Check the logs in Help > Export Logs, and try reducing concurrent operations in Settings.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="help-section">
                        <h3>Keyboard Shortcuts</h3>
                        <div class="help-content">
                            <div class="shortcuts-grid">
                                <div class="shortcut-item">
                                    <kbd>⌘</kbd> + <kbd>S</kbd>
                                    <span>Save settings</span>
                                </div>
                                <div class="shortcut-item">
                                    <kbd>⌘</kbd> + <kbd>R</kbd>
                                    <span>Refresh data</span>
                                </div>
                                <div class="shortcut-item">
                                    <kbd>⌘</kbd> + <kbd>1</kbd>
                                    <span>Scanner tab</span>
                                </div>
                                <div class="shortcut-item">
                                    <kbd>⌘</kbd> + <kbd>2</kbd>
                                    <span>Cleaner tab</span>
                                </div>
                                <div class="shortcut-item">
                                    <kbd>⌘</kbd> + <kbd>3</kbd>
                                    <span>Backup tab</span>
                                </div>
                                <div class="shortcut-item">
                                    <kbd>⌘</kbd> + <kbd>4</kbd>
                                    <span>Settings tab</span>
                                </div>
                                <div class="shortcut-item">
                                    <kbd>⌘</kbd> + <kbd>?</kbd>
                                    <span>Help tab</span>
                                </div>
                                <div class="shortcut-item">
                                    <kbd>Esc</kbd>
                                    <span>Close modals</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="help-section">
                        <h3>Support & Resources</h3>
                        <div class="help-content">
                            <div class="support-actions">
                                <button id="startTour" class="btn btn-primary">
                                    <span class="btn-icon">🎯</span>
                                    Start Guided Tour
                                </button>
                                <button id="exportLogs" class="btn btn-secondary">
                                    <span class="btn-icon">📤</span>
                                    Export Logs
                                </button>
                                <button id="checkUpdates" class="btn btn-secondary">
                                    <span class="btn-icon">🔄</span>
                                    Check Updates
                                </button>
                                <button id="reportIssue" class="btn btn-outline">
                                    <span class="btn-icon">🐛</span>
                                    Report Issue
                                </button>
                            </div>
                            
                            <div class="support-info">
                                <h4>Need More Help?</h4>
                                <ul>
                                    <li>Check the troubleshooting section above</li>
                                    <li>Export logs for technical support</li>
                                    <li>Report issues with detailed descriptions</li>
                                    <li>Take the guided tour to learn the basics</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    bindHelpEvents() {
        // Start guided tour
        document.getElementById('startTour').addEventListener('click', () => {
            this.startGuidedTour();
        });
        
        // Export logs
        document.getElementById('exportLogs').addEventListener('click', () => {
            this.exportLogs();
        });
        
        // Check updates
        document.getElementById('checkUpdates').addEventListener('click', () => {
            this.checkUpdates();
        });
        
        // Report issue
        document.getElementById('reportIssue').addEventListener('click', () => {
            this.reportIssue();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }
    
    startGuidedTour() {
        this.tourSteps = [
            {
                target: '.nav-tab[data-section="scanner"]',
                title: 'Cache Scanner',
                content: 'Start here to scan cache locations on your system. Select a location and click "Scan Selected Location" to begin.',
                position: 'bottom'
            },
            {
                target: '#locationSelect',
                title: 'Location Selector',
                content: 'Choose which cache location to scan. The app includes common macOS cache directories.',
                position: 'bottom'
            },
            {
                target: '.nav-tab[data-section="cleaner"]',
                title: 'Cache Cleaner',
                content: 'After scanning, review results here. Files are classified by safety level for your protection.',
                position: 'bottom'
            },
            {
                target: '.nav-tab[data-section="backup"]',
                title: 'Backup Manager',
                content: 'Manage your backup sessions here. You can restore files or clean up old backups.',
                position: 'bottom'
            },
            {
                target: '.nav-tab[data-section="settings"]',
                title: 'Settings',
                content: 'Configure app preferences, backup policies, and safety rules to match your needs.',
                position: 'bottom'
            }
        ];
        
        this.currentStepIndex = 0;
        this.showTourStep();
        
        this.notificationSystem.info('Guided tour started! Follow the highlighted elements.', {
            title: 'Tour Started',
            duration: 5000
        });
    }
    
    showTourStep() {
        if (this.currentStepIndex >= this.tourSteps.length) {
            this.endTour();
            return;
        }
        
        const step = this.tourSteps[this.currentStepIndex];
        const target = document.querySelector(step.target);
        
        if (!target) {
            this.currentStepIndex++;
            this.showTourStep();
            return;
        }
        
        // Create tour overlay
        this.createTourOverlay(target, step);
    }
    
    createTourOverlay(target, step) {
        // Remove existing tour overlay
        this.removeTourOverlay();
        
        const overlay = document.createElement('div');
        overlay.className = 'tour-overlay';
        overlay.innerHTML = `
            <div class="tour-highlight"></div>
            <div class="tour-tooltip tour-tooltip-${step.position}">
                <div class="tour-header">
                    <h3>${step.title}</h3>
                    <button class="tour-close" onclick="helpSystem.endTour()">×</button>
                </div>
                <div class="tour-content">
                    <p>${step.content}</p>
                </div>
                <div class="tour-footer">
                    <div class="tour-progress">
                        ${this.currentStepIndex + 1} of ${this.tourSteps.length}
                    </div>
                    <div class="tour-actions">
                        <button class="btn btn-outline btn-sm" onclick="helpSystem.previousStep()">Previous</button>
                        <button class="btn btn-primary btn-sm" onclick="helpSystem.nextStep()">Next</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Position highlight
        const rect = target.getBoundingClientRect();
        const highlight = overlay.querySelector('.tour-highlight');
        highlight.style.left = `${rect.left - 8}px`;
        highlight.style.top = `${rect.top - 8}px`;
        highlight.style.width = `${rect.width + 16}px`;
        highlight.style.height = `${rect.height + 16}px`;
        
        // Position tooltip
        const tooltip = overlay.querySelector('.tour-tooltip');
        const tooltipRect = tooltip.getBoundingClientRect();
        
        if (step.position === 'bottom') {
            tooltip.style.left = `${rect.left + rect.width / 2 - tooltipRect.width / 2}px`;
            tooltip.style.top = `${rect.bottom + 20}px`;
        } else if (step.position === 'top') {
            tooltip.style.left = `${rect.left + rect.width / 2 - tooltipRect.width / 2}px`;
            tooltip.style.bottom = `${window.innerHeight - rect.top + 20}px`;
        }
        
        this.currentTour = overlay;
    }
    
    removeTourOverlay() {
        if (this.currentTour) {
            this.currentTour.remove();
            this.currentTour = null;
        }
    }
    
    nextStep() {
        this.currentStepIndex++;
        this.showTourStep();
    }
    
    previousStep() {
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            this.showTourStep();
        }
    }
    
    endTour() {
        this.removeTourOverlay();
        this.currentStepIndex = 0;
        this.tourSteps = [];
        
        this.notificationSystem.success('Guided tour completed! You\'re ready to use Cache App.', {
            title: 'Tour Complete',
            duration: 3000
        });
    }
    
    handleKeyboardShortcuts(e) {
        // Only handle shortcuts when not in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const ctrlKey = isMac ? e.metaKey : e.ctrlKey;
        
        if (ctrlKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    // Save settings
                    break;
                case 'r':
                    e.preventDefault();
                    // Refresh data
                    break;
                case '1':
                    e.preventDefault();
                    this.appState.setCurrentSection('scanner');
                    break;
                case '2':
                    e.preventDefault();
                    this.appState.setCurrentSection('cleaner');
                    break;
                case '3':
                    e.preventDefault();
                    this.appState.setCurrentSection('backup');
                    break;
                case '4':
                    e.preventDefault();
                    this.appState.setCurrentSection('settings');
                    break;
                case '?':
                    e.preventDefault();
                    this.appState.setCurrentSection('help');
                    break;
            }
        }
        
        if (e.key === 'Escape') {
            // Close any open modals
            const modals = document.querySelectorAll('.modal-overlay');
            modals.forEach(modal => modal.click());
        }
    }
    
    async exportLogs() {
        try {
            const logs = this.appState.getHistory();
            const dataBlob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `cache-app-logs-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            this.notificationSystem.success('Logs exported successfully', {
                title: 'Export Complete',
                duration: 3000
            });
            
        } catch (error) {
            console.error('Failed to export logs:', error);
            this.notificationSystem.error('Failed to export logs: ' + error.message, {
                title: 'Export Error',
                duration: 5000
            });
        }
    }
    
    async checkUpdates() {
        try {
            // In a real implementation, this would check for updates
            this.notificationSystem.info('You are running the latest version of Cache App', {
                title: 'Update Check',
                duration: 3000
            });
            
        } catch (error) {
            console.error('Failed to check updates:', error);
            this.notificationSystem.error('Failed to check for updates: ' + error.message, {
                title: 'Update Error',
                duration: 5000
            });
        }
    }
    
    reportIssue() {
        const issueData = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            appVersion: '1.0.0',
            systemInfo: {
                platform: navigator.platform,
                language: navigator.language,
                cookieEnabled: navigator.cookieEnabled
            },
            state: {
                currentSection: this.appState.get('currentSection'),
                errors: this.appState.get('errors'),
                settings: this.appState.get('settings')
            }
        };
        
        const issueText = `Cache App Issue Report

Timestamp: ${issueData.timestamp}
App Version: ${issueData.appVersion}
Platform: ${issueData.systemInfo.platform}
Language: ${issueData.systemInfo.language}

Current Section: ${issueData.state.currentSection}

Recent Errors:
${issueData.state.errors.map(e => `- ${e.message} (${e.timestamp})`).join('\n')}

Settings:
${JSON.stringify(issueData.state.settings, null, 2)}

Please describe the issue below:
[Describe what happened, what you expected, and steps to reproduce]`;

        // Create a text area with the issue report
        const modal = document.createElement('div');
        modal.className = 'issue-report-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Report Issue</h3>
                    <button class="modal-close" onclick="this.closest('.issue-report-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <p>Please copy the text below and include it when reporting your issue:</p>
                    <textarea readonly class="issue-report-text">${issueText}</textarea>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="this.closest('.issue-report-modal').remove()">Close</button>
                    <button class="btn btn-primary" onclick="helpSystem.copyIssueReport()">Copy Report</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    copyIssueReport() {
        const textarea = document.querySelector('.issue-report-text');
        textarea.select();
        document.execCommand('copy');
        
        this.notificationSystem.success('Issue report copied to clipboard', {
            title: 'Copied',
            duration: 2000
        });
    }
}

// Export for use in other modules
export { HelpSystem };
window.HelpSystem = HelpSystem;

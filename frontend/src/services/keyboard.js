// Keyboard Shortcuts Manager for Cache App
class KeyboardManager {
    constructor(router, appState) {
        this.router = router;
        this.appState = appState;
        this.shortcuts = new Map();
        this.enabled = true;
        this.helpVisible = false;
        
        // Define keyboard shortcuts
        this.defineShortcuts();
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    defineShortcuts() {
        // Navigation shortcuts
        this.addShortcut('nav-dashboard', {
            keys: ['ctrl+1', 'cmd+1'],
            description: 'Go to Dashboard',
            action: () => this.router.navigate('dashboard'),
            category: 'Navigation'
        });
        
        this.addShortcut('nav-scanner', {
            keys: ['ctrl+2', 'cmd+2'],
            description: 'Go to Scanner',
            action: () => this.router.navigate('scanner'),
            category: 'Navigation'
        });
        
        this.addShortcut('nav-cleaner', {
            keys: ['ctrl+3', 'cmd+3'],
            description: 'Go to Cleaner',
            action: () => this.router.navigate('cleaner'),
            category: 'Navigation'
        });
        
        this.addShortcut('nav-backup', {
            keys: ['ctrl+4', 'cmd+4'],
            description: 'Go to Backup Manager',
            action: () => this.router.navigate('backup'),
            category: 'Navigation'
        });
        
        this.addShortcut('nav-settings', {
            keys: ['ctrl+5', 'cmd+5'],
            description: 'Go to Settings',
            action: () => this.router.navigate('settings'),
            category: 'Navigation'
        });
        
        this.addShortcut('nav-help', {
            keys: ['ctrl+?', 'cmd+?'],
            description: 'Show Help',
            action: () => this.router.navigate('help'),
            category: 'Navigation'
        });
        
        // Application shortcuts
        this.addShortcut('save-settings', {
            keys: ['ctrl+s', 'cmd+s'],
            description: 'Save Settings',
            action: () => {
                this.appState.saveToStorage();
                if (window.notificationSystem) {
                    window.notificationSystem.success('Settings saved');
                }
            },
            category: 'Application'
        });
        
        this.addShortcut('refresh-data', {
            keys: ['ctrl+r', 'cmd+r'],
            description: 'Refresh Data',
            action: () => {
                if (window.loadInitialData) {
                    window.loadInitialData();
                }
            },
            category: 'Application'
        });
        
        this.addShortcut('scan-all', {
            keys: ['ctrl+shift+s', 'cmd+shift+s'],
            description: 'Scan All Safe Locations',
            action: () => {
                if (window.scanAllLocations) {
                    window.scanAllLocations();
                }
            },
            category: 'Scanner'
        });
        
        this.addShortcut('select-all-safe', {
            keys: ['ctrl+a', 'cmd+a'],
            description: 'Select All Safe Files',
            action: () => {
                if (window.selectAllSafeFiles) {
                    window.selectAllSafeFiles();
                }
            },
            category: 'Cleaner'
        });
        
        this.addShortcut('clear-selection', {
            keys: ['ctrl+shift+a', 'cmd+shift+a'],
            description: 'Clear Selection',
            action: () => {
                this.appState.clearSelection();
                if (window.notificationSystem) {
                    window.notificationSystem.info('Selection cleared');
                }
            },
            category: 'Cleaner'
        });
        
        this.addShortcut('delete-selected', {
            keys: ['ctrl+delete', 'cmd+delete'],
            description: 'Delete Selected Files',
            action: () => {
                if (window.cleanSafeFiles) {
                    window.cleanSafeFiles();
                }
            },
            category: 'Cleaner'
        });
        
        this.addShortcut('refresh-backups', {
            keys: ['ctrl+shift+r', 'cmd+shift+r'],
            description: 'Refresh Backup Data',
            action: () => {
                if (window.refreshBackupData) {
                    window.refreshBackupData();
                }
            },
            category: 'Backup'
        });
        
        this.addShortcut('cleanup-backups', {
            keys: ['ctrl+shift+d', 'cmd+shift+d'],
            description: 'Cleanup Old Backups',
            action: () => {
                if (window.cleanupOldBackups) {
                    window.cleanupOldBackups();
                }
            },
            category: 'Backup'
        });
        
        // UI shortcuts
        this.addShortcut('toggle-sidebar', {
            keys: ['ctrl+b', 'cmd+b'],
            description: 'Toggle Sidebar',
            action: () => {
                window.dispatchEvent(new CustomEvent('toggleSidebar'));
            },
            category: 'Interface'
        });
        
        this.addShortcut('toggle-theme', {
            keys: ['ctrl+shift+t', 'cmd+shift+t'],
            description: 'Toggle Theme',
            action: () => {
                const currentTheme = this.appState.get('settings')?.theme || 'auto';
                const themes = ['light', 'dark', 'auto'];
                const currentIndex = themes.indexOf(currentTheme);
                const nextIndex = (currentIndex + 1) % themes.length;
                const newTheme = themes[nextIndex];
                
                this.appState.updateSettings({ theme: newTheme });
                
                if (window.notificationSystem) {
                    window.notificationSystem.info(`Theme changed to ${newTheme}`);
                }
            },
            category: 'Interface'
        });
        
        this.addShortcut('show-shortcuts', {
            keys: ['ctrl+/', 'cmd+/'],
            description: 'Show Keyboard Shortcuts',
            action: () => this.showShortcutsHelp(),
            category: 'Help'
        });
        
        this.addShortcut('close-modal', {
            keys: ['escape'],
            description: 'Close Modal/Dialog',
            action: () => this.closeModals(),
            category: 'Interface'
        });
        
        this.addShortcut('search', {
            keys: ['ctrl+f', 'cmd+f'],
            description: 'Focus Search',
            action: () => this.focusSearch(),
            category: 'Interface'
        });
        
        this.addShortcut('export-logs', {
            keys: ['ctrl+e', 'cmd+e'],
            description: 'Export Logs',
            action: () => {
                if (window.exportLogs) {
                    window.exportLogs();
                }
            },
            category: 'Application'
        });
        
        // Stop operations
        this.addShortcut('stop-scan', {
            keys: ['ctrl+shift+escape', 'cmd+shift+escape'],
            description: 'Stop Current Operation',
            action: () => this.stopCurrentOperation(),
            category: 'Operations'
        });
    }
    
    addShortcut(id, config) {
        this.shortcuts.set(id, {
            id,
            ...config,
            enabled: true
        });
    }
    
    removeShortcut(id) {
        this.shortcuts.delete(id);
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.enabled) return;
            
            // Skip if in input fields (unless it's a global shortcut)
            if (this.isInInputField(e.target) && !this.isGlobalShortcut(e)) {
                return;
            }
            
            const shortcut = this.findMatchingShortcut(e);
            if (shortcut) {
                e.preventDefault();
                e.stopPropagation();
                
                try {
                    shortcut.action();
                } catch (error) {
                    console.error(`Error executing shortcut ${shortcut.id}:`, error);
                    if (window.notificationSystem) {
                        window.notificationSystem.error(`Shortcut error: ${error.message}`);
                    }
                }
            }
        });
    }
    
    isInInputField(element) {
        const tagName = element.tagName.toLowerCase();
        const inputTypes = ['input', 'textarea', 'select'];
        
        if (inputTypes.includes(tagName)) {
            return true;
        }
        
        // Check if element is contenteditable
        if (element.contentEditable === 'true') {
            return true;
        }
        
        return false;
    }
    
    isGlobalShortcut(event) {
        // Some shortcuts should work even in input fields
        const globalShortcuts = ['escape', 'ctrl+s', 'cmd+s', 'ctrl+/', 'cmd+/'];
        const keyCombo = this.getKeyCombo(event);
        return globalShortcuts.includes(keyCombo);
    }
    
    findMatchingShortcut(event) {
        const keyCombo = this.getKeyCombo(event);
        
        for (const [id, shortcut] of this.shortcuts) {
            if (!shortcut.enabled) continue;
            
            if (shortcut.keys.includes(keyCombo)) {
                return shortcut;
            }
        }
        
        return null;
    }
    
    getKeyCombo(event) {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const ctrlKey = isMac ? event.metaKey : event.ctrlKey;
        
        const parts = [];
        
        if (ctrlKey) parts.push(isMac ? 'cmd' : 'ctrl');
        if (event.altKey) parts.push('alt');
        if (event.shiftKey) parts.push('shift');
        
        // Handle special keys
        let key = event.key.toLowerCase();
        if (event.code.startsWith('Key')) {
            key = event.code.slice(3).toLowerCase();
        }
        
        // Map special keys
        const specialKeys = {
            ' ': 'space',
            'escape': 'escape',
            'enter': 'enter',
            'tab': 'tab',
            'backspace': 'backspace',
            'delete': 'delete',
            'arrowup': 'up',
            'arrowdown': 'down',
            'arrowleft': 'left',
            'arrowright': 'right'
        };
        
        key = specialKeys[key] || key;
        parts.push(key);
        
        return parts.join('+');
    }
    
    showShortcutsHelp() {
        this.helpVisible = true;
        this.createShortcutsModal();
    }
    
    createShortcutsModal() {
        const modal = document.createElement('div');
        modal.className = 'shortcuts-modal-overlay';
        modal.innerHTML = `
            <div class="shortcuts-modal">
                <div class="shortcuts-header">
                    <h2>Keyboard Shortcuts</h2>
                    <button class="modal-close" id="closeShortcutsModal">×</button>
                </div>
                <div class="shortcuts-content">
                    ${this.createShortcutsContent()}
                </div>
                <div class="shortcuts-footer">
                    <button class="btn btn-primary" id="closeShortcutsModal">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.closest('#closeShortcutsModal')) {
                this.closeShortcutsModal(modal);
            }
        });
        
        // Focus modal for accessibility
        modal.querySelector('.shortcuts-modal').focus();
    }
    
    createShortcutsContent() {
        const categories = {};
        
        // Group shortcuts by category
        for (const [id, shortcut] of this.shortcuts) {
            if (!shortcut.enabled) continue;
            
            if (!categories[shortcut.category]) {
                categories[shortcut.category] = [];
            }
            categories[shortcut.category].push(shortcut);
        }
        
        return Object.entries(categories).map(([category, shortcuts]) => `
            <div class="shortcuts-category">
                <h3>${category}</h3>
                <div class="shortcuts-list">
                    ${shortcuts.map(shortcut => `
                        <div class="shortcut-item">
                            <div class="shortcut-keys">
                                ${shortcut.keys.map(key => `<kbd>${this.formatKey(key)}</kbd>`).join(' or ')}
                            </div>
                            <div class="shortcut-description">${shortcut.description}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }
    
    formatKey(key) {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        return key
            .replace('ctrl', isMac ? '⌘' : 'Ctrl')
            .replace('cmd', '⌘')
            .replace('shift', '⇧')
            .replace('alt', '⌥')
            .replace('+', ' ');
    }
    
    closeShortcutsModal(modal) {
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
        this.helpVisible = false;
    }
    
    closeModals() {
        // Close any open modals
        const modals = document.querySelectorAll('.modal-overlay, .shortcuts-modal-overlay');
        modals.forEach(modal => modal.click());
        
        // Close any dropdowns
        const dropdowns = document.querySelectorAll('.dropdown.open');
        dropdowns.forEach(dropdown => dropdown.classList.remove('open'));
    }
    
    focusSearch() {
        const searchInputs = document.querySelectorAll('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search"]');
        if (searchInputs.length > 0) {
            searchInputs[0].focus();
        } else {
            // Create a temporary search if none exists
            const currentSection = this.router.getCurrentSection();
            if (window.notificationSystem) {
                window.notificationSystem.info(`No search available in ${currentSection}`);
            }
        }
    }
    
    stopCurrentOperation() {
        const isScanning = this.appState.get('isScanning');
        
        if (isScanning) {
            if (window.stopScan) {
                window.stopScan();
            }
            if (window.notificationSystem) {
                window.notificationSystem.info('Scan stopped');
            }
        } else {
            if (window.notificationSystem) {
                window.notificationSystem.info('No operation to stop');
            }
        }
    }
    
    enable() {
        this.enabled = true;
    }
    
    disable() {
        this.enabled = false;
    }
    
    toggle() {
        this.enabled = !this.enabled;
        if (window.notificationSystem) {
            window.notificationSystem.info(`Keyboard shortcuts ${this.enabled ? 'enabled' : 'disabled'}`);
        }
    }
    
    getShortcuts() {
        return Array.from(this.shortcuts.values());
    }
    
    getShortcutsByCategory() {
        const categories = {};
        
        for (const [id, shortcut] of this.shortcuts) {
            if (!categories[shortcut.category]) {
                categories[shortcut.category] = [];
            }
            categories[shortcut.category].push(shortcut);
        }
        
        return categories;
    }
}

// Create global keyboard manager instance
window.keyboardManager = new KeyboardManager(window.router, window.appState);

// Export for use in other modules
export { KeyboardManager };
window.KeyboardManager = KeyboardManager;

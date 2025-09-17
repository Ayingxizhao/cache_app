// Breadcrumb Navigation Component for Cache App
class Breadcrumbs {
    constructor(router, appState) {
        this.router = router;
        this.appState = appState;
        this.container = null;
        this.currentBreadcrumb = [];
        
        // Subscribe to route changes
        this.router.subscribe((currentRoute, previousRoute) => {
            this.updateBreadcrumb(currentRoute);
        });
    }
    
    createBreadcrumbHTML(breadcrumbItems = []) {
        if (!breadcrumbItems || breadcrumbItems.length === 0) {
            return '';
        }
        
        return `
            <nav class="breadcrumbs" aria-label="Breadcrumb navigation">
                <ol class="breadcrumb-list">
                    ${breadcrumbItems.map((item, index) => {
                        const isLast = index === breadcrumbItems.length - 1;
                        const isClickable = !isLast && item.route;
                        
                        return `
                            <li class="breadcrumb-item ${isLast ? 'active' : ''}">
                                ${isClickable ? `
                                    <button class="breadcrumb-link" data-route="${item.route}" title="Navigate to ${item.label}">
                                        ${item.icon ? `<span class="breadcrumb-icon">${item.icon}</span>` : ''}
                                        <span class="breadcrumb-text">${this.escapeHtml(item.label)}</span>
                                    </button>
                                ` : `
                                    <span class="breadcrumb-text">
                                        ${item.icon ? `<span class="breadcrumb-icon">${item.icon}</span>` : ''}
                                        ${this.escapeHtml(item.label)}
                                    </span>
                                `}
                                ${!isLast ? '<span class="breadcrumb-separator">›</span>' : ''}
                            </li>
                        `;
                    }).join('')}
                </ol>
                
                ${this.createQuickActions()}
            </nav>
        `;
    }
    
    createQuickActions() {
        const currentRoute = this.router.getCurrentRoute();
        if (!currentRoute) return '';
        
        const quickActions = this.getQuickActionsForRoute(currentRoute.name);
        if (!quickActions || quickActions.length === 0) return '';
        
        return `
            <div class="breadcrumb-actions">
                ${quickActions.map(action => `
                    <button class="breadcrumb-action ${action.class || ''}" 
                            data-action="${action.action}"
                            title="${action.title}">
                        <span class="action-icon">${action.icon}</span>
                        <span class="action-text">${action.label}</span>
                    </button>
                `).join('')}
            </div>
        `;
    }
    
    getQuickActionsForRoute(routeName) {
        const actions = {
            'scanner': [
                {
                    icon: '🔄',
                    label: 'Refresh',
                    action: 'refresh-locations',
                    title: 'Refresh cache locations'
                },
                {
                    icon: '🌐',
                    label: 'Scan All',
                    action: 'scan-all',
                    title: 'Scan all safe locations'
                }
            ],
            'cleaner': [
                {
                    icon: '🔄',
                    label: 'Refresh',
                    action: 'refresh-results',
                    title: 'Refresh scan results'
                },
                {
                    icon: '☑️',
                    label: 'Select All',
                    action: 'select-all-safe',
                    title: 'Select all safe files'
                }
            ],
            'backup': [
                {
                    icon: '🔄',
                    label: 'Refresh',
                    action: 'refresh-backups',
                    title: 'Refresh backup data'
                },
                {
                    icon: '🗑️',
                    label: 'Cleanup',
                    action: 'cleanup-old',
                    title: 'Cleanup old backups'
                }
            ],
            'settings': [
                {
                    icon: '💾',
                    label: 'Save',
                    action: 'save-settings',
                    title: 'Save current settings'
                },
                {
                    icon: '🔄',
                    label: 'Reset',
                    action: 'reset-settings',
                    title: 'Reset to defaults'
                }
            ]
        };
        
        return actions[routeName] || [];
    }
    
    updateBreadcrumb(route) {
        if (!route) return;
        
        this.currentBreadcrumb = this.buildBreadcrumbItems(route);
        this.render();
    }
    
    buildBreadcrumbItems(route) {
        const items = [];
        
        // Add home/dashboard
        items.push({
            label: 'Home',
            icon: '🏠',
            route: 'dashboard'
        });
        
        // Add section-based breadcrumb
        if (route.section && route.section !== 'dashboard') {
            const sectionRoute = this.router.getRoute(route.section);
            if (sectionRoute && sectionRoute.name !== route.name) {
                items.push({
                    label: sectionRoute.title,
                    icon: sectionRoute.icon,
                    route: sectionRoute.name
                });
            }
        }
        
        // Add current route if different from section
        if (route.name && route.name !== route.section) {
            items.push({
                label: route.title,
                icon: route.icon,
                route: null // Current page, not clickable
            });
        }
        
        // Add dynamic breadcrumb items based on route parameters
        this.addDynamicBreadcrumbItems(items, route);
        
        return items;
    }
    
    addDynamicBreadcrumbItems(items, route) {
        // Add location-specific breadcrumbs
        if (route.params?.id && route.name === 'scanner-location') {
            const location = this.getLocationById(route.params.id);
            if (location) {
                items.push({
                    label: location.name || 'Location',
                    icon: '📁',
                    route: null
                });
            }
        }
        
        // Add session-specific breadcrumbs
        if (route.params?.id && route.name === 'backup-session') {
            const session = this.getBackupSessionById(route.params.id);
            if (session) {
                items.push({
                    label: session.name || 'Session',
                    icon: '💿',
                    route: null
                });
            }
        }
        
        // Add results breadcrumb for cleaner
        if (route.name === 'cleaner-results') {
            const scanResults = this.appState.get('scanResults');
            if (scanResults && scanResults.totals) {
                items.push({
                    label: `${scanResults.totals.files} Files`,
                    icon: '📊',
                    route: null
                });
            }
        }
    }
    
    getLocationById(id) {
        const locations = this.appState.get('cacheLocations');
        return locations?.find(loc => loc.id === id);
    }
    
    getBackupSessionById(id) {
        const sessions = this.appState.get('backupSessions');
        return sessions?.find(session => session.id === id);
    }
    
    render(container = null) {
        const targetContainer = container || this.container;
        if (!targetContainer) return;
        
        targetContainer.innerHTML = this.createBreadcrumbHTML(this.currentBreadcrumb);
        
        // Add event listeners
        this.setupEventListeners(targetContainer);
    }
    
    setupEventListeners(container) {
        // Handle breadcrumb navigation
        container.addEventListener('click', (e) => {
            const breadcrumbLink = e.target.closest('.breadcrumb-link');
            if (breadcrumbLink) {
                e.preventDefault();
                const route = breadcrumbLink.dataset.route;
                if (route) {
                    this.router.navigate(route);
                }
            }
            
            // Handle quick actions
            const actionButton = e.target.closest('.breadcrumb-action');
            if (actionButton) {
                e.preventDefault();
                const action = actionButton.dataset.action;
                this.handleQuickAction(action);
            }
        });
    }
    
    handleQuickAction(action) {
        switch (action) {
            case 'refresh-locations':
                if (window.loadInitialData) {
                    window.loadInitialData();
                }
                break;
            case 'scan-all':
                if (window.scanAllLocations) {
                    window.scanAllLocations();
                }
                break;
            case 'refresh-results':
                const lastResult = this.appState.get('lastScanResult');
                if (lastResult) {
                    this.appState.setScanResults(lastResult);
                }
                break;
            case 'select-all-safe':
                if (window.selectAllSafeFiles) {
                    window.selectAllSafeFiles();
                }
                break;
            case 'refresh-backups':
                if (window.refreshBackupData) {
                    window.refreshBackupData();
                }
                break;
            case 'cleanup-old':
                if (window.cleanupOldBackups) {
                    window.cleanupOldBackups();
                }
                break;
            case 'save-settings':
                this.appState.saveToStorage();
                if (window.notificationSystem) {
                    window.notificationSystem.success('Settings saved');
                }
                break;
            case 'reset-settings':
                this.appState.resetSettings();
                if (window.notificationSystem) {
                    window.notificationSystem.info('Settings reset to defaults');
                }
                break;
        }
    }
    
    attachTo(container) {
        this.container = container;
        this.render();
    }
    
    detach() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.container = null;
    }
    
    getCurrentBreadcrumb() {
        return [...this.currentBreadcrumb];
    }
    
    // Utility methods
    escapeHtml(input) {
        if (input === null || input === undefined) return '';
        return String(input)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    
    // Update breadcrumb when state changes
    updateFromState() {
        const currentRoute = this.router.getCurrentRoute();
        if (currentRoute) {
            this.updateBreadcrumb(currentRoute);
        }
    }
}

// Export for use in other modules
export { Breadcrumbs };
window.Breadcrumbs = Breadcrumbs;

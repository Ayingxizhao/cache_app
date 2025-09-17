// Sidebar Navigation Component for Cache App
class Sidebar {
    constructor(router, appState) {
        this.router = router;
        this.appState = appState;
        this.container = null;
        this.isCollapsed = false;
        this.currentSection = null;
        
        // Subscribe to route changes
        this.router.subscribe((currentRoute, previousRoute) => {
            this.updateActiveSection(currentRoute);
        });
        
        // Subscribe to app state changes
        this.appState.subscribe('systemStatus', (status) => {
            this.updateSystemStatus(status);
        });
    }
    
    createSidebarHTML() {
        return `
            <aside class="app-sidebar ${this.isCollapsed ? 'collapsed' : ''}" id="appSidebar">
                <div class="sidebar-header">
                    <div class="sidebar-logo">
                        <div class="logo-icon">🗂️</div>
                        ${!this.isCollapsed ? `
                            <div class="logo-text">
                                <h3>Cache App</h3>
                                <p>macOS Cache Manager</p>
                            </div>
                        ` : ''}
                    </div>
                    <button class="sidebar-toggle" id="sidebarToggle" title="${this.isCollapsed ? 'Expand' : 'Collapse'} sidebar">
                        <span class="toggle-icon">${this.isCollapsed ? '▶' : '◀'}</span>
                    </button>
                </div>
                
                <div class="sidebar-content">
                    ${this.createNavigationSections()}
                    ${this.createSystemStatus()}
                    ${this.createQuickStats()}
                </div>
                
                <div class="sidebar-footer">
                    ${this.createFooterActions()}
                </div>
            </aside>
        `;
    }
    
    createNavigationSections() {
        const sections = this.getNavigationSections();
        
        return `
            <nav class="sidebar-navigation" aria-label="Main navigation">
                ${sections.map(section => `
                    <div class="nav-section ${this.currentSection === section.id ? 'active' : ''}" data-section="${section.id}">
                        <div class="nav-section-header">
                            <span class="section-icon">${section.icon}</span>
                            ${!this.isCollapsed ? `<span class="section-title">${section.title}</span>` : ''}
                        </div>
                        
                        <div class="nav-section-items">
                            ${section.items.map(item => `
                                <button class="nav-item ${item.active ? 'active' : ''}" 
                                        data-route="${item.route}"
                                        title="${item.description}">
                                    <span class="item-icon">${item.icon}</span>
                                    ${!this.isCollapsed ? `
                                        <span class="item-text">${item.title}</span>
                                        ${item.badge ? `<span class="item-badge">${item.badge}</span>` : ''}
                                    ` : ''}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </nav>
        `;
    }
    
    getNavigationSections() {
        const currentRoute = this.router.getCurrentRoute();
        const routes = this.router.getAllRoutes();
        
        // Group routes by section
        const sections = {
            'main': {
                id: 'main',
                title: 'Main',
                icon: '🏠',
                items: []
            },
            'tools': {
                id: 'tools',
                title: 'Tools',
                icon: '🔧',
                items: []
            },
            'management': {
                id: 'management',
                title: 'Management',
                icon: '⚙️',
                items: []
            },
            'support': {
                id: 'support',
                title: 'Support',
                icon: '❓',
                items: []
            }
        };
        
        // Categorize routes
        routes.forEach(route => {
            if (route.name === 'dashboard' || route.name === 'scanner') {
                sections.main.items.push({
                    route: route.name,
                    title: route.title,
                    icon: route.icon,
                    description: route.description,
                    active: currentRoute?.name === route.name,
                    badge: this.getRouteBadge(route.name)
                });
            } else if (route.name === 'cleaner' || route.name === 'backup') {
                sections.tools.items.push({
                    route: route.name,
                    title: route.title,
                    icon: route.icon,
                    description: route.description,
                    active: currentRoute?.name === route.name,
                    badge: this.getRouteBadge(route.name)
                });
            } else if (route.name === 'settings') {
                sections.management.items.push({
                    route: route.name,
                    title: route.title,
                    icon: route.icon,
                    description: route.description,
                    active: currentRoute?.name === route.name,
                    badge: this.getRouteBadge(route.name)
                });
            } else if (route.name === 'help') {
                sections.support.items.push({
                    route: route.name,
                    title: route.title,
                    icon: route.icon,
                    description: route.description,
                    active: currentRoute?.name === route.name,
                    badge: this.getRouteBadge(route.name)
                });
            }
        });
        
        // Filter out empty sections
        return Object.values(sections).filter(section => section.items.length > 0);
    }
    
    getRouteBadge(routeName) {
        switch (routeName) {
            case 'scanner':
                const isScanning = this.appState.get('isScanning');
                return isScanning ? '●' : null;
            case 'cleaner':
                const selectedCount = this.appState.getSelectedFilesCount();
                return selectedCount > 0 ? selectedCount.toString() : null;
            case 'backup':
                const backupCount = this.appState.get('backupStats')?.totalSessions || 0;
                return backupCount > 0 ? backupCount.toString() : null;
            default:
                return null;
        }
    }
    
    createSystemStatus() {
        const systemStatus = this.appState.get('systemStatus');
        const systemMessage = this.appState.get('systemMessage');
        
        return `
            <div class="sidebar-status">
                <div class="status-indicator">
                    <span class="status-dot ${systemStatus}"></span>
                    ${!this.isCollapsed ? `
                        <div class="status-info">
                            <span class="status-text">${systemMessage}</span>
                            <span class="status-time">${new Date().toLocaleTimeString()}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    createQuickStats() {
        if (this.isCollapsed) return '';
        
        const scanResults = this.appState.get('scanResults');
        const backupStats = this.appState.get('backupStats');
        
        return `
            <div class="sidebar-stats">
                <div class="stats-header">
                    <span class="stats-icon">📊</span>
                    <span class="stats-title">Quick Stats</span>
                </div>
                
                <div class="stats-items">
                    <div class="stat-item">
                        <span class="stat-label">Files Found</span>
                        <span class="stat-value">${scanResults?.totals?.files || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total Size</span>
                        <span class="stat-value">${this.formatBytes(scanResults?.totals?.size || 0)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Backups</span>
                        <span class="stat-value">${backupStats?.totalSessions || 0}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    createFooterActions() {
        return `
            <div class="sidebar-footer-actions">
                ${!this.isCollapsed ? `
                    <button class="footer-action" id="toggleTheme" title="Toggle theme">
                        <span class="action-icon">🌙</span>
                        <span class="action-text">Theme</span>
                    </button>
                ` : ''}
                
                <button class="footer-action" id="sidebarHelp" title="Help">
                    <span class="action-icon">❓</span>
                    ${!this.isCollapsed ? '<span class="action-text">Help</span>' : ''}
                </button>
                
                ${!this.isCollapsed ? `
                    <button class="footer-action" id="sidebarSettings" title="Settings">
                        <span class="action-icon">⚙️</span>
                        <span class="action-text">Settings</span>
                    </button>
                ` : ''}
            </div>
        `;
    }
    
    updateActiveSection(currentRoute) {
        if (!currentRoute) return;
        
        this.currentSection = currentRoute.section;
        this.render();
    }
    
    updateSystemStatus(status) {
        const statusDot = this.container?.querySelector('.status-dot');
        const statusText = this.container?.querySelector('.status-text');
        
        if (statusDot) {
            statusDot.className = `status-dot ${status}`;
        }
        
        if (statusText) {
            statusText.textContent = this.appState.get('systemMessage');
        }
    }
    
    toggleCollapsed() {
        this.isCollapsed = !this.isCollapsed;
        this.render();
        
        // Save preference
        localStorage.setItem('sidebarCollapsed', this.isCollapsed.toString());
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('sidebarToggle', {
            detail: { collapsed: this.isCollapsed }
        }));
    }
    
    setCollapsed(collapsed) {
        this.isCollapsed = collapsed;
        this.render();
    }
    
    render(container = null) {
        const targetContainer = container || this.container;
        if (!targetContainer) return;
        
        targetContainer.innerHTML = this.createSidebarHTML();
        
        // Add event listeners
        this.setupEventListeners(targetContainer);
        
        // Load collapsed state
        const savedCollapsed = localStorage.getItem('sidebarCollapsed');
        if (savedCollapsed === 'true') {
            this.setCollapsed(true);
        }
    }
    
    setupEventListeners(container) {
        // Handle navigation clicks
        container.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                e.preventDefault();
                const route = navItem.dataset.route;
                if (route) {
                    this.router.navigate(route);
                }
            }
            
            // Handle sidebar toggle
            const toggleButton = e.target.closest('#sidebarToggle');
            if (toggleButton) {
                e.preventDefault();
                this.toggleCollapsed();
            }
            
            // Handle footer actions
            const footerAction = e.target.closest('.footer-action');
            if (footerAction) {
                e.preventDefault();
                const actionId = footerAction.id;
                this.handleFooterAction(actionId);
            }
        });
        
        // Handle keyboard navigation
        container.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isCollapsed) {
                this.setCollapsed(false);
            }
        });
    }
    
    handleFooterAction(actionId) {
        switch (actionId) {
            case 'toggleTheme':
                this.toggleTheme();
                break;
            case 'sidebarHelp':
                this.router.navigate('help');
                break;
            case 'sidebarSettings':
                this.router.navigate('settings');
                break;
        }
    }
    
    toggleTheme() {
        const currentTheme = this.appState.get('settings')?.theme || 'auto';
        const themes = ['light', 'dark', 'auto'];
        const currentIndex = themes.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const newTheme = themes[nextIndex];
        
        this.appState.updateSettings({ theme: newTheme });
        
        if (window.notificationSystem) {
            window.notificationSystem.info(`Theme changed to ${newTheme}`);
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
    
    // Utility methods
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    // Update stats when state changes
    updateStats() {
        if (this.isCollapsed) return;
        
        const statValues = this.container?.querySelectorAll('.stat-value');
        if (!statValues) return;
        
        const scanResults = this.appState.get('scanResults');
        const backupStats = this.appState.get('backupStats');
        
        // Update files found
        if (statValues[0]) {
            statValues[0].textContent = scanResults?.totals?.files || 0;
        }
        
        // Update total size
        if (statValues[1]) {
            statValues[1].textContent = this.formatBytes(scanResults?.totals?.size || 0);
        }
        
        // Update backups
        if (statValues[2]) {
            statValues[2].textContent = backupStats?.totalSessions || 0;
        }
    }
    
    // Subscribe to relevant state changes
    subscribeToStateChanges() {
        this.appState.subscribe('scanResults', () => {
            this.updateStats();
            this.render(); // Re-render to update badges
        });
        
        this.appState.subscribe('selectedFiles', () => {
            this.render(); // Re-render to update badges
        });
        
        this.appState.subscribe('backupStats', () => {
            this.updateStats();
            this.render(); // Re-render to update badges
        });
    }
}

// Export for use in other modules
export { Sidebar };
window.Sidebar = Sidebar;

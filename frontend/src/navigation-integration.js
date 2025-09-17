// Navigation Integration Helper for Cache App
// This file provides utilities to help integrate the new navigation system

class NavigationIntegration {
    constructor() {
        this.isInitialized = false;
        this.components = {
            router: null,
            breadcrumbs: null,
            sidebar: null,
            keyboardManager: null,
            pageStateManager: null
        };
    }
    
    // Initialize all navigation components
    async initialize(appState, notificationSystem) {
        if (this.isInitialized) {
            console.warn('Navigation integration already initialized');
            return;
        }
        
        try {
            // Initialize router
            this.components.router = window.router;
            
            // Initialize page state manager
            this.components.pageStateManager = window.pageStateManager;
            
            // Initialize keyboard manager
            this.components.keyboardManager = window.keyboardManager;
            
            // Initialize breadcrumbs
            if (window.Breadcrumbs) {
                this.components.breadcrumbs = new window.Breadcrumbs(this.components.router, appState);
            }
            
            // Initialize sidebar
            if (window.Sidebar) {
                this.components.sidebar = new window.Sidebar(this.components.router, appState);
            }
            
            // Set up global event listeners
            this.setupGlobalListeners();
            
            this.isInitialized = true;
            console.log('Navigation integration initialized successfully');
            
            if (notificationSystem) {
                notificationSystem.success('Navigation system ready', {
                    title: 'System Ready',
                    duration: 3000
                });
            }
            
        } catch (error) {
            console.error('Failed to initialize navigation integration:', error);
            if (notificationSystem) {
                notificationSystem.error('Failed to initialize navigation system: ' + error.message);
            }
            throw error;
        }
    }
    
    setupGlobalListeners() {
        // Handle sidebar toggle from keyboard shortcuts
        window.addEventListener('toggleSidebar', () => {
            if (this.components.sidebar) {
                this.components.sidebar.toggleCollapsed();
            }
        });
        
        // Handle main layout updates when sidebar state changes
        window.addEventListener('sidebarToggle', (event) => {
            this.updateMainLayout(event.detail.collapsed);
        });
        
        // Handle responsive design
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
    }
    
    updateMainLayout(sidebarCollapsed) {
        const mainLayout = document.querySelector('.main-layout');
        if (mainLayout) {
            if (sidebarCollapsed) {
                mainLayout.classList.add('sidebar-collapsed');
            } else {
                mainLayout.classList.remove('sidebar-collapsed');
            }
        }
    }
    
    handleResize() {
        const isMobile = window.innerWidth <= 768;
        const sidebar = document.querySelector('.app-sidebar');
        
        if (isMobile) {
            // On mobile, sidebar should be hidden by default
            if (sidebar && !sidebar.classList.contains('open')) {
                sidebar.style.transform = 'translateX(-100%)';
            }
        } else {
            // On desktop, restore sidebar position
            if (sidebar) {
                sidebar.style.transform = '';
            }
        }
    }
    
    // Attach components to DOM elements
    attachComponents() {
        // Attach sidebar
        const sidebarContainer = document.getElementById('sidebarContainer');
        if (sidebarContainer && this.components.sidebar) {
            this.components.sidebar.attachTo(sidebarContainer);
            this.components.sidebar.subscribeToStateChanges();
        }
        
        // Attach breadcrumbs
        const breadcrumbContainer = document.getElementById('breadcrumbContainer');
        if (breadcrumbContainer && this.components.breadcrumbs) {
            this.components.breadcrumbs.attachTo(breadcrumbContainer);
        }
    }
    
    // Navigation helpers
    navigateTo(routeName, params = {}, query = {}) {
        if (this.components.router) {
            return this.components.router.navigate(routeName, params, query);
        }
        return false;
    }
    
    getCurrentRoute() {
        return this.components.router ? this.components.router.getCurrentRoute() : null;
    }
    
    getBreadcrumb() {
        const currentRoute = this.getCurrentRoute();
        return currentRoute ? this.components.router.getBreadcrumb(currentRoute.name) : [];
    }
    
    // Sidebar helpers
    toggleSidebar() {
        if (this.components.sidebar) {
            this.components.sidebar.toggleCollapsed();
        }
    }
    
    setSidebarCollapsed(collapsed) {
        if (this.components.sidebar) {
            this.components.sidebar.setCollapsed(collapsed);
        }
    }
    
    // Keyboard shortcuts helpers
    showKeyboardShortcuts() {
        if (this.components.keyboardManager) {
            this.components.keyboardManager.showShortcutsHelp();
        }
    }
    
    toggleKeyboardShortcuts() {
        if (this.components.keyboardManager) {
            this.components.keyboardManager.toggle();
        }
    }
    
    // Page state helpers
    saveCurrentPageState() {
        if (this.components.pageStateManager) {
            this.components.pageStateManager.saveCurrentPageState();
        }
    }
    
    loadPageState(routeName) {
        if (this.components.pageStateManager) {
            return this.components.pageStateManager.loadPageState(routeName);
        }
        return null;
    }
    
    clearPageState(routeName) {
        if (this.components.pageStateManager) {
            this.components.pageStateManager.clearPageState(routeName);
        }
    }
    
    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Check if navigation is ready
    isReady() {
        return this.isInitialized && 
               this.components.router && 
               this.components.keyboardManager && 
               this.components.pageStateManager;
    }
    
    // Get component status
    getStatus() {
        return {
            initialized: this.isInitialized,
            components: {
                router: !!this.components.router,
                breadcrumbs: !!this.components.breadcrumbs,
                sidebar: !!this.components.sidebar,
                keyboardManager: !!this.components.keyboardManager,
                pageStateManager: !!this.components.pageStateManager
            }
        };
    }
    
    // Cleanup method
    cleanup() {
        if (this.components.breadcrumbs) {
            this.components.breadcrumbs.detach();
        }
        
        if (this.components.sidebar) {
            this.components.sidebar.detach();
        }
        
        this.isInitialized = false;
        this.components = {
            router: null,
            breadcrumbs: null,
            sidebar: null,
            keyboardManager: null,
            pageStateManager: null
        };
    }
}

// Create global navigation integration instance
window.navigationIntegration = new NavigationIntegration();

// Export for use in other modules
export { NavigationIntegration };
window.NavigationIntegration = NavigationIntegration;

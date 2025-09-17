// Client-side routing service for Cache App
class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.history = [];
        this.listeners = new Set();
        this.defaultRoute = 'dashboard';
        
        // Define application routes
        this.defineRoutes();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize with current route
        this.handleInitialRoute();
    }
    
    defineRoutes() {
        // Main application routes
        this.addRoute('dashboard', {
            path: '/dashboard',
            title: 'Dashboard',
            section: 'scanner',
            component: 'DashboardView',
            icon: '🏠',
            description: 'Overview of cache scanning and system status',
            breadcrumb: ['Home'],
            keyboard: '1'
        });
        
        this.addRoute('scanner', {
            path: '/scanner',
            title: 'Cache Scanner',
            section: 'scanner',
            component: 'ScannerView',
            icon: '🔍',
            description: 'Scan and analyze cache locations',
            breadcrumb: ['Scanner'],
            keyboard: '2'
        });
        
        this.addRoute('cleaner', {
            path: '/cleaner',
            title: 'Cache Cleaner',
            section: 'cleaner',
            component: 'CleanerView',
            icon: '🧹',
            description: 'Clean and delete cache files safely',
            breadcrumb: ['Cleaner'],
            keyboard: '3'
        });
        
        this.addRoute('backup', {
            path: '/backup',
            title: 'Backup Manager',
            section: 'backup',
            component: 'BackupView',
            icon: '💾',
            description: 'Manage backup sessions and restore files',
            breadcrumb: ['Backup'],
            keyboard: '4'
        });
        
        this.addRoute('settings', {
            path: '/settings',
            title: 'Settings',
            section: 'settings',
            component: 'SettingsView',
            icon: '⚙️',
            description: 'Configure app preferences and policies',
            breadcrumb: ['Settings'],
            keyboard: '5'
        });
        
        this.addRoute('help', {
            path: '/help',
            title: 'Help & Documentation',
            section: 'help',
            component: 'HelpView',
            icon: '❓',
            description: 'Documentation and support',
            breadcrumb: ['Help'],
            keyboard: '?'
        });
        
        // Sub-routes for complex workflows
        this.addRoute('scanner-location', {
            path: '/scanner/location/:id',
            title: 'Scan Location',
            section: 'scanner',
            component: 'LocationScanView',
            icon: '📁',
            description: 'Scan specific cache location',
            breadcrumb: ['Scanner', 'Location'],
            parent: 'scanner'
        });
        
        this.addRoute('cleaner-results', {
            path: '/cleaner/results',
            title: 'Scan Results',
            section: 'cleaner',
            component: 'CleanerResultsView',
            icon: '📊',
            description: 'Review scan results for cleaning',
            breadcrumb: ['Cleaner', 'Results'],
            parent: 'cleaner'
        });
        
        this.addRoute('backup-session', {
            path: '/backup/session/:id',
            title: 'Backup Session',
            section: 'backup',
            component: 'BackupSessionView',
            icon: '💿',
            description: 'View backup session details',
            breadcrumb: ['Backup', 'Session'],
            parent: 'backup'
        });
        
        this.addRoute('settings-advanced', {
            path: '/settings/advanced',
            title: 'Advanced Settings',
            section: 'settings',
            component: 'AdvancedSettingsView',
            icon: '🔧',
            description: 'Advanced configuration options',
            breadcrumb: ['Settings', 'Advanced'],
            parent: 'settings'
        });
    }
    
    addRoute(name, config) {
        this.routes.set(name, {
            name,
            ...config,
            params: {},
            query: {}
        });
    }
    
    setupEventListeners() {
        // Handle browser back/forward
        window.addEventListener('popstate', (event) => {
            this.handleRouteChange(event.state?.route || this.defaultRoute);
        });
        
        // Handle hash changes
        window.addEventListener('hashchange', (event) => {
            const hash = window.location.hash.substring(1);
            if (hash) {
                this.handleRouteChange(hash);
            }
        });
    }
    
    handleInitialRoute() {
        // Check for hash-based routing first
        const hash = window.location.hash.substring(1);
        if (hash && this.routes.has(hash)) {
            this.navigate(hash);
            return;
        }
        
        // Check for path-based routing
        const path = window.location.pathname;
        const route = this.findRouteByPath(path);
        if (route) {
            this.navigate(route.name);
            return;
        }
        
        // Default to dashboard
        this.navigate(this.defaultRoute);
    }
    
    findRouteByPath(path) {
        for (const [name, route] of this.routes) {
            if (this.matchesPath(route.path, path)) {
                return { ...route, name };
            }
        }
        return null;
    }
    
    matchesPath(routePath, currentPath) {
        // Simple path matching (could be enhanced with regex for params)
        if (routePath === currentPath) {
            return true;
        }
        
        // Handle parameterized routes
        const routeParts = routePath.split('/');
        const currentParts = currentPath.split('/');
        
        if (routeParts.length !== currentParts.length) {
            return false;
        }
        
        for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(':')) {
                continue; // Parameter match
            }
            if (routeParts[i] !== currentParts[i]) {
                return false;
            }
        }
        
        return true;
    }
    
    navigate(routeName, params = {}, query = {}) {
        const route = this.routes.get(routeName);
        if (!route) {
            console.error(`Route not found: ${routeName}`);
            return false;
        }
        
        // Add to history
        this.history.push({
            route: this.currentRoute,
            timestamp: Date.now()
        });
        
        // Limit history size
        if (this.history.length > 50) {
            this.history.shift();
        }
        
        // Update current route
        const previousRoute = this.currentRoute;
        this.currentRoute = {
            ...route,
            params: { ...params },
            query: { ...query }
        };
        
        // Update URL
        this.updateURL();
        
        // Notify listeners
        this.notifyRouteChange(this.currentRoute, previousRoute);
        
        return true;
    }
    
    updateURL() {
        if (!this.currentRoute) return;
        
        let path = this.currentRoute.path;
        
        // Replace parameters in path
        Object.entries(this.currentRoute.params).forEach(([key, value]) => {
            path = path.replace(`:${key}`, encodeURIComponent(value));
        });
        
        // Add query parameters
        const queryString = this.buildQueryString(this.currentRoute.query);
        if (queryString) {
            path += `?${queryString}`;
        }
        
        // Update URL without triggering navigation
        if (window.history.pushState) {
            window.history.pushState(
                { route: this.currentRoute.name },
                this.currentRoute.title,
                path
            );
        }
    }
    
    buildQueryString(query) {
        return Object.entries(query)
            .filter(([key, value]) => value !== null && value !== undefined)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
    }
    
    handleRouteChange(routeName) {
        this.navigate(routeName);
    }
    
    subscribe(callback) {
        this.listeners.add(callback);
        
        // Return unsubscribe function
        return () => {
            this.listeners.delete(callback);
        };
    }
    
    notifyRouteChange(currentRoute, previousRoute) {
        this.listeners.forEach(callback => {
            try {
                callback(currentRoute, previousRoute);
            } catch (error) {
                console.error('Error in route change listener:', error);
            }
        });
    }
    
    getCurrentRoute() {
        return this.currentRoute;
    }
    
    getRoute(name) {
        return this.routes.get(name);
    }
    
    getAllRoutes() {
        return Array.from(this.routes.values());
    }
    
    getRoutesBySection(section) {
        return this.getAllRoutes().filter(route => route.section === section);
    }
    
    getParentRoute(routeName) {
        const route = this.routes.get(routeName);
        return route?.parent ? this.routes.get(route.parent) : null;
    }
    
    getBreadcrumb(routeName) {
        const route = this.routes.get(routeName);
        if (!route) return [];
        
        const breadcrumb = [...route.breadcrumb];
        
        // Add parent route to breadcrumb if it exists
        if (route.parent) {
            const parentRoute = this.getParentRoute(routeName);
            if (parentRoute) {
                breadcrumb.unshift(...parentRoute.breadcrumb);
            }
        }
        
        return breadcrumb;
    }
    
    goBack() {
        if (this.history.length > 0) {
            const previousEntry = this.history.pop();
            if (previousEntry?.route) {
                this.navigate(previousEntry.route.name);
                return true;
            }
        }
        return false;
    }
    
    canGoBack() {
        return this.history.length > 0;
    }
    
    // Keyboard navigation
    handleKeyboardNavigation(key) {
        const route = this.getAllRoutes().find(r => r.keyboard === key);
        if (route) {
            this.navigate(route.name);
            return true;
        }
        return false;
    }
    
    // Utility methods
    isCurrentRoute(routeName) {
        return this.currentRoute?.name === routeName;
    }
    
    getCurrentSection() {
        return this.currentRoute?.section;
    }
    
    getCurrentBreadcrumb() {
        return this.currentRoute ? this.getBreadcrumb(this.currentRoute.name) : [];
    }
    
    // Debug methods
    getHistory() {
        return [...this.history];
    }
    
    getListeners() {
        return this.listeners.size;
    }
}

// Create global router instance
window.router = new Router();

// Export for use in other modules
export { Router };
window.Router = Router;

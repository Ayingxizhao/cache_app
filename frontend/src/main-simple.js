// Simple Navigation Test - Cache App
// Note: CSS files should be linked in HTML, not imported as modules

// Import Wails functions
import { 
    ScanCacheLocation, 
    ScanMultipleCacheLocations, 
    GetCacheLocationsFromConfig, 
    GetSystemInfo, 
    IsScanning, 
    StopScan, 
    GetScanProgress, 
    GetLastScanResult, 
    GetSafetyClassificationSummary, 
    ClassifyFileSafety, 
    GetSafetyClassificationRules, 
    GetFilesBySafetyLevel, 
    DeleteFilesWithConfirmation, 
    ConfirmDeletion, 
    GetDeletionProgress, 
    StopDeletion, 
    RestoreFromBackup, 
    GetDeletionHistory, 
    GetAvailableBackups, 
    ValidateFilesForDeletion, 
    GetDeletionSystemStatus, 
    RevealInFinder, 
    GetBackupBrowserData, 
    GetBackupSessionDetails, 
    PreviewRestoreOperation, 
    RestoreFromBackupWithOptions, 
    DeleteBackupSession, 
    CleanupBackupsByAge, 
    GetBackupProgress 
} from '../wailsjs/go/main/App.js';

// Simple App State
class SimpleAppState {
    constructor() {
        this.state = {
            currentSection: 'scanner',
            isScanning: false,
            systemStatus: 'ready',
            systemMessage: 'Ready'
        };
        this.listeners = new Map();
    }
    
    get(key) {
        return this.state[key];
    }
    
    set(key, value) {
        this.state[key] = value;
        this.notify(key, value);
    }
    
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);
        return () => {
            const callbacks = this.listeners.get(key);
            if (callbacks) {
                callbacks.delete(callback);
            }
        };
    }
    
    notify(key, value) {
        const callbacks = this.listeners.get(key);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(value);
                } catch (error) {
                    console.error(`Error in state listener for ${key}:`, error);
                }
            });
        }
    }
}

// Simple Router
class SimpleRouter {
    constructor() {
        this.currentRoute = null;
        this.routes = new Map();
        this.listeners = new Set();
        this.defineRoutes();
    }
    
    defineRoutes() {
        this.routes.set('scanner', {
            name: 'scanner',
            title: 'Cache Scanner',
            section: 'scanner',
            icon: '🔍',
            description: 'Scan and analyze cache locations'
        });
        
        this.routes.set('cleaner', {
            name: 'cleaner',
            title: 'Cache Cleaner',
            section: 'cleaner',
            icon: '🧹',
            description: 'Clean and delete cache files safely'
        });
        
        this.routes.set('backup', {
            name: 'backup',
            title: 'Backup Manager',
            section: 'backup',
            icon: '💾',
            description: 'Manage backup sessions and restore files'
        });
        
        this.routes.set('settings', {
            name: 'settings',
            title: 'Settings',
            section: 'settings',
            icon: '⚙️',
            description: 'Configure app preferences and policies'
        });
    }
    
    navigate(routeName) {
        const route = this.routes.get(routeName);
        if (route) {
            const previousRoute = this.currentRoute;
            this.currentRoute = route;
            this.listeners.forEach(callback => {
                callback(this.currentRoute, previousRoute);
            });
            return true;
        }
        return false;
    }
    
    subscribe(callback) {
        this.listeners.add(callback);
        return () => {
            this.listeners.delete(callback);
        };
    }
    
    getCurrentRoute() {
        return this.currentRoute;
    }
}

// Simple Navigation Component
class SimpleNavigation {
    constructor(router, appState) {
        this.router = router;
        this.appState = appState;
        this.currentSection = 'scanner';
        
        // Subscribe to router changes
        this.router.subscribe((currentRoute, previousRoute) => {
            this.updateCurrentSection(currentRoute);
        });
    }
    
    createNavigationHTML() {
        return `
            <nav class="app-navigation">
                <div class="nav-header">
                    <div class="nav-logo">
                        <div class="nav-logo-icon">🗂️</div>
                        <div class="nav-logo-text">
                            <h2>Cache App</h2>
                            <p>macOS Cache Manager</p>
                        </div>
                    </div>
                    <div class="nav-status">
                        <div class="status-indicator" id="systemStatus">
                            <span class="status-dot"></span>
                            <span class="status-text">Ready</span>
                        </div>
                    </div>
                </div>
                
                <div class="nav-tabs">
                    <button class="nav-tab active" data-section="scanner">
                        <span class="nav-tab-icon">🔍</span>
                        <span class="nav-tab-text">Cache Scanner</span>
                    </button>
                    <button class="nav-tab" data-section="cleaner">
                        <span class="nav-tab-icon">🧹</span>
                        <span class="nav-tab-text">Cache Cleaner</span>
                    </button>
                    <button class="nav-tab" data-section="backup">
                        <span class="nav-tab-icon">💾</span>
                        <span class="nav-tab-text">Backup Manager</span>
                    </button>
                    <button class="nav-tab" data-section="settings">
                        <span class="nav-tab-icon">⚙️</span>
                        <span class="nav-tab-text">Settings</span>
                    </button>
                </div>
            </nav>
        `;
    }
    
    createMainContentHTML() {
        return `
            <main class="app-main">
                <div class="main-header">
                    <div class="section-title">
                        <h1 id="sectionTitle">Cache Scanner</h1>
                        <p id="sectionDescription">Scan and analyze cache locations</p>
                    </div>
                </div>
                
                <div class="main-content">
                    <div class="content-section active" id="scanner-section">
                        <div class="scanner-content">
                            <h3>Welcome to Cache App!</h3>
                            <p>The navigation system is working correctly.</p>
                            <div class="feature-list">
                                <div class="feature-item">
                                    <span class="feature-icon">🔍</span>
                                    <div class="feature-text">
                                        <h4>Cache Scanner</h4>
                                        <p>Scan and analyze cache locations on your system</p>
                                    </div>
                                </div>
                                <div class="feature-item">
                                    <span class="feature-icon">🧹</span>
                                    <div class="feature-text">
                                        <h4>Cache Cleaner</h4>
                                        <p>Clean and delete cache files safely</p>
                                    </div>
                                </div>
                                <div class="feature-item">
                                    <span class="feature-icon">💾</span>
                                    <div class="feature-text">
                                        <h4>Backup Manager</h4>
                                        <p>Manage backup sessions and restore files</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        `;
    }
    
    updateCurrentSection(currentRoute) {
        if (!currentRoute) return;
        
        this.currentSection = currentRoute.section || currentRoute.name;
        
        // Update navigation tabs
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach(tab => {
            tab.classList.remove('active');
        });
        
        const activeTab = document.querySelector(`[data-section="${this.currentSection}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        // Update main content
        const sectionTitle = document.getElementById('sectionTitle');
        const sectionDescription = document.getElementById('sectionDescription');
        
        if (sectionTitle) {
            sectionTitle.textContent = currentRoute.title;
        }
        
        if (sectionDescription) {
            sectionDescription.textContent = currentRoute.description;
        }
    }
    
    switchSection(sectionId) {
        console.log('Switching to section:', sectionId);
        this.router.navigate(sectionId);
    }
    
    initialize() {
        console.log('Initializing Simple Navigation...');
        
        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-tab')) {
                const sectionId = e.target.closest('.nav-tab').dataset.section;
                console.log('Navigation tab clicked:', sectionId);
                this.switchSection(sectionId);
            }
        });
        
        // Initialize with current route
        const currentRoute = this.router.getCurrentRoute();
        if (currentRoute) {
            this.updateCurrentSection(currentRoute);
        } else {
            // Set default route
            this.router.navigate('scanner');
        }
        
        console.log('Simple Navigation initialized');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting simple navigation test...');
    
    try {
        // Create instances
        const appState = new SimpleAppState();
        const router = new SimpleRouter();
        const navigation = new SimpleNavigation(router, appState);
        
        // Create UI
        document.querySelector('#app').innerHTML = `
            <div class="app-container">
                <div class="main-layout">
                    ${navigation.createNavigationHTML()}
                    ${navigation.createMainContentHTML()}
                </div>
            </div>
        `;
        
        // Initialize navigation
        navigation.initialize();
        
        // Make functions globally available for testing
        window.navigation = navigation;
        window.router = router;
        window.appState = appState;
        
        console.log('Simple navigation system initialized successfully!');
        console.log('Try clicking the navigation tabs or calling navigation.switchSection("cleaner")');
        
    } catch (error) {
        console.error('Failed to initialize simple navigation:', error);
        document.querySelector('#app').innerHTML = `
            <div class="error">
                <h2>Initialization Error</h2>
                <p>Failed to initialize navigation system:</p>
                <pre>${error.message}</pre>
                <button onclick="location.reload()">Reload Page</button>
            </div>
        `;
    }
});

// Add some basic styles for the simple version
const style = document.createElement('style');
style.textContent = `
    .feature-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 2rem;
    }
    
    .feature-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: var(--secondary-bg);
        border-radius: var(--radius-md);
        border: 1px solid var(--border-color);
    }
    
    .feature-icon {
        font-size: 2rem;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-color);
        border-radius: 50%;
        color: white;
    }
    
    .feature-text h4 {
        margin: 0 0 0.5rem 0;
        color: var(--text-primary);
    }
    
    .feature-text p {
        margin: 0;
        color: var(--text-secondary);
    }
    
    .error {
        text-align: center;
        padding: 2rem;
        background: var(--error-color);
        color: white;
        margin: 2rem;
        border-radius: var(--radius-md);
    }
    
    .error pre {
        background: rgba(0,0,0,0.2);
        padding: 1rem;
        border-radius: var(--radius-sm);
        margin: 1rem 0;
        text-align: left;
    }
    
    .error button {
        background: white;
        color: var(--error-color);
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: var(--radius-md);
        cursor: pointer;
        font-weight: 600;
        margin-top: 1rem;
    }
`;
document.head.appendChild(style);

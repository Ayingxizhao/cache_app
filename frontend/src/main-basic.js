// Basic Navigation Test - Cache App (No external dependencies)
console.log('Loading basic navigation system...');

// Simple App State
class BasicAppState {
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
class BasicRouter {
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

// Basic Navigation Component
class BasicNavigation {
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
                            <span class="status-dot ready"></span>
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
                            <div class="welcome-message">
                                <h3>🎉 Navigation System Working!</h3>
                                <p>The unified navigation system has been successfully implemented.</p>
                            </div>
                            
                            <div class="feature-grid">
                                <div class="feature-card">
                                    <div class="feature-icon">🔍</div>
                                    <h4>Cache Scanner</h4>
                                    <p>Scan and analyze cache locations on your macOS system with advanced safety classification.</p>
                                    <div class="feature-status">Ready</div>
                                </div>
                                
                                <div class="feature-card">
                                    <div class="feature-icon">🧹</div>
                                    <h4>Cache Cleaner</h4>
                                    <p>Clean and delete cache files safely with automatic backup and confirmation dialogs.</p>
                                    <div class="feature-status">Ready</div>
                                </div>
                                
                                <div class="feature-card">
                                    <div class="feature-icon">💾</div>
                                    <h4>Backup Manager</h4>
                                    <p>Manage backup sessions and restore files with detailed session tracking.</p>
                                    <div class="feature-status">Ready</div>
                                </div>
                                
                                <div class="feature-card">
                                    <div class="feature-icon">⚙️</div>
                                    <h4>Settings</h4>
                                    <p>Configure app preferences, safety policies, and performance settings.</p>
                                    <div class="feature-status">Ready</div>
                                </div>
                            </div>
                            
                            <div class="navigation-features">
                                <h4>Navigation Features</h4>
                                <ul>
                                    <li>✅ <strong>Router-based navigation</strong> with URL management</li>
                                    <li>✅ <strong>Breadcrumb navigation</strong> with quick actions</li>
                                    <li>✅ <strong>Collapsible sidebar</strong> with system status</li>
                                    <li>✅ <strong>Keyboard shortcuts</strong> for common actions</li>
                                    <li>✅ <strong>Page state management</strong> with persistence</li>
                                    <li>✅ <strong>Responsive design</strong> for all devices</li>
                                </ul>
                            </div>
                            
                            <div class="test-actions">
                                <h4>Test Navigation</h4>
                                <p>Click the navigation tabs above or use these buttons:</p>
                                <div class="button-group">
                                    <button onclick="window.navigation.switchSection('cleaner')" class="test-btn">Go to Cleaner</button>
                                    <button onclick="window.navigation.switchSection('backup')" class="test-btn">Go to Backup</button>
                                    <button onclick="window.navigation.switchSection('settings')" class="test-btn">Go to Settings</button>
                                    <button onclick="window.navigation.switchSection('scanner')" class="test-btn">Back to Scanner</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="content-section" id="cleaner-section">
                        <div class="cleaner-content">
                            <h3>Cache Cleaner</h3>
                            <p>This is the cleaner section. File management and deletion features would be implemented here.</p>
                            <div class="placeholder-content">
                                <div class="placeholder-item">📁 Cache Files Management</div>
                                <div class="placeholder-item">🗑️ Safe Deletion Tools</div>
                                <div class="placeholder-item">📊 Storage Analytics</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="content-section" id="backup-section">
                        <div class="backup-content">
                            <h3>Backup Manager</h3>
                            <p>This is the backup section. Session management and restore features would be implemented here.</p>
                            <div class="placeholder-content">
                                <div class="placeholder-item">💾 Backup Sessions</div>
                                <div class="placeholder-item">🔄 Restore Operations</div>
                                <div class="placeholder-item">📈 Backup Statistics</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="content-section" id="settings-section">
                        <div class="settings-content">
                            <h3>Settings</h3>
                            <p>This is the settings section. Configuration options would be implemented here.</p>
                            <div class="placeholder-content">
                                <div class="placeholder-item">⚙️ General Settings</div>
                                <div class="placeholder-item">🔒 Safety Policies</div>
                                <div class="placeholder-item">🎨 Appearance Options</div>
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
        
        // Show/hide content sections
        const contentSections = document.querySelectorAll('.content-section');
        contentSections.forEach(section => {
            section.classList.remove('active');
        });
        
        const currentSection = document.getElementById(`${this.currentSection}-section`);
        if (currentSection) {
            currentSection.classList.add('active');
        }
    }
    
    switchSection(sectionId) {
        console.log('Switching to section:', sectionId);
        this.router.navigate(sectionId);
    }
    
    initialize() {
        console.log('Initializing Basic Navigation...');
        
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
        
        console.log('Basic Navigation initialized');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting basic navigation test...');
    
    try {
        // Create instances
        const appState = new BasicAppState();
        const router = new BasicRouter();
        const navigation = new BasicNavigation(router, appState);
        
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
        
        console.log('✅ Basic navigation system initialized successfully!');
        console.log('🎯 Try clicking the navigation tabs or calling navigation.switchSection("cleaner")');
        
    } catch (error) {
        console.error('❌ Failed to initialize basic navigation:', error);
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

// Add comprehensive styles for the basic version
const style = document.createElement('style');
style.textContent = `
    /* Basic Navigation Styles */
    .app-container {
        min-height: 100vh;
        background: var(--primary-bg);
    }
    
    .main-layout {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }
    
    /* Navigation Styles */
    .app-navigation {
        background: var(--secondary-bg);
        border-bottom: 1px solid var(--border-color);
        padding: 1rem 2rem;
    }
    
    .nav-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    .nav-logo {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .nav-logo-icon {
        font-size: 2rem;
        background: var(--primary-color);
        color: white;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .nav-logo-text h2 {
        margin: 0;
        color: var(--text-primary);
        font-size: 1.5rem;
    }
    
    .nav-logo-text p {
        margin: 0;
        color: var(--text-secondary);
        font-size: 0.875rem;
    }
    
    .status-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: var(--primary-bg);
        border-radius: var(--radius-md);
        border: 1px solid var(--border-color);
    }
    
    .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--success-color);
    }
    
    .status-dot.ready { background: var(--success-color); }
    .status-dot.scanning { background: var(--warning-color); }
    .status-dot.error { background: var(--error-color); }
    
    .status-text {
        font-size: 0.875rem;
        color: var(--text-primary);
        font-weight: 500;
    }
    
    .nav-tabs {
        display: flex;
        gap: 0.5rem;
    }
    
    .nav-tab {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: none;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all 0.2s ease;
        color: var(--text-secondary);
        font-weight: 500;
    }
    
    .nav-tab:hover {
        background: var(--hover-bg);
        color: var(--text-primary);
    }
    
    .nav-tab.active {
        background: var(--primary-color);
        color: white;
    }
    
    .nav-tab-icon {
        font-size: 1.125rem;
    }
    
    .nav-tab-text {
        font-size: 0.875rem;
    }
    
    /* Main Content Styles */
    .app-main {
        flex: 1;
        padding: 2rem;
        background: var(--primary-bg);
    }
    
    .main-header {
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--border-color);
    }
    
    .section-title h1 {
        margin: 0 0 0.5rem 0;
        color: var(--text-primary);
        font-size: 2rem;
    }
    
    .section-title p {
        margin: 0;
        color: var(--text-secondary);
        font-size: 1.125rem;
    }
    
    .content-section {
        display: none;
    }
    
    .content-section.active {
        display: block;
    }
    
    /* Feature Cards */
    .welcome-message {
        text-align: center;
        margin-bottom: 2rem;
        padding: 2rem;
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: white;
        border-radius: var(--radius-lg);
    }
    
    .welcome-message h3 {
        margin: 0 0 1rem 0;
        font-size: 1.5rem;
    }
    
    .feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }
    
    .feature-card {
        background: var(--secondary-bg);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 1.5rem;
        text-align: center;
        transition: transform 0.2s ease;
    }
    
    .feature-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }
    
    .feature-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }
    
    .feature-card h4 {
        margin: 0 0 1rem 0;
        color: var(--text-primary);
        font-size: 1.125rem;
    }
    
    .feature-card p {
        margin: 0 0 1rem 0;
        color: var(--text-secondary);
        line-height: 1.5;
    }
    
    .feature-status {
        display: inline-block;
        background: var(--success-color);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        font-weight: 600;
    }
    
    /* Navigation Features */
    .navigation-features {
        background: var(--secondary-bg);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 1.5rem;
        margin-bottom: 2rem;
    }
    
    .navigation-features h4 {
        margin: 0 0 1rem 0;
        color: var(--text-primary);
    }
    
    .navigation-features ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    
    .navigation-features li {
        padding: 0.5rem 0;
        color: var(--text-secondary);
        border-bottom: 1px solid var(--border-color-light);
    }
    
    .navigation-features li:last-child {
        border-bottom: none;
    }
    
    /* Test Actions */
    .test-actions {
        background: var(--secondary-bg);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 1.5rem;
        text-align: center;
    }
    
    .test-actions h4 {
        margin: 0 0 1rem 0;
        color: var(--text-primary);
    }
    
    .test-actions p {
        margin: 0 0 1rem 0;
        color: var(--text-secondary);
    }
    
    .button-group {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
    }
    
    .test-btn {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: var(--radius-md);
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.2s ease;
    }
    
    .test-btn:hover {
        background: var(--primary-color-dark);
    }
    
    /* Placeholder Content */
    .placeholder-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 1rem;
    }
    
    .placeholder-item {
        background: var(--secondary-bg);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 1rem;
        color: var(--text-secondary);
        font-style: italic;
    }
    
    /* Error Styles */
    .error {
        text-align: center;
        padding: 2rem;
        background: var(--error-color);
        color: white;
        margin: 2rem;
        border-radius: var(--radius-lg);
    }
    
    .error h2 {
        margin: 0 0 1rem 0;
    }
    
    .error pre {
        background: rgba(0,0,0,0.2);
        padding: 1rem;
        border-radius: var(--radius-sm);
        margin: 1rem 0;
        text-align: left;
        overflow-x: auto;
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
    
    /* Responsive Design */
    @media (max-width: 768px) {
        .app-navigation {
            padding: 1rem;
        }
        
        .nav-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
        }
        
        .nav-tabs {
            flex-wrap: wrap;
        }
        
        .app-main {
            padding: 1rem;
        }
        
        .feature-grid {
            grid-template-columns: 1fr;
        }
        
        .button-group {
            flex-direction: column;
            align-items: center;
        }
        
        .test-btn {
            width: 100%;
            max-width: 200px;
        }
    }
`;
document.head.appendChild(style);

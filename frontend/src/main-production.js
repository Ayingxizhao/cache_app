// Production Navigation System for Cache App
console.log('Loading production navigation system...');

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

// Production App State with Wails integration
class ProductionAppState {
    constructor() {
        this.state = {
            currentSection: 'scanner',
            isScanning: false,
            systemStatus: 'ready',
            systemMessage: 'Ready',
            cacheLocations: [],
            scanResults: null,
            selectedFiles: new Set(),
            backupSessions: []
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
    
    setScanning(isScanning) {
        console.log('setScanning called with:', isScanning);
        this.set('isScanning', isScanning);
        this.setSystemStatus(isScanning ? 'scanning' : 'ready', 
                           isScanning ? 'Scanning in progress...' : 'Ready');
        console.log('Scanning state updated to:', isScanning);
    }
    
    setSystemStatus(status, message) {
        this.set('systemStatus', status);
        this.set('systemMessage', message);
    }
    
    setScanResults(results) {
        console.log('setScanResults called with:', results);
        console.log('Results type:', typeof results);
        console.log('Results length:', results ? results.length : 'null/undefined');
        this.set('scanResults', results);
        this.updateScanResultsDisplay(results);
        console.log('Scan results updated in display');
        // Also update file table if scanner section is visible
        if (window.navigation && typeof window.navigation.renderFileTableFromScanResults === 'function') {
            window.navigation.renderFileTableFromScanResults(results);
        }
    }
    
    updateScanResultsDisplay(results) {
        const resultsContainer = document.getElementById('scanResults');
        if (!resultsContainer) return;
        
        if (!results || results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">📁</div>
                    <h3>No scan results yet</h3>
                    <p>Select a cache location and click "Scan Selected" or use the chooser above to start a scan.</p>
                </div>
            `;
            return;
        }
        
        // Display scan results
        let html = '<div class="scan-results-content">';
        
        results.forEach((location, index) => {
            // Normalize backend field names (snake_case or camelCase) to usable vars
            const totalSizeRaw = (location && (location.totalSize ?? location.total_size ?? location.total_size_bytes ?? location.total_size_in_bytes)) || 0;
            const fileCountRaw = (location && (location.fileCount ?? location.file_count ?? location.files?.length ?? location.file_count_estimate)) || 0;
            const sizeFormatted = this.formatBytes(totalSizeRaw || 0);
            const fileCount = Number(fileCountRaw) || 0;
            
            html += `
                <div class="location-result">
                    <div class="location-header">
                        <h4>${this.escapeHtml(location.name || location.id)}</h4>
                        <div class="location-stats">
                            <span class="stat">${fileCount.toLocaleString()} files</span>
                            <span class="stat">${sizeFormatted}</span>
                        </div>
                    </div>
                    <div class="location-path">${this.escapeHtml(location.path)}</div>
                    ${location.error ? `<div class="error-text">Error: ${this.escapeHtml(location.error)}</div>` : ''}
                </div>
            `;
        });
        
        html += '</div>';
        resultsContainer.innerHTML = html;
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    escapeHtml(input) {
        if (input === null || input === undefined) return '';
        return String(input)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    
    setCacheLocations(locations) {
        this.set('cacheLocations', locations);
    }
    
    selectFile(filePath) {
        const selectedFiles = new Set(this.state.selectedFiles);
        selectedFiles.add(filePath);
        this.set('selectedFiles', selectedFiles);
    }
    
    clearSelection() {
        this.set('selectedFiles', new Set());
    }
    
    getSelectedFilesCount() {
        return this.state.selectedFiles.size;
    }
}

// Production Router
class ProductionRouter {
    constructor() {
        this.currentRoute = null;
        this.routes = new Map();
        this.listeners = new Set();
        this.defineRoutes();
    }
    
    defineRoutes() {
        this.routes.set('home', {
            name: 'home',
            title: 'Dashboard',
            section: 'home',
            icon: '🏠',
            description: 'Scan overview and quick stats'
        });
        this.routes.set('scanner', {
            name: 'scanner',
            title: 'Cache Scanner',
            section: 'scanner',
            icon: '🔍',
            description: 'Main cleaning interface for cache files'
        });
        this.routes.set('backup', {
            name: 'backup',
            title: 'Backup Manager',
            section: 'backup',
            icon: '💾',
            description: 'Browse and restore backups'
        });
        this.routes.set('settings', {
            name: 'settings',
            title: 'Settings',
            section: 'settings',
            icon: '⚙️',
            description: 'App configuration'
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

// Production Navigation Component
class ProductionNavigation {
    constructor(router, appState) {
        this.router = router;
        this.appState = appState;
        this.currentSection = 'scanner';
        
        // Subscribe to router changes
        this.router.subscribe((currentRoute, previousRoute) => {
            this.updateCurrentSection(currentRoute);
        });
        
        // Subscribe to app state changes
        this.appState.subscribe('systemStatus', (status) => {
            this.updateSystemStatus(status);
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
                    <button class="nav-tab active" data-section="home">
                        <span class="nav-tab-icon">🏠</span>
                        <span class="nav-tab-text">Dashboard</span>
                    </button>
                    <button class="nav-tab" data-section="scanner">
                        <span class="nav-tab-icon">🔍</span>
                        <span class="nav-tab-text">Cache Scanner</span>
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
                        <h1 id="sectionTitle">Dashboard</h1>
                        <p id="sectionDescription">Scan overview and quick stats</p>
                    </div>
                    <div class="main-actions" id="mainActions">
                        <!-- Actions will be dynamically inserted -->
                    </div>
                </div>
                <div class="main-content">
                    <div class="content-section active" id="home-section">
                        <!-- Dashboard content will be loaded here -->
                    </div>
                    <div class="content-section" id="scanner-section">
                        <!-- Scanner content will be loaded here -->
                    </div>
                    <div class="content-section" id="backup-section">
                        <!-- Backup content will be loaded here -->
                    </div>
                    <div class="content-section" id="settings-section">
                        <!-- Settings content will be loaded here -->
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
        
        // Update main actions based on section
        this.updateMainActions(this.currentSection);
        
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
    
    updateMainActions(sectionId) {
        const actionsContainer = document.getElementById('mainActions');
        if (!actionsContainer) return;
        
        let actionsHTML = '';
        
        switch(sectionId) {
            case 'home':
                actionsHTML = `
                    <button class="btn btn-outline" id="refreshDashboard">
                        <span class="btn-icon">🔄</span>
                        Refresh Dashboard
                    </button>
                `;
                break;
            case 'scanner':
                actionsHTML = `
                    <button class="btn btn-outline" id="refreshLocations">
                        <span class="btn-icon">🔄</span>
                        Refresh Locations
                    </button>
                    <button class="btn btn-primary" id="scanAllLocations">
                        <span class="btn-icon">🌐</span>
                        Scan All Safe
                    </button>
                `;
                // Also (re)render the scanner-landing UI
                this.renderScannerLanding();
                break;
            case 'backup':
                actionsHTML = `
                    <button class="btn btn-outline" id="refreshBackups">
                        <span class="btn-icon">🔄</span>
                        Refresh Backups
                    </button>
                    <button class="btn btn-secondary" id="cleanupOldBackups">
                        <span class="btn-icon">🗑️</span>
                        Cleanup Old
                    </button>
                `;
                break;
            case 'settings':
                actionsHTML = `
                    <button class="btn btn-outline" id="resetSettings">
                        <span class="btn-icon">🔄</span>
                        Reset to Defaults
                    </button>
                    <button class="btn btn-primary" id="saveSettings">
                        <span class="btn-icon">💾</span>
                        Save Settings
                    </button>
                `;
                break;
        }
        
        actionsContainer.innerHTML = actionsHTML;
    }

    // Static utility for formatting bytes
    static formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    // Static utility for escaping HTML
    static escapeHtml(input) {
        if (input === null || input === undefined) return '';
        return String(input)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Render the scanner-landing UI in the scanner-section
    renderScannerLanding() {
        const scannerSection = document.getElementById('scanner-section');
        if (!scannerSection) return;
        scannerSection.innerHTML = `
            <div class="scanner-content">
                <div class="scanner-landing">
                    <h3>Choose directories to scan</h3>
                    <p>Please select one or more cache locations below to scan. Scanning all locations may take a long time and use significant memory.</p>
                    <div class="landing-controls">
                        <button id="refreshLocationsLanding" class="btn btn-outline">🔄 Refresh Locations</button>
                        <button id="scanSelectedLanding" class="btn btn-primary">🔍 Scan Selected</button>
                        <button id="scanAllLanding" class="btn btn-danger">🌐 Scan All (Confirm)</button>
                    </div>
                    <div id="landingLocationsList" class="landing-locations-list">
                        <!-- Checkbox list of locations will be populated here -->
                    </div>
                </div>
                <div class="scan-results" id="scanResults">
                    <div class="no-results">
                        <div class="no-results-icon">📁</div>
                        <h3>No scan results yet</h3>
                        <p>Select a cache location and click "Scan Selected" or use the chooser above to start a scan.</p>
                    </div>
                </div>
                <div class="file-cleaning" id="fileCleaningSection" style="display:none; margin-top:2rem;">
                    <h4>Files in Selected Location</h4>
                    <div id="fileTableContainer"></div>
                    <button id="cleanSelectedFiles" class="btn btn-danger" style="margin-top:1rem;">🧹 Clean Selected Files</button>
                </div>
            </div>
        `;
        // Optionally, re-populate locations list here if needed
        if (typeof this.loadCacheLocations === 'function') {
            this.loadCacheLocations();
        }
        // Attach scan results listener for file table
        if (window.appState && typeof window.appState.subscribe === 'function') {
            window.appState.subscribe('scanResults', (results) => {
                this.renderFileTableFromScanResults(results);
            });
        }
        // Immediately render if scanResults already exist
        if (window.appState && typeof window.appState.get === 'function') {
            const results = window.appState.get('scanResults');
            if (results && Array.isArray(results) && results.length > 0) {
                this.renderFileTableFromScanResults(results);
            }
        }
    }

    // Render file table with safety and selection
    renderFileTableFromScanResults(results) {
        const section = document.getElementById('fileCleaningSection');
        const tableContainer = document.getElementById('fileTableContainer');
        if (!section || !tableContainer) return;
        if (!results || !Array.isArray(results) || results.length === 0) {
            section.style.display = 'none';
            return;
        }
        // For simplicity, show files from the first location
        const files = results[0]?.files || [];
        if (!files.length) {
            tableContainer.innerHTML = '<div class="muted">No files found in this location.</div>';
            section.style.display = 'block';
            return;
        }
        // Pagination/performance: only show first 200 files by default
        const PAGE_SIZE = 200;
        let shown = PAGE_SIZE;
        const renderPage = () => {
            let html = `<table class="file-table"><thead><tr><th><input type="checkbox" id="selectAllFiles"></th><th>Name</th><th>Size</th><th>Modified</th><th>Safety</th><th>Safety %</th></tr></thead><tbody>`;
            files.slice(0, shown).forEach((file, i) => {
                const safe = file.safety_classification?.level || (file.is_dir ? 'Directory' : 'Unknown');
                const safeClass = safe === 'Safe' ? 'safe' : (safe === 'Caution' ? 'caution' : (safe === 'Risky' ? 'risky' : 'unknown'));
                const confidence = (file.safety_classification && typeof file.safety_classification.confidence === 'number') ? `${file.safety_classification.confidence}%` : '—';
                html += `<tr>
                    <td><input type="checkbox" class="file-checkbox" data-file-index="${i}"></td>
                    <td>${ProductionNavigation.escapeHtml(file.name)}</td>
                    <td>${ProductionNavigation.formatBytes(file.size || 0)}</td>
                    <td>${file.last_modified ? new Date(file.last_modified).toLocaleDateString() : ''}</td>
                    <td><span class="safety-label ${safeClass}">${safe}</span></td>
                    <td>${confidence}</td>
                </tr>`;
            });
            html += '</tbody></table>';
            if (shown < files.length) {
                html += `<button id="showMoreFiles" class="btn btn-outline" style="margin-top:1rem;">Show More (${Math.min(PAGE_SIZE, files.length-shown)} more)</button>`;
            }
            tableContainer.innerHTML = html;
            section.style.display = 'block';
            // Select all logic
            const selectAll = document.getElementById('selectAllFiles');
            if (selectAll) {
                selectAll.onclick = () => {
                    document.querySelectorAll('.file-checkbox').forEach(cb => { cb.checked = selectAll.checked; });
                };
            }
            // Show more logic
            const showMore = document.getElementById('showMoreFiles');
            if (showMore) {
                showMore.onclick = () => {
                    shown = Math.min(shown + PAGE_SIZE, files.length);
                    renderPage();
                };
            }
            // Clean button logic
            const cleanBtn = document.getElementById('cleanSelectedFiles');
            if (cleanBtn) {
                cleanBtn.onclick = () => {
                    const selected = Array.from(document.querySelectorAll('.file-checkbox:checked')).map(cb => files[cb.dataset.fileIndex]);
                    if (!selected.length) { alert('No files selected.'); return; }
                    // Safety confirmation
                    const risky = selected.filter(f => (f.safety_classification?.level || '').toLowerCase() === 'risky');
                    if (risky.length) {
                        if (!confirm(`Warning: ${risky.length} risky file(s) selected. Are you sure you want to delete them?`)) return;
                    }
                    // Call backend delete (simulate for now)
                    alert(`Cleaning ${selected.length} file(s):\n` + selected.map(f => f.name).join(', '));
                    // TODO: Replace with real backend call
                };
            }
        };
        renderPage();
    }
    
    updateSystemStatus(status) {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-text');
        
        if (statusDot) {
            statusDot.className = `status-dot ${status}`;
        }
        
        if (statusText) {
            statusText.textContent = this.appState.get('systemMessage');
        }
    }
    
    switchSection(sectionId) {
        console.log('Switching to section:', sectionId);
        this.router.navigate(sectionId);
    }
    
    async loadCacheLocations() {
        try {
            const locationsData = await GetCacheLocationsFromConfig();
            const locations = JSON.parse(locationsData || '[]');
            this.appState.setCacheLocations(locations);
            
            // Populate landing list
            this.populateLandingList(locations);
            
            console.log('Cache locations loaded:', locations.length);
        } catch (error) {
            console.error('Failed to load cache locations:', error);
        }
    }
    
    populateLandingList(locations) {
        const listContainer = document.getElementById('landingLocationsList');
        if (!listContainer) return;
        
        listContainer.innerHTML = '';
        
        if (!locations || locations.length === 0) {
            listContainer.innerHTML = '<div class="muted">No cache locations available</div>';
            return;
        }
        
        const frag = document.createDocumentFragment();
        locations.forEach((loc, i) => {
            const id = loc.id || (`loc-${i}`);
            const label = (loc.name ? loc.name : id) + (loc.path ? ` (${loc.path})` : '');
            const row = document.createElement('div');
            row.className = 'landing-location-row';
            row.innerHTML = `<label><input type="checkbox" data-loc-index="${i}" value="${id}"> ${ProductionNavigation.escapeHtml(label)}</label>`;
            frag.appendChild(row);
        });
        listContainer.appendChild(frag);
    }
    
    escapeHtml(input) {
        if (input === null || input === undefined) return '';
        return String(input)
            .replace(/&/g, '&amp;')
            .replace(/<//g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    
    initialize() {
        console.log('Initializing Production Navigation...');
        
        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-tab')) {
                const sectionId = e.target.closest('.nav-tab').dataset.section;
                console.log('Navigation tab clicked:', sectionId);
                this.switchSection(sectionId);
            }
            
            // Handle action buttons
            this.handleActionClicks(e);
        });
        
        // Load initial data
        this.loadCacheLocations();
        
        // Initialize with current route
        const currentRoute = this.router.getCurrentRoute();
        if (currentRoute) {
            this.updateCurrentSection(currentRoute);
        } else {
            // Set default route
            this.router.navigate('scanner');
        }
        
        console.log('Production Navigation initialized');
    }
    
    handleActionClicks(e) {
        const target = e.target.closest('button');
        if (!target) return;
        
        switch (target.id) {
            case 'refreshLocations':
            case 'refreshLocationsLanding':
                this.loadCacheLocations();
                break;
            case 'scanAllLocations':
            case 'scanAllLanding':
                this.scanAllLocations();
                break;
            case 'scanSelectedLanding':
                this.scanSelectedLocations();
                break;
            case 'refreshBackups':
                this.refreshBackups();
                break;
            case 'cleanupOldBackups':
                this.cleanupOldBackups();
                break;
            case 'saveSettings':
                this.saveSettings();
                break;
            case 'resetSettings':
                this.resetSettings();
                break;
        }
    }
    
    async scanAllLocations() {
        try {
            const locations = this.appState.get('cacheLocations');
            const safeLocations = locations.filter(loc => loc.type === 'user' || loc.type === 'application');
            
            if (safeLocations.length === 0) {
                console.warn('No safe locations found to scan');
                return;
            }
            
            this.appState.setScanning(true);
            
            const locationsJSON = JSON.stringify(safeLocations.map(loc => ({
                id: loc.id,
                name: loc.name,
                path: loc.path
            })));
            
            const result = await ScanMultipleCacheLocations(locationsJSON);
            const scanResult = JSON.parse(result);
            
            this.appState.setScanResults(scanResult);
            this.appState.setScanning(false);
            
            console.log('Scan completed:', scanResult);
        } catch (error) {
            console.error('Scan error:', error);
            this.appState.setScanning(false);
        }
    }
    
    async scanSelectedLocations() {
        try {
            const checks = Array.from(document.querySelectorAll('#landingLocationsList input[type="checkbox"]:checked'));
            if (checks.length === 0) {
                console.warn('No locations selected for scanning');
                return;
            }
            
            const locations = this.appState.get('cacheLocations');
            const selected = checks.map(ch => {
                const idx = Number(ch.dataset.locIndex);
                const loc = locations[idx];
                return { id: loc?.id, name: loc?.name, path: loc?.path };
            }).filter(x => x && x.path);
            
            if (selected.length === 0) {
                console.error('Selected locations invalid');
                return;
            }
            
            this.appState.setScanning(true);
            
            const payload = JSON.stringify(selected);
            console.log('Sending scan request with payload:', payload);
            const res = await ScanMultipleCacheLocations(payload);
            console.log('ScanMultipleCacheLocations response:', res);
            
            const result = JSON.parse(res || '{}');
            console.log('Parsed scan result:', result);
            console.log('Result keys:', Object.keys(result));
            console.log('Has Locations:', !!result.Locations);
            console.log('Has locations:', !!result.locations);
            console.log('Locations type:', typeof result.Locations);
            console.log('locations type:', typeof result.locations);
            
            // ScanMultipleCacheLocations returns results immediately (synchronous)
            // The JSON field is 'locations' (lowercase) based on the Go struct tag
            if (result.locations && Array.isArray(result.locations)) {
                // Direct result from ScanMultipleCacheLocations
                console.log('Using locations array:', result.locations);
                this.appState.setScanResults(result.locations);
                this.appState.setScanning(false);
                console.log('Scan completed with results:', result.locations);
            } else if (result.Locations && Array.isArray(result.Locations)) {
                // Fallback for uppercase 'Locations' (shouldn't happen with current backend)
                console.log('Using Locations array:', result.Locations);
                this.appState.setScanResults(result.Locations);
                this.appState.setScanning(false);
                console.log('Scan completed with results (uppercase):', result.Locations);
            } else {
                // If no results, something went wrong
                console.error('No valid scan results received:', result);
                console.error('Result structure:', JSON.stringify(result, null, 2));
                console.error('Available keys:', Object.keys(result));
                this.appState.setScanning(false);
                if (window.notificationSystem) {
                    window.notificationSystem.error('Scan completed but no results received');
                }
            }
        } catch (error) {
            console.error('Scan selected error:', error);
            this.appState.setScanning(false);
        }
    }
    
    async pollForScanResult(timeout = 5 * 60 * 1000, startTime = Date.now()) {
        try {
            // Check for timeout (5 minutes max)
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime > timeout) {
                console.warn('Scan polling timed out after 5 minutes');
                this.appState.setScanning(false);
                if (window.notificationSystem) {
                    window.notificationSystem.error('Scan timed out after 5 minutes');
                }
                return;
            }

            const result = await GetLastScanResult();
            console.log('Raw scan result:', result);
            const parsed = JSON.parse(result || '{}');
            console.log('Parsed scan result:', parsed);
            
            // Check if we have a valid scan result (not just "no_result" status)
            if (parsed && parsed.status !== 'no_result' && (parsed.id || parsed.Locations)) {
                // We have a valid scan result
                if (parsed.Locations && Array.isArray(parsed.Locations)) {
                    // This looks like a ScanResult with Locations array
                    this.appState.setScanResults(parsed.Locations);
                    this.appState.setScanning(false);
                    console.log('ScanResult with Locations received:', parsed.Locations);
                } else if (parsed.id && parsed.name && parsed.path) {
                    // This looks like a single location result
                    this.appState.setScanResults([parsed]);
                    this.appState.setScanning(false);
                    console.log('Single location result received:', parsed);
                } else {
                    console.log('Valid result but unknown format:', parsed);
                    this.appState.setScanning(false);
                }
            } else if (parsed.status === 'no_result') {
                // No scan result available yet, continue polling
                console.log('No result yet, continuing to poll...');
                setTimeout(() => this.pollForScanResult(timeout, startTime), 1000); // Poll every 1 second
            } else {
                // Unknown status, continue polling for a bit
                console.log('Unknown status, continuing to poll:', parsed.status);
                setTimeout(() => this.pollForScanResult(timeout, startTime), 1000);
            }
        } catch (error) {
            console.error('Poll scan result error:', error);
            // Continue polling on error unless it's a critical error
            setTimeout(() => this.pollForScanResult(timeout, startTime), 2000);
        }
    }
    
    async refreshBackups() {
        try {
            const backupData = await GetBackupBrowserData();
            const backupInfo = JSON.parse(backupData);
            this.appState.set('backupSessions', backupInfo.sessions || []);
            console.log('Backup data refreshed');
        } catch (error) {
            console.error('Backup refresh error:', error);
        }
    }
    
    async cleanupOldBackups() {
        try {
            const result = await CleanupBackupsByAge(30); // 30 days
            const cleanupResult = JSON.parse(result);
            console.log('Backup cleanup completed:', cleanupResult);
            this.refreshBackups();
        } catch (error) {
            console.error('Backup cleanup error:', error);
        }
    }
    
    saveSettings() {
        console.log('Settings saved');
    }
    
    resetSettings() {
        console.log('Settings reset');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting production navigation system...');
    
    try {
        // Create instances
        const appState = new ProductionAppState();
        const router = new ProductionRouter();
        const navigation = new ProductionNavigation(router, appState);
        
        // Create UI
        document.querySelector('#app').innerHTML = `
            <div class="app-container">
                ${navigation.createNavigationHTML()}
                <div class="main-content">
                    ${navigation.createMainContentHTML()}
                </div>
            </div>
        `;
        
        // Initialize navigation
        navigation.initialize();
        
        // Make functions globally available
        window.navigation = navigation;
        window.router = router;
        window.appState = appState;
        
        // Make Wails functions globally available
        window.ScanCacheLocation = ScanCacheLocation;
        window.ScanMultipleCacheLocations = ScanMultipleCacheLocations;
        window.GetCacheLocationsFromConfig = GetCacheLocationsFromConfig;
        window.GetSystemInfo = GetSystemInfo;
        window.GetLastScanResult = GetLastScanResult;
        window.GetBackupBrowserData = GetBackupBrowserData;
        window.CleanupBackupsByAge = CleanupBackupsByAge;
        
        // Mark that main-production.js is handling the scan buttons
        window.scanSelectedLandingHandler = true;
        window.scanAllLandingHandler = true;
        
        console.log('✅ Production navigation system initialized successfully!');
        console.log('🎯 Navigation system is ready with Wails integration');
        
    } catch (error) {
        console.error('❌ Failed to initialize production navigation:', error);
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

// Add comprehensive production styles
const style = document.createElement('style');
style.textContent = `
    /* Production Navigation Styles */
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
        width: 100%;
        flex-shrink: 0;
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
        gap: 1rem;
        flex-wrap: wrap;
    }
    
    /* Main Content Styles */
    .main-content {
        flex: 1;
        overflow-y: auto;
        padding: 2rem;
    }
    
    /* Scan Results Styles */
    .scan-results {
        margin-top: 2rem;
        background: var(--primary-bg);
        border-radius: var(--radius-lg);
        padding: 1.5rem;
        border: 1px solid var(--border-color);
    }
    
    .no-results {
        text-align: center;
        padding: 3rem 2rem;
        color: var(--text-secondary);
    }
    
    .no-results-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    }
    
    .no-results h3 {
        margin-bottom: 0.5rem;
        color: var(--text-primary);
    }
    
    .scan-results-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .location-result {
        background: var(--secondary-bg);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 1.5rem;
        transition: all 0.2s ease;
    }
    
    .location-result:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-1px);
    }
    
    .location-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    
    .location-header h4 {
        margin: 0;
        color: var(--text-primary);
        font-size: 1.1rem;
        font-weight: 600;
    }
    
    .location-stats {
        display: flex;
        gap: 1rem;
    }
    
    .stat {
        background: var(--tertiary-bg);
        color: var(--text-secondary);
        padding: 0.25rem 0.75rem;
        border-radius: var(--radius-sm);
        font-size: 0.8rem;
        font-weight: 500;
    }
    
    .location-path {
        font-family: 'Monaco', 'Menlo', monospace;
        background: var(--tertiary-bg);
        padding: 0.5rem;
        border-radius: var(--radius-sm);
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        color: var(--text-secondary);
        word-break: break-all;
    }
    
    .error-text {
        color: var(--error-color);
        font-weight: 500;
        font-size: 0.9rem;
    }
    
    .nav-tab {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: none;
        border: none;
        padding: 1rem 2rem;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all 0.2s ease;
        color: var(--text-secondary);
        font-weight: 500;
        min-width: 160px;
        justify-content: center;
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
        display: flex;
        justify-content: space-between;
        align-items: center;
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
        color: var (--text-secondary);
        font-size: 1.125rem;
    }
    
    .main-actions {
        display: flex;
        gap: 1rem;
    }
    
    .btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: var(--radius-md);
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s ease;
        text-decoration: none;
    }
    
    .btn-outline {
        background: transparent;
        color: var(--text-primary);
        border: 1px solid var(--border-color);
    }
    
    .btn-outline:hover {
        background: var(--hover-bg);
    }
    
    .btn-primary {
        background: var(--primary-color);
        color: white;
    }
    
    .btn-primary:hover {
        background: var(--primary-color-dark);
    }
    
    .btn-success {
        background: var(--success-color);
        color: white;
    }
    
    .btn-danger {
        background: var(--error-color);
        color: white;
    }
    
    .btn-secondary {
        background: var(--text-secondary);
        color: white;
    }
    
    .btn-icon {
        font-size: 1rem;
    }
    
    .content-section {
        display: none;
    }
    
    .content-section.active {
        display: block;
    }
    
    /* Scanner Content */
    .scanner-landing {
        background: var(--secondary-bg);
        border: 1px solid var(--border-color);
        border-radius: var (--radius-lg);
        padding: 2rem;
        margin-bottom: 2rem;
    }
    
    .scanner-landing h3 {
        margin: 0 0 1rem 0;
        color: var(--text-primary);
    }
    
    .scanner-landing p {
        margin: 0 0 1.5rem 0;
        color: var(--text-secondary);
    }
    
    .landing-controls {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
    }
    
    .landing-locations-list {
        max-height: 300px;
        overflow-y: auto;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 1rem;
        background: var(--primary-bg);
    }
    
    .landing-location-row {
        padding: 0.5rem 0;
        border-bottom: 1px solid var(--border-color-light);
    }
    
    .landing-location-row:last-child {
        border-bottom: none;
    }
    
    .landing-location-row label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        color: var(--text-primary);
    }
    
    .landing-location-row input[type="checkbox"] {
        margin: 0;
    }
    
    /* Cleaner Content */
    .overview-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }
    
    .overview-card {
        background: var(--secondary-bg);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .card-icon {
        font-size: 2rem;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }
    
    .safe-files .card-icon { background: var(--success-color); }
    .caution-files .card-icon { background: var(--warning-color); }
    .risky-files .card-icon { background: var(--error-color); }
    
    .card-content h3 {
        margin: 0 0 0.5rem 0;
        color: var(--text-primary);
        font-size: 1.5rem;
    }
    
    .card-content p {
        margin: 0;
        color: var(--text-secondary);
    }
    
    .bulk-actions {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
    }
    
    /* Backup Content */
    .overview-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }
    
    .stat-card {
        background: var(--secondary-bg);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .stat-icon {
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
    
    .stat-content h3 {
        margin: 0 0 0.5rem 0;
        color: var(--text-primary);
        font-size: 1.5rem;
    }
    
    .stat-content p {
        margin: 0;
        color: var(--text-secondary);
    }
    
    .search-controls {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        align-items: center;
    }
    
    .search-box {
        position: relative;
        flex: 1;
        max-width: 300px;
    }
    
    .search-input {
        width: 100%;
        padding: 0.75rem 2.5rem 0.75rem 1rem;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        background: var(--primary-bg);
        color: var(--text-primary);
    }
    
    .search-icon {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-secondary);
    }
    
    .filter-select {
        padding: 0.75rem 1rem;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        background: var(--primary-bg);
        color: var(--text-primary);
    }
    
    /* Settings Content */
    .settings-sections {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }
    
    .settings-section {
        background: var(--secondary-bg);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 1.5rem;
    }
    
    .settings-section h3 {
        margin: 0 0 1.5rem 0;
        color: var(--text-primary);
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 0.5rem;
    }
    
    .setting-group {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    
    .setting-label {
        min-width: 150px;
        color: var(--text-primary);
        font-weight: 500;
    }
    
    .setting-control {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
    }
    
    .form-input {
        flex: 1;
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        background: var(--primary-bg);
        color: var(--text-primary);
    }
    
    .form-select {
        flex: 1;
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        background: var(--primary-bg);
        color: var(--text-primary);
    }
    
    .form-checkbox {
        width: 1.25rem;
        height: 1.25rem;
    }
    
    .setting-unit {
        color: var(--text-secondary);
        font-size: 0.875rem;
    }
    
    /* No Results */
    .no-results {
        text-align: center;
        padding: 3rem;
        color: var(--text-secondary);
    }
    
    .no-results-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }
    
    .no-results h3 {
        margin: 0 0 1rem 0;
        color: var(--text-primary);
    }
    
    .no-results p {
        margin: 0;
    }
    
    .muted {
        color: var(--text-secondary);
        font-style: italic;
        text-align: center;
        padding: 2rem;
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
        color: var (--error-color);
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
        
        .main-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
        }
        
        .main-actions {
            flex-wrap: wrap;
        }
        
        .landing-controls {
            flex-direction: column;
        }
        
        .bulk-actions {
            flex-direction: column;
        }
        
        .search-controls {
            flex-direction: column;
            align-items: stretch;
        }
        
        .search-box {
            max-width: none;
        }
        
        .setting-group {
            flex-direction: column;
            align-items: flex-start;
        }
        
        .setting-label {
            min-width: auto;
        }
    }
`;
document.head.appendChild(style);

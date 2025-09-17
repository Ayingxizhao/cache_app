// Enhanced Navigation Component for Cache App with Router Integration
class Navigation {
    constructor(router, appState) {
        this.router = router;
        this.appState = appState;
        this.currentSection = 'scanner';
        this.sections = {
            scanner: {
                id: 'scanner',
                title: 'Cache Scanner',
                icon: '🔍',
                description: 'Scan and analyze cache locations'
            },
            cleaner: {
                id: 'cleaner', 
                title: 'Cache Cleaner',
                icon: '🧹',
                description: 'Clean and delete cache files safely'
            },
            backup: {
                id: 'backup',
                title: 'Backup Manager', 
                icon: '💾',
                description: 'Manage backup sessions and restore files'
            },
            settings: {
                id: 'settings',
                title: 'Settings',
                icon: '⚙️',
                description: 'Configure app preferences and policies'
            },
            help: {
                id: 'help',
                title: 'Help & Docs',
                icon: '❓',
                description: 'Documentation and support'
            }
        };
        
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
                    ${Object.values(this.sections).map(section => `
                        <button class="nav-tab ${this.currentSection === section.id ? 'active' : ''}" 
                                data-section="${section.id}"
                                title="${section.description}">
                            <span class="nav-tab-icon">${section.icon}</span>
                            <span class="nav-tab-text">${section.title}</span>
                        </button>
                    `).join('')}
                </div>
                
                <div class="nav-footer">
                    <div class="nav-info">
                        <div class="info-item">
                            <span class="info-label">Version</span>
                            <span class="info-value">1.0.0</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">System</span>
                            <span class="info-value">macOS</span>
                        </div>
                    </div>
                </div>
            </nav>
        `;
    }

    createMainContentHTML() {
        return `
            <main class="app-main">
                <div class="main-header">
                    <div class="section-title">
                        <h1 id="sectionTitle">${this.sections[this.currentSection].title}</h1>
                        <p id="sectionDescription">${this.sections[this.currentSection].description}</p>
                    </div>
                    <div class="main-actions" id="mainActions">
                        <!-- Dynamic actions based on current section -->
                    </div>
                </div>
                
                <!-- Breadcrumb navigation -->
                <div class="breadcrumb-container" id="breadcrumbContainer"></div>
                
                <div class="main-content">
                    <div class="content-section active" id="scanner-section">
                        <!-- Scanner content will be loaded here -->
                    </div>
                    <div class="content-section" id="cleaner-section">
                        <!-- Cleaner content will be loaded here -->
                    </div>
                    <div class="content-section" id="backup-section">
                        <!-- Backup content will be loaded here -->
                    </div>
                    <div class="content-section" id="settings-section">
                        <!-- Settings content will be loaded here -->
                    </div>
                    <div class="content-section" id="help-section">
                        <!-- Help content will be loaded here -->
                    </div>
                </div>
            </main>
        `;
    }

    switchSection(sectionId) {
        console.log('Switching to section:', sectionId);
        
        if (!this.sections[sectionId]) {
            console.error(`Unknown section: ${sectionId}`);
            return;
        }

        // Use router for navigation
        this.router.navigate(sectionId);
    }
    
    updateCurrentSection(currentRoute) {
        if (!currentRoute) return;
        
        this.currentSection = currentRoute.section || currentRoute.name;
        
        // Update navigation tabs
        const navTabs = document.querySelectorAll('.nav-tab');
        console.log('Found nav tabs:', navTabs.length);
        navTabs.forEach(tab => {
            tab.classList.remove('active');
        });
        
        const activeTab = document.querySelector(`[data-section="${this.currentSection}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        } else {
            console.error(`Could not find tab for section: ${this.currentSection}`);
        }
        
        // Update main content
        const sectionTitle = document.getElementById('sectionTitle');
        const sectionDescription = document.getElementById('sectionDescription');
        
        if (sectionTitle) {
            sectionTitle.textContent = this.sections[sectionId].title;
        } else {
            console.error('sectionTitle element not found');
        }
        
        if (sectionDescription) {
            sectionDescription.textContent = this.sections[sectionId].description;
        } else {
            console.error('sectionDescription element not found');
        }
        
        // Hide all content sections
        const contentSections = document.querySelectorAll('.content-section');
        console.log('Found content sections:', contentSections.length);
        contentSections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Show current section
        const currentSection = document.getElementById(`${sectionId}-section`);
        if (currentSection) {
            currentSection.classList.add('active');
            console.log('Activated section:', `${sectionId}-section`);
        } else {
            console.error(`Could not find section element: ${sectionId}-section`);
        }
        
        // Update main actions
        this.updateMainActions(sectionId);
        
        // Load section content
        this.loadSectionContent(sectionId);
        
        // Update URL hash
        window.location.hash = sectionId;
    }

    updateMainActions(sectionId) {
        const actionsContainer = document.getElementById('mainActions');
        let actionsHTML = '';
        
        switch(sectionId) {
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
                break;
            case 'cleaner':
                actionsHTML = `
                    <button class="btn btn-outline" id="refreshScanResults">
                        <span class="btn-icon">🔄</span>
                        Refresh Results
                    </button>
                    <button class="btn btn-success" id="cleanSafeFiles">
                        <span class="btn-icon">🧹</span>
                        Clean Safe Files
                    </button>
                `;
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
            case 'help':
                actionsHTML = `
                    <button class="btn btn-outline" id="exportLogs">
                        <span class="btn-icon">📤</span>
                        Export Logs
                    </button>
                    <button class="btn btn-secondary" id="checkUpdates">
                        <span class="btn-icon">🔄</span>
                        Check Updates
                    </button>
                `;
                break;
        }
        
        actionsContainer.innerHTML = actionsHTML;
    }

    loadSectionContent(sectionId) {
        const sectionElement = document.getElementById(`${sectionId}-section`);
        
        switch(sectionId) {
            case 'scanner':
                this.loadScannerContent(sectionElement);
                break;
            case 'cleaner':
                this.loadCleanerContent(sectionElement);
                break;
            case 'backup':
                this.loadBackupContent(sectionElement);
                break;
            case 'settings':
                this.loadSettingsContent(sectionElement);
                // Initialize settings manager if available
                if (window.settingsManager) {
                    window.settingsManager.initializeSettingsUI();
                }
                break;
            case 'help':
                this.loadHelpContent(sectionElement);
                // Initialize help system if available
                if (window.helpSystem) {
                    window.helpSystem.initializeHelpUI();
                }
                break;
        }
    }

    loadScannerContent(container) {
        container.innerHTML = `
            <div class="scanner-content">
                <div id="scannerLanding" class="scanner-landing">
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

                <div class="scanner-controls" id="scannerControls" style="margin-top:16px;">
                    <div class="location-selector">
                        <label for="locationSelect" class="form-label">Select Cache Location</label>
                        <div class="select-wrapper">
                            <select id="locationSelect" class="form-select">
                                <option value="">Loading locations...</option>
                            </select>
                            <div class="select-arrow">▼</div>
                        </div>
                    </div>

                    <div class="scan-actions">
                        <button id="refreshLocationsButton" class="btn btn-outline">
                            <span class="btn-icon">🔄</span>
                            Refresh Locations
                        </button>
                        <button id="scanButton" class="btn btn-primary">
                            <span class="btn-icon">🔍</span>
                            Scan Selected Location
                        </button>
                        <button id="stopScanButton" class="btn btn-danger" disabled>
                            <span class="btn-icon">⏹️</span>
                            Stop Scan
                        </button>
                    </div>
                </div>

                <div class="scan-progress" id="scanProgress" style="display: none;">
                    <!-- Progress will be shown here -->
                </div>

                <div class="scan-results" id="scanResults">
                    <div class="no-results">
                        <div class="no-results-icon">📁</div>
                        <h3>No scan results yet</h3>
                        <p>Select a cache location and click "Scan Selected Location" or use the chooser above to start a scan.</p>
                    </div>
                </div>
            </div>
        `;

        // Initialize scanner functionality
        this.initializeScanner();
    }

    initializeScanner() {
        // Load cache locations into the dropdown and landing chooser
        this.loadCacheLocations();

        // Populate landing chooser list
        const populateLandingList = async () => {
            try {
                let locations = window.appState?.get('cacheLocations') || [];
                if (!locations || locations.length === 0) {
                    if (typeof window.GetCacheLocationsFromConfig === 'function') {
                        try {
                            const locationsData = await window.GetCacheLocationsFromConfig();
                            locations = JSON.parse(locationsData || '[]');
                            if (window.appState) window.appState.setCacheLocations(locations);
                        } catch (e) { console.warn('Failed to load locations for landing list', e); }
                    }
                }

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
                    row.innerHTML = `<label><input type="checkbox" data-loc-index="${i}" value="${id}"> ${this.escapeHtml(label)}</label>`;
                    frag.appendChild(row);
                });
                listContainer.appendChild(frag);
            } catch (error) {
                console.error('populateLandingList error:', error);
            }
        };

        // Wire landing buttons
        const refreshLandingBtn = document.getElementById('refreshLocationsLanding');
        const scanSelectedLandingBtn = document.getElementById('scanSelectedLanding');
        const scanAllLandingBtn = document.getElementById('scanAllLanding');

        if (refreshLandingBtn) refreshLandingBtn.addEventListener('click', async () => { await this.loadCacheLocations(); await populateLandingList(); if (window.notificationSystem) window.notificationSystem.info('Locations refreshed'); });

        if (scanSelectedLandingBtn && !window.scanSelectedLandingHandler) scanSelectedLandingBtn.addEventListener('click', async () => {
            try {
                const checks = Array.from(document.querySelectorAll('#landingLocationsList input[type="checkbox"]:checked'));
                if (checks.length === 0) {
                    if (window.notificationSystem) window.notificationSystem.warning('Please select at least one location to scan');
                    return;
                }
                const locations = window.appState?.get('cacheLocations') || [];
                const selected = checks.map(ch => {
                    const idx = Number(ch.dataset.locIndex);
                    const loc = locations[idx];
                    return { id: loc?.id, name: loc?.name, path: loc?.path };
                }).filter(x => x && x.path);

                if (selected.length === 0) {
                    if (window.notificationSystem) window.notificationSystem.error('Selected locations invalid');
                    return;
                }

                // Confirm large scans
                if (selected.length > 3) {
                    const ok = window.confirm(`You selected ${selected.length} locations. Scanning many locations may take a long time. Continue?`);
                    if (!ok) return;
                }

                // Start scan of selected locations
                if (typeof window.ScanMultipleCacheLocations === 'function') {
                    const payload = JSON.stringify(selected);
                    const res = await window.ScanMultipleCacheLocations(payload);
                    // backend returns immediate status JSON string
                    const status = JSON.parse(res || '{}');
                    if (status && status.status === 'scan_started') {
                        if (window.notificationSystem) window.notificationSystem.loading('Scan started in background...', { duration: 0 });
                        // start polling via existing pollForScanResult
                        this.pollForScanResult();
                    } else {
                        throw new Error('Unexpected response');
                    }
                } else {
                    throw new Error('ScanMultipleCacheLocations not available');
                }
            } catch (err) {
                console.error('scanSelectedLanding error:', err);
                if (window.notificationSystem) window.notificationSystem.error('Failed to start scan: ' + err.message);
            }
        });

        if (scanAllLandingBtn && !window.scanAllLandingHandler) scanAllLandingBtn.addEventListener('click', async () => {
            try {
                const ok = window.confirm('Scan ALL safe locations? This may take a long time and use significant resources. Proceed?');
                if (!ok) return;
                // Reuse existing global helper that filters safe locations
                if (typeof window.scanAllLocations === 'function') {
                    await window.scanAllLocations();
                } else {
                    // Fallback: build list and call ScanMultipleCacheLocations
                    const locations = window.appState?.get('cacheLocations') || [];
                    const safeLocations = locations.filter(loc => loc.type === 'user' || loc.type === 'application').map(loc => ({ id: loc.id, name: loc.name, path: loc.path }));
                    if (safeLocations.length === 0) {
                        if (window.notificationSystem) window.notificationSystem.warning('No safe locations found to scan');
                        return;
                    }
                    if (typeof window.ScanMultipleCacheLocations === 'function') {
                        const res = await window.ScanMultipleCacheLocations(JSON.stringify(safeLocations));
                        const status = JSON.parse(res || '{}');
                        if (status && status.status === 'scan_started') {
                            if (window.notificationSystem) window.notificationSystem.loading('Scan started in background...', { duration: 0 });
                            this.pollForScanResult();
                        }
                    }
                }
            } catch (e) {
                console.error('scanAllLandingBtn error:', e);
            }
        });

        // Existing event wiring for refresh/scan/stop buttons
        const refreshLocationsButton = document.getElementById('refreshLocationsButton');
        const scanButton = document.getElementById('scanButton');
        const stopScanButton = document.getElementById('stopScanButton');

        if (refreshLocationsButton) {
            refreshLocationsButton.addEventListener('click', () => {
                this.loadCacheLocations();
                if (window.notificationSystem) {
                    window.notificationSystem.info('Cache locations refreshed');
                }
                // also refresh landing list if present
                populateLandingList();
            });
        }

        if (scanButton) {
            scanButton.addEventListener('click', () => {
                this.startScan();
            });
        }

        if (stopScanButton) {
            stopScanButton.addEventListener('click', () => {
                this.stopScan();
            });
        }

        // Set up event listeners for main action buttons
        const refreshLocationsMain = document.getElementById('refreshLocations');
        const scanAllLocationsMain = document.getElementById('scanAllLocations');

        if (refreshLocationsMain) {
            refreshLocationsMain.addEventListener('click', async () => {
                if (window.loadInitialData) await window.loadInitialData();
            });
        }

        if (scanAllLocationsMain) {
            // Require explicit confirmation before invoking a full-scan from header
            scanAllLocationsMain.addEventListener('click', async () => {
                const confirmHeader = window.confirm('Scan ALL safe locations from header? This may take a long time and use significant resources. Proceed?');
                if (!confirmHeader) return;
                scanAllLocationsMain.disabled = true;
                scanAllLocationsMain.innerHTML = '<span class="btn-icon">⏳</span>Scanning...';
                try {
                    if (window.scanAllLocations) {
                        await window.scanAllLocations();
                    }
                } finally {
                    setTimeout(() => {
                        scanAllLocationsMain.disabled = false;
                        scanAllLocationsMain.innerHTML = '<span class="btn-icon">🌐</span>Scan All Safe';
                    }, 1000);
                }
            });
        }

        // Listen for scan results in app state
        if (window.appState) {
            window.appState.subscribe('scanResults', (results) => {
                this.displayScanResults(results);
            });

            window.appState.subscribe('isScanning', (isScanning) => {
                this.updateScanButtons(isScanning);
            });
        }

        // Populate landing list initially
        populateLandingList();
    }

    // Add defensive loader for cache locations to avoid missing function errors
    async loadCacheLocations() {
        try {
            let locations = window.appState?.get('cacheLocations') || [];

            // Try config-based getter (wails binding)
            if ((!locations || locations.length === 0) && typeof window.GetCacheLocationsFromConfig === 'function') {
                try {
                    const data = await window.GetCacheLocationsFromConfig();
                    locations = JSON.parse(data || '[]');
                } catch (e) {
                    console.warn('GetCacheLocationsFromConfig failed', e);
                }
            }

            // Try another possible getter
            if ((!locations || locations.length === 0) && typeof window.GetCacheLocations === 'function') {
                try {
                    const data = await window.GetCacheLocations();
                    locations = JSON.parse(data || '[]');
                } catch (e) {
                    console.warn('GetCacheLocations failed', e);
                }
            }

            // Normalize to array
            if (!Array.isArray(locations)) {
                if (locations && typeof locations === 'object') locations = [locations];
                else locations = [];
            }

            // Persist into appState if setter exists
            if (window.appState && typeof window.appState.setCacheLocations === 'function') {
                window.appState.setCacheLocations(locations);
            } else if (window.appState && typeof window.appState.set === 'function') {
                try { window.appState.set('cacheLocations', locations); } catch (e) { /* ignore */ }
            }

            // Populate the simple select used in scanner controls
            const select = document.getElementById('locationSelect');
            if (select) {
                select.innerHTML = '';
                if (!locations || locations.length === 0) {
                    const opt = document.createElement('option'); opt.value = ''; opt.textContent = 'No locations available';
                    select.appendChild(opt);
                } else {
                    locations.forEach((loc, i) => {
                        const opt = document.createElement('option');
                        opt.value = loc.path || loc.id || i;
                        opt.textContent = loc.name || loc.path || loc.id || `Location ${i+1}`;
                        select.appendChild(opt);
                    });
                }
            }

            return locations;
        } catch (e) {
            console.error('loadCacheLocations error:', e);
            return [];
        }
    }

    // Start a scan for the currently selected location (or single selected from select)
    async startScan() {
        try {
            const select = document.getElementById('locationSelect');
            if (!select) {
                console.warn('startScan: locationSelect not found');
                if (window.notificationSystem) window.notificationSystem.error('No location selector available');
                return;
            }

            const value = select.value;
            if (!value) {
                if (window.notificationSystem) window.notificationSystem.warning('Please select a cache location to scan');
                return;
            }

            // Resolve selected location from appState
            const locations = window.appState?.get('cacheLocations') || [];
            let location = locations.find(loc => (loc.path === value) || (loc.id === value) || (loc.name === value));
            if (!location) {
                // Try to match by index/value as fallback
                const idx = Number(value);
                if (!Number.isNaN(idx) && locations[idx]) location = locations[idx];
            }

            if (!location) {
                // If nothing matched, build a minimal location object
                location = { id: value, name: value, path: value };
            }

            // Call backend ScanCacheLocation if available
            if (typeof window.ScanCacheLocation === 'function') {
                if (window.notificationSystem) window.notificationSystem.loading('Starting scan...', { duration: 0 });
                window.appState?.setScanning(true);

                try {
                    const res = await window.ScanCacheLocation(location.id || '', location.name || '', location.path || '');
                    console.log('ScanCacheLocation response:', res);

                    // Backend returns immediate status; attempt to parse
                    const parsed = this._safeParseJSON(res);
                    if (parsed && parsed.status === 'scan_started') {
                        // Enable stop button UI
                        const stopBtn = document.getElementById('stopScanButton');
                        if (stopBtn) stopBtn.disabled = false;

                        // Begin polling for result
                        this.pollForScanResult();
                        return;
                    }

                    // Fallback: start polling anyway
                    this.pollForScanResult();
                } catch (e) {
                    console.error('startScan error calling ScanCacheLocation:', e);
                    if (window.notificationSystem) window.notificationSystem.error('Failed to start scan: ' + (e.message || e));
                    window.appState?.setScanning(false);
                }
            } else if (typeof window.ScanMultipleCacheLocations === 'function') {
                // If only multi-scan is available, call with single-location payload
                try {
                    const payload = JSON.stringify([ { id: location.id, name: location.name, path: location.path } ]);
                    const res = await window.ScanMultipleCacheLocations(payload);
                    console.log('ScanMultipleCacheLocations response:', res);
                    const parsed = this._safeParseJSON(res);
                    if (parsed && parsed.status === 'scan_started') {
                        if (window.notificationSystem) window.notificationSystem.loading('Scan started in background...', { duration: 0 });
                        window.appState?.setScanning(true);
                        const stopBtn = document.getElementById('stopScanButton');
                        if (stopBtn) stopBtn.disabled = false;
                        this.pollForScanResult();
                        return;
                    }
                    this.pollForScanResult();
                } catch (e) {
                    console.error('startScan error calling ScanMultipleCacheLocations:', e);
                    if (window.notificationSystem) window.notificationSystem.error('Failed to start scan: ' + (e.message || e));
                    window.appState?.setScanning(false);
                }
            } else {
                console.error('No scan functions available on window');
                if (window.notificationSystem) window.notificationSystem.error('Scan functionality not available');
            }
        } catch (err) {
            console.error('startScan unexpected error:', err);
            if (window.notificationSystem) window.notificationSystem.error('Failed to start scan: ' + (err.message || err));
            window.appState?.setScanning(false);
        }
    }

    // Stop ongoing scan and cancel polling
    async stopScan() {
        try {
            // Cancel polling
            this._stopPolling = true;
            if (this._pollingTimeoutId) clearTimeout(this._pollingTimeoutId);

            if (typeof window.StopScan === 'function') {
                try {
                    await window.StopScan();
                    console.log('StopScan invoked');
                } catch (e) {
                    console.warn('StopScan call failed', e);
                }
            }

            window.appState?.setScanning(false);
            if (window.notificationSystem) window.notificationSystem.success('Scan stopped', { duration: 2000 });

            const stopBtn = document.getElementById('stopScanButton');
            if (stopBtn) stopBtn.disabled = true;
        } catch (e) {
            console.error('stopScan error:', e);
        }
    }

    // Poll backend for last scan result until it's available or timeout
    async pollForScanResult({ interval = 2000, timeout = 5 * 60 * 1000 } = {}) {
        try {
            // Prevent multiple pollers
            if (this._isPolling) {
                console.warn('pollForScanResult: already polling');
                return;
            }

            this._isPolling = true;
            this._stopPolling = false;
            const start = Date.now();
            let attempt = 0;

            const pollOnce = async () => {
                attempt += 1;
                if (this._stopPolling) {
                    this._isPolling = false;
                    return;
                }

                try {
                    if (typeof window.GetLastScanResult !== 'function') {
                        console.warn('GetLastScanResult not available on window');
                        // Wait and retry
                        scheduleNext();
                        return;
                    }

                    const res = await window.GetLastScanResult();
                    console.log('GetLastScanResult raw:', res);

                    const parsed = this._safeParseJSON(res);

                    // Defensive shape logging for backend analysis
                    console.log('GetLastScanResult parsed shape:', parsed && Object.keys(parsed || {}).slice(0,10));

                    // Common backend reply: { status: 'no_result' } or { status: 'in_progress' } or a scan result object
                    if (!parsed) {
                        // Nothing useful yet
                        scheduleNext();
                        return;
                    }

                    // If backend indicates no result yet
                    const status = parsed.status || parsed.Status || null;
                    if (status === 'no_result' || status === 'in_progress' || status === 'scan_started') {
                        // Optionally update progress if available
                        if (parsed.progress) {
                            window.appState?.setScanProgress(parsed.progress);
                        }
                        // Continue polling until timeout
                        if (Date.now() - start > timeout) {
                            console.warn('pollForScanResult: timeout reached');
                            window.appState?.setScanning(false);
                            this._isPolling = false;
                            if (window.notificationSystem) window.notificationSystem.error('Scan timed out');
                            return;
                        }

                        scheduleNext();
                        return;
                    }

                    // If parsed looks like a full scan result (heuristic)
                    const normalized = this.normalizeScanResult(parsed);

                    // Store normalized results in memory for large payloads
                    window._scanResults = normalized;

                    // Update app state and UI
                    window.appState?.setScanResults(normalized);
                    window.appState?.setScanning(false);
                    this._isPolling = false;

                    if (window.notificationSystem) window.notificationSystem.success('Scan results received', { duration: 3000 });

                    // Disable stop button
                    const stopBtn = document.getElementById('stopScanButton');
                    if (stopBtn) stopBtn.disabled = true;
                } catch (e) {
                    console.error('pollForScanResult iteration error:', e);
                    // Continue polling unless stop flag is set or timeout
                    if (Date.now() - start > timeout) {
                        console.warn('pollForScanResult: timeout after error');
                        window.appState?.setScanning(false);
                        this._isPolling = false;
                        if (window.notificationSystem) window.notificationSystem.error('Scan timed out');
                        return;
                    }
                    scheduleNext();
                }
            };

            const scheduleNext = () => {
                const backoff = Math.min(30000, interval * Math.pow(1.2, attempt));
                this._pollingTimeoutId = setTimeout(pollOnce, backoff);
            };

            // Start first poll immediately
            pollOnce();
        } catch (err) {
            console.error('pollForScanResult unexpected error:', err);
            this._isPolling = false;
            window.appState?.setScanning(false);
        }
    }

    // Normalize backend scan payloads into a predictable shape
    normalizeScanResult(raw) {
        try {
            // If raw has a top-level results array, use it
            let result = raw;

            // Some backends wrap results under 'result' or 'results'
            if (raw && raw.results) result = raw.results;
            if (raw && raw.result) result = raw.result;

            // If result is an object with location keys, convert to array
            if (result && typeof result === 'object' && !Array.isArray(result)) {
                // Heuristic: keys are locations
                const keys = Object.keys(result);
                if (keys.length > 0 && result[keys[0]] && Array.isArray(result[keys[0]])) {
                    result = keys.map(k => ({ location: k, files: result[k] }));
                }
            }

            // Final normalized shape: { locations: [ { id,name,path,files:[{name,path,size,last_modified,is_dir,safety}] } ], totals: { files, size } }
            const normalized = { locations: [], totals: { files: 0, size: 0 } };

            const locationsArray = Array.isArray(result) ? result : [result];

            locationsArray.forEach((locEntry) => {
                // locEntry might be { location: 'name', files: [...] } or { id,name,path,files }
                const filesRaw = locEntry.files || locEntry.Files || locEntry.files_list || locEntry.filesList || (Array.isArray(locEntry) ? locEntry : null) || [];

                const loc = {
                    id: locEntry.id || locEntry.location || locEntry.name || null,
                    name: locEntry.name || locEntry.location || locEntry.id || 'Unknown',
                    path: locEntry.path || locEntry.root || null,
                    files: []
                };

                const filesArray = Array.isArray(filesRaw) ? filesRaw : (Array.isArray(locEntry) ? locEntry : []);

                filesArray.forEach((f) => {
                    // Tolerant field picking
                    const name = f.name || f.fileName || f.filename || f.path?.split?.('/').pop?.() || String(f.path || f.file || '');
                    const path = f.path || f.file || f.filepath || f.filePath || null;
                    const size = Number(f.size || f.bytes || f.length || 0) || 0;
                    const last_modified = f.last_modified || f.modified || f.mtime || f.lastModified || null;
                    const is_dir = f.is_dir || f.isDir || f.directory || false;
                    const safety = f.safety || f.safety_level || f.classification || 'unknown';

                    loc.files.push({ name, path, size, last_modified, is_dir: !!is_dir, safety });
                    normalized.totals.files += 1;
                    normalized.totals.size += size;
                });

                normalized.locations.push(loc);
            });

            return normalized;
        } catch (e) {
            console.error('normalizeScanResult failed:', e, 'raw:', raw);
            return { locations: [], totals: { files: 0, size: 0 } };
        }
    }

    // Safe JSON parsing helper (returns object or null)
    _safeParseJSON(input) {
        if (!input) return null;
        if (typeof input === 'object') return input;
        try {
            return JSON.parse(input);
        } catch (e) {
            // Try to recover simple cases (single-quoted JSON, trailing commas) - minimal effort
            try {
                const cleaned = String(input).replace(/\bNaN\b/g, 'null').replace(/,\s*}/g, '}').replace(/,\s*\]/g, ']');
                return JSON.parse(cleaned);
            } catch (e2) {
                console.warn('Failed to parse JSON payload', e2, input);
                return null;
            }
        }
    }

    loadCleanerContent(container) {
        container.innerHTML = `
            <div class="cleaner-content">
                <div class="cleaner-overview">
                    <div class="overview-cards">
                        <div class="overview-card safe-files">
                            <div class="card-icon">✅</div>
                            <div class="card-content">
                                <h3 id="safeFilesCount">0</h3>
                                <p>Safe Files</p>
                            </div>
                        </div>
                        <div class="overview-card caution-files">
                            <div class="card-icon">⚠️</div>
                            <div class="card-content">
                                <h3 id="cautionFilesCount">0</h3>
                                <p>Caution Files</p>
                            </div>
                        </div>
                        <div class="overview-card risky-files">
                            <div class="card-icon">🚨</div>
                            <div class="card-content">
                                <h3 id="riskyFilesCount">0</h3>
                                <p>Risky Files</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="cleaner-controls">
                    <div class="file-filters">
                        <div class="filter-group">
                            <label class="filter-label">Safety Level:</label>
                            <select id="safetyFilter" class="filter-select">
                                <option value="all">All Files</option>
                                <option value="safe">Safe Only</option>
                                <option value="caution">Caution Only</option>
                                <option value="risky">Risky Only</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label class="filter-label">Size:</label>
                            <select id="sizeFilter" class="filter-select">
                                <option value="all">All Sizes</option>
                                <option value="small">Small (< 1MB)</option>
                                <option value="medium">Medium (1-100MB)</option>
                                <option value="large">Large (> 100MB)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="bulk-actions">
                        <button id="selectAllSafe" class="btn btn-outline">
                            <span class="btn-icon">☑️</span>
                            Select All Safe
                        </button>
                        <button id="clearSelection" class="btn btn-outline">
                            <span class="btn-icon">☐</span>
                            Clear Selection
                        </button>
                        <button id="deleteSelected" class="btn btn-danger">
                            <span class="btn-icon">🗑️</span>
                            Delete Selected
                        </button>
                    </div>
                </div>
                
                <div class="files-list" id="filesList">
                    <!-- Files will be listed here -->
                </div>
            </div>
        `;
    }

    loadBackupContent(container) {
        container.innerHTML = `
            <div class="backup-content">
                <div class="backup-overview">
                    <div class="overview-stats">
                        <div class="stat-card">
                            <div class="stat-icon">💾</div>
                            <div class="stat-content">
                                <h3 id="totalBackups">0</h3>
                                <p>Total Backups</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">📁</div>
                            <div class="stat-content">
                                <h3 id="totalFiles">0</h3>
                                <p>Backed Up Files</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">💿</div>
                            <div class="stat-content">
                                <h3 id="totalSize">0</h3>
                                <p>Total Size</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="backup-controls">
                    <div class="search-controls">
                        <div class="search-box">
                            <input type="text" id="backupSearch" placeholder="Search backups..." class="search-input">
                            <span class="search-icon">🔍</span>
                        </div>
                        <select id="backupFilter" class="filter-select">
                            <option value="all">All Backups</option>
                            <option value="recent">Recent (7 days)</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                        </select>
                    </div>
                </div>
                
                <div class="backup-sessions" id="backupSessions">
                    <!-- Backup sessions will be listed here -->
                </div>
            </div>
        `;
    }

    loadSettingsContent(container) {
        container.innerHTML = `
            <div class="settings-content">
                <div class="settings-sections">
                    <div class="settings-section">
                        <h3>Backup Settings</h3>
                        <div class="setting-group">
                            <label class="setting-label">Backup Location:</label>
                            <div class="setting-control">
                                <input type="text" id="backupLocation" class="form-input" readonly>
                                <button id="changeBackupLocation" class="btn btn-outline">Change</button>
                            </div>
                        </div>
                        <div class="setting-group">
                            <label class="setting-label">Retention Policy:</label>
                            <select id="retentionPolicy" class="form-select">
                                <option value="7">7 days</option>
                                <option value="30">30 days</option>
                                <option value="90">90 days</option>
                                <option value="365">1 year</option>
                                <option value="0">Never delete</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h3>Safety Settings</h3>
                        <div class="setting-group">
                            <label class="setting-label">Safe Age Threshold:</label>
                            <input type="number" id="safeAgeThreshold" class="form-input" min="1" max="365">
                            <span class="setting-unit">days</span>
                        </div>
                        <div class="setting-group">
                            <label class="setting-label">Large File Threshold:</label>
                            <input type="number" id="largeFileThreshold" class="form-input" min="1" max="10000">
                            <span class="setting-unit">MB</span>
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h3>Performance Settings</h3>
                        <div class="setting-group">
                            <label class="setting-label">Concurrent Scans:</label>
                            <input type="number" id="concurrentScans" class="form-input" min="1" max="10">
                        </div>
                        <div class="setting-group">
                            <label class="setting-label">Enable Background Processing:</label>
                            <input type="checkbox" id="backgroundProcessing" class="form-checkbox">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    loadHelpContent(container) {
        container.innerHTML = `
            <div class="help-content">
                <div class="help-sections">
                    <div class="help-section">
                        <h3>Getting Started</h3>
                        <div class="help-content">
                            <p>Welcome to Cache App! This application helps you manage and clean cache files on your macOS system safely.</p>
                            <ol>
                                <li><strong>Scan:</strong> Select cache locations and scan for files</li>
                                <li><strong>Review:</strong> Examine scan results and safety classifications</li>
                                <li><strong>Clean:</strong> Select files to delete with automatic backup</li>
                                <li><strong>Restore:</strong> Use backup manager to restore files if needed</li>
                            </ol>
                        </div>
                    </div>
                    
                    <div class="help-section">
                        <h3>Safety Features</h3>
                        <div class="help-content">
                            <p>Cache App uses advanced safety classification to protect your system:</p>
                            <ul>
                                <li><strong>Safe:</strong> Files that are clearly cache files and safe to delete</li>
                                <li><strong>Caution:</strong> Files that might be cache files but require review</li>
                                <li><strong>Risky:</strong> Files that could be important system files</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="help-section">
                        <h3>Troubleshooting</h3>
                        <div class="help-content">
                            <p>Common issues and solutions:</p>
                            <ul>
                                <li><strong>Permission Errors:</strong> Run the app with appropriate permissions</li>
                                <li><strong>Slow Scans:</strong> Reduce concurrent scan count in settings</li>
                                <li><strong>Backup Failures:</strong> Check available disk space and permissions</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    updateSystemStatus(status, message) {
        const statusIndicator = document.getElementById('systemStatus');
        const statusDot = statusIndicator.querySelector('.status-dot');
        const statusText = statusIndicator.querySelector('.status-text');
        
        statusDot.className = `status-dot ${status}`;
        statusText.textContent = message;
    }

    // Small helper to escape HTML for safe insertion into innerHTML
    escapeHtml(input) {
        if (input === null || input === undefined) return '';
        return String(input)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    initialize() {
        console.log('Initializing Navigation component...');
        
        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-tab')) {
                const sectionId = e.target.closest('.nav-tab').dataset.section;
                console.log('Navigation tab clicked:', sectionId);
                this.switchSection(sectionId);
            }
        });
        
        // Initialize breadcrumbs if available
        if (window.Breadcrumbs) {
            const breadcrumbContainer = document.getElementById('breadcrumbContainer');
            if (breadcrumbContainer) {
                this.breadcrumbs = new window.Breadcrumbs(this.router, this.appState);
                this.breadcrumbs.attachTo(breadcrumbContainer);
            }
        }
        
        // Initialize with current route
        const currentRoute = this.router.getCurrentRoute();
        if (currentRoute) {
            this.updateCurrentSection(currentRoute);
        }
        
        console.log('Navigation component initialized');
    }
}

// Export for use in main app
export { Navigation };
window.Navigation = Navigation;

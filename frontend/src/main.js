import './style.css';
import './app.css';
import { ScanCacheLocation, ScanMultipleCacheLocations, GetCacheLocationsFromConfig, GetSystemInfo, IsScanning, StopScan, GetScanProgress, GetLastScanResult, GetSafetyClassificationSummary, ClassifyFileSafety, GetSafetyClassificationRules, GetFilesBySafetyLevel, DeleteFilesWithConfirmation, ConfirmDeletion, GetDeletionProgress, StopDeletion, RestoreFromBackup, GetDeletionHistory, GetAvailableBackups, ValidateFilesForDeletion, GetDeletionSystemStatus, RevealInFinder, GetBackupBrowserData, GetBackupSessionDetails, PreviewRestoreOperation, RestoreFromBackupWithOptions, DeleteBackupSession, CleanupBackupsByAge, GetBackupProgress } from '../wailsjs/go/main/App.js';

// Global state
let isScanning = false;
let currentScanResult = null;
let progressInterval = null;
let scanStartTime = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    createUI();
    initializeApp();
    setupEventListeners();
    
    // Make functions globally available
    window.selectAllSafeFiles = selectAllSafeFiles;
    window.clearFileSelection = clearFileSelection;
    window.showUndoOptions = showUndoOptions;
    window.showFileDetails = showFileDetails;
    window.closeFileDetails = closeFileDetails;
    window.revealInFinder = revealInFinder;
    window.toggleLocationFiles = toggleLocationFiles;
    window.deleteSelectedFiles = deleteSelectedFiles;
    window.confirmDeletion = confirmDeletion;
    window.closeDeletionConfirmation = closeDeletionConfirmation;
    window.closeRestoreDialog = closeRestoreDialog;
    window.restoreFromBackup = restoreFromBackup;
    
    // Backup Management Functions
    window.showBackupManager = showBackupManager;
    window.closeBackupManager = closeBackupManager;
    window.refreshBackupData = refreshBackupData;
    window.showBackupDetails = showBackupDetails;
    window.closeBackupDetails = closeBackupDetails;
    window.restoreBackupSession = restoreBackupSession;
    window.restoreSelectedFiles = restoreSelectedFiles;
    window.deleteBackupSession = deleteBackupSession;
    window.cleanupOldBackups = cleanupOldBackups;
    window.previewRestore = previewRestore;
    window.closeRestorePreview = closeRestorePreview;
});

function createUI() {
    // Create a modern, beautiful UI
    document.querySelector('#app').innerHTML = `
        <div class="app-container">
            <header class="app-header">
                <div class="header-content">
                    <div class="logo">
                        <div class="logo-icon">🗂️</div>
                        <div class="logo-text">
                            <h1>Cache App</h1>
                            <p>macOS Cache Cleaner & Scanner</p>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button id="backupManagerButton" class="btn btn-secondary">
                            <span class="btn-icon">💾</span>
                            Backup Manager
                        </button>
                        <button id="refreshButton" class="btn btn-outline">
                            <span class="btn-icon">🔄</span>
                            Refresh
                        </button>
                    </div>
                </div>
            </header>
            
            <main class="app-main">
                <div class="scan-section">
                    <div class="section-header">
                        <h2>Cache Scanner</h2>
                        <p>Select a cache location to scan and analyze</p>
                    </div>
                    
                    <div class="scan-controls">
                        <div class="location-selector">
                            <label for="locationSelect" class="form-label">Select Cache Location</label>
                            <div class="select-wrapper">
                                <select id="locationSelect" class="form-select">
                                    <option value="">Loading locations...</option>
                                </select>
                                <div class="select-arrow">▼</div>
                            </div>
                        </div>
                        
                        <div class="button-group">
                            <button id="scanButton" class="btn btn-primary">
                                <span class="btn-icon">🔍</span>
                                Scan Selected Location
                            </button>
                            <button id="scanAllButton" class="btn btn-secondary">
                                <span class="btn-icon">🌐</span>
                                Scan All Safe Locations
                            </button>
                            <button id="stopButton" class="btn btn-danger" disabled>
                                <span class="btn-icon">⏹️</span>
                                Stop Scan
                            </button>
                        </div>
                    </div>
                    
                    <div id="progressContainer" class="progress-container" style="display: none;">
                        <div class="progress-header">
                            <span id="progressText">Starting scan...</span>
                            <span id="progressTime">00:00</span>
                        </div>
                        <div class="progress-bar">
                            <div id="progressBar" class="progress-fill"></div>
                        </div>
                        <div id="progressDetails" class="progress-details">
                            <div class="progress-item">
                                <span class="progress-label">Files Scanned:</span>
                                <span id="filesScanned" class="progress-value">0</span>
                            </div>
                            <div class="progress-item">
                                <span class="progress-label">Size Found:</span>
                                <span id="sizeFound" class="progress-value">0 B</span>
                            </div>
                        </div>
                    </div>
                    
                    <div id="errorContainer" class="error-container" style="display: none;">
                        <div class="error-icon">⚠️</div>
                        <div class="error-content">
                            <h4>Error</h4>
                            <p id="errorMessage"></p>
                        </div>
                        <button id="errorClose" class="error-close">×</button>
                    </div>
                </div>
                
                <div class="results-section">
                    <div class="section-header">
                        <h2>Scan Results</h2>
                        <div class="results-actions">
                            <button id="exportButton" class="btn btn-outline" disabled>
                                <span class="btn-icon">📊</span>
                                Export Results
                            </button>
                        </div>
                    </div>
                    
                    <div id="scanResults" class="scan-results">
                        <div class="empty-state">
                            <div class="empty-icon">📁</div>
                            <h3>No Scan Results</h3>
                            <p>Select a cache location and click "Scan Selected Location" to begin analyzing cache files.</p>
                        </div>
                    </div>
                </div>
                
                <div class="info-section">
                    <div class="section-header">
                        <h2>System Information</h2>
                    </div>
                    <div id="systemInfo" class="system-info">
                        <div class="info-grid">
                            <div class="info-item">
                                <div class="info-label">Operating System</div>
                                <div id="osInfo" class="info-value">Loading...</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">App Version</div>
                                <div id="appVersion" class="info-value">Loading...</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Go Version</div>
                                <div id="goVersion" class="info-value">Loading...</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Last Updated</div>
                                <div id="lastUpdated" class="info-value">Loading...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    `;
}

async function initializeApp() {
    try {
        // Load cache locations from config
        const locations = await GetCacheLocationsFromConfig();
        const locationsData = JSON.parse(locations);
        
        // Populate the locations dropdown
        populateLocationsDropdown(locationsData);
        
        // Get system info
        const systemInfo = await GetSystemInfo();
        const systemData = JSON.parse(systemInfo);
        updateSystemInfo(systemData);
        
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Failed to initialize application: ' + error.message);
    }
}

function setupEventListeners() {
    // Add event listeners after UI is created
    const scanButton = document.getElementById('scanButton');
    const scanAllButton = document.getElementById('scanAllButton');
    const stopButton = document.getElementById('stopButton');
    const refreshButton = document.getElementById('refreshButton');
    const exportButton = document.getElementById('exportButton');
    const errorClose = document.getElementById('errorClose');
    const backupManagerButton = document.getElementById('backupManagerButton');
    
    if (scanButton) {
        scanButton.addEventListener('click', scanSingleLocation);
    }
    if (scanAllButton) {
        scanAllButton.addEventListener('click', scanAllLocations);
    }
    if (stopButton) {
        stopButton.addEventListener('click', async () => {
            try {
                await StopScan();
                stopProgressPolling();
                setScanningState(false);
                showProgress('Scan stopped by user', false);
            } catch (error) {
                showError('Failed to stop scan: ' + error.message);
            }
        });
    }
    if (refreshButton) {
        refreshButton.addEventListener('click', initializeApp);
    }
    if (exportButton) {
        exportButton.addEventListener('click', exportResults);
    }
    if (errorClose) {
        errorClose.addEventListener('click', hideError);
    }
    if (backupManagerButton) {
        backupManagerButton.addEventListener('click', showBackupManager);
    }
    
    // Add event delegation for dynamically created buttons
    document.addEventListener('click', function(e) {
        // Handle file detail buttons
        if (e.target.classList.contains('btn-icon') && e.target.getAttribute('title') === 'View Details') {
            const row = e.target.closest('.file-row');
            if (row) {
                const filePath = row.dataset.filePath;
                const fileName = row.querySelector('.file-name-text').textContent;
                const fileSize = parseInt(row.dataset.fileSize);
                const fileType = row.dataset.fileType;
                const modified = row.querySelector('.file-modified').textContent;
                const accessed = row.querySelector('.file-accessed').textContent;
                const permissions = row.querySelector('.file-actions').getAttribute('data-permissions') || '';
                const safetyData = row.querySelector('.file-actions').getAttribute('data-safety') || '';
                
                showFileDetails(filePath, fileName, fileSize, modified, accessed, fileType, permissions, safetyData);
            }
        }
        
        // Handle reveal in finder buttons
        if (e.target.classList.contains('btn-icon') && e.target.getAttribute('title') === 'Reveal in Finder') {
            const row = e.target.closest('.file-row');
            if (row) {
                const filePath = row.dataset.filePath;
                revealInFinder(filePath);
            }
        }
        
        // Handle location toggle buttons
        if (e.target.classList.contains('toggle-icon') || e.target.closest('.location-header')) {
            const locationCard = e.target.closest('.location-card');
            if (locationCard) {
                const locationId = locationCard.dataset.locationId;
                toggleLocationFiles(locationId);
            }
        }
    });
}

function populateLocationsDropdown(locations) {
    const dropdown = document.getElementById('locationSelect');
    
    // Clear existing options
    dropdown.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a cache location...';
    dropdown.appendChild(defaultOption);
    
    // Add location options
    locations.forEach(location => {
        const option = document.createElement('option');
        option.value = JSON.stringify(location);
        option.textContent = `${location.name} (${location.type})`;
        dropdown.appendChild(option);
    });
}

function updateSystemInfo(systemInfo) {
    document.getElementById('osInfo').textContent = systemInfo.os;
    document.getElementById('appVersion').textContent = systemInfo.app_version;
    document.getElementById('goVersion').textContent = systemInfo.go_version;
    document.getElementById('lastUpdated').textContent = new Date(systemInfo.scan_time).toLocaleString();
}

async function scanSingleLocation() {
    const dropdown = document.getElementById('locationSelect');
    const selectedOption = dropdown.options[dropdown.selectedIndex];
    
    if (!selectedOption.value) {
        showError('Please select a cache location to scan');
        return;
    }
    
    const location = JSON.parse(selectedOption.value);
    
    try {
        setScanningState(true);
        showProgress('Starting scan...', true);
        scanStartTime = Date.now();
        
        // Start the scan (this now returns immediately)
        const result = await ScanCacheLocation(location.id, location.name, location.path);
        const response = JSON.parse(result);
        
        if (response.status === 'scan_started') {
            showProgress('Scan started in background...', true);
            // Start polling for progress and completion
            startProgressPolling();
        } else {
            // Handle unexpected response
            displayScanResult(response);
            currentScanResult = response;
            setScanningState(false);
        }
        
    } catch (error) {
        console.error('Scan error:', error);
        showError(`Scan failed: ${error.message}`, true, () => {
            hideError();
            scanSingleLocation();
        });
        setScanningState(false);
        showProgress('Scan failed', false);
    }
}

async function scanAllLocations() {
    try {
        setScanningState(true);
        showProgress('Starting full system scan...', true);
        scanStartTime = Date.now();
        
        // Get all locations
        const locations = await GetCacheLocationsFromConfig();
        const locationsData = JSON.parse(locations);
        
        // Filter to safe locations only
        const safeLocations = locationsData.filter(loc => 
            loc.type === 'user' || loc.type === 'application'
        );
        
        if (safeLocations.length === 0) {
            showError('No safe cache locations found to scan');
            setScanningState(false);
            showProgress('No locations to scan', false);
            return;
        }
        
        const result = await ScanMultipleCacheLocations(JSON.stringify(safeLocations));
        const scanResult = JSON.parse(result);
        
        displayScanResult(scanResult);
        currentScanResult = scanResult;
        setScanningState(false);
        showProgress('Scan completed!', false);
        
    } catch (error) {
        console.error('Full scan error:', error);
        showError(`Full scan failed: ${error.message}`, true, () => {
            hideError();
            scanAllLocations();
        });
        setScanningState(false);
        showProgress('Scan failed', false);
    }
}

// Function to calculate safety summary from files
function calculateSafetySummary(files) {
    let safeCount = 0, cautionCount = 0, riskyCount = 0, totalFiles = 0;
    let safeSize = 0, cautionSize = 0, riskySize = 0;
    
    files.forEach(file => {
        if (!file.is_dir && file.safety_classification) {
            totalFiles++;
            const size = file.size || 0;
            
            // Ensure safety level is a string and handle case variations
            const safetyLevel = String(file.safety_classification.level || '').trim();
            switch (safetyLevel) {
                case 'Safe':
                    safeCount++;
                    safeSize += size;
                    break;
                case 'Caution':
                    cautionCount++;
                    cautionSize += size;
                    break;
                case 'Risky':
                    riskyCount++;
                    riskySize += size;
                    break;
            }
        }
    });
    
    return {
        totalFiles,
        safeCount,
        cautionCount,
        riskyCount,
        safeSize,
        cautionSize,
        riskySize,
        safePercentage: totalFiles > 0 ? Math.round((safeCount / totalFiles) * 100) : 0,
        cautionPercentage: totalFiles > 0 ? Math.round((cautionCount / totalFiles) * 100) : 0,
        riskyPercentage: totalFiles > 0 ? Math.round((riskyCount / totalFiles) * 100) : 0
    };
}

function displayScanResult(result) {
    const resultsDiv = document.getElementById('scanResults');
    const exportButton = document.getElementById('exportButton');
    
    if (result.locations) {
        // Calculate overall safety summary
        const allFiles = result.locations.flatMap(loc => loc.files || []);
        const safetySummary = calculateSafetySummary(allFiles);
        
        // Multiple locations result
        resultsDiv.innerHTML = `
            <div class="results-summary">
                <div class="summary-card">
                    <div class="summary-icon">📊</div>
                    <div class="summary-content">
                        <h3>${result.total_locations}</h3>
                        <p>Locations Scanned</p>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">📁</div>
                    <div class="summary-content">
                        <h3>${result.total_files.toLocaleString()}</h3>
                        <p>Total Files</p>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">💾</div>
                    <div class="summary-content">
                        <h3>${formatBytes(result.total_size)}</h3>
                        <p>Total Size</p>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">⏱️</div>
                    <div class="summary-content">
                        <h3>${formatDuration(result.scan_duration)}</h3>
                        <p>Scan Duration</p>
                    </div>
                </div>
            </div>
            <div class="safety-summary">
                <h3>Safety Analysis</h3>
                <div class="safety-summary-grid">
                    <div class="safety-card safe-card">
                        <div class="safety-icon">✅</div>
                        <div class="safety-content">
                            <h4>${safetySummary.safeCount}</h4>
                            <p>Safe Files (${safetySummary.safePercentage}%)</p>
                            <span class="safety-size">${formatBytes(safetySummary.safeSize)}</span>
                        </div>
                    </div>
                    <div class="safety-card caution-card">
                        <div class="safety-icon">⚠️</div>
                        <div class="safety-content">
                            <h4>${safetySummary.cautionCount}</h4>
                            <p>Caution Files (${safetySummary.cautionPercentage}%)</p>
                            <span class="safety-size">${formatBytes(safetySummary.cautionSize)}</span>
                        </div>
                    </div>
                    <div class="safety-card risky-card">
                        <div class="safety-icon">🚫</div>
                        <div class="safety-content">
                            <h4>${safetySummary.riskyCount}</h4>
                            <p>Risky Files (${safetySummary.riskyPercentage}%)</p>
                            <span class="safety-size">${formatBytes(safetySummary.riskySize)}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="cache-files-section">
                <div class="section-header">
                    <h3>Cache Files by Location</h3>
                    <div class="file-controls">
                        <div class="search-box">
                            <input type="text" id="fileSearch" placeholder="Search files..." class="search-input">
                            <span class="search-icon">🔍</span>
                        </div>
                        <div class="filter-controls">
                            <select id="sizeFilter" class="filter-select">
                                <option value="">All Sizes</option>
                                <option value="large">Large (>10MB)</option>
                                <option value="medium">Medium (1-10MB)</option>
                                <option value="small">Small (<1MB)</option>
                            </select>
                            <select id="typeFilter" class="filter-select">
                                <option value="">All Types</option>
                                <option value="file">Files Only</option>
                                <option value="directory">Directories Only</option>
                            </select>
                            <select id="safetyFilter" class="filter-select">
                                <option value="">All Safety Levels</option>
                                <option value="Safe">✅ Safe</option>
                                <option value="Caution">⚠️ Caution</option>
                                <option value="Risky">🚫 Risky</option>
                            </select>
                        </div>
                        <div class="bulk-actions">
                            <button id="selectAllSafeButton" class="btn btn-success" onclick="selectAllSafeFiles()">
                                <span class="btn-icon">✅</span>
                                Select All Safe Items
                            </button>
                            <button id="clearSelectionButton" class="btn btn-outline" onclick="clearFileSelection()">
                                <span class="btn-icon">🔲</span>
                                Clear Selection
                            </button>
                            <button id="undoButton" class="btn btn-secondary" onclick="showUndoOptions()">
                                <span class="btn-icon">🔄</span>
                                Undo/Restore
                            </button>
                        </div>
                    </div>
                </div>
                <div class="locations-results">
                    ${result.locations.map(loc => createLocationCard(loc)).join('')}
                </div>
            </div>
        `;
    } else {
        // Calculate safety summary for single location
        const safetySummary = calculateSafetySummary(result.files || []);
        
        // Single location result
        resultsDiv.innerHTML = `
            <div class="results-summary">
                <div class="summary-card">
                    <div class="summary-icon">📁</div>
                    <div class="summary-content">
                        <h3>${result.file_count.toLocaleString()}</h3>
                        <p>Files Found</p>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">💾</div>
                    <div class="summary-content">
                        <h3>${formatBytes(result.total_size)}</h3>
                        <p>Total Size</p>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">⏱️</div>
                    <div class="summary-content">
                        <h3>${formatDuration(result.scan_duration)}</h3>
                        <p>Scan Duration</p>
                    </div>
                </div>
            </div>
            <div class="safety-summary">
                <h3>Safety Analysis</h3>
                <div class="safety-summary-grid">
                    <div class="safety-card safe-card">
                        <div class="safety-icon">✅</div>
                        <div class="safety-content">
                            <h4>${safetySummary.safeCount}</h4>
                            <p>Safe Files (${safetySummary.safePercentage}%)</p>
                            <span class="safety-size">${formatBytes(safetySummary.safeSize)}</span>
                        </div>
                    </div>
                    <div class="safety-card caution-card">
                        <div class="safety-icon">⚠️</div>
                        <div class="safety-content">
                            <h4>${safetySummary.cautionCount}</h4>
                            <p>Caution Files (${safetySummary.cautionPercentage}%)</p>
                            <span class="safety-size">${formatBytes(safetySummary.cautionSize)}</span>
                        </div>
                    </div>
                    <div class="safety-card risky-card">
                        <div class="safety-icon">🚫</div>
                        <div class="safety-content">
                            <h4>${safetySummary.riskyCount}</h4>
                            <p>Risky Files (${safetySummary.riskyPercentage}%)</p>
                            <span class="safety-size">${formatBytes(safetySummary.riskySize)}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="cache-files-section">
                <div class="section-header">
                    <h3>Cache Files</h3>
                    <div class="file-controls">
                        <div class="search-box">
                            <input type="text" id="fileSearch" placeholder="Search files..." class="search-input">
                            <span class="search-icon">🔍</span>
                        </div>
                        <div class="filter-controls">
                            <select id="sizeFilter" class="filter-select">
                                <option value="">All Sizes</option>
                                <option value="large">Large (>10MB)</option>
                                <option value="medium">Medium (1-10MB)</option>
                                <option value="small">Small (<1MB)</option>
                            </select>
                            <select id="typeFilter" class="filter-select">
                                <option value="">All Types</option>
                                <option value="file">Files Only</option>
                                <option value="directory">Directories Only</option>
                            </select>
                            <select id="safetyFilter" class="filter-select">
                                <option value="">All Safety Levels</option>
                                <option value="Safe">✅ Safe</option>
                                <option value="Caution">⚠️ Caution</option>
                                <option value="Risky">🚫 Risky</option>
                            </select>
                        </div>
                        <div class="bulk-actions">
                            <button id="selectAllSafeButton" class="btn btn-success" onclick="selectAllSafeFiles()">
                                <span class="btn-icon">✅</span>
                                Select All Safe Items
                            </button>
                            <button id="clearSelectionButton" class="btn btn-outline" onclick="clearFileSelection()">
                                <span class="btn-icon">🔲</span>
                                Clear Selection
                            </button>
                            <button id="undoButton" class="btn btn-secondary" onclick="showUndoOptions()">
                                <span class="btn-icon">🔄</span>
                                Undo/Restore
                            </button>
                        </div>
                    </div>
                </div>
                <div class="location-details">
                    <h4>${result.name}</h4>
                    <p class="location-path">${result.path}</p>
                    ${result.error ? `<p class="error-text">Error: ${result.error}</p>` : ''}
                    ${result.files ? createFileTable(result.files, result.id) : ''}
                </div>
            </div>
        `;
    }
    
    // Setup event listeners for the new controls
    setupFileControls();
    exportButton.disabled = false;
}

function createLocationCard(location) {
    const isLoading = location.files === undefined && !location.error;
    
    return `
        <div class="location-card" data-location-id="${location.id}">
            <div class="location-header" onclick="toggleLocationFiles('${location.id}')">
                <div class="location-info">
                    <h4>${location.name}</h4>
                    <p class="location-path">${location.path}</p>
                </div>
                <div class="location-stats">
                    ${isLoading ? 
                        '<span class="stat loading-stat">Loading...</span>' :
                        `<span class="stat">${location.file_count.toLocaleString()} files</span>
                         <span class="stat">${formatBytes(location.total_size)}</span>
                         <span class="stat">${formatDuration(location.scan_duration)}</span>`
                    }
                </div>
                <div class="location-toggle">
                    <span class="toggle-icon">▼</span>
                </div>
            </div>
            <div class="location-files" id="files-${location.id}" style="display: none;">
                ${isLoading ? 
                    createLoadingTable() : 
                    (location.files ? createFileTable(location.files, location.id) : '<p class="no-files">No files found</p>')
                }
            </div>
            ${location.error ? `<div class="location-error">Error: ${location.error}</div>` : ''}
        </div>
    `;
}

function createFileTable(files, locationId) {
    if (!files || files.length === 0) {
        return '<p class="no-files">No files found</p>';
    }
    
    // Sort files by size (largest first)
    const sortedFiles = [...files].sort((a, b) => b.size - a.size);
    
    return `
        <div class="file-table-container">
            <table class="file-table" data-location-id="${locationId}">
                <thead>
                    <tr>
                        <th class="sortable" data-sort="name">Name <span class="sort-icon">↕</span></th>
                        <th class="sortable" data-sort="size">Size <span class="sort-icon">↕</span></th>
                        <th class="sortable" data-sort="modified">Modified <span class="sort-icon">↕</span></th>
                        <th class="sortable" data-sort="accessed">Accessed <span class="sort-icon">↕</span></th>
                        <th>Type</th>
                        <th class="sortable" data-sort="safety">Safety <span class="sort-icon">↕</span></th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedFiles.map(file => createFileRow(file)).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function createLoadingTable() {
    return `
        <div class="file-table-container">
            <div class="loading-table">
                <div class="loading-header">
                    <div class="loading-cell"></div>
                    <div class="loading-cell"></div>
                    <div class="loading-cell"></div>
                    <div class="loading-cell"></div>
                    <div class="loading-cell"></div>
                    <div class="loading-cell"></div>
                </div>
                ${Array.from({length: 5}, () => `
                    <div class="loading-row">
                        <div class="loading-cell"></div>
                        <div class="loading-cell"></div>
                        <div class="loading-cell"></div>
                        <div class="loading-cell"></div>
                        <div class="loading-cell"></div>
                        <div class="loading-cell"></div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function createFileRow(file) {
    const isDirectory = file.is_dir;
    const fileIcon = isDirectory ? '📁' : '📄';
    const fileType = isDirectory ? 'Directory' : 'File';
    const sizeDisplay = isDirectory ? '-' : formatBytes(file.size);
    const modifiedDate = new Date(file.last_modified).toLocaleDateString();
    const accessedDate = new Date(file.last_accessed).toLocaleDateString();
    
    // Safety classification display
    let safetyDisplay = '';
    let safetyClass = '';
    let safetyLevel = 'none';
    if (!isDirectory && file.safety_classification) {
        const safety = file.safety_classification;
        // Ensure safety.level is a string and convert to string if needed
        safetyLevel = String(safety.level || '');
        console.log(`File ${file.name}: safety level = "${safetyLevel}"`);
        const safetyIcon = getSafetyIcon(safetyLevel);
        const safetyColor = getSafetyColor(safetyLevel);
        safetyDisplay = `
            <div class="safety-indicator" data-safety-level="${safetyLevel}" title="${safety.explanation || ''}">
                <span class="safety-icon" style="color: ${safetyColor}">${safetyIcon}</span>
                <span class="safety-confidence">${safety.confidence || 0}%</span>
            </div>
        `;
        safetyClass = `safety-${safetyLevel.toLowerCase()}`;
    } else if (!isDirectory) {
        console.log(`File ${file.name}: no safety classification`);
    }
    
    return `
        <tr class="file-row ${safetyClass}" data-file-path="${file.path}" data-file-size="${file.size}" data-file-type="${fileType.toLowerCase()}" data-safety-level="${safetyLevel || 'none'}">
            <td class="file-name">
                <span class="file-icon">${fileIcon}</span>
                <span class="file-name-text" title="${file.path}">${file.name}</span>
            </td>
            <td class="file-size">${sizeDisplay}</td>
            <td class="file-modified">${modifiedDate}</td>
            <td class="file-accessed">${accessedDate}</td>
            <td class="file-type">${fileType}</td>
            <td class="file-safety">
                ${safetyDisplay}
            </td>
            <td class="file-actions" data-permissions="${file.permissions}" data-safety="${file.safety_classification ? JSON.stringify(file.safety_classification).replace(/'/g, "&#39;") : ''}">
                <button class="btn-icon" title="View Details">
                    ℹ️
                </button>
                <button class="btn-icon" title="Reveal in Finder">
                    📂
                </button>
            </td>
        </tr>
    `;
}

// Safety utility functions
function getSafetyIcon(level) {
    // Ensure level is a string and handle case variations
    const safeLevel = String(level || '').trim();
    switch (safeLevel) {
        case 'Safe': return '✅';
        case 'Caution': return '⚠️';
        case 'Risky': return '🚫';
        default: return '❓';
    }
}

function getSafetyColor(level) {
    // Ensure level is a string and handle case variations
    const safeLevel = String(level || '').trim();
    switch (safeLevel) {
        case 'Safe': return '#30d158';
        case 'Caution': return '#ff9500';
        case 'Risky': return '#ff3b30';
        default: return '#a0a0a0';
    }
}

function getSafetyLevelOrder(level) {
    // Ensure level is a string and handle case variations
    const safeLevel = String(level || '').trim();
    switch (safeLevel) {
        case 'Safe': return 1;
        case 'Caution': return 2;
        case 'Risky': return 3;
        default: return 4;
    }
}

function setupFileControls() {
    // Search functionality
    const searchInput = document.getElementById('fileSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterFiles);
    }
    
    // Filter functionality
    const sizeFilter = document.getElementById('sizeFilter');
    const typeFilter = document.getElementById('typeFilter');
    const safetyFilter = document.getElementById('safetyFilter');
    
    if (sizeFilter) {
        sizeFilter.addEventListener('change', filterFiles);
    }
    if (typeFilter) {
        typeFilter.addEventListener('change', filterFiles);
    }
    if (safetyFilter) {
        safetyFilter.addEventListener('change', filterFiles);
    }
    
    // Sort functionality
    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', () => sortTable(header));
    });
}

function filterFiles() {
    const searchTerm = document.getElementById('fileSearch')?.value.toLowerCase() || '';
    const sizeFilter = document.getElementById('sizeFilter')?.value || '';
    const typeFilter = document.getElementById('typeFilter')?.value || '';
    const safetyFilter = document.getElementById('safetyFilter')?.value || '';
    
    document.querySelectorAll('.file-row').forEach(row => {
        const fileName = row.querySelector('.file-name-text').textContent.toLowerCase();
        const fileSize = parseInt(row.dataset.fileSize);
        const fileType = row.dataset.fileType;
        const safetyLevel = row.dataset.safetyLevel;
        
        let show = true;
        
        // Search filter
        if (searchTerm && !fileName.includes(searchTerm)) {
            show = false;
        }
        
        // Size filter
        if (sizeFilter) {
            const sizeInMB = fileSize / (1024 * 1024);
            if (sizeFilter === 'large' && sizeInMB <= 10) show = false;
            if (sizeFilter === 'medium' && (sizeInMB <= 1 || sizeInMB > 10)) show = false;
            if (sizeFilter === 'small' && sizeInMB >= 1) show = false;
        }
        
        // Type filter
        if (typeFilter && fileType !== typeFilter) {
            show = false;
        }
        
        // Safety filter
        if (safetyFilter && safetyLevel !== safetyFilter) {
            show = false;
        }
        
        row.style.display = show ? '' : 'none';
    });
}

function sortTable(header) {
    const table = header.closest('table');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const sortBy = header.dataset.sort;
    const isAscending = header.classList.contains('sort-asc');
    
    // Clear other sort classes
    table.querySelectorAll('.sortable').forEach(h => {
        h.classList.remove('sort-asc', 'sort-desc');
    });
    
    // Set current sort direction
    header.classList.add(isAscending ? 'sort-desc' : 'sort-asc');
    
    rows.sort((a, b) => {
        let aVal, bVal;
        
        switch (sortBy) {
            case 'name':
                aVal = a.querySelector('.file-name-text').textContent.toLowerCase();
                bVal = b.querySelector('.file-name-text').textContent.toLowerCase();
                break;
            case 'size':
                aVal = parseInt(a.dataset.fileSize);
                bVal = parseInt(b.dataset.fileSize);
                break;
            case 'modified':
                aVal = new Date(a.querySelector('.file-modified').textContent);
                bVal = new Date(b.querySelector('.file-modified').textContent);
                break;
            case 'accessed':
                aVal = new Date(a.querySelector('.file-accessed').textContent);
                bVal = new Date(b.querySelector('.file-accessed').textContent);
                break;
            case 'safety':
                aVal = getSafetyLevelOrder(a.dataset.safetyLevel);
                bVal = getSafetyLevelOrder(b.dataset.safetyLevel);
                break;
            default:
                return 0;
        }
        
        if (aVal < bVal) return isAscending ? 1 : -1;
        if (aVal > bVal) return isAscending ? -1 : 1;
        return 0;
    });
    
    // Re-append sorted rows
    rows.forEach(row => tbody.appendChild(row));
}

function toggleLocationFiles(locationId) {
    const filesDiv = document.getElementById(`files-${locationId}`);
    const toggleIcon = document.querySelector(`[data-location-id="${locationId}"] .toggle-icon`);
    
    if (filesDiv.style.display === 'none') {
        filesDiv.style.display = 'block';
        toggleIcon.textContent = '▲';
    } else {
        filesDiv.style.display = 'none';
        toggleIcon.textContent = '▼';
    }
}

function showFileDetails(path, name, size, modified, accessed, type, permissions, safetyData = '') {
    console.log('showFileDetails called with:', { path, name, size, modified, accessed, type, permissions, safetyData });
    const modal = document.createElement('div');
    modal.className = 'file-details-modal';
    
    let safetyDetails = '';
    if (safetyData) {
        try {
            const safety = JSON.parse(safetyData.replace(/&#39;/g, "'"));
            const safetyIcon = getSafetyIcon(safety.level);
            const safetyColor = getSafetyColor(safety.level);
            
            safetyDetails = `
                <div class="detail-row safety-row">
                    <span class="detail-label">Safety Level:</span>
                    <span class="detail-value">
                        <div class="safety-detail" style="color: ${safetyColor}">
                            <span class="safety-icon">${safetyIcon}</span>
                            <span class="safety-level">${safety.level}</span>
                            <span class="safety-confidence">(${safety.confidence}% confidence)</span>
                        </div>
                    </span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Safety Explanation:</span>
                    <span class="detail-value safety-explanation">${safety.explanation}</span>
                </div>
                ${safety.reasons && safety.reasons.length > 0 ? `
                    <div class="detail-row">
                        <span class="detail-label">Safety Reasons:</span>
                        <span class="detail-value">
                            <ul class="safety-reasons">
                                ${safety.reasons.map(reason => `<li>${reason}</li>`).join('')}
                            </ul>
                        </span>
                    </div>
                ` : ''}
            `;
        } catch (error) {
            console.error('Error parsing safety data:', error);
        }
    }
    
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeFileDetails()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>File Details</h3>
                    <button class="modal-close" onclick="closeFileDetails()">×</button>
                </div>
                <div class="modal-body">
                    <div class="detail-row">
                        <span class="detail-label">Name:</span>
                        <span class="detail-value">${name}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Path:</span>
                        <span class="detail-value" title="${path}">${path}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Size:</span>
                        <span class="detail-value">${formatBytes(size)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Type:</span>
                        <span class="detail-value">${type}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Modified:</span>
                        <span class="detail-value">${new Date(modified).toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Accessed:</span>
                        <span class="detail-value">${new Date(accessed).toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Permissions:</span>
                        <span class="detail-value">${permissions}</span>
                    </div>
                    ${safetyDetails}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="revealInFinder('${path}')">Reveal in Finder</button>
                    <button class="btn btn-secondary" onclick="closeFileDetails()">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeFileDetails() {
    const modal = document.querySelector('.file-details-modal');
    if (modal) {
        modal.remove();
    }
}

async function revealInFinder(path) {
    console.log('Reveal in Finder:', path);
    
    try {
        // Call the backend function to open Finder
        const result = await RevealInFinder(path);
        const response = JSON.parse(result);
        
        if (response.status === 'success') {
            showSuccessMessage(response.message);
        } else {
            showError(`Failed to reveal in Finder: ${response.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Failed to reveal in Finder:', error);
        showError(`Failed to reveal in Finder: ${error.message}`);
    }
}

// Bulk operations for file selection
function selectAllSafeFiles() {
    console.log('selectAllSafeFiles called');
    
    // Get all file rows
    const allRows = document.querySelectorAll('.file-row');
    console.log('Total file rows found:', allRows.length);
    
    // Debug: Check what safety levels exist
    const safetyLevels = new Set();
    allRows.forEach(row => {
        const safetyLevel = row.getAttribute('data-safety-level');
        if (safetyLevel) {
            safetyLevels.add(safetyLevel);
        }
    });
    console.log('Safety levels found:', Array.from(safetyLevels));
    
    // Look for safe files with more flexible matching
    const safeRows = document.querySelectorAll('.file-row[data-safety-level="Safe"], .file-row[data-safety-level="safe"]');
    console.log('Safe rows found:', safeRows.length);
    
    if (safeRows.length === 0) {
        // Try to find any files that might be safe but have different casing or formatting
        const potentialSafeRows = Array.from(allRows).filter(row => {
            const safetyLevel = row.getAttribute('data-safety-level');
            return safetyLevel && safetyLevel.toLowerCase().includes('safe');
        });
        console.log('Potential safe rows (case-insensitive):', potentialSafeRows.length);
        
        if (potentialSafeRows.length > 0) {
            potentialSafeRows.forEach(row => {
                row.classList.add('selected');
                // Add checkbox if not exists
                if (!row.querySelector('.file-checkbox')) {
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.className = 'file-checkbox';
                    checkbox.checked = true;
                    checkbox.addEventListener('change', (e) => {
                        row.classList.toggle('selected', e.target.checked);
                    });
                    row.querySelector('.file-name').prepend(checkbox);
                } else {
                    row.querySelector('.file-checkbox').checked = true;
                }
            });
        } else {
            // Check if there are any files at all
            const allFileRows = document.querySelectorAll('.file-row');
            if (allFileRows.length === 0) {
                showError('No files found. Please scan a cache location first.');
            } else {
                showError(`No safe files found to select. Found ${allFileRows.length} files total. Make sure files have been classified as safe.`);
            }
            return;
        }
    } else {
        safeRows.forEach(row => {
            row.classList.add('selected');
            // Add checkbox if not exists
            if (!row.querySelector('.file-checkbox')) {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'file-checkbox';
                checkbox.checked = true;
                checkbox.addEventListener('change', (e) => {
                    row.classList.toggle('selected', e.target.checked);
                });
                row.querySelector('.file-name').prepend(checkbox);
            } else {
                row.querySelector('.file-checkbox').checked = true;
            }
        });
    }
    
    updateSelectionCount();
    
    // Show success message
    const selectedCount = document.querySelectorAll('.file-row.selected').length;
    if (selectedCount > 0) {
        showSuccessMessage(`Successfully selected ${selectedCount} safe files`);
    }
}

function clearFileSelection() {
    document.querySelectorAll('.file-row').forEach(row => {
        row.classList.remove('selected');
        const checkbox = row.querySelector('.file-checkbox');
        if (checkbox) {
            checkbox.checked = false;
        }
    });
    
    updateSelectionCount();
}

function updateSelectionCount() {
    const selectedCount = document.querySelectorAll('.file-row.selected').length;
    const totalSize = Array.from(document.querySelectorAll('.file-row.selected')).reduce((total, row) => {
        return total + parseInt(row.dataset.fileSize || 0);
    }, 0);
    
    // Update or create selection summary
    let summary = document.querySelector('.selection-summary');
    if (!summary && selectedCount > 0) {
        summary = document.createElement('div');
        summary.className = 'selection-summary';
        document.querySelector('.file-controls').appendChild(summary);
    }
    
    if (summary) {
        if (selectedCount > 0) {
            summary.innerHTML = `
                <div class="selection-info">
                    <span class="selection-count">${selectedCount} files selected</span>
                    <span class="selection-size">Total: ${formatBytes(totalSize)}</span>
                    <button class="btn btn-danger btn-sm" onclick="deleteSelectedFiles()">
                        <span class="btn-icon">🗑️</span>
                        Delete Selected
                    </button>
                </div>
            `;
        } else {
            summary.remove();
        }
    }
}

// Store selected files globally for confirmation
let selectedFilesForDeletion = [];

async function deleteSelectedFiles() {
    const selectedFiles = Array.from(document.querySelectorAll('.file-row.selected'));
    if (selectedFiles.length === 0) {
        showError('No files selected for deletion');
        return;
    }
    
    const filePaths = selectedFiles.map(row => row.dataset.filePath);
    selectedFilesForDeletion = filePaths; // Store globally
    
    try {
        // Show loading state
        showProgress('Validating files for deletion...', true);
        
        // Validate files first
        const validationResult = await ValidateFilesForDeletion(JSON.stringify(filePaths), 'manual_deletion');
        const validation = JSON.parse(validationResult);
        
        // Create confirmation dialog
        const dialogResult = await DeleteFilesWithConfirmation(JSON.stringify(filePaths), 'manual_deletion', false, false);
        const dialog = JSON.parse(dialogResult);
        
        // Show confirmation modal
        showDeletionConfirmationDialog(dialog, validation);
        
    } catch (error) {
        console.error('Deletion error:', error);
        showError(`Deletion failed: ${error.message}`);
        showProgress('Deletion failed', false);
    }
}

function setScanningState(scanning) {
    isScanning = scanning;
    const scanButton = document.getElementById('scanButton');
    const scanAllButton = document.getElementById('scanAllButton');
    const stopButton = document.getElementById('stopButton');
    
    scanButton.disabled = scanning;
    scanAllButton.disabled = scanning;
    stopButton.disabled = !scanning;
    
    if (scanning) {
        scanButton.innerHTML = '<span class="btn-icon">⏳</span>Scanning...';
        scanAllButton.innerHTML = '<span class="btn-icon">⏳</span>Scanning...';
    } else {
        scanButton.innerHTML = '<span class="btn-icon">🔍</span>Scan Selected Location';
        scanAllButton.innerHTML = '<span class="btn-icon">🌐</span>Scan All Safe Locations';
    }
}

function showProgress(message, show = true) {
    const progressContainer = document.getElementById('progressContainer');
    const progressText = document.getElementById('progressText');
    
    if (show) {
        progressText.textContent = message;
        progressContainer.style.display = 'block';
        updateProgressTime();
        
        // Add loading animation
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = '100%';
            progressBar.style.animation = 'pulse 2s infinite';
        }
    } else {
        progressContainer.style.display = 'none';
        
        // Remove loading animation
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.animation = 'none';
        }
    }
}

function updateProgressTime() {
    if (!scanStartTime) return;
    
    const elapsed = Math.floor((Date.now() - scanStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const progressTime = document.getElementById('progressTime');
    if (progressTime) {
        progressTime.textContent = timeString;
    }
}

function showError(message, isRetryable = false, retryCallback = null) {
    const errorContainer = document.getElementById('errorContainer');
    const errorMessage = document.getElementById('errorMessage');
    
    // Create enhanced error content
    const errorContent = `
        <div class="error-icon">⚠️</div>
        <div class="error-content">
            <h4>Error</h4>
            <p>${message}</p>
            ${isRetryable && retryCallback ? `
                <button class="btn btn-outline retry-button" onclick="retryCallback()">
                    <span class="btn-icon">🔄</span>
                    Retry
                </button>
            ` : ''}
        </div>
        <button id="errorClose" class="error-close">×</button>
    `;
    
    errorContainer.innerHTML = errorContent;
    errorContainer.style.display = 'flex';
    
    // Setup close button
    const closeButton = errorContainer.querySelector('#errorClose');
    if (closeButton) {
        closeButton.addEventListener('click', hideError);
    }
    
    // Auto-hide after 10 seconds (unless retryable)
    if (!isRetryable) {
        setTimeout(() => {
            hideError();
        }, 10000);
    }
}

function hideError() {
    const errorContainer = document.getElementById('errorContainer');
    errorContainer.style.display = 'none';
}

function showErrorState(containerId, message, isRetryable = false, retryCallback = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="error-state">
            <div class="error-icon">⚠️</div>
            <h3>Something went wrong</h3>
            <p>${message}</p>
            ${isRetryable && retryCallback ? `
                <button class="btn btn-outline retry-button" onclick="retryCallback()">
                    <span class="btn-icon">🔄</span>
                    Try Again
                </button>
            ` : ''}
        </div>
    `;
}

function startProgressPolling() {
    // Clear any existing interval
    if (progressInterval) {
        clearInterval(progressInterval);
    }
    
    // Poll every 200ms for progress updates
    progressInterval = setInterval(async () => {
        try {
            // Check if still scanning
            const scanning = await IsScanning();
            if (!scanning) {
                // Scan completed, get the result
                clearInterval(progressInterval);
                progressInterval = null;
                
                try {
                    const result = await GetLastScanResult();
                    const scanResult = JSON.parse(result);
                    displayScanResult(scanResult);
                    currentScanResult = scanResult;
                } catch (error) {
                    showError('Failed to get scan result: ' + error.message);
                }
                
                setScanningState(false);
                showProgress('Scan completed!', false);
                return;
            }
            
            // Update progress
            updateProgressTime();
            showProgress('Scanning in progress...', true);
            
        } catch (error) {
            console.error('Error polling progress:', error);
            showProgress('Scanning... (progress unavailable)', true);
        }
    }, 200);
}

function stopProgressPolling() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
}

function exportResults() {
    if (!currentScanResult) {
        showError('No results to export');
        return;
    }
    
    const dataStr = JSON.stringify(currentScanResult, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `cache-scan-results-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(nanoseconds) {
    const seconds = nanoseconds / 1000000000;
    if (seconds < 1) {
        return (nanoseconds / 1000000).toFixed(0) + 'ms';
    } else if (seconds < 60) {
        return seconds.toFixed(2) + 's';
    } else {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
    }
}

// Deletion confirmation dialog
function showDeletionConfirmationDialog(dialog, validation) {
    const modal = document.createElement('div');
    modal.className = 'deletion-confirmation-modal';
    
    const warningsHTML = dialog.warnings && dialog.warnings.length > 0 ? `
        <div class="warnings-section">
            <h4>⚠️ Warnings</h4>
            <ul class="warnings-list">
                ${dialog.warnings.map(warning => `<li>${warning}</li>`).join('')}
            </ul>
        </div>
    ` : '';
    
    const detailsHTML = dialog.details ? `
        <div class="details-section">
            <h4>📋 Details</h4>
            <ul class="details-list">
                ${dialog.details.map(detail => `<li>${detail}</li>`).join('')}
            </ul>
        </div>
    ` : '';
    
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeDeletionConfirmation()">
            <div class="modal-content deletion-modal" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>${dialog.title}</h3>
                    <button class="modal-close" onclick="closeDeletionConfirmation()">×</button>
                </div>
                <div class="modal-body">
                    <div class="confirmation-message">
                        <p>${dialog.message}</p>
                    </div>
                    ${warningsHTML}
                    ${detailsHTML}
                    <div class="safety-info">
                        <h4>🛡️ Safety Measures</h4>
                        <ul>
                            <li>✅ Mandatory backup will be created before deletion</li>
                            <li>🔄 Files can be restored from backup if needed</li>
                            <li>🚫 System critical files are protected</li>
                            <li>📝 All operations are logged with timestamps</li>
                        </ul>
                    </div>
                    <div class="confirmation-options">
                        <label class="checkbox-option">
                            <input type="checkbox" id="forceDeleteCheckbox">
                            <span>Force delete (skip safety checks)</span>
                        </label>
                        <label class="checkbox-option">
                            <input type="checkbox" id="dryRunCheckbox">
                            <span>Dry run (preview only, don't actually delete)</span>
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeDeletionConfirmation()">Cancel</button>
                    <button class="btn btn-danger" onclick="confirmDeletion('${JSON.stringify(dialog).replace(/'/g, "&#39;")}')">
                        <span class="btn-icon">🗑️</span>
                        Confirm Deletion
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeDeletionConfirmation() {
    const modal = document.querySelector('.deletion-confirmation-modal');
    if (modal) {
        modal.remove();
    }
}

async function confirmDeletion(dialogJSON) {
    try {
        const forceDelete = document.getElementById('forceDeleteCheckbox').checked;
        const dryRun = document.getElementById('dryRunCheckbox').checked;
        
        // Close confirmation dialog
        closeDeletionConfirmation();
        
        // Show progress
        showProgress('Starting deletion operation...', true);
        
        // Confirm deletion with files
        const result = await ConfirmDeletion(dialogJSON, JSON.stringify(selectedFilesForDeletion), true, forceDelete, dryRun);
        const operation = JSON.parse(result);
        
        if (operation.status === 'started') {
            // Start monitoring progress
            monitorDeletionProgress(operation.operation_id);
        } else {
            showError('Failed to start deletion operation');
            showProgress('Deletion failed', false);
        }
        
    } catch (error) {
        console.error('Confirmation error:', error);
        showError(`Deletion confirmation failed: ${error.message}`);
        showProgress('Deletion failed', false);
    }
}

// Monitor deletion progress
let deletionProgressInterval = null;

function monitorDeletionProgress(operationID) {
    // Clear any existing interval
    if (deletionProgressInterval) {
        clearInterval(deletionProgressInterval);
    }
    
    // Poll progress every 500ms
    deletionProgressInterval = setInterval(async () => {
        try {
            const progressResult = await GetDeletionProgress(operationID);
            const progress = JSON.parse(progressResult);
            
            // Update progress display
            updateDeletionProgress(progress);
            
            // Check if operation is complete
            if (progress.status === 'completed' || progress.status === 'failed' || progress.status === 'cancelled') {
                clearInterval(deletionProgressInterval);
                deletionProgressInterval = null;
                
                if (progress.status === 'completed') {
                    showProgress('Deletion completed successfully!', false);
                    // Refresh the file list or show success message
                    showSuccessMessage(`Successfully deleted ${progress.files_processed} files`);
                } else {
                    showError(`Deletion ${progress.status}: ${progress.message}`);
                    showProgress('Deletion failed', false);
                }
            }
            
        } catch (error) {
            console.error('Progress monitoring error:', error);
            clearInterval(deletionProgressInterval);
            deletionProgressInterval = null;
            showError('Failed to monitor deletion progress');
            showProgress('Deletion failed', false);
        }
    }, 500);
}

function updateDeletionProgress(progress) {
    const progressText = document.getElementById('progressText');
    const progressBar = document.getElementById('progressBar');
    
    if (progressText) {
        progressText.textContent = progress.message || 'Processing...';
    }
    
    if (progressBar) {
        progressBar.style.width = `${progress.progress || 0}%`;
        progressBar.style.animation = 'none'; // Remove pulsing animation
    }
    
    // Update progress details
    const filesScanned = document.getElementById('filesScanned');
    const sizeFound = document.getElementById('sizeFound');
    
    if (filesScanned) {
        filesScanned.textContent = `${progress.files_processed || 0} / ${progress.total_files || 0}`;
    }
    
    if (sizeFound) {
        sizeFound.textContent = formatBytes(progress.current_size || 0);
    }
}

function showSuccessMessage(message) {
    const successContainer = document.createElement('div');
    successContainer.className = 'success-container';
    successContainer.innerHTML = `
        <div class="success-icon">✅</div>
        <div class="success-content">
            <h4>Success</h4>
            <p>${message}</p>
        </div>
        <button class="success-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Insert after the progress container
    const progressContainer = document.getElementById('progressContainer');
    if (progressContainer && progressContainer.parentNode) {
        progressContainer.parentNode.insertBefore(successContainer, progressContainer.nextSibling);
    }
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (successContainer.parentNode) {
            successContainer.remove();
        }
    }, 5000);
}

// Undo functionality
async function showUndoOptions() {
    try {
        const backupsResult = await GetAvailableBackups();
        const backups = JSON.parse(backupsResult);
        
        if (backups.length === 0) {
            showError('No backup sessions available for restore');
            return;
        }
        
        showRestoreDialog(backups);
        
    } catch (error) {
        console.error('Error getting backups:', error);
        showError(`Failed to get backup sessions: ${error.message}`);
    }
}

function showRestoreDialog(backups) {
    const modal = document.createElement('div');
    modal.className = 'restore-modal';
    
    const backupOptions = backups.map(backup => `
        <div class="backup-option" data-session-id="${backup.session_id}">
            <div class="backup-info">
                <h4>${backup.operation}</h4>
                <p>Session: ${backup.session_id}</p>
                <p>Files: ${backup.total_files}</p>
                <p>Size: ${formatBytes(backup.total_size)}</p>
                <p>Created: ${new Date(backup.created_at).toLocaleString()}</p>
            </div>
            <button class="btn btn-primary" onclick="restoreFromBackup('${backup.session_id}')">
                <span class="btn-icon">🔄</span>
                Restore
            </button>
        </div>
    `).join('');
    
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeRestoreDialog()">
            <div class="modal-content restore-modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>🔄 Restore from Backup</h3>
                    <button class="modal-close" onclick="closeRestoreDialog()">×</button>
                </div>
                <div class="modal-body">
                    <p>Select a backup session to restore files from:</p>
                    <div class="backup-list">
                        ${backupOptions}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeRestoreDialog()">Cancel</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeRestoreDialog() {
    const modal = document.querySelector('.restore-modal');
    if (modal) {
        modal.remove();
    }
}

async function restoreFromBackup(sessionID) {
    try {
        closeRestoreDialog();
        
        showProgress('Starting restore operation...', true);
        
        const result = await RestoreFromBackup(sessionID, false);
        const restore = JSON.parse(result);
        
        showProgress('Restore completed successfully!', false);
        showSuccessMessage(`Successfully restored ${restore.success_count} files from backup`);
        
    } catch (error) {
        console.error('Restore error:', error);
        showError(`Restore failed: ${error.message}`);
        showProgress('Restore failed', false);
    }
}

// ============================================================================
// BACKUP MANAGEMENT INTERFACE
// ============================================================================

// Global state for backup management
let backupData = null;
let currentBackupSession = null;

// Show the backup manager interface
async function showBackupManager() {
    try {
        showProgress('Loading backup data...', true);
        
        const result = await GetBackupBrowserData();
        const data = JSON.parse(result);
        backupData = data;
        
        showProgress('Backup data loaded', false);
        displayBackupManager(data);
        
    } catch (error) {
        console.error('Error loading backup data:', error);
        showError(`Failed to load backup data: ${error.message}`);
        showProgress('Failed to load backup data', false);
    }
}

// Display the backup manager interface
function displayBackupManager(data) {
    const modal = document.createElement('div');
    modal.className = 'backup-manager-modal';
    
    const summary = data.summary;
    const sessions = data.sessions || [];
    
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeBackupManager()">
            <div class="modal-content backup-manager-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>💾 Backup Manager</h3>
                    <div class="header-actions">
                        <button class="btn btn-outline btn-sm" onclick="refreshBackupData()">
                            <span class="btn-icon">🔄</span>
                            Refresh
                        </button>
                        <button class="modal-close" onclick="closeBackupManager()">×</button>
                    </div>
                </div>
                
                <div class="modal-body">
                    <div class="backup-summary">
                        <div class="summary-grid">
                            <div class="summary-item">
                                <div class="summary-icon">📦</div>
                                <div class="summary-content">
                                    <h4>${summary.total_sessions}</h4>
                                    <p>Backup Sessions</p>
                                </div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-icon">📁</div>
                                <div class="summary-content">
                                    <h4>${summary.total_files.toLocaleString()}</h4>
                                    <p>Total Files</p>
                                </div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-icon">💾</div>
                                <div class="summary-content">
                                    <h4>${formatBytes(summary.total_size)}</h4>
                                    <p>Total Size</p>
                                </div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-icon">🗓️</div>
                                <div class="summary-content">
                                    <h4>${summary.oldest_session ? new Date(summary.oldest_session).toLocaleDateString() : 'N/A'}</h4>
                                    <p>Oldest Backup</p>
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
                                <option value="">All Operations</option>
                                <option value="manual_deletion">Manual Deletion</option>
                                <option value="cache_cleanup">Cache Cleanup</option>
                                <option value="system_cleanup">System Cleanup</option>
                            </select>
                        </div>
                        <div class="bulk-actions">
                            <button class="btn btn-outline btn-sm" onclick="cleanupOldBackups()">
                                <span class="btn-icon">🧹</span>
                                Cleanup Old Backups
                            </button>
                        </div>
                    </div>
                    
                    <div class="backup-sessions">
                        <h4>Backup Sessions</h4>
                        ${sessions.length === 0 ? 
                            '<div class="empty-state"><div class="empty-icon">📦</div><h3>No Backups Found</h3><p>No backup sessions are available.</p></div>' :
                            `<div class="sessions-list">
                                ${sessions.map(session => createBackupSessionCard(session)).join('')}
                            </div>`
                        }
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Setup search and filter
    setupBackupControls();
}

// Create a backup session card
function createBackupSessionCard(session) {
    const startTime = new Date(session.start_time);
    const endTime = new Date(session.end_time);
    const duration = endTime - startTime;
    
    return `
        <div class="backup-session-card" data-session-id="${session.session_id}">
            <div class="session-header">
                <div class="session-info">
                    <h5>${session.operation}</h5>
                    <p class="session-id">Session: ${session.session_id}</p>
                    <p class="session-time">${startTime.toLocaleString()}</p>
                </div>
                <div class="session-stats">
                    <div class="stat-item">
                        <span class="stat-label">Files:</span>
                        <span class="stat-value">${session.total_files}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Size:</span>
                        <span class="stat-value">${formatBytes(session.total_size)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Duration:</span>
                        <span class="stat-value">${formatDuration(duration)}</span>
                    </div>
                </div>
                <div class="session-status">
                    <span class="status-badge status-${session.status}">${session.status}</span>
                </div>
            </div>
            
            <div class="session-actions">
                <button class="btn btn-outline btn-sm" onclick="showBackupDetails('${session.session_id}')">
                    <span class="btn-icon">ℹ️</span>
                    Details
                </button>
                <button class="btn btn-primary btn-sm" onclick="previewRestore('${session.session_id}')">
                    <span class="btn-icon">👁️</span>
                    Preview Restore
                </button>
                <button class="btn btn-secondary btn-sm" onclick="restoreBackupSession('${session.session_id}')">
                    <span class="btn-icon">🔄</span>
                    Restore All
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteBackupSession('${session.session_id}')">
                    <span class="btn-icon">🗑️</span>
                    Delete
                </button>
            </div>
        </div>
    `;
}

// Setup backup controls (search and filter)
function setupBackupControls() {
    const searchInput = document.getElementById('backupSearch');
    const filterSelect = document.getElementById('backupFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterBackupSessions);
    }
    
    if (filterSelect) {
        filterSelect.addEventListener('change', filterBackupSessions);
    }
}

// Filter backup sessions
function filterBackupSessions() {
    const searchTerm = document.getElementById('backupSearch')?.value.toLowerCase() || '';
    const filterValue = document.getElementById('backupFilter')?.value || '';
    
    document.querySelectorAll('.backup-session-card').forEach(card => {
        const sessionId = card.dataset.sessionId;
        const session = backupData.sessions.find(s => s.session_id === sessionId);
        
        if (!session) return;
        
        let show = true;
        
        // Search filter
        if (searchTerm) {
            const searchableText = `${session.operation} ${session.session_id}`.toLowerCase();
            if (!searchableText.includes(searchTerm)) {
                show = false;
            }
        }
        
        // Filter by operation
        if (filterValue && session.operation !== filterValue) {
            show = false;
        }
        
        card.style.display = show ? '' : 'none';
    });
}

// Close backup manager
function closeBackupManager() {
    const modal = document.querySelector('.backup-manager-modal');
    if (modal) {
        modal.remove();
    }
}

// Refresh backup data
async function refreshBackupData() {
    try {
        showProgress('Refreshing backup data...', true);
        
        const result = await GetBackupBrowserData();
        const data = JSON.parse(result);
        backupData = data;
        
        // Update the display
        const sessionsList = document.querySelector('.sessions-list');
        if (sessionsList) {
            sessionsList.innerHTML = data.sessions.map(session => createBackupSessionCard(session)).join('');
        }
        
        // Update summary
        const summary = data.summary;
        document.querySelector('.summary-item:nth-child(1) h4').textContent = summary.total_sessions;
        document.querySelector('.summary-item:nth-child(2) h4').textContent = summary.total_files.toLocaleString();
        document.querySelector('.summary-item:nth-child(3) h4').textContent = formatBytes(summary.total_size);
        document.querySelector('.summary-item:nth-child(4) h4').textContent = summary.oldest_session ? new Date(summary.oldest_session).toLocaleDateString() : 'N/A';
        
        showProgress('Backup data refreshed', false);
        
    } catch (error) {
        console.error('Error refreshing backup data:', error);
        showError(`Failed to refresh backup data: ${error.message}`);
        showProgress('Failed to refresh backup data', false);
    }
}

// Show backup session details
async function showBackupDetails(sessionID) {
    try {
        showProgress('Loading session details...', true);
        
        const result = await GetBackupSessionDetails(sessionID);
        const details = JSON.parse(result);
        currentBackupSession = details;
        
        showProgress('Session details loaded', false);
        displayBackupDetails(details);
        
    } catch (error) {
        console.error('Error loading session details:', error);
        showError(`Failed to load session details: ${error.message}`);
        showProgress('Failed to load session details', false);
    }
}

// Display backup session details
function displayBackupDetails(details) {
    const session = details.session;
    const modal = document.createElement('div');
    modal.className = 'backup-details-modal';
    
    const integrityStatus = details.integrity_valid ? 
        '<span class="status-badge status-completed">✅ Valid</span>' : 
        '<span class="status-badge status-failed">❌ Invalid</span>';
    
    const integrityErrors = details.integrity_errors.length > 0 ? 
        `<div class="integrity-errors">
            <h5>Integrity Errors:</h5>
            <ul>${details.integrity_errors.map(error => `<li>${error}</li>`).join('')}</ul>
        </div>` : '';
    
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeBackupDetails()">
            <div class="modal-content backup-details-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>📋 Backup Session Details</h3>
                    <button class="modal-close" onclick="closeBackupDetails()">×</button>
                </div>
                
                <div class="modal-body">
                    <div class="session-overview">
                        <div class="overview-grid">
                            <div class="overview-item">
                                <span class="overview-label">Session ID:</span>
                                <span class="overview-value">${session.session_id}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Operation:</span>
                                <span class="overview-value">${session.operation}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Status:</span>
                                <span class="overview-value"><span class="status-badge status-${session.status}">${session.status}</span></span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Start Time:</span>
                                <span class="overview-value">${new Date(session.start_time).toLocaleString()}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">End Time:</span>
                                <span class="overview-value">${new Date(session.end_time).toLocaleString()}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Duration:</span>
                                <span class="overview-value">${formatDuration(new Date(session.end_time) - new Date(session.start_time))}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Total Files:</span>
                                <span class="overview-value">${session.total_files}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Success Count:</span>
                                <span class="overview-value">${session.success_count}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Failure Count:</span>
                                <span class="overview-value">${session.failure_count}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Total Size:</span>
                                <span class="overview-value">${formatBytes(session.total_size)}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Backup Size:</span>
                                <span class="overview-value">${formatBytes(session.backup_size)}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Integrity:</span>
                                <span class="overview-value">${integrityStatus}</span>
                            </div>
                        </div>
                    </div>
                    
                    ${integrityErrors}
                    
                    <div class="backup-files">
                        <h4>Backed Up Files (${session.entries.length})</h4>
                        <div class="files-controls">
                            <div class="search-box">
                                <input type="text" id="fileSearchDetails" placeholder="Search files..." class="search-input">
                                <span class="search-icon">🔍</span>
                            </div>
                            <div class="file-actions">
                                <button class="btn btn-outline btn-sm" onclick="selectAllFiles()">
                                    <span class="btn-icon">☑️</span>
                                    Select All
                                </button>
                                <button class="btn btn-outline btn-sm" onclick="clearFileSelection()">
                                    <span class="btn-icon">☐</span>
                                    Clear Selection
                                </button>
                                <button class="btn btn-primary btn-sm" onclick="restoreSelectedFiles('${session.session_id}')">
                                    <span class="btn-icon">🔄</span>
                                    Restore Selected
                                </button>
                            </div>
                        </div>
                        <div class="files-list">
                            ${createBackupFilesList(session.entries)}
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeBackupDetails()">Close</button>
                    <button class="btn btn-secondary" onclick="restoreBackupSession('${session.session_id}')">
                        <span class="btn-icon">🔄</span>
                        Restore All Files
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Setup file search
    const fileSearch = document.getElementById('fileSearchDetails');
    if (fileSearch) {
        fileSearch.addEventListener('input', filterBackupFiles);
    }
}

// Create backup files list
function createBackupFilesList(entries) {
    return `
        <table class="backup-files-table">
            <thead>
                <tr>
                    <th><input type="checkbox" id="selectAllFiles" onchange="toggleAllFiles(this.checked)"></th>
                    <th>Original Path</th>
                    <th>Size</th>
                    <th>Backup Time</th>
                    <th>Status</th>
                    <th>Checksum</th>
                </tr>
            </thead>
            <tbody>
                ${entries.map(entry => `
                    <tr class="backup-file-row" data-file-path="${entry.original_path}">
                        <td><input type="checkbox" class="file-checkbox" value="${entry.original_path}"></td>
                        <td class="file-path" title="${entry.original_path}">${entry.original_path}</td>
                        <td class="file-size">${formatBytes(entry.size)}</td>
                        <td class="file-time">${new Date(entry.backup_time).toLocaleString()}</td>
                        <td class="file-status">
                            <span class="status-badge status-${entry.success ? 'completed' : 'failed'}">
                                ${entry.success ? '✅ Success' : '❌ Failed'}
                            </span>
                        </td>
                        <td class="file-checksum" title="${entry.checksum}">${entry.checksum.substring(0, 16)}...</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Filter backup files
function filterBackupFiles() {
    const searchTerm = document.getElementById('fileSearchDetails')?.value.toLowerCase() || '';
    
    document.querySelectorAll('.backup-file-row').forEach(row => {
        const filePath = row.dataset.filePath.toLowerCase();
        const show = !searchTerm || filePath.includes(searchTerm);
        row.style.display = show ? '' : 'none';
    });
}

// Select all files
function selectAllFiles() {
    document.querySelectorAll('.file-checkbox').forEach(checkbox => {
        checkbox.checked = true;
    });
    document.getElementById('selectAllFiles').checked = true;
}

// Clear file selection
function clearFileSelection() {
    document.querySelectorAll('.file-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    document.getElementById('selectAllFiles').checked = false;
}

// Toggle all files
function toggleAllFiles(checked) {
    document.querySelectorAll('.file-checkbox').forEach(checkbox => {
        checkbox.checked = checked;
    });
}

// Close backup details
function closeBackupDetails() {
    const modal = document.querySelector('.backup-details-modal');
    if (modal) {
        modal.remove();
    }
}

// Restore entire backup session
async function restoreBackupSession(sessionID) {
    try {
        // Show confirmation dialog
        const confirmed = confirm(`Are you sure you want to restore all files from backup session ${sessionID}? This will overwrite existing files.`);
        if (!confirmed) return;
        
        showProgress('Starting restore operation...', true);
        
        const result = await RestoreFromBackupWithOptions(sessionID, '', true, false);
        const restore = JSON.parse(result);
        
        showProgress('Restore completed successfully!', false);
        showSuccessMessage(`Successfully restored ${restore.success_count} files from backup`);
        
    } catch (error) {
        console.error('Restore error:', error);
        showError(`Restore failed: ${error.message}`);
        showProgress('Restore failed', false);
    }
}

// Restore selected files
async function restoreSelectedFiles(sessionID) {
    const selectedFiles = Array.from(document.querySelectorAll('.file-checkbox:checked')).map(cb => cb.value);
    
    if (selectedFiles.length === 0) {
        showError('No files selected for restore');
        return;
    }
    
    try {
        // Show confirmation dialog
        const confirmed = confirm(`Are you sure you want to restore ${selectedFiles.length} selected files? This will overwrite existing files.`);
        if (!confirmed) return;
        
        showProgress('Starting selective restore operation...', true);
        
        const result = await RestoreFromBackupWithOptions(sessionID, JSON.stringify(selectedFiles), true, false);
        const restore = JSON.parse(result);
        
        showProgress('Selective restore completed successfully!', false);
        showSuccessMessage(`Successfully restored ${restore.success_count} files from backup`);
        
    } catch (error) {
        console.error('Selective restore error:', error);
        showError(`Selective restore failed: ${error.message}`);
        showProgress('Selective restore failed', false);
    }
}

// Delete backup session
async function deleteBackupSession(sessionID) {
    try {
        // Show confirmation dialog
        const confirmed = confirm(`Are you sure you want to delete backup session ${sessionID}? This action cannot be undone.`);
        if (!confirmed) return;
        
        showProgress('Deleting backup session...', true);
        
        const result = await DeleteBackupSession(sessionID);
        const deletion = JSON.parse(result);
        
        showProgress('Backup session deleted successfully!', false);
        showSuccessMessage(`Successfully deleted backup session ${sessionID}`);
        
        // Refresh the backup data
        await refreshBackupData();
        
    } catch (error) {
        console.error('Delete error:', error);
        showError(`Delete failed: ${error.message}`);
        showProgress('Delete failed', false);
    }
}

// Cleanup old backups
async function cleanupOldBackups() {
    try {
        const days = prompt('Enter the number of days (backups older than this will be deleted):', '30');
        if (!days || isNaN(days)) return;
        
        const daysNum = parseInt(days);
        if (daysNum <= 0) {
            showError('Please enter a valid number of days');
            return;
        }
        
        // Show confirmation dialog
        const confirmed = confirm(`Are you sure you want to delete all backup sessions older than ${daysNum} days? This action cannot be undone.`);
        if (!confirmed) return;
        
        showProgress('Cleaning up old backups...', true);
        
        const result = await CleanupBackupsByAge(daysNum);
        const cleanup = JSON.parse(result);
        
        showProgress('Cleanup completed successfully!', false);
        showSuccessMessage(`Successfully deleted ${cleanup.deleted_count} old backup sessions`);
        
        // Refresh the backup data
        await refreshBackupData();
        
    } catch (error) {
        console.error('Cleanup error:', error);
        showError(`Cleanup failed: ${error.message}`);
        showProgress('Cleanup failed', false);
    }
}

// Preview restore operation
async function previewRestore(sessionID) {
    try {
        showProgress('Generating restore preview...', true);
        
        const result = await PreviewRestoreOperation(sessionID, '');
        const preview = JSON.parse(result);
        
        showProgress('Restore preview generated', false);
        displayRestorePreview(sessionID, preview);
        
    } catch (error) {
        console.error('Preview error:', error);
        showError(`Preview failed: ${error.message}`);
        showProgress('Preview failed', false);
    }
}

// Display restore preview
function displayRestorePreview(sessionID, preview) {
    const modal = document.createElement('div');
    modal.className = 'restore-preview-modal';
    
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeRestorePreview()">
            <div class="modal-content restore-preview-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>👁️ Restore Preview</h3>
                    <button class="modal-close" onclick="closeRestorePreview()">×</button>
                </div>
                
                <div class="modal-body">
                    <div class="preview-summary">
                        <div class="summary-grid">
                            <div class="summary-item">
                                <div class="summary-icon">📁</div>
                                <div class="summary-content">
                                    <h4>${preview.total_files}</h4>
                                    <p>Total Files</p>
                                </div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-icon">✅</div>
                                <div class="summary-content">
                                    <h4>${preview.success_count}</h4>
                                    <p>Can Restore</p>
                                </div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-icon">❌</div>
                                <div class="summary-content">
                                    <h4>${preview.failure_count}</h4>
                                    <p>Would Conflict</p>
                                </div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-icon">💾</div>
                                <div class="summary-content">
                                    <h4>${formatBytes(preview.restored_size)}</h4>
                                    <p>Size to Restore</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="preview-details">
                        <div class="restoreable-files">
                            <h4>Files That Can Be Restored (${preview.restored_files.length})</h4>
                            <div class="files-list">
                                ${preview.restored_files.map(file => `
                                    <div class="file-item">
                                        <span class="file-icon">✅</span>
                                        <span class="file-path">${file}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        ${preview.failed_files.length > 0 ? `
                            <div class="conflicting-files">
                                <h4>Files That Would Conflict (${preview.failed_files.length})</h4>
                                <div class="files-list">
                                    ${preview.failed_files.map(file => `
                                        <div class="file-item">
                                            <span class="file-icon">⚠️</span>
                                            <span class="file-path">${file}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeRestorePreview()">Close</button>
                    <button class="btn btn-primary" onclick="restoreBackupSession('${sessionID}')">
                        <span class="btn-icon">🔄</span>
                        Proceed with Restore
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Close restore preview
function closeRestorePreview() {
    const modal = document.querySelector('.restore-preview-modal');
    if (modal) {
        modal.remove();
    }
}
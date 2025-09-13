import './style.css';
import './app.css';
import { ScanCacheLocation, ScanMultipleCacheLocations, GetCacheLocationsFromConfig, GetSystemInfo, IsScanning, StopScan, GetScanProgress, GetLastScanResult } from '../wailsjs/go/main/App.js';

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

function displayScanResult(result) {
    const resultsDiv = document.getElementById('scanResults');
    const exportButton = document.getElementById('exportButton');
    
    if (result.locations) {
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
                        </div>
                    </div>
                </div>
                <div class="locations-results">
                    ${result.locations.map(loc => createLocationCard(loc)).join('')}
                </div>
            </div>
        `;
    } else {
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
    
    return `
        <tr class="file-row" data-file-path="${file.path}" data-file-size="${file.size}" data-file-type="${fileType.toLowerCase()}">
            <td class="file-name">
                <span class="file-icon">${fileIcon}</span>
                <span class="file-name-text" title="${file.path}">${file.name}</span>
            </td>
            <td class="file-size">${sizeDisplay}</td>
            <td class="file-modified">${modifiedDate}</td>
            <td class="file-accessed">${accessedDate}</td>
            <td class="file-type">${fileType}</td>
            <td class="file-actions">
                <button class="btn-icon" onclick="showFileDetails('${file.path}', '${file.name}', ${file.size}, '${file.last_modified}', '${file.last_accessed}', '${fileType}', '${file.permissions}')" title="View Details">
                    ℹ️
                </button>
                <button class="btn-icon" onclick="revealInFinder('${file.path}')" title="Reveal in Finder">
                    📂
                </button>
            </td>
        </tr>
    `;
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
    
    if (sizeFilter) {
        sizeFilter.addEventListener('change', filterFiles);
    }
    if (typeFilter) {
        typeFilter.addEventListener('change', filterFiles);
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
    
    document.querySelectorAll('.file-row').forEach(row => {
        const fileName = row.querySelector('.file-name-text').textContent.toLowerCase();
        const fileSize = parseInt(row.dataset.fileSize);
        const fileType = row.dataset.fileType;
        
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

function showFileDetails(path, name, size, modified, accessed, type, permissions) {
    const modal = document.createElement('div');
    modal.className = 'file-details-modal';
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

function revealInFinder(path) {
    // This would need to be implemented in the backend
    console.log('Reveal in Finder:', path);
    showError('Reveal in Finder functionality not yet implemented');
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
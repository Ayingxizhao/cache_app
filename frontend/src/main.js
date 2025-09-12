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
        showError('Scan failed: ' + error.message);
        setScanningState(false);
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
        
        const result = await ScanMultipleCacheLocations(JSON.stringify(safeLocations));
        const scanResult = JSON.parse(result);
        
        displayScanResult(scanResult);
        currentScanResult = scanResult;
        setScanningState(false);
        showProgress('Scan completed!', false);
        
    } catch (error) {
        showError('Full scan failed: ' + error.message);
        setScanningState(false);
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
            <div class="locations-results">
                ${result.locations.map(loc => `
                    <div class="location-card">
                        <div class="location-header">
                            <h4>${loc.name}</h4>
                            <div class="location-stats">
                                <span class="stat">${loc.file_count.toLocaleString()} files</span>
                                <span class="stat">${formatBytes(loc.total_size)}</span>
                            </div>
                        </div>
                        <div class="location-details">
                            <p class="location-path">${loc.path}</p>
                            <div class="location-meta">
                                <span>Duration: ${formatDuration(loc.scan_duration)}</span>
                                ${loc.error ? `<span class="error-text">Error: ${loc.error}</span>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
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
            <div class="location-details">
                <h4>${result.name}</h4>
                <p class="location-path">${result.path}</p>
                ${result.error ? `<p class="error-text">Error: ${result.error}</p>` : ''}
            </div>
        `;
    }
    
    exportButton.disabled = false;
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
    } else {
        progressContainer.style.display = 'none';
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

function showError(message) {
    const errorContainer = document.getElementById('errorContainer');
    const errorMessage = document.getElementById('errorMessage');
    
    errorMessage.textContent = message;
    errorContainer.style.display = 'flex';
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        hideError();
    }, 10000);
}

function hideError() {
    const errorContainer = document.getElementById('errorContainer');
    errorContainer.style.display = 'none';
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
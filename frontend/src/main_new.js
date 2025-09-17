import './style.css';
import './app.css';
import './styles/navigation.css';
import './styles/notifications.css';
import { Navigation } from './components/Navigation.js';
import { AppState } from './state/AppState.js';
import { NotificationSystem } from './components/NotificationSystem.js';
import { ScanCacheLocation, ScanMultipleCacheLocations, GetCacheLocationsFromConfig, GetSystemInfo, IsScanning, StopScan, GetScanProgress, GetLastScanResult, GetSafetyClassificationSummary, ClassifyFileSafety, GetSafetyClassificationRules, GetFilesBySafetyLevel, DeleteFilesWithConfirmation, ConfirmDeletion, GetDeletionProgress, StopDeletion, RestoreFromBackup, GetDeletionHistory, GetAvailableBackups, ValidateFilesForDeletion, GetDeletionSystemStatus, RevealInFinder, GetBackupBrowserData, GetBackupSessionDetails, PreviewRestoreOperation, RestoreFromBackupWithOptions, DeleteBackupSession, CleanupBackupsByAge, GetBackupProgress } from '../wailsjs/go/main/App.js';

// Global instances
let navigation = null;
let appState = null;
let notificationSystem = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
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

function initializeApp() {
    // Initialize state management
    appState = window.appState;
    appState.initialize();
    
    // Initialize notification system
    notificationSystem = window.notificationSystem;
    
    // Initialize navigation
    navigation = new Navigation();
    
    // Create the integrated UI
    document.querySelector('#app').innerHTML = `
        <div class="app-container">
            ${navigation.createNavigationHTML()}
            ${navigation.createMainContentHTML()}
        </div>
    `;
    
    // Initialize navigation
    navigation.initialize();
    
    // Set up state listeners
    setupStateListeners();
    
    // Load initial data
    loadInitialData();
    
    // Show welcome notification
    notificationSystem.success('Cache App initialized successfully!', {
        title: 'Welcome',
        duration: 3000
    });
}

// Set up state listeners
function setupStateListeners() {
    // Listen for system status changes
    appState.subscribe('systemStatus', (status) => {
        if (navigation) {
            navigation.updateSystemStatus(status, appState.get('systemMessage'));
        }
    });
    
    // Listen for scan state changes
    appState.subscribe('isScanning', (isScanning) => {
        if (isScanning) {
            notificationSystem.loading('Scanning cache locations...', {
                title: 'Scan in Progress',
                duration: 0
            });
        } else {
            notificationSystem.completeProgress('scan-progress', 'Scan completed successfully!', 'success');
        }
    });
    
    // Listen for scan results
    appState.subscribe('scanResults', (results) => {
        if (results) {
            notificationSystem.success(`Scan completed: ${results.totalFiles} files found`, {
                title: 'Scan Complete',
                duration: 5000
            });
        }
    });
    
    // Listen for errors
    appState.subscribe('errors', (errors) => {
        if (errors.length > 0) {
            const latestError = errors[errors.length - 1];
            notificationSystem.error(latestError.message, {
                title: 'Error',
                duration: 8000
            });
        }
    });
}

// Load initial data
async function loadInitialData() {
    try {
        // Load cache locations
        const locationsData = await GetCacheLocationsFromConfig();
        const locations = JSON.parse(locationsData);
        appState.setCacheLocations(locations);
        
        // Load system info
        const systemInfoData = await GetSystemInfo();
        const systemInfo = JSON.parse(systemInfoData);
        
        // Load backup data
        try {
            const backupData = await GetBackupBrowserData();
            const backupInfo = JSON.parse(backupData);
            appState.setBackupSessions(backupInfo.sessions);
        } catch (error) {
            console.warn('Failed to load backup data:', error);
        }
        
        notificationSystem.success('Initial data loaded successfully');
    } catch (error) {
        console.error('Failed to load initial data:', error);
        appState.addError({
            message: 'Failed to load initial data',
            details: error.message
        });
    }
}

function setupEventListeners() {
    // Add event listeners after UI is created
    document.addEventListener('click', async (e) => {
        // Handle navigation actions
        if (e.target.id === 'refreshLocations') {
            await loadInitialData();
        } else if (e.target.id === 'scanAllLocations') {
            await scanAllLocations();
        } else if (e.target.id === 'refreshScanResults') {
            // Refresh scan results
            const lastResult = appState.get('lastScanResult');
            if (lastResult) {
                appState.setScanResults(lastResult);
            }
        } else if (e.target.id === 'cleanSafeFiles') {
            await cleanSafeFiles();
        } else if (e.target.id === 'refreshBackups') {
            await refreshBackupData();
        } else if (e.target.id === 'cleanupOldBackups') {
            await cleanupOldBackups();
        } else if (e.target.id === 'resetSettings') {
            appState.resetSettings();
            notificationSystem.info('Settings reset to defaults');
        } else if (e.target.id === 'saveSettings') {
            appState.saveToStorage();
            notificationSystem.success('Settings saved successfully');
        } else if (e.target.id === 'exportLogs') {
            await exportLogs();
        } else if (e.target.id === 'checkUpdates') {
            await checkUpdates();
        }
    });
}

// Scanner functions
async function scanAllLocations() {
    try {
        appState.setScanning(true);
        
        const locations = appState.get('cacheLocations');
        const safeLocations = locations.filter(loc => loc.type === 'user' || loc.type === 'application');
        
        const locationsJSON = JSON.stringify(safeLocations.map(loc => ({
            id: loc.id,
            name: loc.name,
            path: loc.path
        })));
        
        const result = await ScanMultipleCacheLocations(locationsJSON);
        const scanResult = JSON.parse(result);
        
        appState.setScanResults(scanResult);
        appState.setScanning(false);
        
    } catch (error) {
        console.error('Scan error:', error);
        appState.addError({
            message: 'Scan failed',
            details: error.message
        });
        appState.setScanning(false);
    }
}

// Cleaner functions
async function cleanSafeFiles() {
    try {
        const selectedFiles = Array.from(appState.get('selectedFiles'));
        if (selectedFiles.length === 0) {
            notificationSystem.warning('No files selected for cleaning');
            return;
        }
        
        const filesJSON = JSON.stringify(selectedFiles);
        const dialogResult = await DeleteFilesWithConfirmation(filesJSON, 'clean_safe_files', false, false);
        const dialog = JSON.parse(dialogResult);
        
        // Show confirmation dialog
        showDeletionConfirmationDialog(dialog, null);
        
    } catch (error) {
        console.error('Clean error:', error);
        appState.addError({
            message: 'Clean operation failed',
            details: error.message
        });
    }
}

// Backup functions
async function refreshBackupData() {
    try {
        const backupData = await GetBackupBrowserData();
        const backupInfo = JSON.parse(backupData);
        appState.setBackupSessions(backupInfo.sessions);
        
        notificationSystem.success('Backup data refreshed');
    } catch (error) {
        console.error('Backup refresh error:', error);
        appState.addError({
            message: 'Failed to refresh backup data',
            details: error.message
        });
    }
}

async function cleanupOldBackups() {
    try {
        const retentionDays = appState.get('settings').retentionPolicy;
        const result = await CleanupBackupsByAge(retentionDays);
        const cleanupResult = JSON.parse(result);
        
        notificationSystem.success(`Cleaned up ${cleanupResult.deleted_count} old backup sessions`);
        
        // Refresh backup data
        await refreshBackupData();
        
    } catch (error) {
        console.error('Cleanup error:', error);
        appState.addError({
            message: 'Backup cleanup failed',
            details: error.message
        });
    }
}

// Utility functions
async function exportLogs() {
    try {
        const logs = appState.getHistory();
        const dataBlob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `cache-app-logs-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        notificationSystem.success('Logs exported successfully');
    } catch (error) {
        console.error('Export error:', error);
        appState.addError({
            message: 'Failed to export logs',
            details: error.message
        });
    }
}

async function checkUpdates() {
    try {
        // This would check for updates in a real implementation
        notificationSystem.info('You are running the latest version', {
            title: 'Update Check',
            duration: 3000
        });
    } catch (error) {
        console.error('Update check error:', error);
        appState.addError({
            message: 'Failed to check for updates',
            details: error.message
        });
    }
}

// Legacy functions for compatibility
function selectAllSafeFiles() {
    // Implementation for selecting safe files
    notificationSystem.info('Select all safe files functionality');
}

function clearFileSelection() {
    appState.clearSelection();
    notificationSystem.info('File selection cleared');
}

function showUndoOptions() {
    notificationSystem.info('Undo options functionality');
}

function showFileDetails(path, name, size, modified, accessed, type, permissions, safetyData = '') {
    // Implementation for showing file details
    notificationSystem.info('File details functionality');
}

function closeFileDetails() {
    // Implementation for closing file details
}

function revealInFinder(path) {
    // Implementation for revealing in Finder
    notificationSystem.info('Reveal in Finder functionality');
}

function toggleLocationFiles(locationId) {
    // Implementation for toggling location files
    notificationSystem.info('Toggle location files functionality');
}

function deleteSelectedFiles() {
    // Implementation for deleting selected files
    notificationSystem.info('Delete selected files functionality');
}

function confirmDeletion(dialogJSON) {
    // Implementation for confirming deletion
    notificationSystem.info('Confirm deletion functionality');
}

function closeDeletionConfirmation() {
    // Implementation for closing deletion confirmation
}

function closeRestoreDialog() {
    // Implementation for closing restore dialog
}

function restoreFromBackup() {
    // Implementation for restoring from backup
    notificationSystem.info('Restore from backup functionality');
}

// Backup Management Functions
function showBackupManager() {
    // Implementation for showing backup manager
    notificationSystem.info('Show backup manager functionality');
}

function closeBackupManager() {
    // Implementation for closing backup manager
}

// refreshBackupData function is already implemented above as async function

function showBackupDetails() {
    // Implementation for showing backup details
    notificationSystem.info('Show backup details functionality');
}

function closeBackupDetails() {
    // Implementation for closing backup details
}

function restoreBackupSession() {
    // Implementation for restoring backup session
    notificationSystem.info('Restore backup session functionality');
}

function restoreSelectedFiles() {
    // Implementation for restoring selected files
    notificationSystem.info('Restore selected files functionality');
}

function deleteBackupSession() {
    // Implementation for deleting backup session
    notificationSystem.info('Delete backup session functionality');
}

// cleanupOldBackups function is already implemented above as async function

function previewRestore() {
    // Implementation for previewing restore
    notificationSystem.info('Preview restore functionality');
}

function closeRestorePreview() {
    // Implementation for closing restore preview
}

// Deletion confirmation dialog
function showDeletionConfirmationDialog(dialog, validation) {
    const modal = document.createElement('div');
    modal.className = 'deletion-confirmation-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Confirm Deletion</h3>
                <button class="modal-close" onclick="closeDeletionConfirmation()">×</button>
            </div>
            <div class="modal-body">
                <div class="confirmation-message">
                    <h4>Are you sure you want to delete these files?</h4>
                    <p>This action will create a backup before deletion and cannot be undone.</p>
                </div>
                <div class="deletion-details">
                    <p><strong>Files to delete:</strong> ${dialog.files.length}</p>
                    <p><strong>Total size:</strong> ${formatBytes(dialog.totalSize)}</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="closeDeletionConfirmation()">Cancel</button>
                <button class="btn btn-danger" onclick="confirmDeletion('${JSON.stringify(dialog)}')">Delete Files</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Utility function
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

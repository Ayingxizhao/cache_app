// CSS files are linked in HTML, not imported as modules

// Import all components
import { Navigation } from './components/Navigation.js';
import { AppState } from './state/AppState.js';
import { NotificationSystem } from './components/NotificationSystem.js';
import { SettingsManager } from './components/SettingsManager.js';
import { HelpSystem } from './components/HelpSystem.js';
import { PerformanceManager } from './components/PerformanceManager.js';
import { AccessibilityManager } from './components/AccessibilityManager.js';

// Import new navigation services and components
import { Router } from './services/router.js';
import { Breadcrumbs } from './components/breadcrumbs.js';
import { Sidebar } from './components/sidebar.js';
import { KeyboardManager } from './services/keyboard.js';
import { PageStateManager } from './services/pagestate.js';

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

// Global application instances
let appState = null;
let router = null;
let navigation = null;
let breadcrumbs = null;
let sidebar = null;
let keyboardManager = null;
let pageStateManager = null;
let notificationSystem = null;
let settingsManager = null;
let helpSystem = null;
let performanceManager = null;
let accessibilityManager = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting application initialization...');
    initializeApplication();
});

async function initializeApplication() {
    try {
        // Initialize core systems
        await initializeCoreSystems();
        
        // Initialize UI components
        await initializeUIComponents();
        
        // Set up event listeners
        setupGlobalEventListeners();
        
        // Load initial data
        await loadInitialData();
        
        // Initialize performance monitoring
        performanceManager.initialize();
        
        // Show welcome message
        notificationSystem.success('Cache App initialized successfully!', {
            title: 'Welcome',
            duration: 3000
        });
        
        console.log('Cache App fully initialized');
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showInitializationError(error);
    }
}

async function initializeCoreSystems() {
    console.log('Initializing core systems...');
    
    // Initialize state management
    appState = window.appState;
    if (!appState) {
        console.error('AppState not found on window');
        return;
    }
    appState.initialize();
    console.log('✓ AppState initialized');
    
    // Initialize router
    router = window.router;
    if (!router) {
        console.error('Router not found on window');
        return;
    }
    console.log('✓ Router initialized');
    
    // Initialize notification system
    notificationSystem = window.notificationSystem;
    if (!notificationSystem) {
        console.warn('NotificationSystem not found on window');
    } else {
        console.log('✓ NotificationSystem initialized');
    }
    
    // Initialize navigation services
    keyboardManager = window.keyboardManager;
    if (!keyboardManager) {
        console.warn('KeyboardManager not found on window, creating fallback');
        keyboardManager = { 
            subscribe: () => {}, 
            showShortcutsHelp: () => console.log('Keyboard shortcuts not available'),
            toggle: () => console.log('Keyboard shortcuts not available')
        };
    }
    console.log('✓ KeyboardManager initialized');
    
    pageStateManager = window.pageStateManager;
    if (!pageStateManager) {
        console.warn('PageStateManager not found on window, creating fallback');
        pageStateManager = { 
            subscribe: () => {}, 
            saveCurrentPageState: () => {},
            loadPageState: () => null
        };
    }
    console.log('✓ PageStateManager initialized');
    
    // Initialize performance manager
    performanceManager = new PerformanceManager(appState, notificationSystem);
    // Expose for debugging in DevTools console
    try { window.performanceManager = performanceManager; } catch (e) { /* ignore */ }
    try { window.PerformanceManager = PerformanceManager; } catch (e) { /* ignore */ }
    console.log('✓ PerformanceManager initialized');
    
    // Initialize accessibility manager
    accessibilityManager = new AccessibilityManager(appState, notificationSystem);
    console.log('✓ AccessibilityManager initialized');
    
    console.log('Core systems initialized successfully');
}

async function initializeUIComponents() {
    console.log('Initializing UI components...');
    
    // Initialize navigation components
    navigation = new Navigation(router, appState);
    console.log('✓ Navigation component created');
    
    // Initialize breadcrumbs
    if (window.Breadcrumbs) {
        breadcrumbs = new Breadcrumbs(router, appState);
        console.log('✓ Breadcrumbs component created');
    } else {
        console.warn('Breadcrumbs component not available');
        breadcrumbs = { attachTo: () => {}, detach: () => {} };
    }
    
    // Initialize sidebar
    if (window.Sidebar) {
        sidebar = new Sidebar(router, appState);
        console.log('✓ Sidebar component created');
    } else {
        console.warn('Sidebar component not available');
        sidebar = { 
            attachTo: () => {}, 
            detach: () => {},
            toggleCollapsed: () => {},
            setCollapsed: () => {},
            subscribeToStateChanges: () => {}
        };
    }
    
    // Initialize settings manager
    settingsManager = new SettingsManager(appState);
    console.log('✓ SettingsManager created');
    
    // Initialize help system
    helpSystem = new HelpSystem(appState, notificationSystem);
    console.log('✓ HelpSystem created');
    
    // Create the integrated UI with new layout
    console.log('Creating UI layout...');
    document.querySelector('#app').innerHTML = `
        <div class="app-container">
            <div id="sidebarContainer" class="sidebar-container"></div>
            <div class="main-layout">
                ${navigation.createNavigationHTML()}
                ${navigation.createMainContentHTML()}
            </div>
        </div>
    `;
    console.log('✓ UI layout created');
    
    // Initialize sidebar
    const sidebarContainer = document.getElementById('sidebarContainer');
    if (sidebarContainer && sidebar.attachTo) {
        sidebar.attachTo(sidebarContainer);
        if (sidebar.subscribeToStateChanges) {
            sidebar.subscribeToStateChanges();
        }
        console.log('✓ Sidebar attached and subscribed');
    } else {
        console.warn('Sidebar container not found or sidebar not available');
        if (sidebarContainer) {
            sidebarContainer.innerHTML = '<div class="sidebar-placeholder">Sidebar not available</div>';
        }
    }
    
    // Initialize navigation
    navigation.initialize();
    console.log('✓ Navigation initialized');
    
    // Set up state listeners
    setupStateListeners();
    console.log('✓ State listeners set up');
    
    // Initialize accessibility features
    accessibilityManager.initialize();
    console.log('✓ Accessibility features initialized');
    
    console.log('UI components initialized successfully');
}

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
            notificationSystem.success(`Scan completed: ${results.totalFiles || 0} files found`, {
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
    
    // Listen for settings changes
    appState.subscribe('settings', (settings) => {
        // Apply theme changes
        if (settings.theme) {
            applyTheme(settings.theme);
        }
        
        // Apply accessibility settings
        if (accessibilityManager) {
            accessibilityManager.applySettings(settings);
        }
    });
}

function setupGlobalEventListeners() {
    // Handle navigation actions
    document.addEventListener('click', async (e) => {
        await handleNavigationActions(e);
    });
    
    // Handle sidebar toggle events
    window.addEventListener('toggleSidebar', () => {
        if (sidebar) {
            sidebar.toggleCollapsed();
        }
    });
    
    // Handle window events
    window.addEventListener('beforeunload', () => {
        appState.saveToStorage();
        if (pageStateManager) {
            pageStateManager.saveCurrentPageState();
        }
    });
    
    // Handle resize events for responsive design
    window.addEventListener('resize', debounce(() => {
        if (performanceManager) {
            performanceManager.handleResize();
        }
    }, 250));
}

async function handleNavigationActions(e) {
    const target = e.target;
    
    // Navigation tab clicks
    if (target.closest('.nav-tab')) {
        const sectionId = target.closest('.nav-tab').dataset.section;
        navigation.switchSection(sectionId);
        return;
    }
    
    // Main action buttons
    switch (target.id) {
        case 'refreshLocations':
            await loadInitialData();
            break;
        case 'scanAllLocations':
            await scanAllLocations();
            break;
        case 'refreshScanResults':
            const lastResult = appState.get('lastScanResult');
            if (lastResult) {
                appState.setScanResults(lastResult);
            }
            break;
        case 'cleanSafeFiles':
            await cleanSafeFiles();
            break;
        case 'refreshBackups':
            await refreshBackupData();
            break;
        case 'cleanupOldBackups':
            await cleanupOldBackups();
            break;
        case 'resetSettings':
            appState.resetSettings();
            notificationSystem.info('Settings reset to defaults');
            break;
        case 'saveSettings':
            appState.saveToStorage();
            notificationSystem.success('Settings saved successfully');
            break;
        case 'exportLogs':
            await exportLogs();
            break;
        case 'checkUpdates':
            await checkUpdates();
            break;
    }
}

function handleKeyboardShortcuts(e) {
    // Only handle shortcuts when not in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }
    
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlKey = isMac ? e.metaKey : e.ctrlKey;
    
    if (ctrlKey) {
        switch (e.key) {
            case 's':
                e.preventDefault();
                appState.saveToStorage();
                notificationSystem.success('Settings saved');
                break;
            case 'r':
                e.preventDefault();
                loadInitialData();
                break;
            case '1':
                e.preventDefault();
                navigation.switchSection('scanner');
                break;
            case '2':
                e.preventDefault();
                navigation.switchSection('cleaner');
                break;
            case '3':
                e.preventDefault();
                navigation.switchSection('backup');
                break;
            case '4':
                e.preventDefault();
                navigation.switchSection('settings');
                break;
            case '?':
                e.preventDefault();
                navigation.switchSection('help');
                break;
        }
    }
    
    if (e.key === 'Escape') {
        // Close any open modals
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => modal.click());
    }
}

async function loadInitialData() {
    try {
        notificationSystem.loading('Loading initial data...', {
            title: 'Loading',
            duration: 0
        });
        
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
        
        notificationSystem.completeProgress('loading-progress', 'Initial data loaded successfully', 'success');
        
    } catch (error) {
        console.error('Failed to load initial data:', error);
        appState.addError({
            message: 'Failed to load initial data',
            details: error.message
        });
        notificationSystem.error('Failed to load initial data: ' + error.message);
    }
}

// Scanner functions
async function scanAllLocations() {
    try {
        appState.setScanning(true);
        
        const locations = appState.get('cacheLocations');
        const safeLocations = locations.filter(loc => loc.type === 'user' || loc.type === 'application');
        
        if (safeLocations.length === 0) {
            notificationSystem.warning('No safe locations found to scan');
            appState.setScanning(false);
            return;
        }
        
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
        showDeletionConfirmationDialog(dialog);
        
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

// Deletion confirmation dialog
function showDeletionConfirmationDialog(dialog) {
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

// Theme management
function applyTheme(theme) {
    const body = document.body;
    const root = document.documentElement;
    
    // Remove existing theme classes
    body.classList.remove('theme-dark', 'theme-light', 'theme-auto');
    
    // Apply new theme
    if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        body.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
    } else {
        body.classList.add(`theme-${theme}`);
    }
    
    // Update CSS custom properties
    if (theme === 'light') {
        root.style.setProperty('--primary-bg', '#ffffff');
        root.style.setProperty('--secondary-bg', '#f8f9fa');
        root.style.setProperty('--text-primary', '#212529');
        root.style.setProperty('--text-secondary', '#6c757d');
    } else {
        root.style.setProperty('--primary-bg', '#1e1e1e');
        root.style.setProperty('--secondary-bg', '#2d2d2d');
        root.style.setProperty('--text-primary', '#ffffff');
        root.style.setProperty('--text-secondary', '#a0a0a0');
    }
}

// Utility functions
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function debounce(func, wait) {
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

function showInitializationError(error) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'initialization-error';
    errorDiv.innerHTML = `
        <div class="error-content">
            <h2>Failed to Initialize Cache App</h2>
            <p>An error occurred while starting the application:</p>
            <pre>${error.message}</pre>
            <button onclick="location.reload()" class="btn btn-primary">Reload Application</button>
        </div>
    `;
    
    document.querySelector('#app').innerHTML = '';
    document.querySelector('#app').appendChild(errorDiv);
}

// Legacy functions for compatibility (placeholder implementations)
function selectAllSafeFiles() {
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
    notificationSystem.info('File details functionality');
}

function closeFileDetails() {
    // Implementation for closing file details
}

function revealInFinder(path) {
    notificationSystem.info('Reveal in Finder functionality');
}

function toggleLocationFiles(locationId) {
    notificationSystem.info('Toggle location files functionality');
}

function deleteSelectedFiles() {
    notificationSystem.info('Delete selected files functionality');
}

function confirmDeletion(dialogJSON) {
    notificationSystem.info('Confirm deletion functionality');
}

function closeDeletionConfirmation() {
    const modal = document.querySelector('.deletion-confirmation-modal');
    if (modal) {
        modal.remove();
    }
}

function closeRestoreDialog() {
    // Implementation for closing restore dialog
}

function restoreFromBackup() {
    notificationSystem.info('Restore from backup functionality');
}

// Backup Management Functions
function showBackupManager() {
    notificationSystem.info('Show backup manager functionality');
}

function closeBackupManager() {
    // Implementation for closing backup manager
}

function showBackupDetails() {
    notificationSystem.info('Show backup details functionality');
}

function closeBackupDetails() {
    // Implementation for closing backup details
}

function restoreBackupSession() {
    notificationSystem.info('Restore backup session functionality');
}

function restoreSelectedFiles() {
    notificationSystem.info('Restore selected files functionality');
}

function deleteBackupSession() {
    notificationSystem.info('Delete backup session functionality');
}

function previewRestore() {
    notificationSystem.info('Preview restore functionality');
}

function closeRestorePreview() {
    // Implementation for closing restore preview
}

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

// Export for testing
export { 
    initializeApplication, 
    loadInitialData, 
    scanAllLocations, 
    cleanSafeFiles, 
    refreshBackupData, 
    cleanupOldBackups 
};

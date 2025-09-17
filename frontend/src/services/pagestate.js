// Page State Management Service for Cache App
class PageStateManager {
    constructor(router, appState) {
        this.router = router;
        this.appState = appState;
        this.pageStates = new Map();
        this.currentPage = null;
        this.autoSave = true;
        this.saveInterval = 30000; // 30 seconds
        this.saveTimer = null;
        
        // Subscribe to route changes
        this.router.subscribe((currentRoute, previousRoute) => {
            this.handleRouteChange(currentRoute, previousRoute);
        });
        
        // Subscribe to app state changes
        this.appState.subscribe('selectedFiles', (selectedFiles) => {
            this.saveCurrentPageState();
        });
        
        this.appState.subscribe('fileFilters', (filters) => {
            this.saveCurrentPageState();
        });
        
        this.appState.subscribe('scanResults', (results) => {
            this.saveCurrentPageState();
        });
        
        // Set up auto-save
        this.setupAutoSave();
        
        // Handle page unload
        window.addEventListener('beforeunload', () => {
            this.saveCurrentPageState();
        });
    }
    
    handleRouteChange(currentRoute, previousRoute) {
        // Save previous page state
        if (previousRoute) {
            this.savePageState(previousRoute.name);
        }
        
        // Load new page state
        if (currentRoute) {
            this.loadPageState(currentRoute.name);
        }
        
        this.currentPage = currentRoute?.name || null;
    }
    
    savePageState(routeName) {
        if (!routeName) return;
        
        const state = this.extractPageState(routeName);
        this.pageStates.set(routeName, {
            ...state,
            timestamp: Date.now(),
            route: routeName
        });
        
        // Save to localStorage
        this.persistPageState(routeName, state);
    }
    
    saveCurrentPageState() {
        if (this.currentPage) {
            this.savePageState(this.currentPage);
        }
    }
    
    loadPageState(routeName) {
        if (!routeName) return null;
        
        // Try to load from memory first
        let state = this.pageStates.get(routeName);
        
        // If not in memory, try to load from localStorage
        if (!state) {
            state = this.loadPersistedPageState(routeName);
            if (state) {
                this.pageStates.set(routeName, state);
            }
        }
        
        // Apply the state
        if (state) {
            this.applyPageState(routeName, state);
        }
        
        return state;
    }
    
    extractPageState(routeName) {
        const state = {
            route: routeName,
            timestamp: Date.now()
        };
        
        switch (routeName) {
            case 'scanner':
                state.selectedLocation = this.getSelectedLocation();
                state.scanHistory = this.getScanHistory();
                break;
                
            case 'cleaner':
                state.selectedFiles = Array.from(this.appState.get('selectedFiles'));
                state.fileFilters = { ...this.appState.get('fileFilters') };
                state.viewMode = this.getViewMode();
                state.sortBy = this.getSortBy();
                state.sortOrder = this.getSortOrder();
                break;
                
            case 'backup':
                state.selectedSessions = this.getSelectedBackupSessions();
                state.backupFilters = this.getBackupFilters();
                state.viewMode = this.getBackupViewMode();
                break;
                
            case 'settings':
                state.activeTab = this.getSettingsActiveTab();
                state.unsavedChanges = this.getUnsavedSettings();
                break;
                
            case 'help':
                state.activeSection = this.getHelpActiveSection();
                state.searchQuery = this.getHelpSearchQuery();
                break;
        }
        
        return state;
    }
    
    applyPageState(routeName, state) {
        switch (routeName) {
            case 'scanner':
                this.applyScannerState(state);
                break;
                
            case 'cleaner':
                this.applyCleanerState(state);
                break;
                
            case 'backup':
                this.applyBackupState(state);
                break;
                
            case 'settings':
                this.applySettingsState(state);
                break;
                
            case 'help':
                this.applyHelpState(state);
                break;
        }
    }
    
    applyScannerState(state) {
        if (state.selectedLocation) {
            this.setSelectedLocation(state.selectedLocation);
        }
        
        if (state.scanHistory) {
            this.setScanHistory(state.scanHistory);
        }
    }
    
    applyCleanerState(state) {
        if (state.selectedFiles) {
            const selectedFiles = new Set(state.selectedFiles);
            this.appState.set('selectedFiles', selectedFiles);
        }
        
        if (state.fileFilters) {
            this.appState.set('fileFilters', state.fileFilters);
        }
        
        if (state.viewMode) {
            this.setViewMode(state.viewMode);
        }
        
        if (state.sortBy) {
            this.setSortBy(state.sortBy);
        }
        
        if (state.sortOrder) {
            this.setSortOrder(state.sortOrder);
        }
    }
    
    applyBackupState(state) {
        if (state.selectedSessions) {
            this.setSelectedBackupSessions(state.selectedSessions);
        }
        
        if (state.backupFilters) {
            this.setBackupFilters(state.backupFilters);
        }
        
        if (state.viewMode) {
            this.setBackupViewMode(state.viewMode);
        }
    }
    
    applySettingsState(state) {
        if (state.activeTab) {
            this.setSettingsActiveTab(state.activeTab);
        }
        
        if (state.unsavedChanges) {
            this.setUnsavedSettings(state.unsavedChanges);
        }
    }
    
    applyHelpState(state) {
        if (state.activeSection) {
            this.setHelpActiveSection(state.activeSection);
        }
        
        if (state.searchQuery) {
            this.setHelpSearchQuery(state.searchQuery);
        }
    }
    
    // State getters and setters for each page
    getSelectedLocation() {
        const locationSelect = document.getElementById('locationSelect');
        return locationSelect ? locationSelect.value : null;
    }
    
    setSelectedLocation(location) {
        const locationSelect = document.getElementById('locationSelect');
        if (locationSelect) {
            locationSelect.value = location;
        }
    }
    
    getScanHistory() {
        return this.appState.get('scanHistory') || [];
    }
    
    setScanHistory(history) {
        this.appState.set('scanHistory', history);
    }
    
    getViewMode() {
        const viewModeToggle = document.querySelector('.view-mode-toggle .active');
        return viewModeToggle ? viewModeToggle.dataset.mode : 'list';
    }
    
    setViewMode(mode) {
        const toggle = document.querySelector(`[data-mode="${mode}"]`);
        if (toggle) {
            document.querySelectorAll('.view-mode-toggle button').forEach(btn => btn.classList.remove('active'));
            toggle.classList.add('active');
        }
    }
    
    getSortBy() {
        const sortSelect = document.getElementById('sortBy');
        return sortSelect ? sortSelect.value : 'name';
    }
    
    setSortBy(sortBy) {
        const sortSelect = document.getElementById('sortBy');
        if (sortSelect) {
            sortSelect.value = sortBy;
        }
    }
    
    getSortOrder() {
        const orderButton = document.querySelector('.sort-order-button');
        return orderButton ? orderButton.dataset.order : 'asc';
    }
    
    setSortOrder(order) {
        const orderButton = document.querySelector('.sort-order-button');
        if (orderButton) {
            orderButton.dataset.order = order;
            orderButton.textContent = order === 'asc' ? '↑' : '↓';
        }
    }
    
    getSelectedBackupSessions() {
        return Array.from(document.querySelectorAll('.backup-session.selected')).map(el => el.dataset.sessionId);
    }
    
    setSelectedBackupSessions(sessionIds) {
        document.querySelectorAll('.backup-session').forEach(el => {
            el.classList.toggle('selected', sessionIds.includes(el.dataset.sessionId));
        });
    }
    
    getBackupFilters() {
        return {
            search: document.getElementById('backupSearch')?.value || '',
            filter: document.getElementById('backupFilter')?.value || 'all'
        };
    }
    
    setBackupFilters(filters) {
        const searchInput = document.getElementById('backupSearch');
        const filterSelect = document.getElementById('backupFilter');
        
        if (searchInput) searchInput.value = filters.search || '';
        if (filterSelect) filterSelect.value = filters.filter || 'all';
    }
    
    getBackupViewMode() {
        const viewToggle = document.querySelector('.backup-view-toggle .active');
        return viewToggle ? viewToggle.dataset.mode : 'grid';
    }
    
    setBackupViewMode(mode) {
        const toggle = document.querySelector(`[data-mode="${mode}"]`);
        if (toggle) {
            document.querySelectorAll('.backup-view-toggle button').forEach(btn => btn.classList.remove('active'));
            toggle.classList.add('active');
        }
    }
    
    getSettingsActiveTab() {
        const activeTab = document.querySelector('.settings-tab.active');
        return activeTab ? activeTab.dataset.tab : 'general';
    }
    
    setSettingsActiveTab(tab) {
        const tabElement = document.querySelector(`[data-tab="${tab}"]`);
        if (tabElement) {
            document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
            tabElement.classList.add('active');
        }
    }
    
    getUnsavedSettings() {
        return this.appState.get('unsavedSettings') || {};
    }
    
    setUnsavedSettings(settings) {
        this.appState.set('unsavedSettings', settings);
    }
    
    getHelpActiveSection() {
        const activeSection = document.querySelector('.help-section.active');
        return activeSection ? activeSection.dataset.section : 'getting-started';
    }
    
    setHelpActiveSection(section) {
        const sectionElement = document.querySelector(`[data-section="${section}"]`);
        if (sectionElement) {
            document.querySelectorAll('.help-section').forEach(s => s.classList.remove('active'));
            sectionElement.classList.add('active');
        }
    }
    
    getHelpSearchQuery() {
        const searchInput = document.getElementById('helpSearch');
        return searchInput ? searchInput.value : '';
    }
    
    setHelpSearchQuery(query) {
        const searchInput = document.getElementById('helpSearch');
        if (searchInput) {
            searchInput.value = query;
        }
    }
    
    // Persistence methods
    persistPageState(routeName, state) {
        try {
            const key = `pageState_${routeName}`;
            localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(`Failed to persist page state for ${routeName}:`, error);
        }
    }
    
    loadPersistedPageState(routeName) {
        try {
            const key = `pageState_${routeName}`;
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error(`Failed to load persisted page state for ${routeName}:`, error);
            return null;
        }
    }
    
    clearPersistedPageState(routeName) {
        try {
            const key = `pageState_${routeName}`;
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Failed to clear persisted page state for ${routeName}:`, error);
        }
    }
    
    clearAllPersistedPageStates() {
        try {
            const keys = Object.keys(localStorage).filter(key => key.startsWith('pageState_'));
            keys.forEach(key => localStorage.removeItem(key));
        } catch (error) {
            console.error('Failed to clear all persisted page states:', error);
        }
    }
    
    setupAutoSave() {
        if (this.autoSave) {
            this.saveTimer = setInterval(() => {
                this.saveCurrentPageState();
            }, this.saveInterval);
        }
    }
    
    stopAutoSave() {
        if (this.saveTimer) {
            clearInterval(this.saveTimer);
            this.saveTimer = null;
        }
    }
    
    // Public API
    getPageState(routeName) {
        return this.pageStates.get(routeName);
    }
    
    getAllPageStates() {
        return Array.from(this.pageStates.values());
    }
    
    clearPageState(routeName) {
        this.pageStates.delete(routeName);
        this.clearPersistedPageState(routeName);
    }
    
    clearAllPageStates() {
        this.pageStates.clear();
        this.clearAllPersistedPageStates();
    }
    
    exportPageStates() {
        const states = {};
        this.pageStates.forEach((state, routeName) => {
            states[routeName] = state;
        });
        return states;
    }
    
    importPageStates(states) {
        Object.entries(states).forEach(([routeName, state]) => {
            this.pageStates.set(routeName, state);
            this.persistPageState(routeName, state);
        });
    }
    
    // Utility methods
    getStateSize() {
        return this.pageStates.size;
    }
    
    getOldestState() {
        let oldest = null;
        let oldestTime = Infinity;
        
        this.pageStates.forEach((state, routeName) => {
            if (state.timestamp < oldestTime) {
                oldestTime = state.timestamp;
                oldest = { routeName, state };
            }
        });
        
        return oldest;
    }
    
    cleanupOldStates(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days
        const cutoff = Date.now() - maxAge;
        
        this.pageStates.forEach((state, routeName) => {
            if (state.timestamp < cutoff) {
                this.clearPageState(routeName);
            }
        });
    }
}

// Create global page state manager instance
window.pageStateManager = new PageStateManager(window.router, window.appState);

// Export for use in other modules
export { PageStateManager };
window.PageStateManager = PageStateManager;

// Performance Management Component for Cache App
class PerformanceManager {
    constructor(appState, notificationSystem) {
        this.appState = appState;
        this.notificationSystem = notificationSystem;
        this.workerPool = [];
        this.maxWorkers = navigator.hardwareConcurrency || 4;
        this.taskQueue = [];
        this.isProcessing = false;
        this.performanceMetrics = {
            scanTime: 0,
            filesProcessed: 0,
            memoryUsage: 0,
            cpuUsage: 0
        };
    }
    
    // Initialize performance monitoring
    initialize() {
        this.setupPerformanceMonitoring();
        this.setupMemoryManagement();
        this.setupVirtualScrolling();
        this.setupLazyLoading();
    }
    
    setupPerformanceMonitoring() {
        // Monitor memory usage
        if ('memory' in performance) {
            setInterval(() => {
                this.performanceMetrics.memoryUsage = performance.memory.usedJSHeapSize;
                this.checkMemoryUsage();
            }, 5000);
        }
        
        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 50) { // Tasks longer than 50ms
                        this.handleLongTask(entry);
                    }
                }
            });
            
            try {
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                console.warn('Long task monitoring not supported');
            }
        }
    }
    
    setupMemoryManagement() {
        // Implement memory cleanup strategies
        this.setupGarbageCollection();
        this.setupCacheManagement();
    }
    
    setupGarbageCollection() {
        // Clean up unused DOM elements
        setInterval(() => {
            this.cleanupUnusedElements();
        }, 30000); // Every 30 seconds
        
        // Clean up event listeners
        setInterval(() => {
            this.cleanupEventListeners();
        }, 60000); // Every minute
    }
    
    setupCacheManagement() {
        // Implement LRU cache for file data
        this.fileCache = new Map();
        this.maxCacheSize = 1000; // Maximum cached files
        
        // Clean cache periodically
        setInterval(() => {
            this.cleanupCache();
        }, 120000); // Every 2 minutes
    }
    
    setupVirtualScrolling() {
        this.virtualScrollConfig = {
            itemHeight: 40,
            containerHeight: 400,
            bufferSize: 10
        };
    }
    
    setupLazyLoading() {
        // Intersection Observer for lazy loading
        if ('IntersectionObserver' in window) {
            this.lazyLoadObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadLazyContent(entry.target);
                    }
                });
            }, {
                rootMargin: '50px'
            });
        }
    }
    
    // Optimize large file lists with virtual scrolling
    createVirtualScrollContainer(items, renderItem, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const totalHeight = items.length * this.virtualScrollConfig.itemHeight;
        const visibleCount = Math.ceil(this.virtualScrollConfig.containerHeight / this.virtualScrollConfig.itemHeight);
        
        container.innerHTML = `
            <div class="virtual-scroll-container" style="height: ${this.virtualScrollConfig.containerHeight}px; overflow-y: auto;">
                <div class="virtual-scroll-content" style="height: ${totalHeight}px; position: relative;">
                    <div class="virtual-scroll-items"></div>
                </div>
            </div>
        `;
        
        const scrollContainer = container.querySelector('.virtual-scroll-container');
        const itemsContainer = container.querySelector('.virtual-scroll-items');
        
        let startIndex = 0;
        let endIndex = Math.min(startIndex + visibleCount + this.virtualScrollConfig.bufferSize, items.length);
        
        const updateVisibleItems = () => {
            const scrollTop = scrollContainer.scrollTop;
            startIndex = Math.floor(scrollTop / this.virtualScrollConfig.itemHeight);
            endIndex = Math.min(startIndex + visibleCount + this.virtualScrollConfig.bufferSize, items.length);
            
            // Clear and render visible items
            itemsContainer.innerHTML = '';
            
            for (let i = startIndex; i < endIndex; i++) {
                const item = items[i];
                const itemElement = renderItem(item, i);
                itemElement.style.position = 'absolute';
                itemElement.style.top = `${i * this.virtualScrollConfig.itemHeight}px`;
                itemElement.style.height = `${this.virtualScrollConfig.itemHeight}px`;
                itemsContainer.appendChild(itemElement);
            }
        };
        
        scrollContainer.addEventListener('scroll', this.throttle(updateVisibleItems, 16)); // 60fps
        updateVisibleItems();
    }
    
    // Debounce function for performance
    debounce(func, wait) {
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
    
    // Throttle function for performance
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Optimize file rendering with batching
    renderFilesBatch(files, containerId, batchSize = 50) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // If a virtual scroll container exists inside, append rendered items there
        const virtualItemsContainer = container.querySelector && (container.querySelector('.virtual-scroll-items') || container.querySelector('.virtual-scroll-container') ? container.querySelector('.virtual-scroll-items') : null);
        const appendTarget = virtualItemsContainer || container;
        
        let currentIndex = 0;
        
        const renderBatch = () => {
            const fragment = document.createDocumentFragment();
            const endIndex = Math.min(currentIndex + batchSize, files.length);
            
            for (let i = currentIndex; i < endIndex; i++) {
                const file = this._normalizeFile(files[i]);
                const fileElement = this.createFileElement(file);
                fragment.appendChild(fileElement);
            }
            
            appendTarget.appendChild(fragment);
            currentIndex = endIndex;
            
            if (currentIndex < files.length) {
                // Use requestAnimationFrame for smooth rendering
                requestAnimationFrame(renderBatch);
            } else {
                if (this.notificationSystem && typeof this.notificationSystem.success === 'function') {
                    this.notificationSystem.success(`Rendered ${files.length} files`, {
                        title: 'Rendering Complete',
                        duration: 2000
                    });
                }
            }
        };
        
        renderBatch();
    }
    
    // Normalize file object coming from various backends to a common shape
    _normalizeFile(raw) {
        if (!raw || typeof raw !== 'object') return {
            name: String(raw || ''),
            size: 0,
            is_dir: false,
            last_modified: Date.now()
        };
        const file = Object.assign({}, raw);
        // Support alternate field names
        file.name = file.name || file.filename || file.fileName || file.title || '';
        file.size = typeof file.size === 'number' ? file.size : (typeof file.bytes === 'number' ? file.bytes : (parseInt(file.size, 10) || 0));
        file.is_dir = (typeof file.is_dir === 'boolean') ? file.is_dir : (typeof file.isDir === 'boolean' ? file.isDir : !!file.directory);
        file.last_modified = file.last_modified || file.lastModified || file.modified || Date.now();
        return file;
    }
    
    createFileElement(file) {
        const element = document.createElement('div');
        element.className = 'file-item';
        // Attach dataset for easier debugging / selection
        try {
            element.dataset.name = file.name || '';
            element.dataset.size = String(file.size || 0);
        } catch (e) { /* ignore */ }
        
        const isDir = !!file.is_dir;
        const displayName = file.name || '[Unnamed]';
        const sizeDisplay = (isDir || !file.size) ? (isDir ? '—' : this.formatBytes(file.size || 0)) : this.formatBytes(file.size || 0);
        let modifiedDisplay = '';
        try {
            const ts = (typeof file.last_modified === 'number' || typeof file.last_modified === 'string') ? new Date(file.last_modified) : (file.last_modified instanceof Date ? file.last_modified : new Date());
            modifiedDisplay = isNaN(ts.getTime()) ? '' : ts.toLocaleDateString();
        } catch (e) {
            modifiedDisplay = '';
        }

        element.innerHTML = `
            <div class="file-icon">${isDir ? '📁' : '📄'}</div>
            <div class="file-name">${this._escapeHtml(displayName)}</div>
            <div class="file-size">${sizeDisplay}</div>
            <div class="file-modified">${modifiedDisplay}</div>
        `;
        return element;
    }

    // Small helper to escape HTML in file names to avoid injection issues
    _escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, function (m) {
            return ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            })[m];
        });
    }
    
    // Background processing for large operations
    processInBackground(task, progressCallback, completionCallback) {
        return new Promise((resolve, reject) => {
            const worker = new Worker(this.createWorkerScript(task));
            
            worker.onmessage = (e) => {
                const { type, data } = e.data;
                
                switch (type) {
                    case 'progress':
                        progressCallback(data);
                        break;
                    case 'result':
                        completionCallback(data);
                        worker.terminate();
                        resolve(data);
                        break;
                    case 'error':
                        worker.terminate();
                        reject(new Error(data));
                        break;
                }
            };
            
            worker.onerror = (error) => {
                worker.terminate();
                reject(error);
            };
        });
    }
    
    createWorkerScript(task) {
        // Create a worker script for background processing
        const script = `
            self.onmessage = function(e) {
                const { task, data } = e.data;
                
                try {
                    switch (task) {
                        case 'scanFiles':
                            self.scanFiles(data);
                            break;
                        case 'classifyFiles':
                            self.classifyFiles(data);
                            break;
                        default:
                            throw new Error('Unknown task: ' + task);
                    }
                } catch (error) {
                    self.postMessage({ type: 'error', data: error.message });
                }
            };
            
            function scanFiles(data) {
                // Simulate file scanning
                const files = data.files || [];
                let processed = 0;
                
                const interval = setInterval(() => {
                    processed += 10;
                    const progress = Math.min(processed / files.length * 100, 100);
                    
                    self.postMessage({ 
                        type: 'progress', 
                        data: { progress, processed, total: files.length }
                    });
                    
                    if (processed >= files.length) {
                        clearInterval(interval);
                        self.postMessage({ 
                            type: 'result', 
                            data: { files: files.slice(0, processed) }
                        });
                    }
                }, 100);
            }
            
            function classifyFiles(data) {
                // Simulate file classification
                const files = data.files || [];
                const classified = files.map(file => ({
                    ...file,
                    safetyLevel: Math.random() > 0.5 ? 'Safe' : 'Caution'
                }));
                
                self.postMessage({ 
                    type: 'result', 
                    data: { files: classified }
                });
            }
        `;
        
        const blob = new Blob([script], { type: 'application/javascript' });
        return URL.createObjectURL(blob);
    }
    
    // Memory management
    checkMemoryUsage() {
        const memoryUsage = this.performanceMetrics.memoryUsage;
        const memoryLimit = 100 * 1024 * 1024; // 100MB limit
        
        if (memoryUsage > memoryLimit) {
            this.notificationSystem.warning('High memory usage detected. Cleaning up...', {
                title: 'Memory Warning',
                duration: 3000
            });
            
            this.performMemoryCleanup();
        }
    }
    
    performMemoryCleanup() {
        // Clear file cache
        this.fileCache.clear();
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
        
        // Clean up unused DOM elements
        this.cleanupUnusedElements();
        
        this.notificationSystem.success('Memory cleanup completed', {
            title: 'Cleanup Complete',
            duration: 2000
        });
    }
    
    cleanupUnusedElements() {
        // Remove hidden modals
        const hiddenModals = document.querySelectorAll('.modal-overlay:not(.active)');
        hiddenModals.forEach(modal => {
            if (Date.now() - modal.dataset.created > 300000) { // 5 minutes
                modal.remove();
            }
        });
        
        // Remove old notifications
        const oldNotifications = document.querySelectorAll('.notification');
        oldNotifications.forEach(notification => {
            if (Date.now() - notification.dataset.created > 600000) { // 10 minutes
                notification.remove();
            }
        });
    }
    
    cleanupEventListeners() {
        // Remove orphaned event listeners
        const elements = document.querySelectorAll('[data-listener-count]');
        elements.forEach(element => {
            const count = parseInt(element.dataset.listenerCount);
            if (count > 10) { // Too many listeners
                element.replaceWith(element.cloneNode(true));
            }
        });
    }
    
    cleanupCache() {
        if (this.fileCache.size > this.maxCacheSize) {
            // Remove oldest entries
            const entries = Array.from(this.fileCache.entries());
            const toRemove = entries.slice(0, entries.length - this.maxCacheSize);
            
            toRemove.forEach(([key]) => {
                this.fileCache.delete(key);
            });
        }
    }
    
    // Lazy loading
    loadLazyContent(element) {
        const dataSrc = element.dataset.src;
        if (dataSrc) {
            // Load content from data source
            element.innerHTML = 'Loading...';
            
            // Simulate loading
            setTimeout(() => {
                element.innerHTML = `Loaded content from ${dataSrc}`;
                element.classList.add('loaded');
            }, 1000);
        }
        
        this.lazyLoadObserver.unobserve(element);
    }
    
    // Handle long tasks
    handleLongTask(entry) {
        console.warn(`Long task detected: ${entry.duration}ms`);
        
        if (entry.duration > 100) { // Very long task
            this.notificationSystem.warning(`Long task detected (${entry.duration.toFixed(0)}ms). Consider optimizing.`, {
                title: 'Performance Warning',
                duration: 5000
            });
        }
    }
    
    // Performance metrics
    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            cacheSize: this.fileCache.size,
            taskQueueLength: this.taskQueue.length,
            isProcessing: this.isProcessing
        };
    }
    
    // Format bytes for display
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Optimize search with indexing
    createSearchIndex(items, fields) {
        const index = new Map();
        
        items.forEach((item, i) => {
            fields.forEach(field => {
                const value = item[field];
                if (value) {
                    const words = value.toLowerCase().split(/\s+/);
                    words.forEach(word => {
                        if (!index.has(word)) {
                            index.set(word, []);
                        }
                        index.get(word).push(i);
                    });
                }
            });
        });
        
        return index;
    }
    
    searchWithIndex(query, index, items) {
        const words = query.toLowerCase().split(/\s+/);
        const results = new Set();
        
        words.forEach(word => {
            if (index.has(word)) {
                index.get(word).forEach(i => results.add(i));
            }
        });
        
        return Array.from(results).map(i => items[i]);
    }
    
    // Batch operations
    batchOperation(items, operation, batchSize = 100) {
        return new Promise((resolve, reject) => {
            const results = [];
            let currentIndex = 0;
            
            const processBatch = () => {
                const endIndex = Math.min(currentIndex + batchSize, items.length);
                const batch = items.slice(currentIndex, endIndex);
                
                try {
                    const batchResults = operation(batch);
                    results.push(...batchResults);
                    currentIndex = endIndex;
                    
                    if (currentIndex < items.length) {
                        setTimeout(processBatch, 0); // Yield to browser
                    } else {
                        resolve(results);
                    }
                } catch (error) {
                    reject(error);
                }
            };
            
            processBatch();
        });
    }

    // Handle window resize events. Provide a safe, no-op implementation that updates
    // any virtual scroll sizing and triggers a debounced onResize hook if provided.
    handleResize() {
        try {
            // Update virtual scroll container height heuristically if config exists
            if (this.virtualScrollConfig && typeof window !== 'undefined') {
                // Keep a sensible minimum and base on viewport height
                const viewportHeight = window.innerHeight || 800;
                // Use roughly half the viewport or existing value, whichever is larger than minimum
                const newHeight = Math.max(200, Math.floor(viewportHeight * 0.5));
                this.virtualScrollConfig.containerHeight = newHeight;
            }

            // If a consumer has attached an onResize handler (for reflowing UI), call it
            if (typeof this.onResize === 'function') {
                // Prefer a debounced call if debounce is available
                if (typeof this.debounce === 'function') {
                    const fn = this.debounce(() => {
                        try { this.onResize(); } catch (e) { console.warn('onResize handler failed', e); }
                    }, 150);
                    fn();
                } else {
                    try { this.onResize(); } catch (e) { console.warn('onResize handler failed', e); }
                }
            }

            // Also perform light-weight cleanup or recalculation if needed
            if (typeof this.cleanupUnusedElements === 'function') {
                // Run cleanup asynchronously so resize handling stays responsive
                setTimeout(() => { try { this.cleanupUnusedElements(); } catch (e) { /* ignore */ } }, 200);
            }
        } catch (e) {
            console.warn('PerformanceManager.handleResize error:', e);
        }
    }

}

// Export for use in other modules
export { PerformanceManager };
window.PerformanceManager = PerformanceManager;

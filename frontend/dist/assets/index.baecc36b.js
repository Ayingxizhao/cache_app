(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const l of o.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&a(l)}).observe(document,{childList:!0,subtree:!0});function t(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerpolicy&&(o.referrerPolicy=n.referrerpolicy),n.crossorigin==="use-credentials"?o.credentials="include":n.crossorigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(n){if(n.ep)return;n.ep=!0;const o=t(n);fetch(n.href,o)}})();function de(e){return window.go.main.App.CleanupBackupsByAge(e)}function ue(e,s,t,a,n){return window.go.main.App.ConfirmDeletion(e,s,t,a,n)}function pe(e){return window.go.main.App.DeleteBackupSession(e)}function fe(e,s,t,a){return window.go.main.App.DeleteFilesWithConfirmation(e,s,t,a)}function ve(){return window.go.main.App.GetAvailableBackups()}function M(){return window.go.main.App.GetBackupBrowserData()}function me(e){return window.go.main.App.GetBackupSessionDetails(e)}function T(){return window.go.main.App.GetCacheLocationsFromConfig()}function ye(e){return window.go.main.App.GetDeletionProgress(e)}function ge(){return window.go.main.App.GetLastScanResult()}function be(){return window.go.main.App.GetSettings()}function he(){return window.go.main.App.GetSystemInfo()}function Se(){return window.go.main.App.IsScanning()}function we(e,s){return window.go.main.App.PreviewRestoreOperation(e,s)}function ke(){return window.go.main.App.ResetSettings()}function $e(e,s){return window.go.main.App.RestoreFromBackup(e,s)}function O(e,s,t,a){return window.go.main.App.RestoreFromBackupWithOptions(e,s,t,a)}function Be(e){return window.go.main.App.RevealInFinder(e)}function Fe(e,s,t){return window.go.main.App.ScanCacheLocation(e,s,t)}function Le(e){return window.go.main.App.ScanMultipleCacheLocations(e)}function Ce(){return window.go.main.App.StopScan()}function De(e){return window.go.main.App.UpdateSettings(e)}function Ee(e,s){return window.go.main.App.ValidateFilesForDeletion(e,s)}let C=null,g=null,$=null;document.addEventListener("DOMContentLoaded",function(){Ae(),P(),xe(),window.selectAllSafeFiles=Pe,window.clearFileSelection=qe,window.showUndoOptions=Xe,window.showFileDetails=V,window.closeFileDetails=Oe,window.revealInFinder=W,window.toggleLocationFiles=U,window.deleteSelectedFiles=Je,window.confirmDeletion=Ve,window.closeDeletionConfirmation=Y,window.closeRestoreDialog=Z,window.restoreFromBackup=Ye,window.showBackupManager=ee,window.closeBackupManager=ts,window.refreshBackupData=R,window.showBackupDetails=as,window.closeBackupDetails=ls,window.restoreBackupSession=cs,window.restoreSelectedFiles=rs,window.deleteBackupSession=ds,window.cleanupOldBackups=us,window.previewRestore=ps,window.closeRestorePreview=vs});function Ae(){document.querySelector("#app").innerHTML=`
        <div class="app-container">
            <header class="app-header">
                <div class="header-content">
                    <div class="logo">
                        <div class="logo-icon">\u{1F5C2}\uFE0F</div>
                        <div class="logo-text">
                            <h1>Cache App</h1>
                            <p>macOS Cache Cleaner & Scanner</p>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button id="settingsButton" class="btn btn-secondary">
                            <span class="btn-icon">\u2699\uFE0F</span>
                            Settings Modal
                        </button>
                        <button id="backupManagerButton" class="btn btn-secondary">
                            <span class="btn-icon">\u{1F4BE}</span>
                            Backup Manager
                        </button>
                        <button id="refreshButton" class="btn btn-outline">
                            <span class="btn-icon">\u{1F504}</span>
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
                                <div class="select-arrow">\u25BC</div>
                            </div>
                        </div>
                        
                        <div class="button-group">
                            <button id="scanButton" class="btn btn-primary">
                                <span class="btn-icon">\u{1F50D}</span>
                                Scan Selected Location
                            </button>
                            <button id="scanAllButton" class="btn btn-secondary">
                                <span class="btn-icon">\u{1F310}</span>
                                Scan All Safe Locations
                            </button>
                            <button id="stopButton" class="btn btn-danger" disabled>
                                <span class="btn-icon">\u23F9\uFE0F</span>
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
                        <div class="error-icon">\u26A0\uFE0F</div>
                        <div class="error-content">
                            <h4>Error</h4>
                            <p id="errorMessage"></p>
                        </div>
                        <button id="errorClose" class="error-close">\xD7</button>
                    </div>
                </div>
                
                <div class="results-section">
                    <div class="section-header">
                        <h2>Scan Results</h2>
                        <div class="results-actions">
                            <button id="exportButton" class="btn btn-outline" disabled>
                                <span class="btn-icon">\u{1F4CA}</span>
                                Export Results
                            </button>
                        </div>
                    </div>
                    
                    <div id="scanResults" class="scan-results">
                        <div class="empty-state">
                            <div class="empty-icon">\u{1F4C1}</div>
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
        
        <!-- Settings Modal -->
        <div id="settingsModal" class="modal-overlay" style="display: none;">
            <div class="modal-content settings-modal">
                <div class="modal-header">
                    <h2>Settings</h2>
                    <button id="closeSettingsModal" class="modal-close">\xD7</button>
                </div>
                <div class="modal-body">
                    <div class="settings-container">
                        <!-- Settings Navigation -->
                        <div class="settings-nav">
                            <button class="settings-category-btn active" data-category="backup">
                                <span class="icon">\u{1F4BE}</span>
                                Backup
                            </button>
                            <button class="settings-category-btn" data-category="safety">
                                <span class="icon">\u{1F6E1}\uFE0F</span>
                                Safety
                            </button>
                            <button class="settings-category-btn" data-category="performance">
                                <span class="icon">\u26A1</span>
                                Performance
                            </button>
                            <button class="settings-category-btn" data-category="privacy">
                                <span class="icon">\u{1F512}</span>
                                Privacy
                            </button>
                            <button class="settings-category-btn" data-category="ui">
                                <span class="icon">\u{1F3A8}</span>
                                Interface
                            </button>
                        </div>
                        
                        <!-- Settings Content -->
                        <div class="settings-content">
                            <!-- Backup Settings -->
                            <div id="backup-settings" class="settings-section active">
                                <h3>Backup Preferences</h3>
                                <form id="backup-form" class="settings-form">
                                    <div class="form-group">
                                        <label for="backup-retention">Retention Period (days)</label>
                                        <input type="number" id="backup-retention" name="retention_days" min="1" max="365" value="30">
                                    </div>
                                    <div class="form-group">
                                        <label for="backup-max-size">Max Backup Size (MB)</label>
                                        <input type="number" id="backup-max-size" name="max_backup_size_mb" min="100" max="10240" value="1024">
                                    </div>
                                    <div class="form-group">
                                        <label>
                                            <input type="checkbox" id="backup-auto-cleanup" name="auto_cleanup" checked>
                                            Enable Automatic Cleanup
                                        </label>
                                    </div>
                                    <div class="form-group">
                                        <label>
                                            <input type="checkbox" id="backup-compress" name="compress_backups" checked>
                                            Compress Backups
                                        </label>
                                    </div>
                                </form>
                            </div>
                            
                            <!-- Safety Settings -->
                            <div id="safety-settings" class="settings-section">
                                <h3>Safety Settings</h3>
                                <form id="safety-form" class="settings-form">
                                    <div class="form-group">
                                        <label for="safety-default-level">Default Safety Level</label>
                                        <select id="safety-default-level" name="default_safe_level">
                                            <option value="Safe">Safe</option>
                                            <option value="Caution">Caution</option>
                                            <option value="Risky">Risky</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>
                                            <input type="checkbox" id="safety-confirm-deletion" name="confirm_deletion" checked>
                                            Confirm File Deletion
                                        </label>
                                    </div>
                                    <div class="form-group">
                                        <label>
                                            <input type="checkbox" id="safety-show-warnings" name="show_safety_warnings" checked>
                                            Show Safety Warnings
                                        </label>
                                    </div>
                                </form>
                            </div>
                            
                            <!-- Performance Settings -->
                            <div id="performance-settings" class="settings-section">
                                <h3>Performance Settings</h3>
                                <form id="performance-form" class="settings-form">
                                    <div class="form-group">
                                        <label for="perf-scan-depth">Scan Depth</label>
                                        <input type="number" id="perf-scan-depth" name="scan_depth" min="1" max="20" value="5">
                                    </div>
                                    <div class="form-group">
                                        <label for="perf-concurrent-scans">Concurrent Scans</label>
                                        <input type="number" id="perf-concurrent-scans" name="concurrent_scans" min="1" max="10" value="3">
                                    </div>
                                    <div class="form-group">
                                        <label>
                                            <input type="checkbox" id="perf-show-progress" name="show_progress" checked>
                                            Show Progress Indicators
                                        </label>
                                    </div>
                                </form>
                            </div>
                            
                            <!-- Privacy Settings -->
                            <div id="privacy-settings" class="settings-section">
                                <h3>Privacy Settings</h3>
                                <form id="privacy-form" class="settings-form">
                                    <div class="form-group">
                                        <label>
                                            <input type="checkbox" id="privacy-enable-cloud-ai" name="enable_cloud_ai">
                                            Enable Cloud AI Features
                                        </label>
                                    </div>
                                    <div class="form-group">
                                        <label>
                                            <input type="checkbox" id="privacy-share-analytics" name="share_analytics">
                                            Share Analytics Data
                                        </label>
                                    </div>
                                    <div class="form-group">
                                        <label>
                                            <input type="checkbox" id="privacy-collect-error-logs" name="collect_error_logs" checked>
                                            Collect Error Logs
                                        </label>
                                    </div>
                                </form>
                            </div>
                            
                            <!-- UI Settings -->
                            <div id="ui-settings" class="settings-section">
                                <h3>Interface Settings</h3>
                                <form id="ui-form" class="settings-form">
                                    <div class="form-group">
                                        <label for="ui-theme">Theme</label>
                                        <select id="ui-theme" name="theme">
                                            <option value="light">Light</option>
                                            <option value="dark">Dark</option>
                                            <option value="auto">Auto</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="ui-font-size">Font Size</label>
                                        <input type="number" id="ui-font-size" name="font_size" min="8" max="24" value="14">
                                    </div>
                                    <div class="form-group">
                                        <label>
                                            <input type="checkbox" id="ui-show-notifications" name="show_notifications" checked>
                                            Show Notifications
                                        </label>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="saveSettings" class="btn btn-primary">Save Settings</button>
                    <button id="resetSettings" class="btn btn-secondary">Reset to Defaults</button>
                    <button id="closeSettingsModal2" class="btn btn-outline">Close</button>
                </div>
            </div>
        </div>
    `}async function P(){try{console.log("Initializing app..."),console.log("Loading cache locations...");const e=await T();console.log("Raw locations data:",e);const s=JSON.parse(e);console.log("Parsed locations data:",s),console.log("Number of locations:",s.length),Ie(s);const t=await he(),a=JSON.parse(t);_e(a),console.log("App initialization complete")}catch(e){console.error("Error initializing app:",e),c("Failed to initialize application: "+e.message)}}function xe(){const e=document.getElementById("scanButton"),s=document.getElementById("scanAllButton"),t=document.getElementById("stopButton"),a=document.getElementById("refreshButton"),n=document.getElementById("exportButton"),o=document.getElementById("errorClose"),l=document.getElementById("backupManagerButton");e&&e.addEventListener("click",q),s&&s.addEventListener("click",J),t&&t.addEventListener("click",async()=>{try{await Ce(),He(),b(!1),i("Scan stopped by user",!1)}catch(u){c("Failed to stop scan: "+u.message)}}),a&&a.addEventListener("click",P),n&&n.addEventListener("click",je),o&&o.addEventListener("click",D),l&&l.addEventListener("click",ee);const d=document.getElementById("settingsButton"),r=document.getElementById("settingsModal"),p=document.getElementById("closeSettingsModal"),y=document.getElementById("closeSettingsModal2"),h=document.getElementById("saveSettings"),w=document.getElementById("resetSettings");d&&d.addEventListener("click",ms),p&&p.addEventListener("click",x),y&&y.addEventListener("click",x),h&&h.addEventListener("click",bs),w&&w.addEventListener("click",hs),document.querySelectorAll(".settings-category-btn").forEach(u=>{u.addEventListener("click",f=>{gs(f.target.dataset.category)})}),r&&r.addEventListener("click",u=>{u.target===r&&x()}),document.addEventListener("click",function(u){if(u.target.classList.contains("btn-icon")&&u.target.getAttribute("title")==="View Details"){const f=u.target.closest(".file-row");if(f){const B=f.dataset.filePath,ae=f.querySelector(".file-name-text").textContent,ne=parseInt(f.dataset.fileSize),oe=f.dataset.fileType,ie=f.querySelector(".file-modified").textContent,le=f.querySelector(".file-accessed").textContent,ce=f.querySelector(".file-actions").getAttribute("data-permissions")||"",re=f.querySelector(".file-actions").getAttribute("data-safety")||"";V(B,ae,ne,ie,le,oe,ce,re)}}if(u.target.classList.contains("btn-icon")&&u.target.getAttribute("title")==="Reveal in Finder"){const f=u.target.closest(".file-row");if(f){const B=f.dataset.filePath;W(B)}}if(u.target.classList.contains("toggle-icon")||u.target.closest(".location-header")){const f=u.target.closest(".location-card");if(f){const B=f.dataset.locationId;U(B)}}})}function Ie(e){console.log("Populating locations dropdown with:",e);const s=document.getElementById("locationSelect");if(!s){console.error("Location dropdown element not found!");return}s.innerHTML="";const t=document.createElement("option");if(t.value="",t.textContent="Select a cache location...",s.appendChild(t),e&&e.length>0)e.forEach((a,n)=>{console.log(`Adding location ${n}:`,a);const o=document.createElement("option");o.value=JSON.stringify(a),o.textContent=`${a.name} (${a.type})`,s.appendChild(o)}),console.log(`Added ${e.length} locations to dropdown`);else{console.warn("No locations provided to populate dropdown");const a=document.createElement("option");a.value="",a.textContent="No cache locations available",s.appendChild(a)}}function _e(e){document.getElementById("osInfo").textContent=e.os,document.getElementById("appVersion").textContent=e.app_version,document.getElementById("goVersion").textContent=e.go_version,document.getElementById("lastUpdated").textContent=new Date(e.scan_time).toLocaleString()}async function q(){const e=document.getElementById("locationSelect"),s=e.options[e.selectedIndex];if(!s.value){c("Please select a cache location to scan");return}const t=JSON.parse(s.value);try{b(!0),i("Starting scan...",!0),$=Date.now();const a=await Fe(t.id,t.name,t.path),n=JSON.parse(a);n.status==="scan_started"?(i("Scan started in background...",!0),Ge()):(I(n),C=n,b(!1))}catch(a){console.error("Scan error:",a),c(`Scan failed: ${a.message}`,!0,()=>{D(),q()}),b(!1),i("Scan failed",!1)}}async function J(){try{b(!0),i("Starting full system scan...",!0),$=Date.now();const e=await T(),t=JSON.parse(e).filter(o=>o.type==="user"||o.type==="application");if(t.length===0){c("No safe cache locations found to scan"),b(!1),i("No locations to scan",!1);return}const a=await Le(JSON.stringify(t)),n=JSON.parse(a);I(n),C=n,b(!1),i("Scan completed!",!1)}catch(e){console.error("Full scan error:",e),c(`Full scan failed: ${e.message}`,!0,()=>{D(),J()}),b(!1),i("Scan failed",!1)}}function I(e){try{if(console.log("displayScanResult called with:",e),typeof e=="string")try{e=JSON.parse(e)}catch(a){console.error("Failed to parse result string:",a)}if(e){const a=JSON.stringify(e);console.log("Scan result size (bytes):",a.length),console.log("Scan result keys:",Object.keys(e))}const s=document.getElementById("scanResults"),t=document.getElementById("exportButton");if(!s){console.error("scanResults div not found!");return}e.locations?s.innerHTML=`
                <div class="results-summary">
                    <div class="summary-card">
                        <div class="summary-icon">\u{1F4CA}</div>
                        <div class="summary-content">
                            <h3>${e.total_locations}</h3>
                            <p>Locations Scanned</p>
                        </div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-icon">\u{1F4C1}</div>
                        <div class="summary-content">
                            <h3>${e.total_files.toLocaleString()}</h3>
                            <p>Total Files</p>
                        </div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-icon">\u{1F4BE}</div>
                        <div class="summary-content">
                            <h3>${v(e.total_size)}</h3>
                            <p>Total Size</p>
                        </div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-icon">\u23F1\uFE0F</div>
                        <div class="summary-content">
                            <h3>${E(e.scan_duration)}</h3>
                            <p>Scan Duration</p>
                        </div>
                    </div>
                </div>
                <div class="safety-summary">
                    <h3>Safety Analysis</h3>
                    <div class="safety-summary-grid">
                        <div class="safety-card safe-card">
                            <div class="safety-icon">\u2705</div>
                            <div class="safety-content">
                                <h4>${safetySummary.safeCount}</h4>
                                <p>Safe Files (${safetySummary.safePercentage}%)</p>
                                <span class="safety-size">${v(safetySummary.safeSize)}</span>
                            </div>
                        </div>
                        <div class="safety-card caution-card">
                            <div class="safety-icon">\u26A0\uFE0F</div>
                            <div class="safety-content">
                                <h4>${safetySummary.cautionCount}</h4>
                                <p>Caution Files (${safetySummary.cautionPercentage}%)</p>
                                <span class="safety-size">${v(safetySummary.cautionSize)}</span>
                            </div>
                        </div>
                        <div class="safety-card risky-card">
                            <div class="safety-icon">\u{1F6AB}</div>
                            <div class="safety-content">
                                <h4>${safetySummary.riskyCount}</h4>
                                <p>Risky Files (${safetySummary.riskyPercentage}%)</p>
                                <span class="safety-size">${v(safetySummary.riskySize)}</span>
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
                                <span class="search-icon">\u{1F50D}</span>
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
                                    <option value="Safe">\u2705 Safe</option>
                                    <option value="Caution">\u26A0\uFE0F Caution</option>
                                    <option value="Risky">\u{1F6AB} Risky</option>
                                </select>
                            </div>
                            <div class="bulk-actions">
                                <button id="selectAllSafeButton" class="btn btn-success" onclick="selectAllSafeFiles()">
                                    <span class="btn-icon">\u2705</span>
                                    Select All Safe Items
                                </button>
                                <button id="clearSelectionButton" class="btn btn-outline" onclick="clearFileSelection()">
                                    <span class="btn-icon">\u{1F532}</span>
                                    Clear Selection
                                </button>
                                <button id="undoButton" class="btn btn-secondary" onclick="showUndoOptions()">
                                    <span class="btn-icon">\u{1F504}</span>
                                    Undo/Restore
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="locations-results">
                        ${e.locations.map(a=>Re(a)).join("")}
                    </div>
                </div>
            `:s.innerHTML=`
                <div class="results-summary">
                    <div class="summary-card">
                        <div class="summary-icon">\u{1F4C1}</div>
                        <div class="summary-content">
                            <h3>${e.file_count.toLocaleString()}</h3>
                            <p>Files Found</p>
                        </div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-icon">\u{1F4BE}</div>
                        <div class="summary-content">
                            <h3>${v(e.total_size)}</h3>
                            <p>Total Size</p>
                        </div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-icon">\u23F1\uFE0F</div>
                        <div class="summary-content">
                            <h3>${E(e.scan_duration)}</h3>
                            <p>Scan Duration</p>
                        </div>
                    </div>
                </div>
                <div class="safety-summary">
                    <h3>Safety Analysis</h3>
                    <div class="safety-summary-grid">
                        <div class="safety-card safe-card">
                            <div class="safety-icon">\u2705</div>
                            <div class="safety-content">
                                <h4>${safetySummary.safeCount}</h4>
                                <p>Safe Files (${safetySummary.safePercentage}%)</p>
                                <span class="safety-size">${v(safetySummary.safeSize)}</span>
                            </div>
                        </div>
                        <div class="safety-card caution-card">
                            <div class="safety-icon">\u26A0\uFE0F</div>
                            <div class="safety-content">
                                <h4>${safetySummary.cautionCount}</h4>
                                <p>Caution Files (${safetySummary.cautionPercentage}%)</p>
                                <span class="safety-size">${v(safetySummary.cautionSize)}</span>
                            </div>
                        </div>
                        <div class="safety-card risky-card">
                            <div class="safety-icon">\u{1F6AB}</div>
                            <div class="safety-content">
                                <h4>${safetySummary.riskyCount}</h4>
                                <p>Risky Files (${safetySummary.riskyPercentage}%)</p>
                                <span class="safety-size">${v(safetySummary.riskySize)}</span>
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
                                <span class="search-icon">\u{1F50D}</span>
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
                                    <option value="Safe">\u2705 Safe</option>
                                    <option value="Caution">\u26A0\uFE0F Caution</option>
                                    <option value="Risky">\u{1F6AB} Risky</option>
                                </select>
                            </div>
                            <div class="bulk-actions">
                                <button id="selectAllSafeButton" class="btn btn-success" onclick="selectAllSafeFiles()">
                                    <span class="btn-icon">\u2705</span>
                                    Select All Safe Items
                                </button>
                                <button id="clearSelectionButton" class="btn btn-outline" onclick="clearFileSelection()">
                                    <span class="btn-icon">\u{1F532}</span>
                                    Clear Selection
                                </button>
                                <button id="undoButton" class="btn btn-secondary" onclick="showUndoOptions()">
                                    <span class="btn-icon">\u{1F504}</span>
                                    Undo/Restore
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="location-details">
                        <h4>${e.name}</h4>
                        <p class="location-path">${e.path}</p>
                        ${e.error?`<p class="error-text">Error: ${e.error}</p>`:""}
                        ${e.files?G(e.files,e.id):""}
                    </div>
                </div>
            `,Me(),t.disabled=!1}catch(s){console.error("Error rendering scan result:",s,e),c("An error occurred while rendering scan results. See console for details.")}}function Re(e){const s=e.files===void 0&&!e.error;return`
        <div class="location-card" data-location-id="${e.id}">
            <div class="location-header" onclick="toggleLocationFiles('${e.id}')">
                <div class="location-info">
                    <h4>${e.name}</h4>
                    <p class="location-path">${e.path}</p>
                </div>
                <div class="location-stats">
                    ${s?'<span class="stat loading-stat">Loading...</span>':`<span class="stat">${e.file_count.toLocaleString()} files</span>
                         <span class="stat">${v(e.total_size)}</span>
                         <span class="stat">${E(e.scan_duration)}</span>`}
                </div>
                <div class="location-toggle">
                    <span class="toggle-icon">\u25BC</span>
                </div>
            </div>
            <div class="location-files" id="files-${e.id}" style="display: none;">
                ${s?ze():e.files?G(e.files,e.id):'<p class="no-files">No files found</p>'}
            </div>
            ${e.error?`<div class="location-error">Error: ${e.error}</div>`:""}
        </div>
    `}function G(e,s){if(!e||e.length===0)return'<p class="no-files">No files found</p>';const t=500,n=[...e].sort((l,d)=>d.size-l.size).slice(0,t);let o="";return e.length>t&&(o=`<div class="file-table-warning">Showing first ${t} of ${e.length} files. Please refine your filters to see more.</div>`),`
        <div class="file-table-container">
            ${o}
            <table class="file-table" data-location-id="${s}">
                <thead>
                    <tr>
                        <th class="sortable" data-sort="name">Name <span class="sort-icon">\u2195</span></th>
                        <th class="sortable" data-sort="size">Size <span class="sort-icon">\u2195</span></th>
                        <th class="sortable" data-sort="modified">Modified <span class="sort-icon">\u2195</span></th>
                        <th class="sortable" data-sort="accessed">Accessed <span class="sort-icon">\u2195</span></th>
                        <th>Type</th>
                        <th class="sortable" data-sort="safety">Safety <span class="sort-icon">\u2195</span></th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${n.map(l=>Ne(l)).join("")}
                </tbody>
            </table>
        </div>
    `}function ze(){return`
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
                ${Array.from({length:5},()=>`
                    <div class="loading-row">
                        <div class="loading-cell"></div>
                        <div class="loading-cell"></div>
                        <div class="loading-cell"></div>
                        <div class="loading-cell"></div>
                        <div class="loading-cell"></div>
                        <div class="loading-cell"></div>
                    </div>
                `).join("")}
            </div>
        </div>
    `}function Ne(e){const s=e.is_dir,t=s?"\u{1F4C1}":"\u{1F4C4}",a=s?"Directory":"File",n=s?"-":v(e.size),o=new Date(e.last_modified).toLocaleDateString(),l=new Date(e.last_accessed).toLocaleDateString();let d="",r="",p="none";if(!s&&e.safety_classification){const y=e.safety_classification;p=String(y.level||""),console.log(`File ${e.name}: safety level = "${p}"`);const h=H(p),w=j(p);d=`
            <div class="safety-indicator" data-safety-level="${p}" title="${y.explanation||""}">
                <span class="safety-icon" style="color: ${w}">${h}</span>
                <span class="safety-confidence">${y.confidence||0}%</span>
            </div>
        `,r=`safety-${p.toLowerCase()}`}else s||console.log(`File ${e.name}: no safety classification`);return`
        <tr class="file-row ${r}" data-file-path="${e.path}" data-file-size="${e.size}" data-file-type="${a.toLowerCase()}" data-safety-level="${p||"none"}">
            <td class="file-name">
                <span class="file-icon">${t}</span>
                <span class="file-name-text" title="${e.path}">${e.name}</span>
            </td>
            <td class="file-size">${n}</td>
            <td class="file-modified">${o}</td>
            <td class="file-accessed">${l}</td>
            <td class="file-type">${a}</td>
            <td class="file-safety">
                ${d}
            </td>
            <td class="file-actions" data-permissions="${e.permissions}" data-safety="${e.safety_classification?JSON.stringify(e.safety_classification).replace(/'/g,"&#39;"):""}">
                <button class="btn-icon" title="View Details">
                    \u2139\uFE0F
                </button>
                <button class="btn-icon" title="Reveal in Finder">
                    \u{1F4C2}
                </button>
            </td>
        </tr>
    `}function H(e){switch(String(e||"").trim()){case"Safe":return"\u2705";case"Caution":return"\u26A0\uFE0F";case"Risky":return"\u{1F6AB}";default:return"\u2753"}}function j(e){switch(String(e||"").trim()){case"Safe":return"#30d158";case"Caution":return"#ff9500";case"Risky":return"#ff3b30";default:return"#a0a0a0"}}function z(e){switch(String(e||"").trim()){case"Safe":return 1;case"Caution":return 2;case"Risky":return 3;default:return 4}}function Me(){const e=document.getElementById("fileSearch");e&&e.addEventListener("input",A);const s=document.getElementById("sizeFilter"),t=document.getElementById("typeFilter"),a=document.getElementById("safetyFilter");s&&s.addEventListener("change",A),t&&t.addEventListener("change",A),a&&a.addEventListener("change",A),document.querySelectorAll(".sortable").forEach(n=>{n.addEventListener("click",()=>Te(n))})}function A(){var n,o,l,d;const e=((n=document.getElementById("fileSearch"))==null?void 0:n.value.toLowerCase())||"",s=((o=document.getElementById("sizeFilter"))==null?void 0:o.value)||"",t=((l=document.getElementById("typeFilter"))==null?void 0:l.value)||"",a=((d=document.getElementById("safetyFilter"))==null?void 0:d.value)||"";document.querySelectorAll(".file-row").forEach(r=>{const p=r.querySelector(".file-name-text").textContent.toLowerCase(),y=parseInt(r.dataset.fileSize),h=r.dataset.fileType,w=r.dataset.safetyLevel;let u=!0;if(e&&!p.includes(e)&&(u=!1),s){const f=y/1048576;s==="large"&&f<=10&&(u=!1),s==="medium"&&(f<=1||f>10)&&(u=!1),s==="small"&&f>=1&&(u=!1)}t&&h!==t&&(u=!1),a&&w!==a&&(u=!1),r.style.display=u?"":"none"})}function Te(e){const s=e.closest("table"),t=s.querySelector("tbody"),a=Array.from(t.querySelectorAll("tr")),n=e.dataset.sort,o=e.classList.contains("sort-asc");s.querySelectorAll(".sortable").forEach(l=>{l.classList.remove("sort-asc","sort-desc")}),e.classList.add(o?"sort-desc":"sort-asc"),a.sort((l,d)=>{let r,p;switch(n){case"name":r=l.querySelector(".file-name-text").textContent.toLowerCase(),p=d.querySelector(".file-name-text").textContent.toLowerCase();break;case"size":r=parseInt(l.dataset.fileSize),p=parseInt(d.dataset.fileSize);break;case"modified":r=new Date(l.querySelector(".file-modified").textContent),p=new Date(d.querySelector(".file-modified").textContent);break;case"accessed":r=new Date(l.querySelector(".file-accessed").textContent),p=new Date(d.querySelector(".file-accessed").textContent);break;case"safety":r=z(l.dataset.safetyLevel),p=z(d.dataset.safetyLevel);break;default:return 0}return r<p?o?1:-1:r>p?o?-1:1:0}),a.forEach(l=>t.appendChild(l))}function U(e){const s=document.getElementById(`files-${e}`),t=document.querySelector(`[data-location-id="${e}"] .toggle-icon`);s.style.display==="none"?(s.style.display="block",t.textContent="\u25B2"):(s.style.display="none",t.textContent="\u25BC")}function V(e,s,t,a,n,o,l,d=""){console.log("showFileDetails called with:",{path:e,name:s,size:t,modified:a,accessed:n,type:o,permissions:l,safetyData:d});const r=document.createElement("div");r.className="file-details-modal";let p="";if(d)try{const y=JSON.parse(d.replace(/&#39;/g,"'")),h=H(y.level);p=`
                <div class="detail-row safety-row">
                    <span class="detail-label">Safety Level:</span>
                    <span class="detail-value">
                        <div class="safety-detail" style="color: ${j(y.level)}">
                            <span class="safety-icon">${h}</span>
                            <span class="safety-level">${y.level}</span>
                            <span class="safety-confidence">(${y.confidence}% confidence)</span>
                        </div>
                    </span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Safety Explanation:</span>
                    <span class="detail-value safety-explanation">${y.explanation}</span>
                </div>
                ${y.reasons&&y.reasons.length>0?`
                    <div class="detail-row">
                        <span class="detail-label">Safety Reasons:</span>
                        <span class="detail-value">
                            <ul class="safety-reasons">
                                ${y.reasons.map(u=>`<li>${u}</li>`).join("")}
                            </ul>
                        </span>
                    </div>
                `:""}
            `}catch(y){console.error("Error parsing safety data:",y)}r.innerHTML=`
        <div class="modal-overlay" onclick="closeFileDetails()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>File Details</h3>
                    <button class="modal-close" onclick="closeFileDetails()">\xD7</button>
                </div>
                <div class="modal-body">
                    <div class="detail-row">
                        <span class="detail-label">Name:</span>
                        <span class="detail-value">${s}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Path:</span>
                        <span class="detail-value" title="${e}">${e}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Size:</span>
                        <span class="detail-value">${v(t)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Type:</span>
                        <span class="detail-value">${o}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Modified:</span>
                        <span class="detail-value">${new Date(a).toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Accessed:</span>
                        <span class="detail-value">${new Date(n).toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Permissions:</span>
                        <span class="detail-value">${l}</span>
                    </div>
                    ${p}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="revealInFinder('${e}')">Reveal in Finder</button>
                    <button class="btn btn-secondary" onclick="closeFileDetails()">Close</button>
                </div>
            </div>
        </div>
    `,document.body.appendChild(r)}function Oe(){const e=document.querySelector(".file-details-modal");e&&e.remove()}async function W(e){console.log("Reveal in Finder:",e);try{const s=await Be(e),t=JSON.parse(s);t.status==="success"?S(t.message):c(`Failed to reveal in Finder: ${t.message||"Unknown error"}`)}catch(s){console.error("Failed to reveal in Finder:",s),c(`Failed to reveal in Finder: ${s.message}`)}}function Pe(){console.log("selectAllSafeFiles called");const e=document.querySelectorAll(".file-row");console.log("Total file rows found:",e.length);const s=new Set;e.forEach(n=>{const o=n.getAttribute("data-safety-level");o&&s.add(o)}),console.log("Safety levels found:",Array.from(s));const t=document.querySelectorAll('.file-row[data-safety-level="Safe"], .file-row[data-safety-level="safe"]');if(console.log("Safe rows found:",t.length),t.length===0){const n=Array.from(e).filter(o=>{const l=o.getAttribute("data-safety-level");return l&&l.toLowerCase().includes("safe")});if(console.log("Potential safe rows (case-insensitive):",n.length),n.length>0)n.forEach(o=>{if(o.classList.add("selected"),o.querySelector(".file-checkbox"))o.querySelector(".file-checkbox").checked=!0;else{const l=document.createElement("input");l.type="checkbox",l.className="file-checkbox",l.checked=!0,l.addEventListener("change",d=>{o.classList.toggle("selected",d.target.checked)}),o.querySelector(".file-name").prepend(l)}});else{const o=document.querySelectorAll(".file-row");o.length===0?c("No files found. Please scan a cache location first."):c(`No safe files found to select. Found ${o.length} files total. Make sure files have been classified as safe.`);return}}else t.forEach(n=>{if(n.classList.add("selected"),n.querySelector(".file-checkbox"))n.querySelector(".file-checkbox").checked=!0;else{const o=document.createElement("input");o.type="checkbox",o.className="file-checkbox",o.checked=!0,o.addEventListener("change",l=>{n.classList.toggle("selected",l.target.checked)}),n.querySelector(".file-name").prepend(o)}});K();const a=document.querySelectorAll(".file-row.selected").length;a>0&&S(`Successfully selected ${a} safe files`)}function qe(){document.querySelectorAll(".file-row").forEach(e=>{e.classList.remove("selected");const s=e.querySelector(".file-checkbox");s&&(s.checked=!1)}),K()}function K(){const e=document.querySelectorAll(".file-row.selected").length,s=Array.from(document.querySelectorAll(".file-row.selected")).reduce((a,n)=>a+parseInt(n.dataset.fileSize||0),0);let t=document.querySelector(".selection-summary");!t&&e>0&&(t=document.createElement("div"),t.className="selection-summary",document.querySelector(".file-controls").appendChild(t)),t&&(e>0?t.innerHTML=`
                <div class="selection-info">
                    <span class="selection-count">${e} files selected</span>
                    <span class="selection-size">Total: ${v(s)}</span>
                    <button class="btn btn-danger btn-sm" onclick="deleteSelectedFiles()">
                        <span class="btn-icon">\u{1F5D1}\uFE0F</span>
                        Delete Selected
                    </button>
                </div>
            `:t.remove())}let X=[];async function Je(){const e=Array.from(document.querySelectorAll(".file-row.selected"));if(e.length===0){c("No files selected for deletion");return}const s=e.map(t=>t.dataset.filePath);X=s;try{i("Validating files for deletion...",!0);const t=await Ee(JSON.stringify(s),"manual_deletion"),a=JSON.parse(t),n=await fe(JSON.stringify(s),"manual_deletion",!1,!1),o=JSON.parse(n);Ue(o,a)}catch(t){console.error("Deletion error:",t),c(`Deletion failed: ${t.message}`),i("Deletion failed",!1)}}function b(e){const s=document.getElementById("scanButton"),t=document.getElementById("scanAllButton"),a=document.getElementById("stopButton");s.disabled=e,t.disabled=e,a.disabled=!e,e?(s.innerHTML='<span class="btn-icon">\u23F3</span>Scanning...',t.innerHTML='<span class="btn-icon">\u23F3</span>Scanning...'):(s.innerHTML='<span class="btn-icon">\u{1F50D}</span>Scan Selected Location',t.innerHTML='<span class="btn-icon">\u{1F310}</span>Scan All Safe Locations')}function i(e,s=!0){const t=document.getElementById("progressContainer"),a=document.getElementById("progressText");if(s){a.textContent=e,t.style.display="block",Q();const n=document.getElementById("progressBar");n&&(n.style.width="100%",n.style.animation="pulse 2s infinite")}else{t.style.display="none";const n=document.getElementById("progressBar");n&&(n.style.animation="none")}}function Q(){if(!$)return;const e=Math.floor((Date.now()-$)/1e3),s=Math.floor(e/60),t=e%60,a=`${s.toString().padStart(2,"0")}:${t.toString().padStart(2,"0")}`,n=document.getElementById("progressTime");n&&(n.textContent=a)}function c(e,s=!1,t=null){const a=document.getElementById("errorContainer");document.getElementById("errorMessage");const n=`
        <div class="error-icon">\u26A0\uFE0F</div>
        <div class="error-content">
            <h4>Error</h4>
            <p>${e}</p>
            ${s&&t?`
                <button class="btn btn-outline retry-button" onclick="retryCallback()">
                    <span class="btn-icon">\u{1F504}</span>
                    Retry
                </button>
            `:""}
        </div>
        <button id="errorClose" class="error-close">\xD7</button>
    `;a.innerHTML=n,a.style.display="flex";const o=a.querySelector("#errorClose");o&&o.addEventListener("click",D),s||setTimeout(()=>{D()},1e4)}function D(){const e=document.getElementById("errorContainer");e.style.display="none"}function Ge(){g&&clearInterval(g);let e=null;g=setInterval(async()=>{try{const s=await Se();if(($?Date.now()-$:0)>3e5){clearInterval(g),g=null,b(!1),c("Scan timed out after 5 minutes. Please try again.");return}try{const a=await ge();console.log("Raw result from GetLastScanResult:",a);const n=JSON.parse(a);if(n&&n.status!=="no_result"&&n.id){console.log("Got valid scan result:",n),clearInterval(g),g=null,I(n),C=n,b(!1),i("Scan completed!",!1);return}else console.log("No valid result yet, status:",n==null?void 0:n.status,"id:",n==null?void 0:n.id)}catch(a){console.log("No result available yet:",a.message)}if(s)e=null;else if(!e)e=Date.now();else if(Date.now()-e>1e4){clearInterval(g),g=null,b(!1),c("Scan completed but no result was returned. Please try again.");return}Q(),i("Scanning in progress...",!0)}catch(s){console.error("Error polling progress:",s),i("Scanning... (progress unavailable)",!0)}},200)}function He(){g&&(clearInterval(g),g=null)}function je(){if(!C){c("No results to export");return}const e=JSON.stringify(C,null,2),s=new Blob([e],{type:"application/json"}),t=document.createElement("a");t.href=URL.createObjectURL(s),t.download=`cache-scan-results-${new Date().toISOString().split("T")[0]}.json`,t.click()}function v(e){if(e===0)return"0 Bytes";const s=1024,t=["Bytes","KB","MB","GB","TB"],a=Math.floor(Math.log(e)/Math.log(s));return parseFloat((e/Math.pow(s,a)).toFixed(2))+" "+t[a]}function E(e){const s=e/1e9;if(s<1)return(e/1e6).toFixed(0)+"ms";if(s<60)return s.toFixed(2)+"s";{const t=Math.floor(s/60),a=s%60;return`${t}m ${a.toFixed(1)}s`}}function Ue(e,s){const t=document.createElement("div");t.className="deletion-confirmation-modal";const a=e.warnings&&e.warnings.length>0?`
        <div class="warnings-section">
            <h4>\u26A0\uFE0F Warnings</h4>
            <ul class="warnings-list">
                ${e.warnings.map(o=>`<li>${o}</li>`).join("")}
            </ul>
        </div>
    `:"",n=e.details?`
        <div class="details-section">
            <h4>\u{1F4CB} Details</h4>
            <ul class="details-list">
                ${e.details.map(o=>`<li>${o}</li>`).join("")}
            </ul>
        </div>
    `:"";t.innerHTML=`
        <div class="modal-overlay" onclick="closeDeletionConfirmation()">
            <div class="modal-content deletion-modal" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>${e.title}</h3>
                    <button class="modal-close" onclick="closeDeletionConfirmation()">\xD7</button>
                </div>
                <div class="modal-body">
                    <div class="confirmation-message">
                        <p>${e.message}</p>
                    </div>
                    ${a}
                    ${n}
                    <div class="safety-info">
                        <h4>\u{1F6E1}\uFE0F Safety Measures</h4>
                        <ul>
                            <li>\u2705 Mandatory backup will be created before deletion</li>
                            <li>\u{1F504} Files can be restored from backup if needed</li>
                            <li>\u{1F6AB} System critical files are protected</li>
                            <li>\u{1F4DD} All operations are logged with timestamps</li>
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
                    <button class="btn btn-danger" onclick="confirmDeletion('${JSON.stringify(e).replace(/'/g,"&#39;")}')">
                        <span class="btn-icon">\u{1F5D1}\uFE0F</span>
                        Confirm Deletion
                    </button>
                </div>
            </div>
        </div>
    `,document.body.appendChild(t)}function Y(){const e=document.querySelector(".deletion-confirmation-modal");e&&e.remove()}async function Ve(e){try{const s=document.getElementById("forceDeleteCheckbox").checked,t=document.getElementById("dryRunCheckbox").checked;Y(),i("Starting deletion operation...",!0);const a=await ue(e,JSON.stringify(X),!0,s,t),n=JSON.parse(a);n.status==="started"?We(n.operation_id):(c("Failed to start deletion operation"),i("Deletion failed",!1))}catch(s){console.error("Confirmation error:",s),c(`Deletion confirmation failed: ${s.message}`),i("Deletion failed",!1)}}let k=null;function We(e){k&&clearInterval(k),k=setInterval(async()=>{try{const s=await ye(e),t=JSON.parse(s);Ke(t),(t.status==="completed"||t.status==="failed"||t.status==="cancelled")&&(clearInterval(k),k=null,t.status==="completed"?(i("Deletion completed successfully!",!1),S(`Successfully deleted ${t.files_processed} files`)):(c(`Deletion ${t.status}: ${t.message}`),i("Deletion failed",!1)))}catch(s){console.error("Progress monitoring error:",s),clearInterval(k),k=null,c("Failed to monitor deletion progress"),i("Deletion failed",!1)}},500)}function Ke(e){const s=document.getElementById("progressText"),t=document.getElementById("progressBar");s&&(s.textContent=e.message||"Processing..."),t&&(t.style.width=`${e.progress||0}%`,t.style.animation="none");const a=document.getElementById("filesScanned"),n=document.getElementById("sizeFound");a&&(a.textContent=`${e.files_processed||0} / ${e.total_files||0}`),n&&(n.textContent=v(e.current_size||0))}function S(e){const s=document.createElement("div");s.className="success-container",s.innerHTML=`
        <div class="success-icon">\u2705</div>
        <div class="success-content">
            <h4>Success</h4>
            <p>${e}</p>
        </div>
        <button class="success-close" onclick="this.parentElement.remove()">\xD7</button>
    `;const t=document.getElementById("progressContainer");t&&t.parentNode&&t.parentNode.insertBefore(s,t.nextSibling),setTimeout(()=>{s.parentNode&&s.remove()},5e3)}async function Xe(){try{const e=await ve(),s=JSON.parse(e);if(s.length===0){c("No backup sessions available for restore");return}Qe(s)}catch(e){console.error("Error getting backups:",e),c(`Failed to get backup sessions: ${e.message}`)}}function Qe(e){const s=document.createElement("div");s.className="restore-modal";const t=e.map(a=>`
        <div class="backup-option" data-session-id="${a.session_id}">
            <div class="backup-info">
                <h4>${a.operation}</h4>
                <p>Session: ${a.session_id}</p>
                <p>Files: ${a.total_files}</p>
                <p>Size: ${v(a.total_size)}</p>
                <p>Created: ${new Date(a.created_at).toLocaleString()}</p>
            </div>
            <button class="btn btn-primary" onclick="restoreFromBackup('${a.session_id}')">
                <span class="btn-icon">\u{1F504}</span>
                Restore
            </button>
        </div>
    `).join("");s.innerHTML=`
        <div class="modal-overlay" onclick="closeRestoreDialog()">
            <div class="modal-content restore-modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>\u{1F504} Restore from Backup</h3>
                    <button class="modal-close" onclick="closeRestoreDialog()">\xD7</button>
                </div>
                <div class="modal-body">
                    <p>Select a backup session to restore files from:</p>
                    <div class="backup-list">
                        ${t}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeRestoreDialog()">Cancel</button>
                </div>
            </div>
        </div>
    `,document.body.appendChild(s)}function Z(){const e=document.querySelector(".restore-modal");e&&e.remove()}async function Ye(e){try{Z(),i("Starting restore operation...",!0);const s=await $e(e,!1),t=JSON.parse(s);i("Restore completed successfully!",!1),S(`Successfully restored ${t.success_count} files from backup`)}catch(s){console.error("Restore error:",s),c(`Restore failed: ${s.message}`),i("Restore failed",!1)}}let _=null,Ze=null;async function ee(){try{i("Loading backup data...",!0);const e=await M(),s=JSON.parse(e);_=s,i("Backup data loaded",!1),es(s)}catch(e){console.error("Error loading backup data:",e),c(`Failed to load backup data: ${e.message}`),i("Failed to load backup data",!1)}}function es(e){const s=document.createElement("div");s.className="backup-manager-modal";const t=e.summary,a=e.sessions||[];s.innerHTML=`
        <div class="modal-overlay" onclick="closeBackupManager()">
            <div class="modal-content backup-manager-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>\u{1F4BE} Backup Manager</h3>
                    <div class="header-actions">
                        <button class="btn btn-outline btn-sm" onclick="refreshBackupData()">
                            <span class="btn-icon">\u{1F504}</span>
                            Refresh
                        </button>
                        <button class="modal-close" onclick="closeBackupManager()">\xD7</button>
                    </div>
                </div>
                
                <div class="modal-body">
                    <div class="backup-summary">
                        <div class="summary-grid">
                            <div class="summary-item">
                                <div class="summary-icon">\u{1F4E6}</div>
                                <div class="summary-content">
                                    <h4>${t.total_sessions}</h4>
                                    <p>Backup Sessions</p>
                                </div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-icon">\u{1F4C1}</div>
                                <div class="summary-content">
                                    <h4>${t.total_files.toLocaleString()}</h4>
                                    <p>Total Files</p>
                                </div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-icon">\u{1F4BE}</div>
                                <div class="summary-content">
                                    <h4>${v(t.total_size)}</h4>
                                    <p>Total Size</p>
                                </div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-icon">\u{1F5D3}\uFE0F</div>
                                <div class="summary-content">
                                    <h4>${t.oldest_session?new Date(t.oldest_session).toLocaleDateString():"N/A"}</h4>
                                    <p>Oldest Backup</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="backup-controls">
                        <div class="search-controls">
                            <div class="search-box">
                                <input type="text" id="backupSearch" placeholder="Search backups..." class="search-input">
                                <span class="search-icon">\u{1F50D}</span>
                            </div>
                            <select id="backupFilter" class="filter-select">
                                <option value="">All Operations</option>
                                <option value="manual_deletion">Manual Deletion</option>
                            </select>
                        </div>
                        <div class="bulk-actions">
                            <button class="btn btn-outline btn-sm" onclick="cleanupOldBackups()">
                                <span class="btn-icon">\u{1F9F9}</span>
                                Cleanup Old Backups
                            </button>
                        </div>
                    </div>
                    
                    <div class="backup-sessions">
                        <h4>Backup Sessions</h4>
                        ${a.length===0?'<div class="empty-state"><div class="empty-icon">\u{1F4E6}</div><h3>No Backups Found</h3><p>No backup sessions are available.</p></div>':`<div class="sessions-list">
                                ${a.map(n=>se(n)).join("")}
                            </div>`}
                    </div>
                </div>
            </div>
        </div>
    `,document.body.appendChild(s),ss()}function se(e){const s=new Date(e.start_time),a=new Date(e.end_time)-s;return`
        <div class="backup-session-card" data-session-id="${e.session_id}">
            <div class="session-header">
                <div class="session-info">
                    <h5>${e.operation}</h5>
                    <p class="session-id">Session: ${e.session_id}</p>
                    <p class="session-time">${s.toLocaleString()}</p>
                </div>
                <div class="session-stats">
                    <div class="stat-item">
                        <span class="stat-label">Files:</span>
                        <span class="stat-value">${e.total_files}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Size:</span>
                        <span class="stat-value">${v(e.total_size)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Duration:</span>
                        <span class="stat-value">${E(a)}</span>
                    </div>
                </div>
                <div class="session-status">
                    <span class="status-badge status-${e.status}">${e.status}</span>
                </div>
            </div>
            
            <div class="session-actions">
                <button class="btn btn-outline btn-sm" onclick="showBackupDetails('${e.session_id}')">
                    <span class="btn-icon">\u2139\uFE0F</span>
                    Details
                </button>
                <button class="btn btn-primary btn-sm" onclick="previewRestore('${e.session_id}')">
                    <span class="btn-icon">\u{1F441}\uFE0F</span>
                    Preview Restore
                </button>
                <button class="btn btn-secondary btn-sm" onclick="restoreBackupSession('${e.session_id}')">
                    <span class="btn-icon">\u{1F504}</span>
                    Restore All
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteBackupSession('${e.session_id}')">
                    <span class="btn-icon">\u{1F5D1}\uFE0F</span>
                    Delete
                </button>
            </div>
        </div>
    `}function ss(){const e=document.getElementById("backupSearch"),s=document.getElementById("backupFilter");e&&e.addEventListener("input",N),s&&s.addEventListener("change",N)}function N(){var t,a;const e=((t=document.getElementById("backupSearch"))==null?void 0:t.value.toLowerCase())||"",s=((a=document.getElementById("backupFilter"))==null?void 0:a.value)||"";document.querySelectorAll(".backup-session-card").forEach(n=>{const o=n.dataset.sessionId,l=_.sessions.find(r=>r.session_id===o);if(!l)return;let d=!0;e&&(`${l.operation} ${l.session_id}`.toLowerCase().includes(e)||(d=!1)),s&&l.operation!==s&&(d=!1),n.style.display=d?"":"none"})}function ts(){const e=document.querySelector(".backup-manager-modal");e&&e.remove()}async function R(){try{i("Refreshing backup data...",!0);const e=await M(),s=JSON.parse(e);_=s;const t=document.querySelector(".sessions-list");t&&(t.innerHTML=s.sessions.map(n=>se(n)).join(""));const a=s.summary;document.querySelector(".summary-item:nth-child(1) h4").textContent=a.total_sessions,document.querySelector(".summary-item:nth-child(2) h4").textContent=a.total_files.toLocaleString(),document.querySelector(".summary-item:nth-child(3) h4").textContent=v(a.total_size),document.querySelector(".summary-item:nth-child(4) h4").textContent=a.oldest_session?new Date(a.oldest_session).toLocaleDateString():"N/A",i("Backup data refreshed",!1)}catch(e){console.error("Error refreshing backup data:",e),c(`Failed to refresh backup data: ${e.message}`),i("Failed to refresh backup data",!1)}}async function as(e){try{i("Loading session details...",!0);const s=await me(e),t=JSON.parse(s);Ze=t,i("Session details loaded",!1),ns(t)}catch(s){console.error("Error loading session details:",s),c(`Failed to load session details: ${s.message}`),i("Failed to load session details",!1)}}function ns(e){const s=e.session,t=document.createElement("div");t.className="backup-details-modal";const a=e.integrity_valid?'<span class="status-badge status-completed">\u2705 Valid</span>':'<span class="status-badge status-failed">\u274C Invalid</span>',n=e.integrity_errors.length>0?`<div class="integrity-errors">
            <h5>Integrity Errors:</h5>
            <ul>${e.integrity_errors.map(l=>`<li>${l}</li>`).join("")}</ul>
        </div>`:"";t.innerHTML=`
        <div class="modal-overlay" onclick="closeBackupDetails()">
            <div class="modal-content backup-details-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>\u{1F4CB} Backup Session Details</h3>
                    <button class="modal-close" onclick="closeBackupDetails()">\xD7</button>
                </div>
                
                <div class="modal-body">
                    <div class="session-overview">
                        <div class="overview-grid">
                            <div class="overview-item">
                                <span class="overview-label">Session ID:</span>
                                <span class="overview-value">${s.session_id}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Operation:</span>
                                <span class="overview-value">${s.operation}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Status:</span>
                                <span class="overview-value"><span class="status-badge status-${s.status}">${s.status}</span></span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Start Time:</span>
                                <span class="overview-value">${new Date(s.start_time).toLocaleString()}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">End Time:</span>
                                <span class="overview-value">${new Date(s.end_time).toLocaleString()}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Duration:</span>
                                <span class="overview-value">${E(new Date(s.end_time)-new Date(s.start_time))}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Total Files:</span>
                                <span class="overview-value">${s.total_files}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Success Count:</span>
                                <span class="overview-value">${s.success_count}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Failure Count:</span>
                                <span class="overview-value">${s.failure_count}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Total Size:</span>
                                <span class="overview-value">${v(s.total_size)}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Backup Size:</span>
                                <span class="overview-value">${v(s.backup_size)}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Integrity:</span>
                                <span class="overview-value">${a}</span>
                            </div>
                        </div>
                    </div>
                    
                    ${n}
                    
                    <div class="backup-files">
                        <h4>Backed Up Files (${s.entries.length})</h4>
                        <div class="files-controls">
                            <div class="search-box">
                                <input type="text" id="fileSearchDetails" placeholder="Search files..." class="search-input">
                                <span class="search-icon">\u{1F50D}</span>
                            </div>
                            <div class="file-actions">
                                <button class="btn btn-outline btn-sm" onclick="selectAllFiles()">
                                    <span class="btn-icon">\u2611\uFE0F</span>
                                    Select All
                                </button>
                                <button class="btn btn-outline btn-sm" onclick="clearFileSelection()">
                                    <span class="btn-icon">\u2610</span>
                                    Clear Selection
                                </button>
                                <button class="btn btn-primary btn-sm" onclick="restoreSelectedFiles('${s.session_id}')">
                                    <span class="btn-icon">\u{1F504}</span>
                                    Restore Selected
                                </button>
                            </div>
                        </div>
                        <div class="files-list">
                            ${os(s.entries)}
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeBackupDetails()">Close</button>
                    <button class="btn btn-secondary" onclick="restoreBackupSession('${s.session_id}')">
                        <span class="btn-icon">\u{1F504}</span>
                        Restore All Files
                    </button>
                </div>
            </div>
        </div>
    `,document.body.appendChild(t);const o=document.getElementById("fileSearchDetails");o&&o.addEventListener("input",is)}function os(e){return`
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
                ${e.map(s=>`
                    <tr class="backup-file-row" data-file-path="${s.original_path}">
                        <td><input type="checkbox" class="file-checkbox" value="${s.original_path}"></td>
                        <td class="file-path" title="${s.original_path}">${s.original_path}</td>
                        <td class="file-size">${v(s.size)}</td>
                        <td class="file-time">${new Date(s.backup_time).toLocaleString()}</td>
                        <td class="file-status">
                            <span class="status-badge status-${s.success?"completed":"failed"}">
                                ${s.success?"\u2705 Success":"\u274C Failed"}
                            </span>
                        </td>
                        <td class="file-checksum" title="${s.checksum}">${s.checksum.substring(0,16)}...</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `}function is(){var s;const e=((s=document.getElementById("fileSearchDetails"))==null?void 0:s.value.toLowerCase())||"";document.querySelectorAll(".backup-file-row").forEach(t=>{const a=t.dataset.filePath.toLowerCase(),n=!e||a.includes(e);t.style.display=n?"":"none"})}function ls(){const e=document.querySelector(".backup-details-modal");e&&e.remove()}async function cs(e){try{if(!confirm(`Are you sure you want to restore all files from backup session ${e}? This will overwrite existing files.`))return;i("Starting restore operation...",!0);const t=await O(e,"",!0,!1),a=JSON.parse(t);i("Restore completed successfully!",!1),S(`Successfully restored ${a.success_count} files from backup`)}catch(s){console.error("Restore error:",s),c(`Restore failed: ${s.message}`),i("Restore failed",!1)}}async function rs(e){const s=Array.from(document.querySelectorAll(".file-checkbox:checked")).map(t=>t.value);if(s.length===0){c("No files selected for restore");return}try{if(!confirm(`Are you sure you want to restore ${s.length} selected files? This will overwrite existing files.`))return;i("Starting selective restore operation...",!0);const a=await O(e,JSON.stringify(s),!0,!1),n=JSON.parse(a);i("Selective restore completed successfully!",!1),S(`Successfully restored ${n.success_count} files from backup`)}catch(t){console.error("Selective restore error:",t),c(`Selective restore failed: ${t.message}`),i("Selective restore failed",!1)}}async function ds(e){try{if(!confirm(`Are you sure you want to delete backup session ${e}? This action cannot be undone.`))return;i("Deleting backup session...",!0);const t=await pe(e),a=JSON.parse(t);i("Backup session deleted successfully!",!1),S(`Successfully deleted backup session ${e}`),await R()}catch(s){console.error("Delete error:",s),c(`Delete failed: ${s.message}`),i("Delete failed",!1)}}async function us(){try{const e=prompt("Enter the number of days (backups older than this will be deleted):","30");if(!e||isNaN(e))return;const s=parseInt(e);if(s<=0){c("Please enter a valid number of days");return}if(!confirm(`Are you sure you want to delete all backup sessions older than ${s} days? This action cannot be undone.`))return;i("Cleaning up old backups...",!0);const a=await de(s),n=JSON.parse(a);i("Cleanup completed successfully!",!1),S(`Successfully deleted ${n.deleted_count} old backup sessions`),await R()}catch(e){console.error("Cleanup error:",e),c(`Cleanup failed: ${e.message}`),i("Cleanup failed",!1)}}async function ps(e){try{i("Generating restore preview...",!0);const s=await we(e,""),t=JSON.parse(s);i("Restore preview generated",!1),fs(e,t)}catch(s){console.error("Preview error:",s),c(`Preview failed: ${s.message}`),i("Preview failed",!1)}}function fs(e,s){const t=document.createElement("div");t.className="restore-preview-modal",t.innerHTML=`
        <div class="modal-overlay" onclick="closeRestorePreview()">
            <div class="modal-content restore-preview-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>\u{1F441}\uFE0F Restore Preview</h3>
                    <button class="modal-close" onclick="closeRestorePreview()">\xD7</button>
                </div>
                
                <div class="modal-body">
                    <div class="preview-summary">
                        <div class="summary-grid">
                            <div class="summary-item">
                                <div class="summary-icon">\u{1F4C1}</div>
                                <div class="summary-content">
                                    <h4>${s.total_files}</h4>
                                    <p>Total Files</p>
                                </div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-icon">\u2705</div>
                                <div class="summary-content">
                                    <h4>${s.success_count}</h4>
                                    <p>Can Restore</p>
                                </div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-icon">\u274C</div>
                                <div class="summary-content">
                                    <h4>${s.failure_count}</h4>
                                    <p>Would Conflict</p>
                                </div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-icon">\u{1F4BE}</div>
                                <div class="summary-content">
                                    <h4>${v(s.restored_size)}</h4>
                                    <p>Size to Restore</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="preview-details">
                        <div class="restoreable-files">
                            <h4>Files That Can Be Restored (${s.restored_files.length})</h4>
                            <div class="files-list">
                                ${s.restored_files.map(a=>`
                                    <div class="file-item">
                                        <span class="file-icon">\u2705</span>
                                        <span class="file-path">${a}</span>
                                    </div>
                                `).join("")}
                            </div>
                        </div>
                        
                        ${s.failed_files.length>0?`
                            <div class="conflicting-files">
                                <h4>Files That Would Conflict (${s.failed_files.length})</h4>
                                <div class="files-list">
                                    ${s.failed_files.map(a=>`
                                        <div class="file-item">
                                            <span class="file-icon">\u26A0\uFE0F</span>
                                            <span class="file-path">${a}</span>
                                        </div>
                                    `).join("")}
                                </div>
                            </div>
                        `:""}
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeRestorePreview()">Close</button>
                    <button class="btn btn-primary" onclick="restoreBackupSession('${e}')">
                        <span class="btn-icon">\u{1F504}</span>
                        Proceed with Restore
                    </button>
                </div>
            </div>
        </div>
    `,document.body.appendChild(t)}function vs(){const e=document.querySelector(".restore-preview-modal");e&&e.remove()}let m=null;function ms(){const e=document.getElementById("settingsModal");e&&(e.style.display="flex",ys())}function x(){const e=document.getElementById("settingsModal");e&&(e.style.display="none")}async function ys(){try{i("Loading settings...",!0);const e=await be();m=JSON.parse(e),te(),i("Settings loaded",!1)}catch(e){console.error("Error loading settings:",e),c(`Failed to load settings: ${e.message}`),i("Failed to load settings",!1)}}function te(){!m||(F("backup-form",m.backup),F("safety-form",m.safety),F("performance-form",m.performance),F("privacy-form",m.privacy),F("ui-form",m.ui))}function F(e,s){const t=document.getElementById(e);!t||!s||Object.keys(s).forEach(a=>{const n=t.querySelector(`[name="${a}"]`);!n||(n.type==="checkbox"?n.checked=s[a]:(n.type,n.value=s[a]))})}function gs(e){document.querySelectorAll(".settings-category-btn").forEach(s=>{s.classList.remove("active")}),document.querySelector(`[data-category="${e}"]`).classList.add("active"),document.querySelectorAll(".settings-section").forEach(s=>{s.classList.remove("active")}),document.getElementById(`${e}-settings`).classList.add("active")}async function bs(){try{i("Saving settings...",!0);const e=L("backup-form"),s=L("safety-form"),t=L("performance-form"),a=L("privacy-form"),n=L("ui-form");if(m){m.backup={...m.backup,...e},m.safety={...m.safety,...s},m.performance={...m.performance,...t},m.privacy={...m.privacy,...a},m.ui={...m.ui,...n};const o=await De(JSON.stringify(m));JSON.parse(o).status==="success"?(i("Settings saved successfully",!1),showSuccess("Settings saved successfully!")):(c("Failed to save settings"),i("Failed to save settings",!1))}}catch(e){console.error("Error saving settings:",e),c(`Failed to save settings: ${e.message}`),i("Failed to save settings",!1)}}async function hs(){if(!!confirm("Are you sure you want to reset all settings to defaults? This cannot be undone."))try{i("Resetting settings...",!0);const e=await ke(),s=JSON.parse(e);s.status==="success"?(m=s.settings,te(),i("Settings reset successfully",!1),showSuccess("Settings reset to defaults!")):(c("Failed to reset settings"),i("Failed to reset settings",!1))}catch(e){console.error("Error resetting settings:",e),c(`Failed to reset settings: ${e.message}`),i("Failed to reset settings",!1)}}function L(e){const s=document.getElementById(e),t=new FormData(s),a={};for(let[n,o]of t.entries()){const l=s.querySelector(`[name="${n}"]`);l.type==="checkbox"?a[n]=l.checked:l.type==="number"?a[n]=parseInt(o):a[n]=o}return a}

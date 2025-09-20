(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&a(i)}).observe(document,{childList:!0,subtree:!0});function s(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerpolicy&&(o.referrerPolicy=n.referrerpolicy),n.crossorigin==="use-credentials"?o.credentials="include":n.crossorigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(n){if(n.ep)return;n.ep=!0;const o=s(n);fetch(n.href,o)}})();function ge(e){return window.go.main.App.CleanupBackupsByAge(e)}function ye(e,t,s,a,n){return window.go.main.App.ConfirmDeletion(e,t,s,a,n)}function he(e){return window.go.main.App.DeleteBackupSession(e)}function be(e,t,s,a){return window.go.main.App.DeleteFilesWithConfirmation(e,t,s,a)}function Se(){return window.go.main.App.GetAvailableBackups()}function q(){return window.go.main.App.GetBackupBrowserData()}function we(e){return window.go.main.App.GetBackupSessionDetails(e)}function J(){return window.go.main.App.GetCacheLocationsFromConfig()}function ke(e){return window.go.main.App.GetDeletionProgress(e)}function $e(){return window.go.main.App.GetLastScanResult()}function Be(){return window.go.main.App.GetSettings()}function _e(){return window.go.main.App.GetSystemInfo()}function Ce(){return window.go.main.App.IsScanning()}function Fe(e,t){return window.go.main.App.PreviewRestoreOperation(e,t)}function Le(){return window.go.main.App.ResetSettings()}function De(e,t){return window.go.main.App.RestoreFromBackup(e,t)}function W(e,t,s,a){return window.go.main.App.RestoreFromBackupWithOptions(e,t,s,a)}function Ee(e){return window.go.main.App.RevealInFinder(e)}function Ae(e,t,s){return window.go.main.App.ScanCacheLocation(e,t,s)}function xe(e){return window.go.main.App.ScanMultipleCacheLocations(e)}function Ie(){return window.go.main.App.StopScan()}function Re(e){return window.go.main.App.UpdateSettings(e)}function ze(e,t){return window.go.main.App.ValidateFilesForDeletion(e,t)}let D=null,y=null,$=null;function G(){return new Promise((e,t)=>{let a=0;const n=()=>{var o;if(a++,a%10===0&&console.log(`Checking Wails runtime (attempt ${a}):`,{window:typeof window,go:typeof window.go,main:window.go?typeof window.go.main:"N/A",App:window.go&&window.go.main?typeof window.go.main.App:"N/A"}),window.go&&window.go.main&&window.go.main.App){console.log("Wails runtime is ready"),e();return}if(a>=100){console.error("Wails runtime check failed. Available objects:",{window:typeof window,go:typeof window.go,wails:typeof window.wails,runtime:typeof window.runtime,location:(o=window.location)==null?void 0:o.href,userAgent:navigator.userAgent,allWindowKeys:Object.keys(window).filter(i=>i.includes("go")||i.includes("wails")||i.includes("runtime"))}),t(new Error("Wails runtime not available after 10 seconds"));return}setTimeout(n,100)};n()})}function Me(){console.log("Initializing app in fallback mode (no Wails runtime)");const e=window.location.protocol==="http:"||window.location.protocol==="https:",t=window.location.protocol==="wails:";let s="Running in demo mode - Wails runtime not available. Some features may be limited.";e?s="This app must be run through the Wails desktop application, not in a web browser.":t&&(s="Wails runtime not available. Please restart the application."),c(s,!0,()=>{G().then(()=>{B(),I()}).catch(i=>{console.error("Retry failed:",i)})}),H([{id:"demo-browser-cache",name:"Browser Cache (Demo)",path:"~/Library/Caches/Google/Chrome",type:"user",description:"Chrome browser cache files"},{id:"demo-system-cache",name:"System Cache (Demo)",path:"/Library/Caches",type:"system",description:"System-wide cache files"},{id:"demo-app-cache",name:"Application Cache (Demo)",path:"~/Library/Caches/com.example.app",type:"application",description:"Application-specific cache files"}]);const n={os:"macOS (Demo Mode)",scan_time:new Date().toISOString(),app_version:"1.0.0",go_version:"N/A (Demo Mode)",error_count:0,notification_count:0,error_handling:"demo",logging:"demo"};j(n),document.querySelectorAll(".scan-button, .scan-all-button").forEach(i=>{i.disabled=!0,i.textContent="Demo Mode - Runtime Required"}),console.log("App initialized in fallback mode")}document.addEventListener("DOMContentLoaded",function(){Ne(),G().then(()=>{I()}).catch(e=>{console.error("Failed to initialize Wails runtime:",e),Me()}),Te(),window.selectAllSafeFiles=He,window.clearFileSelection=je,window.showUndoOptions=tt,window.showFileDetails=Z,window.closeFileDetails=Ge,window.revealInFinder=ee,window.toggleLocationFiles=Y,window.deleteSelectedFiles=Ue,window.confirmDeletion=oe,window.closeDeletionConfirmation=ne,window.closeRestoreDialog=ie,window.restoreFromBackup=at,window.showBackupManager=le,window.closeBackupManager=lt,window.refreshBackupData=M,window.showBackupDetails=ct,window.closeBackupDetails=pt,window.restoreBackupSession=ft,window.restoreSelectedFiles=mt,window.deleteBackupSession=vt,window.cleanupOldBackups=gt,window.previewRestore=yt,window.closeRestorePreview=bt});function Ne(){document.querySelector("#app").innerHTML=`
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
        <div id="settingsModal" class="modal-overlay">
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
    `}async function I(){try{if(console.log("Initializing app..."),!window.go||!window.go.main||!window.go.main.App)throw new Error("Wails runtime not available during initialization");console.log("Loading cache locations...");const e=await J();console.log("Raw locations data:",e);const t=JSON.parse(e);console.log("Parsed locations data:",t),console.log("Number of locations:",t.length),H(t);const s=await _e(),a=JSON.parse(s);j(a),console.log("App initialization complete")}catch(e){console.error("Error initializing app:",e),c("Failed to initialize application: "+e.message)}}function Te(){const e=document.getElementById("scanButton"),t=document.getElementById("scanAllButton"),s=document.getElementById("stopButton"),a=document.getElementById("refreshButton"),n=document.getElementById("exportButton"),o=document.getElementById("errorClose"),i=document.getElementById("backupManagerButton");e&&e.addEventListener("click",U),t&&t.addEventListener("click",V),s&&s.addEventListener("click",async()=>{try{await Ie(),Ke(),h(!1),l("Scan stopped by user",!1)}catch(p){c("Failed to stop scan: "+p.message)}}),a&&a.addEventListener("click",I),n&&n.addEventListener("click",Xe),o&&o.addEventListener("click",B),i&&i.addEventListener("click",le);const d=document.getElementById("settingsButton"),r=document.getElementById("settingsModal"),u=document.getElementById("closeSettingsModal"),g=document.getElementById("closeSettingsModal2"),S=document.getElementById("saveSettings"),w=document.getElementById("resetSettings");d&&d.addEventListener("click",St),u&&u.addEventListener("click",x),g&&g.addEventListener("click",x),S&&S.addEventListener("click",$t),w&&w.addEventListener("click",Bt),document.querySelectorAll(".settings-category-btn").forEach(p=>{p.addEventListener("click",m=>{kt(m.target.dataset.category)})}),r&&r.addEventListener("click",p=>{p.target===r&&x()}),document.addEventListener("click",function(p){if(p.target.classList.contains("btn-icon")&&p.target.getAttribute("title")==="View Details"){const m=p.target.closest(".file-row");if(m){const C=m.dataset.filePath,re=m.querySelector(".file-name-text").textContent,de=parseInt(m.dataset.fileSize),ue=m.dataset.fileType,pe=m.querySelector(".file-modified").textContent,fe=m.querySelector(".file-accessed").textContent,me=m.querySelector(".file-actions").getAttribute("data-permissions")||"",ve=m.querySelector(".file-actions").getAttribute("data-safety")||"";Z(C,re,de,pe,fe,ue,me,ve)}}if(p.target.classList.contains("btn-icon")&&p.target.getAttribute("title")==="Reveal in Finder"){const m=p.target.closest(".file-row");if(m){const C=m.dataset.filePath;ee(C)}}if(p.target.classList.contains("toggle-icon")||p.target.closest(".location-header")){const m=p.target.closest(".location-card");if(m){const C=m.dataset.locationId;Y(C)}}})}function H(e){console.log("Populating locations dropdown with:",e);const t=document.getElementById("locationSelect");if(!t){console.error("Location dropdown element not found!");return}t.innerHTML="";const s=document.createElement("option");if(s.value="",s.textContent="Select a cache location...",t.appendChild(s),e&&e.length>0)e.forEach((a,n)=>{console.log(`Adding location ${n}:`,a);const o=document.createElement("option");o.value=JSON.stringify(a),o.textContent=`${a.name} (${a.type})`,t.appendChild(o)}),console.log(`Added ${e.length} locations to dropdown`);else{console.warn("No locations provided to populate dropdown");const a=document.createElement("option");a.value="",a.textContent="No cache locations available",t.appendChild(a)}}function j(e){document.getElementById("osInfo").textContent=e.os,document.getElementById("appVersion").textContent=e.app_version,document.getElementById("goVersion").textContent=e.go_version,document.getElementById("lastUpdated").textContent=new Date(e.scan_time).toLocaleString()}async function U(){const e=document.getElementById("locationSelect"),t=e.options[e.selectedIndex];if(!t.value){c("Please select a cache location to scan");return}const s=JSON.parse(t.value);try{h(!0),l("Starting scan...",!0),$=Date.now();const a=await Ae(s.id,s.name,s.path),n=JSON.parse(a);n.status==="scan_started"?(l("Scan started in background...",!0),Ve()):(R(n),D=n,h(!1))}catch(a){console.error("Scan error:",a),c(`Scan failed: ${a.message}`,!0,()=>{B(),U()}),h(!1),l("Scan failed",!1)}}async function V(){try{if(!window.go||!window.go.main||!window.go.main.App)throw new Error("Application runtime not available");h(!0),l("Starting full system scan...",!0),$=Date.now();const e=await J(),s=JSON.parse(e).filter(o=>o.type==="user"||o.type==="application");if(s.length===0){c("No safe cache locations found to scan"),h(!1),l("No locations to scan",!1);return}const a=await xe(JSON.stringify(s)),n=JSON.parse(a);R(n),D=n,h(!1),l("Scan completed!",!1)}catch(e){console.error("Full scan error:",e),c(`Full scan failed: ${e.message}`,!0,()=>{B(),V()}),h(!1),l("Scan failed",!1)}}function T(e){let t=0,s=0,a=0,n=0,o=0,i=0,d=0;return e.forEach(r=>{if(!r.is_dir&&r.safety_classification){n++;const u=r.size||0;switch(String(r.safety_classification.level||"").trim()){case"Safe":t++,o+=u;break;case"Caution":s++,i+=u;break;case"Risky":a++,d+=u;break}}}),{totalFiles:n,safeCount:t,cautionCount:s,riskyCount:a,safeSize:o,cautionSize:i,riskySize:d,safePercentage:n>0?Math.round(t/n*100):0,cautionPercentage:n>0?Math.round(s/n*100):0,riskyPercentage:n>0?Math.round(a/n*100):0}}function R(e){try{if(console.log("displayScanResult called with:",e),typeof e=="string")try{e=JSON.parse(e)}catch(n){console.error("Failed to parse result string:",n)}if(e){const n=JSON.stringify(e);console.log("Scan result size (bytes):",n.length),console.log("Scan result keys:",Object.keys(e))}const t=document.getElementById("scanResults"),s=document.getElementById("exportButton");if(!t){console.error("scanResults div not found!");return}let a;if(e.locations){const n=e.locations.flatMap(o=>o.files||[]);a=T(n)}else a=T(e.files||[]);e.locations?t.innerHTML=`
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
                            <h3>${_(e.scan_duration)}</h3>
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
                                <h4>${a.safeCount}</h4>
                                <p>Safe Files (${a.safePercentage}%)</p>
                                <span class="safety-size">${v(a.safeSize)}</span>
                            </div>
                        </div>
                        <div class="safety-card caution-card">
                            <div class="safety-icon">\u26A0\uFE0F</div>
                            <div class="safety-content">
                                <h4>${a.cautionCount}</h4>
                                <p>Caution Files (${a.cautionPercentage}%)</p>
                                <span class="safety-size">${v(a.cautionSize)}</span>
                            </div>
                        </div>
                        <div class="safety-card risky-card">
                            <div class="safety-icon">\u{1F6AB}</div>
                            <div class="safety-content">
                                <h4>${a.riskyCount}</h4>
                                <p>Risky Files (${a.riskyPercentage}%)</p>
                                <span class="safety-size">${v(a.riskySize)}</span>
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
                                    <option value="large">Large (&gt;10MB)</option>
                                    <option value="medium">Medium (1-10MB)</option>
                                    <option value="small">Small (&lt;1MB)</option>
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
                        ${e.locations.map(n=>Pe(n)).join("")}
                    </div>
                </div>
            `:t.innerHTML=`
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
                            <h3>${_(e.scan_duration)}</h3>
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
                                <h4>${a.safeCount}</h4>
                                <p>Safe Files (${a.safePercentage}%)</p>
                                <span class="safety-size">${v(a.safeSize)}</span>
                            </div>
                        </div>
                        <div class="safety-card caution-card">
                            <div class="safety-icon">\u26A0\uFE0F</div>
                            <div class="safety-content">
                                <h4>${a.cautionCount}</h4>
                                <p>Caution Files (${a.cautionPercentage}%)</p>
                                <span class="safety-size">${v(a.cautionSize)}</span>
                            </div>
                        </div>
                        <div class="safety-card risky-card">
                            <div class="safety-icon">\u{1F6AB}</div>
                            <div class="safety-content">
                                <h4>${a.riskyCount}</h4>
                                <p>Risky Files (${a.riskyPercentage}%)</p>
                                <span class="safety-size">${v(a.riskySize)}</span>
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
                                    <option value="large">Large (&gt;10MB)</option>
                                    <option value="medium">Medium (1-10MB)</option>
                                    <option value="small">Small (&lt;1MB)</option>
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
                        ${e.files?K(e.files,e.id):""}
                    </div>
                </div>
            `,Je(),s.disabled=!1}catch(t){console.error("Error rendering scan result:",t,e),c("An error occurred while rendering scan results. See console for details.")}}function Pe(e){const t=e.files===void 0&&!e.error;return`
        <div class="location-card" data-location-id="${e.id}">
            <div class="location-header" onclick="toggleLocationFiles('${e.id}')">
                <div class="location-info">
                    <h4>${e.name}</h4>
                    <p class="location-path">${e.path}</p>
                </div>
                <div class="location-stats">
                    ${t?'<span class="stat loading-stat">Loading...</span>':`<span class="stat">${e.file_count.toLocaleString()} files</span>
                         <span class="stat">${v(e.total_size)}</span>
                         <span class="stat">${_(e.scan_duration)}</span>`}
                </div>
                <div class="location-toggle">
                    <span class="toggle-icon">\u25BC</span>
                </div>
            </div>
            <div class="location-files" id="files-${e.id}" style="display: none;">
                ${t?Oe():e.files?K(e.files,e.id):'<p class="no-files">No files found</p>'}
            </div>
            ${e.error?`<div class="location-error">Error: ${e.error}</div>`:""}
        </div>
    `}function K(e,t){if(!e||e.length===0)return'<p class="no-files">No files found</p>';const s=500,n=[...e].sort((i,d)=>d.size-i.size).slice(0,s);let o="";return e.length>s&&(o=`<div class="file-table-warning">Showing first ${s} of ${e.length} files. Please refine your filters to see more.</div>`),`
        <div class="file-table-container">
            ${o}
            <table class="file-table" data-location-id="${t}">
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
                    ${n.map(i=>qe(i)).join("")}
                </tbody>
            </table>
        </div>
    `}function Oe(){return`
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
    `}function qe(e){const t=e.is_dir,s=t?"\u{1F4C1}":"\u{1F4C4}",a=t?"Directory":"File",n=t?"-":v(e.size),o=new Date(e.last_modified).toLocaleDateString(),i=new Date(e.last_accessed).toLocaleDateString();let d="",r="",u="none";if(!t&&e.safety_classification){const g=e.safety_classification;u=String(g.level||""),console.log(`File ${e.name}: safety level = "${u}"`);const S=X(u),w=Q(u);d=`
            <div class="safety-indicator" data-safety-level="${u}" title="${g.explanation||""}">
                <span class="safety-icon" style="color: ${w}">${S}</span>
                <span class="safety-confidence">${g.confidence||0}%</span>
            </div>
        `,r=`safety-${u.toLowerCase()}`}else t||console.log(`File ${e.name}: no safety classification`);return`
        <tr class="file-row ${r}" data-file-path="${e.path}" data-file-size="${e.size}" data-file-type="${a.toLowerCase()}" data-safety-level="${u||"none"}">
            <td class="file-name">
                <span class="file-icon">${s}</span>
                <span class="file-name-text" title="${e.path}">${e.name}</span>
            </td>
            <td class="file-size">${n}</td>
            <td class="file-modified">${o}</td>
            <td class="file-accessed">${i}</td>
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
    `}function X(e){switch(String(e||"").trim()){case"Safe":return"\u2705";case"Caution":return"\u26A0\uFE0F";case"Risky":return"\u{1F6AB}";default:return"\u2753"}}function Q(e){switch(String(e||"").trim()){case"Safe":return"#30d158";case"Caution":return"#ff9500";case"Risky":return"#ff3b30";default:return"#a0a0a0"}}function P(e){switch(String(e||"").trim()){case"Safe":return 1;case"Caution":return 2;case"Risky":return 3;default:return 4}}function Je(){const e=document.getElementById("fileSearch");e&&e.addEventListener("input",E);const t=document.getElementById("sizeFilter"),s=document.getElementById("typeFilter"),a=document.getElementById("safetyFilter");t&&t.addEventListener("change",E),s&&s.addEventListener("change",E),a&&a.addEventListener("change",E),document.querySelectorAll(".sortable").forEach(n=>{n.addEventListener("click",()=>We(n))})}function E(){var n,o,i,d;const e=((n=document.getElementById("fileSearch"))==null?void 0:n.value.toLowerCase())||"",t=((o=document.getElementById("sizeFilter"))==null?void 0:o.value)||"",s=((i=document.getElementById("typeFilter"))==null?void 0:i.value)||"",a=((d=document.getElementById("safetyFilter"))==null?void 0:d.value)||"";document.querySelectorAll(".file-row").forEach(r=>{const u=r.querySelector(".file-name-text").textContent.toLowerCase(),g=parseInt(r.dataset.fileSize),S=r.dataset.fileType,w=r.dataset.safetyLevel;let p=!0;if(e&&!u.includes(e)&&(p=!1),t){const m=g/1048576;t==="large"&&m<=10&&(p=!1),t==="medium"&&(m<=1||m>10)&&(p=!1),t==="small"&&m>=1&&(p=!1)}s&&S!==s&&(p=!1),a&&w!==a&&(p=!1),r.style.display=p?"":"none"})}function We(e){const t=e.closest("table"),s=t.querySelector("tbody"),a=Array.from(s.querySelectorAll("tr")),n=e.dataset.sort,o=e.classList.contains("sort-asc");t.querySelectorAll(".sortable").forEach(i=>{i.classList.remove("sort-asc","sort-desc")}),e.classList.add(o?"sort-desc":"sort-asc"),a.sort((i,d)=>{let r,u;switch(n){case"name":r=i.querySelector(".file-name-text").textContent.toLowerCase(),u=d.querySelector(".file-name-text").textContent.toLowerCase();break;case"size":r=parseInt(i.dataset.fileSize),u=parseInt(d.dataset.fileSize);break;case"modified":r=new Date(i.querySelector(".file-modified").textContent),u=new Date(d.querySelector(".file-modified").textContent);break;case"accessed":r=new Date(i.querySelector(".file-accessed").textContent),u=new Date(d.querySelector(".file-accessed").textContent);break;case"safety":r=P(i.dataset.safetyLevel),u=P(d.dataset.safetyLevel);break;default:return 0}return r<u?o?1:-1:r>u?o?-1:1:0}),a.forEach(i=>s.appendChild(i))}function Y(e){const t=document.getElementById(`files-${e}`),s=document.querySelector(`[data-location-id="${e}"] .toggle-icon`);t.style.display==="none"?(t.style.display="block",s.textContent="\u25B2"):(t.style.display="none",s.textContent="\u25BC")}function Z(e,t,s,a,n,o,i,d=""){console.log("showFileDetails called with:",{path:e,name:t,size:s,modified:a,accessed:n,type:o,permissions:i,safetyData:d});const r=document.createElement("div");r.className="file-details-modal";let u="";if(d)try{const g=JSON.parse(d.replace(/&#39;/g,"'")),S=X(g.level);u=`
                <div class="detail-row safety-row">
                    <span class="detail-label">Safety Level:</span>
                    <span class="detail-value">
                        <div class="safety-detail" style="color: ${Q(g.level)}">
                            <span class="safety-icon">${S}</span>
                            <span class="safety-level">${g.level}</span>
                            <span class="safety-confidence">(${g.confidence}% confidence)</span>
                        </div>
                    </span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Safety Explanation:</span>
                    <span class="detail-value safety-explanation">${g.explanation}</span>
                </div>
                ${g.reasons&&g.reasons.length>0?`
                    <div class="detail-row">
                        <span class="detail-label">Safety Reasons:</span>
                        <span class="detail-value">
                            <ul class="safety-reasons">
                                ${g.reasons.map(p=>`<li>${p}</li>`).join("")}
                            </ul>
                        </span>
                    </div>
                `:""}
            `}catch(g){console.error("Error parsing safety data:",g)}r.innerHTML=`
        <div class="modal-overlay" onclick="closeFileDetails()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>File Details</h3>
                    <button class="modal-close" onclick="closeFileDetails()">\xD7</button>
                </div>
                <div class="modal-body">
                    <div class="detail-row">
                        <span class="detail-label">Name:</span>
                        <span class="detail-value">${t}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Path:</span>
                        <span class="detail-value" title="${e}">${e}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Size:</span>
                        <span class="detail-value">${v(s)}</span>
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
                        <span class="detail-value">${i}</span>
                    </div>
                    ${u}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="revealInFinder('${e}')">Reveal in Finder</button>
                    <button class="btn btn-secondary" onclick="closeFileDetails()">Close</button>
                </div>
            </div>
        </div>
    `,document.body.appendChild(r)}function Ge(){const e=document.querySelector(".file-details-modal");e&&e.remove()}async function ee(e){console.log("Reveal in Finder:",e);try{const t=await Ee(e),s=JSON.parse(t);s.status==="success"?k(s.message):c(`Failed to reveal in Finder: ${s.message||"Unknown error"}`)}catch(t){console.error("Failed to reveal in Finder:",t),c(`Failed to reveal in Finder: ${t.message}`)}}function He(){console.log("selectAllSafeFiles called");const e=document.querySelectorAll(".file-row");console.log("Total file rows found:",e.length);const t=new Set;e.forEach(n=>{const o=n.getAttribute("data-safety-level");o&&t.add(o)}),console.log("Safety levels found:",Array.from(t));const s=document.querySelectorAll('.file-row[data-safety-level="Safe"], .file-row[data-safety-level="safe"]');if(console.log("Safe rows found:",s.length),s.length===0){const n=Array.from(e).filter(o=>{const i=o.getAttribute("data-safety-level");return i&&i.toLowerCase().includes("safe")});if(console.log("Potential safe rows (case-insensitive):",n.length),n.length>0)n.forEach(o=>{if(o.classList.add("selected"),o.querySelector(".file-checkbox"))o.querySelector(".file-checkbox").checked=!0;else{const i=document.createElement("input");i.type="checkbox",i.className="file-checkbox",i.checked=!0,i.addEventListener("change",d=>{o.classList.toggle("selected",d.target.checked)}),o.querySelector(".file-name").prepend(i)}});else{const o=document.querySelectorAll(".file-row");o.length===0?c("No files found. Please scan a cache location first."):c(`No safe files found to select. Found ${o.length} files total. Make sure files have been classified as safe.`);return}}else s.forEach(n=>{if(n.classList.add("selected"),n.querySelector(".file-checkbox"))n.querySelector(".file-checkbox").checked=!0;else{const o=document.createElement("input");o.type="checkbox",o.className="file-checkbox",o.checked=!0,o.addEventListener("change",i=>{n.classList.toggle("selected",i.target.checked)}),n.querySelector(".file-name").prepend(o)}});te();const a=document.querySelectorAll(".file-row.selected").length;a>0&&k(`Successfully selected ${a} safe files`)}function je(){document.querySelectorAll(".file-row").forEach(e=>{e.classList.remove("selected");const t=e.querySelector(".file-checkbox");t&&(t.checked=!1)}),te()}function te(){const e=document.querySelectorAll(".file-row.selected").length,t=Array.from(document.querySelectorAll(".file-row.selected")).reduce((a,n)=>a+parseInt(n.dataset.fileSize||0),0);let s=document.querySelector(".selection-summary");!s&&e>0&&(s=document.createElement("div"),s.className="selection-summary",document.querySelector(".file-controls").appendChild(s)),s&&(e>0?s.innerHTML=`
                <div class="selection-info">
                    <span class="selection-count">${e} files selected</span>
                    <span class="selection-size">Total: ${v(t)}</span>
                    <button class="btn btn-danger btn-sm" onclick="deleteSelectedFiles()">
                        <span class="btn-icon">\u{1F5D1}\uFE0F</span>
                        Delete Selected
                    </button>
                </div>
            `:s.remove())}let se=[];async function Ue(){const e=Array.from(document.querySelectorAll(".file-row.selected"));if(e.length===0){c("No files selected for deletion");return}const t=e.map(s=>s.dataset.filePath);se=t;try{l("Validating files for deletion...",!0);const s=await ze(JSON.stringify(t),"manual_deletion"),a=JSON.parse(s),n=await be(JSON.stringify(t),"manual_deletion",!1,!1),o=JSON.parse(n);Qe(o,a)}catch(s){console.error("Deletion error:",s),c(`Deletion failed: ${s.message}`),l("Deletion failed",!1)}}function h(e){const t=document.getElementById("scanButton"),s=document.getElementById("scanAllButton"),a=document.getElementById("stopButton");t.disabled=e,s.disabled=e,a.disabled=!e,e?(t.innerHTML='<span class="btn-icon">\u23F3</span>Scanning...',s.innerHTML='<span class="btn-icon">\u23F3</span>Scanning...'):(t.innerHTML='<span class="btn-icon">\u{1F50D}</span>Scan Selected Location',s.innerHTML='<span class="btn-icon">\u{1F310}</span>Scan All Safe Locations')}function l(e,t=!0){const s=document.getElementById("progressContainer"),a=document.getElementById("progressText");if(t){a.textContent=e,s.style.display="block",ae();const n=document.getElementById("progressBar");n&&(n.style.width="100%",n.style.animation="pulse 2s infinite")}else{s.style.display="none";const n=document.getElementById("progressBar");n&&(n.style.animation="none")}}function ae(){if(!$)return;const e=Math.floor((Date.now()-$)/1e3),t=Math.floor(e/60),s=e%60,a=`${t.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`,n=document.getElementById("progressTime");n&&(n.textContent=a)}function c(e,t=!1,s=null){const a=document.getElementById("errorContainer");document.getElementById("errorMessage");const n=`
        <div class="error-icon">\u26A0\uFE0F</div>
        <div class="error-content">
            <h4>Error</h4>
            <p>${e}</p>
            ${t&&s?`
                <button class="btn btn-outline retry-button" onclick="retryCallback()">
                    <span class="btn-icon">\u{1F504}</span>
                    Retry
                </button>
            `:""}
        </div>
        <button id="errorClose" class="error-close">\xD7</button>
    `;a.innerHTML=n,a.style.display="flex";const o=a.querySelector("#errorClose");o&&o.addEventListener("click",B),t||setTimeout(()=>{B()},1e4)}function B(){const e=document.getElementById("errorContainer");e.style.display="none"}function Ve(){y&&clearInterval(y);let e=null;y=setInterval(async()=>{try{const t=await Ce();if(($?Date.now()-$:0)>3e5){clearInterval(y),y=null,h(!1),c("Scan timed out after 5 minutes. Please try again.");return}try{const a=await $e();console.log("Raw result from GetLastScanResult:",a);const n=JSON.parse(a);if(n&&n.status!=="no_result"&&n.id){console.log("Got valid scan result:",n),clearInterval(y),y=null,R(n),D=n,h(!1),l("Scan completed!",!1);return}else console.log("No valid result yet, status:",n==null?void 0:n.status,"id:",n==null?void 0:n.id)}catch(a){console.log("No result available yet:",a.message)}if(t)e=null;else if(!e)e=Date.now();else if(Date.now()-e>1e4){clearInterval(y),y=null,h(!1),c("Scan completed but no result was returned. Please try again.");return}ae(),l("Scanning in progress...",!0)}catch(t){console.error("Error polling progress:",t),l("Scanning... (progress unavailable)",!0)}},200)}function Ke(){y&&(clearInterval(y),y=null)}function Xe(){if(!D){c("No results to export");return}const e=JSON.stringify(D,null,2),t=new Blob([e],{type:"application/json"}),s=document.createElement("a");s.href=URL.createObjectURL(t),s.download=`cache-scan-results-${new Date().toISOString().split("T")[0]}.json`,s.click()}function v(e){if(e===0)return"0 Bytes";const t=1024,s=["Bytes","KB","MB","GB","TB"],a=Math.floor(Math.log(e)/Math.log(t));return parseFloat((e/Math.pow(t,a)).toFixed(2))+" "+s[a]}function _(e){const t=e/1e9;if(t<1)return(e/1e6).toFixed(0)+"ms";if(t<60)return t.toFixed(2)+"s";{const s=Math.floor(t/60),a=t%60;return`${s}m ${a.toFixed(1)}s`}}function Qe(e,t){const s=document.createElement("div");s.className="deletion-confirmation-modal",window.currentDeletionDialog=e;const a=e.warnings&&e.warnings.length>0?`
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
    `:"";s.innerHTML=`
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
                    <button class="btn btn-danger" id="confirmDeletionBtn">
                        <span class="btn-icon">\u{1F5D1}\uFE0F</span>
                        Confirm Deletion
                    </button>
                </div>
            </div>
        </div>
    `,document.body.appendChild(s),document.getElementById("confirmDeletionBtn").addEventListener("click",function(){oe(JSON.stringify(window.currentDeletionDialog))})}function ne(){const e=document.querySelector(".deletion-confirmation-modal");e&&e.remove(),window.currentDeletionDialog&&delete window.currentDeletionDialog}async function oe(e){try{const t=document.getElementById("forceDeleteCheckbox").checked,s=document.getElementById("dryRunCheckbox").checked;ne(),l("Starting deletion operation...",!0);const a=await ye(e,JSON.stringify(se),!0,t,s),n=JSON.parse(a);n.status==="started"?Ye(n.operation_id):(c("Failed to start deletion operation"),l("Deletion failed",!1))}catch(t){console.error("Confirmation error:",t),c(`Deletion confirmation failed: ${t.message}`),l("Deletion failed",!1)}}let b=null;function Ye(e){b&&clearInterval(b),b=setInterval(async()=>{try{const t=await ke(e),s=JSON.parse(t);if(s.error||s.status==="error"){console.error("Progress tracking error:",s.message),clearInterval(b),b=null,c(`Progress monitoring failed: ${s.message}`),l("Deletion monitoring failed",!1);return}Ze(s),(s.status==="completed"||s.status==="failed"||s.status==="cancelled")&&(clearInterval(b),b=null,s.status==="completed"?(l("Deletion completed successfully!",!1),et(s)):(c(`Deletion ${s.status}: ${s.message}`),l("Deletion failed",!1)))}catch(t){console.error("Progress monitoring error:",t),clearInterval(b),b=null,c("Failed to monitor deletion progress"),l("Deletion failed",!1)}},500)}function Ze(e){const t=document.getElementById("progressText"),s=document.getElementById("progressBar");t&&(t.textContent=e.message||"Processing..."),s&&(s.style.width=`${e.progress||0}%`,s.style.animation="none");const a=document.getElementById("filesScanned"),n=document.getElementById("sizeFound");a&&(a.textContent=`${e.files_processed||0} / ${e.total_files||0}`),n&&(n.textContent=v(e.current_size||0))}function k(e){const t=document.createElement("div");t.className="success-container",t.innerHTML=`
        <div class="success-icon">\u2705</div>
        <div class="success-content">
            <h4>Success</h4>
            <p>${e}</p>
        </div>
        <button class="success-close" onclick="this.parentElement.remove()">\xD7</button>
    `;const s=document.getElementById("progressContainer");s&&s.parentNode&&s.parentNode.insertBefore(t,s.nextSibling),setTimeout(()=>{t.parentNode&&t.remove()},5e3)}function et(e){const t=e.files_processed||0,s=e.total_size||0,a=v(s),n=_(e.elapsed_time||0),o=document.createElement("div");o.className="success-container deletion-success",o.innerHTML=`
        <div class="success-icon">\u{1F389}</div>
        <div class="success-content">
            <h4>Deletion Completed Successfully!</h4>
            <div class="deletion-stats">
                <div class="stat-item">
                    <span class="stat-label">Files Deleted:</span>
                    <span class="stat-value">${t}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Space Freed:</span>
                    <span class="stat-value">${a}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Duration:</span>
                    <span class="stat-value">${n}</span>
                </div>
            </div>
            <div class="deletion-message">
                <p>All cache files have been safely deleted and backed up.</p>
                <p class="backup-info">\u{1F4BE} Backup created - files can be restored if needed</p>
            </div>
        </div>
        <button class="success-close" onclick="this.parentElement.remove()">\xD7</button>
    `;const i=document.getElementById("progressContainer");i&&i.parentNode&&i.parentNode.insertBefore(o,i.nextSibling),setTimeout(()=>{o.parentNode&&o.remove()},8e3)}async function tt(){try{const e=await Se(),t=JSON.parse(e);if(t.length===0){c("No backup sessions available for restore");return}st(t)}catch(e){console.error("Error getting backups:",e),c(`Failed to get backup sessions: ${e.message}`)}}function st(e){const t=document.createElement("div");t.className="restore-modal";const s=e.map(a=>`
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
    `).join("");t.innerHTML=`
        <div class="modal-overlay" onclick="closeRestoreDialog()">
            <div class="modal-content restore-modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>\u{1F504} Restore from Backup</h3>
                    <button class="modal-close" onclick="closeRestoreDialog()">\xD7</button>
                </div>
                <div class="modal-body">
                    <p>Select a backup session to restore files from:</p>
                    <div class="backup-list">
                        ${s}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeRestoreDialog()">Cancel</button>
                </div>
            </div>
        </div>
    `,document.body.appendChild(t)}function ie(){const e=document.querySelector(".restore-modal");e&&e.remove()}async function at(e){try{ie(),l("Starting restore operation...",!0);const t=await De(e,!1),s=JSON.parse(t);l("Restore completed successfully!",!1),k(`Successfully restored ${s.success_count} files from backup`)}catch(t){console.error("Restore error:",t),c(`Restore failed: ${t.message}`),l("Restore failed",!1)}}let z=null,nt=null;async function le(){try{l("Loading backup data...",!0);const e=await q(),t=JSON.parse(e);z=t,l("Backup data loaded",!1),ot(t)}catch(e){console.error("Error loading backup data:",e),c(`Failed to load backup data: ${e.message}`),l("Failed to load backup data",!1)}}function ot(e){const t=document.createElement("div");t.className="backup-manager-modal";const s=e.summary,a=e.sessions||[];t.innerHTML=`
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
                                    <h4>${s.total_sessions}</h4>
                                    <p>Backup Sessions</p>
                                </div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-icon">\u{1F4C1}</div>
                                <div class="summary-content">
                                    <h4>${s.total_files.toLocaleString()}</h4>
                                    <p>Total Files</p>
                                </div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-icon">\u{1F4BE}</div>
                                <div class="summary-content">
                                    <h4>${v(s.total_size)}</h4>
                                    <p>Total Size</p>
                                </div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-icon">\u{1F5D3}\uFE0F</div>
                                <div class="summary-content">
                                    <h4>${s.oldest_session?new Date(s.oldest_session).toLocaleDateString():"N/A"}</h4>
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
                                ${a.map(n=>ce(n)).join("")}
                            </div>`}
                    </div>
                </div>
            </div>
        </div>
    `,document.body.appendChild(t),it()}function ce(e){const t=new Date(e.start_time),a=new Date(e.end_time)-t;return`
        <div class="backup-session-card" data-session-id="${e.session_id}">
            <div class="session-header">
                <div class="session-info">
                    <h5>${e.operation}</h5>
                    <p class="session-id">Session: ${e.session_id}</p>
                    <p class="session-time">${t.toLocaleString()}</p>
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
                        <span class="stat-value">${_(a)}</span>
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
    `}function it(){const e=document.getElementById("backupSearch"),t=document.getElementById("backupFilter");e&&e.addEventListener("input",O),t&&t.addEventListener("change",O)}function O(){var s,a;const e=((s=document.getElementById("backupSearch"))==null?void 0:s.value.toLowerCase())||"",t=((a=document.getElementById("backupFilter"))==null?void 0:a.value)||"";document.querySelectorAll(".backup-session-card").forEach(n=>{const o=n.dataset.sessionId,i=z.sessions.find(r=>r.session_id===o);if(!i)return;let d=!0;e&&(`${i.operation} ${i.session_id}`.toLowerCase().includes(e)||(d=!1)),t&&i.operation!==t&&(d=!1),n.style.display=d?"":"none"})}function lt(){const e=document.querySelector(".backup-manager-modal");e&&e.remove()}async function M(){try{l("Refreshing backup data...",!0);const e=await q(),t=JSON.parse(e);z=t;const s=document.querySelector(".sessions-list");s&&(s.innerHTML=t.sessions.map(n=>ce(n)).join(""));const a=t.summary;document.querySelector(".summary-item:nth-child(1) h4").textContent=a.total_sessions,document.querySelector(".summary-item:nth-child(2) h4").textContent=a.total_files.toLocaleString(),document.querySelector(".summary-item:nth-child(3) h4").textContent=v(a.total_size),document.querySelector(".summary-item:nth-child(4) h4").textContent=a.oldest_session?new Date(a.oldest_session).toLocaleDateString():"N/A",l("Backup data refreshed",!1)}catch(e){console.error("Error refreshing backup data:",e),c(`Failed to refresh backup data: ${e.message}`),l("Failed to refresh backup data",!1)}}async function ct(e){try{l("Loading session details...",!0);const t=await we(e),s=JSON.parse(t);nt=s,l("Session details loaded",!1),rt(s)}catch(t){console.error("Error loading session details:",t),c(`Failed to load session details: ${t.message}`),l("Failed to load session details",!1)}}function rt(e){const t=e.session,s=document.createElement("div");s.className="backup-details-modal";const a=e.integrity_valid?'<span class="status-badge status-completed">\u2705 Valid</span>':'<span class="status-badge status-failed">\u274C Invalid</span>',n=e.integrity_errors.length>0?`<div class="integrity-errors">
            <h5>Integrity Errors:</h5>
            <ul>${e.integrity_errors.map(i=>`<li>${i}</li>`).join("")}</ul>
        </div>`:"";s.innerHTML=`
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
                                <span class="overview-value">${t.session_id}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Operation:</span>
                                <span class="overview-value">${t.operation}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Status:</span>
                                <span class="overview-value"><span class="status-badge status-${t.status}">${t.status}</span></span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Start Time:</span>
                                <span class="overview-value">${new Date(t.start_time).toLocaleString()}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">End Time:</span>
                                <span class="overview-value">${new Date(t.end_time).toLocaleString()}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Duration:</span>
                                <span class="overview-value">${_(new Date(t.end_time)-new Date(t.start_time))}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Total Files:</span>
                                <span class="overview-value">${t.total_files}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Success Count:</span>
                                <span class="overview-value">${t.success_count}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Failure Count:</span>
                                <span class="overview-value">${t.failure_count}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Total Size:</span>
                                <span class="overview-value">${v(t.total_size)}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Backup Size:</span>
                                <span class="overview-value">${v(t.backup_size)}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Integrity:</span>
                                <span class="overview-value">${a}</span>
                            </div>
                        </div>
                    </div>
                    
                    ${n}
                    
                    <div class="backup-files">
                        <h4>Backed Up Files (${t.entries.length})</h4>
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
                                <button class="btn btn-primary btn-sm" onclick="restoreSelectedFiles('${t.session_id}')">
                                    <span class="btn-icon">\u{1F504}</span>
                                    Restore Selected
                                </button>
                            </div>
                        </div>
                        <div class="files-list">
                            ${dt(t.entries)}
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeBackupDetails()">Close</button>
                    <button class="btn btn-secondary" onclick="restoreBackupSession('${t.session_id}')">
                        <span class="btn-icon">\u{1F504}</span>
                        Restore All Files
                    </button>
                </div>
            </div>
        </div>
    `,document.body.appendChild(s);const o=document.getElementById("fileSearchDetails");o&&o.addEventListener("input",ut)}function dt(e){return`
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
                ${e.map(t=>`
                    <tr class="backup-file-row" data-file-path="${t.original_path}">
                        <td><input type="checkbox" class="file-checkbox" value="${t.original_path}"></td>
                        <td class="file-path" title="${t.original_path}">${t.original_path}</td>
                        <td class="file-size">${v(t.size)}</td>
                        <td class="file-time">${new Date(t.backup_time).toLocaleString()}</td>
                        <td class="file-status">
                            <span class="status-badge status-${t.success?"completed":"failed"}">
                                ${t.success?"\u2705 Success":"\u274C Failed"}
                            </span>
                        </td>
                        <td class="file-checksum" title="${t.checksum}">${t.checksum.substring(0,16)}...</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `}function ut(){var t;const e=((t=document.getElementById("fileSearchDetails"))==null?void 0:t.value.toLowerCase())||"";document.querySelectorAll(".backup-file-row").forEach(s=>{const a=s.dataset.filePath.toLowerCase(),n=!e||a.includes(e);s.style.display=n?"":"none"})}function pt(){const e=document.querySelector(".backup-details-modal");e&&e.remove()}async function ft(e){try{if(!confirm(`Are you sure you want to restore all files from backup session ${e}? This will overwrite existing files.`))return;l("Starting restore operation...",!0);const s=await W(e,"",!0,!1),a=JSON.parse(s);l("Restore completed successfully!",!1),k(`Successfully restored ${a.success_count} files from backup`)}catch(t){console.error("Restore error:",t),c(`Restore failed: ${t.message}`),l("Restore failed",!1)}}async function mt(e){const t=Array.from(document.querySelectorAll(".file-checkbox:checked")).map(s=>s.value);if(t.length===0){c("No files selected for restore");return}try{if(!confirm(`Are you sure you want to restore ${t.length} selected files? This will overwrite existing files.`))return;l("Starting selective restore operation...",!0);const a=await W(e,JSON.stringify(t),!0,!1),n=JSON.parse(a);l("Selective restore completed successfully!",!1),k(`Successfully restored ${n.success_count} files from backup`)}catch(s){console.error("Selective restore error:",s),c(`Selective restore failed: ${s.message}`),l("Selective restore failed",!1)}}async function vt(e){try{if(!confirm(`Are you sure you want to delete backup session ${e}? This action cannot be undone.`))return;l("Deleting backup session...",!0);const s=await he(e),a=JSON.parse(s);l("Backup session deleted successfully!",!1),k(`Successfully deleted backup session ${e}`),await M()}catch(t){console.error("Delete error:",t),c(`Delete failed: ${t.message}`),l("Delete failed",!1)}}async function gt(){try{const e=prompt("Enter the number of days (backups older than this will be deleted):","30");if(!e||isNaN(e))return;const t=parseInt(e);if(t<=0){c("Please enter a valid number of days");return}if(!confirm(`Are you sure you want to delete all backup sessions older than ${t} days? This action cannot be undone.`))return;l("Cleaning up old backups...",!0);const a=await ge(t),n=JSON.parse(a);l("Cleanup completed successfully!",!1),k(`Successfully deleted ${n.deleted_count} old backup sessions`),await M()}catch(e){console.error("Cleanup error:",e),c(`Cleanup failed: ${e.message}`),l("Cleanup failed",!1)}}async function yt(e){try{l("Generating restore preview...",!0);const t=await Fe(e,""),s=JSON.parse(t);l("Restore preview generated",!1),ht(e,s)}catch(t){console.error("Preview error:",t),c(`Preview failed: ${t.message}`),l("Preview failed",!1)}}function ht(e,t){const s=document.createElement("div");s.className="restore-preview-modal",s.innerHTML=`
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
                                    <h4>${t.total_files}</h4>
                                    <p>Total Files</p>
                                </div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-icon">\u2705</div>
                                <div class="summary-content">
                                    <h4>${t.success_count}</h4>
                                    <p>Can Restore</p>
                                </div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-icon">\u274C</div>
                                <div class="summary-content">
                                    <h4>${t.failure_count}</h4>
                                    <p>Would Conflict</p>
                                </div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-icon">\u{1F4BE}</div>
                                <div class="summary-content">
                                    <h4>${v(t.restored_size)}</h4>
                                    <p>Size to Restore</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="preview-details">
                        <div class="restoreable-files">
                            <h4>Files That Can Be Restored (${t.restored_files.length})</h4>
                            <div class="files-list">
                                ${t.restored_files.map(a=>`
                                    <div class="file-item">
                                        <span class="file-icon">\u2705</span>
                                        <span class="file-path">${a}</span>
                                    </div>
                                `).join("")}
                            </div>
                        </div>
                        
                        ${t.failed_files.length>0?`
                            <div class="conflicting-files">
                                <h4>Files That Would Conflict (${t.failed_files.length})</h4>
                                <div class="files-list">
                                    ${t.failed_files.map(a=>`
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
    `,document.body.appendChild(s)}function bt(){const e=document.querySelector(".restore-preview-modal");e&&e.remove()}let f=null;function St(){console.log("showSettingsModal called");const e=document.getElementById("settingsModal");console.log("Modal element:",e),e?(console.log("Adding active class to modal"),e.classList.add("active"),console.log("Modal classes after adding active:",e.className),console.log("Modal computed styles:",window.getComputedStyle(e)),wt()):console.error("Settings modal element not found!")}function x(){const e=document.getElementById("settingsModal");e&&e.classList.remove("active")}async function wt(){try{if(!window.go||!window.go.main||!window.go.main.App){console.warn("Wails runtime not available, using demo settings"),A();return}l("Loading settings...",!0);const e=await Be();f=JSON.parse(e),N(),l("Settings loaded",!1)}catch(e){console.error("Error loading settings:",e),console.warn("Falling back to demo settings"),A(),c(`Failed to load settings: ${e.message}`),l("Failed to load settings",!1)}}function A(){console.log("Loading demo settings..."),console.log("Current settings before:",f),f={backup:{retention_days:30,max_backup_size_mb:1024,auto_cleanup:!0,cleanup_threshold_days:7,compress_backups:!0,verify_integrity:!0,create_manifest:!0},safety:{default_safe_level:"Safe",require_confirmation:!0,show_safety_warnings:!0,confirm_deletion:!0,confirm_large_files:!0,confirm_system_files:!0,large_file_threshold_mb:100,safe_age_threshold_days:30,caution_age_threshold_days:7,protect_system_paths:!0,protect_user_data:!0,protect_dev_files:!0},performance:{scan_depth:5,max_file_size_mb:500,concurrent_scans:3,scan_timeout_seconds:300,max_memory_usage_mb:512,enable_caching:!0,cache_size_mb:64,update_interval_ms:1e3,show_progress:!0,verbose_logging:!1},privacy:{enable_cloud_ai:!1,share_analytics:!1,share_crash_reports:!1,collect_usage_stats:!1,collect_error_logs:!0,collect_performance:!1,retain_logs_days:7,retain_stats_days:30,auto_delete_old_data:!0},ui:{theme:"auto",language:"en",font_size:14,window_width:1024,window_height:768,remember_window_size:!0,show_notifications:!0,notification_sound:!0,notification_duration_ms:3e3,high_contrast:!1,reduce_animations:!1,screen_reader:!1}},console.log("Demo settings created:",f),N(),l("Demo settings loaded",!1)}function N(){if(console.log("populateSettingsForms called with:",f),!f){console.log("No current settings, returning");return}F("backup-form",f.backup),F("safety-form",f.safety),F("performance-form",f.performance),F("privacy-form",f.privacy),F("ui-form",f.ui)}function F(e,t){console.log(`populateForm called for ${e} with data:`,t);const s=document.getElementById(e);if(console.log(`Form element found for ${e}:`,s),!s||!t){console.log(`No form found for ${e} or no data provided`);return}Object.keys(t).forEach(a=>{const n=s.querySelector(`[name="${a}"]`);!n||(n.type==="checkbox"?n.checked=t[a]:(n.type,n.value=t[a]))})}function kt(e){document.querySelectorAll(".settings-category-btn").forEach(t=>{t.classList.remove("active")}),document.querySelector(`[data-category="${e}"]`).classList.add("active"),document.querySelectorAll(".settings-section").forEach(t=>{t.classList.remove("active")}),document.getElementById(`${e}-settings`).classList.add("active")}async function $t(){try{if(l("Saving settings...",!0),!window.go||!window.go.main||!window.go.main.App){console.warn("Wails runtime not available, settings will not persist"),l("Settings updated (demo mode)",!1),showSuccess("Settings updated! Note: Settings will not persist in demo mode.");return}const e=L("backup-form"),t=L("safety-form"),s=L("performance-form"),a=L("privacy-form"),n=L("ui-form");if(f){f.backup={...f.backup,...e},f.safety={...f.safety,...t},f.performance={...f.performance,...s},f.privacy={...f.privacy,...a},f.ui={...f.ui,...n};const o=await Re(JSON.stringify(f));JSON.parse(o).status==="success"?(l("Settings saved successfully",!1),showSuccess("Settings saved successfully!")):(c("Failed to save settings"),l("Failed to save settings",!1))}}catch(e){console.error("Error saving settings:",e),c(`Failed to save settings: ${e.message}`),l("Failed to save settings",!1)}}async function Bt(){if(!!confirm("Are you sure you want to reset all settings to defaults? This cannot be undone."))try{if(l("Resetting settings...",!0),!window.go||!window.go.main||!window.go.main.App){console.warn("Wails runtime not available, resetting to demo defaults"),A(),l("Settings reset (demo mode)",!1),showSuccess("Settings reset to defaults! Note: In demo mode, settings will not persist.");return}const e=await Le(),t=JSON.parse(e);t.status==="success"?(f=t.settings,N(),l("Settings reset successfully",!1),showSuccess("Settings reset to defaults!")):(c("Failed to reset settings"),l("Failed to reset settings",!1))}catch(e){console.error("Error resetting settings:",e),console.warn("Falling back to demo settings reset"),A(),c(`Failed to reset settings: ${e.message}`),l("Failed to reset settings",!1)}}function L(e){const t=document.getElementById(e),s=new FormData(t),a={};for(let[n,o]of s.entries()){const i=t.querySelector(`[name="${n}"]`);i.type==="checkbox"?a[n]=i.checked:i.type==="number"?a[n]=parseInt(o):a[n]=o}return a}

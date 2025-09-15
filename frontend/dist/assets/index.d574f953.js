(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&a(l)}).observe(document,{childList:!0,subtree:!0});function t(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerpolicy&&(i.referrerPolicy=n.referrerpolicy),n.crossorigin==="use-credentials"?i.credentials="include":n.crossorigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(n){if(n.ep)return;n.ep=!0;const i=t(n);fetch(n.href,i)}})();function ee(e){return window.go.main.App.CleanupBackupsByAge(e)}function se(e,s,t,a,n){return window.go.main.App.ConfirmDeletion(e,s,t,a,n)}function te(e){return window.go.main.App.DeleteBackupSession(e)}function ae(e,s,t,a){return window.go.main.App.DeleteFilesWithConfirmation(e,s,t,a)}function ne(){return window.go.main.App.GetAvailableBackups()}function I(){return window.go.main.App.GetBackupBrowserData()}function ie(e){return window.go.main.App.GetBackupSessionDetails(e)}function R(){return window.go.main.App.GetCacheLocationsFromConfig()}function oe(e){return window.go.main.App.GetDeletionProgress(e)}function le(){return window.go.main.App.GetLastScanResult()}function ce(){return window.go.main.App.GetSystemInfo()}function re(){return window.go.main.App.IsScanning()}function de(e,s){return window.go.main.App.PreviewRestoreOperation(e,s)}function ue(e,s){return window.go.main.App.RestoreFromBackup(e,s)}function z(e,s,t,a){return window.go.main.App.RestoreFromBackupWithOptions(e,s,t,a)}function pe(e){return window.go.main.App.RevealInFinder(e)}function fe(e,s,t){return window.go.main.App.ScanCacheLocation(e,s,t)}function ve(e){return window.go.main.App.ScanMultipleCacheLocations(e)}function me(){return window.go.main.App.StopScan()}function ye(e,s){return window.go.main.App.ValidateFilesForDeletion(e,s)}let k=null,y=null,F=null;document.addEventListener("DOMContentLoaded",function(){he(),T(),ge(),window.selectAllSafeFiles=Le,window.clearFileSelection=De,window.showUndoOptions=Ne,window.showFileDetails=H,window.closeFileDetails=Fe,window.revealInFinder=G,window.toggleLocationFiles=J,window.deleteSelectedFiles=Ee,window.confirmDeletion=Re,window.closeDeletionConfirmation=W,window.closeRestoreDialog=K,window.restoreFromBackup=Oe,window.showBackupManager=Q,window.closeBackupManager=He,window.refreshBackupData=E,window.showBackupDetails=Ge,window.closeBackupDetails=We,window.restoreBackupSession=Ke,window.restoreSelectedFiles=Qe,window.deleteBackupSession=Xe,window.cleanupOldBackups=Ye,window.previewRestore=Ze,window.closeRestorePreview=ss});function he(){document.querySelector("#app").innerHTML=`
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
    `}async function T(){try{const e=await R(),s=JSON.parse(e);be(s);const t=await ce(),a=JSON.parse(t);Se(a)}catch(e){console.error("Error initializing app:",e),d("Failed to initialize application: "+e.message)}}function ge(){const e=document.getElementById("scanButton"),s=document.getElementById("scanAllButton"),t=document.getElementById("stopButton"),a=document.getElementById("refreshButton"),n=document.getElementById("exportButton"),i=document.getElementById("errorClose"),l=document.getElementById("backupManagerButton");e&&e.addEventListener("click",N),s&&s.addEventListener("click",M),t&&t.addEventListener("click",async()=>{try{await me(),_e(),m(!1),o("Scan stopped by user",!1)}catch(r){d("Failed to stop scan: "+r.message)}}),a&&a.addEventListener("click",T),n&&n.addEventListener("click",xe),i&&i.addEventListener("click",$),l&&l.addEventListener("click",Q),document.addEventListener("click",function(r){if(r.target.classList.contains("btn-icon")&&r.target.getAttribute("title")==="View Details"){const c=r.target.closest(".file-row");if(c){const u=c.dataset.filePath,f=c.querySelector(".file-name-text").textContent,g=parseInt(c.dataset.fileSize),S=c.dataset.fileType,v=c.querySelector(".file-modified").textContent,w=c.querySelector(".file-accessed").textContent,Y=c.querySelector(".file-actions").getAttribute("data-permissions")||"",Z=c.querySelector(".file-actions").getAttribute("data-safety")||"";H(u,f,g,v,w,S,Y,Z)}}if(r.target.classList.contains("btn-icon")&&r.target.getAttribute("title")==="Reveal in Finder"){const c=r.target.closest(".file-row");if(c){const u=c.dataset.filePath;G(u)}}if(r.target.classList.contains("toggle-icon")||r.target.closest(".location-header")){const c=r.target.closest(".location-card");if(c){const u=c.dataset.locationId;J(u)}}})}function be(e){const s=document.getElementById("locationSelect");s.innerHTML="";const t=document.createElement("option");t.value="",t.textContent="Select a cache location...",s.appendChild(t),e.forEach(a=>{const n=document.createElement("option");n.value=JSON.stringify(a),n.textContent=`${a.name} (${a.type})`,s.appendChild(n)})}function Se(e){document.getElementById("osInfo").textContent=e.os,document.getElementById("appVersion").textContent=e.app_version,document.getElementById("goVersion").textContent=e.go_version,document.getElementById("lastUpdated").textContent=new Date(e.scan_time).toLocaleString()}async function N(){const e=document.getElementById("locationSelect"),s=e.options[e.selectedIndex];if(!s.value){d("Please select a cache location to scan");return}const t=JSON.parse(s.value);try{m(!0),o("Starting scan...",!0),F=Date.now();const a=await fe(t.id,t.name,t.path),n=JSON.parse(a);n.status==="scan_started"?(o("Scan started in background...",!0),Ae()):(L(n),k=n,m(!1))}catch(a){console.error("Scan error:",a),d(`Scan failed: ${a.message}`,!0,()=>{$(),N()}),m(!1),o("Scan failed",!1)}}async function M(){try{m(!0),o("Starting full system scan...",!0),F=Date.now();const e=await R(),t=JSON.parse(e).filter(i=>i.type==="user"||i.type==="application");if(t.length===0){d("No safe cache locations found to scan"),m(!1),o("No locations to scan",!1);return}const a=await ve(JSON.stringify(t)),n=JSON.parse(a);L(n),k=n,m(!1),o("Scan completed!",!1)}catch(e){console.error("Full scan error:",e),d(`Full scan failed: ${e.message}`,!0,()=>{$(),M()}),m(!1),o("Scan failed",!1)}}function A(e){let s=0,t=0,a=0,n=0,i=0,l=0,r=0;return e.forEach(c=>{if(!c.is_dir&&c.safety_classification){n++;const u=c.size||0;switch(String(c.safety_classification.level||"").trim()){case"Safe":s++,i+=u;break;case"Caution":t++,l+=u;break;case"Risky":a++,r+=u;break}}}),{totalFiles:n,safeCount:s,cautionCount:t,riskyCount:a,safeSize:i,cautionSize:l,riskySize:r,safePercentage:n>0?Math.round(s/n*100):0,cautionPercentage:n>0?Math.round(t/n*100):0,riskyPercentage:n>0?Math.round(a/n*100):0}}function L(e){const s=document.getElementById("scanResults"),t=document.getElementById("exportButton");if(e.locations){const a=e.locations.flatMap(i=>i.files||[]),n=A(a);s.innerHTML=`
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
                        <h3>${p(e.total_size)}</h3>
                        <p>Total Size</p>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">\u23F1\uFE0F</div>
                    <div class="summary-content">
                        <h3>${B(e.scan_duration)}</h3>
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
                            <h4>${n.safeCount}</h4>
                            <p>Safe Files (${n.safePercentage}%)</p>
                            <span class="safety-size">${p(n.safeSize)}</span>
                        </div>
                    </div>
                    <div class="safety-card caution-card">
                        <div class="safety-icon">\u26A0\uFE0F</div>
                        <div class="safety-content">
                            <h4>${n.cautionCount}</h4>
                            <p>Caution Files (${n.cautionPercentage}%)</p>
                            <span class="safety-size">${p(n.cautionSize)}</span>
                        </div>
                    </div>
                    <div class="safety-card risky-card">
                        <div class="safety-icon">\u{1F6AB}</div>
                        <div class="safety-content">
                            <h4>${n.riskyCount}</h4>
                            <p>Risky Files (${n.riskyPercentage}%)</p>
                            <span class="safety-size">${p(n.riskySize)}</span>
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
                    ${e.locations.map(i=>we(i)).join("")}
                </div>
            </div>
        `}else{const a=A(e.files||[]);s.innerHTML=`
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
                        <h3>${p(e.total_size)}</h3>
                        <p>Total Size</p>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">\u23F1\uFE0F</div>
                    <div class="summary-content">
                        <h3>${B(e.scan_duration)}</h3>
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
                            <span class="safety-size">${p(a.safeSize)}</span>
                        </div>
                    </div>
                    <div class="safety-card caution-card">
                        <div class="safety-icon">\u26A0\uFE0F</div>
                        <div class="safety-content">
                            <h4>${a.cautionCount}</h4>
                            <p>Caution Files (${a.cautionPercentage}%)</p>
                            <span class="safety-size">${p(a.cautionSize)}</span>
                        </div>
                    </div>
                    <div class="safety-card risky-card">
                        <div class="safety-icon">\u{1F6AB}</div>
                        <div class="safety-content">
                            <h4>${a.riskyCount}</h4>
                            <p>Risky Files (${a.riskyPercentage}%)</p>
                            <span class="safety-size">${p(a.riskySize)}</span>
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
                    ${e.files?O(e.files,e.id):""}
                </div>
            </div>
        `}Be(),t.disabled=!1}function we(e){const s=e.files===void 0&&!e.error;return`
        <div class="location-card" data-location-id="${e.id}">
            <div class="location-header" onclick="toggleLocationFiles('${e.id}')">
                <div class="location-info">
                    <h4>${e.name}</h4>
                    <p class="location-path">${e.path}</p>
                </div>
                <div class="location-stats">
                    ${s?'<span class="stat loading-stat">Loading...</span>':`<span class="stat">${e.file_count.toLocaleString()} files</span>
                         <span class="stat">${p(e.total_size)}</span>
                         <span class="stat">${B(e.scan_duration)}</span>`}
                </div>
                <div class="location-toggle">
                    <span class="toggle-icon">\u25BC</span>
                </div>
            </div>
            <div class="location-files" id="files-${e.id}" style="display: none;">
                ${s?ke():e.files?O(e.files,e.id):'<p class="no-files">No files found</p>'}
            </div>
            ${e.error?`<div class="location-error">Error: ${e.error}</div>`:""}
        </div>
    `}function O(e,s){if(!e||e.length===0)return'<p class="no-files">No files found</p>';const t=[...e].sort((a,n)=>n.size-a.size);return`
        <div class="file-table-container">
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
                    ${t.map(a=>$e(a)).join("")}
                </tbody>
            </table>
        </div>
    `}function ke(){return`
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
    `}function $e(e){const s=e.is_dir,t=s?"\u{1F4C1}":"\u{1F4C4}",a=s?"Directory":"File",n=s?"-":p(e.size),i=new Date(e.last_modified).toLocaleDateString(),l=new Date(e.last_accessed).toLocaleDateString();let r="",c="",u="none";if(!s&&e.safety_classification){const f=e.safety_classification;u=String(f.level||""),console.log(`File ${e.name}: safety level = "${u}"`);const g=P(u),S=q(u);r=`
            <div class="safety-indicator" data-safety-level="${u}" title="${f.explanation||""}">
                <span class="safety-icon" style="color: ${S}">${g}</span>
                <span class="safety-confidence">${f.confidence||0}%</span>
            </div>
        `,c=`safety-${u.toLowerCase()}`}else s||console.log(`File ${e.name}: no safety classification`);return`
        <tr class="file-row ${c}" data-file-path="${e.path}" data-file-size="${e.size}" data-file-type="${a.toLowerCase()}" data-safety-level="${u||"none"}">
            <td class="file-name">
                <span class="file-icon">${t}</span>
                <span class="file-name-text" title="${e.path}">${e.name}</span>
            </td>
            <td class="file-size">${n}</td>
            <td class="file-modified">${i}</td>
            <td class="file-accessed">${l}</td>
            <td class="file-type">${a}</td>
            <td class="file-safety">
                ${r}
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
    `}function P(e){switch(String(e||"").trim()){case"Safe":return"\u2705";case"Caution":return"\u26A0\uFE0F";case"Risky":return"\u{1F6AB}";default:return"\u2753"}}function q(e){switch(String(e||"").trim()){case"Safe":return"#30d158";case"Caution":return"#ff9500";case"Risky":return"#ff3b30";default:return"#a0a0a0"}}function _(e){switch(String(e||"").trim()){case"Safe":return 1;case"Caution":return 2;case"Risky":return 3;default:return 4}}function Be(){const e=document.getElementById("fileSearch");e&&e.addEventListener("input",C);const s=document.getElementById("sizeFilter"),t=document.getElementById("typeFilter"),a=document.getElementById("safetyFilter");s&&s.addEventListener("change",C),t&&t.addEventListener("change",C),a&&a.addEventListener("change",C),document.querySelectorAll(".sortable").forEach(n=>{n.addEventListener("click",()=>Ce(n))})}function C(){var n,i,l,r;const e=((n=document.getElementById("fileSearch"))==null?void 0:n.value.toLowerCase())||"",s=((i=document.getElementById("sizeFilter"))==null?void 0:i.value)||"",t=((l=document.getElementById("typeFilter"))==null?void 0:l.value)||"",a=((r=document.getElementById("safetyFilter"))==null?void 0:r.value)||"";document.querySelectorAll(".file-row").forEach(c=>{const u=c.querySelector(".file-name-text").textContent.toLowerCase(),f=parseInt(c.dataset.fileSize),g=c.dataset.fileType,S=c.dataset.safetyLevel;let v=!0;if(e&&!u.includes(e)&&(v=!1),s){const w=f/1048576;s==="large"&&w<=10&&(v=!1),s==="medium"&&(w<=1||w>10)&&(v=!1),s==="small"&&w>=1&&(v=!1)}t&&g!==t&&(v=!1),a&&S!==a&&(v=!1),c.style.display=v?"":"none"})}function Ce(e){const s=e.closest("table"),t=s.querySelector("tbody"),a=Array.from(t.querySelectorAll("tr")),n=e.dataset.sort,i=e.classList.contains("sort-asc");s.querySelectorAll(".sortable").forEach(l=>{l.classList.remove("sort-asc","sort-desc")}),e.classList.add(i?"sort-desc":"sort-asc"),a.sort((l,r)=>{let c,u;switch(n){case"name":c=l.querySelector(".file-name-text").textContent.toLowerCase(),u=r.querySelector(".file-name-text").textContent.toLowerCase();break;case"size":c=parseInt(l.dataset.fileSize),u=parseInt(r.dataset.fileSize);break;case"modified":c=new Date(l.querySelector(".file-modified").textContent),u=new Date(r.querySelector(".file-modified").textContent);break;case"accessed":c=new Date(l.querySelector(".file-accessed").textContent),u=new Date(r.querySelector(".file-accessed").textContent);break;case"safety":c=_(l.dataset.safetyLevel),u=_(r.dataset.safetyLevel);break;default:return 0}return c<u?i?1:-1:c>u?i?-1:1:0}),a.forEach(l=>t.appendChild(l))}function J(e){const s=document.getElementById(`files-${e}`),t=document.querySelector(`[data-location-id="${e}"] .toggle-icon`);s.style.display==="none"?(s.style.display="block",t.textContent="\u25B2"):(s.style.display="none",t.textContent="\u25BC")}function H(e,s,t,a,n,i,l,r=""){console.log("showFileDetails called with:",{path:e,name:s,size:t,modified:a,accessed:n,type:i,permissions:l,safetyData:r});const c=document.createElement("div");c.className="file-details-modal";let u="";if(r)try{const f=JSON.parse(r.replace(/&#39;/g,"'")),g=P(f.level);u=`
                <div class="detail-row safety-row">
                    <span class="detail-label">Safety Level:</span>
                    <span class="detail-value">
                        <div class="safety-detail" style="color: ${q(f.level)}">
                            <span class="safety-icon">${g}</span>
                            <span class="safety-level">${f.level}</span>
                            <span class="safety-confidence">(${f.confidence}% confidence)</span>
                        </div>
                    </span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Safety Explanation:</span>
                    <span class="detail-value safety-explanation">${f.explanation}</span>
                </div>
                ${f.reasons&&f.reasons.length>0?`
                    <div class="detail-row">
                        <span class="detail-label">Safety Reasons:</span>
                        <span class="detail-value">
                            <ul class="safety-reasons">
                                ${f.reasons.map(v=>`<li>${v}</li>`).join("")}
                            </ul>
                        </span>
                    </div>
                `:""}
            `}catch(f){console.error("Error parsing safety data:",f)}c.innerHTML=`
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
                        <span class="detail-value">${p(t)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Type:</span>
                        <span class="detail-value">${i}</span>
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
                    ${u}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="revealInFinder('${e}')">Reveal in Finder</button>
                    <button class="btn btn-secondary" onclick="closeFileDetails()">Close</button>
                </div>
            </div>
        </div>
    `,document.body.appendChild(c)}function Fe(){const e=document.querySelector(".file-details-modal");e&&e.remove()}async function G(e){console.log("Reveal in Finder:",e);try{const s=await pe(e),t=JSON.parse(s);t.status==="success"?h(t.message):d(`Failed to reveal in Finder: ${t.message||"Unknown error"}`)}catch(s){console.error("Failed to reveal in Finder:",s),d(`Failed to reveal in Finder: ${s.message}`)}}function Le(){console.log("selectAllSafeFiles called");const e=document.querySelectorAll(".file-row");console.log("Total file rows found:",e.length);const s=new Set;e.forEach(n=>{const i=n.getAttribute("data-safety-level");i&&s.add(i)}),console.log("Safety levels found:",Array.from(s));const t=document.querySelectorAll('.file-row[data-safety-level="Safe"], .file-row[data-safety-level="safe"]');if(console.log("Safe rows found:",t.length),t.length===0){const n=Array.from(e).filter(i=>{const l=i.getAttribute("data-safety-level");return l&&l.toLowerCase().includes("safe")});if(console.log("Potential safe rows (case-insensitive):",n.length),n.length>0)n.forEach(i=>{if(i.classList.add("selected"),i.querySelector(".file-checkbox"))i.querySelector(".file-checkbox").checked=!0;else{const l=document.createElement("input");l.type="checkbox",l.className="file-checkbox",l.checked=!0,l.addEventListener("change",r=>{i.classList.toggle("selected",r.target.checked)}),i.querySelector(".file-name").prepend(l)}});else{const i=document.querySelectorAll(".file-row");i.length===0?d("No files found. Please scan a cache location first."):d(`No safe files found to select. Found ${i.length} files total. Make sure files have been classified as safe.`);return}}else t.forEach(n=>{if(n.classList.add("selected"),n.querySelector(".file-checkbox"))n.querySelector(".file-checkbox").checked=!0;else{const i=document.createElement("input");i.type="checkbox",i.className="file-checkbox",i.checked=!0,i.addEventListener("change",l=>{n.classList.toggle("selected",l.target.checked)}),n.querySelector(".file-name").prepend(i)}});j();const a=document.querySelectorAll(".file-row.selected").length;a>0&&h(`Successfully selected ${a} safe files`)}function De(){document.querySelectorAll(".file-row").forEach(e=>{e.classList.remove("selected");const s=e.querySelector(".file-checkbox");s&&(s.checked=!1)}),j()}function j(){const e=document.querySelectorAll(".file-row.selected").length,s=Array.from(document.querySelectorAll(".file-row.selected")).reduce((a,n)=>a+parseInt(n.dataset.fileSize||0),0);let t=document.querySelector(".selection-summary");!t&&e>0&&(t=document.createElement("div"),t.className="selection-summary",document.querySelector(".file-controls").appendChild(t)),t&&(e>0?t.innerHTML=`
                <div class="selection-info">
                    <span class="selection-count">${e} files selected</span>
                    <span class="selection-size">Total: ${p(s)}</span>
                    <button class="btn btn-danger btn-sm" onclick="deleteSelectedFiles()">
                        <span class="btn-icon">\u{1F5D1}\uFE0F</span>
                        Delete Selected
                    </button>
                </div>
            `:t.remove())}let V=[];async function Ee(){const e=Array.from(document.querySelectorAll(".file-row.selected"));if(e.length===0){d("No files selected for deletion");return}const s=e.map(t=>t.dataset.filePath);V=s;try{o("Validating files for deletion...",!0);const t=await ye(JSON.stringify(s),"manual_deletion"),a=JSON.parse(t),n=await ae(JSON.stringify(s),"manual_deletion",!1,!1),i=JSON.parse(n);Ie(i,a)}catch(t){console.error("Deletion error:",t),d(`Deletion failed: ${t.message}`),o("Deletion failed",!1)}}function m(e){const s=document.getElementById("scanButton"),t=document.getElementById("scanAllButton"),a=document.getElementById("stopButton");s.disabled=e,t.disabled=e,a.disabled=!e,e?(s.innerHTML='<span class="btn-icon">\u23F3</span>Scanning...',t.innerHTML='<span class="btn-icon">\u23F3</span>Scanning...'):(s.innerHTML='<span class="btn-icon">\u{1F50D}</span>Scan Selected Location',t.innerHTML='<span class="btn-icon">\u{1F310}</span>Scan All Safe Locations')}function o(e,s=!0){const t=document.getElementById("progressContainer"),a=document.getElementById("progressText");if(s){a.textContent=e,t.style.display="block",U();const n=document.getElementById("progressBar");n&&(n.style.width="100%",n.style.animation="pulse 2s infinite")}else{t.style.display="none";const n=document.getElementById("progressBar");n&&(n.style.animation="none")}}function U(){if(!F)return;const e=Math.floor((Date.now()-F)/1e3),s=Math.floor(e/60),t=e%60,a=`${s.toString().padStart(2,"0")}:${t.toString().padStart(2,"0")}`,n=document.getElementById("progressTime");n&&(n.textContent=a)}function d(e,s=!1,t=null){const a=document.getElementById("errorContainer");document.getElementById("errorMessage");const n=`
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
    `;a.innerHTML=n,a.style.display="flex";const i=a.querySelector("#errorClose");i&&i.addEventListener("click",$),s||setTimeout(()=>{$()},1e4)}function $(){const e=document.getElementById("errorContainer");e.style.display="none"}function Ae(){y&&clearInterval(y),y=setInterval(async()=>{try{if(!await re()){clearInterval(y),y=null;try{const s=await le(),t=JSON.parse(s);L(t),k=t}catch(s){d("Failed to get scan result: "+s.message)}m(!1),o("Scan completed!",!1);return}U(),o("Scanning in progress...",!0)}catch(e){console.error("Error polling progress:",e),o("Scanning... (progress unavailable)",!0)}},200)}function _e(){y&&(clearInterval(y),y=null)}function xe(){if(!k){d("No results to export");return}const e=JSON.stringify(k,null,2),s=new Blob([e],{type:"application/json"}),t=document.createElement("a");t.href=URL.createObjectURL(s),t.download=`cache-scan-results-${new Date().toISOString().split("T")[0]}.json`,t.click()}function p(e){if(e===0)return"0 Bytes";const s=1024,t=["Bytes","KB","MB","GB","TB"],a=Math.floor(Math.log(e)/Math.log(s));return parseFloat((e/Math.pow(s,a)).toFixed(2))+" "+t[a]}function B(e){const s=e/1e9;if(s<1)return(e/1e6).toFixed(0)+"ms";if(s<60)return s.toFixed(2)+"s";{const t=Math.floor(s/60),a=s%60;return`${t}m ${a.toFixed(1)}s`}}function Ie(e,s){const t=document.createElement("div");t.className="deletion-confirmation-modal";const a=e.warnings&&e.warnings.length>0?`
        <div class="warnings-section">
            <h4>\u26A0\uFE0F Warnings</h4>
            <ul class="warnings-list">
                ${e.warnings.map(i=>`<li>${i}</li>`).join("")}
            </ul>
        </div>
    `:"",n=e.details?`
        <div class="details-section">
            <h4>\u{1F4CB} Details</h4>
            <ul class="details-list">
                ${e.details.map(i=>`<li>${i}</li>`).join("")}
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
    `,document.body.appendChild(t)}function W(){const e=document.querySelector(".deletion-confirmation-modal");e&&e.remove()}async function Re(e){try{const s=document.getElementById("forceDeleteCheckbox").checked,t=document.getElementById("dryRunCheckbox").checked;W(),o("Starting deletion operation...",!0);const a=await se(e,JSON.stringify(V),!0,s,t),n=JSON.parse(a);n.status==="started"?ze(n.operation_id):(d("Failed to start deletion operation"),o("Deletion failed",!1))}catch(s){console.error("Confirmation error:",s),d(`Deletion confirmation failed: ${s.message}`),o("Deletion failed",!1)}}let b=null;function ze(e){b&&clearInterval(b),b=setInterval(async()=>{try{const s=await oe(e),t=JSON.parse(s);Te(t),(t.status==="completed"||t.status==="failed"||t.status==="cancelled")&&(clearInterval(b),b=null,t.status==="completed"?(o("Deletion completed successfully!",!1),h(`Successfully deleted ${t.files_processed} files`)):(d(`Deletion ${t.status}: ${t.message}`),o("Deletion failed",!1)))}catch(s){console.error("Progress monitoring error:",s),clearInterval(b),b=null,d("Failed to monitor deletion progress"),o("Deletion failed",!1)}},500)}function Te(e){const s=document.getElementById("progressText"),t=document.getElementById("progressBar");s&&(s.textContent=e.message||"Processing..."),t&&(t.style.width=`${e.progress||0}%`,t.style.animation="none");const a=document.getElementById("filesScanned"),n=document.getElementById("sizeFound");a&&(a.textContent=`${e.files_processed||0} / ${e.total_files||0}`),n&&(n.textContent=p(e.current_size||0))}function h(e){const s=document.createElement("div");s.className="success-container",s.innerHTML=`
        <div class="success-icon">\u2705</div>
        <div class="success-content">
            <h4>Success</h4>
            <p>${e}</p>
        </div>
        <button class="success-close" onclick="this.parentElement.remove()">\xD7</button>
    `;const t=document.getElementById("progressContainer");t&&t.parentNode&&t.parentNode.insertBefore(s,t.nextSibling),setTimeout(()=>{s.parentNode&&s.remove()},5e3)}async function Ne(){try{const e=await ne(),s=JSON.parse(e);if(s.length===0){d("No backup sessions available for restore");return}Me(s)}catch(e){console.error("Error getting backups:",e),d(`Failed to get backup sessions: ${e.message}`)}}function Me(e){const s=document.createElement("div");s.className="restore-modal";const t=e.map(a=>`
        <div class="backup-option" data-session-id="${a.session_id}">
            <div class="backup-info">
                <h4>${a.operation}</h4>
                <p>Session: ${a.session_id}</p>
                <p>Files: ${a.total_files}</p>
                <p>Size: ${p(a.total_size)}</p>
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
    `,document.body.appendChild(s)}function K(){const e=document.querySelector(".restore-modal");e&&e.remove()}async function Oe(e){try{K(),o("Starting restore operation...",!0);const s=await ue(e,!1),t=JSON.parse(s);o("Restore completed successfully!",!1),h(`Successfully restored ${t.success_count} files from backup`)}catch(s){console.error("Restore error:",s),d(`Restore failed: ${s.message}`),o("Restore failed",!1)}}let D=null,Pe=null;async function Q(){try{o("Loading backup data...",!0);const e=await I(),s=JSON.parse(e);D=s,o("Backup data loaded",!1),qe(s)}catch(e){console.error("Error loading backup data:",e),d(`Failed to load backup data: ${e.message}`),o("Failed to load backup data",!1)}}function qe(e){const s=document.createElement("div");s.className="backup-manager-modal";const t=e.summary,a=e.sessions||[];s.innerHTML=`
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
                                    <h4>${p(t.total_size)}</h4>
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
                                <option value="cache_cleanup">Cache Cleanup</option>
                                <option value="system_cleanup">System Cleanup</option>
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
                                ${a.map(n=>X(n)).join("")}
                            </div>`}
                    </div>
                </div>
            </div>
        </div>
    `,document.body.appendChild(s),Je()}function X(e){const s=new Date(e.start_time),a=new Date(e.end_time)-s;return`
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
                        <span class="stat-value">${p(e.total_size)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Duration:</span>
                        <span class="stat-value">${B(a)}</span>
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
    `}function Je(){const e=document.getElementById("backupSearch"),s=document.getElementById("backupFilter");e&&e.addEventListener("input",x),s&&s.addEventListener("change",x)}function x(){var t,a;const e=((t=document.getElementById("backupSearch"))==null?void 0:t.value.toLowerCase())||"",s=((a=document.getElementById("backupFilter"))==null?void 0:a.value)||"";document.querySelectorAll(".backup-session-card").forEach(n=>{const i=n.dataset.sessionId,l=D.sessions.find(c=>c.session_id===i);if(!l)return;let r=!0;e&&(`${l.operation} ${l.session_id}`.toLowerCase().includes(e)||(r=!1)),s&&l.operation!==s&&(r=!1),n.style.display=r?"":"none"})}function He(){const e=document.querySelector(".backup-manager-modal");e&&e.remove()}async function E(){try{o("Refreshing backup data...",!0);const e=await I(),s=JSON.parse(e);D=s;const t=document.querySelector(".sessions-list");t&&(t.innerHTML=s.sessions.map(n=>X(n)).join(""));const a=s.summary;document.querySelector(".summary-item:nth-child(1) h4").textContent=a.total_sessions,document.querySelector(".summary-item:nth-child(2) h4").textContent=a.total_files.toLocaleString(),document.querySelector(".summary-item:nth-child(3) h4").textContent=p(a.total_size),document.querySelector(".summary-item:nth-child(4) h4").textContent=a.oldest_session?new Date(a.oldest_session).toLocaleDateString():"N/A",o("Backup data refreshed",!1)}catch(e){console.error("Error refreshing backup data:",e),d(`Failed to refresh backup data: ${e.message}`),o("Failed to refresh backup data",!1)}}async function Ge(e){try{o("Loading session details...",!0);const s=await ie(e),t=JSON.parse(s);Pe=t,o("Session details loaded",!1),je(t)}catch(s){console.error("Error loading session details:",s),d(`Failed to load session details: ${s.message}`),o("Failed to load session details",!1)}}function je(e){const s=e.session,t=document.createElement("div");t.className="backup-details-modal";const a=e.integrity_valid?'<span class="status-badge status-completed">\u2705 Valid</span>':'<span class="status-badge status-failed">\u274C Invalid</span>',n=e.integrity_errors.length>0?`<div class="integrity-errors">
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
                                <span class="overview-value">${B(new Date(s.end_time)-new Date(s.start_time))}</span>
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
                                <span class="overview-value">${p(s.total_size)}</span>
                            </div>
                            <div class="overview-item">
                                <span class="overview-label">Backup Size:</span>
                                <span class="overview-value">${p(s.backup_size)}</span>
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
                            ${Ve(s.entries)}
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
    `,document.body.appendChild(t);const i=document.getElementById("fileSearchDetails");i&&i.addEventListener("input",Ue)}function Ve(e){return`
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
                        <td class="file-size">${p(s.size)}</td>
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
    `}function Ue(){var s;const e=((s=document.getElementById("fileSearchDetails"))==null?void 0:s.value.toLowerCase())||"";document.querySelectorAll(".backup-file-row").forEach(t=>{const a=t.dataset.filePath.toLowerCase(),n=!e||a.includes(e);t.style.display=n?"":"none"})}function We(){const e=document.querySelector(".backup-details-modal");e&&e.remove()}async function Ke(e){try{if(!confirm(`Are you sure you want to restore all files from backup session ${e}? This will overwrite existing files.`))return;o("Starting restore operation...",!0);const t=await z(e,"",!0,!1),a=JSON.parse(t);o("Restore completed successfully!",!1),h(`Successfully restored ${a.success_count} files from backup`)}catch(s){console.error("Restore error:",s),d(`Restore failed: ${s.message}`),o("Restore failed",!1)}}async function Qe(e){const s=Array.from(document.querySelectorAll(".file-checkbox:checked")).map(t=>t.value);if(s.length===0){d("No files selected for restore");return}try{if(!confirm(`Are you sure you want to restore ${s.length} selected files? This will overwrite existing files.`))return;o("Starting selective restore operation...",!0);const a=await z(e,JSON.stringify(s),!0,!1),n=JSON.parse(a);o("Selective restore completed successfully!",!1),h(`Successfully restored ${n.success_count} files from backup`)}catch(t){console.error("Selective restore error:",t),d(`Selective restore failed: ${t.message}`),o("Selective restore failed",!1)}}async function Xe(e){try{if(!confirm(`Are you sure you want to delete backup session ${e}? This action cannot be undone.`))return;o("Deleting backup session...",!0);const t=await te(e),a=JSON.parse(t);o("Backup session deleted successfully!",!1),h(`Successfully deleted backup session ${e}`),await E()}catch(s){console.error("Delete error:",s),d(`Delete failed: ${s.message}`),o("Delete failed",!1)}}async function Ye(){try{const e=prompt("Enter the number of days (backups older than this will be deleted):","30");if(!e||isNaN(e))return;const s=parseInt(e);if(s<=0){d("Please enter a valid number of days");return}if(!confirm(`Are you sure you want to delete all backup sessions older than ${s} days? This action cannot be undone.`))return;o("Cleaning up old backups...",!0);const a=await ee(s),n=JSON.parse(a);o("Cleanup completed successfully!",!1),h(`Successfully deleted ${n.deleted_count} old backup sessions`),await E()}catch(e){console.error("Cleanup error:",e),d(`Cleanup failed: ${e.message}`),o("Cleanup failed",!1)}}async function Ze(e){try{o("Generating restore preview...",!0);const s=await de(e,""),t=JSON.parse(s);o("Restore preview generated",!1),es(e,t)}catch(s){console.error("Preview error:",s),d(`Preview failed: ${s.message}`),o("Preview failed",!1)}}function es(e,s){const t=document.createElement("div");t.className="restore-preview-modal",t.innerHTML=`
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
                                    <h4>${p(s.restored_size)}</h4>
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
    `,document.body.appendChild(t)}function ss(){const e=document.querySelector(".restore-preview-modal");e&&e.remove()}

(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&a(i)}).observe(document,{childList:!0,subtree:!0});function s(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerpolicy&&(o.referrerPolicy=n.referrerpolicy),n.crossorigin==="use-credentials"?o.credentials="include":n.crossorigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(n){if(n.ep)return;n.ep=!0;const o=s(n);fetch(n.href,o)}})();function G(e,t,s,a,n){return window.go.main.App.ConfirmDeletion(e,t,s,a,n)}function j(e,t,s,a){return window.go.main.App.DeleteFilesWithConfirmation(e,t,s,a)}function W(){return window.go.main.App.GetAvailableBackups()}function I(){return window.go.main.App.GetCacheLocationsFromConfig()}function K(e){return window.go.main.App.GetDeletionProgress(e)}function Q(){return window.go.main.App.GetLastScanResult()}function X(){return window.go.main.App.GetSystemInfo()}function Y(){return window.go.main.App.IsScanning()}function Z(e,t){return window.go.main.App.RestoreFromBackup(e,t)}function ee(e){return window.go.main.App.RevealInFinder(e)}function te(e,t,s){return window.go.main.App.ScanCacheLocation(e,t,s)}function se(e){return window.go.main.App.ScanMultipleCacheLocations(e)}function ne(){return window.go.main.App.StopScan()}function ae(e,t){return window.go.main.App.ValidateFilesForDeletion(e,t)}let w=null,y=null,L=null;document.addEventListener("DOMContentLoaded",function(){oe(),x(),ie(),window.selectAllSafeFiles=me,window.clearFileSelection=ye,window.showUndoOptions=ke,window.showFileDetails=O,window.closeFileDetails=ve,window.revealInFinder=q,window.toggleLocationFiles=T,window.deleteSelectedFiles=ge,window.confirmDeletion=$e,window.closeDeletionConfirmation=H,window.closeRestoreDialog=U,window.restoreFromBackup=Be});function oe(){document.querySelector("#app").innerHTML=`
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
    `}async function x(){try{const e=await I(),t=JSON.parse(e);le(t);const s=await X(),a=JSON.parse(s);ce(a)}catch(e){console.error("Error initializing app:",e),u("Failed to initialize application: "+e.message)}}function ie(){const e=document.getElementById("scanButton"),t=document.getElementById("scanAllButton"),s=document.getElementById("stopButton"),a=document.getElementById("refreshButton"),n=document.getElementById("exportButton"),o=document.getElementById("errorClose");e&&e.addEventListener("click",A),t&&t.addEventListener("click",z),s&&s.addEventListener("click",async()=>{try{await ne(),Se(),m(!1),d("Scan stopped by user",!1)}catch(i){u("Failed to stop scan: "+i.message)}}),a&&a.addEventListener("click",x),n&&n.addEventListener("click",be),o&&o.addEventListener("click",$),document.addEventListener("click",function(i){if(i.target.classList.contains("btn-icon")&&i.target.getAttribute("title")==="View Details"){const l=i.target.closest(".file-row");if(l){const c=l.dataset.filePath,r=l.querySelector(".file-name-text").textContent,f=parseInt(l.dataset.fileSize),g=l.dataset.fileType,S=l.querySelector(".file-modified").textContent,v=l.querySelector(".file-accessed").textContent,b=l.querySelector(".file-actions").getAttribute("data-permissions")||"",V=l.querySelector(".file-actions").getAttribute("data-safety")||"";O(c,r,f,S,v,g,b,V)}}if(i.target.classList.contains("btn-icon")&&i.target.getAttribute("title")==="Reveal in Finder"){const l=i.target.closest(".file-row");if(l){const c=l.dataset.filePath;q(c)}}if(i.target.classList.contains("toggle-icon")||i.target.closest(".location-header")){const l=i.target.closest(".location-card");if(l){const c=l.dataset.locationId;T(c)}}})}function le(e){const t=document.getElementById("locationSelect");t.innerHTML="";const s=document.createElement("option");s.value="",s.textContent="Select a cache location...",t.appendChild(s),e.forEach(a=>{const n=document.createElement("option");n.value=JSON.stringify(a),n.textContent=`${a.name} (${a.type})`,t.appendChild(n)})}function ce(e){document.getElementById("osInfo").textContent=e.os,document.getElementById("appVersion").textContent=e.app_version,document.getElementById("goVersion").textContent=e.go_version,document.getElementById("lastUpdated").textContent=new Date(e.scan_time).toLocaleString()}async function A(){const e=document.getElementById("locationSelect"),t=e.options[e.selectedIndex];if(!t.value){u("Please select a cache location to scan");return}const s=JSON.parse(t.value);try{m(!0),d("Starting scan...",!0),L=Date.now();const a=await te(s.id,s.name,s.path),n=JSON.parse(a);n.status==="scan_started"?(d("Scan started in background...",!0),he()):(B(n),w=n,m(!1))}catch(a){console.error("Scan error:",a),u(`Scan failed: ${a.message}`,!0,()=>{$(),A()}),m(!1),d("Scan failed",!1)}}async function z(){try{m(!0),d("Starting full system scan...",!0),L=Date.now();const e=await I(),s=JSON.parse(e).filter(o=>o.type==="user"||o.type==="application");if(s.length===0){u("No safe cache locations found to scan"),m(!1),d("No locations to scan",!1);return}const a=await se(JSON.stringify(s)),n=JSON.parse(a);B(n),w=n,m(!1),d("Scan completed!",!1)}catch(e){console.error("Full scan error:",e),u(`Full scan failed: ${e.message}`,!0,()=>{$(),z()}),m(!1),d("Scan failed",!1)}}function E(e){let t=0,s=0,a=0,n=0,o=0,i=0,l=0;return e.forEach(c=>{if(!c.is_dir&&c.safety_classification){n++;const r=c.size||0;switch(String(c.safety_classification.level||"").trim()){case"Safe":t++,o+=r;break;case"Caution":s++,i+=r;break;case"Risky":a++,l+=r;break}}}),{totalFiles:n,safeCount:t,cautionCount:s,riskyCount:a,safeSize:o,cautionSize:i,riskySize:l,safePercentage:n>0?Math.round(t/n*100):0,cautionPercentage:n>0?Math.round(s/n*100):0,riskyPercentage:n>0?Math.round(a/n*100):0}}function B(e){const t=document.getElementById("scanResults"),s=document.getElementById("exportButton");if(e.locations){const a=e.locations.flatMap(o=>o.files||[]),n=E(a);t.innerHTML=`
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
                        <h3>${F(e.scan_duration)}</h3>
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
                    ${e.locations.map(o=>re(o)).join("")}
                </div>
            </div>
        `}else{const a=E(e.files||[]);t.innerHTML=`
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
                        <h3>${F(e.scan_duration)}</h3>
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
                    ${e.files?R(e.files,e.id):""}
                </div>
            </div>
        `}fe(),s.disabled=!1}function re(e){const t=e.files===void 0&&!e.error;return`
        <div class="location-card" data-location-id="${e.id}">
            <div class="location-header" onclick="toggleLocationFiles('${e.id}')">
                <div class="location-info">
                    <h4>${e.name}</h4>
                    <p class="location-path">${e.path}</p>
                </div>
                <div class="location-stats">
                    ${t?'<span class="stat loading-stat">Loading...</span>':`<span class="stat">${e.file_count.toLocaleString()} files</span>
                         <span class="stat">${p(e.total_size)}</span>
                         <span class="stat">${F(e.scan_duration)}</span>`}
                </div>
                <div class="location-toggle">
                    <span class="toggle-icon">\u25BC</span>
                </div>
            </div>
            <div class="location-files" id="files-${e.id}" style="display: none;">
                ${t?de():e.files?R(e.files,e.id):'<p class="no-files">No files found</p>'}
            </div>
            ${e.error?`<div class="location-error">Error: ${e.error}</div>`:""}
        </div>
    `}function R(e,t){if(!e||e.length===0)return'<p class="no-files">No files found</p>';const s=[...e].sort((a,n)=>n.size-a.size);return`
        <div class="file-table-container">
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
                    ${s.map(a=>ue(a)).join("")}
                </tbody>
            </table>
        </div>
    `}function de(){return`
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
    `}function ue(e){const t=e.is_dir,s=t?"\u{1F4C1}":"\u{1F4C4}",a=t?"Directory":"File",n=t?"-":p(e.size),o=new Date(e.last_modified).toLocaleDateString(),i=new Date(e.last_accessed).toLocaleDateString();let l="",c="",r="none";if(!t&&e.safety_classification){const f=e.safety_classification;r=String(f.level||""),console.log(`File ${e.name}: safety level = "${r}"`);const g=N(r),S=M(r);l=`
            <div class="safety-indicator" data-safety-level="${r}" title="${f.explanation||""}">
                <span class="safety-icon" style="color: ${S}">${g}</span>
                <span class="safety-confidence">${f.confidence||0}%</span>
            </div>
        `,c=`safety-${r.toLowerCase()}`}else t||console.log(`File ${e.name}: no safety classification`);return`
        <tr class="file-row ${c}" data-file-path="${e.path}" data-file-size="${e.size}" data-file-type="${a.toLowerCase()}" data-safety-level="${r||"none"}">
            <td class="file-name">
                <span class="file-icon">${s}</span>
                <span class="file-name-text" title="${e.path}">${e.name}</span>
            </td>
            <td class="file-size">${n}</td>
            <td class="file-modified">${o}</td>
            <td class="file-accessed">${i}</td>
            <td class="file-type">${a}</td>
            <td class="file-safety">
                ${l}
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
    `}function N(e){switch(String(e||"").trim()){case"Safe":return"\u2705";case"Caution":return"\u26A0\uFE0F";case"Risky":return"\u{1F6AB}";default:return"\u2753"}}function M(e){switch(String(e||"").trim()){case"Safe":return"#30d158";case"Caution":return"#ff9500";case"Risky":return"#ff3b30";default:return"#a0a0a0"}}function D(e){switch(String(e||"").trim()){case"Safe":return 1;case"Caution":return 2;case"Risky":return 3;default:return 4}}function fe(){const e=document.getElementById("fileSearch");e&&e.addEventListener("input",C);const t=document.getElementById("sizeFilter"),s=document.getElementById("typeFilter"),a=document.getElementById("safetyFilter");t&&t.addEventListener("change",C),s&&s.addEventListener("change",C),a&&a.addEventListener("change",C),document.querySelectorAll(".sortable").forEach(n=>{n.addEventListener("click",()=>pe(n))})}function C(){var n,o,i,l;const e=((n=document.getElementById("fileSearch"))==null?void 0:n.value.toLowerCase())||"",t=((o=document.getElementById("sizeFilter"))==null?void 0:o.value)||"",s=((i=document.getElementById("typeFilter"))==null?void 0:i.value)||"",a=((l=document.getElementById("safetyFilter"))==null?void 0:l.value)||"";document.querySelectorAll(".file-row").forEach(c=>{const r=c.querySelector(".file-name-text").textContent.toLowerCase(),f=parseInt(c.dataset.fileSize),g=c.dataset.fileType,S=c.dataset.safetyLevel;let v=!0;if(e&&!r.includes(e)&&(v=!1),t){const b=f/1048576;t==="large"&&b<=10&&(v=!1),t==="medium"&&(b<=1||b>10)&&(v=!1),t==="small"&&b>=1&&(v=!1)}s&&g!==s&&(v=!1),a&&S!==a&&(v=!1),c.style.display=v?"":"none"})}function pe(e){const t=e.closest("table"),s=t.querySelector("tbody"),a=Array.from(s.querySelectorAll("tr")),n=e.dataset.sort,o=e.classList.contains("sort-asc");t.querySelectorAll(".sortable").forEach(i=>{i.classList.remove("sort-asc","sort-desc")}),e.classList.add(o?"sort-desc":"sort-asc"),a.sort((i,l)=>{let c,r;switch(n){case"name":c=i.querySelector(".file-name-text").textContent.toLowerCase(),r=l.querySelector(".file-name-text").textContent.toLowerCase();break;case"size":c=parseInt(i.dataset.fileSize),r=parseInt(l.dataset.fileSize);break;case"modified":c=new Date(i.querySelector(".file-modified").textContent),r=new Date(l.querySelector(".file-modified").textContent);break;case"accessed":c=new Date(i.querySelector(".file-accessed").textContent),r=new Date(l.querySelector(".file-accessed").textContent);break;case"safety":c=D(i.dataset.safetyLevel),r=D(l.dataset.safetyLevel);break;default:return 0}return c<r?o?1:-1:c>r?o?-1:1:0}),a.forEach(i=>s.appendChild(i))}function T(e){const t=document.getElementById(`files-${e}`),s=document.querySelector(`[data-location-id="${e}"] .toggle-icon`);t.style.display==="none"?(t.style.display="block",s.textContent="\u25B2"):(t.style.display="none",s.textContent="\u25BC")}function O(e,t,s,a,n,o,i,l=""){console.log("showFileDetails called with:",{path:e,name:t,size:s,modified:a,accessed:n,type:o,permissions:i,safetyData:l});const c=document.createElement("div");c.className="file-details-modal";let r="";if(l)try{const f=JSON.parse(l.replace(/&#39;/g,"'")),g=N(f.level);r=`
                <div class="detail-row safety-row">
                    <span class="detail-label">Safety Level:</span>
                    <span class="detail-value">
                        <div class="safety-detail" style="color: ${M(f.level)}">
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
                        <span class="detail-value">${t}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Path:</span>
                        <span class="detail-value" title="${e}">${e}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Size:</span>
                        <span class="detail-value">${p(s)}</span>
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
                    ${r}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="revealInFinder('${e}')">Reveal in Finder</button>
                    <button class="btn btn-secondary" onclick="closeFileDetails()">Close</button>
                </div>
            </div>
        </div>
    `,document.body.appendChild(c)}function ve(){const e=document.querySelector(".file-details-modal");e&&e.remove()}async function q(e){console.log("Reveal in Finder:",e);try{const t=await ee(e),s=JSON.parse(t);s.status==="success"?k(s.message):u(`Failed to reveal in Finder: ${s.message||"Unknown error"}`)}catch(t){console.error("Failed to reveal in Finder:",t),u(`Failed to reveal in Finder: ${t.message}`)}}function me(){console.log("selectAllSafeFiles called");const e=document.querySelectorAll(".file-row");console.log("Total file rows found:",e.length);const t=new Set;e.forEach(n=>{const o=n.getAttribute("data-safety-level");o&&t.add(o)}),console.log("Safety levels found:",Array.from(t));const s=document.querySelectorAll('.file-row[data-safety-level="Safe"], .file-row[data-safety-level="safe"]');if(console.log("Safe rows found:",s.length),s.length===0){const n=Array.from(e).filter(o=>{const i=o.getAttribute("data-safety-level");return i&&i.toLowerCase().includes("safe")});if(console.log("Potential safe rows (case-insensitive):",n.length),n.length>0)n.forEach(o=>{if(o.classList.add("selected"),o.querySelector(".file-checkbox"))o.querySelector(".file-checkbox").checked=!0;else{const i=document.createElement("input");i.type="checkbox",i.className="file-checkbox",i.checked=!0,i.addEventListener("change",l=>{o.classList.toggle("selected",l.target.checked)}),o.querySelector(".file-name").prepend(i)}});else{const o=document.querySelectorAll(".file-row");o.length===0?u("No files found. Please scan a cache location first."):u(`No safe files found to select. Found ${o.length} files total. Make sure files have been classified as safe.`);return}}else s.forEach(n=>{if(n.classList.add("selected"),n.querySelector(".file-checkbox"))n.querySelector(".file-checkbox").checked=!0;else{const o=document.createElement("input");o.type="checkbox",o.className="file-checkbox",o.checked=!0,o.addEventListener("change",i=>{n.classList.toggle("selected",i.target.checked)}),n.querySelector(".file-name").prepend(o)}});P();const a=document.querySelectorAll(".file-row.selected").length;a>0&&k(`Successfully selected ${a} safe files`)}function ye(){document.querySelectorAll(".file-row").forEach(e=>{e.classList.remove("selected");const t=e.querySelector(".file-checkbox");t&&(t.checked=!1)}),P()}function P(){const e=document.querySelectorAll(".file-row.selected").length,t=Array.from(document.querySelectorAll(".file-row.selected")).reduce((a,n)=>a+parseInt(n.dataset.fileSize||0),0);let s=document.querySelector(".selection-summary");!s&&e>0&&(s=document.createElement("div"),s.className="selection-summary",document.querySelector(".file-controls").appendChild(s)),s&&(e>0?s.innerHTML=`
                <div class="selection-info">
                    <span class="selection-count">${e} files selected</span>
                    <span class="selection-size">Total: ${p(t)}</span>
                    <button class="btn btn-danger btn-sm" onclick="deleteSelectedFiles()">
                        <span class="btn-icon">\u{1F5D1}\uFE0F</span>
                        Delete Selected
                    </button>
                </div>
            `:s.remove())}let _=[];async function ge(){const e=Array.from(document.querySelectorAll(".file-row.selected"));if(e.length===0){u("No files selected for deletion");return}const t=e.map(s=>s.dataset.filePath);_=t;try{d("Validating files for deletion...",!0);const s=await ae(JSON.stringify(t),"manual_deletion"),a=JSON.parse(s),n=await j(JSON.stringify(t),"manual_deletion",!1,!1),o=JSON.parse(n);we(o,a)}catch(s){console.error("Deletion error:",s),u(`Deletion failed: ${s.message}`),d("Deletion failed",!1)}}function m(e){const t=document.getElementById("scanButton"),s=document.getElementById("scanAllButton"),a=document.getElementById("stopButton");t.disabled=e,s.disabled=e,a.disabled=!e,e?(t.innerHTML='<span class="btn-icon">\u23F3</span>Scanning...',s.innerHTML='<span class="btn-icon">\u23F3</span>Scanning...'):(t.innerHTML='<span class="btn-icon">\u{1F50D}</span>Scan Selected Location',s.innerHTML='<span class="btn-icon">\u{1F310}</span>Scan All Safe Locations')}function d(e,t=!0){const s=document.getElementById("progressContainer"),a=document.getElementById("progressText");if(t){a.textContent=e,s.style.display="block",J();const n=document.getElementById("progressBar");n&&(n.style.width="100%",n.style.animation="pulse 2s infinite")}else{s.style.display="none";const n=document.getElementById("progressBar");n&&(n.style.animation="none")}}function J(){if(!L)return;const e=Math.floor((Date.now()-L)/1e3),t=Math.floor(e/60),s=e%60,a=`${t.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`,n=document.getElementById("progressTime");n&&(n.textContent=a)}function u(e,t=!1,s=null){const a=document.getElementById("errorContainer");document.getElementById("errorMessage");const n=`
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
    `;a.innerHTML=n,a.style.display="flex";const o=a.querySelector("#errorClose");o&&o.addEventListener("click",$),t||setTimeout(()=>{$()},1e4)}function $(){const e=document.getElementById("errorContainer");e.style.display="none"}function he(){y&&clearInterval(y),y=setInterval(async()=>{try{if(!await Y()){clearInterval(y),y=null;try{const t=await Q(),s=JSON.parse(t);B(s),w=s}catch(t){u("Failed to get scan result: "+t.message)}m(!1),d("Scan completed!",!1);return}J(),d("Scanning in progress...",!0)}catch(e){console.error("Error polling progress:",e),d("Scanning... (progress unavailable)",!0)}},200)}function Se(){y&&(clearInterval(y),y=null)}function be(){if(!w){u("No results to export");return}const e=JSON.stringify(w,null,2),t=new Blob([e],{type:"application/json"}),s=document.createElement("a");s.href=URL.createObjectURL(t),s.download=`cache-scan-results-${new Date().toISOString().split("T")[0]}.json`,s.click()}function p(e){if(e===0)return"0 Bytes";const t=1024,s=["Bytes","KB","MB","GB","TB"],a=Math.floor(Math.log(e)/Math.log(t));return parseFloat((e/Math.pow(t,a)).toFixed(2))+" "+s[a]}function F(e){const t=e/1e9;if(t<1)return(e/1e6).toFixed(0)+"ms";if(t<60)return t.toFixed(2)+"s";{const s=Math.floor(t/60),a=t%60;return`${s}m ${a.toFixed(1)}s`}}function we(e,t){const s=document.createElement("div");s.className="deletion-confirmation-modal";const a=e.warnings&&e.warnings.length>0?`
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
                    <button class="btn btn-danger" onclick="confirmDeletion('${JSON.stringify(e).replace(/'/g,"&#39;")}')">
                        <span class="btn-icon">\u{1F5D1}\uFE0F</span>
                        Confirm Deletion
                    </button>
                </div>
            </div>
        </div>
    `,document.body.appendChild(s)}function H(){const e=document.querySelector(".deletion-confirmation-modal");e&&e.remove()}async function $e(e){try{const t=document.getElementById("forceDeleteCheckbox").checked,s=document.getElementById("dryRunCheckbox").checked;H(),d("Starting deletion operation...",!0);const a=await G(e,JSON.stringify(_),!0,t,s),n=JSON.parse(a);n.status==="started"?Ce(n.operation_id):(u("Failed to start deletion operation"),d("Deletion failed",!1))}catch(t){console.error("Confirmation error:",t),u(`Deletion confirmation failed: ${t.message}`),d("Deletion failed",!1)}}let h=null;function Ce(e){h&&clearInterval(h),h=setInterval(async()=>{try{const t=await K(e),s=JSON.parse(t);Le(s),(s.status==="completed"||s.status==="failed"||s.status==="cancelled")&&(clearInterval(h),h=null,s.status==="completed"?(d("Deletion completed successfully!",!1),k(`Successfully deleted ${s.files_processed} files`)):(u(`Deletion ${s.status}: ${s.message}`),d("Deletion failed",!1)))}catch(t){console.error("Progress monitoring error:",t),clearInterval(h),h=null,u("Failed to monitor deletion progress"),d("Deletion failed",!1)}},500)}function Le(e){const t=document.getElementById("progressText"),s=document.getElementById("progressBar");t&&(t.textContent=e.message||"Processing..."),s&&(s.style.width=`${e.progress||0}%`,s.style.animation="none");const a=document.getElementById("filesScanned"),n=document.getElementById("sizeFound");a&&(a.textContent=`${e.files_processed||0} / ${e.total_files||0}`),n&&(n.textContent=p(e.current_size||0))}function k(e){const t=document.createElement("div");t.className="success-container",t.innerHTML=`
        <div class="success-icon">\u2705</div>
        <div class="success-content">
            <h4>Success</h4>
            <p>${e}</p>
        </div>
        <button class="success-close" onclick="this.parentElement.remove()">\xD7</button>
    `;const s=document.getElementById("progressContainer");s&&s.parentNode&&s.parentNode.insertBefore(t,s.nextSibling),setTimeout(()=>{t.parentNode&&t.remove()},5e3)}async function ke(){try{const e=await W(),t=JSON.parse(e);if(t.length===0){u("No backup sessions available for restore");return}Fe(t)}catch(e){console.error("Error getting backups:",e),u(`Failed to get backup sessions: ${e.message}`)}}function Fe(e){const t=document.createElement("div");t.className="restore-modal";const s=e.map(a=>`
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
    `,document.body.appendChild(t)}function U(){const e=document.querySelector(".restore-modal");e&&e.remove()}async function Be(e){try{U(),d("Starting restore operation...",!0);const t=await Z(e,!1),s=JSON.parse(t);d("Restore completed successfully!",!1),k(`Successfully restored ${s.success_count} files from backup`)}catch(t){console.error("Restore error:",t),u(`Restore failed: ${t.message}`),d("Restore failed",!1)}}

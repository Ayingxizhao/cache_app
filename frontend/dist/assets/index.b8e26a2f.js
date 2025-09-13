(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&a(o)}).observe(document,{childList:!0,subtree:!0});function n(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerpolicy&&(i.referrerPolicy=s.referrerpolicy),s.crossorigin==="use-credentials"?i.credentials="include":s.crossorigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(s){if(s.ep)return;s.ep=!0;const i=n(s);fetch(s.href,i)}})();function I(){return window.go.main.App.GetCacheLocationsFromConfig()}function D(){return window.go.main.App.GetLastScanResult()}function T(){return window.go.main.App.GetSystemInfo()}function O(){return window.go.main.App.IsScanning()}function R(e,t,n){return window.go.main.App.ScanCacheLocation(e,t,n)}function _(e){return window.go.main.App.ScanMultipleCacheLocations(e)}function N(){return window.go.main.App.StopScan()}let g=null,f=null,L=null;document.addEventListener("DOMContentLoaded",function(){P(),k(),q()});function P(){document.querySelector("#app").innerHTML=`
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
    `}async function k(){try{const e=await I(),t=JSON.parse(e);J(t);const n=await T(),a=JSON.parse(n);H(a)}catch(e){console.error("Error initializing app:",e),v("Failed to initialize application: "+e.message)}}function q(){const e=document.getElementById("scanButton"),t=document.getElementById("scanAllButton"),n=document.getElementById("stopButton"),a=document.getElementById("refreshButton"),s=document.getElementById("exportButton"),i=document.getElementById("errorClose");e&&e.addEventListener("click",z),t&&t.addEventListener("click",x),n&&n.addEventListener("click",async()=>{try{await N(),Y(),p(!1),d("Scan stopped by user",!1)}catch(o){v("Failed to stop scan: "+o.message)}}),a&&a.addEventListener("click",k),s&&s.addEventListener("click",Z),i&&i.addEventListener("click",h)}function J(e){const t=document.getElementById("locationSelect");t.innerHTML="";const n=document.createElement("option");n.value="",n.textContent="Select a cache location...",t.appendChild(n),e.forEach(a=>{const s=document.createElement("option");s.value=JSON.stringify(a),s.textContent=`${a.name} (${a.type})`,t.appendChild(s)})}function H(e){document.getElementById("osInfo").textContent=e.os,document.getElementById("appVersion").textContent=e.app_version,document.getElementById("goVersion").textContent=e.go_version,document.getElementById("lastUpdated").textContent=new Date(e.scan_time).toLocaleString()}async function z(){const e=document.getElementById("locationSelect"),t=e.options[e.selectedIndex];if(!t.value){v("Please select a cache location to scan");return}const n=JSON.parse(t.value);try{p(!0),d("Starting scan...",!0),L=Date.now();const a=await R(n.id,n.name,n.path),s=JSON.parse(a);s.status==="scan_started"?(d("Scan started in background...",!0),X()):(E(s),g=s,p(!1))}catch(a){console.error("Scan error:",a),v(`Scan failed: ${a.message}`,!0,()=>{h(),z()}),p(!1),d("Scan failed",!1)}}async function x(){try{p(!0),d("Starting full system scan...",!0),L=Date.now();const e=await I(),n=JSON.parse(e).filter(i=>i.type==="user"||i.type==="application");if(n.length===0){v("No safe cache locations found to scan"),p(!1),d("No locations to scan",!1);return}const a=await _(JSON.stringify(n)),s=JSON.parse(a);E(s),g=s,p(!1),d("Scan completed!",!1)}catch(e){console.error("Full scan error:",e),v(`Full scan failed: ${e.message}`,!0,()=>{h(),x()}),p(!1),d("Scan failed",!1)}}function F(e){let t=0,n=0,a=0,s=0,i=0,o=0,r=0;return e.forEach(c=>{if(!c.is_dir&&c.safety_classification){s++;const l=c.size||0;switch(String(c.safety_classification.level||"").trim()){case"Safe":t++,i+=l;break;case"Caution":n++,o+=l;break;case"Risky":a++,r+=l;break}}}),{totalFiles:s,safeCount:t,cautionCount:n,riskyCount:a,safeSize:i,cautionSize:o,riskySize:r,safePercentage:s>0?Math.round(t/s*100):0,cautionPercentage:s>0?Math.round(n/s*100):0,riskyPercentage:s>0?Math.round(a/s*100):0}}function E(e){const t=document.getElementById("scanResults"),n=document.getElementById("exportButton");if(e.locations){const a=e.locations.flatMap(i=>i.files||[]),s=F(a);t.innerHTML=`
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
                        <h3>${u(e.total_size)}</h3>
                        <p>Total Size</p>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">\u23F1\uFE0F</div>
                    <div class="summary-content">
                        <h3>${C(e.scan_duration)}</h3>
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
                            <h4>${s.safeCount}</h4>
                            <p>Safe Files (${s.safePercentage}%)</p>
                            <span class="safety-size">${u(s.safeSize)}</span>
                        </div>
                    </div>
                    <div class="safety-card caution-card">
                        <div class="safety-icon">\u26A0\uFE0F</div>
                        <div class="safety-content">
                            <h4>${s.cautionCount}</h4>
                            <p>Caution Files (${s.cautionPercentage}%)</p>
                            <span class="safety-size">${u(s.cautionSize)}</span>
                        </div>
                    </div>
                    <div class="safety-card risky-card">
                        <div class="safety-icon">\u{1F6AB}</div>
                        <div class="safety-content">
                            <h4>${s.riskyCount}</h4>
                            <p>Risky Files (${s.riskyPercentage}%)</p>
                            <span class="safety-size">${u(s.riskySize)}</span>
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
                        </div>
                    </div>
                </div>
                <div class="locations-results">
                    ${e.locations.map(i=>V(i)).join("")}
                </div>
            </div>
        `}else{const a=F(e.files||[]);t.innerHTML=`
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
                        <h3>${u(e.total_size)}</h3>
                        <p>Total Size</p>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">\u23F1\uFE0F</div>
                    <div class="summary-content">
                        <h3>${C(e.scan_duration)}</h3>
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
                            <span class="safety-size">${u(a.safeSize)}</span>
                        </div>
                    </div>
                    <div class="safety-card caution-card">
                        <div class="safety-icon">\u26A0\uFE0F</div>
                        <div class="safety-content">
                            <h4>${a.cautionCount}</h4>
                            <p>Caution Files (${a.cautionPercentage}%)</p>
                            <span class="safety-size">${u(a.cautionSize)}</span>
                        </div>
                    </div>
                    <div class="safety-card risky-card">
                        <div class="safety-icon">\u{1F6AB}</div>
                        <div class="safety-content">
                            <h4>${a.riskyCount}</h4>
                            <p>Risky Files (${a.riskyPercentage}%)</p>
                            <span class="safety-size">${u(a.riskySize)}</span>
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
                        </div>
                    </div>
                </div>
                <div class="location-details">
                    <h4>${e.name}</h4>
                    <p class="location-path">${e.path}</p>
                    ${e.error?`<p class="error-text">Error: ${e.error}</p>`:""}
                    ${e.files?A(e.files,e.id):""}
                </div>
            </div>
        `}Q(),n.disabled=!1}function V(e){const t=e.files===void 0&&!e.error;return`
        <div class="location-card" data-location-id="${e.id}">
            <div class="location-header" onclick="toggleLocationFiles('${e.id}')">
                <div class="location-info">
                    <h4>${e.name}</h4>
                    <p class="location-path">${e.path}</p>
                </div>
                <div class="location-stats">
                    ${t?'<span class="stat loading-stat">Loading...</span>':`<span class="stat">${e.file_count.toLocaleString()} files</span>
                         <span class="stat">${u(e.total_size)}</span>
                         <span class="stat">${C(e.scan_duration)}</span>`}
                </div>
                <div class="location-toggle">
                    <span class="toggle-icon">\u25BC</span>
                </div>
            </div>
            <div class="location-files" id="files-${e.id}" style="display: none;">
                ${t?G():e.files?A(e.files,e.id):'<p class="no-files">No files found</p>'}
            </div>
            ${e.error?`<div class="location-error">Error: ${e.error}</div>`:""}
        </div>
    `}function A(e,t){if(!e||e.length===0)return'<p class="no-files">No files found</p>';const n=[...e].sort((a,s)=>s.size-a.size);return`
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
                    ${n.map(a=>j(a)).join("")}
                </tbody>
            </table>
        </div>
    `}function G(){return`
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
    `}function j(e){const t=e.is_dir,n=t?"\u{1F4C1}":"\u{1F4C4}",a=t?"Directory":"File",s=t?"-":u(e.size),i=new Date(e.last_modified).toLocaleDateString(),o=new Date(e.last_accessed).toLocaleDateString();let r="",c="",l="none";if(!t&&e.safety_classification){const m=e.safety_classification;l=String(m.level||"");const $=U(l),B=K(l);r=`
            <div class="safety-indicator" data-safety-level="${l}" title="${m.explanation||""}">
                <span class="safety-icon" style="color: ${B}">${$}</span>
                <span class="safety-confidence">${m.confidence||0}%</span>
            </div>
        `,c=`safety-${l.toLowerCase()}`}return`
        <tr class="file-row ${c}" data-file-path="${e.path}" data-file-size="${e.size}" data-file-type="${a.toLowerCase()}" data-safety-level="${l||"none"}">
            <td class="file-name">
                <span class="file-icon">${n}</span>
                <span class="file-name-text" title="${e.path}">${e.name}</span>
            </td>
            <td class="file-size">${s}</td>
            <td class="file-modified">${i}</td>
            <td class="file-accessed">${o}</td>
            <td class="file-type">${a}</td>
            <td class="file-safety">
                ${r}
            </td>
            <td class="file-actions">
                <button class="btn-icon" onclick="showFileDetails('${e.path}', '${e.name}', ${e.size}, '${e.last_modified}', '${e.last_accessed}', '${a}', '${e.permissions}', '${e.safety_classification?JSON.stringify(e.safety_classification).replace(/'/g,"&#39;"):""}')" title="View Details">
                    \u2139\uFE0F
                </button>
                <button class="btn-icon" onclick="revealInFinder('${e.path}')" title="Reveal in Finder">
                    \u{1F4C2}
                </button>
            </td>
        </tr>
    `}function U(e){switch(String(e||"").trim()){case"Safe":return"\u2705";case"Caution":return"\u26A0\uFE0F";case"Risky":return"\u{1F6AB}";default:return"\u2753"}}function K(e){switch(String(e||"").trim()){case"Safe":return"#30d158";case"Caution":return"#ff9500";case"Risky":return"#ff3b30";default:return"#a0a0a0"}}function w(e){switch(String(e||"").trim()){case"Safe":return 1;case"Caution":return 2;case"Risky":return 3;default:return 4}}function Q(){const e=document.getElementById("fileSearch");e&&e.addEventListener("input",b);const t=document.getElementById("sizeFilter"),n=document.getElementById("typeFilter"),a=document.getElementById("safetyFilter");t&&t.addEventListener("change",b),n&&n.addEventListener("change",b),a&&a.addEventListener("change",b),document.querySelectorAll(".sortable").forEach(s=>{s.addEventListener("click",()=>W(s))})}function b(){var s,i,o,r;const e=((s=document.getElementById("fileSearch"))==null?void 0:s.value.toLowerCase())||"",t=((i=document.getElementById("sizeFilter"))==null?void 0:i.value)||"",n=((o=document.getElementById("typeFilter"))==null?void 0:o.value)||"",a=((r=document.getElementById("safetyFilter"))==null?void 0:r.value)||"";document.querySelectorAll(".file-row").forEach(c=>{const l=c.querySelector(".file-name-text").textContent.toLowerCase(),m=parseInt(c.dataset.fileSize),$=c.dataset.fileType,B=c.dataset.safetyLevel;let y=!0;if(e&&!l.includes(e)&&(y=!1),t){const S=m/1048576;t==="large"&&S<=10&&(y=!1),t==="medium"&&(S<=1||S>10)&&(y=!1),t==="small"&&S>=1&&(y=!1)}n&&$!==n&&(y=!1),a&&B!==a&&(y=!1),c.style.display=y?"":"none"})}function W(e){const t=e.closest("table"),n=t.querySelector("tbody"),a=Array.from(n.querySelectorAll("tr")),s=e.dataset.sort,i=e.classList.contains("sort-asc");t.querySelectorAll(".sortable").forEach(o=>{o.classList.remove("sort-asc","sort-desc")}),e.classList.add(i?"sort-desc":"sort-asc"),a.sort((o,r)=>{let c,l;switch(s){case"name":c=o.querySelector(".file-name-text").textContent.toLowerCase(),l=r.querySelector(".file-name-text").textContent.toLowerCase();break;case"size":c=parseInt(o.dataset.fileSize),l=parseInt(r.dataset.fileSize);break;case"modified":c=new Date(o.querySelector(".file-modified").textContent),l=new Date(r.querySelector(".file-modified").textContent);break;case"accessed":c=new Date(o.querySelector(".file-accessed").textContent),l=new Date(r.querySelector(".file-accessed").textContent);break;case"safety":c=w(o.dataset.safetyLevel),l=w(r.dataset.safetyLevel);break;default:return 0}return c<l?i?1:-1:c>l?i?-1:1:0}),a.forEach(o=>n.appendChild(o))}function p(e){const t=document.getElementById("scanButton"),n=document.getElementById("scanAllButton"),a=document.getElementById("stopButton");t.disabled=e,n.disabled=e,a.disabled=!e,e?(t.innerHTML='<span class="btn-icon">\u23F3</span>Scanning...',n.innerHTML='<span class="btn-icon">\u23F3</span>Scanning...'):(t.innerHTML='<span class="btn-icon">\u{1F50D}</span>Scan Selected Location',n.innerHTML='<span class="btn-icon">\u{1F310}</span>Scan All Safe Locations')}function d(e,t=!0){const n=document.getElementById("progressContainer"),a=document.getElementById("progressText");if(t){a.textContent=e,n.style.display="block",M();const s=document.getElementById("progressBar");s&&(s.style.width="100%",s.style.animation="pulse 2s infinite")}else{n.style.display="none";const s=document.getElementById("progressBar");s&&(s.style.animation="none")}}function M(){if(!L)return;const e=Math.floor((Date.now()-L)/1e3),t=Math.floor(e/60),n=e%60,a=`${t.toString().padStart(2,"0")}:${n.toString().padStart(2,"0")}`,s=document.getElementById("progressTime");s&&(s.textContent=a)}function v(e,t=!1,n=null){const a=document.getElementById("errorContainer");document.getElementById("errorMessage");const s=`
        <div class="error-icon">\u26A0\uFE0F</div>
        <div class="error-content">
            <h4>Error</h4>
            <p>${e}</p>
            ${t&&n?`
                <button class="btn btn-outline retry-button" onclick="retryCallback()">
                    <span class="btn-icon">\u{1F504}</span>
                    Retry
                </button>
            `:""}
        </div>
        <button id="errorClose" class="error-close">\xD7</button>
    `;a.innerHTML=s,a.style.display="flex";const i=a.querySelector("#errorClose");i&&i.addEventListener("click",h),t||setTimeout(()=>{h()},1e4)}function h(){const e=document.getElementById("errorContainer");e.style.display="none"}function X(){f&&clearInterval(f),f=setInterval(async()=>{try{if(!await O()){clearInterval(f),f=null;try{const t=await D(),n=JSON.parse(t);E(n),g=n}catch(t){v("Failed to get scan result: "+t.message)}p(!1),d("Scan completed!",!1);return}M(),d("Scanning in progress...",!0)}catch(e){console.error("Error polling progress:",e),d("Scanning... (progress unavailable)",!0)}},200)}function Y(){f&&(clearInterval(f),f=null)}function Z(){if(!g){v("No results to export");return}const e=JSON.stringify(g,null,2),t=new Blob([e],{type:"application/json"}),n=document.createElement("a");n.href=URL.createObjectURL(t),n.download=`cache-scan-results-${new Date().toISOString().split("T")[0]}.json`,n.click()}function u(e){if(e===0)return"0 Bytes";const t=1024,n=["Bytes","KB","MB","GB","TB"],a=Math.floor(Math.log(e)/Math.log(t));return parseFloat((e/Math.pow(t,a)).toFixed(2))+" "+n[a]}function C(e){const t=e/1e9;if(t<1)return(e/1e6).toFixed(0)+"ms";if(t<60)return t.toFixed(2)+"s";{const n=Math.floor(t/60),a=t%60;return`${n}m ${a.toFixed(1)}s`}}

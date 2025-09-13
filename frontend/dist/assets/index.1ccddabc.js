(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))n(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function s(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerpolicy&&(i.referrerPolicy=a.referrerpolicy),a.crossorigin==="use-credentials"?i.credentials="include":a.crossorigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(a){if(a.ep)return;a.ep=!0;const i=s(a);fetch(a.href,i)}})();function E(){return window.go.main.App.GetCacheLocationsFromConfig()}function x(){return window.go.main.App.GetLastScanResult()}function z(){return window.go.main.App.GetSystemInfo()}function D(){return window.go.main.App.IsScanning()}function M(e,t,s){return window.go.main.App.ScanCacheLocation(e,t,s)}function T(e){return window.go.main.App.ScanMultipleCacheLocations(e)}function A(){return window.go.main.App.StopScan()}let m=null,p=null,h=null;document.addEventListener("DOMContentLoaded",function(){O(),$(),k()});function O(){document.querySelector("#app").innerHTML=`
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
    `}async function $(){try{const e=await E(),t=JSON.parse(e);N(t);const s=await z(),n=JSON.parse(s);_(n)}catch(e){console.error("Error initializing app:",e),u("Failed to initialize application: "+e.message)}}function k(){const e=document.getElementById("scanButton"),t=document.getElementById("scanAllButton"),s=document.getElementById("stopButton"),n=document.getElementById("refreshButton"),a=document.getElementById("exportButton"),i=document.getElementById("errorClose");e&&e.addEventListener("click",w),t&&t.addEventListener("click",C),s&&s.addEventListener("click",async()=>{try{await A(),G(),l(!1),c("Scan stopped by user",!1)}catch(o){u("Failed to stop scan: "+o.message)}}),n&&n.addEventListener("click",$),a&&a.addEventListener("click",j),i&&i.addEventListener("click",g)}function N(e){const t=document.getElementById("locationSelect");t.innerHTML="";const s=document.createElement("option");s.value="",s.textContent="Select a cache location...",t.appendChild(s),e.forEach(n=>{const a=document.createElement("option");a.value=JSON.stringify(n),a.textContent=`${n.name} (${n.type})`,t.appendChild(a)})}function _(e){document.getElementById("osInfo").textContent=e.os,document.getElementById("appVersion").textContent=e.app_version,document.getElementById("goVersion").textContent=e.go_version,document.getElementById("lastUpdated").textContent=new Date(e.scan_time).toLocaleString()}async function w(){const e=document.getElementById("locationSelect"),t=e.options[e.selectedIndex];if(!t.value){u("Please select a cache location to scan");return}const s=JSON.parse(t.value);try{l(!0),c("Starting scan...",!0),h=Date.now();const n=await M(s.id,s.name,s.path),a=JSON.parse(n);a.status==="scan_started"?(c("Scan started in background...",!0),V()):(L(a),m=a,l(!1))}catch(n){console.error("Scan error:",n),u(`Scan failed: ${n.message}`,!0,()=>{g(),w()}),l(!1),c("Scan failed",!1)}}async function C(){try{l(!0),c("Starting full system scan...",!0),h=Date.now();const e=await E(),s=JSON.parse(e).filter(i=>i.type==="user"||i.type==="application");if(s.length===0){u("No safe cache locations found to scan"),l(!1),c("No locations to scan",!1);return}const n=await T(JSON.stringify(s)),a=JSON.parse(n);L(a),m=a,l(!1),c("Scan completed!",!1)}catch(e){console.error("Full scan error:",e),u(`Full scan failed: ${e.message}`,!0,()=>{g(),C()}),l(!1),c("Scan failed",!1)}}function L(e){const t=document.getElementById("scanResults"),s=document.getElementById("exportButton");e.locations?t.innerHTML=`
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
                        <h3>${S(e.total_size)}</h3>
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
                        </div>
                    </div>
                </div>
                <div class="locations-results">
                    ${e.locations.map(n=>R(n)).join("")}
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
                        <h3>${S(e.total_size)}</h3>
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
                        </div>
                    </div>
                </div>
                <div class="location-details">
                    <h4>${e.name}</h4>
                    <p class="location-path">${e.path}</p>
                    ${e.error?`<p class="error-text">Error: ${e.error}</p>`:""}
                    ${e.files?I(e.files,e.id):""}
                </div>
            </div>
        `,H(),s.disabled=!1}function R(e){const t=e.files===void 0&&!e.error;return`
        <div class="location-card" data-location-id="${e.id}">
            <div class="location-header" onclick="toggleLocationFiles('${e.id}')">
                <div class="location-info">
                    <h4>${e.name}</h4>
                    <p class="location-path">${e.path}</p>
                </div>
                <div class="location-stats">
                    ${t?'<span class="stat loading-stat">Loading...</span>':`<span class="stat">${e.file_count.toLocaleString()} files</span>
                         <span class="stat">${S(e.total_size)}</span>
                         <span class="stat">${B(e.scan_duration)}</span>`}
                </div>
                <div class="location-toggle">
                    <span class="toggle-icon">\u25BC</span>
                </div>
            </div>
            <div class="location-files" id="files-${e.id}" style="display: none;">
                ${t?q():e.files?I(e.files,e.id):'<p class="no-files">No files found</p>'}
            </div>
            ${e.error?`<div class="location-error">Error: ${e.error}</div>`:""}
        </div>
    `}function I(e,t){if(!e||e.length===0)return'<p class="no-files">No files found</p>';const s=[...e].sort((n,a)=>a.size-n.size);return`
        <div class="file-table-container">
            <table class="file-table" data-location-id="${t}">
                <thead>
                    <tr>
                        <th class="sortable" data-sort="name">Name <span class="sort-icon">\u2195</span></th>
                        <th class="sortable" data-sort="size">Size <span class="sort-icon">\u2195</span></th>
                        <th class="sortable" data-sort="modified">Modified <span class="sort-icon">\u2195</span></th>
                        <th class="sortable" data-sort="accessed">Accessed <span class="sort-icon">\u2195</span></th>
                        <th>Type</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${s.map(n=>J(n)).join("")}
                </tbody>
            </table>
        </div>
    `}function q(){return`
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
    `}function J(e){const t=e.is_dir,s=t?"\u{1F4C1}":"\u{1F4C4}",n=t?"Directory":"File",a=t?"-":S(e.size),i=new Date(e.last_modified).toLocaleDateString(),o=new Date(e.last_accessed).toLocaleDateString();return`
        <tr class="file-row" data-file-path="${e.path}" data-file-size="${e.size}" data-file-type="${n.toLowerCase()}">
            <td class="file-name">
                <span class="file-icon">${s}</span>
                <span class="file-name-text" title="${e.path}">${e.name}</span>
            </td>
            <td class="file-size">${a}</td>
            <td class="file-modified">${i}</td>
            <td class="file-accessed">${o}</td>
            <td class="file-type">${n}</td>
            <td class="file-actions">
                <button class="btn-icon" onclick="showFileDetails('${e.path}', '${e.name}', ${e.size}, '${e.last_modified}', '${e.last_accessed}', '${n}', '${e.permissions}')" title="View Details">
                    \u2139\uFE0F
                </button>
                <button class="btn-icon" onclick="revealInFinder('${e.path}')" title="Reveal in Finder">
                    \u{1F4C2}
                </button>
            </td>
        </tr>
    `}function H(){const e=document.getElementById("fileSearch");e&&e.addEventListener("input",b);const t=document.getElementById("sizeFilter"),s=document.getElementById("typeFilter");t&&t.addEventListener("change",b),s&&s.addEventListener("change",b),document.querySelectorAll(".sortable").forEach(n=>{n.addEventListener("click",()=>P(n))})}function b(){var n,a,i;const e=((n=document.getElementById("fileSearch"))==null?void 0:n.value.toLowerCase())||"",t=((a=document.getElementById("sizeFilter"))==null?void 0:a.value)||"",s=((i=document.getElementById("typeFilter"))==null?void 0:i.value)||"";document.querySelectorAll(".file-row").forEach(o=>{const v=o.querySelector(".file-name-text").textContent.toLowerCase(),r=parseInt(o.dataset.fileSize),d=o.dataset.fileType;let f=!0;if(e&&!v.includes(e)&&(f=!1),t){const y=r/1048576;t==="large"&&y<=10&&(f=!1),t==="medium"&&(y<=1||y>10)&&(f=!1),t==="small"&&y>=1&&(f=!1)}s&&d!==s&&(f=!1),o.style.display=f?"":"none"})}function P(e){const t=e.closest("table"),s=t.querySelector("tbody"),n=Array.from(s.querySelectorAll("tr")),a=e.dataset.sort,i=e.classList.contains("sort-asc");t.querySelectorAll(".sortable").forEach(o=>{o.classList.remove("sort-asc","sort-desc")}),e.classList.add(i?"sort-desc":"sort-asc"),n.sort((o,v)=>{let r,d;switch(a){case"name":r=o.querySelector(".file-name-text").textContent.toLowerCase(),d=v.querySelector(".file-name-text").textContent.toLowerCase();break;case"size":r=parseInt(o.dataset.fileSize),d=parseInt(v.dataset.fileSize);break;case"modified":r=new Date(o.querySelector(".file-modified").textContent),d=new Date(v.querySelector(".file-modified").textContent);break;case"accessed":r=new Date(o.querySelector(".file-accessed").textContent),d=new Date(v.querySelector(".file-accessed").textContent);break;default:return 0}return r<d?i?1:-1:r>d?i?-1:1:0}),n.forEach(o=>s.appendChild(o))}function l(e){const t=document.getElementById("scanButton"),s=document.getElementById("scanAllButton"),n=document.getElementById("stopButton");t.disabled=e,s.disabled=e,n.disabled=!e,e?(t.innerHTML='<span class="btn-icon">\u23F3</span>Scanning...',s.innerHTML='<span class="btn-icon">\u23F3</span>Scanning...'):(t.innerHTML='<span class="btn-icon">\u{1F50D}</span>Scan Selected Location',s.innerHTML='<span class="btn-icon">\u{1F310}</span>Scan All Safe Locations')}function c(e,t=!0){const s=document.getElementById("progressContainer"),n=document.getElementById("progressText");if(t){n.textContent=e,s.style.display="block",F();const a=document.getElementById("progressBar");a&&(a.style.width="100%",a.style.animation="pulse 2s infinite")}else{s.style.display="none";const a=document.getElementById("progressBar");a&&(a.style.animation="none")}}function F(){if(!h)return;const e=Math.floor((Date.now()-h)/1e3),t=Math.floor(e/60),s=e%60,n=`${t.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`,a=document.getElementById("progressTime");a&&(a.textContent=n)}function u(e,t=!1,s=null){const n=document.getElementById("errorContainer");document.getElementById("errorMessage");const a=`
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
    `;n.innerHTML=a,n.style.display="flex";const i=n.querySelector("#errorClose");i&&i.addEventListener("click",g),t||setTimeout(()=>{g()},1e4)}function g(){const e=document.getElementById("errorContainer");e.style.display="none"}function V(){p&&clearInterval(p),p=setInterval(async()=>{try{if(!await D()){clearInterval(p),p=null;try{const t=await x(),s=JSON.parse(t);L(s),m=s}catch(t){u("Failed to get scan result: "+t.message)}l(!1),c("Scan completed!",!1);return}F(),c("Scanning in progress...",!0)}catch(e){console.error("Error polling progress:",e),c("Scanning... (progress unavailable)",!0)}},200)}function G(){p&&(clearInterval(p),p=null)}function j(){if(!m){u("No results to export");return}const e=JSON.stringify(m,null,2),t=new Blob([e],{type:"application/json"}),s=document.createElement("a");s.href=URL.createObjectURL(t),s.download=`cache-scan-results-${new Date().toISOString().split("T")[0]}.json`,s.click()}function S(e){if(e===0)return"0 Bytes";const t=1024,s=["Bytes","KB","MB","GB","TB"],n=Math.floor(Math.log(e)/Math.log(t));return parseFloat((e/Math.pow(t,n)).toFixed(2))+" "+s[n]}function B(e){const t=e/1e9;if(t<1)return(e/1e6).toFixed(0)+"ms";if(t<60)return t.toFixed(2)+"s";{const s=Math.floor(t/60),n=t%60;return`${s}m ${n.toFixed(1)}s`}}

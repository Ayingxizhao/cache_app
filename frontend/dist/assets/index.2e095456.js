(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))n(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function t(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerpolicy&&(o.referrerPolicy=a.referrerpolicy),a.crossorigin==="use-credentials"?o.credentials="include":a.crossorigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(a){if(a.ep)return;a.ep=!0;const o=t(a);fetch(a.href,o)}})();function f(s){return window.go.main.App.CleanupBackupsByAge(s)}function y(){return window.go.main.App.GetBackupBrowserData()}function S(){return window.go.main.App.GetCacheLocationsFromConfig()}function w(){return window.go.main.App.GetLastScanResult()}function k(){return window.go.main.App.GetSystemInfo()}function L(s,e,t){return window.go.main.App.ScanCacheLocation(s,e,t)}function d(s){return window.go.main.App.ScanMultipleCacheLocations(s)}console.log("Loading production navigation system...");class C{constructor(){this.state={currentSection:"scanner",isScanning:!1,systemStatus:"ready",systemMessage:"Ready",cacheLocations:[],scanResults:null,selectedFiles:new Set,backupSessions:[]},this.listeners=new Map}get(e){return this.state[e]}set(e,t){this.state[e]=t,this.notify(e,t)}subscribe(e,t){return this.listeners.has(e)||this.listeners.set(e,new Set),this.listeners.get(e).add(t),()=>{const n=this.listeners.get(e);n&&n.delete(t)}}notify(e,t){const n=this.listeners.get(e);n&&n.forEach(a=>{try{a(t)}catch(o){console.error(`Error in state listener for ${e}:`,o)}})}setScanning(e){console.log("setScanning called with:",e),this.set("isScanning",e),this.setSystemStatus(e?"scanning":"ready",e?"Scanning in progress...":"Ready"),console.log("Scanning state updated to:",e)}setSystemStatus(e,t){this.set("systemStatus",e),this.set("systemMessage",t)}setScanResults(e){console.log("setScanResults called with:",e),console.log("Results type:",typeof e),console.log("Results length:",e?e.length:"null/undefined"),this.set("scanResults",e),this.updateScanResultsDisplay(e),console.log("Scan results updated in display")}updateScanResultsDisplay(e){const t=document.getElementById("scanResults");if(!t)return;if(!e||e.length===0){t.innerHTML=`
                <div class="no-results">
                    <div class="no-results-icon">\u{1F4C1}</div>
                    <h3>No scan results yet</h3>
                    <p>Select a cache location and click "Scan Selected" or use the chooser above to start a scan.</p>
                </div>
            `;return}let n='<div class="scan-results-content">';e.forEach((a,o)=>{var u,p,g,m,h,b,v;const r=a&&((g=(p=(u=a.totalSize)!=null?u:a.total_size)!=null?p:a.total_size_bytes)!=null?g:a.total_size_in_bytes)||0,i=a&&((v=(b=(m=a.fileCount)!=null?m:a.file_count)!=null?b:(h=a.files)==null?void 0:h.length)!=null?v:a.file_count_estimate)||0,c=this.formatBytes(r||0),l=Number(i)||0;n+=`
                <div class="location-result">
                    <div class="location-header">
                        <h4>${this.escapeHtml(a.name||a.id)}</h4>
                        <div class="location-stats">
                            <span class="stat">${l.toLocaleString()} files</span>
                            <span class="stat">${c}</span>
                        </div>
                    </div>
                    <div class="location-path">${this.escapeHtml(a.path)}</div>
                    ${a.error?`<div class="error-text">Error: ${this.escapeHtml(a.error)}</div>`:""}
                </div>
            `}),n+="</div>",t.innerHTML=n}formatBytes(e){if(e===0)return"0 B";const t=1024,n=["B","KB","MB","GB","TB"],a=Math.floor(Math.log(e)/Math.log(t));return parseFloat((e/Math.pow(t,a)).toFixed(2))+" "+n[a]}escapeHtml(e){return e==null?"":String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}setCacheLocations(e){this.set("cacheLocations",e)}selectFile(e){const t=new Set(this.state.selectedFiles);t.add(e),this.set("selectedFiles",t)}clearSelection(){this.set("selectedFiles",new Set)}getSelectedFilesCount(){return this.state.selectedFiles.size}}class R{constructor(){this.currentRoute=null,this.routes=new Map,this.listeners=new Set,this.defineRoutes()}defineRoutes(){this.routes.set("home",{name:"home",title:"Dashboard",section:"home",icon:"\u{1F3E0}",description:"Scan overview and quick stats"}),this.routes.set("scanner",{name:"scanner",title:"Cache Scanner",section:"scanner",icon:"\u{1F50D}",description:"Main cleaning interface for cache files"}),this.routes.set("backup",{name:"backup",title:"Backup Manager",section:"backup",icon:"\u{1F4BE}",description:"Browse and restore backups"}),this.routes.set("settings",{name:"settings",title:"Settings",section:"settings",icon:"\u2699\uFE0F",description:"App configuration"})}navigate(e){const t=this.routes.get(e);if(t){const n=this.currentRoute;return this.currentRoute=t,this.listeners.forEach(a=>{a(this.currentRoute,n)}),!0}return!1}subscribe(e){return this.listeners.add(e),()=>{this.listeners.delete(e)}}getCurrentRoute(){return this.currentRoute}}class B{constructor(e,t){this.router=e,this.appState=t,this.currentSection="scanner",this.router.subscribe((n,a)=>{this.updateCurrentSection(n)}),this.appState.subscribe("systemStatus",n=>{this.updateSystemStatus(n)})}createNavigationHTML(){return`
            <nav class="app-navigation">
                <div class="nav-header">
                    <div class="nav-logo">
                        <div class="nav-logo-icon">\u{1F5C2}\uFE0F</div>
                        <div class="nav-logo-text">
                            <h2>Cache App</h2>
                            <p>macOS Cache Manager</p>
                        </div>
                    </div>
                    <div class="nav-status">
                        <div class="status-indicator" id="systemStatus">
                            <span class="status-dot ready"></span>
                            <span class="status-text">Ready</span>
                        </div>
                    </div>
                </div>
                <div class="nav-tabs">
                    <button class="nav-tab active" data-section="home">
                        <span class="nav-tab-icon">\u{1F3E0}</span>
                        <span class="nav-tab-text">Dashboard</span>
                    </button>
                    <button class="nav-tab" data-section="scanner">
                        <span class="nav-tab-icon">\u{1F50D}</span>
                        <span class="nav-tab-text">Cache Scanner</span>
                    </button>
                    <button class="nav-tab" data-section="backup">
                        <span class="nav-tab-icon">\u{1F4BE}</span>
                        <span class="nav-tab-text">Backup Manager</span>
                    </button>
                    <button class="nav-tab" data-section="settings">
                        <span class="nav-tab-icon">\u2699\uFE0F</span>
                        <span class="nav-tab-text">Settings</span>
                    </button>
                </div>
            </nav>
        `}createMainContentHTML(){return`
            <main class="app-main">
                <div class="main-header">
                    <div class="section-title">
                        <h1 id="sectionTitle">Dashboard</h1>
                        <p id="sectionDescription">Scan overview and quick stats</p>
                    </div>
                    <div class="main-actions" id="mainActions">
                        <!-- Actions will be dynamically inserted -->
                    </div>
                </div>
                <div class="main-content">
                    <div class="content-section active" id="home-section">
                        <!-- Dashboard content will be loaded here -->
                    </div>
                    <div class="content-section" id="scanner-section">
                        <!-- Scanner content will be loaded here -->
                    </div>
                    <div class="content-section" id="backup-section">
                        <!-- Backup content will be loaded here -->
                    </div>
                    <div class="content-section" id="settings-section">
                        <!-- Settings content will be loaded here -->
                    </div>
                </div>
            </main>
        `}updateCurrentSection(e){if(!e)return;this.currentSection=e.section||e.name,document.querySelectorAll(".nav-tab").forEach(c=>{c.classList.remove("active")});const n=document.querySelector(`[data-section="${this.currentSection}"]`);n&&n.classList.add("active");const a=document.getElementById("sectionTitle"),o=document.getElementById("sectionDescription");a&&(a.textContent=e.title),o&&(o.textContent=e.description),this.updateMainActions(this.currentSection),document.querySelectorAll(".content-section").forEach(c=>{c.classList.remove("active")});const i=document.getElementById(`${this.currentSection}-section`);i&&i.classList.add("active")}updateMainActions(e){const t=document.getElementById("mainActions");if(!t)return;let n="";switch(e){case"home":n=`
                    <button class="btn btn-outline" id="refreshDashboard">
                        <span class="btn-icon">\u{1F504}</span>
                        Refresh Dashboard
                    </button>
                `;break;case"scanner":n=`
                    <button class="btn btn-outline" id="refreshLocations">
                        <span class="btn-icon">\u{1F504}</span>
                        Refresh Locations
                    </button>
                    <button class="btn btn-primary" id="scanAllLocations">
                        <span class="btn-icon">\u{1F310}</span>
                        Scan All Safe
                    </button>
                `;break;case"backup":n=`
                    <button class="btn btn-outline" id="refreshBackups">
                        <span class="btn-icon">\u{1F504}</span>
                        Refresh Backups
                    </button>
                    <button class="btn btn-secondary" id="cleanupOldBackups">
                        <span class="btn-icon">\u{1F5D1}\uFE0F</span>
                        Cleanup Old
                    </button>
                `;break;case"settings":n=`
                    <button class="btn btn-outline" id="resetSettings">
                        <span class="btn-icon">\u{1F504}</span>
                        Reset to Defaults
                    </button>
                    <button class="btn btn-primary" id="saveSettings">
                        <span class="btn-icon">\u{1F4BE}</span>
                        Save Settings
                    </button>
                `;break}t.innerHTML=n}updateSystemStatus(e){const t=document.querySelector(".status-dot"),n=document.querySelector(".status-text");t&&(t.className=`status-dot ${e}`),n&&(n.textContent=this.appState.get("systemMessage"))}switchSection(e){console.log("Switching to section:",e),this.router.navigate(e)}async loadCacheLocations(){try{const e=await S(),t=JSON.parse(e||"[]");this.appState.setCacheLocations(t),this.populateLandingList(t),console.log("Cache locations loaded:",t.length)}catch(e){console.error("Failed to load cache locations:",e)}}populateLandingList(e){const t=document.getElementById("landingLocationsList");if(!t)return;if(t.innerHTML="",!e||e.length===0){t.innerHTML='<div class="muted">No cache locations available</div>';return}const n=document.createDocumentFragment();e.forEach((a,o)=>{const r=a.id||`loc-${o}`,i=(a.name?a.name:r)+(a.path?` (${a.path})`:""),c=document.createElement("div");c.className="landing-location-row",c.innerHTML=`<label><input type="checkbox" data-loc-index="${o}" value="${r}"> ${this.escapeHtml(i)}</label>`,n.appendChild(c)}),t.appendChild(n)}escapeHtml(e){return e==null?"":String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}initialize(){console.log("Initializing Production Navigation..."),document.addEventListener("click",t=>{if(t.target.closest(".nav-tab")){const n=t.target.closest(".nav-tab").dataset.section;console.log("Navigation tab clicked:",n),this.switchSection(n)}this.handleActionClicks(t)}),this.loadCacheLocations();const e=this.router.getCurrentRoute();e?this.updateCurrentSection(e):this.router.navigate("scanner"),console.log("Production Navigation initialized")}handleActionClicks(e){const t=e.target.closest("button");if(!!t)switch(t.id){case"refreshLocations":case"refreshLocationsLanding":this.loadCacheLocations();break;case"scanAllLocations":case"scanAllLanding":this.scanAllLocations();break;case"scanSelectedLanding":this.scanSelectedLocations();break;case"refreshBackups":this.refreshBackups();break;case"cleanupOldBackups":this.cleanupOldBackups();break;case"saveSettings":this.saveSettings();break;case"resetSettings":this.resetSettings();break}}async scanAllLocations(){try{const t=this.appState.get("cacheLocations").filter(r=>r.type==="user"||r.type==="application");if(t.length===0){console.warn("No safe locations found to scan");return}this.appState.setScanning(!0);const n=JSON.stringify(t.map(r=>({id:r.id,name:r.name,path:r.path}))),a=await d(n),o=JSON.parse(a);this.appState.setScanResults(o),this.appState.setScanning(!1),console.log("Scan completed:",o)}catch(e){console.error("Scan error:",e),this.appState.setScanning(!1)}}async scanSelectedLocations(){try{const e=Array.from(document.querySelectorAll('#landingLocationsList input[type="checkbox"]:checked'));if(e.length===0){console.warn("No locations selected for scanning");return}const t=this.appState.get("cacheLocations"),n=e.map(i=>{const c=Number(i.dataset.locIndex),l=t[c];return{id:l==null?void 0:l.id,name:l==null?void 0:l.name,path:l==null?void 0:l.path}}).filter(i=>i&&i.path);if(n.length===0){console.error("Selected locations invalid");return}this.appState.setScanning(!0);const a=JSON.stringify(n);console.log("Sending scan request with payload:",a);const o=await d(a);console.log("ScanMultipleCacheLocations response:",o);const r=JSON.parse(o||"{}");console.log("Parsed scan result:",r),console.log("Result keys:",Object.keys(r)),console.log("Has Locations:",!!r.Locations),console.log("Has locations:",!!r.locations),console.log("Locations type:",typeof r.Locations),console.log("locations type:",typeof r.locations),r.locations&&Array.isArray(r.locations)?(console.log("Using locations array:",r.locations),this.appState.setScanResults(r.locations),this.appState.setScanning(!1),console.log("Scan completed with results:",r.locations)):r.Locations&&Array.isArray(r.Locations)?(console.log("Using Locations array:",r.Locations),this.appState.setScanResults(r.Locations),this.appState.setScanning(!1),console.log("Scan completed with results (uppercase):",r.Locations)):(console.error("No valid scan results received:",r),console.error("Result structure:",JSON.stringify(r,null,2)),console.error("Available keys:",Object.keys(r)),this.appState.setScanning(!1),window.notificationSystem&&window.notificationSystem.error("Scan completed but no results received"))}catch(e){console.error("Scan selected error:",e),this.appState.setScanning(!1)}}async pollForScanResult(e=5*60*1e3,t=Date.now()){try{if(Date.now()-t>e){console.warn("Scan polling timed out after 5 minutes"),this.appState.setScanning(!1),window.notificationSystem&&window.notificationSystem.error("Scan timed out after 5 minutes");return}const a=await w();console.log("Raw scan result:",a);const o=JSON.parse(a||"{}");console.log("Parsed scan result:",o),o&&o.status!=="no_result"&&(o.id||o.Locations)?o.Locations&&Array.isArray(o.Locations)?(this.appState.setScanResults(o.Locations),this.appState.setScanning(!1),console.log("ScanResult with Locations received:",o.Locations)):o.id&&o.name&&o.path?(this.appState.setScanResults([o]),this.appState.setScanning(!1),console.log("Single location result received:",o)):(console.log("Valid result but unknown format:",o),this.appState.setScanning(!1)):o.status==="no_result"?(console.log("No result yet, continuing to poll..."),setTimeout(()=>this.pollForScanResult(e,t),1e3)):(console.log("Unknown status, continuing to poll:",o.status),setTimeout(()=>this.pollForScanResult(e,t),1e3))}catch(n){console.error("Poll scan result error:",n),setTimeout(()=>this.pollForScanResult(e,t),2e3)}}async refreshBackups(){try{const e=await y(),t=JSON.parse(e);this.appState.set("backupSessions",t.sessions||[]),console.log("Backup data refreshed")}catch(e){console.error("Backup refresh error:",e)}}async cleanupOldBackups(){try{const e=await f(30),t=JSON.parse(e);console.log("Backup cleanup completed:",t),this.refreshBackups()}catch(e){console.error("Backup cleanup error:",e)}}saveSettings(){console.log("Settings saved")}resetSettings(){console.log("Settings reset")}}document.addEventListener("DOMContentLoaded",function(){console.log("DOM loaded, starting production navigation system...");try{const s=new C,e=new R,t=new B(e,s);document.querySelector("#app").innerHTML=`
            <div class="app-container">
                ${t.createNavigationHTML()}
                <div class="main-content">
                    ${t.createMainContentHTML()}
                </div>
            </div>
        `,t.initialize(),window.navigation=t,window.router=e,window.appState=s,window.ScanCacheLocation=L,window.ScanMultipleCacheLocations=d,window.GetCacheLocationsFromConfig=S,window.GetSystemInfo=k,window.GetLastScanResult=w,window.GetBackupBrowserData=y,window.CleanupBackupsByAge=f,window.scanSelectedLandingHandler=!0,window.scanAllLandingHandler=!0,console.log("\u2705 Production navigation system initialized successfully!"),console.log("\u{1F3AF} Navigation system is ready with Wails integration")}catch(s){console.error("\u274C Failed to initialize production navigation:",s),document.querySelector("#app").innerHTML=`
            <div class="error">
                <h2>Initialization Error</h2>
                <p>Failed to initialize navigation system:</p>
                <pre>${s.message}</pre>
                <button onclick="location.reload()">Reload Page</button>
            </div>
        `}});const x=document.createElement("style");x.textContent=`
    /* Production Navigation Styles */
    .app-container {
        min-height: 100vh;
        background: var(--primary-bg);
    }
    
    .main-layout {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }
    
    /* Navigation Styles */
    .app-navigation {
        background: var(--secondary-bg);
        border-bottom: 1px solid var(--border-color);
        padding: 1rem 2rem;
        width: 100%;
        flex-shrink: 0;
    }
    
    .nav-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    .nav-logo {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .nav-logo-icon {
        font-size: 2rem;
        background: var(--primary-color);
        color: white;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .nav-logo-text h2 {
        margin: 0;
        color: var(--text-primary);
        font-size: 1.5rem;
    }
    
    .nav-logo-text p {
        margin: 0;
        color: var(--text-secondary);
        font-size: 0.875rem;
    }
    
    .status-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: var(--primary-bg);
        border-radius: var(--radius-md);
        border: 1px solid var(--border-color);
    }
    
    .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--success-color);
    }
    
    .status-dot.ready { background: var(--success-color); }
    .status-dot.scanning { background: var(--warning-color); }
    .status-dot.error { background: var(--error-color); }
    
    .status-text {
        font-size: 0.875rem;
        color: var(--text-primary);
        font-weight: 500;
    }
    
    .nav-tabs {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
    }
    
    /* Main Content Styles */
    .main-content {
        flex: 1;
        overflow-y: auto;
        padding: 2rem;
    }
    
    /* Scan Results Styles */
    .scan-results {
        margin-top: 2rem;
        background: var(--primary-bg);
        border-radius: var(--radius-lg);
        padding: 1.5rem;
        border: 1px solid var(--border-color);
    }
    
    .no-results {
        text-align: center;
        padding: 3rem 2rem;
        color: var(--text-secondary);
    }
    
    .no-results-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    }
    
    .no-results h3 {
        margin-bottom: 0.5rem;
        color: var(--text-primary);
    }
    
    .scan-results-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .location-result {
        background: var(--secondary-bg);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 1.5rem;
        transition: all 0.2s ease;
    }
    
    .location-result:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-1px);
    }
    
    .location-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    
    .location-header h4 {
        margin: 0;
        color: var(--text-primary);
        font-size: 1.1rem;
        font-weight: 600;
    }
    
    .location-stats {
        display: flex;
        gap: 1rem;
    }
    
    .stat {
        background: var(--tertiary-bg);
        color: var(--text-secondary);
        padding: 0.25rem 0.75rem;
        border-radius: var(--radius-sm);
        font-size: 0.8rem;
        font-weight: 500;
    }
    
    .location-path {
        font-family: 'Monaco', 'Menlo', monospace;
        background: var(--tertiary-bg);
        padding: 0.5rem;
        border-radius: var(--radius-sm);
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        color: var(--text-secondary);
        word-break: break-all;
    }
    
    .error-text {
        color: var(--error-color);
        font-weight: 500;
        font-size: 0.9rem;
    }
    
    .nav-tab {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: none;
        border: none;
        padding: 1rem 2rem;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all 0.2s ease;
        color: var(--text-secondary);
        font-weight: 500;
        min-width: 160px;
        justify-content: center;
    }
    
    .nav-tab:hover {
        background: var(--hover-bg);
        color: var(--text-primary);
    }
    
    .nav-tab.active {
        background: var(--primary-color);
        color: white;
    }
    
    .nav-tab-icon {
        font-size: 1.125rem;
    }
    
    .nav-tab-text {
        font-size: 0.875rem;
    }
    
    /* Main Content Styles */
    .app-main {
        flex: 1;
        padding: 2rem;
        background: var(--primary-bg);
    }
    
    .main-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--border-color);
    }
    
    .section-title h1 {
        margin: 0 0 0.5rem 0;
        color: var(--text-primary);
        font-size: 2rem;
    }
    
    .section-title p {
        margin: 0;
        color: var(--text-secondary);
        font-size: 1.125rem;
    }
    
    .main-actions {
        display: flex;
        gap: 1rem;
    }
    
    .btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: var(--radius-md);
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s ease;
        text-decoration: none;
    }
    
    .btn-outline {
        background: transparent;
        color: var(--text-primary);
        border: 1px solid var(--border-color);
    }
    
    .btn-outline:hover {
        background: var(--hover-bg);
    }
    
    .btn-primary {
        background: var(--primary-color);
        color: white;
    }
    
    .btn-primary:hover {
        background: var(--primary-color-dark);
    }
    
    .btn-success {
        background: var(--success-color);
        color: white;
    }
    
    .btn-danger {
        background: var(--error-color);
        color: white;
    }
    
    .btn-secondary {
        background: var(--text-secondary);
        color: white;
    }
    
    .btn-icon {
        font-size: 1rem;
    }
    
    .content-section {
        display: none;
    }
    
    .content-section.active {
        display: block;
    }
    
    /* Scanner Content */
    .scanner-landing {
        background: var(--secondary-bg);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 2rem;
        margin-bottom: 2rem;
    }
    
    .scanner-landing h3 {
        margin: 0 0 1rem 0;
        color: var(--text-primary);
    }
    
    .scanner-landing p {
        margin: 0 0 1.5rem 0;
        color: var(--text-secondary);
    }
    
    .landing-controls {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
    }
    
    .landing-locations-list {
        max-height: 300px;
        overflow-y: auto;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 1rem;
        background: var(--primary-bg);
    }
    
    .landing-location-row {
        padding: 0.5rem 0;
        border-bottom: 1px solid var(--border-color-light);
    }
    
    .landing-location-row:last-child {
        border-bottom: none;
    }
    
    .landing-location-row label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        color: var(--text-primary);
    }
    
    .landing-location-row input[type="checkbox"] {
        margin: 0;
    }
    
    /* Cleaner Content */
    .overview-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }
    
    .overview-card {
        background: var(--secondary-bg);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .card-icon {
        font-size: 2rem;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }
    
    .safe-files .card-icon { background: var(--success-color); }
    .caution-files .card-icon { background: var(--warning-color); }
    .risky-files .card-icon { background: var(--error-color); }
    
    .card-content h3 {
        margin: 0 0 0.5rem 0;
        color: var(--text-primary);
        font-size: 1.5rem;
    }
    
    .card-content p {
        margin: 0;
        color: var(--text-secondary);
    }
    
    .bulk-actions {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
    }
    
    /* Backup Content */
    .overview-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }
    
    .stat-card {
        background: var(--secondary-bg);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .stat-icon {
        font-size: 2rem;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-color);
        border-radius: 50%;
        color: white;
    }
    
    .stat-content h3 {
        margin: 0 0 0.5rem 0;
        color: var(--text-primary);
        font-size: 1.5rem;
    }
    
    .stat-content p {
        margin: 0;
        color: var(--text-secondary);
    }
    
    .search-controls {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        align-items: center;
    }
    
    .search-box {
        position: relative;
        flex: 1;
        max-width: 300px;
    }
    
    .search-input {
        width: 100%;
        padding: 0.75rem 2.5rem 0.75rem 1rem;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        background: var(--primary-bg);
        color: var(--text-primary);
    }
    
    .search-icon {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-secondary);
    }
    
    .filter-select {
        padding: 0.75rem 1rem;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        background: var(--primary-bg);
        color: var(--text-primary);
    }
    
    /* Settings Content */
    .settings-sections {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }
    
    .settings-section {
        background: var(--secondary-bg);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: 1.5rem;
    }
    
    .settings-section h3 {
        margin: 0 0 1.5rem 0;
        color: var(--text-primary);
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 0.5rem;
    }
    
    .setting-group {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    
    .setting-label {
        min-width: 150px;
        color: var(--text-primary);
        font-weight: 500;
    }
    
    .setting-control {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
    }
    
    .form-input {
        flex: 1;
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        background: var(--primary-bg);
        color: var(--text-primary);
    }
    
    .form-select {
        flex: 1;
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        background: var(--primary-bg);
        color: var(--text-primary);
    }
    
    .form-checkbox {
        width: 1.25rem;
        height: 1.25rem;
    }
    
    .setting-unit {
        color: var(--text-secondary);
        font-size: 0.875rem;
    }
    
    /* No Results */
    .no-results {
        text-align: center;
        padding: 3rem;
        color: var(--text-secondary);
    }
    
    .no-results-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }
    
    .no-results h3 {
        margin: 0 0 1rem 0;
        color: var(--text-primary);
    }
    
    .no-results p {
        margin: 0;
    }
    
    .muted {
        color: var(--text-secondary);
        font-style: italic;
        text-align: center;
        padding: 2rem;
    }
    
    /* Error Styles */
    .error {
        text-align: center;
        padding: 2rem;
        background: var(--error-color);
        color: white;
        margin: 2rem;
        border-radius: var(--radius-lg);
    }
    
    .error h2 {
        margin: 0 0 1rem 0;
    }
    
    .error pre {
        background: rgba(0,0,0,0.2);
        padding: 1rem;
        border-radius: var(--radius-sm);
        margin: 1rem 0;
        text-align: left;
        overflow-x: auto;
    }
    
    .error button {
        background: white;
        color: var(--error-color);
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: var(--radius-md);
        cursor: pointer;
        font-weight: 600;
        margin-top: 1rem;
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
        .app-navigation {
            padding: 1rem;
        }
        
        .nav-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
        }
        
        .nav-tabs {
            flex-wrap: wrap;
        }
        
        .app-main {
            padding: 1rem;
        }
        
        .main-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
        }
        
        .main-actions {
            flex-wrap: wrap;
        }
        
        .landing-controls {
            flex-direction: column;
        }
        
        .bulk-actions {
            flex-direction: column;
        }
        
        .search-controls {
            flex-direction: column;
            align-items: stretch;
        }
        
        .search-box {
            max-width: none;
        }
        
        .setting-group {
            flex-direction: column;
            align-items: flex-start;
        }
        
        .setting-label {
            min-width: auto;
        }
    }
`;document.head.appendChild(x);

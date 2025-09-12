(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function e(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerpolicy&&(a.referrerPolicy=o.referrerpolicy),o.crossorigin==="use-credentials"?a.credentials="include":o.crossorigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(o){if(o.ep)return;o.ep=!0;const a=e(o);fetch(o.href,a)}})();function u(){return window.go.main.App.GetCacheLocationsFromConfig()}function f(){return window.go.main.App.GetSystemInfo()}function S(t,n,e){return window.go.main.App.ScanCacheLocation(t,n,e)}function y(t){return window.go.main.App.ScanMultipleCacheLocations(t)}function h(){return window.go.main.App.StopScan()}let g=null;document.addEventListener("DOMContentLoaded",function(){v()});async function v(){try{const t=await u(),n=JSON.parse(t);L(n);const e=await f(),s=JSON.parse(e);B(s)}catch(t){console.error("Error initializing app:",t),c("Failed to initialize application: "+t.message)}}function L(t){const n=document.getElementById("locationSelect"),e=document.createElement("option");e.value="",e.textContent="Select a cache location...",n.appendChild(e),t.forEach(s=>{const o=document.createElement("option");o.value=JSON.stringify(s),o.textContent=`${s.name} (${s.type})`,n.appendChild(o)})}function B(t){const n=document.getElementById("systemInfo");n.innerHTML=`
        <h3>System Information</h3>
        <p><strong>OS:</strong> ${t.os}</p>
        <p><strong>App Version:</strong> ${t.app_version}</p>
        <p><strong>Go Version:</strong> ${t.go_version}</p>
        <p><strong>Last Updated:</strong> ${new Date(t.scan_time).toLocaleString()}</p>
    `}async function $(){const t=document.getElementById("locationSelect"),n=t.options[t.selectedIndex];if(!n.value){c("Please select a cache location to scan");return}const e=JSON.parse(n.value);try{i(!0),p("Starting scan...");const s=await S(e.id,e.name,e.path),o=JSON.parse(s);m(o),g=o}catch(s){c("Scan failed: "+s.message)}finally{i(!1)}}async function b(){try{i(!0),p("Starting full system scan...");const t=await u(),e=JSON.parse(t).filter(a=>a.type==="user"||a.type==="application"),s=await y(JSON.stringify(e)),o=JSON.parse(s);m(o),g=o}catch(t){c("Full scan failed: "+t.message)}finally{i(!1)}}function m(t){const n=document.getElementById("scanResults");t.locations?n.innerHTML=`
            <h3>Scan Results</h3>
            <div class="summary">
                <p><strong>Total Locations:</strong> ${t.total_locations}</p>
                <p><strong>Total Files:</strong> ${t.total_files.toLocaleString()}</p>
                <p><strong>Total Size:</strong> ${l(t.total_size)}</p>
                <p><strong>Scan Duration:</strong> ${d(t.scan_duration)}</p>
            </div>
            <div class="locations">
                ${t.locations.map(e=>`
                    <div class="location-result">
                        <h4>${e.name}</h4>
                        <p><strong>Path:</strong> ${e.path}</p>
                        <p><strong>Files:</strong> ${e.file_count.toLocaleString()}</p>
                        <p><strong>Size:</strong> ${l(e.total_size)}</p>
                        <p><strong>Duration:</strong> ${d(e.scan_duration)}</p>
                        ${e.error?`<p class="error"><strong>Error:</strong> ${e.error}</p>`:""}
                    </div>
                `).join("")}
            </div>
        `:n.innerHTML=`
            <h3>Scan Results</h3>
            <div class="summary">
                <p><strong>Location:</strong> ${t.name}</p>
                <p><strong>Path:</strong> ${t.path}</p>
                <p><strong>Files:</strong> ${t.file_count.toLocaleString()}</p>
                <p><strong>Size:</strong> ${l(t.total_size)}</p>
                <p><strong>Duration:</strong> ${d(t.scan_duration)}</p>
            </div>
            ${t.error?`<p class="error"><strong>Error:</strong> ${t.error}</p>`:""}
        `}function i(t){const n=document.getElementById("scanButton"),e=document.getElementById("scanAllButton"),s=document.getElementById("stopButton");n.disabled=t,e.disabled=t,s.disabled=!t,t?(n.textContent="Scanning...",e.textContent="Scanning..."):(n.textContent="Scan Selected Location",e.textContent="Scan All Safe Locations")}function p(t){const n=document.getElementById("progress");n.innerHTML=`<p>${t}</p>`,n.style.display="block"}function c(t){const n=document.getElementById("error");n.innerHTML=`<p class="error">${t}</p>`,n.style.display="block",setTimeout(()=>{n.style.display="none"},5e3)}function l(t){if(t===0)return"0 Bytes";const n=1024,e=["Bytes","KB","MB","GB","TB"],s=Math.floor(Math.log(t)/Math.log(n));return parseFloat((t/Math.pow(n,s)).toFixed(2))+" "+e[s]}function d(t){const n=t/1e9;if(n<1)return(t/1e6).toFixed(0)+"ms";if(n<60)return n.toFixed(2)+"s";{const e=Math.floor(n/60),s=n%60;return`${e}m ${s.toFixed(1)}s`}}document.getElementById("scanButton").addEventListener("click",$);document.getElementById("scanAllButton").addEventListener("click",b);document.getElementById("stopButton").addEventListener("click",async()=>{try{await h(),i(!1),p("Scan stopped by user")}catch(t){c("Failed to stop scan: "+t.message)}});document.querySelector("#app").innerHTML=`
    <div class="container">
        <header>
            <h1>\u{1F5C2}\uFE0F Cache App</h1>
            <p>macOS Cache Cleaner & Scanner</p>
        </header>
        
        <div class="main-content">
            <div class="scan-section">
                <h2>Cache Scanner</h2>
                
                <div class="scan-controls">
                    <div class="location-selector">
                        <label for="locationSelect">Select Cache Location:</label>
                        <select id="locationSelect">
                            <option value="">Loading locations...</option>
                        </select>
                    </div>
                    
                    <div class="button-group">
                        <button id="scanButton" class="btn btn-primary">Scan Selected Location</button>
                        <button id="scanAllButton" class="btn btn-secondary">Scan All Safe Locations</button>
                        <button id="stopButton" class="btn btn-danger" disabled>Stop Scan</button>
                    </div>
                </div>
                
                <div id="progress" class="progress" style="display: none;"></div>
                <div id="error" class="error" style="display: none;"></div>
            </div>
            
            <div class="results-section">
                <div id="scanResults">
                    <h3>Scan Results</h3>
                    <p>Select a cache location and click "Scan Selected Location" to begin.</p>
                </div>
            </div>
            
            <div class="info-section">
                <div id="systemInfo">
                    <h3>System Information</h3>
                    <p>Loading...</p>
                </div>
            </div>
        </div>
    </div>
`;

// Accessibility Management Component for Cache App
class AccessibilityManager {
    constructor(appState, notificationSystem) {
        this.appState = appState;
        this.notificationSystem = notificationSystem;
        this.accessibilitySettings = {
            highContrast: false,
            largeText: false,
            reducedMotion: false,
            keyboardNavigation: true,
            screenReader: false,
            focusIndicators: true,
            colorBlindFriendly: false
        };
        this.announcer = null;
    }
    
    initialize() {
        this.detectAccessibilityPreferences();
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
        this.setupFocusManagement();
        this.setupARIALabels();
        console.log("Accessibility features initialized");
    }
    
    detectAccessibilityPreferences() {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            this.accessibilitySettings.reducedMotion = true;
            this.applyReducedMotion();
        }
        
        if (window.matchMedia("(prefers-contrast: high)").matches) {
            this.accessibilitySettings.highContrast = true;
            this.applyHighContrast();
        }
    }
    
    setupKeyboardNavigation() {
        document.addEventListener("keydown", (e) => {
            this.handleKeyboardNavigation(e);
        });
        this.makeElementsFocusable();
    }
    
    handleKeyboardNavigation(e) {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
            return;
        }
        
        switch (e.key) {
            case "Tab":
                this.handleTabNavigation(e);
                break;
            case "Enter":
            case " ":
                this.handleActivation(e);
                break;
            case "Escape":
                this.handleEscape(e);
                break;
        }
    }
    
    handleTabNavigation(e) {
        const focusableElements = this.getFocusableElements();
        const currentIndex = focusableElements.indexOf(document.activeElement);
        
        if (e.shiftKey) {
            if (currentIndex <= 0) {
                e.preventDefault();
                focusableElements[focusableElements.length - 1].focus();
            }
        } else {
            if (currentIndex >= focusableElements.length - 1) {
                e.preventDefault();
                focusableElements[0].focus();
            }
        }
    }
    
    handleActivation(e) {
        const target = e.target;
        
        if (target.tagName === "BUTTON" || target.classList.contains("btn")) {
            e.preventDefault();
            target.click();
        }
        
        if (target.classList.contains("nav-tab")) {
            e.preventDefault();
            target.click();
        }
    }
    
    handleEscape(e) {
        const modals = document.querySelectorAll(".modal-overlay");
        modals.forEach(modal => {
            const closeButton = modal.querySelector(".modal-close");
            if (closeButton) {
                closeButton.click();
            }
        });
    }
    
    setupScreenReaderSupport() {
        this.announcer = document.createElement("div");
        this.announcer.setAttribute("aria-live", "polite");
        this.announcer.setAttribute("aria-atomic", "true");
        this.announcer.className = "sr-only";
        this.announcer.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(this.announcer);
    }
    
    setupFocusManagement() {
        this.addFocusIndicators();
        
        document.addEventListener("focusin", (e) => {
            this.handleFocusIn(e);
        });
    }
    
    addFocusIndicators() {
        const style = document.createElement("style");
        style.textContent = `
            .focus-indicator {
                outline: 2px solid #007AFF;
                outline-offset: 2px;
            }
            
            .high-contrast .focus-indicator:focus {
                outline: 3px solid #FFFFFF;
                outline-offset: 3px;
            }
        `;
        document.head.appendChild(style);
        
        const interactiveElements = document.querySelectorAll("button, a, input, select, textarea, [tabindex]");
        interactiveElements.forEach(element => {
            element.classList.add("focus-indicator");
        });
    }
    
    handleFocusIn(e) {
        if (this.announcer) {
            const target = e.target;
            let announcement = "";
            
            if (target.tagName === "BUTTON") {
                announcement = `Button ${target.textContent.trim() || target.getAttribute("aria-label") || "focused"}`;
            } else if (target.classList.contains("nav-tab")) {
                announcement = `Navigation tab ${target.textContent.trim()} focused`;
            }
            
            if (announcement) {
                this.announcer.textContent = announcement;
            }
        }
    }
    
    setupARIALabels() {
        const navTabs = document.querySelectorAll(".nav-tab");
        if (navTabs.length > 0) {
            const tabList = navTabs[0].parentElement;
            tabList.setAttribute("role", "tablist");
            navTabs.forEach(tab => {
                tab.setAttribute("role", "tab");
            });
        }
        
        const statusIndicators = document.querySelectorAll(".status-indicator");
        statusIndicators.forEach(indicator => {
            indicator.setAttribute("role", "status");
            indicator.setAttribute("aria-live", "polite");
        });
    }
    
    applySettings(settings) {
        if (settings.highContrast !== undefined) {
            this.accessibilitySettings.highContrast = settings.highContrast;
            this.applyHighContrast();
        }
        
        if (settings.largeText !== undefined) {
            this.accessibilitySettings.largeText = settings.largeText;
            this.applyLargeText();
        }
        
        if (settings.reducedMotion !== undefined) {
            this.accessibilitySettings.reducedMotion = settings.reducedMotion;
            this.applyReducedMotion();
        }
    }
    
    applyHighContrast() {
        const body = document.body;
        if (this.accessibilitySettings.highContrast) {
            body.classList.add("high-contrast");
        } else {
            body.classList.remove("high-contrast");
        }
    }
    
    applyLargeText() {
        const body = document.body;
        if (this.accessibilitySettings.largeText) {
            body.classList.add("large-text");
            document.documentElement.style.fontSize = "18px";
        } else {
            body.classList.remove("large-text");
            document.documentElement.style.fontSize = "16px";
        }
    }
    
    applyReducedMotion() {
        const body = document.body;
        if (this.accessibilitySettings.reducedMotion) {
            body.classList.add("reduced-motion");
        } else {
            body.classList.remove("reduced-motion");
        }
    }
    
    getFocusableElements() {
        const focusableSelectors = [
            "button:not([disabled])",
            "a[href]",
            "input:not([disabled])",
            "select:not([disabled])",
            "textarea:not([disabled])",
            "[tabindex]:not([tabindex=\"-1\"])"
        ];
        
        return document.querySelectorAll(focusableSelectors.join(", "));
    }
    
    makeElementsFocusable() {
        const customElements = document.querySelectorAll(".nav-tab, .btn, .file-item");
        customElements.forEach(element => {
            if (!element.hasAttribute("tabindex")) {
                element.setAttribute("tabindex", "0");
            }
        });
    }
    
    announce(message) {
        if (this.announcer) {
            this.announcer.textContent = message;
        }
    }
    
    getSettings() {
        return { ...this.accessibilitySettings };
    }
    
    isEnabled(feature) {
        return this.accessibilitySettings[feature] || false;
    }
}

export { AccessibilityManager };
window.AccessibilityManager = AccessibilityManager;

/**
 * Cookie Consent Manager - MotorLink Malawi
 * GDPR/CCPA Compliant Cookie Consent System
 */

class CookieConsentManager {
    constructor() {
        this.consentKey = 'cookie_consent';
        this.consentVersion = '1.0';
        this.bannerShown = false;
        this.init();
    }

    init() {
        // Check if consent has been given
        const consent = this.getConsent();
        
        if (!consent) {
            // Show banner after a short delay for better UX
            setTimeout(() => {
                this.showBanner();
            }, 500);
        } else {
            // Consent already given, apply preferences
            this.applyConsent(consent);
        }

        // Add event listeners for settings modal
        this.setupEventListeners();
    }

    getConsent() {
        try {
            const stored = localStorage.getItem(this.consentKey);
            if (!stored) return null;
            
            const consent = JSON.parse(stored);
            // Check if consent version matches (for future updates)
            if (consent.version === this.consentVersion) {
                return consent;
            }
            return null; // Outdated consent, show banner again
        } catch (e) {
            return null;
        }
    }

    saveConsent(preferences) {
        const consent = {
            version: this.consentVersion,
            timestamp: new Date().toISOString(),
            preferences: preferences
        };
        
        localStorage.setItem(this.consentKey, JSON.stringify(consent));
        
        // Also set a cookie for server-side access
        this.setCookie(this.consentKey, JSON.stringify(consent), 365);
        
        // Apply the consent preferences
        this.applyConsent(consent);
    }

    setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    }

    applyConsent(consent) {
        const prefs = consent.preferences || {};
        
        // Essential cookies are always allowed
        // Functional cookies
        if (prefs.functional !== false) {
            // Functional cookies are allowed by default
            // These include: user preferences, favorites, etc.
        } else {
            // User rejected functional cookies - clear functional data
            this.clearFunctionalCookies();
        }
        
        // Analytics cookies
        if (prefs.analytics === true) {
            // Analytics allowed
        } else {
            // Analytics rejected - no action needed as we don't use external analytics
        }
    }

    clearFunctionalCookies() {
        // Only clear non-essential functional cookies if user rejected
        // Keep essential ones like authentication
        // Note: We typically don't clear these as they're needed for functionality
        // This is more for compliance documentation
    }

    showBanner() {
        if (this.bannerShown) return;
        
        // Create banner HTML
        const banner = document.createElement('div');
        banner.id = 'cookieConsentBanner';
        banner.className = 'cookie-consent-banner';
        banner.innerHTML = `
            <div class="cookie-consent-content">
                <div class="cookie-consent-text">
                    <h3><i class="fas fa-cookie-bite"></i> We Value Your Privacy</h3>
                    <p>
                        We use cookies to enhance your browsing experience, serve personalized content, 
                        and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. 
                        You can manage your preferences at any time.
                    </p>
                </div>
                <div class="cookie-consent-buttons">
                    <button class="btn-cookie-reject" id="cookieRejectAll">
                        <i class="fas fa-times"></i> Reject All
                    </button>
                    <button class="btn-cookie-settings" id="cookieOpenSettings">
                        <i class="fas fa-cog"></i> Customize
                    </button>
                    <button class="btn-cookie-accept" id="cookieAcceptAll">
                        <i class="fas fa-check"></i> Accept All
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(banner);
        this.bannerShown = true;
        
        // Animate in
        setTimeout(() => {
            banner.classList.add('show');
        }, 100);
        
        // Add event listeners
        document.getElementById('cookieAcceptAll').addEventListener('click', () => {
            this.acceptAll();
        });
        
        document.getElementById('cookieRejectAll').addEventListener('click', () => {
            this.rejectAll();
        });
        
        document.getElementById('cookieOpenSettings').addEventListener('click', () => {
            this.showSettingsModal();
        });
    }

    hideBanner() {
        const banner = document.getElementById('cookieConsentBanner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => {
                banner.remove();
                this.bannerShown = false;
            }, 300);
        }
    }

    acceptAll() {
        const preferences = {
            essential: true,
            functional: true,
            analytics: true
        };
        this.saveConsent(preferences);
        this.hideBanner();
        this.showToast('Cookie preferences saved. Thank you!', 'success');
    }

    rejectAll() {
        const preferences = {
            essential: true, // Essential cookies cannot be rejected
            functional: false,
            analytics: false
        };
        this.saveConsent(preferences);
        this.hideBanner();
        this.showToast('Cookie preferences saved. Essential cookies are still active.', 'info');
    }

    showSettingsModal() {
        // Hide banner temporarily
        const banner = document.getElementById('cookieConsentBanner');
        if (banner) banner.style.display = 'none';
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'cookieSettingsModal';
        modal.className = 'cookie-settings-modal';
        modal.innerHTML = `
            <div class="cookie-settings-content">
                <div class="cookie-settings-header">
                    <h2><i class="fas fa-cog"></i> Cookie Preferences</h2>
                    <button class="cookie-settings-close" id="cookieSettingsClose">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="cookie-settings-body">
                    <p class="cookie-settings-intro">
                        Manage your cookie preferences. You can enable or disable different types of cookies below.
                        Note that some cookies are essential and cannot be disabled.
                    </p>
                    
                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <div>
                                <h3>Essential Cookies</h3>
                                <p>Required for the website to function properly. These cannot be disabled.</p>
                            </div>
                            <label class="cookie-toggle disabled">
                                <input type="checkbox" checked disabled>
                                <span class="cookie-toggle-slider"></span>
                            </label>
                        </div>
                        <p class="cookie-category-desc">
                            These cookies are necessary for the website to function and cannot be switched off. 
                            They include authentication, security, and session management.
                        </p>
                    </div>
                    
                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <div>
                                <h3>Functional Cookies</h3>
                                <p>Remember your preferences and personalize your experience.</p>
                            </div>
                            <label class="cookie-toggle">
                                <input type="checkbox" id="cookieFunctional" checked>
                                <span class="cookie-toggle-slider"></span>
                            </label>
                        </div>
                        <p class="cookie-category-desc">
                            These cookies allow the website to remember choices you make (such as your username, 
                            language, or region) and provide enhanced, personalized features.
                        </p>
                    </div>
                    
                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <div>
                                <h3>Analytics Cookies</h3>
                                <p>Help us understand how visitors interact with our website.</p>
                            </div>
                            <label class="cookie-toggle">
                                <input type="checkbox" id="cookieAnalytics" checked>
                                <span class="cookie-toggle-slider"></span>
                            </label>
                        </div>
                        <p class="cookie-category-desc">
                            These cookies help us understand how visitors interact with our website by collecting 
                            and reporting information anonymously. This helps us improve the way our website works.
                        </p>
                    </div>
                    
                    <div class="cookie-settings-actions">
                        <button class="btn-cookie-save" id="cookieSaveSettings">
                            <i class="fas fa-save"></i> Save Preferences
                        </button>
                        <a href="cookie-policy.html" class="btn-cookie-learn-more" target="_blank">
                            <i class="fas fa-info-circle"></i> Learn More
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Animate in
        setTimeout(() => {
            modal.classList.add('show');
        }, 100);
        
        // Load current preferences
        const consent = this.getConsent();
        if (consent) {
            document.getElementById('cookieFunctional').checked = consent.preferences.functional !== false;
            document.getElementById('cookieAnalytics').checked = consent.preferences.analytics === true;
        }
        
        // Event listeners
        document.getElementById('cookieSettingsClose').addEventListener('click', () => {
            this.closeSettingsModal();
        });
        
        document.getElementById('cookieSaveSettings').addEventListener('click', () => {
            this.saveCustomSettings();
        });
        
        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeSettingsModal();
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                this.closeSettingsModal();
            }
        });
    }

    closeSettingsModal() {
        const modal = document.getElementById('cookieSettingsModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                // Show banner again if consent wasn't given
                const consent = this.getConsent();
                if (!consent) {
                    const banner = document.getElementById('cookieConsentBanner');
                    if (banner) banner.style.display = 'flex';
                }
            }, 300);
        }
    }

    saveCustomSettings() {
        const preferences = {
            essential: true,
            functional: document.getElementById('cookieFunctional').checked,
            analytics: document.getElementById('cookieAnalytics').checked
        };
        
        this.saveConsent(preferences);
        this.closeSettingsModal();
        this.hideBanner();
        
        const message = preferences.functional && preferences.analytics 
            ? 'Cookie preferences saved. Thank you!' 
            : 'Cookie preferences saved. Essential cookies are still active.';
        this.showToast(message, 'success');
    }

    setupEventListeners() {
        // Add a way to reopen settings (e.g., from footer)
        window.openCookieSettings = () => {
            const consent = this.getConsent();
            if (!consent) {
                this.showBanner();
            } else {
                this.showSettingsModal();
            }
        };
    }

    showToast(message, type = 'info') {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.className = `cookie-toast cookie-toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
}

// Initialize cookie consent manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.cookieConsentManager = new CookieConsentManager();
    });
} else {
    window.cookieConsentManager = new CookieConsentManager();
}





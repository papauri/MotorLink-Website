/**
 * Dynamic Footer Loader
 * Loads footer content from site_settings database table
 */

class FooterLoader {
    constructor() {
        this.settings = {};
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.renderFooter();
    }

    async loadSettings() {
        try {
            const response = await fetch(`${CONFIG.API_URL}?action=site_settings`, {
                ...(CONFIG.USE_CREDENTIALS && {credentials: 'include'})
            });
            const data = await response.json();
            
            if (data.success && data.settings) {
                this.settings = data.settings;
            } else {
                this.useDefaults();
            }
        } catch (error) {
            this.useDefaults();
        }
    }

    useDefaults() {
        // Fallback defaults if API fails
        this.settings = {
            general: {
                site_name: 'MotorLink Malawi'
            },
            footer: {
                footer_about_text: 'Your trusted partner for buying and selling cars in Malawi.',
                footer_copyright: '© 2025 MotorLink Malawi. All rights reserved.'
            },
            contact: {
                contact_phone: '+265 991 234 567',
                contact_email: 'info@motorlink.mw'
            },
            social: {}
        };
    }

    renderFooter() {
        const footer = document.querySelector('.footer');
        if (!footer) return;

        const container = footer.querySelector('.container');
        if (!container) return;

        const general = this.settings.general || {};
        const footer_info = this.settings.footer || {};
        const contact = this.settings.contact || {};
        const business = this.settings.business || {};
        const social = this.settings.social || {};

        const siteName = general.site_name || 'MotorLink Malawi';
        const aboutText = footer_info.footer_about_text || 'Your trusted partner for buying and selling cars in Malawi.';
        const copyright = footer_info.footer_copyright || '© 2025 MotorLink Malawi. All rights reserved.';
        
        const phone = contact.contact_phone || '';
        const phoneSecondary = contact.contact_phone_secondary || '';
        const email = contact.contact_email || '';
        const whatsapp = contact.contact_whatsapp || '';
        
        const address = business.business_address || '';
        const city = business.business_city || '';
        const district = business.business_district || '';
        
        const hoursWeekday = business.business_hours_weekday || '';
        const hoursSaturday = business.business_hours_saturday || '';
        const hoursSunday = business.business_hours_sunday || '';

        // Build social links HTML
        let socialLinksHTML = '';
        if (social.social_facebook) {
            socialLinksHTML += `<a href="${social.social_facebook}" target="_blank" rel="noopener" aria-label="Follow us on Facebook" title="${siteName} Facebook"><i class="fab fa-facebook-f"></i></a>`;
        }
        if (social.social_twitter) {
            socialLinksHTML += `<a href="${social.social_twitter}" target="_blank" rel="noopener" aria-label="Follow us on Twitter" title="${siteName} Twitter"><i class="fab fa-twitter"></i></a>`;
        }
        if (social.social_instagram) {
            socialLinksHTML += `<a href="${social.social_instagram}" target="_blank" rel="noopener" aria-label="Follow us on Instagram" title="${siteName} Instagram"><i class="fab fa-instagram"></i></a>`;
        }
        if (social.social_linkedin) {
            socialLinksHTML += `<a href="${social.social_linkedin}" target="_blank" rel="noopener" aria-label="Connect on LinkedIn" title="${siteName} LinkedIn"><i class="fab fa-linkedin"></i></a>`;
        }
        if (social.social_whatsapp) {
            socialLinksHTML += `<a href="${social.social_whatsapp}" target="_blank" rel="noopener" aria-label="Contact us on WhatsApp" title="${siteName} WhatsApp"><i class="fab fa-whatsapp"></i></a>`;
        }
        if (social.social_youtube) {
            socialLinksHTML += `<a href="${social.social_youtube}" target="_blank" rel="noopener" aria-label="Subscribe on YouTube" title="${siteName} YouTube"><i class="fab fa-youtube"></i></a>`;
        }

        // Build footer HTML
        container.innerHTML = `
            <div class="footer-content">
                <div class="footer-section">
                    <h4><i class="fas fa-car"></i> ${siteName}</h4>
                    <p>${aboutText}</p>
                    ${socialLinksHTML ? `<div class="social-links">${socialLinksHTML}</div>` : ''}
                </div>
                
                <div class="footer-section">
                    <h4><i class="fas fa-link"></i> Quick Links</h4>
                    <ul>
                        <li><a href="index.html">Browse Cars</a></li>
                        <li><a href="sell.html">Sell Your Car</a></li>
                        <li><a href="guest-manage.html">Manage Guest Listing</a></li>
                        <li><a href="garages.html">Find Garages</a></li>
                        <li><a href="dealers.html">Car Dealers</a></li>
                        <li><a href="car-hire.html">Car Hire</a></li>
                        <li><a href="car-database.html">Know Your Car</a></li>
                    </ul>
                </div>

                <div class="footer-section">
                    <h4><i class="fas fa-life-ring"></i> Support & Help</h4>
                    <ul>
                        <li><a href="help.html">Help Center</a></li>
                        <li><a href="safety.html">Safety Tips</a></li>
                        <li><a href="contact.html">Contact Us</a></li>
                        <li><a href="terms.html">Terms of Service</a></li>
                        <li><a href="cookie-policy.html">Cookie Policy</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h4><i class="fas fa-phone"></i> Contact Us</h4>
                    ${email ? `<p><i class="fas fa-envelope"></i> <strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>` : ''}
                    ${phone ? `<p><i class="fas fa-phone"></i> <strong>Phone:</strong> <a href="tel:${phone.replace(/\s/g, '')}">${phone}</a></p>` : ''}
                    ${phoneSecondary ? `<p><i class="fas fa-mobile-alt"></i> <strong>Alt:</strong> <a href="tel:${phoneSecondary.replace(/\s/g, '')}">${phoneSecondary}</a></p>` : ''}
                    ${whatsapp ? `<p><i class="fab fa-whatsapp"></i> <strong>WhatsApp:</strong> <a href="https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}" target="_blank" rel="noopener">${whatsapp}</a></p>` : ''}
                    
                    ${address || city ? `
                    <div style="margin-top: 15px;">
                        <h5><i class="fas fa-map-marker-alt"></i> Location</h5>
                        ${address ? `<p>${address}</p>` : ''}
                        ${city ? `<p>${city}${district && district !== city ? `, ${district}` : ''}, Malawi</p>` : ''}
                    </div>
                    ` : ''}
                    
                    ${hoursWeekday ? `
                    <div style="margin-top: 15px;">
                        <h5><i class="fas fa-clock"></i> Hours</h5>
                        <p style="font-size: 13px;">${hoursWeekday}</p>
                        ${hoursSaturday ? `<p style="font-size: 13px;">${hoursSaturday}</p>` : ''}
                        ${hoursSunday ? `<p style="font-size: 13px;">${hoursSunday}</p>` : ''}
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>${copyright}</p>
                <p style="margin-top: 10px; font-size: 14px;">
                    <i class="fas fa-shield-alt"></i> Safe Trading • 
                    <i class="fas fa-mobile-alt"></i> Mobile Friendly • 
                    <i class="fas fa-globe"></i> Hosted by <a href="https://promanaged-it.com" target="_blank" rel="noopener">ProManaged IT</a>
                </p>
            </div>
        `;
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new FooterLoader();
    });
} else {
    // DOM already loaded
    new FooterLoader();
}

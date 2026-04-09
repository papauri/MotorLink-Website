// ============================================================================
// MotorLink Malawi - Sell Car Functionality
// ============================================================================
// Multi-step car listing form with image upload and guest submission
// Uses global CONFIG from config.js for API endpoints
// ============================================================================

class SellManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.currentUser = null;
        this.uploadedPhotos = [];
        this.guestMode = false;
        this.featuredPhotoIndex = -1;
        this.editMode = false;
        this.editListingId = null;
        this.existingListing = null;
        this.reviewConfirmCheckbox = null;
        this.submitBtn = null;
        this.boundReviewConfirmHandler = null;
        this.listingRestrictions = {
            allow_guest_listings: true,
            max_guest_listings: 2,
            max_registered_listings: 10,
            require_listing_email_validation: true,
            is_authenticated: false,
            current_registered_count: null,
            remaining_registered_listings: null,
            current_guest_count: null,
            remaining_guest_listings: null
        };
        this.guestLimitCheckTimeout = null;
        this.init();
    }

    init() {
        this.checkEditMode();
        // Mobile menu handled by mobile-menu.js
        // this.setupMobileMenu();
        this.setupEventListeners();
        this.loadListingRestrictions();
        this.checkAuthentication();
    }

    async loadListingRestrictions(guestEmail = '') {
        try {
            const url = new URL(`${CONFIG.API_URL}?action=listing_restrictions`, window.location.origin);
            if (guestEmail) {
                url.searchParams.set('guest_email', guestEmail);
            }

            const response = await fetch(url.toString(), {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success && data.restrictions) {
                this.listingRestrictions = { ...this.listingRestrictions, ...data.restrictions };
                this.applyListingRestrictionsUI();
            }
        } catch (error) {
            // Non-blocking: backend still enforces hard limits.
        }
    }

    applyListingRestrictionsUI() {
        const guestDescription = document.querySelector('.guest-option .guest-description');
        const guestButton = document.querySelector('.guest-option .guest-button');
        const guestNotice = document.querySelector('#guestNotice p');

        const guestLimitText = this.listingRestrictions.max_guest_listings > 0
            ? `Guests can post up to ${this.listingRestrictions.max_guest_listings} listing${this.listingRestrictions.max_guest_listings === 1 ? '' : 's'}.`
            : 'Guest listing limit is currently unlimited.';

        if (guestDescription) {
            guestDescription.textContent = this.listingRestrictions.allow_guest_listings
                ? `${guestLimitText} We will need your contact information and your listing will be reviewed before going live.`
                : 'Guest listings are currently disabled. Please create an account to list your car.';
        }

        if (guestButton) {
            guestButton.disabled = !this.listingRestrictions.allow_guest_listings;
            if (!this.listingRestrictions.allow_guest_listings) {
                guestButton.classList.add('disabled');
                guestButton.title = 'Guest listings are currently disabled';
            } else {
                guestButton.classList.remove('disabled');
                guestButton.removeAttribute('title');
            }
        }

        if (guestNotice) {
            const verificationText = this.listingRestrictions.require_listing_email_validation
                ? ' You will need to verify your email before admin review starts.'
                : '';
            guestNotice.textContent = `Your listing will be reviewed within 2-4 hours before going live. ${guestLimitText}${verificationText}`;
        }

        this.renderListingLimitBanner();
    }

    renderListingLimitBanner() {
        const container = document.querySelector('.form-container');
        if (!container || this.guestMode || !this.currentUser) return;

        let banner = document.getElementById('listingLimitBanner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'listingLimitBanner';
            banner.className = 'guest-notice';
            banner.style.marginBottom = '16px';
            container.insertBefore(banner, container.firstChild);
        }

        const max = this.listingRestrictions.max_registered_listings;
        const current = this.listingRestrictions.current_registered_count;
        const remaining = this.listingRestrictions.remaining_registered_listings;

        let message = 'Listing restrictions could not be loaded.';
        if (typeof max === 'number' && max > 0 && typeof current === 'number' && typeof remaining === 'number') {
            message = `Listing usage: ${current}/${max}. Remaining slots: ${remaining}.`;
        } else if (typeof max === 'number' && max <= 0) {
            message = 'Listing limit is currently unlimited for registered users.';
        }

        banner.innerHTML = `
            <div class="guest-notice-header">
                <i class="fas fa-tachometer-alt"></i>
                <strong>Listing Limit</strong>
            </div>
            <p>${message}</p>
        `;
    }

    // Check if we're in edit mode
    checkEditMode() {
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('edit');
        
        if (editId) {
            this.editMode = true;
            this.editListingId = editId;
        }
    }

    // AUTHENTICATION & UI MANAGEMENT
    async checkAuthentication() {
        try {
            const response = await fetch(`${CONFIG.API_URL}?action=check_auth`, {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success && data.authenticated) {
                this.currentUser = data.user;
                this.updateUserMenu();
                this.showSellForm();
                this.loadListingRestrictions();
                this.applyListingRestrictionsUI();
                
                // Load listing data if in edit mode
                if (this.editMode && this.editListingId) {
                    await this.loadListingForEdit();
                }
            } else {
                this.currentUser = null;
                this.updateUserMenu();
                
                // In edit mode, require authentication
                if (this.editMode) {
                    this.showToast('Please login to edit your listing', 'error');
                    window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
                } else {
                    this.showGuestSellOption();
                    this.applyListingRestrictionsUI();
                }
            }
        } catch (error) {
            this.currentUser = null;
            this.updateUserMenu();
            
            if (this.editMode) {
                this.showToast('Please login to edit your listing', 'error');
                window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
            } else {
                this.showGuestSellOption();
                this.applyListingRestrictionsUI();
            }
        }
    }

    updateUserMenu() {
        const userInfo = document.getElementById('userInfo');
        const guestMenu = document.getElementById('guestMenu');
        const userName = document.getElementById('userName');

        if (this.currentUser) {
            if (userInfo) userInfo.style.display = 'flex';
            if (guestMenu) guestMenu.style.display = 'none';
            if (userName) userName.textContent = this.currentUser.name;
            
            // Hide "My Listings" link for dealers (they use the showroom inventory instead)
            const myListingsLink = document.querySelector('a[href="my-listings.html"]');
            if (myListingsLink) {
                if (this.currentUser.type === 'dealer') {
                    myListingsLink.style.display = 'none';
                } else {
                    myListingsLink.style.display = '';
                }
            }
        } else {
            if (userInfo) userInfo.style.display = 'none';
            if (guestMenu) guestMenu.style.display = 'flex';
        }
    }

    showGuestSellOption() {
        const authRequired = document.getElementById('authRequired');
        const sellForm = document.getElementById('sellForm');
        const guestOption = document.querySelector('.guest-option');
        const authDescription = document.querySelector('.auth-card > p');
        
        if (authRequired) authRequired.classList.remove('hidden');
        if (sellForm) sellForm.classList.add('hidden');
        if (guestOption) guestOption.style.display = 'none';
        if (authDescription) {
            authDescription.textContent = 'You must be logged in to create and save listings. Please login or create an account to continue.';
        }
    }

    enableGuestSelling() {
        this.showToast('Please login to save listings.', 'error');
        setTimeout(() => {
            window.location.href = 'login.html?redirect=sell.html';
        }, 400);
    }

    /**
     * Show friendly reminder about guest posting limits
     */
    showGuestLimitReminder() {
        const guestLimitText = this.listingRestrictions.max_guest_listings > 0
            ? `Guests can post up to ${this.listingRestrictions.max_guest_listings} listing${this.listingRestrictions.max_guest_listings === 1 ? '' : 's'}.`
            : 'Guests can post unlimited listings.';

        const registeredLimitText = this.listingRestrictions.max_registered_listings > 0
            ? `${this.listingRestrictions.max_registered_listings} listing slots`
            : 'unlimited listing slots';

        const reminderHtml = `
            <div class="guest-limit-reminder">
                <div class="guest-limit-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="guest-limit-content">
                    <strong>Posting as Guest</strong>
                    <p>${guestLimitText} Want to list more? 
                    <a href="register.html">Create a free account</a> for ${registeredLimitText}, message tracking, and verified badges!</p>
                </div>
                <button class="reminder-dismiss" onclick="this.parentElement.remove()" aria-label="Dismiss">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Insert reminder after guest notice
        const guestNotice = document.getElementById('guestNotice');
        if (guestNotice) {
            const reminder = document.createElement('div');
            reminder.innerHTML = reminderHtml;
            guestNotice.insertAdjacentElement('afterend', reminder.firstElementChild);
        }
    }

    showSellForm() {
        const authRequired = document.getElementById('authRequired');
        const sellForm = document.getElementById('sellForm');

        if (authRequired) authRequired.classList.add('hidden');
        if (sellForm) sellForm.classList.remove('hidden');

        this.initializeSellForm();
    }

    // Load listing data for editing
    async loadListingForEdit() {
        try {
            
            const response = await fetch(`${CONFIG.API_URL}?action=get_listing&id=${this.editListingId}`, {
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to load listing');
            }
            
            this.existingListing = data.listing;
            
            // Update page title
            const heroTitle = document.querySelector('.hero-content h1');
            if (heroTitle) {
                heroTitle.textContent = 'Edit Your Listing';
            }
            
            // Update subtitle
            const heroSubtitle = document.querySelector('.hero-subtitle');
            if (heroSubtitle) {
                heroSubtitle.textContent = 'Update your car listing details and photos';
            }
            
            // Wait for form to be initialized, then populate
            await this.waitForFormReady();
            this.populateFormWithListing(this.existingListing);
            
        } catch (error) {
            this.showToast('Failed to load listing: ' + error.message, 'error');
            setTimeout(() => {
                window.location.href = 'my-listings.html';
            }, 2000);
        }
    }

    // Wait for form elements to be ready
    waitForFormReady() {
        return new Promise((resolve) => {
            const checkReady = () => {
                const makeSelect = document.getElementById('makeSelect');
                const locationSelect = document.getElementById('locationSelect');
                
                if (makeSelect && makeSelect.options.length > 1 && 
                    locationSelect && locationSelect.options.length > 1) {
                    resolve();
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            checkReady();
        });
    }

    // Populate form with existing listing data
    populateFormWithListing(listing) {
        
        // Populate basic fields
        const fieldsToPopulate = {
            'make_id': listing.make_id,
            'model_id': listing.model_id,
            'title': listing.title,
            'year': listing.year,
            'price': listing.price,
            'negotiable': listing.negotiable,
            'mileage': listing.mileage,
            'location_id': listing.location_id,
            'fuel_type': listing.fuel_type,
            'transmission': listing.transmission,
            'condition_type': listing.condition_type,
            'exterior_color': listing.exterior_color,
            'description': listing.description,
            'listing_type': listing.listing_type || 'free'
        };
        
        // Populate text inputs, selects, and textareas
        for (const [fieldName, value] of Object.entries(fieldsToPopulate)) {
            const element = document.querySelector(`[name="${fieldName}"]`);
            if (element && value != null) {
                if (element.type === 'checkbox') {
                    element.checked = value == 1 || value === true;
                } else {
                    element.value = value;
                }
            }
        }
        
        // Load models for the selected make
        if (listing.make_id) {
            this.loadModels().then(async () => {
                const modelSelect = document.getElementById('modelSelect');
                if (modelSelect && listing.model_id) {
                    modelSelect.value = listing.model_id;
                    // Load variations for the selected model
                    if (window.modelVariationsHelper) {
                        await window.modelVariationsHelper.loadModelVariations(listing.model_id, {
                            engineSizeSelect: 'engineSizeSelect',
                            fuelTankSelect: 'fuelTankCapacitySelect',
                            drivetrainSelect: 'drivetrainSelect',
                            transmissionSelect: 'transmission'
                        });
                    }
                }
            });
        }
        
        // Set listing type
        if (listing.listing_type) {
            this.selectListingType(listing.listing_type);
        }
        
        // Load existing images
        if (listing.images && listing.images.length > 0) {
            this.loadExistingImages(listing.images);
        }
        
        this.showToast('Listing loaded successfully - Ready to edit!', 'success');
    }

    // Load existing images into the photo grid
    async loadExistingImages(images) {
        
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            
            try {
                // Create image URL
                const imageUrl = `${CONFIG.API_URL}?action=image&id=${image.id}`;
                
                // Create a photo object similar to uploaded photos
                const photoData = {
                    existingImageId: image.id,
                    dataUrl: imageUrl,
                    originalName: image.filename,
                    size: 0,
                    isFeatured: image.is_primary == 1 || i === 0,
                    isExisting: true
                };
                
                this.uploadedPhotos.push(photoData);
                
                if (image.is_primary == 1 || i === 0) {
                    this.featuredPhotoIndex = i;
                }
            } catch (error) {
            }
        }
        
        // Render the photo grid
        this.renderPhotoGrid();
        this.updatePhotoCounter();
        this.updatePhotoStatus();
        
    }

    // FORM INITIALIZATION
    initializeSellForm() {
        this.loadFormData();
        this.setupPhotoUpload();
        this.setupFormValidation();
        this.setupInstantValidation();
        this.updateProgress();
        this.populateYearDropdown();
        this.initializeSteps();
    }

    // Setup instant validation for form fields
    setupInstantValidation() {
        // Description validation with debouncing
        const descriptionInput = document.querySelector('[name="description"]');
        if (descriptionInput) {
            let validationTimeout;
            descriptionInput.addEventListener('input', (e) => {
                clearTimeout(validationTimeout);
                const value = e.target.value.trim();
                
                // Only validate if there's content
                if (value.length > 0) {
                    validationTimeout = setTimeout(() => {
                        const validation = this.validateDescription(value);
                        if (!validation.valid) {
                            // Show inline error
                            this.showFieldError(descriptionInput, validation.message);
                        } else {
                            // Clear error
                            this.clearFieldError(descriptionInput);
                        }
                    }, 500); // Debounce 500ms
                } else {
                    this.clearFieldError(descriptionInput);
                }
            });
        }

        // Price validation
        const priceInput = document.getElementById('priceInput');
        if (priceInput) {
            priceInput.addEventListener('input', (e) => {
                const price = parseInt(e.target.value);
                if (!isNaN(price) && price > 0 && price < 100000) {
                    this.showFieldError(priceInput, 'Price must be at least MWK 100,000');
                } else {
                    this.clearFieldError(priceInput);
                }
            });
            
            priceInput.addEventListener('blur', () => {
                const price = parseInt(priceInput.value);
                if (!isNaN(price) && price < 100000) {
                    this.showToast('Price must be at least MWK 100,000', 'error');
                    priceInput.focus();
                }
            });
        }

        // Title validation
        const titleInput = document.getElementById('titleInput');
        if (titleInput) {
            titleInput.addEventListener('input', (e) => {
                const value = e.target.value.trim();
                if (value.length > 0 && value.length < 10) {
                    this.showFieldError(titleInput, 'Title must be at least 10 characters');
                } else if (value.length > 100) {
                    this.showFieldError(titleInput, 'Title must be 100 characters or less');
                } else {
                    this.clearFieldError(titleInput);
                }
            });
        }

        // Email validation (for guest mode)
        const emailInput = document.querySelector('[name="seller_email"]');
        if (emailInput) {
            emailInput.addEventListener('input', (e) => {
                const value = e.target.value.trim();
                if (value.length > 0) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        this.showFieldError(emailInput, 'Please enter a valid email address');
                    } else {
                        this.clearFieldError(emailInput);
                        clearTimeout(this.guestLimitCheckTimeout);
                        this.guestLimitCheckTimeout = setTimeout(async () => {
                            await this.loadListingRestrictions(value);
                            const remaining = this.listingRestrictions.remaining_guest_listings;
                            if (typeof remaining === 'number' && remaining <= 0) {
                                this.showFieldError(emailInput, 'Guest listing limit reached for this email. Please register to continue.');
                            }
                        }, 350);
                    }
                } else {
                    this.clearFieldError(emailInput);
                }
            });
        }

        // Phone validation (for guest mode)
        const phoneInput = document.querySelector('[name="seller_phone"]');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                const value = e.target.value ? e.target.value.trim() : '';
                if (value.length > 0) {
                    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
                    if (!phoneRegex.test(value)) {
                        this.showFieldError(phoneInput, 'Please enter a valid phone number');
                    } else {
                        this.clearFieldError(phoneInput);
                    }
                } else {
                    this.clearFieldError(phoneInput);
                }
            });
        }

        // Color validation
        const colorInput = document.querySelector('[name="exterior_color"]');
        if (colorInput) {
            colorInput.addEventListener('input', (e) => {
                const value = e.target.value ? e.target.value.trim() : '';
                if (value.length > 0) {
                    // Color should be 2-20 characters, alphanumeric with spaces and hyphens
                    const colorRegex = /^[a-zA-Z0-9\s\-]{2,20}$/;
                    if (!colorRegex.test(value)) {
                        this.showFieldError(colorInput, 'Color must be 2-20 characters and contain only letters, numbers, spaces, and hyphens');
                    } else {
                        this.clearFieldError(colorInput);
                    }
                } else {
                    this.clearFieldError(colorInput);
                }
            });
        }
    }

    // Show field error message
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.classList.add('field-error');
        
        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = 'color: #dc3545; font-size: 12px; margin-top: 4px; display: flex; align-items: center; gap: 4px;';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle" style="font-size: 11px;"></i> ${message}`;
        
        // Insert after the field
        field.parentNode.insertBefore(errorDiv, field.nextSibling);
    }

    // Clear field error message
    clearFieldError(field) {
        field.classList.remove('field-error');
        const errorMsg = field.parentNode.querySelector('.field-error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
    }

    async loadFormData() {
        try {
            // Load makes
            const makesResponse = await fetch(`${CONFIG.API_URL}?action=makes`, {
                credentials: 'include'
            });
            const makesData = await makesResponse.json();

            if (makesData.success) {
                const makeSelect = document.getElementById('makeSelect');
                if (makeSelect) {
                    // Clear existing options except first one
                    while (makeSelect.options.length > 1) {
                        makeSelect.removeChild(makeSelect.lastChild);
                    }
                    
                    makesData.makes.forEach(make => {
                        const option = document.createElement('option');
                        option.value = make.id;
                        option.textContent = make.name;
                        makeSelect.appendChild(option);
                    });
                }
            }

            // Load locations
            const locationsResponse = await fetch(`${CONFIG.API_URL}?action=locations`, {
                credentials: 'include'
            });
            const locationsData = await locationsResponse.json();

            if (locationsData.success) {
                const locationSelect = document.getElementById('locationSelect');
                if (locationSelect) {
                    // Clear existing options except first one
                    while (locationSelect.options.length > 1) {
                        locationSelect.removeChild(locationSelect.lastChild);
                    }
                    
                    locationsData.locations.forEach(location => {
                        const option = document.createElement('option');
                        option.value = location.id;
                        option.textContent = `${location.name}, ${location.region}`;
                        locationSelect.appendChild(option);
                    });
                }
            }

            // Setup make-model dependency
            const makeSelect = document.getElementById('makeSelect');
            if (makeSelect) {
                makeSelect.addEventListener('change', () => {
                    this.loadModels();
                    this.updateTitle();
                });
            }

            // Setup auto-populate title listeners
            const yearSelect = document.getElementById('yearSelect');
            const modelSelect = document.getElementById('modelSelect');
            const conditionSelect = document.getElementById('conditionSelect');
            const transmissionSelect = document.querySelector('select[name="transmission"]');
            const fuelTypeSelect = document.querySelector('select[name="fuel_type"]');

            if (yearSelect) yearSelect.addEventListener('change', () => this.updateTitle());
            if (modelSelect) modelSelect.addEventListener('change', () => this.updateTitle());
            if (conditionSelect) conditionSelect.addEventListener('change', () => this.updateTitle());
            if (transmissionSelect) transmissionSelect.addEventListener('change', () => this.updateTitle());
            if (fuelTypeSelect) fuelTypeSelect.addEventListener('change', () => this.updateTitle());
        } catch (error) {
            this.showToast('Error loading form data', 'error');
        }
    }

    async loadModels() {
        const makeId = document.getElementById('makeSelect')?.value;
        const modelSelect = document.getElementById('modelSelect');

        if (!makeId || !modelSelect) {
            return;
        }

        modelSelect.innerHTML = '<option value="">Loading models...</option>';
        modelSelect.disabled = true;

        try {
            const response = await fetch(`${CONFIG.API_URL}?action=models&make_id=${makeId}`, {
                credentials: 'include'
            });
            const data = await response.json();

            modelSelect.innerHTML = '<option value="">Select Model</option>';

            if (data.success && data.models) {
                // Group models by name to avoid duplicates (since we now have multiple rows per model)
                const uniqueModels = new Map();
                data.models.forEach(model => {
                    if (!uniqueModels.has(model.name)) {
                        uniqueModels.set(model.name, model);
                    }
                });
                
                // Add unique models to dropdown
                Array.from(uniqueModels.values()).forEach(model => {
                    const option = document.createElement('option');
                    option.value = model.id; // Use first model ID for this name
                    option.textContent = model.name;
                    if (model.body_type) {
                        option.textContent += ` (${model.body_type})`;
                    }
                    modelSelect.appendChild(option);
                });
            }
        } catch (error) {
            modelSelect.innerHTML = '<option value="">Error loading models</option>';
        } finally {
            modelSelect.disabled = false;
            
            // Setup model change listener to load variations (only if not already set)
            if (!modelSelect.dataset.variationListenerAdded) {
                modelSelect.dataset.variationListenerAdded = 'true';
                modelSelect.addEventListener('change', async (e) => {
                    const modelId = e.target.value;
                    console.log('Sell form - Model changed to ID:', modelId);
                    
                    if (modelId && window.modelVariationsHelper) {
                        await window.modelVariationsHelper.loadModelVariations(modelId, {
                            engineSizeSelect: 'engineSizeSelect',
                            fuelTankSelect: 'fuelTankCapacitySelect',
                            drivetrainSelect: 'drivetrainSelect',
                            transmissionSelect: 'transmission'
                        });
                    } else if (!modelId && window.modelVariationsHelper) {
                        window.modelVariationsHelper.clearVariationDropdowns({
                            engineSizeSelect: 'engineSizeSelect',
                            fuelTankSelect: 'fuelTankCapacitySelect',
                            drivetrainSelect: 'drivetrainSelect'
                        });
                    }
                    
                    // Update title after model changes
                    this.updateTitle();
                });
            }
            
            // Update title after model loads
            this.updateTitle();
        }
    }

    updateTitle() {
        const titleInput = document.getElementById('titleInput');
        if (!titleInput) return;

        // Get values from form fields
        const year = document.getElementById('yearSelect')?.value;
        const makeSelect = document.getElementById('makeSelect');
        const makeName = makeSelect?.options[makeSelect.selectedIndex]?.text;
        const modelSelect = document.getElementById('modelSelect');
        const modelName = modelSelect?.options[modelSelect.selectedIndex]?.text;
        const conditionSelect = document.getElementById('conditionSelect');
        const conditionValue = conditionSelect?.value;
        const transmissionSelect = document.querySelector('select[name="transmission"]');
        const transmissionValue = transmissionSelect?.value;
        const fuelTypeSelect = document.querySelector('select[name="fuel_type"]');
        const fuelTypeValue = fuelTypeSelect?.value;

        // Build title parts
        const parts = [];
        
        if (year && year !== '') parts.push(year);
        if (makeName && makeName !== 'Select Make') parts.push(makeName);
        if (modelName && modelName !== 'Select Model') parts.push(modelName);
        
        // Add fuel type if selected (before condition)
        if (fuelTypeValue && fuelTypeValue !== '') {
            const fuelTypeMap = {
                'petrol': 'Petrol',
                'diesel': 'Diesel',
                'hybrid': 'Hybrid',
                'electric': 'Electric',
                'lpg': 'LPG',
                'cng': 'CNG'
            };
            const fuelTypeLabel = fuelTypeMap[fuelTypeValue] || fuelTypeValue.charAt(0).toUpperCase() + fuelTypeValue.slice(1);
            parts.push(fuelTypeLabel);
        }
        
        // Add condition if selected
        if (conditionValue && conditionValue !== '') {
            const conditionMap = {
                'excellent': 'Excellent Condition',
                'very_good': 'Very Good Condition',
                'good': 'Good Condition',
                'fair': 'Fair Condition',
                'poor': 'As-Is'
            };
            parts.push('-');
            parts.push(conditionMap[conditionValue] || conditionValue);
        }
        
        // Add transmission if selected
        if (transmissionValue && transmissionValue !== '') {
            const transmissionText = transmissionValue.charAt(0).toUpperCase() + transmissionValue.slice(1);
            if (!parts.includes('-')) parts.push('-');
            parts.push(transmissionText);
        }

        // Only update if we have at least year and make
        if (parts.length >= 2) {
            const title = parts.join(' ').substring(0, 100); // Limit to 100 chars
            titleInput.value = title;
        }
    }

    populateYearDropdown() {
        const yearSelect = document.getElementById('yearSelect');
        if (!yearSelect) return;

        // Clear existing options except first one
        while (yearSelect.options.length > 1) {
            yearSelect.removeChild(yearSelect.lastChild);
        }

        const currentYear = new Date().getFullYear();

        for (let year = currentYear; year >= 1990; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
    }

// PHOTO UPLOAD - COMPLETELY FIXED MULTIPLE SELECTION
setupPhotoUpload() {
    const input = document.getElementById('photoInput');
    const uploadArea = document.getElementById('photoUploadArea');
    const uploadButton = document.getElementById('photoUploadButton');
    
    if (!input || !uploadArea || !uploadButton) {
        return;
    }

    // Prevent multiple setups - but allow re-setup if elements were replaced
    // Check if button still has event listener
    if (this.photoUploadSetup && uploadButton && uploadButton.hasAttribute('data-listener-attached')) {
        return;
    }
    this.photoUploadSetup = true;

    // Flag to prevent multiple simultaneous file dialog opens
    let isFileDialogOpen = false;

    // FIXED: Remove any existing event listeners and setup fresh
    if (this.handlePhotoSelectionBound) {
        input.removeEventListener('change', this.handlePhotoSelectionBound);
    }
    
    // Create bound method for event handling
    this.handlePhotoSelectionBound = this.handlePhotoSelection.bind(this);
    
    // File selection handler - FIXED: Proper event listener
    input.addEventListener('change', this.handlePhotoSelectionBound);

    // Handle file input change - reset flag when dialog closes
    // Use a separate handler to avoid conflicts
    input.addEventListener('change', () => {
        isFileDialogOpen = false;
    }, { once: false });

    // FIXED: Use button click to trigger file input - direct user interaction only
    // Must be called synchronously within user event handler (no setTimeout)
    // Mark button to prevent duplicate listeners
    if (!uploadButton.hasAttribute('data-listener-attached')) {
        uploadButton.setAttribute('data-listener-attached', 'true');
        uploadButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Only open if not already open
            if (isFileDialogOpen) {
                return;
            }
            
            // Clear input value first to ensure change event fires on next selection
            if (input) {
                input.value = '';
                isFileDialogOpen = true;
                // Trigger immediately on user click - MUST be synchronous for user activation
                try {
                    input.click();
                } catch (error) {
                    isFileDialogOpen = false;
                    // Silently handle - don't spam console
                }
            }
        });
    }
    
    // Remove upload area click handler - only use button for file selection
    // Keep upload area only for drag/drop functionality
    // The upload area should NOT trigger file input click to avoid user activation issues
    
    // Drag and drop handlers
    uploadArea.addEventListener('dragover', e => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', e => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files);
        this.handlePhotoSelection({ target: { files } });
    });

    // FIXED: Ensure multiple attribute is properly set
    input.setAttribute('multiple', 'multiple');
}

// Add this method to ensure proper step initialization
initializeSteps() {
    this.updateStepDisplay();
    this.updateNavigationButtons();
    this.updateProgress();
    
    // Force initial progress bar update
    setTimeout(() => {
        this.updateProgress();
    }, 100);
}

    // Handle multiple photo selection
    // Handle multiple photo selection - FIXED VERSION
async handlePhotoSelection(event) {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
        return;
    }

    // FIXED: Don't clear the input immediately
    const input = document.getElementById('photoInput');
    
    // Validate files first - basic validation
    const validFiles = files.filter(file => {
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            this.showToast(`"${file.name}" is not a supported image format (JPEG/PNG/JPG/WEBP only)`, 'error');
            return false;
        }

        if (file.size > maxSize) {
            this.showToast(`"${file.name}" is too large. Maximum size is 5MB.`, 'error');
            return false;
        }

        return true;
    });

    // Advanced image validation - check if images are valid and appear to be vehicles
    const validatedFiles = [];
    for (const file of validFiles) {
        try {
            const isValid = await this.validateVehicleImage(file);
            if (isValid) {
                validatedFiles.push(file);
            }
        } catch (error) {
            this.showToast(error.message || `"${file.name}" failed validation. Please upload a valid vehicle photo.`, 'error');
        }
    }
    
    // Use validated files instead of validFiles
    const finalValidFiles = validatedFiles;

    if (finalValidFiles.length === 0) {
        // FIXED: Clear input if no valid files
        if (input) input.value = '';
        return;
    }

    // Check total photos count
    if (this.uploadedPhotos.length + finalValidFiles.length > 15) {
        this.showToast(`Maximum 15 photos allowed. You have ${this.uploadedPhotos.length} photos already.`, 'error');
        // FIXED: Clear input if over limit
        if (input) input.value = '';
        return;
    }

    // Show loading state - use a loading overlay instead of replacing content
    const uploadArea = document.getElementById('photoUploadArea');
    if (!uploadArea) return;
    
    // Create loading overlay instead of replacing entire content
    let loadingOverlay = uploadArea.querySelector('.upload-loading-overlay');
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'upload-loading-overlay';
        loadingOverlay.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.95); display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 12px; z-index: 10;';
        uploadArea.style.position = 'relative';
    }
    
    loadingOverlay.innerHTML = `
        <div class="upload-icon"><i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #00c853; margin-bottom: 16px;"></i></div>
        <div style="font-size:18px;font-weight:600;color:#333">Processing ${finalValidFiles.length} photos...</div>
        <div style="font-size:14px;color:#666">Please wait while we process your images</div>
    `;
    loadingOverlay.style.display = 'flex';
    uploadArea.appendChild(loadingOverlay);

    try {
        // Process all files in parallel
        const processingPromises = finalValidFiles.map(file => this.readFileAsDataURL(file));
        const dataUrls = await Promise.all(processingPromises);
        
        // Add all photos to uploadedPhotos array
        finalValidFiles.forEach((file, index) => {
            const photoData = {
                file: file,
                dataUrl: dataUrls[index],
                originalName: file.name,
                size: file.size,
                isFeatured: false
            };
            this.uploadedPhotos.push(photoData);
        });


        // Auto-select first photo as featured if none selected
        if (this.featuredPhotoIndex === -1 && this.uploadedPhotos.length > 0) {
            this.setFeaturedPhoto(0);
        }

        this.renderPhotoGrid();
        this.updatePhotoCounter();
        this.updatePhotoStatus();
        
        // Show success message
        const remainingSlots = 15 - this.uploadedPhotos.length;
        if (remainingSlots > 0) {
            this.showToast(`${finalValidFiles.length} photos added successfully! Total: ${this.uploadedPhotos.length}/15. You can add ${remainingSlots} more.`, 'success');
        } else {
            this.showToast(`${finalValidFiles.length} photos added successfully! Maximum of 15 photos reached.`, 'success');
        }
        
    } catch (error) {
        console.error('Error processing photos:', error);
        this.showToast('Error processing photos: ' + error.message, 'error');
    } finally {
        // Remove loading overlay instead of replacing entire content
        if (loadingOverlay && loadingOverlay.parentNode) {
            loadingOverlay.style.display = 'none';
            loadingOverlay.remove();
        }
        
        // IMPORTANT: Clear input value AFTER processing to allow adding more photos
        // This allows users to click "Choose Photos" again to add more
        if (input) {
            input.value = '';
        }
        
        // Re-initialize photo upload if needed (in case event listeners were lost)
        // Only re-setup if button doesn't have click handler
        const uploadButton = document.getElementById('photoUploadButton');
        if (uploadButton && !uploadButton.hasAttribute('data-listener-attached')) {
            // Re-setup is handled by the photoUploadSetup flag, so this shouldn't be needed
            // But just in case, we'll mark it
            uploadButton.setAttribute('data-listener-attached', 'true');
        }
    }
}


    async validateVehicleImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);
            
            img.onload = () => {
                URL.revokeObjectURL(objectUrl);
                // Basic vehicle image validation:
                // 1. Check image dimensions (vehicles are typically wider than tall)
                const aspectRatio = img.width / img.height;
                const minWidth = 200;
                const minHeight = 150;
                
                // Allow square-ish images (0.8-1.5 ratio) and landscape (wider)
                // Reject portrait images that are too tall (likely not vehicles)
                if (img.width < minWidth || img.height < minHeight) {
                    reject(new Error(`"${file.name}" is too small. Minimum size: ${minWidth}x${minHeight}px`));
                    return;
                }
                
                // Reject extremely tall images (likely not vehicles)
                if (aspectRatio < 0.5) {
                    reject(new Error(`"${file.name}" appears to be a portrait image. Please upload vehicle photos.`));
                    return;
                }
                
                // Check if image is too dark (might be invalid)
                const canvas = document.createElement('canvas');
                canvas.width = Math.min(img.width, 100);
                canvas.height = Math.min(img.height, 100);
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixels = imageData.data;
                let totalBrightness = 0;
                for (let i = 0; i < pixels.length; i += 4) {
                    totalBrightness += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
                }
                const avgBrightness = totalBrightness / (pixels.length / 4);
                
                // Reject images that are too dark (likely corrupted or invalid)
                if (avgBrightness < 10) {
                    reject(new Error(`"${file.name}" appears to be corrupted or invalid. Please upload a valid vehicle photo.`));
                    return;
                }
                
                resolve(true);
            };
            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                reject(new Error(`"${file.name}" is not a valid image file.`));
            };
            img.src = objectUrl;
        });
    }

    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    setFeaturedPhoto(index) {
        // Remove featured status from all photos
        this.uploadedPhotos.forEach(photo => {
            photo.isFeatured = false;
        });
        
        // Set new featured photo
        this.uploadedPhotos[index].isFeatured = true;
        this.featuredPhotoIndex = index;
        
        this.renderPhotoGrid();
        this.updatePhotoStatus();
        
        if (this.uploadedPhotos.length > 0) {
            this.showToast('Featured photo updated!', 'success');
        }
    }

    // FIXED: Improved photo grid rendering
renderPhotoGrid() {
    const photoGrid = document.getElementById('photoGrid');
    if (!photoGrid) return;

    if (this.uploadedPhotos.length === 0) {
        photoGrid.innerHTML = '<div class="no-photos">No photos uploaded yet</div>';
        return;
    }

    photoGrid.innerHTML = this.uploadedPhotos.map((photo, index) => `
        <div class="photo-item ${photo.isFeatured ? 'featured' : ''}" data-index="${index}">
            <img src="${photo.dataUrl}" alt="${photo.originalName}" loading="lazy">
            <div class="photo-actions">
                <button class="photo-set-featured" onclick="window.sellManager.setFeaturedPhoto(${index})">
                    <i class="fas fa-star"></i> ${photo.isFeatured ? 'Featured' : 'Set Featured'}
                </button>
                <button class="photo-remove" onclick="window.sellManager.removePhoto(${index})">
                    <i class="fas fa-times"></i> Remove
                </button>
            </div>
            ${photo.isFeatured ? '<div class="photo-featured-badge"><i class="fas fa-star"></i> Featured</div>' : ''}
        </div>
    `).join('');
}

    // FIXED: Enhanced photo removal
removePhoto(index) {
    if (index < 0 || index >= this.uploadedPhotos.length) return;
    
    const wasFeatured = this.uploadedPhotos[index].isFeatured;
    this.uploadedPhotos.splice(index, 1);
    
    // If we removed the featured photo, set a new one
    if (wasFeatured && this.uploadedPhotos.length > 0) {
        this.setFeaturedPhoto(0);
    } else if (this.uploadedPhotos.length === 0) {
        this.featuredPhotoIndex = -1;
    } else if (this.featuredPhotoIndex > index) {
        // Adjust featured photo index if we removed a photo before it
        this.featuredPhotoIndex--;
    }
    
    this.renderPhotoGrid();
    this.updatePhotoCounter();
    this.updatePhotoStatus();
    
    this.showToast('Photo removed', 'info');
}

    updatePhotoCounter() {
        const counter = document.getElementById('photoCounter');
        if (!counter) return;

        const count = this.uploadedPhotos.length;
        const minPhotos = this.editMode ? 1 : 6;
        
        counter.textContent = `${count} of ${minPhotos} minimum photo${minPhotos > 1 ? 's' : ''} uploaded`;

        if (count < minPhotos) {
            counter.className = 'photo-counter error';
        } else {
            counter.className = 'photo-counter success';
        }
    }

    updatePhotoStatus() {
        const minPhotosStatus = document.getElementById('minPhotosStatus');
        const featuredPhotoStatus = document.getElementById('featuredPhotoStatus');
        const minPhotos = this.editMode ? 1 : 6;
        
        if (minPhotosStatus) {
            if (this.uploadedPhotos.length >= minPhotos) {
                minPhotosStatus.className = 'photo-status-icon completed';
                minPhotosStatus.innerHTML = '<i class="fas fa-check"></i>';
            } else {
                minPhotosStatus.className = 'photo-status-icon required';
                minPhotosStatus.innerHTML = '<i class="fas fa-exclamation"></i>';
            }
        }
        
        if (featuredPhotoStatus) {
            if (this.featuredPhotoIndex !== -1) {
                featuredPhotoStatus.className = 'photo-status-icon completed';
                featuredPhotoStatus.innerHTML = '<i class="fas fa-check"></i>';
            } else {
                featuredPhotoStatus.className = 'photo-status-icon pending';
                featuredPhotoStatus.innerHTML = '<i class="fas fa-star"></i>';
            }
        }
    }

    // STEP MANAGEMENT
    async changeStep(direction) {
        const newStep = this.currentStep + direction;

        if (newStep < 1 || newStep > this.totalSteps) return;

        if (direction === 1 && !(await this.validateCurrentStep())) return;

        // Update step
        this.currentStep = newStep;

        // Update UI
        this.updateStepDisplay();
        this.updateProgress();
        this.updateNavigationButtons();

        // Update review if on step 4
        if (this.currentStep === 4) {
            this.updateReviewSection();
            // Initialize submit button state
            this.initializeSubmitButton();
        }
    }

    initializeSubmitButton() {
        const submitBtn = document.getElementById('submitListingButton');
        const reviewCheckbox = document.getElementById('reviewConfirmCheckbox');
        
        if (!submitBtn) return;
        
        // Update button text for edit mode
        if (this.editMode) {
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Listing';
        } else {
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Listing';
        }
        
        // Disable submit button until review confirmation is checked
        if (reviewCheckbox) {
            // Cache references if not already done
            if (!this.reviewConfirmCheckbox) {
                this.reviewConfirmCheckbox = reviewCheckbox;
                this.submitBtn = submitBtn;
                
                // Create bound handler only once
                this.boundReviewConfirmHandler = (e) => {
                    if (this.submitBtn) {
                        this.submitBtn.disabled = !e.target.checked;
                    }
                };
                
                // Add event listener
                reviewCheckbox.addEventListener('change', this.boundReviewConfirmHandler);
            }
            
            // Set initial state
            submitBtn.disabled = !reviewCheckbox.checked;
        } else {
            // If no checkbox, enable button
            submitBtn.disabled = false;
        }
    }

    async validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                return await this.validateStep1();
            case 2:
                return this.validateStep2();
            case 3:
                return this.validateStep3();
            default:
                return true;
        }
    }

    async validateStep1() {
        const requiredFields = ['make_id', 'model_id', 'title', 'year', 'price', 'location_id', 'fuel_type', 'transmission', 'condition_type'];
        
        if (this.guestMode) {
            requiredFields.push('seller_name', 'seller_phone', 'seller_email');
        }

        for (const field of requiredFields) {
            const input = document.querySelector(`[name="${field}"]`);
            if (!input || !input.value || !input.value.trim()) {
                this.showToast(`Please fill in the ${field.replace('_', ' ')} field`, 'error');
                input?.focus();
                return false;
            }
        }

        // Add custom price validation
        const priceInput = document.querySelector('[name="price"]');
        const price = parseInt(priceInput.value);
        if (isNaN(price) || price < 100000) {
            this.showToast('Price must be at least MWK 100,000', 'error');
            priceInput.focus();
            return false;
        }

        // Validate description for profanity and nonsense words
        const descriptionInput = document.querySelector('[name="description"]');
        if (descriptionInput && descriptionInput.value && descriptionInput.value.trim()) {
            const description = descriptionInput.value.trim();
            const validationResult = this.validateDescription(description);
            if (!validationResult.valid) {
                this.showToast(validationResult.message, 'error');
                descriptionInput.focus();
                return false;
            }
        }

        // Validate exterior color if provided
        const colorInput = document.querySelector('[name="exterior_color"]');
        if (colorInput && colorInput.value && colorInput.value.trim()) {
            const color = colorInput.value.trim();
            // Color should be 2-20 characters, alphanumeric with spaces and hyphens
            const colorRegex = /^[a-zA-Z0-9\s\-]{2,20}$/;
            if (!colorRegex.test(color)) {
                this.showToast('Color must be 2-20 characters and contain only letters, numbers, spaces, and hyphens', 'error');
                colorInput.focus();
                return false;
            }
        }

        // Check for potential duplicate listings (soft reminder, not blocking)
        // This is non-blocking - if it fails, validation still passes
        if (!this.editMode) {
            try {
                await this.checkForSimilarListings();
            } catch (error) {
                // Silently ignore errors - this is just a soft reminder feature
                // Don't block form submission if duplicate check fails
            }
        }

        return true;
    }

    /**
     * Validate description for profanity, nonsense words, and quality
     */
    validateDescription(description) {
        if (!description || description.trim().length < 10) {
            return { valid: false, message: 'Description must be at least 10 characters long' };
        }

        // Common profanity words (basic list - can be expanded)
        const profanityWords = [
            'fuck', 'shit', 'damn', 'bitch', 'asshole', 'crap', 'piss', 'hell',
            'bastard', 'dick', 'cock', 'pussy', 'whore', 'slut', 'nigger', 'fag'
        ];

        const lowerDescription = description.toLowerCase();
        for (const word of profanityWords) {
            if (lowerDescription.includes(word)) {
                return { valid: false, message: 'Description contains inappropriate language. Please use professional language.' };
            }
        }

        // Check for excessive repetition (likely spam/nonsense)
        const words = description.toLowerCase().split(/\s+/);
        const wordCounts = {};
        for (const word of words) {
            if (word.length > 2) { // Ignore short words
                wordCounts[word] = (wordCounts[word] || 0) + 1;
                if (wordCounts[word] > 5) {
                    return { valid: false, message: 'Description contains excessive repetition. Please write a more varied description.' };
                }
            }
        }

        // Check for nonsense patterns (too many random characters)
        const nonsensePattern = /[a-z]{1}[A-Z]{1}[a-z]{1}[A-Z]{1}/g;
        if (nonsensePattern.test(description)) {
            return { valid: false, message: 'Description contains unusual formatting. Please write in normal sentences.' };
        }

        // Check for minimum word count (at least 5 meaningful words)
        const meaningfulWords = words.filter(w => w.length > 2);
        if (meaningfulWords.length < 5) {
            return { valid: false, message: 'Description is too short. Please provide more details about the car.' };
        }

        return { valid: true };
    }

    validateStep2() {
        // In edit mode, allow fewer photos since they might already have photos
        const minPhotos = this.editMode ? 1 : 6;
        
        if (this.uploadedPhotos.length < minPhotos) {
            this.showToast(`Please upload at least ${minPhotos} photo${minPhotos > 1 ? 's' : ''}`, 'error');
            return false;
        }
        
        if (this.featuredPhotoIndex === -1 && this.uploadedPhotos.length > 0) {
            this.showToast('Please select a featured photo by clicking "Set as Featured" on your preferred image', 'error');
            return false;
        }
        
        return true;
    }

    validateStep3() {
        const listingType = document.getElementById('listingTypeInput')?.value;
        if (!listingType) {
            this.showToast('Please select a listing type', 'error');
            return false;
        }
        return true;
    }

    /**
     * Check for similar listings (educational reminder, not blocking)
     * Implements strict duplicate detection with friendly guidance
     * Checks for similar: make, model, year, mileage, description
     * NOTE: This is a soft check - failures are silently ignored to not block form submission
     */
    async checkForSimilarListings() {
        try {
            // Get current listing details
            const makeSelect = document.querySelector('[name="make_id"]');
            const modelSelect = document.querySelector('[name="model_id"]');
            const yearInput = document.querySelector('[name="year"]');
            const titleInput = document.querySelector('[name="title"]');
            const mileageInput = document.querySelector('[name="mileage"]');
            const descriptionInput = document.querySelector('[name="description"]');
            
            if (!makeSelect || !modelSelect || !yearInput || !titleInput) {
                return; // Can't check without these fields
            }

            const makeText = makeSelect.options[makeSelect.selectedIndex]?.text || '';
            const modelText = modelSelect.options[modelSelect.selectedIndex]?.text || '';
            const year = yearInput.value;
            const title = titleInput.value;
            const mileage = mileageInput ? mileageInput.value : null;
            const description = descriptionInput ? descriptionInput.value : '';

            // Only check if user is logged in (guests can only post one anyway)
            if (!this.currentUser) {
                return;
            }

            // Call API to check for similar listings with strict duplicate criteria
            // Note: If endpoint doesn't exist, this will fail gracefully
            const response = await fetch(`${CONFIG.API_URL}?action=check_similar_listings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    make: makeText,
                    model: modelText,
                    year: year,
                    title: title,
                    mileage: mileage,
                    description: description,
                    strict_check: true  // Enable strict duplicate detection
                })
            });

            // If endpoint doesn't exist (400/404), silently fail - this is not a blocking check
            if (!response.ok) {
                // Silently fail - this is just a soft reminder, not required
                return;
            }

            const data = await response.json();

            if (data.success && data.similar_listings && data.similar_listings.length > 0) {
                // Show friendly reminder modal (non-blocking)
                await this.showDuplicateReminderModal(data.similar_listings);
            }

        } catch (error) {
            // Silently fail - don't block the user if check fails or API not implemented yet
            console.log('Duplicate check skipped (API endpoint may not be implemented yet):', error.message);
        }
    }

    /**
     * Show friendly reminder modal for potential duplicates
     * Enhanced to show matching criteria
     */
    showDuplicateReminderModal(similarListings) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'duplicate-reminder-modal';
            modal.innerHTML = `
                <div class="duplicate-reminder-overlay"></div>
                <div class="duplicate-reminder-content">
                    <div class="duplicate-reminder-header">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Potential Duplicate Detected!</h3>
                    </div>
                    <div class="duplicate-reminder-body">
                        <p><strong>We found very similar listings in your account:</strong></p>
                        <div class="similar-listings-preview">
                            ${similarListings.slice(0, 3).map(listing => `
                                <div class="similar-listing-item">
                                    <div class="similar-listing-icon">
                                        <i class="fas fa-car"></i>
                                    </div>
                                    <div class="similar-listing-details">
                                        <div class="similar-listing-title">${listing.title} (${listing.year})</div>
                                        ${listing.mileage ? `<div class="similar-listing-info"><i class="fas fa-road"></i> ${parseInt(listing.mileage).toLocaleString()} km</div>` : ''}
                                        ${listing.similarity_score ? `<div class="similarity-badge">Match: ${listing.similarity_score}%</div>` : ''}
                                    </div>
                                </div>
                            `).join('')}
                            ${similarListings.length > 3 ? `<p style="color: #666; font-size: 13px; margin-top: 8px;">+ ${similarListings.length - 3} more similar listings</p>` : ''}
                        </div>
                        <div class="warning-box" style="margin-top: 16px; padding: 12px; background: #fff7ed; border-left: 4px solid #f59e0b; border-radius: 6px;">
                            <p style="margin: 0; color: #92400e;"><strong><i class="fas fa-info-circle"></i> Why does this matter?</strong></p>
                            <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #92400e; font-size: 13px;">
                                <li>Duplicate listings reduce visibility for all your cars</li>
                                <li>Buyers lose trust when they see the same car multiple times</li>
                                <li>Our system may automatically remove duplicates</li>
                            </ul>
                        </div>
                        <p class="reminder-tip" style="margin-top: 16px;">
                            <strong>💡 What should you do?</strong>
                        </p>
                        <ul class="reminder-actions-list">
                            <li><i class="fas fa-edit"></i> <strong>Edit</strong> your existing listing if it's the same car</li>
                            <li><i class="fas fa-trash-alt"></i> <strong>Delete</strong> the old listing first, then create a new one</li>
                            <li><i class="fas fa-check"></i> Make this listing <strong>unique</strong> with different details</li>
                        </ul>
                        <p class="reminder-note">
                            <i class="fas fa-info-circle"></i> This is a different car? Click "Continue Anyway" to proceed.
                        </p>
                    </div>
                    <div class="duplicate-reminder-footer">
                        <button class="btn btn-outline-primary btn-view-listings">
                            <i class="fas fa-list"></i> View My Listings
                        </button>
                        <button class="btn btn-primary btn-continue-posting">
                            <i class="fas fa-arrow-right"></i> Continue Anyway
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Add event listeners
            const viewListingsBtn = modal.querySelector('.btn-view-listings');
            const continueBtn = modal.querySelector('.btn-continue-posting');
            const overlay = modal.querySelector('.duplicate-reminder-overlay');

            const closeModal = () => {
                modal.remove();
                resolve();
            };

            viewListingsBtn.addEventListener('click', () => {
                window.location.href = 'my-listings.html';
            });

            continueBtn.addEventListener('click', closeModal);
            overlay.addEventListener('click', closeModal);
        });
    }


    updateStepDisplay() {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });

        // Show current step
        const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }

        // Update step indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');

            if (stepNumber === this.currentStep) {
                step.classList.add('active');
            } else if (stepNumber < this.currentStep) {
                step.classList.add('completed');
            }
        });
    }

    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            const progress = (this.currentStep / this.totalSteps) * 100;
            progressFill.style.width = `${progress}%`;
        }
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        if (prevBtn) {
            prevBtn.style.display = this.currentStep === 1 ? 'none' : 'inline-flex';
        }
        // Hide Next button on the last step (review & submit)
        if (nextBtn) {
            nextBtn.style.display = this.currentStep === this.totalSteps ? 'none' : 'inline-flex';
        }
        // Submit button is now in the review section, not in navigation
        // Only enable/disable it based on review confirmation
        if (submitBtn) {
            // Update button text for edit mode
            if (this.editMode) {
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Listing';
            } else {
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Listing';
            }
            
            // Disable submit button until review confirmation is checked
            if (this.currentStep === this.totalSteps) {
                const reviewCheckbox = document.getElementById('reviewConfirmCheckbox');
                if (reviewCheckbox) {
                    // Cache references if not already done
                    if (!this.reviewConfirmCheckbox) {
                        this.reviewConfirmCheckbox = reviewCheckbox;
                        this.submitBtn = submitBtn;
                        
                        // Create bound handler only once
                        this.boundReviewConfirmHandler = (e) => {
                            if (this.submitBtn) {
                                this.submitBtn.disabled = !e.target.checked;
                            }
                        };
                        
                        // Add event listener only once
                        this.reviewConfirmCheckbox.addEventListener('change', this.boundReviewConfirmHandler);
                    }
                    
                    // Set initial state based on checkbox
                    submitBtn.disabled = !reviewCheckbox.checked;
                }
            }
        }
    }

    // LISTING TYPE SELECTION
    selectListingType(type) {
        document.querySelectorAll('.listing-type-card').forEach(card => {
            card.classList.remove('selected');
        });
        const selectedCard = document.querySelector(`[data-type="${type}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        const listingTypeInput = document.getElementById('listingTypeInput');
        if (listingTypeInput) {
            listingTypeInput.value = type;
        }
    }

    // REVIEW SECTION
    updateReviewSection() {
        this.updateCarDetailsReview();
        this.updatePhotosReview();
        this.updateListingTypeReview();
        this.updateContactInfoReview();
    }

    updateCarDetailsReview() {
        const form = document.getElementById('sellCarForm');
        const reviewCarDetails = document.getElementById('reviewCarDetails');
        
        if (!form || !reviewCarDetails) return;
        
        const formData = new FormData(form);
        
        const makeText = document.querySelector('[name="make_id"] option:checked')?.textContent;
        const modelText = document.querySelector('[name="model_id"] option:checked')?.textContent;
        const locationText = document.querySelector('[name="location_id"] option:checked')?.textContent;

        const html = `
            <div style="display: grid; gap: 12px;">
                <div><strong>Car:</strong> ${formData.get('year')} ${makeText} ${modelText}</div>
                <div><strong>Title:</strong> ${formData.get('title')}</div>
                <div><strong>Price:</strong> MWK ${parseInt(formData.get('price') || 0).toLocaleString()} ${formData.get('negotiable') ? '(Negotiable)' : ''}</div>
                <div><strong>Location:</strong> ${locationText}</div>
                <div><strong>Condition:</strong> ${formData.get('condition_type')}</div>
                <div><strong>Fuel Type:</strong> ${formData.get('fuel_type')}</div>
                <div><strong>Transmission:</strong> ${formData.get('transmission')}</div>
                ${formData.get('mileage') ? `<div><strong>Mileage:</strong> ${parseInt(formData.get('mileage')).toLocaleString()} km</div>` : ''}
                ${formData.get('exterior_color') ? `<div><strong>Color:</strong> ${formData.get('exterior_color')}</div>` : ''}
            </div>
        `;

        reviewCarDetails.innerHTML = html;
    }

    updatePhotosReview() {
        const reviewPhotos = document.getElementById('reviewPhotos');
        if (!reviewPhotos) return;

        let featuredHtml = '';
        let otherPhotosHtml = '';
        
        if (this.featuredPhotoIndex !== -1 && this.uploadedPhotos[this.featuredPhotoIndex]) {
            const featuredPhoto = this.uploadedPhotos[this.featuredPhotoIndex];
            featuredHtml = `
                <div style="margin-bottom: 16px;">
                    <div style="font-weight: 600; color: var(--success-green); margin-bottom: 8px;">
                        <i class="fas fa-star"></i> Featured Photo
                    </div>
                    <img src="${featuredPhoto.dataUrl}" style="width: 120px; height: 90px; object-fit: cover; border-radius: 8px; border: 2px solid var(--success-green);">
                </div>
            `;
        }
        
        // Show up to 4 other photos
        const otherPhotos = this.uploadedPhotos.filter((_, index) => index !== this.featuredPhotoIndex).slice(0, 4);
        if (otherPhotos.length > 0) {
            otherPhotosHtml = `
                <div>
                    <div style="font-weight: 600; margin-bottom: 8px;">Other Photos</div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        ${otherPhotos.map(photo => 
                            `<img src="${photo.dataUrl}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px;">`
                        ).join('')}
                        ${this.uploadedPhotos.length - 1 > 4 ? `<div style="width: 60px; height: 60px; background: #f0f0f0; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #666;">+${this.uploadedPhotos.length - 5}</div>` : ''}
                    </div>
                </div>
            `;
        }

        const html = `
            ${featuredHtml}
            ${otherPhotosHtml}
            <p style="margin-top: 8px; font-size: 14px; color: #666;">${this.uploadedPhotos.length} photos total</p>
        `;

        reviewPhotos.innerHTML = html;
    }

    updateListingTypeReview() {
        const reviewListingType = document.getElementById('reviewListingType');
        const listingTypeInput = document.getElementById('listingTypeInput');
        
        if (!reviewListingType || !listingTypeInput) return;
        
        const listingType = listingTypeInput.value;
        const typeNames = {
            'free': 'Free Listing',
            'featured': 'Featured Listing'
        };
        const typePrices = {
            'free': 'FREE',
            'featured': 'MWK 15,000'
        };

        const html = `<div><strong>${typeNames[listingType] || 'Unknown'}</strong> - ${typePrices[listingType] || 'Unknown'}</div>`;

        reviewListingType.innerHTML = html;
    }

    updateContactInfoReview() {
        const reviewContactInfo = document.getElementById('reviewContactInfo');
        const form = document.getElementById('sellCarForm');
        
        if (!reviewContactInfo || !form) return;
        
        const formData = new FormData(form);

        let html = '';

        if (this.guestMode) {
            html = `
                <div style="display: grid; gap: 8px;">
                    <div><strong>Name:</strong> ${formData.get('seller_name')}</div>
                    <div><strong>Phone:</strong> ${formData.get('seller_phone')}</div>
                    <div><strong>Email:</strong> ${formData.get('seller_email')}</div>
                    ${formData.get('seller_whatsapp') ? `<div><strong>WhatsApp:</strong> ${formData.get('seller_whatsapp')}</div>` : ''}
                </div>
            `;
        } else if (this.currentUser) {
            html = `
                <div style="display: grid; gap: 8px;">
                    <div><strong>Account:</strong> ${this.currentUser.name}</div>
                    <div><strong>Email:</strong> ${this.currentUser.email}</div>
                    ${this.currentUser.phone ? `<div><strong>Phone:</strong> ${this.currentUser.phone}</div>` : ''}
                </div>
            `;
        }

        reviewContactInfo.innerHTML = html;
    }

    // FORM SUBMISSION
    setupFormValidation() {
        const sellCarForm = document.getElementById('sellCarForm');
        const submitBtn = document.getElementById('submitBtn');
        
        if (sellCarForm) {
            // Prevent default form submission - we'll handle it manually
            sellCarForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(e);
            });
        }
        
        // Also handle submit button click directly (since it's now type="button")
        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const form = document.getElementById('sellCarForm');
                if (form) {
                    this.handleFormSubmit({ preventDefault: () => {}, target: form });
                }
            });
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();

        // Ensure we're on the final step before allowing submission
        if (this.currentStep !== this.totalSteps) {
            this.showToast('Please complete all steps before submitting', 'error');
            return;
        }

        // Validate ALL steps before submission
        if (!this.currentUser) {
            this.showToast('You must be logged in to save listings.', 'error');
            setTimeout(() => {
                window.location.href = 'login.html?redirect=sell.html';
            }, 500);
            return;
        }

        if (!(await this.validateStep1())) {
            this.showToast('Please fix errors in Step 1: Car Information', 'error');
            this.currentStep = 1;
            this.updateStepDisplay();
            this.updateNavigationButtons();
            return;
        }

        if (!this.validateStep2()) {
            this.showToast('Please fix errors in Step 2: Photos', 'error');
            this.currentStep = 2;
            this.updateStepDisplay();
            this.updateNavigationButtons();
            return;
        }

        if (!this.validateStep3()) {
            this.showToast('Please fix errors in Step 3: Listing Type', 'error');
            this.currentStep = 3;
            this.updateStepDisplay();
            this.updateNavigationButtons();
            return;
        }

        // Enforce known limits client-side for better UX (backend still enforces hard limits).
        if (!this.editMode) {
            if (this.guestMode) {
                if (!this.listingRestrictions.allow_guest_listings) {
                    this.showToast('Guest listings are currently disabled. Please create an account to continue.', 'error');
                    return;
                }

                const remainingGuest = this.listingRestrictions.remaining_guest_listings;
                if (typeof remainingGuest === 'number' && remainingGuest <= 0) {
                    this.showToast('Guest listing limit reached for this email. Please create an account to continue.', 'error');
                    return;
                }
            } else if (this.currentUser) {
                const remainingRegistered = this.listingRestrictions.remaining_registered_listings;
                if (typeof remainingRegistered === 'number' && remainingRegistered <= 0) {
                    this.showToast('You have reached your listing limit. Please remove an old listing before creating a new one.', 'error');
                    return;
                }
            }
        }

        // Final validation check
        if (!(await this.validateCurrentStep())) {
            return;
        }

        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn ? submitBtn.innerHTML : '';

        try {
            if (submitBtn) {
                submitBtn.innerHTML = this.editMode ? 
                    '<i class="fas fa-spinner fa-spin"></i> Updating...' : 
                    '<i class="fas fa-spinner fa-spin"></i> Submitting...';
                submitBtn.disabled = true;
            }

            const formData = new FormData(e.target);

            // Prepare listing data
            const listingData = {
                title: formData.get('title'),
                make_id: formData.get('make_id'),
                model_id: formData.get('model_id'),
                year: formData.get('year'),
                price: formData.get('price'),
                negotiable: formData.get('negotiable') ? 1 : 0,
                mileage: formData.get('mileage'),
                location_id: formData.get('location_id'),
                fuel_type: formData.get('fuel_type'),
                transmission: formData.get('transmission'),
                condition_type: formData.get('condition_type'),
                exterior_color: formData.get('exterior_color'),
                description: formData.get('description'),
                listing_type: formData.get('listing_type'),
                featured_photo_index: this.featuredPhotoIndex
            };

            let listingId;

            if (this.editMode) {
                // UPDATE MODE: Update existing listing
                listingData.listing_id = this.editListingId;

                const response = await fetch(`${CONFIG.API_URL}?action=update_listing`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(listingData)
                });

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.message || 'Listing update failed');
                }

                listingId = this.editListingId;
                
                // Upload any NEW photos (not existing ones)
                const newPhotos = this.uploadedPhotos.filter(photo => !photo.isExisting);
                if (newPhotos.length > 0) {
                    if (submitBtn) {
                        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading New Photos...';
                    }
                    
                    // Temporarily replace uploadedPhotos with only new photos for upload
                    const allPhotos = this.uploadedPhotos;
                    this.uploadedPhotos = newPhotos;
                    
                    try {
                        const photoResult = await this.uploadPhotosToServer(listingId);
                        if (!photoResult.success) {
                        }
                    } catch (photoError) {
                    }
                    
                    // Restore all photos
                    this.uploadedPhotos = allPhotos;
                }
                
                this.showToast('Listing updated successfully!', 'success');
                setTimeout(() => {
                    window.location.href = 'my-listings.html';
                }, 1500);

            } else {
                // CREATE MODE: Create new listing
                await this.loadListingRestrictions(this.guestMode ? (formData.get('seller_email') || '') : '');

                const tempReference = 'TEMP_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                listingData.reference_number = tempReference;

                // Add guest info if applicable
                if (this.guestMode) {
                    listingData.seller_name = formData.get('seller_name');
                    listingData.seller_phone = formData.get('seller_phone');
                    listingData.seller_email = formData.get('seller_email');
                    listingData.seller_whatsapp = formData.get('seller_whatsapp');
                    listingData.is_guest = 1;
                }


                const response = await fetch(`${CONFIG.API_URL}?action=submit_listing`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(listingData)
                });

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.message || 'Listing creation failed');
                }

                listingId = data.listing_id || data.id;

                if (!listingId) {
                    throw new Error('No listing ID returned from server');
                }

                // Upload photos after listing is created
                if (this.uploadedPhotos.length > 0) {
                    if (submitBtn) {
                        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading Photos...';
                    }
                    
                    try {
                        const guestSellerEmail = this.guestMode ? (formData.get('seller_email') || '') : null;
                        const photoResult = await this.uploadPhotosToServer(listingId, guestSellerEmail);
                        if (!photoResult.success) {
                        }
                    } catch (photoError) {
                    }
                }

                // Success
                this.showSuccessMessage(listingId, data);
            }

        } catch (error) {
            this.showToast('Failed to ' + (this.editMode ? 'update' : 'submit') + ' listing: ' + error.message, 'error');
        } finally {
            if (submitBtn) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        }
    }

    async uploadPhotosToServer(listingId, guestSellerEmail = null) {

        if (!listingId) {
            throw new Error('Listing ID required for photo upload');
        }

        if (this.uploadedPhotos.length === 0) {
            return { success: true, message: 'No photos to upload' };
        }

        try {
            const formData = new FormData();
            // Ensure listing_id is sent as a string
            formData.append('listing_id', String(listingId));
            formData.append('featured_photo_index', this.featuredPhotoIndex);

            if (guestSellerEmail) {
                formData.append('guest_seller_email', guestSellerEmail);
            }

            // Append each photo file
            this.uploadedPhotos.forEach(photo => {
                formData.append('images[]', photo.file);
            });


            // Send action as query parameter to ensure it's received correctly
            const apiUrlWithAction = `${CONFIG.API_URL}${CONFIG.API_URL.includes('?') ? '&' : '?'}action=upload_images`;


            const response = await fetch(apiUrlWithAction, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Photo upload failed');
            }

            return result;
        } catch (error) {
            throw error;
        }
    }

    showSuccessMessage(listingId, submitResponse = null) {
        const container = document.querySelector('.form-container');
        if (!container) return;

        const emailVerificationRequired = !!submitResponse?.email_verification_required;
        const verificationLink = submitResponse?.verification_link || '';
        const nextStepHeader = emailVerificationRequired
            ? 'Complete email verification to continue'
            : 'What happens next?';
        const nextStepList = emailVerificationRequired
            ? `
                <ol style="margin: 0; padding-left: 20px; line-height: 1.8;">
                    <li>Verify your listing email using the link we sent</li>
                    <li>After verification, our team reviews your listing within 2-4 hours</li>
                    <li>You'll receive an email notification once approved</li>
                    <li>Your listing then goes live and is visible to buyers</li>
                </ol>
            `
            : `
                <ol style="margin: 0; padding-left: 20px; line-height: 1.8;">
                    <li>Our team will review your listing within 2-4 hours</li>
                    <li>We'll check all details and photos for quality and accuracy</li>
                    <li>You'll receive an email notification once approved</li>
                    <li>Your listing will go live and be visible to thousands of buyers</li>
                </ol>
            `;
        const fallbackVerificationBlock = emailVerificationRequired && verificationLink
            ? `<div style="margin-top: 14px; padding: 12px; border-radius: 8px; background: #fff8e1; border: 1px solid #f2cc62;"><strong>Email test mode:</strong> <a href="${verificationLink}" target="_blank" rel="noopener">Verify listing email</a></div>`
            : '';

        const successHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 4rem; color: var(--success-green); margin-bottom: 20px;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2 style="color: var(--success-green); margin-bottom: 16px;">Listing Submitted Successfully!</h2>
                <p style="font-size: 1.1rem; margin-bottom: 24px; line-height: 1.6;">
                    Thank you for your submission! Your car listing is now under review by our team.
                </p>

                <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 12px; padding: 24px; margin: 32px 0; text-align: left;">
                    <h3 style="color: var(--success-green); margin-top: 0;">${nextStepHeader}</h3>
                    ${nextStepList}
                    ${fallbackVerificationBlock}
                </div>

                <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin-bottom: 32px;">
                    <strong>Listing ID: ${listingId}</strong><br>
                    <small style="color: #666;">Keep this ID for your records</small>
                </div>

                <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
                    <a href="${CONFIG.BASE_URL}" class="btn btn-outline-primary">
                        <i class="fas fa-home"></i> Back to Home
                    </a>
                    <a href="${CONFIG.BASE_URL}sell.html" class="btn btn-primary">
                        <i class="fas fa-plus"></i> List Another Car
                    </a>
                </div>
            </div>
        `;

        container.innerHTML = successHTML;
        this.showToast('Listing submitted successfully!', 'success');
    }

    // UTILITY FUNCTIONS
    setupEventListeners() {
        // Setup guest selling button
        const guestButton = document.querySelector('button[onclick*="enableGuestSelling"]');
        if (guestButton) {
            guestButton.removeAttribute('onclick');
            guestButton.addEventListener('click', () => this.enableGuestSelling());
        }

        // Setup step navigation buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.removeAttribute('onclick');
            prevBtn.addEventListener('click', () => this.changeStep(-1));
        }
        
        if (nextBtn) {
            nextBtn.removeAttribute('onclick');
            nextBtn.addEventListener('click', () => this.changeStep(1));
        }

        // Setup listing type selection
        document.querySelectorAll('.listing-type-card').forEach(card => {
            card.addEventListener('click', () => {
                const type = card.getAttribute('data-type');
                this.selectListingType(type);
            });
        });
    }

    setupMobileMenu() {
        const toggle = document.getElementById('mobileToggle');
        const nav = document.getElementById('mainNav');

        if (toggle && nav) {
            toggle.addEventListener('click', () => {
                nav.classList.toggle('active');
                const icon = toggle.querySelector('i');
                if (nav.classList.contains('active')) {
                    icon.className = 'fas fa-times';
                } else {
                    icon.className = 'fas fa-bars';
                }
            });
        }
    }

    showToast(message, type = 'info') {
        // Remove existing toasts
        document.querySelectorAll('.toast').forEach(toast => toast.remove());

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };

        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="${icons[type]}" style="color: ${colors[type]}; font-size: 16px;"></i>
                <span style="flex: 1; line-height: 1.4;">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #999; margin-left: auto;">×</button>
            </div>
        `;

        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 6px 25px rgba(0,0,0,0.15);
            z-index: 10000;
            border-left: 4px solid ${colors[type]};
            max-width: 350px;
            font-size: 14px;
            animation: slideInRight 0.4s ease;
        `;

        document.body.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    initializeSteps() {
        this.updateStepDisplay();
        this.updateNavigationButtons();
        this.updateProgress();
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Check if we're on the sell page
    if (window.location.pathname.includes('sell.html')) {
        // Add a small delay to ensure all DOM elements are ready
        setTimeout(() => {
            window.sellManager = new SellManager();
        }, 100);
    }
});

// Global functions for HTML onclick attributes
window.enableGuestSelling = function() {
    if (window.sellManager) {
        window.sellManager.enableGuestSelling();
    } else {
    }
};

window.selectListingType = function(type) {
    if (window.sellManager) {
        window.sellManager.selectListingType(type);
    } else {
    }
};

// Add CSS for animations if not present
if (!document.querySelector('#sell-animations')) {
    const style = document.createElement('style');
    style.id = 'sell-animations';
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .hidden { display: none !important; }
    `;
    document.head.appendChild(style);
}
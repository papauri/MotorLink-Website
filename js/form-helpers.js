/**
 * Form Helpers - Reusable functions for populating form dropdowns from database
 * MotorLink
 */

class FormHelpers {
    constructor() {
        this.makes = [];
        this.models = [];
        this.locations = [];
    }

    /**
     * Initialize all dropdowns on page load
     */
    async initializeDropdowns() {
        await this.loadMakes();
        await this.loadLocations();
        this.populateYearDropdown();
    }

    /**
     * Load car makes from database
     */
    async loadMakes() {
        try {
            const response = await fetch(`${CONFIG.API_URL}?action=makes`, {
                ...(CONFIG.USE_CREDENTIALS && {credentials: 'include'})
            });
            const data = await response.json();

            if (data.success && data.makes) {
                this.makes = data.makes;
                this.populateMakesDropdown();
            }
        } catch (error) {
        }
    }

    /**
     * Load car models for a specific make
     */
    async loadModels(makeId) {
        if (!makeId) {
            this.models = [];
            return;
        }

        try {
            const response = await fetch(`${CONFIG.API_URL}?action=models&make_id=${makeId}`, {
                ...(CONFIG.USE_CREDENTIALS && {credentials: 'include'})
            });
            const data = await response.json();

            if (data.success && data.models) {
                this.models = data.models;
                this.populateModelsDropdown();
            }
        } catch (error) {
        }
    }

    /**
     * Load locations from database
     */
    async loadLocations() {
        try {
            const response = await fetch(`${CONFIG.API_URL}?action=locations`, {
                ...(CONFIG.USE_CREDENTIALS && {credentials: 'include'})
            });
            const data = await response.json();

            if (data.success && data.locations) {
                this.locations = data.locations;
                this.populateLocationsDropdown();
            }
        } catch (error) {
        }
    }

    /**
     * Populate makes dropdown
     */
    populateMakesDropdown() {
        const makeSelects = document.querySelectorAll('select[name="make_id"], #carMake, #makeSelect');

        makeSelects.forEach(select => {
            // Clear existing options except first
            while (select.options.length > 1) {
                select.remove(1);
            }

            // Add makes
            this.makes.forEach(make => {
                const option = document.createElement('option');
                option.value = make.id;
                option.textContent = make.name;
                select.appendChild(option);
            });
        });

        // Setup change listeners
        makeSelects.forEach(select => {
            select.addEventListener('change', async (e) => {
                const makeId = e.target.value;
                await this.loadModels(makeId);

                // Enable model dropdown
                const modelSelects = document.querySelectorAll('select[name="model_id"], #carModel, #modelSelect');
                modelSelects.forEach(ms => {
                    ms.disabled = !makeId;
                    if (!makeId) {
                        ms.innerHTML = '<option value="">Select Make First...</option>';
                        // Clear variations when make is cleared
                        if (window.modelVariationsHelper) {
                            window.modelVariationsHelper.clearVariationDropdowns();
                        }
                    }
                });
            });
        });
    }

    /**
     * Populate models dropdown
     */
    populateModelsDropdown() {
        const modelSelects = document.querySelectorAll('select[name="model_id"], #carModel, #modelSelect');

        modelSelects.forEach(select => {
            select.disabled = false;

            // Clear existing options
            select.innerHTML = '<option value="">Select Model...</option>';

            // Add models (unique names only - grouped by name)
            const uniqueModels = new Map();
            this.models.forEach(model => {
                // Use name as key to avoid duplicates
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
                select.appendChild(option);
            });

            // Setup model change listener to load variations (only if not already set)
            if (!select.dataset.variationListenerAdded) {
                select.dataset.variationListenerAdded = 'true';
                select.addEventListener('change', async (e) => {
                    const modelId = e.target.value;
                    console.log('Model changed to ID:', modelId, 'Selected option:', e.target.options[e.target.selectedIndex]?.textContent);
                    
                    if (modelId && window.modelVariationsHelper) {
                        // Determine which form we're in based on select element
                        let options = {};
                        
                        // Check for different form field names
                        if (select.closest('#addVehicleForm') || select.closest('#editVehicleForm')) {
                            // Car hire dashboard
                            options = {
                                engineSizeSelect: 'vehicleEngineSize',
                                fuelTankSelect: 'vehicleFuelTankCapacity',
                                drivetrainSelect: 'vehicleDrivetrain',
                                transmissionSelect: 'vehicleTransmission'
                            };
                        } else if (select.closest('#addCarForm') || select.closest('#editCarForm')) {
                            // Dealer dashboard
                            options = {
                                engineSizeSelect: 'carEngineSize',
                                fuelTankSelect: 'carFuelTankCapacity',
                                drivetrainSelect: 'carDrivetrain',
                                transmissionSelect: 'carTransmission'
                            };
                        } else {
                            // Sell form or other forms - use IDs from sell.html
                            options = {
                                engineSizeSelect: 'engineSizeSelect',
                                fuelTankSelect: 'fuelTankCapacitySelect',
                                drivetrainSelect: 'drivetrainSelect',
                                transmissionSelect: 'transmission'
                            };
                        }
                        
                        console.log('Loading variations with options:', options);
                        await window.modelVariationsHelper.loadModelVariations(modelId, options);
                    } else if (!modelId && window.modelVariationsHelper) {
                        // Clear variations when model is cleared
                        let options = {};
                        if (select.closest('#addVehicleForm') || select.closest('#editVehicleForm')) {
                            options = {
                                engineSizeSelect: 'vehicleEngineSize',
                                fuelTankSelect: 'vehicleFuelTankCapacity',
                                drivetrainSelect: 'vehicleDrivetrain'
                            };
                        } else if (select.closest('#addCarForm') || select.closest('#editCarForm')) {
                            options = {
                                engineSizeSelect: 'carEngineSize',
                                fuelTankSelect: 'carFuelTankCapacity',
                                drivetrainSelect: 'carDrivetrain'
                            };
                        } else {
                            options = {
                                engineSizeSelect: 'engineSizeSelect',
                                fuelTankSelect: 'fuelTankCapacitySelect',
                                drivetrainSelect: 'drivetrainSelect'
                            };
                        }
                        window.modelVariationsHelper.clearVariationDropdowns(options);
                    }
                });
            }
        });
    }

    /**
     * Populate locations/districts dropdown
     */
    populateLocationsDropdown() {
        const locationSelects = document.querySelectorAll('select[name="location_id"], #carLocation, #businessLocation, #locationSelect, #profileCity');

        locationSelects.forEach(select => {
            // Clear existing options except first
            while (select.options.length > 1) {
                select.remove(1);
            }

            // Group by region if available
            const byRegion = {};
            this.locations.forEach(loc => {
                const region = loc.region || 'Other';
                if (!byRegion[region]) byRegion[region] = [];
                byRegion[region].push(loc);
            });

            // Add locations grouped by region
            Object.keys(byRegion).sort().forEach(region => {
                const optgroup = document.createElement('optgroup');
                optgroup.label = region;

                byRegion[region].forEach(loc => {
                    const option = document.createElement('option');
                    option.value = loc.id;
                    option.textContent = loc.name;
                    optgroup.appendChild(option);
                });

                select.appendChild(optgroup);
            });
        });
    }

    /**
     * Populate year dropdown (last 35 years)
     */
    populateYearDropdown() {
        const yearSelects = document.querySelectorAll('select[name="year"], #carYear, #yearSelect');
        const currentYear = new Date().getFullYear();
        const startYear = 1990;

        yearSelects.forEach(select => {
            // Clear existing options except first (if it exists)
            while (select.options.length > 1) {
                select.remove(1);
            }

            // Add years in descending order
            for (let year = currentYear + 1; year >= startYear; year--) {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                select.appendChild(option);
            }
        });
    }

    /**
     * Setup image preview for file inputs
     */
    setupImagePreview(fileInputId, previewContainerId, maxFiles = 10) {
        const fileInput = document.getElementById(fileInputId);
        const previewContainer = document.getElementById(previewContainerId);

        if (!fileInput || !previewContainer) return;

        fileInput.addEventListener('change', (e) => {
            previewContainer.innerHTML = '';
            const files = Array.from(e.target.files).slice(0, maxFiles);

            if (files.length > maxFiles) {
                alert(`Maximum ${maxFiles} images allowed. Only first ${maxFiles} will be used.`);
            }

            files.forEach((file, index) => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const imageCard = document.createElement('div');
                        imageCard.className = 'image-preview-card';
                        imageCard.innerHTML = `
                            <img src="${event.target.result}" alt="Preview ${index + 1}">
                            <div class="image-preview-overlay">
                                <span class="image-preview-number">${index + 1}</span>
                                ${index === 0 ? '<span class="image-featured-badge"><i class="fas fa-star"></i> Featured</span>' : ''}
                            </div>
                            <button type="button" class="image-preview-remove" onclick="this.parentElement.remove()">
                                <i class="fas fa-times"></i>
                            </button>
                        `;
                        previewContainer.appendChild(imageCard);
                    };
                    reader.readAsDataURL(file);
                }
            });
        });
    }

    /**
     * Display current images with management options
     */
    displayCurrentImages(images, containerId, onSetFeatured, onDelete) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        if (!images || images.length === 0) {
            container.innerHTML = '<p class="text-muted">No images uploaded yet</p>';
            return;
        }

        images.forEach((image) => {
            const imageCard = document.createElement('div');
            imageCard.className = 'image-preview-card';
            imageCard.dataset.imageId = image.id;

            const imageUrl = image.filename ?
                `${CONFIG.BASE_URL}uploads/${image.filename}` :
                `${CONFIG.API_URL}?action=image&id=${image.id}`;

            imageCard.innerHTML = `
                <img src="${imageUrl}" alt="Car image">
                <div class="image-preview-overlay">
                    ${image.is_primary == 1 || image.id == image.featured_image_id ?
                        '<span class="image-featured-badge"><i class="fas fa-star"></i> Featured</span>' :
                        ''}
                </div>
                <div class="image-actions">
                    <button type="button" class="btn-icon btn-set-featured ${image.is_primary == 1 ? 'active' : ''}"
                            onclick="event.preventDefault(); (${onSetFeatured})(${image.id})"
                            title="Set as featured image">
                        <i class="fas fa-star"></i>
                    </button>
                    <button type="button" class="btn-icon btn-delete"
                            onclick="event.preventDefault(); if(confirm('Delete this image?')) (${onDelete})(${image.id})"
                            title="Delete image">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            container.appendChild(imageCard);
        });
    }
}

// Create global instance
const formHelpers = new FormHelpers();

// Initialize on DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        formHelpers.initializeDropdowns();
    });
} else {
    formHelpers.initializeDropdowns();
}

/**
 * Model Variations Helper
 * Handles loading and populating dropdowns for engine capacity, fuel tank, drivetrain, and transmission
 */

class ModelVariationsHelper {
    constructor() {
        this.variationsCache = new Map();
    }

    /**
     * Load variations for a model and populate dropdowns
     */
    async loadModelVariations(modelId, options = {}) {
        if (!modelId) {
            this.clearVariationDropdowns(options);
            return;
        }

        try {
            console.log('Loading variations for model ID:', modelId);
            const response = await fetch(`${CONFIG.API_URL}?action=get_model_engine_variations&model_id=${modelId}`);
            const data = await response.json();

            console.log('Variations API response:', data);

            if (data.success && data.engine_sizes && data.engine_sizes.length > 0) {
                console.log('Found engine sizes:', data.engine_sizes);
                this.populateVariationDropdowns(data, options);
            } else {
                console.warn('No variations found or API returned no engine sizes');
                this.clearVariationDropdowns(options);
            }
        } catch (error) {
            console.error('Error loading model variations:', error);
            this.clearVariationDropdowns(options);
        }
    }

    /**
     * Populate dropdowns with variation data
     */
    populateVariationDropdowns(data, options = {}) {
        const {
            engineSizeSelect = 'engine_size',
            fuelTankSelect = 'fuel_tank_capacity',
            drivetrainSelect = 'drivetrain',
            transmissionSelect = 'transmission'
        } = options;

        // Populate Engine Size dropdown
        const engineSelect = this.getSelectElement(engineSizeSelect);
        console.log('Engine size select element:', engineSelect, 'for identifier:', engineSizeSelect);
        
        if (data.engine_sizes && data.engine_sizes.length > 0) {
            if (engineSelect) {
                engineSelect.innerHTML = '<option value="">Select Engine Capacity...</option>';
                data.engine_sizes.forEach(size => {
                    if (size !== null && size !== '') {
                        const option = document.createElement('option');
                        option.value = size;
                        option.textContent = `${size}L`;
                        engineSelect.appendChild(option);
                    }
                });
                engineSelect.disabled = false;
                console.log('✅ Populated engine size dropdown with', data.engine_sizes.length, 'options:', data.engine_sizes);
            } else {
                console.error('❌ Engine size select element not found for:', engineSizeSelect);
                // Try alternative selectors
                const altSelect = document.querySelector(`select[name="engine_size"]`);
                if (altSelect) {
                    console.log('Found alternative engine size select by name');
                    altSelect.innerHTML = '<option value="">Select Engine Capacity...</option>';
                    data.engine_sizes.forEach(size => {
                        if (size !== null && size !== '') {
                            const option = document.createElement('option');
                            option.value = size;
                            option.textContent = `${size}L`;
                            altSelect.appendChild(option);
                        }
                    });
                    altSelect.disabled = false;
                }
            }
        } else {
            console.warn('⚠️ No engine sizes in data. Response:', data);
            if (engineSelect) {
                engineSelect.innerHTML = '<option value="">No engine sizes available for this model</option>';
                engineSelect.disabled = true;
            }
        }

        // Populate Fuel Tank Capacity dropdown
        if (data.fuel_tank_capacities && data.fuel_tank_capacities.length > 0) {
            const fuelTankSelectEl = this.getSelectElement(fuelTankSelect);
            if (fuelTankSelectEl) {
                fuelTankSelectEl.innerHTML = '<option value="">Select Fuel Tank Capacity...</option>';
                data.fuel_tank_capacities.forEach(capacity => {
                    const option = document.createElement('option');
                    option.value = capacity;
                    option.textContent = `${capacity}L`;
                    fuelTankSelectEl.appendChild(option);
                });
                fuelTankSelectEl.disabled = false;
            }
        }

        // Populate Drivetrain dropdown
        if (data.drive_types && data.drive_types.length > 0) {
            const drivetrainSelectEl = this.getSelectElement(drivetrainSelect);
            if (drivetrainSelectEl) {
                drivetrainSelectEl.innerHTML = '<option value="">Select Drivetrain...</option>';
                data.drive_types.forEach(driveType => {
                    const option = document.createElement('option');
                    option.value = driveType;
                    option.textContent = this.formatDriveType(driveType);
                    drivetrainSelectEl.appendChild(option);
                });
                drivetrainSelectEl.disabled = false;
            }
        }

        // Populate Transmission dropdown (if not already populated)
        if (data.transmissions && data.transmissions.length > 0) {
            const transmissionSelectEl = this.getSelectElement(transmissionSelect);
            if (transmissionSelectEl && transmissionSelectEl.options.length <= 1) {
                transmissionSelectEl.innerHTML = '<option value="">Select Transmission...</option>';
                data.transmissions.forEach(trans => {
                    const option = document.createElement('option');
                    option.value = trans;
                    option.textContent = this.formatTransmission(trans);
                    transmissionSelectEl.appendChild(option);
                });
            }
        }
    }

    /**
     * Clear variation dropdowns
     */
    clearVariationDropdowns(options = {}) {
        const {
            engineSizeSelect = 'engine_size',
            fuelTankSelect = 'fuel_tank_capacity',
            drivetrainSelect = 'drivetrain',
            transmissionSelect = 'transmission'
        } = options;

        [engineSizeSelect, fuelTankSelect, drivetrainSelect].forEach(selectId => {
            const select = this.getSelectElement(selectId);
            if (select) {
                select.innerHTML = '<option value="">Select Model First...</option>';
                select.disabled = true;
            }
        });
    }

    /**
     * Get select element by ID or name
     */
    getSelectElement(identifier) {
        if (typeof identifier === 'string') {
            // Try by ID first
            let element = document.getElementById(identifier);
            if (!element) {
                // Try by name
                element = document.querySelector(`select[name="${identifier}"]`);
            }
            return element;
        }
        return identifier; // Assume it's already an element
    }

    /**
     * Format drive type for display
     */
    formatDriveType(driveType) {
        const formats = {
            'fwd': 'Front Wheel Drive (FWD)',
            'rwd': 'Rear Wheel Drive (RWD)',
            'awd': 'All Wheel Drive (AWD)',
            '4wd': 'Four Wheel Drive (4WD)'
        };
        return formats[driveType] || driveType.toUpperCase();
    }

    /**
     * Format transmission for display
     */
    formatTransmission(transmission) {
        const formats = {
            'manual': 'Manual',
            'automatic': 'Automatic',
            'cvt': 'CVT (Continuously Variable)',
            'semi-automatic': 'Semi-Automatic',
            'dct': 'DCT (Dual Clutch)'
        };
        return formats[transmission] || transmission.charAt(0).toUpperCase() + transmission.slice(1);
    }

    /**
     * Setup model change listener
     */
    setupModelChangeListener(modelSelectId, options = {}) {
        const modelSelect = this.getSelectElement(modelSelectId);
        if (!modelSelect) return;

        modelSelect.addEventListener('change', async (e) => {
            const modelId = e.target.value;
            await this.loadModelVariations(modelId, options);
        });
    }
}

// Create global instance
window.modelVariationsHelper = new ModelVariationsHelper();


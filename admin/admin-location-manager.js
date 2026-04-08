/**
 * MotorLink Admin Location Dropdown Manager
 * Automatically populates location dropdowns in admin panel
 */

class AdminLocationManager {
    constructor() {
        this.locations = [];
        this.loaded = false;
        this.init();
    }

    async init() {
        await this.loadLocations();
        this.populateAllLocationDropdowns();
    }

    async loadLocations() {
        try {
            // Use admin API endpoint
            const apiUrl = typeof admin !== 'undefined' && admin.API_URL ? 
                admin.API_URL : 'admin-api.php';
            
            const separator = apiUrl.includes('?') ? '&' : '?';
            const response = await fetch(`${apiUrl}${separator}action=get_locations`);
            const data = await response.json();
            
            if (data.success && data.locations) {
                this.locations = data.locations;
                this.loaded = true;
            } else {
            }
        } catch (error) {
        }
    }

    populateAllLocationDropdowns() {
        if (!this.loaded) {
            return;
        }

        // Find all location select elements in admin panel
        const locationSelects = document.querySelectorAll(
            'select[name="location"], select#location, select#locationSelect, ' +
            'select.location-select, select[name="location_id"]'
        );
        
        locationSelects.forEach(select => {
            this.populateDropdown(select);
        });

    }

    populateDropdown(selectElement, selectedValue = null) {
        if (!selectElement) return;

        // Save the current value if exists
        const currentValue = selectedValue || selectElement.value;
        
        // Clear existing options except the first one (placeholder)
        const placeholder = selectElement.options[0];
        selectElement.innerHTML = '';
        
        // Re-add placeholder
        if (placeholder && (placeholder.value === '' || placeholder.text.includes('Select') || placeholder.text.includes('Choose'))) {
            selectElement.appendChild(placeholder);
        } else {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select Location';
            selectElement.appendChild(defaultOption);
        }

        // Group locations by region if region data exists
        const hasRegions = this.locations.some(loc => loc.region);
        
        if (hasRegions) {
            // Group by region
            const regionGroups = {};
            this.locations.forEach(location => {
                const region = location.region || 'Other';
                if (!regionGroups[region]) {
                    regionGroups[region] = [];
                }
                regionGroups[region].push(location);
            });

            // Add options grouped by region
            Object.keys(regionGroups).sort().forEach(region => {
                const optgroup = document.createElement('optgroup');
                optgroup.label = region;
                
                regionGroups[region].forEach(location => {
                    const option = document.createElement('option');
                    option.value = location.id;
                    option.textContent = location.name;
                    option.dataset.region = location.region || '';
                    option.dataset.district = location.district || '';
                    optgroup.appendChild(option);
                });
                
                selectElement.appendChild(optgroup);
            });
        } else {
            // Add all locations without grouping
            this.locations.forEach(location => {
                const option = document.createElement('option');
                option.value = location.id;
                option.textContent = location.name;
                option.dataset.region = location.region || '';
                option.dataset.district = location.district || '';
                selectElement.appendChild(option);
            });
        }

        // Restore selected value if it exists
        if (currentValue) {
            selectElement.value = currentValue;
        }
    }

    getLocationById(id) {
        return this.locations.find(loc => loc.id == id);
    }

    getLocationsByRegion(region) {
        return this.locations.filter(loc => loc.region === region);
    }

    // Method to manually populate a specific dropdown
    populateSelect(selectElement, selectedValue = null) {
        if (this.loaded) {
            this.populateDropdown(selectElement, selectedValue);
        } else {
            // Wait for locations to load
            setTimeout(() => this.populateSelect(selectElement, selectedValue), 100);
        }
    }
}

// Create global instance for admin
let adminLocationManager;

// Auto-initialize when DOM is ready (after admin dashboard loads)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait a bit for admin panel to initialize
        setTimeout(() => {
            adminLocationManager = new AdminLocationManager();
        }, 500);
    });
} else {
    setTimeout(() => {
        adminLocationManager = new AdminLocationManager();
    }, 500);
}

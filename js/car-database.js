/**
 * MotorLink VIN Decoder
 * Uses MotorLink backend middleware (action=nhtsa) which proxies NHTSA vPIC.
 */

class VINDecoder {
    constructor() {
        this.bindEvents();
    }

    bindEvents() {
        const vinInput = document.getElementById('vinInput');
        const vinDecodeBtn = document.getElementById('vinDecodeBtn');

        if (vinDecodeBtn) {
            vinDecodeBtn.addEventListener('click', () => this.decodeVIN());
        }

        if (vinInput) {
            vinInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.decodeVIN();
                }
            });

            vinInput.addEventListener('input', (e) => {
                e.target.value = e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, '')
                    .slice(0, 17);
            });
        }
    }

    validateVin(vin) {
        return /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
    }

    async decodeVIN() {
        const vinInput = document.getElementById('vinInput');
        const vin = (vinInput?.value || '').trim().toUpperCase();

        if (!this.validateVin(vin)) {
            alert('Please enter a valid 17-character VIN (letters I, O, Q are not allowed).');
            return;
        }

        const resultsContainer = document.getElementById('vinResultsContainer');
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = this.loadingMarkup();

        try {
            const url = `${CONFIG.API_URL}?action=nhtsa&endpoint=decode&vin=${encodeURIComponent(vin)}`;
            const response = await fetch(url, {
                method: 'GET',
                credentials: CONFIG.USE_CREDENTIALS ? 'include' : 'same-origin'
            });

            const payload = await response.json();
            if (!response.ok || !payload?.success || !payload?.vehicle) {
                throw new Error(payload?.message || `Decode failed (HTTP ${response.status})`);
            }

            resultsContainer.innerHTML = this.resultsMarkup(payload.vehicle, payload.meta || {});
        } catch (error) {
            console.error('VIN decode error:', error);
            resultsContainer.innerHTML = this.errorMarkup(error.message || 'VIN decode failed');
        }
    }

    loadingMarkup() {
        return `
            <div class="specs-card">
                <div style="text-align: center; padding: 52px 20px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 44px; color: var(--primary-green); margin-bottom: 14px;"></i>
                    <p style="color: #444; font-size: 1rem; margin: 0;">Decoding VIN via secure middleware...</p>
                    <p style="color: #777; font-size: 0.9rem; margin-top: 8px;">Source: NHTSA vPIC (free public API)</p>
                </div>
            </div>
        `;
    }

    errorMarkup(message) {
        return `
            <div class="specs-card">
                <div style="text-align: center; padding: 52px 20px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 44px; color: #dc2626; margin-bottom: 14px;"></i>
                    <h3 style="margin: 0 0 10px 0; color: #222;">VIN Decode Failed</h3>
                    <p style="color: #555; margin: 0;">${message}</p>
                </div>
            </div>
        `;
    }

    specItem(label, value) {
        if (!value || value === 'N/A') {
            return '';
        }

        return `
            <div class="spec-item">
                <span class="spec-label">${label}:</span>
                <span class="spec-value">${value}</span>
            </div>
        `;
    }

    resultsMarkup(vehicle, meta) {
        return `
            <div class="specs-card">
                <div class="specs-header">
                    <h2><i class="fas fa-check-circle" style="color: #0f9d58; margin-right: 10px;"></i>VIN Decoder Results</h2>
                    <p class="subtitle">VIN: <strong>${vehicle.vin || 'N/A'}</strong></p>
                    <p style="font-size: 0.85rem; color: #666; margin-top: 8px;">
                        <i class="fas fa-database"></i> Provider: ${meta.provider || 'NHTSA vPIC'}
                    </p>
                </div>

                <div class="specs-grid">
                    <div class="spec-group">
                        <h3><i class="fas fa-car"></i> Vehicle Identity</h3>
                        ${this.specItem('Make', vehicle.make)}
                        ${this.specItem('Model', vehicle.model)}
                        ${this.specItem('Year', vehicle.year)}
                        ${this.specItem('Trim', vehicle.trim)}
                        ${this.specItem('Series', vehicle.series)}
                        ${this.specItem('Body Class', vehicle.body_class)}
                        ${this.specItem('Vehicle Type', vehicle.vehicle_type)}
                    </div>

                    <div class="spec-group">
                        <h3><i class="fas fa-industry"></i> Manufacturer & Plant</h3>
                        ${this.specItem('Manufacturer', vehicle.manufacturer)}
                        ${this.specItem('Plant Country', vehicle.plant_country)}
                        ${this.specItem('Plant City', vehicle.plant_city)}
                    </div>

                    <div class="spec-group">
                        <h3><i class="fas fa-cog"></i> Powertrain</h3>
                        ${this.specItem('Engine Cylinders', vehicle.engine_cylinders)}
                        ${this.specItem('Displacement (L)', vehicle.engine_displacement_l)}
                        ${this.specItem('Fuel Type', vehicle.fuel_type)}
                        ${this.specItem('Drive Type', vehicle.drive_type)}
                        ${this.specItem('Transmission', vehicle.transmission_style)}
                        ${this.specItem('Transmission Speeds', vehicle.transmission_speeds)}
                    </div>

                    <div class="spec-group">
                        <h3><i class="fas fa-ruler-combined"></i> Chassis</h3>
                        ${this.specItem('Doors', vehicle.doors)}
                        ${this.specItem('GVWR', vehicle.gvwr)}
                    </div>
                </div>
            </div>
        `;
    }
}

let vinDecoder;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        vinDecoder = new VINDecoder();
    });
} else {
    vinDecoder = new VINDecoder();
}

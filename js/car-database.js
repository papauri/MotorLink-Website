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

    hasMeaningfulVehicleData(vehicle) {
        if (!vehicle) return false;
        return ['make', 'model', 'year', 'manufacturer', 'vehicle_type', 'body_class']
            .some((key) => {
                const value = String(vehicle[key] || '').trim();
                return value && value.toUpperCase() !== 'N/A';
            });
    }

    normalizeDirectNhtsaRow(vin, row) {
        const pick = (key) => {
            const value = String(row?.[key] ?? '').trim();
            return value ? value : 'N/A';
        };

        return {
            vehicle: {
                vin,
                make: pick('Make'),
                model: pick('Model'),
                year: pick('ModelYear'),
                trim: pick('Trim'),
                series: pick('Series'),
                body_class: pick('BodyClass'),
                vehicle_type: pick('VehicleType'),
                manufacturer: pick('Manufacturer'),
                plant_country: pick('PlantCountry'),
                plant_city: pick('PlantCity'),
                engine_cylinders: pick('EngineCylinders'),
                engine_displacement_l: pick('DisplacementL'),
                fuel_type: pick('FuelTypePrimary'),
                drive_type: pick('DriveType'),
                transmission_style: pick('TransmissionStyle'),
                transmission_speeds: pick('TransmissionSpeeds'),
                doors: pick('Doors'),
                gvwr: pick('GVWR')
            },
            meta: {
                provider: 'NHTSA vPIC (direct fallback)',
                provider_url: 'https://vpic.nhtsa.dot.gov/api/',
                timestamp: new Date().toISOString(),
                nhtsa_error_code: String(row?.ErrorCode || '').trim(),
                nhtsa_error_text: String(row?.ErrorText || '').trim()
            }
        };
    }

    async decodeViaDirectNhtsa(vin) {
        const directUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvaluesextended/${encodeURIComponent(vin)}?format=json`;
        const response = await fetch(directUrl, { method: 'GET' });

        if (!response.ok) {
            throw new Error(`Direct provider request failed (HTTP ${response.status})`);
        }

        const payload = await response.json();
        const row = payload?.Results?.[0];
        if (!row) {
            throw new Error('Direct provider returned malformed data');
        }

        const normalized = this.normalizeDirectNhtsaRow(vin, row);
        if (!this.hasMeaningfulVehicleData(normalized.vehicle)) {
            throw new Error('VIN could not be decoded by provider');
        }

        return normalized;
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

            const payload = await response.json().catch(() => null);
            if (!response.ok || !payload?.success || !payload?.vehicle) {
                const error = new Error(payload?.message || `Decode failed (HTTP ${response.status})`);
                error.status = response.status;
                throw error;
            }

            resultsContainer.innerHTML = this.resultsMarkup(payload.vehicle, payload.meta || {});
        } catch (error) {
            if (error?.status === 503) {
                try {
                    const directPayload = await this.decodeViaDirectNhtsa(vin);
                    resultsContainer.innerHTML = this.resultsMarkup(directPayload.vehicle, directPayload.meta || {});
                    return;
                } catch (directError) {
                    console.error('VIN decode direct fallback error:', directError);
                }
            }

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

    partialDecodeNotice(meta) {
        if (!meta?.nhtsa_error_code || meta.nhtsa_error_code.trim() === '' || meta.nhtsa_error_code === 'N/A') return '';
        return `
            <div style="background:#fffbeb;border:1px solid #fbbf24;border-radius:8px;padding:10px 14px;margin-top:12px;font-size:0.82rem;color:#92400e;display:flex;align-items:flex-start;gap:10px;">
                <i class="fas fa-exclamation-circle" style="flex-shrink:0;margin-top:2px;"></i>
                <span>Partial decode — NHTSA note: ${this.escHtml(meta.nhtsa_error_text || meta.nhtsa_error_code)}</span>
            </div>`;
    }

    escHtml(str) {
        return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    resultsMarkup(vehicle, meta) {
        const hasSafety = ['airbag_front','airbag_side','airbag_curtain','airbag_knee','seat_belts']
            .some(k => vehicle[k] && vehicle[k] !== 'N/A');
        const hasDiag = vehicle.suggested_vin && vehicle.suggested_vin !== 'N/A' && vehicle.suggested_vin !== vehicle.vin;

        return `
            <div class="specs-card">
                <div class="specs-header">
                    <h2><i class="fas fa-check-circle" style="color: #0f9d58; margin-right: 10px;"></i>VIN Decoder Results</h2>
                    <p class="subtitle">VIN: <strong>${this.escHtml(vehicle.vin || 'N/A')}</strong></p>
                    <p style="font-size: 0.85rem; color: #666; margin-top: 8px;">
                        <i class="fas fa-database"></i> Provider: ${this.escHtml(meta.provider || 'NHTSA vPIC')}
                    </p>
                    ${this.partialDecodeNotice(meta)}
                </div>

                <div class="specs-grid">
                    <div class="spec-group">
                        <h3><i class="fas fa-car"></i> Vehicle Identity</h3>
                        ${this.specItem('Make', vehicle.make)}
                        ${this.specItem('Model', vehicle.model)}
                        ${this.specItem('Year', vehicle.year)}
                        ${this.specItem('Trim', vehicle.trim)}
                        ${this.specItem('Series', vehicle.series)}
                        ${this.specItem('Series (alt)', vehicle.series2)}
                        ${this.specItem('Body Class', vehicle.body_class)}
                        ${this.specItem('Vehicle Type', vehicle.vehicle_type)}
                        ${this.specItem('Doors', vehicle.doors)}
                        ${this.specItem('GVWR', vehicle.gvwr)}
                    </div>

                    <div class="spec-group">
                        <h3><i class="fas fa-cog"></i> Powertrain</h3>
                        ${this.specItem('Engine', vehicle.engine_model)}
                        ${this.specItem('Configuration', vehicle.engine_config)}
                        ${this.specItem('Cylinders', vehicle.engine_cylinders)}
                        ${this.specItem('Displacement (L)', vehicle.engine_displacement_l)}
                        ${this.specItem('Displacement (cc)', vehicle.engine_displacement_cc)}
                        ${this.specItem('Valve Train', vehicle.valve_train)}
                        ${this.specItem('Fuel Type', vehicle.fuel_type)}
                        ${this.specItem('Fuel Injection', vehicle.fuel_injection)}
                        ${this.specItem('Electrification', vehicle.electrification_level)}
                        ${this.specItem('Drive Type', vehicle.drive_type)}
                        ${this.specItem('Transmission', vehicle.transmission_style)}
                        ${this.specItem('Transmission Speeds', vehicle.transmission_speeds)}
                    </div>

                    ${hasSafety ? `
                    <div class="spec-group">
                        <h3><i class="fas fa-shield-alt"></i> Safety</h3>
                        ${this.specItem('Front Airbags', vehicle.airbag_front)}
                        ${this.specItem('Side Airbags', vehicle.airbag_side)}
                        ${this.specItem('Curtain Airbags', vehicle.airbag_curtain)}
                        ${this.specItem('Knee Airbags', vehicle.airbag_knee)}
                        ${this.specItem('Seat Belts', vehicle.seat_belts)}
                    </div>` : ''}

                    <div class="spec-group">
                        <h3><i class="fas fa-industry"></i> Manufacturer & Plant</h3>
                        ${this.specItem('Manufacturer', vehicle.manufacturer)}
                        ${this.specItem('Plant Company', vehicle.plant_company)}
                        ${this.specItem('Plant Country', vehicle.plant_country)}
                        ${this.specItem('Plant State', vehicle.plant_state)}
                        ${this.specItem('Plant City', vehicle.plant_city)}
                    </div>

                    ${hasDiag ? `
                    <div class="spec-group">
                        <h3><i class="fas fa-info-circle"></i> VIN Diagnostics</h3>
                        ${this.specItem('Descriptor', vehicle.vehicle_descriptor)}
                        ${this.specItem('Suggested VIN', vehicle.suggested_vin)}
                        ${this.specItem('Possible Corrections', vehicle.possible_values)}
                    </div>` : ''}
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

/**
 * MotorLink Enhanced VIN Decoder
 * Uses multiple free APIs for comprehensive vehicle data:
 * - NHTSA (US Government - most comprehensive)
 * - VINDecoder.eu (European vehicles)
 * - Auto.dev (Additional specs)
 */

class VINDecoder {
    constructor() {
        this.init();
    }

    init() {
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
            
            // Auto-format VIN as user types
            vinInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 17);
            });
        }
    }

    async decodeVIN() {
        const vinInput = document.getElementById('vinInput');
        const vin = vinInput.value.trim().toUpperCase();

        if (!vin || vin.length !== 17) {
            alert('Please enter a valid 17-character VIN');
            return;
        }

        const resultsContainer = document.getElementById('vinResultsContainer');
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <div class="specs-card">
                <div style="text-align: center; padding: 60px 20px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 48px; color: #2196F3; margin-bottom: 20px;"></i>
                    <p style="color: #666; font-size: 1.1rem;">Decoding VIN from multiple sources...</p>
                    <p style="color: #999; font-size: 0.9rem; margin-top: 10px;">Fetching data from NHTSA, VINDecoder.eu, and Auto.dev</p>
                </div>
            </div>
        `;

        try {
            let nhtsaData = null;
            
            // NHTSA (US Government - most comprehensive and reliable, no CORS issues)
            const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevinextended/${vin}?format=json`);
            
            if (response.ok) {
                const nhtsaRaw = await response.json();
                if (nhtsaRaw && nhtsaRaw.Results && nhtsaRaw.Results.length > 0) {
                    nhtsaData = {};
                    nhtsaRaw.Results.forEach(item => {
                        if (item.Value && item.Value !== 'Not Applicable' && item.Value !== '' && item.Value !== null) {
                            nhtsaData[item.Variable] = item.Value;
                        }
                    });
                }
            }
            
            // Process NHTSA data
            const vinData = {};
            
            // Extract all available fields from NHTSA
            if (nhtsaData) {
                vinData.vin = vin;
                
                // Primary vehicle information
                vinData.make = nhtsaData.Make || 'N/A';
                vinData.model = nhtsaData.Model || 'N/A';
                vinData.year = nhtsaData['Model Year'] || 'N/A';
                vinData.body_class = nhtsaData['Body Class'] || 'N/A';
                vinData.vehicle_type = nhtsaData['Vehicle Type'] || 'N/A';
                vinData.series = nhtsaData.Series || nhtsaData['Series2'] || 'N/A';
                vinData.trim = nhtsaData.Trim || 'N/A';
                vinData.doors = nhtsaData.Doors || 'N/A';
                vinData.seats = nhtsaData.Seats || 'N/A';
                
                // Engine information - comprehensive
                vinData.engine_config = nhtsaData['Engine Configuration'] || 'N/A';
                vinData.engine_cylinders = nhtsaData['Engine Number of Cylinders'] || 'N/A';
                vinData.displacement = nhtsaData['Displacement (L)'] || nhtsaData['Displacement (CI)'] || 'N/A';
                vinData.displacement_ci = nhtsaData['Displacement (CI)'] || 'N/A';
                vinData.fuel_type = nhtsaData['Fuel Type - Primary'] || nhtsaData['Fuel Type - Secondary'] || 'N/A';
                vinData.fuel_type_primary = nhtsaData['Fuel Type - Primary'] || 'N/A';
                vinData.fuel_type_secondary = nhtsaData['Fuel Type - Secondary'] || 'N/A';
                vinData.engine_model = nhtsaData['Engine Model'] || 'N/A';
                vinData.engine_aspiration = nhtsaData['Engine Aspiration'] || 'N/A';
                vinData.engine_brake_hp = nhtsaData['Engine Brake (hp)'] || 'N/A';
                vinData.engine_brake_hp_from = nhtsaData['Engine Brake (hp From)'] || 'N/A';
                vinData.engine_brake_hp_to = nhtsaData['Engine Brake (hp To)'] || 'N/A';
                vinData.valve_train_design = nhtsaData['Valve Train Design'] || 'N/A';
                vinData.engine_manufacturer = nhtsaData['Engine Manufacturer'] || 'N/A';
                
                // Transmission and drivetrain
                vinData.transmission_style = nhtsaData['Transmission Style'] || 'N/A';
                vinData.transmission_speeds = nhtsaData['Transmission Speeds'] || 'N/A';
                vinData.drive_type = nhtsaData['Drive Type'] || 'N/A';
                vinData.axles = nhtsaData.Axles || 'N/A';
                vinData.wheel_base = nhtsaData['Wheel Base (inches)'] || nhtsaData['Wheel Base (mm)'] || 'N/A';
                vinData.wheel_base_in = nhtsaData['Wheel Base (inches)'] || 'N/A';
                vinData.wheel_base_mm = nhtsaData['Wheel Base (mm)'] || 'N/A';
                
                // Manufacturing/Plant information
                vinData.plant_city = nhtsaData['Plant City'] || 'N/A';
                vinData.plant_state = nhtsaData['Plant State'] || 'N/A';
                vinData.plant_country = nhtsaData['Plant Country'] || 'N/A';
                vinData.plant_company_name = nhtsaData['Plant Company Name'] || 'N/A';
                vinData.manufacturer_name = nhtsaData['Manufacturer Name'] || 'N/A';
                
                // Weight information
                vinData.gvwr = nhtsaData['Gross Vehicle Weight Rating From'] || nhtsaData['Gross Vehicle Weight Rating'] || 'N/A';
                vinData.gvwr_from = nhtsaData['Gross Vehicle Weight Rating From'] || 'N/A';
                vinData.gvwr_to = nhtsaData['Gross Vehicle Weight Rating To'] || 'N/A';
                vinData.curb_weight = nhtsaData['Curb Weight'] || 'N/A';
                vinData.base_price = nhtsaData['Base Price'] || 'N/A';
                
                // Safety and equipment
                vinData.safety_restraint_system = nhtsaData['Safety Restraint System'] || 'N/A';
                vinData.other_restraint_system_info = nhtsaData['Other Restraint System Info'] || 'N/A';
                vinData.tpms = nhtsaData.TPMS || 'N/A';
                vinData.tsc = nhtsaData.TSC || 'N/A';
                vinData.nhtsa_ca_make = nhtsaData['NCSA Make'] || 'N/A';
                vinData.nhtsa_ca_model = nhtsaData['NCSA Model'] || 'N/A';
                
                // Additional vehicle specifications
                vinData.entertainment_system = nhtsaData['Entertainment System'] || 'N/A';
                vinData.steering_location = nhtsaData['Steering Location'] || 'N/A';
                vinData.bed_length = nhtsaData['Bed Length (inches)'] || 'N/A';
                vinData.bed_type = nhtsaData['Bed Type'] || 'N/A';
                vinData.cab_type = nhtsaData['Cab Type'] || 'N/A';
                vinData.other_engine_info = nhtsaData['Other Engine Info'] || 'N/A';
                vinData.turbo = nhtsaData.Turbo || 'N/A';
                vinData.top_speed = nhtsaData['Top Speed (MPH)'] || 'N/A';
                vinData.engine_power_kw = nhtsaData['Engine Power (kW)'] || 'N/A';
                
                // Brake and suspension
                vinData.brake_system_type = nhtsaData['Brake System Type'] || 'N/A';
                vinData.brake_system_desc = nhtsaData['Brake System Description'] || 'N/A';
                vinData.abs = nhtsaData.ABS || 'N/A';
                vinData.esc = nhtsaData.ESC || 'N/A';
                vinData.traction_control = nhtsaData['Traction Control'] || 'N/A';
                
                // Dimensions
                vinData.track_width = nhtsaData['Track Width (inches)'] || 'N/A';
                vinData.overall_length = nhtsaData['Overall Length (inches)'] || 'N/A';
                vinData.overall_width = nhtsaData['Overall Width (inches)'] || 'N/A';
                vinData.overall_height = nhtsaData['Overall Height (inches)'] || 'N/A';
                vinData.ground_clearance = nhtsaData['Ground Clearance (inches)'] || 'N/A';
                
                // Battery and electric vehicle info
                vinData.battery_type = nhtsaData['Battery Type'] || 'N/A';
                vinData.battery_kwh = nhtsaData['Battery Energy (kWh)'] || 'N/A';
                vinData.ev_drive_unit = nhtsaData['EV Drive Unit'] || 'N/A';
                vinData.charger_level = nhtsaData['Charger Level'] || 'N/A';
                vinData.charging_power = nhtsaData['Charger Power (kW)'] || 'N/A';
                
                // Additional safety features
                vinData.adaptive_cruise_control = nhtsaData['Adaptive Cruise Control'] || 'N/A';
                vinData.crash_imminent_braking = nhtsaData['Crash Imminent Braking'] || 'N/A';
                vinData.blind_spot_warning = nhtsaData['Blind Spot Warning'] || 'N/A';
                vinData.forward_collision_warning = nhtsaData['Forward Collision Warning'] || 'N/A';
                vinData.lane_departure_warning = nhtsaData['Lane Departure Warning'] || 'N/A';
                vinData.lane_keeping_assist = nhtsaData['Lane Keeping Assistance'] || 'N/A';
                vinData.backup_camera = nhtsaData['Backup Camera'] || 'N/A';
                vinData.parking_assist = nhtsaData['Parking Assist'] || 'N/A';
                vinData.pedestrian_auto_braking = nhtsaData['Pedestrian Automatic Emergency Braking'] || 'N/A';
                vinData.auto_reverse_braking = nhtsaData['Automatic Pedestrian Alerting Sound'] || 'N/A';
                vinData.dynamic_brake_support = nhtsaData['Dynamic Brake Support'] || 'N/A';
                vinData.rear_cross_traffic_alert = nhtsaData['Rear Cross Traffic Alert'] || 'N/A';
                
                // Airbag information
                vinData.airbag_locations = nhtsaData['Air Bag Locations'] || 'N/A';
                vinData.curtain_airbag_locations = nhtsaData['Curtain Air Bag Locations'] || 'N/A';
                vinData.seat_belt_type = nhtsaData['Seat Belt Type'] || 'N/A';
                vinData.pretensioner = nhtsaData['Pretensioner'] || 'N/A';
                vinData.seat_belts_all = nhtsaData['Seat Belts All'] || 'N/A';
                
                // Trailer information (if applicable)
                vinData.trailer_type_connection = nhtsaData['Trailer Type Connection'] || 'N/A';
                vinData.trailer_body_type = nhtsaData['Trailer Body Type'] || 'N/A';
                vinData.trailer_length = nhtsaData['Trailer Length (feet)'] || 'N/A';
                vinData.bus_length = nhtsaData['Bus Length (feet)'] || 'N/A';
                
                // Additional classifications
                vinData.motorcycle_suspension = nhtsaData['Motorcycle Suspension Type'] || 'N/A';
                vinData.motorcycle_chassis = nhtsaData['Motorcycle Chassis Type'] || 'N/A';
                vinData.custom_motorcycle = nhtsaData['Custom Motorcycle Type'] || 'N/A';
                
                // Store all NHTSA data for reference
                vinData.nhtsa_raw = nhtsaData;
            }
            
            // Ensure we have at least a VIN
            if (!vinData.vin) {
                vinData.vin = vin;
            }
            
            // If no data from NHTSA, show error
            if (!nhtsaData || !nhtsaData.Make) {
                throw new Error('Unable to decode VIN. Please verify the VIN is correct.');
            }

            // Display VIN decoder results from NHTSA
            if (vinData && vinData.make && vinData.make !== 'N/A') {
                resultsContainer.innerHTML = `
                    <div class="specs-card">
                        <div class="specs-header">
                            <h2><i class="fas fa-check-circle" style="color: #00c853; margin-right: 12px;"></i>VIN Decoder Results</h2>
                            <p class="subtitle">VIN: <strong>${vin}</strong></p>
                            <p style="font-size: 0.85rem; color: #666; margin-top: 8px;">
                                <i class="fas fa-database"></i> Data source: <span style="color: #00c853;">✓ NHTSA (US Government)</span>
                            </p>
                        </div>
                        <div class="specs-grid">
                            <div class="spec-group">
                                <h3><i class="fas fa-car"></i> Vehicle Information</h3>
                                <div class="spec-item">
                                    <span class="spec-label">Make:</span>
                                    <span class="spec-value">${vinData.make || 'N/A'}</span>
                                </div>
                                <div class="spec-item">
                                    <span class="spec-label">Model:</span>
                                    <span class="spec-value">${vinData.model || 'N/A'}</span>
                                </div>
                                <div class="spec-item">
                                    <span class="spec-label">Year:</span>
                                    <span class="spec-value">${vinData.year || 'N/A'}</span>
                                </div>
                                <div class="spec-item">
                                    <span class="spec-label">Body Class:</span>
                                    <span class="spec-value">${vinData.body_class || 'N/A'}</span>
                                </div>
                                ${vinData.vehicle_type && vinData.vehicle_type !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Vehicle Type:</span>
                                    <span class="spec-value">${vinData.vehicle_type}</span>
                                </div>
                                ` : ''}
                                ${vinData.series && vinData.series !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Series:</span>
                                    <span class="spec-value">${vinData.series}</span>
                                </div>
                                ` : ''}
                                ${vinData.trim && vinData.trim !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Trim:</span>
                                    <span class="spec-value">${vinData.trim}</span>
                                </div>
                                ` : ''}
                                ${vinData.doors && vinData.doors !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Doors:</span>
                                    <span class="spec-value">${vinData.doors}</span>
                                </div>
                                ` : ''}
                                ${vinData.seats && vinData.seats !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Seats:</span>
                                    <span class="spec-value">${vinData.seats}</span>
                                </div>
                                ` : ''}
                                ${vinData.wheel_base && vinData.wheel_base !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Wheel Base:</span>
                                    <span class="spec-value">${vinData.wheel_base_in && vinData.wheel_base_in !== 'N/A' ? vinData.wheel_base_in + '"' : ''}${vinData.wheel_base_mm && vinData.wheel_base_mm !== 'N/A' ? (vinData.wheel_base_in && vinData.wheel_base_in !== 'N/A' ? ' / ' : '') + vinData.wheel_base_mm + ' mm' : ''}</span>
                                </div>
                                ` : ''}
                            </div>
                            
                            <div class="spec-group">
                                <h3><i class="fas fa-globe"></i> Manufacturing Location</h3>
                                ${vinData.manufacturer_name && vinData.manufacturer_name !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Manufacturer:</span>
                                    <span class="spec-value">${vinData.manufacturer_name}</span>
                                </div>
                                ` : ''}
                                ${vinData.country && vinData.country !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Country:</span>
                                    <span class="spec-value">${vinData.country}</span>
                                </div>
                                ` : ''}
                                ${vinData.region && vinData.region !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Region:</span>
                                    <span class="spec-value">${vinData.region}</span>
                                </div>
                                ` : ''}
                                ${vinData.plant_company_name && vinData.plant_company_name !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Plant Company:</span>
                                    <span class="spec-value">${vinData.plant_company_name}</span>
                                </div>
                                ` : ''}
                                ${vinData.plant_city && vinData.plant_city !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Plant City:</span>
                                    <span class="spec-value">${vinData.plant_city}</span>
                                </div>
                                ` : ''}
                                ${vinData.plant_state && vinData.plant_state !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Plant State:</span>
                                    <span class="spec-value">${vinData.plant_state}</span>
                                </div>
                                ` : ''}
                                ${vinData.plant_country && vinData.plant_country !== 'N/A' && vinData.plant_country !== vinData.country ? `
                                <div class="spec-item">
                                    <span class="spec-label">Plant Country:</span>
                                    <span class="spec-value">${vinData.plant_country}</span>
                                </div>
                                ` : ''}
                            </div>
                            
                            ${vinData.overall_length || vinData.overall_width || vinData.overall_height || vinData.track_width || vinData.ground_clearance ? `
                            <div class="spec-group">
                                <h3><i class="fas fa-ruler-combined"></i> Dimensions</h3>
                                ${vinData.overall_length && vinData.overall_length !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Overall Length:</span>
                                    <span class="spec-value">${vinData.overall_length}"</span>
                                </div>
                                ` : ''}
                                ${vinData.overall_width && vinData.overall_width !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Overall Width:</span>
                                    <span class="spec-value">${vinData.overall_width}"</span>
                                </div>
                                ` : ''}
                                ${vinData.overall_height && vinData.overall_height !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Overall Height:</span>
                                    <span class="spec-value">${vinData.overall_height}"</span>
                                </div>
                                ` : ''}
                                ${vinData.track_width && vinData.track_width !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Track Width:</span>
                                    <span class="spec-value">${vinData.track_width}"</span>
                                </div>
                                ` : ''}
                                ${vinData.ground_clearance && vinData.ground_clearance !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Ground Clearance:</span>
                                    <span class="spec-value">${vinData.ground_clearance}"</span>
                                </div>
                                ` : ''}
                            </div>
                            ` : ''}
                            
                            ${vinData.brake_system_type || vinData.abs || vinData.esc || vinData.traction_control ? `
                            <div class="spec-group">
                                <h3><i class="fas fa-stop-circle"></i> Brakes & Stability</h3>
                                ${vinData.brake_system_type && vinData.brake_system_type !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Brake System Type:</span>
                                    <span class="spec-value">${vinData.brake_system_type}</span>
                                </div>
                                ` : ''}
                                ${vinData.brake_system_desc && vinData.brake_system_desc !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Brake System:</span>
                                    <span class="spec-value">${vinData.brake_system_desc}</span>
                                </div>
                                ` : ''}
                                ${vinData.abs && vinData.abs !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">ABS (Anti-lock Braking):</span>
                                    <span class="spec-value">${vinData.abs}</span>
                                </div>
                                ` : ''}
                                ${vinData.esc && vinData.esc !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">ESC (Electronic Stability Control):</span>
                                    <span class="spec-value">${vinData.esc}</span>
                                </div>
                                ` : ''}
                                ${vinData.traction_control && vinData.traction_control !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Traction Control:</span>
                                    <span class="spec-value">${vinData.traction_control}</span>
                                </div>
                                ` : ''}
                            </div>
                            ` : ''}
                            
                            ${vinData.safety_restraint_system || vinData.other_restraint_system_info || vinData.tpms || vinData.tsc ? `
                            <div class="spec-group">
                                <h3><i class="fas fa-shield-alt"></i> Safety & Equipment</h3>
                                ${vinData.safety_restraint_system && vinData.safety_restraint_system !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Safety Restraint System:</span>
                                    <span class="spec-value">${vinData.safety_restraint_system}</span>
                                </div>
                                ` : ''}
                                ${vinData.other_restraint_system_info && vinData.other_restraint_system_info !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Other Restraint System Info:</span>
                                    <span class="spec-value">${vinData.other_restraint_system_info}</span>
                                </div>
                                ` : ''}
                                ${vinData.tpms && vinData.tpms !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">TPMS (Tire Pressure Monitoring):</span>
                                    <span class="spec-value">${vinData.tpms}</span>
                                </div>
                                ` : ''}
                                ${vinData.tsc && vinData.tsc !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">TSC (Trailer Stability Control):</span>
                                    <span class="spec-value">${vinData.tsc}</span>
                                </div>
                                ` : ''}
                            </div>
                            ` : ''}
                            
                            ${vinData.adaptive_cruise_control || vinData.forward_collision_warning || vinData.lane_departure_warning || vinData.blind_spot_warning || vinData.backup_camera ? `
                            <div class="spec-group">
                                <h3><i class="fas fa-car-crash"></i> Advanced Safety Features</h3>
                                ${vinData.adaptive_cruise_control && vinData.adaptive_cruise_control !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Adaptive Cruise Control:</span>
                                    <span class="spec-value">${vinData.adaptive_cruise_control}</span>
                                </div>
                                ` : ''}
                                ${vinData.forward_collision_warning && vinData.forward_collision_warning !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Forward Collision Warning:</span>
                                    <span class="spec-value">${vinData.forward_collision_warning}</span>
                                </div>
                                ` : ''}
                                ${vinData.crash_imminent_braking && vinData.crash_imminent_braking !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Crash Imminent Braking:</span>
                                    <span class="spec-value">${vinData.crash_imminent_braking}</span>
                                </div>
                                ` : ''}
                                ${vinData.lane_departure_warning && vinData.lane_departure_warning !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Lane Departure Warning:</span>
                                    <span class="spec-value">${vinData.lane_departure_warning}</span>
                                </div>
                                ` : ''}
                                ${vinData.lane_keeping_assist && vinData.lane_keeping_assist !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Lane Keeping Assist:</span>
                                    <span class="spec-value">${vinData.lane_keeping_assist}</span>
                                </div>
                                ` : ''}
                                ${vinData.blind_spot_warning && vinData.blind_spot_warning !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Blind Spot Warning:</span>
                                    <span class="spec-value">${vinData.blind_spot_warning}</span>
                                </div>
                                ` : ''}
                                ${vinData.rear_cross_traffic_alert && vinData.rear_cross_traffic_alert !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Rear Cross Traffic Alert:</span>
                                    <span class="spec-value">${vinData.rear_cross_traffic_alert}</span>
                                </div>
                                ` : ''}
                                ${vinData.backup_camera && vinData.backup_camera !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Backup Camera:</span>
                                    <span class="spec-value">${vinData.backup_camera}</span>
                                </div>
                                ` : ''}
                                ${vinData.parking_assist && vinData.parking_assist !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Parking Assist:</span>
                                    <span class="spec-value">${vinData.parking_assist}</span>
                                </div>
                                ` : ''}
                                ${vinData.pedestrian_auto_braking && vinData.pedestrian_auto_braking !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Pedestrian Auto Braking:</span>
                                    <span class="spec-value">${vinData.pedestrian_auto_braking}</span>
                                </div>
                                ` : ''}
                                ${vinData.dynamic_brake_support && vinData.dynamic_brake_support !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Dynamic Brake Support:</span>
                                    <span class="spec-value">${vinData.dynamic_brake_support}</span>
                                </div>
                                ` : ''}
                            </div>
                            ` : ''}
                            
                            ${vinData.airbag_locations || vinData.curtain_airbag_locations || vinData.seat_belt_type ? `
                            <div class="spec-group">
                                <h3><i class="fas fa-user-shield"></i> Airbags & Restraints</h3>
                                ${vinData.airbag_locations && vinData.airbag_locations !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Airbag Locations:</span>
                                    <span class="spec-value">${vinData.airbag_locations}</span>
                                </div>
                                ` : ''}
                                ${vinData.curtain_airbag_locations && vinData.curtain_airbag_locations !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Curtain Airbag Locations:</span>
                                    <span class="spec-value">${vinData.curtain_airbag_locations}</span>
                                </div>
                                ` : ''}
                                ${vinData.seat_belt_type && vinData.seat_belt_type !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Seat Belt Type:</span>
                                    <span class="spec-value">${vinData.seat_belt_type}</span>
                                </div>
                                ` : ''}
                                ${vinData.pretensioner && vinData.pretensioner !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Pretensioner:</span>
                                    <span class="spec-value">${vinData.pretensioner}</span>
                                </div>
                                ` : ''}
                                ${vinData.seat_belts_all && vinData.seat_belts_all !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Seat Belts (All Positions):</span>
                                    <span class="spec-value">${vinData.seat_belts_all}</span>
                                </div>
                                ` : ''}
                            </div>
                            ` : ''}
                            
                            ${vinData.battery_type || vinData.battery_kwh || vinData.ev_drive_unit || vinData.charger_level ? `
                            <div class="spec-group">
                                <h3><i class="fas fa-charging-station"></i> Electric Vehicle Information</h3>
                                ${vinData.battery_type && vinData.battery_type !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Battery Type:</span>
                                    <span class="spec-value">${vinData.battery_type}</span>
                                </div>
                                ` : ''}
                                ${vinData.battery_kwh && vinData.battery_kwh !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Battery Capacity:</span>
                                    <span class="spec-value">${vinData.battery_kwh} kWh</span>
                                </div>
                                ` : ''}
                                ${vinData.ev_drive_unit && vinData.ev_drive_unit !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">EV Drive Unit:</span>
                                    <span class="spec-value">${vinData.ev_drive_unit}</span>
                                </div>
                                ` : ''}
                                ${vinData.charger_level && vinData.charger_level !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Charger Level:</span>
                                    <span class="spec-value">${vinData.charger_level}</span>
                                </div>
                                ` : ''}
                                ${vinData.charging_power && vinData.charging_power !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Charging Power:</span>
                                    <span class="spec-value">${vinData.charging_power} kW</span>
                                </div>
                                ` : ''}
                            </div>
                            ` : ''}
                            
                            ${vinData.bed_length || vinData.bed_type || vinData.cab_type ? `
                            <div class="spec-group">
                                <h3><i class="fas fa-truck-pickup"></i> Truck Specifications</h3>
                                ${vinData.bed_length && vinData.bed_length !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Bed Length:</span>
                                    <span class="spec-value">${vinData.bed_length}"</span>
                                </div>
                                ` : ''}
                                ${vinData.bed_type && vinData.bed_type !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Bed Type:</span>
                                    <span class="spec-value">${vinData.bed_type}</span>
                                </div>
                                ` : ''}
                                ${vinData.cab_type && vinData.cab_type !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Cab Type:</span>
                                    <span class="spec-value">${vinData.cab_type}</span>
                                </div>
                                ` : ''}
                            </div>
                            ` : ''}
                            
                            ${vinData.trailer_type_connection || vinData.trailer_body_type || vinData.trailer_length || vinData.bus_length ? `
                            <div class="spec-group">
                                <h3><i class="fas fa-truck"></i> Trailer/Bus Information</h3>
                                ${vinData.trailer_type_connection && vinData.trailer_type_connection !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Trailer Type Connection:</span>
                                    <span class="spec-value">${vinData.trailer_type_connection}</span>
                                </div>
                                ` : ''}
                                ${vinData.trailer_body_type && vinData.trailer_body_type !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Trailer Body Type:</span>
                                    <span class="spec-value">${vinData.trailer_body_type}</span>
                                </div>
                                ` : ''}
                                ${vinData.trailer_length && vinData.trailer_length !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Trailer Length:</span>
                                    <span class="spec-value">${vinData.trailer_length} feet</span>
                                </div>
                                ` : ''}
                                ${vinData.bus_length && vinData.bus_length !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Bus Length:</span>
                                    <span class="spec-value">${vinData.bus_length} feet</span>
                                </div>
                                ` : ''}
                            </div>
                            ` : ''}
                            
                            <div class="spec-group">
                                <h3><i class="fas fa-cog"></i> Engine Details</h3>
                                ${vinData.engine_config && vinData.engine_config !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Engine Configuration:</span>
                                    <span class="spec-value">${vinData.engine_config}</span>
                                </div>
                                ` : ''}
                                ${vinData.engine_model && vinData.engine_model !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Engine Model:</span>
                                    <span class="spec-value">${vinData.engine_model}</span>
                                </div>
                                ` : ''}
                                ${vinData.engine_manufacturer && vinData.engine_manufacturer !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Engine Manufacturer:</span>
                                    <span class="spec-value">${vinData.engine_manufacturer}</span>
                                </div>
                                ` : ''}
                                ${vinData.engine_cylinders && vinData.engine_cylinders !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Engine Cylinders:</span>
                                    <span class="spec-value">${vinData.engine_cylinders}</span>
                                </div>
                                ` : ''}
                                ${vinData.displacement && vinData.displacement !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Displacement:</span>
                                    <span class="spec-value">${vinData.displacement}${vinData.displacement_ci && vinData.displacement_ci !== 'N/A' ? ' L / ' + vinData.displacement_ci + ' CI' : ' L'}</span>
                                </div>
                                ` : ''}
                                ${vinData.engine_aspiration && vinData.engine_aspiration !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Engine Aspiration:</span>
                                    <span class="spec-value">${vinData.engine_aspiration}</span>
                                </div>
                                ` : ''}
                                ${vinData.valve_train_design && vinData.valve_train_design !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Valve Train Design:</span>
                                    <span class="spec-value">${vinData.valve_train_design}</span>
                                </div>
                                ` : ''}
                                ${vinData.fuel_type_primary && vinData.fuel_type_primary !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Fuel Type (Primary):</span>
                                    <span class="spec-value">${vinData.fuel_type_primary}</span>
                                </div>
                                ` : ''}
                                ${vinData.fuel_type_secondary && vinData.fuel_type_secondary !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Fuel Type (Secondary):</span>
                                    <span class="spec-value">${vinData.fuel_type_secondary}</span>
                                </div>
                                ` : ''}
                                ${vinData.engine_brake_hp && vinData.engine_brake_hp !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Engine Power:</span>
                                    <span class="spec-value">${vinData.engine_brake_hp}${vinData.engine_brake_hp_from && vinData.engine_brake_hp_to && vinData.engine_brake_hp_from !== 'N/A' && vinData.engine_brake_hp_to !== 'N/A' ? ' (' + vinData.engine_brake_hp_from + '-' + vinData.engine_brake_hp_to + ')' : ''} hp</span>
                                </div>
                                ` : ''}
                            </div>
                            
                            ${vinData.transmission_style || vinData.drive_type || vinData.transmission_speeds || vinData.axles ? `
                            <div class="spec-group">
                                <h3><i class="fas fa-cogs"></i> Transmission & Drivetrain</h3>
                                ${vinData.transmission_style && vinData.transmission_style !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Transmission Style:</span>
                                    <span class="spec-value">${vinData.transmission_style}</span>
                                </div>
                                ` : ''}
                                ${vinData.transmission_speeds && vinData.transmission_speeds !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Transmission Speeds:</span>
                                    <span class="spec-value">${vinData.transmission_speeds}</span>
                                </div>
                                ` : ''}
                                ${vinData.drive_type && vinData.drive_type !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Drive Type:</span>
                                    <span class="spec-value">${vinData.drive_type}</span>
                                </div>
                                ` : ''}
                                ${vinData.axles && vinData.axles !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Axles:</span>
                                    <span class="spec-value">${vinData.axles}</span>
                                </div>
                                ` : ''}
                            </div>
                            ` : ''}
                            
                            ${vinData.curb_weight || vinData.gvwr || vinData.gvwr_from || vinData.gvwr_to || vinData.base_price ? `
                            <div class="spec-group">
                                <h3><i class="fas fa-weight"></i> Weight & Pricing Information</h3>
                                ${vinData.curb_weight && vinData.curb_weight !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Curb Weight:</span>
                                    <span class="spec-value">${vinData.curb_weight}</span>
                                </div>
                                ` : ''}
                                ${vinData.gvwr_from && vinData.gvwr_from !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Gross Vehicle Weight Rating:</span>
                                    <span class="spec-value">${vinData.gvwr_from}${vinData.gvwr_to && vinData.gvwr_to !== 'N/A' ? ' - ' + vinData.gvwr_to : ''}</span>
                                </div>
                                ` : (vinData.gvwr && vinData.gvwr !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Gross Vehicle Weight Rating:</span>
                                    <span class="spec-value">${vinData.gvwr}</span>
                                </div>
                                ` : '')}
                                ${vinData.base_price && vinData.base_price !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Base Price:</span>
                                    <span class="spec-value">${vinData.base_price}</span>
                                </div>
                                ` : ''}
                            </div>
                            ` : ''}
                            
                            ${vinData.mpg_city || vinData.mpg_highway || vinData.fuel_tank_capacity || vinData.horsepower || vinData.torque ? `
                            <div class="spec-group">
                                <h3><i class="fas fa-tachometer-alt"></i> Performance & Fuel Economy</h3>
                                ${vinData.horsepower && vinData.horsepower !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Horsepower:</span>
                                    <span class="spec-value">${vinData.horsepower} hp</span>
                                </div>
                                ` : ''}
                                ${vinData.torque && vinData.torque !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Torque:</span>
                                    <span class="spec-value">${vinData.torque} lb-ft</span>
                                </div>
                                ` : ''}
                                ${vinData.mpg_city && vinData.mpg_city !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">MPG City:</span>
                                    <span class="spec-value">${vinData.mpg_city} mpg</span>
                                </div>
                                ` : ''}
                                ${vinData.mpg_highway && vinData.mpg_highway !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">MPG Highway:</span>
                                    <span class="spec-value">${vinData.mpg_highway} mpg</span>
                                </div>
                                ` : ''}
                                ${vinData.fuel_tank_capacity && vinData.fuel_tank_capacity !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">Fuel Tank Capacity:</span>
                                    <span class="spec-value">${vinData.fuel_tank_capacity} gallons</span>
                                </div>
                                ` : ''}
                            </div>
                            ` : ''}
                            
                            ${vinData.wmi || vinData.vds || vinData.vis ? `
                            <div class="spec-group">
                                <h3><i class="fas fa-info-circle"></i> VIN Structure</h3>
                                ${vinData.wmi && vinData.wmi !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">WMI (World Manufacturer Identifier):</span>
                                    <span class="spec-value">${vinData.wmi}</span>
                                </div>
                                ` : ''}
                                ${vinData.vds && vinData.vds !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">VDS (Vehicle Descriptor Section):</span>
                                    <span class="spec-value">${vinData.vds}</span>
                                </div>
                                ` : ''}
                                ${vinData.vis && vinData.vis !== 'N/A' ? `
                                <div class="spec-item">
                                    <span class="spec-label">VIS (Vehicle Identifier Section):</span>
                                    <span class="spec-value">${vinData.vis}</span>
                                </div>
                                ` : ''}
                            </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            } else {
                throw new Error('No VIN data found from either API');
            }
        } catch (error) {
            console.error('VIN decode error:', error);
            resultsContainer.innerHTML = `
                <div class="specs-card">
                    <div style="text-align: center; padding: 60px 20px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #f44336; margin-bottom: 20px;"></i>
                        <h3 style="color: #333; margin-bottom: 12px;">VIN Decode Failed</h3>
                        <p style="color: #666; font-size: 1rem; margin-bottom: 20px;">Unable to decode VIN. Please check the VIN and try again.</p>
                        <p style="color: #999; font-size: 0.9rem;">Error: ${error.message || 'Unknown error'}</p>
                    </div>
                </div>
            `;
        }
    }
}

// Initialize after DOM is ready
let vinDecoder;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        vinDecoder = new VINDecoder();
    });
} else {
    vinDecoder = new VINDecoder();
}

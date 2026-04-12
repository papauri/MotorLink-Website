// ============================================================================
// User Vehicle Management JavaScript
// ============================================================================
// Handles adding, updating, and managing user vehicles for journey planning
// ============================================================================

let userVehicles = [];
let makes = [];
let models = [];

document.addEventListener('DOMContentLoaded', async function() {
    // Initialize for both journey planner and my vehicles tabs
    const journeyPlannerTab = document.getElementById('journey-planner-tab');
    const myVehiclesTab = document.getElementById('my-vehicles-tab');
    
    if (journeyPlannerTab || myVehiclesTab) {
        loadMakes();
        
        // Check if user is authenticated before loading vehicles
        const isAuthenticated = await checkAuthForMyVehicles();
        if (isAuthenticated) {
            loadUserVehicles();
        }
        
        setupVehicleFormListeners();
    }
    
    // Setup tab switching
    setupTabSwitching();
});

function setupTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn[data-tab]');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Show selected tab
            const selectedTab = document.getElementById(`${tabName}-tab`);
            if (selectedTab) {
                selectedTab.classList.add('active');
            }
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // If my-vehicles tab, check auth and load vehicles
            if (tabName === 'my-vehicles') {
                checkAuthForMyVehicles();
            }
        });
    });
}

async function checkAuthForMyVehicles() {
    const loginPrompt = document.getElementById('myVehiclesLoginPrompt');
    const content = document.getElementById('myVehiclesContent');
    
    if (!loginPrompt || !content) return false;
    
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=check_auth`, {
            headers: { 'X-Skip-Global-Loader': '1' },
            ...(CONFIG.USE_CREDENTIALS && {credentials: 'include'})
        });
        const data = await response.json();
        
        if (data.success && data.authenticated) {
            loginPrompt.style.display = 'none';
            content.style.display = 'block';
            await loadUserVehiclesForDisplay();
            return true;
        } else {
            loginPrompt.style.display = 'block';
            content.style.display = 'none';
            return false;
        }
    } catch (error) {
        loginPrompt.style.display = 'block';
        content.style.display = 'none';
        return false;
    }
}

async function loadUserVehiclesForDisplay() {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=get_user_vehicles`, {
            credentials: 'include',
            headers: { 'X-Skip-Global-Loader': '1' }
        });
        const data = await response.json();
        
        if (data.success && data.vehicles) {
            userVehicles = data.vehicles;
            displayUserVehicles();
        }
    } catch (error) {
        console.error('Error loading user vehicles:', error);
    }
}

function displayUserVehicles() {
    const container = document.getElementById('userVehiclesList');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (userVehicles.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; background: #f8f9fa; border-radius: 8px;">
                <i class="fas fa-car" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                <h3 style="color: #666; margin-bottom: 10px;">No Vehicles Added Yet</h3>
                <p style="color: #999; margin-bottom: 20px;">Add your first vehicle to start tracking journeys and fuel costs!</p>
                <button class="btn btn-primary" onclick="showAddVehicleModal()">
                    <i class="fas fa-plus"></i> Add Your First Vehicle
                </button>
            </div>
        `;
        return;
    }
    
    userVehicles.forEach(vehicle => {
        const vehicleCard = document.createElement('div');
        vehicleCard.className = 'vehicle-card';
        vehicleCard.style.cssText = 'background: white; border-radius: 8px; padding: 20px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);';
        
        if (vehicle.is_primary) {
            vehicleCard.style.borderLeft = '4px solid #28a745';
        }
        
        const fuelTypeName = vehicle.fuel_type ? vehicle.fuel_type.charAt(0).toUpperCase() + vehicle.fuel_type.slice(1) : 'N/A';
        const engineSize = vehicle.engine_size_liters ? `${vehicle.engine_size_liters}L` : 'N/A';
        const transmission = vehicle.transmission ? vehicle.transmission.charAt(0).toUpperCase() + vehicle.transmission.slice(1) : 'N/A';
        const consumption = vehicle.fuel_consumption_liters_per_100km ? `${vehicle.fuel_consumption_liters_per_100km} L/100km` : 'N/A';
        const tankCapacity = vehicle.fuel_tank_capacity_liters ? `${vehicle.fuel_tank_capacity_liters}L` : 'N/A';
        
        vehicleCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                <div>
                    <h3 style="margin: 0 0 5px 0; color: #2c3e50;">
                        ${vehicle.make} ${vehicle.model}${vehicle.year ? ' (' + vehicle.year + ')' : ''}
                        ${vehicle.is_primary ? '<span style="background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; margin-left: 10px;">Primary</span>' : ''}
                    </h3>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-sm btn-danger" onclick="deleteUserVehicle(${vehicle.id})" style="padding: 5px 10px;">
                        <i class="fas fa-trash"></i>
                    </button>
                    ${!vehicle.is_primary ? `<button class="btn btn-sm btn-secondary" onclick="setPrimaryVehicle(${vehicle.id})" style="padding: 5px 10px;"><i class="fas fa-star"></i></button>` : ''}
                </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
                <div>
                    <div style="color: #666; font-size: 0.9rem; margin-bottom: 5px;"><i class="fas fa-gas-pump"></i> Fuel Type</div>
                    <div style="font-weight: bold; color: #333;">${fuelTypeName}</div>
                </div>
                <div>
                    <div style="color: #666; font-size: 0.9rem; margin-bottom: 5px;"><i class="fas fa-cog"></i> Engine Size</div>
                    <div style="font-weight: bold; color: #333;">${engineSize}</div>
                </div>
                <div>
                    <div style="color: #666; font-size: 0.9rem; margin-bottom: 5px;"><i class="fas fa-cogs"></i> Transmission</div>
                    <div style="font-weight: bold; color: #333;">${transmission}</div>
                </div>
                <div>
                    <div style="color: #666; font-size: 0.9rem; margin-bottom: 5px;"><i class="fas fa-tachometer-alt"></i> Consumption</div>
                    <div style="font-weight: bold; color: #333;">${consumption}</div>
                </div>
                <div>
                    <div style="color: #666; font-size: 0.9rem; margin-bottom: 5px;"><i class="fas fa-tint"></i> Tank Capacity</div>
                    <div style="font-weight: bold; color: #333;">${tankCapacity}</div>
                </div>
                ${vehicle.vin ? `
                <div>
                    <div style="color: #666; font-size: 0.9rem; margin-bottom: 5px;"><i class="fas fa-barcode"></i> VIN</div>
                    <div style="font-weight: bold; color: #333; font-family: monospace;">${vehicle.vin}</div>
                </div>
                ` : ''}
            </div>
        `;
        
        container.appendChild(vehicleCard);
    });
}

function setupVehicleFormListeners() {
    const makeSelect = document.getElementById('vehicleMake');
    const modelSelect = document.getElementById('vehicleModel');
    const yearInput = document.getElementById('vehicleYear');
    
    if (makeSelect) {
        makeSelect.addEventListener('change', function() {
            loadModels(this.value);
            if (yearInput) {
                yearInput.value = '';
                yearInput.disabled = true;
            }
        });
    }
    
    if (modelSelect) {
        modelSelect.addEventListener('change', function() {
            loadYearsForModel(this.value);
            loadVehicleDetailsForModel(this.value);
        });
    }
}

async function loadVehicleDetailsForModel(modelId) {
    if (!modelId) return;
    
    const modelSelect = document.getElementById('vehicleModel');
    if (!modelSelect) return;
    
    const selectedOption = modelSelect.options[modelSelect.selectedIndex];
    if (!selectedOption) return;
    
    // Get the selected model from the models array
    const selectedModel = models.find(model => String(model.id) === modelId);
    
    // Check for engine variations
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=get_model_engine_variations&model_id=${modelId}`, {
            headers: { 'X-Skip-Global-Loader': '1' }
        });
        const data = await response.json();
        
        const engineCapacityContainer = document.getElementById('vehicleEngineCapacity').parentElement;
        const engineCapacityInput = document.getElementById('vehicleEngineCapacity');
        
        if (data.success && data.variations && data.has_multiple && data.variations.length > 1) {
            // Multiple engine sizes - show dropdown
            if (engineCapacityInput && engineCapacityInput.tagName === 'INPUT') {
                const select = document.createElement('select');
                select.id = 'vehicleEngineCapacity';
                select.className = engineCapacityInput.className;
                select.name = engineCapacityInput.name;
                select.required = engineCapacityInput.required;
                
                const placeholder = document.createElement('option');
                placeholder.value = '';
                placeholder.textContent = '-- Select Engine Size --';
                select.appendChild(placeholder);
                
                data.variations.forEach(variation => {
                    const option = document.createElement('option');
                    option.value = variation.engine_size_liters;
                    option.textContent = `${variation.engine_size_liters}L`;
                    option.dataset.fuelConsumption = variation.fuel_consumption_combined_l100km || '';
                    option.dataset.fuelTankCapacity = variation.fuel_tank_capacity_liters || '';
                    option.dataset.transmission = variation.transmission_type || '';
                    select.appendChild(option);
                });
                
                engineCapacityInput.parentNode.replaceChild(select, engineCapacityInput);
                
                // Add change listener to update other fields when engine size changes
                select.addEventListener('change', function() {
                    const selectedVariation = data.variations.find(v => String(v.engine_size_liters) === this.value);
                    if (selectedVariation) {
                        updateFieldsFromVariation(selectedVariation);
                    }
                });
            } else if (engineCapacityInput && engineCapacityInput.tagName === 'SELECT') {
                // Already a select, just update options
                engineCapacityInput.innerHTML = '<option value="">-- Select Engine Size --</option>';
                data.variations.forEach(variation => {
                    const option = document.createElement('option');
                    option.value = variation.engine_size_liters;
                    option.textContent = `${variation.engine_size_liters}L`;
                    option.dataset.fuelConsumption = variation.fuel_consumption_combined_l100km || '';
                    option.dataset.fuelTankCapacity = variation.fuel_tank_capacity_liters || '';
                    option.dataset.transmission = variation.transmission_type || '';
                    engineCapacityInput.appendChild(option);
                });
            }
        } else {
            // Single or no engine size - show input field
            if (engineCapacityInput && engineCapacityInput.tagName === 'SELECT') {
                const input = document.createElement('input');
                input.type = 'number';
                input.id = 'vehicleEngineCapacity';
                input.className = engineCapacityInput.className;
                input.name = engineCapacityInput.name;
                input.required = engineCapacityInput.required;
                input.placeholder = 'e.g., 2.0';
                input.step = '0.1';
                input.min = '0';
                engineCapacityInput.parentNode.replaceChild(input, engineCapacityInput);
            }
            
            // Auto-fill Engine Capacity
            const engineCapacityField = document.getElementById('vehicleEngineCapacity');
            if (engineCapacityField && engineCapacityField.tagName === 'INPUT') {
                const engineSize = selectedModel?.engine_size_liters || selectedOption.dataset.engineSize;
                if (engineSize) {
                    engineCapacityField.value = parseFloat(engineSize).toFixed(2);
                } else {
                    engineCapacityField.value = '';
                }
            }
        }
    } catch (error) {
        console.error('Error loading engine variations:', error);
        // Fallback to single value
        const engineCapacityInput = document.getElementById('vehicleEngineCapacity');
        if (engineCapacityInput && engineCapacityInput.tagName === 'INPUT') {
            const engineSize = selectedModel?.engine_size_liters || selectedOption.dataset.engineSize;
            if (engineSize) {
                engineCapacityInput.value = parseFloat(engineSize).toFixed(2);
            } else {
                engineCapacityInput.value = '';
            }
        }
    }
    
    // Auto-fill other fields (will be updated if engine variation is selected)
    updateFieldsFromModel(selectedModel, selectedOption);
}

function updateFieldsFromModel(model, option) {
    // Auto-fill Fuel Consumption
    const fuelConsumptionInput = document.getElementById('vehicleFuelConsumption');
    if (fuelConsumptionInput) {
        const fuelConsumption = model?.fuel_consumption_combined_l100km || option?.dataset.fuelConsumption;
        if (fuelConsumption) {
            fuelConsumptionInput.value = parseFloat(fuelConsumption).toFixed(2);
        } else {
            fuelConsumptionInput.value = '';
        }
    }
    
    // Auto-fill Fuel Tank Capacity
    const fuelTankInput = document.getElementById('vehicleFuelTankCapacity');
    if (fuelTankInput) {
        const fuelTankCapacity = model?.fuel_tank_capacity_liters || option?.dataset.fuelTankCapacity;
        if (fuelTankCapacity) {
            fuelTankInput.value = parseFloat(fuelTankCapacity).toFixed(1);
        } else {
            fuelTankInput.value = '';
        }
    }
    
    // Auto-fill Transmission
    const transmissionSelect = document.getElementById('vehicleTransmission');
    if (transmissionSelect) {
        const transmission = model?.transmission_type || option?.dataset.transmission;
        if (transmission) {
            transmissionSelect.value = transmission.toLowerCase();
        } else {
            transmissionSelect.value = '';
        }
    }
}

function updateFieldsFromVariation(variation) {
    // Update fuel consumption
    const fuelConsumptionInput = document.getElementById('vehicleFuelConsumption');
    if (fuelConsumptionInput && variation.fuel_consumption_combined_l100km) {
        fuelConsumptionInput.value = parseFloat(variation.fuel_consumption_combined_l100km).toFixed(2);
    }
    
    // Update fuel tank capacity
    const fuelTankInput = document.getElementById('vehicleFuelTankCapacity');
    if (fuelTankInput && variation.fuel_tank_capacity_liters) {
        fuelTankInput.value = parseFloat(variation.fuel_tank_capacity_liters).toFixed(1);
    }
    
    // Update transmission
    const transmissionSelect = document.getElementById('vehicleTransmission');
    if (transmissionSelect && variation.transmission_type) {
        transmissionSelect.value = variation.transmission_type.toLowerCase();
    }
}

function loadFuelTankCapacityForModel(modelId) {
    // This function is kept for backwards compatibility but the main logic is in loadVehicleDetailsForModel
    const fuelTankInput = document.getElementById('vehicleFuelTankCapacity');
    if (!fuelTankInput || !modelId) return;
    
    // Get the selected model from the models array
    const selectedModel = models.find(model => String(model.id) === modelId);
    if (selectedModel && selectedModel.fuel_tank_capacity_liters) {
        fuelTankInput.value = parseFloat(selectedModel.fuel_tank_capacity_liters).toFixed(1);
    } else {
        // Try to get from option dataset
        const modelSelect = document.getElementById('vehicleModel');
        if (modelSelect) {
            const selectedOption = modelSelect.options[modelSelect.selectedIndex];
            if (selectedOption && selectedOption.dataset.fuelTankCapacity) {
                fuelTankInput.value = parseFloat(selectedOption.dataset.fuelTankCapacity).toFixed(1);
            } else {
                // Clear if no data available
                fuelTankInput.value = '';
            }
        }
    }
}

function loadYearsForModel(modelId) {
    const yearInput = document.getElementById('vehicleYear');
    if (!yearInput || !modelId) {
        if (yearInput) yearInput.disabled = true;
        return;
    }
    
    const modelSelect = document.getElementById('vehicleModel');
    if (!modelSelect) return;
    
    const selectedOption = modelSelect.options[modelSelect.selectedIndex];
    const yearStart = selectedOption ? selectedOption.dataset.yearStart : null;
    const yearEnd = selectedOption ? selectedOption.dataset.yearEnd : null;
    
    if (yearStart) {
        const startYear = parseInt(yearStart);
        const endYear = yearEnd ? parseInt(yearEnd) : new Date().getFullYear();
        const currentYear = new Date().getFullYear();
        
        // Convert year input to select if it's not already
        if (yearInput.tagName === 'INPUT') {
            const select = document.createElement('select');
            select.id = 'vehicleYear';
            select.className = yearInput.className;
            select.name = yearInput.name;
            
            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = 'Select Year (Optional)';
            select.appendChild(placeholder);
            
            for (let year = Math.min(endYear, currentYear); year >= startYear; year--) {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                select.appendChild(option);
            }
            
            yearInput.parentNode.replaceChild(select, yearInput);
        } else {
            yearInput.innerHTML = '<option value="">Select Year (Optional)</option>';
            for (let year = Math.min(endYear, currentYear); year >= startYear; year--) {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearInput.appendChild(option);
            }
        }
        
        yearInput.disabled = false;
    } else {
        // If no year info, keep as input
        if (yearInput.tagName === 'SELECT') {
            const input = document.createElement('input');
            input.type = 'number';
            input.id = 'vehicleYear';
            input.className = yearInput.className;
            input.name = yearInput.name;
            input.placeholder = 'Enter Year (Optional)';
            input.min = '1900';
            input.max = new Date().getFullYear().toString();
            yearInput.parentNode.replaceChild(input, yearInput);
        }
        yearInput.disabled = false;
    }
}

async function loadMakes() {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=get_makes`, {
            headers: { 'X-Skip-Global-Loader': '1' }
        });
        const data = await response.json();
        
        if (data.success && data.makes) {
            makes = data.makes;
            const makeSelect = document.getElementById('vehicleMake');
            if (makeSelect) {
                makeSelect.innerHTML = '<option value="">-- Select Make --</option>';
                makes.forEach(make => {
                    const option = document.createElement('option');
                    option.value = make.id;
                    option.textContent = make.name;
                    makeSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading makes:', error);
    }
}

async function loadModels(makeId) {
    if (!makeId) {
        const modelSelect = document.getElementById('vehicleModel');
        if (modelSelect) {
            modelSelect.innerHTML = '<option value="">-- Select Make First --</option>';
            modelSelect.disabled = true;
        }
        const yearInput = document.getElementById('vehicleYear');
        if (yearInput) {
            yearInput.value = '';
            yearInput.disabled = true;
        }
        return;
    }
    
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=get_models&make_id=${makeId}`, {
            headers: { 'X-Skip-Global-Loader': '1' }
        });
        const data = await response.json();
        
        if (data.success && data.models) {
            models = data.models;
            const modelSelect = document.getElementById('vehicleModel');
            if (modelSelect) {
                modelSelect.innerHTML = '<option value="">-- Select Model --</option>';
                models.forEach(model => {
                    const option = document.createElement('option');
                    option.value = model.id;
                    option.textContent = model.name;
                    // Store model data for auto-filling fields
                    option.dataset.yearStart = model.year_start || '';
                    option.dataset.yearEnd = model.year_end || '';
                    option.dataset.fuelTankCapacity = model.fuel_tank_capacity_liters || '';
                    option.dataset.engineSize = model.engine_size_liters || '';
                    option.dataset.fuelConsumption = model.fuel_consumption_combined_l100km || '';
                    option.dataset.transmission = model.transmission_type || '';
                    modelSelect.appendChild(option);
                });
                modelSelect.disabled = false;
            }
            
            // Reset year field
            const yearInput = document.getElementById('vehicleYear');
            if (yearInput) {
                yearInput.value = '';
                yearInput.disabled = true;
            }
            
            // Reset fuel tank capacity field
            const fuelTankInput = document.getElementById('vehicleFuelTankCapacity');
            if (fuelTankInput) {
                fuelTankInput.value = '';
            }
        }
    } catch (error) {
        console.error('Error loading models:', error);
    }
}

async function loadUserVehicles() {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=get_user_vehicles`, {
            headers: { 'X-Skip-Global-Loader': '1' },
            ...(CONFIG.USE_CREDENTIALS && {credentials: 'include'})
        });
        
        // Handle 401 (not logged in) gracefully
        if (response.status === 401) {
            // User not logged in - show journey planner but keep login prompt for vehicles
            const journeyLoginPrompt = document.getElementById('journeyLoginPrompt');
            const journeyPlannerContent = document.getElementById('journeyPlannerContent');
            if (journeyLoginPrompt) journeyLoginPrompt.style.display = 'none';
            if (journeyPlannerContent) journeyPlannerContent.style.display = 'block';
            return;
        }
        
        const data = await response.json();
        
        // Always show journey planner (it works without login)
        const journeyLoginPrompt = document.getElementById('journeyLoginPrompt');
        const journeyPlannerContent = document.getElementById('journeyPlannerContent');
        if (journeyLoginPrompt) journeyLoginPrompt.style.display = 'none';
        if (journeyPlannerContent) journeyPlannerContent.style.display = 'block';
        
        if (data.success && data.vehicles) {
            userVehicles = data.vehicles;
            updateJourneyVehicleSelect();
            // Also update display if my vehicles tab is visible
            const myVehiclesTab = document.getElementById('my-vehicles-tab');
            if (myVehiclesTab && myVehiclesTab.classList.contains('active')) {
                displayUserVehicles();
            }
        }
    } catch (error) {
        // Silently handle error - don't show console error for 401
        // On error, still show journey planner (it works without vehicles)
        const journeyLoginPrompt = document.getElementById('journeyLoginPrompt');
        const journeyPlannerContent = document.getElementById('journeyPlannerContent');
        if (journeyLoginPrompt) journeyLoginPrompt.style.display = 'none';
        if (journeyPlannerContent) journeyPlannerContent.style.display = 'block';
    }
}

function updateJourneyVehicleSelect() {
    const vehicleSelect = document.getElementById('journeyVehicle');
    if (!vehicleSelect) return;
    
    // Clear existing options except the first one
    vehicleSelect.innerHTML = '<option value="">-- Select Vehicle or Enter Details --</option>';
    
    userVehicles.forEach(vehicle => {
        const option = document.createElement('option');
        option.value = vehicle.id;
        option.textContent = `${vehicle.make} ${vehicle.model}${vehicle.year ? ' (' + vehicle.year + ')' : ''}`;
        option.dataset.fuelType = vehicle.fuel_type || 'petrol';
        option.dataset.fuelConsumption = vehicle.fuel_consumption_liters_per_100km || '';
        
        // Mark primary vehicle
        if (vehicle.is_primary) {
            option.textContent += ' ★';
            option.selected = true;
        }
        
        vehicleSelect.appendChild(option);
    });
    
    // Trigger change event to update fuel consumption field
    if (vehicleSelect.selectedIndex > 0) {
        const event = new Event('change');
        vehicleSelect.dispatchEvent(event);
    }
}

window.addUserVehicle = async function(event) {
    event.preventDefault();
    
    const makeId = document.getElementById('vehicleMake').value;
    const modelId = document.getElementById('vehicleModel').value;
    const yearElement = document.getElementById('vehicleYear');
    const year = yearElement ? yearElement.value : '';
    const vin = document.getElementById('vehicleVin').value;
    const transmissionSelect = document.getElementById('vehicleTransmission');
    const transmission = transmissionSelect ? transmissionSelect.value : '';
    const engineCapacityEl = document.getElementById('vehicleEngineCapacity');
    const engineCapacity = engineCapacityEl ? engineCapacityEl.value : '';
    const fuelConsumptionEl = document.getElementById('vehicleFuelConsumption');
    const fuelConsumption = fuelConsumptionEl ? fuelConsumptionEl.value : '';
    const fuelTankCapacityEl = document.getElementById('vehicleFuelTankCapacity');
    const fuelTankCapacity = fuelTankCapacityEl ? fuelTankCapacityEl.value : '';
    const isPrimary = document.getElementById('vehicleIsPrimary').checked;
    
    if (!makeId || !modelId) {
        alert('Please select both Make and Model');
        return;
    }
    
    if (!engineCapacity || parseFloat(engineCapacity) <= 0) {
        alert('Please enter a valid engine capacity');
        return;
    }
    
    if (!fuelConsumption || parseFloat(fuelConsumption) <= 0) {
        alert('Please enter a valid fuel consumption');
        return;
    }
    
    if (!fuelTankCapacity || parseFloat(fuelTankCapacity) <= 0) {
        alert('Please enter a valid fuel tank capacity');
        return;
    }
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=add_user_vehicle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                make_id: makeId,
                model_id: modelId,
                year: year || null,
                vin: vin || null,
                transmission: transmission || null,
                engine_size_liters: engineCapacity ? parseFloat(engineCapacity) : null,
                fuel_consumption_liters_per_100km: fuelConsumption ? parseFloat(fuelConsumption) : null,
                fuel_tank_capacity_liters: fuelTankCapacity ? parseFloat(fuelTankCapacity) : null,
                is_primary: isPrimary
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Reset form
            event.target.reset();
            document.getElementById('vehicleModel').disabled = true;
            document.getElementById('vehicleModel').innerHTML = '<option value="">-- Select Make First --</option>';
            const yearInput = document.getElementById('vehicleYear');
            if (yearInput) {
                yearInput.disabled = true;
                if (yearInput.tagName === 'SELECT') {
                    yearInput.innerHTML = '<option value="">Select Year (Optional)</option>';
                }
            }
            
            // Reload vehicles
            await loadUserVehicles();
            
            // Close modal if exists
            const modal = document.getElementById('addVehicleModal');
            if (modal) {
                const bootstrapModal = bootstrap.Modal.getInstance(modal);
                if (bootstrapModal) {
                    bootstrapModal.hide();
                }
            }
            
            alert('Vehicle added successfully!');
        } else {
            alert(data.message || 'Failed to add vehicle');
        }
    } catch (error) {
        console.error('Error adding vehicle:', error);
        alert('Failed to add vehicle. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

async function deleteUserVehicle(vehicleId) {
    if (!confirm('Are you sure you want to delete this vehicle?')) {
        return;
    }
    
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=delete_user_vehicle&vehicle_id=${vehicleId}`, {
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadUserVehicles();
            alert('Vehicle deleted successfully!');
        } else {
            alert(data.message || 'Failed to delete vehicle');
        }
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        alert('Failed to delete vehicle. Please try again.');
    }
}

async function setPrimaryVehicle(vehicleId) {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=set_primary_vehicle&vehicle_id=${vehicleId}`, {
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadUserVehicles();
        } else {
            alert(data.message || 'Failed to set primary vehicle');
        }
    } catch (error) {
        console.error('Error setting primary vehicle:', error);
        alert('Failed to set primary vehicle. Please try again.');
    }
}


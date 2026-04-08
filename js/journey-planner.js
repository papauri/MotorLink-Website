// ============================================================================
// Journey Planner JavaScript
// ============================================================================
// Handles journey planning with Google Maps integration and fuel calculations
// ============================================================================

let journeyMap = null;
let directionsService = null;
let journeyRoutePolyline = null;
let journeyRouteMarkers = [];
let currentFuelPrices = {};

document.addEventListener('DOMContentLoaded', function() {
    loadFuelPrices();
    loadGoogleMapsAPI();
});

async function loadGoogleMapsAPI() {
    // Check if already loaded
    if (typeof google !== 'undefined' && google.maps) {
        initializeJourneyPlanner();
        return;
    }
    
    // Check if already loading
    if (window.googleMapsLoading) {
        const checkInterval = setInterval(() => {
            if (typeof google !== 'undefined' && google.maps) {
                clearInterval(checkInterval);
                initializeJourneyPlanner();
            }
        }, 100);
        return;
    }
    
    window.googleMapsLoading = true;
    
    let mapConfig;
    try {
        mapConfig = await window.getGoogleMapsConfig();
    } catch (error) {
        console.error('Failed to load Google Maps runtime config', error);
        window.googleMapsLoading = false;
        return;
    }

    if (!mapConfig || !mapConfig.apiKey) {
        console.error('Google Maps API key is not configured');
        window.googleMapsLoading = false;
        return;
    }

    // Load Google Maps API with places + geometry (geometry is used to decode encoded polylines)
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${mapConfig.apiKey}&libraries=places,geometry&loading=async&callback=initJourneyPlanner`;
    script.async = true;
    script.defer = true;
    
    script.onerror = function() {
        console.error('Failed to load Google Maps API');
        window.googleMapsLoading = false;
    };
    
    document.head.appendChild(script);
}

// Global callback for Google Maps
window.initJourneyPlanner = function() {
    window.googleMapsLoading = false;
    initializeJourneyPlanner();
};

function initializeJourneyPlanner() {
    // Wait a bit to ensure all libraries are loaded
    setTimeout(() => {
        // Initialize Google Maps
        if (typeof google !== 'undefined' && google.maps) {
            initMap();
            initAutocomplete();
        } else {
            console.error('Google Maps API not loaded');
        }
    }, 100);
    
    // Setup event listeners (these can be set up immediately)
    const calculateBtn = document.getElementById('calculateJourneyBtn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateJourney);
    }
    
    const vehicleSelect = document.getElementById('journeyVehicle');
    if (vehicleSelect) {
        vehicleSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
                if (selectedOption && selectedOption.dataset.fuelConsumption) {
                const consumption = selectedOption.dataset.fuelConsumption;
                if (consumption) {
                    document.getElementById('journeyFuelConsumption').value = consumption;
                }
            }
        });
    }
    
}

function initMap() {
    // Initialize map centered on Malawi
    journeyMap = new google.maps.Map(document.getElementById('journeyMap'), {
        center: { lat: -13.9626, lng: 33.7741 }, // Lilongwe, Malawi
        zoom: 7,
        mapTypeControl: true,
        streetViewControl: false
    });
    
    // Prefer Routes API route computation and render route manually.
}

function initAutocomplete() {
    if (!google || !google.maps || !google.maps.places) {
        console.error('Google Maps Places API not loaded');
        return;
    }
    
    const originInput = document.getElementById('journeyOrigin');
    const destinationInput = document.getElementById('journeyDestination');
    
    if (originInput) {
        try {
            // Use new PlaceAutocompleteElement API
            const originAutocomplete = new google.maps.places.PlaceAutocompleteElement({
                componentRestrictions: { country: 'mw' }, // Restrict to Malawi
            });
            
            originAutocomplete.addEventListener('gmp-placeselect', async ({ place }) => {
                await place.fetchFields({
                    fields: ['displayName', 'formattedAddress', 'location']
                });
                
                if (place.location) {
                    journeyMap.setCenter(place.location);
                }
            });
            
            // Replace the input with the autocomplete element
            originInput.parentNode.replaceChild(originAutocomplete, originInput);
            originAutocomplete.id = 'journeyOrigin';
            originAutocomplete.placeholder = 'Enter origin location';
        } catch (error) {
            console.warn('PlaceAutocompleteElement initialization error (user can still type addresses):', error);
            // Fallback: user can still type addresses manually
        }
    }
    
    if (destinationInput) {
        try {
            // Use new PlaceAutocompleteElement API
            const destinationAutocomplete = new google.maps.places.PlaceAutocompleteElement({
                componentRestrictions: { country: 'mw' }, // Restrict to Malawi
            });
            
            destinationAutocomplete.addEventListener('gmp-placeselect', async ({ place }) => {
                await place.fetchFields({
                    fields: ['displayName', 'formattedAddress', 'location']
                });
                
                if (place.location) {
                    journeyMap.setCenter(place.location);
                }
            });
            
            // Replace the input with the autocomplete element
            destinationInput.parentNode.replaceChild(destinationAutocomplete, destinationInput);
            destinationAutocomplete.id = 'journeyDestination';
            destinationAutocomplete.placeholder = 'Enter destination location';
        } catch (error) {
            console.warn('PlaceAutocompleteElement initialization error (user can still type addresses):', error);
            // Fallback: user can still type addresses manually
        }
    }
}

async function loadFuelPrices() {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=get_fuel_prices`);
        const data = await response.json();
        
        if (data.success && data.prices) {
            data.prices.forEach(price => {
                currentFuelPrices[price.fuel_type] = price.price_per_liter_mwk;
            });
            
            // Display fuel prices in the UI
            displayFuelPrices(data.prices);
        }
    } catch (error) {
        console.error('Error loading fuel prices:', error);
    }
}

function displayFuelPrices(prices) {
    const displayContainer = document.getElementById('fuelPricesDisplay');
    const updateTimeContainer = document.getElementById('fuelPricesUpdateTime');
    
    if (!displayContainer) return;
    
    if (prices.length === 0) {
        displayContainer.innerHTML = '<div style="color: #666;">No fuel prices available</div>';
        if (updateTimeContainer) updateTimeContainer.textContent = 'Not available';
        return;
    }
    
    // Find the most recent update time
    let mostRecentUpdate = null;
    prices.forEach(price => {
        if (price.last_updated) {
            const updateTime = new Date(price.last_updated);
            if (!mostRecentUpdate || updateTime > mostRecentUpdate) {
                mostRecentUpdate = updateTime;
            }
        }
    });
    
    // Display prices
    let html = '';
    prices.forEach(price => {
        const fuelTypeName = price.fuel_type.charAt(0).toUpperCase() + price.fuel_type.slice(1);
        html += `
            <div style="padding: 10px 15px; background: white; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="font-weight: bold; color: #333; margin-bottom: 5px;">${fuelTypeName}</div>
                <div style="font-size: 1.2rem; color: #28a745; font-weight: bold;">MWK ${parseFloat(price.price_per_liter_mwk).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}/L</div>
            </div>
        `;
    });
    displayContainer.innerHTML = html;
    
    // Display last updated time
    if (updateTimeContainer && mostRecentUpdate) {
        const now = new Date();
        const diffMs = now - mostRecentUpdate;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        let timeText = '';
        if (diffHours > 0) {
            timeText = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else if (diffMinutes > 0) {
            timeText = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        } else {
            timeText = 'Just now';
        }
        
        updateTimeContainer.textContent = timeText + ' (' + mostRecentUpdate.toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        }) + ')';
    } else if (updateTimeContainer) {
        updateTimeContainer.textContent = 'Not available';
    }
}

async function calculateJourney() {
    const origin = document.getElementById('journeyOrigin').value.trim();
    const destination = document.getElementById('journeyDestination').value.trim();
    const vehicleId = document.getElementById('journeyVehicle').value;
    const fuelConsumption = document.getElementById('journeyFuelConsumption').value;
    
    if (!origin || !destination) {
        alert('Please enter both origin and destination');
        return;
    }
    
    const calculateBtn = document.getElementById('calculateJourneyBtn');
    const originalText = calculateBtn.innerHTML;
    calculateBtn.disabled = true;
    calculateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
    
    try {
        // Get route from Google Maps
        const route = await getRoute(origin, destination);
        
        if (!route) {
            throw new Error('Could not calculate route');
        }
        
        const distanceKm = route.distance.value / 1000; // Convert to km
        const durationMinutes = Math.round(route.duration.value / 60);
        
        // Get vehicle details if selected
        let vehicleFuelType = 'petrol';
        let vehicleFuelConsumption = null;
        
        if (vehicleId) {
            const vehicleSelect = document.getElementById('journeyVehicle');
            const selectedOption = vehicleSelect.options[vehicleSelect.selectedIndex];
            if (selectedOption) {
                vehicleFuelType = selectedOption.dataset.fuelType || 'petrol';
                vehicleFuelConsumption = selectedOption.dataset.fuelConsumption || null;
            }
        }
        
        // Use provided fuel consumption or vehicle's default
        const finalFuelConsumption = fuelConsumption || vehicleFuelConsumption || (vehicleFuelType === 'diesel' ? 8.5 : 9.5);
        
        // Calculate fuel cost
        const fuelPrice = currentFuelPrices[vehicleFuelType] || (vehicleFuelType === 'diesel' ? 1950.00 : 1850.00);
        const fuelNeeded = (distanceKm / 100) * parseFloat(finalFuelConsumption);
        const fuelCost = fuelNeeded * fuelPrice;
        
        // Display results
        displayJourneyResults({
            origin: origin,
            destination: destination,
            distanceKm: distanceKm,
            durationMinutes: durationMinutes,
            fuelType: vehicleFuelType,
            fuelConsumption: finalFuelConsumption,
            fuelNeeded: fuelNeeded,
            fuelPrice: fuelPrice,
            fuelCost: fuelCost,
            originLat: route.start_location.lat(),
            originLng: route.start_location.lng(),
            destinationLat: route.end_location.lat(),
            destinationLng: route.end_location.lng()
        });
        
        // Save to history
        try {
            await saveJourneyToHistory({
                vehicle_id: vehicleId || null,
                origin: origin,
                destination: destination,
                distance_km: distanceKm,
                duration_minutes: durationMinutes,
                fuel_type: vehicleFuelType,
                fuel_consumption: finalFuelConsumption,
                origin_lat: route.start_location.lat(),
                origin_lng: route.start_location.lng(),
                destination_lat: route.end_location.lat(),
                destination_lng: route.end_location.lng(),
                save_to_history: true
            });
        } catch (error) {
            console.error('Error saving journey to history:', error);
        }
        
    } catch (error) {
        console.error('Error calculating journey:', error);
        alert('Error calculating journey: ' + error.message);
    } finally {
        calculateBtn.disabled = false;
        calculateBtn.innerHTML = originalText;
    }
}

async function getRoute(origin, destination) {
    try {
        if (!google || !google.maps) {
            throw new Error('Google Maps is not available. Please refresh the page.');
        }

        let RouteApi = google.maps?.routes?.Route;
        if (!RouteApi && typeof google.maps.importLibrary === 'function') {
            const routesLib = await google.maps.importLibrary('routes');
            RouteApi = routesLib?.Route;
        }

        if (RouteApi && typeof RouteApi.computeRoutes === 'function') {
            const routesResult = await RouteApi.computeRoutes({
                origin: { address: origin },
                destination: { address: destination },
                travelMode: 'DRIVE',
                regionCode: 'MW'
            });

            const primaryRoute = routesResult?.routes?.[0];
            const primaryLeg = primaryRoute?.legs?.[0];
            if (!primaryRoute || !primaryLeg) {
                throw new Error('No route found');
            }

            const startLoc = normalizeRouteLocation(primaryLeg.startLocation);
            const endLoc = normalizeRouteLocation(primaryLeg.endLocation);
            renderComputedRoute(primaryRoute, startLoc, endLoc);

            return {
                distance: { value: primaryRoute.distanceMeters ?? primaryLeg.distanceMeters ?? 0 },
                duration: { value: parseRouteDurationSeconds(primaryRoute.duration ?? primaryLeg.duration) },
                start_location: {
                    lat: () => startLoc.lat,
                    lng: () => startLoc.lng
                },
                end_location: {
                    lat: () => endLoc.lat,
                    lng: () => endLoc.lng
                }
            };
        }
    } catch (routesError) {
        console.warn('Routes API computeRoutes failed, attempting legacy fallback:', routesError);
    }

    // Fallback path for older Maps runtimes where Routes library isn't available yet.
    return new Promise((resolve, reject) => {
        if (!directionsService) {
            if (typeof google !== 'undefined' && google.maps && google.maps.DirectionsService) {
                directionsService = new google.maps.DirectionsService();
            } else {
                reject(new Error('Route service not available. Please refresh the page.'));
                return;
            }
        }

        directionsService.route({
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC
        }, (result, status) => {
            if (status === 'OK' && result.routes && result.routes.length > 0) {
                const route = result.routes[0].legs[0];
                const path = result.routes[0].overview_path || [];
                renderPathOnMap(path, route.start_location, route.end_location);
                resolve(route);
            } else {
                reject(new Error('Route calculation failed: ' + status));
            }
        });
    });
}

function parseRouteDurationSeconds(durationValue) {
    if (typeof durationValue === 'number') {
        return durationValue;
    }
    if (typeof durationValue === 'string') {
        const cleaned = durationValue.trim();
        if (cleaned.endsWith('s')) {
            return parseInt(cleaned.slice(0, -1), 10) || 0;
        }
        return parseInt(cleaned, 10) || 0;
    }
    return 0;
}

function normalizeRouteLocation(locationObj) {
    if (!locationObj) {
        return { lat: -13.9626, lng: 33.7741 };
    }

    if (typeof locationObj.lat === 'function' && typeof locationObj.lng === 'function') {
        return { lat: locationObj.lat(), lng: locationObj.lng() };
    }

    if (typeof locationObj.lat === 'number' && typeof locationObj.lng === 'number') {
        return { lat: locationObj.lat, lng: locationObj.lng };
    }

    const latLng = locationObj.latLng || locationObj.location || null;
    if (latLng) {
        if (typeof latLng.lat === 'function' && typeof latLng.lng === 'function') {
            return { lat: latLng.lat(), lng: latLng.lng() };
        }
        if (typeof latLng.lat === 'number' && typeof latLng.lng === 'number') {
            return { lat: latLng.lat, lng: latLng.lng };
        }
        if (typeof latLng.latitude === 'number' && typeof latLng.longitude === 'number') {
            return { lat: latLng.latitude, lng: latLng.longitude };
        }
    }

    return { lat: -13.9626, lng: 33.7741 };
}

function renderComputedRoute(routeObj, startLoc, endLoc) {
    if (!journeyMap) return;

    let decodedPath = [];
    const encodedPolyline = routeObj?.polyline?.encodedPolyline;
    if (encodedPolyline && google.maps.geometry && google.maps.geometry.encoding) {
        decodedPath = google.maps.geometry.encoding.decodePath(encodedPolyline);
    }

    if (decodedPath.length === 0) {
        decodedPath = [startLoc, endLoc];
    }

    renderPathOnMap(decodedPath, startLoc, endLoc);
}

function renderPathOnMap(path, startLoc, endLoc) {
    if (!journeyMap) return;

    if (journeyRoutePolyline) {
        journeyRoutePolyline.setMap(null);
    }

    journeyRouteMarkers.forEach(marker => marker.setMap(null));
    journeyRouteMarkers = [];

    journeyRoutePolyline = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#1a73e8',
        strokeOpacity: 0.9,
        strokeWeight: 5,
        map: journeyMap
    });

    const startMarker = new google.maps.Marker({
        position: startLoc,
        map: journeyMap,
        label: 'A'
    });

    const endMarker = new google.maps.Marker({
        position: endLoc,
        map: journeyMap,
        label: 'B'
    });

    journeyRouteMarkers.push(startMarker, endMarker);

    const bounds = new google.maps.LatLngBounds();
    const points = Array.isArray(path) && path.length ? path : [startLoc, endLoc];
    points.forEach(point => bounds.extend(point));
    journeyMap.fitBounds(bounds, 60);
}

function displayJourneyResults(results) {
    const container = document.getElementById('journeyResults');
    if (!container) return;
    
    container.style.display = 'block';
    container.innerHTML = `
        <div class="journey-results-card">
            <h3><i class="fas fa-route"></i> Journey Calculation Results</h3>
            
            <div class="results-grid">
                <div class="result-item">
                    <div class="result-label">Distance</div>
                    <div class="result-value">${results.distanceKm.toFixed(1)} km</div>
                </div>
                <div class="result-item">
                    <div class="result-label">Duration</div>
                    <div class="result-value">${formatDuration(results.durationMinutes)}</div>
                </div>
                <div class="result-item">
                    <div class="result-label">Fuel Needed</div>
                    <div class="result-value">${results.fuelNeeded.toFixed(2)} L</div>
                </div>
                <div class="result-item">
                    <div class="result-label">Fuel Price</div>
                    <div class="result-value">MWK ${parseFloat(results.fuelPrice || 0).toFixed(2)}/L</div>
                </div>
                <div class="result-item">
                    <div class="result-label">Total Fuel Cost</div>
                    <div class="result-value large">MWK ${parseFloat(results.fuelCost || 0).toFixed(2)}</div>
                </div>
                <div class="result-item">
                    <div class="result-label">Fuel Type</div>
                    <div class="result-value">${results.fuelType.charAt(0).toUpperCase() + results.fuelType.slice(1)}</div>
                </div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 6px;">
                <h4 style="margin-top: 0;"><i class="fas fa-info-circle"></i> Journey Details</h4>
                <p><strong>From:</strong> ${results.origin}</p>
                <p><strong>To:</strong> ${results.destination}</p>
                <p><strong>Fuel Consumption:</strong> ${results.fuelConsumption} L/100km</p>
                <p style="margin-bottom: 0;"><strong>Last Updated:</strong> ${new Date().toLocaleString()}</p>
            </div>
        </div>
    `;
    
    // Scroll to results
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function formatDuration(minutes) {
    if (minutes < 60) {
        return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
}

async function saveJourneyToHistory(journeyData) {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=calculate_journey`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(journeyData)
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error saving journey:', error);
        throw error;
    }
}

// Initialize when Google Maps API loads
if (typeof google !== 'undefined' && google.maps) {
    document.addEventListener('DOMContentLoaded', initializeJourneyPlanner);
}


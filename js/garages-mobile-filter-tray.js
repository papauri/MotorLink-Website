/**
 * Garages Mobile Filter Tray Controller
 * Handles the side-sliding filter tray for mobile devices on garages page
 */

(function() {
    'use strict';
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGaragesMobileFilterTray);
    } else {
        initGaragesMobileFilterTray();
    }
    
    function initGaragesMobileFilterTray() {
        // Only initialize on mobile devices
        if (window.innerWidth > 768) {
            return;
        }
        
        const fab = document.getElementById('mobileFilterFab');
        const overlay = document.getElementById('mobileFilterOverlay');
        const tray = document.getElementById('mobileFilterTray');
        const closeBtn = document.getElementById('mobileFilterTrayClose');
        const trayContent = document.querySelector('.mobile-filter-tray-content');
        const garageFiltersContainer = document.querySelector('.garage-filters-container');
        const applyBtn = document.querySelector('.btn-apply-filters-mobile');
        const clearBtn = document.querySelector('.btn-clear-filters-mobile');
        
        if (!fab || !overlay || !tray || !trayContent || !garageFiltersContainer) {
            return;
        }
        
        // Clone garage filters into tray
        cloneFiltersToTray();
        
        // Open tray
        fab.addEventListener('click', openTray);
        
        // Close tray
        closeBtn.addEventListener('click', closeTray);
        overlay.addEventListener('click', closeTray);
        
        // Apply filters
        if (applyBtn) {
            applyBtn.addEventListener('click', function(e) {
                e.preventDefault();
                applyFilters();
                closeTray();
            });
        }
        
        // Clear filters
        if (clearBtn) {
            clearBtn.addEventListener('click', function(e) {
                e.preventDefault();
                clearFilters();
            });
        }
        
        // Handle escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && tray.classList.contains('active')) {
                closeTray();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && tray.classList.contains('active')) {
                closeTray();
            }
        });
        
    }
    
    function cloneFiltersToTray() {
        const garageFiltersContainer = document.querySelector('.garage-filters-container');
        const trayContent = document.querySelector('.mobile-filter-tray-content');
        
        if (!garageFiltersContainer || !trayContent) return;
        
        // Clone the filter form from garage filters
        const filterForm = garageFiltersContainer.querySelector('#garageFilterForm');
        if (filterForm) {
            // Clone the entire form
            const clonedForm = filterForm.cloneNode(true);
            
            // Update IDs to avoid conflicts
            clonedForm.id = 'mobileGarageFilterForm';
            
            // Update all input/select IDs
            const inputs = clonedForm.querySelectorAll('input, select, button');
            inputs.forEach(input => {
                if (input.id) {
                    input.id = 'mobile-' + input.id;
                }
            });
            
            // Remove the filter actions from cloned form (we have separate buttons)
            const filterActions = clonedForm.querySelector('.filter-actions');
            if (filterActions) {
                filterActions.remove();
            }
            
            // Clear previous content and add cloned form
            trayContent.innerHTML = '';
            trayContent.appendChild(clonedForm);
            
            // Sync values between desktop and mobile tray
            syncFiltersToTray();
        }
    }
    
    function syncFiltersToTray() {
        const desktopForm = document.querySelector('#garageFilterForm');
        const trayForm = document.querySelector('#mobileGarageFilterForm');
        
        if (!desktopForm || !trayForm) return;
        
        // Get all inputs from desktop and match by ID pattern
        const desktopInputs = desktopForm.querySelectorAll('input, select');
        
        desktopInputs.forEach(desktopInput => {
            if (desktopInput.id) {
                // Find corresponding mobile input by ID
                const mobileId = 'mobile-' + desktopInput.id;
                const mobileInput = trayForm.querySelector('#' + mobileId);
                if (mobileInput) {
                    mobileInput.value = desktopInput.value;
                }
            }
        });
    }
    
    function syncFiltersFromTray() {
        const desktopForm = document.querySelector('#garageFilterForm');
        const trayForm = document.querySelector('#mobileGarageFilterForm');
        
        if (!desktopForm || !trayForm) return;
        
        // Set a flag to prevent instant filtering when syncing from mobile
        window.syncingFromMobileTray = true;
        
        // Get all inputs from mobile tray and match by ID pattern
        const trayInputs = trayForm.querySelectorAll('input, select');
        
        trayInputs.forEach(trayInput => {
            if (trayInput.id && trayInput.id.startsWith('mobile-')) {
                // Find corresponding desktop input by removing 'mobile-' prefix
                const desktopId = trayInput.id.replace('mobile-', '');
                const desktopInput = desktopForm.querySelector('#' + desktopId);
                if (desktopInput) {
                    // Temporarily disable the input to prevent change event
                    const wasDisabled = desktopInput.disabled;
                    desktopInput.disabled = true;
                    desktopInput.value = trayInput.value;
                    desktopInput.disabled = wasDisabled;
                }
            }
        });
        
        // Clear the flag after a brief delay
        setTimeout(() => {
            window.syncingFromMobileTray = false;
        }, 100);
    }
    
    function openTray() {
        const overlay = document.getElementById('mobileFilterOverlay');
        const tray = document.getElementById('mobileFilterTray');
        const body = document.body;
        
        // Re-clone filters to ensure all dynamic data (districts, brands, services) is up to date
        cloneFiltersToTray();
        
        // Sync current filter values to tray
        syncFiltersToTray();
        
        // Repopulate dynamic filters in mobile tray
        repopulateMobileFilters();
        
        // Activate overlay and tray
        overlay.classList.add('active');
        tray.classList.add('active');
        
        // Prevent body scroll
        body.style.overflow = 'hidden';
    }
    
    async function repopulateMobileFilters() {
        const trayForm = document.querySelector('#mobileGarageFilterForm');
        if (!trayForm) return;
        
        // Repopulate districts
        const mobileDistrictFilter = trayForm.querySelector('#mobile-districtFilter');
        if (mobileDistrictFilter) {
            try {
                const response = await fetch(`${CONFIG.API_URL}?action=locations`);
                const data = await response.json();
                
                if (data.success) {
                    // Clear existing options except the first one
                    while (mobileDistrictFilter.options.length > 1) {
                        mobileDistrictFilter.remove(1);
                    }
                    
                    // Create a set to store unique districts
                    const uniqueDistricts = new Set();
                    
                    data.locations.forEach(location => {
                        if (location.district && !uniqueDistricts.has(location.district)) {
                            uniqueDistricts.add(location.district);
                            const option = document.createElement('option');
                            option.value = location.district;
                            option.textContent = location.district;
                            mobileDistrictFilter.appendChild(option);
                        }
                    });
                }
            } catch (error) {
                console.error('Failed to load districts for mobile filter:', error);
            }
        }
        
        // Repopulate car brands
        const mobileCarBrandFilter = trayForm.querySelector('#mobile-carBrandFilter');
        if (mobileCarBrandFilter) {
            try {
                const response = await fetch(`${CONFIG.API_URL}?action=garages`);
                const data = await response.json();
                
                if (data.success && data.garages && data.garages.length > 0) {
                    const allBrands = new Set();
                    
                    data.garages.forEach(garage => {
                        if (garage.specializes_in_cars) {
                            try {
                                const brands = typeof garage.specializes_in_cars === 'string' 
                                    ? JSON.parse(garage.specializes_in_cars) 
                                    : garage.specializes_in_cars;
                                
                                if (Array.isArray(brands)) {
                                    brands.forEach(brand => {
                                        if (brand && brand.trim()) {
                                            allBrands.add(brand.trim());
                                        }
                                    });
                                }
                            } catch (e) {
                                // Ignore parse errors
                            }
                        }
                    });
                    
                    // Clear existing options except the first one
                    while (mobileCarBrandFilter.options.length > 1) {
                        mobileCarBrandFilter.remove(1);
                    }
                    
                    // Add brands alphabetically
                    const sortedBrands = Array.from(allBrands).sort();
                    sortedBrands.forEach(brand => {
                        const option = document.createElement('option');
                        option.value = brand;
                        option.textContent = brand;
                        mobileCarBrandFilter.appendChild(option);
                    });
                }
            } catch (error) {
                console.error('Failed to load car brands for mobile filter:', error);
            }
        }
        
        // Repopulate services (matches loadServicesFromDatabase logic)
        const mobileServiceFilter = trayForm.querySelector('#mobile-serviceFilter');
        if (mobileServiceFilter) {
            try {
                const response = await fetch(`${CONFIG.API_URL}?action=garages`);
                const data = await response.json();
                
                if (data.success && data.garages && data.garages.length > 0) {
                    const allServices = new Set();
                    
                    data.garages.forEach(garage => {
                        // Regular services (matches desktop logic)
                        if (garage.services) {
                            try {
                                const services = typeof garage.services === 'string' 
                                    ? JSON.parse(garage.services) 
                                    : garage.services;
                                
                                if (Array.isArray(services)) {
                                    services.forEach(service => {
                                        if (service && service.trim()) {
                                            allServices.add(service.trim());
                                        }
                                    });
                                }
                            } catch (e) {
                                // Ignore parse errors
                            }
                        }
                    });
                    
                    // Clear existing options except the first one
                    while (mobileServiceFilter.options.length > 1) {
                        mobileServiceFilter.remove(1);
                    }
                    
                    // Add services alphabetically
                    const sortedServices = Array.from(allServices).sort();
                    sortedServices.forEach(service => {
                        const option = document.createElement('option');
                        option.value = service;
                        option.textContent = service;
                        mobileServiceFilter.appendChild(option);
                    });
                }
            } catch (error) {
                console.error('Failed to load services for mobile filter:', error);
            }
        }
        
        // Repopulate emergency services filter
        const mobileEmergencyFilter = trayForm.querySelector('#mobile-emergencyFilter');
        if (mobileEmergencyFilter) {
            try {
                const response = await fetch(`${CONFIG.API_URL}?action=garages`);
                const data = await response.json();
                
                if (data.success && data.garages && data.garages.length > 0) {
                    const allEmergencyServices = new Set();
                    
                    data.garages.forEach(garage => {
                        // Emergency services (matches desktop logic)
                        if (garage.emergency_services) {
                            try {
                                const emergencyServices = typeof garage.emergency_services === 'string' 
                                    ? JSON.parse(garage.emergency_services) 
                                    : garage.emergency_services;
                                
                                if (Array.isArray(emergencyServices)) {
                                    emergencyServices.forEach(service => {
                                        if (service && service.trim()) {
                                            allEmergencyServices.add(service.trim());
                                        }
                                    });
                                }
                            } catch (e) {
                                // Ignore parse errors
                            }
                        }
                    });
                    
                    // Clear existing options except the first one
                    while (mobileEmergencyFilter.options.length > 1) {
                        mobileEmergencyFilter.remove(1);
                    }
                    
                    // Add emergency services alphabetically
                    const sortedEmergencyServices = Array.from(allEmergencyServices).sort();
                    sortedEmergencyServices.forEach(service => {
                        const option = document.createElement('option');
                        option.value = service;
                        option.textContent = service;
                        mobileEmergencyFilter.appendChild(option);
                    });
                }
            } catch (error) {
                console.error('Failed to load emergency services for mobile filter:', error);
            }
        }
    }
    
    function closeTray() {
        const overlay = document.getElementById('mobileFilterOverlay');
        const tray = document.getElementById('mobileFilterTray');
        const body = document.body;
        
        // Deactivate overlay and tray
        overlay.classList.remove('active');
        tray.classList.remove('active');
        
        // Restore body scroll
        body.style.overflow = '';
    }
    
    function applyFilters() {
        // Sync filters from tray to desktop first
        syncFiltersFromTray();
        
        // Wait a moment for sync to complete, then load garages directly
        // This ensures filters are applied even if desktop button doesn't work
        setTimeout(() => {
            // Clear the syncing flag before loading
            window.syncingFromMobileTray = false;
            
            // Load garages directly - use window.loadGarages which is globally accessible
            if (typeof window.loadGarages === 'function') {
                window.loadGarages();
            } else {
                // Fallback: trigger the desktop apply filters button
                const desktopApplyBtn = document.querySelector('#applyFiltersBtn');
                if (desktopApplyBtn) {
                    desktopApplyBtn.click();
                }
            }
        }, 150);
        
        // Show a brief feedback
        showFilterFeedback('Filters applied');
    }
    
    function clearFilters() {
        const trayForm = document.querySelector('#mobileGarageFilterForm');
        if (trayForm) {
            // Reset all inputs
            const inputs = trayForm.querySelectorAll('input, select');
            inputs.forEach(input => {
                if (input.type === 'text' || input.type === 'number') {
                    input.value = '';
                } else if (input.tagName === 'SELECT') {
                    input.selectedIndex = 0;
                }
            });
            
            // Sync to desktop and apply
            syncFiltersFromTray();
            
            // Trigger clear on main form
            const desktopClearBtn = document.querySelector('#clearFiltersBtn');
            if (desktopClearBtn) {
                desktopClearBtn.click();
            }
            
            showFilterFeedback('Filters cleared');
        }
    }
    
    function showFilterFeedback(message) {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.className = 'filter-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 200, 83, 0.95);
            color: white;
            padding: 12px 24px;
            border-radius: 24px;
            font-size: 14px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        // Fade in
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 10);
        
        // Fade out and remove
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 2000);
    }
    
    // Re-initialize if the page changes dynamically
    window.reinitGaragesMobileFilterTray = initGaragesMobileFilterTray;
    
})();

/**
 * Mobile Filter Tray Controller
 * Handles the side-sliding filter tray for mobile devices
 */

(function() {
    'use strict';
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileFilterTray);
    } else {
        initMobileFilterTray();
    }
    
    function initMobileFilterTray() {
        // Only initialize on mobile devices
        if (window.innerWidth > 768) {
            return;
        }
        
        const fab = document.getElementById('mobileFilterFab');
        const staticFilterBtn = document.getElementById('mobileFilterStaticBtn');
        const overlay = document.getElementById('mobileFilterOverlay');
        const tray = document.getElementById('mobileFilterTray');
        const closeBtn = document.getElementById('mobileFilterTrayClose');
        const trayContent = document.querySelector('.mobile-filter-tray-content');
        const filterContainer = document.querySelector('.sidebar') ||
                               document.querySelector('.dealers-filters') ||
                               document.querySelector('.filter-section') ||
                               document.querySelector('.filters');
        const applyBtn = document.querySelector('.btn-apply-filters-mobile');
        const clearBtn = document.querySelector('.btn-clear-filters-mobile');

        if (!overlay || !tray || !trayContent || !filterContainer) {
            return;
        }

        // Clone sidebar content into tray
        cloneSidebarToTray();

        // Open tray - both FAB and static button
        if (fab) {
            fab.addEventListener('click', openTray);
        }
        if (staticFilterBtn) {
            staticFilterBtn.addEventListener('click', openTray);
        }
        
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
    
    function cloneSidebarToTray() {
        // Try to find filter container - could be .sidebar, .dealers-filters, or .filter-section
        const filterContainer = document.querySelector('.sidebar') || 
                              document.querySelector('.dealers-filters') || 
                              document.querySelector('.filter-section') ||
                              document.querySelector('.filters');
        const trayContent = document.querySelector('.mobile-filter-tray-content');
        
        if (!filterContainer || !trayContent) return;
        
        // Clone the filter form from container
        const filterForm = filterContainer.querySelector('#filterForm') ||
                          filterContainer.querySelector('form') ||
                          filterContainer.querySelector('.filter-bar');
        
        if (filterForm) {
            // Clone the entire form or filter structure
            const clonedForm = filterForm.cloneNode(true);
            
            // Update IDs to avoid conflicts
            if (clonedForm.id) {
                clonedForm.id = 'mobile-' + clonedForm.id;
            }
            
            // Update all input/select IDs
            const inputs = clonedForm.querySelectorAll('input, select');
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
            
            // Sync values between container and tray
            syncFiltersToTray();
        } else {
            // If no form found, clone all filter groups
            const filterGroups = filterContainer.querySelectorAll('.filter-group');
            if (filterGroups.length > 0) {
                trayContent.innerHTML = '';
                filterGroups.forEach(group => {
                    const clonedGroup = group.cloneNode(true);
                    trayContent.appendChild(clonedGroup);
                });
                syncFiltersToTray();
            }
        }
    }
    
    function syncFiltersToTray() {
        // Find the original filter container
        const filterContainer = document.querySelector('.sidebar') || 
                               document.querySelector('.dealers-filters') || 
                               document.querySelector('.filter-section') ||
                               document.querySelector('.filters');
        const trayContent = document.querySelector('.mobile-filter-tray-content');
        
        if (!filterContainer || !trayContent) return;
        
        // Get all inputs from filter container
        const containerInputs = filterContainer.querySelectorAll('input, select');
        const trayInputs = trayContent.querySelectorAll('input, select');
        
        // Copy values from container to tray using name attribute for matching
        containerInputs.forEach((containerInput) => {
            const name = containerInput.name || containerInput.id;
            if (!name) return;
            
            // Find matching input in tray
            const trayInput = Array.from(trayInputs).find(input => {
                return (input.name === name) || (input.id && input.id.replace('mobile-', '') === containerInput.id);
            });
            
            if (trayInput) {
                trayInput.value = containerInput.value;
                if (containerInput.type === 'checkbox' || containerInput.type === 'radio') {
                    trayInput.checked = containerInput.checked;
                }
            }
        });
    }
    
    function syncFiltersFromTray() {
        // Find the original filter container
        const filterContainer = document.querySelector('.sidebar') || 
                               document.querySelector('.dealers-filters') || 
                               document.querySelector('.filter-section') ||
                               document.querySelector('.filters');
        const trayContent = document.querySelector('.mobile-filter-tray-content');
        
        if (!filterContainer || !trayContent) return;
        
        // Get all inputs
        const containerInputs = filterContainer.querySelectorAll('input, select');
        const trayInputs = trayContent.querySelectorAll('input, select');
        
        // Copy values from tray to container using name attribute for matching
        trayInputs.forEach((trayInput) => {
            const name = trayInput.name || trayInput.id?.replace('mobile-', '');
            if (!name) return;
            
            // Find matching input in container
            const containerInput = Array.from(containerInputs).find(input => {
                return (input.name === name) || (input.id === trayInput.id?.replace('mobile-', ''));
            });
            
            if (containerInput) {
                containerInput.value = trayInput.value;
                if (trayInput.type === 'checkbox' || trayInput.type === 'radio') {
                    containerInput.checked = trayInput.checked;
                }
            }
        });
    }
    
    function openTray() {
        const overlay = document.getElementById('mobileFilterOverlay');
        const tray = document.getElementById('mobileFilterTray');
        const body = document.body;
        
        // Re-clone to ensure we have the latest structure
        cloneSidebarToTray();
        
        // Repopulate dropdowns in mobile tray (makes, locations, models)
        repopulateMobileDropdowns();
        
        // Sync current filter values to tray
        syncFiltersToTray();
        
        // Activate overlay and tray
        overlay.classList.add('active');
        tray.classList.add('active');
        
        // Prevent body scroll
        body.style.overflow = 'hidden';
        
        // DO NOT auto-focus on mobile to prevent keyboard popup
        // Focus trap removed to improve mobile UX
        // Users can manually tap the field they want to edit
    }
    
    async function repopulateMobileDropdowns() {
        const trayContent = document.querySelector('.mobile-filter-tray-content');
        if (!trayContent) return;
        
        // Repopulate Makes dropdown
        const mobileMakeFilter = trayContent.querySelector('#mobile-makeFilter') || trayContent.querySelector('select[name="make"]');
        if (mobileMakeFilter) {
            try {
                // Get makes from MotorLink instance or API
                if (typeof motorLink !== 'undefined' && motorLink.makes && motorLink.makes.length > 0) {
                    // Clear existing options except first one
                    while (mobileMakeFilter.options.length > 1) {
                        mobileMakeFilter.remove(1);
                    }
                    
                    motorLink.makes.forEach(make => {
                        const option = document.createElement('option');
                        option.value = make.id;
                        option.textContent = make.name;
                        mobileMakeFilter.appendChild(option);
                    });
                } else {
                    // Fallback: fetch from API
                    const response = await fetch(`${CONFIG.API_URL}?action=makes`);
                    const data = await response.json();
                    
                    if (data.success && data.makes) {
                        while (mobileMakeFilter.options.length > 1) {
                            mobileMakeFilter.remove(1);
                        }
                        
                        data.makes.forEach(make => {
                            const option = document.createElement('option');
                            option.value = make.id;
                            option.textContent = make.name;
                            mobileMakeFilter.appendChild(option);
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to load makes for mobile filter:', error);
            }
        }
        
        // Repopulate Locations dropdown
        const mobileLocationFilter = trayContent.querySelector('#mobile-locationFilter') || trayContent.querySelector('select[name="location"]');
        if (mobileLocationFilter) {
            try {
                if (typeof motorLink !== 'undefined' && motorLink.loadLocations) {
                    // Use MotorLink's loadLocations but target mobile select
                    const response = await motorLink.makeAPICall('locations');
                    
                    if (response.success && Array.isArray(response.locations)) {
                        while (mobileLocationFilter.options.length > 1) {
                            mobileLocationFilter.remove(1);
                        }
                        
                        response.locations.forEach(location => {
                            const option = document.createElement('option');
                            option.value = location.name;
                            option.textContent = `${location.name}, ${location.region}`;
                            mobileLocationFilter.appendChild(option);
                        });
                    }
                } else {
                    // Fallback: fetch from API
                    const response = await fetch(`${CONFIG.API_URL}?action=locations`);
                    const data = await response.json();
                    
                    if (data.success && data.locations) {
                        while (mobileLocationFilter.options.length > 1) {
                            mobileLocationFilter.remove(1);
                        }
                        
                        data.locations.forEach(location => {
                            const option = document.createElement('option');
                            option.value = location.name;
                            option.textContent = `${location.name}, ${location.region}`;
                            mobileLocationFilter.appendChild(option);
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to load locations for mobile filter:', error);
            }
        }
        
        // Repopulate Models dropdown if a make is selected
        const mobileModelFilter = trayContent.querySelector('#mobile-modelFilter') || trayContent.querySelector('select[name="model"]');
        const desktopMakeFilter = document.querySelector('#makeFilter') || document.querySelector('select[name="make"]');
        
        if (mobileModelFilter && desktopMakeFilter && desktopMakeFilter.value) {
            try {
                if (typeof motorLink !== 'undefined' && motorLink.loadModels) {
                    await motorLink.loadModels(desktopMakeFilter.value, mobileModelFilter);
                }
            } catch (error) {
                console.error('Failed to load models for mobile filter:', error);
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
        // Sync filters from tray to original container FIRST
        syncFiltersFromTray();
        
        // Wait a brief moment for sync to complete
        setTimeout(() => {
                // For showroom.html - use ShowroomManager instance
                if (window.showroomManager && typeof window.showroomManager.filterAndSortCars === 'function') {
                    window.showroomManager.filterAndSortCars();
                    showFilterFeedback('Filters applied');
                    return;
                }

                // For index.html - use MotorLink instance (highest priority)
                if (typeof motorLink !== 'undefined' && motorLink.applyFilters) {
                    motorLink.applyFilters();
                    showFilterFeedback('Filters applied');
                    return;
                }
            
            // For dealers.html - check for dealers page
            const dealerSearch = document.getElementById('dealerSearch');
            const dealersGrid = document.getElementById('dealersGrid');
            if (dealerSearch && dealersGrid) {
                // This is dealers page - use DealersManager instance
                if (window.dealersManager && typeof window.dealersManager.applyFilters === 'function') {
                    window.dealersManager.applyFilters();
                    showFilterFeedback('Filters applied');
                    return;
                }
                // Fallback: trigger the apply button
                const applyBtn = document.getElementById('applyFilters');
                if (applyBtn) {
                    applyBtn.click();
                    showFilterFeedback('Filters applied');
                    return;
                }
            }
            
            // For car-hire.html - check for car hire page (has global applyFilters function)
            const carHireStats = document.querySelector('.car-hire-stats');
            const locationFilter = document.getElementById('locationFilter');
            if (carHireStats && locationFilter) {
                // This is car-hire page - call global applyFilters function
                if (typeof window.applyFilters === 'function') {
                    window.applyFilters();
                    showFilterFeedback('Filters applied');
                    return;
                }
            }
            
            // Try to find and trigger the filter form submission
            const filterForm = document.querySelector('#filterForm') || 
                              document.querySelector('.filter-bar form') ||
                              document.querySelector('.dealers-filters form') ||
                              document.querySelector('.filter-section form');
            
            if (filterForm) {
                // Trigger submit event
                const submitEvent = new Event('submit', {
                    bubbles: true,
                    cancelable: true
                });
                filterForm.dispatchEvent(submitEvent);
            }
            
            // If there's an apply filters button, click it
            const applyBtn = document.querySelector('#applyFilters') ||
                            document.querySelector('.btn-filter') ||
                            document.querySelector('.btn-apply-filters');
            if (applyBtn && typeof applyBtn.click === 'function') {
                applyBtn.click();
            }
            
            // If there's a global applyFilters function, call it (fallback)
            if (typeof window.applyFilters === 'function') {
                window.applyFilters();
            }
            
            // Show a brief feedback
            showFilterFeedback('Filters applied');
        }, 50);
    }
    
    function clearFilters() {
        const trayContent = document.querySelector('.mobile-filter-tray-content');
        if (trayContent) {
            // Reset all inputs
            const inputs = trayContent.querySelectorAll('input, select');
            inputs.forEach(input => {
                if (input.type === 'text' || input.type === 'number') {
                    input.value = '';
                } else if (input.tagName === 'SELECT') {
                    input.selectedIndex = 0;
                } else if (input.type === 'checkbox' || input.type === 'radio') {
                    input.checked = false;
                }
            });
            
            // Sync to original container and apply
            syncFiltersFromTray();
            
            // Try to find and click clear button in original container
            const clearBtn = document.querySelector('.sidebar .btn-clear-filters') ||
                           document.querySelector('.dealers-filters #clearFilters') ||
                           document.querySelector('.filter-section .btn-clear');
            if (clearBtn && typeof clearBtn.click === 'function') {
                clearBtn.click();
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
                document.body.removeChild(toast);
            }, 300);
        }, 2000);
    }
    
    // Re-initialize if the page changes dynamically
    window.reinitMobileFilterTray = initMobileFilterTray;
    
})();

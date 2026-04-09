/**
 * My Listings Page - MotorLink
 * Manages user's car listings
 */

class MyListingsManager {
    constructor() {
        this.currentUser = null;
        this.listings = [];
        this.filteredListings = [];
        this.currentFilter = 'all';
        this.listingToDelete = null;

        this.init();
    }

    async init() {
        await this.checkAuth();

        if (!this.currentUser) {
            this.showLoginRequired();
            return;
        }

        await this.loadListings();
        this.bindEvents();
    }

    async checkAuth() {
        try {
            const response = await fetch(`${CONFIG.API_URL}?action=check_auth`, {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success && data.authenticated) {
                this.currentUser = data.user;
                localStorage.setItem('motorlink_user', JSON.stringify(data.user));
                localStorage.setItem('motorlink_authenticated', 'true');
                
                const userInfo = document.getElementById('userInfo');
                const guestMenu = document.getElementById('guestMenu');
                if (userInfo) userInfo.style.display = 'flex';
                if (guestMenu) guestMenu.style.display = 'none';
                
                const displayName = data.user.full_name || data.user.name || data.user.email?.split('@')[0] || 'User';
                const userNameEl = document.getElementById('userName');
                if (userNameEl) userNameEl.textContent = displayName;
            } else {
                // Server confirmed unauthenticated: clear stale client auth state.
                localStorage.removeItem('motorlink_authenticated');
                localStorage.removeItem('motorlink_user');
                this.currentUser = null;
            }
        } catch (error) {
            // Network error only: allow local fallback so users can retry gracefully.
            const storedAuth = localStorage.getItem('motorlink_authenticated');
            const storedUser = localStorage.getItem('motorlink_user');
            if (storedAuth === 'true' && storedUser) {
                this.currentUser = JSON.parse(storedUser);
            }
        }
    }

    showLoginRequired() {
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('loginRequired').classList.remove('hidden');
    }

    async loadListings() {
        try {
            console.log('Loading my listings from:', `${CONFIG.API_URL}?action=my_listings`);
            console.log('Current user:', this.currentUser);

            const response = await fetch(`${CONFIG.API_URL}?action=my_listings`, {
                credentials: 'include'
            });
            const data = await response.json();


            if (data.listings && data.listings.length > 0) {
            }

            // Hide loading state
            const loadingState = document.getElementById('loadingState');
            if (loadingState) {
                loadingState.classList.add('hidden');
            }

            if (data.success && data.listings) {
                this.listings = data.listings;
                this.updateStats();
                this.filterListings(this.currentFilter);
                
                // Show grid with filtered data
                const grid = document.getElementById('listingsGrid');
                if (grid) {
                    grid.style.display = 'grid';
                }
            } else {
                this.showEmptyState();
            }
        } catch (error) {
            const loadingState = document.getElementById('loadingState');
            if (loadingState) {
                loadingState.innerHTML = `
                    <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #dc2626; margin-bottom: 16px;"></i>
                    <p>Error loading listings. Please try again.</p>
                    <button class="btn btn-primary" onclick="location.reload()">Retry</button>
                `;
                loadingState.classList.remove('hidden');
            } else {
                alert('Error loading listings. Please refresh the page.');
            }
        }
    }

    updateStats() {
        const total = this.listings.length;
        const active = this.listings.filter(l => l.status === 'active' || l.status === 'approved').length;
        const pending = this.listings.filter(l => l.status === 'pending' || l.status === 'pending_approval').length;
        const sold = this.listings.filter(l => l.status === 'sold').length;

        document.getElementById('totalListings').textContent = total;
        document.getElementById('activeListings').textContent = active;
        document.getElementById('pendingListings').textContent = pending;
        document.getElementById('soldListings').textContent = sold;
    }

    bindEvents() {
        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.filterListings(tab.dataset.filter);
            });
        });

        // Delete confirmation
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
            this.confirmDelete();
        });

        // Edit listing save button
        document.getElementById('saveEditBtn').addEventListener('click', () => {
            this.saveEditListing();
        });
    }

    filterListings(filter) {
        this.currentFilter = filter;

        if (filter === 'all') {
            this.filteredListings = this.listings;
        } else {
            this.filteredListings = this.listings.filter(l => {
                if (filter === 'active') return l.status === 'active' || l.status === 'approved';
                if (filter === 'pending') return l.status === 'pending' || l.status === 'pending_approval';
                if (filter === 'rejected') return l.status === 'rejected' || l.approval_status === 'denied';
                return l.status === filter;
            });
        }

        this.renderListings();
    }

    renderListings() {
        const grid = document.getElementById('listingsGrid');
        const emptyState = document.getElementById('emptyState');

        if (this.filteredListings.length === 0) {
            grid.innerHTML = '';
            grid.style.display = 'grid'; // Show grid for empty state message
            if (this.listings.length === 0) {
                emptyState.classList.remove('hidden');
            } else {
                grid.innerHTML = `
                    <div class="empty-state" style="grid-column: 1/-1;">
                        <i class="fas fa-filter"></i>
                        <h3>No ${this.currentFilter} listings</h3>
                        <p>You don't have any ${this.currentFilter} listings at the moment.</p>
                    </div>
                `;
            }
            return;
        }

        emptyState.classList.add('hidden');
        grid.style.display = 'grid'; // Ensure grid is visible
        grid.innerHTML = this.filteredListings.map(listing => this.createListingCard(listing)).join('');
    }

    createListingCard(listing) {
        // Debug logging for first card
        if (this.filteredListings[0] === listing) {
            console.log('Creating card for listing:', {
                id: listing.id,
                title: listing.title,
                status: listing.status,
                user_id: listing.user_id
            });
        }

        // Get image URL
        let imageUrl = '';
        if (listing.featured_image) {
            imageUrl = `${CONFIG.BASE_URL}uploads/${listing.featured_image}`;
        } else if (listing.featured_image_id) {
            imageUrl = `${CONFIG.API_URL}?action=image&id=${listing.featured_image_id}`;
        } else if (listing.images && listing.images.length > 0) {
            const img = listing.images[0];
            if (img.id) {
                imageUrl = `${CONFIG.API_URL}?action=image&id=${img.id}`;
            } else if (img.filename) {
                imageUrl = `${CONFIG.BASE_URL}uploads/${img.filename}`;
            }
        }

        // Status display
        const statusMap = {
            'active': { class: 'active', text: 'Active' },
            'approved': { class: 'active', text: 'Active' },
            'pending': { class: 'pending', text: 'Pending Review' },
            'pending_approval': { class: 'pending', text: 'Pending Review' },
            'rejected': { class: 'rejected', text: 'Rejected' },
            'sold': { class: 'sold', text: 'Sold' },
            'draft': { class: 'draft', text: 'Draft' }
        };
        
        // Check if listing is rejected (either status is 'rejected' or approval_status is 'denied')
        const isRejected = listing.status === 'rejected' || listing.approval_status === 'denied';
        let status = statusMap[listing.status] || { class: 'pending', text: listing.status };
        if (isRejected) {
            status = { class: 'rejected', text: 'Rejected' };
        }

        // Debug status mapping
        if (this.filteredListings[0] === listing) {
            console.log('Status mapping:', {
                original: listing.status,
                mapped: status
            });
        }

        // Listing type badge
        let typeBadge = '';
        if (listing.listing_type === 'featured') {
            typeBadge = '<span class="listing-type featured">Featured</span>';
        } else if (listing.listing_type === 'premium') {
            typeBadge = '<span class="listing-type premium">Premium</span>';
        }

        // Format date
        const createdDate = new Date(listing.created_at);
        const dateStr = createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        // Extract rejection reason from admin_notes if listing is rejected
        let rejectionReason = '';
        if (isRejected && listing.admin_notes) {
            // Extract rejection reason from admin_notes (format: "Rejection reason: ...")
            const rejectionMatch = listing.admin_notes.match(/Rejection reason:\s*(.+?)(?:\n\n|$)/i);
            if (rejectionMatch) {
                rejectionReason = rejectionMatch[1].trim();
            } else if (listing.admin_notes.includes('Rejection reason:')) {
                // Fallback: get everything after "Rejection reason:"
                const parts = listing.admin_notes.split('Rejection reason:');
                if (parts.length > 1) {
                    rejectionReason = parts[1].split('\n\n')[0].trim();
                }
            }
        }

        return `
            <div class="listing-card" data-id="${listing.id}">
                <div class="listing-image">
                    ${imageUrl
                        ? `<img src="${imageUrl}" alt="${this.escapeHtml(listing.title)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                           <div class="placeholder" style="display: none;"><i class="fas fa-car"></i></div>`
                        : '<div class="placeholder"><i class="fas fa-car"></i></div>'}
                    <span class="listing-status ${status.class}">${status.text}</span>
                    ${typeBadge}
                </div>
                <div class="listing-details">
                    <h3 class="listing-title">${this.escapeHtml(listing.title)}</h3>
                    <div class="listing-price">
                        <span class="currency">MWK</span> ${this.formatNumber(listing.price)}
                    </div>
                    ${isRejected && rejectionReason ? `
                        <div class="rejection-reason" style="margin: 12px 0; padding: 12px; background-color: #fee2e2; border-left: 4px solid #dc2626; border-radius: 4px;">
                            <div style="display: flex; align-items: flex-start; gap: 8px;">
                                <i class="fas fa-exclamation-triangle" style="color: #dc2626; margin-top: 2px; flex-shrink: 0;"></i>
                                <div style="flex: 1;">
                                    <strong style="color: #991b1b; display: block; margin-bottom: 4px;">Rejection Reason:</strong>
                                    <p style="color: #7f1d1d; margin: 0; line-height: 1.5;">${this.escapeHtml(rejectionReason)}</p>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    <div class="listing-meta">
                        <span><i class="fas fa-calendar"></i> ${listing.year || 'N/A'}</span>
                        <span><i class="fas fa-tachometer-alt"></i> ${listing.mileage ? this.formatNumber(listing.mileage) + ' km' : 'N/A'}</span>
                        <span><i class="fas fa-gas-pump"></i> ${listing.fuel_type || 'N/A'}</span>
                    </div>
                    <div class="listing-stats">
                        <span><i class="fas fa-eye"></i> ${listing.views || 0} views</span>
                        <span><i class="fas fa-heart"></i> ${listing.favorites || listing.saves || 0} saves</span>
                        <span><i class="fas fa-clock"></i> ${dateStr}</span>
                    </div>
                </div>
                <div class="listing-actions">
                    <a href="car.html?id=${listing.id}" class="btn btn-view">
                        <i class="fas fa-eye"></i> View
                    </a>
                    ${(listing.status === 'pending' || listing.status === 'pending_approval') ? `
                        <button class="btn btn-edit" disabled style="opacity: 0.5; cursor: not-allowed;" title="Cannot edit listing pending approval">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    ` : isRejected ? `
                        <button class="btn btn-edit" disabled style="opacity: 0.5; cursor: not-allowed;" title="Cannot edit rejected listing. Please create a new listing.">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    ` : `
                        <button class="btn btn-edit" ${listing.status === 'sold' ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''} onclick="${listing.status === 'sold' ? 'return false;' : 'myListings.editListing(' + listing.id + ')'}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    `}
                    ${listing.status !== 'sold' && listing.status !== 'pending' && listing.status !== 'pending_approval' && !isRejected ? `
                        <button class="btn btn-mark-sold" onclick="myListings.markAsSold(${listing.id})">
                            <i class="fas fa-check"></i> Mark Sold
                        </button>
                    ` : ''}
                    <button class="btn btn-delete" onclick="myListings.showDeleteModal(${listing.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    showEmptyState() {
        const grid = document.getElementById('listingsGrid');
        grid.innerHTML = '';
        grid.style.display = 'none'; // Hide grid when showing empty state
        document.getElementById('emptyState').classList.remove('hidden');
    }

    async editListing(listingId) {
        const listing = this.listings.find(l => l.id == listingId);
        if (!listing) return;

        // Prevent editing of pending listings
        if (listing.status === 'pending' || listing.status === 'pending_approval') {
            this.showToast('Cannot edit listing while it is pending approval. Please wait for approval.', 'error');
            return;
        }

        // Prevent editing of rejected listings
        const isRejected = listing.status === 'rejected' || listing.approval_status === 'denied';
        if (isRejected) {
            this.showToast('Cannot edit rejected listing. Please create a new listing with the necessary corrections.', 'error');
            return;
        }

        // Load makes, models, and locations
        await this.loadEditFormData();

        // Populate the form with listing data
        document.getElementById('editListingId').value = listing.id;
        document.getElementById('editTitle').value = listing.title || '';
        document.getElementById('editYear').value = listing.year || '';
        document.getElementById('editPrice').value = listing.price || '';
        document.getElementById('editNegotiable').checked = listing.negotiable == 1;
        document.getElementById('editMileage').value = listing.mileage || '';
        document.getElementById('editFuelType').value = listing.fuel_type || '';
        document.getElementById('editTransmission').value = listing.transmission || '';
        document.getElementById('editCondition').value = listing.condition_type || '';
        document.getElementById('editColor').value = listing.exterior_color || '';
        document.getElementById('editDescription').value = listing.description || '';

        // Set make and model
        if (listing.make_id) {
            document.getElementById('editMake').value = listing.make_id;
            await this.loadEditModels(listing.make_id);
            if (listing.model_id) {
                document.getElementById('editModel').value = listing.model_id;
                
                // Load model variations to populate optional fields
                if (window.modelVariationsHelper) {
                    await window.modelVariationsHelper.loadModelVariations(
                        listing.model_id,
                        'editEngineSize',
                        'editFuelTankCapacity',
                        'editDrivetrain',
                        'editTransmission'
                    );
                }
            }
        }
        
        // Populate optional fields if they exist (wait for variations to load first)
        setTimeout(() => {
            if (listing.engine_size) {
                const engineSelect = document.getElementById('editEngineSize');
                if (engineSelect) {
                    engineSelect.value = listing.engine_size;
                }
            }
            if (listing.drivetrain || listing.drive_type) {
                const drivetrainSelect = document.getElementById('editDrivetrain');
                if (drivetrainSelect) {
                    // Map drive_type values to drivetrain format
                    const driveType = listing.drivetrain || listing.drive_type || '';
                    drivetrainSelect.value = driveType;
                }
            }
            if (listing.interior_color) {
                const interiorColorInput = document.getElementById('editInteriorColor');
                if (interiorColorInput) {
                    interiorColorInput.value = listing.interior_color;
                }
            }
            if (listing.doors) {
                const doorsSelect = document.getElementById('editDoors');
                if (doorsSelect) {
                    doorsSelect.value = listing.doors;
                }
            }
            if (listing.seats) {
                const seatsSelect = document.getElementById('editSeats');
                if (seatsSelect) {
                    seatsSelect.value = listing.seats;
                }
            }
            if (listing.fuel_tank_capacity) {
                const fuelTankSelect = document.getElementById('editFuelTankCapacity');
                if (fuelTankSelect) {
                    fuelTankSelect.value = listing.fuel_tank_capacity;
                }
            }
        }, 500); // Wait for variations to load

        // Set location
        if (listing.location_id) {
            document.getElementById('editLocation').value = listing.location_id;
        }

        // Load images
        await this.loadEditImages(listing.id);

        // Show modal
        document.getElementById('editModal').classList.remove('hidden');
    }

    async loadEditFormData() {
        try {
            // Load makes
            const makesResponse = await fetch(`${CONFIG.API_URL}?action=get_makes`);
            const makesData = await makesResponse.json();

            const makeSelect = document.getElementById('editMake');
            makeSelect.innerHTML = '<option value="">Select Make</option>';
            if (makesData.makes) {
                makesData.makes.forEach(make => {
                    makeSelect.innerHTML += `<option value="${make.id}">${make.name}</option>`;
                });
            }

            // Load locations
            const locationsResponse = await fetch(`${CONFIG.API_URL}?action=get_locations`);
            const locationsData = await locationsResponse.json();

            const locationSelect = document.getElementById('editLocation');
            locationSelect.innerHTML = '<option value="">Select Location</option>';
            if (locationsData.locations) {
                locationsData.locations.forEach(location => {
                    locationSelect.innerHTML += `<option value="${location.id}">${location.name}</option>`;
                });
            }

            // Bind make change event
            document.getElementById('editMake').addEventListener('change', (e) => {
                this.loadEditModels(e.target.value);
            });
        } catch (error) {
        }
    }

    async loadEditModels(makeId) {
        try {
            const response = await fetch(`${CONFIG.API_URL}?action=get_models&make_id=${makeId}`);
            const data = await response.json();

            const modelSelect = document.getElementById('editModel');
            modelSelect.innerHTML = '<option value="">Select Model</option>';
            if (data.models) {
                // Group models by name to avoid duplicates (since we have multiple rows per model for variations)
                const uniqueModels = new Map();
                data.models.forEach(model => {
                    if (!uniqueModels.has(model.name)) {
                        uniqueModels.set(model.name, model);
                    }
                });
                
                Array.from(uniqueModels.values()).forEach(model => {
                    const option = document.createElement('option');
                    option.value = model.id;
                    option.textContent = model.name;
                    if (model.body_type) {
                        option.textContent += ` (${model.body_type})`;
                    }
                    modelSelect.appendChild(option);
                });
            }
            
            // Add change event listener to load variations when model is selected
            // Remove existing listener if any
            const newModelSelect = document.getElementById('editModel');
            const existingListener = newModelSelect.dataset.variationListenerAdded;
            if (!existingListener && window.modelVariationsHelper) {
                newModelSelect.addEventListener('change', async (e) => {
                    const modelId = e.target.value;
                    if (modelId) {
                        await window.modelVariationsHelper.loadModelVariations(
                            modelId,
                            'editEngineSize',
                            'editFuelTankCapacity',
                            'editDrivetrain',
                            'editTransmission'
                        );
                    } else {
                        // Clear variation dropdowns
                        document.getElementById('editEngineSize').innerHTML = '<option value="">Select Model First...</option>';
                        document.getElementById('editFuelTankCapacity').innerHTML = '<option value="">Select Model First...</option>';
                        document.getElementById('editDrivetrain').innerHTML = '<option value="">Select Model First...</option>';
                    }
                });
                newModelSelect.dataset.variationListenerAdded = 'true';
            }
        } catch (error) {
            console.error('Error loading models:', error);
        }
    }

    async loadEditImages(listingId) {
        try {
            const response = await fetch(`${CONFIG.API_URL}?action=get_listing_images&listing_id=${listingId}`, {
                credentials: 'include'
            });
            const data = await response.json();

            const imagesGrid = document.getElementById('editImagesGrid');
            imagesGrid.innerHTML = '';

            if (data.success && data.images && data.images.length > 0) {
                data.images.forEach(image => {
                    const imageUrl = image.id ? `${CONFIG.API_URL}?action=image&id=${image.id}` : `${CONFIG.BASE_URL}uploads/${image.filename}`;
                    const isFeatured = image.is_featured == 1;

                    const imageItem = document.createElement('div');
                    imageItem.className = `edit-image-item ${isFeatured ? 'featured' : ''}`;
                    imageItem.dataset.imageId = image.id;
                    imageItem.innerHTML = `
                        <img src="${imageUrl}" alt="Listing image">
                        ${isFeatured ? '<div class="edit-image-featured-badge"><i class="fas fa-star"></i> Featured</div>' : ''}
                        <div class="edit-image-actions">
                            ${!isFeatured ? `<button type="button" class="btn-set-featured" onclick="myListings.setFeaturedImage(${listingId}, ${image.id})">
                                <i class="fas fa-star"></i> Set Featured
                            </button>` : ''}
                            <button type="button" class="btn-delete-image" onclick="myListings.deleteListingImage(${image.id}, ${listingId})">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    `;
                    imagesGrid.appendChild(imageItem);
                });
            } else {
                imagesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">No images uploaded yet</p>';
            }

            // Bind photo upload
            this.bindEditPhotoUpload(listingId);
        } catch (error) {
        }
    }

    bindEditPhotoUpload(listingId) {
        const photoInput = document.getElementById('editPhotoInput');
        photoInput.onchange = async (e) => {
            const files = e.target.files;
            if (files.length === 0) return;

            const formData = new FormData();
            formData.append('action', 'upload_listing_images');
            formData.append('listing_id', listingId);

            for (let file of files) {
                formData.append('images[]', file);
            }

            try {
                const response = await fetch(CONFIG.API_URL, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    this.showToast('Images uploaded successfully', 'success');
                    await this.loadEditImages(listingId);
                } else {
                    this.showToast(data.message || 'Failed to upload images', 'error');
                }
            } catch (error) {
                this.showToast('Error uploading images', 'error');
            }

            photoInput.value = '';
        };
    }

    async setFeaturedImage(listingId, imageId) {
        try {
            const response = await fetch(`${CONFIG.API_URL}?action=set_featured_image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    listing_id: listingId,
                    image_id: imageId
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showToast('Featured image updated', 'success');
                await this.loadEditImages(listingId);
            } else {
                this.showToast(data.message || 'Failed to set featured image', 'error');
            }
        } catch (error) {
            this.showToast('Error setting featured image', 'error');
        }
    }

    async deleteListingImage(imageId, listingId) {
        if (!confirm('Delete this image?')) return;

        try {
            const response = await fetch(`${CONFIG.API_URL}?action=delete_listing_image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    image_id: imageId
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showToast('Image deleted', 'success');
                await this.loadEditImages(listingId);
            } else {
                this.showToast(data.message || 'Failed to delete image', 'error');
            }
        } catch (error) {
            this.showToast('Error deleting image', 'error');
        }
    }

    async saveEditListing() {
        const form = document.getElementById('editListingForm');
        const formData = new FormData(form);

        const listingId = formData.get('listing_id');
        const originalListing = this.listings.find(l => l.id == listingId);

        if (!originalListing) {
            this.showToast('Original listing not found', 'error');
            return;
        }

        // Prevent editing of pending listings
        if (originalListing.status === 'pending' || originalListing.status === 'pending_approval') {
            this.showToast('Cannot edit listing while it is pending approval. Please wait for approval.', 'error');
            closeEditModal();
            return;
        }

        // Prevent editing of rejected listings
        const isRejected = originalListing.status === 'rejected' || originalListing.approval_status === 'denied';
        if (isRejected) {
            this.showToast('Cannot edit rejected listing. Please create a new listing with the necessary corrections.', 'error');
            closeEditModal();
            return;
        }

        // VALIDATION: Prevent listing reuse - ensure make, model, and year cannot be changed
        // This prevents users from reusing the same listing for a different car
        const makeId = formData.get('make_id') || originalListing.make_id;
        const modelId = formData.get('model_id') || originalListing.model_id;
        const year = formData.get('year') || originalListing.year;
        
        // Verify that make, model, and year match the original listing
        if (makeId != originalListing.make_id || modelId != originalListing.model_id || year != originalListing.year) {
            this.showToast('Cannot change car make, model, or year. Please create a new listing for a different vehicle.', 'error');
            return;
        }

        // Since make, model, and year are now read-only in the UI,
        // we need to ensure they're included in the form data
        formData.set('make_id', originalListing.make_id);
        formData.set('model_id', originalListing.model_id);
        formData.set('year', originalListing.year);
        
        // Map drivetrain to drive_type for API compatibility
        if (formData.has('drivetrain') && !formData.has('drive_type')) {
            formData.set('drive_type', formData.get('drivetrain'));
        }

        // Convert to JSON
        const data = {
            listing_id: listingId
        };

        for (let [key, value] of formData.entries()) {
            if (key !== 'listing_id') {
                data[key] = value;
            }
        }

        // Handle negotiable checkbox
        data.negotiable = document.getElementById('editNegotiable').checked ? 1 : 0;

        try {
            const response = await fetch(`${CONFIG.API_URL}?action=update_listing`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                this.showToast('Listing updated successfully', 'success');
                closeEditModal();
                await this.loadListings();
            } else {
                this.showToast(result.message || 'Failed to update listing', 'error');
            }
        } catch (error) {
            this.showToast('Error updating listing', 'error');
        }
    }

    async markAsSold(listingId) {
        const listing = this.listings.find(l => l.id == listingId);
        if (!listing) return;

        // Prevent marking pending listings as sold
        if (listing.status === 'pending' || listing.status === 'pending_approval') {
            this.showToast('Cannot mark listing as sold while it is pending approval.', 'error');
            return;
        }

        // Prevent marking rejected listings as sold
        const isRejected = listing.status === 'rejected' || listing.approval_status === 'denied';
        if (isRejected) {
            this.showToast('Cannot mark rejected listing as sold.', 'error');
            return;
        }

        if (!confirm('Mark this listing as sold?')) return;

        try {
            const response = await fetch(`${CONFIG.API_URL}?action=update_listing_status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    listing_id: listingId,
                    status: 'sold'
                })
            });

            const data = await response.json();

            if (data.success) {
                // Update local data
                const listing = this.listings.find(l => l.id == listingId);
                if (listing) {
                    listing.status = 'sold';
                }
                this.updateStats();
                this.filterListings(this.currentFilter);
                this.showToast('Listing marked as sold!', 'success');
            } else {
                this.showToast(data.message || 'Failed to update listing', 'error');
            }
        } catch (error) {
            this.showToast('Error updating listing', 'error');
        }
    }

    showDeleteModal(listingId) {
        const listing = this.listings.find(l => l.id == listingId);
        if (!listing) return;

        this.listingToDelete = listingId;

        // Get image URL
        let imageUrl = '';
        if (listing.featured_image) {
            imageUrl = `${CONFIG.BASE_URL}uploads/${listing.featured_image}`;
        } else if (listing.featured_image_id) {
            imageUrl = `${CONFIG.API_URL}?action=image&id=${listing.featured_image_id}`;
        }

        document.getElementById('deleteListingPreview').innerHTML = `
            ${imageUrl ? `<img src="${imageUrl}" alt="${this.escapeHtml(listing.title)}">` : ''}
            <div class="listing-preview-info">
                <h4>${this.escapeHtml(listing.title)}</h4>
                <p>MWK ${this.formatNumber(listing.price)}</p>
            </div>
        `;

        document.getElementById('deleteModal').classList.remove('hidden');
    }

    async confirmDelete() {
        if (!this.listingToDelete) return;

        try {
            const response = await fetch(`${CONFIG.API_URL}?action=delete_listing`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    listing_id: this.listingToDelete
                })
            });

            const data = await response.json();

            if (data.success) {
                // Remove from local data
                this.listings = this.listings.filter(l => l.id != this.listingToDelete);
                this.updateStats();
                this.filterListings(this.currentFilter);
                closeDeleteModal();
                this.showToast('Listing deleted successfully', 'success');
            } else {
                this.showToast(data.message || 'Failed to delete listing', 'error');
            }
        } catch (error) {
            this.showToast('Error deleting listing', 'error');
        }
    }

    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#dc2626' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatNumber(num) {
        if (!num) return '0';
        return parseInt(num).toLocaleString();
    }
}

// Global functions
function closeDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
    if (window.myListings) {
        window.myListings.listingToDelete = null;
    }
}

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
}

// Initialize
let myListings;
document.addEventListener('DOMContentLoaded', () => {
    myListings = new MyListingsManager();
    window.myListings = myListings;
});

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

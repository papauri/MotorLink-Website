/**
 * MotorLink Profile Page
 * Handles profile data loading, editing, and stats
 */

class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.userListings = [];
        this.init();
    }

    async init() {
        await this.checkAuth();

        if (!this.currentUser) {
            window.location.href = 'login.html';
            return;
        }

        await this.loadProfileData();
        this.setupEventListeners();
    }

    async checkAuth() {
        try {
            const response = await fetch(`${CONFIG.API_URL}?action=check_auth`, {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success && data.authenticated) {
                this.currentUser = data.user;
            } else {
                this.currentUser = null;
            }
        } catch (error) {
            this.currentUser = null;
        }
    }

    async loadProfileData() {
        try {
            const response = await fetch(`${CONFIG.API_URL}?action=get_profile`, {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success && data.profile) {
                this.populateProfileHeader(data.profile);
                this.populateEditForm(data.profile);
                await this.loadStatistics();
                await this.loadUserListings();
            } else {
                this.showError('Failed to load profile data');
            }
        } catch (error) {
            this.showError('Error loading profile data');
        }
    }

    populateProfileHeader(profile) {
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const profilePhone = document.getElementById('profilePhone');
        const profileCity = document.getElementById('profileCity');

        const displayName = profile.full_name || profile.name || 'User';

        if (profileName) profileName.textContent = displayName;
        if (profileEmail) profileEmail.textContent = profile.email || 'No email provided';
        if (profilePhone) profilePhone.textContent = profile.phone || 'No phone provided';
        if (profileCity) profileCity.textContent = profile.city || 'Not specified';

        // Update navigation elements
        const userName = document.getElementById('userName');
        if (userName) userName.textContent = displayName;

        // Update avatar with initials
        this.updateUserAvatar(displayName);
    }

    updateUserAvatar(userName) {
        const avatarBtn = document.getElementById('userAvatar');
        if (avatarBtn && userName) {
            // Extract initials from name
            const nameParts = userName.trim().split(/\s+/).filter(n => n.length > 0);
            let initials = '';

            if (nameParts.length >= 2) {
                // First and last name initials
                initials = nameParts[0][0] + nameParts[nameParts.length - 1][0];
            } else if (nameParts.length === 1) {
                // Single name - take first two characters
                initials = nameParts[0].substring(0, 2);
            }

            initials = initials.toUpperCase();

            if (initials) {
                avatarBtn.innerHTML = `<span style="color: white; font-weight: 700; font-size: 16px;">${initials}</span>`;
            } else {
                avatarBtn.innerHTML = '<i class="fas fa-user"></i>';
            }
        }
    }

    populateEditForm(profile) {
        const fullName = document.getElementById('fullName');
        const phone = document.getElementById('phone');
        const whatsapp = document.getElementById('whatsapp');
        const city = document.getElementById('city');
        const address = document.getElementById('address');
        const bio = document.getElementById('bio');

        if (fullName) fullName.value = profile.full_name || profile.name || '';
        if (phone) phone.value = profile.phone || '';
        if (whatsapp) whatsapp.value = profile.whatsapp || '';
        if (city) city.value = profile.city || '';
        if (address) address.value = profile.address || '';
        if (bio) bio.value = profile.bio || '';

        // If user is a dealer, populate dealer-specific fields
        if (this.currentUser && this.currentUser.type === 'dealer') {
            this.populateDealerFields(profile);
        }
    }

    populateDealerFields(profile) {
        // Add dealer business fields section if it doesn't exist
        const editTab = document.getElementById('edit');
        if (!editTab) return;

        // Check if dealer fields already exist (prevent duplicate creation)
        if (document.getElementById('dealerBusinessSection')) return;

        const profileForm = document.getElementById('profileForm');
        if (!profileForm) return;

        // Helper function to escape HTML and prevent XSS
        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text || '';
            return div.innerHTML;
        };

        // Create dealer business section
        const dealerSection = document.createElement('div');
        dealerSection.className = 'form-section';
        dealerSection.id = 'dealerBusinessSection';
        dealerSection.innerHTML = `
            <h3>Business Information</h3>
            <div class="form-row">
                <div class="form-group">
                    <label for="businessName">Business Name</label>
                    <input type="text" id="businessName" name="business_name" readonly 
                           style="background: #f3f4f6; cursor: not-allowed;"
                           value="${escapeHtml(profile.business_name)}">
                    <small style="color: #888;">Business name cannot be changed. Contact support if needed.</small>
                </div>
                <div class="form-group">
                    <label for="yearsInBusiness">Years in Business</label>
                    <input type="number" id="yearsInBusiness" name="years_in_business" readonly
                           style="background: #f3f4f6; cursor: not-allowed;"
                           value="${escapeHtml(profile.years_in_business)}">
                    <small style="color: #888;">Years in business cannot be changed.</small>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="businessPhone">Business Phone</label>
                    <input type="tel" id="businessPhone" name="business_phone" 
                           value="${escapeHtml(profile.business_phone || profile.phone)}" autocomplete="tel">
                </div>
                <div class="form-group">
                    <label for="businessWhatsApp">Business WhatsApp</label>
                    <input type="tel" id="businessWhatsApp" name="business_whatsapp"
                           value="${escapeHtml(profile.business_whatsapp || profile.whatsapp)}" autocomplete="tel">
                </div>
            </div>
            <div class="form-group">
                <label for="businessAddress">Business Address</label>
                <textarea id="businessAddress" name="business_address" rows="2" 
                          placeholder="Street address, building, landmarks..." autocomplete="street-address">${escapeHtml(profile.business_address || profile.address)}</textarea>
            </div>
            <div class="form-group">
                <label for="businessDescription">Business Description</label>
                <textarea id="businessDescription" name="business_description" rows="3"
                          placeholder="Tell customers about your dealership, services, and what makes you unique...">${escapeHtml(profile.description || profile.bio)}</textarea>
            </div>
            <div class="form-section">
                <h3 style="margin-top: 24px; margin-bottom: 16px;">Social Media Links</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="facebookUrl"><i class="fab fa-facebook"></i> Facebook Page</label>
                        <input type="url" id="facebookUrl" name="facebook_url" 
                               placeholder="https://facebook.com/yourpage"
                               value="${escapeHtml(profile.facebook_url)}">
                    </div>
                    <div class="form-group">
                        <label for="instagramUrl"><i class="fab fa-instagram"></i> Instagram</label>
                        <input type="url" id="instagramUrl" name="instagram_url"
                               placeholder="https://instagram.com/yourpage"
                               value="${escapeHtml(profile.instagram_url)}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="twitterUrl"><i class="fab fa-twitter"></i> Twitter/X</label>
                        <input type="url" id="twitterUrl" name="twitter_url"
                               placeholder="https://twitter.com/yourpage"
                               value="${escapeHtml(profile.twitter_url)}">
                    </div>
                    <div class="form-group">
                        <label for="websiteUrl"><i class="fas fa-globe"></i> Website</label>
                        <input type="url" id="websiteUrl" name="website_url"
                               placeholder="https://www.yourwebsite.com"
                               value="${escapeHtml(profile.website || profile.website_url)}">
                    </div>
                </div>
            </div>
        `;

        // Insert before the submit button
        const submitBtn = profileForm.querySelector('.btn-update');
        if (submitBtn) {
            profileForm.insertBefore(dealerSection, submitBtn);
        } else {
            profileForm.appendChild(dealerSection);
        }
    }

    async loadStatistics() {
        try {
            const response = await fetch(`${CONFIG.API_URL}?action=my_listings`, {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success && data.listings) {
                const listings = data.listings;
                const totalListings = listings.length;
                const approvedListings = listings.filter(l => l.status === 'approved').length;
                const pendingListings = listings.filter(l => l.status === 'pending').length;
                const totalViews = listings.reduce((sum, l) => sum + (parseInt(l.views) || 0), 0);

                document.getElementById('totalListings').textContent = totalListings;
                document.getElementById('approvedListings').textContent = approvedListings;
                document.getElementById('pendingListings').textContent = pendingListings;
                document.getElementById('totalViews').textContent = totalViews;

                this.loadRecentActivity(listings);
            }
        } catch (error) {
        }
    }

    loadRecentActivity(listings) {
        const recentActivity = document.getElementById('recentActivity');

        if (!listings || listings.length === 0) {
            recentActivity.innerHTML = '<p style="text-align: center; color: #999;">No recent activity</p>';
            return;
        }

        const recentListings = listings.slice(0, 5);
        let html = '<div class="activity-list">';

        recentListings.forEach(listing => {
            const statusClass = listing.status === 'approved' ? 'status-approved' :
                               listing.status === 'pending' ? 'status-pending' : 'status-denied';
            html += `
                <div class="activity-item" style="padding: 12px; border-bottom: 1px solid #e1e5e9; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${listing.title}</strong>
                        <div style="font-size: 12px; color: #666; margin-top: 4px;">
                            ${listing.views || 0} views • MWK ${parseInt(listing.price || 0).toLocaleString()}
                        </div>
                    </div>
                    <span class="status-badge ${statusClass}">${listing.status || 'pending'}</span>
                </div>
            `;
        });

        html += '</div>';
        recentActivity.innerHTML = html;
    }

    async loadUserListings() {
        const listingsContainer = document.getElementById('userListings');

        try {
            const response = await fetch(`${CONFIG.API_URL}?action=my_listings`, {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success && data.listings) {
                this.userListings = data.listings;

                if (this.userListings.length === 0) {
                    listingsContainer.innerHTML = `
                        <div style="text-align: center; padding: 40px; color: #999;">
                            <i class="fas fa-car" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.5;"></i>
                            <h3>No listings yet</h3>
                            <p>Start selling by creating your first listing!</p>
                            <a href="sell.html" class="btn-update" style="display: inline-block; margin-top: 20px; text-decoration: none;">
                                <i class="fas fa-plus"></i> Create Listing
                            </a>
                        </div>
                    `;
                    return;
                }

                this.renderListingsTable();
            } else {
                listingsContainer.innerHTML = '<p style="text-align: center; color: #999;">Failed to load listings</p>';
            }
        } catch (error) {
            listingsContainer.innerHTML = '<p style="text-align: center; color: #999;">Error loading listings</p>';
        }
    }

    renderListingsTable() {
        const listingsContainer = document.getElementById('userListings');

        let html = `
            <table class="listings-table">
                <thead>
                    <tr>
                        <th>Listing</th>
                        <th>Price</th>
                        <th>Views</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        this.userListings.forEach(listing => {
            const statusClass = listing.status === 'approved' ? 'status-approved' :
                               listing.status === 'pending' ? 'status-pending' : 'status-denied';

            html += `
                <tr>
                    <td>
                        <strong>${listing.title}</strong>
                        <div style="font-size: 12px; color: #666;">${listing.year || ''} • ${listing.mileage ? parseInt(listing.mileage).toLocaleString() + ' km' : ''}</div>
                    </td>
                    <td>MWK ${parseInt(listing.price || 0).toLocaleString()}</td>
                    <td>${listing.views || 0}</td>
                    <td><span class="status-badge ${statusClass}">${listing.status || 'pending'}</span></td>
                    <td>
                        <a href="car.html?id=${listing.id}" class="btn btn-sm" style="padding: 6px 12px; text-decoration: none; font-size: 12px;">
                            <i class="fas fa-eye"></i> View
                        </a>
                    </td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        listingsContainer.innerHTML = html;
    }

    setupEventListeners() {
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
        }

        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => this.handlePasswordChange(e));
        }
    }

    async handleProfileUpdate(e) {
        e.preventDefault();

        const updateBtn = document.getElementById('updateBtn');
        const originalText = updateBtn.innerHTML;
        updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
        updateBtn.disabled = true;

        try {
            const formData = {
                full_name: document.getElementById('fullName').value,
                phone: document.getElementById('phone').value,
                whatsapp: document.getElementById('whatsapp').value,
                city: document.getElementById('city').value,
                address: document.getElementById('address').value,
                bio: document.getElementById('bio').value
            };

            // Add dealer-specific fields if user is a dealer
            if (this.currentUser && this.currentUser.type === 'dealer') {
                const businessPhone = document.getElementById('businessPhone');
                const businessWhatsApp = document.getElementById('businessWhatsApp');
                const businessAddress = document.getElementById('businessAddress');
                const businessDescription = document.getElementById('businessDescription');
                const facebookUrl = document.getElementById('facebookUrl');
                const instagramUrl = document.getElementById('instagramUrl');
                const twitterUrl = document.getElementById('twitterUrl');
                const websiteUrl = document.getElementById('websiteUrl');

                if (businessPhone) formData.business_phone = businessPhone.value;
                if (businessWhatsApp) formData.business_whatsapp = businessWhatsApp.value;
                if (businessAddress) formData.business_address = businessAddress.value;
                if (businessDescription) formData.business_description = businessDescription.value;
                if (facebookUrl) formData.facebook_url = facebookUrl.value;
                if (instagramUrl) formData.instagram_url = instagramUrl.value;
                if (twitterUrl) formData.twitter_url = twitterUrl.value;
                if (websiteUrl) formData.website_url = websiteUrl.value;
            }

            const response = await fetch(`${CONFIG.API_URL}?action=update_profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                alert('Profile updated successfully!');
                await this.loadProfileData();
            } else {
                alert(data.message || 'Failed to update profile');
            }
        } catch (error) {
            alert('Failed to update profile. Please try again.');
        } finally {
            updateBtn.innerHTML = originalText;
            updateBtn.disabled = false;
        }
    }

    async handlePasswordChange(e) {
        e.preventDefault();

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            alert('New passwords do not match!');
            return;
        }

        if (newPassword.length < 6) {
            alert('Password must be at least 6 characters long!');
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Changing...';
        submitBtn.disabled = true;

        try {
            const response = await fetch(`${CONFIG.API_URL}?action=change_password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('Password changed successfully!');
                document.getElementById('passwordForm').reset();
            } else {
                alert(data.message || 'Failed to change password');
            }
        } catch (error) {
            alert('Failed to change password. Please try again.');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    showError(message) {
        alert(message);
    }
}

// Account deletion
function confirmDeleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        if (confirm('This will permanently delete all your data, listings, and messages. Are you absolutely sure?')) {
            deleteAccount();
        }
    }
}

async function deleteAccount() {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=delete_account`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            alert('Your account has been deleted successfully.');
            window.location.href = 'index.html';
        } else {
            alert(data.message || 'Failed to delete account');
        }
    } catch (error) {
        alert('Failed to delete account. Please try again.');
    }
}

// Initialize profile manager when DOM is ready
let profileManager;
document.addEventListener('DOMContentLoaded', () => {
    profileManager = new ProfileManager();
});

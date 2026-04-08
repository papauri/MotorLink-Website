/**
 * Username Availability Checker
 * Real-time check if username is already taken
 */

class UsernameChecker {
    constructor(inputId, apiUrl) {
        this.input = document.getElementById(inputId);
        this.apiUrl = apiUrl;
        this.checkTimeout = null;
        this.lastCheckedUsername = '';
        this.init();
    }
    
    init() {
        if (!this.input) return;
        
        // Create status indicator
        this.createStatusIndicator();
        
        // Add event listeners
        this.input.addEventListener('input', () => this.handleInput());
        this.input.addEventListener('blur', () => this.handleBlur());
    }
    
    createStatusIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'usernameStatus';
        indicator.className = 'username-status';
        indicator.style.cssText = `
            margin-top: 8px;
            font-size: 13px;
            display: none;
            align-items: center;
            gap: 6px;
        `;
        this.input.parentElement.insertAdjacentElement('afterend', indicator);
        this.statusIndicator = indicator;
    }
    
    handleInput() {
        clearTimeout(this.checkTimeout);
        
        const username = this.input.value.trim();
        
        // Hide status while typing
        this.hideStatus();
        
        // Validate format first
        if (username.length < 3) {
            return; // Too short, don't check
        }
        
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return; // Invalid format, don't check
        }
        
        // Debounce the API call
        this.checkTimeout = setTimeout(() => {
            this.checkAvailability(username);
        }, 500);
    }
    
    handleBlur() {
        const username = this.input.value.trim();
        if (username && username !== this.lastCheckedUsername) {
            this.checkAvailability(username);
        }
    }
    
    async checkAvailability(username) {
        if (username === this.lastCheckedUsername) {
            return; // Already checked this username
        }
        
        this.showStatus('checking', 'Checking availability...');
        
        try {
            const response = await fetch(`${this.apiUrl}?action=check_username&username=${encodeURIComponent(username)}`);
            const data = await response.json();
            
            this.lastCheckedUsername = username;
            
            if (data.available) {
                this.showStatus('available', '✓ Username is available');
                this.input.classList.remove('error');
                this.input.classList.add('success');
            } else {
                this.showStatus('taken', '✗ Username is already taken');
                this.input.classList.remove('success');
                this.input.classList.add('error');
            }
        } catch (error) {
            console.error('Error checking username:', error);
            this.showStatus('error', 'Could not check availability');
        }
    }
    
    showStatus(type, message) {
        if (!this.statusIndicator) return;
        
        this.statusIndicator.style.display = 'flex';
        this.statusIndicator.innerHTML = message;
        
        // Update color based on type
        const colors = {
            checking: '#666',
            available: '#00c853',
            taken: '#f44336',
            error: '#ff9800'
        };
        
        this.statusIndicator.style.color = colors[type] || '#666';
    }
    
    hideStatus() {
        if (this.statusIndicator) {
            this.statusIndicator.style.display = 'none';
        }
    }
}

// Auto-initialize for registration form
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const apiUrl = window.CONFIG?.API_URL || 'http://127.0.0.1:8000/proxy.php';
        new UsernameChecker('username', apiUrl);
    });
} else {
    const apiUrl = window.CONFIG?.API_URL || 'http://127.0.0.1:8000/proxy.php';
    new UsernameChecker('username', apiUrl);
}

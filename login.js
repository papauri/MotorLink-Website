// ============================================================================
// MotorLink Login Functionality
// ============================================================================
// Handles user authentication and login form interactions
// Uses global CONFIG from config.js for API endpoints
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginButton = document.getElementById('loginButton');
    const buttonText = document.getElementById('buttonText');
    const loginSpinner = document.getElementById('loginSpinner');
    const passwordToggle = document.getElementById('passwordToggle');
    const forgotPassword = document.getElementById('forgotPassword');
    
    // Mobile menu handled by mobile-menu.js
    // const mobileToggle = document.getElementById('mobileToggle');
    // const mainNav = document.getElementById('mainNav');
    
    // if (mobileToggle && mainNav) {
    //     mobileToggle.addEventListener('click', function() {
    //         mainNav.classList.toggle('active');
    //         const icon = this.querySelector('i');
    //         icon.className = mainNav.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
    //     });
    // }
    
    // Password toggle functionality
    if (passwordToggle) {
        passwordToggle.addEventListener('click', togglePassword);
    }
    
    // Forgot password functionality
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function(e) {
            e.preventDefault();
            const email = prompt('Please enter your email address to reset your password:');

            if (email && isValidEmail(email)) {
                // Show confirmation message with admin contact
                alert(`Password reset requested for: ${email}\n\nFor immediate assistance, please contact:\n\nEmail: info@motorlink.mw\nPhone: +265 991 234 567\nWhatsApp: +265 991 234 567\n\nOur support team will help you reset your password within 24 hours.`);
                showToast('Password reset request submitted. Check your email or contact support.', 'success');
            } else if (email) {
                showToast('Please enter a valid email address', 'error');
            }
        });
    }
    
    // Form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!validateForm()) {
                return;
            }
            
            await performLogin();
        });
    }
    
    // Real-time validation
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    
    if (emailInput) emailInput.addEventListener('input', clearError);
    if (passwordInput) passwordInput.addEventListener('input', clearError);
});

function validateForm() {
    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value;
    let isValid = true;
    
    // Clear previous errors
    clearErrors();
    
    // Email validation
    if (!email) {
        showError('emailError', 'Email address is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('emailError', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Password validation
    if (!password) {
        showError('passwordError', 'Password is required');
        isValid = false;
    } else if (password.length < 6) {
        showError('passwordError', 'Password must be at least 6 characters');
        isValid = false;
    }
    
    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.querySelector('span').textContent = message;
        errorElement.style.display = 'flex';
    }
}

function clearError(e) {
    const errorMap = {
        emailInput: 'emailError',
        passwordInput: 'passwordError'
    };
    const errorElement = document.getElementById(errorMap[e.target.id]);
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(error => {
        error.style.display = 'none';
    });
}

async function performLogin() {
    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const loginButton = document.getElementById('loginButton');
    const buttonText = document.getElementById('buttonText');
    const loginSpinner = document.getElementById('loginSpinner');
    
    if (!loginButton || !buttonText || !loginSpinner) {
        return;
    }
    
    // Show loading state
    loginButton.disabled = true;
    buttonText.textContent = 'Logging in...';
    loginSpinner.style.display = 'inline-block';
    
    try {
        
        const response = await fetch(`${CONFIG.API_URL}?action=login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                email: email,
                password: password,
                remember: rememberMe
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Login successful - Store user data locally for session persistence
            if (data.user) {
                localStorage.setItem('motorlink_user', JSON.stringify(data.user));
                localStorage.setItem('motorlink_authenticated', 'true');
            }

            const urlParams = new URLSearchParams(window.location.search);
            const redirect = urlParams.get('redirect');

            // Only allow relative in-site redirects to avoid open redirect issues.
            if (redirect && !redirect.startsWith('http://') && !redirect.startsWith('https://') && !redirect.startsWith('//')) {
                window.location.href = redirect;
            } else {
                // Redirect to home page (dashboard) by default.
                window.location.href = 'index.html';
            }

        } else {
            // Login failed
            throw new Error(data.message || 'Login failed. Please check your credentials.');
        }
        
    } catch (error) {
        
        // More specific error messages
        let userMessage = 'Login failed. Please try again.';
        if (error.message.includes('network') || !navigator.onLine) {
            userMessage = 'Network error. Please check your internet connection.';
        } else if (error.message.includes('credentials')) {
            userMessage = 'Invalid email or password. Please try again.';
        }
        
        showToast(userMessage, 'error');
        
        // Reset button state
        loginButton.disabled = false;
        buttonText.textContent = 'Login to Account';
        loginSpinner.style.display = 'none';
    }
}

function togglePassword() {
    const passwordInput = document.getElementById('passwordInput');
    const toggleIcon = document.getElementById('passwordToggleIcon');
    
    if (!passwordInput || !toggleIcon) return;
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'fas fa-eye';
    }
}

function showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <i class="${icons[type]}" style="color: ${colors[type]}; font-size: 16px;"></i>
            <span style="flex: 1; line-height: 1.4;">${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #999; margin-left: auto;">×</button>
        </div>
    `;
    
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 6px 25px rgba(0,0,0,0.15);
        z-index: 10000;
        border-left: 4px solid ${colors[type]};
        max-width: 350px;
        font-size: 14px;
        animation: slideInRight 0.4s ease;
    `;
    
    // Add animation styles if not already present
    if (!document.querySelector('#toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}
/**
 * Registration Form Handler
 * Handles multi-step registration form with validation
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registerForm');
    const steps = document.querySelectorAll('.form-step');
    const stepDots = document.querySelectorAll('.step-dot');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const nextBtnText = document.getElementById('nextBtnText');
    const nextBtnIcon = document.getElementById('nextBtnIcon');
    const successMessage = document.getElementById('successMessage');
    const authLinks = document.getElementById('authLinks');
    
    let currentStep = 1;
    const totalSteps = 3;
    
    // Get API URL from config
    const apiUrl = window.CONFIG?.API_URL || 'http://127.0.0.1:8000/proxy.php';
    
    // Validation state
    const validationState = {
        full_name: false,
        username: false,
        email: false,
        phone: false,
        city: false,
        password: false,
        confirm_password: false,
        agree_terms: false
    };
    
    // User type selection
    const userTypeCards = document.querySelectorAll('.user-type-card');
    const userTypeInput = document.getElementById('userType');
    
    userTypeCards.forEach(card => {
        card.addEventListener('click', function() {
            const type = this.dataset.type;
            
            if (this.classList.contains('disabled')) {
                if (confirm('Business accounts require our specialized onboarding process.\n\nWould you like to go to the Business Onboarding Portal now?')) {
                    window.location.href = 'onboarding/onboarding.html';
                }
                return;
            }
            
            userTypeCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            userTypeInput.value = type;
            validationState.user_type = true;
            updateSubmitButton();
        });
    });
    
    // Password toggle
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('password');
    const passwordToggleIcon = document.getElementById('passwordToggleIcon');
    
    if (passwordToggle) {
        passwordToggle.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            passwordToggleIcon.classList.toggle('fa-eye');
            passwordToggleIcon.classList.toggle('fa-eye-slash');
        });
    }
    
    // Confirm password toggle
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const confirmPasswordToggleIcon = document.getElementById('confirmPasswordToggleIcon');
    
    if (confirmPasswordToggle) {
        confirmPasswordToggle.addEventListener('click', function() {
            const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmPasswordInput.setAttribute('type', type);
            confirmPasswordToggleIcon.classList.toggle('fa-eye');
            confirmPasswordToggleIcon.classList.toggle('fa-eye-slash');
        });
    }
    
    // Password strength checker
    passwordInput.addEventListener('input', function() {
        updatePasswordStrength(this.value);
        validatePassword(this.value);
    });
    
    confirmPasswordInput.addEventListener('input', function() {
        validateConfirmPassword();
    });
    
    // Real-time validation
    setupRealTimeValidation();
    
    // Keyboard navigation - Enter key to advance
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey && document.activeElement.tagName !== 'TEXTAREA') {
            const activeElement = document.activeElement;
            // Don't trigger if user is on a button
            if (activeElement.tagName !== 'BUTTON') {
                e.preventDefault();
                nextBtn.click();
            }
        }
    });
    
    // Navigation - Next button handles both navigation and submission
    nextBtn.addEventListener('click', function(e) {
        // If on final step, let form submit naturally
        if (currentStep === totalSteps) {
            return; // Let form submit handler take over
        }
        
        // Otherwise, navigate to next step
        e.preventDefault();
        if (validateCurrentStep()) {
            currentStep++;
            updateFormSteps();
        }
    });
    
    prevBtn.addEventListener('click', function() {
        if (currentStep > 1) {
            currentStep--;
            updateFormSteps();
        }
    });
    
    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateCurrentStep()) {
            return;
        }
        
        // Final validation
        if (!validatePassword(passwordInput.value) || !validateConfirmPassword()) {
            return;
        }
        
        if (!document.getElementById('agreeTerms').checked) {
            showError(document.getElementById('agreeTerms'), 'You must agree to the terms and conditions');
            return;
        }
        
        // Show loading state
        const btnText = nextBtn.innerHTML;
        nextBtn.disabled = true;
        nextBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        
        // Gather form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Remove confirm_password and optional fields
        delete data.confirm_password;
        delete data.agree_marketing;
        if (!data.whatsapp) delete data.whatsapp;
        if (!data.address) delete data.address;
        
        try {
            const response = await fetch(`${apiUrl}?action=register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Hide form and show success message
                form.style.display = 'none';
                successMessage.style.display = 'block';
                authLinks.style.display = 'none';
                document.querySelector('.step-indicator').style.display = 'none';
                document.querySelector('.welcome-message').style.display = 'none';
                
                // If email wasn't sent, show verification link for testing
                if (result.verification_link) {
                    const infoBox = successMessage.querySelector('.info-box');
                    if (infoBox) {
                        const testLink = document.createElement('div');
                        testLink.style.marginTop = '16px';
                        testLink.style.padding = '12px';
                        testLink.style.background = '#fff3cd';
                        testLink.style.border = '1px solid #ffc107';
                        testLink.style.borderRadius = '4px';
                        testLink.innerHTML = `
                            <strong>⚠️ Email Test Mode:</strong><br>
                            <small>Verification link: <a href="${result.verification_link}" target="_blank">${result.verification_link}</a></small>
                        `;
                        infoBox.appendChild(testLink);
                    }
                }
            } else {
                alert(result.message || 'Registration failed. Please try again.');
                nextBtn.disabled = false;
                nextBtn.innerHTML = btnText;
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred. Please check your connection and try again.');
            nextBtn.disabled = false;
            nextBtn.innerHTML = btnText;
        }
    });
    
    // Update form steps UI
    function updateFormSteps() {
        // Hide all steps
        steps.forEach(step => step.classList.remove('active'));
        
        // Show current step
        const currentStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        if (currentStepEl) currentStepEl.classList.add('active');
        
        // Update step dots
        stepDots.forEach((dot, index) => {
            const stepNum = index + 1;
            if (stepNum === currentStep) {
                dot.classList.add('active');
                dot.classList.remove('completed');
            } else if (stepNum < currentStep) {
                dot.classList.add('completed');
                dot.classList.remove('active');
            } else {
                dot.classList.remove('active', 'completed');
            }
        });
        
        // Update buttons
        prevBtn.style.display = currentStep === 1 ? 'none' : 'flex';
        
        // Change button text and icon on final step
        if (currentStep === totalSteps) {
            nextBtnText.textContent = 'Register';
            nextBtnIcon.className = 'fas fa-user-plus';
            nextBtn.type = 'submit';
        } else {
            nextBtnText.textContent = 'Next';
            nextBtnIcon.className = 'fas fa-arrow-right';
            nextBtn.type = 'button';
        }
        
        updateSubmitButton();
    }
    
    // Setup real-time validation
    function setupRealTimeValidation() {
        // Full name
        document.getElementById('fullName').addEventListener('blur', function() {
            validationState.full_name = validateField(this, 'Full name is required', (val) => val.length >= 2);
        });
        
        // Username
        let usernameTimeout;
        document.getElementById('username').addEventListener('input', function() {
            clearTimeout(usernameTimeout);
            const username = this.value.trim();
            
            if (username.length < 3) {
                showError(this, `Username must be at least 3 characters (currently ${username.length})`);
                validationState.username = false;
            } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                showError(this, 'Username can only contain letters, numbers, and underscores (no spaces or special characters)');
                validationState.username = false;
            } else {
                clearError(this);
                usernameTimeout = setTimeout(() => checkUsernameDuplicate(username), 500);
            }
            updateSubmitButton();
        });
        
        // Email
        let emailTimeout;
        document.getElementById('email').addEventListener('input', function() {
            clearTimeout(emailTimeout);
            const email = this.value.trim();
            
            if (!email) {
                validationState.email = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showError(this, 'Email should be like: name@example.com');
                validationState.email = false;
            } else {
                clearError(this);
                emailTimeout = setTimeout(() => checkEmailDuplicate(email), 500);
            }
            updateSubmitButton();
        });
        
        // Phone
        document.getElementById('phone').addEventListener('blur', function() {
            validationState.phone = validateField(this, 'Phone number is required', (val) => {
                const phone = val.replace(/\s/g, '');
                return /^\+?265\d{9}$/.test(phone) || phone.length >= 7;
            });
        });
        
        // City
        document.getElementById('city').addEventListener('change', function() {
            validationState.city = validateField(this, 'City is required', (val) => val.length > 0);
        });
        
        // Terms
        document.getElementById('agreeTerms').addEventListener('change', function() {
            validationState.agree_terms = this.checked;
            updateSubmitButton();
        });
    }
    
    // Validate current step
    function validateCurrentStep() {
        const currentStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        if (!currentStepEl) return false;
        
        const requiredFields = currentStepEl.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                showError(field, `${field.labels[0]?.textContent || 'This field'} is required`);
                isValid = false;
            } else {
                clearError(field);
            }
        });
        
        // Step-specific validation
        if (currentStep === 1) {
            if (!userTypeInput.value) {
                alert('Please select an account type');
                isValid = false;
            }
        }
        
        if (currentStep === 3) {
            if (!validatePassword(passwordInput.value)) {
                isValid = false;
            }
            if (!validateConfirmPassword()) {
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    // Validate password
    function validatePassword(password) {
        if (!password) {
            showError(passwordInput, 'Password is required');
            validationState.password = false;
            return false;
        }
        
        if (password.length < 6) {
            showError(passwordInput, `Password must be at least 6 characters (currently ${password.length})`);
            validationState.password = false;
            return false;
        }
        
        clearError(passwordInput);
        validationState.password = true;
        updateSubmitButton();
        return true;
    }
    
    // Validate confirm password
    function validateConfirmPassword() {
        const password = passwordInput.value;
        const confirm = confirmPasswordInput.value;
        
        if (!confirm) {
            showError(confirmPasswordInput, 'Please confirm your password');
            validationState.confirm_password = false;
            return false;
        }
        
        if (password !== confirm) {
            showError(confirmPasswordInput, 'Passwords do not match');
            validationState.confirm_password = false;
            return false;
        }
        
        clearError(confirmPasswordInput);
        validationState.confirm_password = true;
        updateSubmitButton();
        return true;
    }
    
    // Update password strength
    function updatePasswordStrength(password) {
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        
        if (!password) {
            strengthFill.className = 'strength-fill';
            strengthFill.style.width = '0%';
            strengthText.textContent = 'Password strength';
            return;
        }
        
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        
        strengthFill.className = 'strength-fill';
        if (strength <= 2) {
            strengthFill.classList.add('weak');
            strengthText.textContent = 'Weak password';
        } else if (strength <= 3) {
            strengthFill.classList.add('medium');
            strengthText.textContent = 'Medium password';
        } else {
            strengthFill.classList.add('strong');
            strengthText.textContent = 'Strong password';
        }
    }
    
    // Check username duplicate
    async function checkUsernameDuplicate(username) {
        try {
            const response = await fetch(`${apiUrl}?action=check_username`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            
            const result = await response.json();
            const usernameInput = document.getElementById('username');
            
            if (result.exists) {
                showError(usernameInput, 'This username is already taken');
                validationState.username = false;
            } else {
                clearError(usernameInput);
                validationState.username = true;
            }
            updateSubmitButton();
        } catch (error) {
            console.error('Username check error:', error);
        }
    }
    
    // Check email duplicate
    async function checkEmailDuplicate(email) {
        try {
            const response = await fetch(`${apiUrl}?action=check_email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            
            const result = await response.json();
            const emailInput = document.getElementById('email');
            
            if (result.exists) {
                showError(emailInput, 'This email is already registered');
                validationState.email = false;
            } else {
                clearError(emailInput);
                validationState.email = true;
            }
            updateSubmitButton();
        } catch (error) {
            console.error('Email check error:', error);
        }
    }
    
    // Validate field
    function validateField(field, errorMessage, validator) {
        const value = field.value.trim();
        if (!value || !validator(value)) {
            showError(field, errorMessage);
            return false;
        }
        clearError(field);
        return true;
    }
    
    // Update submit button state
    function updateSubmitButton() {
        if (currentStep === totalSteps) {
            // On final step, enable/disable based on validation
            const allValid = 
                validationState.full_name &&
                validationState.username &&
                validationState.email &&
                validationState.phone &&
                validationState.city &&
                validationState.password &&
                validationState.confirm_password &&
                validationState.agree_terms;
            
            nextBtn.disabled = !allValid;
        } else {
            // On other steps, button is always enabled for navigation
            nextBtn.disabled = false;
        }
    }
    
    // Show error
    function showError(field, message) {
        field.classList.add('error');
        field.classList.remove('success');
        const errorDiv = field.parentElement?.querySelector('.error-message') || 
                        field.closest('.form-group')?.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.add('show');
        }
    }
    
    // Clear error
    function clearError(field) {
        field.classList.remove('error');
        field.classList.add('success');
        const errorDiv = field.parentElement?.querySelector('.error-message') || 
                        field.closest('.form-group')?.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.classList.remove('show');
        }
    }
    
    // Initialize
    updateFormSteps();
});


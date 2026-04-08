/**
 * Malawi Phone Number Formatter
 * Automatically formats phone numbers as user types
 * Format: +265 991 234 567
 */

function formatMalawiPhone(input) {
    // Get raw digits only
    let value = input.value.replace(/\D/g, '');
    
    // Handle Malawi numbers
    if (value.startsWith('0')) {
        // Remove leading 0 and add 265
        value = '265' + value.substring(1);
    } else if (!value.startsWith('265') && value.length > 0) {
        // Add 265 prefix if missing
        value = '265' + value;
    }
    
    // Limit to 12 digits (265 + 9 digits)
    value = value.substring(0, 12);
    
    // Format: +265 991 234 567
    let formatted = '';
    if (value.length > 0) {
        formatted = '+' + value.substring(0, 3);
        if (value.length > 3) {
            formatted += ' ' + value.substring(3, 6);
        }
        if (value.length > 6) {
            formatted += ' ' + value.substring(6, 9);
        }
        if (value.length > 9) {
            formatted += ' ' + value.substring(9, 12);
        }
    }
    
    input.value = formatted;
}

function setupPhoneFormatting() {
    // Find all phone input fields
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    
    phoneInputs.forEach(input => {
        // Format on input
        input.addEventListener('input', function() {
            formatMalawiPhone(this);
        });
        
        // Format on paste
        input.addEventListener('paste', function(e) {
            setTimeout(() => formatMalawiPhone(this), 10);
        });
        
        // Add placeholder if not set
        if (!input.placeholder) {
            input.placeholder = '+265 991 234 567';
        }
    });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupPhoneFormatting);
} else {
    setupPhoneFormatting();
}

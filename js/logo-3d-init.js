/**
 * Logo 3D Animation Initialization
 * Runs only on first load of the landing page
 */

(function() {
    'use strict';
    
    // Only run on index page
    if (!document.body.classList.contains('index-page')) {
        return;
    }
    
    // Check if this is the first load (no session storage flag)
    const hasAnimated = sessionStorage.getItem('motorlink_logo_animated');
    
    if (!hasAnimated) {
        // Find the logo element
        const logo = document.querySelector('.header .logo');
        
        if (logo) {
            // Add first-load class to trigger animation
            logo.classList.add('first-load');
            
            // Mark as animated in session storage (session only, resets on new session)
            sessionStorage.setItem('motorlink_logo_animated', 'true');
            
            // Remove class after animation completes to allow hover effects
            setTimeout(() => {
                logo.classList.remove('first-load');
            }, 2000); // Remove after animation + glow completes
        }
    }
})();


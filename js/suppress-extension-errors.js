/**
 * Suppress Chrome Extension Errors & Missing Image/Asset Errors
 *
 * 1. Suppresses harmless console errors from browser extensions.
 * 2. Silently handles broken <img>, <link> (favicon), and similar asset
 *    load failures so they don't clutter the DevTools console.
 */

(function() {
    'use strict';

    // Store original console methods
    const originalError = console.error;
    const originalWarn = console.warn;

    // List of error patterns to suppress
    const suppressPatterns = [
        /Could not establish connection\. Receiving end does not exist/i,
        /Unchecked runtime\.lastError/i,
        /Extension context invalidated/i,
        /chrome-extension:/i,
        /AbortError.*Transition was skipped/i,
        /Transition was skipped/i
    ];

    // Check if a message matches any suppress pattern
    function shouldSuppress(message) {
        const msgStr = String(message);
        return suppressPatterns.some(pattern => pattern.test(msgStr));
    }

    // Override console.error
    console.error = function(...args) {
        // Check if this is an extension error
        if (args.length > 0 && shouldSuppress(args[0])) {
            // Silently ignore extension errors
            return;
        }
        // Pass through all other errors
        originalError.apply(console, args);
    };

    // Override console.warn
    console.warn = function(...args) {
        // Check if this is an extension warning
        if (args.length > 0 && shouldSuppress(args[0])) {
            // Silently ignore extension warnings
            return;
        }
        // Pass through all other warnings
        originalWarn.apply(console, args);
    };

    // Suppress window error events from extensions
    const originalWindowError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
        // Suppress extension-related errors
        if (shouldSuppress(message) || (source && source.includes('chrome-extension://'))) {
            return true; // Suppress the error
        }
        // Pass through to original handler if it exists
        if (originalWindowError) {
            return originalWindowError.apply(this, arguments);
        }
        return false;
    };

    // Suppress unhandledrejection events from extensions
    window.addEventListener('unhandledrejection', function(event) {
        if (event.reason && shouldSuppress(String(event.reason))) {
            event.preventDefault();
        }
    });

    // ── Suppress missing image / favicon / asset 404 errors ─────────────────
    // These are resource-load errors on <img>, <link rel="icon">, <source>
    // etc. They show as red network errors in DevTools but carry no useful
    // runtime information for production. Swap broken images to a transparent
    // 1×1 GIF placeholder so they vanish visually and the error is silenced.
    const TRANSPARENT_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

    document.addEventListener('error', function(e) {
        const el = e.target;
        if (!el || !el.tagName) return;
        const tag = el.tagName.toUpperCase();

        if (tag === 'IMG') {
            // Only swap if not already the placeholder (prevents infinite loops)
            if (el.src !== TRANSPARENT_GIF) {
                el.src = TRANSPARENT_GIF;
                el.style.visibility = 'hidden'; // keep layout; just invisible
            }
            e.stopPropagation();
            return;
        }

        if (tag === 'LINK') {
            // Favicon / stylesheet 404 — just remove the element silently
            const rel = (el.getAttribute('rel') || '').toLowerCase();
            if (rel.includes('icon') || rel.includes('stylesheet')) {
                el.parentNode && el.parentNode.removeChild(el);
            }
            e.stopPropagation();
            return;
        }

        if (tag === 'SOURCE') {
            // <picture>/<video> source fallback — let browser use next source
            e.stopPropagation();
        }
    }, /* useCapture = */ true);

})();

/**
 * MotorLink — "Know Your Car" Page Walkthrough
 * ─────────────────────────────────────────────
 *   · Spotlight + contextual tooltip tour for car-database.html
 *   · 5 focused steps covering VIN Decoder, Journey Planner & My Vehicles
 *   · Shares the same render engine + CSS as the main index walkthrough
 *     (injectStyles checks for the same style-tag ID so nothing is doubled)
 *   · Controlled by the same DB flag (walkthrough_completed_at) so the
 *     admin "Reset Walkthrough" button affects this page too
 *   · Page-specific localStorage keys so this never clobbers the
 *     index.html walkthrough state and vice versa
 */
(function () {
    'use strict';

    // Only run on the car-database page
    const _path = (window.location.pathname || '/').toLowerCase();
    if (!_path.endsWith('car-database.html') && !_path.endsWith('car-database')) return;

    const LS_DONE   = 'motorlink_wt_cardb_done';
    const LS_SKIP   = 'motorlink_wt_cardb_skip';
    const API_BASE  = (window.location.hostname === 'localhost' || window.location.hostname.startsWith('127.'))
        ? 'proxy.php' : 'api.php';

    // ── Steps ────────────────────────────────────────────────────────────
    const STEPS = [
        {
            selector: '.tabs-container',
            title: '3 Tools in One Page',
            body: 'Know Your Car gives you <strong>VIN Decoder</strong> to read any car\'s factory spec, <strong>Journey Planner</strong> to calculate fuel costs for any trip in Malawi, and <strong>My Vehicles</strong> to store your cars. Tap any tab to switch between them.',
            icon: 'fa-layer-group'
        },
        {
            selector: '#vinInput',
            title: 'What Is a VIN?',
            body: 'A VIN (Vehicle Identification Number) is the unique 17-character code stamped into every car. You\'ll find it on your <strong>registration document (chitupa)</strong>, on the dashboard just inside the windscreen, or on a plate inside the driver\'s door frame.',
            icon: 'fa-barcode'
        },
        {
            selector: '#vinDecodeBtn',
            title: 'Instant Vehicle Profile — Free',
            body: 'Tap <strong>Decode VIN</strong> to instantly reveal the car\'s make, model, year, engine size, fuel type, transmission, country of manufacture and more — powered by the free NHTSA vPIC database. No sign-in needed.',
            icon: 'fa-search'
        },
        {
            selector: '[data-tab="journey-planner"]',
            title: 'Journey Planner & Fuel Costs',
            body: 'Enter any route — Lilongwe to Blantyre, for example — and get the exact distance, litres of fuel needed, and the <strong>cost at today\'s Malawi pump prices</strong>. Great for budgeting road trips. Requires a free account.',
            icon: 'fa-route'
        },
        {
            selector: '[data-tab="my-vehicles"]',
            title: 'Your Garage in the Cloud',
            body: 'Save your own cars under <strong>My Vehicles</strong>. Once stored, Journey Planner automatically picks your vehicle\'s real fuel consumption so every cost estimate is accurate. Login required — <a href="register.html" style="color:#00c853;font-weight:600;">sign up free</a> to unlock.',
            icon: 'fa-car-side'
        }
    ];

    let step      = 0;
    let overlay   = null;
    let spotlight = null;
    let card      = null;
    let resizeRaf = null;

    // ── Styles ─────────────────────────────────────────────────────────────
    // Identical to walkthrough.js — the ID check prevents double-injection if
    // both scripts happen to be on the same page in future.
    function injectStyles() {
        if (document.getElementById('ml-wt-css')) return;
        const s = document.createElement('style');
        s.id = 'ml-wt-css';
        s.textContent = `
            #ml-wt-overlay {
                position: fixed; inset: 0;
                background: rgba(10,20,30,0.62);
                z-index: 99990;
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: all;
                cursor: default;
            }
            #ml-wt-overlay.wt-on { opacity: 1; }

            #ml-wt-spot {
                position: fixed;
                border-radius: 10px;
                box-shadow: 0 0 0 9999px rgba(10,20,30,0.62),
                            0 0 0 3px #00c853,
                            0 0 24px rgba(0,200,83,0.4);
                z-index: 99991;
                pointer-events: none;
                transition: top .38s cubic-bezier(.65,0,.35,1),
                            left .38s cubic-bezier(.65,0,.35,1),
                            width .38s cubic-bezier(.65,0,.35,1),
                            height .38s cubic-bezier(.65,0,.35,1);
                background: transparent;
            }

            #ml-wt-card {
                position: fixed;
                width: 320px;
                max-width: calc(100vw - 32px);
                background: #fff;
                border-radius: 16px;
                box-shadow: 0 20px 50px rgba(0,0,0,.35);
                z-index: 99992;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                overflow: visible;
                opacity: 0;
                transform: scale(0.94);
                transition: opacity .22s ease, transform .22s ease,
                            top .35s cubic-bezier(.65,0,.35,1),
                            left .35s cubic-bezier(.65,0,.35,1);
                pointer-events: all;
            }
            #ml-wt-card.wt-show { opacity: 1; transform: scale(1); }
            #ml-wt-card.wt-fade { opacity: 0; transform: scale(0.94); }

            .wt-card-inner { border-radius: 16px; overflow: hidden; }

            .wt-head {
                background: linear-gradient(135deg, #00c853 0%, #00a843 100%);
                color: #fff;
                padding: 16px 18px 13px;
            }
            .wt-head-row { display: flex; align-items: center; gap: 12px; }
            .wt-head-icon {
                width: 40px; height: 40px; border-radius: 50%;
                background: rgba(255,255,255,.22);
                display: flex; align-items: center; justify-content: center;
                font-size: 17px; flex-shrink: 0;
            }
            .wt-head-title { font-size: 1rem; font-weight: 700; margin: 0; flex: 1; line-height: 1.3; }
            .wt-close {
                background: rgba(255,255,255,.2); border: 0;
                width: 28px; height: 28px; border-radius: 50%;
                color: #fff; font-size: 17px; cursor: pointer;
                display: flex; align-items: center; justify-content: center;
                transition: all .2s; flex-shrink: 0;
            }
            .wt-close:hover { background: rgba(255,255,255,.38); transform: rotate(90deg); }

            .wt-body {
                padding: 14px 18px 16px;
                color: #374151; font-size: .9rem; line-height: 1.6;
            }
            .wt-body strong { color: #111827; }

            .wt-footer {
                display: flex; align-items: center; justify-content: space-between;
                padding: 10px 16px 14px; border-top: 1px solid #f3f4f6;
            }
            .wt-dots { display: flex; gap: 5px; align-items: center; }
            .wt-dot { width: 6px; height: 6px; border-radius: 50%; background: #d1d5db; transition: all .2s; }
            .wt-dot.on { background: #00c853; width: 16px; border-radius: 3px; }

            .wt-btns { display: flex; gap: 7px; }
            .wt-btn {
                padding: 7px 14px; border: 0; border-radius: 8px;
                font-weight: 600; font-size: .8rem; cursor: pointer;
                min-height: 34px; transition: all .18s; font-family: inherit;
                display: flex; align-items: center; gap: 5px; white-space: nowrap;
            }
            .wt-btn-ghost { background: #f3f4f6; color: #6b7280; }
            .wt-btn-ghost:hover { background: #e5e7eb; color: #374151; }
            .wt-btn-skip  { background: transparent; color: #9ca3af; padding-left: 6px; }
            .wt-btn-skip:hover { color: #6b7280; }
            .wt-btn-primary {
                background: linear-gradient(135deg, #00c853 0%, #00a843 100%);
                color: #fff; box-shadow: 0 3px 10px rgba(0,200,83,.3);
            }
            .wt-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 5px 14px rgba(0,200,83,.4); }

            /* Directional arrows */
            .wt-arrow { position: absolute; width: 0; height: 0; pointer-events: none; }
            .wt-arrow-bottom {
                bottom: -11px; left: var(--arrow-x,50%); transform: translateX(-50%);
                border-left: 11px solid transparent; border-right: 11px solid transparent;
                border-top: 12px solid #fff;
                filter: drop-shadow(0 3px 4px rgba(0,0,0,.12));
            }
            .wt-arrow-top {
                top: -11px; left: var(--arrow-x,50%); transform: translateX(-50%);
                border-left: 11px solid transparent; border-right: 11px solid transparent;
                border-bottom: 12px solid #00c853;
            }
            .wt-arrow-right {
                right: -11px; top: var(--arrow-y,50%); transform: translateY(-50%);
                border-top: 11px solid transparent; border-bottom: 11px solid transparent;
                border-left: 12px solid #fff;
                filter: drop-shadow(3px 0 4px rgba(0,0,0,.12));
            }
            .wt-arrow-left {
                left: -11px; top: var(--arrow-y,50%); transform: translateY(-50%);
                border-top: 11px solid transparent; border-bottom: 11px solid transparent;
                border-right: 12px solid #00c853;
            }

            .wt-step-label { font-size: .73rem; color: rgba(255,255,255,.8); margin-top: 2px; font-weight: 500; }

            /* Mobile: dock card at bottom, keep spotlight above it */
            @media (max-width: 860px) {
                #ml-wt-card {
                    width: min(calc(100vw - 32px), 380px);
                    max-width: calc(100vw - 32px);
                    position: fixed !important;
                    bottom: calc(env(safe-area-inset-bottom,0px) + 16px) !important;
                    left: 50% !important;
                    transform: translateX(-50%) !important;
                    top: auto !important;
                    right: auto !important;
                    transition: opacity .22s ease, transform .22s ease;
                }
                #ml-wt-card.wt-show {
                    opacity: 1; transform: translateX(-50%) scale(1) !important;
                }
                #ml-wt-card.wt-fade {
                    opacity: 0; transform: translateX(-50%) scale(0.94) !important;
                }
                .wt-arrow { display: none; }
                #ml-wt-spot { max-height: calc(100vh - 240px); overflow: hidden; }
                .wt-body {
                    font-size: .88rem; padding: 12px 16px 14px;
                    max-height: 130px; overflow-y: auto;
                }
                .wt-btn { min-height: 40px; padding: 9px 16px; font-size: .83rem; }
            }
        `;
        document.head.appendChild(s);
    }

    // ── Entry ──────────────────────────────────────────────────────────────
    function init() {
        fetch(`${API_BASE}?action=get_walkthrough_state`, { credentials: 'same-origin' })
            .then(r => r.json())
            .then(d => {
                if (!d || !d.success) return;
                if (d.should_show) {
                    if (d.reason === 'guest') {
                        // Guests: localStorage is the only memory — respect it
                        try {
                            if (localStorage.getItem(LS_DONE) === '1' || localStorage.getItem(LS_SKIP) === '1') return;
                        } catch(e){}
                    } else {
                        // Authenticated: server is authoritative (DB reset clears flags)
                        try { localStorage.removeItem(LS_DONE); localStorage.removeItem(LS_SKIP); } catch(e){}
                    }
                    setTimeout(launch, 1200);
                } else {
                    try { localStorage.setItem(LS_DONE, '1'); } catch(e){}
                }
            })
            .catch(() => {
                try {
                    if (localStorage.getItem(LS_DONE) === '1' || localStorage.getItem(LS_SKIP) === '1') return;
                } catch(e){}
                // Network offline and no stored flag → still show the tour
                setTimeout(launch, 1200);
            });
    }

    // ── Launch ─────────────────────────────────────────────────────────────
    function launch() {
        injectStyles();
        step = 0;

        overlay = document.createElement('div');
        overlay.id = 'ml-wt-overlay';
        document.body.appendChild(overlay);

        spotlight = document.createElement('div');
        spotlight.id = 'ml-wt-spot';
        document.body.appendChild(spotlight);

        card = document.createElement('div');
        card.id = 'ml-wt-card';
        document.body.appendChild(card);

        requestAnimationFrame(() => overlay.classList.add('wt-on'));

        const onResize = () => {
            if (resizeRaf) cancelAnimationFrame(resizeRaf);
            resizeRaf = requestAnimationFrame(() => positionCurrentStep());
        };
        window.addEventListener('resize', onResize);
        window.addEventListener('scroll', onResize, { passive: true });
        overlay._cleanup = () => {
            window.removeEventListener('resize', onResize);
            window.removeEventListener('scroll', onResize);
        };

        showStep(0, false);
    }

    // ── Helpers ────────────────────────────────────────────────────────────
    function isMobileLayout() { return window.innerWidth <= 860; }

    function isElementVisible(el) {
        if (!el) return false;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false;
        if (el.offsetParent === null && cs.position !== 'fixed') return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
    }

    function resolveTarget(s) {
        const el = document.querySelector(s.selector);
        if (isElementVisible(el)) return el;
        if (s.mobileSelector) {
            const fb = document.querySelector(s.mobileSelector);
            if (isElementVisible(fb)) return fb;
        }
        return el;
    }

    // ── Step navigation ────────────────────────────────────────────────────
    function showStep(index, animate) {
        if (index < 0) return;
        if (index >= STEPS.length) { finish(true); return; }

        const s = STEPS[index];
        const target = resolveTarget(s);
        if (!target || !isElementVisible(target)) { showStep(index + 1, animate); return; }

        step = index;

        const rect = target.getBoundingClientRect();
        const bottomReserved = isMobileLayout() ? 230 : 70;
        const needsScroll = rect.top < 70 || rect.bottom > window.innerHeight - bottomReserved;

        if (needsScroll) {
            if (card) card.classList.add('wt-fade');
            target.scrollIntoView({ behavior: 'smooth', block: isMobileLayout() ? 'start' : 'center' });
            setTimeout(() => { if (overlay) renderStep(index); }, 520);
        } else {
            renderStep(index);
        }
    }

    function renderStep(index) {
        const s = STEPS[index];
        const target = resolveTarget(s);
        if (!target || !isElementVisible(target)) { showStep(index + 1, false); return; }

        const rect = target.getBoundingClientRect();
        const pad = 8;

        spotlight.style.top    = (rect.top    - pad) + 'px';
        spotlight.style.left   = (rect.left   - pad) + 'px';
        spotlight.style.width  = (rect.width  + pad * 2) + 'px';
        spotlight.style.height = (rect.height + pad * 2) + 'px';

        card.classList.remove('wt-show');
        card.classList.add('wt-fade');
        card.innerHTML = buildCardHTML(index, s);
        wireButtons(index);

        card.style.visibility = 'hidden';
        card.style.top  = '0px';
        card.style.left = '0px';
        requestAnimationFrame(() => {
            const pos = computePosition(rect, card.offsetWidth, card.offsetHeight, pad);
            card.style.top  = pos.top  + 'px';
            card.style.left = pos.left + 'px';
            card.style.setProperty('--arrow-x', pos.arrowX + 'px');
            card.style.setProperty('--arrow-y', pos.arrowY + 'px');
            const arrow = card.querySelector('.wt-arrow');
            if (arrow) arrow.className = 'wt-arrow ' + pos.arrowClass;
            card.style.visibility = 'visible';
            card.classList.remove('wt-fade');
            requestAnimationFrame(() => card && card.classList.add('wt-show'));
        });
    }

    function positionCurrentStep() {
        if (step < 0 || step >= STEPS.length || !card || !spotlight) return;
        const s = STEPS[step];
        const target = resolveTarget(s);
        if (!target) return;
        const pad = 8;
        const rect = target.getBoundingClientRect();
        spotlight.style.top    = (rect.top    - pad) + 'px';
        spotlight.style.left   = (rect.left   - pad) + 'px';
        spotlight.style.width  = (rect.width  + pad * 2) + 'px';
        spotlight.style.height = (rect.height + pad * 2) + 'px';
        const pos = computePosition(rect, card.offsetWidth, card.offsetHeight, pad);
        card.style.top  = pos.top  + 'px';
        card.style.left = pos.left + 'px';
        card.style.setProperty('--arrow-x', pos.arrowX + 'px');
        card.style.setProperty('--arrow-y', pos.arrowY + 'px');
        const arrow = card.querySelector('.wt-arrow');
        if (arrow) arrow.className = 'wt-arrow ' + pos.arrowClass;
    }

    // ── Position algorithm (identical to main walkthrough) ─────────────────
    function computePosition(rect, cW, cH, pad) {
        const vW = window.innerWidth;
        const vH = window.innerHeight;
        const gap = 14 + pad;

        const spaceBelow = vH - rect.bottom - gap;
        const spaceAbove = rect.top - gap;
        const spaceRight = vW - rect.right - gap;
        const tCx = rect.left + rect.width  / 2;
        const tCy = rect.top  + rect.height / 2;

        let top, left, arrowClass, arrowX = 0, arrowY = 0;

        if (spaceBelow >= cH || spaceBelow >= spaceAbove) {
            top  = rect.bottom + gap;
            left = tCx - cW / 2;
            arrowClass = 'wt-arrow-top';
            arrowX = Math.max(22, Math.min(cW - 22, tCx - Math.max(16, Math.min(vW - cW - 16, left))));
        } else if (spaceAbove >= cH) {
            top  = rect.top - gap - cH;
            left = tCx - cW / 2;
            arrowClass = 'wt-arrow-bottom';
            arrowX = Math.max(22, Math.min(cW - 22, tCx - Math.max(16, Math.min(vW - cW - 16, left))));
        } else if (spaceRight >= cW) {
            left = rect.right + gap;
            top  = tCy - cH / 2;
            arrowClass = 'wt-arrow-left';
            arrowY = Math.max(22, Math.min(cH - 22, tCy - Math.max(16, Math.min(vH - cH - 16, top))));
        } else {
            left = rect.left - gap - cW;
            top  = tCy - cH / 2;
            arrowClass = 'wt-arrow-right';
            arrowY = Math.max(22, Math.min(cH - 22, tCy - Math.max(16, Math.min(vH - cH - 16, top))));
        }

        left = Math.max(16, Math.min(vW - cW - 16, left));
        top  = Math.max(16, Math.min(vH - cH - 16, top));

        return { top, left, arrowClass, arrowX, arrowY };
    }

    // ── Card HTML ──────────────────────────────────────────────────────────
    function buildCardHTML(index, s) {
        const visibleSteps = STEPS.filter(st => isElementVisible(resolveTarget(st)));
        const total    = visibleSteps.length;
        const localIdx = STEPS.slice(0, index + 1).filter(st => isElementVisible(resolveTarget(st))).length - 1;

        const dots = visibleSteps
            .map((_, i) => `<span class="wt-dot${i === localIdx ? ' on' : ''}"></span>`)
            .join('');

        const isLast  = STEPS.slice(index + 1).every(st => !isElementVisible(resolveTarget(st)));
        const isFirst = STEPS.slice(0, index).every(st => !isElementVisible(resolveTarget(st)));

        return `
            <div class="wt-card-inner">
                <div class="wt-head">
                    <div class="wt-head-row">
                        <div class="wt-head-icon"><i class="fas ${s.icon || 'fa-lightbulb'}"></i></div>
                        <div style="flex:1;min-width:0;">
                            <h3 class="wt-head-title">${s.title}</h3>
                            <div class="wt-step-label">Step ${localIdx + 1} of ${total}</div>
                        </div>
                        <button class="wt-close" data-wt="close" aria-label="End tour">&times;</button>
                    </div>
                </div>
                <div class="wt-body">${s.body}</div>
                <div class="wt-footer">
                    <div class="wt-dots">${dots}</div>
                    <div class="wt-btns">
                        ${isFirst
                            ? '<button class="wt-btn wt-btn-skip" data-wt="skip">Skip tour</button>'
                            : '<button class="wt-btn wt-btn-ghost" data-wt="prev"><i class="fas fa-arrow-left"></i> Back</button>'
                        }
                        <button class="wt-btn wt-btn-primary" data-wt="next">
                            ${isLast ? '<i class="fas fa-check"></i> Got it!' : 'Next <i class="fas fa-arrow-right"></i>'}
                        </button>
                    </div>
                </div>
            </div>
            <div class="wt-arrow"></div>
        `;
    }

    // ── Wire buttons ────────────────────────────────────────────────────────
    function wireButtons(index) {
        card.onclick = function (e) {
            const btn = e.target.closest('[data-wt]');
            if (!btn) return;
            e.stopPropagation();
            const action = btn.dataset.wt;
            if (action === 'next')  transition(() => showStep(index + 1, true));
            if (action === 'prev')  transition(() => showStep(index - 1, true));
            if (action === 'skip')  finish(false);
            if (action === 'close') finish(false);
        };
    }

    function transition(fn) {
        if (!card) return;
        card.classList.remove('wt-show');
        card.classList.add('wt-fade');
        setTimeout(fn, 200);
    }

    // ── Finish ─────────────────────────────────────────────────────────────
    function finish(completed) {
        try { localStorage.setItem(completed ? LS_DONE : LS_SKIP, '1'); } catch(e){}

        fetch(`${API_BASE}?action=complete_walkthrough`, {
            method: 'POST', credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed })
        }).catch(() => {});

        if (overlay) {
            overlay.classList.remove('wt-on');
            if (overlay._cleanup) overlay._cleanup();
            setTimeout(() => {
                overlay  && overlay.remove();
                spotlight && spotlight.remove();
                card      && card.remove();
                overlay = spotlight = card = null;
            }, 350);
        }
    }

    // ── Public API ─────────────────────────────────────────────────────────
    // Registering under the SAME global name means the admin "Reset Walkthrough"
    // button (which calls window.startMotorLinkWalkthrough()) works on this page.
    window.startMotorLinkWalkthrough = function () {
        if (overlay) finish(false);
        try { localStorage.removeItem(LS_DONE); localStorage.removeItem(LS_SKIP); } catch(e){}
        setTimeout(launch, 100);
    };

    // ── Boot ───────────────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

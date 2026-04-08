# Copilot Instructions for MotorLink Malawi

## Project Overview
- **MotorLink** is a PHP/JS web app for car marketplace, business onboarding, and admin management.
- Architecture: Flat structure, with core logic in root-level JS/PHP, feature-specific folders (e.g., `onboarding/`, `admin/`), and shared assets in `css/`, `js/`, and `uploads/`.

## Environment & Configuration
- **Environment auto-detection**: `config.js` (see line 61) sets `MODE` to `UAT` or `PRODUCTION` based on hostname.
- **Debugging**: Set `DEBUG = true` in `config.js` for verbose console logs.
- **API Routing**:
  - UAT: Uses `proxy.php` for CORS, API URL is `http://HOST:PORT/proxy.php`.
  - Production: Direct to `api.php`, API URL is `/motorlink/api.php`.
- **Config**: Copy `config.example.js` to `config.js` and edit for local secrets. Never commit `config.js`.

## Key Workflows
- **Local Dev**: `php -S localhost:8000` or use VS Code Live Server.
- **Production Deploy**: `git push` → SSH to server → `git pull` → set permissions (`chmod 755 -R .`, `chmod 777 -R uploads/`).
- **Switching Modes**: Change `MODE` in `config.js` (line 61) for production.
- **Testing**: No formal test suite; manual browser testing is standard. Use debug mode and browser console for troubleshooting.

## Core Patterns & Conventions
- **Shared logic**: `config.js`, `script.js`, and `js/mobile-menu.js` are loaded on nearly all pages.
- **Admin & Onboarding**: Each has its own API URL logic, but follows the same environment detection as main app.
- **Database**: SQL schema in `database/`. API endpoints in `api.php`, `proxy.php`, and `onboarding/api-onboarding.php`.
- **CSS**: Many feature-specific files; consolidation is ongoing (see `CLEANUP_FINDINGS.md`).
- **Uploads**: All user uploads go to `uploads/` (ensure permissions in production).

## Integration & Security
- **CORS**: `api.php` allows localhost, private IPs, and production domain. See README for details.
- **Session & error handling**: Production disables error display, logs to file. UAT enables debugging.
- **No external build tools**: Pure PHP/JS/CSS, no npm/yarn.

## Examples
- To add a new feature, follow the pattern in `onboarding/` (HTML, JS, PHP API, CSS).
- For admin features, see `admin/` for API and UI separation.

## References
- See `README.md` for full environment, deployment, and troubleshooting details.
- See `CODE_REVIEW_ANALYSIS.md` for file usage and architecture notes.
- See `CLEANUP_FINDINGS.md` for ongoing refactor plans.

---
**Keep instructions concise and up-to-date. Update this file if project structure or workflows change.**

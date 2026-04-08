# MotorLink Malawi - Automotive Marketplace Platform

## Overview

MotorLink is Malawi's comprehensive online automotive marketplace connecting car buyers, sellers, dealers, garages, and car hire companies across all 28 districts. The platform features car listings, business directories, service provider profiles, and an integrated AI recommendation engine.

---

## Key Features

### For Users
- **Car Listings**: Browse and search vehicles with advanced filtering (make, model, year, price, location)
- **AI Recommendations**: Personalized car suggestions based on viewing history and preferences
- **Business Directory**: Find verified car dealers, garages, and car hire companies
- **Listing Reports**: Flag suspicious or fraudulent listings (requires login)
- **User Accounts**: Create personal accounts to save favorites and manage listings
- **Mobile Responsive**: Fully optimized for all devices

### For Businesses
- **Self-Service Onboarding**: Register your business (car hire, garage, or dealer) online
- **Business Dashboards**: Dedicated dashboards for managing inventory and services
- **Dual Account System**: Automatic creation of business profile + user login account
- **Pending Approval Workflow**: Admin reviews and approves new business registrations
- **Social Media Integration**: Link Facebook, Instagram, Twitter, LinkedIn profiles
- **Service Listings**: Showcase services, specializations, and operating hours

### For Administrators
- **Admin Dashboard**: Manage users, businesses, and listings
- **Approval System**: Review and approve pending business registrations
- **User Management**: Create, edit, activate/deactivate user accounts
- **Business Management**: Manage dealers, garages, and car hire companies
- **Reports Dashboard**: View and manage listing reports

---

## Quick Start

### Local Development (UAT Mode)

**Option 1: PHP Built-in Server**
```bash
php -S localhost:8000
```

**Option 2: VS Code Live Server**
```
Right-click index.html → "Open with Live Server"
```

**Access URLs:**
- `http://localhost:8000` (PHP server)
- `http://127.0.0.1:5500` (VS Code Live Server)
- Works on any port automatically

---

## Mobile Testing (Same WiFi Network)

**1. Start server with network access:**
```bash
php -S 0.0.0.0:8000
```

**2. Find your laptop's IP address:**
- **Windows:** `ipconfig` (look for IPv4 Address)
- **Mac/Linux:** `ifconfig` (look for inet under WiFi)

**3. On mobile browser:**
```
http://YOUR_IP:8000
Example: http://192.168.1.100:8000
```

---

## Environment Switching (UAT ↔ Production)

### Automatic Detection (Default)

The system automatically detects the environment:

| Access From | Mode Detected | API Used |
|------------|---------------|----------|
| `localhost`, `127.0.0.1`, or `192.168.x.x` | **UAT** | Remote DB via proxy |
| `promanaged-it.com` | **PRODUCTION** | Local production DB |

### Manual Override

Force a specific environment regardless of hostname:

**config.js (Line 20):**
```javascript
const MANUAL_MODE_OVERRIDE = 'UAT';        // Force UAT mode
const MANUAL_MODE_OVERRIDE = 'PRODUCTION'; // Force Production mode
const MANUAL_MODE_OVERRIDE = null;         // Auto-detect (default)
```

This is useful for:
- Testing production behavior locally
- Debugging environment-specific issues
- Ensuring consistent testing environment

---

## Business Onboarding System

### How It Works

When a business registers through `/onboarding/onboarding.html`:

1. **Single Form Submission** creates:
   - ✅ Business record (car_hire_companies, garages, or car_dealers table)
   - ✅ User account (users table) for the business owner

2. **Both records start with pending status:**
   - Business: `status = 'pending_approval'`
   - User: `status = 'pending'`

3. **Bi-directional Linking:**
   - `users.business_id` → points to business record
   - `business.user_id` → points to user record

4. **Admin Review:**
   - Admin logs into `/admin/admin.html`
   - Reviews pending businesses
   - Approves or rejects registration
   - Upon approval: both user and business become 'active'

### Business Types Supported

- **Car Hire Companies**: Fleet management, rental rates, vehicle types
- **Garages**: Services offered, specializations, emergency services
- **Car Dealers**: Inventory management, brand specializations

---

## Project Structure

```
MotorLink/
├── config.js                      # Environment detection and configuration
├── proxy.php                      # CORS proxy for UAT mode
│
├── index.html                     # Main marketplace homepage
├── cars.html                      # Car listings page
├── dealers.html                   # Car dealers directory
├── garages.html                   # Garage directory
├── car-hire.html                  # Car hire companies directory
│
├── api.php                        # Main API endpoint
├── recommendation_engine.php      # AI recommendation engine
│
├── admin/
│   ├── admin.html                 # Admin dashboard
│   ├── admin.js                   # Admin frontend logic
│   └── admin-api.php              # Admin API (user/business CRUD)
│
├── onboarding/
│   ├── onboarding.html            # Business self-registration form
│   ├── onboarding.js              # Onboarding form logic
│   ├── onboarding.css             # Onboarding styles
│   └── api-onboarding.php         # Onboarding API (creates user + business)
│
├── css/
│   ├── styles.css                 # Global styles
│   ├── car-listing.css            # Car listing styles
│   └── admin.css                  # Admin dashboard styles
│
├── js/
│   ├── main.js                    # Main app logic
│   ├── cars.js                    # Car listing page logic
│   └── auth.js                    # Authentication logic
│
├── database/
│   └── p601229_motorlinkmalawi_db.sql  # Database schema
│
└── uploads/                       # User-uploaded files (car images, etc.)
```

---

## API Endpoints

### Main API (`api.php`)
```
GET  ?action=get_cars              # Get car listings with filters
GET  ?action=get_dealers           # Get car dealers
GET  ?action=get_garages           # Get garages
GET  ?action=get_car_hire          # Get car hire companies
GET  ?action=locations             # Get cities/towns
POST ?action=login                 # User login
POST ?action=register              # User registration
POST ?action=report_listing        # Report a listing (requires auth)
```

### Onboarding API (`onboarding/api-onboarding.php`)
```
POST ?action=add_car_hire          # Register car hire company + owner user
POST ?action=add_garage            # Register garage + owner user
POST ?action=add_dealer            # Register dealer + owner user
POST ?action=check_business        # Check for duplicate businesses
GET  ?action=locations             # Get locations
GET  ?action=get_makes             # Get car makes
```

### Admin API (`admin/admin-api.php`)
```
GET  ?action=get_users             # Get all users
GET  ?action=get_businesses        # Get businesses by type
POST ?action=create_user           # Create new user
POST ?action=approve_business      # Approve pending business
PUT  ?action=update_user           # Update user details
```

### Recommendation Engine (`recommendation_engine.php`)
```
GET  ?action=get_recommendations&type=personalized  # User-based recommendations
GET  ?action=get_recommendations&type=trending      # Trending/popular cars
POST ?action=track_view            # Track car view for recommendation engine
```

---

## Database Tables

### Core Tables

**`users`**
- User accounts (individual users and business owners)
- Fields: `id`, `username`, `email`, `password_hash`, `full_name`, `phone`, `user_type`, `status`, `business_id`
- Linked to businesses via `business_id`

**`car_listings`**
- Vehicle listings with seller information
- Fields: `id`, `make`, `model`, `year`, `price`, `seller_type`, `seller_id`, `status`
- `seller_type`: 'dealer', 'individual', 'garage', 'car_hire'

**`car_dealers`**
- Car dealership profiles
- Fields: `id`, `user_id`, `business_name`, `owner_name`, `email`, `phone`, `status`, `specialization`
- Linked to users via `user_id`

**`garages`**
- Garage/workshop profiles
- Fields: `id`, `user_id`, `business_name`, `owner_name`, `services`, `emergency_services`, `status`

**`car_hire_companies`**
- Car rental company profiles
- Fields: `id`, `user_id`, `business_name`, `vehicle_types`, `daily_rate_from`, `status`

**`locations`**
- Cities and towns in Malawi
- Fields: `id`, `name`, `region`, `district`

**`listing_reports`**
- User-submitted reports for suspicious listings
- Fields: `id`, `listing_id`, `user_id`, `reason`, `status`, `created_at`

**`viewing_history`**
- Tracks user views for recommendation engine
- Fields: `id`, `user_id`, `listing_id`, `viewed_at`

---

## Security Features

- **Authentication Required**: Reporting and business management require login
- **Input Validation**: All inputs validated and sanitized
- **SQL Injection Protection**: PDO prepared statements throughout
- **Password Hashing**: `PASSWORD_DEFAULT` algorithm
- **Session Security**: HTTP-only cookies, secure session management
- **CORS Protection**: Restricted to authorized domains
- **Rate Limiting**: 1 report per hour per listing per user
- **Admin Access Control**: Role-based permissions

---

## Business Registration Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Business visits /onboarding/onboarding.html             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Fills multi-step form:                                  │
│    • Business Type (Car Hire / Garage / Dealer)            │
│    • Business Info (name, registration, owner details)     │
│    • Contact Info (email, phone, whatsapp, address)        │
│    • Services/Features                                      │
│    • Login Credentials (username, password)                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Submit → api-onboarding.php creates:                    │
│    ✅ User record (status='pending')                        │
│    ✅ Business record (status='pending_approval')           │
│    ✅ Bi-directional link (user ↔ business)                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Business sees confirmation:                             │
│    "Registration submitted! Pending admin approval."       │
│    Reference Number: CH00001 (for car hire)                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Admin reviews in admin dashboard:                       │
│    • Views business details                                │
│    • Verifies information                                  │
│    • Clicks "Approve" or "Reject"                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Upon approval:                                           │
│    ✅ User status → 'active'                                │
│    ✅ Business status → 'active'                            │
│    ✅ Business can now login and manage their account      │
└─────────────────────────────────────────────────────────────┘
```

---

## Testing Checklist

Before deployment, verify:

**Frontend**
- [ ] Homepage loads correctly
- [ ] Car listings display with images
- [ ] Search and filters work
- [ ] Mobile menu functions on small screens
- [ ] Responsive design on mobile devices

**Authentication**
- [ ] User registration works
- [ ] Login works
- [ ] Session persists across pages
- [ ] Logout works

**Business Features**
- [ ] Business onboarding form loads
- [ ] All 3 business types can register (car hire, garage, dealer)
- [ ] Username and password fields are required
- [ ] Duplicate check works
- [ ] Submission creates both user and business records

**Admin**
- [ ] Admin can login
- [ ] Pending businesses display in admin dashboard
- [ ] Admin can approve/reject businesses
- [ ] User management works (create, edit, delete)

**Environment**
- [ ] UAT mode works on localhost
- [ ] Production mode works on promanaged-it.com
- [ ] MANUAL_MODE_OVERRIDE works correctly
- [ ] Console shows correct MODE and API_URL
- [ ] No CORS errors

---

## Deployment to Production

**1. Test locally in UAT mode:**
```bash
php -S localhost:8000
# Test all features thoroughly
```

**2. Set to production mode:**
```javascript
// config.js line 20
const MANUAL_MODE_OVERRIDE = null; // Auto-detect mode
```

**3. Commit and push:**
```bash
git add .
git commit -m "Production release"
git push origin main
```

**4. Deploy to server:**
```bash
# SSH to production server
ssh user@promanaged-it.com

# Navigate to project directory
cd /var/www/html/motorlink

# Pull latest changes
git pull origin main

# Set permissions
chmod 755 -R .
chmod 777 -R uploads/

# Restart services if needed
sudo systemctl restart apache2
```

**5. Verify production:**
- Visit: `https://promanaged-it.com/motorlink/`
- Check console: Should show `Mode: PRODUCTION`
- Test critical features
- Verify database connections

---

## Troubleshooting

### "No data loading" on VS Code Live Server
✅ **Already fixed!** The system auto-detects port and routes correctly.

Verify:
```javascript
// Press F12, check console:
console.log('Mode:', CONFIG.MODE);     // Should show: UAT
console.log('API:', CONFIG.API_URL);   // Should show proxy URL
```

### Mobile can't connect to local server
**Solution:** Use network binding
```bash
php -S 0.0.0.0:8000  # ✅ Correct - accessible on network
php -S localhost:8000  # ❌ Wrong - localhost only
```

**Also check:**
- Firewall allows incoming connections
- Mobile and laptop on same WiFi
- No VPN or corporate network blocking

### CORS errors
**UAT Mode:** Should use proxy.php automatically
**Production:** CORS configured for promanaged-it.com domain

### Business onboarding not creating user
**Check:**
1. Are you accessing via localhost? (required for UAT testing)
2. Is MANUAL_MODE_OVERRIDE set to 'UAT' in config.js?
3. Check browser console for API errors
4. Verify username and password fields are filled

**Enable debug mode:**
```javascript
// config.js line 16
const DEBUG = true;
```

---

## Debug Mode

Enable detailed logging:

```javascript
// config.js
const DEBUG = true;
```

**Console will show:**
- Environment detection details
- API URLs being used
- Request/response data
- Error details

**Press F12** in browser to view console logs.

---

## AI Recommendation Engine

The platform includes a sophisticated recommendation engine that provides personalized car suggestions.

**Features:**
- Tracks user viewing history
- Analyzes price preferences, make/model preferences
- Collaborative filtering (finds similar users)
- Content-based filtering (finds similar cars)
- Popularity and recency boosting
- Hybrid scoring algorithm

**How it works:**
1. User views car listings
2. System tracks views in `viewing_history` table
3. Analyzes patterns to determine preferences
4. Finds similar users with similar preferences
5. Recommends cars viewed by similar users
6. Boosts recent and popular listings

---

## Tips & Best Practices

**For Development:**
- Use VS Code Live Server for auto-refresh on file changes
- Enable DEBUG mode when troubleshooting
- Test on mobile devices early and often
- Always check browser console (F12) for errors

**For Testing:**
- Access via localhost for UAT testing
- Use MANUAL_MODE_OVERRIDE to force specific environment
- Test all three business types during onboarding
- Verify both user and business records are created

**For Production:**
- Disable DEBUG mode
- Use auto-detect for MODE (set MANUAL_MODE_OVERRIDE to null)
- Monitor error logs on server
- Regular database backups

---

## System Requirements

**Server Requirements:**
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache/Nginx web server
- mod_rewrite enabled (Apache)

**Development Requirements:**
- PHP CLI (for local server)
- Git
- Text editor (VS Code recommended)
- Modern web browser

**Browser Support:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Version Information

**Version:** 4.1.0
**Last Updated:** December 2025
**Status:** ✅ Production Ready
**Database Version:** 2.0

---

## Quick Reference Commands

**Start local server:**
```bash
php -S localhost:8000              # Local only
php -S 0.0.0.0:8000               # Network accessible
```

**Force environment mode:**
```javascript
// config.js line 20
const MANUAL_MODE_OVERRIDE = 'UAT';        // UAT mode
const MANUAL_MODE_OVERRIDE = 'PRODUCTION'; // Production mode
const MANUAL_MODE_OVERRIDE = null;         // Auto-detect
```

**Enable debug logging:**
```javascript
// config.js line 16
const DEBUG = true;
```

**Git deployment:**
```bash
git add .
git commit -m "Your message"
git push origin main
```

---

## Support & Contact

For issues, questions, or contributions, please contact the development team.

**Production URL:** https://promanaged-it.com/motorlink/
**Admin Dashboard:** https://promanaged-it.com/motorlink/admin/admin.html
**Business Registration:** https://promanaged-it.com/motorlink/onboarding/onboarding.html

---

## License

Proprietary - MotorLink Malawi © 2025

---

**Built with ❤️ for Malawi's automotive industry**

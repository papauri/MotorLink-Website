---
description: "Implement or fix any MotorLink Malawi feature. Enforces: security-first PHP (PDO), XSS-safe JS, toast notifications instead of alert(), mobile-first UI (44px targets), env auto-detection, and the HTML→JS→PHP API→CSS delivery order."
name: "MotorLink: Implement Feature or Fix"
argument-hint: "Describe the feature, fix, or endpoint needed"
agent: "agent"
---

## 1 · Read Context First

Before writing a single line, read the relevant existing files:

- **Core logic**: [api.php](../../api.php), [script.js](../../script.js), [proxy.php](../../proxy.php), [config.js](../../config.js)
- **Module-specific APIs** if the task touches admin: [admin/admin-api.php](../../admin/admin-api.php), [admin/admin-config.php](../../admin/admin-config.php)
- **Module-specific APIs** if the task touches onboarding: relevant files inside `onboarding/`
- **Styling reference**: the most relevant file in `css/` and `css/common.css`

Match the existing pattern exactly — naming conventions, error shapes, session handling — before adding anything new.

---

## 2 · Delivery Order (non-negotiable)

Complete changes in this sequence. Do not skip or reorder:

1. **HTML structure** — semantic elements, ARIA labels, no inline styles, min 44px touch targets, no hover-only logic for critical actions
2. **JS logic** — event delegation, `escHtml()` on all user-data output, toasts instead of every `alert()`/`confirm()`, `credentials:'include'` on every `fetch()`
3. **PHP API** — new action inside the correct existing API file (not a new file unless module demands it); always PDO prepared statements
4. **Localized CSS** — add to the relevant `css/*.css` file; mobile-first, desktop via `@media (min-width: 768px)`

---

## 3 · Security Rules (hard stops — never bypass)

- **Zero hardcoding**: never write DB credentials, SMTP passwords, API keys, or tokens into any file
- **Prepared statements**: every DB read/write uses PDO with bound parameters — no string concatenation in SQL
- **XSS**: sanitize all user-controlled output with `escHtml()` in JS; use `htmlspecialchars($val, ENT_QUOTES, 'UTF-8')` in PHP for any HTML output
- **Admin UI passwords**: always display as `********`; never reflect the raw value back to the frontend
- **Config privacy**: reference `config.example.js` for structure; `config.js` must never contain real secrets
- **Session safety**: `session_set_cookie_params()` must be called BEFORE `session_start()` — never after
- **PHP response purity**: set `header('Content-Type: application/json')` as the first statement in every API action handler; never mix HTML or debug output into a JSON response
- **Input boundary**: validate and sanitize all input in PHP, regardless of client-side validation

---

## 4 · JS Patterns

```js
// ✅ XSS-safe output helper (add once per module JS file if not present)
function escHtml(str) {
  const d = document.createElement('div');
  d.textContent = str ?? '';
  return d.innerHTML;
}

// ✅ Toast notification (replaces ALL alert() / confirm())
// type: 'success' | 'error' | 'warning' | 'info'
// Auto-hides after 4 s; position: fixed top-right; min 44px height
function showNotification(message, type = 'info') { /* match module pattern */ }

// ✅ API base URL — auto-detect UAT vs Production
function getApiUrl(action) {
  const isProd = !window.location.hostname.includes('localhost');
  const base = isProd ? '../api.php' : '../proxy.php';
  return `${base}?action=${action}`;
}

// ✅ Authenticated fetch template
const res = await fetch(getApiUrl('action_name'), {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
const data = await res.json();
if (!data.success) { showNotification(data.message || 'Error', 'error'); return; }
```

---

## 5 · PHP API Patterns

```php
// ✅ Action handler skeleton
case 'action_name':
    header('Content-Type: application/json');
    requireAuth(); // requireAdminAuth() for admin-only actions
    $input = json_decode(file_get_contents('php://input'), true);

    // Validate input at boundary
    $value = trim($input['field'] ?? '');
    if (empty($value)) {
        echo json_encode(['success' => false, 'message' => 'Field required']);
        exit;
    }

    // PDO prepared statement — always
    $stmt = $pdo->prepare('SELECT id FROM table WHERE email = LOWER(?) AND status = ?');
    $stmt->execute([strtolower($value), 'active']);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'data' => $row]);
    exit;
```

---

## 6 · Mobile-First CSS Rules

- **Grid**: start `1fr` (single column), expand at `@media (min-width: 768px)` to 2–3 cols
- **Tables**: convert to card-stack on mobile (reference `css/car-database-mobile.css`)
- **Touch targets**: all interactive elements minimum `44px` height/width
- **Payloads**: return only fields the UI renders — never `SELECT *` on list endpoints
- **Images**: always `loading="lazy"` on `<img>` tags outside the initial viewport
- **Fixed elements**: nothing `position:fixed` that obscures scrollable content on small screens

---

## 7 · After Every PHP Edit

```
php -l <edited-file.php>
```

No syntax errors = minimum bar. Also verify the response shape in a browser Network tab before marking done.

---

## 8 · DB Schema Changes

If a new column, table, or setting row is needed, provide the idempotent SQL:

```sql
-- Column
ALTER TABLE `table` ADD COLUMN IF NOT EXISTS `col` VARCHAR(255) NULL;

-- Setting row
INSERT IGNORE INTO `site_settings` (`key`, `value`) VALUES ('setting_key', 'default_value');
```

Do not provide raw `CREATE TABLE` without `IF NOT EXISTS`.

---

## 9 · Definition of Done

- [ ] Existing files read and pattern matched before writing
- [ ] Delivery order followed (HTML → JS → PHP → CSS)
- [ ] No hardcoded credentials anywhere
- [ ] All DB queries use prepared statements
- [ ] All user-data output runs through `escHtml()` / `htmlspecialchars()`
- [ ] `alert()` and `confirm()` replaced with toast notifications
- [ ] Mobile: touch targets ≥ 44px, no hover-only critical logic
- [ ] `php -l` passes for every modified PHP file
- [ ] JSON response shape consistent with existing API responses in the same file

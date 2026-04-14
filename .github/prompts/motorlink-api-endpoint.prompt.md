---
description: "Scaffold a new PHP API action in the correct MotorLink API file. Produces: action case block, PDO prepared statement, auth guard, JSON response, and the matching JS fetch call — all following project conventions."
name: "MotorLink: New API Endpoint"
argument-hint: "Action name, which API file (api.php / admin-api.php / onboarding), and what it does"
agent: "agent"
---

## Task

Add a new API action to the correct MotorLink PHP file. Read the target file before writing — match the existing case/switch structure, auth pattern, and JSON response shape exactly.

**Action requested**: $args

---

## Step 1 · Identify the Target File

| Request type | File |
|---|---|
| Frontend user action (listings, profile, auth) | `api.php` |
| Admin panel action | `admin/admin-api.php` |
| Onboarding flow | `onboarding/<relevant-api>.php` |
| Car hire | `car-hire-company.js` → backend in `api.php` |

Read the target file to find:
- The main `switch ($action)` block
- The auth guard function used (`requireAuth()`, `requireAdminAuth()`, etc.)
- The existing JSON response shape (`success`, `message`, `data` fields)
- Any existing similar action to use as the pattern reference

---

## Step 2 · PHP Action Block (inside existing switch)

```php
case 'action_name':
    header('Content-Type: application/json');

    // Auth guard — match what the surrounding actions use
    requireAuth();           // regular user
    // requireAdminAuth();   // admin-only

    // Parse + validate input
    $input   = json_decode(file_get_contents('php://input'), true) ?? [];
    $field   = trim($input['field'] ?? '');

    if (empty($field)) {
        echo json_encode(['success' => false, 'message' => 'Field is required.']);
        exit;
    }

    // Sanitize integer IDs
    $userId = (int)($_SESSION['user_id'] ?? 0);
    if ($userId <= 0) {
        echo json_encode(['success' => false, 'message' => 'Unauthorised.']);
        exit;
    }

    try {
        // READ example
        $stmt = $pdo->prepare(
            'SELECT id, title, status
             FROM listings
             WHERE user_id = ? AND status != ?
             ORDER BY created_at DESC
             LIMIT 50'
        );
        $stmt->execute([$userId, 'deleted']);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // WRITE example
        $stmt = $pdo->prepare(
            'UPDATE listings
             SET status = ?, updated_at = NOW()
             WHERE id = ? AND user_id = ?'
        );
        $stmt->execute([$field, $listingId, $userId]);
        $affected = $stmt->rowCount();

        if ($affected === 0) {
            echo json_encode(['success' => false, 'message' => 'Record not found or no change.']);
            exit;
        }

        echo json_encode(['success' => true, 'message' => 'Done.', 'data' => $rows]);
    } catch (PDOException $e) {
        error_log('action_name error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Database error.']);
    }
    exit;
```

### Rules — never break these:
- `header('Content-Type: application/json')` is the **first line** of every case block
- Auth guard called **before** any DB access
- All bound parameters — never concatenate user input into SQL
- Integer IDs cast with `(int)` before use
- `PDOException` caught; full message goes to `error_log()`, generic text to client
- `exit` at the end of every branch — never fall through
- Passwords **never** returned in response — strip before `json_encode`

---

## Step 3 · Matching JS Fetch Call

Place in the relevant module JS file (e.g., `js/my-listings.js`, `admin/admin-script.js`):

```js
/**
 * Calls action_name endpoint.
 * @param {Object} payload - fields to send
 */
async function callActionName(payload) {
  const isProd = !window.location.hostname.includes('localhost');
  const apiBase = isProd ? '../api.php' : '../proxy.php';

  try {
    const res = await fetch(`${apiBase}?action=action_name`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!data.success) {
      showNotification(data.message || 'Something went wrong.', 'error');
      return null;
    }

    return data.data ?? data;
  } catch (err) {
    console.error('callActionName:', err);
    showNotification('Network error. Please try again.', 'error');
    return null;
  }
}
```

### JS rules:
- `credentials: 'include'` — always
- `!res.ok` check before `.json()` to catch PHP 500s that return HTML
- `showNotification()` for errors — no `alert()`
- All data rendered to DOM passes through `escHtml()`

---

## Step 4 · DB Schema (if new table/column needed)

Provide idempotent SQL only:

```sql
-- New column
ALTER TABLE `table_name`
  ADD COLUMN IF NOT EXISTS `column_name` VARCHAR(255) NULL AFTER `existing_col`;

-- New setting
INSERT IGNORE INTO `site_settings` (`key`, `value`, `description`)
VALUES ('setting_key', 'default_value', 'Human-readable description');

-- New table
CREATE TABLE IF NOT EXISTS `table_name` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Step 5 · Validate

```powershell
php -l api.php          # or the file you edited
```

Expected: `No syntax errors detected`

Then confirm in browser DevTools Network tab:
- Response `Content-Type: application/json`
- HTTP 200 (not 500)
- `{"success": true, ...}` shape matches what the JS caller expects

---

## Definition of Done

- [ ] Action added inside existing `switch` — not a new file
- [ ] `header('Content-Type: application/json')` first line of case
- [ ] Auth guard called before DB
- [ ] All SQL uses bound parameters
- [ ] Integers cast with `(int)` before SQL
- [ ] Passwords stripped from response
- [ ] `PDOException` caught, logged server-side
- [ ] JS caller uses `credentials:'include'`, checks `!res.ok`, uses `showNotification()` for errors
- [ ] `php -l` passes

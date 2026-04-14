---
description: "Audit any MotorLink PHP or JS file for security flaws. Checks OWASP Top 10 against project rules: hardcoded secrets, SQL injection, XSS, broken auth, session misuse, insecure JSON leakage, and missing input validation."
name: "MotorLink: Security Review"
argument-hint: "File path(s) to audit, or 'all' for core files"
agent: "agent"
---

## Task

Perform a targeted security audit on the specified file(s) against the MotorLink Malawi security rules and OWASP Top 10. Read each file fully before reporting.

**Files to audit**: $args (if not provided, default to `api.php`, `script.js`, `admin/admin-api.php`, `admin/admin-config.php`)

---

## Checklist — work through every item for every file

### A · Secrets & Credentials (OWASP A02)
- [ ] No hardcoded DB host, username, password, or database name
- [ ] No hardcoded SMTP credentials or API keys
- [ ] No secrets in `config.js` (must be in server-side env or DB; `config.js` must reference `config.example.js` structure only)
- [ ] No tokens or passwords echoed back in API JSON responses

### B · SQL Injection (OWASP A03)
- [ ] Every DB query uses PDO prepared statements with bound parameters
- [ ] No string concatenation inside SQL queries — not even for table/column names
- [ ] `LOWER()` / `strtolower()` used consistently for case-insensitive email comparisons (never raw input)
- [ ] `LIMIT` clause present on all list queries to prevent unbounded result sets

### C · Cross-Site Scripting (OWASP A03)
- [ ] All user-controlled data rendered in HTML passes through `escHtml()` in JS
- [ ] PHP: all output to HTML uses `htmlspecialchars($val, ENT_QUOTES, 'UTF-8')`
- [ ] No `innerHTML = userInput` without first calling `escHtml()`
- [ ] No `eval()`, `new Function()`, or `document.write()` calls

### D · Broken Authentication & Session (OWASP A07)
- [ ] `session_set_cookie_params()` is called BEFORE `session_start()` — never after
- [ ] Session cookie flags: `secure=true` on production, `httponly=true`, `samesite=Lax`
- [ ] Admin endpoints call `requireAdminAuth()` (or equivalent) before any data access
- [ ] Frontend admin login sets both main-site AND admin-panel session keys so `syncAdminSession()` can pick them up
- [ ] No session fixation: `session_regenerate_id(true)` called after successful login
- [ ] Password hashes use `password_hash(..., PASSWORD_BCRYPT)` / verified with `password_verify()`

### E · Broken Access Control (OWASP A01)
- [ ] Every API action checks auth before DB access — no action leaks data to unauthenticated callers
- [ ] User-owned resources (listings, profile) validate that `$_SESSION['user_id']` matches the record owner before update/delete
- [ ] Admin-only actions are unreachable by a normal `user_type` session

### F · Security Misconfiguration (OWASP A05)
- [ ] `header('Content-Type: application/json')` set before any output in every API action — no stray HTML or `echo` before it
- [ ] Error details (stack traces, SQL text) never sent to the client — log server-side only
- [ ] `DEBUG` flag gates verbose error output; production must not expose internals
- [ ] CORS `Access-Control-Allow-Origin` is not `*` on credentialed endpoints — must mirror specific origin

### G · Sensitive Data Exposure (OWASP A02)
- [ ] Password fields never returned in list/detail responses
- [ ] Admin UI password/key fields masked as `********` in any HTML output
- [ ] Uploads directory `777` permissions — verify no PHP execution is possible there (no `.php` uploads accepted)

### H · Insecure Deserialization / Input Handling (OWASP A08)
- [ ] `json_decode(file_get_contents('php://input'), true)` used — result is always validated before use
- [ ] File upload handlers validate MIME type server-side (not trust `$_FILES['type']`); check file extension whitelist
- [ ] Integer IDs cast with `(int)` or `intval()` before SQL use — never raw string

### I · JS-Specific
- [ ] No `alert()` or `confirm()` in production paths — replaced with toast notifications
- [ ] `credentials: 'include'` on every `fetch()` to the API
- [ ] No sensitive data stored in `localStorage` or `sessionStorage` (tokens, passwords)
- [ ] Env auto-detection: UAT uses `proxy.php`, Production uses `api.php` — no hardcoded URLs

---

## Output Format

For each finding, output:

```
[SEVERITY] File: path/to/file.php — Line ~N
Rule violated: <rule letter + name>
Issue: <one sentence describing the exact problem>
Fix: <one sentence or minimal code snippet to resolve>
```

Severity levels: **CRITICAL** | **HIGH** | **MEDIUM** | **LOW** | **INFO**

Group findings by file, sorted CRITICAL → LOW.

If a file is clean on all items, state: `✅ path/to/file.php — No security issues found.`

---

## After Reporting

1. Ask the user which findings to fix
2. Apply fixes following the delivery order: HTML → JS → PHP → CSS
3. Run `php -l` on every modified PHP file
4. Confirm the fix resolves the specific finding without introducing new issues

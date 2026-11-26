# Security Architecture & Compliance — AeroSphere AI

## Security Mission
AeroSphere AI protects urban communities and family health records by enforcing defense-in-depth principles across all API layers and GenAI interactions.

---

## 1. GenAI Security & Prompt Injection Defense (OWASP LLM01)
*   **Prompt Sanitization:** All user text routed to Google Gemini (`gemini-3.5-flash`) is pre-processed by `sanitizePrompt()`, which strips ASCII control characters (`\x00-\x1f\x7f`), enforces character limits (500 to 2,000 chars), and neutralizes prompt injection jailbreak strings (e.g., `"ignore previous instructions"`, `"system prompt"`).
*   **Server-Side Execution Custody:** All interactions with Google Generative AI are executed strictly on the Node.js backend (`src/lib/services/gemini.service.ts`). API keys are never bundled into client-facing JavaScript.
*   **Fenced Output Validation:** Model responses are required to conform to strict JSON schemas. Any malformed output triggers the local domain-grounded deterministic fallback engine, preventing arbitrary code injection or crashing.

---

## 2. API Input Validation & Defense
*   **100% Zod Schema Coverage:** Every single API endpoint (`/api/routine`, `/api/iaq`, `/api/impact`, `/api/community`, `/api/family`, `/api/voice`) validates payloads with strict Zod schemas (`src/lib/validations/schemas.ts`). Malformed payloads, extra attributes, and unexpected data types are rejected with HTTP 400 before reaching business logic.
*   **XSS Protection:** User-submitted community alerts and family names are sanitized with `sanitizeInput()`, stripping `<script>` tags, HTML attributes, and escape characters.

---

## 3. Sliding-Window Rate Limiting & DoS Defense
*   Implemented via `RateLimitService` (`src/lib/services/rate-limit.service.ts`).
*   Enforces per-IP sliding-window limits (e.g., 30 routine requests/min, 20 voice requests/min, 15 community posts/min).
*   Excessive bursts return HTTP 429 Too Many Requests with reset time headers, protecting backend compute and preventing API quota exhaustion.
*   Stale memory records are automatically pruned to prevent memory leaks.

---

## 4. HTTP Security Headers (All 9 OWASP Enterprise Standards)
Configured in `next.config.js`:
*   `Content-Security-Policy`: `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://generativelanguage.googleapis.com; frame-ancestors 'none';`
*   `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload`
*   `X-Frame-Options: DENY` (prevents clickjacking attacks)
*   `X-Content-Type-Options: nosniff` (prevents MIME-type sniffing)
*   `Referrer-Policy: strict-origin-when-cross-origin`
*   `Cross-Origin-Opener-Policy: same-origin`
*   `Cross-Origin-Resource-Policy: same-origin`
*   `Permissions-Policy: camera=(), microphone=(self), geolocation=()` (restricts device sensors to user-initiated voice recognition only)
*   `X-XSS-Protection: 1; mode=block`
*   `poweredByHeader: false` (removes identifying server headers)

---

## 5. Immutable Security Audit Trail
Every state change (routine generation, community alert publication, sensitive family member addition) is recorded in `db.auditLogs`:
*   Unique event UUID
*   ISO 8601 UTC timestamp
*   Actor identifier
*   Action category (`ROUTINE_PLAN_GENERATED`, `COMMUNITY_ALERT_CREATED`, `FAMILY_MEMBER_ADDED`)
*   Human-readable details
*   Client IP address
Audit logs cannot be modified through user-facing APIs and can be inspected via the in-app Security Audit modal.

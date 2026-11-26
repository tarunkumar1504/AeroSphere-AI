# Testing Architecture & Verification — AeroSphere AI

## Test Suite Overview
AeroSphere AI is validated by a rigorous Vitest test suite (`npm test`) enforcing 100% test pass rates across all business logic, environmental physics calculations, cryptographic rate limiting, prompt injection sanitization, RESTful API endpoints, and WCAG accessibility standards.

```sh
npm test
```

### Test Results
```
 ✓ src/lib/__tests__/api-routes.test.ts (8 tests)
 ✓ src/lib/__tests__/security.test.ts (5 tests)
 ✓ src/lib/__tests__/iaq.test.ts (4 tests)
 ✓ src/lib/__tests__/air-quality.test.ts (3 tests)
 ✓ src/lib/__tests__/impact.test.ts (4 tests)
 ✓ src/lib/__tests__/gemini.test.ts (2 tests)
 ✓ src/lib/__tests__/a11y.test.ts (4 tests)
 ✓ src/lib/__tests__/routine.test.ts (2 tests)

Test Files  8 passed (8)
     Tests  32 passed (32)
```

---

## 1. Domain Coverage Breakdown

| Test Suite | File | Focus Areas Verified |
| :--- | :--- | :--- |
| **RESTful API Routes** | `api-routes.test.ts` | 100% route handler verification (`GET /api/air-quality`, `POST /api/routine`, `POST /api/iaq`, `POST /api/impact`, `GET & POST /api/community`, `POST /api/voice`, `GET /api/audit`, `GET & POST /api/family`), status codes (200, 201, 400), payload validation errors. |
| **Environmental Physics & Inversion** | `air-quality.test.ts` | EPA AQI breakpoint tables (0-500 scale), Winter radiation inversion risk modeling (temperature, humidity, atmospheric stagnation), hotspot city diagnostics. |
| **Direct Impact Quantification** | `impact.test.ts` | Inhaled PM2.5 avoidance ($0.45 m^3/hr$ respiration rate), Berkeley Earth cigarette equivalence ($22 \mu g/m^3 \times 24h$), CO2 and NOx commute emissions reduction, acute asthma risk drop. |
| **Indoor Air Quality (IAQ)** | `iaq.test.ts` | AHAM 2/3 Clean Air Delivery Rate (CADR) sizing rule ($CADR = Area \times 2/3$), room infiltration across single-pane vs weatherstripped envelopes, DIY Corsi-Rosenthal Box specifications ($65 cost, 580 m³/h CADR). |
| **Inversion-Proof Daily Routines** | `routine.test.ts` | 4-slot daily routine generation across 5 lifestyle profiles, morning inversion peak avoidance, midday solar ventilation window scheduling, asthmatic child protection. |
| **Security & OWASP Defense** | `security.test.ts` | XSS script tag stripping, prompt injection delimiter neutralization, sliding-window rate limiting (burst protection), Zod payload boundaries, immutable audit log persistence. |
| **WCAG 2.1 AAA Accessibility** | `a11y.test.ts` | Dual-encoding assertions (color + icon + text), touch target sizing (>= 48px), high-contrast ratios (OLED Dark 15.2:1, Solar Gold 14.6:1), static AST assertions for skip links, aria-live, dialog roles, and slider value states. |
| **GenAI Efficiency & Resilience** | `gemini.test.ts` | In-memory SHA-256 LRU cache hits (< 5ms response), zero-crash deterministic fallback engine for offline or unconfigured environments. |

---

## 2. HTTP Smoke & Header Verification
Run the enterprise HTTP verification script:
```sh
npm run verify
```
Asserts that all 9 enterprise security headers (`Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, `Permissions-Policy`, `X-XSS-Protection`) are properly configured in `next.config.js`.

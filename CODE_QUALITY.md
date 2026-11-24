# Code Quality Architecture — AeroSphere AI

## 1. Directory Structure & Modular Segregation
AeroSphere AI adheres to Clean Architecture and SOLID design principles, maintaining strict separation between presentation controllers, business domain services, persistence layers, input validations, and test suites:

*   `src/app/` — Next.js 16 App Router pages, layouts, and RESTful API route handlers (`/api/air-quality`, `/api/routine`, `/api/iaq`, `/api/impact`, `/api/community`, `/api/family`, `/api/voice`, `/api/audit`).
*   `src/components/` — Modular, atomic React components (Navbar, SmogForecastBanner, RoutinePlannerView, IaqOptimizerView, ImpactVisualizerView, CommunityWatchView, VoiceCompanionModal, SecurityAuditModal).
*   `src/lib/types/` — Comprehensive domain models, strict TypeScript interfaces, and enums.
*   `src/lib/services/` — Pure business logic services (`AirQualityService`, `RoutineService`, `IaqService`, `ImpactService`, `CommunityService`, `GeminiService`, `RateLimitService`).
*   `src/lib/validations/` — Strict Zod runtime validation schemas for all inbound client requests.
*   `src/lib/db/` — ACID-compliant persistent JSON engine with atomic writes, temporary-file renaming, and in-memory caching.
*   `src/lib/utils/` — Input sanitization and prompt injection defense utilities.
*   `src/lib/__tests__/` — Comprehensive Vitest automated test suites ensuring zero regression.

---

## 2. Strict Compiler Configuration
We enforce rigorous compiler safety thresholds in `tsconfig.json`:
*   `strict: true` — Maximum type safety across all files.
*   `noImplicitAny: true` — Eliminates untyped variables.
*   `strictNullChecks: true` — Guarantees non-nullable safety without unchecked dereferencing.
*   `noUnusedLocals: true` — Zero dead code or unreferenced imports in production.
*   `noUnusedParameters: true` — Disallows unused function arguments.
*   `forceConsistentCasingInFileNames: true` — Prevents cross-platform file system bugs.
*   `noEmit: true` — Next.js build pipeline manages compilation artifacts.

`npx tsc --noEmit` validates with **0 errors**.

---

## 3. Linter & Static Analysis Standards
*   Integrated `.oxlintrc.json` enforcing strict rules for no-undef, no-unused-vars, eqeqeq, and controlled console logging.
*   No console leakage in production routes; diagnostic output is gated through debug levels.
*   Pure functions utilized wherever possible for deterministic calculations (EPA AQI breakpoints, AHAM CADR sizing, Berkeley Earth cigarette conversions).

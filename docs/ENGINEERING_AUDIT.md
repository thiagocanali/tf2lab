# TF2Lab — Engineering Audit (Lote 1)

Date: 2026-11-26  
Reviewed baseline: `247767948cdbf1cb6e898970d2a630e70f74a4a7`

## Scope and verified status

- **Implemented:** Nuxt 4/Nitro player API, logs.tf and trends.tf aggregation, Steam avatar and playtime, player profiles, class summary, recent logs, comparison view, map breakdown, bilingual UI.
- **Partially implemented:** search by nickname, analytics time windows, time-based metrics, observed match outcomes, runtime failure handling, caching.
- **Placeholder/skeleton:** shared UI components and many feature-first directories.
- **Not verified by test suite:** calculations, class switches, uptime of remote sources; there was no automated test script in `package.json`.
- **Production baseline:** Vercel project `tf2lab` had a READY production deployment on the same main commit, no recent runtime error clusters in the checked window.

## Critical issues found

1. **Fabricated data:** `buildPerformanceTrend()` fabricated five points derived from arbitrary multipliers. Medic `mostHealedClasses` and `deathsByClass` were synthetic fractions and hard-coded floors.
2. **Misleading failures:** simultaneous upstream failures were caught and converted into `emptyProfile()` with zero values, making source outages indistinguishable from an empty history.
3. **Inflated sample:** `Math.max(1, ...)` forced a minimum of one match even when no player was found in any parsed log.
4. **Unknown outcomes:** missing opponent scores were handled as zero, permitting unsupported victory/defeat results.
5. **Misleading filters:** UI computed totals from the API response even when a smaller number of logs was displayed; it also attempted fallback calculations without respecting missing data.
6. **K/D definition:** deaths = zero and kills > zero cannot be represented as a finite K/D ratio, but the existing API returned kills as K/D.
7. **Incomplete provenance:** count of match details downloaded and player records successfully analyzed were not separate.

## Changes in this branch

- Removed fabricated historical trends and Medic distributions (omit unavailable series).
- Return HTTP 502 with stable error category for both sources failing and for an all-details-failed sample; preserve 400 for invalid SteamID.
- Report zero analyzed matches for zero valid player logs, and distinguish detail coverage via `logsDetailsReturned`.
- Return `undefined` for non-finite K/D instead of asserting a number.
- Require both teams' observed scores; explicitly identify draws and unknown outcomes.
- Simplified UI data selection to use server-calculated window values, not local fake rescaling.

## Remaining gaps and risk (must resolve before merge)

- **Tests not executed in GitHub connector context.** Run `npm ci`, `npx nuxt typecheck` or equivalent, and `npm run build` in CI or sandbox before integration.
- Frontend analysis still has heuristic labels and synthetic rankings/scores; audit every recommendation and normalize score definitions.
- `class_stats` may contain repeated entries per class in a single log; class match counting must deduplicate by log/class pair.
- Requested window sizes (including `all`=10000) can exceed budgets; implement bounded batch handling and sample coverage.
- `logDetailCache` holds successful promises indefinitely; add TTL and bounded size.
- Partial upstream failures should expose provenance and availability, not silently claim complete history.
- Some server response fields and UI fallbacks still use generic `any`; add validated types.
- Verify actual production UX with authenticated view or E2E tests.
- Validate all class totals against published logs.tf fixtures and especially class switching.
- Inspect percentage and count semantics across `MainClassPanel`, `TrendAnalysisPanel`, `PlayerLogsList` and comparison cards.

## Recommended next batches

1. **Lote 1b:** deterministic fixtures and tests for aggregation, no data, upstream failure, result correctness, missing ratios, multi-class logs.
2. **Lote 2:** extraction to pure typed aggregation services, source adapters, retry/caching/coverage limits, metadata with `sourceStatus`.
3. **Lote 3:** observed per-class per-match series and comparison windows, proper map-class metrics.
4. **Lote 4:** design polish, translations, accessibility, UX states.
5. **Lote 5:** security and performance release checks, Playwright smoke tests, documentation.

## Release safety

No direct production change is authorized. Preserve `main`; require checks and review before merging. A PR may generate a Vercel preview automatically through Git integration and consume Hobby usage; avoid manual redeploys.

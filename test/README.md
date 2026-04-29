# Testing

This project uses a four-layer test suite:

| Layer | Tool | Location |
|---|---|---|
| Unit | Vitest | co-located `*.test.ts` |
| Component | Vitest + React Testing Library (jsdom) | co-located `*.test.tsx` |
| Route handlers | Vitest + mocked Supabase admin | co-located `*.test.ts` next to `route.ts` |
| E2E | Playwright | `e2e/*.spec.ts` |

## Scripts

```bash
npm run test            # run unit + component + route-handler tests once
npm run test:watch      # watch mode
npm run test:coverage   # run with v8 coverage (enforces thresholds)
npm run test:e2e        # Playwright (spins up `next start`)
npm run test:ci         # typecheck + test (runs on every PR)
npm run typecheck       # tsc --noEmit
```

During incremental rollout we intentionally split the CI gate from the
coverage gate so feature phases can land with their own tests without being
blocked by uncovered legacy code. The `coverage-gate` milestone at the end of
the Joy-style invite flow migration flips `test:ci` to include
`--coverage`. Until then, `test:coverage` runs as a separate CI job.

## Coverage thresholds

Enforced by `vitest.config.ts`:

- Global: 90% lines, branches, functions, statements.
- Critical files: 95% — `lib/session.ts`, `lib/validators.ts`, `lib/ics.ts`, `lib/rate-limit.ts`, `lib/timezone.ts`.

Dashboard, setup, marketing, and infra (`lib/supabase/*`, `lib/stripe.ts`, `lib/resend.ts`) are currently excluded from coverage; add them to `vitest.config.ts` `coverage.include` when they get tests.

## Writing route-handler tests

Mock `@/lib/supabase/admin` with `vi.mock()` and return fixtures that match the shape you select. Use `test/helpers/supabase-mock.ts` for the common "chainable query builder" stub.

## E2E

Playwright spins up `next start` on port `3100`. Use `E2E_SKIP_SERVER=1` when running against an already-running dev server. For DB state, `test/helpers/supabase-admin.ts` wraps the local Supabase admin client to seed/reset data between tests (add when implementing the slug flow).

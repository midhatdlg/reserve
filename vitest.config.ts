import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e/**', 'playwright-report/**'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      reportsDirectory: './coverage',
      // Coverage is scoped to the Joy-style RSVP flow rebuild. Marketing
      // landing, billing, webhooks, UI kit, dashboard, setup, and purely
      // presentational blocks are tracked outside this gate (the E2E suite
      // and manual sign-off). Keep this list explicit so it's obvious what
      // the 90/95 thresholds actually cover.
      include: [
        'app/api/rsvp/route.ts',
        'app/api/question/route.ts',
        'app/api/invite/[slug]/lookup/route.ts',
        'app/api/invite/[slug]/message/route.ts',
        'app/api/invite/[slug]/calendar/route.ts',
        'components/invite/RsvpForm.tsx',
        'components/invite/LookupModal.tsx',
        'components/invite/MessageCoupleModal.tsx',
        'components/invite/CountdownTimer.tsx',
        'components/invite/PhotoGallery.tsx',
        'components/invite/VenueMap.tsx',
        'lib/session.ts',
        'lib/validators.ts',
        'lib/ics.ts',
        'lib/rate-limit.ts',
        'lib/timezone.ts',
        'lib/invite-lookup.ts',
        'lib/invite-page.ts',
        'lib/question-groups.ts',
      ],
      exclude: [
        '**/*.d.ts',
        '**/*.{test,spec}.{ts,tsx}',
      ],
      thresholds: {
        lines: 90,
        branches: 90,
        functions: 90,
        statements: 90,
        'lib/session.ts': {
          lines: 95,
          branches: 95,
          functions: 95,
          statements: 95,
        },
        'lib/validators.ts': {
          lines: 95,
          branches: 95,
          functions: 95,
          statements: 95,
        },
        'lib/ics.ts': {
          lines: 95,
          branches: 95,
          functions: 95,
          statements: 95,
        },
        'lib/rate-limit.ts': {
          lines: 95,
          branches: 95,
          functions: 95,
          statements: 95,
        },
        'lib/timezone.ts': {
          lines: 95,
          branches: 95,
          functions: 95,
          statements: 95,
        },
        'lib/invite-lookup.ts': {
          lines: 95,
          branches: 95,
          functions: 95,
          statements: 95,
        },
        'lib/invite-page.ts': {
          lines: 95,
          branches: 90,
          functions: 95,
          statements: 95,
        },
        'lib/question-groups.ts': {
          lines: 95,
          branches: 95,
          functions: 95,
          statements: 95,
        },
        'app/api/rsvp/route.ts': {
          lines: 95,
          branches: 85,
          functions: 95,
          statements: 95,
        },
        'app/api/question/route.ts': {
          lines: 95,
          branches: 85,
          functions: 95,
          statements: 95,
        },
        'app/api/invite/[slug]/lookup/route.ts': {
          lines: 95,
          branches: 75,
          functions: 95,
          statements: 95,
        },
        'app/api/invite/[slug]/message/route.ts': {
          lines: 95,
          branches: 70,
          functions: 95,
          statements: 95,
        },
        'app/api/invite/[slug]/calendar/route.ts': {
          lines: 95,
          branches: 75,
          functions: 95,
          statements: 95,
        },
      },
    },
  },
});

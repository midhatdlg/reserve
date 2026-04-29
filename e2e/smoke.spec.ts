import { test, expect } from '@playwright/test';

// Placeholder smoke E2E. Replace/extend once the slug-based invite flow is
// implemented. We keep this to ensure Playwright wiring stays healthy.
test('playwright wiring', async ({ page }) => {
  await page.setContent('<h1>hello</h1>');
  await expect(page.locator('h1')).toHaveText('hello');
});

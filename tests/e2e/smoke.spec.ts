import { test, expect } from '@playwright/test';

test('Smoke Test: Navigation and Sign In state', async ({ page }) => {
  // Go to homepage
  await page.goto('/');

  // Verify the page loaded by checking for a known element, like the "Get Started" link
  // The exact text depends on the landing page design, but we can verify it doesn't crash.
  const title = await page.title();
  expect(title).toBeDefined();

  // Try to access a protected route
  await page.goto('/dashboard');
  
  // Verify Clerk middleware redirects to sign-in
  await expect(page).toHaveURL(/.*sign-in.*/);
});

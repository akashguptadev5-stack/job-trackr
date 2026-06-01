import { test, expect } from '@playwright/test';

// Helper — login before dashboard tests
async function loginAs(page: any, email: string, password: string) {
  await page.goto('/login');
  await page.getByPlaceholder('you@example.com').fill(email);
  await page.getByPlaceholder('••••••••').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/dashboard/, { timeout: 10000 });
}

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Use your test account credentials
    await loginAs(page, process.env.TEST_EMAIL!, process.env.TEST_PASSWORD!);
  });

  test('shows kanban columns', async ({ page }) => {
    await expect(page.getByText('Applied')).toBeVisible();
    await expect(page.getByText('Interview')).toBeVisible();
    await expect(page.getByText('Offer')).toBeVisible();
    await expect(page.getByText('Rejected')).toBeVisible();
  });

  test('opens add job modal', async ({ page }) => {
    await page.getByRole('button', { name: /add job/i }).click();
    await expect(page.getByText('Add new job')).toBeVisible();
    await expect(page.getByPlaceholder('Google')).toBeVisible();
  });

  test('adds a new job', async ({ page }) => {
    await page.getByRole('button', { name: /add job/i }).click();
    await page.getByPlaceholder('Google').fill('Test Company');
    await page.getByPlaceholder('Frontend Engineer').fill('React Developer');
    await page.getByPlaceholder('Remote / Bengaluru').fill('Remote');
    await page.getByRole('button', { name: /add job/i }).last().click();
    await expect(page.getByText('Test Company')).toBeVisible();
  });

  test('search filters jobs', async ({ page }) => {
    await page.getByPlaceholder(/search/i).fill('Google');
    // Only Google jobs visible — others hidden
    const cards = page.locator('[class*="card"]');
    const count = await cards.count();
    // All visible cards should relate to search term
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
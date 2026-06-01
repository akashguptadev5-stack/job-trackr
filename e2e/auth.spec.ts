import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('shows login page at root when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/login/);
    await expect(page.getByText('Welcome back')).toBeVisible();
  });

  test('shows register page', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByText('Create account')).toBeVisible();
    await expect(page.getByPlaceholder('Min 6 characters')).toBeVisible();
  });

  test('shows validation — empty form submit', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in/i }).click();
    // HTML5 validation prevents submit with empty fields
    const emailInput = page.getByPlaceholder('you@example.com');
    await expect(emailInput).toBeVisible();
  });

  test('navigates between login and register', async ({ page }) => {
    await page.goto('/login');
    await page.getByText('Create one free').click();
    await expect(page).toHaveURL(/register/);
    await page.getByText('Sign in').click();
    await expect(page).toHaveURL(/login/);
  });
});
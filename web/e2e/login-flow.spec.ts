import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should login with seeded user credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Fill login form with seeded user
    await page.fill('input[name="email"]', 'sarah@example.com');
    await page.fill('input[name="password"]', 'anypassword'); // Password not validated in MVP
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation after successful login
    await page.waitForURL(/\/(dashboard|home)/, { timeout: 10000 });
    
    // Verify we're on dashboard or home page
    const url = page.url();
    expect(url).toMatch(/\/(dashboard|home)/);
    
    // Verify user is logged in (should see user name or menu)
    await expect(page.locator('text=/sarah|johnson/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('should show error for non-existent user', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'nonexistent@example.com');
    await page.fill('input[name="password"]', 'anypassword');
    
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=/invalid.*email/i, text=/invalid.*password/i, text=/unauthorized/i, [role="alert"]').first()).toBeVisible();
  });

  test('should navigate to registration page from login', async ({ page }) => {
    await page.goto('/login');
    
    // Click "Create account" or "Register" link
    await page.click('text=/create.*account/i, text=/register/i, a[href*="register"]'.split(',')[0]);
    
    // Should navigate to registration page
    await page.waitForURL(/\/register/, { timeout: 5000 });
    expect(page.url()).toContain('/register');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'sarah@example.com');
    await page.fill('input[name="password"]', 'anypassword');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|home)/, { timeout: 10000 });
    
    // Logout
    await page.click('text=/log.*out/i, button:has-text("Logout"), [aria-label*="logout"]'.split(',')[0]);
    
    // Should redirect to login page
    await page.waitForURL(/\/(login|auth|$)/, { timeout: 5000 });
    expect(page.url()).toMatch(/\/(login|auth|$)/);
  });
});

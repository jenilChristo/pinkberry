import { test, expect } from '@playwright/test';

test.describe('Registration Flow', () => {
  test('should complete registration and redirect to onboarding', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register');
    
    // Fill registration form
    const timestamp = Date.now();
    const email = `user${timestamp}@example.com`;
    
    await page.fill('input[name="name"]', 'New Test User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation after successful registration
    await page.waitForURL(/\/(dashboard|onboarding|setup)/, { timeout: 10000 });
    
    // Verify we're logged in (should see user menu or logout button)
    await expect(page.locator('text=/log.*out/i, button:has-text("Profile"), [aria-label*="user"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('should show validation error for mismatched passwords', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPassword123!');
    
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.locator('text=/password.*match/i, text=/match.*password/i').first()).toBeVisible();
  });

  test('should show error for existing user', async ({ page }) => {
    // First registration
    const email = 'duplicate@example.com';
    
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Duplicate User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|onboarding|setup)/, { timeout: 10000 });
    
    // Logout
    await page.click('text=/log.*out/i, button:has-text("Logout"), [aria-label*="logout"]'.split(',')[0]);
    await page.waitForURL(/\/(login|auth|$)/, { timeout: 5000 });
    
    // Try to register again with same email
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Duplicate User 2');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    // Should show error
    await expect(page.locator('text=/already.*exists/i, text=/email.*taken/i, [role="alert"]').first()).toBeVisible();
  });
});

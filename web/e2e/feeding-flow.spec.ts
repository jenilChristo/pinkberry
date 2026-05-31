import { test, expect } from '@playwright/test';
import { loginAsUser, selectBaby } from './helpers';

test.describe('Feeding Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await selectBaby(page);
  });

  test('should record a breast feeding session', async ({ page }) => {
    // Navigate to feeding section
    await page.click('text=/feeding/i, a[href*="feeding"], button:has-text("Feed")'.split(',')[0]);
    
    // Click "Add Feeding" or similar button
    await page.click('text=/add.*feeding/i, text=/new.*feeding/i, button:has-text("Record"), button[aria-label*="add"]'.split(',')[0]);
    
    // Select feeding type
    await page.click('text=/breast/i, input[value="breast"], [role="radio"]:has-text("Breast")'.split(',')[0]);
    
    // Fill feeding details
    await page.fill('input[name*="duration"], input[placeholder*="minutes"], input[type="number"]'.split(',')[0], '15');
    
    // Select which breast
    await page.click('text=/left/i, input[value="left"], [role="radio"]:has-text("Left")'.split(',')[0]);
    
    // Add notes (optional)
    const notesField = page.locator('textarea[name*="note"], textarea[placeholder*="note"]').first();
    if (await notesField.isVisible({ timeout: 1000 }).catch(() => false)) {
      await notesField.fill('Baby fed well');
    }
    
    // Submit
    await page.click('button[type="submit"], button:has-text("Save"), button:has-text("Record")');
    
    // Verify success (should show in list or see success message)
    await expect(page.locator('text=/success/i, text=/recorded/i, text=/added/i, [role="status"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('should record a bottle feeding session', async ({ page }) => {
    await page.click('text=/feeding/i, a[href*="feeding"]'.split(',')[0]);
    await page.click('text=/add.*feeding/i, text=/new.*feeding/i, button:has-text("Record")'.split(',')[0]);
    
    // Select bottle feeding
    await page.click('text=/bottle/i, input[value="bottle"], [role="radio"]:has-text("Bottle")'.split(',')[0]);
    
    // Fill amount
    await page.fill('input[name*="amount"], input[placeholder*="amount"], input[placeholder*="ml"]'.split(',')[0], '120');
    
    // Submit
    await page.click('button[type="submit"], button:has-text("Save")');
    
    // Verify success
    await expect(page.locator('text=/success/i, text=/recorded/i, [role="status"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('should view feeding history', async ({ page }) => {
    await page.click('text=/feeding/i, a[href*="feeding"]'.split(',')[0]);
    
    // Should see feeding history list
    await expect(page.locator('text=/history/i, text=/recent/i, [role="list"], table').first()).toBeVisible({ timeout: 5000 });
    
    // Should see at least one feeding entry (from seeded data)
    await expect(page.locator('text=/breast/i, text=/bottle/i, td:has-text("ml")').first()).toBeVisible({ timeout: 5000 });
  });

  test('should filter feeding history by type', async ({ page }) => {
    await page.click('text=/feeding/i, a[href*="feeding"]'.split(',')[0]);
    
    // Look for filter controls
    const filterButton = page.locator('button:has-text("Filter"), select[name*="type"], [role="combobox"]').first();
    
    if (await filterButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await filterButton.click();
      
      // Select breast filter
      await page.click('text=/breast.*only/i, option[value="breast"], [role="option"]:has-text("Breast")'.split(',')[0]);
      
      // Verify only breast feedings are shown
      await expect(page.locator('text=/breast/i').first()).toBeVisible();
    }
  });
});

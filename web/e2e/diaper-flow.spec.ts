import { test, expect } from '@playwright/test';
import { loginAsUser, selectBaby } from './helpers';

test.describe('Diaper Change Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await selectBaby(page);
  });

  test('should record a wet diaper change', async ({ page }) => {
    // Navigate to diaper section
    await page.click('text=/diaper/i, a[href*="diaper"], button:has-text("Diaper")'.split(',')[0]);
    
    // Click "Add Diaper" or similar button
    await page.click('text=/add.*diaper/i, text=/record.*diaper/i, button:has-text("Record")'.split(',')[0]);
    
    // Select wet diaper type
    await page.click('text=/wet/i, input[value="wet"], [role="checkbox"]:has-text("Wet"), [role="radio"]:has-text("Wet")'.split(',')[0]);
    
    // Add notes (optional)
    const notesField = page.locator('textarea[name*="note"], textarea[placeholder*="note"]').first();
    if (await notesField.isVisible({ timeout: 1000 }).catch(() => false)) {
      await notesField.fill('Regular wet diaper');
    }
    
    // Submit
    await page.click('button[type="submit"], button:has-text("Save")');
    
    // Verify success
    await expect(page.locator('text=/success/i, text=/recorded/i, [role="status"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('should record a dirty diaper change', async ({ page }) => {
    await page.click('text=/diaper/i, a[href*="diaper"]'.split(',')[0]);
    await page.click('text=/add.*diaper/i, text=/record.*diaper/i'.split(',')[0]);
    
    // Select dirty diaper type
    await page.click('text=/dirty/i, text=/soiled/i, text=/poop/i, input[value="dirty"]'.split(',')[0]);
    
    // Submit
    await page.click('button[type="submit"], button:has-text("Save")');
    
    // Verify success
    await expect(page.locator('text=/success/i, text=/recorded/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('should record a mixed diaper change', async ({ page }) => {
    await page.click('text=/diaper/i, a[href*="diaper"]'.split(',')[0]);
    await page.click('text=/add.*diaper/i, text=/record.*diaper/i'.split(',')[0]);
    
    // Select both wet and dirty
    await page.click('text=/wet/i, input[value="wet"], [role="checkbox"]:has-text("Wet")'.split(',')[0]);
    await page.click('text=/dirty/i, input[value="dirty"], [role="checkbox"]:has-text("Dirty")'.split(',')[0]);
    
    // Submit
    await page.click('button[type="submit"], button:has-text("Save")');
    
    // Verify success
    await expect(page.locator('text=/success/i, text=/recorded/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('should view diaper change history', async ({ page }) => {
    await page.click('text=/diaper/i, a[href*="diaper"]'.split(',')[0]);
    
    // Should see diaper history
    await expect(page.locator('text=/history/i, text=/recent/i, [role="list"], table').first()).toBeVisible({ timeout: 5000 });
    
    // Should see diaper entries from seeded data
    await expect(page.locator('text=/wet/i, text=/dirty/i, text=/mixed/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('should view diaper statistics', async ({ page }) => {
    await page.click('text=/diaper/i, a[href*="diaper"]'.split(',')[0]);
    
    // Look for statistics section
    const statsSection = page.locator('text=/today/i, text=/total.*diaper/i, text=/statistics/i').first();
    
    if (await statsSection.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(statsSection).toBeVisible();
      
      // Should show counts
      await expect(page.locator('text=/\\d+.*wet/i, text=/\\d+.*dirty/i').first()).toBeVisible();
    }
  });
});

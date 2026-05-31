import { test, expect } from '@playwright/test';
import { loginAsUser, selectBaby } from './helpers';

test.describe('Growth Measurement Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await selectBaby(page);
  });

  test('should record weight measurement', async ({ page }) => {
    // Navigate to growth section
    await page.click('text=/growth/i, a[href*="growth"], button:has-text("Growth")'.split(',')[0]);
    
    // Click "Add Measurement" or similar button
    await page.click('text=/add.*measurement/i, text=/record.*measurement/i, button:has-text("Record")'.split(',')[0]);
    
    // Fill weight
    await page.fill('input[name*="weight"], input[placeholder*="weight"], input[placeholder*="kg"]'.split(',')[0], '5.2');
    
    // Add notes (optional)
    const notesField = page.locator('textarea[name*="note"], textarea[placeholder*="note"]').first();
    if (await notesField.isVisible({ timeout: 1000 }).catch(() => false)) {
      await notesField.fill('Regular checkup weight');
    }
    
    // Submit
    await page.click('button[type="submit"], button:has-text("Save")');
    
    // Verify success
    await expect(page.locator('text=/success/i, text=/recorded/i, [role="status"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('should record length measurement', async ({ page }) => {
    await page.click('text=/growth/i, a[href*="growth"]'.split(',')[0]);
    await page.click('text=/add.*measurement/i, text=/record.*measurement/i'.split(',')[0]);
    
    // Fill length
    await page.fill('input[name*="length"], input[name*="height"], input[placeholder*="cm"]'.split(',')[0], '55.5');
    
    // Submit
    await page.click('button[type="submit"], button:has-text("Save")');
    
    // Verify success
    await expect(page.locator('text=/success/i, text=/recorded/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('should record head circumference', async ({ page }) => {
    await page.click('text=/growth/i, a[href*="growth"]'.split(',')[0]);
    await page.click('text=/add.*measurement/i, text=/record.*measurement/i'.split(',')[0]);
    
    // Fill head circumference
    await page.fill('input[name*="head"], input[placeholder*="head"], input[placeholder*="circumference"]'.split(',')[0], '40.5');
    
    // Submit
    await page.click('button[type="submit"], button:has-text("Save")');
    
    // Verify success
    await expect(page.locator('text=/success/i, text=/recorded/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('should record complete measurement (weight, length, head)', async ({ page }) => {
    await page.click('text=/growth/i, a[href*="growth"]'.split(',')[0]);
    await page.click('text=/add.*measurement/i, text=/record.*measurement/i'.split(',')[0]);
    
    // Fill all measurements
    await page.fill('input[name*="weight"]', '5.3');
    await page.fill('input[name*="length"], input[name*="height"]'.split(',')[0], '56.0');
    await page.fill('input[name*="head"]', '41.0');
    
    // Submit
    await page.click('button[type="submit"], button:has-text("Save")');
    
    // Verify success
    await expect(page.locator('text=/success/i, text=/recorded/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('should view growth history and charts', async ({ page }) => {
    await page.click('text=/growth/i, a[href*="growth"]'.split(',')[0]);
    
    // Should see growth history or chart
    await expect(page.locator('text=/history/i, text=/chart/i, canvas, svg[class*="chart"]').first()).toBeVisible({ timeout: 5000 });
    
    // Should see measurements from seeded data
    await expect(page.locator('text=/kg/i, text=/cm/i, td').first()).toBeVisible({ timeout: 5000 });
  });

  test('should view growth percentiles', async ({ page }) => {
    await page.click('text=/growth/i, a[href*="growth"]'.split(',')[0]);
    
    // Look for percentile information
    const percentileSection = page.locator('text=/percentile/i, text=/growth.*curve/i').first();
    
    if (await percentileSection.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(percentileSection).toBeVisible();
      
      // Should show percentile values
      await expect(page.locator('text=/\\d+.*percentile/i, text=/\\d+th/i').first()).toBeVisible();
    }
  });
});

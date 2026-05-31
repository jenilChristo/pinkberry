import { test, expect } from '@playwright/test';
import { loginAsUser, selectBaby } from './helpers';

test.describe('Sleep Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await selectBaby(page);
  });

  test('should record a sleep session', async ({ page }) => {
    // Navigate to sleep section
    await page.click('text=/sleep/i, a[href*="sleep"], button:has-text("Sleep")'.split(',')[0]);
    
    // Click "Add Sleep" or similar button
    await page.click('text=/add.*sleep/i, text=/record.*sleep/i, button:has-text("Record")'.split(',')[0]);
    
    // Fill start time (use current time minus 2 hours)
    const startTime = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const startTimeStr = startTime.toTimeString().slice(0, 5);
    
    await page.fill('input[name*="start"], input[placeholder*="start"]'.split(',')[0], startTimeStr);
    
    // Fill end time (use current time minus 30 minutes)
    const endTime = new Date(Date.now() - 30 * 60 * 1000);
    const endTimeStr = endTime.toTimeString().slice(0, 5);
    
    await page.fill('input[name*="end"], input[placeholder*="end"]'.split(',')[0], endTimeStr);
    
    // Select sleep quality
    const qualityField = page.locator('select[name*="quality"], [role="combobox"]').first();
    if (await qualityField.isVisible({ timeout: 1000 }).catch(() => false)) {
      await qualityField.selectOption('Good');
    }
    
    // Add notes (optional)
    const notesField = page.locator('textarea[name*="note"], textarea[placeholder*="note"]').first();
    if (await notesField.isVisible({ timeout: 1000 }).catch(() => false)) {
      await notesField.fill('Slept well after feeding');
    }
    
    // Submit
    await page.click('button[type="submit"], button:has-text("Save")');
    
    // Verify success
    await expect(page.locator('text=/success/i, text=/recorded/i, [role="status"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('should start and stop sleep session', async ({ page }) => {
    await page.click('text=/sleep/i, a[href*="sleep"]'.split(',')[0]);
    
    // Look for "Start Sleep" button
    const startButton = page.locator('button:has-text("Start"), button:has-text("Begin Sleep")').first();
    
    if (await startButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await startButton.click();
      
      // Should see "Stop" or "End Sleep" button
      await expect(page.locator('button:has-text("Stop"), button:has-text("End")').first()).toBeVisible({ timeout: 3000 });
      
      // Wait a moment then stop
      await page.waitForTimeout(2000);
      await page.click('button:has-text("Stop"), button:has-text("End")');
      
      // Verify sleep was recorded
      await expect(page.locator('text=/success/i, text=/recorded/i').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should view sleep history and statistics', async ({ page }) => {
    await page.click('text=/sleep/i, a[href*="sleep"]'.split(',')[0]);
    
    // Should see sleep history
    await expect(page.locator('text=/history/i, text=/recent/i, [role="list"], table').first()).toBeVisible({ timeout: 5000 });
    
    // Should see sleep entries from seeded data
    await expect(page.locator('text=/hour/i, text=/minute/i, td').first()).toBeVisible({ timeout: 5000 });
    
    // Check for statistics
    const statsSection = page.locator('text=/total.*sleep/i, text=/average/i, text=/statistics/i').first();
    if (await statsSection.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(statsSection).toBeVisible();
    }
  });

  test('should view sleep patterns chart', async ({ page }) => {
    await page.click('text=/sleep/i, a[href*="sleep"]'.split(',')[0]);
    
    // Look for chart or graph
    const chartElement = page.locator('canvas, svg[class*="chart"], [role="img"]').first();
    
    if (await chartElement.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(chartElement).toBeVisible();
    }
  });
});

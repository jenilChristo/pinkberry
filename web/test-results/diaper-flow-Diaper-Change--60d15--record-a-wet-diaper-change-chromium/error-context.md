# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: diaper-flow.spec.ts >> Diaper Change Workflow >> should record a wet diaper change
- Location: e2e\diaper-flow.spec.ts:10:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('text=/add.*diaper/i')

```

# Page snapshot

```yaml
- generic [ref=e5]:
  - complementary [ref=e6]:
    - generic [ref=e7]:
      - img [ref=e8]:
        - img [ref=e10]
      - generic [ref=e12]: Baby Chloe
    - generic [ref=e13]:
      - img "Chloe" [ref=e14]:
        - generic [ref=e15]: C
      - generic [ref=e16]:
        - text: Chloe
        - generic [ref=e17]: NaN years old
    - navigation [ref=e18]:
      - button "Dashboard" [ref=e19]:
        - img [ref=e21]
        - text: Dashboard
      - button "Sleep" [ref=e23]:
        - img [ref=e25]
        - text: Sleep
      - button "Feeding" [ref=e27]:
        - img [ref=e29]
        - text: Feeding
      - button "Diaper" [active] [ref=e31] [cursor=pointer]:
        - img [ref=e33]
        - text: Diaper
      - button "Growth" [ref=e35]:
        - img [ref=e37]
        - text: Growth
      - button "Cry Analyzer" [ref=e39]:
        - img [ref=e41]
        - text: Cry Analyzer
      - button "Activity" [ref=e43]:
        - img [ref=e45]
        - text: Activity
      - separator [ref=e47]
      - button "Settings" [ref=e48]:
        - img [ref=e50]
        - text: Settings
  - generic [ref=e52]:
    - banner [ref=e54]:
      - generic [ref=e55]:
        - button "Switch to dark mode" [ref=e56]:
          - img [ref=e58]
        - button "Sarah Johnson sarah@example.com Sarah Johnson" [ref=e60]:
          - generic [ref=e61]:
            - generic [ref=e62]: Sarah Johnson
            - generic [ref=e63]: sarah@example.com
          - img "Sarah Johnson" [ref=e64]:
            - generic [ref=e65]: SJ
    - main [ref=e66]:
      - generic [ref=e67]:
        - generic [ref=e68]:
          - generic [ref=e69]:
            - text: Diaper Tracking
            - generic [ref=e70]: Track Chloe's diaper changes
          - button "Log Diaper Change" [ref=e71]:
            - img [ref=e73]
            - text: Log Diaper Change
        - group [ref=e76]:
          - generic [ref=e77]: No diaper changes yet. Start tracking!
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { loginAsUser, selectBaby } from './helpers';
  3  | 
  4  | test.describe('Diaper Change Workflow', () => {
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await loginAsUser(page);
  7  |     await selectBaby(page);
  8  |   });
  9  | 
  10 |   test('should record a wet diaper change', async ({ page }) => {
  11 |     // Navigate to diaper section
  12 |     await page.click('text=/diaper/i, a[href*="diaper"], button:has-text("Diaper")'.split(',')[0]);
  13 |     
  14 |     // Click "Add Diaper" or similar button
> 15 |     await page.click('text=/add.*diaper/i, text=/record.*diaper/i, button:has-text("Record")'.split(',')[0]);
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  16 |     
  17 |     // Select wet diaper type
  18 |     await page.click('text=/wet/i, input[value="wet"], [role="checkbox"]:has-text("Wet"), [role="radio"]:has-text("Wet")'.split(',')[0]);
  19 |     
  20 |     // Add notes (optional)
  21 |     const notesField = page.locator('textarea[name*="note"], textarea[placeholder*="note"]').first();
  22 |     if (await notesField.isVisible({ timeout: 1000 }).catch(() => false)) {
  23 |       await notesField.fill('Regular wet diaper');
  24 |     }
  25 |     
  26 |     // Submit
  27 |     await page.click('button[type="submit"], button:has-text("Save")');
  28 |     
  29 |     // Verify success
  30 |     await expect(page.locator('text=/success/i, text=/recorded/i, [role="status"]').first()).toBeVisible({ timeout: 5000 });
  31 |   });
  32 | 
  33 |   test('should record a dirty diaper change', async ({ page }) => {
  34 |     await page.click('text=/diaper/i, a[href*="diaper"]'.split(',')[0]);
  35 |     await page.click('text=/add.*diaper/i, text=/record.*diaper/i'.split(',')[0]);
  36 |     
  37 |     // Select dirty diaper type
  38 |     await page.click('text=/dirty/i, text=/soiled/i, text=/poop/i, input[value="dirty"]'.split(',')[0]);
  39 |     
  40 |     // Submit
  41 |     await page.click('button[type="submit"], button:has-text("Save")');
  42 |     
  43 |     // Verify success
  44 |     await expect(page.locator('text=/success/i, text=/recorded/i').first()).toBeVisible({ timeout: 5000 });
  45 |   });
  46 | 
  47 |   test('should record a mixed diaper change', async ({ page }) => {
  48 |     await page.click('text=/diaper/i, a[href*="diaper"]'.split(',')[0]);
  49 |     await page.click('text=/add.*diaper/i, text=/record.*diaper/i'.split(',')[0]);
  50 |     
  51 |     // Select both wet and dirty
  52 |     await page.click('text=/wet/i, input[value="wet"], [role="checkbox"]:has-text("Wet")'.split(',')[0]);
  53 |     await page.click('text=/dirty/i, input[value="dirty"], [role="checkbox"]:has-text("Dirty")'.split(',')[0]);
  54 |     
  55 |     // Submit
  56 |     await page.click('button[type="submit"], button:has-text("Save")');
  57 |     
  58 |     // Verify success
  59 |     await expect(page.locator('text=/success/i, text=/recorded/i').first()).toBeVisible({ timeout: 5000 });
  60 |   });
  61 | 
  62 |   test('should view diaper change history', async ({ page }) => {
  63 |     await page.click('text=/diaper/i, a[href*="diaper"]'.split(',')[0]);
  64 |     
  65 |     // Should see diaper history
  66 |     await expect(page.locator('text=/history/i, text=/recent/i, [role="list"], table').first()).toBeVisible({ timeout: 5000 });
  67 |     
  68 |     // Should see diaper entries from seeded data
  69 |     await expect(page.locator('text=/wet/i, text=/dirty/i, text=/mixed/i').first()).toBeVisible({ timeout: 5000 });
  70 |   });
  71 | 
  72 |   test('should view diaper statistics', async ({ page }) => {
  73 |     await page.click('text=/diaper/i, a[href*="diaper"]'.split(',')[0]);
  74 |     
  75 |     // Look for statistics section
  76 |     const statsSection = page.locator('text=/today/i, text=/total.*diaper/i, text=/statistics/i').first();
  77 |     
  78 |     if (await statsSection.isVisible({ timeout: 2000 }).catch(() => false)) {
  79 |       await expect(statsSection).toBeVisible();
  80 |       
  81 |       // Should show counts
  82 |       await expect(page.locator('text=/\\d+.*wet/i, text=/\\d+.*dirty/i').first()).toBeVisible();
  83 |     }
  84 |   });
  85 | });
  86 | 
```
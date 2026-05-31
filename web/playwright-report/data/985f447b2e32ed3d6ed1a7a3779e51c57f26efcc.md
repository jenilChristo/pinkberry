# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard-flow.spec.ts >> Dashboard Workflow >> should display recent activity
- Location: e2e\dashboard-flow.spec.ts:26:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Recent Activity')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Recent Activity')

```

```yaml
- complementary:
  - img
  - text: Baby Chloe
  - img "Chloe": C
  - text: Chloe NaN years old
  - navigation:
    - button "Dashboard"
    - button "Sleep"
    - button "Feeding"
    - button "Diaper"
    - button "Growth"
    - button "Cry Analyzer"
    - button "Activity"
    - separator
    - button "Settings"
- banner:
  - button "Switch to dark mode"
  - button "Sarah Johnson sarah@example.com Sarah Johnson":
    - text: Sarah Johnson sarah@example.com
    - img "Sarah Johnson": SJ
- main:
  - text: DashboardWelcome back! Here's what's happening with Chloe
  - button "Log Sleep"
  - button "Log Feeding"
  - button "Log Diaper"
  - group: 1.8h Sleep Today
  - group: 2 Feedings Today
  - group: 3 Diapers Today
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { loginAsUser, selectBaby } from './helpers';
  3  | 
  4  | test.describe('Dashboard Workflow', () => {
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await loginAsUser(page);
  7  |     await selectBaby(page);
  8  |   });
  9  | 
  10 |   test('should display dashboard with key metrics', async ({ page }) => {
  11 |     // Wait for dashboard to load
  12 |     await page.waitForLoadState('networkidle');
  13 |     
  14 |     // Should see Dashboard title
  15 |     await expect(page.locator('text=Dashboard')).toBeVisible();
  16 |     
  17 |     // Should see welcome message with baby name
  18 |     await expect(page.locator('text=/Welcome back/i')).toBeVisible();
  19 |     
  20 |     // Should see stat cards
  21 |     await expect(page.locator('text=Sleep Today')).toBeVisible();
  22 |     await expect(page.locator('text=Feedings Today')).toBeVisible();
  23 |     await expect(page.locator('text=Diapers Today')).toBeVisible();
  24 |   });
  25 | 
  26 |   test('should display recent activity', async ({ page }) => {
  27 |     await page.waitForLoadState('networkidle');
  28 |     
  29 |     // Should see recent activity section
> 30 |     await expect(page.locator('text=Recent Activity')).toBeVisible();
     |                                                        ^ Error: expect(locator).toBeVisible() failed
  31 |     
  32 |     // Should see activity entries from seeded data
  33 |     // Check for at least one activity card
  34 |     await expect(page.locator('[class*=\"activityCard\"]').first()).toBeVisible({ timeout: 5000 });
  35 |   });
  36 | 
  37 |   test('should navigate to sections from cards', async ({ page }) => {
  38 |     await page.waitForLoadState('networkidle');
  39 |     
  40 |     // Click on Sleep card
  41 |     await page.click('text=Sleep Today');
  42 |     await expect(page).toHaveURL(/\/sleep/);
  43 |     
  44 |     // Go back to dashboard
  45 |     await page.goto('/dashboard');
  46 |     await page.waitForLoadState('networkidle');
  47 |     
  48 |     // Click on Feeding card
  49 |     await page.click('text=Feedings Today');
  50 |     await expect(page).toHaveURL(/\/feeding/);
  51 |   });
  52 | 
  53 |   test('should display quick action buttons', async ({ page }) => {
  54 |     await page.waitForLoadState('networkidle');
  55 |     
  56 |     // Just check if page loaded without errors
  57 |     expect(await page.locator('text=Dashboard').count()).toBeGreaterThan(0);
  58 |   });
  59 | 
  60 |   test('should display baby information', async ({ page }) => {
  61 |     await page.waitForLoadState('networkidle');
  62 |     
  63 |     // Should see baby name in welcome message
  64 |     await expect(page.locator('text=/with Chloe/i')).toBeVisible();
  65 |   });
  66 | 
  67 |   test('should display statistics charts', async ({ page }) => {
  68 |     await page.waitForLoadState('networkidle');
  69 |     
  70 |     // Check that numeric stats are visible
  71 |     await expect(page.locator('text=/\\d+h/').first()).toBeVisible(); // Hours format like \"8.5h\"
  72 |     await expect(page.locator('text=/\\d+/').first()).toBeVisible(); // Any number
  73 |   });
  74 | 
  75 |   test('should show next feeding notification', async ({ page }) => {
  76 |     await page.waitForLoadState('networkidle');
  77 |     
  78 |     // Check for feeding-related text
  79 |     const feedingCard = page.locator('text=Feedings Today');
  80 |     await expect(feedingCard).toBeVisible();
  81 |   });
  82 | 
  83 |   test('should show active sleep session', async ({ page }) => {
  84 |     await page.waitForLoadState('networkidle');
  85 |     
  86 |     // Check for sleep-related text  
  87 |     const sleepCard = page.locator('text=Sleep Today');
  88 |     await expect(sleepCard).toBeVisible();
  89 |   });
  90 | });
```
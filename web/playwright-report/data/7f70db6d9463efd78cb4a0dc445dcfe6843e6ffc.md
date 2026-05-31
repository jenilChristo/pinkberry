# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard-flow.spec.ts >> Dashboard Workflow >> should display dashboard with key metrics
- Location: e2e\dashboard-flow.spec.ts:10:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Dashboard')
Expected: visible
Error: strict mode violation: locator('text=Dashboard') resolved to 2 elements:
    1) <button type="button" class="fui-Button r1f29ykk ___1uze3xu_4hitsa0 ffp7eso f1p3nwhy f11589ue f1q5o8ev f1pdflbu f1phragk f15wkkf3 f1s2uweq fr80ssc f1ukrpxl fecsdlb f1rq72xc f1ksv2xa fhvnf4x fb6swo4 f1klyf7k f232fm2 f1d6mv4x f1nz3ub2 fag2qd2 fmvhcg7 f1o3dhpw f14bpyus fqc85l4 f1h3a8gf fkiggi6 f8gmj8i f1ap8nzx f1igan7k fjag8bx f1v3eptx f1ysmecq faulsx f79t15f fbtzoaq f8qmx7k fd4bjan f17t0x8g f194v5ow f1qgg65p fk7jm04 fhgccpy f32wu9k fu5nqqq f13prjl2 f1czftr5 f1nl83rv fixhny3 feygou5 fbhxue7 fly5x3f">…</button> aka getByRole('button', { name: 'Dashboard' })
    2) <span class="fui-Title2 fui-Text ___190tv30_19t90t6 fk6fouc fojgt09 fcen8rp fl43uef fpgzoln f1w7gpdv f6juhto f1gl81tg f2jf649 f178qm3z">Dashboard</span> aka getByRole('main').getByText('Dashboard')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Dashboard')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - complementary [ref=e5]:
      - generic [ref=e6]:
        - img [ref=e7]:
          - img [ref=e9]
        - generic [ref=e11]: Baby Chloe
      - generic [ref=e12]:
        - img "Chloe" [ref=e13]:
          - generic [ref=e14]: C
        - generic [ref=e15]:
          - text: Chloe
          - generic [ref=e16]: NaN years old
      - navigation [ref=e17]:
        - button "Dashboard" [ref=e18]:
          - img [ref=e20]
          - text: Dashboard
        - button "Sleep" [ref=e22]:
          - img [ref=e24]
          - text: Sleep
        - button "Feeding" [ref=e26]:
          - img [ref=e28]
          - text: Feeding
        - button "Diaper" [ref=e30]:
          - img [ref=e32]
          - text: Diaper
        - button "Growth" [ref=e34]:
          - img [ref=e36]
          - text: Growth
        - button "Cry Analyzer" [ref=e38]:
          - img [ref=e40]
          - text: Cry Analyzer
        - button "Activity" [ref=e42]:
          - img [ref=e44]
          - text: Activity
        - separator [ref=e46]
        - button "Settings" [ref=e47]:
          - img [ref=e49]
          - text: Settings
    - generic [ref=e51]:
      - banner [ref=e53]:
        - generic [ref=e54]:
          - button "Switch to dark mode" [ref=e55]:
            - img [ref=e57]
          - button "Sarah Johnson sarah@example.com Sarah Johnson" [ref=e59]:
            - generic [ref=e60]:
              - generic [ref=e61]: Sarah Johnson
              - generic [ref=e62]: sarah@example.com
            - img "Sarah Johnson" [ref=e63]:
              - generic [ref=e64]: SJ
      - main [ref=e65]:
        - generic [ref=e66]:
          - generic [ref=e67]:
            - text: Dashboard
            - generic [ref=e68]: Welcome back! Here's what's happening with Chloe
          - generic [ref=e69]:
            - button "Log Sleep" [ref=e70]:
              - img [ref=e72]
              - text: Log Sleep
            - button "Log Feeding" [ref=e74]:
              - img [ref=e76]
              - text: Log Feeding
            - button "Log Diaper" [ref=e78]:
              - img [ref=e80]
              - text: Log Diaper
          - generic [ref=e82]:
            - group [ref=e84] [cursor=pointer]:
              - img [ref=e86]
              - generic [ref=e88]: 1.8h
              - generic [ref=e89]: Sleep Today
            - group [ref=e92] [cursor=pointer]:
              - img [ref=e94]
              - generic [ref=e96]: "2"
              - generic [ref=e97]: Feedings Today
            - group [ref=e100] [cursor=pointer]:
              - img [ref=e102]
              - generic [ref=e104]: "3"
              - generic [ref=e105]: Diapers Today
  - generic:
    - list:
      - listitem "SUCCESS" [ref=e110]:
        - generic [ref=e111]:
          - img [ref=e113]
          - generic [ref=e115]: SUCCESS
          - generic [ref=e116]: Login successful!
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
> 15 |     await expect(page.locator('text=Dashboard')).toBeVisible();
     |                                                  ^ Error: expect(locator).toBeVisible() failed
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
  30 |     await expect(page.locator('text=Recent Activity')).toBeVisible();
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
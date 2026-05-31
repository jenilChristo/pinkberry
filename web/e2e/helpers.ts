import { Page } from '@playwright/test';

export async function loginAsUser(page: Page, email: string = 'sarah@example.com', password: string = 'anypassword') {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|home)/, { timeout: 10000 });
}

export async function registerNewUser(page: Page) {
  const timestamp = Date.now();
  const email = `user${timestamp}@example.com`;
  
  await page.goto('/register');
  await page.fill('input[name="name"]', `Test User ${timestamp}`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', 'TestPassword123!');
  await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|onboarding|setup)/, { timeout: 10000 });
  
  return email;
}

export async function selectBaby(page: Page, babyName: string = 'Chloe') {
  // Wait for baby to be auto-selected by the app
  // The MainLayout now automatically fetches and selects the first baby
  await page.waitForTimeout(1000);
  
  // Optionally check if specific baby selector exists and select if needed
  const babySelector = page.locator(`select:has(option:text-is("${babyName}")), button:has-text("${babyName}"), [role="combobox"]:has-text("${babyName}")`).first();
  
  if (await babySelector.isVisible({ timeout: 2000 }).catch(() => false)) {
    await babySelector.click();
  }
}

export async function navigateToSection(page: Page, section: string) {
  // Common navigation patterns
  const navSelector = `nav a[href*="${section.toLowerCase()}"], button:has-text("${section}"), [role="menuitem"]:has-text("${section}")`;
  await page.click(navSelector);
  await page.waitForURL(new RegExp(section.toLowerCase()), { timeout: 5000 });
}

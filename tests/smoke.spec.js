// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Baseline Smoke & Error Detection', () => {
  test('loads home page without fatal errors and displays hero elements', async ({ page }) => {
    const consoleErrors = [];
    const failedRequests = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('requestfailed', request => {
      failedRequests.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Verify Title
    await expect(page).toHaveTitle(/Gobind Patel/i);

    // Verify Monumental Hero Heading
    const heroTitle = page.locator('.hero-title-monumental');
    await expect(heroTitle).toBeVisible();
    await expect(heroTitle).toContainText('I ARCHITECT');

    // Verify Hero Portrait container is visible and has non-zero size
    const portrait = page.locator('.portrait-container');
    await expect(portrait).toBeVisible();
    const portraitBox = await portrait.boundingBox();
    expect(portraitBox).not.toBeNull();
    expect(portraitBox?.width).toBeGreaterThan(150);
    expect(portraitBox?.height).toBeGreaterThan(150);

    // Verify Navigation Bar
    const nav = page.locator('nav.navbar');
    await expect(nav).toBeVisible();

    // Verify Theme Switcher works
    const themeBtnEmerald = page.locator('.theme-btn-emerald');
    if (await themeBtnEmerald.isVisible()) {
      await themeBtnEmerald.click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'emerald');
    }

    // Wait a brief moment for idle / deferred tasks
    await page.waitForTimeout(1000);

    console.log(`Console errors (${consoleErrors.length}):`, consoleErrors);
    console.log(`Failed requests (${failedRequests.length}):`, failedRequests);

    // Assert no fatal JS syntax or uncaught runtime crashes
    const fatalErrors = consoleErrors.filter(err => 
      !err.includes('favicon') && 
      !err.includes('net::ERR_BLOCKED_BY_CLIENT')
    );
    expect(fatalErrors).toEqual([]);
  });
});

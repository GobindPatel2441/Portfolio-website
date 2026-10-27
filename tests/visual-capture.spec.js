// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'artifacts', 'screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function scrollToEl(page, selector) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (window.lenis && typeof window.lenis.scrollTo === 'function') {
      window.lenis.scrollTo(el, { immediate: true });
    } else if (el) {
      el.scrollIntoView({ behavior: 'instant' });
    }
  }, selector);
  await page.waitForTimeout(500);
}

test.describe('Visual Snapshot Captures', () => {
  test('capture key responsive viewports and components', async ({ page }, testInfo) => {
    test.setTimeout(60000);
    // Only capture once (on chromium-desktop)
    if (testInfo.project.name !== 'chromium-desktop') return;

    // 1. Desktop Hero (1920x1080)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, '01_desktop_hero_1920.png'), fullPage: false });

    // 2. Laptop Hero (1440x900)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, '02_laptop_hero_1440.png'), fullPage: false });

    // 3. Tablet Landscape (1024x768)
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, '03_tablet_landscape_1024.png'), fullPage: false });

    // 4. Tablet Portrait (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, '04_tablet_portrait_768.png'), fullPage: false });

    // 5. Mobile Hero (390x844)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, '05_mobile_hero_390.png'), fullPage: false });

    // 6. Navigation (Desktop header)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(400);
    const nav = page.locator('.navbar-wrapper');
    await nav.screenshot({ path: path.join(outDir, '06_navigation_header.png') });

    // 7. Project Grid
    await scrollToEl(page, '#projects');
    await page.screenshot({ path: path.join(outDir, '07_project_grid.png'), fullPage: false });

    // 8. Project Modal
    const projectCard = page.locator('.project-card').first();
    await projectCard.click({ force: true });
    const modalOverlay = page.locator('#project-modal');
    await expect(modalOverlay).toBeVisible();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, '08_project_modal.png'), fullPage: false });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(600);

    // 9. Certificate Section
    await scrollToEl(page, '#certifications');
    await page.screenshot({ path: path.join(outDir, '09_certificates_section.png'), fullPage: false });

    // 10. Ambient Audio Popover
    await scrollToEl(page, '#floating-audio-controller');
    const audioDock = page.locator('#floating-audio-controller');
    const expandBtn = page.locator('.audio-expand-btn');
    await expandBtn.click({ force: true });
    await expect(audioDock).toHaveClass(/popover-open/);
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, '10_ambient_audio_popover.png'), fullPage: false });

    // 11. Footer
    await scrollToEl(page, '.footer');
    await page.screenshot({ path: path.join(outDir, '11_footer.png'), fullPage: false });
  });
});

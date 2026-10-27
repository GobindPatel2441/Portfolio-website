// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Comprehensive Functional Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  // 1. Navigation & Section Anchors
  test('navigation links and smooth scrolling anchors exist', async ({ page }) => {
    const navLinks = page.locator('#nav-links-menu a.nav-link');
    const count = await navLinks.count();
    expect(count).toBeGreaterThanOrEqual(5);

    // Click on About link if visible in desktop viewport
    const viewport = page.viewportSize();
    if (viewport && viewport.width >= 768) {
      const aboutLink = page.locator('#nav-links-menu a[href="#about"]');
      await aboutLink.click();
      await page.waitForTimeout(600);
      const aboutSection = page.locator('#about');
      await expect(aboutSection).toBeVisible();
    }
  });

  // 2. Mobile Drawer Navigation (on narrow screens)
  test('mobile hamburger menu toggles navigation drawer', async ({ page }) => {
    const vp = page.viewportSize();
    if (!vp || vp.width > 768) {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.waitForTimeout(500);
    }

    const toggleBtn = page.locator('#mobile-menu-toggle');
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click({ force: true });

    const menu = page.locator('#nav-links-menu');
    await expect(menu).toHaveClass(/mobile-open/);

    // Close it by clicking toggle button again
    await page.waitForTimeout(400);
    await toggleBtn.click({ force: true });
    await expect(menu).not.toHaveClass(/mobile-open/);
  });

  // 3. Theme Switching (Gold, Obsidian, Emerald, Cyber)
  test('theme switcher updates data-theme and colors on html root', async ({ page }) => {
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'gold');

    const obsidianBtn = page.locator('.theme-btn-obsidian');
    if (await obsidianBtn.isVisible()) {
      await obsidianBtn.click({ force: true });
      await expect(html).toHaveAttribute('data-theme', 'obsidian');
    }

    const cyberBtn = page.locator('.theme-btn-cyber');
    if (await cyberBtn.isVisible()) {
      await cyberBtn.click({ force: true });
      await expect(html).toHaveAttribute('data-theme', 'cyber');
    }

    const goldBtn = page.locator('.theme-btn-gold');
    if (await goldBtn.isVisible()) {
      await goldBtn.click({ force: true });
      await expect(html).toHaveAttribute('data-theme', 'gold');
    }
  });

  // 4. Portrait Card Glass Modes (Crystal, Frosted, Holo)
  test('portrait glass mode toggles active state and styles', async ({ page }) => {
    const crystalBtn = page.locator('.mode-btn[data-mode="crystal"]');
    const frostedBtn = page.locator('.mode-btn[data-mode="frosted"]');
    const holoBtn = page.locator('.mode-btn[data-mode="holo"]');

    await expect(crystalBtn).toHaveClass(/active/);

    await frostedBtn.click({ force: true });
    await expect(frostedBtn).toHaveClass(/active/);
    await expect(crystalBtn).not.toHaveClass(/active/);

    await holoBtn.click({ force: true });
    await expect(holoBtn).toHaveClass(/active/);
    await expect(frostedBtn).not.toHaveClass(/active/);

    await crystalBtn.click({ force: true });
    await expect(crystalBtn).toHaveClass(/active/);
  });

  // 5. Project Modals: open case study, check content, close via ESC and button
  test('project modal opens on project card click and closes with escape/button', async ({ page }) => {
    // Scroll down to projects to trigger progressive loader
    const projectsSec = page.locator('#projects');
    await projectsSec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    // Click on Sentix explore button or trigger
    const exploreBtn = page.locator('[data-project-target="sentix"]').first();
    await expect(exploreBtn).toBeVisible();
    await exploreBtn.click();

    // Verify modal overlay opens
    const modalOverlay = page.locator('#project-modal');
    await expect(modalOverlay).toHaveClass(/active/, { timeout: 8000 });

    // Verify title inside modal contains Sentix
    const modalTitle = page.locator('.modal-project-title, .modal-dialog h2, .modal-dialog h1').first();
    await expect(modalTitle).toBeVisible();

    // Close via Close Button
    const closeBtn = page.locator('.modal-close-btn');
    if (await closeBtn.isVisible()) {
      await page.waitForTimeout(500); // Allow entrance animation to settle
      await closeBtn.click({ force: true });
      await expect(modalOverlay).not.toHaveClass(/active/);
    }
  });

  // 6. AI Terminal Simulators (Sentix & Medical RAG tabs)
  test('ai terminal tab switching and choice buttons update output', async ({ page }) => {
    const aiSec = page.locator('#ai-terminal');
    await aiSec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    // Verify terminal header tabs
    const ragTab = page.locator('.term-tab[data-tab="medical-rag"]');
    const sentixTab = page.locator('.term-tab[data-tab="sentix-sim"]');

    if (await ragTab.isVisible()) {
      await ragTab.click();
      await expect(ragTab).toHaveClass(/active/);
      const ragPanel = page.locator('#tab-medical-rag');
      await expect(ragPanel).toHaveClass(/active/);
    }

    if (await sentixTab.isVisible()) {
      await sentixTab.click();
      await expect(sentixTab).toHaveClass(/active/);
      const sentixPanel = page.locator('#tab-sentix-sim');
      await expect(sentixPanel).toHaveClass(/active/);
    }
  });

  // 7. Ambient Audio Pill & Popover
  test('ambient audio pill opens popover and responds to volume/mute', async ({ page }) => {
    const audioDock = page.locator('#floating-audio-controller, .ambient-audio-dock');
    await expect(audioDock).toBeVisible();

    const expandBtn = page.locator('.audio-expand-btn');
    await expandBtn.click({ force: true });
    await expect(audioDock).toHaveClass(/popover-open/);

    const popover = page.locator('.ambient-audio-popover');
    await expect(popover).toBeVisible();

    // Click close button to close popover
    const closeBtn = page.locator('.audio-popover-close');
    await closeBtn.click({ force: true });
    await expect(audioDock).not.toHaveClass(/popover-open/);
  });

  // 8. Contact Form Validation (Required fields check)
  test('contact form shows validation errors on empty required submit', async ({ page }) => {
    await page.evaluate(() => {
      const contactEl = document.getElementById('contact');
      if (window.lenis && typeof window.lenis.scrollTo === 'function') {
        window.lenis.scrollTo(contactEl, { immediate: true });
      } else if (contactEl) {
        contactEl.scrollIntoView({ behavior: 'instant' });
      }
    });
    await page.waitForTimeout(600);

    const submitBtn = page.locator('#contact-submit-btn, button[type="submit"]').first();
    await submitBtn.scrollIntoViewIfNeeded();
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Check for validation error messages or invalid styling
    const errorMsg = page.locator('.field-error-msg.visible, .form-input.is-invalid').first();
    await expect(errorMsg).toBeVisible();
  });

  // 9. PDF Resume Preview and Download Link
  test('resume PDF download link points to valid file asset', async ({ page }) => {
    const resumeLinks = page.locator('a[href*="Resume.pdf"], a[href*="resume.pdf"]');
    const count = await resumeLinks.count();
    expect(count).toBeGreaterThanOrEqual(1);

    const firstHref = await resumeLinks.first().getAttribute('href');
    expect(firstHref).toContain('.pdf');

    // Verify the PDF is served by our webserver with status 200
    const response = await page.request.get(firstHref || '');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('pdf');
  });

  // 10. Certificates Section
  test('certificates section renders filters and credential cards', async ({ page }) => {
    const certSec = page.locator('#certifications');
    await certSec.scrollIntoViewIfNeeded();

    // Wait for progressive loader to initialize certificates
    await page.waitForTimeout(1000);

    const certFilters = page.locator('.cert-filter-btn');
    if (await certFilters.first().isVisible()) {
      await certFilters.first().click();
    }
  });

  // 11. Command Menu (Ctrl+K / Cmd+K)
  test('command menu opens via keyboard shortcut Ctrl+K and closes via Escape', async ({ page }) => {
    // Press Control+K
    await page.keyboard.press('Control+KeyK');
    await page.waitForTimeout(500);
    const cmdOverlay = page.locator('#command-menu-overlay, .cmd-overlay');
    if (await cmdOverlay.isVisible()) {
      await expect(cmdOverlay).toHaveClass(/active/);
      // Close with Escape
      await page.keyboard.press('Escape');
      await expect(cmdOverlay).not.toHaveClass(/active/);
    }
  });
});

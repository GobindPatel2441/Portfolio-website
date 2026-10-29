// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Task: Speed Up Certificate Card Entrance Animations Test Suite', () => {

  test('1. Certificate cards appear quickly and smoothly when scrolling into section', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
    
    // Scroll toward certificates section
    await page.evaluate(() => {
      const el = document.getElementById('certifications');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });

    // Wait for cards to appear
    await page.waitForSelector('.cert-card', { timeout: 4000 });
    
    // Wait brief window for 0.35s animation to complete
    await page.waitForTimeout(600);

    const cardsData = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.cert-card'));
      return cards.map(c => {
        const style = window.getComputedStyle(c);
        const rect = c.getBoundingClientRect();
        return {
          id: c.getAttribute('data-cert-id'),
          opacity: style.opacity,
          transform: style.transform,
          visibility: style.visibility,
          top: rect.top,
          height: rect.height
        };
      });
    });

    const viewportHeight = page.viewportSize()?.height || 900;
    expect(cardsData.length).toBe(14);
    // All cards in view must be visible (opacity 1)
    const inViewCards = cardsData.filter(c => c.top < viewportHeight && c.top + c.height > 0);
    expect(inViewCards.length).toBeGreaterThan(0);
    inViewCards.forEach(c => {
      expect(parseFloat(c.opacity)).toBeGreaterThan(0.9);
      expect(c.visibility).toBe('visible');
    });

    expect(consoleErrors).toEqual([]);
  });

  test('2. Category filtering updates cards immediately with fast entrance and no blank states', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/#certifications');
    await page.waitForSelector('.cert-card', { timeout: 4000 });

    const categories = ['Achievements', 'Internships', 'Additional Courses', 'Extracurricular', 'all'];

    for (const cat of categories) {
      const btn = page.locator(`.cert-filter-btn[data-category="${cat}"]`);
      await btn.click();
      await page.waitForTimeout(400);

      const cardsInfo = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.cert-card'));
        return {
          count: cards.length,
          opacities: cards.map(c => window.getComputedStyle(c).opacity),
          transforms: cards.map(c => window.getComputedStyle(c).transform)
        };
      });

      expect(cardsInfo.count).toBeGreaterThan(0);
      cardsInfo.opacities.forEach(op => {
        expect(parseFloat(op)).toBeGreaterThan(0.9);
      });
    }
  });

  test('3. Real-time search displays matching cards responsively without staying at opacity 0', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/#certifications');
    await page.waitForSelector('.cert-card', { timeout: 4000 });

    const searchInput = page.locator('#cert-search-input');
    await searchInput.fill('Chakravyuh');
    await page.waitForTimeout(400);

    let count = await page.locator('.cert-card').count();
    expect(count).toBeGreaterThanOrEqual(1);

    let firstOpacity = await page.locator('.cert-card').first().evaluate(el => window.getComputedStyle(el).opacity);
    expect(parseFloat(firstOpacity)).toBeGreaterThan(0.9);

    // Clear search
    await page.locator('#cert-search-clear').click();
    await page.waitForTimeout(400);

    count = await page.locator('.cert-card').count();
    expect(count).toBe(14);
  });

  test('4. Card hover effects remain functional after entrance completes (no stuck transform override)', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/#certifications');
    await page.waitForSelector('.cert-card', { timeout: 4000 });
    await page.waitForTimeout(600);

    const firstCard = page.locator('.cert-card').first();
    await firstCard.hover();
    await page.waitForTimeout(300);

    // Verify hover translateY(-6px) is active
    const transform = await firstCard.evaluate(el => window.getComputedStyle(el).transform);
    // In matrix notation, translateY(-6px) shows negative m42/matrix y component
    expect(transform).not.toBe('none');
  });

  test('5. Prefers-reduced-motion renders cards immediately with zero delay', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('http://127.0.0.1:5173/#certifications');
    await page.waitForSelector('.cert-card', { timeout: 4000 });

    const opacities = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.cert-card'));
      return cards.map(c => window.getComputedStyle(c).opacity);
    });

    expect(opacities.length).toBe(14);
    opacities.forEach(op => {
      expect(parseFloat(op)).toBe(1);
    });
  });

  test('6. Mobile viewport renders certificates with stacked responsive grid', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://127.0.0.1:5173/#certifications');
    await page.waitForSelector('.cert-card', { timeout: 4000 });
    await page.waitForTimeout(600);

    const gridInfo = await page.evaluate(() => {
      const grid = document.getElementById('cert-grid-container');
      const cards = Array.from(document.querySelectorAll('.cert-card'));
      return {
        gridWidth: grid?.clientWidth,
        cardsWidth: cards[0]?.clientWidth,
        hasOverflow: document.documentElement.scrollWidth > window.innerWidth
      };
    });

    expect(gridInfo.hasOverflow).toBe(false);
    expect(gridInfo.cardsWidth).toBeLessThanOrEqual(390);
  });

  test('7. Certificate Document Modal opens with PDF and close action works cleanly', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/#certifications');
    await page.waitForSelector('.cert-card', { timeout: 4000 });
    await page.waitForTimeout(500);

    // Click "View Document" on first card
    const viewBtn = page.locator('.cert-card').first().locator('.cert-btn-primary');
    await viewBtn.click();

    await page.waitForSelector('#project-modal.active', { timeout: 4000 });
    const isModalActive = await page.evaluate(() => document.getElementById('project-modal')?.classList.contains('active'));
    expect(isModalActive).toBe(true);

    // Close modal
    await page.locator('#modal-close-btn').click();
    await page.waitForTimeout(400);

    const isModalClosed = await page.evaluate(() => !document.getElementById('project-modal')?.classList.contains('active'));
    expect(isModalClosed).toBe(true);
  });
});

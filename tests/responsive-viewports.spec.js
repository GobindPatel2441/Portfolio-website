// @ts-check
const { test, expect } = require('@playwright/test');

const VIEWPORTS = [
  { name: 'Mobile Small (360x800)', width: 360, height: 800 },
  { name: 'iPhone SE/Standard (375x812)', width: 375, height: 812 },
  { name: 'iPhone 14/15 (390x844)', width: 390, height: 844 },
  { name: 'iPhone Pro Max (430x932)', width: 430, height: 932 },
  { name: 'iPad Portrait (768x1024)', width: 768, height: 1024 },
  { name: 'iPad Landscape (1024x768)', width: 1024, height: 768 },
  { name: 'Laptop HD (1366x768)', width: 1366, height: 768 },
  { name: 'Desktop Standard (1440x900)', width: 1440, height: 900 },
  { name: 'FHD Ultra-wide (1920x1080)', width: 1920, height: 1080 }
];

test.describe('Phase 8: 9-Viewport Responsive and Layout Stability Audit', () => {
  for (const vp of VIEWPORTS) {
    test(`Viewport ${vp.name} [${vp.width}x${vp.height}]: Zero horizontal overflow & layout integrity`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      // 1. Verify zero horizontal overflow
      const overflow = await page.evaluate(() => {
        const docW = document.documentElement.scrollWidth;
        const winW = window.innerWidth;
        const bodyW = document.body.scrollWidth;
        return {
          docW,
          winW,
          bodyW,
          hasOverflow: docW > winW || bodyW > winW
        };
      });
      expect(overflow.hasOverflow, `Viewport ${vp.width}x${vp.height} has horizontal overflow (doc: ${overflow.docW}, win: ${overflow.winW})`).toBe(false);

      // 2. Verify hero layout structure
      const heroLayout = await page.evaluate(() => {
        const hg = document.querySelector('.hero-grid');
        const pc = document.querySelector('.portrait-container');
        const hc = document.querySelector('.hero-content');
        if (!hg || !pc || !hc) return null;
        const hgStyle = window.getComputedStyle(hg);
        const pcRect = pc.getBoundingClientRect();
        const hcRect = hc.getBoundingClientRect();
        return {
          display: hgStyle.display,
          gridTemplateColumns: hgStyle.gridTemplateColumns,
          portraitTop: pcRect.top,
          contentTop: hcRect.top,
          portraitLeft: pcRect.left,
          contentLeft: hcRect.left
        };
      });

      expect(heroLayout).not.toBeNull();
      if (vp.width <= 768) {
        // Mobile/Tablet: stacked layout (portrait on top, content below)
        expect(heroLayout.portraitTop).toBeLessThan(heroLayout.contentTop);
      } else {
        // Desktop: side-by-side (content left, portrait right)
        expect(heroLayout.contentLeft).toBeLessThan(heroLayout.portraitLeft);
      }

      // 3. Verify LCP portrait image rendered with valid natural dimensions
      const portraitImg = await page.evaluate(() => {
        const img = document.querySelector('.portrait-img');
        if (!img) return null;
        return {
          complete: /** @type {HTMLImageElement} */ (img).complete,
          naturalWidth: /** @type {HTMLImageElement} */ (img).naturalWidth,
          naturalHeight: /** @type {HTMLImageElement} */ (img).naturalHeight,
          clientWidth: img.clientWidth,
          clientHeight: img.clientHeight
        };
      });
      expect(portraitImg).not.toBeNull();
      expect(portraitImg.naturalWidth).toBeGreaterThan(0);
      expect(portraitImg.clientWidth).toBeGreaterThan(0);

      // 4. Zero console errors
      expect(consoleErrors).toEqual([]);
    });
  }
});

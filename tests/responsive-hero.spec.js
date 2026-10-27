// @ts-check
const { test, expect } = require('@playwright/test');

const VIEWPORTS = [
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1728x900',  width: 1728, height: 900 },
  { name: '1440x900',  width: 1440, height: 900 },
  { name: '1366x768',  width: 1366, height: 768 },
  { name: '1024x768',  width: 1024, height: 768 },
  { name: '768x1024',  width: 768,  height: 1024 },
  { name: '430x932',   width: 430,  height: 932 },
  { name: '390x844',   width: 390,  height: 844 },
  { name: '375x812',   width: 375,  height: 812 },
  { name: '360x800',   width: 360,  height: 800 },
];

test.describe('Responsive Viewports & Overflow Audit', () => {
  for (const vp of VIEWPORTS) {
    test(`Viewport ${vp.name} (${vp.width}x${vp.height}): check overflow, portrait, and typography`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/', { waitUntil: 'networkidle' });

      // 1. Check for unexpected horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      const overflowDiff = scrollWidth - clientWidth;
      expect(overflowDiff, `Horizontal overflow detected at ${vp.name}: scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`).toBeLessThanOrEqual(1);

      // 2. Measure Portrait and Card Proportions
      const portraitBox = await page.locator('.liquid-glass-card').boundingBox();
      expect(portraitBox, 'Liquid glass card must be visible').not.toBeNull();
      if (portraitBox) {
        console.log(`[${vp.name}] Portrait Card width=${portraitBox.width.toFixed(1)}px, height=${portraitBox.height.toFixed(1)}px (Ratio=${(portraitBox.width/vp.width*100).toFixed(1)}% of viewport)`);
      }

      // 3. Measure Monumental Heading
      const titleBox = await page.locator('.hero-title-monumental').boundingBox();
      expect(titleBox, 'Hero title must be visible').not.toBeNull();
      if (titleBox) {
        console.log(`[${vp.name}] Hero Title height=${titleBox.height.toFixed(1)}px`);
      }
    });
  }
});

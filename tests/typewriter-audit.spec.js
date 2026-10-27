// @ts-check
const { test, expect } = require('@playwright/test');

const VIEWPORTS = [
  { name: '430x932', width: 430, height: 932 },
  { name: '390x844', width: 390, height: 844 },
  { name: '375x812', width: 375, height: 812 },
  { name: '360x800', width: 360, height: 800 },
];

test.describe('Typewriter Layout Shift and Overflow Audit', () => {
  for (const vp of VIEWPORTS) {
    test(`Typewriter phrases on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/', { waitUntil: 'networkidle' });

      const wrapper = page.locator('.css-typewriter-wrapper');
      await expect(wrapper).toBeVisible();

      const wrapperBox = await wrapper.boundingBox();
      const ghost = page.locator('.css-typewriter-ghost');
      const ghostBox = await ghost.boundingBox();

      console.log(`[${vp.name}] Typewriter wrapper width=${wrapperBox?.width.toFixed(1)}, height=${wrapperBox?.height.toFixed(1)}; ghost width=${ghostBox?.width.toFixed(1)}, height=${ghostBox?.height.toFixed(1)}`);

      // Verify that wrapper height matches ghost height (no layout shift)
      expect(wrapperBox?.height).toBeCloseTo(ghostBox?.height || 0, 1);
    });
  }
});

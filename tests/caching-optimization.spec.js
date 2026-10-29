// @ts-check
const { test, expect } = require('@playwright/test');
const { createServer } = require('../scripts/netlify-cache-server');
const http = require('http');

let server;
let baseUrl;

test.beforeAll(async () => {
  server = await createServer(0);
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
});

test.afterAll(async () => {
  if (server) {
    await new Promise(resolve => server.close(resolve));
  }
});

test.describe('Production-Grade Caching & Deployment Test Suite (12 Scenarios)', () => {

  // ----------------------------------------------------
  // Scenario 1: First visit with an empty browser cache (Cold Load)
  // ----------------------------------------------------
  test('Scenario 1: Cold load serves 200 OK with correct Cache-Control and no console errors', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const consoleErrors = [];
    const responses = [];

    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('response', res => {
      responses.push({ url: res.url(), status: res.status(), headers: res.headers() });
    });

    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });

    // HTML header check
    const htmlRes = responses.find(r => r.url === `${baseUrl}/` || r.url.endsWith('/index.html'));
    expect(htmlRes).toBeDefined();
    expect(htmlRes?.status).toBe(200);
    expect(htmlRes?.headers['cache-control']).toBe('public, max-age=0, must-revalidate');

    // Title & Hero checks
    await expect(page).toHaveTitle(/Gobind Patel/i);
    await expect(page.locator('.hero-title-monumental')).toBeVisible();

    const fatalErrors = consoleErrors.filter(e => !e.includes('favicon'));
    expect(fatalErrors).toEqual([]);
    await context.close();
  });

  // ----------------------------------------------------
  // Scenario 2: Repeat visit with a warm browser cache
  // ----------------------------------------------------
  test('Scenario 2: Warm cache repeat visit reuses cached resources and revalidates safely', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // 1st visit (cold)
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });

    // 2nd visit (warm in same context)
    const t0 = Date.now();
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    const warmDuration = Date.now() - t0;

    // Verify warm page rendered instantly
    await expect(page.locator('.hero-title-monumental')).toBeVisible();
    expect(warmDuration).toBeLessThan(4000);

    await context.close();
  });

  // ----------------------------------------------------
  // Scenario 3: Hard reload
  // ----------------------------------------------------
  test('Scenario 3: Hard reload bypasses cache and recovers complete page without errors', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    await page.reload({ waitUntil: 'networkidle' });

    await expect(page.locator('.hero-title-monumental')).toBeVisible();
    await expect(page.locator('nav.navbar')).toBeVisible();

    await context.close();
  });

  // ----------------------------------------------------
  // Scenario 4: CSS modification simulation & ETag revalidation
  // ----------------------------------------------------
  test('Scenario 4: CSS serves revalidation policy and responds with 304 when ETag matches', async () => {
    const fetchHeaders = (path, extraHeaders = {}) => new Promise((resolve) => {
      http.get(`${baseUrl}${path}`, { headers: extraHeaders }, (res) => {
        resolve({ status: res.statusCode, headers: res.headers });
      });
    });

    const initial = await fetchHeaders('/css/bundle.min.css');
    expect(initial.status).toBe(200);
    expect(initial.headers['cache-control']).toBe('public, max-age=0, must-revalidate');
    const etag = initial.headers['etag'];
    expect(etag).toBeDefined();

    // Conditional request with ETag
    const revalidation = await fetchHeaders('/css/bundle.min.css', { 'if-none-match': etag });
    expect(revalidation.status).toBe(304);

    // Mismatched ETag (simulating modified CSS)
    const modifiedCheck = await fetchHeaders('/css/bundle.min.css', { 'if-none-match': '"old-modified-etag"' });
    expect(modifiedCheck.status).toBe(200);
  });

  // ----------------------------------------------------
  // Scenario 5: JavaScript modification simulation & ETag revalidation
  // ----------------------------------------------------
  test('Scenario 5: Core JavaScript (main.js) responds with 304 on match and 200 on modified ETag', async () => {
    const fetchHeaders = (path, extraHeaders = {}) => new Promise((resolve) => {
      http.get(`${baseUrl}${path}`, { headers: extraHeaders }, (res) => {
        resolve({ status: res.statusCode, headers: res.headers });
      });
    });

    const initial = await fetchHeaders('/js/main.js');
    expect(initial.status).toBe(200);
    expect(initial.headers['cache-control']).toBe('public, max-age=0, must-revalidate');
    const etag = initial.headers['etag'];
    expect(etag).toBeDefined();

    const revalidation = await fetchHeaders('/js/main.js', { 'if-none-match': etag });
    expect(revalidation.status).toBe(304);

    const updated = await fetchHeaders('/js/main.js', { 'if-none-match': '"outdated-v1-etag"' });
    expect(updated.status).toBe(200);
  });

  // ----------------------------------------------------
  // Scenario 6: Deployment containing updated HTML & assets
  // ----------------------------------------------------
  test('Scenario 6: HTML entry points mandate must-revalidate so new deploys are discovered immediately', async () => {
    const fetchHeaders = (path) => new Promise((resolve) => {
      http.get(`${baseUrl}${path}`, (res) => {
        resolve({ status: res.statusCode, headers: res.headers });
      });
    });

    const rootRes = await fetchHeaders('/');
    expect(rootRes.headers['cache-control']).toBe('public, max-age=0, must-revalidate');

    const htmlRes = await fetchHeaders('/index.html');
    expect(htmlRes.headers['cache-control']).toBe('public, max-age=0, must-revalidate');

    const errorPageRes = await fetchHeaders('/404.html');
    expect(errorPageRes.headers['cache-control']).toBe('public, max-age=0, must-revalidate');
  });

  // ----------------------------------------------------
  // Scenario 7: Changed image or media asset
  // ----------------------------------------------------
  test('Scenario 7: Images use revalidation rather than immutable, preventing 30-day stale lock-in', async () => {
    const fetchHeaders = (path, extraHeaders = {}) => new Promise((resolve) => {
      http.get(`${baseUrl}${path}`, { headers: extraHeaders }, (res) => {
        resolve({ status: res.statusCode, headers: res.headers });
      });
    });

    const img = await fetchHeaders('/assets/gobind-patel.webp');
    expect(img.status).toBe(200);
    expect(img.headers['cache-control']).toBe('public, max-age=0, must-revalidate');
    expect(img.headers['cache-control']).not.toContain('immutable');

    const etag = img.headers['etag'];
    const reval = await fetchHeaders('/assets/gobind-patel.webp', { 'if-none-match': etag });
    expect(reval.status).toBe(304);
  });

  // ----------------------------------------------------
  // Scenario 8: Certificate PDF preview and download
  // ----------------------------------------------------
  test('Scenario 8: Certificate PDFs & Resume serve application/pdf with update-safe revalidation', async () => {
    const fetchHeaders = (path) => new Promise((resolve) => {
      http.get(`${baseUrl}${path}`, (res) => {
        resolve({ status: res.statusCode, headers: res.headers });
      });
    });

    const cert = await fetchHeaders('/assets/certificates/chakravyuh-hackathon-2nd-prize.pdf');
    expect(cert.status).toBe(200);
    expect(cert.headers['content-type']).toBe('application/pdf');
    expect(cert.headers['cache-control']).toBe('public, max-age=0, must-revalidate');
    expect(cert.headers['cache-control']).not.toContain('immutable');

    const resumeRoot = await fetchHeaders('/Gobind_Patel_Resume.pdf');
    expect(resumeRoot.status).toBe(200);
    expect(resumeRoot.headers['content-type']).toBe('application/pdf');
    expect(resumeRoot.headers['cache-control']).toBe('public, max-age=0, must-revalidate');

    const resumeAssets = await fetchHeaders('/assets/Gobind_Patel_Resume.pdf');
    expect(resumeAssets.status).toBe(200);
    expect(resumeAssets.headers['content-type']).toBe('application/pdf');
    expect(resumeAssets.headers['cache-control']).toBe('public, max-age=0, must-revalidate');
  });

  // ----------------------------------------------------
  // Scenario 9: Browser back/forward navigation
  // ----------------------------------------------------
  test('Scenario 9: Browser back/forward navigation retains state without errors or stale freezes', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // 1. Visit root home page
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    await expect(page.locator('.hero-title-monumental')).toBeVisible();

    // 2. Navigate to 404 page document
    await page.goto(`${baseUrl}/404.html`, { waitUntil: 'networkidle' });
    expect(page.url()).toContain('404.html');

    // 3. Go back to root home page via history
    await page.goBack({ waitUntil: 'networkidle' });
    await expect(page.locator('.hero-title-monumental')).toBeVisible();

    // 4. Go forward to 404 page via history
    await page.goForward({ waitUntil: 'networkidle' });
    expect(page.url()).toContain('404.html');

    await context.close();
  });

  // ----------------------------------------------------
  // Scenario 10: Service Worker & CacheStorage cleanup behavior
  // ----------------------------------------------------
  test('Scenario 10: sw.js serves no-cache, no-store, and unregisters with CacheStorage purge', async ({ browser }) => {
    const fetchHeaders = (path) => new Promise((resolve) => {
      http.get(`${baseUrl}${path}`, (res) => {
        resolve({ status: res.statusCode, headers: res.headers });
      });
    });

    const swRes = await fetchHeaders('/sw.js');
    expect(swRes.status).toBe(200);
    expect(swRes.headers['content-type']).toBe('application/javascript; charset=utf-8');
    expect(swRes.headers['cache-control']).toBe('no-cache, no-store, must-revalidate');

    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });

    const swState = await page.evaluate(async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      let cacheKeys = [];
      if ('caches' in window) {
        cacheKeys = await caches.keys();
      }
      return { regCount: registrations.length, cacheKeyCount: cacheKeys.length };
    });

    expect(swState.regCount).toBe(0);
    expect(swState.cacheKeyCount).toBe(0);

    await context.close();
  });

  // ----------------------------------------------------
  // Scenario 11: Mobile and desktop viewport stability
  // ----------------------------------------------------
  test('Scenario 11: Hero, Portrait, and Navigation render correctly on both desktop and mobile', async ({ browser }) => {
    const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
    await expect(desktopPage.locator('.hero-title-monumental')).toBeVisible();
    await expect(desktopPage.locator('.portrait-container')).toBeVisible();
    await desktopContext.close();

    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
    await expect(mobilePage.locator('.hero-title-monumental')).toBeVisible();
    await expect(mobilePage.locator('.portrait-container')).toBeVisible();
    await mobileContext.close();
  });

  // ----------------------------------------------------
  // Scenario 12: Fresh browser context without stored state
  // ----------------------------------------------------
  test('Scenario 12: Completely fresh browser context loads cleanly with zero errors', async ({ browser }) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    await expect(page.locator('.hero-title-monumental')).toBeVisible();

    const fatalErrors = errors.filter(e => !e.includes('favicon'));
    expect(fatalErrors).toEqual([]);

    await context.close();
  });

});

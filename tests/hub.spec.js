import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage, branding, responsive layout, and category navigation', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Find your way. Grow with us.');
  await expect(page.getByAltText('Anthurium Unit logo')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Welcome to Anthurium Unit' }).getByAltText('Anthurium Unit emblem — Jackfruit NBO, since 2018')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check('600 24px Manrope') && document.fonts.check('400 16px "Source Sans 3"'))).toBe(true);
  await expect.poll(() => page.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
  await expect(page.locator('.directory-section')).toHaveCount(7);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('.home-intro').evaluate(hero => Promise.all(hero.getAnimations({ subtree: true }).map(animation => animation.finished)));
  await page.screenshot({ path: `test-results/${testInfo.project.name}-overview.png`, fullPage: true });
  await page.locator('.directory-section a[href="#new-business"]').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('New business');
  await expect(page.locator('.resource-row')).toHaveCount(9);
  expect(errors).toEqual([]);
});

test('source information is readable while only external links stay pending', async ({ page }) => {
  await page.goto('/#guides');
  await page.getByRole('link', { name: 'SLOCPI Quick Product Guide', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('SLOCPI Quick Product Guide');
  await expect(page.locator('.pending-link')).toContainText('DOWNLOAD HERE');
  await expect(page.locator('.pending-link')).toContainText('Link coming soon');
  await expect(page.locator('.guide-document a[href^="https:"]')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.guide-document')).toContainText('SLOCPI Quick Product Guide');
});

test('search and empty states work without format controls', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('searchbox', { name: 'Search all resources' });
  await search.fill('AOA');
  await expect(page.locator('.resource-row')).toHaveCount(1);
  await expect(page.locator('.resource-row')).toContainText('Amendment of Application (AOA)');
  await search.fill('unmatched-resource-91029');
  await expect(page.getByRole('heading', { name: 'No resources found.' })).toBeVisible();
  await page.getByRole('button', { name: 'Browse categories', exact: true }).click();
  await expect(page.locator('#directory-heading')).toBeFocused();
  await expect(search).toHaveValue('');
  await search.fill('payment');
  await expect(page.locator('.resource-row').first()).toBeVisible();
  await expect(page.getByRole('combobox')).toHaveCount(0);
  await search.fill('<img src=x onerror=alert(1)>');
  await expect(page.getByRole('heading', { name: 'No resources found.' })).toBeVisible();
  await expect(page.locator('#page-content img')).toHaveCount(0);
});

test('static pages work without browser storage and have no account or tracking controls', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('Unexpected storage read'); };
    Storage.prototype.setItem = () => { throw new Error('Unexpected storage write'); };
  });
  for (const route of ['overview', 'getting-started', 'search?q=payment', 'resource/application', 'resource/warm-cold-prospects']) {
    await page.goto(`/#${route}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('checkbox')).toHaveCount(0);
    await expect(page.getByRole('progressbar')).toHaveCount(0);
    await expect(page.locator('[data-save], [data-step], .unit-avatar')).toHaveCount(0);
    await expect(page.getByRole('link', { name: /saved resources|sign in|sign up|my account/i })).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

test('keyboard and mobile navigation remain accessible', async ({ page }, testInfo) => {
  await page.goto('/');
  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Close navigation', exact: true })).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Open navigation', exact: true })).toBeFocused();
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Recordings', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Recordings');
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).not.toBeVisible();
  }
  await page.locator('#main').focus();
  await page.keyboard.press('/');
  await expect(page.getByRole('searchbox')).toBeFocused();
});

test('narrow phones and tablet layouts have no horizontal overflow', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Viewport coverage runs once.');
  for (const width of [320, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['overview', 'search?q=payment', 'getting-started', 'new-business', 'resource/loa-request', 'resource/warm-cold-prospects']) {
      await page.goto(`/#${route}`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px / ${route}`).toBe(true);
    }
  }
});

test('skip navigation preserves the current section and search supports Back', async ({ page }) => {
  await page.goto('/#new-business');
  await page.getByRole('link', { name: 'Skip to content' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  await expect(page).toHaveURL(/#new-business$/);
  await page.getByRole('searchbox').fill('payment');
  await expect(page).toHaveURL(/#search\?q=payment$/);
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('New business');
});

test('overview, search, rookies guides, articles, and scripts pass automated accessibility checks', async ({ page }) => {
  for (const route of ['overview', 'search?q=payment', 'getting-started', 'resource/application', 'resource/warm-cold-prospects']) {
    await page.goto(`/#${route}`);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(result.violations.map(violation => ({ id: violation.id, description: violation.description, nodes: violation.nodes.map(node => ({ target: node.target, summary: node.failureSummary })) }))).toEqual([]);
  }
  await page.goto('/#guides');
  await page.getByRole('link', { name: 'SLOCPI Quick Product Guide', exact: true }).click();
  await expect(page.locator('.guide-document')).toBeVisible();
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(result.violations.map(violation => ({ id: violation.id, nodes: violation.nodes.map(node => ({ target: node.target, summary: node.failureSummary })) }))).toEqual([]);
});

test('full copied procedures, emails, images, and scripts render without placeholder summaries', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.copiedMessage = text; } } });
  });
  await page.goto('/#resource/application');
  await expect(page.locator('.guide-document')).toContainText('SunSMART+ (iPAD)');
  await expect(page.locator('.guide-document')).toContainText('5. Wait for SETTLEMENT notification (1-3 days if clean case)');
  await expect(page.locator('.guide-document')).not.toContainText('What’s planned');
  await page.goto('/#resource/loa-request');
  await expect(page.locator('.guide-document')).toContainText('LOA is only valid for 14 DAYS');
  await expect(page.locator('.guide-figure img')).toHaveCount(4);
  await page.locator('.guide-figure').first().scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('.guide-figure img').first().evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  await page.goto('/#resource/refund');
  await expect(page.locator('.guide-document')).toContainText('Requirement/Refund:POLICY NUMBER/NAME OF CLIENT');
  await expect(page.locator('.guide-document')).toContainText('Phil_Scanning@sunlife.com');
  await page.goto('/#resource/service-requests');
  await expect(page.locator('.guide-document')).toContainText('10. You and client will received notification');
  await expect(page.locator('.guide-figure img')).toHaveCount(5);
  await page.goto('/#resource/warm-cold-prospects');
  await expect(page.locator('.script-message')).toContainText('SAD (Sickness, Accident, Disability)');
  await expect(page.locator('.script-message')).toContainText('Thank you and God Bless!');
  await expect(page.locator('.script-message')).toContainText('[Insert Link]');
  await expect(page.getByRole('button', { name: 'Copy message' })).toBeVisible();
  await page.getByRole('button', { name: 'Copy message' }).click();
  await expect.poll(() => page.evaluate(() => window.copiedMessage)).toContain('Thank you and God Bless!');
  await expect.poll(() => page.evaluate(() => window.copiedMessage)).toContain('[Insert Link]');
  await page.screenshot({ path: `test-results/${testInfo.project.name}-full-script.png`, fullPage: true });
});

test('future link configuration activates only the selected destinations and updates script URLs', async ({ page }) => {
  await page.route('**/src/resource-links.js', route => route.fulfill({
    contentType: 'text/javascript',
    body: 'export const resourceLinks = { "warm-cold-prospects-1": "https://example.com/book", "amendments-1": "https://example.com/aoa.pdf", "product-spiel-2": "https://example.com/planning" };',
  }));
  await page.goto('/#resource/amendments');
  await expect(page.locator('.guide-document a[href="https://example.com/aoa.pdf"]')).toBeVisible();
  await expect(page.locator('.pending-link')).toContainText('UPLOAD DOCUMENTS HERE');
  await page.goto('/#resource/warm-cold-prospects');
  await expect(page.locator('.script-message')).toContainText('https://example.com/book');
  await expect(page.locator('.script-message')).not.toContainText('[Insert Link]');
  await expect(page.locator('.guide-document a[href="https://example.com/book"]')).toBeVisible();
  await page.goto('/#resource/product-spiel');
  await expect(page.locator('.script-message')).toContainText('https://example.com/planning');
  await expect(page.locator('.guide-document a[href="https://example.com/planning"]')).toBeVisible();
});

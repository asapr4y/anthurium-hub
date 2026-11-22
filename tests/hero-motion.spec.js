import { test, expect } from '@playwright/test';

test('anthuriums unfold once while navigation remains immediately usable', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const hero = page.getByRole('region', { name: 'Welcome to Anthurium Unit' });
  await expect(hero.locator('.botanical-flower')).toHaveCount(3);
  await expect(hero.locator('.hero-botanicals')).toHaveAttribute('aria-hidden', 'true');
  await expect(hero.getByRole('link', { name: 'Find a resource' })).toBeEnabled();
  const sequence = await hero.evaluate(element => element.getAnimations({ subtree: true }).map(animation => ({ name: animation.animationName, iterations: animation.effect.getTiming().iterations })));
  expect(sequence.some(animation => animation.name === 'spathe-unfurl')).toBe(true);
  expect(sequence.every(animation => animation.iterations === 1)).toBe(true);
  await page.evaluate(() => document.fonts.ready);
  await hero.evaluate(element => element.getAnimations({ subtree: true }).forEach(animation => {
    animation.pause();
    animation.currentTime = Math.min(900, animation.effect.getComputedTiming().endTime - 1);
  }));
  const opening = await hero.screenshot({ path: `test-results/${testInfo.project.name}-hero-opening.png` });
  await hero.evaluate(element => element.getAnimations({ subtree: true }).forEach(animation => animation.play()));
  await hero.evaluate(element => Promise.all(element.getAnimations({ subtree: true }).map(animation => animation.finished)));
  expect(await hero.evaluate(element => element.getAnimations({ subtree: true }).every(animation => animation.playState === 'finished'))).toBe(true);
  const settled = await hero.screenshot({ path: `test-results/${testInfo.project.name}-hero-bloom.png` });
  expect(opening.equals(settled)).toBe(false);
  await hero.getByRole('link', { name: 'Find a resource' }).click();
  await expect(page.locator('#directory-heading')).toBeFocused();
  await page.locator('.directory-section a[href="#new-business"]').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('New business');
  await page.getByRole('link', { name: 'Anthurium Unit hub home' }).click();
  await expect(hero).toBeVisible();
  expect(await hero.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
});

test('resource links work before the opening sequence finishes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const hero = page.getByRole('region', { name: 'Welcome to Anthurium Unit' });
  expect(await hero.evaluate(element => element.getAnimations({ subtree: true }).some(animation => animation.playState === 'running'))).toBe(true);
  await hero.getByRole('link', { name: 'Find a resource' }).click();
  await expect(page.locator('#directory-heading')).toBeFocused();
});

test('reduced motion shows the complete floral composition without an opening animation', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const hero = page.getByRole('region', { name: 'Welcome to Anthurium Unit' });
  await expect(hero.locator('.botanical-flower')).toHaveCount(3);
  expect(await hero.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
  await expect(hero.getByRole('img')).toBeVisible();
  expect(await hero.locator('.flower-open').evaluateAll(flowers => flowers.every(flower => getComputedStyle(flower).opacity === '1'))).toBe(true);
  await hero.screenshot({ path: `test-results/${testInfo.project.name}-hero-still.png` });
});

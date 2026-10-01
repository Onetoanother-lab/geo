import { expect, test, type Page } from '@playwright/test';

async function enter(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /O‘rmonga kirish/ })).toBeVisible();
  await page.getByRole('button', { name: 'Ovozsiz kirish' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-locked', 'false');
  await page.waitForTimeout(800);
}

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  return errors;
}

test('boots, enters and navigates with the keyboard', async ({ page }) => {
  const errors = collectErrors(page);
  await enter(page);
  const y0 = await page.evaluate(() => scrollY);
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(1800);
  }
  const y1 = await page.evaluate(() => scrollY);
  expect(y1).toBeGreaterThan(y0);

  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(1800);
  expect(await page.evaluate(() => scrollY)).toBeLessThan(y1);

  await page.keyboard.press('End');
  await page.waitForTimeout(2500);
  const finaleTop = await page.evaluate(() => document.querySelector('[data-chapter="finale"]')!.getBoundingClientRect().top);
  // End lands on the finale's first beat, inside its pinned section.
  expect(finaleTop).toBeLessThanOrEqual(2);
  expect(finaleTop).toBeGreaterThan(-2000);

  await page.keyboard.press('Home');
  await page.waitForTimeout(2500);
  expect(await page.evaluate(() => scrollY)).toBeLessThan(5);
  expect(errors).toEqual([]);
});

test('mute, sources dialog and escape', async ({ page }) => {
  await enter(page);
  const sound = page.getByRole('navigation', { name: 'Taqdimot boshqaruvi' }).getByRole('button').first();
  await expect(sound).toHaveAttribute('aria-pressed', 'false');
  await page.keyboard.press('m');
  await expect(sound).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('m');
  await expect(sound).toHaveAttribute('aria-pressed', 'false');

  await page.keyboard.press('s');
  const dialog = page.getByRole('dialog', { name: 'Manbalar' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('every act renders while scrolling through (forwards and backwards)', async ({ page }) => {
  const errors = collectErrors(page);
  await enter(page);
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 1400) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(120);
  }
  for (let y = height; y > 0; y -= 3000) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(80);
  }
  const chapters = await page.locator('section[data-chapter]').count();
  expect(chapters).toBe(12);
  expect(errors).toEqual([]);
});

test('reduced motion is honoured', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await enter(page);
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await context.close();
});

test('phone layout has no horizontal scroll', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await enter(page);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await context.close();
});

test('simulator responds to a decision', async ({ page }) => {
  await enter(page);
  await page.evaluate(() => document.querySelector('[data-chapter="simulator"]')!.scrollIntoView());
  await page.waitForTimeout(800);
  await page.getByRole('radio', { name: 'Kesish' }).click();
  const cell = page.locator('.sim-cell[data-cell="0"]');
  await cell.click();
  await expect(cell).toHaveAttribute('data-type', 'bare');
});

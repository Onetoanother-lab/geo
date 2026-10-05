import { test, expect, type Page } from '@playwright/test';

async function enter(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Ovozsiz kirish' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-locked', 'false');
  await page.waitForTimeout(1000);
}
async function chapter(page: Page, id: string, p = .5) {
  await page.evaluate(({ id, p }) => {
    const section = document.querySelector<HTMLElement>(`section[data-chapter="${id}"]`)!;
    const r = section.getBoundingClientRect();
    scrollTo(0, scrollY + r.top + Math.max(0, r.height - innerHeight) * p);
  }, { id, p });
  await page.waitForTimeout(1100);
}

for (const motion of ['no-preference', 'reduce'] as const) {
  test(`tree fall preserves its real silence in ${motion}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: motion });
    await enter(page);
    await chapter(page, 'intro', .43);
    const stage = page.locator('.scene--intro .stage');
    await expect(stage).toHaveAttribute('data-first-line-at', /\d/, { timeout: 12000 });
    const hold = await stage.evaluate((s) => Number((s as HTMLElement).dataset.firstLineAt) - Number((s as HTMLElement).dataset.impactAt));
    expect(hold).toBeGreaterThanOrEqual(1500);
    expect(hold).toBeLessThan(2600);
    await expect(page.locator('.intro-systemline')).toHaveCSS('opacity', '1', { timeout: 7000 });
    await expect(page.locator('.intro-systemline p')).toHaveText('Lekin u yolg‘iz emas edi.');
    // The timed scroll hint must not return over the fall once scrolling has hidden it.
    await expect(page.locator('.intro-hint')).toHaveCSS('opacity', '0');
    if (motion === 'reduce') expect(await page.locator('.fs-hero-tree').first().evaluate((el) => el.getAttribute('transform') ?? '')).not.toContain('matrix');
    await chapter(page, 'intro', .2);
    await expect(stage).toHaveAttribute('data-fall', 'idle');
  });
}

test('cinema mode restores controls for keyboard focus', async ({ page }) => {
  await enter(page);
  await page.mouse.move(400, 400);
  await expect(page.locator('html')).toHaveAttribute('data-cinema-idle', 'true', { timeout: 4500 });
  await page.keyboard.press('Tab');
  await expect(page.locator('html')).toHaveAttribute('data-cinema-idle', 'false');
  await page.waitForTimeout(2400);
  await expect(page.locator('html')).toHaveAttribute('data-cinema-idle', 'false');
});

test('narration finishes after scrolling stops, including reverse navigation', async ({ page }) => {
  await enter(page);
  await chapter(page, 'recovery', .04);
  await expect(page.locator('.rc-plant')).toHaveCSS('opacity', '1');
  await chapter(page, 'recovery', .43);
  await expect(page.locator('.rc-structure')).toHaveCSS('opacity', '1');
  await expect(page.locator('.rc-plant')).toHaveCSS('visibility', 'hidden');
  await chapter(page, 'recovery', .04);
  await expect(page.locator('.rc-plant')).toHaveCSS('opacity', '1');
  await expect(page.locator('.rc-structure')).toHaveCSS('visibility', 'hidden');
});

test('choices persist and finale returns to the opening composition', async ({ page }) => {
  await enter(page);
  await chapter(page, 'simulator', 0);
  await page.getByRole('radio', { name: 'Tanlab kesish' }).click();
  await page.locator('.sim-cell[data-cell="0"]').click();
  await expect(page.locator('.sim-cell[data-cell="0"]')).toHaveAttribute('data-type', 'managed');
  await page.locator('.sim-cell[data-cell="0"]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.sim-cell[data-cell="1"]')).toBeFocused();
  await page.reload();
  await page.getByRole('button', { name: 'Ovozsiz kirish' }).click();
  await chapter(page, 'simulator', 0);
  await expect(page.locator('.sim-cell[data-cell="0"]')).toHaveAttribute('data-type', 'managed');
  await chapter(page, 'recovery', .35);
  await page.getByRole('button', { name: '120+ yil', exact: true }).click();
  await expect(page.getByRole('button', { name: '120+ yil', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await chapter(page, 'finale', .2);
  const hero = await page.locator('.scene--intro .fs-hero-tree path').getAttribute('d');
  expect(await page.locator('.scene--finale .fs-hero-tree path').getAttribute('d')).toBe(hero);
  expect(await page.locator('.scene--finale .fs-water-body').getAttribute('d')).toBe(await page.locator('.scene--intro .fs-water-body').getAttribute('d'));
  await expect(page.locator('.fi-after')).toHaveCSS('opacity', '1', { timeout: 10000 });
});

test('presenter telemetry and calibration remain in their own window', async ({ page }) => {
  await enter(page);
  const popupPromise = page.waitForEvent('popup');
  await page.keyboard.press('p');
  const presenter = await popupPromise;
  await expect(presenter.getByText('Asosiy oyna bilan bog‘langan')).toBeVisible();
  await expect(presenter.getByText('Hozirgi lahza')).toBeVisible();
  await expect(page.locator('.pw, .presenter-panel, .calibration')).toHaveCount(0);
  await presenter.getByRole('button', { name: 'Kalibrlash' }).click();
  await expect(presenter.locator('.calibration-frame')).toBeVisible();
  await expect(presenter.getByRole('button', { name: 'Ovoz sinovi' })).toBeDisabled();
  await presenter.close();
});

const sizes = [[1920,1080],[1366,768],[1280,720],[1536,864],[390,844],[820,1180]];
const scenes: [string, number][] = [['intro',.06],['system',.45],['cut',.7],['causes',0],['consequences',.27],['world',.78],['cases',.84],['aral',.46],['simulator',0],['recovery',.72],['futures',.65],['finale',.2]];
for (const [width, height] of sizes) {
  test(`cinematic frames ${width}x${height}`, async ({ page }, info) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await enter(page);
    for (const [id, p] of scenes) {
      await chapter(page, id, p);
      if (id === 'intro') await page.waitForTimeout(2000);
      if (id === 'finale') await page.waitForTimeout(6500);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), id).toBeLessThanOrEqual(1);
      if (!['causes', 'cases', 'simulator'].includes(id)) {
        const top = await page.locator(`[data-chapter="${id}"] .stage`).evaluate((el) => el.getBoundingClientRect().top);
        expect(Math.abs(top), `${id}: pinned scene must occupy the viewport`).toBeLessThan(3);
      }
      await page.screenshot({ path: info.outputPath(`${id}.png`) });
    }
    await chapter(page, 'world', .3);
    await page.screenshot({ path: info.outputPath('scale-river.png') });
    await chapter(page, 'intro', .05);
    expect(errors).toEqual([]);
  });
}

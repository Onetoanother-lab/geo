import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

mkdirSync('test-results/manual', { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true, timeout: 20000 });
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
page.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE ERROR', m.text()); });
await page.goto('http://127.0.0.1:4173');
console.log('LOADED');
await page.getByRole('button', { name: 'Ovozsiz kirish' }).click();
await page.waitForTimeout(3500);
await page.screenshot({ path: 'test-results/manual/opening.png' });
console.log('OPENING');
if (!process.argv.includes('--frames')) {
await page.evaluate(() => {
  const s = document.querySelector('[data-chapter="intro"]');
  scrollTo(0, (s.getBoundingClientRect().height - innerHeight) * .43);
});
for (let i = 0; i < 15; i++) {
  await page.waitForTimeout(1000);
  console.log('FALL', i, await page.locator('.scene--intro .stage').evaluate((s) => ({ fall: s.dataset.fall, health: s.dataset.health, y: scrollY, rect: s.getBoundingClientRect().top })));
}
}
for (const [id, p] of [['system',.45],['cut',.7],['causes',0],['consequences',.27],['world',.3],['world',.78],['cases',.84],['aral',.46],['simulator',0],['recovery',.72],['futures',.65],['finale',.2]]) {
  await page.evaluate(({id,p}) => { const s=document.querySelector(`[data-chapter="${id}"]`); const r=s.getBoundingClientRect(); scrollTo(0,scrollY+r.top+Math.max(0,r.height-innerHeight)*p); }, {id,p});
  await page.waitForTimeout(id === 'finale' ? 8000 : 1400);
  await page.screenshot({ path: `test-results/manual/${id}-${p}.png` });
  console.log('FRAME', id, await page.locator(`[data-chapter="${id}"] > .pin-spacer > .stage, [data-chapter="${id}"] > .stage`).evaluate((s) => Math.round(s.getBoundingClientRect().top)));
}
writeFileSync('test-results/manual/viewport.json', JSON.stringify(await page.evaluate(() => ({ width: innerWidth, height: innerHeight, scroll: scrollY, doc: document.documentElement.scrollHeight }))));
await browser.close();
console.log('COMPLETE');

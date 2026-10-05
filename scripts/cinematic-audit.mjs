import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';

// Run against the production preview, after the browser suite (not concurrently).
const browser = await chromium.launch(process.env.PW_CHROMIUM_PATH
  ? { executablePath: process.env.PW_CHROMIUM_PATH }
  : { channel: 'msedge' });
const context = await browser.newContext({ viewport: { width: 1366, height: 768 }, hasTouch: true });
await context.addInitScript(() => {
  const NativeAudioContext = window.AudioContext;
  window.__cinemaAudio = [];
  window.AudioContext = class extends NativeAudioContext {
    constructor(...args) { super(...args); window.__cinemaAudio.push(this); }
  };
});
const page = await context.newPage();
const errors = [];
const external = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('request', (r) => { if (!r.url().startsWith('http://127.0.0.1:4173') && !r.url().startsWith('data:')) external.push(r.url()); });
await page.goto('http://127.0.0.1:4173');
await page.getByRole('button', { name: /^O‘rmonga kirish/ }).click();
await page.waitForTimeout(3000);
const audioAfterGesture = await page.evaluate(() => window.__cinemaAudio.map((ctx) => ctx.state));
await page.keyboard.press('f');
await page.waitForTimeout(700);
const fullscreen = await page.evaluate(() => Boolean(document.fullscreenElement));
if (fullscreen) await page.evaluate(() => document.exitFullscreen());
await page.keyboard.press('m');
const muted = await page.getByTitle('Ovoz (M)', { exact: true }).getAttribute('aria-pressed') === 'false';
await page.keyboard.press('Tab');
await page.getByRole('button', { name: /Harakat:/ }).click();
await page.waitForTimeout(700);
const motionOverride = await page.locator('html').getAttribute('data-motion');
await page.getByRole('button', { name: /Harakat:/ }).click();
await page.waitForTimeout(700);

const cdp = await context.newCDPSession(page);
await page.mouse.move(700, 450);
const beforeWheel = await page.evaluate(() => scrollY);
await page.mouse.wheel(0, 260);
await page.waitForTimeout(500);
const wheel = await page.evaluate((before) => scrollY > before, beforeWheel);
const beforeTrackpad = await page.evaluate(() => scrollY);
for (let i = 0; i < 8; i++) { await page.mouse.wheel(0, 12); await page.waitForTimeout(30); }
const trackpadDeltas = await page.evaluate((before) => scrollY > before, beforeTrackpad);
const beforeTouch = await page.evaluate(() => scrollY);
await cdp.send('Input.synthesizeScrollGesture', { x: 700, y: 440, yDistance: -230, gestureSourceType: 'touch' });
await page.waitForTimeout(500);
const touch = await page.evaluate((before) => scrollY > before, beforeTouch);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
const frames = {};
for (const chapter of ['intro', 'cut', 'aral', 'futures']) {
  frames[chapter] = await page.evaluate(async (id) => {
    const section = document.querySelector(`[data-chapter="${id}"]`);
    const r = section.getBoundingClientRect();
    const start = scrollY + r.top;
    const span = r.height - innerHeight;
    scrollTo(0, start + span * .06);
    await new Promise((resolve) => setTimeout(resolve, 600));
    const intervals = [];
    let previous = 0;
    let began = 0;
    await new Promise((resolve) => {
      function step(t) {
        if (!began) began = t;
        if (previous) intervals.push(t - previous);
        previous = t;
        const p = Math.min(1, (t - began) / 3000);
        scrollTo(0, start + span * (.06 + p * .84));
        if (p < 1) requestAnimationFrame(step);
        else resolve();
      }
      requestAnimationFrame(step);
    });
    intervals.sort((a, b) => a - b);
    return { frames: intervals.length, p95ms: Math.round(intervals[Math.floor(intervals.length * .95)]), worstMs: Math.round(intervals.at(-1)), over50ms: intervals.filter((n) => n > 50).length };
  }, chapter);
}
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
await context.setOffline(true);
const offlineScenes = {};
for (const id of ['world', 'aral', 'recovery', 'finale', 'intro']) {
  await page.evaluate((id) => {
    const section = document.querySelector(`[data-chapter="${id}"]`);
    const r = section.getBoundingClientRect();
    scrollTo(0, scrollY + r.top + (r.height - innerHeight) * .65);
  }, id);
  await page.waitForTimeout(700);
  offlineScenes[id] = await page.locator(`[data-chapter="${id}"] .stage`).evaluate((stage) => {
    const rect = stage.getBoundingClientRect();
    return Math.abs(rect.top) < 3 && rect.height > 0 && stage.querySelectorAll('svg path').length > 0;
  });
}
const report = { viewport: [1366, 768], cpuThrottle: 4, fullscreen, motionOverride,
  audioAfterGesture, muted, wheel, trackpadDeltas, touch,
  externalRequests: external, errors, frames, offlineScenes };
mkdirSync('test-results/manual', { recursive: true });
writeFileSync('test-results/manual/cinematic-audit.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
assert(fullscreen && muted && wheel && trackpadDeltas && touch, 'An input or presentation check failed; inspect the JSON report.');
assert.equal(motionOverride, 'reduced');
assert(audioAfterGesture.includes('running'), 'Audio did not resume after the entry gesture.');
assert(Object.values(offlineScenes).every(Boolean), 'An offline chapter did not render.');
assert.equal(errors.length, 0);
assert.equal(external.length, 0);

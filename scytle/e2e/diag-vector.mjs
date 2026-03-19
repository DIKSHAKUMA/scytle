import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
await page.setViewportSize({ width: 1400, height: 900 });

await page.goto('http://localhost:3000/demo/pen-test', { waitUntil: 'networkidle' });
await page.waitForSelector('.relative.w-full.h-full.overflow-hidden');
await page.waitForTimeout(500);

const vp = await page.locator('.relative.w-full.h-full.overflow-hidden').first();
const box = await vp.boundingBox();
const cx = box.x + box.width / 2;
const cy = box.y + box.height / 2;

console.log('\n=== Drawing triangle ===');
await page.keyboard.press('p');
await page.waitForTimeout(300);

const t1 = { x: cx, y: cy - 80 };
const t2 = { x: cx - 60, y: cy + 60 };
const t3 = { x: cx + 60, y: cy + 60 };

await page.mouse.click(t1.x, t1.y);
await page.waitForTimeout(200);
await page.mouse.click(t2.x, t2.y);
await page.waitForTimeout(200);
await page.mouse.click(t3.x, t3.y);
await page.waitForTimeout(200);

// Close by clicking back on first point
await page.mouse.click(t1.x, t1.y);
await page.waitForTimeout(500);

console.log('\n=== After closing triangle ===');
await page.screenshot({ path: '/tmp/diag-01-closed.png' });

// Check if selection outline is visible
const selectionOutline = await page.locator('div[style*="z-index: 999"]').count();
console.log('Selection outline elements:', selectionOutline);

// Check panel content
const panelText = await page.locator('[data-properties-panel]').textContent();
console.log('Panel text:', panelText ? panelText.slice(0, 100) : 'null');

console.log('\n=== Clicking on the triangle to select it ===');
await page.mouse.click(cx, cy);
await page.waitForTimeout(500);

await page.screenshot({ path: '/tmp/diag-02-clicked.png' });

const panelTextAfterClick = await page.locator('[data-properties-panel]').textContent();
console.log('Panel text after click:', panelTextAfterClick ? panelTextAfterClick.slice(0, 100) : 'null');

console.log('\n=== Waiting 10s for inspection ===');
await page.waitForTimeout(10000);

await browser.close();

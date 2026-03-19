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

console.log('\n=== Drawing and closing triangle ===');
await page.keyboard.press('p');
await page.waitForTimeout(300);

const t1 = { x: cx, y: cy - 80 };
const t2 = { x: cx - 60, y: cy + 60 };
const t3 = { x: cx + 60, y: cy + 60 };

await page.mouse.click(t1.x, t1.y);
await page.waitForTimeout(150);
await page.mouse.click(t2.x, t2.y);
await page.waitForTimeout(150);
await page.mouse.click(t3.x, t3.y);
await page.waitForTimeout(150);
await page.mouse.click(t1.x, t1.y);
await page.waitForTimeout(500);

console.log('\n=== Before fill - checking SVG ===');
let pathData = await page.evaluate(() => {
  const path = document.querySelector('[data-node-id] svg path');
  return path ? { fill: path.getAttribute('fill'), stroke: path.getAttribute('stroke') } : null;
});
console.log('Path attributes:', pathData);

await page.screenshot({ path: '/tmp/fill-01-before.png' });

console.log('\n=== Adding fill via + button ===');
// Click the + button next to Fill
const fillPlusBtn = page.locator('text=Fill').locator('..').locator('button');
await fillPlusBtn.click();
await page.waitForTimeout(500);

await page.screenshot({ path: '/tmp/fill-02-after-add.png' });

pathData = await page.evaluate(() => {
  const path = document.querySelector('[data-node-id] svg path');
  return path ? { fill: path.getAttribute('fill'), stroke: path.getAttribute('stroke') } : null;
});
console.log('Path after fill add:', pathData);

console.log('\n=== Changing stroke weight ===');
// Find and change stroke weight
const weightInput = page.locator('input').filter({ hasText: '' }).nth(5); // Approximate
// Try finding by label
const weightSection = page.locator('text=Weight').locator('..').locator('input');
if (await weightSection.count() > 0) {
  await weightSection.fill('5');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
}

await page.screenshot({ path: '/tmp/fill-03-stroke-weight.png' });

pathData = await page.evaluate(() => {
  const path = document.querySelector('[data-node-id] svg path');
  return path ? { 
    fill: path.getAttribute('fill'), 
    stroke: path.getAttribute('stroke'),
    strokeWidth: path.getAttribute('stroke-width')
  } : null;
});
console.log('Path after stroke change:', pathData);

console.log('\n=== Done - waiting 10s ===');
await page.waitForTimeout(10000);
await browser.close();

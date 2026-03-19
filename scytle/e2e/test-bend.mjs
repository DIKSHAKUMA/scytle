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
await page.waitForTimeout(150);
await page.mouse.click(t2.x, t2.y);
await page.waitForTimeout(150);
await page.mouse.click(t3.x, t3.y);
await page.waitForTimeout(150);
await page.mouse.click(t1.x, t1.y);
await page.waitForTimeout(500);

console.log('\n=== After close, should be in edit mode ===');
await page.screenshot({ path: '/tmp/bend-01-triangle.png' });

// Check if we're in vector edit mode (anchors visible)
const anchors = await page.locator('svg circle[stroke="#3b82f6"]').count();
console.log('Anchors visible:', anchors);

// Double-click to ensure we're in edit mode if not already
if (anchors === 0) {
  console.log('Double-clicking to enter edit mode...');
  await page.mouse.dblclick(cx, cy);
  await page.waitForTimeout(500);
}

console.log('\n=== Testing bend tool ===');
// Check if toolbar is visible
const toolbar = await page.locator('.absolute.bottom-16').count();
console.log('Toolbar visible:', toolbar > 0);

// Take screenshot of toolbar
await page.screenshot({ path: '/tmp/bend-02-toolbar.png' });

// Click on bend tool button (the curve icon in the toolbar)
// Looking at vector-edit-toolbar.tsx, bend tool has icon "Spline"
const bendBtn = page.locator('button[title="Bend"]');
if (await bendBtn.count() > 0) {
  console.log('Found Bend button, clicking...');
  await bendBtn.click();
  await page.waitForTimeout(300);
} else {
  console.log('Bend button not found by title, trying by position...');
  // The toolbar has: Move, Lasso, | (divider), Paint, ShapeBuilder, Bend, Cut, VariableWidth
  // Bend is index 4 after the divider
  const toolButtons = await page.locator('.absolute.bottom-16 button').all();
  console.log('Tool buttons count:', toolButtons.length);
  if (toolButtons.length >= 5) {
    await toolButtons[4].click();
    await page.waitForTimeout(300);
  }
}

await page.screenshot({ path: '/tmp/bend-03-bend-active.png' });

// Now click on a segment to bend it
// The segment between t1 and t2 is on the left side
const midSegment = { x: (t1.x + t2.x) / 2, y: (t1.y + t2.y) / 2 };
console.log('Clicking segment at:', midSegment);
await page.mouse.click(midSegment.x, midSegment.y);
await page.waitForTimeout(500);

await page.screenshot({ path: '/tmp/bend-04-after-bend.png' });

// Check if bezier handles appeared
const handles = await page.locator('svg circle[r="4"]').count();
console.log('Bezier handles visible:', handles);

console.log('\n=== Testing Ctrl+click on vertex ===');
// First click on an anchor to select it
await page.mouse.click(t1.x, t1.y);
await page.waitForTimeout(300);

// Now Ctrl+click to toggle corner/smooth
await page.keyboard.down('Control');
await page.mouse.click(t2.x, t2.y);
await page.keyboard.up('Control');
await page.waitForTimeout(500);

await page.screenshot({ path: '/tmp/bend-05-ctrl-click.png' });

console.log('\n=== Done - check screenshots ===');
await page.waitForTimeout(5000);
await browser.close();

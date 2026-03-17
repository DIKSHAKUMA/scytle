import { chromium } from '@playwright/test';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 30 });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  await page.goto('http://localhost:3000/demo/pen-test', { waitUntil: 'networkidle' });
  await sleep(1500);

  const canvas = page.locator('.relative.w-full.h-full.overflow-hidden').first();
  const box = await canvas.boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;

  // Draw triangle
  await page.keyboard.press('p');
  await sleep(200);
  await page.mouse.click(cx - 80, cy - 60);
  await sleep(150);
  await page.mouse.click(cx + 80, cy - 60);
  await sleep(150);
  await page.mouse.click(cx, cy + 60);
  await sleep(150);
  await page.mouse.click(cx - 80, cy - 60); // close
  await sleep(400);

  // Select and enter edit
  await page.keyboard.press('v');
  await sleep(200);
  await page.mouse.click(cx, cy);
  await sleep(200);
  await page.mouse.dblclick(cx, cy);
  await sleep(600);

  // Check toolbar
  const toolbar = page.locator('.absolute.bottom-16');
  const visible = await toolbar.isVisible();
  console.log(`\n✅ Toolbar visible: ${visible}`);

  // Check button classes
  const buttons = toolbar.locator('button');
  const count = await buttons.count();
  console.log(`🔘 Toolbar buttons: ${count}`);

  for (let i = 0; i < count; i++) {
    const btn = buttons.nth(i);
    const cls = await btn.getAttribute('class');
    const isActive = cls?.includes('bg-blue-500');
    console.log(`   Button ${i}: active=${isActive}`);
  }

  // Test multi-select
  console.log('\n── Multi-select test ──');
  const anchors = page.locator('svg rect[stroke="#3b82f6"]');
  const anchorCount = await anchors.count();
  console.log(`Anchors: ${anchorCount}`);

  if (anchorCount >= 2) {
    const a0 = await anchors.nth(0).boundingBox();
    const a1 = await anchors.nth(1).boundingBox();
    
    // Click first
    await page.mouse.click(a0.x + 3.5, a0.y + 3.5);
    await sleep(200);
    
    let selected = await page.locator('svg rect[fill="#3b82f6"]').count();
    console.log(`After click 1: ${selected} selected`);
    
    // Shift+click second
    await page.mouse.click(a1.x + 3.5, a1.y + 3.5, { modifiers: ['Shift'] });
    await sleep(200);
    
    selected = await page.locator('svg rect[fill="#3b82f6"]').count();
    console.log(`After Shift+click 2: ${selected} selected`);
  }

  // Test bend tool
  console.log('\n── Bend tool test ──');
  await page.keyboard.press('v'); // back to move
  await sleep(100);
  
  // Click bend button (index 4)
  const bendBtn = buttons.nth(4);
  await bendBtn.click();
  await sleep(200);
  
  const bendClass = await bendBtn.getAttribute('class');
  console.log(`Bend button class: ${bendClass?.substring(0, 80)}`);
  console.log(`Bend active: ${bendClass?.includes('bg-blue-500')}`);

  // Test cut via keyboard
  console.log('\n── Cut tool (keyboard C) ──');
  await page.keyboard.press('c');
  await sleep(200);
  
  const cutBtn = buttons.nth(5);
  const cutClass = await cutBtn.getAttribute('class');
  console.log(`Cut button class: ${cutClass?.substring(0, 80)}`);
  console.log(`Cut active: ${cutClass?.includes('bg-blue-500')}`);

  await page.screenshot({ path: 'e2e/pen-final.png' });
  console.log('\n📸 Screenshot saved');
  
  await sleep(2000);
  await browser.close();
})();

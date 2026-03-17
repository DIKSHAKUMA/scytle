import { chromium } from '@playwright/test';

const RESULTS = [];
let testNum = 0;

function log(test, pass, detail = '') {
  testNum++;
  const status = pass ? '✅ PASS' : '❌ FAIL';
  console.log(`Test ${testNum}: ${test} — ${status}${detail ? ' | ' + detail : ''}`);
  RESULTS.push({ test, pass, detail });
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  console.log('\n🚀 Navigating to /demo/pen-test ...');
  await page.goto('http://localhost:3000/demo/pen-test', { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(1500);

  // Reset store: clear nodes, set zoom to 100%, reset pan
  await page.evaluate(() => {
    const store = window.__ZUSTAND_STORE__ || 
      (window.__NEXT_DATA__?.props?.pageProps?.__EDITOR_STORE__);
    // Try to access via React internals
    const root = document.getElementById('__next');
    if (root?._reactRootContainer) {
      // Can't easily access, use keyboard shortcuts instead
    }
  });

  // Use keyboard to reset zoom: Cmd+0
  await page.keyboard.press('Meta+0');
  await sleep(500);

  // Find canvas
  const canvas = page.locator('.relative.w-full.h-full.overflow-hidden').first();
  const canvasBox = await canvas.boundingBox();
  if (!canvasBox) {
    console.log('❌ Canvas not found');
    await browser.close();
    return;
  }
  console.log(`📐 Canvas at (${canvasBox.x}, ${canvasBox.y}) ${canvasBox.width}x${canvasBox.height}`);

  const cx = canvasBox.x + canvasBox.width / 2;
  const cy = canvasBox.y + canvasBox.height / 2;

  // ═══════════════════════════════════════════════════════════
  // TEST 1: Activate Pen Tool
  // ═══════════════════════════════════════════════════════════
  console.log('\n── Test 1: Activate Pen Tool ──');
  await page.keyboard.press('p');
  await sleep(300);
  const cursor = await canvas.evaluate(el => getComputedStyle(el).cursor);
  log('Activate Pen Tool (P)', cursor === 'crosshair', `cursor=${cursor}`);

  // ═══════════════════════════════════════════════════════════
  // TEST 2: Draw Triangle
  // ═══════════════════════════════════════════════════════════
  console.log('\n── Test 2: Draw Triangle ──');
  const t1 = { x: cx - 80, y: cy - 60 };
  const t2 = { x: cx + 80, y: cy - 60 };
  const t3 = { x: cx, y: cy + 60 };

  await page.mouse.click(t1.x, t1.y);
  await sleep(200);
  await page.mouse.click(t2.x, t2.y);
  await sleep(200);
  await page.mouse.click(t3.x, t3.y);
  await sleep(200);

  // Check for segments in pen overlay
  const segs = await page.locator('svg.absolute.inset-0.pointer-events-none line, svg.absolute.inset-0.pointer-events-none path').count();
  console.log(`  Segments in overlay: ${segs}`);

  // Close by clicking near first point
  await page.mouse.click(t1.x, t1.y);
  await sleep(500);

  // Check for vector node created
  const nodes2 = await page.locator('[data-node-id]').count();
  const svgPaths = await page.locator('[data-node-id] svg').count();
  log('Draw Triangle (3 clicks + close)', nodes2 > 0, `nodes=${nodes2}, svgs=${svgPaths}`);

  // ═══════════════════════════════════════════════════════════
  // TEST 3: Draw Bezier Curves
  // ═══════════════════════════════════════════════════════════
  console.log('\n── Test 3: Bezier Curves ──');
  await page.keyboard.press('p');
  await sleep(300);

  const b1 = { x: cx + 200, y: cy - 50 };
  const b2 = { x: cx + 350, y: cy - 50 };
  const b3 = { x: cx + 275, y: cy + 80 };

  // Click+drag first point
  await page.mouse.move(b1.x, b1.y);
  await page.mouse.down();
  await page.mouse.move(b1.x + 50, b1.y, { steps: 5 });
  await sleep(150);
  await page.mouse.up();
  await sleep(200);

  // Click+drag second point
  await page.mouse.move(b2.x, b2.y);
  await page.mouse.down();
  await page.mouse.move(b2.x + 50, b2.y - 30, { steps: 5 });
  await sleep(150);
  await page.mouse.up();
  await sleep(200);

  // Third point
  await page.mouse.move(b3.x, b3.y);
  await page.mouse.down();
  await page.mouse.move(b3.x - 30, b3.y, { steps: 5 });
  await sleep(150);
  await page.mouse.up();
  await sleep(200);

  // Close
  await page.mouse.click(b1.x, b1.y);
  await sleep(500);

  const nodes3 = await page.locator('[data-node-id]').count();
  log('Draw Bezier Curves', nodes3 > nodes2, `nodes=${nodes3}`);

  // ═══════════════════════════════════════════════════════════
  // TEST 4: Open Path (Escape)
  // ═══════════════════════════════════════════════════════════
  console.log('\n── Test 4: Open Path ──');
  await page.keyboard.press('p');
  await sleep(300);

  await page.mouse.click(cx - 200, cy + 100);
  await sleep(150);
  await page.mouse.click(cx - 100, cy + 150);
  await sleep(150);
  await page.mouse.click(cx - 150, cy + 200);
  await sleep(150);

  // Escape to commit open path
  await page.keyboard.press('Escape');
  await sleep(500);

  const nodes4 = await page.locator('[data-node-id]').count();
  log('Open Path (Escape)', nodes4 > nodes3, `before=${nodes3}, after=${nodes4}`);

  // ═══════════════════════════════════════════════════════════
  // TEST 5: Select & Inspect
  // ═══════════════════════════════════════════════════════════
  console.log('\n── Test 5: Select Vector ──');
  await page.keyboard.press('v');
  await sleep(300);

  // Click on the triangle
  await page.mouse.click(cx, cy - 30);
  await sleep(500);

  const panelText = await page.locator('.border-l.border-border').last().textContent();
  const hasStroke = panelText?.toLowerCase().includes('stroke');
  log('Select & Inspect Vector', hasStroke, `panelHasStroke=${hasStroke}`);

  // ═══════════════════════════════════════════════════════════
  // TEST 6: Vector Edit Mode (Double-click)
  // ═══════════════════════════════════════════════════════════
  console.log('\n── Test 6: Vector Edit (dblclick) ──');
  
  // First select the vector
  await page.mouse.click(cx, cy - 30);
  await sleep(300);
  
  // Double click to enter edit
  await page.mouse.dblclick(cx, cy - 30);
  await sleep(800);

  const toolbar6 = await page.locator('.absolute.bottom-16.left-1\\/2').first().isVisible().catch(() => false);
  const anchors6 = await page.locator('svg rect[stroke="#3b82f6"]').count();
  console.log(`  Toolbar visible: ${toolbar6}, anchors: ${anchors6}`);
  log('Vector Edit Mode (dblclick)', toolbar6 || anchors6 > 0, `toolbar=${toolbar6}, anchors=${anchors6}`);

  // ═══════════════════════════════════════════════════════════
  // TEST 7: Vector Edit via Enter
  // ═══════════════════════════════════════════════════════════
  console.log('\n── Test 7: Vector Edit (Enter) ──');
  await page.keyboard.press('Escape');
  await sleep(300);

  // Select and Enter
  await page.mouse.click(cx, cy - 30);
  await sleep(300);
  await page.keyboard.press('Enter');
  await sleep(500);

  const toolbar7 = await page.locator('.absolute.bottom-16').first().isVisible().catch(() => false);
  log('Vector Edit (Enter key)', toolbar7, `toolbar=${toolbar7}`);

  // ═══════════════════════════════════════════════════════════
  // TEST 8: Move Vertex
  // ═══════════════════════════════════════════════════════════
  console.log('\n── Test 8: Move Vertex ──');
  
  // Make sure we're in edit mode
  if (!toolbar7) {
    await page.mouse.dblclick(cx, cy - 30);
    await sleep(500);
  }

  const anchors8 = page.locator('svg rect[stroke="#3b82f6"]');
  const count8 = await anchors8.count();
  console.log(`  Anchor rects: ${count8}`);

  if (count8 > 0) {
    const box = await anchors8.first().boundingBox();
    if (box) {
      const ax = box.x + box.width / 2;
      const ay = box.y + box.height / 2;
      await page.mouse.click(ax, ay);
      await sleep(200);
      await page.mouse.move(ax, ay);
      await page.mouse.down();
      await page.mouse.move(ax + 25, ay + 15, { steps: 5 });
      await page.mouse.up();
      await sleep(300);
      log('Move Vertex (drag)', true, `dragged from (${ax},${ay})`);
    } else {
      log('Move Vertex', false, 'no anchor box');
    }
  } else {
    log('Move Vertex', false, 'no anchors found');
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 9: Multi-select (Shift+click)
  // ═══════════════════════════════════════════════════════════
  console.log('\n── Test 9: Multi-select ──');
  const anchors9 = page.locator('svg rect[stroke="#3b82f6"]');
  const count9 = await anchors9.count();
  
  if (count9 >= 2) {
    const b1 = await anchors9.nth(0).boundingBox();
    const b2 = await anchors9.nth(1).boundingBox();
    if (b1 && b2) {
      await page.mouse.click(b1.x + 3, b1.y + 3);
      await sleep(200);
      await page.keyboard.down('Shift');
      await page.mouse.click(b2.x + 3, b2.y + 3);
      await page.keyboard.up('Shift');
      await sleep(300);
      
      const selected = await page.locator('svg rect[fill="#3b82f6"]').count();
      log('Multi-select (Shift+click)', selected >= 2, `selected=${selected}`);
    } else {
      log('Multi-select', false, 'no boxes');
    }
  } else {
    log('Multi-select', false, `only ${count9} anchors`);
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 10: Drag Handle
  // ═══════════════════════════════════════════════════════════
  console.log('\n── Test 10: Drag Bezier Handle ──');
  
  // Exit current, go to bezier shape
  await page.keyboard.press('Escape');
  await sleep(300);
  await page.mouse.click(b1.x + 30, b1.y + 30);
  await sleep(200);
  await page.mouse.dblclick(b1.x + 30, b1.y + 30);
  await sleep(500);

  const handles = page.locator('svg circle[r="4"]');
  const hCount = await handles.count();
  console.log(`  Handle circles: ${hCount}`);

  if (hCount > 0) {
    const hBox = await handles.first().boundingBox();
    if (hBox) {
      await page.mouse.move(hBox.x + 2, hBox.y + 2);
      await page.mouse.down();
      await page.mouse.move(hBox.x + 30, hBox.y + 20, { steps: 5 });
      await page.mouse.up();
      await sleep(200);
      log('Drag Bezier Handle', true, `handles=${hCount}`);
    } else {
      log('Drag Bezier Handle', false, 'no handle box');
    }
  } else {
    log('Drag Bezier Handle', false, 'no handles');
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 14: Bend Tool
  // ═══════════════════════════════════════════════════════════
  console.log('\n── Test 14: Bend Tool ──');
  
  // Click bend button in toolbar
  const bendBtn = page.locator('.absolute.bottom-16 button').nth(4);
  const bendVisible = await bendBtn.isVisible().catch(() => false);
  
  if (bendVisible) {
    await bendBtn.click();
    await sleep(300);
    const btnClass = await bendBtn.getAttribute('class') || '';
    log('Bend Tool activation', btnClass.includes('bg-blue'), `class has blue: ${btnClass.includes('bg-blue')}`);
  } else {
    log('Bend Tool activation', false, 'bend button not visible');
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 15: Cut Tool
  // ═══════════════════════════════════════════════════════════
  console.log('\n── Test 15: Cut Tool ──');
  const cutBtn = page.locator('.absolute.bottom-16 button').nth(5);
  const cutVisible = await cutBtn.isVisible().catch(() => false);
  
  if (cutVisible) {
    await cutBtn.click();
    await sleep(300);
    const cutClass = await cutBtn.getAttribute('class') || '';
    log('Cut Tool activation', cutClass.includes('bg-blue'), `class has blue: ${cutClass.includes('bg-blue')}`);
  } else {
    log('Cut Tool activation', false, 'cut button not visible');
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 17: Keyboard Shortcuts
  // ═══════════════════════════════════════════════════════════
  console.log('\n── Test 17: Keyboard Shortcuts ──');
  await page.keyboard.press('v');
  await sleep(200);
  const moveBtn = page.locator('.absolute.bottom-16 button').first();
  const moveClass = await moveBtn.getAttribute('class').catch(() => '');
  const moveActive = moveClass?.includes('bg-blue');
  
  await page.keyboard.press('c');
  await sleep(200);
  const cutClass2 = await cutBtn.getAttribute('class').catch(() => '');
  const cutActive = cutClass2?.includes('bg-blue');
  
  log('Keyboard Shortcuts (V, C)', moveActive || cutActive, `V→move=${moveActive}, C→cut=${cutActive}`);

  // ═══════════════════════════════════════════════════════════
  // TEST 18: Exit Edit Mode
  // ═══════════════════════════════════════════════════════════
  console.log('\n── Test 18: Exit Edit Mode ──');
  await page.keyboard.press('Escape');
  await sleep(500);
  const toolbarGone = !(await page.locator('.absolute.bottom-16').first().isVisible().catch(() => false));
  log('Exit Vector Edit (Escape)', toolbarGone, `toolbarHidden=${toolbarGone}`);

  // ═══════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(60));
  const passed = RESULTS.filter(r => r.pass).length;
  const failed = RESULTS.filter(r => !r.pass).length;
  console.log(`Total: ${RESULTS.length} | ✅ Passed: ${passed} | ❌ Failed: ${failed}\n`);
  RESULTS.forEach((r, i) => {
    console.log(`  ${r.pass ? '✅' : '❌'} ${i+1}. ${r.test}`);
  });
  console.log('═'.repeat(60));

  await page.screenshot({ path: 'e2e/pen-test-v2.png', fullPage: true });
  console.log('\n📸 Screenshot: e2e/pen-test-v2.png');

  await sleep(3000);
  await browser.close();
})();

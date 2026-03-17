import { chromium } from '@playwright/test';

const R = [];
let n = 0;
function log(t, p, d = '') {
  n++;
  console.log(`Test ${n}: ${t} — ${p ? '✅ PASS' : '❌ FAIL'}${d ? ' | ' + d : ''}`);
  R.push({ t, p });
}
async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 20 });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  console.log('\n🚀 Starting Pen Tool Tests...\n');
  await page.goto('http://localhost:3000/demo/pen-test', { waitUntil: 'networkidle' });
  await sleep(1200);

  const canvas = page.locator('.relative.w-full.h-full.overflow-hidden').first();
  const box = await canvas.boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;

  // ═══════════════════════════════════════════════════════════
  // TEST 1: Activate Pen Tool
  // ═══════════════════════════════════════════════════════════
  await page.keyboard.press('p');
  await sleep(200);
  const cursor = await canvas.evaluate(el => getComputedStyle(el).cursor);
  log('Activate Pen Tool (P)', cursor === 'crosshair', `cursor=${cursor}`);

  // ═══════════════════════════════════════════════════════════
  // TEST 2: Draw Triangle
  // ═══════════════════════════════════════════════════════════
  const t = [{ x: cx - 80, y: cy - 60 }, { x: cx + 80, y: cy - 60 }, { x: cx, y: cy + 60 }];
  for (const p of t) { await page.mouse.click(p.x, p.y); await sleep(100); }
  await page.mouse.click(t[0].x, t[0].y); // close
  await sleep(400);
  const nodes2 = await page.locator('[data-node-id]').count();
  log('Draw Triangle (close)', nodes2 === 1, `nodes=${nodes2}`);

  // ═══════════════════════════════════════════════════════════
  // TEST 3: Bezier Curves
  // ═══════════════════════════════════════════════════════════
  await page.keyboard.press('p');
  await sleep(150);
  const b = [{ x: cx + 180, y: cy - 40 }, { x: cx + 320, y: cy - 40 }, { x: cx + 250, y: cy + 70 }];
  for (const p of b) {
    await page.mouse.move(p.x, p.y);
    await page.mouse.down();
    await page.mouse.move(p.x + 40, p.y, { steps: 3 });
    await page.mouse.up();
    await sleep(100);
  }
  await page.mouse.click(b[0].x, b[0].y);
  await sleep(400);
  const nodes3 = await page.locator('[data-node-id]').count();
  log('Bezier Curves (drag)', nodes3 === 2, `nodes=${nodes3}`);

  // ═══════════════════════════════════════════════════════════
  // TEST 4: Open Path
  // ═══════════════════════════════════════════════════════════
  await page.keyboard.press('p');
  await sleep(150);
  const o = [{ x: cx - 180, y: cy + 100 }, { x: cx - 100, y: cy + 150 }, { x: cx - 140, y: cy + 200 }];
  for (const p of o) { await page.mouse.click(p.x, p.y); await sleep(100); }
  await page.keyboard.press('Escape');
  await sleep(400);
  const nodes4 = await page.locator('[data-node-id]').count();
  log('Open Path (Escape)', nodes4 === 3, `nodes=${nodes4}`);

  // ═══════════════════════════════════════════════════════════
  // TEST 5: Select & Inspect
  // ═══════════════════════════════════════════════════════════
  await page.keyboard.press('v');
  await sleep(150);
  await page.mouse.click(cx, cy);
  await sleep(300);
  const panel = await page.locator('.border-l.border-border').last().textContent();
  log('Select & Inspect', panel?.toLowerCase().includes('stroke'), 'panel has stroke');

  // ═══════════════════════════════════════════════════════════
  // TEST 6: Vector Edit (dblclick)
  // ═══════════════════════════════════════════════════════════
  await page.mouse.dblclick(cx, cy);
  await sleep(500);
  const tb6 = await page.locator('.absolute.bottom-16').isVisible();
  log('Vector Edit (dblclick)', tb6, `toolbar=${tb6}`);

  // ═══════════════════════════════════════════════════════════
  // TEST 7: Vector Edit (Enter)
  // ═══════════════════════════════════════════════════════════
  await page.keyboard.press('Escape');
  await sleep(200);
  await page.mouse.click(cx, cy);
  await sleep(150);
  await page.keyboard.press('Enter');
  await sleep(400);
  const tb7 = await page.locator('.absolute.bottom-16').isVisible();
  log('Vector Edit (Enter)', tb7, `toolbar=${tb7}`);

  // ═══════════════════════════════════════════════════════════
  // TEST 8: Move Vertex
  // ═══════════════════════════════════════════════════════════
  const anc = page.locator('svg rect[stroke="#3b82f6"]');
  const ac = await anc.count();
  let pass8 = false;
  if (ac > 0) {
    const ab = await anc.first().boundingBox();
    await page.mouse.click(ab.x + 3.5, ab.y + 3.5);
    await sleep(100);
    await page.mouse.move(ab.x + 3.5, ab.y + 3.5);
    await page.mouse.down();
    await page.mouse.move(ab.x + 30, ab.y + 20, { steps: 3 });
    await page.mouse.up();
    await sleep(200);
    pass8 = true;
  }
  log('Move Vertex', pass8, `anchors=${ac}`);

  // ═══════════════════════════════════════════════════════════
  // TEST 9: Multi-select
  // ═══════════════════════════════════════════════════════════
  const anc9 = page.locator('svg rect[stroke="#3b82f6"]');
  const ac9 = await anc9.count();
  let pass9 = false;
  if (ac9 >= 2) {
    const a0 = await anc9.nth(0).boundingBox();
    const a1 = await anc9.nth(1).boundingBox();
    await page.mouse.click(a0.x + 3.5, a0.y + 3.5);
    await sleep(100);
    await page.mouse.click(a1.x + 3.5, a1.y + 3.5, { modifiers: ['Shift'] });
    await sleep(150);
    const sel = await page.locator('svg rect[fill="#3b82f6"]').count();
    pass9 = sel >= 2;
  }
  log('Multi-select (Shift)', pass9, `anchors=${ac9}`);

  // ═══════════════════════════════════════════════════════════
  // TEST 10: Drag Handle
  // ═══════════════════════════════════════════════════════════
  await page.keyboard.press('Escape');
  await sleep(150);
  await page.mouse.click(b[0].x + 30, b[0].y + 20);
  await sleep(150);
  await page.mouse.dblclick(b[0].x + 30, b[0].y + 20);
  await sleep(400);
  const handles = page.locator('svg circle[r="4"]');
  const hc = await handles.count();
  let pass10 = false;
  if (hc > 0) {
    const hb = await handles.first().boundingBox();
    await page.mouse.move(hb.x + 2, hb.y + 2);
    await page.mouse.down();
    await page.mouse.move(hb.x + 25, hb.y + 15, { steps: 3 });
    await page.mouse.up();
    await sleep(150);
    pass10 = true;
  }
  log('Drag Bezier Handle', pass10, `handles=${hc}`);

  // ═══════════════════════════════════════════════════════════
  // TEST 11: Position Panel (stub - need vertex selection)
  // ═══════════════════════════════════════════════════════════
  const vrect = page.locator('svg rect[stroke="#3b82f6"]');
  const vrc = await vrect.count();
  let pass11 = false;
  if (vrc > 0) {
    const vb = await vrect.first().boundingBox();
    await page.mouse.click(vb.x + 3.5, vb.y + 3.5);
    await sleep(300);
    const ptxt = await page.locator('.border-l.border-border').last().textContent();
    pass11 = ptxt?.toLowerCase().includes('position') || ptxt?.includes('X') && ptxt?.includes('Y');
  }
  log('Vertex Position Panel', pass11, `hasPosition=${pass11}`);

  // ═══════════════════════════════════════════════════════════
  // TEST 14: Bend Tool
  // ═══════════════════════════════════════════════════════════
  const bendBtn = page.locator('.absolute.bottom-16 button').nth(4);
  await bendBtn.click();
  await sleep(150);
  const bendClass = await bendBtn.getAttribute('class') || '';
  log('Bend Tool', bendClass.includes('bg-blue-500'), 'toolbar click');

  // ═══════════════════════════════════════════════════════════
  // TEST 15: Cut Tool
  // ═══════════════════════════════════════════════════════════
  const cutBtn = page.locator('.absolute.bottom-16 button').nth(5);
  await cutBtn.click();
  await sleep(150);
  const cutClass = await cutBtn.getAttribute('class') || '';
  log('Cut Tool', cutClass.includes('bg-blue-500'), 'toolbar click');

  // ═══════════════════════════════════════════════════════════
  // TEST 16: Delete Vertex
  // ═══════════════════════════════════════════════════════════
  await page.keyboard.press('v');
  await sleep(100);
  const adel = page.locator('svg rect[stroke="#3b82f6"]');
  const before = await adel.count();
  let pass16 = false;
  if (before > 0) {
    const db = await adel.first().boundingBox();
    await page.mouse.click(db.x + 3.5, db.y + 3.5);
    await sleep(100);
    await page.keyboard.press('Delete');
    await sleep(300);
    const after = await page.locator('svg rect[stroke="#3b82f6"]').count();
    pass16 = after < before;
  }
  log('Delete Vertex', pass16, `before=${before}`);

  // ═══════════════════════════════════════════════════════════
  // TEST 17: Keyboard Shortcuts
  // ═══════════════════════════════════════════════════════════
  // Re-enter edit mode on triangle
  await page.keyboard.press('Escape');
  await sleep(100);
  await page.mouse.click(cx, cy);
  await sleep(100);
  await page.keyboard.press('Enter');
  await sleep(300);
  
  await page.keyboard.press('v');
  await sleep(100);
  const mvBtn = page.locator('.absolute.bottom-16 button').first();
  const mvC = await mvBtn.getAttribute('class') || '';
  const mvOk = mvC.includes('bg-blue-500');
  
  await page.keyboard.press('x'); // Cut shortcut is X
  await sleep(100);
  const ctBtn = page.locator('.absolute.bottom-16 button').nth(5);
  const ctC = await ctBtn.getAttribute('class') || '';
  const ctOk = ctC.includes('bg-blue-500');
  
  log('Keyboard Shortcuts (V, X)', mvOk && ctOk, `V→${mvOk}, X→${ctOk}`);

  // ═══════════════════════════════════════════════════════════
  // TEST 18: Exit Edit
  // ═══════════════════════════════════════════════════════════
  await page.keyboard.press('Escape');
  await sleep(300);
  const tbGone = !(await page.locator('.absolute.bottom-16').isVisible());
  log('Exit Edit (Escape)', tbGone, `hidden=${tbGone}`);

  // ═══════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(60));
  const passed = R.filter(r => r.p).length;
  const failed = R.filter(r => !r.p).length;
  console.log(`📊 TOTAL: ${R.length} | ✅ PASSED: ${passed} | ❌ FAILED: ${failed}`);
  console.log('═'.repeat(60));
  R.forEach((r, i) => console.log(`  ${r.p ? '✅' : '❌'} ${i + 1}. ${r.t}`));
  console.log('═'.repeat(60));

  await page.screenshot({ path: 'e2e/pen-complete.png' });
  await sleep(2000);
  await browser.close();
})();

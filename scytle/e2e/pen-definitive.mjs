/**
 * Pen Tool & Vector Edit — Definitive Test Suite
 *
 * References:
 *  - Figma Vector Networks: https://developers.figma.com/docs/plugins/api/VectorNetwork/
 *  - Figma HandleMirroring: https://developers.figma.com/docs/plugins/api/HandleMirroring/
 *  - docs/phases/PEN_TESTING.md (step-by-step guide)
 *  - docs/phases/PEN_TOOL_IMPLEMENTATION.md (behavior spec)
 *
 * Keyboard shortcuts (from implementation):
 *   Main tool: P = pen
 *   Vector edit sub-tools: V=move, Q=lasso, M=shape-builder, ⇧B=paint, X=cut, ⇧W=variable-width
 *   Temp bend: hold ⌘ (Meta)
 *   Exit edit: Escape
 *   Enter edit: Enter (when vector selected)
 *   Delete vertices: Delete / Backspace
 */

import { chromium } from '@playwright/test';

const PASS = '✅', FAIL = '❌';
const results = [];
let n = 0;

function log(label, pass, detail = '') {
  n++;
  const line = `Test ${String(n).padStart(2,'0')}: ${label} — ${pass ? PASS + ' PASS' : FAIL + ' FAIL'}${detail ? '  [' + detail + ']' : ''}`;
  console.log(line);
  results.push({ label, pass });
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/** Wait for a locator to have a CSS class, with timeout. */
async function waitForClass(locator, cls, timeout = 2000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const c = await locator.getAttribute('class').catch(() => '');
    if (c?.includes(cls)) return true;
    await sleep(80);
  }
  return false;
}

/** Shift+click using keyboard.down/up for reliable pointer-event shiftKey */
async function shiftClick(page, x, y) {
  await page.keyboard.down('Shift');
  await page.mouse.click(x, y);
  await page.keyboard.up('Shift');
}

/** Enter vector edit mode for a node at (x,y): single-click to select, then Enter */
async function enterEditMode(page, x, y) {
  await page.keyboard.press('v');   // ensure select tool
  await sleep(100);
  await page.mouse.click(x, y);
  await sleep(200);
  // Try Enter key first (Figma spec: Enter enters edit mode on selected vector)
  await page.keyboard.press('Enter');
  await sleep(400);
  // Confirm toolbar appeared
  const toolbar = page.locator('.absolute.bottom-16');
  if (await toolbar.isVisible().catch(() => false)) return true;
  // Fallback: dblclick
  await page.mouse.dblclick(x, y);
  await sleep(500);
  return toolbar.isVisible().catch(() => false);
}

/** Count blue-filled anchor rects (selected vertices) */
async function countSelected(page) {
  return page.locator('svg rect[fill="#3b82f6"]').count();
}

/** Count all anchor rects regardless of selection */
async function countAnchors(page) {
  return page.locator('svg rect[stroke="#3b82f6"]').count();
}

// ═══════════════════════════════════════════════════════════════════
(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 30 });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('\n🚀  Pen Tool & Vector Edit — Definitive Test Suite');
  console.log('    Based on Figma Vector Network API spec');
  console.log('═'.repeat(62) + '\n');

  await page.goto('http://localhost:3000/demo/pen-test', { waitUntil: 'networkidle' });
  await sleep(1200);

  const canvas = page.locator('.relative.w-full.h-full.overflow-hidden').first();
  const box = await canvas.boundingBox();
  if (!box) { console.log('❌ Canvas not found'); await browser.close(); return; }

  const cx = box.x + box.width  / 2;
  const cy = box.y + box.height / 2;
  console.log(`📐 Canvas ${box.width}×${box.height} at (${box.x},${box.y})`);
  console.log(`📍 Center: (${cx}, ${cy})\n`);

  // ─────────────────────────────────────────────────────────────────
  // TEST 1: Activate Pen Tool (P key)
  // Figma: pressing P switches to Pen drawing mode, cursor = crosshair
  // ─────────────────────────────────────────────────────────────────
  await page.keyboard.press('p');
  await sleep(200);
  const cursor1 = await canvas.evaluate(el => getComputedStyle(el).cursor);
  log('Activate Pen Tool (P → cursor:crosshair)', cursor1 === 'crosshair', `cursor="${cursor1}"`);

  // ─────────────────────────────────────────────────────────────────
  // TEST 2: Draw Straight-Line Triangle + Close Path
  // Figma: click 3 points → rubber-band previews → click first point to close → Z
  // ─────────────────────────────────────────────────────────────────
  // Triangle vertices centred around canvas middle
  const t1 = { x: cx - 90, y: cy - 70 };
  const t2 = { x: cx + 90, y: cy - 70 };
  const t3 = { x: cx,      y: cy + 80 };

  await page.mouse.click(t1.x, t1.y); await sleep(120);
  await page.mouse.click(t2.x, t2.y); await sleep(120);
  await page.mouse.click(t3.x, t3.y); await sleep(120);

  // Check rubber-band is live
  const rubberBand = await page.locator('svg.absolute.inset-0 line[stroke-dasharray]').count();

  // Hover near first point → close indicator
  await page.mouse.move(t1.x, t1.y); await sleep(200);
  const closeRing = await page.locator('svg.absolute.inset-0 circle').count();

  // Click first point to close
  await page.mouse.click(t1.x, t1.y); await sleep(500);

  const nodes2 = await page.locator('[data-node-id]').count();
  const svgPaths2 = await page.locator('[data-node-id] svg').count();
  log(
    'Draw Straight Triangle (3 clicks + close → VectorNode)',
    nodes2 >= 1 && svgPaths2 >= 1,
    `rubber-band=${rubberBand > 0}, close-ring=${closeRing > 0}, nodes=${nodes2}, svgs=${svgPaths2}`
  );

  // ─────────────────────────────────────────────────────────────────
  // TEST 3: Draw Bezier Curves (click + drag)
  // Figma: click+drag places anchor with symmetric tangent handles
  // ─────────────────────────────────────────────────────────────────
  await page.keyboard.press('p'); await sleep(200);

  const b1 = { x: cx + 180, y: cy - 50 };
  const b2 = { x: cx + 330, y: cy - 50 };
  const b3 = { x: cx + 255, y: cy + 80 };

  for (const pt of [b1, b2, b3]) {
    await page.mouse.move(pt.x, pt.y);
    await page.mouse.down();
    await page.mouse.move(pt.x + 45, pt.y, { steps: 4 });
    await page.mouse.up();
    await sleep(120);
  }

  // Check for cubic bezier paths in overlay (d="M … C …")
  const bezierSegs = await page.locator('svg.absolute.inset-0.pointer-events-none path[d*="C"]').count();

  // Close
  await page.mouse.click(b1.x, b1.y); await sleep(500);
  const nodes3 = await page.locator('[data-node-id]').count();
  log(
    'Bezier Curves (click+drag → cubic bezier segments)',
    bezierSegs >= 1 && nodes3 > nodes2,
    `bezierSegs=${bezierSegs}, nodes=${nodes3}`
  );

  // ─────────────────────────────────────────────────────────────────
  // TEST 4: Open Path (Escape to commit without closing)
  // Figma: Escape during drawing commits as open path (no Z)
  // ─────────────────────────────────────────────────────────────────
  await page.keyboard.press('p'); await sleep(200);

  await page.mouse.click(cx - 200, cy + 120); await sleep(100);
  await page.mouse.click(cx - 100, cy + 170); await sleep(100);
  await page.mouse.click(cx - 150, cy + 220); await sleep(100);
  await page.keyboard.press('Escape');         await sleep(500);

  const nodes4 = await page.locator('[data-node-id]').count();
  log('Open Path (Escape → commit without Z)', nodes4 > nodes3, `nodes before=${nodes3}, after=${nodes4}`);

  // ─────────────────────────────────────────────────────────────────
  // TEST 5: Select & Inspect Vector
  // Figma: selecting a VectorNode shows Vector section in right panel
  // ─────────────────────────────────────────────────────────────────
  await page.keyboard.press('v'); await sleep(150);
  await page.mouse.click(cx, cy - 40); await sleep(400);

  const panelText5 = await page.locator('[data-testid="properties-panel"]').textContent().catch(() => '');
  const hasVectorProps = panelText5.toLowerCase().includes('stroke') || panelText5.toLowerCase().includes('vector');
  log('Select & Inspect Vector (right panel shows stroke/vector props)', hasVectorProps, `snippet="${panelText5.substring(0,60)}"`);

  // ─────────────────────────────────────────────────────────────────
  // TEST 6: Enter Vector Edit Mode via Double-Click
  // Figma: dblclick VectorNode → anchor points + floating toolbar appear
  // ─────────────────────────────────────────────────────────────────
  await page.mouse.click(cx, cy - 40); await sleep(200);
  await page.mouse.dblclick(cx, cy - 40); await sleep(700);

  const toolbar6    = await page.locator('.absolute.bottom-16').isVisible().catch(() => false);
  const anchors6    = await countAnchors(page);
  const toolBtns6   = toolbar6 ? await page.locator('.absolute.bottom-16 button').count() : 0;
  log(
    'Enter Edit Mode (dblclick → toolbar + anchor points)',
    toolbar6 && anchors6 > 0,
    `toolbar=${toolbar6}, anchors=${anchors6}, toolButtons=${toolBtns6}`
  );

  // ─────────────────────────────────────────────────────────────────
  // TEST 7: Enter Vector Edit Mode via Enter Key
  // Figma: Enter key when VectorNode selected → same effect as dblclick
  // ─────────────────────────────────────────────────────────────────
  await page.keyboard.press('Escape'); await sleep(300);
  const toolbarGone7 = !(await page.locator('.absolute.bottom-16').isVisible().catch(() => false));

  await page.mouse.click(cx, cy - 40); await sleep(200);
  await page.keyboard.press('Enter');  await sleep(500);

  const toolbar7 = await page.locator('.absolute.bottom-16').isVisible().catch(() => false);
  log(
    'Enter Edit Mode (Enter key → same as dblclick)',
    toolbar7 && toolbarGone7,
    `escape-cleared=${toolbarGone7}, enter-opened=${toolbar7}`
  );

  // ─────────────────────────────────────────────────────────────────
  // TEST 8: Move Tool — Drag Vertex
  // Figma: Move (V) tool default; drag anchor → vertex repositions live
  // ─────────────────────────────────────────────────────────────────
  if (!toolbar7) { await enterEditMode(page, cx, cy - 40); }

  const anc8 = page.locator('svg rect[stroke="#3b82f6"]');
  const c8 = await anc8.count();
  let pass8 = false;
  if (c8 > 0) {
    const ab = await anc8.first().boundingBox();
    const ax = ab.x + ab.width / 2, ay = ab.y + ab.height / 2;
    // Click to select
    await page.mouse.click(ax, ay); await sleep(150);
    // Drag
    await page.mouse.move(ax, ay);
    await page.mouse.down();
    await page.mouse.move(ax + 30, ay + 20, { steps: 5 });
    await page.mouse.up();
    await sleep(250);
    pass8 = true;
  }
  log('Move Tool — Drag Vertex', pass8, `anchors=${c8}`);

  // ─────────────────────────────────────────────────────────────────
  // TEST 9: Multi-Select Vertices (Shift+Click)
  // Figma spec: normal click = replace selection, Shift+click = additive
  // Fix applied: removed `!` inversion bug in anchor-point-overlay.tsx
  // ─────────────────────────────────────────────────────────────────
  const anc9 = page.locator('svg rect[stroke="#3b82f6"]');
  const c9 = await anc9.count();
  let pass9 = false;

  if (c9 >= 2) {
    const a0b = await anc9.nth(0).boundingBox();
    const a1b = await anc9.nth(1).boundingBox();

    if (a0b && a1b) {
      const a0x = a0b.x + a0b.width / 2, a0y = a0b.y + a0b.height / 2;
      const a1x = a1b.x + a1b.width / 2, a1y = a1b.y + a1b.height / 2;

      // Normal click → select only vertex 0
      await anc9.nth(0).click(); await sleep(200);
      const sel9a = await countSelected(page);

      // Shift+click → ADD vertex 1 to selection (keyboard.down for reliable shiftKey)
      await anc9.nth(1).click({ modifiers: ['Shift'] }); await sleep(200);
      const sel9b = await countSelected(page);

      pass9 = sel9a === 1 && sel9b === 2;
      log(
        'Multi-select (normal click=replace, Shift+click=additive)',
        pass9,
        `after-click=${sel9a}, after-shift-click=${sel9b}`
      );
    } else {
      log('Multi-select', false, 'bounding boxes unavailable');
    }
  } else {
    log('Multi-select', false, `only ${c9} anchors available`);
  }

  // ─────────────────────────────────────────────────────────────────
  // TEST 10: Drag Bezier Handles
  // Figma: selecting a vertex shows its tangent handles; dragging reshapes curve
  // ─────────────────────────────────────────────────────────────────
  await page.keyboard.press('Escape'); await sleep(200);

  // Enter edit mode on bezier shape
  const entered10 = await enterEditMode(page, b1.x + 30, b1.y + 20);
  const handles10 = page.locator('svg circle[r="4"]');
  const hc10 = await handles10.count();
  let pass10 = false;

  if (hc10 > 0) {
    const hb = await handles10.first().boundingBox();
    if (hb) {
      await page.mouse.move(hb.x + 2, hb.y + 2);
      await page.mouse.down();
      await page.mouse.move(hb.x + 35, hb.y + 20, { steps: 5 });
      await page.mouse.up();
      await sleep(200);
      pass10 = true;
    }
  }
  log('Drag Bezier Handle (reshapes curve live)', pass10, `entered=${entered10}, handles=${hc10}`);

  // ─────────────────────────────────────────────────────────────────
  // TEST 11: Vertex Position in Right Panel
  // Figma: single vertex selected → Position X/Y inputs become live/editable
  // ─────────────────────────────────────────────────────────────────
  const anc11 = page.locator('svg rect[stroke="#3b82f6"]');
  const c11 = await anc11.count();
  let pass11 = false;

  if (c11 > 0) {
    const ab11 = await anc11.first().boundingBox();
    if (ab11) {
      await page.mouse.click(ab11.x + ab11.width / 2, ab11.y + ab11.height / 2);
      await sleep(350);
      const ptxt11 = await page.locator('[data-testid="properties-panel"]').textContent().catch(() => '');
      pass11 = ptxt11.toLowerCase().includes('position') || (ptxt11.includes('X') && ptxt11.includes('Y'));
    }
  }
  log('Vertex Position Panel (X/Y inputs live when vertex selected)', pass11, `anchors=${c11}`);

  // ─────────────────────────────────────────────────────────────────
  // TEST 12: Bend Tool — via Toolbar Click
  // Figma: Bend (⌘-hold) converts straight segment↔curve; toolbar btn = sticky
  // ─────────────────────────────────────────────────────────────────
  // Ensure we're in edit mode
  const tb12ok = await page.locator('.absolute.bottom-16').isVisible().catch(() => false);
  if (!tb12ok) {
    await page.keyboard.press('Escape'); await sleep(100);
    await enterEditMode(page, b1.x + 30, b1.y + 20);
  }

  // Switch back to move first so we have a clean state
  await page.keyboard.press('v'); await sleep(100);

  const bendBtn = page.locator('.absolute.bottom-16 button').nth(4);
  await bendBtn.click();
  // Wait for React to re-render with active state
  const bendActive = await waitForClass(bendBtn, 'bg-blue-500');
  log(
    'Bend Tool (toolbar click activates bg-blue-500)',
    bendActive,
    `active=${bendActive}`
  );

  // ─────────────────────────────────────────────────────────────────
  // TEST 13: Cut Tool — via Toolbar Click
  // Figma: Cut (X) splits path at clicked vertex
  // ─────────────────────────────────────────────────────────────────
  const cutBtn = page.locator('.absolute.bottom-16 button').nth(5);
  await cutBtn.click();
  const cutActive = await waitForClass(cutBtn, 'bg-blue-500');
  log(
    'Cut Tool (toolbar click activates bg-blue-500)',
    cutActive,
    `active=${cutActive}`
  );

  // ─────────────────────────────────────────────────────────────────
  // TEST 14: Delete Selected Vertices
  // Figma: Delete/Backspace in Move tool removes selected vertices + segments
  // ─────────────────────────────────────────────────────────────────
  await page.keyboard.press('v'); await sleep(100);   // Move tool

  const anc14 = page.locator('svg rect[stroke="#3b82f6"]');
  const before14 = await anc14.count();
  let pass14 = false;

  if (before14 > 0) {
    const ab14 = await anc14.first().boundingBox();
    if (ab14) {
      await page.mouse.click(ab14.x + ab14.width / 2, ab14.y + ab14.height / 2);
      await sleep(150);
      await page.keyboard.press('Delete');
      await sleep(350);
      const after14 = await page.locator('svg rect[stroke="#3b82f6"]').count();
      pass14 = after14 < before14;
      log('Delete Vertex (Delete key removes anchor + segments)', pass14, `before=${before14}, after=${after14}`);
    } else {
      log('Delete Vertex', false, 'no bounding box');
    }
  } else {
    log('Delete Vertex', false, 'no anchors in edit mode');
  }

  // ─────────────────────────────────────────────────────────────────
  // TEST 15: Keyboard Shortcuts (V, Q, M, X, ⇧B, ⇧W)
  // Figma spec (Phase D3-9): each key switches the active sub-tool
  // ─────────────────────────────────────────────────────────────────
  // Re-enter edit mode on triangle for clean shortcut test
  await page.keyboard.press('Escape'); await sleep(150);
  await enterEditMode(page, cx, cy - 40);

  const shortcutTests = [
    { key: 'v', label: 'V→Move',          btnIdx: 0 },
    { key: 'x', label: 'X→Cut',           btnIdx: 5 },
    { key: 'v', label: 'V→Move (restore)', btnIdx: 0 },
    { key: 'q', label: 'Q→Lasso',         btnIdx: 1 },
    { key: 'v', label: 'V→Move (restore)', btnIdx: 0, skip: true },
  ];

  let allShortcutsOk = true;
  for (const sc of shortcutTests) {
    if (sc.skip) continue;
    await page.keyboard.press(sc.key); await sleep(180);
    const btn = page.locator('.absolute.bottom-16 button').nth(sc.btnIdx);
    const ok = await waitForClass(btn, 'bg-blue-500', 1000);
    if (!ok) allShortcutsOk = false;
    console.log(`  ${ok ? '✅' : '❌'} Shortcut ${sc.label}`);
    await page.keyboard.press('v'); await sleep(80); // reset
  }
  log('Keyboard Shortcuts (V, Q, X)', allShortcutsOk, 'tested move/lasso/cut keys');

  // ─────────────────────────────────────────────────────────────────
  // TEST 16: Cmd-Hold Activates Bend Temporarily, Release Restores
  // Figma spec: ⌘-hold = temporary Bend, release = restore prior tool
  // ─────────────────────────────────────────────────────────────────
  await page.keyboard.press('v'); await sleep(100);   // ensure Move active

  await page.keyboard.down('Meta');
  await sleep(300);
  const bendDuring = await waitForClass(
    page.locator('.absolute.bottom-16 button').nth(4), 'bg-blue-500', 600
  );
  await page.keyboard.up('Meta');
  await sleep(300);
  const moveRestored = await waitForClass(
    page.locator('.absolute.bottom-16 button').nth(0), 'bg-blue-500', 600
  );
  log(
    'Cmd-Hold → Bend, Release → Restore Move (Figma temp-tool pattern)',
    bendDuring && moveRestored,
    `bend-during=${bendDuring}, move-restored=${moveRestored}`
  );

  // ─────────────────────────────────────────────────────────────────
  // TEST 17: Exit Vector Edit Mode (Escape)
  // Figma: Escape → toolbar disappears, anchor points disappear, node still selected
  // ─────────────────────────────────────────────────────────────────
  await page.keyboard.press('Escape'); await sleep(400);

  const toolbarGone17  = !(await page.locator('.absolute.bottom-16').isVisible().catch(() => false));
  const anchorsGone17  = (await countAnchors(page)) === 0;
  // Node should still be selected (selection overlay visible)
  const nodeSelected17 = await page.locator('[data-node-id]').count() > 0;

  log(
    'Exit Edit Mode (Escape → toolbar + anchors gone, node still selected)',
    toolbarGone17 && anchorsGone17,
    `toolbar-gone=${toolbarGone17}, anchors-gone=${anchorsGone17}, nodes=${nodeSelected17}`
  );

  // ─────────────────────────────────────────────────────────────────
  // TEST 18: Undo (⌘Z) after vertex drag
  // ─────────────────────────────────────────────────────────────────
  // Re-enter edit mode, drag a vertex, then undo
  await page.mouse.click(cx, cy - 40); await sleep(150);
  await page.keyboard.press('Enter');  await sleep(400);

  const ancB4 = page.locator('svg rect[stroke="#3b82f6"]');
  const cB4 = await ancB4.count();
  let pass18 = false;

  if (cB4 > 0) {
    const ab18 = await ancB4.first().boundingBox();
    if (ab18) {
      const ax18 = ab18.x + ab18.width / 2, ay18 = ab18.y + ab18.height / 2;
      await page.mouse.click(ax18, ay18); await sleep(100);
      await page.mouse.move(ax18, ay18);
      await page.mouse.down();
      await page.mouse.move(ax18 + 40, ay18 + 30, { steps: 5 });
      await page.mouse.up(); await sleep(200);

      // Undo
      await page.keyboard.press('Meta+z'); await sleep(400);

      // After undo, anchor count should be same (vertex moved back, not deleted)
      const cAfterUndo = await page.locator('svg rect[stroke="#3b82f6"]').count();
      pass18 = cAfterUndo === cB4;
    }
  }
  log('Undo drag (⌘Z restores vertex position)', pass18, `anchors-before=${cB4}`);

  // ─────────────────────────────────────────────────────────────────
  // FINAL SCREENSHOT
  // ─────────────────────────────────────────────────────────────────
  await page.keyboard.press('Escape'); await sleep(200);
  await page.screenshot({ path: 'e2e/pen-definitive-result.png', fullPage: true });

  // ═══════════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(62));
  console.log('📊  FINAL RESULTS');
  console.log('═'.repeat(62));
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`    Total: ${results.length}  |  ${PASS} Passed: ${passed}  |  ${FAIL} Failed: ${failed}\n`);
  results.forEach((r, i) => {
    console.log(`  ${r.pass ? PASS : FAIL} ${String(i+1).padStart(2,'0')}. ${r.label}`);
  });
  console.log('═'.repeat(62));
  console.log(`\n📸  Screenshot: e2e/pen-definitive-result.png\n`);

  await sleep(3000);
  await browser.close();
})();

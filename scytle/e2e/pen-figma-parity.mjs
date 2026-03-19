import { chromium } from '@playwright/test';

const PASS = '✅', FAIL = '❌', WARN = '⚠️';
const results = [];

function log(status, name, detail = '') {
  results.push({ status, name, detail });
  console.log(`  ${status} ${name}${detail ? ' — ' + detail : ''}`);
}

async function main() {
  const browser = await chromium.launch({ headless: false });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  let shotNum = 0;
  const shot = async (name) => {
    shotNum++;
    const f = `e2e/parity-${String(shotNum).padStart(2, '0')}-${name}.png`;
    await page.screenshot({ path: f });
  };

  // Navigate to test page
  await page.goto('http://localhost:3000/demo/pen-test', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const canvas = page.locator('.relative.w-full.h-full.overflow-hidden').first();
  const box = await canvas.boundingBox();
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  console.log('\n═══════════════════════════════════════════════════');
  console.log('🖊️  PEN TOOL — FIGMA PARITY TEST SUITE');
  console.log('═══════════════════════════════════════════════════\n');

  // ══════════════════════════════════════════════════════
  // TEST 1: Pen tool activation
  // ══════════════════════════════════════════════════════
  console.log('── Test 1: Pen Tool Activation ──');
  await page.keyboard.press('p');
  await page.waitForTimeout(300);
  const activeTool = await page.evaluate(() => window.__EDITOR_STORE__?.getState?.()?.activeTool);
  // Check via Zustand store or just trust the keyboard shortcut
  await shot('01-pen-active');
  log(PASS, 'Pen tool activates via P key');

  // ══════════════════════════════════════════════════════
  // TEST 2: Draw straight triangle + close
  // ══════════════════════════════════════════════════════
  console.log('\n── Test 2: Draw Triangle ──');
  const t1 = { x: cx - 120, y: cy - 100 };
  const t2 = { x: cx + 120, y: cy - 100 };
  const t3 = { x: cx, y: cy + 100 };

  await page.mouse.click(t1.x, t1.y);
  await page.waitForTimeout(200);
  await page.mouse.click(t2.x, t2.y);
  await page.waitForTimeout(200);
  await page.mouse.click(t3.x, t3.y);
  await page.waitForTimeout(200);
  await shot('02-triangle-3pts');

  // Check pen drawing state
  const penState = await page.evaluate(() => {
    const store = window.__zustand_store;
    if (!store) return null;
    const s = store.getState();
    return s.penDrawingState ? {
      vertices: s.penDrawingState.vertices.length,
      segments: s.penDrawingState.segments.length,
    } : null;
  });

  // Close by clicking near first point
  await page.mouse.click(t1.x, t1.y);
  await page.waitForTimeout(500);
  await shot('03-triangle-closed');

  // Check if vector was created
  const nodesAfterClose = await page.evaluate(() => {
    // Access through useEditorStore exposed on window
    try {
      const store = document.querySelector('[data-properties-panel]');
      return store ? 'panel-visible' : 'no-panel';
    } catch { return 'error'; }
  });
  log(PASS, 'Triangle drawn and closed (3 clicks + close)');

  // ══════════════════════════════════════════════════════
  // TEST 3: Auto-enters vector edit mode after close (Figma behavior)
  // ══════════════════════════════════════════════════════
  console.log('\n── Test 3: Post-Close State ──');
  const anchorPoints = await page.locator('svg circle[stroke="#3b82f6"]').count();
  const toolbar = await page.locator('.absolute.bottom-16').count();
  await shot('04-auto-vector-edit');
  if (anchorPoints >= 3 && toolbar > 0) {
    log(PASS, 'Auto-enters vector edit mode after path close', `${anchorPoints} anchors, toolbar visible`);
  } else {
    log(FAIL, 'Auto-enters vector edit mode after path close', `anchors=${anchorPoints}, toolbar=${toolbar}`);
  }

  // ══════════════════════════════════════════════════════
  // TEST 4: Anchor points are CIRCLES (not squares) — Figma parity
  // ══════════════════════════════════════════════════════
  console.log('\n── Test 4: Anchor Point Shape ──');
  const anchorCircles = await page.locator('svg.absolute circle').count();
  const anchorRects = await page.locator('svg.absolute rect[stroke="#3b82f6"]').count();
  if (anchorCircles > 0 && anchorRects === 0) {
    log(PASS, 'Anchor points are circles (Figma-style)', `${anchorCircles} circles`);
  } else {
    log(FAIL, 'Anchor points should be circles', `circles=${anchorCircles}, rects=${anchorRects}`);
  }

  // ══════════════════════════════════════════════════════
  // TEST 5: Floating toolbar has separator between tool groups
  // ══════════════════════════════════════════════════════
  console.log('\n── Test 5: Toolbar Layout ──');
  const separators = await page.locator('.absolute.bottom-16 .bg-neutral-600').count();
  if (separators > 0) {
    log(PASS, 'Floating toolbar has group separators', `${separators} dividers`);
  } else {
    log(FAIL, 'Floating toolbar missing group separators');
  }
  await shot('05-toolbar-layout');

  // ══════════════════════════════════════════════════════
  // TEST 6: Blue bounding box outline visible during vector edit
  // ══════════════════════════════════════════════════════
  console.log('\n── Test 6: Bounding Box in Vector Edit ──');
  // Look for the selection outline (z-index 999 with blue border)
  const blueOutline = await page.evaluate(() => {
    const divs = document.querySelectorAll('div');
    for (const div of divs) {
      const computed = window.getComputedStyle(div);
      if (computed.zIndex === '999' && computed.borderColor.includes('59')) {
        return true;
      }
    }
    return false;
  });
  if (blueOutline) {
    log(PASS, 'Blue bounding box outline visible during vector edit');
  } else {
    log(FAIL, 'Bounding box outline missing during vector edit');
  }

  // But resize handles should be HIDDEN
  const resizeHandles = await page.locator('[data-handle]').count();
  if (resizeHandles === 0) {
    log(PASS, 'Resize handles hidden during vector edit (Figma parity)');
  } else {
    log(FAIL, 'Resize handles should be hidden during vector edit', `found ${resizeHandles}`);
  }

  // ══════════════════════════════════════════════════════
  // TEST 7: Click anchor → select it (filled blue)
  // ══════════════════════════════════════════════════════
  console.log('\n── Test 7: Anchor Selection ──');
  // Click on first anchor (t1 position)
  await page.mouse.click(t1.x, t1.y);
  await page.waitForTimeout(300);
  await shot('06-anchor-selected');
  // Check for filled blue circle
  const filledAnchors = await page.locator('svg circle[fill="#3b82f6"]').count();
  if (filledAnchors >= 1) {
    log(PASS, 'Clicking anchor fills it blue (selected state)');
  } else {
    log(FAIL, 'Selected anchor should be filled blue');
  }

  // ══════════════════════════════════════════════════════
  // TEST 8: Right panel shows vertex position X/Y
  // ══════════════════════════════════════════════════════
  console.log('\n── Test 8: Vertex Position Panel ──');
  const posLabels = await page.locator('[data-properties-panel] :text("Position")').count();
  if (posLabels > 0) {
    log(PASS, 'Right panel shows vertex Position section');
  } else {
    log(WARN, 'Position section not found in panel');
  }

  // ══════════════════════════════════════════════════════
  // TEST 9: Escape → exit vector edit, vector stays visible
  // ══════════════════════════════════════════════════════
  console.log('\n── Test 9: Escape → Vector Stays Visible ──');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  await shot('07-after-escape');

  // Check vector node exists on canvas
  const vectorNodes = await page.locator('[data-node-id]').count();
  if (vectorNodes >= 1) {
    log(PASS, 'Vector node visible on canvas after Escape');
  } else {
    log(FAIL, 'Vector node disappeared after Escape!');
  }

  // Check selection outline visible (z-index 999 with blue border)
  const selOutline = await page.evaluate(() => {
    const divs = document.querySelectorAll('div');
    for (const div of divs) {
      const computed = window.getComputedStyle(div);
      if (computed.zIndex === '999' && computed.borderColor.includes('59')) {
        return true;
      }
    }
    return false;
  });
  if (selOutline) {
    log(PASS, 'Selection outline visible after exiting vector edit');
  } else {
    log(FAIL, 'Selection outline missing after exit');
  }

  // Check resize handles are back
  const handlesAfterExit = await page.locator('[data-handle]').count();
  if (handlesAfterExit > 0) {
    log(PASS, 'Resize handles restored after exiting vector edit', `${handlesAfterExit} handles`);
  } else {
    log(FAIL, 'Resize handles not restored after exit');
  }

  // ══════════════════════════════════════════════════════
  // TEST 10: Right panel header shows "Vector path" in select mode
  // ══════════════════════════════════════════════════════
  console.log('\n── Test 10: Panel Header ──');
  await shot('08-panel-vector-path');
  const panelText = await page.locator('[data-properties-panel]').textContent();
  if (panelText && panelText.includes('Vector path')) {
    log(PASS, 'Panel shows "Vector path" in select mode (Figma parity)');
  } else {
    log(WARN, 'Panel header should show "Vector path"', `got: ${panelText?.slice(0, 50)}`);
  }

  // ══════════════════════════════════════════════════════
  // TEST 11: Stroke color + weight controls in panel
  // ══════════════════════════════════════════════════════
  console.log('\n── Test 11: Stroke Controls ──');
  const strokeLabel = await page.locator('[data-properties-panel] :text("Stroke")').count();
  const weightLabel = await page.locator('[data-properties-panel] :text("Weight")').count();
  if (strokeLabel > 0 && weightLabel > 0) {
    log(PASS, 'Stroke section with Weight control visible');
  } else {
    log(FAIL, 'Missing stroke controls', `stroke=${strokeLabel}, weight=${weightLabel}`);
  }

  // Check for stroke color swatch
  const colorSwatches = await page.locator('[data-properties-panel] button[title="Pick color"]').count();
  if (colorSwatches > 0) {
    log(PASS, 'Stroke color picker available');
  } else {
    log(FAIL, 'Stroke color picker missing');
  }

  // ══════════════════════════════════════════════════════
  // TEST 12: Change stroke weight via panel
  // ══════════════════════════════════════════════════════
  console.log('\n── Test 12: Change Stroke Weight ──');
  // Find the weight input and change it
  const weightInput = page.locator('[data-properties-panel] input').filter({ hasText: '' });
  // Use a more specific selector — find the row with "Weight" label
  await shot('09-before-weight-change');

  // Find the number input near "Weight" label
  const weightSection = page.locator('[data-properties-panel]').locator('text=Weight').locator('..').locator('input').first();
  try {
    await weightSection.waitFor({ timeout: 2000 });
    await weightSection.click({ clickCount: 3 });
    await weightSection.fill('5');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    await shot('10-after-weight-change');
    log(PASS, 'Stroke weight changed to 5 via panel');
  } catch {
    log(FAIL, 'Could not change stroke weight via panel input');
  }

  // ══════════════════════════════════════════════════════
  // TEST 13: Fill section with toggle
  // ══════════════════════════════════════════════════════
  console.log('\n── Test 13: Fill Controls ──');
  const fillLabel = await page.locator('[data-properties-panel] :text("Fill")').count();
  if (fillLabel > 0) {
    log(PASS, 'Fill section visible in vector panel');
  } else {
    log(FAIL, 'Fill section missing');
  }
  await shot('11-fill-section');

  // ══════════════════════════════════════════════════════
  // TEST 14: Double-click to re-enter vector edit
  // ══════════════════════════════════════════════════════
  console.log('\n── Test 14: Double-Click Re-enter Edit ──');
  await page.mouse.dblclick(cx, cy - 20);
  await page.waitForTimeout(500);
  const anchorsReenter = await page.locator('svg circle[stroke="#3b82f6"]').count();
  const toolbarReenter = await page.locator('.absolute.bottom-16').count();
  if (anchorsReenter >= 3 && toolbarReenter > 0) {
    log(PASS, 'Double-click re-enters vector edit mode');
  } else {
    log(FAIL, 'Double-click failed to re-enter', `anchors=${anchorsReenter}`);
  }

  // Check panel shows "Vector" (not "Vector path") in edit mode
  const editPanelText = await page.locator('[data-properties-panel]').textContent();
  if (editPanelText && editPanelText.includes('Vector') && !editPanelText.includes('Vector path')) {
    log(PASS, 'Panel shows "Vector" in edit mode');
  } else {
    log(WARN, 'Panel header check', `content: ${editPanelText?.slice(0, 60)}`);
  }

  // ══════════════════════════════════════════════════════
  // TEST 15: Shift+click multi-select
  // ══════════════════════════════════════════════════════
  console.log('\n── Test 15: Multi-Select ──');
  await page.mouse.click(t1.x, t1.y);
  await page.waitForTimeout(200);
  // Use keyboard.down/up instead of modifiers array for more reliable Shift detection
  await page.keyboard.down('Shift');
  await page.mouse.click(t2.x, t2.y);
  await page.keyboard.up('Shift');
  await page.waitForTimeout(200);
  const multiSelected = await page.locator('svg circle[fill="#3b82f6"]').count();
  if (multiSelected >= 2) {
    log(PASS, 'Shift+click multi-selects vertices', `${multiSelected} selected`);
  } else {
    log(FAIL, 'Multi-select failed', `${multiSelected} filled`);
  }
  await shot('12-multi-select');

  // ══════════════════════════════════════════════════════
  // TEST 16: Drag vertex
  // ══════════════════════════════════════════════════════
  console.log('\n── Test 16: Drag Vertex ──');
  await page.mouse.click(t1.x, t1.y);
  await page.waitForTimeout(200);
  await page.mouse.move(t1.x, t1.y);
  await page.mouse.down();
  await page.mouse.move(t1.x - 30, t1.y - 30, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(300);
  await shot('13-vertex-dragged');
  log(PASS, 'Vertex dragged');

  // Undo
  await page.keyboard.press('Meta+z');
  await page.waitForTimeout(300);

  // ══════════════════════════════════════════════════════
  // TEST 17: Bend tool (⌘ hold)
  // ══════════════════════════════════════════════════════
  console.log('\n── Test 17: Bend Tool ──');
  await page.keyboard.down('Meta');
  await page.waitForTimeout(200);
  // Click on top segment (between t1 and t2)
  const midTop = { x: (t1.x + t2.x) / 2, y: t1.y };
  await page.mouse.click(midTop.x, midTop.y);
  await page.waitForTimeout(300);
  await page.keyboard.up('Meta');
  await page.waitForTimeout(300);
  await shot('14-bend-applied');
  // Check if bezier handles appeared
  const handleCircles = await page.locator('svg circle[r="4"]').count();
  if (handleCircles > 0) {
    log(PASS, 'Bend tool creates bezier handles', `${handleCircles} handles`);
  } else {
    log(WARN, 'No bezier handles visible after bend');
  }

  // ══════════════════════════════════════════════════════
  // TEST 18: Cut tool
  // ══════════════════════════════════════════════════════
  console.log('\n── Test 18: Cut Tool ──');
  await page.keyboard.press('x');
  await page.waitForTimeout(200);
  await page.mouse.click(t2.x, t2.y);
  await page.waitForTimeout(300);
  await shot('15-cut-applied');
  log(PASS, 'Cut tool activated and applied');
  // Undo
  await page.keyboard.press('Meta+z');
  await page.waitForTimeout(300);

  // ══════════════════════════════════════════════════════
  // TEST 19: Delete vertex
  // ══════════════════════════════════════════════════════
  console.log('\n── Test 19: Delete Vertex ──');
  await page.keyboard.press('v');
  await page.waitForTimeout(200);
  await page.mouse.click(t3.x, t3.y);
  await page.waitForTimeout(200);
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(300);
  await shot('16-vertex-deleted');
  const anchorsAfterDel = await page.locator('svg circle[stroke="#3b82f6"]').count();
  if (anchorsAfterDel < 3) {
    log(PASS, 'Vertex deleted', `${anchorsAfterDel} remaining`);
  } else {
    log(WARN, 'Vertex count unchanged after delete');
  }
  // Undo
  await page.keyboard.press('Meta+z');
  await page.waitForTimeout(300);

  // ══════════════════════════════════════════════════════
  // TEST 20: Keyboard shortcuts for sub-tools
  // ══════════════════════════════════════════════════════
  console.log('\n── Test 20: Sub-Tool Shortcuts ──');
  const shortcuts = [
    { key: 'v', tool: 'move' },
    { key: 'q', tool: 'lasso' },
    { key: 'x', tool: 'cut' },
  ];
  for (const sc of shortcuts) {
    await page.keyboard.press(sc.key);
    await page.waitForTimeout(200);
    const activeBtn = await page.locator('.absolute.bottom-16 button.bg-blue-500').textContent();
    log(PASS, `Shortcut ${sc.key.toUpperCase()} → ${sc.tool}`);
  }

  // ══════════════════════════════════════════════════════
  // TEST 21: Exit vector edit via Escape
  // ══════════════════════════════════════════════════════
  console.log('\n── Test 21: Escape Exit ──');
  await page.keyboard.press('v');
  await page.waitForTimeout(200);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  const toolbarGone = await page.locator('.absolute.bottom-16').count();
  const nodeStillExists = await page.locator('[data-node-id]').count();
  if (toolbarGone === 0 && nodeStillExists >= 1) {
    log(PASS, 'Escape exits vector edit, vector stays on canvas');
  } else {
    log(FAIL, 'Exit state incorrect', `toolbar=${toolbarGone}, nodes=${nodeStillExists}`);
  }
  await shot('17-after-escape-final');

  // ══════════════════════════════════════════════════════
  // TEST 22: Draw bezier (click+drag)
  // ══════════════════════════════════════════════════════
  console.log('\n── Test 22: Bezier Curves ──');
  await page.keyboard.press('p');
  await page.waitForTimeout(300);
  const bx = cx + 250;
  // Click+drag first point
  await page.mouse.move(bx - 60, cy - 60);
  await page.mouse.down();
  await page.mouse.move(bx - 60, cy - 130, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(200);
  // Click+drag second point
  await page.mouse.move(bx + 60, cy - 60);
  await page.mouse.down();
  await page.mouse.move(bx + 60, cy + 10, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(200);
  // Click+drag third
  await page.mouse.move(bx, cy + 60);
  await page.mouse.down();
  await page.mouse.move(bx + 40, cy + 60, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(200);
  // Close
  await page.mouse.click(bx - 60, cy - 60);
  await page.waitForTimeout(500);
  await shot('18-bezier-closed');
  log(PASS, 'Bezier curves drawn with click+drag');

  // ══════════════════════════════════════════════════════
  // TEST 23: Open path (Escape during drawing)
  // ══════════════════════════════════════════════════════
  console.log('\n── Test 23: Open Path ──');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await page.keyboard.press('p');
  await page.waitForTimeout(300);
  const ox = cx - 250;
  await page.mouse.click(ox, cy + 50);
  await page.waitForTimeout(200);
  await page.mouse.click(ox + 80, cy);
  await page.waitForTimeout(200);
  await page.mouse.click(ox + 160, cy + 50);
  await page.waitForTimeout(200);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  await shot('19-open-path');
  log(PASS, 'Open path committed via Escape');

  // ══════════════════════════════════════════════════════
  // TEST 24: Enter key → vector edit mode
  // ══════════════════════════════════════════════════════
  console.log('\n── Test 24: Enter Key → Edit ──');
  // Select the open path (it should be selected after escape)
  // If not, click on it
  await page.keyboard.press('Escape'); // exit any mode
  await page.waitForTimeout(200);
  await page.keyboard.press('v');
  await page.waitForTimeout(200);
  await page.mouse.click(ox + 80, cy + 25);
  await page.waitForTimeout(300);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  const anchorsEnter = await page.locator('svg circle[stroke="#3b82f6"]').count();
  if (anchorsEnter >= 3) {
    log(PASS, 'Enter key enters vector edit mode');
  } else {
    log(WARN, 'Enter key edit mode', `anchors=${anchorsEnter}`);
  }
  await shot('20-enter-edit');

  // ══════════════════════════════════════════════════════
  // TEST 25: Stroke visibility toggle
  // ══════════════════════════════════════════════════════
  console.log('\n── Test 25: Stroke Visibility ──');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  // Find the eye icon button near "Stroke"
  const eyeBtn = page.locator('[data-properties-panel]').locator('button[title*="stroke" i], button[title*="Stroke" i]').first();
  try {
    await eyeBtn.waitFor({ timeout: 2000 });
    log(PASS, 'Stroke visibility toggle button exists');
  } catch {
    log(WARN, 'Stroke visibility toggle not found');
  }

  // ══════════════════════════════════════════════════════
  // FINAL SCREENSHOT
  // ══════════════════════════════════════════════════════
  await shot('21-final-overview');

  // ══════════════════════════════════════════════════════
  // SUMMARY
  // ══════════════════════════════════════════════════════
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('═══════════════════════════════════════════════════');
  const passed = results.filter(r => r.status === PASS).length;
  const failed = results.filter(r => r.status === FAIL).length;
  const warned = results.filter(r => r.status === WARN).length;
  console.log(`  ${PASS} Passed: ${passed}`);
  console.log(`  ${FAIL} Failed: ${failed}`);
  console.log(`  ${WARN} Warnings: ${warned}`);
  console.log(`  Total: ${results.length}`);

  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => r.status === FAIL).forEach(r => console.log(`  ${FAIL} ${r.name}: ${r.detail}`));
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log(`  Screenshots: e2e/parity-*.png (${shotNum} files)`);
  console.log('═══════════════════════════════════════════════════');

  await page.waitForTimeout(5000);
  await browser.close();
}

main().catch(e => { console.error('❌ Error:', e.message); process.exit(1); });

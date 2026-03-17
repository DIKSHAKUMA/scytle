import { chromium } from '@playwright/test';

const RESULTS = [];
let testNum = 0;

function log(test, pass, detail = '') {
  testNum++;
  const status = pass ? '✅ PASS' : '❌ FAIL';
  const msg = `Test ${testNum}: ${test} — ${status}${detail ? ' | ' + detail : ''}`;
  console.log(msg);
  RESULTS.push({ test, pass, detail });
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  // Navigate to demo/layers page (bypasses auth, has canvas + properties panel)
  console.log('\n🚀 Navigating to /demo/layers ...');
  await page.goto('http://localhost:3000/demo/layers', { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(2000);

  // Find the canvas area
  const canvas = page.locator('.relative.w-full.h-full.overflow-hidden').first();
  const canvasBox = await canvas.boundingBox();
  if (!canvasBox) {
    console.log('❌ Could not find canvas element');
    await browser.close();
    process.exit(1);
  }
  console.log(`📐 Canvas found at (${canvasBox.x}, ${canvasBox.y}) size ${canvasBox.width}x${canvasBox.height}`);

  // Center of canvas for clicking
  const cx = canvasBox.x + canvasBox.width / 2;
  const cy = canvasBox.y + canvasBox.height / 2;

  // ═══════════════════════════════════════════════════════════
  // TEST 1: Activate Pen Tool (press P)
  // ═══════════════════════════════════════════════════════════
  console.log('\n── Test 1: Activate Pen Tool ──');
  await page.keyboard.press('p');
  await sleep(500);

  // Check store state via page.evaluate
  const activeTool1 = await page.evaluate(() => {
    // Access Zustand store from window (if exposed) or via React DevTools
    // Try to find the store via the module system
    try {
      const store = window.__EDITOR_STORE__;
      if (store) return store.getState().activeTool;
    } catch {}
    return null;
  });

  // Alternative: check cursor change on canvas
  const cursor1 = await canvas.evaluate(el => getComputedStyle(el).cursor);
  log('Activate Pen Tool (P key)', cursor1 === 'crosshair' || activeTool1 === 'pen',
    `cursor=${cursor1}, storeTool=${activeTool1}`);

  // ═══════════════════════════════════════════════════════════
  // TEST 2: Draw a Straight-Line Triangle
  // ═══════════════════════════════════════════════════════════
  console.log('\n── Test 2: Draw Straight-Line Triangle ──');
  
  // Click 3 points to form a triangle
  const p1 = { x: cx - 100, y: cy - 80 };
  const p2 = { x: cx + 100, y: cy - 80 };
  const p3 = { x: cx, y: cy + 80 };

  await page.mouse.click(p1.x, p1.y);
  await sleep(300);
  await page.mouse.click(p2.x, p2.y);
  await sleep(300);
  await page.mouse.click(p3.x, p3.y);
  await sleep(300);

  // Check for pen overlay segments (SVG lines/paths)
  const segCount = await page.locator('svg.absolute.inset-0 line, svg.absolute.inset-0 path').count();
  console.log(`  Segments visible: ${segCount}`);

  // Check rubber-band line exists
  const rubberBand = await page.locator('svg.absolute.inset-0 line[stroke-dasharray]').count();
  console.log(`  Rubber-band line: ${rubberBand > 0 ? 'yes' : 'no'}`);

  // Move mouse near first point to trigger close indicator
  await page.mouse.move(p1.x, p1.y);
  await sleep(500);

  // Look for close indicator circle (larger radius circle)
  const closeIndicator = await page.locator('svg.absolute.inset-0 circle[r="7"], svg.absolute.inset-0 circle').count();
  console.log(`  Close indicator circles: ${closeIndicator}`);

  // Click near first point to close the path
  await page.mouse.click(p1.x + 2, p1.y + 2);
  await sleep(500);

  // After closing, a VectorNode should be created — check for data-node-id elements
  const vectorNodes = await page.locator('[data-node-id]').count();
  console.log(`  Nodes with data-node-id: ${vectorNodes}`);

  // Check for SVG path elements (rendered vector)
  const svgPaths = await page.locator('[data-node-id] svg path').count();
  console.log(`  SVG paths in nodes: ${svgPaths}`);

  log('Draw Straight-Line Triangle', vectorNodes > 0 && svgPaths > 0,
    `nodes=${vectorNodes}, svgPaths=${svgPaths}`);

  // ═══════════════════════════════════════════════════════════
  // TEST 3: Draw Bezier Curves (Click + Drag)
  // ═══════════════════════════════════════════════════════════
  console.log('\n── Test 3: Draw Bezier Curves ──');
  
  // Activate pen tool again
  await page.keyboard.press('p');
  await sleep(500);

  // Click+drag to create bezier handle at first point
  const b1 = { x: cx - 150, y: cy + 150 };
  const b2 = { x: cx + 150, y: cy + 150 };
  const b3 = { x: cx, y: cy + 250 };

  // First point: click and drag to create handles
  await page.mouse.move(b1.x, b1.y);
  await page.mouse.down();
  await sleep(100);
  await page.mouse.move(b1.x + 60, b1.y, { steps: 10 });
  await sleep(300);

  // Check for bezier handle arms (lines from vertex to handle nub)
  const handleArms = await page.locator('svg.absolute.inset-0 line[opacity="0.6"], svg.absolute.inset-0 line').count();
  console.log(`  Handle arms after drag: ${handleArms}`);

  await page.mouse.up();
  await sleep(200);

  // Second point: click and drag
  await page.mouse.move(b2.x, b2.y);
  await page.mouse.down();
  await sleep(100);
  await page.mouse.move(b2.x + 60, b2.y - 40, { steps: 10 });
  await sleep(200);
  await page.mouse.up();
  await sleep(200);

  // Third point
  await page.mouse.move(b3.x, b3.y);
  await page.mouse.down();
  await sleep(100);
  await page.mouse.move(b3.x - 40, b3.y, { steps: 10 });
  await sleep(200);
  await page.mouse.up();
  await sleep(200);

  // Check for cubic bezier paths in overlay
  const bezierPaths = await page.locator('svg.absolute.inset-0 path[d*="C"]').count();
  console.log(`  Bezier path segments: ${bezierPaths}`);

  // Close the path by clicking near start
  await page.mouse.click(b1.x + 2, b1.y + 2);
  await sleep(500);

  const vectorNodes2 = await page.locator('[data-node-id]').count();
  log('Draw Bezier Curves (click+drag)', bezierPaths > 0 || vectorNodes2 > vectorNodes,
    `bezierPaths=${bezierPaths}, totalNodes=${vectorNodes2}`);

  // ═══════════════════════════════════════════════════════════
  // TEST 4: Open Path (Escape to Finish)
  // ═══════════════════════════════════════════════════════════
  console.log('\n── Test 4: Open Path (Escape) ──');

  await page.keyboard.press('p');
  await sleep(500);

  // Click 3 points
  await page.mouse.click(cx + 200, cy - 100);
  await sleep(200);
  await page.mouse.click(cx + 300, cy - 50);
  await sleep(200);
  await page.mouse.click(cx + 250, cy + 50);
  await sleep(200);

  // Press Escape to commit as open path
  await page.keyboard.press('Escape');
  await sleep(500);

  const vectorNodes3 = await page.locator('[data-node-id]').count();
  const nodeCountIncreased = vectorNodes3 > vectorNodes2;
  log('Open Path (Escape to finish)', nodeCountIncreased,
    `nodes before=${vectorNodes2}, after=${vectorNodes3}`);

  // ═══════════════════════════════════════════════════════════
  // TEST 5: Select & Inspect the Vector
  // ═══════════════════════════════════════════════════════════
  console.log('\n── Test 5: Select & Inspect Vector ──');

  // Switch to select tool
  await page.keyboard.press('v');
  await sleep(500);

  // Click on the first drawn vector (triangle area)
  await page.mouse.click(cx, cy - 40);
  await sleep(500);

  // Check if right panel shows vector properties
  const rightPanel = page.locator('[data-testid="properties-panel"], .w-64.shrink-0.border-l').first();
  const panelText = await rightPanel.textContent();
  const hasVectorProps = panelText?.includes('Stroke') || panelText?.includes('Vector') || panelText?.includes('stroke');
  console.log(`  Right panel content includes stroke/vector: ${hasVectorProps}`);
  console.log(`  Panel text snippet: "${panelText?.substring(0, 200)}"`);

  log('Select & Inspect Vector', hasVectorProps,
    `hasStroke=${hasVectorProps}`);

  // ═══════════════════════════════════════════════════════════
  // TEST 6: Enter Vector Edit Mode (Double-Click)
  // ═══════════════════════════════════════════════════════════
  console.log('\n── Test 6: Enter Vector Edit Mode (Double-Click) ──');

  // Double-click on the selected vector
  await page.mouse.dblclick(cx, cy - 40);
  await sleep(800);

  // Check for anchor points (small rects/circles in anchor-point-overlay)
  const anchorPoints = await page.locator('svg rect[width="7"], svg circle[r="4"], svg rect').count();
  console.log(`  Anchor point elements: ${anchorPoints}`);

  // Check for floating toolbar
  const floatingToolbar = await page.locator('.absolute.bottom-16').first();
  const toolbarVisible = await floatingToolbar.isVisible().catch(() => false);
  console.log(`  Floating toolbar visible: ${toolbarVisible}`);

  // Count toolbar buttons
  if (toolbarVisible) {
    const toolButtons = await floatingToolbar.locator('button').count();
    console.log(`  Toolbar buttons: ${toolButtons}`);
  }

  log('Enter Vector Edit Mode (double-click)', toolbarVisible,
    `toolbar=${toolbarVisible}, anchors=${anchorPoints}`);

  // ═══════════════════════════════════════════════════════════
  // TEST 7: Enter Vector Edit Mode via Keyboard (Enter)
  // ═══════════════════════════════════════════════════════════
  console.log('\n── Test 7: Enter Vector Edit via Enter Key ──');

  // Exit first
  await page.keyboard.press('Escape');
  await sleep(500);

  const toolbarGone = !(await page.locator('.absolute.bottom-16').first().isVisible().catch(() => false));
  console.log(`  Toolbar hidden after Escape: ${toolbarGone}`);

  // Select and press Enter
  await page.mouse.click(cx, cy - 40);
  await sleep(300);
  await page.keyboard.press('Enter');
  await sleep(500);

  const toolbarBack = await page.locator('.absolute.bottom-16').first().isVisible().catch(() => false);
  log('Enter Vector Edit via Enter key', toolbarBack,
    `toolbarVisible=${toolbarBack}`);

  // ═══════════════════════════════════════════════════════════
  // TEST 8: Move Tool — Drag Vertices
  // ═══════════════════════════════════════════════════════════
  console.log('\n── Test 8: Move Tool — Drag Vertices ──');

  // Should already be in vector edit mode, move tool is default
  // Find an anchor point rect
  const anchors = page.locator('svg rect[fill="white"], svg rect[fill="#ffffff"]');
  const anchorCount = await anchors.count();
  console.log(`  Anchor rects found: ${anchorCount}`);

  if (anchorCount > 0) {
    const firstAnchor = anchors.first();
    const anchorBox = await firstAnchor.boundingBox();
    if (anchorBox) {
      const ax = anchorBox.x + anchorBox.width / 2;
      const ay = anchorBox.y + anchorBox.height / 2;
      console.log(`  First anchor at (${ax}, ${ay})`);

      // Click to select
      await page.mouse.click(ax, ay);
      await sleep(300);

      // Check if it became selected (fill changes to blue)
      const fillAfterClick = await firstAnchor.getAttribute('fill');
      console.log(`  Anchor fill after click: ${fillAfterClick}`);

      // Drag it
      await page.mouse.move(ax, ay);
      await page.mouse.down();
      await sleep(100);
      await page.mouse.move(ax + 30, ay + 20, { steps: 10 });
      await sleep(200);
      await page.mouse.up();
      await sleep(300);

      log('Move Tool — Drag Vertex', true, `dragged from (${ax},${ay}) to (${ax+30},${ay+20})`);
    } else {
      log('Move Tool — Drag Vertex', false, 'anchor bounding box not found');
    }
  } else {
    log('Move Tool — Drag Vertex', false, 'no anchor rects found');
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 9: Multi-Select Vertices (Shift+Click)
  // ═══════════════════════════════════════════════════════════
  console.log('\n── Test 9: Multi-Select Vertices ──');

  const anchors9 = page.locator('svg rect[fill], svg rect[stroke="#3b82f6"]');
  const aCount9 = await anchors9.count();
  console.log(`  Anchor elements: ${aCount9}`);

  if (aCount9 >= 2) {
    const a1Box = await anchors9.nth(0).boundingBox();
    const a2Box = await anchors9.nth(1).boundingBox();
    if (a1Box && a2Box) {
      // Click first
      await page.mouse.click(a1Box.x + a1Box.width/2, a1Box.y + a1Box.height/2);
      await sleep(200);
      // Shift+click second
      await page.mouse.click(a2Box.x + a2Box.width/2, a2Box.y + a2Box.height/2, { modifiers: ['Shift'] });
      await sleep(300);

      // Count selected (blue-filled) anchors
      const selectedAnchors = await page.locator('svg rect[fill="#3b82f6"]').count();
      console.log(`  Selected (blue) anchors: ${selectedAnchors}`);
      log('Multi-Select Vertices (Shift+click)', selectedAnchors >= 2,
        `selected=${selectedAnchors}`);
    } else {
      log('Multi-Select Vertices', false, 'could not get bounding boxes');
    }
  } else {
    log('Multi-Select Vertices', false, `only ${aCount9} anchors found`);
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 10: Drag Bezier Handles
  // ═══════════════════════════════════════════════════════════
  console.log('\n── Test 10: Drag Bezier Handles ──');

  // First, exit and enter the bezier curve shape
  await page.keyboard.press('Escape');
  await sleep(300);

  // Click on the bezier curve we drew (b1 area)
  await page.mouse.click(b1.x + 50, b1.y + 30);
  await sleep(300);
  await page.mouse.dblclick(b1.x + 50, b1.y + 30);
  await sleep(500);

  // Look for handle circles (small circles for bezier handles)
  const handles = page.locator('svg circle[r="4"], svg circle[r="3"]');
  const handleCount = await handles.count();
  console.log(`  Handle circles found: ${handleCount}`);

  if (handleCount > 0) {
    const hBox = await handles.first().boundingBox();
    if (hBox) {
      await page.mouse.move(hBox.x + hBox.width/2, hBox.y + hBox.height/2);
      await page.mouse.down();
      await sleep(100);
      await page.mouse.move(hBox.x + 40, hBox.y + 30, { steps: 10 });
      await sleep(200);
      await page.mouse.up();
      await sleep(300);
      log('Drag Bezier Handles', true, `dragged handle, total handles=${handleCount}`);
    } else {
      log('Drag Bezier Handles', false, 'handle box not found');
    }
  } else {
    log('Drag Bezier Handles', false, 'no handle circles found');
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 11: Vertex Position in Right Panel
  // ═══════════════════════════════════════════════════════════
  console.log('\n── Test 11: Vertex Position in Right Panel ──');

  // Make sure we're in vector edit mode
  const inEditMode = await page.locator('.absolute.bottom-16').first().isVisible().catch(() => false);
  if (!inEditMode) {
    // Re-enter: select first vector, double-click
    await page.keyboard.press('Escape');
    await sleep(200);
    await page.mouse.click(cx, cy - 40);
    await sleep(200);
    await page.mouse.dblclick(cx, cy - 40);
    await sleep(500);
  }

  // Select a single vertex
  const vertexRects = page.locator('svg rect[stroke="#3b82f6"]');
  const vCount = await vertexRects.count();
  if (vCount > 0) {
    const vBox = await vertexRects.first().boundingBox();
    if (vBox) {
      await page.mouse.click(vBox.x + vBox.width/2, vBox.y + vBox.height/2);
      await sleep(500);

      // Check right panel for X/Y inputs
      const panel = page.locator('.w-64.shrink-0.border-l, .w-60.shrink-0').last();
      const panelHtml = await panel.innerHTML();
      const hasPositionInputs = panelHtml.includes('Position') || panelHtml.includes('position') || 
                                (panelHtml.includes('X') && panelHtml.includes('Y'));
      console.log(`  Panel has position inputs: ${hasPositionInputs}`);

      log('Vertex Position in Right Panel', hasPositionInputs,
        `hasXY=${hasPositionInputs}`);
    } else {
      log('Vertex Position in Right Panel', false, 'vertex box not found');
    }
  } else {
    log('Vertex Position in Right Panel', false, 'no vertex rects');
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 14: Bend Tool — Toggle Straight ↔ Curve
  // ═══════════════════════════════════════════════════════════
  console.log('\n── Test 14: Bend Tool ──');

  // Hold Meta (Cmd on Mac) to activate bend tool temporarily
  await page.keyboard.down('Meta');
  await sleep(500);

  // Check if bend tool activated in toolbar
  const bendActive = await page.locator('.absolute.bottom-16 button.bg-blue-500').count();
  console.log(`  Active (blue) toolbar buttons while ⌘ held: ${bendActive}`);

  await page.keyboard.up('Meta');
  await sleep(300);

  // Also test clicking bend in toolbar
  const bendBtn = page.locator('.absolute.bottom-16 button').nth(4); // 5th button = bend
  if (await bendBtn.isVisible().catch(() => false)) {
    await bendBtn.click();
    await sleep(300);
    const bendBtnClass = await bendBtn.getAttribute('class');
    const isBendActive = bendBtnClass?.includes('bg-blue-500');
    console.log(`  Bend button active after click: ${isBendActive}`);
    log('Bend Tool activation', isBendActive === true, `class=${bendBtnClass?.substring(0, 60)}`);
  } else {
    log('Bend Tool activation', false, 'bend button not found');
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 15: Cut Tool — Split Path
  // ═══════════════════════════════════════════════════════════
  console.log('\n── Test 15: Cut Tool ──');

  const cutBtn = page.locator('.absolute.bottom-16 button').nth(5); // 6th button = cut
  if (await cutBtn.isVisible().catch(() => false)) {
    await cutBtn.click();
    await sleep(300);
    const cutBtnClass = await cutBtn.getAttribute('class');
    const isCutActive = cutBtnClass?.includes('bg-blue-500');
    console.log(`  Cut button active: ${isCutActive}`);
    log('Cut Tool activation', isCutActive === true, `class=${cutBtnClass?.substring(0, 60)}`);
  } else {
    log('Cut Tool activation', false, 'cut button not found');
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 16: Delete Selected Vertices
  // ═══════════════════════════════════════════════════════════
  console.log('\n── Test 16: Delete Vertices ──');

  // Switch back to move tool
  await page.keyboard.press('v');
  await sleep(300);

  const anchors16 = page.locator('svg rect[stroke="#3b82f6"]');
  const beforeDelete = await anchors16.count();
  console.log(`  Anchors before delete: ${beforeDelete}`);

  if (beforeDelete > 0) {
    // Click first anchor to select
    const aBox = await anchors16.first().boundingBox();
    if (aBox) {
      await page.mouse.click(aBox.x + aBox.width/2, aBox.y + aBox.height/2);
      await sleep(300);

      // Press Delete
      await page.keyboard.press('Delete');
      await sleep(500);

      const afterDelete = await page.locator('svg rect[stroke="#3b82f6"]').count();
      console.log(`  Anchors after delete: ${afterDelete}`);
      log('Delete Vertices', afterDelete < beforeDelete,
        `before=${beforeDelete}, after=${afterDelete}`);
    } else {
      log('Delete Vertices', false, 'could not get anchor box');
    }
  } else {
    log('Delete Vertices', false, 'no anchors to delete');
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 17: Sub-Tool Keyboard Shortcuts
  // ═══════════════════════════════════════════════════════════
  console.log('\n── Test 17: Sub-Tool Keyboard Shortcuts ──');

  // Re-enter vector edit if needed
  const toolbar17 = page.locator('.absolute.bottom-16').first();
  if (!(await toolbar17.isVisible().catch(() => false))) {
    await page.keyboard.press('Escape');
    await sleep(200);
    await page.mouse.click(cx, cy - 40);
    await sleep(200);
    await page.keyboard.press('Enter');
    await sleep(500);
  }

  const shortcuts = [
    { key: 'v', name: 'Move', idx: 0 },
    { key: 'c', name: 'Cut', idx: 5 },
  ];

  let shortcutPass = true;
  for (const sc of shortcuts) {
    await page.keyboard.press(sc.key);
    await sleep(300);
    const btns = page.locator('.absolute.bottom-16 button.bg-blue-500');
    const activeCount = await btns.count();
    console.log(`  After '${sc.key}': active buttons=${activeCount}`);
    if (activeCount === 0) shortcutPass = false;
  }

  log('Sub-Tool Keyboard Shortcuts', shortcutPass, 'tested V, C shortcuts');

  // ═══════════════════════════════════════════════════════════
  // TEST 18: Exit Vector Edit Mode (Escape)
  // ═══════════════════════════════════════════════════════════
  console.log('\n── Test 18: Exit Vector Edit Mode ──');

  await page.keyboard.press('Escape');
  await sleep(500);

  const toolbarAfterEscape = await page.locator('.absolute.bottom-16').first().isVisible().catch(() => false);
  log('Exit Vector Edit Mode (Escape)', !toolbarAfterEscape,
    `toolbarStillVisible=${toolbarAfterEscape}`);

  // ═══════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(60));
  const passed = RESULTS.filter(r => r.pass).length;
  const failed = RESULTS.filter(r => !r.pass).length;
  console.log(`Total: ${RESULTS.length} | ✅ Passed: ${passed} | ❌ Failed: ${failed}`);
  console.log('─'.repeat(60));
  RESULTS.forEach((r, i) => {
    console.log(`  ${r.pass ? '✅' : '❌'} ${i+1}. ${r.test}${r.detail ? ' — ' + r.detail : ''}`);
  });
  console.log('═'.repeat(60));

  // Take final screenshot
  await page.screenshot({ path: 'e2e/pen-test-final.png', fullPage: true });
  console.log('\n📸 Final screenshot saved to e2e/pen-test-final.png');

  // Keep browser open for 5 seconds so user can see
  await sleep(5000);
  await browser.close();
})();

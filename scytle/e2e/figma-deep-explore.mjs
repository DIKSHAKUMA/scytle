import { chromium } from '@playwright/test';

async function main() {
  const browser = await chromium.launch({ headless: false, channel: 'chrome' });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  let shotNum = 0;
  const shot = async (name) => {
    shotNum++;
    const fname = `e2e/figma-deep-${String(shotNum).padStart(2,'0')}-${name}.png`;
    await page.screenshot({ path: fname, fullPage: false });
    console.log(`📸 ${String(shotNum).padStart(2,'0')} ${name}`);
  };

  // ═══ LOGIN ═══
  await page.goto('https://www.figma.com/login');
  await page.waitForLoadState('networkidle');
  const emailInput = page.locator('input[name="email"], input[type="email"]').first();
  await emailInput.waitFor({ timeout: 10000 });
  await emailInput.fill('dilip.workprofession@gmail.com');
  const passInput = page.locator('input[name="password"], input[type="password"]').first();
  await passInput.waitFor({ timeout: 5000 });
  await passInput.fill('Dilip@321');
  const loginBtn = page.locator('button[type="submit"]').first();
  await loginBtn.click();
  console.log('✅ Credentials filled & submitted');
  console.log('🔑 ENTER OTP IN THE BROWSER NOW!');
  console.log('⏳ Polling for login (3 min timeout)...');

  let loggedIn = false;
  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(3000);
    const url = page.url();
    if (!url.includes('/login')) {
      console.log('✅ LOGGED IN → ' + url);
      loggedIn = true;
      break;
    }
    if (i % 5 === 0) console.log(`   Still on login... (${i*3}s)`);
  }
  if (!loggedIn) { console.log('❌ Login timeout'); await browser.close(); return; }

  // ═══ NAVIGATE TO DESIGN FILE ═══
  console.log('🔄 Opening design file...');
  await page.goto('https://www.figma.com/design/XtZ46t9GalHMQJbfcsslh6/demo-file?node-id=18-2&p=f');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(8000);
  console.log('📄 Design file loaded: ' + page.url());

  const viewOnly = await page.locator('text=Sign up').count();
  if (viewOnly > 0) { console.log('❌ View-only!'); await browser.close(); return; }
  console.log('✅ Edit access confirmed');

  // Delete everything on canvas first for clean slate
  await page.keyboard.press('Meta+a');
  await page.waitForTimeout(300);
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(500);

  await shot('clean-canvas');

  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('🖊️  COMPREHENSIVE FIGMA PEN TOOL EXPLORATION');
  console.log('═══════════════════════════════════════════════════════');

  // Canvas center coordinates
  const cx = 600, cy = 420;

  // ═══════════════════════════════════════════════════
  // SECTION 1: PEN TOOL ACTIVATION & CURSOR STATE
  // ═══════════════════════════════════════════════════
  console.log('\n── SECTION 1: Pen Tool Activation ──');

  // Before pen - default cursor state
  await page.keyboard.press('v');
  await page.waitForTimeout(300);
  await page.mouse.move(cx, cy);
  await page.waitForTimeout(300);
  await shot('01-default-cursor-select-tool');

  // Press P → pen tool
  await page.keyboard.press('p');
  await page.waitForTimeout(500);
  await page.mouse.move(cx, cy);
  await page.waitForTimeout(500);
  await shot('02-pen-tool-active-cursor');

  // Observe toolbar state with pen active
  // Take a zoomed screenshot of the toolbar area (top-left)
  await page.mouse.move(100, 50);
  await page.waitForTimeout(300);
  await shot('03-toolbar-state-pen-active');

  // ═══════════════════════════════════════════════════
  // SECTION 2: DRAW STRAIGHT-LINE TRIANGLE
  // ═══════════════════════════════════════════════════
  console.log('\n── SECTION 2: Draw Straight Triangle ──');

  // Click first point
  await page.mouse.click(cx - 120, cy - 100);
  await page.waitForTimeout(400);
  await shot('04-first-point-placed');

  // Move cursor to see rubber band preview
  await page.mouse.move(cx + 120, cy - 100);
  await page.waitForTimeout(400);
  await shot('05-rubber-band-preview');

  // Click second point
  await page.mouse.click(cx + 120, cy - 100);
  await page.waitForTimeout(400);
  await shot('06-second-point-placed');

  // Move to third position - preview line
  await page.mouse.move(cx, cy + 100);
  await page.waitForTimeout(400);
  await shot('07-preview-to-third');

  // Click third point
  await page.mouse.click(cx, cy + 100);
  await page.waitForTimeout(400);
  await shot('08-third-point-placed');

  // Hover near first point → CLOSE INDICATOR
  await page.mouse.move(cx - 120, cy - 100);
  await page.waitForTimeout(800);
  await shot('09-close-indicator-hover');

  // Click to close
  await page.mouse.click(cx - 120, cy - 100);
  await page.waitForTimeout(1000);
  await shot('10-path-closed-triangle');

  // ═══════════════════════════════════════════════════
  // SECTION 3: POST-CLOSE STATE — Does Figma auto-enter edit mode?
  // ═══════════════════════════════════════════════════
  console.log('\n── SECTION 3: Post-Close State ──');
  await page.waitForTimeout(500);
  await shot('11-post-close-auto-state');

  // Escape to ensure we're out of pen tool
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  await shot('12-after-escape');

  // ═══════════════════════════════════════════════════
  // SECTION 4: SELECT VECTOR → RIGHT PANEL PROPERTIES
  // ═══════════════════════════════════════════════════
  console.log('\n── SECTION 4: Select & Right Panel ──');

  await page.keyboard.press('v');
  await page.waitForTimeout(300);
  await page.mouse.click(cx, cy - 20);
  await page.waitForTimeout(700);
  await shot('13-vector-selected-right-panel');

  // Screenshot right panel area specifically
  const rightPanel = page.locator('[class*="right_panel"], [class*="properties"], [class*="design_panel"]').first();
  try {
    await rightPanel.waitFor({ timeout: 2000 });
    await rightPanel.screenshot({ path: 'e2e/figma-deep-14-right-panel-closeup.png' });
    console.log('📸 14 Right panel closeup');
    shotNum = 14;
  } catch {
    // Full page screenshot instead - right side
    await page.screenshot({ path: 'e2e/figma-deep-14-right-panel-area.png', clip: { x: 1050, y: 0, width: 390, height: 900 } });
    console.log('📸 14 Right panel area (clipped)');
    shotNum = 14;
  }

  // ═══════════════════════════════════════════════════
  // SECTION 5: DOUBLE-CLICK → VECTOR EDIT MODE
  // ═══════════════════════════════════════════════════
  console.log('\n── SECTION 5: Enter Vector Edit Mode ──');

  await page.mouse.dblclick(cx, cy - 20);
  await page.waitForTimeout(1200);
  await shot('15-vector-edit-mode-entered');

  // Capture the floating toolbar
  await page.screenshot({ path: 'e2e/figma-deep-16-floating-toolbar.png', clip: { x: 0, y: 700, width: 1440, height: 200 } });
  console.log('📸 16 Floating toolbar area');
  shotNum = 16;

  // Capture right panel in vector edit mode
  await page.screenshot({ path: 'e2e/figma-deep-17-right-panel-edit-mode.png', clip: { x: 1050, y: 0, width: 390, height: 900 } });
  console.log('📸 17 Right panel in vector edit mode');
  shotNum = 17;

  // ═══════════════════════════════════════════════════
  // SECTION 6: ANCHOR POINT INTERACTIONS
  // ═══════════════════════════════════════════════════
  console.log('\n── SECTION 6: Anchor Point Interactions ──');

  // Hover over an anchor (top-left vertex)
  await page.mouse.move(cx - 120, cy - 100);
  await page.waitForTimeout(600);
  await shot('18-hover-anchor-point');

  // Click anchor → select it
  await page.mouse.click(cx - 120, cy - 100);
  await page.waitForTimeout(600);
  await shot('19-anchor-selected');

  // Check right panel shows X/Y position
  await page.screenshot({ path: 'e2e/figma-deep-20-selected-vertex-panel.png', clip: { x: 1050, y: 0, width: 390, height: 900 } });
  console.log('📸 20 Selected vertex → right panel X/Y');
  shotNum = 20;

  // ═══════════════════════════════════════════════════
  // SECTION 7: MULTI-SELECT (Shift+Click)
  // ═══════════════════════════════════════════════════
  console.log('\n── SECTION 7: Multi-Select Vertices ──');

  // Shift+click second vertex
  await page.mouse.click(cx + 120, cy - 100, { modifiers: ['Shift'] });
  await page.waitForTimeout(500);
  await shot('21-multi-select-2-vertices');

  // Shift+click third → all 3 selected
  await page.mouse.click(cx, cy + 100, { modifiers: ['Shift'] });
  await page.waitForTimeout(500);
  await shot('22-multi-select-all-3');

  // Right panel with multi-select
  await page.screenshot({ path: 'e2e/figma-deep-23-multi-select-panel.png', clip: { x: 1050, y: 0, width: 390, height: 900 } });
  console.log('📸 23 Multi-select → right panel');
  shotNum = 23;

  // ═══════════════════════════════════════════════════
  // SECTION 8: DRAG VERTEX
  // ═══════════════════════════════════════════════════
  console.log('\n── SECTION 8: Drag Vertex ──');

  // Click just one vertex first
  await page.mouse.click(cx - 120, cy - 100);
  await page.waitForTimeout(300);

  // Drag it
  await page.mouse.move(cx - 120, cy - 100);
  await page.mouse.down();
  await page.waitForTimeout(100);
  await shot('24-drag-start');

  await page.mouse.move(cx - 150, cy - 140, { steps: 15 });
  await page.waitForTimeout(200);
  await shot('25-drag-mid');

  await page.mouse.up();
  await page.waitForTimeout(400);
  await shot('26-drag-end');

  // Undo the drag
  await page.keyboard.press('Meta+z');
  await page.waitForTimeout(500);
  await shot('27-after-undo-drag');

  // ═══════════════════════════════════════════════════
  // SECTION 9: BEND TOOL (⌘ HOLD) — Straight↔Curve
  // ═══════════════════════════════════════════════════
  console.log('\n── SECTION 9: Bend Tool (⌘ Hold) ──');

  // Hold ⌘ → cursor should change to bend tool
  await page.keyboard.down('Meta');
  await page.waitForTimeout(400);
  await shot('28-cmd-held-bend-cursor');

  // Hover over a segment (top edge of triangle)
  await page.mouse.move(cx, cy - 100);
  await page.waitForTimeout(500);
  await shot('29-bend-hover-segment');

  // Click on segment to bend it (convert straight → curve)
  await page.mouse.click(cx, cy - 100);
  await page.waitForTimeout(600);
  await shot('30-segment-bent-to-curve');

  // Release ⌘
  await page.keyboard.up('Meta');
  await page.waitForTimeout(400);
  await shot('31-after-cmd-release');

  // ⌘ hold again and click same segment → toggle back to straight
  await page.keyboard.down('Meta');
  await page.waitForTimeout(200);
  await page.mouse.click(cx, cy - 100);
  await page.waitForTimeout(600);
  await shot('32-segment-toggled-back-straight');
  await page.keyboard.up('Meta');
  await page.waitForTimeout(300);

  // Actually bend via DRAG on segment (more common usage)
  await page.keyboard.down('Meta');
  await page.waitForTimeout(200);
  await page.mouse.move(cx, cy - 100);
  await page.mouse.down();
  await page.mouse.move(cx, cy - 150, { steps: 10 });
  await page.waitForTimeout(200);
  await shot('33-bend-drag-mid');
  await page.mouse.up();
  await page.keyboard.up('Meta');
  await page.waitForTimeout(500);
  await shot('34-bend-drag-result-handles');

  // ═══════════════════════════════════════════════════
  // SECTION 10: BEZIER HANDLE DRAG
  // ═══════════════════════════════════════════════════
  console.log('\n── SECTION 10: Bezier Handle Drag ──');

  // Click the vertex that now has handles (top-left after bend)
  await page.mouse.click(cx - 120, cy - 100);
  await page.waitForTimeout(500);
  await shot('35-vertex-with-handles-selected');

  // Try to find and drag a handle (handle should be near the vertex)
  // Handles in Figma appear as small circles on the tangent lines
  // The bent segment should have handles visible — try dragging one
  await page.mouse.move(cx - 80, cy - 120);
  await page.waitForTimeout(300);
  await shot('36-hover-near-handle');

  await page.mouse.move(cx - 80, cy - 120);
  await page.mouse.down();
  await page.mouse.move(cx - 60, cy - 160, { steps: 10 });
  await page.waitForTimeout(200);
  await shot('37-handle-drag-mid');
  await page.mouse.up();
  await page.waitForTimeout(400);
  await shot('38-handle-drag-result');

  // Undo handle drag
  await page.keyboard.press('Meta+z');
  await page.waitForTimeout(500);

  // ═══════════════════════════════════════════════════
  // SECTION 11: ESCAPE → EXIT VECTOR EDIT, DRAW BEZIER CURVES
  // ═══════════════════════════════════════════════════
  console.log('\n── SECTION 11: Draw Bezier Curves ──');

  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // Start new pen path with bezier curves
  await page.keyboard.press('p');
  await page.waitForTimeout(500);

  const bx = cx + 320, by = cy;

  // Click+drag first point → creates handles
  await page.mouse.move(bx - 80, by - 60);
  await page.mouse.down();
  await page.waitForTimeout(100);
  await shot('39-bezier-click-down');

  await page.mouse.move(bx - 80, by - 140, { steps: 12 });
  await page.waitForTimeout(300);
  await shot('40-bezier-drag-handles-visible');

  await page.mouse.up();
  await page.waitForTimeout(400);
  await shot('41-bezier-first-point-set');

  // Click+drag second point
  await page.mouse.move(bx + 80, by - 60);
  await page.mouse.down();
  await page.mouse.move(bx + 80, by + 20, { steps: 12 });
  await page.waitForTimeout(300);
  await shot('42-bezier-second-drag');
  await page.mouse.up();
  await page.waitForTimeout(300);

  // Click+drag third point
  await page.mouse.move(bx, by + 80);
  await page.mouse.down();
  await page.mouse.move(bx + 60, by + 80, { steps: 12 });
  await page.waitForTimeout(300);
  await shot('43-bezier-third-drag');
  await page.mouse.up();
  await page.waitForTimeout(300);

  // Hover near first point to see close indicator
  await page.mouse.move(bx - 80, by - 60);
  await page.waitForTimeout(800);
  await shot('44-bezier-close-indicator');

  // Close the bezier path
  await page.mouse.click(bx - 80, by - 60);
  await page.waitForTimeout(1000);
  await shot('45-bezier-path-closed');

  // ═══════════════════════════════════════════════════
  // SECTION 12: OPEN PATH (Escape during drawing)
  // ═══════════════════════════════════════════════════
  console.log('\n── SECTION 12: Open Path (Escape) ──');

  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  await page.keyboard.press('p');
  await page.waitForTimeout(400);

  const ox = cx - 300, oy = cy + 50;
  await page.mouse.click(ox, oy);
  await page.waitForTimeout(300);
  await page.mouse.click(ox + 80, oy - 60);
  await page.waitForTimeout(300);
  await page.mouse.click(ox + 160, oy);
  await page.waitForTimeout(300);
  await page.mouse.click(ox + 240, oy - 40);
  await page.waitForTimeout(300);
  await shot('46-open-path-4-points');

  // Escape → commits as open path
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);
  await shot('47-open-path-committed');

  // ═══════════════════════════════════════════════════
  // SECTION 13: ENTER KEY → VECTOR EDIT MODE
  // ═══════════════════════════════════════════════════
  console.log('\n── SECTION 13: Enter Key → Vector Edit ──');

  await page.keyboard.press('v');
  await page.waitForTimeout(300);
  // Click the bezier shape
  await page.mouse.click(bx, by);
  await page.waitForTimeout(500);
  await shot('48-bezier-selected');

  // Press Enter to enter vector edit
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);
  await shot('49-enter-key-vector-edit');

  // ═══════════════════════════════════════════════════
  // SECTION 14: FLOATING TOOLBAR — ALL TOOLS
  // ═══════════════════════════════════════════════════
  console.log('\n── SECTION 14: Floating Toolbar Tools ──');

  // Screenshot the toolbar area bottom-center
  await page.screenshot({ path: 'e2e/figma-deep-50-toolbar-default-move.png', clip: { x: 400, y: 750, width: 640, height: 150 } });
  console.log('📸 50 Toolbar default (Move tool)');
  shotNum = 50;

  // Press each sub-tool shortcut and capture toolbar state
  const subTools = [
    { key: 'q', name: 'lasso' },
    { key: 'b', name: 'paint-bucket' },
    { key: 'x', name: 'cut-scissors' },
  ];

  for (const tool of subTools) {
    await page.keyboard.press(tool.key);
    await page.waitForTimeout(500);
    await shot(`toolbar-${tool.name}-active`);
  }

  // Back to move
  await page.keyboard.press('v');
  await page.waitForTimeout(300);

  // ═══════════════════════════════════════════════════
  // SECTION 15: CUT TOOL — SPLIT PATH
  // ═══════════════════════════════════════════════════
  console.log('\n── SECTION 15: Cut Tool ──');

  await page.keyboard.press('x');
  await page.waitForTimeout(400);
  await shot('54-cut-tool-active');

  // Click on a vertex to cut
  await page.mouse.click(bx - 80, by - 60);
  await page.waitForTimeout(600);
  await shot('55-cut-at-vertex');

  // Back to move to see result
  await page.keyboard.press('v');
  await page.waitForTimeout(400);
  await shot('56-after-cut-result');

  // Undo the cut
  await page.keyboard.press('Meta+z');
  await page.waitForTimeout(500);

  // ═══════════════════════════════════════════════════
  // SECTION 16: DELETE VERTEX
  // ═══════════════════════════════════════════════════
  console.log('\n── SECTION 16: Delete Vertex ──');

  // Select a vertex
  await page.mouse.click(bx + 80, by - 60);
  await page.waitForTimeout(400);
  await shot('57-vertex-selected-for-delete');

  // Delete it
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(600);
  await shot('58-vertex-deleted');

  // Undo
  await page.keyboard.press('Meta+z');
  await page.waitForTimeout(500);
  await shot('59-after-undo-delete');

  // ═══════════════════════════════════════════════════
  // SECTION 17: RIGHT PANEL DEEP EXPLORATION
  // ═══════════════════════════════════════════════════
  console.log('\n── SECTION 17: Right Panel Deep Dive ──');

  // Select a vertex
  await page.mouse.click(bx - 80, by - 60);
  await page.waitForTimeout(500);

  // Full right panel - top section (transform/position)
  await page.screenshot({ path: 'e2e/figma-deep-60-panel-top.png', clip: { x: 1050, y: 0, width: 390, height: 450 } });
  console.log('📸 60 Panel top (position/size)');

  // Full right panel - bottom section (stroke/fill/etc)
  await page.screenshot({ path: 'e2e/figma-deep-61-panel-bottom.png', clip: { x: 1050, y: 400, width: 390, height: 500 } });
  console.log('📸 61 Panel bottom (stroke/fill)');
  shotNum = 61;

  // Click away to deselect all vertices
  await page.mouse.click(cx + 200, cy + 200);
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'e2e/figma-deep-62-panel-no-vertex-selected.png', clip: { x: 1050, y: 0, width: 390, height: 900 } });
  console.log('📸 62 Panel with no vertex selected');
  shotNum = 62;

  // ═══════════════════════════════════════════════════
  // SECTION 18: STROKE PROPERTIES
  // ═══════════════════════════════════════════════════
  console.log('\n── SECTION 18: Stroke Properties ──');

  // Exit vector edit, select the shape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  await page.mouse.click(bx, by);
  await page.waitForTimeout(500);

  // Capture stroke section of right panel
  await page.screenshot({ path: 'e2e/figma-deep-63-stroke-properties.png', clip: { x: 1050, y: 300, width: 390, height: 400 } });
  console.log('📸 63 Stroke properties panel');
  shotNum = 63;

  // Try to change stroke weight — find the stroke weight input
  // In Figma, stroke weight is in the right panel
  await shot('64-full-page-stroke-context');

  // ═══════════════════════════════════════════════════
  // SECTION 19: HOVER STATES ON SEGMENTS & ANCHORS
  // ═══════════════════════════════════════════════════
  console.log('\n── SECTION 19: Hover States ──');

  // Enter vector edit mode
  await page.mouse.dblclick(bx, by);
  await page.waitForTimeout(800);

  // Hover over segment (not on anchor)
  await page.mouse.move(bx, by - 60);
  await page.waitForTimeout(600);
  await shot('65-hover-segment');

  // Hover directly on anchor
  await page.mouse.move(bx - 80, by - 60);
  await page.waitForTimeout(600);
  await shot('66-hover-anchor');

  // Hover on bezier handle
  // First select the vertex to show handles
  await page.mouse.click(bx - 80, by - 60);
  await page.waitForTimeout(400);
  // Now hover on handle area
  await page.mouse.move(bx - 80, by - 130);
  await page.waitForTimeout(600);
  await shot('67-hover-handle');

  // ═══════════════════════════════════════════════════
  // SECTION 20: LASSO SELECT
  // ═══════════════════════════════════════════════════
  console.log('\n── SECTION 20: Lasso Select ──');

  await page.keyboard.press('q');
  await page.waitForTimeout(400);
  await shot('68-lasso-tool-active');

  // Draw a lasso around vertices
  await page.mouse.move(bx - 120, by - 120);
  await page.mouse.down();
  await page.mouse.move(bx + 120, by - 120, { steps: 8 });
  await page.mouse.move(bx + 120, by + 20, { steps: 8 });
  await page.waitForTimeout(200);
  await shot('69-lasso-drawing');
  await page.mouse.move(bx - 120, by + 20, { steps: 8 });
  await page.mouse.move(bx - 120, by - 120, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(500);
  await shot('70-lasso-result');

  // ═══════════════════════════════════════════════════
  // SECTION 21: VARIABLE WIDTH TOOL (if available)
  // ═══════════════════════════════════════════════════
  console.log('\n── SECTION 21: Variable Width Tool ──');

  // Exit edit, select the open path to test variable width
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  await page.mouse.click(ox + 80, oy - 30);
  await page.waitForTimeout(500);
  await page.mouse.dblclick(ox + 80, oy - 30);
  await page.waitForTimeout(800);
  await shot('71-open-path-vector-edit');

  // Try variable width tool
  // In Figma, variable width is usually Shift+W or in the toolbar
  await page.keyboard.press('Shift+w');
  await page.waitForTimeout(500);
  await shot('72-variable-width-tool');

  // Drag on a segment to add width point
  await page.mouse.move(ox + 120, oy - 30);
  await page.mouse.down();
  await page.mouse.move(ox + 120, oy - 60, { steps: 8 });
  await page.waitForTimeout(300);
  await shot('73-variable-width-drag');
  await page.mouse.up();
  await page.waitForTimeout(500);
  await shot('74-variable-width-result');

  // ═══════════════════════════════════════════════════
  // SECTION 22: PER-VERTEX MIRRORING & CORNER RADIUS
  // ═══════════════════════════════════════════════════
  console.log('\n── SECTION 22: Mirroring & Corner Radius ──');

  await page.keyboard.press('v');
  await page.waitForTimeout(300);

  // Select a vertex on the bezier shape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await page.mouse.click(bx, by);
  await page.waitForTimeout(300);
  await page.mouse.dblclick(bx, by);
  await page.waitForTimeout(800);

  // Click vertex
  await page.mouse.click(bx - 80, by - 60);
  await page.waitForTimeout(500);

  // Screenshot the full right panel focusing on mirroring/corner radius
  await page.screenshot({ path: 'e2e/figma-deep-75-mirroring-section.png', clip: { x: 1050, y: 0, width: 390, height: 500 } });
  console.log('📸 75 Mirroring section');
  shotNum = 75;

  // ═══════════════════════════════════════════════════
  // SECTION 23: SHAPE BUILDER TOOL
  // ═══════════════════════════════════════════════════
  console.log('\n── SECTION 23: Shape Builder ──');

  await page.keyboard.press('m');
  await page.waitForTimeout(500);
  await shot('76-shape-builder-active');

  // ═══════════════════════════════════════════════════
  // SECTION 24: PAINT BUCKET TOOL
  // ═══════════════════════════════════════════════════
  console.log('\n── SECTION 24: Paint Bucket ──');

  await page.keyboard.press('b');
  await page.waitForTimeout(500);
  await shot('77-paint-bucket-active');

  // Click inside a closed region
  await page.mouse.click(bx, by - 20);
  await page.waitForTimeout(500);
  await shot('78-paint-bucket-click');

  // ═══════════════════════════════════════════════════
  // SECTION 25: EXIT VECTOR EDIT (Escape)
  // ═══════════════════════════════════════════════════
  console.log('\n── SECTION 25: Exit Vector Edit ──');

  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  await shot('79-exit-vector-edit');

  // Should now be in normal select mode
  await shot('80-back-to-normal-select');

  // ═══════════════════════════════════════════════════
  // SECTION 26: ZOOM OUT → FINAL OVERVIEW
  // ═══════════════════════════════════════════════════
  console.log('\n── SECTION 26: Final Overview ──');

  await page.keyboard.press('Meta+a');
  await page.waitForTimeout(300);
  // Zoom to fit
  await page.keyboard.press('Shift+1');
  await page.waitForTimeout(1000);
  await shot('81-final-all-shapes');

  // Undo all changes to leave file clean
  console.log('\n🔄 Undoing all changes to leave file clean...');
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press('Meta+z');
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(500);
  await shot('82-file-restored');

  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅  COMPREHENSIVE EXPLORATION COMPLETE!');
  console.log(`    ${shotNum} screenshots captured → e2e/figma-deep-*.png`);
  console.log('═══════════════════════════════════════════════════════');

  console.log('🔍 Browser stays open 60s for manual inspection...');
  await page.waitForTimeout(60000);
  await browser.close();
}

main().catch(e => { console.error('❌ Error:', e.message); process.exit(1); });

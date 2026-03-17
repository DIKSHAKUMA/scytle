import { chromium } from '@playwright/test';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  // Launch with visible browser, larger viewport, persistent context for auth
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 50,
    args: ['--disable-blink-features=AutomationControlled']
  });
  const context = await browser.newContext({ 
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  console.log('\n🎨 Opening Figma design file...');
  await page.goto('https://www.figma.com/design/XtZ46t9GalHMQJbfcsslh6/demo-file?node-id=18-2&p=f&t=aBS3NUfXMlXu3syk-0', { 
    waitUntil: 'domcontentloaded',
    timeout: 30000 
  });
  
  // Wait for page to load
  await sleep(5000);
  
  // Check if we hit a login wall
  const url = page.url();
  const title = await page.title();
  console.log(`📍 URL: ${url}`);
  console.log(`📄 Title: ${title}`);
  
  // Take screenshot to see current state
  await page.screenshot({ path: 'e2e/figma-01-initial.png' });
  console.log('📸 Screenshot: e2e/figma-01-initial.png');

  // Check for login elements
  const hasLogin = await page.locator('input[name="email"], [data-testid="login-form"], button:has-text("Log in")').count();
  if (hasLogin > 0 || url.includes('login')) {
    console.log('\n⚠️  Figma requires login. Waiting 60s for manual login...');
    console.log('   Please log in to Figma in the browser window.');
    
    // Wait for user to log in manually
    try {
      await page.waitForURL('**/design/**', { timeout: 120000 });
      console.log('✅ Login detected, continuing...');
      await sleep(5000);
    } catch {
      console.log('❌ Login timeout. Taking screenshot of current state.');
      await page.screenshot({ path: 'e2e/figma-02-login-state.png' });
      await browser.close();
      return;
    }
  }

  // Wait for Figma canvas to load
  console.log('\n⏳ Waiting for Figma canvas...');
  await sleep(8000);
  await page.screenshot({ path: 'e2e/figma-02-canvas-loaded.png' });
  console.log('📸 Screenshot: e2e/figma-02-canvas-loaded.png');

  // ═══════════════════════════════════════════════════════════
  // TEST: Observe Figma Pen Tool Behavior
  // ═══════════════════════════════════════════════════════════
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('🖊️  FIGMA PEN TOOL OBSERVATION');
  console.log('═══════════════════════════════════════════════════\n');

  // 1. Activate pen tool with P key
  console.log('── Step 1: Activate Pen Tool (P) ──');
  await page.keyboard.press('p');
  await sleep(1500);
  await page.screenshot({ path: 'e2e/figma-03-pen-activated.png' });
  console.log('📸 Pen tool activated');

  // 2. Draw a triangle with straight lines
  console.log('\n── Step 2: Draw Triangle (3 clicks + close) ──');
  // Click in the middle of the canvas
  const vp = await page.viewportSize();
  const cx = vp.width / 2;
  const cy = vp.height / 2;
  
  // First point
  await page.mouse.click(cx - 100, cy - 80);
  await sleep(500);
  await page.screenshot({ path: 'e2e/figma-04-first-point.png' });
  
  // Second point
  await page.mouse.click(cx + 100, cy - 80);
  await sleep(500);
  
  // Third point
  await page.mouse.click(cx, cy + 80);
  await sleep(500);
  await page.screenshot({ path: 'e2e/figma-05-three-points.png' });
  
  // Close path by clicking near first point
  await page.mouse.click(cx - 100, cy - 80);
  await sleep(1000);
  await page.screenshot({ path: 'e2e/figma-06-triangle-closed.png' });
  console.log('📸 Triangle drawn and closed');

  // 3. Observe what happens after closing
  console.log('\n── Step 3: After Close — Check Edit Mode ──');
  await sleep(1000);
  await page.screenshot({ path: 'e2e/figma-07-after-close.png' });
  console.log('📸 Post-close state captured');

  // 4. Press Escape to exit, then select the vector
  console.log('\n── Step 4: Exit and Select ──');
  await page.keyboard.press('Escape');
  await sleep(800);
  
  // Press V for select tool
  await page.keyboard.press('v');
  await sleep(500);
  
  // Click the triangle area
  await page.mouse.click(cx, cy - 20);
  await sleep(800);
  await page.screenshot({ path: 'e2e/figma-08-vector-selected.png' });
  console.log('📸 Vector selected — check right panel');

  // 5. Double-click to enter vector edit mode
  console.log('\n── Step 5: Double-click → Vector Edit Mode ──');
  await page.mouse.dblclick(cx, cy - 20);
  await sleep(1500);
  await page.screenshot({ path: 'e2e/figma-09-vector-edit-mode.png' });
  console.log('📸 Vector edit mode — observe anchor points + toolbar');

  // 6. Try clicking an anchor point
  console.log('\n── Step 6: Click Anchor Point ──');
  await page.mouse.click(cx - 100, cy - 80);
  await sleep(800);
  await page.screenshot({ path: 'e2e/figma-10-anchor-selected.png' });
  console.log('📸 Anchor selected — check position X/Y in panel');

  // 7. Drag the anchor point
  console.log('\n── Step 7: Drag Anchor Point ──');
  await page.mouse.move(cx - 100, cy - 80);
  await page.mouse.down();
  await page.mouse.move(cx - 70, cy - 100, { steps: 10 });
  await sleep(300);
  await page.screenshot({ path: 'e2e/figma-11-anchor-dragging.png' });
  await page.mouse.up();
  await sleep(500);
  await page.screenshot({ path: 'e2e/figma-12-anchor-moved.png' });
  console.log('📸 Anchor moved — shape updated');

  // 8. Undo
  console.log('\n── Step 8: Undo (⌘Z) ──');
  await page.keyboard.press('Meta+z');
  await sleep(800);
  await page.screenshot({ path: 'e2e/figma-13-after-undo.png' });
  console.log('📸 After undo');

  // 9. Test Bend tool (⌘ hold)
  console.log('\n── Step 9: Bend Tool (⌘ hold) ──');
  await page.keyboard.down('Meta');
  await sleep(1000);
  await page.screenshot({ path: 'e2e/figma-14-bend-tool-active.png' });
  
  // Click a segment to convert straight→curve
  await page.mouse.click(cx, cy - 80);
  await sleep(800);
  await page.screenshot({ path: 'e2e/figma-15-after-bend-click.png' });
  
  await page.keyboard.up('Meta');
  await sleep(500);
  await page.screenshot({ path: 'e2e/figma-16-bend-released.png' });
  console.log('📸 Bend tool interaction captured');

  // 10. Now test click+drag for bezier curve
  console.log('\n── Step 10: New Shape — Bezier Curves ──');
  await page.keyboard.press('Escape');
  await sleep(300);
  await page.keyboard.press('p');
  await sleep(500);

  // Click+drag first point
  const bx = cx + 250, by = cy;
  await page.mouse.move(bx, by - 80);
  await page.mouse.down();
  await page.mouse.move(bx + 60, by - 80, { steps: 8 });
  await sleep(300);
  await page.screenshot({ path: 'e2e/figma-17-bezier-handles.png' });
  console.log('📸 Bezier handle arms visible during drag');
  await page.mouse.up();
  await sleep(300);

  // Click+drag second point
  await page.mouse.move(bx + 120, by + 40);
  await page.mouse.down();
  await page.mouse.move(bx + 120 + 50, by + 40 - 30, { steps: 8 });
  await sleep(300);
  await page.mouse.up();
  await sleep(300);
  await page.screenshot({ path: 'e2e/figma-18-bezier-curve.png' });
  console.log('📸 Bezier curve formed');

  // Escape to commit open path
  await page.keyboard.press('Escape');
  await sleep(800);
  await page.screenshot({ path: 'e2e/figma-19-open-bezier.png' });
  console.log('📸 Open bezier path committed');

  // 11. Check cut tool
  console.log('\n── Step 11: Cut Tool in Edit Mode ──');
  await page.keyboard.press('v');
  await sleep(300);
  await page.mouse.click(cx, cy - 20);
  await sleep(300);
  await page.mouse.dblclick(cx, cy - 20);
  await sleep(1000);
  
  // Press X for cut tool
  await page.keyboard.press('x');
  await sleep(500);
  await page.screenshot({ path: 'e2e/figma-20-cut-tool.png' });
  console.log('📸 Cut tool active');

  // 12. Escape to exit
  console.log('\n── Step 12: Exit Edit Mode ──');
  await page.keyboard.press('Escape');
  await sleep(800);
  await page.screenshot({ path: 'e2e/figma-21-exit-edit.png' });
  console.log('📸 Exited vector edit mode');

  // Final
  console.log('\n═══════════════════════════════════════════════════');
  console.log('✅  All Figma pen tool observations captured!');
  console.log('    Screenshots saved in e2e/figma-*.png');
  console.log('═══════════════════════════════════════════════════\n');

  // Keep browser open for manual inspection
  console.log('🔍 Keeping browser open for 30s for manual inspection...');
  await sleep(30000);
  await browser.close();
})();

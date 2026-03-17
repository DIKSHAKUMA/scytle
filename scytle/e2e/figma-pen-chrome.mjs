import { chromium } from '@playwright/test';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  // Launch using persistent context with existing Chrome profile
  // This picks up Figma login cookies
  const userDataDir = '/tmp/pw-chrome-figma';
  
  // Copy cookies from Chrome profile (launch chromium with user data dir)
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    channel: 'chrome',  // Use actual Chrome (has login sessions)
    viewport: { width: 1440, height: 900 },
    args: [
      '--disable-blink-features=AutomationControlled',
      `--profile-directory=Default`,
    ],
  });
  
  const page = context.pages()[0] || await context.newPage();

  console.log('\n🎨 Opening Figma with Chrome profile...');
  await page.goto('https://www.figma.com/design/XtZ46t9GalHMQJbfcsslh6/demo-file?node-id=18-2&p=f&t=aBS3NUfXMlXu3syk-0', { 
    waitUntil: 'domcontentloaded',
    timeout: 30000 
  });
  await sleep(5000);
  
  const url = page.url();
  const title = await page.title();
  console.log(`📍 URL: ${url}`);
  console.log(`📄 Title: ${title}`);
  await page.screenshot({ path: 'e2e/figma-chrome-01-loaded.png' });

  // Check if logged in — look for sign up banner vs editor toolbar
  const signUpBanner = await page.locator('text="Sign up to comment"').count();
  const isViewOnly = signUpBanner > 0;
  console.log(`🔐 View-only mode: ${isViewOnly}`);

  if (isViewOnly) {
    console.log('\n⚠️  Still in view-only mode. Chrome profile doesn\'t have Figma session.');
    console.log('   Trying to log in via Google...');
    
    // Click "Continue with Google" if available
    const googleBtn = page.locator('button:has-text("Continue"), [data-testid*="google"]').first();
    if (await googleBtn.isVisible().catch(() => false)) {
      await googleBtn.click();
      await sleep(10000);
      await page.screenshot({ path: 'e2e/figma-chrome-02-after-google.png' });
    }
    
    // Wait for user manual login if needed
    console.log('   Waiting 90s for manual login if needed...');
    try {
      await page.waitForSelector('[class*="toolbar"]', { timeout: 90000 });
    } catch {
      // Continue anyway
    }
    await sleep(3000);
  }

  // Now attempt the pen tool test
  console.log('\n═══════════════════════════════════════════════════');
  console.log('🖊️  FIGMA PEN TOOL — LIVE OBSERVATION');
  console.log('═══════════════════════════════════════════════════\n');

  await page.screenshot({ path: 'e2e/figma-chrome-03-ready.png' });

  // Dismiss any modals/banners
  await page.keyboard.press('Escape');
  await sleep(500);

  // Click on empty canvas area first to ensure focus
  await page.mouse.click(900, 450);
  await sleep(500);

  // ── TEST 1: Activate Pen Tool ──
  console.log('── 1. Press P → Pen Tool ──');
  await page.keyboard.press('p');
  await sleep(1000);
  await page.screenshot({ path: 'e2e/figma-chrome-04-pen-tool.png' });
  console.log('📸 Pen tool state captured');

  // ── TEST 2: Draw Triangle ──
  console.log('\n── 2. Draw Triangle (3 clicks + close) ──');
  await page.mouse.click(850, 300);
  await sleep(400);
  await page.screenshot({ path: 'e2e/figma-chrome-05-point1.png' });
  
  await page.mouse.click(1050, 300);
  await sleep(400);
  await page.screenshot({ path: 'e2e/figma-chrome-06-point2.png' });
  
  await page.mouse.click(950, 480);
  await sleep(400);
  await page.screenshot({ path: 'e2e/figma-chrome-07-point3.png' });
  console.log('📸 Three points placed');

  // Move near first point to see close indicator
  await page.mouse.move(850, 300);
  await sleep(500);
  await page.screenshot({ path: 'e2e/figma-chrome-08-close-indicator.png' });
  console.log('📸 Close indicator (hovering near start)');

  // Close the path
  await page.mouse.click(850, 300);
  await sleep(1000);
  await page.screenshot({ path: 'e2e/figma-chrome-09-closed.png' });
  console.log('📸 Path closed → vector created');

  // ── TEST 3: Check vector edit mode (auto-enter after close) ──
  console.log('\n── 3. Post-close state (Figma auto-enters edit mode) ──');
  await sleep(500);
  await page.screenshot({ path: 'e2e/figma-chrome-10-edit-mode.png' });

  // ── TEST 4: Exit and re-enter ──
  console.log('\n── 4. Escape → V → select → dblclick ──');
  await page.keyboard.press('Escape');
  await sleep(500);
  await page.keyboard.press('v');
  await sleep(300);
  await page.mouse.click(950, 380);
  await sleep(500);
  await page.screenshot({ path: 'e2e/figma-chrome-11-selected.png' });
  console.log('📸 Vector selected — right panel visible');

  // Double-click to re-enter edit mode
  await page.mouse.dblclick(950, 380);
  await sleep(1000);
  await page.screenshot({ path: 'e2e/figma-chrome-12-dblclick-edit.png' });
  console.log('📸 Double-click → vector edit mode with toolbar');

  // ── TEST 5: Click anchor point ──
  console.log('\n── 5. Click anchor → position X/Y in panel ──');
  await page.mouse.click(850, 300);
  await sleep(500);
  await page.screenshot({ path: 'e2e/figma-chrome-13-anchor-selected.png' });
  console.log('📸 Anchor point selected');

  // ── TEST 6: Drag vertex ──
  console.log('\n── 6. Drag vertex ──');
  await page.mouse.move(850, 300);
  await page.mouse.down();
  await page.mouse.move(830, 260, { steps: 8 });
  await sleep(300);
  await page.screenshot({ path: 'e2e/figma-chrome-14-dragging.png' });
  await page.mouse.up();
  await sleep(500);
  await page.screenshot({ path: 'e2e/figma-chrome-15-dragged.png' });
  console.log('📸 Vertex dragged');

  // Undo
  await page.keyboard.press('Meta+z');
  await sleep(500);

  // ── TEST 7: Bend tool (⌘ hold) ──
  console.log('\n── 7. ⌘-hold → Bend tool ──');
  await page.keyboard.down('Meta');
  await sleep(800);
  await page.screenshot({ path: 'e2e/figma-chrome-16-bend-active.png' });
  console.log('📸 Bend tool active (⌘ held)');

  // Click a segment midpoint to convert straight→curve
  await page.mouse.click(950, 300);
  await sleep(600);
  await page.screenshot({ path: 'e2e/figma-chrome-17-after-bend.png' });

  await page.keyboard.up('Meta');
  await sleep(500);
  await page.screenshot({ path: 'e2e/figma-chrome-18-bend-released.png' });
  console.log('📸 Bend released → handles visible on curved segment');

  // ── TEST 8: New shape with bezier curves ──
  console.log('\n── 8. Draw bezier curves (click+drag) ──');
  await page.keyboard.press('Escape');
  await sleep(300);
  await page.keyboard.press('p');
  await sleep(500);

  // Click+drag point 1
  await page.mouse.move(500, 350);
  await page.mouse.down();
  await page.mouse.move(560, 350, { steps: 6 });
  await sleep(200);
  await page.screenshot({ path: 'e2e/figma-chrome-19-bezier-drag1.png' });
  console.log('📸 Bezier handle arms during first drag');
  await page.mouse.up();
  await sleep(200);

  // Click+drag point 2
  await page.mouse.move(650, 500);
  await page.mouse.down();
  await page.mouse.move(700, 470, { steps: 6 });
  await sleep(200);
  await page.screenshot({ path: 'e2e/figma-chrome-20-bezier-drag2.png' });
  await page.mouse.up();
  await sleep(200);

  // Click+drag point 3
  await page.mouse.move(400, 500);
  await page.mouse.down();
  await page.mouse.move(370, 470, { steps: 6 });
  await sleep(200);
  await page.mouse.up();
  await sleep(200);

  // Close
  await page.mouse.click(500, 350);
  await sleep(800);
  await page.screenshot({ path: 'e2e/figma-chrome-21-bezier-closed.png' });
  console.log('📸 Bezier shape closed');

  // ── TEST 9: Escape for open path ──
  console.log('\n── 9. Open path (Escape) ──');
  await page.keyboard.press('Escape');
  await sleep(300);
  await page.keyboard.press('p');
  await sleep(300);
  await page.mouse.click(300, 300); await sleep(150);
  await page.mouse.click(350, 400); await sleep(150);
  await page.mouse.click(280, 420); await sleep(150);
  await page.keyboard.press('Escape');
  await sleep(600);
  await page.screenshot({ path: 'e2e/figma-chrome-22-open-path.png' });
  console.log('📸 Open path committed');

  // Final screenshot of all shapes
  console.log('\n── Final: zoom out to see all shapes ──');
  await page.keyboard.press('v');
  await sleep(200);
  // Cmd+0 to zoom to fit
  await page.keyboard.press('Meta+1');
  await sleep(1000);
  await page.screenshot({ path: 'e2e/figma-chrome-23-final.png' });

  console.log('\n═══════════════════════════════════════════════════');
  console.log('✅  All Figma pen tool screenshots captured!');
  console.log('    See e2e/figma-chrome-*.png');
  console.log('═══════════════════════════════════════════════════\n');

  console.log('🔍 Browser open for 15s for manual inspection...');
  await sleep(15000);
  await context.close();
})();

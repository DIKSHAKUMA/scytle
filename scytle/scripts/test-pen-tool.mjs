import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Navigating to localhost:3000/demo/layers...');
  await page.goto('http://localhost:3000/demo/layers');
  await page.waitForTimeout(2000);

  console.log('Pressing P to activate pen tool...');
  await page.keyboard.press('p');
  await page.waitForTimeout(500);

  // Get viewport size for drawing
  const viewport = page.viewportSize();
  const centerX = viewport.width / 2;
  const centerY = viewport.height / 2;

  console.log('Drawing triangle - point 1 (top)');
  await page.mouse.click(centerX, centerY - 100);
  await page.waitForTimeout(300);

  console.log('Drawing triangle - point 2 (bottom-left)');
  await page.mouse.click(centerX - 100, centerY + 50);
  await page.waitForTimeout(300);

  console.log('Drawing triangle - point 3 (bottom-right)');
  await page.mouse.click(centerX + 100, centerY + 50);
  await page.waitForTimeout(300);

  console.log('Closing triangle - clicking near point 1');
  await page.mouse.click(centerX, centerY - 100);
  await page.waitForTimeout(500);

  console.log('Triangle created! Taking screenshot...');
  await page.screenshot({ path: '/tmp/pen-tool-test.png' });
  console.log('Screenshot saved to /tmp/pen-tool-test.png');

  // Keep browser open for 10 seconds so user can see
  console.log('Keeping browser open for 10 seconds...');
  await page.waitForTimeout(10000);

  await browser.close();
  console.log('Done!');
})();

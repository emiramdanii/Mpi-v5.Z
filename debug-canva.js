const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

(async () => {
  const PORT = 8765;
  const PUBLIC_DIR = '/home/z/my-project/public';
  
  const server = http.createServer((req, res) => {
    let filePath = path.join(PUBLIC_DIR, req.url === '/' ? '/index.html' : unescape(req.url));
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      const ext = path.extname(filePath);
      const ct = {'.html':'text/html','.css':'text/css','.js':'application/javascript','.json':'application/json'};
      res.writeHead(200, {'Content-Type': ct[ext] || 'text/plain'});
      res.end(data);
    });
  });
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));
  console.log(`Server on port ${PORT}`);

  const consoleMessages = [];
  const errors = [];

  const browser = await chromium.launch({headless: true, args: ['--no-sandbox','--disable-setuid-sandbox','--disable-gpu']});
  const page = await (await browser.newContext()).newPage();
  
  page.on('console', msg => consoleMessages.push({type: msg.type(), text: msg.text()}));
  page.on('pageerror', err => errors.push(err.message));

  await page.goto(`http://127.0.0.1:${PORT}/`, {waitUntil: 'domcontentloaded', timeout: 30000});
  await page.waitForTimeout(3000);

  // Activate Canva mode
  await page.evaluate(() => {
    document.querySelectorAll('.nav-item').forEach(i => { if(i.textContent.includes('Canva')) i.click(); });
  });
  await page.waitForTimeout(3000);

  let allPassed = true;

  // TEST 1: Elemen tab click + Teks chip click
  console.log('===== TEST 1: Elemen tab → Teks chip =====');
  await page.click('#cmtab-elems');
  await page.waitForTimeout(1000);
  
  let countBefore = await page.evaluate(() => AT_CANVA_MODE._st().pages[0].elements.length);
  await page.click('.cm-elem-chip[data-etype="teks"]');
  await page.waitForTimeout(1000);
  let countAfter = await page.evaluate(() => AT_CANVA_MODE._st().pages[0].elements.length);
  
  let test1Pass = countAfter === countBefore + 1;
  console.log(`Before: ${countBefore}, After: ${countAfter} → ${test1Pass ? 'PASS ✅' : 'FAIL ❌'}`);
  if (!test1Pass) allPassed = false;

  // TEST 2: Toolbar "T Teks" button → click on stage
  console.log('\n===== TEST 2: T Teks toolbar → click stage =====');
  await page.click('#cmtool-text');
  await page.waitForTimeout(500);
  
  let toolActive = await page.evaluate(() => AT_CANVA_MODE._tool === 'text');
  console.log(`Text tool active: ${toolActive} → ${toolActive ? 'PASS ✅' : 'FAIL ❌'}`);
  if (!toolActive) allPassed = false;
  
  // Check cursor
  let cursorCheck = await page.evaluate(() => {
    return document.getElementById('cm-canvas-area')?.style?.cursor;
  });
  console.log(`Canvas cursor: "${cursorCheck}" → ${cursorCheck === 'text' ? 'PASS ✅' : 'FAIL ❌'}`);
  if (cursorCheck !== 'text') allPassed = false;
  
  // Click on the stage area to create text
  countBefore = await page.evaluate(() => AT_CANVA_MODE._st().pages[0].elements.length);
  
  // Use JavaScript click on the canvas area since Playwright can't see the scaled-down bg
  const clickResult = await page.evaluate(() => {
    const area = document.getElementById('cm-canvas-area');
    const wrap = document.getElementById('cm-stage-wrap');
    if (!area || !wrap) return 'elements not found';
    
    // Simulate a mousedown event on the canvas area
    const rect = area.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    const mouseDownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      target: area,
    });
    area.dispatchEvent(mouseDownEvent);
    
    return 'dispatched';
  });
  await page.waitForTimeout(500);
  
  countAfter = await page.evaluate(() => AT_CANVA_MODE._st().pages[0].elements.length);
  let test2Pass = countAfter === countBefore + 1;
  console.log(`Before click: ${countBefore}, After click: ${countAfter} → ${test2Pass ? 'PASS ✅' : 'FAIL ❌'}`);
  if (!test2Pass) allPassed = false;
  
  // Check that tool switched back to select
  let toolAfterClick = await page.evaluate(() => AT_CANVA_MODE._tool);
  let test2bPass = toolAfterClick === 'select';
  console.log(`Tool after click: "${toolAfterClick}" (should be "select") → ${test2bPass ? 'PASS ✅' : 'FAIL ❌'}`);
  if (!test2bPass) allPassed = false;

  // TEST 3: Clicking bg with select tool deselects
  console.log('\n===== TEST 3: Select tool → click stage deselects =====');
  await page.click('#cmtool-select');
  await page.waitForTimeout(300);
  
  // First add an element so we can select it
  await page.evaluate(() => AT_CANVA_MODE.addElemByType('shape'));
  await page.waitForTimeout(300);
  
  // Select it
  const selBefore = await page.evaluate(() => AT_CANVA_MODE._sel !== null);
  
  // Click on bg to deselect
  await page.evaluate(() => {
    const area = document.getElementById('cm-canvas-area');
    const mouseDownEvent = new MouseEvent('mousedown', {
      bubbles: true, cancelable: true,
      clientX: area.getBoundingClientRect().left + 10,
      clientY: area.getBoundingClientRect().top + 10,
      target: area,
    });
    area.dispatchEvent(mouseDownEvent);
  });
  await page.waitForTimeout(300);
  
  const selAfter = await page.evaluate(() => AT_CANVA_MODE._sel === null);
  let test3Pass = selBefore && selAfter;
  console.log(`Had selection: ${selBefore}, After bg click: ${selAfter} → ${test3Pass ? 'PASS ✅' : 'FAIL ❌'}`);
  if (!test3Pass) allPassed = false;

  // TEST 4: No JS errors
  console.log('\n===== TEST 4: No JS errors =====');
  let test4Pass = errors.length === 0;
  console.log(`Total errors: ${errors.length} → ${test4Pass ? 'PASS ✅' : 'FAIL ❌'}`);
  if (errors.length > 0) {
    errors.forEach(e => console.log(`  ERROR: ${e}`));
  }
  if (!test4Pass) allPassed = false;

  // Final
  console.log('\n========== SUMMARY ==========');
  console.log(`All tests: ${allPassed ? 'ALL PASSED ✅' : 'SOME FAILED ❌'}`);
  console.log(`Total elements on page: ${await page.evaluate(() => AT_CANVA_MODE._st().pages[0].elements.length)}`);
  console.log(`Console messages: ${consoleMessages.length}`);
  console.log(`JS errors: ${errors.length}`);

  await browser.close();
  server.close();
  process.exit(allPassed ? 0 : 1);
})().catch(e => { console.error('Fatal:', e.message); process.exit(1); });

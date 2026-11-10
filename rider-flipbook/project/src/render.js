// Renders all 12fps drawings to PNG (1080x1920). Usage: node src/render.js [startT endT]
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const A = require('./anim');
const { frameHTML } = require('./render_lib');
const OUT = path.resolve(__dirname, '../out/frames');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const n = Math.round(A.DURATION * A.FPS_DRAW);
  const [a, b] = process.argv.slice(2).map(Number);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const t = i / A.FPS_DRAW;
    if (!isNaN(a) && (t < a || t >= b)) continue;
    const { html } = frameHTML(t, i);
    await page.setContent(html);
    await page.screenshot({ path: path.join(OUT, `d_${String(i).padStart(4, '0')}.png`) });
  }
  await browser.close();
  console.log('rendered in', ((Date.now() - t0) / 1000).toFixed(1), 's');
})();

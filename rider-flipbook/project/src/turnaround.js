// Builds perspective_turnaround.png: reference + 4 reconstructed angles of the same 3D-defined rider/bike.
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { makeCamera, v, norm, add, mul } = require('./rig');
const { defaultPose, buildScene } = require('./model');
const { frameSVG } = require('./frame');

const OUT = path.resolve(__dirname, '../../deliverables');
const W = 900, H = 900;

function phonePose() {
  // matches the reference: left hand holding phone to left ear, right hand on throttle
  const p = defaultPose();
  // head turned toward viewer (rider's right); phone held by LEFT hand at LEFT ear (image-right of face)
  p.headFwd = norm(v(0.5, -0.05, 0.86)); p.headUp = norm(v(0.04, 1, 0));
  const leftEar = norm(v(0.86, 0, -0.5));
  const ear = add(v(57, 154, 0), mul(leftEar, 16.2));
  p.armL = [v(51, 132, -17), v(60, 113, -8), v(70, 136, -4), add(ear, v(-1, -5, 2))];
  p.phone = { pos: ear, fwd: leftEar, up: norm(v(-0.3, 1, -0.2)) };
  p.legR = [v(40, 86, 10), v(70, 74, 19), v(68, 12, 22), v(79, 3, 23)];
  return p;
}

const views = [
  { key: 'side', label: '1 · SIDE PROFILE (kanan, ikut ref)', pose: phonePose, cam: { az: 0, el: 3, target: [58, 80, 0], dist: 900, scale: 3.3 } },
  { key: 'rear34', label: '2 · REAR THREE-QUARTER', pose: defaultPose, cam: { az: 132, el: 10, target: [55, 80, 0], dist: 900, scale: 3.6 } },
  { key: 'rear', label: '3 · DIRECT REAR', pose: defaultPose, cam: { az: 90, el: 6, target: [55, 82, 0], dist: 900, scale: 4.2 } },
  { key: 'elev45', label: '4 · ELEVATED 45° REAR', pose: defaultPose, cam: { az: 90, el: 45, target: [55, 70, 0], dist: 900, scale: 3.9 } },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const panels = [];
  for (const vw of views) {
    const cam = makeCamera({ ...vw.cam, cx: W / 2, cy: H / 2 + 60 });
    const svg = frameSVG(buildScene(vw.pose()), cam, { w: W, h: H, wobble: 1 });
    fs.writeFileSync(path.join(OUT, `view_${vw.key}.svg`), svg);
    await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
    const file = path.join(OUT, `view_${vw.key}.png`);
    await page.screenshot({ path: file, clip: { x: 0, y: 0, width: W, height: H } });
    panels.push({ ...vw, file });
  }
  // compose sheet
  const b64 = (f) => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
  const ref = path.resolve(__dirname, '../../references/rider_ref_crop.png');
  const sheetW = 1920, sheetH = 1340;
  const notes = fs.readFileSync(path.resolve(__dirname, '../turnaround_notes.html'), 'utf8');
  const cell = (img, label, dark) => `<div style="position:relative;background:#fff;border:2px solid #1b1b1d;width:600px;height:600px;overflow:hidden"><img src="${img}" style="width:100%;height:100%;object-fit:${dark ? 'contain' : 'cover'};background:#f6f4ef"/><div style="position:absolute;left:10px;top:8px;font-weight:900;font-size:20px;background:${dark ? '#d7272d' : '#1b1b1d'};color:#fff;padding:3px 9px;border-radius:6px">${label}</div></div>`;
  const html = `<html><body style="margin:0;background:#ecebe6;font-family:Inter,sans-serif">
  <div style="width:${sheetW}px;height:${sheetH}px;padding:24px 30px;box-sizing:border-box">
   <div style="font-weight:900;font-size:34px;color:#1b1b1d">RIDER TURNAROUND — v2 <span style="font-weight:600;font-size:20px;color:#666">satu 3D rig · 4 kamera · menunggu approval</span></div>
   <div style="display:grid;grid-template-columns:600px 600px 600px;gap:18px;margin-top:16px">
    ${cell(b64(ref), 'REFERENCE (rider_original.png)', true)}
    ${panels.map((p) => cell(b64(p.file), p.label)).join('')}
    <div style="width:600px;height:600px;background:#fff;border:2px solid #1b1b1d;box-sizing:border-box;padding:16px;font-size:15.5px;line-height:1.35;color:#222">${notes}</div>
   </div>
  </div></body></html>`;
  await page.setViewportSize({ width: sheetW, height: sheetH });
  await page.setContent(html);
  await page.screenshot({ path: path.join(OUT, 'perspective_turnaround.png') });
  await browser.close();
  console.log('ok');
})();

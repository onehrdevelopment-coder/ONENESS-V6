// Regenerates perspective_turnaround.png (approval sheet, current proportions) and character_master_sheet.png (5 views).
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { makeCamera } = require('./rig');
const M = require('./model');
const A = require('./anim');
const { frameSVG } = require('./frame');

const OUT = path.resolve(__dirname, '../../deliverables');
const W = 900, H = 900;
const callPose = () => { const P = A.poseAt(0.5); P.X = 0; P.pitch = 0; return P; };
const ridePose = () => M.defaultPose();
const cam = (az, el, scale, target = [58, 85, 0]) => ({ az, el, scale, target, dist: 900 });

const TURN = [
  ['1 · SIDE PROFILE (kanan, ikut ref)', callPose, cam(0, 3, 3.3)],
  ['2 · REAR THREE-QUARTER', ridePose, cam(132, 10, 3.6, [55, 85, 0])],
  ['3 · DIRECT REAR', ridePose, cam(90, 6, 4.0, [55, 88, 0])],
  ['4 · ELEVATED 45° REAR', ridePose, cam(90, 45, 3.8, [55, 72, 0])],
];
const MASTER = [
  ['A · LEFT SIDE PROFILE', ridePose, cam(180, 3, 3.3)],
  ['B · FRONT THREE-QUARTER', ridePose, cam(-48, 8, 3.5, [62, 85, 0])],
  ['C · REAR THREE-QUARTER', ridePose, cam(132, 10, 3.6, [55, 85, 0])],
  ['D · DIRECT REAR', ridePose, cam(90, 6, 4.0, [55, 88, 0])],
  ['E · ELEVATED REAR 45°', ridePose, cam(90, 45, 3.8, [55, 72, 0])],
  ['F · RIGHT SIDE (call pose, ikut ref)', callPose, cam(0, 3, 3.3)],
];

async function sheet(page, list, title, file, extra) {
  const cells = [];
  for (const [label, pose, c] of list) {
    const svg = frameSVG(M.buildScene(pose()), makeCamera({ ...c, cx: W / 2, cy: H / 2 + 60 }), { w: W, h: H, wobble: 1 });
    await page.setViewportSize({ width: W, height: H });
    await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
    cells.push({ label, b64: (await page.screenshot()).toString('base64') });
  }
  const cell = (src, label, red) => `<div style="position:relative;width:600px;height:600px;border:2px solid #1b1b1d;overflow:hidden;background:#f6f4ef"><img src="${src}" style="width:100%;height:100%;object-fit:${red ? 'contain' : 'cover'}"/><div style="position:absolute;left:10px;top:8px;font:900 20px Inter;background:${red ? '#d7272d' : '#1b1b1d'};color:#fff;padding:3px 9px;border-radius:6px">${label}</div></div>`;
  const items = (extra?.ref ? [cell(extra.ref, 'REFERENCE (rider_original.png)', true)] : []).concat(cells.map((c) => cell('data:image/png;base64,' + c.b64, c.label))).concat(extra?.notes ? [`<div style="width:600px;height:600px;background:#fff;border:2px solid #1b1b1d;box-sizing:border-box;padding:16px;font:15.5px/1.35 Inter;color:#222">${extra.notes}</div>`] : []);
  const rows = Math.ceil(items.length / 3);
  await page.setViewportSize({ width: 1920, height: 90 + rows * 618 });
  await page.setContent(`<body style="margin:0;background:#ecebe6;padding:24px 30px;font-family:Inter"><div style="font:900 34px Inter;color:#1b1b1d">${title}</div><div style="display:grid;grid-template-columns:repeat(3,600px);gap:18px;margin-top:16px">${items.join('')}</div></body>`);
  await page.screenshot({ path: path.join(OUT, file) });
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const ref = 'data:image/png;base64,' + fs.readFileSync(path.resolve(__dirname, '../../references/rider_ref_crop.png')).toString('base64');
  const notes = fs.readFileSync(path.resolve(__dirname, '../turnaround_notes.html'), 'utf8');
  await sheet(page, TURN, 'RIDER TURNAROUND — v3 (approved + revisi kecil) <span style="font:600 20px Inter;color:#666">satu 3D rig · 4 kamera</span>', 'perspective_turnaround.png', { ref, notes });
  await sheet(page, MASTER, 'CHARACTER MASTER SHEET — LAJU rider + RX-5 underbone <span style="font:600 20px Inter;color:#666">semua view dari model 3D yang sama</span>', 'character_master_sheet.png');
  await browser.close();
  console.log('sheets ok');
})();

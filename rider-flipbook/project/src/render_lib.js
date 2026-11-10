// Frame composer: pose + camera + scene + captions -> HTML page for one drawing.
'use strict';
const A = require('./anim');
const { frameSVG } = require('./frame');

const ground = A.buildGround();

function captionHTML(c) {
  if (!c) return '';
  return `<div class="cap" style="transform:translate(-50%,-50%) scale(${c.scale})"><span>${c.pre}</span><span class="hi">${c.hi}</span>${c.post ? `<span>${c.post}</span>` : ''}</div>`;
}
function klikHTML(k) {
  if (!k) return '';
  return `<div class="klik" style="transform:translate(-50%,-50%) rotate(-9deg) scale(${k})"><svg width="300" height="190" viewBox="-150 -95 300 190" style="position:absolute;left:-150px;top:-95px;overflow:visible">${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = (i / 8) * Math.PI * 2 + 0.2; return `<path d="M${Math.cos(a) * 95} ${Math.sin(a) * 62} L${Math.cos(a) * 135} ${Math.sin(a) * 86}" stroke="#1b1b1d" stroke-width="7" stroke-linecap="round"/>`; }).join('')}</svg><span>KLIK!</span></div>`;
}
const CSS = `body{margin:0;width:1080px;height:1920px;overflow:hidden;position:relative;font-family:'Inter Display','Inter',sans-serif}
.cap{position:absolute;left:540px;top:700px;white-space:nowrap;font-weight:900;font-size:76px;letter-spacing:1px;word-spacing:6px;color:#fff;-webkit-text-stroke:10px #141414;paint-order:stroke fill;}
.cap .hi{background:#e8325c;border-radius:16px;padding:0 16px 6px;margin-left:10px;box-shadow:0 0 0 4px #141414}
.klik{position:absolute;left:330px;top:620px;font-weight:900;font-size:96px;color:#fff;-webkit-text-stroke:16px #141414;paint-order:stroke fill;}
.klik span{position:relative;display:block;transform:translate(-50%,-50%)}`;

function frameHTML(t, i) {
  const P = A.poseAt(t);
  const { cam, os, shot } = A.cameraAt(t, P);
  const svg = frameSVG(A.sceneFor(P), cam, { seed: 3 + (i % 3), wobble: 1.0, ground: shot === 'gear' || shot === 'throttle' ? null : ground, os, under: A.speedLines(t, cam) });
  return { html: `<html><head><style>${CSS}</style></head><body>${svg}${captionHTML(A.captionAt(t))}${klikHTML(A.klikAt(t))}</body></html>`, shot };
}

module.exports = { frameHTML };

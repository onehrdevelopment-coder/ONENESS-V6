// 2.5D vector rig: rider + underbone motorcycle defined once in 3D (cm),
// projected through a camera and rendered as flat toon-shaded SVG with ink outlines.
// World axes: x = bike forward, y = up, z = rider's RIGHT side (camera side in the reference view).
'use strict';

const C = {
  ink: '#1b1b1d',
  red: '#d7272d', redS: '#a51c22',
  helm: '#d42a2f', helmS: '#9f1d22',
  visor: '#a3a7ab', visorS: '#73777c',
  hood: '#56616b', hoodS: '#3e474f',
  pants: '#2b2c30', pantsS: '#1d1e21',
  skin: '#f2c8a6', skinS: '#d9a684',
  hair: '#1f1f22',
  seat: '#2c2c2f', seatS: '#1f1f22',
  white: '#efeeea', whiteS: '#c9c7c2',
  silver: '#c7c9cc', silverS: '#94979b',
  dark: '#3a3c40', darkS: '#26282b',
  tire: '#2a2a2d', tireS: '#1c1c1e',
  strip: '#cfd3d7', stripS: '#a7abb0',
  shoe: '#2f3034', shoeS: '#1f2023',
  lens: '#e8eef2',
};

// ---------- vector math ----------
const v = (x, y, z) => [x, y, z];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => mul(a, 1 / (len(a) || 1));
const lerp3 = (a, b, t) => add(a, mul(sub(b, a), t));
const rad = (d) => (d * Math.PI) / 180;
const LIGHT = norm([-0.1, 0.85, 0.5]);

// ---------- camera ----------
function makeCamera({ target = [60, 75, 0], az = 0, el = 5, dist = 700, scale = 4, cx = 540, cy = 960, roll = 0 }) {
  const a = rad(az), e = rad(el);
  const dir = [-Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)];
  const pos = add(target, mul(dir, dist));
  const f = mul(dir, -1);
  let r = norm(cross(f, [0, 1, 0]));
  let u = cross(r, f);
  if (roll) { const c = Math.cos(rad(roll)), s = Math.sin(rad(roll)); const r2 = add(mul(r, c), mul(u, s)); u = add(mul(u, c), mul(r, -s)); r = r2; }
  return {
    pos, f, r, u, dist, scale, cx, cy,
    proj(p) {
      const d = sub(p, pos);
      const zc = dot(d, f);
      const k = (scale * dist) / zc;
      return { x: cx + dot(d, r) * k, y: cy - dot(d, u) * k, z: zc, k };
    },
    facing(p, n) { return dot(n, sub(pos, p)) > 0; },
  };
}

// ---------- scene primitives (3D, camera-independent) ----------
class Scene {
  constructor() { this.groups = []; }
  group(name, opts = {}) { const g = { name, items: [], bias: opts.bias || 0, outline: opts.outline ?? 2.4, wobble: opts.wobble ?? 1 }; this.groups.push(g); return g; }
}
// tube: capsule chain through points with radius r (cm)
const tube = (g, pts, r, col, shade, opt = {}) => g.items.push({ t: 'tube', pts, r, col, shade, ...opt });
// polygon face; n = normal for culling/shading (optional -> computed)
const face = (g, pts, col, shade, opt = {}) => g.items.push({ t: 'face', pts, col, shade, ...opt });
const sphere = (g, c, r, col, shade, opt = {}) => g.items.push({ t: 'sphere', c, r, col, shade, ...opt });
const patch = (g, sp, loop, col, opt = {}) => g.items.push({ t: 'patch', sp, loop, col, ...opt });
const text3 = (g, o, ux, uy, str, opt = {}) => g.items.push({ t: 'text', o, ux, uy, str, ...opt });
const shadow = (g, c, rx, rz, opt = {}) => g.items.push({ t: 'shadow', c, rx, rz, ...opt });

function faceNormal(pts) {
  let n = [0, 0, 0];
  for (let i = 0; i < pts.length; i++) n = add(n, cross(pts[i], pts[(i + 1) % pts.length]));
  return norm(n);
}

// prism: extrude a side profile [(x,y)...] across z with half width w (number or per-point array)
function prism(g, prof, zc, w, col, shade, opt = {}) {
  const W = (i) => (Array.isArray(w) ? w[i] : w);
  const L = prof.map(([x, y], i) => v(x, y, zc + W(i)));
  const R = prof.map(([x, y], i) => v(x, y, zc - W(i)));
  face(g, L, col, shade, { cull: true, ...opt });
  face(g, R.slice().reverse(), col, shade, { cull: true, ...opt });
  for (let i = 0; i < prof.length; i++) {
    const j = (i + 1) % prof.length;
    face(g, [L[j], L[i], R[i], R[j]], col, shade, { cull: true, band: true, ...opt });
  }
}

// oriented box: center, axes (unit) ax, ay, az, half sizes hx, hy, hz
function box(g, c, ax, ay, az, hx, hy, hz, col, shade, opt = {}) {
  const P = (sx, sy, sz) => add(add(add(c, mul(ax, sx * hx)), mul(ay, sy * hy)), mul(az, sz * hz));
  const F = [
    [P(1, -1, -1), P(1, 1, -1), P(1, 1, 1), P(1, -1, 1)],
    [P(-1, -1, 1), P(-1, 1, 1), P(-1, 1, -1), P(-1, -1, -1)],
    [P(-1, 1, -1), P(-1, 1, 1), P(1, 1, 1), P(1, 1, -1)],
    [P(-1, -1, 1), P(-1, -1, -1), P(1, -1, -1), P(1, -1, 1)],
    [P(-1, -1, 1), P(1, -1, 1), P(1, 1, 1), P(-1, 1, 1)],
    [P(1, -1, -1), P(-1, -1, -1), P(-1, 1, -1), P(1, 1, -1)],
  ];
  F.forEach((f) => face(g, f, col, shade, { cull: true, ...opt }));
  return P;
}

// circle in 3D
function circlePts(c, n, r, seg = 28, start = 0) {
  const a = norm(Math.abs(n[1]) < 0.9 ? cross(n, [0, 1, 0]) : cross(n, [1, 0, 0]));
  const b = cross(n, a);
  const out = [];
  for (let i = 0; i < seg; i++) { const t = start + (i / seg) * Math.PI * 2; out.push(add(c, add(mul(a, Math.cos(t) * r), mul(b, Math.sin(t) * r)))); }
  return out;
}

// ---------- SVG rendering ----------
const f1 = (n) => Math.round(n * 10) / 10;
function pathOf(pts, close) { return pts.map((p, i) => (i ? 'L' : 'M') + f1(p.x) + ' ' + f1(p.y)).join('') + (close ? 'Z' : ''); }

function render(scene, cam, opt = {}) {
  const ink = opt.ink || C.ink;
  const lightScr = (() => { const a = cam.proj([0, 0, 0]), b = cam.proj(mul(LIGHT, 40)); const d = Math.hypot(b.x - a.x, b.y - a.y) || 1; return [(b.x - a.x) / d, (b.y - a.y) / d]; })();
  const groups = [];
  for (const g of scene.groups) {
    const under = [], over = [], shadows = [];
    let dsum = 0, dn = 0;
    const items = [];
    for (const it of g.items) {
      const o = g.outline * (opt.os || 1);
      if (it.t === 'shadow') {
        const pts = [];
        for (let i = 0; i < 36; i++) { const t = (i / 36) * Math.PI * 2; pts.push(cam.proj(add(it.c, [Math.cos(t) * it.rx, 0, Math.sin(t) * it.rz]))); }
        shadows.push(`<path d="${pathOf(pts, true)}" fill="${it.col || 'rgba(40,30,30,0.13)'}"/>`);
        continue;
      }
      if (it.t === 'tube') {
        if (it.visN && !cam.facing(it.pts[0], it.visN)) continue;
        const P = it.pts.map((p) => cam.proj(p));
        if (P.some((q) => q.z < 30)) continue;
        const z = P.reduce((s, p) => s + p.z, 0) / P.length;
        const w = 2 * it.r * P[0].k;
        const d = pathOf(P, false);
        const segs = [];
        if (!it.noOutline) segs.push({ layer: 'u', s: `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${f1(w + 2 * o)}" stroke-linecap="round" stroke-linejoin="round"/>` });
        let body = `<path d="${d}" ${it.op ? `opacity="${it.op}"` : ''} fill="none" stroke="${it.shade || it.col}" stroke-width="${f1(w)}" stroke-linecap="round" stroke-linejoin="round"/>`;
        if (it.shade && w > 3) {
          const off = w * 0.17;
          body += `<path d="${d}" transform="translate(${f1(lightScr[0] * off)} ${f1(lightScr[1] * off)})" fill="none" stroke="${it.col}" stroke-width="${f1(w * 0.62)}" stroke-linecap="round" stroke-linejoin="round"/>`;
        }
        segs.push({ layer: 'o', s: body });
        items.push({ z: z + (it.zb || 0), segs, detail: it.detail });
      } else if (it.t === 'face') {
        const n = it.n || faceNormal(it.pts);
        const cen = mul(it.pts.reduce((s, p) => add(s, p), [0, 0, 0]), 1 / it.pts.length);
        if (it.cull && !cam.facing(cen, n)) continue;
        const P = it.pts.map((p) => cam.proj(p));
        if (P.some((q) => q.z < 30)) continue;
        const z = P.reduce((s, p) => s + p.z, 0) / P.length;
        const lit = dot(n, LIGHT);
        const col = it.shade && lit < (it.th ?? 0.08) ? it.shade : it.col;
        const d = pathOf(P, true);
        const segs = [];
        if (!it.noOutline) segs.push({ layer: 'u', s: `<path d="${d}" fill="${ink}" stroke="${ink}" stroke-width="${f1(2 * o)}" stroke-linejoin="round"/>` });
        segs.push({ layer: 'o', s: `<path d="${d}" fill="${col}" stroke="${it.line ? ink : col}" stroke-width="${it.line ? f1(o * 0.7) : 0.9}" stroke-linejoin="round"/>` });
        items.push({ z: z + (it.zb || 0), segs, detail: it.detail });
      } else if (it.t === 'sphere') {
        const P = cam.proj(it.c);
        const r = it.r * P.k;
        const segs = [{ layer: 'u', s: `<circle cx="${f1(P.x)}" cy="${f1(P.y)}" r="${f1(r + o)}" fill="${ink}"/>` }];
        let body = `<circle cx="${f1(P.x)}" cy="${f1(P.y)}" r="${f1(r)}" fill="${it.shade || it.col}"/>`;
        if (it.shade) body += `<circle cx="${f1(P.x + lightScr[0] * r * 0.16)}" cy="${f1(P.y + lightScr[1] * r * 0.16)}" r="${f1(r * 0.82)}" fill="${it.col}"/>`;
        segs.push({ layer: 'o', s: body });
        items.push({ z: P.z + (it.zb || 0), segs, detail: it.detail });
      } else if (it.t === 'patch') {
        // loop of [theta, phi] (deg) on sphere sp = {c, r, fwd, up}; theta from forward toward left(+side)
        const { c, r, fwd, up } = it.sp;
        const left = cross(fwd, up); // fwd(+x) x up(+y) = +z = rider's left
        const Pc = cam.proj(c);
        const R = (it.rs || 1) * r;
        const Rs = R * Pc.k;
        const toCam = norm(sub(cam.pos, c));
        const D = ([th, ph]) => { const t = rad(th), p = rad(ph); return norm(add(add(mul(fwd, Math.cos(p) * Math.cos(t)), mul(left, Math.cos(p) * Math.sin(t))), mul(up, Math.sin(p)))); };
        // densify
        const src = it.loop, dirs = [];
        const nL = it.open ? src.length - 1 : src.length;
        for (let i = 0; i < nL; i++) { const a = src[i], b = src[(i + 1) % src.length]; for (let k = 0; k < 4; k++) dirs.push(D([a[0] + (b[0] - a[0]) * k / 4, a[1] + (b[1] - a[1]) * k / 4])); }
        if (it.open) dirs.push(D(src[src.length - 1]));
        const P3 = (d) => cam.proj(add(c, mul(d, R)));
        const sAng = (q) => Math.atan2(q.y - Pc.y, q.x - Pc.x);
        const arcPts = (a0, a1) => { let da = a1 - a0; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI; const n = Math.max(1, Math.ceil(Math.abs(da) / 0.15)); const o = []; for (let k = 1; k < n; k++) { const a = a0 + da * k / n; o.push({ x: Pc.x + Math.cos(a) * Rs, y: Pc.y + Math.sin(a) * Rs }); } return o; };
        const sv = dirs.map((d) => dot(d, toCam) - 0.02);
        let vis = sv.filter((x) => x > 0).length;
        const pts = []; let exitAng = null;
        const N = dirs.length, last = it.open ? N - 1 : N;
        for (let i = 0; i < N; i++) {
          if (sv[i] > 0) pts.push(P3(dirs[i]));
          if (i >= last) break;
          const j = (i + 1) % N;
          if ((sv[i] > 0) !== (sv[j] > 0)) {
            const t = sv[i] / (sv[i] - sv[j]);
            const q = P3(norm(add(mul(dirs[i], 1 - t), mul(dirs[j], t))));
            const a = sAng(q);
            const qq = { x: Pc.x + Math.cos(a) * Rs, y: Pc.y + Math.sin(a) * Rs };
            if (sv[i] > 0) { pts.push(qq); exitAng = a; }
            else { if (exitAng !== null && !it.open) pts.push(...arcPts(exitAng, a)); pts.push(qq); exitAng = null; }
          }
        }
        if (exitAng !== null && !it.open && pts.length) pts.push(...arcPts(exitAng, sAng(pts[0])));
        if (vis < (it.minVis || 2)) continue;
        const d = pathOf(pts, !it.open);
        const lw = f1(it.lw ?? o * 0.8);
        const s = it.open
          ? `<path d="${d}" fill="none" stroke="${it.col}" stroke-width="${lw}" stroke-linecap="round" stroke-linejoin="round"/>`
          : `<path d="${d}" fill="${it.col}" stroke="${it.stroke || ink}" stroke-width="${lw}" stroke-linejoin="round"/>`;
        items.push({ z: Pc.z - 1000 + (it.zb || 0), zr: Pc.z, segs: [{ layer: 'o', s }], detail: true, order: it.order || 0 });
      } else if (it.t === 'text') {
        const n = cross(it.ux, it.uy);
        if (it.cull !== false && !cam.facing(it.o, n)) continue;
        const O = cam.proj(it.o), X = cam.proj(add(it.o, norm(it.ux))), Y = cam.proj(add(it.o, mul(norm(it.uy), -1)));
        const m = [X.x - O.x, X.y - O.y, Y.x - O.x, Y.y - O.y, O.x, O.y].map((q) => f1(q * 100) / 100);
        const s = `<text transform="matrix(${m.join(' ')})" font-family="${it.font || 'Inter, DejaVu Sans, sans-serif'}" font-weight="${it.weight || 900}" font-size="${it.size || 1}" font-style="${it.italic ? 'italic' : 'normal'}" fill="${it.col || '#fff'}" text-anchor="${it.anchor || 'middle'}" ${it.stroke ? `stroke="${it.stroke}" stroke-width="${it.sw || 0.08}" paint-order="stroke"` : ''}>${it.str}</text>`;
        items.push({ z: O.z - 2000, zr: O.z, segs: [{ layer: 'o', s }], detail: true });
      }
    }
    if (!items.length && !shadows.length) continue;
    for (const it of items) { dsum += it.zr ?? it.z; dn++; }
    const base = items.filter((i) => !i.detail).sort((a, b) => b.z - a.z);
    const det = items.filter((i) => i.detail).sort((a, b) => (a.order || 0) - (b.order || 0) || b.z - a.z);
    for (const it of base) for (const s of it.segs) (s.layer === 'u' ? under : over).push(s.s);
    for (const it of det) for (const s of it.segs) (s.layer === 'u' ? under : over).push(s.s);
    groups.push({ name: g.name, z: (dn ? dsum / dn : 1e9) + g.bias, svg: `<g data-n="${g.name}">${under.join('')}${over.join('')}</g>`, shadows: shadows.join(''), wob: g.wobble });
  }
  groups.sort((a, b) => b.z - a.z);
  return { shadows: groups.map((g) => g.shadows).join(''), body: groups.map((g) => g.svg).join('') };
}

// apply point transform fp and vector transform fv to every item in groups passing filter
function transformScene(S, fp, fv, filter = () => true) {
  for (const g of S.groups) {
    if (!filter(g)) continue;
    for (const it of g.items) {
      if (it.pts) it.pts = it.pts.map(fp);
      if (it.c) it.c = fp(it.c);
      if (it.o) { it.o = fp(it.o); it.ux = fv(it.ux); it.uy = fv(it.uy); }
      if (it.n) it.n = fv(it.n);
      if (it.visN) it.visN = fv(it.visN);
      if (it.sp) it.sp = { ...it.sp, c: fp(it.sp.c), fwd: fv(it.sp.fwd), up: fv(it.sp.up) };
    }
  }
}
const rotZ = (p, a, piv = [0, 0, 0]) => { const c = Math.cos(a), s = Math.sin(a), x = p[0] - piv[0], y = p[1] - piv[1]; return [piv[0] + x * c - y * s, piv[1] + x * s + y * c, p[2]]; };

module.exports = { transformScene, rotZ, C, v, add, sub, mul, dot, cross, len, norm, lerp3, rad, Scene, tube, face, sphere, patch, text3, shadow, prism, box, circlePts, makeCamera, render, faceNormal };

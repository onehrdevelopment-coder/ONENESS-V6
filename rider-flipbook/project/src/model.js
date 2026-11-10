// Character + motorcycle model. One definition, every camera angle.
'use strict';
// Pose keys: armL/legL = rider's left (-z), armR/legR = rider's right (+z, camera side in reference view).
const R = require('./rig');
const { C, v, add, sub, mul, norm, cross, lerp3, rad, tube, face, sphere, patch, text3, shadow, prism, box, circlePts } = R;

// ---------------- default pose (riding, both hands on bars, feet on pegs) ----------------
function defaultPose() {
  return {
    pelvis: v(38, 88, 0),
    chest: v(50, 131, 0),
    head: v(57, 155, 0), headFwd: norm(v(1, -0.08, 0)), headUp: norm(v(0.08, 1, 0)),
    // arms: shoulder -> elbow -> wrist -> hand tip ; L = +z (left)
    armR: [v(51, 132, 17), v(72, 114, 25), v(94, 105, 31), v(99, 104.5, 31.5)],
    armL: [v(51, 132, -17), v(72, 114, -25), v(94, 105, -31), v(99, 104.5, -31.5)],
    legR: [v(40, 86, 10), v(72, 80, 17), v(58, 37, 17), v(69, 28, 18)],
    legL: [v(40, 86, -10), v(72, 80, -17), v(58, 37, -17), v(69, 28, -18)],
    phone: null, // {pos, fwd, up}
    blink: 0, mouth: 0,
    wheelRot: 0, gear: 0, throttle: 0, lean: 0,
  };
}

// --------------------------------- motorcycle ---------------------------------
function buildBike(S, st = {}) {
  const rot = st.wheelRot || 0;
  const gear = st.gear || 0;
  const RW = v(0, 29, 0), FW = v(124, 29, 0);

  S.group('shadow', { bias: 1e6 }).items.push({ t: 'shadow', c: v(60, 0, 0), rx: 92, rz: 26 });

  // wheels ---------------------------------------------------------------
  const wheel = (name, c, front) => {
    const g = S.group(name);
    const tirePts = circlePts(c, [0, 0, 1], 25.5, 40, rot).map((p) => p);
    for (let i = 0; i < 40; i += 4) tube(g, tirePts.slice(i, i + 5).concat(i + 4 >= 40 ? [tirePts[0]] : []), 4.2, C.tire, null);
    const rimPts = circlePts(c, [0, 0, 1], 20.5, 32, rot);
    tube(g, rimPts.concat([rimPts[0], rimPts[1]]), 1.5, C.white, null, { detail: false });
    for (let k = 0; k < 5; k++) {
      const a = rot + (k / 5) * Math.PI * 2;
      const a2 = a + 0.42;
      const hub = add(c, v(Math.cos(a) * 4, Math.sin(a) * 4, 0));
      const mid = add(c, v(Math.cos(a + 0.2) * 12, Math.sin(a + 0.2) * 12, 0));
      const rim = add(c, v(Math.cos(a2) * 20, Math.sin(a2) * 20, 0));
      tube(g, [hub, mid, rim], 1.6, C.white, null);
    }
    tube(g, [add(c, v(0, 0, -5)), add(c, v(0, 0, 5))], 4.6, C.silver, C.silverS);
    if (front) {
      const dg = S.group(name + '_disc', { outline: 1.6 });
      face(dg, circlePts(add(c, v(0, 0, 5.5)), [0, 0, 1], 11, 24, rot), C.silver, null, { line: true });
      face(dg, circlePts(add(c, v(0, 0, 5.7)), [0, 0, 1], 5, 16, rot), C.dark, null, { line: true, detail: true });
      // caliper
      prism(dg, [[118, 37], [124, 41], [127, 38], [121, 33]], 6.5, 1.6, C.dark, C.darkS);
    }
  };
  wheel('wheelR', RW, false);
  wheel('wheelF', FW, true);

  // front fork + fender ----------------------------------------------------
  const fork = S.group('fork');
  [7.5, -7.5].forEach((z) => {
    tube(fork, [v(108, 86, z), v(116, 58, z)], 2.3, C.dark, C.darkS);
    tube(fork, [v(116, 58, z), v(124, 30, z)], 2.8, C.silver, C.silverS);
  });
  const fen = S.group('fenderF');
  const arc = (r, a0, a1, n) => Array.from({ length: n }, (_, i) => { const a = rad(a0 + ((a1 - a0) * i) / (n - 1)); return [124 + Math.cos(a) * r, 29 + Math.sin(a) * r]; });
  const fa = arc(31, 20, 150, 12), fb = arc(34, 150, 20, 12);
  prism(fen, fa.concat(fb), 0, 6.5, C.red, C.redS);

  // rear swingarm, shocks, chain case, exhaust ----------------------------
  const sw = S.group('swing');
  [9, -9].forEach((z) => tube(sw, [v(0, 29, z), v(48, 36, z * 0.9)], 2.2, C.dark, C.darkS));
  const chain = S.group('chaincase', { bias: -2 });
  prism(chain, [[-2, 33], [46, 39], [48, 33], [44, 27], [-2, 25], [-6, 29]], -11.5, 1.2, C.seat, C.seatS);
  [10.5, -10.5].forEach((z, i) => {
    const sh = S.group('shock' + i);
    tube(sh, [v(4, 31, z), v(14, 70, z)], 1.6, C.silver, null);
    const sp = [];
    for (let k = 0; k <= 8; k++) sp.push(lerp3(v(5.5, 37, z), v(12.5, 64, z), k / 8));
    tube(sh, sp, 2.8, C.red, C.redS);
  });
  const ex = S.group('exhaust');
  tube(ex, [v(76, 30, 6), v(64, 21, 12), v(40, 22, 14)], 2.2, C.dark, C.darkS);
  tube(ex, [v(40, 23, 14), v(4, 34, 14)], 5.4, C.silver, C.silverS);
  tube(ex, [v(4, 34, 14), v(-4, 36, 14)], 3.4, C.dark, null);

  // engine block (centre, low) ----------------------------------------------
  const eng = S.group('engine');
  prism(eng, [[50, 20], [80, 20], [86, 30], [84, 40], [70, 44], [52, 42], [46, 32]], 0, 11, C.dark, C.darkS);
  prism(eng, [[80, 30], [92, 34], [92, 42], [84, 42]], 0, 6, C.silverS, C.dark); // cylinder head
  const engDet = S.group('engineL', { outline: 1.4 });
  face(engDet, circlePts(v(62, 31, 11.4), [0, 0, 1], 6, 18), C.silverS, null, { line: true }); // clutch cover L
  face(engDet, circlePts(v(62, 31, -11.4), [0, 0, -1], 6, 18), C.silverS, null, { line: true, cull: true, n: [0, 0, -1] });

  // body: white centre/legshield, red rear body, red front cowl ------------
  const body = S.group('legshield');
  const lsProf = [[98, 104], [104, 94], [100, 70], [92, 52], [80, 42], [66, 40], [60, 44], [72, 50], [84, 60], [90, 78], [92, 100]];
  prism(body, lsProf, 0, [16, 18, 19, 18, 16, 13, 12, 12, 13, 14, 14], C.white, C.whiteS);
  const floor = S.group('floor');
  prism(floor, [[82, 44], [86, 42], [56, 40], [52, 44]], 0, 13, C.white, C.whiteS);

  const rear = S.group('rearbody');
  const rbProf = [[70, 76], [68, 64], [58, 52], [42, 48], [24, 50], [8, 58], [-4, 68], [-9, 76], [-6, 80], [20, 79]];
  prism(rear, rbProf, 0, [12, 12, 11, 11, 11, 10.5, 10, 9, 9, 11], C.red, C.redS);
  // white side panel inset (like the reference's silver/white mid-panel)
  const rbd = S.group('rearbody_det', { outline: 1.4, bias: -1 });
  face(rbd, [[64, 72], [62, 62], [54, 55], [44, 54], [40, 60], [46, 70]].map(([x, y]) => v(x, y, 11.6)), C.white, null, { line: true, cull: true, n: [0, 0, 1] });
  face(rbd, [[64, 72], [62, 62], [54, 55], [44, 54], [40, 60], [46, 70]].reverse().map(([x, y]) => v(x, y, -11.6)), C.white, null, { line: true, cull: true, n: [0, 0, -1] });
  // fictional model badge
  text3(rbd, v(26, 62, 11.2), v(9, 0, 0), v(0, 9, 0), 'RX-5', { size: 5.6, col: '#fff', stroke: C.ink, sw: 0.12, italic: true });
  text3(rbd, v(26, 62, -11.2), v(-9, 0, 0), v(0, 9, 0), 'RX-5', { size: 5.6, col: '#fff', stroke: C.ink, sw: 0.12, italic: true });

  const tail = S.group('tail', { outline: 1.6 });
  prism(tail, [[-6, 79], [-10, 78], [-11, 72], [-7, 72]], 0, 6, '#f08a2a', '#c9661a');
  // rear fender + plate
  const rp = S.group('plate', { outline: 1.6 });
  prism(rp, [[-6, 70], [-16, 64], [-17, 58], [-9, 62]], 0, 5, C.dark, C.darkS);
  face(rp, [v(-16.5, 66, 9), v(-16.5, 66, -9), v(-17.5, 56, -9), v(-17.5, 56, 9)], '#f4f4f2', null, { line: true, cull: true });
  text3(rp, v(-17.6, 59.6, 0), v(0, 0, 1), v(0, 1, 0), 'VBK 2611', { size: 3.4, col: C.ink, weight: 800, cull: true });

  const seat = S.group('seat');
  prism(seat, [[72, 78], [69, 84], [46, 86], [12, 87], [-4, 84], [-7, 79], [20, 78]], 0, [10, 12, 13, 13, 11, 9, 12], C.seat, C.seatS);

  const cowl = S.group('cowl');
  prism(cowl, [[96, 104], [110, 108], [118, 100], [118, 86], [110, 80], [100, 86]], 0, [9, 10, 10, 9, 8, 8], C.red, C.redS);
  // headlight + handlebar cover
  const hc = S.group('hbcover');
  prism(hc, [[96, 108], [106, 112], [116, 108], [116, 102], [100, 102]], 0, 10, C.red, C.redS);
  face(hc, circlePts(v(117.2, 105, 0), [1, 0, 0], 3.6, 16), C.lens, null, { line: true, cull: true, detail: true });
  // indicator lamps
  [8.5, -8.5].forEach((z) => tube(hc, [v(115, 101, z), v(117, 101, z)], 1.6, '#f08a2a', null));
  // front plate on fender (Malaysian style)
  face(fen, [v(156, 44, 5.5), v(156, 44, -5.5), v(154, 53, -5.5), v(154, 53, 5.5)].map((p) => add(p, v(-2, 0, 0))), C.white, null, { line: true, cull: true, detail: true });

  // handlebars, grips, mirrors, levers -------------------------------------
  const thr = st.throttle || 0; // radians of throttle twist
  ['L', 'R'].forEach((s) => {
    const z = s === 'L' ? 1 : -1;
    const g = S.group('bar' + s, { bias: -3 });
    tube(g, [v(102, 106, 8 * z), v(99, 104.5, 27 * z)], 1.1, C.silver, null);
    tube(g, [v(99, 104.5, 26 * z), v(99, 104.5, 36 * z)], 1.9, C.seat, null);
    // brake / clutch lever
    tube(g, [v(101, 105.5, 24 * z), v(104, 104, 33 * z)], 0.7, C.silver, null);
    const mg = S.group('mirror' + s, { outline: 2 });
    tube(mg, [v(101, 107, 22 * z), v(98, 118, 24 * z), v(97, 125, 26 * z)], 0.6, C.dark, null);
    face(mg, circlePts(v(97, 127, 26.5 * z), [0.9, 0, 0.2 * z], 4, 16), C.seat, null, { line: true });
  });
  // throttle grip marker (shows twist)
  const tg = S.group('throttleMark', { outline: 1, bias: -4 });
  const ta = -0.4 + thr;
  tube(tg, [v(99 + Math.cos(ta) * 1.95, 104.5 + Math.sin(ta) * 1.95, 27.5), v(99 + Math.cos(ta) * 1.95, 104.5 + Math.sin(ta) * 1.95, 35)], 0.35, '#8a8d91', null, { noOutline: true });

  // footpegs + gear rocker (left) + rear brake pedal (right) ---------------
  const pg = S.group('pegs');
  [1, -1].forEach((z) => tube(pg, [v(58, 27, 11 * z), v(58, 27, 21 * z)], 1.4, C.seat, null));
  const gr = S.group('gear', { outline: 1.8 });
  const piv = v(60, 29, -14);
  const ga = rad(-6 + gear * 14); // + = toe down
  const toe = add(piv, v(Math.cos(ga) * 11, -Math.sin(ga) * 11, -2.5));
  const heel = add(piv, v(-Math.cos(ga) * 9, Math.sin(ga) * 9, -2.5));
  tube(gr, [heel, piv, toe], 0.9, C.silver, null);
  tube(gr, [add(toe, v(0, 0, 0.5)), add(toe, v(0, 0, -3))], 1.3, C.seat, null);
  tube(gr, [add(heel, v(0, 0, 0.5)), add(heel, v(0, 0, -3))], 1.3, C.seat, null);
  sphere(gr, piv, 1.3, C.dark, null);
  tube(pg, [v(56, 28, 13), v(70, 26, 18)], 0.9, C.silver, null);

  return { RW, FW, piv, toe, heel };
}

// --------------------------------- rider ---------------------------------
function buildRider(S, P) {
  const pel = P.pelvis, ch = P.chest;
  const ax = norm(sub(ch, pel));
  const back = norm(cross(v(0, 0, 1), ax)); // points backward
  // legs
  ['L', 'R'].forEach((s) => {
    const L = P['leg' + s];
    const g = S.group('leg' + s);
    tube(g, [L[0], L[1]], 7.6, C.pants, C.pantsS);
    tube(g, [L[1], L[2]], 6.2, C.pants, C.pantsS);
    tube(g, [L[1], lerp3(L[1], L[2], 0.5)], 6.9, C.pants, C.pantsS);
    const sg = S.group('shoe' + s, { bias: -1 });
    tube(sg, [add(L[2], v(-3, -2, 0)), L[3]], 4.4, C.shoe, C.shoeS);
    tube(sg, [add(L[2], v(-4, -5.4, 0)), add(L[3], v(1, -3.4, 0))], 1.2, '#e9e9e6', null, { detail: true, noOutline: true });
  });
  // torso (hoodie)
  const tg = S.group('torso');
  const mid = lerp3(pel, ch, 0.5);
  tube(tg, [add(pel, v(0, 2, 0)), mid], 14.5, C.hood, C.hoodS);
  tube(tg, [mid, ch], 15.5, C.hood, C.hoodS);
  tube(tg, [add(ch, v(0, 1, 15)), add(ch, v(0, 1, -15))], 9.5, C.hood, C.hoodS);
  tube(tg, [add(pel, v(0, 2, 11)), add(pel, v(0, 2, -11))], 9, C.pants, C.pantsS);
  // hoodie pocket line / zipper hint on the front
  const front = mul(back, -1);
  const zp = S.group('torso_det', { outline: 1.2, bias: -0.5 });
  tube(zp, [add(lerp3(pel, ch, 0.15), mul(front, 15)), add(lerp3(pel, ch, 0.85), mul(front, 16.2))], 0.35, C.hoodS, null, { noOutline: true });
  // hood bunched at neck back
  tube(tg, [add(ch, add(mul(back, 9), v(0, 9, 7))), add(ch, add(mul(back, 11), v(0, 10, 0))), add(ch, add(mul(back, 9), v(0, 9, -7)))], 6.5, C.hoodS, C.hoodS);
  // neck
  const ng = S.group('neck', { bias: 2 });
  tube(ng, [add(ch, v(2, 8, 0)), add(P.head, v(-2, -10, 0))], 5, C.skin, C.skinS);

  // arms
  ['L', 'R'].forEach((s) => {
    const A = P['arm' + s];
    const g = S.group('arm' + s, { bias: s === 'L' ? -1 : 0 });
    tube(g, [A[0], A[1]], 5.6, C.hood, C.hoodS);
    tube(g, [A[1], A[2]], 4.8, C.hood, C.hoodS);
    tube(g, [lerp3(A[1], A[2], 0.86), A[2]], 5.2, C.hoodS, null); // cuff
    tube(g, [A[2], A[3]], 3.3, C.skin, C.skinS);
  });

  // delivery box backpack
  const bg = S.group('box', { bias: -6 });
  const up = ax, out = back, zz = v(0, 0, 1);
  const bc = add(lerp3(pel, ch, 0.5), mul(out, 27));
  box(bg, bc, out, up, zz, 12.5, 22, 21, C.red, C.redS);
  const stripC = add(bc, mul(up, 13));
  box(bg, stripC, out, up, zz, 12.8, 2.3, 21.3, C.strip, C.stripS);
  // lid seam
  const bgd = S.group('box_det', { outline: 1.2, bias: -7 });
  // logo on both side faces (fictional brand)
  [1, -1].forEach((sd) => {
    const o = add(add(add(bc, mul(zz, 21.4 * sd)), mul(up, 1)), mul(out, 0));
    const ux = mul(out, -1 * sd * 15);
    text3(bgd, o, mul(ux, 1 / 15 * 15), up, 'LAJU', { size: 7.5, col: '#fff', italic: true, weight: 900 });
    text3(bgd, add(o, mul(up, -6)), ux, up, 'EXPRESS', { size: 3.6, col: '#fff', weight: 700 });
  });
  // back face logo (seen from rear)
  text3(bgd, add(add(bc, mul(out, 12.9)), mul(up, 1)), v(0, 0, 16), up, 'LAJU', { size: 10, col: '#fff', italic: true });
  text3(bgd, add(add(bc, mul(out, 12.9)), mul(up, -5)), v(0, 0, 16), up, 'EXPRESS', { size: 4.6, col: '#fff', weight: 700 });
  // straps
  [1, -1].forEach((sd) => {
    const g = S.group('strap' + (sd > 0 ? 'L' : 'R'), { outline: 1.4, bias: sd > 0 ? -2 : 2 });
    const z = 12 * sd;
    tube(g, [add(add(ch, mul(back, 14)), v(0, 9, z)), add(ch, v(4, 11, z)), add(add(ch, mul(front, 15)), v(0, -2, z * 1.05)), add(add(lerp3(pel, ch, 0.55), mul(front, 6)), v(0, 0, z * 1.35))], 1.5, C.seat, null);
  });

  // head + helmet
  buildHead(S, P);

  // phone
  if (P.phone) {
    const pg = S.group('phone', { outline: 1.4, bias: -20 });
    box(pg, P.phone.pos, P.phone.fwd, P.phone.up, norm(cross(P.phone.fwd, P.phone.up)), 1, 7, 3.4, C.seat, C.ink);
  }
}

function buildHead(S, P) {
  const c = P.head, fwd = P.headFwd, up = P.headUp;
  const left = norm(cross(fwd, up));
  const sp = { c, r: 15, fwd, up };
  const g = S.group('head', { bias: -1 });
  // face: skin sphere slightly smaller, helmet shell drawn as patches over it
  sphere(g, c, 15, C.helm, C.helmS);
  // face opening (skin)
  const loop = (pts) => pts;
  const opening = [];
  for (let i = 0; i <= 16; i++) { const t = -62 + (124 * i) / 16; opening.push([t, 14 - Math.abs(t) * 0.05]); }
  for (let i = 0; i <= 10; i++) { const t = 62 - (124 * i) / 10; opening.push([t, -50 - (1 - Math.abs(t) / 62) * 18]); }
  patch(g, sp, opening, C.skin, { order: 1, rs: 1.002 });
  // hair fringe under the helmet brow
  const fringe = [];
  for (let i = 0; i <= 12; i++) { const t = -58 + (116 * i) / 12; fringe.push([t, 15]); }
  for (let i = 0; i <= 12; i++) { const t = 58 - (116 * i) / 12; fringe.push([t, 5 + Math.abs(Math.sin(i * 1.3)) * 4 - Math.abs(t) * 0.04]); }
  patch(g, sp, fringe, C.hair, { order: 2, rs: 1.004 });
  // helmet brow rim (red edge band around opening)
  const rim = [];
  for (let i = 0; i <= 16; i++) { const t = -66 + (132 * i) / 16; rim.push([t, 13 - Math.abs(t) * 0.05]); }
  patch(g, sp, rim, C.helmS, { order: 3, open: true, lw: 3.2, rs: 1.006 });
  // ear area / helmet cheek edge lines
  [1, -1].forEach((sd) => {
    const e = [];
    for (let i = 0; i <= 10; i++) e.push([sd * (62 + i * 0.4), 13 - i * 7.5]);
    patch(g, sp, e, C.ink, { order: 3, open: true, lw: 2.2, rs: 1.006 });
  });
  // visor (raised, grey) – shell over the top-front
  const vis = [];
  for (let i = 0; i <= 18; i++) { const t = -88 + (176 * i) / 18; vis.push([t, 13 + Math.cos(rad(t)) * 9]); }
  for (let i = 0; i <= 18; i++) { const t = 80 - (160 * i) / 18; vis.push([t * 0.9, 74 - Math.abs(t) * 0.1]); }
  patch(g, sp, vis, C.visor, { order: 4, rs: 1.07 });
  const vline = [];
  for (let i = 0; i <= 18; i++) { const t = -76 + (152 * i) / 18; vline.push([t, 30 + Math.cos(rad(t)) * 4]); }
  patch(g, sp, vline, C.visorS, { order: 5, open: true, lw: 2.4, rs: 1.075, stroke: C.visorS });
  // visor pivot on both sides
  [1, -1].forEach((sd) => patch(g, sp, circleLoop(sd * 84, 18, 6), C.visorS, { order: 6, rs: 1.07 }));
  // glasses + eyes + nose + mouth (on face sphere)
  [1, -1].forEach((sd) => {
    const th = sd * 24, ph = -6;
    patch(g, sp, circleLoop(th, ph, 7.5), 'rgba(230,240,245,0.35)', { order: 7, rs: 1.06, lw: 2.2 });
    if (!P.blink) patch(g, sp, circleLoop(th - sd * 2, ph - 1, 1.6), C.ink, { order: 8, rs: 1.02, lw: 0.5 });
    else patch(g, sp, [[th - 6, ph - 1], [th + 4, ph - 1]], C.ink, { order: 8, open: true, rs: 1.02, lw: 2 });
    patch(g, sp, [[th - 7, ph + 9], [th + 6, ph + 11]].map(([a, b]) => [sd > 0 ? a + 2 : a - 2, b]), C.hair, { order: 8, open: true, rs: 1.02, lw: 2.6 });
    // glasses temple arm going back to the helmet
    patch(g, sp, [[sd * 31.5, ph + 1], [sd * 62, ph + 3]], C.ink, { order: 7, open: true, rs: 1.04, lw: 2 });
  });
  patch(g, sp, [[-16.5, -4.5], [16.5, -4.5]], C.ink, { order: 7, open: true, rs: 1.07, lw: 2 });
  // mouth
  const mo = P.mouth || 0;
  if (mo > 0.2) patch(g, sp, circleLoop(0, -36, 2.5 + mo * 2), '#7a2b2b', { order: 7, rs: 1.0, lw: 1.6 });
  else patch(g, sp, [[-6, -35], [5, -36]], C.ink, { order: 7, open: true, rs: 1.0, lw: 1.8 });
  // nose: small tube out of the face
  const ng = S.group('nose', { outline: 2, bias: -999 });
  const nb = add(c, add(mul(fwd, 14.4), mul(up, -2.5)));
  // only draw nose silhouette when face is somewhat visible (handled by depth naturally)
  tube(ng, [add(nb, mul(up, 3)), add(nb, add(mul(fwd, 2.6), mul(up, -2.6)))], 1.5, C.skin, null, { visN: fwd });
  // chin strap
  const cs = [];
  for (let i = 0; i <= 10; i++) cs.push([-70 + i * 14, -56 - Math.cos(rad(-70 + i * 14)) * 10]);
  patch(g, sp, cs, C.ink, { order: 6, open: true, lw: 2.2, rs: 1.0 });
}
function circleLoop(t, p, r, n = 14) { return Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [t + Math.cos(a) * r, p + Math.sin(a) * r]; }); }

function buildScene(pose = defaultPose()) {
  const S = new R.Scene();
  buildBike(S, pose);
  buildRider(S, pose);
  return S;
}

module.exports = { defaultPose, buildScene, buildBike, buildRider };

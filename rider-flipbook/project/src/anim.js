// 14-second timeline: pose + camera + overlays as a pure function of time.
// Drawings are made at 12 fps (t = i/12); the encoder later holds them on 30 fps (2:3 cadence).
'use strict';
const R = require('./rig');
const { v, add, sub, mul, norm, lerp3, rotZ, transformScene, makeCamera, C } = R;
const M = require('./model');

const FPS_DRAW = 12, DURATION = 14;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const sm = (u) => u * u * (3 - 2 * u);
const easeOut = (u) => 1 - (1 - u) * (1 - u);
const lerp = (a, b, u) => a + (b - a) * u;
const lerpArr = (A, B, u) => A.map((p, i) => lerp3(p, B[i], u));
// keyframe track: [[t, value], ...] values = number | vec3 | vec3[] ; smoothstep between keys
function track(keys, t, ease = sm) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, a] = keys[i], [t1, b] = keys[i + 1];
    if (t <= t1) {
      const u = ease(seg(t, t0, t1));
      if (typeof a === 'number') return lerp(a, b, u);
      if (Array.isArray(a[0])) return lerpArr(a, b, u);
      return lerp3(a, b, u);
    }
  }
  return keys[keys.length - 1][1];
}

// ---------------- vehicle motion ----------------
const T_GO = 7.75, ACC = 450, VMAX = 850;
const T_VMAX = T_GO + VMAX / ACC;
function bikeX(t) {
  if (t <= T_GO) return 0;
  if (t <= T_VMAX) return 0.5 * ACC * (t - T_GO) ** 2;
  return 0.5 * ACC * (T_VMAX - T_GO) ** 2 + VMAX * (t - T_VMAX);
}
const bikeV = (t) => (t <= T_GO ? 0 : t <= T_VMAX ? ACC * (t - T_GO) : VMAX);
const accelN = (t) => (t > T_GO && t <= T_VMAX ? 1 : 0);

// damped springs driven by acceleration (box lag, body pitch, rider inertia), precomputed
function springTrack(omega, zeta, gain) {
  const dt = 1 / 600, out = [];
  let x = 0, vel = 0;
  for (let t = 0; t <= DURATION + 0.01; t += dt) {
    const target = gain * accelN(t);
    const a = -omega * omega * (x - target) - 2 * zeta * omega * vel;
    vel += a * dt; x += vel * dt;
    out.push(x);
  }
  return (t) => out[Math.min(out.length - 1, Math.max(0, Math.round(t * 600)))];
}
const boxSpring = springTrack(11, 0.28, 0.085);
const pitchSpring = springTrack(9, 0.5, 0.014);
const leanSpring = springTrack(8, 0.45, 1);

// ---------------- key poses ----------------
const HEAD_OFF = v(7, 25, 0);
const pkOf = (pel, ch) => { const ax = norm(sub(ch, pel)); const front = v(ax[1], -ax[0], 0); return add(lerp3(pel, ch, 0.3), mul(front, 13.2)); };
const leftEar = norm(v(0.86, 0, -0.5));

function poseAt(t) {
  const P = M.defaultPose();
  const pel = P.pelvis;
  // ---- torso / posture ----
  const breath = t < 5.3 ? Math.sin((t / 2.4) * Math.PI * 2) * 0.5 : 0;
  let ch = track([[0, v(49, 136, 0)], [4.0, v(49, 136, 0)], [4.25, v(48.5, 137.5, 0)], [4.8, v(51, 135, 0)], [7.6, v(51, 135, 0)], [7.75, v(53, 134, 0)]], t);
  const lean = leanSpring(t); // inertia: pushed back on launch
  ch = add(ch, v(-2.8 * lean + (t > T_GO ? 1.2 * sm(seg(t, 8.4, 9.2)) : 0), breath, 0));
  P.chest = ch;
  const sh = (zs) => add(ch, v(1, 1, 15 * zs));
  // ---- head ----
  const fCall = norm(v(0.5, -0.05, 0.86));
  const fLook = norm(v(0.82, -0.52, 0.22));
  const fPocket = norm(v(0.95, -0.3, 0.12));
  const fRoad = norm(v(1, -0.08, 0));
  P.headFwd = norm(track([[0, fCall], [2.6, fCall], [2.95, fLook], [3.25, fLook], [3.5, fPocket], [4.05, fPocket], [4.6, fRoad]], t));
  P.headUp = norm(v(0.06, 1, 0));
  const headLag = v(-1.6 * lean, -0.3 * lean, 0);
  P.head = add(add(ch, HEAD_OFF), headLag);
  // ---- left arm: phone -> look -> pocket -> grip ----
  const ear = add(add(ch, HEAD_OFF), mul(leftEar, 16.2));
  const pk = pkOf(pel, ch);
  const A_call = [sh(-1), add(ch, v(11, -18, -6)), add(ch, v(20, 5, -3)), add(ear, v(-1, -5, 2))];
  const A_away = [sh(-1), add(ch, v(12, -19, -7)), add(ch, v(22, 2, -2)), add(ear, v(2, -8, 4))];
  const A_look = [sh(-1), add(ch, v(9, -21, -8)), add(ch, v(19, -8, 2)), add(ch, v(24, -5, 3))];
  const A_tap = [sh(-1), add(ch, v(9, -22, -8)), add(ch, v(19, -9.5, 2)), add(ch, v(24, -6.5, 3))];
  const A_pocket = [sh(-1), add(ch, v(-4, -24, -20)), add(pk, v(-3, 4, -11)), add(pk, v(1, 0, -4))];
  const A_in = [sh(-1), add(ch, v(-3, -25, -19)), add(pk, v(-1, 3, -9)), add(pk, v(2, -1, -1))];
  const A_out = [sh(-1), add(ch, v(2, -22, -21)), add(pk, v(4, 8, -14)), add(pk, v(9, 9, -17))];
  const A_grip = P.armL.map((p, i) => (i === 0 ? sh(-1) : p));
  P.armL = track([[0, A_call], [2.4, A_call], [2.65, A_away], [3.0, A_look], [3.08, A_tap], [3.17, A_look], [3.5, A_pocket], [3.62, A_in], [3.78, A_in], [3.95, A_out], [4.5, A_grip]], t);
  P.onGripL = t >= 4.5;
  P.armBias = { L: t > 2.6 && t < 4.4 ? -25 : t < 2.6 ? -1 : -1 };
  // phone follows the left hand
  if (t < 3.7) {
    const tip = P.armL[3];
    let fwd, up, s = 1;
    if (t < 2.4) { fwd = leftEar; up = norm(v(-0.3, 1, -0.2)); }
    else {
      const fLookP = norm(v(-0.6, 0.8, 0)), uLookP = norm(v(0.8, 0.6, 0));
      const fPk = norm(v(0.97, -0.24, 0)), uPk = norm(v(0.15, -0.35, 0.92));
      fwd = norm(track([[2.4, leftEar], [3.0, fLookP], [3.17, fLookP], [3.5, fPk]], t));
      up = norm(track([[2.4, norm(v(-0.3, 1, -0.2))], [3.0, uLookP], [3.17, uLookP], [3.5, uPk]], t));
      s = track([[3.5, 1], [3.62, 0.35], [3.7, 0.05]], t);
    }
    const pos = t < 2.4 ? ear : add(tip, mul(up, 2.5 * s));
    P.phone = { pos, fwd, up, s, bias: t < 2.4 ? -20 : -26 };
  }
  // ---- right arm: on throttle the whole time; regrip in S3, twist in S5 ----
  let tw = track([[0, 0], [4.7, 0], [4.8, -0.1], [4.95, 0], [6.75, 0], [6.85, -0.09], [7.2, 0.75], [7.3, 0.42], [7.5, 0.85], [7.75, 0.6], [8.3, 0.7], [9.6, 0.55]], t);
  P.gripR.twist = tw;
  const rel = v(-5, 1, 0);
  const wristR = add(P.gripR.c, rotZ(rel, tw));
  P.armR = [sh(1), add(add(ch, v(24, -17, 24)), v(0, -2.5 * Math.max(0, tw), 0)), wristR, P.gripR.c];
  P.armL[0] = sh(-1);
  if (P.onGripL) P.armL[1] = add(ch, v(24, -17, -24));
  P.throttle = tw;
  // ---- legs ----
  const LR_down = [v(39, 86, 9.5), v(70, 75, 18), v(68, 12, 21), v(79, 3, 22)];
  const LR_push = [v(39, 86, 9.5), v(71, 78, 18), v(64, 16, 20), v(76, 7, 21)];
  const LR_lift = [v(39, 86, 9.5), v(74, 84, 17), v(62, 40, 17), v(72, 34, 18)];
  const LR_peg = P.legR;
  P.legR = track([[0, LR_down], [7.62, LR_down], [7.8, LR_push], [8.0, LR_lift], [8.25, LR_peg]], t);
  // left foot: rests near gear toe pad, shifts into 1st during S4
  const LL = (toe, ank = v(58, 37, -16.5)) => [v(39, 86, -9.5), v(73, 81, -16), ank, toe];
  const restL = LL(v(67, 33, -17.5));
  const liftL = LL(v(70.5, 38, -17), v(58.5, 39, -16.5));
  const pressL = LL(v(71, 33.2, -17), v(58.5, 37.5, -16.5));
  P.legL = track([[0, restL], [5.5, restL], [5.7, liftL], [5.85, pressL], [6.0, pressL], [6.13, liftL], [6.4, restL]], t);
  P.gear = track([[0, 0], [5.72, 0], [5.85, 1], [6.02, 1], [6.1, -0.18], [6.18, 0.08], [6.26, 0]], t, (u) => u);
  // ---- face ----
  P.mouth = t > 0.3 && t < 2.15 && Math.sin(t * 17) > 0.1 ? 0.5 : 0;
  P.blink = (t > 1.25 && t < 1.42) || (t > 4.62 && t < 4.72) ? 1 : 0;
  // ---- secondary motion ----
  P.boxTilt = boxSpring(t) + (t < 5.3 ? breath * 0.004 : 0);
  // ---- vehicle ----
  const X = bikeX(t);
  P.X = X;
  P.wheelRot = -X / 29;
  const wd = bikeV(t) / 29 / FPS_DRAW;
  P.spinBlur = clamp((wd - 0.6) / 0.8);
  P.pitch = pitchSpring(t);
  return P;
}

// ---------------- scene for a pose ----------------
function sceneFor(P) {
  const S = M.buildScene(P);
  const isWheel = (g) => /^wheel|^shadow/.test(g.name);
  if (P.pitch) transformScene(S, (p) => rotZ(p, P.pitch, [0, 29, 0]), (d) => rotZ(d, P.pitch), (g) => !isWheel(g));
  if (P.X) transformScene(S, (p) => [p[0] + P.X, p[1], p[2]], (d) => d);
  return S;
}

// ---------------- ground / road (minimal) ----------------
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function buildGround(opts = {}) {
  const S = new R.Scene();
  const r = rng(11);
  const mk = (x0, x1, z0, z1, col, g) => R.face(g, [v(x0, 0.2, z1), v(x1, 0.2, z1), v(x1, 0.2, z0), v(x0, 0.2, z0)], col, null, { n: [0, 1, 0] });
  const lines = S.group('roadlines', { outline: 1.1, wobble: 1 });
  for (let x = -900; x < 6000; x += 400) mk(x, x + 190, 106, 116, '#e4e0d8', lines); // centre dashes (left-hand traffic: rider in left lane)
  for (let x = -900; x < 6000; x += 300) mk(x, x + 300, -166, -160, '#dcd8cf', lines); // left edge
  for (let x = -900; x < 6000; x += 300) mk(x, x + 300, 376, 382, '#dcd8cf', lines); // right edge
  const tex = S.group('roadtex', { outline: 0 });
  for (let i = 0; i < 260; i++) {
    const x = -900 + r() * 6900, z = -150 + r() * 520, l = 3 + r() * 9;
    R.face(tex, [v(x, 0.1, z), v(x + l, 0.1, z), v(x + l, 0.1, z + 1.6), v(x, 0.1, z + 1.6)], '#d9d4ca', null, { n: [0, 1, 0], noOutline: true });
  }
  const tuft = S.group('tufts', { outline: 0.8 });
  for (let x = -800; x < 6000; x += 260 + r() * 260) {
    const z = -195 - r() * 45;
    for (let k = -1; k <= 1; k++) R.tube(tuft, [v(x + k * 3, 0, z), v(x + k * 6 + 2, 9 + r() * 5, z + k * 2)], 0.7, '#8e978b', null, { noOutline: true });
  }
  const drains = S.group('drains', { outline: 1 });
  for (let x = 300; x < 6000; x += 1300) {
    mk(x, x + 50, -158, -138, '#bdb9b1', drains);
    for (let k = 1; k < 5; k++) mk(x + k * 10 - 1, x + k * 10 + 1, -156, -140, '#8f8b84', drains);
  }
  return S;
}

// ---------------- cameras per shot ----------------
const SIDE = { az: 0, el: 4, scale: 5.0, dist: 900, cy: 1330 };
function cameraAt(t, P) {
  const X = P.X;
  if (t >= 5.3 && t < 6.5) return { shot: 'gear', cam: makeCamera({ az: 192, el: 9, target: [66, 32, -15], dist: 450, scale: 19, cx: 540, cy: 1100 }), os: 3 };
  if (t >= 6.5 && t < 7.6) return { shot: 'throttle', cam: makeCamera({ az: 8, el: 12, target: [97, 104.5, 32], dist: 400, scale: 30, cx: 520, cy: 1080 }), os: 3.4 };
  if (t < 9.6) {
    const drift = 16 * sm(seg(t, 7.9, 9.4));
    return { shot: t < 5.3 ? 'side_call' : 'side_go', cam: makeCamera({ ...SIDE, target: [60 + X - drift, 85, 0], cx: 540 }), os: 1 };
  }
  // orbit: right side -> rear three-quarter -> rear, real re-projection of the 3D rig
  const az = track([[9.6, 0], [10.35, 45], [10.75, 52], [11.5, 90]], t);
  const elO = track([[9.6, 4], [11.5, 9]], t);
  const drift = 16 * (1 - sm(seg(t, 9.6, 10.6)));
  const lift = sm(seg(t, 11.5, 13.3));
  const el = lerp(elO, 45, lift);
  const scale = lerp(track([[9.6, 5.0], [11.5, 5.8]], t), 4.5, lift);
  const ahead = 45 * lift;
  return {
    shot: t < 11.5 ? 'orbit' : 'drone',
    cam: makeCamera({ az, el, target: [60 + X - drift + ahead, lerp(85, 55, lift), 0], dist: lerp(900, 1100, lift), scale, cx: 540, cy: lerp(1330, 1240, lift) }),
    os: 1,
  };
}

// ---------------- captions + overlays ----------------
const CAPTIONS = [
  { a: 0.25, b: 2.4, pre: 'Dah dekat, ', hi: 'boss…', post: '' },
  { a: 4.0, b: 5.3, pre: 'Baru nak ', hi: 'gerak.', post: '' },
  { a: 7.7, b: 9.6, pre: 'Okay, ', hi: 'gerak!', post: '' },
  { a: 11.85, b: 14.0, pre: 'ON THE ', hi: 'WAY.', post: '' },
];
function captionAt(t) {
  const c = CAPTIONS.find((c) => t >= c.a - 1e-6 && t < c.b);
  if (!c) return null;
  const k = Math.round((t - c.a) * FPS_DRAW);
  const sc = [0.84, 1.05, 1.0][Math.min(k, 2)];
  return { ...c, scale: sc };
}
const klikAt = (t) => (t >= 5.82 && t < 6.35 ? [0.7, 1.12, 1.0][Math.min(2, Math.round((t - 5.82) * FPS_DRAW))] : 0);

function speedLines(t, cam) {
  if (t < 8.15 || t >= 9.6) return '';
  const r = rng(1000 + Math.round(t * FPS_DRAW));
  const k = clamp(bikeV(t) / VMAX);
  let s = '';
  const n = Math.round(4 + 5 * k);
  for (let i = 0; i < n; i++) {
    const y = 980 + r() * 760, len = (70 + r() * 170) * (0.5 + k);
    const x = 40 + r() * 380;
    s += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} L${(x + len).toFixed(1)} ${y.toFixed(1)}" stroke="#1b1b1d" stroke-opacity="${(0.25 + 0.35 * r()).toFixed(2)}" stroke-width="${(2 + r() * 2.5).toFixed(1)}" stroke-linecap="round"/>`;
  }
  return s;
}

module.exports = { FPS_DRAW, DURATION, poseAt, sceneFor, buildGround, cameraAt, captionAt, klikAt, speedLines, CAPTIONS, bikeV, bikeX, T_GO };

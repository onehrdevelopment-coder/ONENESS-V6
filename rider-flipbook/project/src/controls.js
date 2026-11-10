// Dump control curves (1 kHz) used by the audio synth so sound follows the exact animation.
'use strict';
const fs = require('fs');
const path = require('path');
const A = require('./anim');
const out = { rate: 1000, tw: [], v: [], gear: [], mouth: [] };
for (let i = 0; i <= A.DURATION * 1000; i++) {
  const t = i / 1000, P = A.poseAt(t);
  out.tw.push(+P.throttle.toFixed(4)); out.v.push(+A.bikeV(t).toFixed(1)); out.gear.push(+P.gear.toFixed(3)); out.mouth.push(P.mouth);
}
fs.writeFileSync(path.resolve(__dirname, '../out/controls.json'), JSON.stringify(out));
console.log('controls ok');

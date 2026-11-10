// Wrap a rendered scene into a full SVG frame with paper background + hand-drawn line wobble.
'use strict';
const { render } = require('./rig');

function frameSVG(scene, cam, { w = 1080, h = 1920, seed = 3, wobble = 1.3, bg = '#f6f4ef', under = '', over = '', ground = null, os = 1 } = {}) {
  const r = render(scene, cam, { os });
  const gr = ground ? render(ground, cam, { os }) : { shadows: '', body: '' };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs>
 <filter id="paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9 0.04" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.43  0 0 0 0 0.40  0 0 0 0.07 0"/></filter>
 <filter id="ink" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="${seed}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${wobble * 2}" xChannelSelector="R" yChannelSelector="G"/></filter>
</defs>
<rect width="100%" height="100%" fill="${bg}"/>
<rect width="100%" height="100%" filter="url(#paper)"/>
<g filter="url(#ink)">${gr.body}${under}${r.shadows}${r.body}</g>
${over}
</svg>`;
}
module.exports = { frameSVG };

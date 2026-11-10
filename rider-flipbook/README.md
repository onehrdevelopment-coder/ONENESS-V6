# Rider Flipbook — status: TURNAROUND APPROVAL GATE

Animation is **not built yet**, by design: the brief says to wait for approval of the reconstructed views first.

## What's here
- `references/rider_original.png` is the supplied reference (the art is by a third party, @amierdanial_art). Used for style matching only.
- `deliverables/perspective_turnaround.png` is the 4-angle turnaround with the reference and a list of differences.
- `deliverables/view_*.svg|png` are the individual views (the SVGs can be edited).
- `project/src/rig.js` is the 2.5D vector renderer: 3D points → camera → toon-shaded SVG with ink outlines.
- `project/src/model.js` defines the rider and motorcycle once in 3D (cm); every angle comes from this one definition.
- `project/src/frame.js` builds a frame: paper grain plus a hand-drawn line wobble filter. Changing the seed per frame gives line boil.
- `project/src/turnaround.js` renders the turnaround sheet.

## Reproduce
```
cd rider-flipbook/project
node src/turnaround.js     # needs Node 22 + Playwright Chromium (preinstalled in this env)
```
Free toolchain only: Node, Playwright/Chromium and FFmpeg (for the later MP4). No paid services.

## Why a 3D-defined vector rig
Rear and 45° views are true re-projections of the same geometry. They are not a flat image rotated or flipped. The same pose
data will drive the animation: wheel spin, gear rocker angle, throttle twist and phone hand path, stepped at 12 fps inside 30 fps.

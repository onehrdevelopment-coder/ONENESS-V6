# Rider Flipbook — 14 s vertical 2D animation (LAJU delivery rider)

## Deliverables (`deliverables/`)
| File | What it is |
|---|---|
| `rider_flipbook_final.mp4` | 1080×1920, 30 fps, 14.0 s, H.264 + AAC. Drawings are made at 12 fps and held in a 2:3 cadence |
| `character_master_sheet.png` | 6 views: left, front ¾, rear ¾, rear, elevated rear 45°, and right side in the call pose |
| `perspective_turnaround.png` | The approval sheet (reference plus 4 angles and a list of differences), regenerated with the revised proportions |
| `storyboard_contact_sheet.png` | 18 frames covering every action and every camera change |
| `qa_frames_from_mp4.png` | QA frames pulled from the encoded MP4 itself |
| `captions.srt` | Caption timings |

## Reproduce
```bash
cd rider-flipbook/project
node src/render.js        # 168 drawings -> out/frames (~65 s)
node src/controls.js      # exports throttle/speed/gear curves for audio
python3 src/audio.py      # procedural audio -> out/audio.wav (numpy only)
ffmpeg -y -framerate 12 -i out/frames/d_%04d.png -i out/audio.wav \
  -vf "fps=30,format=yuv420p" -c:v libx264 -preset slow -crf 17 -movflags +faststart \
  -c:a aac -b:a 192k -shortest ../deliverables/rider_flipbook_final.mp4
node src/sheets.js        # master sheet + turnaround
node src/contact.js out.png 0.5 3 6 ...   # contact sheet at any times
```
Requirements: Node 22, Playwright Chromium, Python 3 + numpy, FFmpeg. Everything is free. No paid services and no stock assets.

## How it works
- `src/rig.js` is a 2.5D vector renderer. Primitives are tubes, faces, boxes, spheres and patches on a sphere, all defined in 3D (cm). Each is projected by a camera and drawn as flat 2-tone cel-shaded SVG with ink outlines.
- `src/model.js` is the rider and the RX-5 underbone. They are defined **once**, so every angle is a true re-projection of the same geometry and nothing is a flipped or rotated flat image. Axes: x is forward, y is up, z is the rider's right (the camera side in the reference view).
- `src/anim.js` holds the whole timeline as a pure function of time: poses, phone path, gear rocker, throttle twist and wrist drop, bike kinematics (constant acceleration to 30 km/h), wheel spin from distance, spring-driven box lag, rider inertia, suspension pitch, cameras and captions.
- `src/render_lib.js` / `src/render.js` compose each frame: paper grain, a line-wobble filter whose seed changes every drawing (subtle line boil), and HTML captions above it with no boil.
- `src/audio.py` synthesizes everything procedurally: a single-cylinder engine driven by the throttle curve and road speed, the rider's murmur synced to mouth flaps, the earpiece, the hang-up tone, cloth rustle, and the gear clunk at the exact frame the lever bottoms out.

## Shot list
| Time | Shot |
|---|---|
| 0–2.4 | Right side, on the phone (blink, mouth, breathing). "Dah dekat, boss…" |
| 2.4–4.0 | Phone comes away, he looks at it and taps to end the call, then slides it into the hoodie pocket (continuous path, shrinks into the pocket) |
| 4.0–5.3 | Left hand back to the bar, posture settles, right hand re-grips. "Baru nak gerak." |
| 5.3–6.5 | Left-side close-up: toe lifts, presses the rocker's toe pedal down (N→1), lever springs back. KLIK! |
| 6.5–7.6 | Throttle close-up: bar-end notch and hand rotate together, wrist drops, revs rise |
| 7.6–9.6 | Side view: foot push-off, acceleration, wheels roll at the distance-matched rate (spin streaks at speed), box lag, speed lines. "Okay, gerak!" |
| 9.6–11.5 | Camera orbits right side → rear ¾ → rear (real re-projection, stepped at 12 fps) |
| 11.5–14 | Drone rise to a 45° elevated rear view, minimal road (left-hand traffic lane, dashes, edges, a few tufts and drains), hold. "ON THE WAY." |

## Known deviations / limitations
- The style is vector-geometric, which is less organic than the hand-drawn reference (agreed at the approval gate).
- The phone is in the **left** hand, as in the reference. The brief text says "right hand returns to the throttle", but the right hand stays on the throttle the whole time.
- The reference shows the bike's **right** side, so the main profile follows the reference. The gear close-up uses the left side, which is where the shifter is.
- Branding is fictional: LAJU EXPRESS, plate VBK 2611, badge RX-5. The reference art belongs to a third-party artist. Keep that in mind before any commercial use.

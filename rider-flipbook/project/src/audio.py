"""Procedural sound design (no samples, no licences needed): engine, phone, cloth, gear click.
Reads out/controls.json (exported from the animation) so every sound is locked to picture."""
import json, wave, os
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'out')
SR = 44100
ctl = json.load(open(os.path.join(OUT, 'controls.json')))
N = int(14.0 * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)

def curve(name):
    c = np.array(ctl[name], dtype=float)
    return np.interp(t, np.arange(len(c)) / ctl['rate'], c)

def onepole(x, fc):
    """one-pole lowpass, vectorised via exponential smoothing in chunks"""
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x); acc = 0.0
    # python loop is fine for 600k samples
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y

def env(t0, att, dec):
    e = np.zeros(N); m = t >= t0
    tt = t[m] - t0
    e[m] = np.minimum(1, tt / max(att, 1e-4)) * np.exp(-np.maximum(0, tt - att) / dec)
    return e

def smooth(x, ms):
    k = max(1, int(SR * ms / 1000)); w = np.ones(k) / k
    return np.convolve(x, w, mode='same')

tw = np.clip(curve('tw'), 0, None)
v = curve('v')
mouth = curve('mouth')

# ---------------- engine (single-cylinder 4-stroke, ~110cc) ----------------
rpm = 1350 + 6200 * tw + 3.2 * v                       # throttle + road load
gear = curve('gear')
rpm -= 260 * np.clip(gear, 0, 1) * (t > 5.8) * (t < 6.3)  # load dip when 1st engages
rpm = smooth(rpm, 60)
rpm += 25 * np.sin(2 * np.pi * 0.9 * t)                  # idle wobble
f = rpm / 120.0                                          # firing frequency
phase = np.cumsum(f) / SR
frac = phase % 1.0
pulse = np.exp(-frac * 7.0)                              # exhaust pulse per firing
eng = np.zeros(N)
for h in range(1, 42):                                   # harmonics shaped by exhaust resonances
    fh = f * h
    w = (np.exp(-((fh - 110) / 90) ** 2) * 1.0 + np.exp(-((fh - 420) / 180) ** 2) * 0.55 + np.exp(-((fh - 1100) / 400) ** 2) * 0.25) / h ** 0.35
    eng += w * np.sin(2 * np.pi * h * phase + h * 0.7)
rasp = rng.standard_normal(N) * pulse
rasp = smooth(rasp, 0.6) * (0.25 + 0.6 * np.clip(tw, 0, 1))
eng = eng / np.max(np.abs(eng)) + rasp * 0.9
# level: idle quieter, revs louder; recede as camera moves behind/up after 9.6 s
lvl = 0.32 + 0.45 * np.clip(tw, 0, 1) + 0.15 * np.clip(v / 850, 0, 1)
recede = np.interp(t, [0, 9.6, 11.5, 14], [1, 1, 0.72, 0.5])
eng *= lvl * recede
# muffle the far shots a touch
far = np.interp(t, [0, 9.6, 14], [0, 0, 1])
eng = eng * (1 - 0.45 * far) + onepole(eng, 900) * 0.45 * far

# road/tyre + wind noise with speed
road = onepole(rng.standard_normal(N), 500) * 0.9 * np.clip(v / 850, 0, 1) ** 1.3 * recede
wind = onepole(rng.standard_normal(N), 1500) * 0.08 * np.clip((v - 300) / 550, 0, 1)

# ---------------- phone call (rider murmur, soft, synced with mouth) ----------------
m = smooth(mouth, 40)
buzz_ph = np.cumsum(118 + 14 * np.sin(2 * np.pi * 3.1 * t)) / SR
buzz = np.sign(np.sin(2 * np.pi * buzz_ph)) * 0.5
voice = onepole(buzz, 900) - onepole(buzz, 220)
voice *= m * 0.22
earpiece = (onepole(rng.standard_normal(N), 2600) - onepole(rng.standard_normal(N), 700)) * 0.05
syll = (np.sin(2 * np.pi * 5.3 * t) > 0.2) * 1.0
earpiece *= smooth(syll, 30) * ((t > 1.75) & (t < 2.35))   # boss's tiny reply from the earpiece
# hang-up tone: "tut-tut" when thumb taps (3.10 s)
beep = np.zeros(N)
for t0 in (3.12, 3.30):
    beep += np.sin(2 * np.pi * 620 * t) * env(t0, 0.005, 0.07) * ((t - t0) < 0.12)
beep *= 0.22

# ---------------- cloth rustle ----------------
def rustle(t0, dur, amp):
    n = rng.standard_normal(N)
    hp = n - onepole(n, 1800)
    e = np.clip((t - t0) / 0.05, 0, 1) * np.clip((t0 + dur - t) / 0.12, 0, 1)
    flutter = 0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 9 * t + 1.3))
    return hp * e * flutter * amp
cloth = rustle(2.45, 0.35, 0.05) + rustle(3.3, 0.5, 0.09) + rustle(4.0, 0.55, 0.07) + rustle(7.62, 0.45, 0.05)

# ---------------- gear engagement ----------------
tg = 5.84
thud = np.sin(2 * np.pi * 85 * (t - tg)) * env(tg, 0.002, 0.07)
click = (lambda n: n - onepole(n, 3000))(rng.standard_normal(N)) * env(tg, 0.0005, 0.012)
ring = np.sin(2 * np.pi * 2350 * (t - tg)) * env(tg, 0.001, 0.035)
lever_back = (lambda n: n - onepole(n, 2500))(rng.standard_normal(N)) * env(6.1, 0.0005, 0.01)
gearfx = (thud * 0.55 + click * 0.5 + ring * 0.12 + lever_back * 0.18) * 0.45

mix = eng * 0.55 + road * 0.25 + wind + voice + earpiece + beep + cloth + gearfx
# master: gentle fade-in/out + soft limiter
mix *= np.clip(t / 0.15, 0, 1) * np.clip((14.0 - t) / 0.45, 0, 1)
mix = np.tanh(mix * 1.4) / np.tanh(1.4)
mix *= 0.89 / max(1e-6, np.max(np.abs(mix)))
pcm = (mix * 32767).astype('<i2')
st = np.repeat(pcm[:, None], 2, axis=1)
with wave.open(os.path.join(OUT, 'audio.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
print('audio ok', len(pcm) / SR, 's')

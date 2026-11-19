"""Generate the original, instrumental website preview. Requires lameenc."""
import math
import struct
from pathlib import Path

import lameenc

RATE = 22050
DURATION = 16
CHORDS = [(45, 52, 55, 60), (41, 48, 52, 55), (48, 55, 59, 64), (43, 50, 55, 59)]


def note(midi, time):
    phase = math.tau * 440 * 2 ** ((midi - 69) / 12) * time
    return math.sin(phase) + .24 * math.sin(phase * 2) + .09 * math.sin(phase * 3)


def sample(t):
    sound = 0
    for i, chord in enumerate(CHORDS):
        dt = t - i * 4
        if 0 <= dt < 5:
            envelope = min(dt / .65, 1) * min((5 - dt) / 1.5, 1)
            sound += .11 * envelope * sum(note(key, dt) for key in chord) / len(chord)
        for beat, step in enumerate((1, 2, 3, 2, 1, 3, 2, 3)):
            d = dt - beat * .5
            if 0 <= d < 1.5:
                sound += .085 * min(d / .035, 1) * math.exp(-4 * d) * note(chord[step] + 12, d)
    return int(32767 * sound * min(t / .2, (DURATION - t) / .55, 1))


if __name__ == '__main__':
    encoder = lameenc.Encoder()
    encoder.set_in_sample_rate(RATE)
    encoder.set_channels(1)
    encoder.set_bit_rate(64)
    encoder.set_quality(3)
    pcm = b''.join(struct.pack('<h', sample(i / RATE)) for i in range(RATE * DURATION))
    Path('public/media/night-preview.mp3').write_bytes(encoder.encode(pcm) + encoder.flush())

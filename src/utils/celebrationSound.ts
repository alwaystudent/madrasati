import { zzfx, ZZFX } from 'zzfx';

const MUTE_KEY = 'manarat_khamisa_sound_muted';

export function isCelebrationSoundMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setCelebrationSoundMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch {
    // ignore storage errors
  }
}

async function ensureAudioReady(): Promise<boolean> {
  if (isCelebrationSoundMuted()) return false;
  try {
    if (ZZFX.audioContext && ZZFX.audioContext.state === 'suspended') {
      await ZZFX.audioContext.resume();
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Plays a short, bright two-note encouraging chime via ZzFX when earning points.
 */
export async function playPointsChime(): Promise<void> {
  if (!(await ensureAudioReady())) return;
  try {
    const note1 = ZZFX.GetNote(7, 440); // E5
    const note2 = ZZFX.GetNote(12, 440); // A5
    zzfx(0.35, 0.02, note1, 0.01, 0.04, 0.14, 0, 1.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.7);
    window.setTimeout(() => {
      try {
        zzfx(0.4, 0.02, note2, 0.01, 0.05, 0.2, 0, 1.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.7);
      } catch {
        // ignore audio errors
      }
    }, 110);
  } catch {
    // ignore audio errors when blocked by autoplay policy
  }
}

/**
 * Plays a cheerful short 4-note ascending achievement fanfare via ZzFX when opening a new badge chest.
 */
export async function playBadgeChestFanfare(): Promise<void> {
  if (!(await ensureAudioReady())) return;
  try {
    // Ascending C5 -> E5 -> G5 -> C6 crystalline chime fanfare
    const notes = [
      { freq: 523.25, delay: 0, release: 0.16, vol: 0.38 },
      { freq: 659.25, delay: 95, release: 0.16, vol: 0.4 },
      { freq: 783.99, delay: 190, release: 0.18, vol: 0.42 },
      { freq: 1046.5, delay: 295, release: 0.36, vol: 0.48 },
    ];

    notes.forEach(({ freq, delay, release, vol }) => {
      window.setTimeout(() => {
        try {
          zzfx(
            vol,
            0.01,
            freq,
            0.015,
            0.06,
            release,
            0, // clean sine wave
            1.15,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0.78,
            0.04
          );
        } catch {
          // ignore
        }
      }, delay);
    });
  } catch {
    // ignore audio errors when autoplay is blocked before gesture
  }
}

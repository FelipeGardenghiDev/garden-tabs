import { TabTrack } from '../types';

export const STANDARD_TUNING = ['e', 'B', 'G', 'D', 'A', 'E'];
export const STANDARD_TUNING_MIDI = [64, 59, 55, 50, 45, 40]; // E4, B3, G3, D3, A2, E2

export function fretToMidi(stringIndex: number, fret: number, baseMidi = STANDARD_TUNING_MIDI): number {
  return baseMidi[stringIndex] + fret;
}

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Synthesizes a plucked acoustic/electric guitar sound using Web Audio API.
 */
export function playPluckedNote(frequency: number, duration = 0.8): void {
  if (typeof window === 'undefined') return;
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  // Plucked guitar timbre: sawtooth with lowpass damping
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(frequency, now);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(3000, now);
  filter.frequency.exponentialRampToValueAtTime(300, now + duration);

  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration);
}

/**
 * Serializes tab track to standard plain text ASCII tablature.
 */
export function serializeTabToAscii(track: TabTrack): string {
  const lines: string[] = STANDARD_TUNING.map((stringName) => `${stringName}|`);

  track.measures.forEach((measure) => {
    measure.columns.forEach((col) => {
      for (let s = 0; s < 6; s++) {
        const fret = col.notes[s];
        if (fret === null || fret === undefined) {
          lines[s] += '---';
        } else {
          const fretStr = fret.toString();
          lines[s] += `-${fretStr}${'-'.repeat(Math.max(1, 2 - fretStr.length))}`;
        }
      }
    });

    for (let s = 0; s < 6; s++) {
      lines[s] += '|';
    }
  });

  return lines.join('\n');
}

export const INITIAL_SMOKE_ON_THE_WATER: TabTrack = {
  id: 'tab-1',
  title: 'Smoke on the Water (Riff Principal)',
  tuning: STANDARD_TUNING,
  bpm: 112,
  timeSignature: [4, 4],
  measures: [
    {
      id: 1,
      columns: [
        { notes: [null, null, null, 0, null, null] },
        { notes: [null, null, null, null, null, null] },
        { notes: [null, null, null, 3, null, null] },
        { notes: [null, null, null, null, null, null] },
        { notes: [null, null, null, 5, null, null] },
        { notes: [null, null, null, null, null, null] },
        { notes: [null, null, null, 0, null, null] },
        { notes: [null, null, null, null, null, null] },
      ],
    },
    {
      id: 2,
      columns: [
        { notes: [null, null, null, 3, null, null] },
        { notes: [null, null, null, null, null, null] },
        { notes: [null, null, null, 6, null, null] },
        { notes: [null, null, null, 5, null, null] },
        { notes: [null, null, null, null, null, null] },
        { notes: [null, null, null, null, null, null] },
        { notes: [null, null, null, null, null, null] },
        { notes: [null, null, null, null, null, null] },
      ],
    },
  ],
};

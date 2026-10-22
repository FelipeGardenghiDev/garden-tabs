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

/**
 * Parses raw 6-line ASCII tablature text into a structured TabTrack.
 * Supports string indicators (e, B, G, D, A, E), pipe delimiters and techniques (h, p, /, b, ~).
 */
export function parseAsciiToTabTrack(
  rawText: string,
  title: string = 'Tablatura Importada',
  bpm: number = 120
): TabTrack {
  const allLines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Group lines into 6-string tab blocks
  const tabLines = allLines.filter((l) => /[-|0-9]{5,}/.test(l));

  if (tabLines.length < 6) {
    return {
      id: `tab-${Date.now()}`,
      title,
      tuning: STANDARD_TUNING,
      bpm,
      timeSignature: [4, 4],
      measures: [
        {
          id: 1,
          columns: Array(8).fill(null).map(() => ({ notes: [null, null, null, null, null, null] })),
        },
      ],
    };
  }

  // Take the first block of 6 lines
  const stringLines = tabLines.slice(0, 6);

  // Strip string prefixes like 'e|', 'B|', '1|', 'e:'
  const cleanedLines = stringLines.map((line) => {
    return line.replace(/^[a-gA-G1-6]?[|:]/, '').replace(/\|$/, '');
  });

  const maxLength = Math.max(...cleanedLines.map((l) => l.length));

  // Traverse column by column
  const rawColumns: import('../types').TabColumn[] = [];
  let colIdx = 0;

  while (colIdx < maxLength) {
    const colNotes: (number | null)[] = [null, null, null, null, null, null];
    let hasNoteOrChar = false;
    let technique: string | undefined = undefined;
    let step = 1;

    for (let s = 0; s < 6; s++) {
      const char = cleanedLines[s][colIdx];
      if (char !== undefined && char !== '-' && char !== '|' && char !== ' ') {
        hasNoteOrChar = true;
        // Check for technique symbols
        if (['h', 'p', '/', '\\', 'b', '~'].includes(char.toLowerCase())) {
          technique = char.toLowerCase();
        } else if (/[0-9]/.test(char)) {
          // Check if next char is also a digit (e.g. 10, 12, 15)
          const nextChar = cleanedLines[s][colIdx + 1];
          if (nextChar && /[0-9]/.test(nextChar)) {
            colNotes[s] = parseInt(char + nextChar, 10);
            step = Math.max(step, 2);
          } else {
            colNotes[s] = parseInt(char, 10);
          }
        }
      }
    }

    if (hasNoteOrChar || (colIdx % 4 === 0)) {
      rawColumns.push({
        notes: colNotes,
        technique,
      });
    }

    colIdx += step;
  }

  // Partition rawColumns into measures of 8 columns
  const columnsPerMeasure = 8;
  const measures: import('../types').TabMeasure[] = [];
  let measureId = 1;

  for (let i = 0; i < rawColumns.length; i += columnsPerMeasure) {
    const chunk = rawColumns.slice(i, i + columnsPerMeasure);
    while (chunk.length < columnsPerMeasure) {
      chunk.push({ notes: [null, null, null, null, null, null] });
    }
    measures.push({
      id: measureId++,
      columns: chunk,
    });
  }

  if (measures.length === 0) {
    measures.push({
      id: 1,
      columns: Array(8).fill(null).map(() => ({ notes: [null, null, null, null, null, null] })),
    });
  }

  return {
    id: `tab-${Date.now()}`,
    title,
    tuning: STANDARD_TUNING,
    bpm,
    timeSignature: [4, 4],
    measures,
  };
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

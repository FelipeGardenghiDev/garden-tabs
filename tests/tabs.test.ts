import { describe, it, expect } from 'vitest';
import {
  fretToMidi,
  midiToFrequency,
  serializeTabToAscii,
  INITIAL_SMOKE_ON_THE_WATER,
} from '../src/core/tab-engine';

describe('Garden Tabs - Tablature & Fret Engine', () => {
  it('converts fret on string to correct MIDI pitch', () => {
    // String 5 (Low E, MIDI 40) at fret 0 is 40 (E2)
    expect(fretToMidi(5, 0)).toBe(40);
    // String 5 at fret 3 is 43 (G2)
    expect(fretToMidi(5, 3)).toBe(43);
    // String 0 (High E, MIDI 64) at fret 5 is 69 (A4, 440Hz)
    expect(fretToMidi(0, 5)).toBe(69);
  });

  it('calculates exact frequency from MIDI pitch', () => {
    const freq = midiToFrequency(69);
    expect(Math.round(freq)).toBe(440);
  });

  it('serializes tab track to 6-line ASCII tablature', () => {
    const ascii = serializeTabToAscii(INITIAL_SMOKE_ON_THE_WATER);
    const lines = ascii.split('\n');

    expect(lines.length).toBe(6);
    expect(lines[0].startsWith('e|')).toBe(true);
    expect(lines[5].startsWith('E|')).toBe(true);
    expect(lines[3]).toContain('0'); // D string has fret 0
    expect(lines[3]).toContain('3'); // D string has fret 3
    expect(lines[3]).toContain('5'); // D string has fret 5
  });
});

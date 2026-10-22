import { describe, it, expect } from 'vitest';
import {
  fretToMidi,
  midiToFrequency,
  serializeTabToAscii,
  parseAsciiToTabTrack,
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

  it('parses raw ASCII tablature text into structured measures and notes', () => {
    const rawAscii = `
      e|---------------------------------|
      B|---------------------------------|
      G|---------------------------------|
      D|---0---3---5---0---3---6---5-----|
      A|---------------------------------|
      E|---------------------------------|
    `;

    const parsed = parseAsciiToTabTrack(rawAscii, 'Smoke on the Water Riff');
    expect(parsed.title).toBe('Smoke on the Water Riff');
    expect(parsed.measures.length).toBeGreaterThanOrEqual(1);

    // Check if D string notes (index 3) contain 0, 3, 5
    const allNotesOnDString = parsed.measures
      .flatMap((m) => m.columns)
      .map((col) => col.notes[3])
      .filter((n) => n !== null);

    expect(allNotesOnDString).toContain(0);
    expect(allNotesOnDString).toContain(3);
    expect(allNotesOnDString).toContain(5);
  });

  it('detects guitar techniques (hammer-ons and slides) during ASCII parsing', () => {
    const rawAsciiWithTechnique = `
      e|--------------------|
      B|--------------------|
      G|---7h9---9/11-------|
      D|--------------------|
      A|--------------------|
      E|--------------------|
    `;

    const parsed = parseAsciiToTabTrack(rawAsciiWithTechnique, 'Solo');
    const colsWithTechnique = parsed.measures
      .flatMap((m) => m.columns)
      .filter((col) => col.technique !== undefined);

    expect(colsWithTechnique.length).toBeGreaterThanOrEqual(1);
    expect(colsWithTechnique.some((c) => c.technique === 'h' || c.technique === '/')).toBe(true);
  });
});

import React from 'react';
import {
  STANDARD_TUNING,
  STANDARD_TUNING_MIDI,
  fretToMidi,
  midiToFrequency,
  playPluckedNote,
} from '../core/tab-engine';

interface FretboardViewProps {
  onFretClick?: (stringIdx: number, fret: number) => void;
}

export const FretboardView: React.FC<FretboardViewProps> = ({ onFretClick }) => {
  const fretCount = 15;
  const singleDots = [3, 5, 7, 9, 15];
  const doubleDots = [12];

  const handleStringFret = (stringIdx: number, fret: number) => {
    const midi = fretToMidi(stringIdx, fret, STANDARD_TUNING_MIDI);
    const freq = midiToFrequency(midi);
    playPluckedNote(freq);
    if (onFretClick) {
      onFretClick(stringIdx, fret);
    }
  };

  return (
    <div className="flex flex-col bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 overflow-x-auto shadow-2xl backdrop-blur">
      <div className="text-xs font-semibold uppercase text-zinc-400 mb-4 tracking-wider">
        Braço de Guitarra Interativo (Fretboard)
      </div>

      <div className="min-w-[700px] flex flex-col relative select-none">
        {/* Fret Markers on top */}
        <div className="flex pl-10 mb-2">
          {Array.from({ length: fretCount + 1 }).map((_, f) => (
            <div key={f} className="flex-1 text-center font-mono text-[11px] text-zinc-500">
              {f === 0 ? 'Nut' : f}
            </div>
          ))}
        </div>

        {/* Strings Grid */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl relative p-2">
          {STANDARD_TUNING.map((stringName, sIdx) => (
            <div key={sIdx} className="flex items-center h-8 relative group">
              {/* String label (e, B, G, D, A, E) */}
              <div className="w-8 font-mono text-xs font-bold text-zinc-400 group-hover:text-emerald-400 text-center">
                {stringName}
              </div>

              {/* Physical String Wire */}
              <div
                className="absolute left-10 right-0 bg-zinc-600 pointer-events-none"
                style={{ height: `${1 + sIdx * 0.4}px` }}
              />

              {/* Frets */}
              <div className="flex-1 flex pl-2">
                {Array.from({ length: fretCount + 1 }).map((_, fIdx) => (
                  <button
                    key={fIdx}
                    onClick={() => handleStringFret(sIdx, fIdx)}
                    className="flex-1 h-7 rounded-md hover:bg-emerald-500/20 active:scale-95 transition flex items-center justify-center border-r border-zinc-800/80 relative z-10 group/fret"
                  >
                    <span className="opacity-0 group-hover/fret:opacity-100 font-mono text-[10px] text-emerald-400 font-bold bg-zinc-900 px-1 rounded shadow">
                      {fIdx}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Inlay Position Dots */}
          <div className="absolute left-10 right-0 top-1/2 -translate-y-1/2 pointer-events-none flex">
            {Array.from({ length: fretCount + 1 }).map((_, f) => (
              <div key={f} className="flex-1 flex justify-center">
                {singleDots.includes(f) && (
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/60" />
                )}
                {doubleDots.includes(f) && (
                  <div className="flex flex-col gap-8">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/60" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

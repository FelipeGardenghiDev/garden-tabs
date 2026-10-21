import React, { useState, useRef, useEffect } from 'react';
import { TabTrack } from './types';
import {
  INITIAL_SMOKE_ON_THE_WATER,
  STANDARD_TUNING,
  STANDARD_TUNING_MIDI,
  fretToMidi,
  midiToFrequency,
  playPluckedNote,
  serializeTabToAscii,
} from './core/tab-engine';
import { FretboardView } from './components/FretboardView';
import {
  Play,
  Pause,
  Plus,
  Copy,
  Printer,
} from 'lucide-react';

export const App: React.FC = () => {
  const [track, setTrack] = useState<TabTrack>(INITIAL_SMOKE_ON_THE_WATER);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeColumnIndex, setActiveColumnIndex] = useState<number | null>(null);
  const [asciiModalOpen, setAsciiModalOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const playbackTimerRef = useRef<any>(null);

  // Flatten all columns for playback tracking
  const allColumns = track.measures.flatMap((m) => m.columns);

  const togglePlayback = () => {
    if (isPlaying) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
      setIsPlaying(false);
      setActiveColumnIndex(null);
    } else {
      setIsPlaying(true);
      let colIdx = 0;

      // Calculate tick interval based on BPM (quarter note / 2 for eighth notes)
      const intervalMs = (60000 / track.bpm) / 2;

      playbackTimerRef.current = setInterval(() => {
        if (colIdx >= allColumns.length) {
          colIdx = 0; // Loop or stop
        }

        setActiveColumnIndex(colIdx);
        const col = allColumns[colIdx];

        // Play notes in this column
        col.notes.forEach((fret, sIdx) => {
          if (fret !== null) {
            const midi = fretToMidi(sIdx, fret, STANDARD_TUNING_MIDI);
            const freq = midiToFrequency(midi);
            playPluckedNote(freq);
          }
        });

        colIdx++;
      }, intervalMs);
    }
  };

  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
    };
  }, []);

  const handleCellChange = (measureIdx: number, colIdx: number, stringIdx: number, val: string) => {
    const parsed = val.trim() === '' ? null : parseInt(val, 10);
    if (val.trim() !== '' && isNaN(parsed!)) return;

    const newMeasures = [...track.measures];
    const newColumns = [...newMeasures[measureIdx].columns];
    const newNotes = [...newColumns[colIdx].notes];
    newNotes[stringIdx] = parsed;
    newColumns[colIdx] = { ...newColumns[colIdx], notes: newNotes };
    newMeasures[measureIdx] = { ...newMeasures[measureIdx], columns: newColumns };

    setTrack({ ...track, measures: newMeasures });

    if (parsed !== null) {
      const midi = fretToMidi(stringIdx, parsed, STANDARD_TUNING_MIDI);
      playPluckedNote(midiToFrequency(midi));
    }
  };

  const handleAddMeasure = () => {
    const newMeasure = {
      id: track.measures.length + 1,
      columns: Array.from({ length: 8 }, () => ({
        notes: [null, null, null, null, null, null],
      })),
    };
    setTrack({ ...track, measures: [...track.measures, newMeasure] });
  };

  const handleCopyAscii = () => {
    const ascii = serializeTabToAscii(track);
    navigator.clipboard.writeText(ascii);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none">
      {/* Header */}
      <header className="h-16 border-b border-zinc-800 bg-zinc-900/90 backdrop-blur px-6 flex items-center justify-between z-20 no-print">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎸</span>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base tracking-tight text-white">Garden Tabs</h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Web Tab & Score Editor
            </span>
          </div>
        </div>

        {/* Playback & Controls */}
        <div className="flex items-center gap-3">
          {/* BPM */}
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl font-mono text-xs">
            <span className="text-zinc-500">BPM:</span>
            <input
              type="number"
              value={track.bpm}
              onChange={(e) => setTrack({ ...track, bpm: Number(e.target.value) })}
              className="w-12 bg-transparent text-emerald-400 font-bold focus:outline-none"
            />
          </div>

          {/* Play/Pause */}
          <button
            onClick={togglePlayback}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-bold text-xs tracking-wide transition shadow-lg ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" /> PARAR
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> TOCAR TAB
              </>
            )}
          </button>

          {/* ASCII Export */}
          <button
            onClick={() => setAsciiModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition"
          >
            <Copy className="w-3.5 h-3.5" /> ASCII
          </button>

          {/* Print PDF */}
          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition"
            title="Imprimir Tablatura / Salvar em PDF"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Tablature Area */}
      <main className="flex-1 flex flex-col p-6 gap-6 max-w-7xl mx-auto w-full overflow-y-auto">
        {/* Track Title */}
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={track.title}
            onChange={(e) => setTrack({ ...track, title: e.target.value })}
            className="text-2xl font-black bg-transparent text-white border-b border-transparent hover:border-zinc-800 focus:border-emerald-500 focus:outline-none px-1"
          />
          <button
            onClick={handleAddMeasure}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600/30 text-xs font-bold transition"
          >
            <Plus className="w-4 h-4" /> Adicionar Compasso
          </button>
        </div>

        {/* Tablature Grid Viewer */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 shadow-2xl backdrop-blur overflow-x-auto">
          <div className="flex gap-4 min-w-max pb-4">
            {track.measures.map((measure, mIdx) => (
              <div
                key={measure.id}
                className="flex flex-col border-r-2 border-zinc-700 pr-4 relative"
              >
                <div className="text-[10px] font-mono text-zinc-500 mb-2 font-bold">
                  Compasso {measure.id}
                </div>

                {STANDARD_TUNING.map((stringName, sIdx) => (
                  <div key={sIdx} className="flex items-center h-8 gap-1 border-b border-zinc-800/40">
                    <span className="w-5 font-mono text-xs text-zinc-500 font-bold select-none">
                      {stringName}
                    </span>

                    {measure.columns.map((col, cIdx) => {
                      const globalColIndex = mIdx * 8 + cIdx;
                      const isActive = activeColumnIndex === globalColIndex;

                      return (
                        <div
                          key={cIdx}
                          className={`w-8 h-7 rounded flex items-center justify-center transition-colors ${
                            isActive ? 'bg-emerald-500/30 border border-emerald-400' : 'bg-zinc-950/80 border border-zinc-800/80'
                          }`}
                        >
                          <input
                            type="text"
                            maxLength={2}
                            value={col.notes[sIdx] ?? ''}
                            onChange={(e) =>
                              handleCellChange(mIdx, cIdx, sIdx, e.target.value)
                            }
                            className="w-full text-center bg-transparent font-mono text-xs font-bold text-zinc-100 focus:outline-none focus:text-emerald-400"
                            placeholder="-"
                          />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Fretboard */}
        <FretboardView />
      </main>

      {/* ASCII Tab Export Modal */}
      {asciiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Tablatura em Texto (ASCII)</h3>
              <button
                onClick={() => setAsciiModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <pre className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
              {serializeTabToAscii(track)}
            </pre>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCopyAscii}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5"
              >
                <Copy className="w-4 h-4" /> {copyFeedback ? 'Copiado!' : 'Copiar Tablatura'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

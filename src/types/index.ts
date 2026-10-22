export interface TabColumn {
  notes: (number | null)[]; // 6 strings (0 = top E, 5 = bottom E)
  chord?: string;
  technique?: string; // 'h', 'p', '/', 'b', '~'
}

export interface TabMeasure {
  id: number;
  columns: TabColumn[];
}

export interface TabTrack {
  id: string;
  title: string;
  tuning: string[];
  bpm: number;
  timeSignature: [number, number];
  measures: TabMeasure[];
}

export interface ScalePattern {
  name: string;
  intervals: number[];
}

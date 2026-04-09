export type Genre = 'Trap' | 'Lo-Fi' | 'Phonk' | 'Synthwave' | 'Drill' | 'Afrobeat' | 'Techno' | 'Amapiano' | 'Afrohouse' | 'Latinhouse' | 'Jersey Club' | 'Hyperpop' | 'UK Garage' | 'Baile Funk' | 'Deep House' | 'Reggaeton';
export type Region = 'Global' | 'Urban' | 'Electronic' | 'Latin' | 'African' | 'UK' | 'House';

export interface SoundProfile {
  id: string;
  name: string;
  url?: string;
}

export interface DrumInstrument {
  id: string;
  name: string;
  type: 'kick' | 'snare' | 'hihat' | 'perc' | 'cowbell' | 'tom' | 'conga' | 'shaker';
  category: 'Drums' | 'Percussion';
  color: string;
  selectedSound: string;
  availableSounds: SoundProfile[];
  volume: number;
  pan: number;
  muted: boolean;
  soloed: boolean;
  randomProbability: number;
  randomEnabled: boolean;
  isLoading?: boolean;
}

export interface Step {
  active: boolean;
  velocity: number;
  isRandom?: boolean;
}

export interface Pattern {
  [instrumentId: string]: Step[];
}

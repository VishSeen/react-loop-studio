/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react';
import * as Tone from 'tone';
import { motion } from 'motion/react';
import { 
  Play, 
  Square, 
  Download, 
  RefreshCw, 
  Volume2, 
  Globe, 
  Zap,
  Settings2,
  Disc,
  Sparkles,
  ChevronDown,
  ChevronRight,
  VolumeX,
  Volume1,
  Dices,
  Upload,
  AlertCircle
} from 'lucide-react';
import { DrumKit } from './lib/audioEngine';
import { Genre, Region, Step, Pattern, DrumInstrument } from './types';
import { SOUND_PROFILES } from './constants';

const INITIAL_INSTRUMENTS: DrumInstrument[] = [
  { 
    id: 'kick', 
    name: 'KICK', 
    color: '#FF4444', 
    type: 'kick',
    category: 'Drums',
    selectedSound: 'kick-splice-1',
    volume: 0,
    pan: 0,
    muted: false,
    soloed: false,
    randomProbability: 0.25,
    randomEnabled: true,
    isLoading: false,
    availableSounds: [
      { id: 'kick-splice-1', name: 'Splice Kick A' },
      { id: 'kick-splice-2', name: 'Splice Kick B' },
      { id: 'kick-808', name: '808 Kick' },
      { id: 'kick-909', name: '909 Kick' },
      { id: 'kick-classic', name: 'Classic Synth' },
      { id: 'kick-deep', name: 'Deep Sub' },
      { id: 'kick-hard', name: 'Hard Kick' }
    ]
  },
  { 
    id: 'snare', 
    name: 'SNARE', 
    color: '#44FF44', 
    type: 'snare',
    category: 'Drums',
    selectedSound: 'snare-splice-1',
    volume: 0,
    pan: 0,
    muted: false,
    soloed: false,
    randomProbability: 0.2,
    randomEnabled: true,
    isLoading: false,
    availableSounds: [
      { id: 'snare-splice-1', name: 'Splice Snare A' },
      { id: 'snare-splice-2', name: 'Splice Snare B' },
      { id: 'snare-808', name: '808 Snare' },
      { id: 'snare-909', name: '909 Snare' },
      { id: 'snare-classic', name: 'Classic Synth' },
      { id: 'snare-crisp', name: 'Crisp Snare' },
      { id: 'snare-fat', name: 'Fat Snare' }
    ]
  },
  { 
    id: 'hihat', 
    name: 'HI-HAT', 
    color: '#4444FF', 
    type: 'hihat',
    category: 'Drums',
    selectedSound: 'hihat-splice-1',
    volume: 0,
    pan: 0,
    muted: false,
    soloed: false,
    randomProbability: 0.4,
    randomEnabled: true,
    isLoading: false,
    availableSounds: [
      { id: 'hihat-splice-1', name: 'Splice Hat A' },
      { id: 'hihat-splice-2', name: 'Splice Hat B' },
      { id: 'hihat-808', name: '808 Hat' },
      { id: 'hihat-909', name: '909 Hat' },
      { id: 'hihat-classic', name: 'Classic Synth' },
      { id: 'hihat-short', name: 'Short Hat' },
      { id: 'hihat-long', name: 'Long Hat' }
    ]
  },
  { 
    id: 'tom', 
    name: 'TOM', 
    color: '#FF44FF', 
    type: 'tom',
    category: 'Drums',
    selectedSound: 'tom-splice-1',
    volume: 0,
    pan: 0,
    muted: false,
    soloed: false,
    randomProbability: 0.1,
    randomEnabled: true,
    isLoading: false,
    availableSounds: [
      { id: 'tom-splice-1', name: 'Splice Tom' },
      { id: 'tom-808', name: '808 Tom' },
      { id: 'tom-classic', name: 'Classic Synth' }
    ]
  },
  { 
    id: 'perc', 
    name: 'PERC', 
    color: '#44FFFF', 
    type: 'perc',
    category: 'Percussion',
    selectedSound: 'perc-splice-1',
    volume: 0,
    pan: 0,
    muted: false,
    soloed: false,
    randomProbability: 0.15,
    randomEnabled: true,
    isLoading: false,
    availableSounds: [
      { id: 'perc-splice-1', name: 'Splice Clap' },
      { id: 'perc-808', name: '808 Clap' },
      { id: 'perc-classic', name: 'Classic Synth' },
      { id: 'perc-wood', name: 'Wood Block' },
      { id: 'perc-metallic', name: 'Metallic Hit' },
      { id: 'perc-rim', name: 'Rim Perc' }
    ]
  },
  { 
    id: 'cowbell', 
    name: 'COWBELL', 
    color: '#FFFF44', 
    type: 'cowbell',
    category: 'Percussion',
    selectedSound: 'cowbell-splice-1',
    volume: 0,
    pan: 0,
    muted: false,
    soloed: false,
    randomProbability: 0.05,
    randomEnabled: true,
    isLoading: false,
    availableSounds: [
      { id: 'cowbell-splice-1', name: 'Splice Bell' },
      { id: 'cowbell-808', name: '808 Bell' },
      { id: 'cowbell-classic', name: 'Classic Synth' }
    ]
  },
  { 
    id: 'conga', 
    name: 'CONGA', 
    color: '#FFA500', 
    type: 'conga',
    category: 'Percussion',
    selectedSound: 'conga-splice-1',
    volume: 0,
    pan: 0,
    muted: false,
    soloed: false,
    randomProbability: 0.1,
    randomEnabled: true,
    isLoading: false,
    availableSounds: [
      { id: 'conga-splice-1', name: 'Splice Conga H' },
      { id: 'conga-808', name: '808 Conga' },
      { id: 'conga-classic', name: 'Classic Synth' }
    ]
  },
  { 
    id: 'shaker', 
    name: 'SHAKER', 
    color: '#C0C0C0', 
    type: 'shaker',
    category: 'Percussion',
    selectedSound: 'shaker-splice-1',
    volume: 0,
    pan: 0,
    muted: false,
    soloed: false,
    randomProbability: 0.3,
    randomEnabled: true,
    isLoading: false,
    availableSounds: [
      { id: 'shaker-splice-1', name: 'Splice Shaker' },
      { id: 'shaker-classic', name: 'Classic Synth' }
    ]
  },
];

const GENRES: { id: Genre; name: string; region: Region; bpm: number; swing: number }[] = [
  { id: 'Trap', name: 'TRAP', region: 'Urban', bpm: 140, swing: 0 },
  { id: 'Lo-Fi', name: 'LO-FI', region: 'Urban', bpm: 85, swing: 15 },
  { id: 'Phonk', name: 'PHONK', region: 'Urban', bpm: 120, swing: 5 },
  { id: 'Synthwave', name: 'SYNTHWAVE', region: 'Electronic', bpm: 115, swing: 0 },
  { id: 'Drill', name: 'DRILL', region: 'Urban', bpm: 142, swing: 0 },
  { id: 'Afrobeat', name: 'AFROBEAT', region: 'Global', bpm: 105, swing: 20 },
  { id: 'Techno', name: 'TECHNO', region: 'Electronic', bpm: 132, swing: 0 },
  { id: 'Amapiano', name: 'AMAPIANO', region: 'African', bpm: 113, swing: 30 },
  { id: 'Afrohouse', name: 'AFROHOUSE', region: 'African', bpm: 122, swing: 10 },
  { id: 'Latinhouse', name: 'LATINHOUSE', region: 'Latin', bpm: 126, swing: 5 },
  { id: 'Jersey Club', name: 'JERSEY CLUB', region: 'Urban', bpm: 140, swing: 0 },
  { id: 'Hyperpop', name: 'HYPERPOP', region: 'Electronic', bpm: 160, swing: 0 },
  { id: 'UK Garage', name: 'UK GARAGE', region: 'UK', bpm: 134, swing: 25 },
  { id: 'Baile Funk', name: 'BAILE FUNK', region: 'Latin', bpm: 130, swing: 0 },
  { id: 'Deep House', name: 'DEEP HOUSE', region: 'House', bpm: 124, swing: 15 },
  { id: 'Reggaeton', name: 'REGGAETON', region: 'Latin', bpm: 95, swing: 10 },
];

const STEPS_PER_BAR = 16;

const WaveformPreview = ({ url, color }: { url?: string; color: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!url || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fetchAndDraw = async () => {
      try {
        const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        const data = audioBuffer.getChannelData(0);
        
        const width = canvas.width;
        const height = canvas.height;
        const step = Math.ceil(data.length / width);
        const amp = height / 2;

        ctx.clearRect(0, 0, width, height);
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.moveTo(0, amp);

        for (let i = 0; i < width; i++) {
          let min = 1.0;
          let max = -1.0;
          for (let j = 0; j < step; j++) {
            const datum = data[i * step + j];
            if (datum < min) min = datum;
            if (datum > max) max = datum;
          }
          ctx.lineTo(i, (1 + min) * amp);
          ctx.lineTo(i, (1 + max) * amp);
        }
        ctx.stroke();
      } catch (e) {
        console.error('Error drawing waveform preview:', e);
      }
    };

    fetchAndDraw();
  }, [url, color]);

  return <canvas ref={canvasRef} width={100} height={24} className="opacity-40" />;
};

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // Log more details if it's a "Script error."
    if (error.message === "Script error.") {
      console.warn("A 'Script error.' occurred. This is often caused by cross-origin scripts failing or browser security policies (CORS).");
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0A0E] flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-[#16161D] border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">System Failure</h1>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              The audio engine or UI encountered a critical error. This can happen due to sample loading issues or browser restrictions.
            </p>
            <div className="bg-black/40 rounded-lg p-4 mb-8 text-left overflow-auto max-h-32">
              <code className="text-xs text-red-400 font-mono">
                {this.state.error?.message === "Script error." 
                  ? "Cross-origin Script Error. Please check your internet connection or try a different browser." 
                  : (this.state.error?.message || "Unknown System Error")}
              </code>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all uppercase tracking-widest text-xs"
            >
              Restart Engine
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [bpm, setBpm] = useState(124);
  const [swing, setSwing] = useState(0);
  const [bars, setBars] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [instruments, setInstruments] = useState<DrumInstrument[]>(INITIAL_INSTRUMENTS.map(inst => ({ ...inst, pan: 0 })));
  const [pattern, setPattern] = useState<Pattern>(() => {
    const initial: Pattern = {};
    INITIAL_INSTRUMENTS.forEach(inst => {
      initial[inst.id] = Array(STEPS_PER_BAR * 4).fill(null).map(() => ({ active: false, velocity: 1, isRandom: false }));
    });
    return initial;
  });
  const [selectedGenre, setSelectedGenre] = useState<Genre | 'Custom'>('Custom');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [activeBar, setActiveBar] = useState(0);
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [browsingInstrumentId, setBrowsingInstrumentId] = useState<string | null>(null);
  const [sampleSearchQuery, setSampleSearchQuery] = useState('');
  const [randomIntensity, setRandomIntensity] = useState(0.5);

  useEffect(() => {
    if (activeBar >= bars) {
      setActiveBar(0);
    }
  }, [bars, activeBar]);

  // Group instruments by category
  const groupedInstruments = React.useMemo(() => {
    return instruments.reduce((acc, inst) => {
      const category = inst.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(inst);
      return acc;
    }, {} as Record<string, DrumInstrument[]>);
  }, [instruments]);

  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const previewInstrument = async (id: string) => {
    if (Tone.getContext().state !== 'running') await Tone.start();
    if (drumKitRef.current) {
      drumKitRef.current.play(id, Tone.now(), 0.8);
    }
  };

  const randomizeInstrumentSteps = (id: string) => {
    const inst = instruments.find(i => i.id === id);
    if (!inst || !inst.randomEnabled) return;

    setPattern(prev => {
      const next = { ...prev };
      next[id] = next[id].map((step, idx) => {
        if (idx >= totalSteps) return step;
        // Use both per-instrument probability and global intensity
        const probability = inst.randomProbability * (randomIntensity * 2);
        const active = Math.random() < probability;
        return { ...step, active, isRandom: active };
      });
      return next;
    });
  };

  const updateInstrumentRandom = (id: string, updates: Partial<{ randomProbability: number, randomEnabled: boolean }>) => {
    setInstruments(prev => prev.map(inst => 
      inst.id === id ? { ...inst, ...updates } : inst
    ));
  };

  const tweakSynth = (id: string) => {
    if (drumKitRef.current) {
      drumKitRef.current.randomizeSynthParams(id);
    }
  };

  const handleFileUpload = (id: string, file: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const customId = `custom-${id}-${Date.now()}`;
    
    setInstruments(prev => prev.map(inst => {
      if (inst.id === id) {
        const newSound = { id: customId, name: `UPLOAD: ${file.name.slice(0, 10)}...` };
        return {
          ...inst,
          selectedSound: customId,
          isLoading: true,
          availableSounds: [newSound, ...inst.availableSounds]
        };
      }
      return inst;
    }));

    if (drumKitRef.current) {
      drumKitRef.current.setSound(id, customId, url, () => {
        setInstruments(prev => prev.map(inst => 
          inst.id === id ? { ...inst, isLoading: false } : inst
        ));
      });
    }
  };

  const [isRecording, setIsRecording] = useState(false);

  const drumKitRef = useRef<DrumKit | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sequencerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message === "Script error.") {
        console.warn("Global Script Error caught. This is likely a CORS issue with an external resource or a browser extension interfering.");
      } else {
        console.error("Global error caught:", event.error || event.message);
      }
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
    };
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  const totalSteps = bars * STEPS_PER_BAR;

  useEffect(() => {
    drumKitRef.current = new DrumKit();
    Tone.getDestination().volume.value = -6;
    Tone.getTransport().swingSubdivision = '16n';
    
    const drawWaveform = () => {
      if (!canvasRef.current || !drumKitRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      
      const values = drumKitRef.current.getWaveform() as Float32Array;
      const width = canvasRef.current.width;
      const height = canvasRef.current.height;
      
      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FF4444';
      
      for (let i = 0; i < values.length; i++) {
        const x = (i / values.length) * width;
        const y = (values[i] + 1) / 2 * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      requestAnimationFrame(drawWaveform);
    };
    
    drawWaveform();

    return () => {
      Tone.getTransport().stop();
      Tone.getTransport().cancel();
    };
  }, []);

  useEffect(() => { Tone.getTransport().bpm.value = bpm; }, [bpm]);
  useEffect(() => { Tone.getTransport().swing = swing / 100; }, [swing]);

  const toggleStep = (instId: string, stepIdx: number) => {
    setPattern(prev => ({
      ...prev,
      [instId]: prev[instId].map((step, i) => 
        i === stepIdx ? { ...step, active: !step.active, isRandom: false } : step
      )
    }));
    setSelectedGenre('Custom');
  };

  const changeSound = (instId: string, soundId: string) => {
    setInstruments(prev => prev.map(inst => 
      inst.id === instId ? { ...inst, selectedSound: soundId, isLoading: true } : inst
    ));
    drumKitRef.current?.setSound(instId, soundId, undefined, () => {
      setInstruments(prev => prev.map(inst => 
        inst.id === instId ? { ...inst, isLoading: false } : inst
      ));
    });
  };

  const toggleMute = (instId: string) => {
    setInstruments(prev => prev.map(inst => {
      if (inst.id === instId) {
        const newMuted = !inst.muted;
        drumKitRef.current?.setMute(instId, newMuted);
        return { ...inst, muted: newMuted };
      }
      return inst;
    }));
  };

  const changeVolume = (instId: string, volume: number) => {
    setInstruments(prev => prev.map(inst => {
      if (inst.id === instId) {
        drumKitRef.current?.setVolume(instId, volume);
        return { ...inst, volume };
      }
      return inst;
    }));
  };

  const changePan = (instId: string, pan: number) => {
    setInstruments(prev => prev.map(inst => {
      if (inst.id === instId) {
        drumKitRef.current?.setPan(instId, pan);
        return { ...inst, pan };
      }
      return inst;
    }));
  };

  const updateInstrument = (id: string, updates: Partial<DrumInstrument>) => {
    setInstruments(prev => {
      const next = prev.map(inst => 
        inst.id === id ? { ...inst, ...updates } : inst
      );
      
      const anySoloed = next.some(inst => inst.soloed);
      
      next.forEach(inst => {
        if (inst.id === id) {
          if (updates.volume !== undefined) drumKitRef.current?.setVolume(id, updates.volume);
          if (updates.pan !== undefined) drumKitRef.current?.setPan(id, updates.pan);
        }
        
        const effectiveMute = inst.muted || (anySoloed && !inst.soloed);
        drumKitRef.current?.setMute(inst.id, effectiveMute);
      });
      
      return next;
    });
  };

  const toggleCategoryMute = (category: string) => {
    setInstruments(prev => {
      const categoryInsts = prev.filter(i => i.category === category);
      const allMuted = categoryInsts.every(i => i.muted);
      const shouldMute = !allMuted;
      
      const next = prev.map(inst => 
        inst.category === category ? { ...inst, muted: shouldMute } : inst
      );
      
      const anySoloed = next.some(inst => inst.soloed);
      next.forEach(inst => {
        const effectiveMute = inst.muted || (anySoloed && !inst.soloed);
        drumKitRef.current?.setMute(inst.id, effectiveMute);
      });
      
      return next;
    });
  };

  const toggleCategorySolo = (category: string) => {
    setInstruments(prev => {
      const categoryInsts = prev.filter(i => i.category === category);
      const allSoloed = categoryInsts.every(i => i.soloed);
      const shouldSolo = !allSoloed;
      
      const next = prev.map(inst => 
        inst.category === category ? { ...inst, soloed: shouldSolo } : inst
      );
      
      const anySoloed = next.some(inst => inst.soloed);
      next.forEach(inst => {
        const effectiveMute = inst.muted || (anySoloed && !inst.soloed);
        drumKitRef.current?.setMute(inst.id, effectiveMute);
      });
      
      return next;
    });
  };

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message === 'Script error.') {
        console.warn('Caught cross-origin script error. This is likely due to sample loading and is handled by fallback synths.');
        event.preventDefault();
      }
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const startPlayback = async () => {
    if (Tone.getContext().state !== 'running') await Tone.start();
    Tone.getTransport().cancel();
    
    const loop = new Tone.Sequence(
      (time, step) => {
        setCurrentStep(step);
        instruments.forEach(inst => {
          const stepData = pattern[inst.id][step];
          if (stepData?.active && !inst.muted) {
            drumKitRef.current?.play(inst.id, time, stepData.velocity);
          }
        });
      },
      Array.from({ length: totalSteps }, (_, i) => i),
      '16n'
    );

    loop.start(0);
    Tone.getTransport().start();
    setIsPlaying(true);
  };

  const stopPlayback = () => {
    Tone.getTransport().stop();
    setIsPlaying(false);
    setCurrentStep(-1);
    if (isRecording) stopRecording();
  };

  const randomizeAll = () => {
    let genreToUse = selectedGenre === 'Custom' 
      ? GENRES[Math.floor(Math.random() * GENRES.length)].id 
      : selectedGenre;
    
    // Apply base genre preset first
    applyGenrePreset(genreToUse);
    
    // Then add "spice" and randomize sounds
    setInstruments(prev => prev.map(inst => {
      // Pick a sound that fits the genre if possible
      // For now, just pick a random sound from available
      const randomSound = inst.availableSounds[Math.floor(Math.random() * inst.availableSounds.length)];
      const randomPan = (Math.random() * 1.2 - 0.6).toFixed(1); 
      const randomVol = (Math.random() * 6 - 3).toFixed(1);
      
      drumKitRef.current?.setSound(inst.id, randomSound.id);
      drumKitRef.current?.setPan(inst.id, parseFloat(randomPan));
      drumKitRef.current?.setVolume(inst.id, parseFloat(randomVol));
      
      if (randomSound.id.includes('classic')) {
        drumKitRef.current?.randomizeSynthParams(inst.id);
      }
      
      return { 
        ...inst, 
        selectedSound: randomSound.id, 
        pan: parseFloat(randomPan),
        volume: parseFloat(randomVol)
      };
    }));

    // Add spice to the pattern
    setPattern(prev => {
      const next: Pattern = { ...prev };
      Object.keys(next).forEach(key => {
        const inst = instruments.find(i => i.id === key);
        const isPerc = inst?.category === 'Percussion';
        
        // Base probability scaled by global intensity
        const baseProb = isPerc ? 0.15 : 0.06;
        const scaledProb = baseProb * randomIntensity;

        next[key] = next[key].map((step, idx) => {
          if (idx >= totalSteps) return step;
          
          if (Math.random() < scaledProb) {
            const active = !step.active;
            const velocity = isPerc ? Math.random() * 0.4 + 0.6 : Math.random() * 0.3 + 0.4;
            return { ...step, active, velocity, isRandom: active };
          }
          
          return step;
        });
      });
      return next;
    });
  };

  const applyGenrePreset = (genreId: Genre) => {
    const genre = GENRES.find(g => g.id === genreId);
    if (!genre) return;

    setBpm(genre.bpm);
    setSwing(genre.swing);

    const newPattern: Pattern = {};
    instruments.forEach(inst => {
      newPattern[inst.id] = Array(STEPS_PER_BAR * 4).fill(null).map(() => ({ active: false, velocity: 1, isRandom: false }));
    });

    // Simple preset logic for 1 bar, we can extend this
    const applyToAllBars = (instId: string, steps: number[]) => {
      for (let b = 0; b < 4; b++) {
        steps.forEach(s => {
          const idx = b * STEPS_PER_BAR + s;
          if (idx < STEPS_PER_BAR * 4) newPattern[instId][idx].active = true;
        });
      }
    };

    switch (genreId) {
      case 'Trap':
        applyToAllBars('kick', [0, 8, 11]);
        applyToAllBars('snare', [4, 12]);
        applyToAllBars('hihat', [0, 2, 4, 6, 8, 10, 12, 14]);
        applyToAllBars('perc', [14]);
        break;
      case 'Lo-Fi':
        applyToAllBars('kick', [0, 9]);
        applyToAllBars('snare', [4, 12]);
        applyToAllBars('hihat', [2, 6, 10, 14]);
        applyToAllBars('shaker', [0, 2, 4, 6, 8, 10, 12, 14]);
        break;
      case 'Drill':
        applyToAllBars('kick', [0, 6, 10]);
        applyToAllBars('snare', [4, 12]);
        applyToAllBars('hihat', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
        break;
      case 'Afrobeat':
        applyToAllBars('kick', [0, 4, 8, 12]);
        applyToAllBars('perc', [3, 6, 11, 14]);
        applyToAllBars('conga', [2, 7, 10, 15]);
        break;
      case 'Amapiano':
        applyToAllBars('kick', [0, 8]);
        applyToAllBars('tom', [0, 3, 6, 8, 11, 14]); // Log drum feel
        applyToAllBars('shaker', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
        applyToAllBars('perc', [10]);
        break;
      case 'Afrohouse':
        applyToAllBars('kick', [0, 4, 8, 12]);
        applyToAllBars('shaker', [0, 2, 4, 6, 8, 10, 12, 14]);
        applyToAllBars('conga', [2, 5, 10, 13]);
        applyToAllBars('perc', [7, 15]);
        break;
      case 'Latinhouse':
        applyToAllBars('kick', [0, 4, 8, 12]);
        applyToAllBars('snare', [4, 12]);
        applyToAllBars('cowbell', [2, 6, 10, 14]);
        applyToAllBars('conga', [0, 3, 8, 11]);
        break;
      case 'Jersey Club':
        applyToAllBars('kick', [0, 4, 6, 8, 12, 14]);
        applyToAllBars('snare', [4, 12]);
        applyToAllBars('perc', [2, 10]); // Bed squeak feel
        break;
      case 'Hyperpop':
        applyToAllBars('kick', [0, 2, 4, 6, 8, 10, 12, 14]);
        applyToAllBars('snare', [4, 12]);
        applyToAllBars('perc', [1, 3, 5, 7, 9, 11, 13, 15]);
        break;
      case 'UK Garage':
        applyToAllBars('kick', [0, 10]);
        applyToAllBars('snare', [4, 12]);
        applyToAllBars('hihat', [2, 6, 10, 14]);
        applyToAllBars('perc', [3, 7, 11, 15]);
        break;
      case 'Techno':
        applyToAllBars('kick', [0, 4, 8, 12]);
        applyToAllBars('hihat', [2, 6, 10, 14]);
        applyToAllBars('perc', [0, 2, 4, 6, 8, 10, 12, 14]);
        break;
      case 'Synthwave':
        applyToAllBars('kick', [0, 4, 8, 12]);
        applyToAllBars('snare', [4, 12]);
        applyToAllBars('hihat', [0, 2, 4, 6, 8, 10, 12, 14]);
        break;
      case 'Phonk':
        applyToAllBars('kick', [0, 8]);
        applyToAllBars('cowbell', [0, 3, 6, 8, 11, 14]);
        applyToAllBars('snare', [4, 12]);
        break;
      case 'Baile Funk':
        applyToAllBars('kick', [0, 3, 4, 7, 8, 11, 12, 15]);
        applyToAllBars('snare', [4, 12]);
        applyToAllBars('perc', [2, 6, 10, 14]);
        break;
      case 'Deep House':
        applyToAllBars('kick', [0, 4, 8, 12]);
        applyToAllBars('snare', [4, 12]);
        applyToAllBars('hihat', [2, 6, 10, 14]);
        applyToAllBars('perc', [3, 7, 11, 15]);
        break;
      case 'Reggaeton':
        applyToAllBars('kick', [0, 4, 8, 12]);
        applyToAllBars('snare', [3, 6, 11, 14]);
        applyToAllBars('perc', [2, 10]);
        break;
      default:
        applyToAllBars('kick', [0, 4, 8, 12]);
        applyToAllBars('snare', [4, 12]);
        break;
    }

    setPattern(newPattern);
    setSelectedGenre(genreId);
  };

  const startRecording = async () => {
    if (Tone.getContext().state !== 'running') await Tone.start();
    
    if (drumKitRef.current) {
      // Start recorder BEFORE transport
      await drumKitRef.current.startRecording();
      setIsRecording(true);
      
      // Small delay to ensure recorder is ready
      setTimeout(async () => {
        if (!isPlaying) {
          await startPlayback();
        }
      }, 100);
    }
  };

  const stopRecording = async () => {
    if (drumKitRef.current) {
      const blob = await drumKitRef.current.stopRecording();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `splice-loop-${selectedGenre}-${bpm}bpm.wav`;
      a.click();
      setIsRecording(false);
      
      // Optionally stop playback
      // stopPlayback();
    }
  };

  return (
    <ErrorBoundary>
      <div className="h-screen bg-[#0F0F12] text-[#A0A0A0] font-sans selection:bg-[#00FF88] flex flex-col overflow-hidden">
        {/* Top Bar - Transport & Global Controls */}
        <header className="h-16 bg-[#16161D] border-b border-[#2A2A34] flex items-center justify-between px-6 shrink-0 z-50">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#00FF88] p-1.5 rounded-lg shadow-[0_0_15px_rgba(0,255,136,0.2)]">
                <Disc className="w-5 h-5 text-black animate-spin-slow" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-sm font-black tracking-tighter uppercase italic text-white leading-none">SPLICE STUDIO</h1>
                <span className="text-[8px] text-[#666] tracking-[0.2em] font-bold mt-0.5">V3.5 PRO • MASTERING EDITION</span>
              </div>
            </div>

            <div className="h-8 w-[1px] bg-[#2A2A34]" />

            <div className="flex items-center gap-2">
              <button 
                onClick={isPlaying ? stopPlayback : startPlayback} 
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isPlaying ? 'bg-[#00FF88] text-black scale-105' : 'bg-[#2A2A34] text-white hover:bg-[#3A3A44]'}`}
              >
                {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
              <button 
                onClick={isRecording ? stopRecording : startRecording} 
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-[#2A2A34] text-white hover:bg-[#3A3A44]'}`}
              >
                <Download className="w-4 h-4" />
              </button>
              <button 
                onClick={randomizeAll} 
                className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#2A2A34] text-white hover:bg-[#3A3A44] transition-all group relative"
                title="Randomize All (Spice)"
              >
                <Dices className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#00FF88] rounded-full border-2 border-[#16161D] flex items-center justify-center">
                  <div className="w-1 h-1 bg-black rounded-full" />
                </div>
              </button>
            </div>

            <div className="h-8 w-[1px] bg-[#2A2A34]" />

            {/* Global Intensity */}
            <div className="flex items-center gap-3">
              <span className="text-[8px] font-black text-[#666] uppercase tracking-widest">INTENSITY</span>
              <div className="flex items-center gap-2 bg-[#0F0F12] px-3 py-1.5 rounded border border-[#2A2A34]">
                <span className="text-xs font-black tabular-nums text-[#00FF88] w-8">{Math.round(randomIntensity * 100)}%</span>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={randomIntensity} 
                  onChange={(e) => setRandomIntensity(parseFloat(e.target.value))} 
                  className="w-20 h-1 accent-[#00FF88]" 
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            {/* Visualizer */}
            <div className="w-32 h-8 bg-black/40 rounded border border-[#2A2A34] overflow-hidden hidden md:block">
              <canvas ref={canvasRef} width={128} height={32} className="w-full h-full" />
            </div>

            {/* BPM */}
            <div className="flex items-center gap-3">
              <span className="text-[8px] font-black text-[#666] uppercase tracking-widest">BPM</span>
              <div className="flex items-center gap-2 bg-[#0F0F12] px-3 py-1.5 rounded border border-[#2A2A34]">
                <span className="text-xs font-black tabular-nums text-[#00FF88] w-6">{bpm}</span>
                <input type="range" min="60" max="200" value={bpm} onChange={(e) => setBpm(parseInt(e.target.value))} className="w-16 h-1 accent-[#00FF88]" />
              </div>
            </div>

            {/* Swing */}
            <div className="flex items-center gap-3">
              <span className="text-[8px] font-black text-[#666] uppercase tracking-widest">SWING</span>
              <div className="flex items-center gap-2 bg-[#0F0F12] px-3 py-1.5 rounded border border-[#2A2A34]">
                <span className="text-xs font-black tabular-nums text-[#00FF88] w-8">{swing}%</span>
                <input type="range" min="0" max="75" value={swing} onChange={(e) => setSwing(parseInt(e.target.value))} className="w-16 h-1 accent-[#00FF88]" />
              </div>
            </div>

            {/* Bars */}
            <div className="flex items-center gap-3">
              <span className="text-[8px] font-black text-[#666] uppercase tracking-widest">BARS</span>
              <div className="flex bg-[#0F0F12] p-1 rounded border border-[#2A2A34]">
                {[1, 2, 4].map(b => (
                  <button 
                    key={b} 
                    onClick={() => setBars(b as any)} 
                    className={`px-2 py-1 text-[10px] font-black rounded transition-all ${bars === b ? 'bg-[#00FF88] text-black' : 'text-[#666] hover:text-white'}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">

          {/* Left Sidebar - Mixer & Instrument Controls */}
          <aside className="w-80 bg-[#16161D] border-r border-[#2A2A34] flex flex-col shrink-0 z-40 shadow-2xl">
            <div className="p-4 border-b border-[#2A2A34] flex items-center justify-between bg-[#1A1A24]">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-[#00FF88]" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">INSTRUMENT MIXER</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCollapsedCategories(new Set(Object.keys(groupedInstruments)))}
                  className="p-1 hover:bg-[#2A2A34] rounded transition-colors"
                  title="Collapse All"
                >
                  <ChevronDown className="w-3 h-3 text-[#666]" />
                </button>
                <button 
                  onClick={() => setCollapsedCategories(new Set())}
                  className="p-1 hover:bg-[#2A2A34] rounded transition-colors"
                  title="Expand All"
                >
                  <ChevronRight className="w-3 h-3 text-[#666]" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
              {(Object.entries(groupedInstruments) as [string, DrumInstrument[]][]).map(([category, categoryInstruments]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center gap-2 w-full group">
                    <button 
                      onClick={() => toggleCategory(category)}
                      className="flex items-center gap-2 flex-1 text-left"
                    >
                      <div className="p-1 rounded bg-[#2A2A34] group-hover:bg-[#3A3A44] transition-colors">
                        {collapsedCategories.has(category) ? <ChevronRight className="w-3 h-3 text-[#666]" /> : <ChevronDown className="w-3 h-3 text-[#666]" />}
                      </div>
                      <span className="text-[9px] font-black text-[#666] uppercase tracking-widest group-hover:text-[#888]">{category}</span>
                    </button>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => toggleCategoryMute(category)}
                        className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase transition-all ${categoryInstruments.every(i => i.muted) ? 'bg-red-900/40 text-red-500' : 'bg-[#2A2A34] text-[#444] hover:text-white'}`}
                        title="Mute Category"
                      >
                        M
                      </button>
                      <button 
                        onClick={() => toggleCategorySolo(category)}
                        className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase transition-all ${categoryInstruments.every(i => i.soloed) ? 'bg-yellow-900/40 text-yellow-500' : 'bg-[#2A2A34] text-[#444] hover:text-white'}`}
                        title="Solo Category"
                      >
                        S
                      </button>
                    </div>
                    <div className="w-8 h-[1px] bg-[#2A2A34]" />
                  </div>
                  
                  {!collapsedCategories.has(category) && (
                    <div className="space-y-3 pl-2">
                      {categoryInstruments.map(inst => (
                        <div key={inst.id} className="p-3 rounded-xl bg-[#1A1A24] border border-[#2A2A34] hover:border-[#3A3A44] transition-all group/inst">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-4 rounded-full" style={{ backgroundColor: inst.color }} />
                              <span className="text-[11px] font-black text-white uppercase tracking-tight">{inst.name}</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover/inst:opacity-100 transition-opacity">
                              <label className="p-1.5 hover:bg-[#2A2A34] rounded cursor-pointer transition-colors" title="Upload Sample">
                                <Upload className="w-3 h-3 text-[#666] hover:text-[#00FF88]" />
                                <input 
                                  type="file" 
                                  accept="audio/*,.mp3,.wav,.ogg,.m4a" 
                                  className="hidden" 
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(inst.id, file);
                                  }}
                                />
                              </label>
                              <button 
                                onClick={() => randomizeInstrumentSteps(inst.id)}
                                className="p-1.5 hover:bg-[#2A2A34] rounded transition-colors"
                                title="Randomize"
                              >
                                <Dices className="w-3 h-3 text-[#666] hover:text-[#00FF88]" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {/* Sound Selection */}
                            <div className="space-y-1">
                              <div className="flex justify-between items-center px-1">
                                <span className="text-[8px] font-black text-[#444] uppercase tracking-widest">Sample Browser</span>
                                <Globe className="w-2.5 h-2.5 text-[#333]" />
                              </div>
                              <div className="relative">
                                <button 
                                  onClick={() => {
                                    setBrowsingInstrumentId(inst.id);
                                    setIsBrowserOpen(true);
                                  }}
                                  className="w-full bg-[#0F0F12] text-[10px] font-black text-[#AAA] uppercase py-2 px-3 rounded border border-[#2A2A34] hover:border-[#3A3A44] hover:text-white transition-all flex items-center justify-between group/browse"
                                  disabled={inst.isLoading}
                                >
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    <Disc className={`w-3 h-3 ${inst.isLoading ? 'animate-spin text-[#00FF88]' : 'text-[#444] group-hover/browse:text-[#00FF88]'}`} />
                                    <span className="truncate">{SOUND_PROFILES[inst.selectedSound]?.name || 'Custom'}</span>
                                  </div>
                                  <ChevronRight className="w-3 h-3 text-[#333]" />
                                </button>
                                {inst.isLoading && (
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded">
                                    <div className="w-3 h-3 border-2 border-[#00FF88] border-t-transparent rounded-full animate-spin" />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Mixer Controls */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-[8px] font-black text-[#555] uppercase">VOL</span>
                                  <span className="text-[8px] font-black text-[#00FF88] tabular-nums">{Math.round(inst.volume)}%</span>
                                </div>
                                <input 
                                  type="range" 
                                  min="0" 
                                  max="100" 
                                  value={inst.volume} 
                                  onChange={(e) => updateInstrument(inst.id, { volume: parseInt(e.target.value) })}
                                  className="w-full h-1 accent-[#00FF88] bg-[#0F0F12] rounded-full appearance-none cursor-pointer"
                                />
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-[8px] font-black text-[#555] uppercase">PAN</span>
                                  <span className="text-[8px] font-black text-[#00F0FF] tabular-nums">{inst.pan > 0 ? `R${inst.pan}` : inst.pan < 0 ? `L${Math.abs(inst.pan)}` : 'C'}</span>
                                </div>
                                <input 
                                  type="range" 
                                  min="-50" 
                                  max="50" 
                                  value={inst.pan} 
                                  onChange={(e) => updateInstrument(inst.id, { pan: parseInt(e.target.value) })}
                                  className="w-full h-1 accent-[#00F0FF] bg-[#0F0F12] rounded-full appearance-none cursor-pointer"
                                />
                              </div>
                            </div>

                            {/* Randomization Control */}
                            <div className="space-y-1 pt-1">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1.5">
                                  <input 
                                    type="checkbox" 
                                    checked={inst.randomEnabled} 
                                    onChange={(e) => updateInstrumentRandom(inst.id, { randomEnabled: e.target.checked })}
                                    className="w-2.5 h-2.5 accent-[#00FF88] bg-[#0F0F12] border-[#2A2A34] rounded"
                                  />
                                  <span className="text-[8px] font-black text-[#555] uppercase">RANDOM PROB</span>
                                </div>
                                <span className="text-[8px] font-black text-[#00FF88] tabular-nums">{Math.round(inst.randomProbability * 100)}%</span>
                              </div>
                              <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.01" 
                                value={inst.randomProbability} 
                                onChange={(e) => updateInstrumentRandom(inst.id, { randomProbability: parseFloat(e.target.value) })}
                                className="w-full h-1 accent-[#00FF88] bg-[#0F0F12] rounded-full appearance-none cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
                                disabled={!inst.randomEnabled}
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => updateInstrument(inst.id, { muted: !inst.muted })}
                                className={`flex-1 py-1.5 rounded text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2 ${inst.muted ? 'bg-red-900/40 text-red-500 border border-red-900/60' : 'bg-[#2A2A34] text-[#666] hover:text-white border border-transparent'}`}
                              >
                                {inst.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                                {inst.muted ? 'MUTED' : 'MUTE'}
                              </button>
                              <button 
                                onClick={() => updateInstrument(inst.id, { soloed: !inst.soloed })}
                                className={`flex-1 py-1.5 rounded text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2 ${inst.soloed ? 'bg-yellow-900/40 text-yellow-500 border border-yellow-900/60' : 'bg-[#2A2A34] text-[#666] hover:text-white border border-transparent'}`}
                              >
                                <Zap className={`w-3 h-3 ${inst.soloed ? 'fill-current' : ''}`} />
                                {inst.soloed ? 'SOLOED' : 'SOLO'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>

        {/* Main Content Area - Sequencer Grid */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0C] relative">
          {/* Grid Header */}
          <div className="h-16 border-b border-[#1A1A24] flex items-center justify-between px-8 shrink-0 bg-[#0F0F12]/80 backdrop-blur-md z-30">
            <div className="flex items-center gap-12">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-[#444] uppercase tracking-widest">BARS</span>
                <div className="flex gap-2">
                  {Array.from({ length: bars }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveBar(i)}
                      className={`
                        px-4 py-1.5 rounded-lg text-[10px] font-black transition-all border
                        ${activeBar === i 
                          ? 'bg-[#00FF88] text-black border-[#00FF88] shadow-[0_0_10px_rgba(0,255,136,0.3)]' 
                          : 'bg-[#1A1A20] text-[#666] border-[#2A2A34] hover:text-white hover:border-[#3A3A44]'
                        }
                      `}
                    >
                      BAR {i + 1}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4 text-[9px] font-black text-[#444] uppercase tracking-widest">
                <div className="flex items-center gap-2 px-3 py-1 bg-[#1A1A20] rounded-full border border-[#2A2A34]">
                  <span className="text-[#00F0FF]">{totalSteps}</span>
                  <span>STEPS</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-[#1A1A20] rounded-full border border-[#2A2A34]">
                  <span className="text-[#00FF88]">{instruments.length}</span>
                  <span>TRACKS</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[9px] font-black text-[#444] uppercase tracking-widest">STEP INDICATOR</span>
              <div className="flex gap-1">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${currentStep % 16 === i && Math.floor(currentStep / 16) === activeBar ? 'bg-[#00FF88] scale-125 shadow-[0_0_8px_rgba(0,255,136,0.5)]' : 'bg-[#2A2A34]'}`} />
                ))}
              </div>
            </div>
          </div>

          {/* Sequencer Grid Area */}
          <div className="flex-1 overflow-auto custom-scrollbar p-8">
            <div className="min-w-max bg-[#121216] rounded-2xl border border-[#1E1E24] p-8 shadow-2xl relative overflow-hidden">
              {/* Grid Background Lines */}
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#FFF 1px, transparent 1px), linear-gradient(90deg, #FFF 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              
              <div className="space-y-4 relative z-10">
                {instruments.map(inst => (
                  <div key={inst.id} className="flex items-center gap-6 group/row">
                    {/* Track Label */}
                    <div className="w-32 shrink-0 flex items-center gap-3">
                      <div className="w-1 h-8 rounded-full transition-transform group-hover/row:scale-x-150" style={{ backgroundColor: inst.color }} />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-[#666] uppercase tracking-tight group-hover/row:text-white transition-colors">{inst.name}</span>
                        <span className="text-[7px] font-bold text-[#333] uppercase">{SOUND_PROFILES[inst.selectedSound]?.name || 'Custom'}</span>
                      </div>
                    </div>

                    {/* Steps */}
                    <div 
                      className="grid gap-1.5 flex-1"
                      style={{ gridTemplateColumns: `repeat(16, minmax(0, 1fr))` }}
                    >
                      {pattern[inst.id].slice(activeBar * 16, (activeBar + 1) * 16).map((step, idx) => {
                        const globalIdx = activeBar * 16 + idx;
                        const isCurrent = currentStep === globalIdx;
                        const isBeat = idx % 4 === 0;

                        return (
                          <motion.button
                            key={idx}
                            onClick={() => toggleStep(inst.id, globalIdx)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            initial={false}
                            animate={{
                              scale: isCurrent ? 1.05 : 1,
                              backgroundColor: step.active 
                                ? '#00FF88' 
                                : isCurrent 
                                  ? '#2A2A34' 
                                  : isBeat 
                                    ? '#1A1A20' 
                                    : '#16161D',
                              boxShadow: step.active 
                                ? '0 0 20px rgba(0,255,136,0.3)' 
                                : '0 0 0px rgba(0,0,0,0)',
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 25,
                              backgroundColor: { duration: 0.1 }
                            }}
                            className={`
                              h-10 rounded-lg transition-all relative overflow-hidden
                              ${step.active 
                                ? 'text-black' 
                                : isCurrent 
                                  ? 'border border-[#00FF88]/30' 
                                  : isBeat 
                                    ? 'border border-[#2A2A34]/50' 
                                    : 'border border-transparent hover:border-[#2A2A34]'
                              }
                              ${step.isRandom && step.active ? 'ring-1 ring-white/30 ring-inset' : ''}
                            `}
                          >
                            {/* Pulse effect for active steps */}
                            {step.active && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{
                                  opacity: [0.1, 0.4, 0.1],
                                  scale: [0.9, 1.1, 0.9],
                                }}
                                transition={{
                                  duration: 3,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                                className="absolute inset-0 bg-white/30 blur-sm"
                              />
                            )}

                            {/* Step Number */}
                            <span className={`absolute top-1 left-1 text-[6px] font-bold ${step.active ? 'text-black/40' : 'text-[#333]'}`}>
                              {globalIdx + 1}
                            </span>

                            {/* Playhead Indicator */}
                            {isCurrent && (
                              <motion.div 
                                layoutId="playhead"
                                className="absolute inset-0 bg-[#00FF88]/10"
                                animate={{ opacity: [0.1, 0.3, 0.1] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                              />
                            )}

                            {/* Active Glow */}
                            {step.active && (
                              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                            )}

                            {/* Random Indicator */}
                            {step.isRandom && (
                              <div className="absolute top-1 right-1">
                                <Sparkles className={`w-2 h-2 ${step.active ? 'text-black/40' : 'text-[#00FF88]/40'}`} />
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Vertical Playhead Line */}
              {isPlaying && Math.floor(currentStep / 16) === activeBar && (
                <div 
                  className="absolute top-0 bottom-0 w-[2px] bg-[#00FF88] shadow-[0_0_15px_rgba(0,255,136,0.5)] pointer-events-none transition-all duration-75 z-20"
                  style={{ 
                    left: `calc(128px + 24px + ((${currentStep % 16} / 16) * (100% - 128px - 24px)))`,
                    opacity: 0.8
                  }}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Bar - Presets & Status */}
      <footer className="h-14 bg-[#16161D] border-t border-[#2A2A34] flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-[8px] font-black text-[#555] uppercase tracking-widest">GENRE PRESETS</span>
            <div className="flex gap-1">
              {GENRES.map(genre => (
                <button
                  key={genre.id}
                  onClick={() => applyGenrePreset(genre.id)}
                  className={`px-3 py-1.5 rounded text-[9px] font-black uppercase transition-all ${selectedGenre === genre.id ? 'bg-[#00FF88] text-black' : 'bg-[#2A2A34] text-[#666] hover:text-white'}`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-6 text-[8px] font-black uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse" />
              <span className="text-[#666]">ENGINE READY</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-[#00F0FF]" />
              <span className="text-[#666]">LATENCY: <span className="text-[#00F0FF]">12MS</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-3 h-3 text-[#555]" />
              <span className="text-[#444]">V3.5.2-STABLE</span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
        input[type=range] { -webkit-appearance: none; background: #1A1A20; border-radius: 2px; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 10px; width: 10px; border-radius: 50%; background: #00FF88; cursor: pointer; border: 1px solid #000; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2A2A34; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3A3A44; }
      `}</style>

      {/* Sample Browser Modal */}
      {isBrowserOpen && browsingInstrumentId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-[#121216] border border-[#1E1E24] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-[#1E1E24] flex items-center justify-between bg-[#16161D]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#00FF88]/10 flex items-center justify-center">
                  <Disc className="w-5 h-5 text-[#00FF88]" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white uppercase tracking-tighter">Sample Browser</h2>
                  <p className="text-[10px] font-bold text-[#666] uppercase tracking-widest">
                    Browsing for: {instruments.find(i => i.id === browsingInstrumentId)?.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search Splice Library..." 
                    value={sampleSearchQuery}
                    onChange={(e) => setSampleSearchQuery(e.target.value)}
                    className="bg-[#0F0F12] border border-[#2A2A34] rounded-xl py-2 px-4 pl-10 text-xs text-white focus:outline-none focus:border-[#00FF88]/50 w-64 transition-all"
                  />
                  <Globe className="w-4 h-4 text-[#444] absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <button 
                  onClick={() => setIsBrowserOpen(false)}
                  className="w-10 h-10 rounded-xl bg-[#1A1A20] hover:bg-[#2A2A34] flex items-center justify-center transition-colors"
                >
                  <Square className="w-4 h-4 text-[#666]" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6 custom-scrollbar">
              <div className="grid grid-cols-2 gap-8">
                {/* Available Sounds */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black text-[#444] uppercase tracking-widest">Splice & Factory Library</h3>
                    <span className="text-[9px] font-bold text-[#00FF88] bg-[#00FF88]/10 px-2 py-0.5 rounded-full">SPLICE.COM</span>
                  </div>
                  <div className="space-y-1">
                    {Object.entries(SOUND_PROFILES)
                      .filter(([id, profile]) => {
                        const inst = instruments.find(i => i.id === browsingInstrumentId);
                        const matchesType = id.startsWith(inst?.type || '');
                        const matchesSearch = profile.name.toLowerCase().includes(sampleSearchQuery.toLowerCase());
                        return matchesType && matchesSearch;
                      })
                      .map(([id, profile]) => (
                        <div 
                          key={id}
                          className={`
                            group p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer
                            ${instruments.find(i => i.id === browsingInstrumentId)?.selectedSound === id
                              ? 'bg-[#00FF88]/10 border-[#00FF88]/30'
                              : 'bg-[#1A1A20] border-[#2A2A34] hover:border-[#3A3A44]'
                            }
                          `}
                          onClick={() => changeSound(browsingInstrumentId, id)}
                        >
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                previewInstrument(browsingInstrumentId);
                              }}
                              className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center hover:bg-[#00FF88] hover:text-black transition-all"
                            >
                              <Play className="w-3 h-3" />
                            </button>
                            <span className={`text-xs font-bold ${instruments.find(i => i.id === browsingInstrumentId)?.selectedSound === id ? 'text-[#00FF88]' : 'text-gray-300'}`}>
                              {profile.name}
                            </span>
                          </div>
                          {profile.url && (
                            <div className="flex items-center gap-2">
                              <WaveformPreview url={profile.url} color={instruments.find(i => i.id === browsingInstrumentId)?.color || '#00FF88'} />
                              <Globe className="w-3 h-3 text-[#333]" />
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Uploads & Custom */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-[#444] uppercase tracking-widest px-2">Local Uploads</h3>
                  <div className="p-12 border-2 border-dashed border-[#2A2A34] rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-[#00FF88]/30 transition-all group cursor-pointer relative bg-[#0F0F12]/50">
                    <input 
                      type="file" 
                      accept="audio/*,.mp3,.wav,.ogg,.m4a"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(browsingInstrumentId, file);
                          setIsBrowserOpen(false);
                        }
                      }}
                    />
                    <div className="w-16 h-16 rounded-2xl bg-[#1A1A20] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#00FF88]/10 transition-all duration-300">
                      <Upload className="w-8 h-8 text-[#444] group-hover:text-[#00FF88]" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-black text-white uppercase tracking-tighter">Drop samples here</p>
                      <p className="text-[10px] font-bold text-[#444] uppercase tracking-widest mt-2">MP3, WAV, OGG, M4A (MAX 10MB)</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {instruments.find(i => i.id === browsingInstrumentId)?.availableSounds
                      .filter(s => s.id.startsWith('custom'))
                      .map(sound => (
                        <div 
                          key={sound.id}
                          className={`
                            p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer
                            ${instruments.find(i => i.id === browsingInstrumentId)?.selectedSound === sound.id
                              ? 'bg-[#00FF88]/10 border-[#00FF88]/30'
                              : 'bg-[#1A1A20] border-[#2A2A34] hover:border-[#3A3A44]'
                            }
                          `}
                          onClick={() => changeSound(browsingInstrumentId, sound.id)}
                        >
                          <div className="flex items-center gap-3">
                            <Zap className="w-3 h-3 text-[#00FF88]" />
                            <span className="text-xs font-bold text-gray-300">{sound.name}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#16161D] border-t border-[#1E1E24] flex items-center justify-between">
              <p className="text-[9px] font-bold text-[#444] uppercase tracking-widest">
                Splice integration active • High fidelity samples enabled
              </p>
              <button 
                onClick={() => setIsBrowserOpen(false)}
                className="px-8 py-2.5 bg-[#00FF88] text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#00DD77] transition-all shadow-[0_0_20px_rgba(0,255,136,0.2)]"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
}

import * as Tone from 'tone';
import { SOUND_PROFILES } from '../constants';

export class DrumKit {
  instruments: { [key: string]: Tone.MembraneSynth | Tone.NoiseSynth | Tone.MetalSynth | Tone.Sampler } = {};
  volumes: { [key: string]: Tone.Volume } = {};
  panners: { [key: string]: Tone.Panner } = {};
  
  analyser: Tone.Analyser;
  recorder: Tone.Recorder;
  master: Tone.Volume;
  limiter: Tone.Limiter;

  // Synth settings
  synthProfiles: { [key: string]: any } = {
    'kick-classic': { pitchDecay: 0.05, octaves: 10, oscillator: { type: 'sine' }, envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 } },
    'kick-deep': { pitchDecay: 0.1, octaves: 5, oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.8, sustain: 0.1, release: 2 } },
    'kick-hard': { pitchDecay: 0.02, octaves: 15, oscillator: { type: 'square' }, envelope: { attack: 0.001, decay: 0.2, sustain: 0.01, release: 0.5 } },
    'snare-classic': { noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.2, sustain: 0 } },
    'snare-crisp': { noise: { type: 'pink' }, envelope: { attack: 0.001, decay: 0.1, sustain: 0 } },
    'snare-fat': { noise: { type: 'white' }, envelope: { attack: 0.01, decay: 0.4, sustain: 0.1 } },
    'hihat-classic': { envelope: { attack: 0.001, decay: 0.1, release: 0.01 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5 },
    'hihat-short': { envelope: { attack: 0.001, decay: 0.05, release: 0.01 }, harmonicity: 8, modulationIndex: 40, resonance: 6000, octaves: 1 },
    'hihat-long': { envelope: { attack: 0.01, decay: 0.3, release: 0.5 }, harmonicity: 4, modulationIndex: 20, resonance: 3000, octaves: 2 },
    'cowbell-classic': { envelope: { attack: 0.001, decay: 0.1, release: 0.01 }, harmonicity: 1.5, modulationIndex: 10, resonance: 2000, octaves: 0.5 },
    'tom-classic': { pitchDecay: 0.1, octaves: 4, oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.5, sustain: 0.01, release: 1 } },
    'perc-classic': { pitchDecay: 0.01, octaves: 2, oscillator: { type: 'triangle' }, envelope: { attack: 0.001, decay: 0.1, sustain: 0.01, release: 0.1 } },
    'perc-wood': { pitchDecay: 0.001, octaves: 1, oscillator: { type: 'sine' }, envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 } },
    'perc-metallic': { pitchDecay: 0.05, octaves: 8, oscillator: { type: 'sawtooth' }, envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 } },
    'perc-rim': { pitchDecay: 0.01, octaves: 4, oscillator: { type: 'triangle' }, envelope: { attack: 0.001, decay: 0.02, sustain: 0, release: 0.02 } },
    'conga-classic': { pitchDecay: 0.05, octaves: 2, oscillator: { type: 'sine' }, envelope: { attack: 0.001, decay: 0.1, sustain: 0.01, release: 0.1 } },
    'shaker-classic': { noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.05, sustain: 0 } },
  };

  selectedSounds: { [key: string]: string } = {
    kick: 'kick-splice-1',
    snare: 'snare-splice-1',
    hihat: 'hihat-splice-1',
    cowbell: 'cowbell-splice-1',
    tom: 'tom-splice-1',
    perc: 'perc-splice-1',
    conga: 'conga-splice-1',
    shaker: 'shaker-splice-1',
  };

  constructor() {
    this.master = new Tone.Volume(-6);
    this.limiter = new Tone.Limiter(-1).connect(Tone.getDestination());
    this.master.connect(this.limiter);
    
    this.analyser = new Tone.Analyser('waveform', 256);
    this.recorder = new Tone.Recorder();
    
    // Route master to analyser and recorder
    this.master.connect(this.analyser);
    this.master.connect(this.recorder);

    // Initialize instruments
    ['kick', 'snare', 'hihat', 'cowbell', 'tom', 'perc', 'conga', 'shaker'].forEach(type => {
      this.panners[type] = new Tone.Panner(0).connect(this.master);
      this.volumes[type] = new Tone.Volume(0).connect(this.panners[type]);
      this.setSound(type, this.selectedSounds[type]);
    });
  }

  setSound(type: string, soundId: string, customUrl?: string, onLoad?: () => void) {
    this.selectedSounds[type] = soundId;
    
    // Dispose old instrument if exists
    if (this.instruments[type]) {
      this.instruments[type].dispose();
    }

    if (customUrl || (SOUND_PROFILES[soundId] && SOUND_PROFILES[soundId].url)) {
      const url = customUrl || SOUND_PROFILES[soundId].url;
      this.instruments[type] = new Tone.Sampler({
        urls: { C1: url! },
        onload: () => {
          console.log(`${type} sample loaded`);
          if (onLoad) onLoad();
        },
        onerror: (err) => {
          // Log only once per instrument type to avoid spam
          console.warn(`Sample load failed for ${type}, falling back to synth.`, err);
          
          // Fallback to synth if sample fails
          const synthConfig = this.synthProfiles[`${type}-classic`];
          const SynthClass = (type === 'snare' || type === 'shaker') ? Tone.NoiseSynth : (type === 'hihat' || type === 'cowbell' ? Tone.MetalSynth : Tone.MembraneSynth);
          this.instruments[type] = new SynthClass(synthConfig).connect(this.volumes[type]);
          if (onLoad) onLoad();
        }
      }).connect(this.volumes[type]);
    } else {
      const synthConfig = this.synthProfiles[soundId] || this.synthProfiles[`${type}-classic`];
      const SynthClass = (type === 'snare' || type === 'shaker') ? Tone.NoiseSynth : (type === 'hihat' || type === 'cowbell' ? Tone.MetalSynth : Tone.MembraneSynth);
      this.instruments[type] = new SynthClass(synthConfig).connect(this.volumes[type]);
      if (onLoad) onLoad();
    }
  }

  setVolume(type: string, volume: number) {
    if (this.volumes[type]) {
      this.volumes[type].volume.rampTo(volume, 0.1);
    }
  }

  setPan(type: string, pan: number) {
    if (this.panners[type]) {
      this.panners[type].pan.rampTo(pan, 0.1);
    }
  }

  setMute(type: string, muted: boolean) {
    if (this.volumes[type]) {
      this.volumes[type].mute = muted;
    }
  }

  play(id: string, time: number, velocity: number = 1) {
    const inst = this.instruments[id];
    if (!inst) return;
    
    if (inst instanceof Tone.Sampler) {
      if (inst.loaded) inst.triggerAttackRelease('C1', '8n', time, velocity);
    } else {
      switch (id) {
        case 'kick': (inst as Tone.MembraneSynth).triggerAttackRelease('C1', '8n', time, velocity); break;
        case 'snare': (inst as Tone.NoiseSynth).triggerAttackRelease('16n', time, velocity); break;
        case 'hihat': (inst as Tone.MetalSynth).triggerAttackRelease(200, '32n', time, velocity); break;
        case 'cowbell': (inst as Tone.MetalSynth).triggerAttackRelease(800, '32n', time, velocity); break;
        case 'tom': (inst as Tone.MembraneSynth).triggerAttackRelease('G2', '8n', time, velocity); break;
        case 'perc': (inst as Tone.MembraneSynth).triggerAttackRelease('C4', '32n', time, velocity); break;
        case 'conga': (inst as Tone.MembraneSynth).triggerAttackRelease('E3', '16n', time, velocity); break;
        case 'shaker': (inst as Tone.NoiseSynth).triggerAttackRelease('32n', time, velocity); break;
      }
    }
  }

  randomizeSynthParams(type: string) {
    const inst = this.instruments[type];
    if (!inst || inst instanceof Tone.Sampler) return;

    if (inst instanceof Tone.MembraneSynth) {
      inst.set({
        pitchDecay: Math.random() * 0.2,
        octaves: Math.random() * 10 + 2,
        envelope: {
          attack: Math.random() * 0.01,
          decay: Math.random() * 0.8 + 0.1,
          sustain: Math.random() * 0.1,
          release: Math.random() * 2 + 0.5
        }
      });
    } else if (inst instanceof Tone.NoiseSynth) {
      inst.set({
        envelope: {
          attack: Math.random() * 0.01,
          decay: Math.random() * 0.4 + 0.05,
          sustain: 0
        }
      });
    } else if (inst instanceof Tone.MetalSynth) {
      inst.set({
        harmonicity: Math.random() * 10 + 1,
        resonance: Math.random() * 5000 + 500,
        modulationIndex: Math.random() * 50 + 5,
        envelope: {
          attack: Math.random() * 0.01,
          decay: Math.random() * 0.2 + 0.05,
          release: Math.random() * 0.1 + 0.01
        }
      });
    }
  }

  getWaveform() {
    return this.analyser.getValue();
  }

  async startRecording() {
    this.recorder.start();
  }

  async stopRecording() {
    const blob = await this.recorder.stop();
    return blob;
  }
}

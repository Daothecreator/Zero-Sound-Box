"use client";
import React, { useState, useEffect } from 'react';
import { Radio, Play, Square, Activity, Waves, Headphones, BrainCircuit, Wind, Sliders, AlignCenter, Volume2, VolumeX } from 'lucide-react';
import { audioEngine, AudioConfig } from '@/lib/audio';
import dynamic from 'next/dynamic';

import BinauralFieldMap from "./BinauralFieldMap";
const AudioVisualizer = dynamic(() => import('./AudioVisualizer'), { ssr: false });

export const MODES = {
  complex: {
    id: 'complex',
    name: 'Complex Harmonics',
    description: 'Complex multi-harmonic physical resonance. Optimal for advanced acoustic testing and frequency modulation.',
    partials: [
      { ratio: 1.0, ampL: 0.35, ampR: 0.25, binauralBeat: 0, orbitSpeed: 0, depth: 0.3 , decay: 2.5},
      { ratio: 2.168, ampL: 0.15, ampR: 0.15, binauralBeat: 0, orbitSpeed: 0.05, depth: 0.3 , decay: 2.5},
      { ratio: 2.88, ampL: 0.10, ampR: 0.10, binauralBeat: 0, orbitSpeed: 0.08, depth: 0.15 , decay: 2.5},
      { ratio: 3.384, ampL: 0.08, ampR: 0.08, binauralBeat: 0, orbitSpeed: 0.11, depth: 0.15 , decay: 2.5}
    ]
  },
  pure: {
    id: 'pure',
    name: 'Pure Sine',
    description: 'High-purity spectral sine waves with minimal overtones. Ideal for precise frequency generation and analysis.',
    partials: [
      { ratio: 1.0, ampL: 0.4, ampR: 0.4, binauralBeat: 0, orbitSpeed: 0.02, depth: 0.1 , decay: 2.5},
      { ratio: 2.0, ampL: 0.15, ampR: 0.15, binauralBeat: 2.0, orbitSpeed: 0, depth: 0.05 , decay: 2.5},
      { ratio: 3.0, ampL: 0.05, ampR: 0.05, binauralBeat: 0, orbitSpeed: 0.05, depth: 0.05 , decay: 2.5}
    ]
  },
  quantum: {
    id: 'quantum',
    name: 'Quantum Coherence',
    description: 'Based on quantum acoustic principles. Features phase-shifted overtones and expanded spatial depth.',
    partials: [
      { ratio: 1.0, ampL: 0.3, ampR: 0.3, binauralBeat: 0, orbitSpeed: 0.01, depth: 0.2 , decay: 2.5},
      { ratio: 1.5, ampL: 0.15, ampR: 0.15, binauralBeat: 0, orbitSpeed: 0.03, depth: 0.1 , decay: 2.5},
      { ratio: 1.618, ampL: 0.1, ampR: 0.1, binauralBeat: 0, orbitSpeed: 0.05, depth: 0.1 , decay: 2.5}, // Golden Ratio
      { ratio: 2.0, ampL: 0.1, ampR: 0.1, binauralBeat: 0.5, orbitSpeed: 0.07, depth: 0.05 , decay: 2.5},
      { ratio: 2.718, ampL: 0.08, ampR: 0.08, binauralBeat: 0, orbitSpeed: 0.09, depth: 0.05 , decay: 2.5}, // Euler's number
      { ratio: 3.141, ampL: 0.05, ampR: 0.05, binauralBeat: 0, orbitSpeed: 0.11, depth: 0.02 , decay: 2.5}, // Pi
    ]
  }
};

const CARRIER_PRESETS = [
  { name: '110 Hz (Low End)', freq: 110.0 },
  { name: '136.1 Hz (Standard)', freq: 136.1 },
  { name: '174.0 Hz (Mid-Low)', freq: 174.0 },
  { name: '256.0 Hz (Scientific C4)', freq: 256.0 },
  { name: '396.0 Hz (Signal)', freq: 396.0 },
  { name: '432.0 Hz (Harmonic)', freq: 432.0 },
  { name: '528.0 Hz (Signal)', freq: 528.0 },
  { name: '639.0 Hz (Signal)', freq: 639.0 },
];

const ENTRAINMENT_PRESETS = [
  { name: 'Delta Band (0.5 - 4 Hz)', beat: 2.5 },
  { name: 'Theta Band (4 - 8 Hz)', beat: 6.0 },
  { name: 'Alpha Band (8 - 14 Hz)', beat: 10.0 },
  { name: 'Beta Band (14 - 30 Hz)', beat: 20.0 },
  { name: 'Gamma Band (30+ Hz)', beat: 40.0 },
];

const EMF_PRESETS = [
  { name: 'Schumann Resonance (7.83 Hz)', freq: 7.83 },
  { name: 'Schumann Harmonic 1', freq: 14.3 },
  { name: 'Schumann Harmonic 2', freq: 20.8 },
  { name: 'Schumann Harmonic 3', freq: 27.3 },
  { name: 'Mains Hum (EU/Asia)', freq: 50.0 },
  { name: 'Mains Hum (US)', freq: 60.0 },
];

export default function AcousticSynthesizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMode, setActiveMode] = useState<string>('complex');
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [volume, setVolume] = useState(1.0);
  
  const [config, setConfig] = useState<AudioConfig>({
    leftFreq: 136.1,
    rightFreq: 136.1 + 6.0,
    emfEnabled: false,
    emfFreq: 7.83,
    isochronicEnabled: false,
    noiseEnabled: false,
    noiseType: 'brown',
    noiseVolume: 0.1,
    stochasticResonance: false,
    spatialWidening: false,
    volumetric8DEnabled: false,
    missingFundamental: false,
    shepardTone: false,
    phaseCoherence: false,
    rfEnabled: false,
    rfFreq: 144.0,
    rfWaveform: 'sine',
    quantumZenoEffect: false,
    gammaRhythms: false,
    infrasound: false,
    eyeballResonance: false,
    rissetRhythm: false,
    tritoneParadox: false,
    octaveIllusion: false,
    tartiniTones: false,
    zwickerTone: false,
    otoacousticEmissions: false,
    subwooferPressure: false,
    chestResonance: false,
    asmr: false,
    sonoluminescence: false,
    acousticLevitation: false,
    acousticCavitation: false,
    acousticBlackHole: false,
    chladniResonance: false,
    templeResonance: false,
    auroraSounds: false,
    phantomTone: false,
    auditoryPareidolia: false,
    franssenEffect: false,
    specificFrequencies: false,
    highResMicrodynamics: false,
    ambisonicEnvironment: false,
    psychoacousticCompression: false,
    mode: MODES.complex
  });

  useEffect(() => {
    audioEngine.init();
    
    const interval = setInterval(() => {
      setDiagnostics(audioEngine.getDiagnostics());
    }, 1000);

    return () => {
      clearInterval(interval);
      audioEngine.stop(0.1);
    };
  }, []);

  const applyConfig = (newConfig: AudioConfig) => {
    setConfig(newConfig);
    if (isPlaying) {
      audioEngine.playSynth(newConfig);
    }
  };

  const togglePlay = async () => {
    await audioEngine.init();
    if (isPlaying) {
      audioEngine.stop();
      setIsPlaying(false);
    } else {
      audioEngine.playSynth(config);
      audioEngine.setVolume(volume);
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioEngine.setVolume(val);
  };

  const handleCarrierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const base = parseFloat(e.target.value);
    const diff = config.rightFreq - config.leftFreq;
    applyConfig({
      ...config,
      leftFreq: base,
      rightFreq: base + diff
    });
  };

  const handleEntrainmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const beat = parseFloat(e.target.value);
    applyConfig({
      ...config,
      rightFreq: config.leftFreq + beat
    });
  };

  const handleHarmonicDecayChange = (index: number, value: number) => {
    const newPartials = [...config.mode.partials];
    newPartials[index] = { ...newPartials[index], decay: value };
    applyConfig({
      ...config,
      mode: {
        ...config.mode,
        partials: newPartials
      }
    });
  };

  const handleHarmonicPhaseChange = (index: number, value: number) => {
    const newPartials = [...config.mode.partials];
    newPartials[index] = { ...newPartials[index], phase: value };
    applyConfig({
      ...config,
      mode: {
        ...config.mode,
        partials: newPartials
      }
    });
  };

  const handleSpatialChange = (idx: number, x: number, y: number) => {
    const newPartials = [...config.mode.partials];
    newPartials[idx] = { ...newPartials[idx], posX: x, posY: y };
    applyConfig({
      ...config,
      mode: { ...config.mode, partials: newPartials }
    });
  };
  const handlePhaseReset = () => {
    // Reset all phases to 0 for absolute coherence
    const newPartials = config.mode.partials.map(p => ({ ...p, phase: 0 }));
    applyConfig({
      ...config,
      mode: {
        ...config.mode,
        partials: newPartials
      }
    });
  };

  const handleEmfPresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyConfig({
      ...config,
      emfFreq: parseFloat(e.target.value)
    });
  };

  const selectMode = (modeId: string) => {
    setActiveMode(modeId);
    applyConfig({
      ...config,
      mode: MODES[modeId as keyof typeof MODES]
    });
  };

  const currentModeConfig = MODES[activeMode as keyof typeof MODES];
  const currentBeat = config.rightFreq - config.leftFreq;

  return (
    <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center p-8 z-10 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden mt-8 mb-16">
      <div className="absolute inset-0 z-[-1] pointer-events-none">
         <AudioVisualizer isPlaying={isPlaying} frequency={config.leftFreq} />
      </div>
      
      <div className="z-10 flex flex-col items-center space-y-10 w-full pt-6 pb-6">
        
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-light tracking-widest text-white/90">NEURO-ACOUSTIC MODULATOR</h1>
          <p className="text-sm text-white/50 font-mono tracking-widest uppercase">
            Physiological & Psychoacoustic Frequency Engine
          </p>
          
          <div className="flex justify-center flex-wrap gap-4 pt-4">
            {Object.values(MODES).map((mode) => (
              <button
                key={mode.id}
                onClick={() => selectMode(mode.id)}
                className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-widest transition-all ${
                  activeMode === mode.id
                    ? 'bg-white/20 text-white border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                    : 'bg-white/5 text-white/50 border border-transparent hover:bg-white/10 hover:text-white/80'
                }`}
              >
                {mode.name}
              </button>
            ))}
          </div>
          <p className="text-xs text-white/40 font-sans tracking-wide max-w-md mx-auto leading-relaxed pt-2 h-12">
            {currentModeConfig.description}
          </p>
        </div>

        <button
          onClick={togglePlay}
          className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-700 ease-in-out ${
            isPlaying 
              ? 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.3)]' 
              : 'bg-white/5 text-white border border-white/20 hover:bg-white/10 hover:border-white/40'
          }`}
        >
          {isPlaying ? (
            <Square className="w-10 h-10 opacity-80" />
          ) : (
            <Play className="w-12 h-12 ml-2 opacity-90" />
          )}
        </button>


        <div className="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 px-4 pt-4">
          {/* Column 1 */}
          <div className="space-y-6">
          {/* Main Frequencies Panel */}
          <div className="space-y-6 bg-white/5 p-6 rounded-2xl border border-white/10">
            <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
              <Waves className="w-4 h-4 text-white/60" />
              <h2 className="text-sm font-mono text-white/80 uppercase tracking-widest">Acoustic Therapy</h2>
            </div>
            
            <div className="space-y-6">
              {/* Carrier Frequency */}
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-mono text-white/40 uppercase tracking-widest flex justify-between items-center">
                  <span>Carrier Freq</span>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="number" 
                      value={config.leftFreq}
                      onChange={(e) => applyConfig({ ...config, leftFreq: Number(e.target.value) || 0 })}
                      className="w-20 bg-black/50 border border-white/20 rounded p-1 text-right text-white/90 text-sm outline-none focus:border-white/50"
                      step="0.1"
                    />
                    <span className="text-white/60">Hz</span>
                  </div>
                </label>
                <select 
                  className="bg-black/50 border border-white/20 rounded-lg p-2 text-sm text-white/90 outline-none focus:border-white/50"
                  onChange={handleCarrierChange}
                  value={CARRIER_PRESETS.find(p => p.freq === config.leftFreq) ? config.leftFreq : "custom"}
                >
                  <option value="custom" disabled hidden>Custom ({config.leftFreq.toFixed(1)} Hz)</option>
                  {CARRIER_PRESETS.map(p => (
                    <option key={p.freq} value={p.freq}>{p.name} ({p.freq} Hz)</option>
                  ))}
                </select>
                <input
                  type="range" min="1" max="2000" step="0.1"
                  value={config.leftFreq}
                  onChange={(e) => setConfig(p => ({ ...p, leftFreq: parseFloat(e.target.value) }))}
                  onMouseUp={() => applyConfig(config)}
                  onTouchEnd={() => applyConfig(config)}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
              </div>

              {/* Entrainment Frequency */}
              <div className="flex flex-col space-y-2 pt-2 border-t border-white/5">
                <label className="text-xs font-mono text-white/40 uppercase tracking-widest flex justify-between items-center">
                  <span>Entrainment</span>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="number" 
                      value={currentBeat}
                      onChange={(e) => applyConfig({ ...config, rightFreq: config.leftFreq + (Number(e.target.value) || 0) })}
                      className="w-20 bg-black/50 border border-white/20 rounded p-1 text-right text-white/90 text-sm outline-none focus:border-white/50"
                      step="0.1"
                    />
                    <span className="text-white/60">Hz</span>
                  </div>
                </label>
                <select 
                  className="bg-black/50 border border-white/20 rounded-lg p-2 text-sm text-white/90 outline-none focus:border-white/50"
                  onChange={handleEntrainmentChange}
                  value={ENTRAINMENT_PRESETS.find(p => p.beat === currentBeat) ? currentBeat : "custom"}
                >
                  <option value="custom" disabled hidden>Custom Delta ({currentBeat.toFixed(1)} Hz)</option>
                  {ENTRAINMENT_PRESETS.map(p => (
                    <option key={p.beat} value={p.beat}>{p.name}</option>
                  ))}
                </select>
                <input
                  type="range" min="0" max="50" step="0.1"
                  value={currentBeat}
                  onChange={(e) => setConfig(p => ({ ...p, rightFreq: config.leftFreq + parseFloat(e.target.value) }))}
                  onMouseUp={() => applyConfig(config)}
                  onTouchEnd={() => applyConfig(config)}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
              </div>
            </div>
          </div>

      {/* High-Resolution Ambisonics & Microdynamics Panel */}
      <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col h-full">
          <div className="flex items-center space-x-2 border-b border-white/10 pb-3 mb-4">
            <Radio className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-mono text-blue-400 uppercase tracking-widest">High-Definition Acoustic Rendering (24-bit / 96kHz)</h2>
          </div>
          <p className="text-xs text-white/40 leading-relaxed mb-4">
            Activate professional-grade algorithmic rendering utilizing interaural time difference (ITD), micro-dynamics, phase geometry, and psychophysical compression. (Requires high-fidelity stereo headphones).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'ambisonicEnvironment', name: 'Ambisonic & Room Realism', desc: 'True binaural spatialization. Multi-stage reflections, diffusion, and algorithmic convolution reverb. Generates realistic volumetric spaces.' },
              { id: 'highResMicrodynamics', name: 'Microdynamics & Microtones', desc: 'Infinite procedural modulation of micro-pitch (cents) and micro-volume. Replicates natural organic acoustic fluctuation to prevent auditory fatigue.' },
              { id: 'psychoacousticCompression', name: 'Psychoacoustic Compression', desc: 'Non-linear dynamic range modeling based on human ear sensitivity curves (Fletcher-Munson). Enhances perceived depth without clipping.' }
            ].map(feature => (
              <label key={feature.id} className="flex items-start space-x-3 p-4 rounded-xl bg-black/20 border border-blue-500/20 hover:border-blue-400/50 hover:bg-blue-900/10 transition-all cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input 
                    type="checkbox" 
                    className="peer sr-only"
                    checked={config[feature.id as keyof AudioConfig] as boolean}
                    onChange={(e) => applyConfig({ ...config, [feature.id]: e.target.checked })}
                  />
                  <div className="w-4 h-4 rounded border border-blue-500/30 peer-checked:bg-blue-500 peer-checked:border-blue-400 transition-colors"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-mono text-blue-300 group-hover:text-blue-200 transition-colors">{feature.name}</span>
                  <span className="text-[10px] text-white/40 mt-1 leading-relaxed">{feature.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

          </div>

          {/* Column 2 */}
          <div className="space-y-6">
            {/* Psychoacoustics */}
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <div className="flex items-center space-x-2 border-b border-white/10 pb-3 mb-4">
                <BrainCircuit className="w-4 h-4 text-white/60" />
                <h2 className="text-sm font-mono text-white/80 uppercase tracking-widest">Psychoacoustics</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col pr-4">
                    <span className="text-sm text-white/90">Isochronic Pulse</span>
                    <span className="text-xs text-white/40 mt-1">Amplitude-modulated. Speakers OK.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input type="checkbox" className="sr-only peer" checked={config.isochronicEnabled}
                      onChange={(e) => applyConfig({ ...config, isochronicEnabled: e.target.checked })} />
                    <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white/40"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col pr-4">
                    <span className="text-sm text-white/90">8D Volumetric Binaural Beats</span>
                    <span className="text-xs text-white/40 mt-1">360° traveling HRTF acoustic space. Use stereo headphones.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input type="checkbox" className="sr-only peer" checked={config.volumetric8DEnabled}
                      onChange={(e) => applyConfig({ ...config, volumetric8DEnabled: e.target.checked })} />
                    <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white/40"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col pr-4">
                    <span className="text-sm text-white/90">Missing Fundamental</span>
                    <span className="text-xs text-white/40 mt-1">Psychoacoustic pitch perception without root freq.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input type="checkbox" className="sr-only peer" checked={config.missingFundamental}
                      onChange={(e) => applyConfig({ ...config, missingFundamental: e.target.checked })} />
                    <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white/40"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col pr-4">
                    <span className="text-sm text-white/90">Shepard Tone Layer</span>
                    <span className="text-xs text-white/40 mt-1">Illusion of endless pitch depth via octave stacking.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input type="checkbox" className="sr-only peer" checked={config.shepardTone}
                      onChange={(e) => applyConfig({ ...config, shepardTone: e.target.checked })} />
                    <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white/40"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col pr-4">
                    <span className="text-sm text-white/90">Quantum Phase Coherence</span>
                    <span className="text-xs text-white/40 mt-1">Oscillator entanglement simulation (beats converge).</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input type="checkbox" className="sr-only peer" checked={config.phaseCoherence}
                      onChange={(e) => applyConfig({ ...config, phaseCoherence: e.target.checked })} />
                    <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white/40"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col pr-4">
                    <span className="text-sm text-white/90">Stochastic Resonance</span>
                    <span className="text-xs text-white/40 mt-1">Noise modulation to enhance signal detection.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input type="checkbox" className="sr-only peer" checked={config.stochasticResonance}
                      onChange={(e) => applyConfig({ ...config, stochasticResonance: e.target.checked })} />
                    <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white/40"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col pr-4">
                    <span className="text-sm text-white/90">Quantum Zeno Effect</span>
                    <span className="text-xs text-white/40 mt-1">Freezes frequency evolution via continuous observation.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input type="checkbox" className="sr-only peer" checked={config.quantumZenoEffect}
                      onChange={(e) => applyConfig({ ...config, quantumZenoEffect: e.target.checked })} />
                    <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white/40"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col pr-4">
                    <span className="text-sm text-white/90">Spatial Widening</span>
                    <span className="text-xs text-white/40 mt-1">Haas effect delay for 3D depth.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input type="checkbox" className="sr-only peer" checked={config.spatialWidening}
                      onChange={(e) => applyConfig({ ...config, spatialWidening: e.target.checked })} />
                    <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white/40"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Binaural Field Map Panel */}
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col">
              <div className="flex items-center space-x-2 border-b border-white/10 pb-3 mb-4">
                <svg className="w-4 h-4 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20"/></svg>
                <h2 className="text-sm font-mono text-white/80 uppercase tracking-widest">Binaural Spatialization</h2>
              </div>
              <BinauralFieldMap partials={config.mode.partials} onChange={handleSpatialChange} />
            </div>
      {/* Advanced Psychoacoustics & Phenomena Panel */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col h-full">
            <div className="flex items-center space-x-2 border-b border-white/10 pb-3 mb-4">
              <Activity className="w-4 h-4 text-white/60" />
              <h2 className="text-sm font-mono text-white/80 uppercase tracking-widest">Advanced Psychoacoustics & Phenomena</h2>
            </div>
            <p className="text-xs text-white/40 leading-relaxed mb-4">
              Activate deeply researched auditory illusions, physiological resonances, and acoustic phenomena. Some features may require high-fidelity headphones or robust subwoofers to manifest correctly.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {[
                { id: 'gammaRhythms', name: 'Gamma Rhythms', desc: 'Binaural beats oscillating at 40Hz for hyper-focus.' },
                { id: 'infrasound', name: 'Infrasonic Waves', desc: '12Hz subsonic modulation. Felt, not heard.' },
                { id: 'eyeballResonance', name: 'Eyeball Resonance', desc: 'Precise 18.98Hz tone inducing optical vibration.' },
                { id: 'chestResonance', name: 'Chest Resonance', desc: '75Hz deep somatic frequency.' },
                { id: 'subwooferPressure', name: 'Subwoofer Pressure', desc: 'Intense 40Hz triangular sub-bass layer.' },
                { id: 'templeResonance', name: 'Temple Resonance', desc: '110Hz ancient architecture acoustic profile.' },
                { id: 'tartiniTones', name: 'Tartini Tones', desc: 'Loud primary tones creating a 200Hz phantom third tone in the ear.' },
                { id: 'zwickerTone', name: 'Zwicker Tone', desc: 'Notch-filtered noise to induce phantom ringing post-stop.' },
                { id: 'otoacousticEmissions', name: 'Otoacoustic Emissions', desc: 'Barely audible multi-frequency stimuli.' },
                { id: 'asmr', name: 'ASMR Somatic', desc: 'Spatial sweeping high-frequency textured noise.' },
                { id: 'auroraSounds', name: 'Aurora Borealis', desc: 'Synthesized electromagnetic crackling of solar wind.' },
                { id: 'phantomTone', name: 'Phantom Tone', desc: 'Extreme threshold 16kHz sine in anechoic simulation.' },
                { id: 'auditoryPareidolia', name: 'Auditory Pareidolia', desc: 'Dynamic brown noise bands creating phantom voices.' },
                { id: 'franssenEffect', name: 'Franssen Effect', desc: 'Spatial illusion separating attack and sustain localization.' },
                { id: 'acousticLevitation', name: 'Acoustic Levitation', desc: 'High frequency (20kHz) standing wave simulation.' },
                { id: 'acousticCavitation', name: 'Acoustic Cavitation', desc: 'Aggressively pulsed high frequency sonoluminescence analogue.' },
                { id: 'acousticBlackHole', name: 'Acoustic Black Hole', desc: 'Continuous decelerating frequency sweep trap.' },
                { id: 'chladniResonance', name: 'Chladni Figures', desc: 'Sweeping classic plate resonance frequencies.' },
                { id: 'specificFrequencies', name: 'Resonance Protocol Alpha', desc: 'Infusion of 1.25, 5.08, 10.55, 20.51, 33.18, 90.12 Hz.' },
                { id: 'rissetRhythm', name: 'Risset Rhythm', desc: 'Endlessly accelerating auditory drum illusion.' },
                { id: 'octaveIllusion', name: 'Octave Illusion', desc: 'Alternating high/low and left/right tones.' },
                { id: 'tritoneParadox', name: 'Tritone Paradox', desc: 'Shepard tones spaced by a tritone. Pitch direction is subjective.' }
              ].map(feature => (
                <label key={feature.id} className="flex items-start space-x-3 p-3 rounded-lg bg-black/20 border border-white/5 hover:border-white/20 transition-colors cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input 
                      type="checkbox" 
                      className="peer sr-only"
                      checked={config[feature.id as keyof AudioConfig] as boolean}
                      onChange={(e) => applyConfig({ ...config, [feature.id]: e.target.checked })}
                    />
                    <div className="w-4 h-4 rounded border border-white/20 peer-checked:bg-white peer-checked:border-white transition-colors"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-mono text-white/80 group-hover:text-white transition-colors">{feature.name}</span>
                    <span className="text-[10px] text-white/40 mt-1 leading-relaxed">{feature.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>



          </div>

          {/* Column 3 */}
          <div className="space-y-6">
            {/* Harmonic Decay Panel */}
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col h-full">
              <div className="flex items-center space-x-2 border-b border-white/10 pb-3 mb-4">
                <Sliders className="w-4 h-4 text-white/60" />
                <h2 className="text-sm font-mono text-white/80 uppercase tracking-widest">Resonance Envelopes</h2>
              </div>
              <p className="text-xs text-white/40 leading-relaxed mb-4">
                Adjust the physical persistence and decay time of individual harmonic overtones.
              </p>
              <div className="space-y-4 flex-1 pr-2">
                {config.mode.partials.map((partial, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-xs font-mono text-white/50">
                      <span>Harmonic {idx + 1} ({partial.ratio.toFixed(2)}x)</span>
                      <span>{partial.decay?.toFixed(1) || 2.5}s</span>
                    </div>
                    <input
                      type="range" min="0.1" max="15.0" step="0.1"
                      value={partial.decay || 2.5}
                      onChange={(e) => handleHarmonicDecayChange(idx, parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Phase Alignment Panel */}
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col h-full">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <AlignCenter className="w-4 h-4 text-white/60" />
                  <h2 className="text-sm font-mono text-white/80 uppercase tracking-widest">Phase Coherency</h2>
                </div>
                <button 
                  onClick={handlePhaseReset}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white/80 text-xs font-mono rounded-full transition-colors border border-white/20"
                >
                  ZERO ALL
                </button>
              </div>
              <p className="text-xs text-white/40 leading-relaxed mb-4">
                Ensure absolute resonance stability by real-time phase alignment of multi-oscillator architecture to prevent destructive interference.
              </p>
              <div className="space-y-4 flex-1 pr-2">
                {config.mode.partials.map((partial, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-xs font-mono text-white/50">
                      <span>Harmonic {idx + 1} ({partial.ratio.toFixed(2)}x)</span>
                      <span>{partial.phase || 0}°</span>
                    </div>
                    <input
                      type="range" min="0" max="360" step="1"
                      value={partial.phase || 0}
                      onChange={(e) => handleHarmonicPhaseChange(idx, parseInt(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* RF Generator Panel */}
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-white/60" />
                  <h2 className="text-sm font-mono text-white/80 uppercase tracking-widest">RF Generator</h2>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={config.rfEnabled}
                    onChange={(e) => applyConfig({ ...config, rfEnabled: e.target.checked })} />
                  <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white/40"></div>
                </label>
              </div>

              <div className={`space-y-4 pt-4 transition-opacity duration-300 ${config.rfEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-mono text-white/40 uppercase tracking-widest flex justify-between items-center">
                    <span>Frequency</span>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="number" 
                        value={config.rfFreq}
                        onChange={(e) => applyConfig({ ...config, rfFreq: Number(e.target.value) || 0 })}
                        className="w-24 bg-black/50 border border-white/20 rounded p-1 text-right text-white/90 text-sm outline-none focus:border-white/50"
                        step="0.1"
                      />
                      <span className="text-white/60">Hz</span>
                    </div>
                  </label>
                  <input
                    type="range" min="1" max="20000" step="1"
                    value={config.rfFreq}
                    onChange={(e) => setConfig(p => ({ ...p, rfFreq: parseFloat(e.target.value) }))}
                    onMouseUp={() => applyConfig(config)}
                    onTouchEnd={() => applyConfig(config)}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  />
                </div>
                
                <div className="flex flex-col space-y-2 pt-2 border-t border-white/5">
                   <label className="text-xs font-mono text-white/40 uppercase tracking-widest">
                     Waveform
                   </label>
                   <select 
                     className="bg-black/50 border border-white/20 rounded-lg p-2 text-sm text-white/90 outline-none focus:border-white/50"
                     value={config.rfWaveform}
                     onChange={(e) => applyConfig({ ...config, rfWaveform: e.target.value as AudioConfig['rfWaveform'] })}
                   >
                     <option value="sine">Sine</option>
                     <option value="square">Square</option>
                     <option value="triangle">Triangle</option>
                     <option value="sawtooth">Sawtooth</option>
                     <option value="spiral">Spiral (Custom Phase)</option>
                     <option value="hexagonal">Hexagonal (Harmonic)</option>
                   </select>
                </div>
              </div>
            </div>

            {/* EMF Panel */}
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col h-full">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-white/60" />
                  <h2 className="text-sm font-mono text-white/80 uppercase tracking-widest">Original EMF Simulator</h2>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={config.emfEnabled}
                    onChange={(e) => applyConfig({ ...config, emfEnabled: e.target.checked })} />
                  <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white/40"></div>
                </label>
              </div>
              
              <div className={`space-y-4 pt-4 transition-opacity duration-300 flex-1 ${config.emfEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <p className="text-xs text-white/40 leading-relaxed">
                  Synthesizes authentic electromagnetic fields using resonant noise mapping (Schumann) or additive harmonic rendering (Mains).
                </p>
                <div className="flex flex-col space-y-1.5">
                  <select 
                    className="bg-black/50 border border-white/20 rounded-lg p-2 text-sm text-white/90 outline-none focus:border-white/50"
                    onChange={handleEmfPresetChange}
                    value={EMF_PRESETS.find(p => p.freq === config.emfFreq) ? config.emfFreq : "custom"}
                  >
                    <option value="custom" disabled hidden>Custom ({config.emfFreq.toFixed(2)} Hz)</option>
                    {EMF_PRESETS.map(p => (
                      <option key={p.freq} value={p.freq}>{p.name} ({p.freq} Hz)</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-mono text-white/50">
                    <span>Target Frequency</span>
                    <span>{config.emfFreq.toFixed(2)} Hz</span>
                  </div>
                  <input
                    type="range" min="1" max="100" step="0.01"
                    value={config.emfFreq}
                    onChange={(e) => setConfig(p => ({ ...p, emfFreq: parseFloat(e.target.value) }))}
                    onMouseUp={() => applyConfig(config)}
                    onTouchEnd={() => applyConfig(config)}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Noise Generator */}
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2">
                  <Wind className="w-4 h-4 text-white/60" />
                  <h2 className="text-sm font-mono text-white/80 uppercase tracking-widest">Noise Masking</h2>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={config.noiseEnabled}
                    onChange={(e) => applyConfig({ ...config, noiseEnabled: e.target.checked })} />
                  <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white/40"></div>
                </label>
              </div>
              
              <div className={`space-y-4 pt-4 transition-opacity duration-300 ${config.noiseEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <div className="flex space-x-2">
                  {(['brown', 'pink', 'white'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => applyConfig({ ...config, noiseType: type })}
                      className={`flex-1 py-1.5 rounded-md text-xs font-mono uppercase transition-all ${
                        config.noiseType === type ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <input
                  type="range" min="0" max="0.5" step="0.01" value={config.noiseVolume}
                  onChange={(e) => setConfig(p => ({ ...p, noiseVolume: parseFloat(e.target.value) }))}
                  onMouseUp={() => applyConfig(config)} onTouchEnd={() => applyConfig(config)}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
              </div>
            </div>

            {/* Info box */}
            {!config.isochronicEnabled && (
                <div className="mt-4 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start space-x-3">
                  <Headphones className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-200/80 leading-relaxed">
                    Binaural beats and Spatial Widening active. <strong className="text-blue-100">Stereo headphones required</strong> for neurological synchronization.
                  </p>
                </div>
            )}

          </div>
        </div>
      </div>
            {/* Volume Slider */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-5 py-2.5 shadow-2xl">
        <button 
          onClick={() => {
            const newVal = volume > 0 ? 0 : 1;
            setVolume(newVal);
            audioEngine.setVolume(newVal);
          }}
          className="text-white/50 hover:text-white/90 transition-colors"
        >
          {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={volume} 
          onChange={handleVolumeChange}
          className="w-32 h-1 bg-white/20 rounded-full appearance-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
        />
      </div>

      {/* Diagnostic Overlay */}
      <button 
        onClick={() => setShowDiagnostics(!showDiagnostics)}
        className="fixed bottom-4 right-4 z-50 p-2 bg-black/60 backdrop-blur border border-white/20 rounded-full text-white/50 hover:text-white/90 hover:bg-white/10 transition-colors"
        title="Toggle Hardware Diagnostics"
      >
        <Activity className="w-5 h-5" />
      </button>

      {showDiagnostics && diagnostics && (
        <div className="fixed bottom-16 right-4 z-50 w-80 bg-black/90 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl font-mono text-xs text-white/80 space-y-3">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/10">
            <span className="text-white/90 font-bold uppercase tracking-wider">DSP Diagnostics</span>
            <span className={`w-2 h-2 rounded-full ${diagnostics.state === 'running' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></span>
          </div>
          


          <div className="flex justify-between">
            <span className="text-white/40">Hardware DAC Rate</span>
            <span>{diagnostics.sampleRate} Hz</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-white/40">Bit Depth</span>
            <span className="text-blue-400">{diagnostics.internalDepth}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-white/40">Active Nodes</span>
            <span>{diagnostics.activeNodes}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-white/40">Hardware Latency</span>
            <span>{diagnostics.baseLatency ? (diagnostics.baseLatency * 1000).toFixed(2) : '--'} ms</span>
          </div>

          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-[10px] text-white/30 leading-relaxed">
              * Active context operating at {diagnostics.sampleRate}Hz. Output depth normalized to 32-bit float to prevent hardware clipping. Ultrasonic rendering requires 96kHz+ DAC hardware.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}



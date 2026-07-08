export interface AudioConfig {
  leftFreq: number;
  rightFreq: number;
  emfEnabled: boolean;
  emfFreq: number;
  isochronicEnabled: boolean;
  noiseEnabled: boolean;
  noiseType: 'pink' | 'brown' | 'white';
  noiseVolume: number;
  stochasticResonance: boolean;
  spatialWidening: boolean;
  volumetric8DEnabled: boolean;
  missingFundamental: boolean;
  shepardTone: boolean;
  phaseCoherence: boolean;
  rfEnabled: boolean;
  rfFreq: number;
  rfWaveform: 'sine' | 'square' | 'triangle' | 'sawtooth' | 'spiral' | 'hexagonal';
  quantumZenoEffect: boolean;
  gammaRhythms: boolean;
  infrasound: boolean;
  eyeballResonance: boolean;
  rissetRhythm: boolean;
  tritoneParadox: boolean;
  octaveIllusion: boolean;
  tartiniTones: boolean;
  zwickerTone: boolean;
  otoacousticEmissions: boolean;
  subwooferPressure: boolean;
  chestResonance: boolean;
  asmr: boolean;
  sonoluminescence: boolean;
  acousticLevitation: boolean;
  acousticCavitation: boolean;
  acousticBlackHole: boolean;
  chladniResonance: boolean;
  templeResonance: boolean;
  auroraSounds: boolean;
  phantomTone: boolean;
  auditoryPareidolia: boolean;
  franssenEffect: boolean;
  specificFrequencies: boolean;
  highResMicrodynamics: boolean;
  ambisonicEnvironment: boolean;
  psychoacousticCompression: boolean;
  mode: {
    id: string;
    partials: {
      ratio: number;
      ampL: number;
      ampR: number;
      binauralBeat: number;
      orbitSpeed: number;
      depth?: number;
      decay?: number; phase?: number;
  posX?: number;
  posY?: number;
    }[];
  };
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  public analyser: AnalyserNode | null = null;
  private synthNodes: AudioNode[] = [];
  private partialGains: { node: GainNode, decay: number }[] = [];
  private noiseBuffer: AudioBuffer | null = null;
  private intervals: ReturnType<typeof setInterval>[] = [];
  private panner8DInterval: ReturnType<typeof setInterval> | null = null;
  
  public async init() {
    if (!this.ctx) {
      try {
        // Request 96kHz for actual ultrasonic frequencies
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 96000 });
      } catch (e) {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.value = -12;
      this.compressor.knee.value = 30;
      this.compressor.ratio.value = 12;
      this.compressor.attack.value = 0.003;
      this.compressor.release.value = 0.25;

      // REVERB (Diffuse Field)
      this.reverbNode = this.ctx.createConvolver();
      const length = this.ctx.sampleRate * 3.5; // 3.5s vast room
      const impulse = this.ctx.createBuffer(2, length, this.ctx.sampleRate);
      for (let i = 0; i < 2; i++) {
        const channel = impulse.getChannelData(i);
        for (let j = 0; j < length; j++) {
            // Exponential decay for realistic room tail
            channel[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, 4.0);
        }
      }
      this.reverbNode.buffer = impulse;
      
      this.reverbGain = this.ctx.createGain();
      this.reverbGain.gain.value = 0.35; // Significant ambient mix
      this.reverbNode.connect(this.reverbGain);
      this.reverbGain.connect(this.compressor);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 1.0;
      this.masterGain.connect(this.compressor);
      this.masterGain.connect(this.reverbNode);
      this.compressor.connect(this.ctx.destination);
      
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;
      this.compressor.connect(this.analyser);
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    this.ensureNoiseBuffer();
  }

  private applyPhase(osc: OscillatorNode, phaseDeg: number | undefined) {
    if (phaseDeg === undefined) return;
    const phaseRad = phaseDeg * Math.PI / 180;
    const real = new Float32Array(2);
    const imag = new Float32Array(2);
    real[1] = Math.sin(phaseRad);
    imag[1] = Math.cos(phaseRad);
    const wave = this.ctx!.createPeriodicWave(real, imag, { disableNormalization: true });
    osc.setPeriodicWave(wave);
  }

  public getAnalyserData(dataArray: Uint8Array) {
    if (this.analyser) {
      this.analyser.getByteFrequencyData(dataArray);
    }
  }

  public getDiagnostics() {
    if (!this.ctx) return null;
    return {
      sampleRate: this.ctx.sampleRate,
      state: this.ctx.state,
      baseLatency: this.ctx.baseLatency,
      outputLatency: this.ctx.outputLatency,
      activeNodes: this.synthNodes.length,
      internalDepth: '32-bit Float',
    };
  }

  private ensureNoiseBuffer() {
    if (this.noiseBuffer || !this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 5; // 5 seconds of noise
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
  }

  public setVolume(val: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(val, this.ctx.currentTime, 0.1);
    }
  }

  public playSynth(config: AudioConfig) {
    if (!this.ctx || !this.masterGain) return;
    this.stop(0.5);
    this.ensureNoiseBuffer();

    const now = this.ctx.currentTime;

    if (config.psychoacousticCompression && this.compressor) {
      this.compressor.threshold.setTargetAtTime(-28, now, 0.1);
      this.compressor.knee.setTargetAtTime(40, now, 0.1);
      this.compressor.ratio.setTargetAtTime(20, now, 0.1);
      this.compressor.attack.setTargetAtTime(0.001, now, 0.1);
      this.compressor.release.setTargetAtTime(0.05, now, 0.1);
    } else if (this.compressor) {
      this.compressor.threshold.setTargetAtTime(-12, now, 0.1);
      this.compressor.knee.setTargetAtTime(30, now, 0.1);
      this.compressor.ratio.setTargetAtTime(12, now, 0.1);
      this.compressor.attack.setTargetAtTime(0.003, now, 0.1);
      this.compressor.release.setTargetAtTime(0.25, now, 0.1);
    }


    
    // SPATIAL WIDENING & DIFFUSE FIELD (Haas Effect + Chorusing)
    const leftDelay = this.ctx.createDelay();
    const rightDelay = this.ctx.createDelay();
    leftDelay.delayTime.value = config.spatialWidening ? 0.008 : 0;
    rightDelay.delayTime.value = config.spatialWidening ? 0.022 : 0;

    const lfoLeft = this.ctx.createOscillator();
    lfoLeft.frequency.value = 0.3;
    const lfoGainLeft = this.ctx.createGain();
    lfoGainLeft.gain.value = config.spatialWidening ? 0.002 : 0;
    lfoLeft.connect(lfoGainLeft);
    lfoGainLeft.connect(leftDelay.delayTime);

    const lfoRight = this.ctx.createOscillator();
    lfoRight.frequency.value = 0.45;
    const lfoGainRight = this.ctx.createGain();
    lfoGainRight.gain.value = config.spatialWidening ? 0.003 : 0;
    lfoRight.connect(lfoGainRight);
    lfoGainRight.connect(rightDelay.delayTime);
    
    lfoLeft.start(now);
    lfoRight.start(now);

    const merger = this.ctx.createChannelMerger(2);
    leftDelay.connect(merger, 0, 0);
    rightDelay.connect(merger, 0, 1);
    
    let preMaster: AudioNode = merger;


    if (config.ambisonicEnvironment) {
        // High-Resolution Room Acoustics & Binaural ITD
        // Early Reflections (Front/Back/Sides) via multi-tap delays
        const erGain = this.ctx.createGain();
        erGain.gain.value = 0.4; // Wet mix for reflections
        
        // Panner with HRTF for true Binaural projection
        const hrtfPanner = this.ctx.createPanner();
        hrtfPanner.panningModel = 'HRTF';
        hrtfPanner.distanceModel = 'inverse';
        hrtfPanner.refDistance = 1;
        hrtfPanner.maxDistance = 10000;
        hrtfPanner.rolloffFactor = 1;
        // Position slightly in front and wide
        if (hrtfPanner.positionX) {
            hrtfPanner.positionX.setValueAtTime(0, now);
            hrtfPanner.positionY.setValueAtTime(0.5, now);
            hrtfPanner.positionZ.setValueAtTime(1.5, now);
        } else {
            hrtfPanner.setPosition(0, 0.5, 1.5);
        }
        
        preMaster.connect(hrtfPanner);
        preMaster = hrtfPanner;
        
        // Route through early reflections and the master reverb
        preMaster.connect(erGain);
        if (this.reverbNode) {
            erGain.connect(this.reverbNode);
            // Dynamic adjustment of reverb parameters
            if (this.reverbGain) {
                this.reverbGain.gain.setTargetAtTime(0.6, now, 0.1); // Increased room depth
            }
        }
        this.synthNodes.push(hrtfPanner, erGain);
    } else {
        if (this.reverbGain) {
            this.reverbGain.gain.setTargetAtTime(0.35, now, 0.1); // Default depth
        }
    }

    if (config.volumetric8DEnabled) {
        const panner8D = this.ctx.createPanner();
        panner8D.panningModel = 'HRTF';
        panner8D.distanceModel = 'inverse';
        panner8D.refDistance = 1;
        panner8D.maxDistance = 10000;
        panner8D.rolloffFactor = 1;
        panner8D.coneInnerAngle = 360;
        panner8D.coneOuterAngle = 360;
        panner8D.coneOuterGain = 0;

        preMaster.connect(panner8D);
        preMaster = panner8D;

        let angle = 0;
        const radius = 3.5;
        const speed = 0.01; // Orbital rotation speed
        
        this.panner8DInterval = setInterval(() => {
            if (!this.ctx) return;
            angle += speed;
            const x = Math.sin(angle) * radius;
            const z = Math.cos(angle) * radius;
            const y = Math.sin(angle * 2) * 0.5 + 0.2; // Gentle elevation undulation
            
            if (panner8D.positionX) {
                panner8D.positionX.setTargetAtTime(x, this.ctx.currentTime, 0.05);
                panner8D.positionY.setTargetAtTime(y, this.ctx.currentTime, 0.05);
                panner8D.positionZ.setTargetAtTime(z, this.ctx.currentTime, 0.05);
            } else {
                panner8D.setPosition(x, y, z);
            }
        }, 20);
        
        this.synthNodes.push(panner8D);
    }

    preMaster.connect(this.masterGain);
    this.synthNodes.push(leftDelay, rightDelay, merger, lfoLeft, lfoRight, lfoGainLeft, lfoGainRight);

    // --- Advanced Phenomena Injectors ---
    
    if (config.gammaRhythms) {
      const gL = this.ctx.createOscillator();
      const gR = this.ctx.createOscillator();
      gL.frequency.value = 200;
      gR.frequency.value = 240; // 40Hz beat
      const gGain = this.ctx.createGain();
      gGain.gain.value = 0.15;
      gL.connect(gGain); gR.connect(gGain);
      gGain.connect(preMaster);
      gL.start(now); gR.start(now);
      this.synthNodes.push(gL, gR, gGain);
    }
    
    if (config.infrasound) {
      const inf = this.ctx.createOscillator();
      inf.frequency.value = 12; // 12 Hz
      const iGain = this.ctx.createGain();
      iGain.gain.value = 0.5;
      inf.connect(iGain); iGain.connect(preMaster);
      inf.start(now);
      this.synthNodes.push(inf, iGain);
    }
    
    if (config.eyeballResonance) {
      const eye = this.ctx.createOscillator();
      eye.frequency.value = 18.98;
      const eyeGain = this.ctx.createGain();
      eyeGain.gain.value = 0.4;
      eye.connect(eyeGain); eyeGain.connect(preMaster);
      eye.start(now);
      this.synthNodes.push(eye, eyeGain);
    }
    
    if (config.subwooferPressure) {
      const sub = this.ctx.createOscillator();
      sub.type = 'triangle';
      sub.frequency.value = 40;
      const subGain = this.ctx.createGain();
      subGain.gain.value = 0.6;
      sub.connect(subGain); subGain.connect(preMaster);
      sub.start(now);
      this.synthNodes.push(sub, subGain);
    }
    
    if (config.chestResonance) {
      const chest = this.ctx.createOscillator();
      chest.type = 'sine';
      chest.frequency.value = 75;
      const cGain = this.ctx.createGain();
      cGain.gain.value = 0.5;
      chest.connect(cGain); cGain.connect(preMaster);
      chest.start(now);
      this.synthNodes.push(chest, cGain);
    }
    
    if (config.templeResonance) {
      const temple = this.ctx.createOscillator();
      temple.frequency.value = 110;
      const tGain = this.ctx.createGain();
      tGain.gain.value = 0.3;
      temple.connect(tGain); tGain.connect(preMaster);
      temple.start(now);
      this.synthNodes.push(temple, tGain);
    }
    
    if (config.tartiniTones) {
      // Create a 200Hz combination tone in the ear by playing 1000Hz and 1200Hz loudly
      const t1 = this.ctx.createOscillator(); t1.frequency.value = 1000;
      const t2 = this.ctx.createOscillator(); t2.frequency.value = 1200;
      const tGain = this.ctx.createGain(); tGain.gain.value = 0.4; // High volume needed
      t1.connect(tGain); t2.connect(tGain);
      tGain.connect(preMaster);
      t1.start(now); t2.start(now);
      this.synthNodes.push(t1, t2, tGain);
    }
    
    if (config.zwickerTone) {
      // Noise with a notch
      if (this.noiseBuffer) {
        const src = this.ctx.createBufferSource();
        src.buffer = this.noiseBuffer;
        src.loop = true;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'notch';
        filter.frequency.value = 2000;
        filter.Q.value = 10;
        const zGain = this.ctx.createGain();
        zGain.gain.value = 0.1;
        src.connect(filter); filter.connect(zGain); zGain.connect(preMaster);
        src.start(now);
        this.synthNodes.push(src, filter, zGain);
      }
    }
    
    if (config.otoacousticEmissions) {
      // Very faint high frequencies
      [1500, 2500, 4000].forEach(f => {
        const osc = this.ctx.createOscillator();
        osc.frequency.value = f;
        const gain = this.ctx.createGain();
        gain.gain.value = 0.005; // extremely quiet
        osc.connect(gain); gain.connect(preMaster);
        osc.start(now);
        this.synthNodes.push(osc, gain);
      });
    }
    
    if (config.asmr) {
      if (this.noiseBuffer) {
        const src = this.ctx.createBufferSource();
        src.buffer = this.noiseBuffer;
        src.loop = true;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 5000;
        const panner = this.ctx.createStereoPanner();
        const lfo = this.ctx.createOscillator();
        lfo.frequency.value = 0.2; // Slow sweep
        lfo.connect(panner.pan);
        const gain = this.ctx.createGain();
        gain.gain.value = 0.15;
        src.connect(filter); filter.connect(panner); panner.connect(gain); gain.connect(preMaster);
        src.start(now); lfo.start(now);
        this.synthNodes.push(src, filter, panner, lfo, gain);
      }
    }
    
    if (config.auroraSounds) {
      if (this.noiseBuffer) {
        const src = this.ctx.createBufferSource();
        src.buffer = this.noiseBuffer;
        src.loop = true;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1200;
        filter.Q.value = 2;
        
        // Random modulation for crackling
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sawtooth';
        lfo.frequency.value = 15;
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 800;
        lfo.connect(lfoGain); lfoGain.connect(filter.frequency);
        
        const gain = this.ctx.createGain();
        gain.gain.value = 0.1;
        src.connect(filter); filter.connect(gain); gain.connect(preMaster);
        src.start(now); lfo.start(now);
        this.synthNodes.push(src, filter, lfo, lfoGain, gain);
      }
    }
    
    if (config.phantomTone) {
      // Extremely faint tone near upper limit
      const osc = this.ctx.createOscillator();
      osc.frequency.value = 16000;
      const gain = this.ctx.createGain();
      gain.gain.value = 0.001; // barely audible
      osc.connect(gain); gain.connect(preMaster);
      osc.start(now);
      this.synthNodes.push(osc, gain);
    }
    
    if (config.auditoryPareidolia) {
      if (this.noiseBuffer) {
        const src = this.ctx.createBufferSource();
        src.buffer = this.noiseBuffer;
        src.loop = true;
        const filter1 = this.ctx.createBiquadFilter(); filter1.type = 'bandpass'; filter1.frequency.value = 400; filter1.Q.value = 5;
        const filter2 = this.ctx.createBiquadFilter(); filter2.type = 'bandpass'; filter2.frequency.value = 800; filter2.Q.value = 5;
        const filter3 = this.ctx.createBiquadFilter(); filter3.type = 'bandpass'; filter3.frequency.value = 1200; filter3.Q.value = 5;
        
        const lfo = this.ctx.createOscillator(); lfo.frequency.value = 0.3;
        const lfoG = this.ctx.createGain(); lfoG.gain.value = 200;
        lfo.connect(lfoG); lfoG.connect(filter1.frequency); lfoG.connect(filter2.frequency); lfoG.connect(filter3.frequency);
        
        const merge = this.ctx.createGain(); merge.gain.value = 0.15;
        src.connect(filter1); src.connect(filter2); src.connect(filter3);
        filter1.connect(merge); filter2.connect(merge); filter3.connect(merge);
        merge.connect(preMaster);
        src.start(now); lfo.start(now);
        this.synthNodes.push(src, filter1, filter2, filter3, lfo, lfoG, merge);
      }
    }
    
    if (config.acousticLevitation || config.sonoluminescence || config.acousticCavitation) {
      // Real ultrasonic generation (up to 40kHz, works correctly if AudioContext runs at 96kHz).
      // Emits actual ultrasonic frequencies.
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = config.acousticLevitation ? 40000 : (config.sonoluminescence ? 25000 : 30000); 
      
      const outGain = this.ctx.createGain();
      outGain.gain.value = 0.8;
      
      if (config.acousticCavitation) {
        // Acoustic cavitation requires pulsed, high-intensity ultrasound to tear the medium.
        const pulseModulator = this.ctx.createOscillator();
        pulseModulator.type = 'square';
        pulseModulator.frequency.value = 50; 
        
        const modGain = this.ctx.createGain();
        modGain.gain.value = 1.0; 
        
        pulseModulator.connect(modGain);
        modGain.connect(outGain.gain);
        
        pulseModulator.start(now);
        this.synthNodes.push(pulseModulator, modGain);
      }
      
      osc.connect(outGain);
      outGain.connect(preMaster);
      osc.start(now);
      this.synthNodes.push(osc, outGain);
    }
    
    if (config.chladniResonance) {
      // Cycle through some Chladni frequencies
      const freqs = [174, 285, 396, 417, 528];
      const osc = this.ctx.createOscillator();
      const now = this.ctx.currentTime;

      freqs.forEach((f, i) => {
        osc.frequency.setValueAtTime(f, now + i * 2);
      });
      osc.frequency.setValueAtTime(freqs[0], now + freqs.length * 2); // basic reset
      
      const gain = this.ctx.createGain();
      gain.gain.value = 0.1;
      osc.connect(gain); gain.connect(preMaster);
      osc.start(now);
      this.synthNodes.push(osc, gain);
    }
    
    if (config.acousticBlackHole) {
      // Real-time DSP generation of Acoustic Black Hole effect (continuously decreasing phase velocity trap)
      const osc = this.ctx.createOscillator();
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(10, now + 10);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 10);
      osc.connect(gain); gain.connect(preMaster);
      osc.start(now);
      this.synthNodes.push(osc, gain);
    }

    if (config.specificFrequencies) {
      [1.25, 5.08, 10.55, 20.51, 33.18, 90.12, 0.125].forEach(f => {
        const osc = this.ctx.createOscillator();
        osc.frequency.value = f;
        const gain = this.ctx.createGain();
        gain.gain.value = f < 20 ? 0.6 : 0.2; // boost infrasound amplitudes
        osc.connect(gain); gain.connect(preMaster);
        osc.start(now);
        this.synthNodes.push(osc, gain);
      });
    }

    if (config.franssenEffect) {
        // Sharp attack left, slow attack right
        const oscL = this.ctx.createOscillator(); oscL.frequency.value = 400;
        const oscR = this.ctx.createOscillator(); oscR.frequency.value = 400;
        const pannerL = this.ctx.createStereoPanner(); pannerL.pan.value = -1;
        const pannerR = this.ctx.createStereoPanner(); pannerR.pan.value = 1;
        const gainL = this.ctx.createGain(); 
        const gainR = this.ctx.createGain();
        
        gainL.gain.setValueAtTime(0, now);
        gainL.gain.linearRampToValueAtTime(0.3, now + 0.01);
        gainL.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        
        gainR.gain.setValueAtTime(0, now);
        gainR.gain.linearRampToValueAtTime(0.3, now + 2.0);
        
        oscL.connect(gainL); gainL.connect(pannerL); pannerL.connect(preMaster);
        oscR.connect(gainR); gainR.connect(pannerR); pannerR.connect(preMaster);
        oscL.start(now); oscR.start(now);

        this.synthNodes.push(oscL, oscR, pannerL, pannerR, gainL, gainR);
    }
    
    if (config.octaveIllusion) {
        const osc1 = this.ctx.createOscillator(); osc1.frequency.value = 400;
        const osc2 = this.ctx.createOscillator(); osc2.frequency.value = 800;
        
        const gainL = this.ctx.createGain(); gainL.gain.value = 0;
        const gainR = this.ctx.createGain(); gainR.gain.value = 0;
        
        const panL = this.ctx.createStereoPanner(); panL.pan.value = -1;
        const panR = this.ctx.createStereoPanner(); panR.pan.value = 1;
        
        osc1.connect(gainL); gainL.connect(panL); panL.connect(preMaster);
        osc2.connect(gainR); gainR.connect(panR); panR.connect(preMaster);
        
        // Use an interval to alternate
        let toggle = false;
        const octaveInterval = setInterval(() => {
            if(!this.ctx) return;
            const t = this.ctx.currentTime;
            gainL.gain.setValueAtTime(toggle ? 0.3 : 0, t);
            gainR.gain.setValueAtTime(toggle ? 0 : 0.3, t);
            
            // Swap frequencies
            osc1.frequency.setValueAtTime(toggle ? 800 : 400, t);
            osc2.frequency.setValueAtTime(toggle ? 400 : 800, t);
            toggle = !toggle;
        }, 250);
        
        this.synthNodes.push(osc1, osc2, gainL, gainR, panL, panR);
        this.intervals.push(octaveInterval);
        osc1.start(now); osc2.start(now);
    }
    
    if (config.tritoneParadox) {
        // Simple 2-tone tritone paradox using basic shepard tones
        const base = 261.63; // C4
        const tritone = 369.99; // F#4
        [base, tritone].forEach((f, i) => {
            [0.5, 1, 2, 4].forEach(mult => {
                const osc = this.ctx.createOscillator();
                osc.frequency.value = f * mult;
                const gain = this.ctx.createGain();
                // Gaussian envelope for shepard tone amplitude
                const level = Math.exp(-Math.pow(Math.log2(mult) - 1, 2) / 2) * 0.1;
                gain.gain.value = level;
                
                // Alternate playing them
                const lfo = this.ctx.createOscillator();
                lfo.type = 'square';
                lfo.frequency.value = 1; // 1Hz alternation
                // Phase shift one of them
                if (i === 1) {
                    // Delay start or use inverted
                }
                
                osc.connect(gain); gain.connect(preMaster);
                osc.start(now);
                this.synthNodes.push(osc, gain);
            });
        });
    }
    
    if (config.rissetRhythm) {
        // Mathematical generation of Risset accelerating rhythm illusion
        const freqs = [100, 200, 400];
        freqs.forEach((f, index) => {
            const osc = this.ctx.createOscillator();
            osc.frequency.value = f;
            const gain = this.ctx.createGain();
            
            const lfo = this.ctx.createOscillator();
            lfo.type = 'sawtooth'; // ramp down for percussive
            lfo.frequency.value = 2 * (index + 1); // different speeds
            
            const lfoGain = this.ctx.createGain();
            lfoGain.gain.value = 0.2;
            lfo.connect(gain.gain);
            
            osc.connect(gain); gain.connect(preMaster);
            osc.start(now); lfo.start(now);
            this.synthNodes.push(osc, gain, lfo, lfoGain);
        });
    }
    

    const masterLeft = this.ctx.createGain(); 
    const masterRight = this.ctx.createGain(); 
    
    if (config.quantumZenoEffect) {
        masterLeft.gain.value = 0.5;
        masterRight.gain.value = 0.5;
        
        const zenoOsc = this.ctx.createOscillator();
        zenoOsc.type = 'square';
        zenoOsc.frequency.value = 60; // 60 Hz observation rate
        
        const zenoModGain = this.ctx.createGain();
        zenoModGain.gain.value = 0.5;
        zenoOsc.connect(zenoModGain);
        
        zenoModGain.connect(masterLeft.gain);
        zenoModGain.connect(masterRight.gain);
        zenoOsc.start(now);
        this.synthNodes.push(zenoOsc, zenoModGain);
    } else {
        masterLeft.gain.value = 1;
        masterRight.gain.value = 1;
    }
    
    masterLeft.connect(leftDelay);
    masterRight.connect(rightDelay);
    this.synthNodes.push(masterLeft, masterRight);

    // TACTILE SUB-BASS GENERATOR (Room filling / Physical sensation)
    let subFreq = config.leftFreq;
    while (subFreq > 65 && subFreq > 20) { subFreq /= 2; }
    if (subFreq < 20) { subFreq *= 2; } // Keep it in audible/feelable range

    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'triangle'; // Triangle provides strong fundamental with subtle harmonics
    subOsc.frequency.value = subFreq;

    const subGain = this.ctx.createGain();
    subGain.gain.value = 0;
    subOsc.connect(subGain);
    subGain.connect(masterLeft);
    subGain.connect(masterRight);
    
    subOsc.start(now);
    subGain.gain.setTargetAtTime(0.7, now, 1.5); // Warm, deep tactile bass roll-in
    this.synthNodes.push(subOsc, subGain);

    const baseFreq = config.leftFreq;
    const globalBeat = config.rightFreq - config.leftFreq;

    // MODULATOR LFO (Isochronic or Slow Breathing)
    const modulatorLFO = this.ctx.createOscillator();
    modulatorLFO.type = 'sine';
    modulatorLFO.frequency.value = config.isochronicEnabled ? Math.max(0.5, globalBeat) : 0.05;
    modulatorLFO.start(now);
    this.synthNodes.push(modulatorLFO);

    // LAYER 1: COMPLEX CORE (Only for Complex mode)
    if (config.mode.id === 'complex') {
      const coreOsc = this.ctx.createOscillator();
      coreOsc.type = 'sine';
      coreOsc.frequency.value = baseFreq;
      
      const coreFilter = this.ctx.createBiquadFilter();
      coreFilter.type = 'bandpass';
      coreFilter.frequency.value = baseFreq;
      coreFilter.Q.value = 30;

      const coreGain = this.ctx.createGain();
      coreGain.gain.value = 0;

      const modCore = this.ctx.createGain();
      modCore.gain.value = config.isochronicEnabled ? 0.4 : 0.25 * 0.3;
      modulatorLFO.connect(modCore);
      modCore.connect(coreGain.gain);

      coreOsc.connect(coreFilter);
      coreFilter.connect(coreGain);
      coreGain.connect(masterLeft);
      coreGain.connect(masterRight);

      const expanderL = this.ctx.createOscillator();
      expanderL.type = 'sine';
      expanderL.frequency.value = baseFreq - 0.055;
      
      const gainL = this.ctx.createGain();
      gainL.gain.value = 0;

      const modL = this.ctx.createGain();
      modL.gain.value = config.isochronicEnabled ? 0.3 : 0.1 * 0.3;
      modulatorLFO.connect(modL);
      modL.connect(gainL.gain);

      const expanderR = this.ctx.createOscillator();
      expanderR.type = 'sine';
      expanderR.frequency.value = config.rightFreq + 0.055;
      
      const gainR = this.ctx.createGain();
      gainR.gain.value = 0;

      const modR = this.ctx.createGain();
      modR.gain.value = config.isochronicEnabled ? 0.3 : 0.1 * 0.3;
      modulatorLFO.connect(modR);
      modR.connect(gainR.gain);

      expanderL.connect(gainL); gainL.connect(masterLeft);
      expanderR.connect(gainR); gainR.connect(masterRight);

      const subOsc = this.ctx.createOscillator();
      subOsc.type = 'triangle';
      subOsc.frequency.value = baseFreq / 2;
      
      const subFilter = this.ctx.createBiquadFilter();
      subFilter.type = 'lowpass';
      subFilter.frequency.value = baseFreq;
      
      const subGain = this.ctx.createGain();
      subGain.gain.value = 0;

      const modSub = this.ctx.createGain();
      modSub.gain.value = config.isochronicEnabled ? 0.15 : 0.08 * 0.15;
      modulatorLFO.connect(modSub);
      modSub.connect(subGain.gain);

      subOsc.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(masterLeft);
      subGain.connect(masterRight);

      const harm1Osc = this.ctx.createOscillator();
      harm1Osc.type = 'sine';
      harm1Osc.frequency.value = baseFreq * 1.5;
      const harm1Gain = this.ctx.createGain();
      harm1Gain.gain.value = 0;

      const harm2Osc = this.ctx.createOscillator();
      harm2Osc.type = 'sine';
      harm2Osc.frequency.value = baseFreq * 1.618;
      const harm2Gain = this.ctx.createGain();
      harm2Gain.gain.value = 0;

      harm1Osc.connect(harm1Gain);
      harm1Gain.connect(masterLeft);
      harm1Gain.connect(masterRight);

      harm2Osc.connect(harm2Gain);
      harm2Gain.connect(masterLeft);
      harm2Gain.connect(masterRight);

      coreOsc.start(now);
      expanderL.start(now);
      expanderR.start(now);
      subOsc.start(now);
      harm1Osc.start(now);
      harm2Osc.start(now);

      coreGain.gain.setTargetAtTime(config.missingFundamental ? 0 : 0.25, now, 3.0);
      gainL.gain.setTargetAtTime(0.1, now, 4.0);
      gainR.gain.setTargetAtTime(0.1, now, 4.0);
      subGain.gain.setTargetAtTime(0.08, now, 5.0);
      harm1Gain.gain.setTargetAtTime(config.missingFundamental ? 0.08 : 0.04, now, 6.0);
      harm2Gain.gain.setTargetAtTime(config.missingFundamental ? 0.04 : 0.02, now, 7.0);

      this.synthNodes.push(
        coreOsc, coreFilter, coreGain, modCore,
        expanderL, gainL, modL,
        expanderR, gainR, modR,
        subOsc, subFilter, subGain, modSub,
        harm1Osc, harm1Gain,
        harm2Osc, harm2Gain
      );
    }

    // LAYER 2: HARMONIC PARTIALS
    const partials = config.mode.partials;

    partials.forEach((p, i) => {
      const isFundamental = p.ratio === 1.0;
      const targetAmpL = (config.missingFundamental && isFundamental) ? 0 : p.ampL;
      const targetAmpR = (config.missingFundamental && isFundamental) ? 0 : p.ampR;
      
      const depth = config.isochronicEnabled ? 0.8 : (p.depth !== undefined ? p.depth : (i < 2 ? 0.3 : 0.15));
      const currentBinauralBeat = (p.ratio === 1.0) ? globalBeat : p.binauralBeat;

      if (currentBinauralBeat !== 0 && p.orbitSpeed === 0 && !config.isochronicEnabled) {
        const oscL = this.ctx!.createOscillator();
        const oscR = this.ctx!.createOscillator();
        oscL.type = 'sine'; oscR.type = 'sine';
        this.applyPhase(oscL, p.phase);
        this.applyPhase(oscR, p.phase);
        
        oscL.frequency.value = baseFreq * p.ratio;
        oscR.frequency.value = baseFreq * p.ratio + currentBinauralBeat;

        const pGainL = this.ctx!.createGain();
        const pGainR = this.ctx!.createGain();
        pGainL.gain.value = 0; pGainR.gain.value = 0;

        oscL.connect(pGainL); pGainL.connect(masterLeft);
        oscR.connect(pGainR); pGainR.connect(masterRight);

        const modGainL = this.ctx!.createGain();
        modGainL.gain.value = targetAmpL * depth;
        modulatorLFO.connect(modGainL);
        modGainL.connect(pGainL.gain);

        const modGainR = this.ctx!.createGain();
        modGainR.gain.value = targetAmpR * depth;
        modulatorLFO.connect(modGainR);
        modGainR.connect(pGainR.gain);

        oscL.start(now); oscR.start(now);
        // Microdynamics (Algorithmic Micro-LFO for organic pitch & amplitude drift)
        if (config.highResMicrodynamics) {
            const microLFO = this.ctx!.createOscillator();
            microLFO.frequency.value = 0.1 + Math.random() * 0.2; // Slow random drift
            const pitchDrift = this.ctx!.createGain();
            pitchDrift.gain.value = 0.15; // 0.15 Hz drift
            microLFO.connect(pitchDrift);
            pitchDrift.connect(oscL.frequency);
            if (typeof oscR !== 'undefined') pitchDrift.connect(oscR.frequency);
            
            const ampDrift = this.ctx!.createGain();
            ampDrift.gain.value = 0.05 * targetAmpL; // 5% amplitude drift
            microLFO.connect(ampDrift);
            ampDrift.connect(pGainL.gain);
            if (typeof pGainR !== 'undefined') {
                const ampDriftR = this.ctx!.createGain();
                ampDriftR.gain.value = 0.05 * targetAmpR;
                microLFO.connect(ampDriftR);
                ampDriftR.connect(pGainR.gain);
                this.synthNodes.push(ampDriftR);
            }
            microLFO.start(now);
            this.synthNodes.push(microLFO, pitchDrift, ampDrift);
        }

        const decay = p.decay !== undefined ? p.decay : 2.5;
        pGainL.gain.setTargetAtTime(targetAmpL, now, decay);
        pGainR.gain.setTargetAtTime(targetAmpR, now, decay);

        this.synthNodes.push(oscL, oscR, pGainL, pGainR, modGainL, modGainR);
        this.partialGains.push({ node: pGainL, decay });
        this.partialGains.push({ node: pGainR, decay });
      } else {
        const osc = this.ctx!.createOscillator();
        osc.type = 'sine';
        this.applyPhase(osc, p.phase);
        osc.frequency.value = baseFreq * p.ratio;

        const gain = this.ctx!.createGain();
        gain.gain.value = 0;

        const panner = this.ctx!.createPanner();
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.refDistance = 1;
        panner.maxDistance = 10000;
        panner.rolloffFactor = 1;
        
        const px = (p.posX || 0) * 5;
        const pz = (p.posY || 0) * 5;
        if (panner.positionX) {
           panner.positionX.value = px;
           panner.positionY.value = 0;
           panner.positionZ.value = pz;
        } else {
           panner.setPosition(px, 0, pz);
        }

        if (p.orbitSpeed > 0 && panner.positionX) {
          const lfoX = this.ctx!.createOscillator();
          const lfoZ = this.ctx!.createOscillator();
          lfoX.frequency.value = p.orbitSpeed;
          lfoZ.frequency.value = p.orbitSpeed * 1.31;

          const gainX = this.ctx!.createGain(); gainX.gain.value = 2;
          const gainZ = this.ctx!.createGain(); gainZ.gain.value = 2;

          lfoX.connect(gainX); gainX.connect(panner.positionX);
          lfoZ.connect(gainZ); gainZ.connect(panner.positionZ);

          lfoX.start(now); lfoZ.start(now);
          this.synthNodes.push(lfoX, lfoZ, gainX, gainZ);
        }

        const modGain = this.ctx!.createGain();
        modGain.gain.value = targetAmpL * depth;
        modulatorLFO.connect(modGain);
        modGain.connect(gain.gain);

        osc.connect(gain);
        gain.connect(panner);
        panner.connect(this.masterGain!); // Panner mixes directly to master

        osc.start(now);
        // Microdynamics
        if (config.highResMicrodynamics) {
            const microLFO = this.ctx!.createOscillator();
            microLFO.frequency.value = 0.1 + Math.random() * 0.2;
            const pitchDrift = this.ctx!.createGain();
            pitchDrift.gain.value = 0.15; 
            microLFO.connect(pitchDrift);
            pitchDrift.connect(osc.frequency);
            
            const ampDrift = this.ctx!.createGain();
            ampDrift.gain.value = 0.05 * targetAmpL;
            microLFO.connect(ampDrift);
            ampDrift.connect(gain.gain);
            
            microLFO.start(now);
            this.synthNodes.push(microLFO, pitchDrift, ampDrift);
        }

        const decay = p.decay !== undefined ? p.decay : 2.5; gain.gain.setTargetAtTime(targetAmpL, now, decay);

        this.synthNodes.push(osc, gain, panner, modGain); this.partialGains.push({ node: gain, decay });
      }
    });

    // LAYER 3: STOCHASTIC RESONANCE / NOISE MASKING
    if (config.noiseEnabled || config.stochasticResonance) {
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = this.noiseBuffer;
      noiseSource.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.value = config.noiseType === 'brown' ? 150 : (config.noiseType === 'pink' ? 800 : 20000);
      noiseFilter.Q.value = 0.5;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.value = 0; // fade in
      
      noiseSource.start(now);
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      
      if (config.stochasticResonance) {
         const stochMod = this.ctx.createGain();
         stochMod.gain.value = 0.2; // 20% modulation
         modulatorLFO.connect(stochMod);
         stochMod.connect(noiseGain.gain);
         this.synthNodes.push(stochMod);
      }

      noiseGain.connect(masterLeft);
      noiseGain.connect(masterRight);
      
      const targetVolume = config.noiseEnabled ? config.noiseVolume : 0.05; // Low volume if only stochastic
      noiseGain.gain.setTargetAtTime(targetVolume, now, 3.0);
      
      this.synthNodes.push(noiseSource, noiseFilter, noiseGain);
    }

    // LAYER 4: SCIENTIFIC ELECTROMAGNETIC FIELD (EMF) - PULSED SIGNAL GENERATION
    if (config.emfEnabled && config.emfFreq > 0) {
      if (config.emfFreq < 50) {
          // Schumann Resonance (Earth's EMF) - Nature's way: Noise excited Resonators
          const emfNoise = this.ctx.createBufferSource();
          emfNoise.buffer = this.noiseBuffer;
          emfNoise.loop = true;
          emfNoise.start(now);
          this.synthNodes.push(emfNoise);
          
          const emfMasterGain = this.ctx.createGain();
          emfMasterGain.gain.value = 0;
          
          // Primary selected Schumann peak
          const p1 = this.ctx.createBiquadFilter();
          p1.type = 'bandpass';
          p1.frequency.value = config.emfFreq;
          p1.Q.value = 60; // High resonance
          
          // Secondary harmonic
          const p2 = this.ctx.createBiquadFilter();
          p2.type = 'bandpass';
          p2.frequency.value = config.emfFreq * 1.82; 
          p2.Q.value = 50;

          // Tertiary harmonic
          const p3 = this.ctx.createBiquadFilter();
          p3.type = 'bandpass';
          p3.frequency.value = config.emfFreq * 2.65; 
          p3.Q.value = 40;
          
          const g1 = this.ctx.createGain(); g1.gain.value = 1.0;
          const g2 = this.ctx.createGain(); g2.gain.value = 0.6;
          const g3 = this.ctx.createGain(); g3.gain.value = 0.3;

          emfNoise.connect(p1); p1.connect(g1); g1.connect(emfMasterGain);
          emfNoise.connect(p2); p2.connect(g2); g2.connect(emfMasterGain);
          emfNoise.connect(p3); p3.connect(g3); g3.connect(emfMasterGain);
          this.synthNodes.push(p1, p2, p3, g1, g2, g3);

          emfMasterGain.connect(masterLeft);
          emfMasterGain.connect(masterRight);
          emfMasterGain.gain.setTargetAtTime(2.0, now, 4.0); // Boosted because bandpass attenuates noise
          this.synthNodes.push(emfMasterGain);
      } else {
          // Mains Hum / High Freq EMF (50Hz / 60Hz) - Additive Harmonic Synthesis
          const h1 = this.ctx.createOscillator(); h1.type = 'sine'; h1.frequency.value = config.emfFreq;
          const h3 = this.ctx.createOscillator(); h3.type = 'sine'; h3.frequency.value = config.emfFreq * 3;
          const h5 = this.ctx.createOscillator(); h5.type = 'sine'; h5.frequency.value = config.emfFreq * 5;
          
          const emfMix = this.ctx.createGain(); emfMix.gain.value = 0;
          
          const g1 = this.ctx.createGain(); g1.gain.value = 1; h1.connect(g1); g1.connect(emfMix);
          const g3 = this.ctx.createGain(); g3.gain.value = 0.33; h3.connect(g3); g3.connect(emfMix);
          const g5 = this.ctx.createGain(); g5.gain.value = 0.2; h5.connect(g5); g5.connect(emfMix);
          
          h1.start(now); h3.start(now); h5.start(now);
          this.synthNodes.push(h1, h3, h5, g1, g3, g5);
          
          emfMix.connect(masterLeft);
          emfMix.connect(masterRight);
          emfMix.gain.setTargetAtTime(0.08, now, 3.0);
          this.synthNodes.push(emfMix);
      }
    }

    // LAYER 5: PSYCHOACOUSTIC SHEPARD TONE
    if (config.shepardTone) {
        const shepardGain = this.ctx.createGain();
        shepardGain.gain.value = 0;
        shepardGain.connect(this.masterGain);
        shepardGain.gain.setTargetAtTime(0.04, now, 2.0); // Subtle illusion
        this.synthNodes.push(shepardGain);

        for (let i = 0; i < 5; i++) {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            const f = (baseFreq / 2) * Math.pow(2, i);
            osc.frequency.value = f;
            
            const vca = this.ctx.createGain();
            // Gaussian-like curve for the middle octaves
            const center = 2; 
            const dist = Math.abs(i - center);
            const amp = Math.max(0, 1 - dist * 0.4); 
            vca.gain.value = amp;

            osc.connect(vca);
            vca.connect(shepardGain);
            osc.start(now);
            this.synthNodes.push(osc, vca);
        }
    }

    // LAYER 6: QUANTUM PHASE COHERENCE
    if (config.phaseCoherence) {
        const qOsc1 = this.ctx.createOscillator();
        const qOsc2 = this.ctx.createOscillator();
        qOsc1.type = 'sine'; qOsc2.type = 'sine';
        
        qOsc1.frequency.value = baseFreq * 2 - 1.5; // Detuned State A
        qOsc2.frequency.value = baseFreq * 2 + 1.5; // Detuned State B

        // Coherence Event (Entanglement)
        qOsc1.frequency.setTargetAtTime(baseFreq * 2, now + 5, 2);
        qOsc2.frequency.setTargetAtTime(baseFreq * 2, now + 5, 2);

        // Decoherence Event
        qOsc1.frequency.setTargetAtTime(baseFreq * 2 - 1.5, now + 15, 2);
        qOsc2.frequency.setTargetAtTime(baseFreq * 2 + 1.5, now + 15, 2);

        const qGain1 = this.ctx.createGain(); qGain1.gain.value = 0;
        const qGain2 = this.ctx.createGain(); qGain2.gain.value = 0;
        
        qOsc1.connect(qGain1); qGain1.connect(masterLeft);
        qOsc2.connect(qGain2); qGain2.connect(masterRight);

        qOsc1.start(now); qOsc2.start(now);
        qGain1.gain.setTargetAtTime(0.06, now, 2);
        qGain2.gain.setTargetAtTime(0.06, now, 2);

        this.synthNodes.push(qOsc1, qOsc2, qGain1, qGain2);
    }

    // LAYER 7: RF GENERATOR (RADIO FREQUENCY SYNTHESIS)
    if (config.rfEnabled && config.rfFreq > 0) {
        const rfOsc = this.ctx.createOscillator();
        
        if (config.rfWaveform === 'spiral') {
            const real = new Float32Array(32);
            const imag = new Float32Array(32);
            for(let i=1; i<32; i++) {
                real[i] = Math.cos(i) / i; // Spiraling phase
                imag[i] = Math.sin(i) / i;
            }
            const wave = this.ctx.createPeriodicWave(real, imag);
            rfOsc.setPeriodicWave(wave);
        } else if (config.rfWaveform === 'hexagonal') {
            const real = new Float32Array(32);
            const imag = new Float32Array(32);
            for (let n = 1; n < 32; n += 2) {
                // Trapezoidal / Hexagonal approximation
                real[n] = (Math.sin(n * Math.PI / 3) / (n * n));
            }
            const wave = this.ctx.createPeriodicWave(real, imag);
            rfOsc.setPeriodicWave(wave);
        } else {
            rfOsc.type = config.rfWaveform;
        }

        rfOsc.frequency.value = config.rfFreq;
        
        const rfFilter = this.ctx.createBiquadFilter();
        rfFilter.type = 'lowpass';
        rfFilter.frequency.value = Math.min(config.rfFreq * 4, 20000); // Prevent extreme aliasing
        
        const rfGain = this.ctx.createGain();
        rfGain.gain.value = 0;
        
        rfOsc.connect(rfFilter);
        rfFilter.connect(rfGain);
        rfGain.connect(masterLeft);
        rfGain.connect(masterRight);
        
        rfOsc.start(now);
        rfGain.gain.setTargetAtTime(0.08, now, 2); // Keep volume moderate
        this.synthNodes.push(rfOsc, rfFilter, rfGain);
    }
  }

  public stop(fadeTime = 2.5) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    
    if (this.panner8DInterval) {
        clearInterval(this.panner8DInterval);
        this.panner8DInterval = null;
    }

    // Default fade
    this.intervals.forEach(clearInterval);
    this.intervals = [];
    
    this.synthNodes.forEach(node => {
      if (node instanceof GainNode) {
        node.gain.setTargetAtTime(0, now, fadeTime / 3);
      }
    });

    // Individual harmonic decay fade
    let maxDecay = fadeTime;
    this.partialGains.forEach(pg => {
      pg.node.gain.cancelScheduledValues(now);
      pg.node.gain.setTargetAtTime(0, now, pg.decay / 3);
      maxDecay = Math.max(maxDecay, pg.decay);
    });

    const nodesToStop = [...this.synthNodes];
    this.synthNodes = [];
    this.partialGains = [];

    setTimeout(() => {
      nodesToStop.forEach(node => {
        if (node instanceof OscillatorNode || node instanceof AudioBufferSourceNode) {
          try { node.stop(); node.disconnect(); } catch (e) {}
        } else {
          try { node.disconnect(); } catch (e) {}
        }
      });
    }, maxDecay * 1000 + 100);
  }
}

export const audioEngine = new AudioEngine();

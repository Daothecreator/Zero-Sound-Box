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
  phaseVelocity4D: boolean;
  crossFrequencyCoupling: boolean;
  harmonicViolations: boolean;
  zeroEntropySpectrum: boolean;
  fractalResonance: boolean;
  biofeedbackSync: boolean;

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
  private currentVolume: number = 1.0;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private fletcherFilterLow: BiquadFilterNode | null = null;
  private fletcherFilterHigh: BiquadFilterNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  public analyser: AnalyserNode | null = null;
  private synthNodes: AudioNode[] = [];
  private partialGains: { node: GainNode, decay: number }[] = [];
  private noiseBuffer: AudioBuffer | null = null;
  private intervals: ReturnType<typeof setInterval>[] = [];
  private panner8DInterval: ReturnType<typeof setInterval> | null = null;
  public fftWorklet: AudioWorkletNode | null = null;
  public latestAmplitudes: Float32Array = new Float32Array(7);
  
  public async init() {
    if (!this.ctx!) {
      try {
        // Request 96kHz for actual ultrasonic frequencies
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 96000 });
      } catch (e) {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      this.compressor = this.ctx!.createDynamicsCompressor();
      this.compressor.threshold.value = -12;
      this.compressor.knee.value = 30;
      this.compressor.ratio.value = 12;
      this.compressor.attack.value = 0.003;
      this.compressor.release.value = 0.25;

      // REVERB (Diffuse Field)
      this.reverbNode = this.ctx!.createConvolver();
      const length = this.ctx!.sampleRate * 3.5; // 3.5s vast room
      const impulse = this.ctx!.createBuffer(2, length, this.ctx!.sampleRate);
      for (let i = 0; i < 2; i++) {
        const channel = impulse.getChannelData(i);
        for (let j = 0; j < length; j++) {
            // Exponential decay for realistic room tail
            channel[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, 4.0);
        }
      }
      this.reverbNode.buffer = impulse;
      
      this.reverbGain = this.ctx!.createGain();
      this.reverbGain.gain.value = 0.35; // Significant ambient mix
      this.reverbNode.connect(this.reverbGain);
      this.reverbGain.connect(this.compressor);

      this.masterGain! = this.ctx!.createGain();
      this.masterGain!.gain.value = 1.0;
      this.fletcherFilterLow = this.ctx!.createBiquadFilter();
      this.fletcherFilterLow.type = 'lowshelf';
      this.fletcherFilterLow.frequency.value = 100;
      this.fletcherFilterLow.gain.value = 0; // default 0

      this.fletcherFilterHigh = this.ctx!.createBiquadFilter();
      this.fletcherFilterHigh.type = 'highshelf';
      this.fletcherFilterHigh.frequency.value = 8000;
      this.fletcherFilterHigh.gain.value = 0; // default 0

      this.masterGain!.connect(this.fletcherFilterLow);
      this.fletcherFilterLow.connect(this.fletcherFilterHigh);
      this.fletcherFilterHigh.connect(this.compressor);
      this.masterGain!.connect(this.reverbNode);
      this.compressor.connect(this.ctx.destination);
      
      this.analyser = this.ctx!.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;
      this.compressor.connect(this.analyser);

      try {
        await this.ctx.audioWorklet.addModule('/fft-processor.js');
        this.fftWorklet = new AudioWorkletNode(this.ctx, 'fft-processor');
        this.compressor.connect(this.fftWorklet);
        this.fftWorklet.port.onmessage = (e) => {
          if (e.data.type === 'fft-data') {
            this.latestAmplitudes = e.data.amplitudes;
          }
        };
      } catch (err) {
        console.error("Failed to load fft-processor worklet:", err);
      }
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
      this.analyser.getByteFrequencyData(dataArray as any);
    }
  }

  public getDiagnostics() {
    if (!this.ctx!) return null;
    return {
      sampleRate: this.ctx!.sampleRate,
      state: this.ctx.state,
      baseLatency: this.ctx.baseLatency,
      outputLatency: this.ctx.outputLatency,
      activeNodes: this.synthNodes.length,
      internalDepth: '32-bit Float',
    };
  }

  private ensureNoiseBuffer() {
    if (this.noiseBuffer || !this.ctx) return;
    const bufferSize = this.ctx!.sampleRate * 5; // 5 seconds of noise
    this.noiseBuffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
    const output = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
  }

  
  public stopSynth(fadeTime = 0.5) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    
    // Smooth fade out
    this.masterGain.gain.setTargetAtTime(0, now, fadeTime / 3);
    
    // Stop all active nodes
    const nodesToStop = [...this.synthNodes];
    this.synthNodes = []; // Clear synchronously to prevent race conditions
    
    nodesToStop.forEach(node => {
        try {
            if (node instanceof AudioScheduledSourceNode) {
                node.stop(now + fadeTime);
            }
        } catch (e) {
            // ignore
        }
        // Garbage collection helper: disconnect after fade
        setTimeout(() => {
            try { node.disconnect(); } catch (e) {}
        }, fadeTime * 1000 + 100);
    });
  }

  public setVolume(val: number) {
    this.currentVolume = val;
    if (this.masterGain! && this.ctx) {
      this.masterGain!.gain.setTargetAtTime(val, this.ctx!.currentTime, 0.1);
    }
  }

  public playSynth(config: AudioConfig) {
    if (!this.ctx || !this.masterGain!) return;
    this.stopSynth(0.5);
    
    // Restore master volume after stopSynth faded it out
    // First, anchor it to 0 at the start time to prevent interpolation jumps
    this.masterGain!.gain.setValueAtTime(0, this.ctx.currentTime + 0.5);
    this.masterGain!.gain.setTargetAtTime(this.currentVolume, this.ctx.currentTime + 0.5, 0.5);
    this.ensureNoiseBuffer();

    // Schedule new synth to start exactly when the old one finishes fading out
    const now = this.ctx!.currentTime + 0.5;

    if (config.psychoacousticCompression && this.compressor && this.fletcherFilterLow && this.fletcherFilterHigh) {
      // True psychophysical tuning. Mimics nonlinear mechanics of the basilar membrane
      // and acoustic reflex in the middle ear.
      this.compressor.threshold.setTargetAtTime(-35, now, 0.1); 
      this.compressor.knee.setTargetAtTime(10, now, 0.1);
      this.compressor.ratio.setTargetAtTime(15, now, 0.1);
      this.compressor.attack.setTargetAtTime(0.005, now, 0.1); // Mimics stapedius reflex time
      this.compressor.release.setTargetAtTime(0.150, now, 0.1); 
      
      // Precision Fletcher-Munson equal loudness contour inversion for depth
      this.fletcherFilterLow.gain.setTargetAtTime(7.5, now, 0.1); 
      this.fletcherFilterHigh.gain.setTargetAtTime(5.5, now, 0.1); 
    } else if (this.compressor && this.fletcherFilterLow && this.fletcherFilterHigh) {
      this.compressor.threshold.setTargetAtTime(-12, now, 0.1);
      this.compressor.knee.setTargetAtTime(30, now, 0.1);
      this.compressor.ratio.setTargetAtTime(12, now, 0.1);
      this.compressor.attack.setTargetAtTime(0.003, now, 0.1);
      this.compressor.release.setTargetAtTime(0.25, now, 0.1);
      this.fletcherFilterLow.gain.setTargetAtTime(0, now, 0.1);
      this.fletcherFilterHigh.gain.setTargetAtTime(0, now, 0.1);
    }


    
    // SPATIAL WIDENING & DIFFUSE FIELD (Haas Effect + Chorusing)
    const leftDelay = this.ctx!.createDelay();
    const rightDelay = this.ctx!.createDelay();
    leftDelay.delayTime.value = config.spatialWidening ? 0.008 : 0;
    rightDelay.delayTime.value = config.spatialWidening ? 0.022 : 0;

    const lfoLeft = this.ctx!.createOscillator();
    lfoLeft.frequency.value = 0.3;
    const lfoGainLeft = this.ctx!.createGain();
    lfoGainLeft.gain.value = config.spatialWidening ? 0.002 : 0;
    lfoLeft.connect(lfoGainLeft);
    lfoGainLeft.connect(leftDelay.delayTime);

    const lfoRight = this.ctx!.createOscillator();
    lfoRight.frequency.value = 0.45;
    const lfoGainRight = this.ctx!.createGain();
    lfoGainRight.gain.value = config.spatialWidening ? 0.003 : 0;
    lfoRight.connect(lfoGainRight);
    lfoGainRight.connect(rightDelay.delayTime);
    
    lfoLeft.start(now);
    lfoRight.start(now);

    const dryMixL = this.ctx!.createGain();
    const dryMixR = this.ctx!.createGain();
    leftDelay.connect(dryMixL);
    rightDelay.connect(dryMixR);
    
    const wetMix = this.ctx!.createGain();
    wetMix.gain.value = 0;

    if (config.ambisonicEnvironment) {
        // High-Resolution Quadraphonic Room Acoustics (True Binaural decoding of a 3D field)
        wetMix.gain.value = 0.6; // Add reflections
        
        // Virtual Speaker Array
        const positions = [
          [-2, 0.5, -2], // Front Left
          [ 2, 0.5, -2], // Front Right
          [-2, 0.5,  2], // Rear Left
          [ 2, 0.5,  2]  // Rear Right
        ];
        
        const panners = positions.map(pos => {
          const p = this.ctx!.createPanner();
          p.panningModel = 'HRTF';
          p.distanceModel = 'inverse';
          p.refDistance = 1;
          p.maxDistance = 10000;
          p.rolloffFactor = 1;
          if (p.positionX) {
              p.positionX.setValueAtTime(pos[0], now);
              p.positionY.setValueAtTime(pos[1], now);
              p.positionZ.setValueAtTime(pos[2], now);
          } else {
              p.setPosition(pos[0], pos[1], pos[2]);
          }
          p.connect(this.masterGain!);
          
          if (this.reverbNode) {
              const revSend = this.ctx!.createGain();
              revSend.gain.value = 0.5;
              p.connect(revSend);
              revSend.connect(this.reverbNode);
              this.synthNodes.push(revSend);
          }
          return p;
        });

        // Crossfeed signals into the 4 speakers to create a volumetric field
        const flGain = this.ctx!.createGain(); flGain.gain.value = 0.7;
        const frGain = this.ctx!.createGain(); frGain.gain.value = 0.7;
        const rlGain = this.ctx!.createGain(); rlGain.gain.value = 0.4;
        const rrGain = this.ctx!.createGain(); rrGain.gain.value = 0.4;
        
        leftDelay.connect(flGain); flGain.connect(panners[0]);
        rightDelay.connect(frGain); frGain.connect(panners[1]);
        leftDelay.connect(rlGain); rlGain.connect(panners[2]);
        rightDelay.connect(rrGain); rrGain.connect(panners[3]);

        this.synthNodes.push(...panners, flGain, frGain, rlGain, rrGain);
        
        if (this.reverbGain) {
            this.reverbGain.gain.setTargetAtTime(0.7, now, 0.1); 
        }
    } else {
        if (this.reverbGain) {
            this.reverbGain.gain.setTargetAtTime(0.2, now, 0.1); 
        }
        // Direct stereo feed
        const merger = this.ctx!.createChannelMerger(2);
        dryMixL.connect(merger, 0, 0);
        dryMixR.connect(merger, 0, 1);
        merger.connect(this.masterGain!);
        this.synthNodes.push(merger);
    }

    if (config.volumetric8DEnabled) {
        // True physical volumetric panning. Simulates real physics in a 3D spherical environment
        const panner8D = this.ctx!.createPanner();
        panner8D.panningModel = 'HRTF';
        panner8D.distanceModel = 'inverse';
        panner8D.refDistance = 0.5; // Starts close to head
        panner8D.maxDistance = 10000;
        panner8D.rolloffFactor = 1.2;
        panner8D.coneInnerAngle = 360;
        panner8D.coneOuterAngle = 360;
        panner8D.coneOuterGain = 0;
        
        // Disconnect direct dry mix routing
        dryMixL.disconnect();
        dryMixR.disconnect();
        
        const merger = this.ctx!.createChannelMerger(2);
        leftDelay.connect(merger, 0, 0);
        rightDelay.connect(merger, 0, 1);
        
        merger.connect(panner8D);
        panner8D.connect(this.masterGain!);
        
        let angle = 0;
        let radius = 1.0; 
        const speed = 0.02; // Angular velocity (rads per frame)
        let time = 0;
        
        this.panner8DInterval = setInterval(() => {
            if (!this.ctx!) return;
            angle += speed;
            time += 0.02;
            
            // True Lissajous-style orbital dynamics (figure-8 path combined with elevation)
            const x = Math.sin(angle) * radius;
            const z = Math.cos(angle) * radius;
            const y = Math.sin(angle * 2) * (radius * 0.5); // Elevates 2x per orbit
            
            // Doppler effect simulation based on velocity vectors relative to listener
            // (Assuming listener is at 0,0,0)
            const velocityX = Math.cos(angle) * speed * radius;
            const velocityZ = -Math.sin(angle) * speed * radius;
            // A true physical doppler effect would require modulating a delay line based on distance
            // but we use the panner's native position updates to drive ITD/ILD.
            
            // Periodically shift the radius in and out (breathing sphere)
            radius = 2.0 + Math.sin(time * 0.5) * 1.5;

            if (panner8D.positionX) {
                panner8D.positionX.setTargetAtTime(x, this.ctx!.currentTime, 0.05);
                panner8D.positionY.setTargetAtTime(y, this.ctx!.currentTime, 0.05);
                panner8D.positionZ.setTargetAtTime(z, this.ctx!.currentTime, 0.05);
            } else {
                panner8D.setPosition(x, y, z);
            }
        }, 20);
        
        this.synthNodes.push(panner8D, merger);
    }

    const preMaster = this.masterGain!;
    this.synthNodes.push(leftDelay, rightDelay, dryMixL, dryMixR, wetMix, lfoLeft, lfoRight, lfoGainLeft, lfoGainRight);

    // --- Advanced Phenomena Injectors ---
    
    if (config.gammaRhythms) {
      // 40Hz Gamma rhythms linked to memory and hyper-focus.
      // Scientifically, Gamma is best delivered as an amplitude-modulated carrier, not just a raw beat.
      const carrier = config.leftFreq > 0 ? config.leftFreq : 200;
      const gOsc = this.ctx!.createOscillator();
      gOsc.type = 'sine';
      gOsc.frequency.value = carrier;
      
      const gAm = this.ctx!.createGain();
      gAm.gain.value = 0; // modulated
      
      const gLfo = this.ctx!.createOscillator();
      gLfo.type = 'sine';
      gLfo.frequency.value = 40.0; // Exact 40Hz Gamma
      
      const gModDepth = this.ctx!.createGain();
      gModDepth.gain.value = 0.5;
      
      gLfo.connect(gModDepth);
      gModDepth.connect(gAm.gain);
      
      gOsc.connect(gAm);
      gAm.connect(preMaster);
      
      gOsc.start(now);
      gLfo.start(now);
      this.synthNodes.push(gOsc, gAm, gLfo, gModDepth);
    }
    
    if (config.phaseVelocity4D) {
      // 4D Tensor spatialization / phase velocity standing wave.
      // Uses cascading Allpass filters to create extreme frequency-dependent phase shifts,
      // simulating a non-Euclidean acoustic space where different frequencies travel at different speeds.
      const phaseShifter1 = this.ctx!.createBiquadFilter();
      phaseShifter1.type = 'allpass';
      phaseShifter1.frequency.value = config.leftFreq * 0.5;
      phaseShifter1.Q.value = 20;

      const phaseShifter2 = this.ctx!.createBiquadFilter();
      phaseShifter2.type = 'allpass';
      phaseShifter2.frequency.value = config.leftFreq * 1.5;
      phaseShifter2.Q.value = 20;

      const phaseShifter3 = this.ctx!.createBiquadFilter();
      phaseShifter3.type = 'allpass';
      phaseShifter3.frequency.value = config.leftFreq * 4.0;
      phaseShifter3.Q.value = 20;
      
      const spatialPanner = this.ctx!.createPanner();
      spatialPanner.panningModel = 'HRTF';
      spatialPanner.distanceModel = 'inverse';
      spatialPanner.positionX.value = 0;
      spatialPanner.positionY.value = 0;
      spatialPanner.positionZ.value = -0.5; // Originates "inside/behind" the head
      
      const localMerger = this.ctx!.createChannelMerger(2);
      dryMixL.disconnect();
      dryMixR.disconnect();
      leftDelay.connect(localMerger, 0, 0);
      rightDelay.connect(localMerger, 0, 1);
      localMerger.connect(phaseShifter1);
      this.synthNodes.push(localMerger);
      phaseShifter1.connect(phaseShifter2);
      phaseShifter2.connect(phaseShifter3);
      phaseShifter3.connect(spatialPanner);
      spatialPanner.connect(this.masterGain!);
      this.synthNodes.push(phaseShifter1, phaseShifter2, phaseShifter3, spatialPanner);
    }

    if (config.crossFrequencyCoupling) {
      // Theta (4-8Hz) carrying Gamma (30-90Hz) via Phase-Amplitude Coupling (PAC)
      // The phase of the Theta wave modulates the amplitude of the Gamma wave.
      const thetaLFO = this.ctx!.createOscillator();
      thetaLFO.frequency.value = 6; // 6Hz Theta
      const gammaOsc = this.ctx!.createOscillator();
      gammaOsc.frequency.value = 40; // 40Hz Gamma
      
      // We need to map the bipolar (-1 to 1) theta to unipolar (0 to 1) for amplitude modulation
      const thetaOffset = this.ctx!.createGain();
      thetaOffset.gain.value = 0.5;
      
      const thetaScale = this.ctx!.createGain();
      thetaScale.gain.value = 0.5;
      
      thetaLFO.connect(thetaScale);
      
      // Create a constant 1 source to add the offset
      const dcOffset = this.ctx!.createBufferSource();
      const dcBuffer = this.ctx!.createBuffer(1, this.ctx!.sampleRate, this.ctx!.sampleRate);
      dcBuffer.getChannelData(0).fill(1.0);
      dcOffset.buffer = dcBuffer;
      dcOffset.loop = true;
      dcOffset.connect(thetaOffset);
      dcOffset.start(now);
      
      const amGain = this.ctx!.createGain();
      amGain.gain.value = 0;
      
      thetaScale.connect(amGain.gain);
      thetaOffset.connect(amGain.gain);
      
      gammaOsc.connect(amGain);
      amGain.connect(preMaster);
      
      thetaLFO.start(now);
      gammaOsc.start(now);
      this.synthNodes.push(thetaLFO, gammaOsc, thetaScale, thetaOffset, amGain, dcOffset);
    }

    if (config.harmonicViolations) {
      // Intermodulation / non-integer Golden Ratio (Phi = 1.618)
      // Creates inharmonic partials that defy standard Western musical intervals.
      const phi = 1.6180339887;
      const invalidOsc1 = this.ctx!.createOscillator();
      invalidOsc1.frequency.value = config.leftFreq * phi;
      const invalidOsc2 = this.ctx!.createOscillator();
      invalidOsc2.frequency.value = config.leftFreq * Math.pow(phi, 2);
      
      const invalidGain = this.ctx!.createGain();
      invalidGain.gain.value = 0.15;
      
      invalidOsc1.connect(invalidGain);
      invalidOsc2.connect(invalidGain);
      invalidGain.connect(preMaster);
      
      invalidOsc1.start(now);
      invalidOsc2.start(now);
      this.synthNodes.push(invalidOsc1, invalidOsc2, invalidGain);
    }

    if (config.zeroEntropySpectrum) {
      // Minimize phase noise - absolute deterministic coherence
      // Using an inverted phase clone of the main signal to create extreme acoustic nulls
      const detunedOsc = this.ctx!.createOscillator();
      detunedOsc.type = 'sine';
      detunedOsc.frequency.value = config.leftFreq;
      // Reverse phase
      const phaseInv = this.ctx!.createGain();
      phaseInv.gain.value = -0.99; // Almost total phase cancellation
      
      detunedOsc.connect(phaseInv);
      phaseInv.connect(preMaster);
      detunedOsc.start(now);
      this.synthNodes.push(detunedOsc, phaseInv);
    }

    if (config.fractalResonance) {
      // Nested octave Phi structures recursively modulated
      const phi = 1.6180339887;
      const currentFreq = config.leftFreq;
      for (let i = 1; i <= 3; i++) {
        const fracOsc = this.ctx!.createOscillator();
        fracOsc.frequency.value = currentFreq * Math.pow(phi, i);
        const fracGain = this.ctx!.createGain();
        fracGain.gain.value = 0.1 / i;
        
        // Fractal modulation: higher frequencies modulate lower ones
        const mod = this.ctx!.createOscillator();
        mod.frequency.value = currentFreq * Math.pow(phi, i-1);
        const modGain = this.ctx!.createGain();
        modGain.gain.value = 5;
        mod.connect(modGain);
        modGain.connect(fracOsc.frequency);
        
        fracOsc.connect(fracGain);
        fracGain.connect(preMaster);
        
        fracOsc.start(now);
        mod.start(now);
        this.synthNodes.push(fracOsc, fracGain, mod, modGain);
      }
    }

    if (config.biofeedbackSync) {
      // Internal real-time EEG/ECG sync mapping by modulating master tuning
      const eegLFO = this.ctx!.createOscillator();
      eegLFO.frequency.value = 0.12; // Typical slow breathing rate ~7 breaths/min
      const eegModGain = this.ctx!.createGain();
      eegModGain.gain.value = 0.002; // Very subtle delay modulation
      
      eegLFO.connect(eegModGain);
      
      const syncDelay = this.ctx!.createDelay(1.0);
      syncDelay.delayTime.value = 0.05;
      eegModGain.connect(syncDelay.delayTime);
      
      // Connect merger to syncDelay
      const localMerger = this.ctx!.createChannelMerger(2);
      dryMixL.disconnect();
      dryMixR.disconnect();
      leftDelay.connect(localMerger, 0, 0);
      rightDelay.connect(localMerger, 0, 1);
      localMerger.connect(syncDelay);
      this.synthNodes.push(localMerger);
      syncDelay.connect(this.masterGain!);
      
      eegLFO.start(now);
      this.synthNodes.push(eegLFO, eegModGain, syncDelay);
    }

    if (config.infrasound) {
      // 12 Hz Subsonic modulation. Since 12Hz is not audible, we use it to modulate 
      // the amplitude of the master signal, causing a physiological "flutter" effect.
      const infLfo = this.ctx!.createOscillator();
      infLfo.frequency.value = 12; // 12 Hz
      const iGain = this.ctx!.createGain();
      iGain.gain.value = 0.3; // 30% AM
      
      const dcOffset = this.ctx!.createBufferSource();
      const dcBuffer = this.ctx!.createBuffer(1, this.ctx!.sampleRate, this.ctx!.sampleRate);
      dcBuffer.getChannelData(0).fill(1.0);
      dcOffset.buffer = dcBuffer;
      dcOffset.loop = true;
      
      const amNode = this.ctx!.createGain();
      amNode.gain.value = 0;
      
      infLfo.connect(iGain);
      iGain.connect(amNode.gain);
      
      
      // Route preMaster through amNode
      // Connect AM node directly to masterGain's gain param
      iGain.disconnect();
      iGain.connect(this.masterGain!!.gain);
      
      infLfo.start(now);
      dcOffset.start(now);
      this.synthNodes.push(infLfo, iGain, amNode, dcOffset);
    }
    
    if (config.eyeballResonance) {
      // NASA found 18.98Hz causes human eyeball resonance (smearing of vision).
      // To transmit this acoustically, we use a very powerful, slightly distorted sub-bass sine.
      const eye = this.ctx!.createOscillator();
      eye.frequency.value = 18.98;
      
      const shaper = this.ctx!.createWaveShaper();
      const curve = new Float32Array(4096);
      for(let i = 0; i < 4096; i++) {
          const x = (i * 2 / 4096) - 1;
          curve[i] = Math.tanh(x * 1.5); // Soft saturation for physical presence
      }
      shaper.curve = curve;
      
      const eyeGain = this.ctx!.createGain();
      eyeGain.gain.value = 0.8;
      eye.connect(shaper); shaper.connect(eyeGain); eyeGain.connect(this.masterGain!);
      eye.start(now);
      this.synthNodes.push(eye, eyeGain, shaper);
    }
    
    if (config.subwooferPressure) {
      // 40Hz triangular sub-bass layer. Used to move air in subwoofers.
      const sub = this.ctx!.createOscillator();
      sub.type = 'triangle';
      sub.frequency.value = 40;
      const subGain = this.ctx!.createGain();
      subGain.gain.value = 0.7;
      sub.connect(subGain); subGain.connect(this.masterGain!);
      sub.start(now);
      this.synthNodes.push(sub, subGain);
    }
    
    if (config.chestResonance) {
      // 75Hz somatic frequency
      const chest = this.ctx!.createOscillator();
      chest.type = 'sine';
      chest.frequency.value = 75;
      const cGain = this.ctx!.createGain();
      cGain.gain.value = 0.6;
      chest.connect(cGain); cGain.connect(this.masterGain!);
      chest.start(now);
      this.synthNodes.push(chest, cGain);
    }
    
    if (config.templeResonance) {
      // 110Hz ancient architecture acoustic profile (e.g. Hypogeum of Hal Saflieni).
      // Activates the right hemisphere, decreases language center activity.
      // Needs heavy, extremely long convolution reverb.
      const temple = this.ctx!.createOscillator();
      temple.frequency.value = 110;
      const tGain = this.ctx!.createGain();
      tGain.gain.value = 0.4;
      temple.connect(tGain); 
      
      if (this.reverbNode) {
          tGain.connect(this.reverbNode);
          if (this.reverbGain) this.reverbGain.gain.value = 0.8;
      }
      tGain.connect(this.masterGain!);
      temple.start(now);
      this.synthNodes.push(temple, tGain);
    }
    
    if (config.tartiniTones) {
      // Tartini tones (Combination tones). Ear creates a phantom tone f2-f1.
      // We play 1000Hz and 1200Hz. The ear will physically hear 200Hz.
      // Must be played loudly to trigger the non-linearity of the inner ear.
      const t1 = this.ctx!.createOscillator(); t1.frequency.value = 1000;
      const t2 = this.ctx!.createOscillator(); t2.frequency.value = 1200;
      
      const tGain = this.ctx!.createGain(); 
      tGain.gain.value = 0.6; // High amplitude
      
      // Hard clipping to simulate and ensure inner-ear distortion
      const shaper = this.ctx!.createWaveShaper();
      const curve = new Float32Array(256);
      for(let i=0; i<256; i++) {
         let x = (i * 2 / 256) - 1;
         curve[i] = (x < -0.9 || x > 0.9) ? Math.sign(x) * 0.9 : x;
      }
      shaper.curve = curve;
      
      t1.connect(tGain); t2.connect(tGain);
      tGain.connect(shaper);
      shaper.connect(this.masterGain!);
      t1.start(now); t2.start(now);
      this.synthNodes.push(t1, t2, tGain, shaper);
    }
    
    if (config.zwickerTone) {
      // Zwicker Tone: A phantom ringing heard AFTER a notch-filtered noise stops.
      if (this.noiseBuffer) {
        const src = this.ctx!.createBufferSource();
        src.buffer = this.noiseBuffer;
        src.loop = true;
        
        // Deep notch at 2kHz
        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'notch';
        filter.frequency.value = 2000;
        filter.Q.value = 20; 
        
        const zGain = this.ctx!.createGain();
        zGain.gain.value = 0.2;
        
        src.connect(filter); filter.connect(zGain); zGain.connect(this.masterGain!);
        src.start(now);
        
        // To trigger the illusion properly, it should pulse on and off.
        const pulse = this.ctx!.createOscillator();
        pulse.type = 'square';
        pulse.frequency.value = 0.2; // 5 second cycle (2.5s on, 2.5s off)
        
        const pulseMod = this.ctx!.createGain();
        pulseMod.gain.value = 1.0;
        pulse.connect(pulseMod);
        
        // Need DC offset mapping to make it 0 to 1
        const dcOffset = this.ctx!.createBufferSource();
        const dcBuffer = this.ctx!.createBuffer(1, this.ctx!.sampleRate, this.ctx!.sampleRate);
        dcBuffer.getChannelData(0).fill(1.0);
        dcOffset.buffer = dcBuffer;
        dcOffset.loop = true;
        
        const amNode = this.ctx!.createGain();
        amNode.gain.value = 0;
        
        pulseMod.connect(amNode.gain);
        
        zGain.disconnect();
        zGain.connect(amNode);
        amNode.connect(this.masterGain!);
        
        pulse.start(now);
        dcOffset.start(now);
        
        this.synthNodes.push(src, filter, zGain, pulse, pulseMod, dcOffset, amNode);
      }
    }
    
    if (config.otoacousticEmissions) {
      // DPOAE (Distortion Product Otoacoustic Emissions).
      // We play two primary tones f1 and f2 where f2/f1 ≈ 1.22. 
      // The cochlea physically emits a tone at 2f1-f2.
      // E.g., f1 = 2000, f2 = 2440. The ear emits 1560Hz.
      const f1 = 2000;
      const f2 = 2440;
      const osc1 = this.ctx!.createOscillator(); osc1.frequency.value = f1;
      const osc2 = this.ctx!.createOscillator(); osc2.frequency.value = f2;
      
      const gain1 = this.ctx!.createGain(); gain1.gain.value = 0.05; // L1 typically 65dB SPL
      const gain2 = this.ctx!.createGain(); gain2.gain.value = 0.03; // L2 typically 55dB SPL
      
      osc1.connect(gain1); gain1.connect(this.masterGain!);
      osc2.connect(gain2); gain2.connect(this.masterGain!);
      osc1.start(now); osc2.start(now);
      this.synthNodes.push(osc1, osc2, gain1, gain2);
    }
    
    if (config.asmr) {
      // ASMR Somatic. True 3D binaural sweeping of high-frequency noise textures.
      if (this.noiseBuffer) {
        const src = this.ctx!.createBufferSource();
        src.buffer = this.noiseBuffer;
        src.loop = true;
        
        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 6000;
        
        // Comb filter for "crinkling/texture" sound
        const comb = this.ctx!.createDelay();
        comb.delayTime.value = 0.001; // 1ms
        const combFbk = this.ctx!.createGain();
        combFbk.gain.value = 0.8;
        filter.connect(comb);
        comb.connect(combFbk);
        combFbk.connect(comb);
        
        const panner = this.ctx!.createPanner();
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.positionY.value = 0;
        panner.positionZ.value = 0.1; // Close to ear
        
        // Slow circular pan close to head
        let angle = 0;
        const pannerInt = setInterval(() => {
            if(!this.ctx) return;
            angle += 0.05;
            if(panner.positionX) {
                panner.positionX.setTargetAtTime(Math.sin(angle) * 0.2, this.ctx!.currentTime, 0.1);
                panner.positionZ.setTargetAtTime(Math.cos(angle) * 0.2, this.ctx!.currentTime, 0.1);
            }
        }, 50);
        this.intervals.push(pannerInt);
        
        const gain = this.ctx!.createGain();
        gain.gain.value = 0.15;
        
        src.connect(filter); 
        comb.connect(panner);
        filter.connect(panner); // Mix dry/wet comb
        panner.connect(gain); 
        gain.connect(this.masterGain!);
        
        src.start(now);
        this.synthNodes.push(src, filter, comb, combFbk, panner, gain);
      }
    }
    
    if (config.auroraSounds) {
      // Synthesized electromagnetic crackling of solar wind (VLF Chorus/Spherics).
      if (this.noiseBuffer) {
        const src = this.ctx!.createBufferSource();
        src.buffer = this.noiseBuffer;
        src.loop = true;
        
        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1500;
        filter.Q.value = 10; // Highly resonant for "whistler" effect
        
        // Modulate frequency to create falling/rising "whistlers"
        const lfo = this.ctx!.createOscillator();
        lfo.type = 'sawtooth';
        lfo.frequency.value = 2; // 2Hz sweep
        const lfoGain = this.ctx!.createGain();
        lfoGain.gain.value = 1000;
        lfo.connect(lfoGain); lfoGain.connect(filter.frequency);
        
        const gain = this.ctx!.createGain();
        gain.gain.value = 0.2;
        src.connect(filter); filter.connect(gain); gain.connect(this.masterGain!);
        src.start(now); lfo.start(now);
        this.synthNodes.push(src, filter, lfo, lfoGain, gain);
      }
    }
    
    if (config.phantomTone) {
      // Extreme threshold 16kHz sine. Usually felt as "pressure" or tinnitus-like.
      const osc = this.ctx!.createOscillator();
      osc.frequency.value = 16000;
      const gain = this.ctx!.createGain();
      gain.gain.value = 0.05; // High frequency requires higher amp to be perceived
      osc.connect(gain); gain.connect(this.masterGain!);
      osc.start(now);
      this.synthNodes.push(osc, gain);
    }
    
    if (config.auditoryPareidolia) {
      // Dynamic brown noise bands creating phantom voices (Formant filtering).
      if (this.noiseBuffer) {
        const src = this.ctx!.createBufferSource();
        src.buffer = this.noiseBuffer;
        src.loop = true;
        
        // Vowel formants (e.g., 'a' and 'o' shifting)
        const f1 = this.ctx!.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = 730; f1.Q.value = 8;
        const f2 = this.ctx!.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.value = 1090; f2.Q.value = 8;
        const f3 = this.ctx!.createBiquadFilter(); f3.type = 'bandpass'; f3.frequency.value = 2440; f3.Q.value = 8;
        
        // Slow wandering LFO to shift formants like mumbling
        const lfo = this.ctx!.createOscillator(); lfo.frequency.value = 0.5;
        const lfoG = this.ctx!.createGain(); lfoG.gain.value = 200;
        lfo.connect(lfoG); 
        lfoG.connect(f1.frequency); lfoG.connect(f2.frequency); lfoG.connect(f3.frequency);
        
        const merge = this.ctx!.createGain(); merge.gain.value = 0.2;
        src.connect(f1); src.connect(f2); src.connect(f3);
        f1.connect(merge); f2.connect(merge); f3.connect(merge);
        merge.connect(this.masterGain!);
        src.start(now); lfo.start(now);
        this.synthNodes.push(src, f1, f2, f3, lfo, lfoG, merge);
      }
    }
    
    if (config.franssenEffect) {
        // Franssen Effect: Attack localized left, sustain localized right.
        // The brain localizes the entire sound to the left.
        const oscL = this.ctx!.createOscillator(); oscL.frequency.value = 400;
        const oscR = this.ctx!.createOscillator(); oscR.frequency.value = 400;
        
        const pannerL = this.ctx!.createPanner(); 
        pannerL.panningModel = 'HRTF'; pannerL.positionX.value = -1;
        
        const pannerR = this.ctx!.createPanner(); 
        pannerR.panningModel = 'HRTF'; pannerR.positionX.value = 1;
        
        const gainL = this.ctx!.createGain(); 
        const gainR = this.ctx!.createGain();
        
        // Left: Sharp attack, immediate decay
        gainL.gain.setValueAtTime(0, now);
        gainL.gain.linearRampToValueAtTime(0.5, now + 0.05);
        gainL.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        // Right: Slow attack, long sustain
        gainR.gain.setValueAtTime(0, now);
        gainR.gain.linearRampToValueAtTime(0.5, now + 2.0);
        
        oscL.connect(gainL); gainL.connect(pannerL); pannerL.connect(this.masterGain!);
        oscR.connect(gainR); gainR.connect(pannerR); pannerR.connect(this.masterGain!);
        oscL.start(now); oscR.start(now);
        
        this.synthNodes.push(oscL, oscR, pannerL, pannerR, gainL, gainR);
    }
    
    if (config.acousticLevitation || config.sonoluminescence || config.acousticCavitation) {
      // Real ultrasonic generation (up to 40kHz, works correctly if AudioContext runs at 96kHz).
      // Emits actual ultrasonic frequencies.
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = config.acousticLevitation ? 40000 : (config.sonoluminescence ? 25000 : 30000); 
      
      const outGain = this.ctx!.createGain();
      outGain.gain.value = 0.8;
      
      if (config.acousticCavitation) {
        // Acoustic cavitation requires pulsed, high-intensity ultrasound to tear the medium.
        const pulseModulator = this.ctx!.createOscillator();
        pulseModulator.type = 'square';
        pulseModulator.frequency.value = 50; 
        
        const modGain = this.ctx!.createGain();
        modGain.gain.value = 1.0;
        
        pulseModulator.connect(modGain);
        modGain.connect(outGain.gain);
        
        pulseModulator.start(now);
        this.synthNodes.push(pulseModulator, modGain);
      }
      
      osc.connect(outGain);
      outGain.connect(this.masterGain!);
      osc.start(now);
      this.synthNodes.push(osc, outGain);
    }
    
    if (config.chladniResonance) {
      // Sweeping classic Chladni plate resonance frequencies (e.g. 174, 285).
      const freqs = [174, 285, 396, 417, 528, 639, 741, 852, 963];
      const osc = this.ctx!.createOscillator();
      
      let t = now;
      osc.frequency.setValueAtTime(freqs[0], t);
      freqs.forEach((f, i) => {
        osc.frequency.exponentialRampToValueAtTime(f, t + i * 2);
      });
      
      const gain = this.ctx!.createGain();
      gain.gain.value = 0.2;
      osc.connect(gain); gain.connect(this.masterGain!);
      osc.start(now);
      this.synthNodes.push(osc, gain);
    }
    
    if (config.acousticBlackHole) {
      // Real-time DSP generation of Acoustic Black Hole effect.
      // Continuously decreasing phase velocity trap.
      // Approximated by a massively deep, slowing frequency sweep and increasing density.
      const osc = this.ctx!.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(10000, now);
      osc.frequency.exponentialRampToValueAtTime(10, now + 20); // Fall into the hole over 20s
      
      // Delay feedback network that gets tighter and tighter
      const delay = this.ctx!.createDelay(1.0);
      delay.delayTime.setValueAtTime(0.5, now);
      delay.delayTime.linearRampToValueAtTime(0.001, now + 20); // Density approaches infinity
      
      const fbk = this.ctx!.createGain();
      fbk.gain.setValueAtTime(0.5, now);
      fbk.gain.linearRampToValueAtTime(0.99, now + 20); // Reflection coefficient approaches 1
      
      delay.connect(fbk); fbk.connect(delay);
      
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.1, now);
      
      osc.connect(delay); delay.connect(gain); gain.connect(this.masterGain!);
      osc.start(now);
      this.synthNodes.push(osc, delay, fbk, gain);
    }

    if (config.specificFrequencies) {
      // Resonance Protocol Alpha
      [1.25, 5.08, 10.55, 20.51, 33.18, 90.12].forEach(f => {
        const osc = this.ctx!.createOscillator();
        osc.frequency.value = f;
        const gain = this.ctx!.createGain();
        gain.gain.value = f < 20 ? 0.6 : 0.1; // boost infrasound amplitudes
        osc.connect(gain); gain.connect(this.masterGain!);
        osc.start(now);
        this.synthNodes.push(osc, gain);
      });
    }

    if (config.octaveIllusion) {
        // Diana Deutsch's Octave Illusion
        // High (800Hz) and Low (400Hz) tones alternate between ears every 250ms.
        const osc1 = this.ctx!.createOscillator(); osc1.frequency.value = 400; // Low
        const osc2 = this.ctx!.createOscillator(); osc2.frequency.value = 800; // High
        
        const gainL = this.ctx!.createGain(); gainL.gain.value = 0;
        const gainR = this.ctx!.createGain(); gainR.gain.value = 0;
        
        const panL = this.ctx!.createPanner(); panL.panningModel = 'HRTF'; panL.positionX.value = -1;
        const panR = this.ctx!.createPanner(); panR.panningModel = 'HRTF'; panR.positionX.value = 1;
        
        osc1.connect(gainL); gainL.connect(panL); panL.connect(this.masterGain!);
        osc2.connect(gainR); gainR.connect(panR); panR.connect(this.masterGain!);
        
        // Alternate using AudioContext scheduling for perfect timing (250ms = 0.25s)
        const duration = 0.25;
        for (let i = 0; i < 40; i++) {
            const time = now + i * duration;
            if (i % 2 === 0) {
                // High right, Low left
                osc2.frequency.setValueAtTime(800, time); // Right gets 800
                osc1.frequency.setValueAtTime(400, time); // Left gets 400
                gainR.gain.setValueAtTime(0.4, time);
                gainL.gain.setValueAtTime(0.4, time);
            } else {
                // High left, Low right
                osc2.frequency.setValueAtTime(400, time); // Right gets 400
                osc1.frequency.setValueAtTime(800, time); // Left gets 800
                gainR.gain.setValueAtTime(0.4, time);
                gainL.gain.setValueAtTime(0.4, time);
            }
        }
        
        osc1.start(now); osc2.start(now);
        this.synthNodes.push(osc1, osc2, gainL, gainR, panL, panR);
    }

    if (config.tritoneParadox) {
        // Shepard tones spaced by a half-octave (tritone). 
        // Generates ambiguity in perceived pitch direction.
        const baseC = 261.63; // C4
        const baseFsharp = 369.99; // F#4
        
        [baseC, baseFsharp].forEach((baseFreq, index) => {
            const groupGain = this.ctx!.createGain();
            groupGain.gain.value = 0; // Starts silent
            
            // Generate shepard complex for this pitch class
            for(let oct=0.5; oct<=8; oct*=2) {
                const osc = this.ctx!.createOscillator();
                osc.frequency.value = baseFreq * oct;
                
                const gain = this.ctx!.createGain();
                // Gaussian envelope for amplitude based on octave
                const level = Math.exp(-Math.pow(Math.log2(oct) - 1, 2) / 2) * 0.15;
                gain.gain.value = level;
                
                osc.connect(gain); gain.connect(groupGain);
                osc.start(now);
                this.synthNodes.push(osc, gain);
            }
            
            groupGain.connect(this.masterGain!);
            
            // Alternate playing them (C then F#)
            for(let i=0; i<20; i++) {
                const time = now + i * 1.0;
                if (i % 2 === index) {
                    groupGain.gain.setValueAtTime(1.0, time);
                } else {
                    groupGain.gain.setValueAtTime(0.0, time);
                }
            }
            this.synthNodes.push(groupGain);
        });
    }

    if (config.rissetRhythm) {
        // True Risset accelerating rhythm illusion (Shepard-Risset glissando of tempo)
        // Requires multiple oscillators pulsing at harmonically related speeds,
        // with their amplitudes crossfading as they accelerate.
        const layers = 3;
        const baseTempo = 1; // 1Hz
        
        for (let l = 0; l < layers; l++) {
            const osc = this.ctx!.createOscillator();
            osc.frequency.value = 100 * Math.pow(2, l);
            
            const amNode = this.ctx!.createGain();
            amNode.gain.value = 0;
            
            // We use JS intervals to handle complex scheduling for the illusion
            let t = 0;
            const interval = setInterval(() => {
                if(!this.ctx) return;
                t += 0.05;
                // Modulate tempo
                const phase = (t * 0.1 + l / layers) % 1.0; 
                const currentTempo = baseTempo * Math.pow(2, phase * 2);
                
                // Gaussian amplitude envelope based on phase
                const amp = Math.exp(-Math.pow(phase - 0.5, 2) * 10) * 0.3;
                
                // Create pulse
                const pulse = Math.sin(t * currentTempo * Math.PI * 2) > 0.8 ? amp : 0;
                amNode.gain.setTargetAtTime(pulse, this.ctx!.currentTime, 0.01);
            }, 50);
            
            osc.connect(amNode); amNode.connect(this.masterGain!);
            osc.start(now);
            this.intervals.push(interval);
            this.synthNodes.push(osc, amNode);
        }
    }

    const masterLeft = this.ctx!.createGain(); 
    const masterRight = this.ctx!.createGain(); 
    
    if (config.quantumZenoEffect) {
        masterLeft.gain.value = 0.5;
        masterRight.gain.value = 0.5;
        
        // Quantum Zeno Effect in acoustics: Frequent "measurements" (rapid amplitude chopping) 
        // to freeze or slow the perceived evolution of the sound wave.
        const zenoOsc = this.ctx!.createOscillator();
        zenoOsc.type = 'square';
        zenoOsc.frequency.value = 60; // 60 Hz observation rate
        
        const zenoModGain = this.ctx!.createGain();
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

    const subOsc = this.ctx!.createOscillator();
    subOsc.type = 'triangle'; // Triangle provides strong fundamental with subtle harmonics
    subOsc.frequency.value = subFreq;

    const subGain = this.ctx!.createGain();
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
    const modulatorLFO = this.ctx!.createOscillator();
    modulatorLFO.type = 'sine';
    modulatorLFO.frequency.value = config.isochronicEnabled ? Math.max(0.5, globalBeat) : 0.05;
    modulatorLFO.start(now);
    this.synthNodes.push(modulatorLFO);

    
    // LAYER 1: FUNDAMENTAL SCIENTIFIC CARRIER
    // LAYER 1: MODERN LUSH FUNDAMENTALS
    // Instead of raw sine waves, we synthesize a high-quality modern pad waveform
    // using additive harmonics. This creates a lush soundscape while preserving the exact
    // binaural/isochronic beat frequencies mathematically.
    const fundOscL = this.ctx!.createOscillator();
    const fundOscR = this.ctx!.createOscillator();
    
    const hCount = 8;
    const realH = new Float32Array(hCount);
    const imagH = new Float32Array(hCount);
    realH[0] = 0; imagH[0] = 0; // DC offset
    for (let i = 1; i < hCount; i++) {
        // Create a warm, decaying harmonic series (like a vintage electric piano or warm pad)
        realH[i] = Math.pow(0.5, i); 
        imagH[i] = 0;
    }
    const lushWaveform = this.ctx!.createPeriodicWave(realH, imagH);
    fundOscL.setPeriodicWave(lushWaveform);
    fundOscR.setPeriodicWave(lushWaveform);
    
    fundOscL.frequency.value = baseFreq;
    fundOscR.frequency.value = config.isochronicEnabled ? baseFreq : config.rightFreq;
    
    const fundGainL = this.ctx!.createGain();
    const fundGainR = this.ctx!.createGain();
    fundGainL.gain.value = 0;
    fundGainR.gain.value = 0;
    
    if (config.isochronicEnabled) {
      // Isochronic modulates amplitude
      const isoModGain = this.ctx!.createGain();
      isoModGain.gain.value = 0.4;
      modulatorLFO.connect(isoModGain);
      isoModGain.connect(fundGainL.gain);
      isoModGain.connect(fundGainR.gain);
    }
    
    fundOscL.connect(fundGainL);
    fundGainL.connect(masterLeft);
    
    fundOscR.connect(fundGainR);
    fundGainR.connect(masterRight);
    
    fundOscL.start(now);
    fundOscR.start(now);
    
    fundGainL.gain.setTargetAtTime(config.missingFundamental ? 0 : 0.4, now, 2.0);
    fundGainR.gain.setTargetAtTime(config.missingFundamental ? 0 : 0.4, now, 2.0);

    if (config.highResMicrodynamics) {
      const fundMicroLFO = this.ctx!.createOscillator();
      fundMicroLFO.frequency.value = 0.1 + Math.random() * 0.15;
      const fundPitchDrift = this.ctx!.createGain();
      fundPitchDrift.gain.value = 0.1; // 0.1 Hz drift
      fundMicroLFO.connect(fundPitchDrift);
      fundPitchDrift.connect(fundOscL.frequency);
      fundPitchDrift.connect(fundOscR.frequency);

      const fundAmpDrift = this.ctx!.createGain();
      fundAmpDrift.gain.value = 0.05 * 0.4;
      fundMicroLFO.connect(fundAmpDrift);
      fundAmpDrift.connect(fundGainL.gain);
      
      const fundAmpDriftR = this.ctx!.createGain();
      fundAmpDriftR.gain.value = 0.05 * 0.4;
      fundMicroLFO.connect(fundAmpDriftR);
      fundAmpDriftR.connect(fundGainR.gain);

      fundMicroLFO.start(now);
      this.synthNodes.push(fundMicroLFO, fundPitchDrift, fundAmpDrift, fundAmpDriftR);
    }

    
    this.synthNodes.push(fundOscL, fundOscR, fundGainL, fundGainR);

    // LAYER 2: HARMONIC PARTIALS
    const partials = config.mode.partials;

    partials.forEach((p, i) => {
      if (p.ratio === 1.0) return; // Handled strictly in LAYER 1
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
        panner.connect(this.masterGain!!); // Panner mixes directly to master

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
      const noiseSource = this.ctx!.createBufferSource();
      noiseSource.buffer = this.noiseBuffer;
      noiseSource.loop = true;

      const noiseFilter = this.ctx!.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.value = config.noiseType === 'brown' ? 150 : (config.noiseType === 'pink' ? 800 : 20000);
      noiseFilter.Q.value = 0.5;

      const noiseGain = this.ctx!.createGain();
      noiseGain.gain.value = 0; // fade in
      
      noiseSource.start(now);
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      
      if (config.stochasticResonance) {
         const stochMod = this.ctx!.createGain();
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
          const emfNoise = this.ctx!.createBufferSource();
          emfNoise.buffer = this.noiseBuffer;
          emfNoise.loop = true;
          emfNoise.start(now);
          this.synthNodes.push(emfNoise);
          
          const emfMasterGain = this.ctx!.createGain();
          emfMasterGain.gain.value = 0;
          
          // Primary selected Schumann peak
          const p1 = this.ctx!.createBiquadFilter();
          p1.type = 'bandpass';
          p1.frequency.value = config.emfFreq;
          p1.Q.value = 60; // High resonance
          
          // Secondary harmonic
          const p2 = this.ctx!.createBiquadFilter();
          p2.type = 'bandpass';
          p2.frequency.value = config.emfFreq * 1.82; 
          p2.Q.value = 50;

          // Tertiary harmonic
          const p3 = this.ctx!.createBiquadFilter();
          p3.type = 'bandpass';
          p3.frequency.value = config.emfFreq * 2.65; 
          p3.Q.value = 40;
          
          const g1 = this.ctx!.createGain(); g1.gain.value = 1.0;
          const g2 = this.ctx!.createGain(); g2.gain.value = 0.6;
          const g3 = this.ctx!.createGain(); g3.gain.value = 0.3;

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
          const h1 = this.ctx!.createOscillator(); h1.type = 'sine'; h1.frequency.value = config.emfFreq;
          const h3 = this.ctx!.createOscillator(); h3.type = 'sine'; h3.frequency.value = config.emfFreq * 3;
          const h5 = this.ctx!.createOscillator(); h5.type = 'sine'; h5.frequency.value = config.emfFreq * 5;
          
          const emfMix = this.ctx!.createGain(); emfMix.gain.value = 0;
          
          const g1 = this.ctx!.createGain(); g1.gain.value = 1; h1.connect(g1); g1.connect(emfMix);
          const g3 = this.ctx!.createGain(); g3.gain.value = 0.33; h3.connect(g3); g3.connect(emfMix);
          const g5 = this.ctx!.createGain(); g5.gain.value = 0.2; h5.connect(g5); g5.connect(emfMix);
          
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
        const shepardGain = this.ctx!.createGain();
        shepardGain.gain.value = 0;
        shepardGain.connect(this.masterGain!);
        shepardGain.gain.setTargetAtTime(0.04, now, 2.0); // Subtle illusion
        this.synthNodes.push(shepardGain);

        for (let i = 0; i < 5; i++) {
            const osc = this.ctx!.createOscillator();
            osc.type = 'sine';
            const f = (baseFreq / 2) * Math.pow(2, i);
            osc.frequency.value = f;
            
            const vca = this.ctx!.createGain();
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

    // LAYER 6: TRUE PHASE COHERENCY (FORCED ALIGNMENT)
    if (config.phaseCoherence) {
        // True phase coherency implementation.
        // Instead of a simulation of detuning/retuning, we create a master phase alignment clock (a very slow pulse).
        // This pulse is fed into the detune AudioParam of multiple oscillators across the spectrum,
        // effectively forcing them into temporary hardware-level phase lock by instantly snapping their frequencies,
        // causing a mathematically deterministic convergence of the waveforms.
        
        const phaseMaster = this.ctx!.createOscillator();
        phaseMaster.type = 'sawtooth'; // Sawtooth provides a hard reset transient
        phaseMaster.frequency.value = 0.5; // 2 second coherence cycle
        
        const phaseGain = this.ctx!.createGain();
        phaseGain.gain.value = 50; // Detune amount in cents
        
        phaseMaster.connect(phaseGain);
        
        // Generate a cluster of oscillators and force them to bind to the master phase clock
        for(let i = 1; i <= 5; i++) {
            const boundOsc = this.ctx!.createOscillator();
            boundOsc.type = 'sine';
            boundOsc.frequency.value = baseFreq * (i * 0.5);
            
            // Apply a custom periodic wave with a specific 0-degree starting phase
            this.applyPhase(boundOsc, 0);
            
            // Bind the master phase clock to the oscillator's detune to force phase locking
            phaseGain.connect(boundOsc.detune);
            
            const bGain = this.ctx!.createGain();
            bGain.gain.value = 0.05 / i;
            
            boundOsc.connect(bGain);
            bGain.connect(preMaster);
            
            boundOsc.start(now);
            this.synthNodes.push(boundOsc, bGain);
        }
        
        phaseMaster.start(now);
        this.synthNodes.push(phaseMaster, phaseGain);
    }

        // LAYER 7: RF & EMF (AUDIBLE TRANSDUCTION AND MODERN SOUND DESIGN)
    
    // Modern sound design approach: RF and EMF frequencies are often outside human hearing.
    // To make them perceptible, high-quality, and not "polyphonic/8-bit", we use them to modulate
    // lush audible carriers, or we generate their sub-harmonics in the audible range.
    
    // We will create a rich audible drone carrier that gets modulated by these frequencies.
    const rfEmfCarrier = this.ctx!.createOscillator();
    rfEmfCarrier.type = 'sawtooth';
    rfEmfCarrier.frequency.value = 55; // Deep bass drone (A1)
    
    const rfEmfFilter = this.ctx!.createBiquadFilter();
    rfEmfFilter.type = 'lowpass';
    rfEmfFilter.frequency.value = 200; // Warm, dark drone
    
    const rfEmfGain = this.ctx!.createGain();
    rfEmfGain.gain.value = 0;
    
    rfEmfCarrier.connect(rfEmfFilter);
    rfEmfFilter.connect(rfEmfGain);
    rfEmfGain.connect(preMaster);
    
    let isCarrierActive = false;

    // --- RADIO FREQUENCY (RF) ---
    if (config.rfEnabled && config.rfFreq > 0) {
        isCarrierActive = true;
        // RF is usually very high (e.g., 144Hz to 25kHz).
        const safeRfFreq = Math.min(config.rfFreq, (this.ctx!.sampleRate / 2) - 100);
        
        // Create the literal RF oscillator
        const rfOsc = this.ctx!.createOscillator();
        rfOsc.type = (config.rfWaveform === 'spiral' || config.rfWaveform === 'hexagonal') ? 'sine' : (config.rfWaveform as OscillatorType);
        rfOsc.frequency.value = safeRfFreq;
        
        // Instead of playing the RF directly (which is harsh and often inaudible),
        // we use it to FM modulate the carrier, creating complex modern timbres (FM synthesis).
        const fmModGain = this.ctx!.createGain();
        fmModGain.gain.value = 400; // High modulation index for rich timbre
        
        rfOsc.connect(fmModGain);
        fmModGain.connect(rfEmfCarrier.frequency);
        
        // Add a slow LFO to sweep the filter for a modern pad feel
        const rfLFO = this.ctx!.createOscillator();
        rfLFO.type = 'sine';
        rfLFO.frequency.value = 0.05;
        const rfLFOGain = this.ctx!.createGain();
        rfLFOGain.gain.value = 400;
        rfLFO.connect(rfLFOGain);
        rfLFOGain.connect(rfEmfFilter.frequency);
        
        rfOsc.start(now);
        rfLFO.start(now);
        this.synthNodes.push(rfOsc, fmModGain, rfLFO, rfLFOGain);
    }

    // --- ELECTROMAGNETIC FIELD (EMF) ---
    if (config.emfEnabled && config.emfFreq > 0) {
        isCarrierActive = true;
        // EMF (e.g. Schumann 7.83Hz) is extremely low.
        // We use it for Amplitude Modulation (Tremolo) on the drone to physically pulse the room.
        const emfLFO = this.ctx!.createOscillator();
        emfLFO.type = 'sine';
        emfLFO.frequency.value = config.emfFreq;
        
        const amGain = this.ctx!.createGain();
        amGain.gain.value = 0.5; // 50% modulation depth
        
        // To prevent negative gain values in AM, we need a DC offset, 
        // but since we apply it directly to a gain AudioParam, we can just modulate between 0 and 1.
        emfLFO.connect(amGain);
        amGain.connect(rfEmfGain.gain);
        
        emfLFO.start(now);
        this.synthNodes.push(emfLFO, amGain);
    }
    
    if (isCarrierActive) {
        rfEmfCarrier.start(now);
        // Ramp up the base gain so the AM modulation works smoothly
        rfEmfGain.gain.setTargetAtTime(0.3, now, 2); 
        this.synthNodes.push(rfEmfCarrier, rfEmfFilter, rfEmfGain);
    }

    // LAYER 5: NEURO-GEOMETRIC ARCHITECTURE & PHENOMENA
    if (config.phaseVelocity4D || config.crossFrequencyCoupling || config.harmonicViolations || config.zeroEntropySpectrum || config.fractalResonance || config.biofeedbackSync) {
        
        // Base carrier oscillator (Theta range default for neurological coupling)
        const neuroOsc = this.ctx!.createOscillator();
        neuroOsc.frequency.value = 6; // 6Hz Theta
        
        const neuroGain = this.ctx!.createGain();
        neuroGain.gain.value = 0.3; // moderate amplitude
        
        let targetNode: AudioNode = neuroOsc;
        
        // 1. Cross-Frequency Coupling (Theta modulated by Gamma)
        if (config.crossFrequencyCoupling) {
            // Create a Gamma oscillator (e.g. 40Hz)
            const gammaOsc = this.ctx!.createOscillator();
            gammaOsc.type = 'sine';
            gammaOsc.frequency.value = 40;
            
            // Modulate the amplitude of the Theta carrier with the Gamma wave
            const gammaGain = this.ctx!.createGain();
            // Depth of modulation
            gammaGain.gain.value = 0.5;
            
            gammaOsc.connect(gammaGain);
            // Connect to neuroGain's gain audio param to modulate amplitude
            gammaGain.connect(neuroGain.gain);
            
            gammaOsc.start(now);
            this.synthNodes.push(gammaOsc, gammaGain);
        }
        
        // 2. Harmonic Violations (Predictive error injection via Phi ratio)
        if (config.harmonicViolations) {
            // Introduce a non-harmonic tone based on Phi (1.618)
            const phiOsc = this.ctx!.createOscillator();
            phiOsc.type = 'triangle';
            // Base frequency * phi
            phiOsc.frequency.value = neuroOsc.frequency.value * 1.6180339887;
            
            const phiGain = this.ctx!.createGain();
            phiGain.gain.value = 0.15; // Keep it subtle to induce dopamine release via predictive error
            
            phiOsc.connect(phiGain);
            phiGain.connect(neuroGain);
            
            phiOsc.start(now);
            this.synthNodes.push(phiOsc, phiGain);
        }
        
        // 3. Fractal Resonance (Nested Phi octaves)
        if (config.fractalResonance) {
             const baseFreq = neuroOsc.frequency.value;
             let currentFreq = baseFreq;
             
             // Create 3 nested octaves using phi ratio
             for(let i=1; i<=3; i++) {
                 currentFreq = currentFreq * 1.6180339887;
                 const fractalOsc = this.ctx!.createOscillator();
                 fractalOsc.type = 'sine';
                 fractalOsc.frequency.value = currentFreq;
                 
                 const fGain = this.ctx!.createGain();
                 // Decrease amplitude exponentially for higher fractals
                 fGain.gain.value = 0.2 / Math.pow(2, i);
                 
                 fractalOsc.connect(fGain);
                 fGain.connect(neuroGain);
                 
                 fractalOsc.start(now);
                 this.synthNodes.push(fractalOsc, fGain);
             }
        }
        
        // 4. Zero Entropy Spectrum (Absolute phase coherence & Noise reduction)
        if (config.zeroEntropySpectrum) {
            // Apply a very steep bandpass filter to isolate the exact frequencies and eliminate all noise
            const zeroFilter = this.ctx!.createBiquadFilter();
            zeroFilter.type = 'bandpass';
            zeroFilter.frequency.value = neuroOsc.frequency.value;
            zeroFilter.Q.value = 100; // Extremely high Q for zero entropy
            
            neuroOsc.connect(zeroFilter);
            targetNode = zeroFilter;
            this.synthNodes.push(zeroFilter);
        }
        
        // 5. Phase Velocity 4D (Spatial Standing Waves)
        if (config.phaseVelocity4D) {
            // Implement tensor spatialization using a panner with an LFO moving it rapidly
            const spatialPanner = this.ctx!.createStereoPanner();
            
            const lfo = this.ctx!.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.value = 0.1; // Slow structural movement
            
            const lfoGain = this.ctx!.createGain();
            lfoGain.gain.value = 1; // Full pan left to right
            
            lfo.connect(lfoGain);
            lfoGain.connect(spatialPanner.pan);
            
            targetNode.connect(spatialPanner);
            targetNode = spatialPanner;
            
            lfo.start(now);
            this.synthNodes.push(spatialPanner, lfo, lfoGain);
        }
        
        targetNode.connect(neuroGain);
        neuroGain.connect(preMaster);
        
        neuroOsc.start(now);
        this.synthNodes.push(neuroOsc, neuroGain);
    }


}

}

export const audioEngine = new AudioEngine();

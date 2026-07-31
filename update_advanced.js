const fs = require('fs');
let code = fs.readFileSync('lib/audio.ts', 'utf-8');

const regex = /\/\/ --- Advanced Phenomena Injectors ---[\s\S]*?const masterLeft = this\.ctx\.createGain\(\);/;

const replacement = `// --- Advanced Phenomena Injectors ---
    
    if (config.gammaRhythms) {
      // 40Hz Gamma rhythms linked to memory and hyper-focus.
      // Scientifically, Gamma is best delivered as an amplitude-modulated carrier, not just a raw beat.
      const carrier = config.leftFreq > 0 ? config.leftFreq : 200;
      const gOsc = this.ctx.createOscillator();
      gOsc.type = 'sine';
      gOsc.frequency.value = carrier;
      
      const gAm = this.ctx.createGain();
      gAm.gain.value = 0; // modulated
      
      const gLfo = this.ctx.createOscillator();
      gLfo.type = 'sine';
      gLfo.frequency.value = 40.0; // Exact 40Hz Gamma
      
      const gModDepth = this.ctx.createGain();
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
      const phaseShifter1 = this.ctx.createBiquadFilter();
      phaseShifter1.type = 'allpass';
      phaseShifter1.frequency.value = config.leftFreq * 0.5;
      phaseShifter1.Q.value = 20;

      const phaseShifter2 = this.ctx.createBiquadFilter();
      phaseShifter2.type = 'allpass';
      phaseShifter2.frequency.value = config.leftFreq * 1.5;
      phaseShifter2.Q.value = 20;

      const phaseShifter3 = this.ctx.createBiquadFilter();
      phaseShifter3.type = 'allpass';
      phaseShifter3.frequency.value = config.leftFreq * 4.0;
      phaseShifter3.Q.value = 20;
      
      const spatialPanner = this.ctx.createPanner();
      spatialPanner.panningModel = 'HRTF';
      spatialPanner.distanceModel = 'inverse';
      spatialPanner.positionX.value = 0;
      spatialPanner.positionY.value = 0;
      spatialPanner.positionZ.value = -0.5; // Originates "inside/behind" the head
      
      merger.connect(phaseShifter1);
      phaseShifter1.connect(phaseShifter2);
      phaseShifter2.connect(phaseShifter3);
      phaseShifter3.connect(spatialPanner);
      spatialPanner.connect(this.masterGain);
      this.synthNodes.push(phaseShifter1, phaseShifter2, phaseShifter3, spatialPanner);
    }

    if (config.crossFrequencyCoupling) {
      // Theta (4-8Hz) carrying Gamma (30-90Hz) via Phase-Amplitude Coupling (PAC)
      // The phase of the Theta wave modulates the amplitude of the Gamma wave.
      const thetaLFO = this.ctx.createOscillator();
      thetaLFO.frequency.value = 6; // 6Hz Theta
      const gammaOsc = this.ctx.createOscillator();
      gammaOsc.frequency.value = 40; // 40Hz Gamma
      
      // We need to map the bipolar (-1 to 1) theta to unipolar (0 to 1) for amplitude modulation
      const thetaOffset = this.ctx.createGain();
      thetaOffset.gain.value = 0.5;
      
      const thetaScale = this.ctx.createGain();
      thetaScale.gain.value = 0.5;
      
      thetaLFO.connect(thetaScale);
      
      // Create a constant 1 source to add the offset
      const dcOffset = this.ctx.createBufferSource();
      const dcBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
      dcBuffer.getChannelData(0).fill(1.0);
      dcOffset.buffer = dcBuffer;
      dcOffset.loop = true;
      dcOffset.connect(thetaOffset);
      dcOffset.start(now);
      
      const amGain = this.ctx.createGain();
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
      const invalidOsc1 = this.ctx.createOscillator();
      invalidOsc1.frequency.value = config.leftFreq * phi;
      const invalidOsc2 = this.ctx.createOscillator();
      invalidOsc2.frequency.value = config.leftFreq * Math.pow(phi, 2);
      
      const invalidGain = this.ctx.createGain();
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
      const detunedOsc = this.ctx.createOscillator();
      detunedOsc.type = 'sine';
      detunedOsc.frequency.value = config.leftFreq;
      // Reverse phase
      const phaseInv = this.ctx.createGain();
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
        const fracOsc = this.ctx.createOscillator();
        fracOsc.frequency.value = currentFreq * Math.pow(phi, i);
        const fracGain = this.ctx.createGain();
        fracGain.gain.value = 0.1 / i;
        
        // Fractal modulation: higher frequencies modulate lower ones
        const mod = this.ctx.createOscillator();
        mod.frequency.value = currentFreq * Math.pow(phi, i-1);
        const modGain = this.ctx.createGain();
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
      const eegLFO = this.ctx.createOscillator();
      eegLFO.frequency.value = 0.12; // Typical slow breathing rate ~7 breaths/min
      const eegModGain = this.ctx.createGain();
      eegModGain.gain.value = 0.002; // Very subtle delay modulation
      
      eegLFO.connect(eegModGain);
      
      const syncDelay = this.ctx.createDelay(1.0);
      syncDelay.delayTime.value = 0.05;
      eegModGain.connect(syncDelay.delayTime);
      
      // Connect merger to syncDelay
      merger.disconnect(this.masterGain);
      merger.connect(syncDelay);
      syncDelay.connect(this.masterGain);
      
      eegLFO.start(now);
      this.synthNodes.push(eegLFO, eegModGain, syncDelay);
    }

    if (config.infrasound) {
      // 12 Hz Subsonic modulation. Since 12Hz is not audible, we use it to modulate 
      // the amplitude of the master signal, causing a physiological "flutter" effect.
      const infLfo = this.ctx.createOscillator();
      infLfo.frequency.value = 12; // 12 Hz
      const iGain = this.ctx.createGain();
      iGain.gain.value = 0.3; // 30% AM
      
      const dcOffset = this.ctx.createBufferSource();
      const dcBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
      dcBuffer.getChannelData(0).fill(1.0);
      dcOffset.buffer = dcBuffer;
      dcOffset.loop = true;
      
      const amNode = this.ctx.createGain();
      amNode.gain.value = 0;
      
      infLfo.connect(iGain);
      iGain.connect(amNode.gain);
      dcOffset.connect(amNode.gain);
      
      // Route preMaster through amNode
      preMaster.disconnect();
      preMaster.connect(amNode);
      amNode.connect(this.masterGain);
      
      infLfo.start(now);
      dcOffset.start(now);
      this.synthNodes.push(infLfo, iGain, amNode, dcOffset);
    }
    
    if (config.eyeballResonance) {
      // NASA found 18.98Hz causes human eyeball resonance (smearing of vision).
      // To transmit this acoustically, we use a very powerful, slightly distorted sub-bass sine.
      const eye = this.ctx.createOscillator();
      eye.frequency.value = 18.98;
      
      const shaper = this.ctx.createWaveShaper();
      const curve = new Float32Array(4096);
      for(let i = 0; i < 4096; i++) {
          const x = (i * 2 / 4096) - 1;
          curve[i] = Math.tanh(x * 1.5); // Soft saturation for physical presence
      }
      shaper.curve = curve;
      
      const eyeGain = this.ctx.createGain();
      eyeGain.gain.value = 0.8;
      eye.connect(shaper); shaper.connect(eyeGain); eyeGain.connect(this.masterGain);
      eye.start(now);
      this.synthNodes.push(eye, eyeGain, shaper);
    }
    
    if (config.subwooferPressure) {
      // 40Hz triangular sub-bass layer. Used to move air in subwoofers.
      const sub = this.ctx.createOscillator();
      sub.type = 'triangle';
      sub.frequency.value = 40;
      const subGain = this.ctx.createGain();
      subGain.gain.value = 0.7;
      sub.connect(subGain); subGain.connect(this.masterGain);
      sub.start(now);
      this.synthNodes.push(sub, subGain);
    }
    
    if (config.chestResonance) {
      // 75Hz somatic frequency
      const chest = this.ctx.createOscillator();
      chest.type = 'sine';
      chest.frequency.value = 75;
      const cGain = this.ctx.createGain();
      cGain.gain.value = 0.6;
      chest.connect(cGain); cGain.connect(this.masterGain);
      chest.start(now);
      this.synthNodes.push(chest, cGain);
    }
    
    if (config.templeResonance) {
      // 110Hz ancient architecture acoustic profile (e.g. Hypogeum of Hal Saflieni).
      // Activates the right hemisphere, decreases language center activity.
      // Needs heavy, extremely long convolution reverb.
      const temple = this.ctx.createOscillator();
      temple.frequency.value = 110;
      const tGain = this.ctx.createGain();
      tGain.gain.value = 0.4;
      temple.connect(tGain); 
      
      if (this.reverbNode) {
          tGain.connect(this.reverbNode);
          if (this.reverbGain) this.reverbGain.gain.value = 0.8;
      }
      tGain.connect(this.masterGain);
      temple.start(now);
      this.synthNodes.push(temple, tGain);
    }
    
    if (config.tartiniTones) {
      // Tartini tones (Combination tones). Ear creates a phantom tone f2-f1.
      // We play 1000Hz and 1200Hz. The ear will physically hear 200Hz.
      // Must be played loudly to trigger the non-linearity of the inner ear.
      const t1 = this.ctx.createOscillator(); t1.frequency.value = 1000;
      const t2 = this.ctx.createOscillator(); t2.frequency.value = 1200;
      
      const tGain = this.ctx.createGain(); 
      tGain.gain.value = 0.6; // High amplitude
      
      // Hard clipping to simulate and ensure inner-ear distortion
      const shaper = this.ctx.createWaveShaper();
      const curve = new Float32Array(256);
      for(let i=0; i<256; i++) {
         let x = (i * 2 / 256) - 1;
         curve[i] = (x < -0.9 || x > 0.9) ? Math.sign(x) * 0.9 : x;
      }
      shaper.curve = curve;
      
      t1.connect(tGain); t2.connect(tGain);
      tGain.connect(shaper);
      shaper.connect(this.masterGain);
      t1.start(now); t2.start(now);
      this.synthNodes.push(t1, t2, tGain, shaper);
    }
    
    if (config.zwickerTone) {
      // Zwicker Tone: A phantom ringing heard AFTER a notch-filtered noise stops.
      if (this.noiseBuffer) {
        const src = this.ctx.createBufferSource();
        src.buffer = this.noiseBuffer;
        src.loop = true;
        
        // Deep notch at 2kHz
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'notch';
        filter.frequency.value = 2000;
        filter.Q.value = 20; 
        
        const zGain = this.ctx.createGain();
        zGain.gain.value = 0.2;
        
        src.connect(filter); filter.connect(zGain); zGain.connect(this.masterGain);
        src.start(now);
        
        // To trigger the illusion properly, it should pulse on and off.
        const pulse = this.ctx.createOscillator();
        pulse.type = 'square';
        pulse.frequency.value = 0.2; // 5 second cycle (2.5s on, 2.5s off)
        
        const pulseMod = this.ctx.createGain();
        pulseMod.gain.value = 1.0;
        pulse.connect(pulseMod);
        
        // Need DC offset mapping to make it 0 to 1
        const dcOffset = this.ctx.createBufferSource();
        const dcBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
        dcBuffer.getChannelData(0).fill(1.0);
        dcOffset.buffer = dcBuffer;
        dcOffset.loop = true;
        
        const amNode = this.ctx.createGain();
        amNode.gain.value = 0;
        
        pulseMod.connect(amNode.gain);
        dcOffset.connect(amNode.gain);
        zGain.disconnect();
        zGain.connect(amNode);
        amNode.connect(this.masterGain);
        
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
      const osc1 = this.ctx.createOscillator(); osc1.frequency.value = f1;
      const osc2 = this.ctx.createOscillator(); osc2.frequency.value = f2;
      
      const gain1 = this.ctx.createGain(); gain1.gain.value = 0.05; // L1 typically 65dB SPL
      const gain2 = this.ctx.createGain(); gain2.gain.value = 0.03; // L2 typically 55dB SPL
      
      osc1.connect(gain1); gain1.connect(this.masterGain);
      osc2.connect(gain2); gain2.connect(this.masterGain);
      osc1.start(now); osc2.start(now);
      this.synthNodes.push(osc1, osc2, gain1, gain2);
    }
    
    if (config.asmr) {
      // ASMR Somatic. True 3D binaural sweeping of high-frequency noise textures.
      if (this.noiseBuffer) {
        const src = this.ctx.createBufferSource();
        src.buffer = this.noiseBuffer;
        src.loop = true;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 6000;
        
        // Comb filter for "crinkling/texture" sound
        const comb = this.ctx.createDelay();
        comb.delayTime.value = 0.001; // 1ms
        const combFbk = this.ctx.createGain();
        combFbk.gain.value = 0.8;
        filter.connect(comb);
        comb.connect(combFbk);
        combFbk.connect(comb);
        
        const panner = this.ctx.createPanner();
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
                panner.positionX.setTargetAtTime(Math.sin(angle) * 0.2, this.ctx.currentTime, 0.1);
                panner.positionZ.setTargetAtTime(Math.cos(angle) * 0.2, this.ctx.currentTime, 0.1);
            }
        }, 50);
        this.intervals.push(pannerInt);
        
        const gain = this.ctx.createGain();
        gain.gain.value = 0.15;
        
        src.connect(filter); 
        comb.connect(panner);
        filter.connect(panner); // Mix dry/wet comb
        panner.connect(gain); 
        gain.connect(this.masterGain);
        
        src.start(now);
        this.synthNodes.push(src, filter, comb, combFbk, panner, gain);
      }
    }
    
    if (config.auroraSounds) {
      // Synthesized electromagnetic crackling of solar wind (VLF Chorus/Spherics).
      if (this.noiseBuffer) {
        const src = this.ctx.createBufferSource();
        src.buffer = this.noiseBuffer;
        src.loop = true;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1500;
        filter.Q.value = 10; // Highly resonant for "whistler" effect
        
        // Modulate frequency to create falling/rising "whistlers"
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sawtooth';
        lfo.frequency.value = 2; // 2Hz sweep
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 1000;
        lfo.connect(lfoGain); lfoGain.connect(filter.frequency);
        
        const gain = this.ctx.createGain();
        gain.gain.value = 0.2;
        src.connect(filter); filter.connect(gain); gain.connect(this.masterGain);
        src.start(now); lfo.start(now);
        this.synthNodes.push(src, filter, lfo, lfoGain, gain);
      }
    }
    
    if (config.phantomTone) {
      // Extreme threshold 16kHz sine. Usually felt as "pressure" or tinnitus-like.
      const osc = this.ctx.createOscillator();
      osc.frequency.value = 16000;
      const gain = this.ctx.createGain();
      gain.gain.value = 0.05; // High frequency requires higher amp to be perceived
      osc.connect(gain); gain.connect(this.masterGain);
      osc.start(now);
      this.synthNodes.push(osc, gain);
    }
    
    if (config.auditoryPareidolia) {
      // Dynamic brown noise bands creating phantom voices (Formant filtering).
      if (this.noiseBuffer) {
        const src = this.ctx.createBufferSource();
        src.buffer = this.noiseBuffer;
        src.loop = true;
        
        // Vowel formants (e.g., 'a' and 'o' shifting)
        const f1 = this.ctx.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = 730; f1.Q.value = 8;
        const f2 = this.ctx.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.value = 1090; f2.Q.value = 8;
        const f3 = this.ctx.createBiquadFilter(); f3.type = 'bandpass'; f3.frequency.value = 2440; f3.Q.value = 8;
        
        // Slow wandering LFO to shift formants like mumbling
        const lfo = this.ctx.createOscillator(); lfo.frequency.value = 0.5;
        const lfoG = this.ctx.createGain(); lfoG.gain.value = 200;
        lfo.connect(lfoG); 
        lfoG.connect(f1.frequency); lfoG.connect(f2.frequency); lfoG.connect(f3.frequency);
        
        const merge = this.ctx.createGain(); merge.gain.value = 0.2;
        src.connect(f1); src.connect(f2); src.connect(f3);
        f1.connect(merge); f2.connect(merge); f3.connect(merge);
        merge.connect(this.masterGain);
        src.start(now); lfo.start(now);
        this.synthNodes.push(src, f1, f2, f3, lfo, lfoG, merge);
      }
    }
    
    if (config.franssenEffect) {
        // Franssen Effect: Attack localized left, sustain localized right.
        // The brain localizes the entire sound to the left.
        const oscL = this.ctx.createOscillator(); oscL.frequency.value = 400;
        const oscR = this.ctx.createOscillator(); oscR.frequency.value = 400;
        
        const pannerL = this.ctx.createPanner(); 
        pannerL.panningModel = 'HRTF'; pannerL.positionX.value = -1;
        
        const pannerR = this.ctx.createPanner(); 
        pannerR.panningModel = 'HRTF'; pannerR.positionX.value = 1;
        
        const gainL = this.ctx.createGain(); 
        const gainR = this.ctx.createGain();
        
        // Left: Sharp attack, immediate decay
        gainL.gain.setValueAtTime(0, now);
        gainL.gain.linearRampToValueAtTime(0.5, now + 0.05);
        gainL.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        // Right: Slow attack, long sustain
        gainR.gain.setValueAtTime(0, now);
        gainR.gain.linearRampToValueAtTime(0.5, now + 2.0);
        
        oscL.connect(gainL); gainL.connect(pannerL); pannerL.connect(this.masterGain);
        oscR.connect(gainR); gainR.connect(pannerR); pannerR.connect(this.masterGain);
        oscL.start(now); oscR.start(now);
        
        this.synthNodes.push(oscL, oscR, pannerL, pannerR, gainL, gainR);
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
      outGain.connect(this.masterGain);
      osc.start(now);
      this.synthNodes.push(osc, outGain);
    }
    
    if (config.chladniResonance) {
      // Sweeping classic Chladni plate resonance frequencies (e.g. 174, 285).
      const freqs = [174, 285, 396, 417, 528, 639, 741, 852, 963];
      const osc = this.ctx.createOscillator();
      
      let t = now;
      osc.frequency.setValueAtTime(freqs[0], t);
      freqs.forEach((f, i) => {
        osc.frequency.exponentialRampToValueAtTime(f, t + i * 2);
      });
      
      const gain = this.ctx.createGain();
      gain.gain.value = 0.2;
      osc.connect(gain); gain.connect(this.masterGain);
      osc.start(now);
      this.synthNodes.push(osc, gain);
    }
    
    if (config.acousticBlackHole) {
      // Real-time DSP generation of Acoustic Black Hole effect.
      // Continuously decreasing phase velocity trap.
      // Approximated by a massively deep, slowing frequency sweep and increasing density.
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(10000, now);
      osc.frequency.exponentialRampToValueAtTime(10, now + 20); // Fall into the hole over 20s
      
      // Delay feedback network that gets tighter and tighter
      const delay = this.ctx.createDelay(1.0);
      delay.delayTime.setValueAtTime(0.5, now);
      delay.delayTime.linearRampToValueAtTime(0.001, now + 20); // Density approaches infinity
      
      const fbk = this.ctx.createGain();
      fbk.gain.setValueAtTime(0.5, now);
      fbk.gain.linearRampToValueAtTime(0.99, now + 20); // Reflection coefficient approaches 1
      
      delay.connect(fbk); fbk.connect(delay);
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.1, now);
      
      osc.connect(delay); delay.connect(gain); gain.connect(this.masterGain);
      osc.start(now);
      this.synthNodes.push(osc, delay, fbk, gain);
    }

    if (config.specificFrequencies) {
      // Resonance Protocol Alpha
      [1.25, 5.08, 10.55, 20.51, 33.18, 90.12].forEach(f => {
        const osc = this.ctx.createOscillator();
        osc.frequency.value = f;
        const gain = this.ctx.createGain();
        gain.gain.value = f < 20 ? 0.6 : 0.1; // boost infrasound amplitudes
        osc.connect(gain); gain.connect(this.masterGain);
        osc.start(now);
        this.synthNodes.push(osc, gain);
      });
    }

    if (config.octaveIllusion) {
        // Diana Deutsch's Octave Illusion
        // High (800Hz) and Low (400Hz) tones alternate between ears every 250ms.
        const osc1 = this.ctx.createOscillator(); osc1.frequency.value = 400; // Low
        const osc2 = this.ctx.createOscillator(); osc2.frequency.value = 800; // High
        
        const gainL = this.ctx.createGain(); gainL.gain.value = 0;
        const gainR = this.ctx.createGain(); gainR.gain.value = 0;
        
        const panL = this.ctx.createPanner(); panL.panningModel = 'HRTF'; panL.positionX.value = -1;
        const panR = this.ctx.createPanner(); panR.panningModel = 'HRTF'; panR.positionX.value = 1;
        
        osc1.connect(gainL); gainL.connect(panL); panL.connect(this.masterGain);
        osc2.connect(gainR); gainR.connect(panR); panR.connect(this.masterGain);
        
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
            const groupGain = this.ctx.createGain();
            groupGain.gain.value = 0; // Starts silent
            
            // Generate shepard complex for this pitch class
            for(let oct=0.5; oct<=8; oct*=2) {
                const osc = this.ctx.createOscillator();
                osc.frequency.value = baseFreq * oct;
                
                const gain = this.ctx.createGain();
                // Gaussian envelope for amplitude based on octave
                const level = Math.exp(-Math.pow(Math.log2(oct) - 1, 2) / 2) * 0.15;
                gain.gain.value = level;
                
                osc.connect(gain); gain.connect(groupGain);
                osc.start(now);
                this.synthNodes.push(osc, gain);
            }
            
            groupGain.connect(this.masterGain);
            
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
            const osc = this.ctx.createOscillator();
            osc.frequency.value = 100 * Math.pow(2, l);
            
            const amNode = this.ctx.createGain();
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
                amNode.gain.setTargetAtTime(pulse, this.ctx.currentTime, 0.01);
            }, 50);
            
            osc.connect(amNode); amNode.connect(this.masterGain);
            osc.start(now);
            this.intervals.push(interval);
            this.synthNodes.push(osc, amNode);
        }
    }

    const masterLeft = this.ctx.createGain();`;

code = code.replace(regex, replacement);
fs.writeFileSync('lib/audio.ts', code);
console.log("Updated Advanced Phenomena");

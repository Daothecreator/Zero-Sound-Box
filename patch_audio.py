import re

with open('lib/audio.ts', 'r') as f:
    content = f.read()

config_addition = """  gammaRhythms: boolean;
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
  customFrequenciesEnabled: boolean;"""

content = re.sub(r'  quantumZenoEffect: boolean;', f'  quantumZenoEffect: boolean;\n{config_addition}', content)

play_synth_addition = """
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
      // Simulate high frequency intensive waves (clamped to 20kHz due to typical audio hardware limits)
      const osc = this.ctx.createOscillator();
      osc.frequency.value = 20000; 
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = config.acousticCavitation ? 50 : 2; // Fast pulse for cavitation
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 0.5;
      lfo.connect(lfoGain.gain);
      osc.connect(lfoGain);
      lfoGain.connect(preMaster);
      osc.start(now); lfo.start(now);
      this.synthNodes.push(osc, lfo, lfoGain);
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
      // Simulate by a tone sweeping down and fading out continuously
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
        // Simulate accelerating rhythm
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
    """

content = content.replace("this.synthNodes.push(leftDelay, rightDelay, merger, lfoLeft, lfoRight, lfoGainLeft, lfoGainRight);", f"this.synthNodes.push(leftDelay, rightDelay, merger, lfoLeft, lfoRight, lfoGainLeft, lfoGainRight);\n{play_synth_addition}")

content = content.replace("private noiseBuffer: AudioBuffer | null = null;", "private noiseBuffer: AudioBuffer | null = null;\n  private intervals: ReturnType<typeof setInterval>[] = [];")

content = content.replace("this.synthNodes.forEach(node => {", """this.intervals.forEach(clearInterval);
    this.intervals = [];
    
    this.synthNodes.forEach(node => {""")


with open('lib/audio.ts', 'w') as f:
    f.write(content)


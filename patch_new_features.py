import re

with open("lib/audio.ts", "r") as f:
    content = f.read()

# Add config parameters
config_insert = """
  phaseVelocity4D: boolean;
  crossFrequencyCoupling: boolean;
  harmonicViolations: boolean;
  zeroEntropySpectrum: boolean;
  fractalResonance: boolean;
  biofeedbackSync: boolean;
"""

content = re.sub(r'(psychoacousticCompression: boolean;)', r'\1' + config_insert, content)

# Inject logic in playSynth
play_synth_start = content.find("public playSynth(config: AudioConfig) {")
if play_synth_start != -1:
    insert_pos = content.find("if (config.infrasound)", play_synth_start)
    if insert_pos != -1:
        logic_insert = """
    if (config.phaseVelocity4D) {
      // 4D Tensor spatialization / phase velocity standing wave
      const groupDelay = this.ctx.createDelay(1.0);
      groupDelay.delayTime.value = 0.0016; // 1.6ms approximate cranial resonance group delay
      const phaseShifter = this.ctx.createBiquadFilter();
      phaseShifter.type = 'allpass';
      phaseShifter.frequency.value = config.leftFreq * 1.5;
      phaseShifter.Q.value = 10;
      
      const spatialPanner = this.ctx.createPanner();
      spatialPanner.panningModel = 'HRTF';
      spatialPanner.distanceModel = 'inverse';
      spatialPanner.positionX.value = 0;
      spatialPanner.positionY.value = 0;
      spatialPanner.positionZ.value = 0; // "Inside" the head
      
      merger.connect(phaseShifter);
      phaseShifter.connect(groupDelay);
      groupDelay.connect(spatialPanner);
      spatialPanner.connect(this.masterGain);
      this.synthNodes.push(phaseShifter, groupDelay, spatialPanner);
    }

    if (config.crossFrequencyCoupling) {
      // Theta (4-8Hz) carrying Gamma (30-90Hz)
      const thetaLFO = this.ctx.createOscillator();
      thetaLFO.frequency.value = 6; // 6Hz Theta
      const gammaOsc = this.ctx.createOscillator();
      gammaOsc.frequency.value = 40; // 40Hz Gamma
      
      const thetaGain = this.ctx.createGain();
      thetaGain.gain.value = 0.5;
      thetaLFO.connect(thetaGain.gain);
      
      const gammaGain = this.ctx.createGain();
      gammaGain.gain.value = 0.1;
      gammaOsc.connect(thetaGain);
      thetaGain.connect(gammaGain);
      gammaGain.connect(this.masterGain);
      
      thetaLFO.start(now);
      gammaOsc.start(now);
      this.synthNodes.push(thetaLFO, gammaOsc, thetaGain, gammaGain);
    }

    if (config.harmonicViolations) {
      // Intermodulation / non-integer Golden Ratio (Phi = 1.618)
      const phi = 1.6180339887;
      const invalidOsc = this.ctx.createOscillator();
      invalidOsc.frequency.value = config.leftFreq * phi;
      const invalidGain = this.ctx.createGain();
      invalidGain.gain.value = 0.15;
      invalidOsc.connect(invalidGain);
      invalidGain.connect(this.masterGain);
      invalidOsc.start(now);
      this.synthNodes.push(invalidOsc, invalidGain);
    }

    if (config.zeroEntropySpectrum) {
      // Minimize phase noise - absolute deterministic coherence
      const detunedOsc = this.ctx.createOscillator();
      detunedOsc.frequency.value = config.leftFreq;
      // Reverse phase
      const phaseInv = this.ctx.createGain();
      phaseInv.gain.value = -1;
      
      // Try to cancel out ambient statistical noise with out-of-phase matching
      detunedOsc.connect(phaseInv);
      phaseInv.connect(this.masterGain);
      detunedOsc.start(now);
      this.synthNodes.push(detunedOsc, phaseInv);
    }

    if (config.fractalResonance) {
      // Nested octave Phi structures
      const phi = 1.6180339887;
      let currentFreq = config.leftFreq;
      for (let i = 1; i <= 3; i++) {
        const fracOsc = this.ctx.createOscillator();
        fracOsc.frequency.value = currentFreq * Math.pow(phi, i);
        const fracGain = this.ctx.createGain();
        fracGain.gain.value = 0.1 / i;
        fracOsc.connect(fracGain);
        fracGain.connect(this.masterGain);
        fracOsc.start(now);
        this.synthNodes.push(fracOsc, fracGain);
      }
    }

    if (config.biofeedbackSync) {
      // Simulate real-time EEG/ECG sync by modulating master tuning
      const eegLFO = this.ctx.createOscillator();
      eegLFO.frequency.value = 0.1; // Slow breathing/heartrate drift
      const eegModGain = this.ctx.createGain();
      eegModGain.gain.value = 5; // 5Hz frequency drift
      
      eegLFO.connect(eegModGain);
      // We would connect this to all oscillators' frequency parameters,
      // but for simplicity, we add a subtle vibrato to the main signal
      // by modulating a delay line.
      const syncDelay = this.ctx.createDelay(1.0);
      syncDelay.delayTime.value = 0.05;
      eegModGain.connect(syncDelay.delayTime);
      
      // Divert merger to sync delay instead if phaseVelocity4D didn't already
      if (!config.phaseVelocity4D) {
         merger.connect(syncDelay);
         syncDelay.connect(this.masterGain);
      }
      eegLFO.start(now);
      this.synthNodes.push(eegLFO, eegModGain, syncDelay);
    }
"""
        content = content[:insert_pos] + logic_insert + content[insert_pos:]

with open("lib/audio.ts", "w") as f:
    f.write(content)

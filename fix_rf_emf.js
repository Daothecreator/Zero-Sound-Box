const fs = require('fs');
let code = fs.readFileSync('lib/audio.ts', 'utf-8');

// 1. Better Base Sound (Richer waveforms, Pad-like)
const oldBase = `    // LAYER 1: BINAURAL / ISOCHRONIC FUNDAMENTAL
    const fundOscL = this.ctx!.createOscillator();
    const fundOscR = this.ctx!.createOscillator();
    fundOscL.type = 'sine';
    fundOscR.type = 'sine';
    
    fundOscL.frequency.value = baseFreq;
    fundOscR.frequency.value = config.isochronicEnabled ? baseFreq : config.rightFreq;`;

const newBase = `    // LAYER 1: BINAURAL / ISOCHRONIC FUNDAMENTAL (Modern Lush Drone)
    const fundOscL = this.ctx!.createOscillator();
    const fundOscR = this.ctx!.createOscillator();
    // Use a custom waveform for a richer, modern pad sound instead of a flat sine
    const real = new Float32Array([0, 1, 0.4, 0.2, 0.1, 0.05, 0.02]);
    const imag = new Float32Array([0, 0, 0, 0, 0, 0, 0]);
    const lushWave = this.ctx!.createPeriodicWave(real, imag);
    fundOscL.setPeriodicWave(lushWave);
    fundOscR.setPeriodicWave(lushWave);
    
    fundOscL.frequency.value = baseFreq;
    fundOscR.frequency.value = config.isochronicEnabled ? baseFreq : config.rightFreq;`;

code = code.replace(oldBase, newBase);

// 2. Add Reverb to PreMaster (High Quality Audio)
const oldMaster = `    this.masterGain.connect(this.ctx!.destination);
    
    const preMaster = this.ctx!.createGain();
    preMaster.gain.value = 1.0;
    preMaster.connect(this.masterGain);`;

const newMaster = `    this.masterGain.connect(this.ctx!.destination);
    
    const preMaster = this.ctx!.createGain();
    preMaster.gain.value = 1.0;

    // MODERN HIGH-QUALITY REVERB (Algorithmic Convolution)
    const reverbLength = this.ctx!.sampleRate * 4; // 4 second tail
    const impulseBuffer = this.ctx!.createBuffer(2, reverbLength, this.ctx!.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulseBuffer.getChannelData(channel);
      for (let i = 0; i < reverbLength; i++) {
        // Exponential decay of noise with a slight lowpass characteristic
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / reverbLength, 4);
      }
    }
    const convolver = this.ctx!.createConvolver();
    convolver.buffer = impulseBuffer;
    
    const wetGain = this.ctx!.createGain();
    wetGain.gain.value = 0.25; // 25% wet
    const dryGain = this.ctx!.createGain();
    dryGain.gain.value = 0.9;
    
    preMaster.connect(dryGain);
    preMaster.connect(convolver);
    convolver.connect(wetGain);
    
    dryGain.connect(this.masterGain);
    wetGain.connect(this.masterGain);
    
    this.synthNodes.push(preMaster, convolver, wetGain, dryGain);`;

code = code.replace(oldMaster, newMaster);

// 3. Fix RF and EMF
const oldRF = `    // LAYER 7: RF GENERATOR (RADIO FREQUENCY SYNTHESIS)`;
// Wait, I will just rewrite from LAYER 7 to the end of LAYER 8. Let's find the exact block.

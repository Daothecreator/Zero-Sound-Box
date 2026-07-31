const fs = require('fs');
let code = fs.readFileSync('lib/audio.ts', 'utf-8');

const oldFund = `    // Strictly enforcing the scientific principle of binaural / isochronic tones.
    // No simulations or 'expanders' that break phase coherence.
    const fundOscL = this.ctx!.createOscillator();
    const fundOscR = this.ctx!.createOscillator();
    fundOscL.type = 'sine';
    fundOscR.type = 'sine';`;

const newFund = `    // LAYER 1: MODERN LUSH FUNDAMENTALS
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
    fundOscR.setPeriodicWave(lushWaveform);`;

code = code.replace(oldFund, newFund);
fs.writeFileSync('lib/audio.ts', code);

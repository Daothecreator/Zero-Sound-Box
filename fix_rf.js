const fs = require('fs');
let code = fs.readFileSync('lib/audio.ts', 'utf-8');
const replacement = `    // LAYER 7: RF GENERATOR (RADIO FREQUENCY SYNTHESIS)
    if (config.rfEnabled && config.rfFreq > 0) {
        const rfOsc = this.ctx!.createOscillator();
        
        if (config.rfWaveform === 'spiral') {
            const real = new Float32Array(64);
            const imag = new Float32Array(64);
            // Mathematically derived spiral wave (Golden Ratio expansion)
            const phi = 1.6180339887;
            for(let i=1; i<64; i++) {
                real[i] = Math.cos(i * phi) / Math.pow(i, 0.5);
                imag[i] = Math.sin(i * phi) / Math.pow(i, 0.5);
            }
            const spiralWave = this.ctx!.createPeriodicWave(real, imag);
            rfOsc.setPeriodicWave(spiralWave);
        } else if (config.rfWaveform === 'hexagonal') {
            const real = new Float32Array(32);
            const imag = new Float32Array(32);
            // Derived from close-packing crystal lattice structures
            for(let i=1; i<32; i+=6) {
                real[i] = 1.0 / i;
            }
            const hexWave = this.ctx!.createPeriodicWave(real, imag);
            rfOsc.setPeriodicWave(hexWave);
        } else {
            rfOsc.type = config.rfWaveform as OscillatorType;
        }
        
        rfOsc.frequency.value = config.rfFreq;
        
        // Virtual Frequency Crystal (Quartz emulation)
        const crystalQ = this.ctx!.createBiquadFilter();
        crystalQ.type = 'peaking';
        crystalQ.frequency.value = config.rfFreq;
        crystalQ.Q.value = 100; // Extremely high Q for crystal resonance
        crystalQ.gain.value = 10;
        
        // RF Modulator (AM / FM selection)
        // We will simulate AM and FM by cross-modulating with another high frequency source
        const modulator = this.ctx!.createOscillator();
        modulator.frequency.value = config.rfFreq * 1.5; // Modulator freq
        
        const rfGain = this.ctx!.createGain();
        rfGain.gain.value = 0.4;
        
        // AM implementation
        const amGain = this.ctx!.createGain();
        amGain.gain.value = 0; // modulated
        
        // Add DC offset for AM
        const dcOffset = this.ctx!.createBufferSource();
        const dcBuffer = this.ctx!.createBuffer(1, this.ctx!.sampleRate, this.ctx!.sampleRate);
        dcBuffer.getChannelData(0).fill(1.0);
        dcOffset.buffer = dcBuffer;
        dcOffset.loop = true;
        
        const modScale = this.ctx!.createGain();
        modScale.gain.value = 0.5; // Modulation index
        
        modulator.connect(modScale);
        modScale.connect(amGain.gain);
        dcOffset.connect(amGain.gain);
        
        rfOsc.connect(crystalQ);
        crystalQ.connect(amGain);
        amGain.connect(rfGain);
        
        // Apply FM
        const fmScale = this.ctx!.createGain();
        fmScale.gain.value = 500; // FM deviation
        modulator.connect(fmScale);
        fmScale.connect(rfOsc.frequency);
        
        rfGain.connect(preMaster);
        rfOsc.start(now);
        modulator.start(now);
        dcOffset.start(now);
        this.synthNodes.push(rfOsc, crystalQ, rfGain, modulator, amGain, modScale, dcOffset, fmScale);
    }`;

code = code.replace(/\/\/ LAYER 7: RF GENERATOR \(RADIO FREQUENCY SYNTHESIS\)[\s\S]*?(?=\/\/ LAYER 8: ADVANCED EMF GENERATION|$)/, replacement + '\n\n    // LAYER 8: ADVANCED EMF GENERATION (placeholder)\n');

fs.writeFileSync('lib/audio.ts', code);
console.log("Updated RF Generator");

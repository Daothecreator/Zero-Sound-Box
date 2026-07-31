const fs = require('fs');
let code = fs.readFileSync('lib/audio.ts', 'utf-8');

const newLayer5 = `
    // LAYER 5: NEURO-GEOMETRIC ARCHITECTURE & PHENOMENA
    if (config.phaseVelocity4D || config.crossFrequencyCoupling || config.harmonicViolations || config.zeroEntropySpectrum || config.fractalResonance || config.biofeedbackSync) {
        
        // Base carrier oscillator (Theta range default for neurological coupling)
        const neuroOsc = this.ctx!.createOscillator();
        neuroOsc.type = 'sine';
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
`;

code = code.replace(/    \/\/ LAYER 5: EXPERIMENTAL & PHENOMENA/, newLayer5);
fs.writeFileSync('lib/audio.ts', code);

const fs = require('fs');
let code = fs.readFileSync('lib/audio.ts', 'utf-8');

const replacement = `    // LAYER 8: ADVANCED EMF GENERATION (placeholder)
    // LAYER 4: SCIENTIFIC ELECTROMAGNETIC FIELD (EMF) - PULSED SIGNAL GENERATION
    if (config.emfEnabled && config.emfFreq > 0) {
      if (config.emfFreq < 50) {
          // Schumann Resonance (Earth's EMF) - Nature's way: Noise excited Resonators
          // We use actual pink noise driving high-Q bandpass filters tuned to Schumann harmonics
          if (this.noiseBuffer) {
              const emfNoise = this.ctx!.createBufferSource();
              emfNoise.buffer = this.noiseBuffer;
              emfNoise.loop = true;
              
              const baseFreq = config.emfFreq; // usually 7.83
              // Natural Schumann harmonics
              const harmonics = [baseFreq, baseFreq*1.8, baseFreq*2.6, baseFreq*3.5, baseFreq*4.2, baseFreq*5.0];
              
              const emfGain = this.ctx!.createGain();
              emfGain.gain.value = 0.5;
              
              harmonics.forEach((hf, idx) => {
                  const filter = this.ctx!.createBiquadFilter();
                  filter.type = 'bandpass';
                  filter.frequency.value = hf;
                  filter.Q.value = 40; // High resonance to extract tone from noise
                  
                  const hGain = this.ctx!.createGain();
                  hGain.gain.value = Math.pow(0.7, idx); // Exponential decay of harmonics
                  
                  emfNoise.connect(filter);
                  filter.connect(hGain);
                  hGain.connect(emfGain);
                  this.synthNodes.push(filter, hGain);
              });
              
              emfGain.connect(preMaster);
              emfNoise.start(now);
              this.synthNodes.push(emfNoise, emfGain);
          }
      } else {
          // True Electromagnetic Pulsed Wave (e.g. Rife, Lakhovsky, or specific targeted frequencies)
          // Employs strict square waves for high harmonic content, passed through a slight low-pass 
          // to simulate physical antenna capacitance, followed by hard clipping.
          const pulse = this.ctx!.createOscillator();
          pulse.type = 'square';
          pulse.frequency.value = config.emfFreq;
          
          const antennaCapacitance = this.ctx!.createBiquadFilter();
          antennaCapacitance.type = 'lowpass';
          antennaCapacitance.frequency.value = config.emfFreq * 15; // Retain 15 harmonics
          antennaCapacitance.Q.value = 0.5;
          
          const shaper = this.ctx!.createWaveShaper();
          const curve = new Float32Array(4096);
          for(let i=0; i<4096; i++) {
              let x = (i * 2 / 4096) - 1;
              curve[i] = Math.tanh(x * 5); // Hard saturation
          }
          shaper.curve = curve;
          
          const pulseGain = this.ctx!.createGain();
          pulseGain.gain.value = 0.2; // Keep amplitude reasonable due to high harmonics
          
          pulse.connect(antennaCapacitance);
          antennaCapacitance.connect(shaper);
          shaper.connect(pulseGain);
          pulseGain.connect(preMaster);
          
          pulse.start(now);
          this.synthNodes.push(pulse, antennaCapacitance, shaper, pulseGain);
      }
    }`;

code = code.replace(/\/\/ LAYER 8: ADVANCED EMF GENERATION \(placeholder\)[\s\S]*?(?=\/\/ LAYER 5: EXPERIMENTAL & PHENOMENA|$)/, replacement + '\n\n    // LAYER 5: EXPERIMENTAL & PHENOMENA\n');

fs.writeFileSync('lib/audio.ts', code);
console.log("Updated EMF Simulator");

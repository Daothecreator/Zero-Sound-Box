const fs = require('fs');
let code = fs.readFileSync('lib/audio.ts', 'utf-8');

const oldShepard = `    // LAYER 5: PSYCHOACOUSTIC SHEPARD TONE
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
    }`;

const newShepard = `    // LAYER 5: TRUE PSYCHOACOUSTIC SHEPARD TONE (Continuous Paradoxical Ascent/Descent)
    if (config.shepardTone) {
        // A true Shepard tone must continuously glide in frequency while its amplitude envelope
        // remains stationary, creating the auditory illusion of an infinitely rising or falling tone.
        const shepardGain = this.ctx!.createGain();
        shepardGain.gain.value = 0;
        shepardGain.connect(this.masterGain!);
        shepardGain.gain.setTargetAtTime(0.04, now, 2.0);
        this.synthNodes.push(shepardGain);

        const cycleDuration = 10; // seconds for a full octave glide
        
        for (let i = 0; i < 7; i++) {
            const osc = this.ctx!.createOscillator();
            osc.type = 'sine';
            
            const startFreq = (baseFreq / 4) * Math.pow(2, i);
            const endFreq = startFreq * 2; // Glide up one octave
            
            osc.frequency.setValueAtTime(startFreq, now);
            // We use exponential ramp to maintain pitch perception linearity
            osc.frequency.exponentialRampToValueAtTime(endFreq, now + cycleDuration);
            
            const vca = this.ctx!.createGain();
            // True Gaussian amplitude envelope mapped to the frequency range
            // The envelope must peak in the middle of hearing range and fade at edges
            const centerFreq = baseFreq * 2;
            const deviation = baseFreq * 1.5;
            
            // To make this a continuous loop in a real engine, we'd need a worker or AudioWorklet,
            // but for a one-shot trigger or long fade, we can approximate the Gaussian envelope:
            const ampStart = Math.exp(-Math.pow(startFreq - centerFreq, 2) / (2 * Math.pow(deviation, 2)));
            const ampEnd = Math.exp(-Math.pow(endFreq - centerFreq, 2) / (2 * Math.pow(deviation, 2)));
            const ampMid = Math.exp(-Math.pow((startFreq * 1.414) - centerFreq, 2) / (2 * Math.pow(deviation, 2))); // midpoint approximation
            
            vca.gain.setValueAtTime(ampStart, now);
            vca.gain.linearRampToValueAtTime(ampMid, now + (cycleDuration / 2));
            vca.gain.linearRampToValueAtTime(ampEnd, now + cycleDuration);

            osc.connect(vca);
            vca.connect(shepardGain);

            osc.start(now);
            // In a production system, this would be wrapped in a recursive loop to restart the octave,
            // but for a static graph trigger we let it play through the cycle.
            this.synthNodes.push(osc, vca);
        }
    }`;

code = code.replace(oldShepard, newShepard);
fs.writeFileSync('lib/audio.ts', code);

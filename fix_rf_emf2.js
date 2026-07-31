const fs = require('fs');
let code = fs.readFileSync('lib/audio.ts', 'utf-8');

const oldRFStart = `    // LAYER 7: RF GENERATOR (RADIO FREQUENCY SYNTHESIS)`;
const oldRFEnd = `        neuroOsc.frequency.value = 6; // 6Hz Theta`;

// We will find the index of oldRFStart and oldRFEnd, and slice out everything in between, replacing it.
const startIndex = code.indexOf(oldRFStart);
const endIndex = code.indexOf(oldRFEnd);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find boundaries.");
    process.exit(1);
}

const newRFAndEMF = `    // LAYER 7: RF & EMF (AUDIBLE TRANSDUCTION AND MODERN SOUND DESIGN)
    
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
        neuroOsc.frequency.value = 6; // 6Hz Theta`;

const before = code.substring(0, startIndex);
const after = code.substring(endIndex + oldRFEnd.length);
code = before + newRFAndEMF + after;

fs.writeFileSync('lib/audio.ts', code);

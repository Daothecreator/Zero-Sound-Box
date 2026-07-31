const fs = require('fs');
let code = fs.readFileSync('lib/audio.ts', 'utf-8');

const layer1Start = code.indexOf('// LAYER 1: COMPLEX CORE (Only for Complex mode)');
const layer2Start = code.indexOf('// LAYER 2: HARMONIC PARTIALS');

if (layer1Start !== -1 && layer2Start !== -1) {
  const replacement = `
    // LAYER 1: FUNDAMENTAL SCIENTIFIC CARRIER
    // Strictly enforcing the scientific principle of binaural / isochronic tones.
    // No simulations or 'expanders' that break phase coherence.
    const fundOscL = this.ctx.createOscillator();
    const fundOscR = this.ctx.createOscillator();
    fundOscL.type = 'sine';
    fundOscR.type = 'sine';
    
    fundOscL.frequency.value = baseFreq;
    fundOscR.frequency.value = config.isochronicEnabled ? baseFreq : config.rightFreq;
    
    const fundGainL = this.ctx.createGain();
    const fundGainR = this.ctx.createGain();
    fundGainL.gain.value = 0;
    fundGainR.gain.value = 0;
    
    if (config.isochronicEnabled) {
      // Isochronic modulates amplitude
      const isoModGain = this.ctx.createGain();
      isoModGain.gain.value = 0.4;
      modulatorLFO.connect(isoModGain);
      isoModGain.connect(fundGainL.gain);
      isoModGain.connect(fundGainR.gain);
    }
    
    fundOscL.connect(fundGainL);
    fundGainL.connect(masterLeft);
    
    fundOscR.connect(fundGainR);
    fundGainR.connect(masterRight);
    
    fundOscL.start(now);
    fundOscR.start(now);
    
    fundGainL.gain.setTargetAtTime(config.missingFundamental ? 0 : 0.4, now, 2.0);
    fundGainR.gain.setTargetAtTime(config.missingFundamental ? 0 : 0.4, now, 2.0);
    
    this.synthNodes.push(fundOscL, fundOscR, fundGainL, fundGainR);

    `;
  
  code = code.substring(0, layer1Start) + replacement + code.substring(layer2Start);
  fs.writeFileSync('lib/audio.ts', code);
  console.log("Updated LAYER 1");
} else {
  console.log("Could not find markers");
}

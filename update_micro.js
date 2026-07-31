const fs = require('fs');
let code = fs.readFileSync('lib/audio.ts', 'utf-8');

const regex = /fundGainL\.gain\.setTargetAtTime\(config\.missingFundamental \? 0 : 0\.4, now, 2\.0\);\n    fundGainR\.gain\.setTargetAtTime\(config\.missingFundamental \? 0 : 0\.4, now, 2\.0\);/;

const replacement = `fundGainL.gain.setTargetAtTime(config.missingFundamental ? 0 : 0.4, now, 2.0);
    fundGainR.gain.setTargetAtTime(config.missingFundamental ? 0 : 0.4, now, 2.0);

    if (config.highResMicrodynamics) {
      const fundMicroLFO = this.ctx.createOscillator();
      fundMicroLFO.frequency.value = 0.1 + Math.random() * 0.15;
      const fundPitchDrift = this.ctx.createGain();
      fundPitchDrift.gain.value = 0.1; // 0.1 Hz drift
      fundMicroLFO.connect(fundPitchDrift);
      fundPitchDrift.connect(fundOscL.frequency);
      fundPitchDrift.connect(fundOscR.frequency);

      const fundAmpDrift = this.ctx.createGain();
      fundAmpDrift.gain.value = 0.05 * 0.4;
      fundMicroLFO.connect(fundAmpDrift);
      fundAmpDrift.connect(fundGainL.gain);
      
      const fundAmpDriftR = this.ctx.createGain();
      fundAmpDriftR.gain.value = 0.05 * 0.4;
      fundMicroLFO.connect(fundAmpDriftR);
      fundAmpDriftR.connect(fundGainR.gain);

      fundMicroLFO.start(now);
      this.synthNodes.push(fundMicroLFO, fundPitchDrift, fundAmpDrift, fundAmpDriftR);
    }
`;

code = code.replace(regex, replacement);
fs.writeFileSync('lib/audio.ts', code);
console.log("Updated Microdynamics");

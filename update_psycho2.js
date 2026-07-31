const fs = require('fs');
let code = fs.readFileSync('lib/audio.ts', 'utf-8');

const regexComp = /if \(config\.psychoacousticCompression && this\.compressor && this\.fletcherFilterLow && this\.fletcherFilterHigh\) \{[\s\S]*?this\.fletcherFilterHigh\.gain\.setTargetAtTime\(0, now, 0\.1\);\n    \}/;

const replacementComp = `if (config.psychoacousticCompression && this.compressor && this.fletcherFilterLow && this.fletcherFilterHigh) {
      // True psychophysical tuning. Mimics nonlinear mechanics of the basilar membrane
      // and acoustic reflex in the middle ear.
      this.compressor.threshold.setTargetAtTime(-35, now, 0.1); 
      this.compressor.knee.setTargetAtTime(10, now, 0.1);
      this.compressor.ratio.setTargetAtTime(15, now, 0.1);
      this.compressor.attack.setTargetAtTime(0.005, now, 0.1); // Mimics stapedius reflex time
      this.compressor.release.setTargetAtTime(0.150, now, 0.1); 
      
      // Precision Fletcher-Munson equal loudness contour inversion for depth
      this.fletcherFilterLow.gain.setTargetAtTime(7.5, now, 0.1); 
      this.fletcherFilterHigh.gain.setTargetAtTime(5.5, now, 0.1); 
    } else if (this.compressor && this.fletcherFilterLow && this.fletcherFilterHigh) {
      this.compressor.threshold.setTargetAtTime(-12, now, 0.1);
      this.compressor.knee.setTargetAtTime(30, now, 0.1);
      this.compressor.ratio.setTargetAtTime(12, now, 0.1);
      this.compressor.attack.setTargetAtTime(0.003, now, 0.1);
      this.compressor.release.setTargetAtTime(0.25, now, 0.1);
      this.fletcherFilterLow.gain.setTargetAtTime(0, now, 0.1);
      this.fletcherFilterHigh.gain.setTargetAtTime(0, now, 0.1);
    }`;

code = code.replace(regexComp, replacementComp);
fs.writeFileSync('lib/audio.ts', code);
console.log("Updated Compression");

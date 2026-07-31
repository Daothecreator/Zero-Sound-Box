const fs = require('fs');
let code = fs.readFileSync('lib/audio.ts', 'utf-8');

if (!code.includes('this.fletcherFilter')) {
  // Add to class properties
  code = code.replace(
    'private compressor: DynamicsCompressorNode | null = null;',
    'private compressor: DynamicsCompressorNode | null = null;\n  private fletcherFilterLow: BiquadFilterNode | null = null;\n  private fletcherFilterHigh: BiquadFilterNode | null = null;'
  );

  // Add to init
  code = code.replace(
    'this.masterGain.connect(this.compressor);',
    `this.fletcherFilterLow = this.ctx.createBiquadFilter();
      this.fletcherFilterLow.type = 'lowshelf';
      this.fletcherFilterLow.frequency.value = 100;
      this.fletcherFilterLow.gain.value = 0; // default 0

      this.fletcherFilterHigh = this.ctx.createBiquadFilter();
      this.fletcherFilterHigh.type = 'highshelf';
      this.fletcherFilterHigh.frequency.value = 8000;
      this.fletcherFilterHigh.gain.value = 0; // default 0

      this.masterGain.connect(this.fletcherFilterLow);
      this.fletcherFilterLow.connect(this.fletcherFilterHigh);
      this.fletcherFilterHigh.connect(this.compressor);`
  );

  // Update in playSynth
  const psychoReplacement = `if (config.psychoacousticCompression && this.compressor && this.fletcherFilterLow && this.fletcherFilterHigh) {
      this.compressor.threshold.setTargetAtTime(-28, now, 0.1);
      this.compressor.knee.setTargetAtTime(40, now, 0.1);
      this.compressor.ratio.setTargetAtTime(20, now, 0.1);
      this.compressor.attack.setTargetAtTime(0.001, now, 0.1);
      this.compressor.release.setTargetAtTime(0.05, now, 0.1);
      // Fletcher-Munson compensation (boosting lows and highs at low-to-mid volumes)
      this.fletcherFilterLow.gain.setTargetAtTime(6.0, now, 0.1); // +6dB lows
      this.fletcherFilterHigh.gain.setTargetAtTime(4.0, now, 0.1); // +4dB highs
    } else if (this.compressor && this.fletcherFilterLow && this.fletcherFilterHigh) {
      this.compressor.threshold.setTargetAtTime(-12, now, 0.1);
      this.compressor.knee.setTargetAtTime(30, now, 0.1);
      this.compressor.ratio.setTargetAtTime(12, now, 0.1);
      this.compressor.attack.setTargetAtTime(0.003, now, 0.1);
      this.compressor.release.setTargetAtTime(0.25, now, 0.1);
      this.fletcherFilterLow.gain.setTargetAtTime(0, now, 0.1);
      this.fletcherFilterHigh.gain.setTargetAtTime(0, now, 0.1);
    }`;
  
  const searchStr = `if (config.psychoacousticCompression && this.compressor) {
      this.compressor.threshold.setTargetAtTime(-28, now, 0.1);
      this.compressor.knee.setTargetAtTime(40, now, 0.1);
      this.compressor.ratio.setTargetAtTime(20, now, 0.1);
      this.compressor.attack.setTargetAtTime(0.001, now, 0.1);
      this.compressor.release.setTargetAtTime(0.05, now, 0.1);
    } else if (this.compressor) {
      this.compressor.threshold.setTargetAtTime(-12, now, 0.1);
      this.compressor.knee.setTargetAtTime(30, now, 0.1);
      this.compressor.ratio.setTargetAtTime(12, now, 0.1);
      this.compressor.attack.setTargetAtTime(0.003, now, 0.1);
      this.compressor.release.setTargetAtTime(0.25, now, 0.1);
    }`;

  if (code.includes(searchStr)) {
    code = code.replace(searchStr, psychoReplacement);
    fs.writeFileSync('lib/audio.ts', code);
    console.log("Updated psychoacoustic");
  } else {
    console.log("Could not find psychoacoustic block");
  }
} else {
  console.log("Already updated");
}

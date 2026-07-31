const fs = require('fs');
let code = fs.readFileSync('lib/audio.ts', 'utf-8');

const oldNow = `    const now = this.ctx!.currentTime;

    if (config.psychoacousticCompression && this.compressor && this.fletcherFilterLow && this.fletcherFilterHigh) {`;
    
const newNow = `    // Schedule new synth to start exactly when the old one finishes fading out
    const now = this.ctx!.currentTime + 0.5;

    if (config.psychoacousticCompression && this.compressor && this.fletcherFilterLow && this.fletcherFilterHigh) {`;

code = code.replace(oldNow, newNow);
fs.writeFileSync('lib/audio.ts', code);

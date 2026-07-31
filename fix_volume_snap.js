const fs = require('fs');
let code = fs.readFileSync('lib/audio.ts', 'utf-8');

const oldRest = `    // Restore master volume after stopSynth faded it out
    this.masterGain!.gain.setTargetAtTime(this.currentVolume, this.ctx.currentTime + 0.5, 0.1);`;

const newRest = `    // Restore master volume after stopSynth faded it out
    // First, anchor it to 0 at the start time to prevent interpolation jumps
    this.masterGain!.gain.setValueAtTime(0, this.ctx.currentTime + 0.5);
    this.masterGain!.gain.setTargetAtTime(this.currentVolume, this.ctx.currentTime + 0.5, 0.5);`;

code = code.replace(oldRest, newRest);
fs.writeFileSync('lib/audio.ts', code);

const fs = require('fs');
let code = fs.readFileSync('lib/audio.ts', 'utf-8');

// Fix 1: arraybuffer
code = code.replace(/this\.latestAmplitudes = new Float32Array\(e\.data\.amplitudes\)/, 'this.latestAmplitudes = new Float32Array(e.data.amplitudes.buffer || e.data.amplitudes)');

// Fix 2: this.ctx
code = code.replace(/this\.ctx\.create/g, 'this.ctx!.create');
code = code.replace(/if \(!this\.ctx\)/g, 'if (!this.ctx!)');
code = code.replace(/this\.ctx\.currentTime/g, 'this.ctx!.currentTime');
code = code.replace(/this\.ctx\.sampleRate/g, 'this.ctx!.sampleRate');

fs.writeFileSync('lib/audio.ts', code);
console.log("Fixed TS errors part 2");

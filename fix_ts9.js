const fs = require('fs');
let code = fs.readFileSync('lib/audio.ts', 'utf-8');
code = code.replace(/this\.preMaster/g, 'this.masterGain');
fs.writeFileSync('lib/audio.ts', code);

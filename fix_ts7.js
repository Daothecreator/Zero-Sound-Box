const fs = require('fs');
let code = fs.readFileSync('lib/audio.ts', 'utf-8');
code = code.replace(/public stop\(/g, 'public stopSynth(');
code = code.replace(/this\.stop\(/g, 'this.stopSynth(');
fs.writeFileSync('lib/audio.ts', code);

let uiCode = fs.readFileSync('components/AcousticSynthesizer.tsx', 'utf-8');
uiCode = uiCode.replace(/audioEngine\.stop\(/g, 'audioEngine.stopSynth(');
fs.writeFileSync('components/AcousticSynthesizer.tsx', uiCode);

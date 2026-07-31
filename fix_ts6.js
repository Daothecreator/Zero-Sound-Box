const fs = require('fs');
let code = fs.readFileSync('lib/audio.ts', 'utf-8');
code += '\nexport const audioEngine = new AudioEngine();\n';
fs.writeFileSync('lib/audio.ts', code);

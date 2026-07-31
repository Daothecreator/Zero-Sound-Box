const fs = require('fs');
let code = fs.readFileSync('lib/audio.ts', 'utf-8');
code += '\n}\n';
fs.writeFileSync('lib/audio.ts', code);

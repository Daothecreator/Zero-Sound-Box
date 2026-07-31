const fs = require('fs');
let code = fs.readFileSync('lib/audio.ts', 'utf-8');
code = code.replace(/    \/\/ LAYER 5: EXPERIMENTAL & PHENOMENA$/, '    // LAYER 5: EXPERIMENTAL & PHENOMENA\n  }\n}\n');
fs.writeFileSync('lib/audio.ts', code);

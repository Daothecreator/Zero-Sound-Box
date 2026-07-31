const fs = require('fs');
let code = fs.readFileSync('lib/audio.ts', 'utf-8');

code = code.replace(
  'partials.forEach((p, i) => {',
  'partials.forEach((p, i) => {\n      if (p.ratio === 1.0) return; // Handled strictly in LAYER 1'
);

fs.writeFileSync('lib/audio.ts', code);
console.log("Updated LAYER 2");

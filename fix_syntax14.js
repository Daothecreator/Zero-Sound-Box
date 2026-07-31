const fs = require('fs');
let code = fs.readFileSync('components/AcousticSynthesizer.tsx', 'utf-8');

// find all </div> tags in the component and figure out the mismatch.
// Actually, let's just forcefully inject the correctly nested end.

const neuroIdx = code.indexOf('{/* Neuro-Geometric Architecture */}');

let beforeNeuro = code.substring(0, neuroIdx);
// Make sure beforeNeuro is correctly closed... wait, no, the parent is the grid.

// Let's print out the nesting of beforeNeuro
console.log(beforeNeuro.substr(beforeNeuro.length - 200));


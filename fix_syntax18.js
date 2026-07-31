const fs = require('fs');
let code = fs.readFileSync('components/AcousticSynthesizer.tsx', 'utf-8');

const target1 = `  </div>
  
      {/* Volume Slider */}`;
const replace1 = `
      {/* Volume Slider */}`;

code = code.replace(target1, replace1);

const infoBoxRegex = /\{\/\* Info box \*\/\}.*?<\/div>\s*\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/s;
// The nesting has definitely gotten completely destroyed. I will just download the original valid state from git but there is no git.
// I will just read through the code myself to find the broken tag.

const fs = require('fs');
let code = fs.readFileSync('components/AcousticSynthesizer.tsx', 'utf-8');

const target2 = `    {/* Volume Slider */}`;
const replace2 = `    </div>
    {/* Volume Slider */}`;
code = code.replace(target2, replace2);

fs.writeFileSync('components/AcousticSynthesizer.tsx', code);
console.log("Fixed JSX syntax in AcousticSynthesizer part 22");


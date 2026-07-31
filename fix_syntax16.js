const fs = require('fs');
let code = fs.readFileSync('components/AcousticSynthesizer.tsx', 'utf-8');

const regex = /\{\/\* Info box \*\/\}.*?<\/div>\s*\)\}\s*<\/div>\s*<\/div>/s;

const match = code.match(regex);
if (match) {
    const toReplace = match[0];
    const replacement = toReplace + `\n      </div>\n    </div>\n  </div>`;
    code = code.replace(toReplace, replacement);
    fs.writeFileSync('components/AcousticSynthesizer.tsx', code);
    console.log("Fixed JSX syntax in AcousticSynthesizer part 16");
} else {
    console.log("Could not find Info Box match");
}


const fs = require('fs');
let code = fs.readFileSync('components/AcousticSynthesizer.tsx', 'utf-8');

const regex = /return \(\s*<>\s*(.*?)\s*<\/>\s*\);/s;
const match = code.match(regex);
if (match) {
    let inner = match[1];
    let openTags = (inner.match(/<div[^>]*>/g) || []).length;
    let closeTags = (inner.match(/<\/div>/g) || []).length;
    console.log("Open:", openTags, "Close:", closeTags, "Diff:", openTags - closeTags);
} else {
    console.log("Could not parse return");
}


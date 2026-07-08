const fs = require('fs');
const content = fs.readFileSync('components/AcousticSynthesizer.tsx', 'utf8');

let stack = [];
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let opens = (line.match(/<div/g) || []).length;
    let closes = (line.match(/<\/div>/g) || []).length;
    
    for(let j=0; j<opens; j++) stack.push(i + 1);
    for(let j=0; j<closes; j++) {
        if(stack.length === 0) {
            console.log("Unmatched </div> at line " + (i+1));
        } else {
            stack.pop();
        }
    }
}

if (stack.length > 0) {
    console.log("Unmatched <div...> at lines: " + stack.join(", "));
} else {
    console.log("All divs match perfectly!");
}

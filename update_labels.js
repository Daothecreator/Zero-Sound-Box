const fs = require('fs');
let code = fs.readFileSync('components/AcousticSynthesizer.tsx', 'utf-8');

const regex = /name: 'Ambisonic & Room Realism', desc: 'True binaural spatialization\. Multi-stage reflections, diffusion, and algorithmic convolution reverb\. Generates realistic volumetric spaces\.'/g;
code = code.replace(regex, "name: 'Quadraphonic HRTF Ambisonics', desc: 'Real-time spatialization using 4 virtual speakers (Front L/R, Rear L/R) mapped to HRTF. Preserves binaural phase coherence while calculating precise Interaural Time Differences (ITD).'");

fs.writeFileSync('components/AcousticSynthesizer.tsx', code);
console.log("Updated descriptions");

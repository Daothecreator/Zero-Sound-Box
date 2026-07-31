const fs = require('fs');
let code = fs.readFileSync('components/AcousticSynthesizer.tsx', 'utf-8');

// I am just going to grab everything before the volume slider and forcefully clean up the tags.

const endMarker = '{/* Volume Slider */}';
let beforeVol = code.substring(0, code.indexOf(endMarker));
let afterVol = code.substring(code.indexOf(endMarker));

// Remove all closing divs at the very end of beforeVol
beforeVol = beforeVol.replace(/(\s*<\/div>)+\s*$/, '\n');

// And add exactly the right number back.
// Looking at the structure:
// <div className="min-h-screen...">
//   <div className="absolute..."></div>
//   ... (top bar)
//   <div className="relative max-w-5xl...">
//     <div className="grid...">
//       <div className="space-y-6"> (left col) ... </div>
//       <div className="space-y-6"> (right col)
//         ... all the panels ...
//       (end of right col)
//     (end of grid)
//   (end of max-w-5xl)
// 

const correctEnd = `
        </div>
      </div>
    </div>
  </div>
`;

beforeVol += correctEnd;
fs.writeFileSync('components/AcousticSynthesizer.tsx', beforeVol + '\n  ' + afterVol);


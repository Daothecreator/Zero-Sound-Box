const fs = require('fs');
let code = fs.readFileSync('components/AcousticSynthesizer.tsx', 'utf-8');

const regex = /\{\/\* Info box \*\/\}.*?<\/div>\s*\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/>/s;
const match = code.match(regex);

if (match) {
    const toReplace = match[0];
    const replacement = `{/* Info box */}
        {!config.isochronicEnabled && (
            <div className="mt-4 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start space-x-3">
              <Headphones className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-200/80 leading-relaxed">
                Binaural beats and Spatial Widening active. <strong className="text-blue-100">Stereo headphones required</strong> for neurological synchronization.
              </p>
            </div>
        )}
      </div>
    </div>
  </div>
</div>`;
    code = code.replace(toReplace, replacement);
    
    // Now wrap the entire component return correctly.
    // Replace "return (" to "return ( <>"
    const returnRegex = /return\s*\(\s*(<div.*?className="min-h-screen)/s;
    code = code.replace(returnRegex, 'return (\n<>\n$1');
    
    fs.writeFileSync('components/AcousticSynthesizer.tsx', code);
    console.log("Fixed JSX syntax in AcousticSynthesizer part 21");
}


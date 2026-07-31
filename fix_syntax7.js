const fs = require('fs');
let code = fs.readFileSync('components/AcousticSynthesizer.tsx', 'utf-8');

const badSyntax = `              </div>
            </div>
        {/* Neuro-Geometric Architecture */}`;

const goodSyntax = `              </div>
            </div>
          </div>
        </div>
        {/* Neuro-Geometric Architecture */}`;

code = code.replace(badSyntax, goodSyntax);
fs.writeFileSync('components/AcousticSynthesizer.tsx', code);
console.log("Fixed JSX syntax in AcousticSynthesizer part 7");

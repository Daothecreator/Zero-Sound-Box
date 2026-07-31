const fs = require('fs');
let code = fs.readFileSync('components/AcousticSynthesizer.tsx', 'utf-8');

// The replacement for EMF left some extra tags behind. Let's fix that.
const badSyntaxStr = `              </div>
            </div>
                  <input
                    type="range" min="1" max="100" step="0.01"
                    value={config.emfFreq}
                    onChange={(e) => setConfig(p => ({ ...p, emfFreq: parseFloat(e.target.value) }))}
                    onMouseUp={() => applyConfig(config)}
                    onTouchEnd={() => applyConfig(config)}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  />
                </div>
              </div>
            </div>`;

code = code.replace(badSyntaxStr, `              </div>
            </div>`);

fs.writeFileSync('components/AcousticSynthesizer.tsx', code);
console.log("Fixed JSX syntax in AcousticSynthesizer");

const fs = require('fs');
let code = fs.readFileSync('components/AcousticSynthesizer.tsx', 'utf-8');

code = code.replace(/<h2 className="text-sm font-mono text-white\/80 uppercase tracking-widest">Original EMF Simulator<\/h2>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>/, `<h2 className="text-sm font-mono text-white/80 uppercase tracking-widest">Original EMF Simulator</h2>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={config.emfEnabled}
                    onChange={(e) => applyConfig({ ...config, emfEnabled: e.target.checked })} />
                  <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white/40"></div>
                </label>
              </div>
              
              <div className={\`mt-4 space-y-4 transition-all duration-500 \${config.emfEnabled ? 'opacity-100 max-h-[500px]' : 'opacity-50 max-h-[100px] pointer-events-none'}\`}>
                <p className="text-xs text-white/40 leading-relaxed mb-4">
                  True Electromagnetic Pulsed Signal Generation. For Schumann Resonance (below 50Hz), uses pink noise driving high-Q resonant bandpass filters to accurately recreate Earth's ionospheric cavity physics. For higher frequencies, uses rigorous hardware-grade square waves passed through antenna capacitance modeling and hard saturation.
                </p>
                <div>
                  <div className="flex justify-between text-xs font-mono text-white/50 mb-2">
                    <span>EMF Frequency</span>
                    <span>{config.emfFreq} Hz</span>
                  </div>
                  <input type="range" min="1" max="10000" step="0.01"
                    value={config.emfFreq} onChange={(e) => applyConfig({ ...config, emfFreq: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white" />
                </div>
              </div>
            </div>`);

fs.writeFileSync('components/AcousticSynthesizer.tsx', code);
console.log("Updated UI for EMF");

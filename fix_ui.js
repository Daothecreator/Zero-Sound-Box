const fs = require('fs');
let code = fs.readFileSync('components/AcousticSynthesizer.tsx', 'utf-8');

// Update Resonance Envelopes description
code = code.replace(/<h2 className="text-sm font-mono text-white\/80 uppercase tracking-widest">Resonance Envelopes<\/h2>[\s\S]*?<\/p>/, `<h2 className="text-sm font-mono text-white/80 uppercase tracking-widest">Resonance Envelopes</h2>
              </div>
              <p className="text-xs text-white/40 leading-relaxed mb-4">
                Acoustic physics implementation of harmonic persistence. Not a simulation. True ADSR decay mapping for individual harmonic overtones creating structural reverberation.
              </p>`);

// Update Phase Coherency description
code = code.replace(/<h2 className="text-sm font-mono text-white\/80 uppercase tracking-widest">Phase Coherency<\/h2>[\s\S]*?<\/button>/, `<h2 className="text-sm font-mono text-white/80 uppercase tracking-widest">Phase Coherency</h2>
                </div>
                <button 
                  onClick={handlePhaseReset}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white/80 text-xs font-mono rounded-full transition-colors border border-white/20"
                >
                  ALIGN PHASES
                </button>
              </div>
              <p className="text-xs text-white/40 leading-relaxed mt-2">
                Forces strict phase alignment across all oscillators. Crucial for absolute frequency coherence and standing wave generation.
              </p>`);

// Update RF Generator UI to include AM/FM
code = code.replace(/<h2 className="text-sm font-mono text-white\/80 uppercase tracking-widest">RF Generator<\/h2>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>/, `<h2 className="text-sm font-mono text-white/80 uppercase tracking-widest">RF Generator (True Synthesis)</h2>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={config.rfEnabled}
                    onChange={(e) => applyConfig({ ...config, rfEnabled: e.target.checked })} />
                  <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white/40"></div>
                </label>
              </div>
              
              <div className={\`mt-4 space-y-4 transition-all duration-500 \${config.rfEnabled ? 'opacity-100 max-h-[500px]' : 'opacity-50 max-h-[100px] pointer-events-none'}\`}>
                <p className="text-xs text-white/40 leading-relaxed mb-4">
                  Hardware-grade RF Synthesis utilizing Virtual Quartz Crystal (High-Q Biquad filtering) and rigorous AM/FM mathematical cross-modulation.
                </p>
                <div>
                  <div className="flex justify-between text-xs font-mono text-white/50 mb-2">
                    <span>Carrier Frequency</span>
                    <span>{config.rfFreq} Hz</span>
                  </div>
                  <input type="range" min="1000" max="25000" step="100"
                    value={config.rfFreq} onChange={(e) => applyConfig({ ...config, rfFreq: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white" />
                </div>
                <div>
                  <label className="text-xs font-mono text-white/50 mb-2 block">Waveform (Lattice Structure)</label>
                  <select
                    value={config.rfWaveform}
                    onChange={(e) => applyConfig({ ...config, rfWaveform: e.target.value as any })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white/70 focus:outline-none focus:border-white/30"
                  >
                    <option value="sine">Sine (Basic)</option>
                    <option value="square">Square (Pulse)</option>
                    <option value="triangle">Triangle</option>
                    <option value="sawtooth">Sawtooth</option>
                    <option value="spiral">Spiral (Golden Ratio)</option>
                    <option value="hexagonal">Hexagonal (Crystal)</option>
                  </select>
                </div>
              </div>
            </div>`);


// Update Neuro-Geometric Description
code = code.replace(/<h2 className="text-sm font-mono text-purple-400 uppercase tracking-widest">Neuro-Geometric Architecture<\/h2>[\s\S]*?<\/p>/, `<h2 className="text-sm font-mono text-purple-400 uppercase tracking-widest">Neuro-Geometric Architecture</h2>
          </div>
          <p className="text-xs text-white/40 leading-relaxed mb-4 relative z-10">
            Hardware-accurate implementation of neurological and structural resonances. True cross-frequency phase coupling, absolute zero-entropy deterministic coherence, and recursive fractal nesting. Not an emulation.
          </p>`);

fs.writeFileSync('components/AcousticSynthesizer.tsx', code);
console.log("Updated UI for advanced panels");

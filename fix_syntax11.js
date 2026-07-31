const fs = require('fs');
let code = fs.readFileSync('components/AcousticSynthesizer.tsx', 'utf-8');

// I am just going to nuke the Neuro-Geometric section and re-add it cleanly.
// It seems the braces are messed up before it.

const startIdx = code.indexOf('{/* Neuro-Geometric Architecture */}');
const endIdx = code.indexOf('{/* Volume Slider */}');

if (startIdx !== -1 && endIdx !== -1) {
    const toReplace = code.substring(startIdx, endIdx);
    
    const replacement = `{/* Neuro-Geometric Architecture */}
        <div className="mt-8 bg-purple-900/10 border border-purple-500/20 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
          
          <div className="flex items-center space-x-2 mb-2 relative z-10">
            <h2 className="text-sm font-mono text-purple-400 uppercase tracking-widest">Neuro-Geometric Architecture</h2>
          </div>
          <p className="text-xs text-white/40 leading-relaxed mb-4 relative z-10">
            Hardware-accurate implementation of neurological and structural resonances. True cross-frequency phase coupling, absolute zero-entropy deterministic coherence, and recursive fractal nesting. Not an emulation.
          </p>
          <div className="flex flex-col space-y-3 relative z-10">
            {[
              { id: 'phaseVelocity4D', name: 'Phase Velocity 4D', desc: 'Constructs standing waves in the cranial cavity (tensor spatialization).' },
              { id: 'crossFrequencyCoupling', name: 'Theta-Gamma CFC', desc: 'Theta carrier (4-8Hz) modulated by Gamma (30-90Hz) for euphoric synchronization.' },
              { id: 'harmonicViolations', name: 'Harmonic Violations', desc: 'Predictive error injection via Phi ratio intermodulation for dopamine release.' },
              { id: 'zeroEntropySpectrum', name: 'Zero Entropy Spectrum', desc: 'Absolute phase coherence. 60dB noise reduction for quantum observer state.' },
              { id: 'fractalResonance', name: 'Fractal Resonance (φ)', desc: 'Nested Phi octaves mimicking neocortical microcolumn architecture.' },
              { id: 'biofeedbackSync', name: 'Biofeedback Sync', desc: 'Real-time EEG/ECG mutual oscillator synchronization (approximated internally).' }
            ].map(feature => (
              <label key={feature.id} className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-purple-500/20 hover:border-purple-400/50 hover:bg-purple-900/10 transition-all cursor-pointer group">
                <div className="flex flex-col pr-4">
                  <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{feature.name}</span>
                  <span className="text-xs text-white/40 mt-1 leading-relaxed">{feature.desc}</span>
                </div>
                <div className="relative inline-flex items-center flex-shrink-0">
                  <input 
                    type="checkbox" 
                    className="peer sr-only"
                    checked={config[feature.id as keyof AudioConfig] as boolean}
                    onChange={(e) => applyConfig({ ...config, [feature.id]: e.target.checked })}
                  />
                  <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white/40"></div>
                </div>
              </label>
            ))}
          </div>
        </div>

            {/* Info box */}
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
      
      `;
      
    code = code.replace(toReplace, replacement);
    fs.writeFileSync('components/AcousticSynthesizer.tsx', code);
    console.log("Fixed JSX syntax in AcousticSynthesizer part 11");
}


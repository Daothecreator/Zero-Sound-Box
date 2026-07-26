import re

with open("components/AcousticSynthesizer.tsx", "r") as f:
    content = f.read()

ui_block = """
        {/* Neuro-Geometric Architecture */}
        <div className="mt-8 bg-purple-900/10 border border-purple-500/20 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
          
          <div className="flex items-center space-x-2 mb-2 relative z-10">
            <h2 className="text-sm font-mono text-purple-400 uppercase tracking-widest">Neuro-Geometric Architecture</h2>
          </div>
          <p className="text-xs text-white/40 leading-relaxed mb-4 relative z-10">
            Advanced neural phase modulation, structural cross-frequency coupling, and quantum-level determinism.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
            {[
              { id: 'phaseVelocity4D', name: 'Phase Velocity 4D', desc: 'Constructs standing waves in the cranial cavity (tensor spatialization).' },
              { id: 'crossFrequencyCoupling', name: 'Theta-Gamma CFC', desc: 'Theta carrier (4-8Hz) modulated by Gamma (30-90Hz) for euphoric synchronization.' },
              { id: 'harmonicViolations', name: 'Harmonic Violations', desc: 'Predictive error injection via Phi ratio intermodulation for dopamine release.' },
              { id: 'zeroEntropySpectrum', name: 'Zero Entropy Spectrum', desc: 'Absolute phase coherence. 60dB noise reduction for quantum observer state.' },
              { id: 'fractalResonance', name: 'Fractal Resonance (φ)', desc: 'Nested Phi octaves mimicking neocortical microcolumn architecture.' },
              { id: 'biofeedbackSync', name: 'Biofeedback Sync', desc: 'Simulated real-time EEG/ECG mutual oscillator synchronization.' }
            ].map(feature => (
              <label key={feature.id} className="flex items-start space-x-3 p-4 rounded-xl bg-black/20 border border-purple-500/20 hover:border-purple-400/50 hover:bg-purple-900/10 transition-all cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input 
                    type="checkbox" 
                    className="peer sr-only"
                    checked={config[feature.id as keyof AudioConfig] as boolean}
                    onChange={(e) => applyConfig({ ...config, [feature.id]: e.target.checked })}
                  />
                  <div className="w-4 h-4 rounded border border-purple-500/30 peer-checked:bg-purple-500 peer-checked:border-purple-400 transition-colors"></div>
                  <Check className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{feature.name}</span>
                  <span className="text-xs text-white/40 mt-1 leading-relaxed">{feature.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
"""

# Find the end of the Psychoacoustic Compression grid mapping block
# And insert this block right after it
marker = "            {/* Info box */}"
if marker in content:
    content = content.replace(marker, ui_block + "\n" + marker)
else:
    print("Marker not found!")

with open("components/AcousticSynthesizer.tsx", "w") as f:
    f.write(content)

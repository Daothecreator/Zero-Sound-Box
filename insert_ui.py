import re

with open('components/AcousticSynthesizer.tsx', 'r') as f:
    content = f.read()

new_panel = """
      {/* High-Resolution Ambisonics & Microdynamics Panel */}
      <div className="w-full px-4 mt-6">
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col h-full">
          <div className="flex items-center space-x-2 border-b border-white/10 pb-3 mb-4">
            <Radio className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-mono text-blue-400 uppercase tracking-widest">High-Definition Acoustic Rendering (24-bit / 96kHz)</h2>
          </div>
          <p className="text-xs text-white/40 leading-relaxed mb-4">
            Activate professional-grade algorithmic rendering utilizing interaural time difference (ITD), micro-dynamics, phase geometry, and psychophysical compression. (Requires high-fidelity stereo headphones).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'ambisonicEnvironment', name: 'Ambisonic & Room Realism', desc: 'True binaural spatialization. Multi-stage reflections, diffusion, and algorithmic convolution reverb. Generates realistic volumetric spaces.' },
              { id: 'highResMicrodynamics', name: 'Microdynamics & Microtones', desc: 'Infinite procedural modulation of micro-pitch (cents) and micro-volume. Replicates natural organic acoustic fluctuation to prevent auditory fatigue.' },
              { id: 'psychoacousticCompression', name: 'Psychoacoustic Compression', desc: 'Non-linear dynamic range modeling based on human ear sensitivity curves (Fletcher-Munson). Enhances perceived depth without clipping.' }
            ].map(feature => (
              <label key={feature.id} className="flex items-start space-x-3 p-4 rounded-xl bg-black/20 border border-blue-500/20 hover:border-blue-400/50 hover:bg-blue-900/10 transition-all cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input 
                    type="checkbox" 
                    className="peer sr-only"
                    checked={config[feature.id as keyof AudioConfig] as boolean}
                    onChange={(e) => applyConfig({ ...config, [feature.id]: e.target.checked })}
                  />
                  <div className="w-4 h-4 rounded border border-blue-500/30 peer-checked:bg-blue-500 peer-checked:border-blue-400 transition-colors"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-mono text-blue-300 group-hover:text-blue-200 transition-colors">{feature.name}</span>
                  <span className="text-[10px] text-white/40 mt-1 leading-relaxed">{feature.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
"""

# Insert it before {/* Advanced Psychoacoustics & Phenomena Panel */}
pattern = r'(\s*\{\/\* Advanced Psychoacoustics & Phenomena Panel \*\/})'
content = re.sub(pattern, new_panel + r'\1', content)

# Also ensure `Radio` icon is imported from lucide-react
if 'Radio' not in content:
    content = content.replace("import { ", "import { Radio, ")

with open('components/AcousticSynthesizer.tsx', 'w') as f:
    f.write(content)

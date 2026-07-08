import re

with open('components/AcousticSynthesizer.tsx', 'r') as f:
    content = f.read()

phenomena_ui = """
            {/* Advanced Psychoacoustics & Phenomena Panel */}
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col h-full col-span-1 md:col-span-2 lg:col-span-3">
              <div className="flex items-center space-x-2 border-b border-white/10 pb-3 mb-4">
                <Activity className="w-4 h-4 text-white/60" />
                <h2 className="text-sm font-mono text-white/80 uppercase tracking-widest">Advanced Psychoacoustics & Phenomena</h2>
              </div>
              <p className="text-xs text-white/40 leading-relaxed mb-4">
                Activate deeply researched auditory illusions, physiological resonances, and acoustic phenomena. Some features may require high-fidelity headphones or robust subwoofers to manifest correctly.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {[
                  { id: 'gammaRhythms', name: 'Gamma Rhythms', desc: 'Binaural beats oscillating at 40Hz for hyper-focus.' },
                  { id: 'infrasound', name: 'Infrasonic Waves', desc: '12Hz subsonic modulation. Felt, not heard.' },
                  { id: 'eyeballResonance', name: 'Eyeball Resonance', desc: 'Precise 18.98Hz tone inducing optical vibration.' },
                  { id: 'chestResonance', name: 'Chest Resonance', desc: '75Hz deep somatic frequency.' },
                  { id: 'subwooferPressure', name: 'Subwoofer Pressure', desc: 'Intense 40Hz triangular sub-bass layer.' },
                  { id: 'templeResonance', name: 'Temple Resonance', desc: '110Hz ancient architecture acoustic profile.' },
                  { id: 'tartiniTones', name: 'Tartini Tones', desc: 'Loud primary tones creating a 200Hz phantom third tone in the ear.' },
                  { id: 'zwickerTone', name: 'Zwicker Tone', desc: 'Notch-filtered noise to induce phantom ringing post-stop.' },
                  { id: 'otoacousticEmissions', name: 'Otoacoustic Emissions', desc: 'Barely audible multi-frequency stimuli.' },
                  { id: 'asmr', name: 'ASMR Somatic', desc: 'Spatial sweeping high-frequency textured noise.' },
                  { id: 'auroraSounds', name: 'Aurora Borealis', desc: 'Synthesized electromagnetic crackling of solar wind.' },
                  { id: 'phantomTone', name: 'Phantom Tone', desc: 'Extreme threshold 16kHz sine in anechoic simulation.' },
                  { id: 'auditoryPareidolia', name: 'Auditory Pareidolia', desc: 'Dynamic brown noise bands creating phantom voices.' },
                  { id: 'franssenEffect', name: 'Franssen Effect', desc: 'Spatial illusion separating attack and sustain localization.' },
                  { id: 'acousticLevitation', name: 'Acoustic Levitation', desc: 'High frequency (20kHz) standing wave simulation.' },
                  { id: 'acousticCavitation', name: 'Acoustic Cavitation', desc: 'Aggressively pulsed high frequency sonoluminescence analogue.' },
                  { id: 'acousticBlackHole', name: 'Acoustic Black Hole', desc: 'Continuous decelerating frequency sweep trap.' },
                  { id: 'chladniResonance', name: 'Chladni Figures', desc: 'Sweeping classic plate resonance frequencies.' },
                  { id: 'specificFrequencies', name: 'Resonance Protocol Alpha', desc: 'Infusion of 1.25, 5.08, 10.55, 20.51, 33.18, 90.12 Hz.' },
                  { id: 'rissetRhythm', name: 'Risset Rhythm', desc: 'Endlessly accelerating auditory drum illusion.' },
                  { id: 'octaveIllusion', name: 'Octave Illusion', desc: 'Alternating high/low and left/right tones.' },
                  { id: 'tritoneParadox', name: 'Tritone Paradox', desc: 'Shepard tones spaced by a tritone. Pitch direction is subjective.' }
                ].map(feature => (
                  <label key={feature.id} className="flex items-start space-x-3 p-3 rounded-lg bg-black/20 border border-white/5 hover:border-white/20 transition-colors cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input 
                        type="checkbox" 
                        className="peer sr-only"
                        checked={config[feature.id as keyof AudioConfig] as boolean}
                        onChange={(e) => applyConfig({ ...config, [feature.id]: e.target.checked })}
                      />
                      <div className="w-4 h-4 rounded border border-white/20 peer-checked:bg-white peer-checked:border-white transition-colors"></div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-mono text-white/80 group-hover:text-white transition-colors">{feature.name}</span>
                      <span className="text-[10px] text-white/40 mt-1 leading-relaxed">{feature.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
"""

content = content.replace("            {/* Info box */}", f"{phenomena_ui}\n            {{/* Info box */}}")

with open('components/AcousticSynthesizer.tsx', 'w') as f:
    f.write(content)


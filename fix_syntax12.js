const fs = require('fs');
let code = fs.readFileSync('components/AcousticSynthesizer.tsx', 'utf-8');

// I am just going to format the file and check for nesting.

const lines = code.split('\n');
let newLines = [];
let indent = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // basic brace matching for debugging where it goes wrong
}

// Let's do a more robust replacement for the whole end of the file.
const startMarker = '{/* Volume Slider */}';
const endOfFile = code.substring(code.indexOf(startMarker));
const beforeVolume = code.substring(0, code.indexOf(startMarker));

// Find the last actual div in beforeVolume
let newBeforeVolume = beforeVolume;
// We need to match the return ( <> ... </> );

const properEnd = `
      {/* Volume Slider */}
      <div className="fixed bottom-[5rem] md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-3 bg-black/60 border border-white/10 rounded-full px-5 py-2.5 shadow-2xl hud-panel">
        <button 
          onClick={() => {
            const newVal = volume > 0 ? 0 : 1;
            setVolume(newVal);
            audioEngine.setVolume(newVal);
          }}
          className="text-white/50 hover:text-white/90 transition-colors"
        >
          {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={volume} 
          onChange={handleVolumeChange}
          className="w-32 h-1 bg-white/20 rounded-full appearance-none outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
        />
      </div>

      {/* Diagnostic Overlay */}
      <button 
        onClick={() => setShowDiagnostics(!showDiagnostics)}
        className="fixed bottom-[5rem] md:bottom-4 right-4 z-50 p-2 bg-black/60 border border-white/20 rounded-full text-white/50 hover:text-white/90 hover:bg-white/10 transition-colors"
        title="Toggle Hardware Diagnostics"
      >
        <Activity className="w-5 h-5" />
      </button>

      {showDiagnostics && diagnostics && (
        <div className="fixed bottom-[8rem] md:bottom-16 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] bg-black/90 border border-white/10 p-5 rounded-2xl shadow-2xl font-mono text-xs text-white/80 space-y-3">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/10">
            <span className="text-white/90 font-bold uppercase tracking-wider">DSP Diagnostics</span>
            <span className={\`w-2 h-2 rounded-full \${diagnostics.state === 'running' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}\`}></span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-white/40">Hardware DAC Rate</span>
            <span>{diagnostics.sampleRate} Hz</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-white/40">Bit Depth</span>
            <span className="text-blue-400">{diagnostics.internalDepth}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-white/40">Active Nodes</span>
            <span>{diagnostics.activeNodes}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-white/40">Hardware Latency</span>
            <span>{diagnostics.baseLatency ? (diagnostics.baseLatency * 1000).toFixed(2) : '--'} ms</span>
          </div>

          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-[10px] text-white/30 leading-relaxed">
              * Active context operating at {diagnostics.sampleRate}Hz. Output depth normalized to 32-bit float to prevent hardware clipping. Ultrasonic rendering requires 96kHz+ DAC hardware.
            </p>
          </div>
        </div>
      )}
    </>
  );
}`;

// Make sure we have exactly enough closing divs for the main layout.
// The main layout has:
// return ( <>
// <div className="min-h-screen bg-black text-white selection:bg-white/20">
//   <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900/40 via-black to-black pointer-events-none"></div>
//   ... top bar ...
//   <div className="relative max-w-5xl mx-auto px-4 py-24 pb-32">
//     ...

let code2 = fs.readFileSync('components/AcousticSynthesizer.tsx', 'utf-8');
const neuroStart = code2.indexOf('{/* Neuro-Geometric Architecture */}');

let beforeNeuro = code2.substring(0, neuroStart);

const afterNeuro = `
        {/* Neuro-Geometric Architecture */}
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
` + properEnd;

fs.writeFileSync('components/AcousticSynthesizer.tsx', beforeNeuro + afterNeuro);
console.log("Fixed JSX syntax in AcousticSynthesizer part 12");

import re

with open('components/AcousticSynthesizer.tsx', 'r') as f:
    content = f.read()

# Replace the Engine Target rate with accurate context latency
content = content.replace("""          <div className="flex justify-between">
            <span className="text-white/40">Engine Target Rate</span>
            <span className="text-white/90">768 kHz</span>
          </div>""", "")

content = content.replace("""          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-[10px] text-white/30 leading-relaxed">
              * Internal engine oversamples to 768kHz/32-bit float to prevent hardware clipping before native DAC delivery.
            </p>
          </div>""", """          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-[10px] text-white/30 leading-relaxed">
              * Active context operating at {diagnostics.sampleRate}Hz. Output depth normalized to 32-bit float to prevent hardware clipping. Ultrasonic rendering requires 96kHz+ DAC hardware.
            </p>
          </div>""")

with open('components/AcousticSynthesizer.tsx', 'w') as f:
    f.write(content)


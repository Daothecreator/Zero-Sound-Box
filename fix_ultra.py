import re

with open('lib/audio.ts', 'r') as f:
    content = f.read()

pattern = r'    if \(config\.acousticLevitation \|\| config\.sonoluminescence \|\| config\.acousticCavitation\) \{.*?(?=    if \(config\.chladniResonance\))'

replacement = """    if (config.acousticLevitation || config.sonoluminescence || config.acousticCavitation) {
      // Real ultrasonic generation (up to 40kHz, works correctly if AudioContext runs at 96kHz).
      // Emits actual ultrasonic frequencies.
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = config.acousticLevitation ? 40000 : (config.sonoluminescence ? 25000 : 30000); 
      
      const outGain = this.ctx.createGain();
      outGain.gain.value = 0.8;
      
      if (config.acousticCavitation) {
        // Acoustic cavitation requires pulsed, high-intensity ultrasound to tear the medium.
        const pulseModulator = this.ctx.createOscillator();
        pulseModulator.type = 'square';
        pulseModulator.frequency.value = 50; 
        
        const modGain = this.ctx.createGain();
        modGain.gain.value = 1.0; 
        
        pulseModulator.connect(modGain);
        modGain.connect(outGain.gain);
        
        pulseModulator.start(now);
        this.synthNodes.push(pulseModulator, modGain);
      }
      
      osc.connect(outGain);
      outGain.connect(preMaster);
      osc.start(now);
      this.synthNodes.push(osc, outGain);
    }
    
"""

content = re.sub(pattern, replacement, content, flags=re.DOTALL)
with open('lib/audio.ts', 'w') as f:
    f.write(content)


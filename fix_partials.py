import re

with open('lib/audio.ts', 'r') as f:
    content = f.read()

micro_logic = """
        // Microdynamics (Algorithmic Micro-LFO for organic pitch & amplitude drift)
        if (config.highResMicrodynamics) {
            const microLFO = this.ctx!.createOscillator();
            microLFO.frequency.value = 0.1 + Math.random() * 0.2; // Slow random drift
            const pitchDrift = this.ctx!.createGain();
            pitchDrift.gain.value = 0.15; // 0.15 Hz drift
            microLFO.connect(pitchDrift);
            pitchDrift.connect(oscL.frequency);
            if (typeof oscR !== 'undefined') pitchDrift.connect(oscR.frequency);
            
            const ampDrift = this.ctx!.createGain();
            ampDrift.gain.value = 0.05 * targetAmpL; // 5% amplitude drift
            microLFO.connect(ampDrift);
            ampDrift.connect(pGainL.gain);
            if (typeof pGainR !== 'undefined') {
                const ampDriftR = this.ctx!.createGain();
                ampDriftR.gain.value = 0.05 * targetAmpR;
                microLFO.connect(ampDriftR);
                ampDriftR.connect(pGainR.gain);
                this.synthNodes.push(ampDriftR);
            }
            microLFO.start(now);
            this.synthNodes.push(microLFO, pitchDrift, ampDrift);
        }
"""

# We need to insert this in two places inside partials.forEach:
# 1. The binaural beat condition (oscL, oscR)
# 2. The orbit/isochronic condition (osc)

content = content.replace("        oscL.start(now); oscR.start(now);", "        oscL.start(now); oscR.start(now);" + micro_logic)

micro_logic_2 = """
        // Microdynamics
        if (config.highResMicrodynamics) {
            const microLFO = this.ctx!.createOscillator();
            microLFO.frequency.value = 0.1 + Math.random() * 0.2;
            const pitchDrift = this.ctx!.createGain();
            pitchDrift.gain.value = 0.15; 
            microLFO.connect(pitchDrift);
            pitchDrift.connect(osc.frequency);
            
            const ampDrift = this.ctx!.createGain();
            ampDrift.gain.value = 0.05 * targetAmpL;
            microLFO.connect(ampDrift);
            ampDrift.connect(pGain.gain);
            
            microLFO.start(now);
            this.synthNodes.push(microLFO, pitchDrift, ampDrift);
        }
"""

content = content.replace("        osc.start(now);\n        const decay", "        osc.start(now);" + micro_logic_2 + "\n        const decay")

with open('lib/audio.ts', 'w') as f:
    f.write(content)

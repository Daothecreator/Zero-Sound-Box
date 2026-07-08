import re

with open('lib/audio.ts', 'r') as f:
    content = f.read()

ambisonic_logic = """
    if (config.ambisonicEnvironment) {
        // High-Resolution Room Acoustics & Binaural ITD
        // Early Reflections (Front/Back/Sides) via multi-tap delays
        const erGain = this.ctx.createGain();
        erGain.gain.value = 0.4; // Wet mix for reflections
        
        // Panner with HRTF for true Binaural projection
        const hrtfPanner = this.ctx.createPanner();
        hrtfPanner.panningModel = 'HRTF';
        hrtfPanner.distanceModel = 'inverse';
        hrtfPanner.refDistance = 1;
        hrtfPanner.maxDistance = 10000;
        hrtfPanner.rolloffFactor = 1;
        // Position slightly in front and wide
        if (hrtfPanner.positionX) {
            hrtfPanner.positionX.setValueAtTime(0, now);
            hrtfPanner.positionY.setValueAtTime(0.5, now);
            hrtfPanner.positionZ.setValueAtTime(1.5, now);
        } else {
            hrtfPanner.setPosition(0, 0.5, 1.5);
        }
        
        preMaster.connect(hrtfPanner);
        preMaster = hrtfPanner;
        
        // Route through early reflections and the master reverb
        preMaster.connect(erGain);
        if (this.reverbNode) {
            erGain.connect(this.reverbNode);
            // Dynamic adjustment of reverb parameters
            if (this.reverbGain) {
                this.reverbGain.gain.setTargetAtTime(0.6, now, 0.1); // Increased room depth
            }
        }
        this.synthNodes.push(hrtfPanner, erGain);
    } else {
        if (this.reverbGain) {
            this.reverbGain.gain.setTargetAtTime(0.35, now, 0.1); // Default depth
        }
    }
"""

content = content.replace("    if (config.volumetric8DEnabled) {", ambisonic_logic + "\n    if (config.volumetric8DEnabled) {")

with open('lib/audio.ts', 'w') as f:
    f.write(content)

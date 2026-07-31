const fs = require('fs');
let code = fs.readFileSync('lib/audio.ts', 'utf-8');
const stopMethod = `
  public stopSynth(fadeTime = 0.5) {
    if (!this.ctx || !this.preMaster) return;
    const now = this.ctx.currentTime;
    
    // Smooth fade out
    this.preMaster.gain.setTargetAtTime(0, now, fadeTime / 3);
    
    // Stop all active nodes
    this.synthNodes.forEach(node => {
        try {
            if (node instanceof AudioScheduledSourceNode) {
                node.stop(now + fadeTime);
            }
        } catch (e) {
            // ignore
        }
    });
    
    // Clear array after fade
    setTimeout(() => {
        this.synthNodes = [];
    }, fadeTime * 1000 + 100);
  }
`;
code = code.replace(/public setVolume\(val: number\) \{/, stopMethod + '\n  public setVolume(val: number) {');
fs.writeFileSync('lib/audio.ts', code);

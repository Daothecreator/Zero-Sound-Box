const fs = require('fs');
let code = fs.readFileSync('lib/audio.ts', 'utf-8');

const oldStop = `    // Stop all active nodes
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
  }`;

const newStop = `    // Stop all active nodes
    const nodesToStop = [...this.synthNodes];
    this.synthNodes = []; // Clear synchronously to prevent race conditions
    
    nodesToStop.forEach(node => {
        try {
            if (node instanceof AudioScheduledSourceNode) {
                node.stop(now + fadeTime);
            }
        } catch (e) {
            // ignore
        }
        // Garbage collection helper: disconnect after fade
        setTimeout(() => {
            try { node.disconnect(); } catch (e) {}
        }, fadeTime * 1000 + 100);
    });
  }`;

code = code.replace(oldStop, newStop);
fs.writeFileSync('lib/audio.ts', code);

const fs = require('fs');
let code = fs.readFileSync('lib/audio.ts', 'utf-8');

const regex = /\/\/ SPATIAL WIDENING & DIFFUSE FIELD[\s\S]*?this\.synthNodes\.push\(leftDelay, rightDelay, merger, lfoLeft, lfoRight, lfoGainLeft, lfoGainRight\);/m;
const match = code.match(regex);
if (match) {
  const replacement = `// SPATIAL WIDENING & DIFFUSE FIELD (Haas Effect + Chorusing)
    const leftDelay = this.ctx.createDelay();
    const rightDelay = this.ctx.createDelay();
    leftDelay.delayTime.value = config.spatialWidening ? 0.008 : 0;
    rightDelay.delayTime.value = config.spatialWidening ? 0.022 : 0;

    const lfoLeft = this.ctx.createOscillator();
    lfoLeft.frequency.value = 0.3;
    const lfoGainLeft = this.ctx.createGain();
    lfoGainLeft.gain.value = config.spatialWidening ? 0.002 : 0;
    lfoLeft.connect(lfoGainLeft);
    lfoGainLeft.connect(leftDelay.delayTime);

    const lfoRight = this.ctx.createOscillator();
    lfoRight.frequency.value = 0.45;
    const lfoGainRight = this.ctx.createGain();
    lfoGainRight.gain.value = config.spatialWidening ? 0.003 : 0;
    lfoRight.connect(lfoGainRight);
    lfoGainRight.connect(rightDelay.delayTime);
    
    lfoLeft.start(now);
    lfoRight.start(now);

    const dryMixL = this.ctx.createGain();
    const dryMixR = this.ctx.createGain();
    leftDelay.connect(dryMixL);
    rightDelay.connect(dryMixR);
    
    const wetMix = this.ctx.createGain();
    wetMix.gain.value = 0;

    if (config.ambisonicEnvironment) {
        // High-Resolution Quadraphonic Room Acoustics (True Binaural decoding of a 3D field)
        wetMix.gain.value = 0.6; // Add reflections
        
        // Virtual Speaker Array
        const positions = [
          [-2, 0.5, -2], // Front Left
          [ 2, 0.5, -2], // Front Right
          [-2, 0.5,  2], // Rear Left
          [ 2, 0.5,  2]  // Rear Right
        ];
        
        const panners = positions.map(pos => {
          const p = this.ctx.createPanner();
          p.panningModel = 'HRTF';
          p.distanceModel = 'inverse';
          p.refDistance = 1;
          p.maxDistance = 10000;
          p.rolloffFactor = 1;
          if (p.positionX) {
              p.positionX.setValueAtTime(pos[0], now);
              p.positionY.setValueAtTime(pos[1], now);
              p.positionZ.setValueAtTime(pos[2], now);
          } else {
              p.setPosition(pos[0], pos[1], pos[2]);
          }
          p.connect(this.masterGain);
          
          if (this.reverbNode) {
              const revSend = this.ctx.createGain();
              revSend.gain.value = 0.5;
              p.connect(revSend);
              revSend.connect(this.reverbNode);
              this.synthNodes.push(revSend);
          }
          return p;
        });

        // Crossfeed signals into the 4 speakers to create a volumetric field
        const flGain = this.ctx.createGain(); flGain.gain.value = 0.7;
        const frGain = this.ctx.createGain(); frGain.gain.value = 0.7;
        const rlGain = this.ctx.createGain(); rlGain.gain.value = 0.4;
        const rrGain = this.ctx.createGain(); rrGain.gain.value = 0.4;
        
        leftDelay.connect(flGain); flGain.connect(panners[0]);
        rightDelay.connect(frGain); frGain.connect(panners[1]);
        leftDelay.connect(rlGain); rlGain.connect(panners[2]);
        rightDelay.connect(rrGain); rrGain.connect(panners[3]);

        this.synthNodes.push(...panners, flGain, frGain, rlGain, rrGain);
        
        if (this.reverbGain) {
            this.reverbGain.gain.setTargetAtTime(0.7, now, 0.1); 
        }
    } else {
        if (this.reverbGain) {
            this.reverbGain.gain.setTargetAtTime(0.2, now, 0.1); 
        }
        // Direct stereo feed
        const merger = this.ctx.createChannelMerger(2);
        dryMixL.connect(merger, 0, 0);
        dryMixR.connect(merger, 0, 1);
        merger.connect(this.masterGain);
        this.synthNodes.push(merger);
    }

    if (config.volumetric8DEnabled) {
        const panner8D = this.ctx.createPanner();
        panner8D.panningModel = 'HRTF';
        panner8D.distanceModel = 'inverse';
        panner8D.refDistance = 1;
        panner8D.maxDistance = 10000;
        panner8D.rolloffFactor = 1;
        panner8D.coneInnerAngle = 360;
        panner8D.coneOuterAngle = 360;
        panner8D.coneOuterGain = 0;
        
        // Reroute dry mix through 8D panner
        dryMixL.disconnect();
        dryMixR.disconnect();
        
        const merger = this.ctx.createChannelMerger(2);
        leftDelay.connect(merger, 0, 0);
        rightDelay.connect(merger, 0, 1);
        
        merger.connect(panner8D);
        panner8D.connect(this.masterGain);
        
        let angle = 0;
        const radius = 3.5;
        const speed = 0.01; // Orbital rotation speed
        
        this.panner8DInterval = setInterval(() => {
            if (!this.ctx) return;
            angle += speed;
            const x = Math.sin(angle) * radius;
            const z = Math.cos(angle) * radius;
            const y = Math.sin(angle * 2) * 0.5 + 0.2; // Gentle elevation undulation
            
            if (panner8D.positionX) {
                panner8D.positionX.setTargetAtTime(x, this.ctx.currentTime, 0.05);
                panner8D.positionY.setTargetAtTime(y, this.ctx.currentTime, 0.05);
                panner8D.positionZ.setTargetAtTime(z, this.ctx.currentTime, 0.05);
            } else {
                panner8D.setPosition(x, y, z);
            }
        }, 20);
        
        this.synthNodes.push(panner8D, merger);
    }

    this.synthNodes.push(leftDelay, rightDelay, dryMixL, dryMixR, wetMix, lfoLeft, lfoRight, lfoGainLeft, lfoGainRight);`;

  code = code.replace(regex, replacement);
  fs.writeFileSync('lib/audio.ts', code);
  console.log("Updated Spatial Routing");
} else {
  console.log("Could not find match");
}

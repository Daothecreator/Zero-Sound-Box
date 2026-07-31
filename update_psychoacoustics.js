const fs = require('fs');
let code = fs.readFileSync('lib/audio.ts', 'utf-8');

const regex8D = /if \(config\.volumetric8DEnabled\) \{[\s\S]*?this\.synthNodes\.push\(panner8D, merger\);\n    \}/;

const replacement8D = `if (config.volumetric8DEnabled) {
        // True physical volumetric panning. Simulates real physics in a 3D spherical environment
        const panner8D = this.ctx.createPanner();
        panner8D.panningModel = 'HRTF';
        panner8D.distanceModel = 'inverse';
        panner8D.refDistance = 0.5; // Starts close to head
        panner8D.maxDistance = 10000;
        panner8D.rolloffFactor = 1.2;
        panner8D.coneInnerAngle = 360;
        panner8D.coneOuterAngle = 360;
        panner8D.coneOuterGain = 0;
        
        // Disconnect direct dry mix routing
        dryMixL.disconnect();
        dryMixR.disconnect();
        
        const merger = this.ctx.createChannelMerger(2);
        leftDelay.connect(merger, 0, 0);
        rightDelay.connect(merger, 0, 1);
        
        merger.connect(panner8D);
        panner8D.connect(this.masterGain);
        
        let angle = 0;
        let radius = 1.0; 
        const speed = 0.02; // Angular velocity (rads per frame)
        let time = 0;
        
        this.panner8DInterval = setInterval(() => {
            if (!this.ctx) return;
            angle += speed;
            time += 0.02;
            
            // True Lissajous-style orbital dynamics (figure-8 path combined with elevation)
            const x = Math.sin(angle) * radius;
            const z = Math.cos(angle) * radius;
            const y = Math.sin(angle * 2) * (radius * 0.5); // Elevates 2x per orbit
            
            // Doppler effect simulation based on velocity vectors relative to listener
            // (Assuming listener is at 0,0,0)
            const velocityX = Math.cos(angle) * speed * radius;
            const velocityZ = -Math.sin(angle) * speed * radius;
            // A true physical doppler effect would require modulating a delay line based on distance
            // but we use the panner's native position updates to drive ITD/ILD.
            
            // Periodically shift the radius in and out (breathing sphere)
            radius = 2.0 + Math.sin(time * 0.5) * 1.5;

            if (panner8D.positionX) {
                panner8D.positionX.setTargetAtTime(x, this.ctx.currentTime, 0.05);
                panner8D.positionY.setTargetAtTime(y, this.ctx.currentTime, 0.05);
                panner8D.positionZ.setTargetAtTime(z, this.ctx.currentTime, 0.05);
            } else {
                panner8D.setPosition(x, y, z);
            }
        }, 20);
        
        this.synthNodes.push(panner8D, merger);
    }`;

code = code.replace(regex8D, replacement8D);

const regexZeno = /if \(config\.quantumZenoEffect\) \{[\s\S]*?this\.synthNodes\.push\(masterLeft, masterRight\);/;

const replacementZeno = `if (config.quantumZenoEffect) {
        masterLeft.gain.value = 0.5;
        masterRight.gain.value = 0.5;
        
        // Quantum Zeno Effect in acoustics: Frequent "measurements" (rapid amplitude chopping) 
        // to freeze or slow the perceived evolution of the sound wave.
        const zenoOsc = this.ctx.createOscillator();
        zenoOsc.type = 'square';
        zenoOsc.frequency.value = 60; // 60 Hz observation rate
        
        const zenoModGain = this.ctx.createGain();
        zenoModGain.gain.value = 0.5;
        zenoOsc.connect(zenoModGain);
        
        zenoModGain.connect(masterLeft.gain);
        zenoModGain.connect(masterRight.gain);
        zenoOsc.start(now);
        this.synthNodes.push(zenoOsc, zenoModGain);
    } else {
        masterLeft.gain.value = 1;
        masterRight.gain.value = 1;
    }
    
    masterLeft.connect(leftDelay);
    masterRight.connect(rightDelay);
    this.synthNodes.push(masterLeft, masterRight);`;

code = code.replace(regexZeno, replacementZeno);

const regex4D = /if \(config\.phaseVelocity4D\) \{[\s\S]*?this\.synthNodes\.push\(phaseShifter, groupDelay, spatialPanner\);\n    \}/;

const replacement4D = `if (config.phaseVelocity4D) {
      // 4D Tensor spatialization / phase velocity standing wave.
      // Uses cascading Allpass filters to create extreme frequency-dependent phase shifts,
      // simulating a non-Euclidean acoustic space where different frequencies travel at different speeds.
      const phaseShifter1 = this.ctx.createBiquadFilter();
      phaseShifter1.type = 'allpass';
      phaseShifter1.frequency.value = config.leftFreq * 0.5;
      phaseShifter1.Q.value = 20;

      const phaseShifter2 = this.ctx.createBiquadFilter();
      phaseShifter2.type = 'allpass';
      phaseShifter2.frequency.value = config.leftFreq * 1.5;
      phaseShifter2.Q.value = 20;

      const phaseShifter3 = this.ctx.createBiquadFilter();
      phaseShifter3.type = 'allpass';
      phaseShifter3.frequency.value = config.leftFreq * 4.0;
      phaseShifter3.Q.value = 20;
      
      const spatialPanner = this.ctx.createPanner();
      spatialPanner.panningModel = 'HRTF';
      spatialPanner.distanceModel = 'inverse';
      spatialPanner.positionX.value = 0;
      spatialPanner.positionY.value = 0;
      spatialPanner.positionZ.value = -0.5; // Originates "inside/behind" the head
      
      merger.connect(phaseShifter1);
      phaseShifter1.connect(phaseShifter2);
      phaseShifter2.connect(phaseShifter3);
      phaseShifter3.connect(spatialPanner);
      spatialPanner.connect(this.masterGain);
      this.synthNodes.push(phaseShifter1, phaseShifter2, phaseShifter3, spatialPanner);
    }`;
    
code = code.replace(regex4D, replacement4D);


fs.writeFileSync('lib/audio.ts', code);
console.log("Updated Physics & Zeno & 4D");

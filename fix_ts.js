const fs = require('fs');
let code = fs.readFileSync('lib/audio.ts', 'utf-8');

// Fix 1: Uint8Array issue in lib/audio.ts(175)
code = code.replace(/this\.latestAmplitudes = new Float32Array\(new Uint8Array\(e\.data\.amplitudes\)\)/, 'this.latestAmplitudes = new Float32Array(e.data.amplitudes)');

// Fix 2: 4D Phase Velocity `merger`
code = code.replace(/merger\.connect\(phaseShifter1\);/g, `const localMerger = this.ctx.createChannelMerger(2);
      dryMixL.disconnect();
      dryMixR.disconnect();
      leftDelay.connect(localMerger, 0, 0);
      rightDelay.connect(localMerger, 0, 1);
      localMerger.connect(phaseShifter1);
      this.synthNodes.push(localMerger);`);

// Fix 3: biofeedbackSync `merger`
code = code.replace(/merger\.disconnect\(this\.masterGain\);\n      merger\.connect\(syncDelay\);/g, `const localMerger = this.ctx.createChannelMerger(2);
      dryMixL.disconnect();
      dryMixR.disconnect();
      leftDelay.connect(localMerger, 0, 0);
      rightDelay.connect(localMerger, 0, 1);
      localMerger.connect(syncDelay);
      this.synthNodes.push(localMerger);`);

// Fix 4: infrasound `preMaster.disconnect()`
code = code.replace(/preMaster\.disconnect\(\);\n      preMaster\.connect\(amNode\);\n      amNode\.connect\(this\.masterGain\);/g, `// Connect AM node directly to masterGain's gain param
      iGain.disconnect();
      iGain.connect(this.masterGain!.gain);`);

// Clean up unused dcOffset from infrasound
code = code.replace(/dcOffset\.connect\(amNode\.gain\);/g, '');

// Fix 'Object is possibly null' for this.masterGain in various places
code = code.replace(/this\.masterGain/g, 'this.masterGain!');

fs.writeFileSync('lib/audio.ts', code);
console.log("Fixed TS errors part 1");

const fs = require('fs');
let code = fs.readFileSync('lib/audio.ts', 'utf-8');

const classDecl = `export class AudioEngine {`;
const newClassDecl = `export class AudioEngine {
  private currentVolume: number = 1.0;`;

code = code.replace(classDecl, newClassDecl);

const oldSetVolume = `  public setVolume(val: number) {
    if (this.masterGain! && this.ctx) {
      this.masterGain!.gain.setTargetAtTime(val, this.ctx!.currentTime, 0.1);
    }
  }`;

const newSetVolume = `  public setVolume(val: number) {
    this.currentVolume = val;
    if (this.masterGain! && this.ctx) {
      this.masterGain!.gain.setTargetAtTime(val, this.ctx!.currentTime, 0.1);
    }
  }`;

code = code.replace(oldSetVolume, newSetVolume);

const oldPlaySynth = `  public playSynth(config: AudioConfig) {
    if (!this.ctx || !this.masterGain!) return;
    this.stopSynth(0.5);`;

const newPlaySynth = `  public playSynth(config: AudioConfig) {
    if (!this.ctx || !this.masterGain!) return;
    this.stopSynth(0.5);
    
    // Restore master volume after stopSynth faded it out
    this.masterGain!.gain.setTargetAtTime(this.currentVolume, this.ctx.currentTime + 0.5, 0.1);`;

code = code.replace(oldPlaySynth, newPlaySynth);
fs.writeFileSync('lib/audio.ts', code);

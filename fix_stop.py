import re

with open('lib/audio.ts', 'r') as f:
    content = f.read()

# I will replace the bad blocks with `const now = this.ctx.currentTime;`
# But I must only replace the ones inside `chladniResonance` and `stop`
# The one in `playSynth` should stay.

# Let's just find and replace the whole block in `stop`
bad_block = """const now = this.ctx.currentTime;

    if (config.psychoacousticCompression && this.compressor) {
      this.compressor.threshold.setTargetAtTime(-28, now, 0.1);
      this.compressor.knee.setTargetAtTime(40, now, 0.1);
      this.compressor.ratio.setTargetAtTime(20, now, 0.1);
      this.compressor.attack.setTargetAtTime(0.001, now, 0.1);
      this.compressor.release.setTargetAtTime(0.05, now, 0.1);
    } else if (this.compressor) {
      this.compressor.threshold.setTargetAtTime(-12, now, 0.1);
      this.compressor.knee.setTargetAtTime(30, now, 0.1);
      this.compressor.ratio.setTargetAtTime(12, now, 0.1);
      this.compressor.attack.setTargetAtTime(0.003, now, 0.1);
      this.compressor.release.setTargetAtTime(0.25, now, 0.1);
    }"""

content = content.replace(bad_block, "const now = this.ctx.currentTime;")

with open('lib/audio.ts', 'w') as f:
    f.write(content)


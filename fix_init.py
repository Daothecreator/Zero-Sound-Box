import re

with open('lib/audio.ts', 'r') as f:
    content = f.read()

init_pattern = r'(    if \(!this\.ctx\) \{\n      this\.ctx = new \(window\.AudioContext \|\| \(window as any\)\.webkitAudioContext\)\(\);\n)'

replacement = """    if (!this.ctx) {
      try {
        // Request 96kHz for actual ultrasonic frequencies
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 96000 });
      } catch (e) {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
"""

if re.search(init_pattern, content):
    content = re.sub(init_pattern, replacement, content)
    with open('lib/audio.ts', 'w') as f:
        f.write(content)
    print("Fixed init!")
else:
    print("Could not find init")


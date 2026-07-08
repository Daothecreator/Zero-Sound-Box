import re

with open('lib/audio.ts', 'r') as f:
    content = f.read()

content = content.replace("ampDrift.connect(pGain.gain);", "ampDrift.connect(gain.gain);")

with open('lib/audio.ts', 'w') as f:
    f.write(content)

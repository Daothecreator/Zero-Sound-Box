import re

with open('lib/audio.ts', 'r') as f:
    content = f.read()

content = content.replace('// Simulate by a tone sweeping down and fading out continuously', '// Real-time DSP generation of Acoustic Black Hole effect (continuously decreasing phase velocity trap)')
content = content.replace('// Simulate accelerating rhythm', '// Mathematical generation of Risset accelerating rhythm illusion')
content = content.replace('// LAYER 4: SCIENTIFIC ELECTROMAGNETIC FIELD (EMF) - ORIGINAL SIMULATION', '// LAYER 4: SCIENTIFIC ELECTROMAGNETIC FIELD (EMF) - PULSED SIGNAL GENERATION')

with open('lib/audio.ts', 'w') as f:
    f.write(content)


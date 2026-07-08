import re

with open('lib/audio.ts', 'r') as f:
    content = f.read()

types_to_add = """  specificFrequencies: boolean;
  highResMicrodynamics: boolean;
  ambisonicEnvironment: boolean;
  psychoacousticCompression: boolean;"""

content = content.replace("  specificFrequencies: boolean;", types_to_add)

with open('lib/audio.ts', 'w') as f:
    f.write(content)

with open('components/AcousticSynthesizer.tsx', 'r') as f:
    content = f.read()

init_to_add = """    specificFrequencies: false,
    highResMicrodynamics: false,
    ambisonicEnvironment: false,
    psychoacousticCompression: false,"""

content = content.replace("    specificFrequencies: false,", init_to_add)
with open('components/AcousticSynthesizer.tsx', 'w') as f:
    f.write(content)


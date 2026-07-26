import re

with open("components/AcousticSynthesizer.tsx", "r") as f:
    content = f.read()

config_insert = """
    phaseVelocity4D: false,
    crossFrequencyCoupling: false,
    harmonicViolations: false,
    zeroEntropySpectrum: false,
    fractalResonance: false,
    biofeedbackSync: false,
"""

content = re.sub(r'(psychoacousticCompression: false,\n)', r'\1' + config_insert, content)

with open("components/AcousticSynthesizer.tsx", "w") as f:
    f.write(content)

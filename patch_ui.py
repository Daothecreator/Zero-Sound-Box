import re

with open('components/AcousticSynthesizer.tsx', 'r') as f:
    content = f.read()

config_addition = """    gammaRhythms: false,
    infrasound: false,
    eyeballResonance: false,
    rissetRhythm: false,
    tritoneParadox: false,
    octaveIllusion: false,
    tartiniTones: false,
    zwickerTone: false,
    otoacousticEmissions: false,
    subwooferPressure: false,
    chestResonance: false,
    asmr: false,
    sonoluminescence: false,
    acousticLevitation: false,
    acousticCavitation: false,
    acousticBlackHole: false,
    chladniResonance: false,
    templeResonance: false,
    auroraSounds: false,
    phantomTone: false,
    auditoryPareidolia: false,
    franssenEffect: false,
    customFrequenciesEnabled: false,"""

content = re.sub(r'    quantumZenoEffect: false,', f'    quantumZenoEffect: false,\n{config_addition}', content)

with open('components/AcousticSynthesizer.tsx', 'w') as f:
    f.write(content)


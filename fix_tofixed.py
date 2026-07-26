import re

with open("components/AcousticSynthesizer.tsx", "r") as f:
    content = f.read()

content = content.replace("currentBeat.toFixed(1)", "(currentBeat || 0).toFixed(1)")
content = content.replace("config.leftFreq.toFixed(1)", "(config.leftFreq || 0).toFixed(1)")
content = content.replace("config.emfFreq.toFixed(2)", "(config.emfFreq || 0).toFixed(2)")
content = content.replace("partial.ratio.toFixed(2)", "(partial.ratio || 0).toFixed(2)")

with open("components/AcousticSynthesizer.tsx", "w") as f:
    f.write(content)

import re

with open("components/AcousticSynthesizer.tsx", "r") as f:
    content = f.read()

target = "applyConfig(MODES[modeId as keyof typeof MODES].config);"
replacement = "applyConfig({ ...config, mode: MODES[modeId as keyof typeof MODES] });"

content = content.replace(target, replacement)

with open("components/AcousticSynthesizer.tsx", "w") as f:
    f.write(content)

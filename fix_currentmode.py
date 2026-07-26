with open("components/AcousticSynthesizer.tsx", "r") as f:
    content = f.read()

target = "  const selectMode = (modeId: string) => {\n    setActiveMode(modeId);\n    applyConfig(MODES[modeId as keyof typeof MODES].config);\n  };\n"

replacement = target + "\n  const currentModeConfig = MODES[activeMode as keyof typeof MODES];\n"

content = content.replace(target, replacement)

with open("components/AcousticSynthesizer.tsx", "w") as f:
    f.write(content)

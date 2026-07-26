with open("components/AcousticSynthesizer.tsx", "r") as f:
    content = f.read()

target = "  const currentModeConfig = MODES[activeMode as keyof typeof MODES];\n"

handlers = """
  const handleCarrierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyConfig({ ...config, leftFreq: Number(e.target.value) });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Number(e.target.value);
    setVolume(newVal);
    audioEngine.setVolume(newVal);
  };
"""

content = content.replace(target, target + handlers)

with open("components/AcousticSynthesizer.tsx", "w") as f:
    f.write(content)

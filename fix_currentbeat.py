with open("components/AcousticSynthesizer.tsx", "r") as f:
    content = f.read()

target = "  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {\n    const newVal = Number(e.target.value);\n    setVolume(newVal);\n    audioEngine.setVolume(newVal);\n  };\n"

handlers = """
  const handleBinauralChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyConfig({ ...config, beatFreq: Number(e.target.value) });
  };
  
  const currentBeat = config.beatFreq;
"""

content = content.replace(target, target + handlers)

# Also let's check for handleSolfeggioChange. Is it used?

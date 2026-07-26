with open("components/AcousticSynthesizer.tsx", "r") as f:
    content = f.read()

target = """  const handleBinauralChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyConfig({ ...config, beatFreq: Number(e.target.value) });
  };
  
  const currentBeat = config.beatFreq;
  
  const handleEntrainmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyConfig({ ...config, beatFreq: Number(e.target.value) });
  };"""

replacement = """  const handleBinauralChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyConfig({ ...config, rightFreq: config.leftFreq + Number(e.target.value) });
  };
  
  const currentBeat = config.rightFreq - config.leftFreq;
  
  const handleEntrainmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyConfig({ ...config, rightFreq: config.leftFreq + Number(e.target.value) });
  };"""

content = content.replace(target, replacement)

with open("components/AcousticSynthesizer.tsx", "w") as f:
    f.write(content)

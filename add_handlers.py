with open("components/AcousticSynthesizer.tsx", "r") as f:
    content = f.read()

target = "  const currentBeat = config.beatFreq;\n"

handlers = """
  const handleEntrainmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyConfig({ ...config, beatFreq: Number(e.target.value) });
  };
  
  const handleSpatialChange = (newPartials: PartialHarmonic[]) => {
    applyConfig({
        ...config,
        mode: {
            ...config.mode,
            partials: newPartials
        }
    });
  };

  const handleHarmonicDecayChange = (idx: number, val: number) => {
    const newPartials = [...config.mode.partials];
    newPartials[idx].decay = val;
    handleSpatialChange(newPartials);
  };
  
  const handleHarmonicPhaseChange = (idx: number, val: number) => {
    const newPartials = [...config.mode.partials];
    newPartials[idx].phase = val;
    handleSpatialChange(newPartials);
  };

  const handlePhaseReset = () => {
    const newPartials = config.mode.partials.map(p => ({...p, phase: 0}));
    handleSpatialChange(newPartials);
  };

  const handleEmfPresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Just a dummy handler for now or implement real logic
  };
"""

content = content.replace(target, target + handlers)

with open("components/AcousticSynthesizer.tsx", "w") as f:
    f.write(content)

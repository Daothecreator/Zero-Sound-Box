import re

with open("components/AcousticSynthesizer.tsx", "r") as f:
    content = f.read()

bad_part = """    return (
    <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center p-4 md:p-8 z-10 bg-black/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl mt-8 mb-16">"""

fixed_part = """    return () => {
      clearInterval(interval);
      audioEngine.stop(0.1);
    };
  }, []);

  const applyConfig = (newConfig: AudioConfig) => {
    setConfig(newConfig);
    if (isPlaying) {
      audioEngine.playSynth(newConfig);
    }
  };

  const togglePlay = async () => {
    await audioEngine.init();
    if (isPlaying) {
      audioEngine.stop();
      setIsPlaying(false);
    } else {
      audioEngine.playSynth(config);
      audioEngine.setVolume(volume);
      setIsPlaying(true);
    }
  };

  const selectMode = (modeId: string) => {
    setActiveMode(modeId);
    applyConfig(MODES[modeId as keyof typeof MODES].config);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center p-4 md:p-8 z-10 bg-black/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl mt-8 mb-16">"""

content = content.replace(bad_part, fixed_part)

with open("components/AcousticSynthesizer.tsx", "w") as f:
    f.write(content)

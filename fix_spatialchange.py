with open("components/AcousticSynthesizer.tsx", "r") as f:
    content = f.read()

target = """  const handleSpatialChange = (newPartials: PartialHarmonic[]) => {
    applyConfig({
        ...config,
        mode: {
            ...config.mode,
            partials: newPartials
        }
    });
  };"""

replacement = """  const handleSpatialChange = (index: number, x: number, y: number) => {
    const newPartials = [...config.mode.partials];
    newPartials[index] = {
        ...newPartials[index],
        posX: x,
        posY: y,
    };
    applyConfig({
        ...config,
        mode: {
            ...config.mode,
            partials: newPartials
        }
    });
  };

  const handleSpatialChangeList = (newPartials: any[]) => {
    applyConfig({
        ...config,
        mode: {
            ...config.mode,
            partials: newPartials
        }
    });
  };
"""

content = content.replace(target, replacement)

content = content.replace("handleSpatialChange(newPartials);", "handleSpatialChangeList(newPartials);")

with open("components/AcousticSynthesizer.tsx", "w") as f:
    f.write(content)

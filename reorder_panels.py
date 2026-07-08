import re

with open('components/AcousticSynthesizer.tsx', 'r') as f:
    content = f.read()

# First, let's fix the imports to include BinauralFieldMap
if "import BinauralFieldMap" not in content:
    content = content.replace("import AudioVisualizer", "import BinauralFieldMap from './BinauralFieldMap';\nimport AudioVisualizer")

# We need to add handleSpatialChange
if "handleSpatialChange" not in content:
    spatial_handler = """
  const handleSpatialChange = (idx: number, x: number, y: number) => {
    const newPartials = [...config.mode.partials];
    newPartials[idx] = { ...newPartials[idx], posX: x, posY: y };
    applyConfig({
      ...config,
      mode: { ...config.mode, partials: newPartials }
    });
  };
"""
    content = content.replace("const handlePhaseReset = () => {", spatial_handler + "\n  const handlePhaseReset = () => {")

# Let's replace the grid layout from line 288 downwards
# It's easier to regex out the panels and rebuild the grid.
# Actually, the layout overlapping was caused by the 3rd column having too many items and overflowing the grid, or not wrapping properly.
# The grid ends with:
#   698:           </div>
#   699:       </div>
# Let's just restructure the whole grid container.


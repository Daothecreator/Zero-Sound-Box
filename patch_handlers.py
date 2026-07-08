with open('components/AcousticSynthesizer.tsx', 'r') as f:
    content = f.read()

if "import BinauralFieldMap" not in content:
    content = content.replace("import AudioVisualizer", "import BinauralFieldMap from './BinauralFieldMap';\nimport AudioVisualizer")

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

if "handleSpatialChange" not in content:
    content = content.replace("const handlePhaseReset = () => {", spatial_handler + "\n  const handlePhaseReset = () => {")

# Also need to fix the HighRes and AdvancedPsycho block's `w-full px-4 mt-6` containers
# Since they are now inside a flex column `space-y-6`, we don't need `w-full px-4 mt-6`.
import re
# Strip <div className="w-full px-4 mt-6"> ... </div> around them.
# The `HighRes` block starts with `      {/* High-Resolution Ambisonics & Microdynamics Panel */}`
# then `      <div className="w-full px-4 mt-6">`
# Let's just fix it.

content = content.replace('<div className="w-full px-4 mt-6">\n        <div className="bg-white/5 p-6 rounded-2xl border border-white/10', '<div className="bg-white/5 p-6 rounded-2xl border border-white/10')
content = content.replace('<div className="w-full px-4 mt-6">\n          <div className="bg-white/5 p-6 rounded-2xl border border-white/10', '<div className="bg-white/5 p-6 rounded-2xl border border-white/10')
# We need to remove the extra closing divs.
# But it's easier to just use re.sub or a quick python fix.

with open('components/AcousticSynthesizer.tsx', 'w') as f:
    f.write(content)


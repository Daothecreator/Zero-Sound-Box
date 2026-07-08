import re

with open('components/AcousticSynthesizer.tsx', 'r') as f:
    lines = f.readlines()

def get_block(start_marker, end_marker=None):
    start_idx = -1
    for i, l in enumerate(lines):
        if start_marker in l:
            start_idx = i
            break
    if start_idx == -1: return []
    
    if end_marker:
        end_idx = -1
        for i in range(start_idx+1, len(lines)):
            if end_marker in lines[i]:
                end_idx = i
                break
        return lines[start_idx:end_idx]
    return []

# We can manually define the ranges based on the previous output
ranges = {
    "MainFrequencies": (290, 368),
    "Psychoacoustics": (373, 477),
    "NoiseGenerator": (479, 514),
    "RFGenerator": (520, 577),
    "EMFPanel": (579, 625),
    "HarmonicDecay": (627, 652),
    "PhaseAlignment": (654, 687),
    "InfoBox": (689, 697),
    "HighRes": (700, 734),
    "AdvancedPsycho": (737, 793)
}

blocks = {}
for name, (start, end) in ranges.items():
    blocks[name] = "".join(lines[start-1:end])

# Now let's construct the new grid layout
new_grid = f"""
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 px-4 pt-4">
          {'{/* Column 1 */}'}
          <div className="space-y-6">
{blocks["MainFrequencies"]}
{blocks["HighRes"]}
          </div>

          {'{/* Column 2 */}'}
          <div className="space-y-6">
{blocks["Psychoacoustics"]}
            {'{/* Binaural Field Map Panel */}'}
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col">
              <div className="flex items-center space-x-2 border-b border-white/10 pb-3 mb-4">
                <svg className="w-4 h-4 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20"/></svg>
                <h2 className="text-sm font-mono text-white/80 uppercase tracking-widest">Binaural Spatialization</h2>
              </div>
              <BinauralFieldMap partials={{config.mode.partials}} onChange={{handleSpatialChange}} />
            </div>
{blocks["AdvancedPsycho"]}
          </div>

          {'{/* Column 3 */}'}
          <div className="space-y-6">
{blocks["HarmonicDecay"]}
{blocks["PhaseAlignment"]}
{blocks["RFGenerator"]}
{blocks["EMFPanel"]}
{blocks["NoiseGenerator"]}
{blocks["InfoBox"]}
          </div>
        </div>
"""

# Replace the old grid and following panels up to the end of AdvancedPsycho
new_lines = lines[:287] + [new_grid] + lines[794:]
with open('components/AcousticSynthesizer.tsx', 'w') as f:
    f.writelines(new_lines)

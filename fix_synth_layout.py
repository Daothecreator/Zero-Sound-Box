import re

with open("components/AcousticSynthesizer.tsx", "r") as f:
    content = f.read()

part1 = content.split('return (')[0]
part2 = content.split('<div className="flex justify-center flex-wrap gap-4 pt-4">')[1]

new_middle = """return (
    <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center p-4 md:p-8 z-10 bg-black/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl mt-8 mb-16">
      <div className="z-10 flex flex-col items-center space-y-8 w-full pt-2 pb-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-light tracking-widest text-white/90">NEURO-ACOUSTIC MODULATOR</h1>
          <p className="text-sm text-white/50 font-mono tracking-widest uppercase mb-6">
            Physiological & Psychoacoustic Frequency Engine
          </p>
        </div>
        
        <div className="w-full h-[350px] md:h-[500px] rounded-2xl overflow-hidden border border-white/10 relative shadow-[0_0_50px_rgba(255,255,255,0.05)] bg-black/80">
           <AudioVisualizer isPlaying={isPlaying} frequency={config.leftFreq} config={config} activeMode={activeMode} />
        </div>
        
        <div className="flex justify-center flex-wrap gap-4 pt-4">"""

content = part1 + new_middle + part2
content = content.replace("    </div>\n    </>\n  );\n}", "    </div>\n  );\n}")

with open("components/AcousticSynthesizer.tsx", "w") as f:
    f.write(content)

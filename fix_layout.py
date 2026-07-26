import re

with open("components/AcousticSynthesizer.tsx", "r") as f:
    content = f.read()

# Replace the return block wrapper
old_return = """  return (
    <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center p-4 md:p-8 z-10 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden mt-8 mb-16">
      <div className="absolute inset-0 z-[-1] pointer-events-none"> 
        <AudioVisualizer isPlaying={isPlaying} frequency={config.leftFreq} config={config} />
      </div>"""

new_return = """  return (
    <>
      <AudioVisualizer isPlaying={isPlaying} frequency={config.leftFreq} config={config} />
      <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center p-4 md:p-8 z-10 bg-black/30 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl mt-8 mb-16">"""

if old_return in content:
    content = content.replace(old_return, new_return)
else:
    print("Could not find old return block. I will try regex.")
    
    pattern = r'return \(\s*<div className="relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center p-4 md:p-8 z-10 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden mt-8 mb-16">\s*<div className="absolute inset-0 z-\[-1\] pointer-events-none">\s*<AudioVisualizer isPlaying=\{isPlaying\} frequency=\{config\.leftFreq\} config=\{config\} />\s*</div>'
    
    if re.search(pattern, content):
        content = re.sub(pattern, new_return, content)
    else:
        print("Regex failed too.")

# Also close the fragment at the end.
# Look for the last `</div>` before `  );`
end_pattern = r'    </div>\s*\);\s*\}'
new_end = r'    </div>\n    </>\n  );\n}'

content = re.sub(end_pattern, new_end, content)

with open("components/AcousticSynthesizer.tsx", "w") as f:
    f.write(content)

import re

with open("components/AcousticSynthesizer.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "<AudioVisualizer isPlaying={isPlaying} frequency={config.leftFreq} />",
    "<AudioVisualizer isPlaying={isPlaying} frequency={config.leftFreq} config={config} />"
)

with open("components/AcousticSynthesizer.tsx", "w") as f:
    f.write(content)

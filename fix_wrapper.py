import re

with open("components/AcousticSynthesizer.tsx", "r") as f:
    content = f.read()

content = content.replace("  return (\n    <div className=\"relative w-full", "  return (\n    <>\n    <div className=\"relative w-full")
content = content.replace("    </div>\n  );\n}", "    </div>\n    </>\n  );\n}")

with open("components/AcousticSynthesizer.tsx", "w") as f:
    f.write(content)

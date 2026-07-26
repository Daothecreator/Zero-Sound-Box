with open("components/AcousticSynthesizer.tsx", "r") as f:
    content = f.read()

content = content.replace("      )}\n  );\n}", "      )}\n    </>\n  );\n}")

with open("components/AcousticSynthesizer.tsx", "w") as f:
    f.write(content)

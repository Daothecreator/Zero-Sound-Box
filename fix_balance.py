with open("components/AcousticSynthesizer.tsx", "r") as f:
    content = f.read()

# I will simply count and fix the wrapper.
# Remove the `<>` and `</>`
content = content.replace("<>\n    <div className=\"relative w-full", "<div className=\"relative w-full")
content = content.replace("    </div>\n    </>\n  );\n}", "  );\n}")

# Now we have stripped the fragment and the last closing div.
# Let's count divs.
num_open = content.count("<div")
num_close = content.count("</div")

print(f"Open: {num_open}, Close: {num_close}")

if num_open > num_close:
    content = content.replace("  );\n}", "    </div>\n" * (num_open - num_close) + "  );\n}")
elif num_close > num_open:
    # Too many closing divs. We need to remove some from the end.
    # The end of the file looks like:
    #     </div>
    #   );
    # }
    for _ in range(num_close - num_open):
        content = content.replace("    </div>\n  );\n}", "  );\n}")

with open("components/AcousticSynthesizer.tsx", "w") as f:
    f.write(content)

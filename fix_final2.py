import re

with open("components/AcousticSynthesizer.tsx", "r") as f:
    content = f.read()

# Make sure it's not already wrapped.
if "return (\n    <>\n" not in content:
    content = content.replace("  return (\n    <div className=\"relative w-full max-w-6xl mx-auto", "  return (\n    <>\n    <div className=\"relative w-full max-w-6xl mx-auto")

# Make sure the end is properly wrapped
end_str = """      )}
    </div>
  );
}"""

new_end_str = """      )}
    </>
  );
}"""

content = content.replace(end_str, new_end_str)

with open("components/AcousticSynthesizer.tsx", "w") as f:
    f.write(content)

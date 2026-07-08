import re

with open('components/AcousticSynthesizer.tsx', 'r') as f:
    content = f.read()

# Extract the Advanced Psychoacoustics panel
panel_pattern = r'(\s*\{/\* Advanced Psychoacoustics & Phenomena Panel \*/\}.*?)(?=\s*\{/\* Info box \*/\})'
match = re.search(panel_pattern, content, re.DOTALL)

if match:
    panel_code = match.group(1)
    
    # Remove it from its current position
    content = content.replace(panel_code, '')
    
    # Insert it right after the closing div of the grid (wait, we need it INSIDE the grid at the end)
    # The grid ends right before the closing div for the main container.
    # Let's find the end of the grid. It's right after the 3rd column's </div>
    
    grid_end_pattern = r'(            \{/\* Info box \*/\}.*?            \)\}\n          </div>\n\n        </div>)'
    
    content = re.sub(grid_end_pattern, r'\1' + '\n' + panel_code, content, flags=re.DOTALL)
    
    with open('components/AcousticSynthesizer.tsx', 'w') as f:
        f.write(content)
        print("Fixed panel position")
else:
    print("Could not find panel")


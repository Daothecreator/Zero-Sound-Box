import re

with open('components/AcousticSynthesizer.tsx', 'r') as f:
    content = f.read()

# The panel is currently after the grid's closing </div>.
panel_pattern = r'\n\n            \{/\* Advanced Psychoacoustics & Phenomena Panel \*/\}.*'

match = re.search(panel_pattern, content, re.DOTALL)
if match:
    panel_code = match.group(0)
    
    # Remove it from the bottom
    content = content.replace(panel_code, '')
    
    # Now find the end of the grid:
    # It's marked by:
    #           </div>
    #
    #         </div>
    
    grid_end_pattern = r'(\s*\n\s*</div>\n\n\s*)(</div>\s*</div>\s*\{/\* DSP Diagnostics \*/\})'
    # Actually wait, let's just find `        </div>\n      </div>\n      \n      {/* Volume Slider */}`
    
    # We can just look for the end of the 3rd column:
    #             )}
    #           </div>
    #
    #         </div>
    
    target_insert = r'(            \)\}\n          </div>)'
    
    content = re.sub(target_insert, r'\1\n' + panel_code + '\n', content)
    
    with open('components/AcousticSynthesizer.tsx', 'w') as f:
        f.write(content)
        print("Panel put inside grid")
else:
    print("Could not find panel")

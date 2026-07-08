import re

with open('components/AcousticSynthesizer.tsx', 'r') as f:
    content = f.read()

# Strip any stray </div> at the end that my bad script added:
content = re.sub(r'\n\n\n        </div>\n$', '\n', content)

panel_pattern = r'            \{/\* Advanced Psychoacoustics & Phenomena Panel \*/\}.*?            </div>\n'
match = re.search(panel_pattern, content, re.DOTALL)
if match:
    panel_code = match.group(0)
    # Remove it
    content = content.replace(panel_code, '')
    
    # Place it directly inside the grid
    # Looking for:
    #             )}
    #           </div>
    #         </div>
    #       </div>
    #       
    #       {/* Volume Slider */}
    
    target_pattern = r'(            \)\}\n          </div>\n\n)(\s*)(</div>\s*</div>\s*\{/\* Volume Slider \*/\})'
    content = re.sub(target_pattern, r'\1' + panel_code + r'\n\2\3', content)
    
    with open('components/AcousticSynthesizer.tsx', 'w') as f:
        f.write(content)
        print("Panel injected properly")
else:
    print("Could not find panel")

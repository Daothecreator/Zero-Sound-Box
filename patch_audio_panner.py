import re

with open('lib/audio.ts', 'r') as f:
    content = f.read()

# Add to interface
content = content.replace(
    "phase?: number;", 
    "phase?: number;\n  posX?: number;\n  posY?: number;"
)

# Replace the block around panner.rolloffFactor = 1;
old_block = """        panner.rolloffFactor = 1;

        if (p.orbitSpeed > 0 && panner.positionX) {"""

new_block = """        panner.rolloffFactor = 1;
        
        const px = (p.posX || 0) * 5;
        const pz = (p.posY || 0) * 5;
        if (panner.positionX) {
           panner.positionX.value = px;
           panner.positionY.value = 0;
           panner.positionZ.value = pz;
        } else {
           panner.setPosition(px, 0, pz);
        }

        if (p.orbitSpeed > 0 && panner.positionX) {"""

content = content.replace(old_block, new_block)

# Let's verify the change worked
with open('lib/audio.ts', 'w') as f:
    f.write(content)

import re

with open("components/AcousticSynthesizer.tsx", "r") as f:
    content = f.read()

# Replace the 3-column grid container with a more responsive one that wraps correctly and 
# ensures columns don't squash each other on mobile.

# It currently looks like: <div className="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 px-4 pt-4">

content = content.replace(
    '<div className="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 px-4 pt-4">',
    '<div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4 pt-4 md:px-8 max-h-[70vh] overflow-y-auto custom-scrollbar">'
)

# Replace other grids
content = content.replace(
    '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">',
    '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 relative z-10">'
)

content = content.replace(
    '<div className="grid grid-cols-1 md:grid-cols-3 gap-4">',
    '<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">'
)

content = content.replace(
    '<div className="grid grid-cols-2 md:grid-cols-4 gap-4">',
    '<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">'
)

content = content.replace(
    '<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">',
    '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">'
)

content = content.replace(
    '<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">',
    '<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-8">'
)

with open("components/AcousticSynthesizer.tsx", "w") as f:
    f.write(content)

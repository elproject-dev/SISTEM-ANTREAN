import re

with open('apps/sistem-antrean/tailwind.config.js', 'r') as f:
    content = f.read()

# Add keyframes and animation inside extend: {
extend_block = """    extend: {
      keyframes: {
        zoomInOut: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        }
      },
      animation: {
        'zoom-in-out': 'zoomInOut 3s ease-in-out infinite',
      },"""

content = content.replace("    extend: {", extend_block)

with open('apps/sistem-antrean/tailwind.config.js', 'w') as f:
    f.write(content)

print("Success adding zoom animation to tailwind config")

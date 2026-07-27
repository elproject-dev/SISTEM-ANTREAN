import re

with open('apps/sistem-antrean/src/index.css', 'r') as f:
    content = f.read()

font_css = """@font-face {
  font-family: 'Plus Jakarta Sans Bold';
  src: url('/Fonts/PlusJakartaSans-Bold.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

:root {
  --app-font-sans: 'Plus Jakarta Sans Bold', sans-serif;
}

* {
  font-family: var(--app-font-sans) !important;
}

"""

# Insert right after @source "../../../packages/ui/src";
target = '@source "../../../packages/ui/src";'
content = content.replace(target, target + "\n\n" + font_css)

with open('apps/sistem-antrean/src/index.css', 'w') as f:
    f.write(content)

print("Success setting font")

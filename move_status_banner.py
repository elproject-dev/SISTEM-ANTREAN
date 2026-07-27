import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

status_banner_pattern = r"(\s*{/\* Status Banner \*/}.*?)(?=\s*<div className=\{`bg-white rounded-2xl border-2 overflow-hidden)"

match = re.search(status_banner_pattern, content, re.DOTALL)
if match:
    status_banner = match.group(1)
    
    # Remove from left column
    content = content.replace(status_banner, "")
    
    # Insert it right before Menunggu Panggilan
    menunggu_pattern = r"(\s*{/\* ── Antrean Menunggu ── \*/})"
    content = re.sub(menunggu_pattern, lambda m: status_banner + m.group(1), content, count=1)
    
    with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
        f.write(content)
    print("Success")
else:
    print("Failed to find status banner")

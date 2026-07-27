import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

# Change background of the banner for busy state
content = content.replace(
    "liveOp.status === 'busy' ? 'bg-orange-50 border-orange-200 text-orange-700'",
    "liveOp.status === 'busy' ? 'bg-amber-500 border-amber-500 text-white shadow-sm'"
)

# Change the pulsing dot color for busy state
content = content.replace(
    "bg-orange-400",
    "bg-amber-200"
)

# Change the solid dot color for busy state
content = content.replace(
    "liveOp.status === 'busy' ? 'bg-orange-500'",
    "liveOp.status === 'busy' ? 'bg-white'"
)

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
    f.write(content)
print("Success fix status banner")

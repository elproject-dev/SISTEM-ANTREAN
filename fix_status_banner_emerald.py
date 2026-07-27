import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

# Change background of the banner for available state
content = content.replace(
    "liveOp.status === 'available' ? 'bg-emerald-50 border-emerald-200 text-emerald-700'",
    "liveOp.status === 'available' ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'"
)

# Change the pulsing dot color for available state
content = content.replace(
    "liveOp.status === 'available' ? 'bg-emerald-400'",
    "liveOp.status === 'available' ? 'bg-emerald-200'"
)

# Change the solid dot color for available state
content = content.replace(
    "liveOp.status === 'available' ? 'bg-emerald-500'",
    "liveOp.status === 'available' ? 'bg-white'"
)

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
    f.write(content)
print("Success fix status banner emerald")

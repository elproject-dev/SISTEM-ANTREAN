import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

# Replace busy banner class
content = content.replace(
    ": liveOp.status === 'busy' ? 'bg-amber-500 border-amber-500 text-white shadow-sm'",
    ": liveOp.status === 'busy' ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm'"
)

# Fix ping color for busy
content = content.replace(
    "${liveOp.status === 'available' ? 'bg-emerald-200' : 'bg-amber-200'}",
    "${liveOp.status === 'available' ? 'bg-emerald-200' : 'bg-amber-400'}"
)

# Fix dot color for busy (which was bg-white)
content = content.replace(
    "bg-white' : liveOp.status === 'busy' ? 'bg-white'",
    "bg-white' : liveOp.status === 'busy' ? 'bg-amber-500'"
)


with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
    f.write(content)

print("Success fix busy banner")

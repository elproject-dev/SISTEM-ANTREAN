import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

# We need to find the layout of the checklist button
# Original:
# <button key={s.code} ... className={`flex items-center gap-3 ...`}>
#   <div className={`w-5 h-5 ...`}> ... </div>
#   <span className="truncate">{s.name} ({s.code})</span>
# </button>

# Let's target the exact rendering block for the services map.
start_marker = "{SERVICES.map((s) => {"
end_marker = "</div>\n              )}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx)

if start_idx != -1 and end_idx != -1:
    block = content[start_idx:end_idx]
    
    # 1. Change justify to 'justify-between'
    block = block.replace("flex items-center gap-3", "flex items-center justify-between gap-3")
    
    # 2. Swap the span and the div
    # We can extract the div and the span
    div_start = block.find("<div className={`w-5 h-5")
    span_start = block.find("<span className=\"truncate\">", div_start)
    button_end = block.find("</button>", span_start)
    
    if div_start != -1 and span_start != -1 and button_end != -1:
        div_block = block[div_start:span_start]
        span_block = block[span_start:button_end]
        
        # New order: span_block then div_block
        new_block = block[:div_start] + span_block + div_block + block[button_end:]
        
        content = content[:start_idx] + new_block + content[end_idx:]
        
        with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
            f.write(content)
        print("Success moving checkbox")
    else:
        print("Could not parse button internals")
else:
    print("Could not find block")


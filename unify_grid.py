import re

with open('apps/sistem-antrean/src/pages/StaffPage.tsx', 'r') as f:
    content = f.read()

# Currently we have two grid containers:
old_grid_1_start = '<div className="grid grid-cols-1 md:grid-cols-3 gap-4">'
old_grid_2_start = '<div className="grid grid-cols-1 md:grid-cols-3 gap-4">'

# Replace the first one with grid-cols-6
new_grid_start = '<div className="grid grid-cols-1 md:grid-cols-6 gap-4">'

# We need to change the immediate children to md:col-span-2
# The children start with <div className="space-y-1.5"> or <div className="space-y-1.5 flex flex-col justify-end">

# We can just do a precise replace for the whole form content to be safe.
form_pattern = r'<form onSubmit=\{handleEditSubmit\} className="space-y-5">(.*?)</form>'

match = re.search(form_pattern, content, re.DOTALL)
if match:
    inner = match.group(1)
    
    # Remove the split between the two grids:
    # </div>\n            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    inner = re.sub(r'</div>\s*<div className="grid grid-cols-1 md:grid-cols-3 gap-4">', '', inner)
    
    # Replace the top grid class
    inner = inner.replace('<div className="grid grid-cols-1 md:grid-cols-3 gap-4">', '<div className="grid grid-cols-1 md:grid-cols-6 gap-4">')
    
    # Now replace the immediate space-y-1.5 with md:col-span-2 space-y-1.5
    # Be careful not to replace inner space-y things if there are any.
    inner = inner.replace('<div className="space-y-1.5">', '<div className="md:col-span-2 space-y-1.5">')
    inner = inner.replace('<div className="space-y-1.5 flex flex-col justify-end">', '<div className="md:col-span-2 space-y-1.5 flex flex-col justify-end">')
    
    # We should make the "Aksi" label visible on mobile too so they align well on mobile
    inner = inner.replace('className="text-sm font-semibold text-transparent select-none hidden md:block"', 'className="text-sm font-semibold text-transparent select-none"')
    
    new_form = f'<form onSubmit={{handleEditSubmit}} className="space-y-5">{inner}</form>'
    content = content[:match.start()] + new_form + content[match.end():]
    
    with open('apps/sistem-antrean/src/pages/StaffPage.tsx', 'w') as f:
        f.write(content)
    print("Success unifying grid")
else:
    print("Form not found")


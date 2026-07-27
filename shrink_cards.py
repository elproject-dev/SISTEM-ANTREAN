import re

files = [
    'apps/sistem-antrean/src/pages/RegisterPage.tsx',
    'apps/sistem-antrean/src/pages/LoginPage.tsx'
]

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    # Container width & spacing
    content = content.replace('max-w-[400px]', 'max-w-[320px]')
    content = content.replace('mb-6 mt-6', 'mb-4 mt-4')
    content = content.replace('py-6', 'py-4')
    
    # Title card
    content = content.replace('px-6 py-5 rounded-[2rem]', 'px-5 py-3.5 rounded-2xl')
    content = content.replace('text-2xl sm:text-3xl', 'text-lg sm:text-xl')
    
    # Main card padding & rounded
    content = content.replace('rounded-[2rem]', 'rounded-3xl')
    content = content.replace('p-6 sm:p-8', 'p-5 sm:p-6')
    
    # Gaps
    content = content.replace('space-y-4', 'space-y-2.5')
    content = content.replace('space-y-2.5', 'space-y-1.5')
    content = content.replace('space-y-1.5', 'space-y-1')
    
    # Input heights
    content = content.replace('h-11', 'h-9 text-xs')
    content = content.replace('h-12', 'h-9 text-xs')
    content = content.replace('pl-11', 'pl-9')
    content = content.replace('pr-12', 'pr-10')
    content = content.replace('left-4', 'left-3')
    content = content.replace('right-4', 'right-3')
    
    # Icon sizes
    content = content.replace('w-4\nh-4', 'w-3.5 h-3.5')
    content = content.replace('w-4 h-4', 'w-3.5 h-3.5')
    content = content.replace('w-5 h-5', 'w-4 h-4')
    
    # Margins and specific sizes
    content = content.replace('mt-8', 'mt-5')
    content = content.replace('mt-6', 'mt-4')
    
    # Make buttons smaller
    # CustomButton uses text-sm py-2 px-4 usually. If we add h-9 it will shrink
    content = content.replace('className="w-full mt-8"', 'className="w-full mt-5 h-9 text-xs"')
    content = content.replace('className="w-full mt-5"', 'className="w-full mt-5 h-9 text-xs"')
    
    with open(file_path, 'w') as f:
        f.write(content)

print("Success shrinking cards")

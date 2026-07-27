import re

files = [
    'apps/sistem-antrean/src/pages/RegisterPage.tsx',
    'apps/sistem-antrean/src/pages/LoginPage.tsx'
]

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    # Change max width to make it wider and elegant
    content = content.replace('max-w-[320px]', 'max-w-[420px]')
    
    with open(file_path, 'w') as f:
        f.write(content)

print("Success widening cards")

import re

with open('apps/sistem-antrean/src/pages/RegisterPage.tsx', 'r') as f:
    content = f.read()

# 1. Remove unused icons (Briefcase)
content = re.sub(r',\s*Briefcase', '', content)
content = re.sub(r'Briefcase,\s*', '', content)

# 2. Remove unused Select imports
content = re.sub(r'import\s*\{\s*Select,\s*SelectContent,\s*SelectItem,\s*SelectTrigger,\s*SelectValue\s*\}\s*from\s*["\']@elproject/ui["\'];?\s*\n', '', content)

# 3. Remove setRole from state since role defaults to 'operator' and we don't change it
content = re.sub(r'const\s*\[role,\s*setRole\]\s*=\s*useState<StaffRole>\(\'operator\'\);', r"const role: StaffRole = 'operator';", content)

with open('apps/sistem-antrean/src/pages/RegisterPage.tsx', 'w') as f:
    f.write(content)

print("Success cleaning RegisterPage")

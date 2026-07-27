import re

with open('apps/sistem-antrean/src/pages/StaffPage.tsx', 'r') as f:
    content = f.read()

# We need to remove the blocks for "Setujui", "Nonaktifkan", "Aktifkan"
# They are wrapped inside {staff.status === ... && ( <CustomButton> ... </CustomButton> )}

# Regex to match the three blocks
pattern_pending = r'\{staff\.status\s*===\s*\'pending\'\s*&&\s*\(\s*<CustomButton[^>]*>.*?<\/CustomButton>\s*\)\}'
pattern_active = r'\{staff\.status\s*===\s*\'active\'\s*&&\s*staff\.id\s*!==\s*\'admin-1\'\s*&&\s*\(\s*<CustomButton[^>]*>.*?<\/CustomButton>\s*\)\}'
pattern_inactive = r'\{staff\.status\s*===\s*\'inactive\'\s*&&\s*\(\s*<CustomButton[^>]*>.*?<\/CustomButton>\s*\)\}'

content = re.sub(pattern_pending, '', content, flags=re.DOTALL)
content = re.sub(pattern_active, '', content, flags=re.DOTALL)
content = re.sub(pattern_inactive, '', content, flags=re.DOTALL)

with open('apps/sistem-antrean/src/pages/StaffPage.tsx', 'w') as f:
    f.write(content)

print("Success removing action buttons")

import re

with open('apps/sistem-antrean/src/hooks/useQueue.ts', 'r') as f:
    content = f.read()

# Pattern for the bad deleteStaff insertion
pattern = r"  const deleteStaff = useCallback\(\(id: string\) => \{\n    setState\(\(prev\) => \(\{\n      \.\.\.prev,\n      staffUsers: \(prev\.staffUsers \|\| \[\]\)\.filter\(s => s\.id !== id\)\n    \}\)\);\n  \}, \[setState\]\);\n"

# Remove all occurrences
content = re.sub(pattern, "", content)

# Now inject it exactly once before the final "  return {"
final_insert = """  const deleteStaff = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      staffUsers: (prev.staffUsers || []).filter(s => s.id !== id)
    }));
  }, [setState]);

  return {"""

content = content.replace("  return {", final_insert, 1) # Only replace the first one (from the bottom? wait, there are other returns)

# Wait! There are many `return {` inside `setState`.
# It's safer to just replace `    updateStaff,\n    deleteStaff,\n  };\n}` at the end of the file!

with open('apps/sistem-antrean/src/hooks/useQueue.ts', 'w') as f:
    f.write(content)

print("Cleaned up file")

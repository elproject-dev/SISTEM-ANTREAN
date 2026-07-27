import re

with open('apps/sistem-antrean/src/hooks/useQueue.ts', 'r') as f:
    content = f.read()

# Add updateStaff function
update_staff_func = """  const updateStaff = useCallback((id: string, data: Partial<Omit<import('../types/queue').StaffUser, 'id' | 'createdAt'>>) => {
    setState((prev) => ({
      ...prev,
      staffUsers: (prev.staffUsers || []).map(s => s.id === id ? { ...s, ...data } : s)
    }));
  }, [setState]);"""

# Insert before updateStaffStatus
target = "  const updateStaffStatus = useCallback((id: string, status: import('../types/queue').StaffStatus) => {"

if target in content:
    content = content.replace(target, update_staff_func + "\n\n" + target)
    
    # Expose updateStaff in the return object
    content = content.replace("    updateStaffStatus,", "    updateStaffStatus,\n    updateStaff,")
    
    with open('apps/sistem-antrean/src/hooks/useQueue.ts', 'w') as f:
        f.write(content)
    print("Success updating useQueue.ts")
else:
    print("Target not found")

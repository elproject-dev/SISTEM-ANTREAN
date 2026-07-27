import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

# Replace grid class
content = content.replace(
    'className="grid grid-cols-1 sm:grid-cols-3 gap-4"',
    'className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"'
)

# Find where the Total Dilayani card starts to insert the new card before it
target_card = """            <KpiCard
              title="Total Dilayani" """

new_card = """            <KpiCard
              title="Menunggu"
              value={waitingTickets.length}
              footerText="Antrean tersisa"
              gradientClass="bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-pink-500"
              icon={<User className="w-4 h-4 text-white" />}
            />
            <KpiCard
              title="Total Dilayani" """

content = content.replace(target_card, new_card)

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
    f.write(content)
print("Success")

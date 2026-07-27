import re

with open('apps/sistem-antrean/src/pages/StaffPage.tsx', 'r') as f:
    content = f.read()

old_buttons = """                <div className="flex gap-3 h-11">
                  <CustomButton
                    type="button"
                    variant="slate"
                    className="flex-1 h-full"
                    onClick={() => setIsEditOpen(false)}
                  >
                    Batal
                  </CustomButton>
                  <CustomButton
                    type="submit"
                    variant="primary"
                    className="flex-1 h-full"
                  >
                    Simpan
                  </CustomButton>
                </div>"""

new_buttons = """                <div className="flex gap-3 h-11">
                  <button
                    type="button"
                    className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                    onClick={() => setIsEditOpen(false)}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all"
                  >
                    Simpan
                  </button>
                </div>"""

content = content.replace(old_buttons, new_buttons)

with open('apps/sistem-antrean/src/pages/StaffPage.tsx', 'w') as f:
    f.write(content)

print("Success changing to flat buttons")

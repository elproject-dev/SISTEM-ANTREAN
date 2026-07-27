import re

with open('apps/sistem-antrean/src/pages/StaffPage.tsx', 'r') as f:
    content = f.read()

# Replace the flat buttons with CustomButton with override classes
old_buttons = """                <div className="flex gap-3 h-11">
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

new_buttons = """                <div className="flex gap-3 h-11 items-start">
                  <CustomButton
                    type="button"
                    variant="slate"
                    className="flex-1 !min-h-[40px] !h-[40px] !py-0"
                    onClick={() => setIsEditOpen(false)}
                  >
                    Batal
                  </CustomButton>
                  <CustomButton
                    type="submit"
                    variant="primary"
                    className="flex-1 !min-h-[40px] !h-[40px] !py-0"
                  >
                    Simpan
                  </CustomButton>
                </div>"""

content = content.replace(old_buttons, new_buttons)

with open('apps/sistem-antrean/src/pages/StaffPage.tsx', 'w') as f:
    f.write(content)

print("Success changing to 3D precise buttons")

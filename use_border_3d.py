import re

with open('apps/sistem-antrean/src/pages/StaffPage.tsx', 'r') as f:
    content = f.read()

old_buttons = """                <div className="flex gap-3 h-11 items-start">
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

new_buttons = """                <div className="flex gap-3 h-11">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="flex-1 h-11 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl border-b-4 border-slate-900 active:border-b-0 active:translate-y-[4px] transition-all flex items-center justify-center"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl border-b-4 border-orange-700 active:border-b-0 active:translate-y-[4px] transition-all flex items-center justify-center"
                  >
                    Simpan
                  </button>
                </div>"""

content = content.replace(old_buttons, new_buttons)

with open('apps/sistem-antrean/src/pages/StaffPage.tsx', 'w') as f:
    f.write(content)

print("Success changing to border 3D buttons")

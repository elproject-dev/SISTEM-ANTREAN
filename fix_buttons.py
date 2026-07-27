import re

with open('apps/sistem-antrean/src/pages/StaffPage.tsx', 'r') as f:
    content = f.read()

# Replace the buttons wrapper div
old_buttons_wrapper = """              <div className="flex items-end gap-3">
                <CustomButton
                  type="button"
                  variant="slate"
                  className="flex-1 h-11"
                  onClick={() => setIsEditOpen(false)}
                >
                  Batal
                </CustomButton>
                <CustomButton
                  type="submit"
                  variant="primary"
                  className="flex-1 h-11"
                >
                  Simpan
                </CustomButton>
              </div>"""

new_buttons_wrapper = """              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="text-sm font-semibold text-transparent select-none hidden md:block" aria-hidden="true">Aksi</label>
                <div className="flex gap-3 h-11">
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
                </div>
              </div>"""

content = content.replace(old_buttons_wrapper, new_buttons_wrapper)

with open('apps/sistem-antrean/src/pages/StaffPage.tsx', 'w') as f:
    f.write(content)

print("Success fixing buttons alignment")

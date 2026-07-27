import re

with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'r') as f:
    content = f.read()

# We need to find the block starting with "{/* ── Table Section ── */}"
# that appears BEFORE "function OperatorDashboard("
dashboard_start = content.find("function OperatorDashboard(")
if dashboard_start != -1:
    # Find the Table Section within the OperatorLoginForm
    table_section_idx = content.find("{/* ── Table Section ── */}")
    
    if table_section_idx != -1 and table_section_idx < dashboard_start:
        # Now find where this Table Section ends. It ends with the closing div of the table container:
        #           </table>
        #         </div>
        #       </div>
        # Let's search for "</table>\n        </div>\n      </div>" after table_section_idx
        end_marker = "</table>\n        </div>\n      </div>"
        table_end_idx = content.find(end_marker, table_section_idx)
        
        if table_end_idx != -1 and table_end_idx < dashboard_start:
            # Add the length of the end_marker
            cut_end = table_end_idx + len(end_marker)
            
            # The text to remove is content[table_section_idx:cut_end]
            new_content = content[:table_section_idx] + content[cut_end:]
            
            with open('apps/sistem-antrean/src/pages/OperatorPage.tsx', 'w') as f:
                f.write(new_content)
            print("Successfully removed duplicate Table Section")
        else:
            print("Could not find end of table section")
    else:
        print("Could not find table section inside OperatorLoginForm")
else:
    print("Could not find OperatorDashboard")


import os

file_path = r"c:\Users\bm424\Downloads\college-web-main\college-web-main\static\visual_editor.js"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Target the switchPropTab function
# It looks like:
# window.switchPropTab = (tab) => {
#    activePropTab = tab;
#    document.querySelectorAll('.properties-panel .tab-btn').forEach(b => b.classList.remove('active'));
#    event.target.classList.add('active'); // Assume click event context
#
#    if (selectedElement) {
#        updatePropertiesPanel(selectedElement);
#    } else {
# ...

start_marker = "window.switchPropTab = (tab) => {"
end_marker = "};" # This is risky if there are nested braces

# Let's target the exact block we want to replace
original_block = """window.switchPropTab = (tab) => {
    activePropTab = tab;
    document.querySelectorAll('.properties-panel .tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active'); // Assume click event context

    if (selectedElement) {
        updatePropertiesPanel(selectedElement);
    } else {
        // If no element selected, render appropriate view
        if (tab === 'code') {
            renderGlobalCodeEditor();
        } else {
            document.getElementById('propertiesContent').innerHTML = `
                <div class="empty-state">
                    <p>Select an element on the canvas to edit its properties.</p>
                </div>`;
        }
    }
};"""

# New block with logic to add 'wide' class
new_block = """window.switchPropTab = (tab) => {
    activePropTab = tab;
    document.querySelectorAll('.properties-panel .tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active'); // Assume click event context

    // Handle Panel Resizing
    const panel = document.querySelector('.properties-panel');
    if (tab === 'code') {
        panel.classList.add('wide');
    } else {
        panel.classList.remove('wide');
    }

    if (selectedElement) {
        updatePropertiesPanel(selectedElement);
    } else {
        // If no element selected, render appropriate view
        if (tab === 'code') {
            renderGlobalCodeEditor();
        } else {
            document.getElementById('propertiesContent').innerHTML = `
                <div class="empty-state">
                    <p>Select an element on the canvas to edit its properties.</p>
                </div>`;
        }
    }
};"""

# Since strict matching is hard due to whitespace, let's just use the start marker and logic
start_idx = content.find(start_marker)

if start_idx != -1:
    # Find the matching closing brace for the function
    # simple stack counter
    cnt = 0
    found_start = False
    end_idx = -1
    
    for i in range(start_idx, len(content)):
        char = content[i]
        if char == '{':
            cnt += 1
            found_start = True
        elif char == '}':
            cnt -= 1
        
        if found_start and cnt == 0:
            end_idx = i + 1
            break
            
    if end_idx != -1:
        # Replace
        new_content = content[:start_idx] + new_block + content[end_idx:]
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("SUCCESS: File patched with resize logic.")
    else:
        print("ERROR: Could not find end of function block.")

else:
    print("ERROR: Function start marker not found.")


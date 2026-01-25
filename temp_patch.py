
import os

file_path = r"c:\Users\bm424\Downloads\college-web-main\college-web-main\static\visual_editor.js"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Marker Strings (trimmed to avoid whitespace issues)
start_marker = "if (activePropTab === 'code') {"
end_marker = "return; // Stop rendering visual props"

new_block = """    if (activePropTab === 'code') {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.height = '100%';

        // Navigation to Full Source
        const nav = document.createElement('div');
        nav.style.marginBottom = '1rem';
        nav.style.borderBottom = '1px solid #e5e7eb';
        nav.style.paddingBottom = '0.5rem';
        nav.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="font-size: 0.8rem; color: #4b5563;">Selected: &lt;${el.tagName.toLowerCase()}&gt;</strong>
                <button id="viewFullSourceBtn" style="font-size: 0.8rem; color: #2563eb; background: none; border: none; cursor: pointer; text-decoration: underline;">View Full Source</button>
            </div>
        `;

        const textarea = document.createElement('textarea');
        textarea.style.width = '100%';
        textarea.style.flex = '1';
        textarea.style.fontFamily = 'monospace';
        textarea.style.fontSize = '0.85rem';
        textarea.style.padding = '0.5rem';
        textarea.style.border = '1px solid #e5e7eb';
        textarea.style.borderRadius = '6px';
        textarea.style.marginBottom = '1rem';
        textarea.style.resize = 'none';
        textarea.value = el.outerHTML;

        const applyBtn = document.createElement('button');
        applyBtn.textContent = '⚡ Apply Changes';
        applyBtn.className = 'btn btn-primary';
        applyBtn.style.width = '100%';
        applyBtn.onclick = () => {
            try {
                const newHTML = textarea.value;
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = newHTML.trim();
                
                if (tempDiv.childElementCount !== 1) {
                    alert('Error: Code must result in exactly one root element to ensure stability.');
                    return;
                }
                
                const newEl = tempDiv.firstElementChild;
                el.replaceWith(newEl);
                selectElement(newEl); // Re-select the new element
                markChanged();
                alert('Code applied successfully!');
            } catch (e) {
                alert('Invalid HTML: ' + e.message);
            }
        };

        wrapper.appendChild(nav);
        wrapper.appendChild(textarea);
        wrapper.appendChild(applyBtn);
        panel.appendChild(wrapper);

        // Bind Back Button
        setTimeout(() => {
            const backBtn = document.getElementById('viewFullSourceBtn');
            if(backBtn) {
                backBtn.onclick = () => {
                    selectElement(null); 
                    renderGlobalCodeEditor();
                };
            }
        }, 50);

        return; // Stop rendering visual props
    }"""

start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx)

if start_idx != -1 and end_idx != -1:
    end_idx += len(end_marker) # Include the end marker
    # Calculate the closing brace of the if block
    # Actually, the original code had the closing brace AFTER the return?
    # Original:
    # return; // Stop rendering visual props
    # }
    
    # Let's find the closing brace after end_marker
    block_end = content.find("}", end_idx) + 1
    
    # Replace
    new_content = content[:start_idx] + new_block + content[block_end:]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("SUCCESS: File patched.")
else:
    print("ERROR: Markers not found.")
    print(f"Start: {start_idx}, End: {end_idx}")

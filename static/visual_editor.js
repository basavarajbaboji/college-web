/**
 * Visual Editor Engine
 * Handles element selection, two-way binding, style management, and component library.
 */

let selectedElement = null;
let currentStyles = {};
let hasUnsavedChanges = false;
let activeTab = 'components';

// --- Component Registry ---
const ComponentRegistry = [
    {
        id: 'hero',
        name: 'Hero Section',
        icon: '🖼️',
        desc: 'Big banner with image & text',
        html: `<section style="position: relative; padding: 4rem 2rem; text-align: center; background: #1e40af; color: white;">
    <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">Welcome to Excellence</h1>
    <p style="font-size: 1.25rem; max-width: 600px; margin: 0 auto 2rem;">Shaping the future of engineering through quality education and innovation.</p>
    <button style="background: white; color: #1e40af; padding: 0.75rem 2rem; border: none; font-weight: bold; border-radius: 50px; cursor: pointer;">Get Started</button>
</section>`
    },
    {
        id: 'cards-3',
        name: 'Feature Grid (3)',
        icon: '🍱',
        desc: '3-column feature cards',
        html: `<section style="padding: 4rem 2rem; background: white;">
    <h2 style="text-align: center; margin-bottom: 3rem; color: #1e293b;">Why Choose Us</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
        <div style="padding: 2rem; background: #f8fafc; border-radius: 12px; text-align: center;">
            <div style="font-size: 2.5rem; margin-bottom: 1rem;">🎓</div>
            <h3 style="margin-bottom: 0.5rem; color: #1e293b;">Expert Faculty</h3>
            <p style="color: #64748b;">Learn from the best in the field experienced industry leaders.</p>
        </div>
        <div style="padding: 2rem; background: #f8fafc; border-radius: 12px; text-align: center;">
            <div style="font-size: 2.5rem; margin-bottom: 1rem;">🔬</div>
            <h3 style="margin-bottom: 0.5rem; color: #1e293b;">Modern Labs</h3>
            <p style="color: #64748b;">State-of-the-art infrastructure for practical learning.</p>
        </div>
        <div style="padding: 2rem; background: #f8fafc; border-radius: 12px; text-align: center;">
            <div style="font-size: 2.5rem; margin-bottom: 1rem;">🚀</div>
            <h3 style="margin-bottom: 0.5rem; color: #1e293b;">Placements</h3>
            <p style="color: #64748b;">100% placement assistance in top MNCs.</p>
        </div>
    </div>
</section>`
    },
    {
        id: 'text-block',
        name: 'Text Content',
        icon: '📝',
        desc: 'Title plus paragraph',
        html: `<div style="padding: 2rem; max-width: 800px; margin: 0 auto;">
    <h2 style="color: #1e293b; margin-bottom: 1rem;">About Our Vision</h2>
    <p style="color: #475569; line-height: 1.6;">We strive to provide world-class education that empowers students to become leaders in their fields. Our curriculum is designed to meet industry standards.</p>
</div>`
    },
    {
        id: 'cta',
        name: 'Call to Action',
        icon: '📣',
        desc: 'Action band with button',
        html: `<div style="background: linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%); padding: 3rem 2rem; text-align: center; color: white; border-radius: 16px; margin: 2rem;">
    <h2 style="margin: 0 0 1rem 0;">Ready to Start Your Journey?</h2>
    <button style="background: white; color: #2563eb; padding: 0.75rem 2rem; border: none; font-weight: bold; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Apply Now</button>
</div>`
    }
];

// Design System Colors
const DesignColors = [
    { name: 'College Blue', value: '#1e40af' },
    { name: 'Gov Green', value: '#059669' },
    { name: 'Warning Yellow', value: '#d97706' },
    { name: 'Alert Red', value: '#dc2626' },
    { name: 'Slate Dark', value: '#0f172a' },
    { name: 'Slate Light', value: '#f1f5f9' }
];

// Initialize Editor
document.addEventListener('DOMContentLoaded', () => {
    // ... (Existing URL processing logic) ...
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page') || 'homepage';
    const pageMap = {
        'homepage': '/index.html',
        'branches': '/branches.html',
        'faculty': '/faculty.html',
        'admissions': '/admissions.html',
        'contact': '/contact.html'
    };
    const targetUrl = pageMap[page] || '/index.html';
    const iframe = document.getElementById('editorFrame');

    iframe.src = targetUrl;

    iframe.onload = () => {
        injectEditorScripts(iframe);
        document.getElementById('loader').style.display = 'none';
    };

    renderLibrary();
});

// --- Sidebar Logic ---
let activePropTab = 'style'; // 'style' or 'code'

window.switchTab = (tab) => {
    activeTab = tab;
    document.querySelectorAll('.library-panel .tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active'); // Assume click event context
    renderLibrary();
};

window.switchPropTab = (tab) => {
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
};;

function renderGlobalCodeEditor() {
    const panel = document.getElementById('propertiesContent');
    const iframe = document.getElementById('editorFrame');

    if (!iframe.contentDocument) return;

    panel.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.height = '100%';

    const label = document.createElement('div');
    label.innerHTML = '<strong>📝 Full Page Source (Body)</strong>';
    label.style.marginBottom = '0.5rem';
    label.style.fontSize = '0.9rem';
    label.style.color = '#374151';

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

    // Get clean HTML (remove editor artifacts)
    const clone = iframe.contentDocument.body.cloneNode(true);
    clone.querySelectorAll('.ve-hover-outline, .ve-selected-outline, .ve-drop-zone').forEach(el => {
        el.classList.remove('ve-hover-outline', 've-selected-outline', 've-drop-zone');
        if (el.getAttribute('class') === '') el.removeAttribute('class');
        if (el.contentEditable === 'true') el.removeAttribute('contentEditable');
    });
    // Remove scripts/styles we injected
    Array.from(clone.children).forEach(child => {
        if (child.tagName === 'SCRIPT' && child.src.includes('visual_editor')) child.remove();
        if (child.tagName === 'STYLE' && child.innerHTML.includes('ve-hover-outline')) child.remove();
    });

    textarea.value = clone.innerHTML.trim();

    const applyBtn = document.createElement('button');
    applyBtn.textContent = '⚡ Apply Full Page Changes';
    applyBtn.className = 'btn btn-primary';
    applyBtn.style.width = '100%';
    applyBtn.onclick = () => {
        try {
            // We need to preserve our editor scripts/styles while replacing content
            // Simplest way: Body replacement but re-inject scripts
            const newContent = textarea.value;
            iframe.contentDocument.body.innerHTML = newContent;

            // Re-inject editor necessities
            injectEditorScripts(iframe);

            markChanged();
            alert('Full page updated!');
        } catch (e) {
            alert('Error applying HTML: ' + e.message);
        }
    };

    wrapper.appendChild(label);
    wrapper.appendChild(textarea);
    wrapper.appendChild(applyBtn);
    panel.appendChild(wrapper);
}

function renderLibrary() {
    const container = document.getElementById('libraryContent');
    container.innerHTML = '';

    if (activeTab === 'components') {
        ComponentRegistry.forEach(comp => {
            const el = document.createElement('div');
            el.className = 'component-item';
            el.draggable = true;
            el.innerHTML = `
                <div class="component-icon">${comp.icon}</div>
                <div class="component-info">
                    <h4>${comp.name}</h4>
                    <p>${comp.desc}</p>
                </div>
            `;
            el.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/html', comp.html);
                e.dataTransfer.effectAllowed = 'copy';
            });
            container.appendChild(el);
        });
    } else if (activeTab === 'design') {
        container.innerHTML = '<h4 style="margin: 0 0 1rem 0; color: #6b7280; font-size: 0.8rem; text-transform: uppercase;">Brand Colors</h4>';

        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        grid.style.gap = '0.5rem';

        DesignColors.forEach(color => {
            const btn = document.createElement('div');
            btn.style.padding = '0.5rem';
            btn.style.border = '1px solid #e2e8f0';
            btn.style.borderRadius = '6px';
            btn.style.cursor = 'pointer';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.gap = '0.5rem';
            btn.innerHTML = `<div style="width: 20px; height: 20px; border-radius: 4px; background: ${color.value};"></div><span style="font-size: 0.8rem;">${color.name}</span>`;

            btn.onclick = () => {
                if (selectedElement) {
                    if (selectedElement.tagName === 'BUTTON' || selectedElement.tagName === 'A') {
                        selectedElement.style.backgroundColor = color.value;
                        selectedElement.style.color = 'white';
                    } else {
                        selectedElement.style.color = color.value;
                    }
                    updatePropertiesPanel(selectedElement);
                    markChanged();
                } else {
                    alert('Select an element first to apply color!');
                }
            };
            grid.appendChild(btn);
        });
        container.appendChild(grid);
    } else if (activeTab === 'layers') {
        renderLayerTree(container);
    }
}

// --- Frame Injection & DnD ---
function injectEditorScripts(iframe) {
    const doc = iframe.contentDocument;

    // Inject Editor CSS for hover & DnD
    const style = doc.createElement('style');
    style.innerHTML = `
        .ve-hover-outline { outline: 2px dashed #3b82f6 !important; cursor: pointer !important; }
        .ve-selected-outline { outline: 3px solid #2563eb !important; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2) !important; z-index: 10; relative; }
        .ve-drop-zone { border-top: 4px solid #059669 !important; transition: all 0.2s; }
    `;
    doc.head.appendChild(style);

    // Block links
    doc.querySelectorAll('a').forEach(a => a.addEventListener('click', (e) => e.preventDefault()));

    // Interactions
    doc.body.addEventListener('mouseover', (e) => {
        e.stopPropagation();
        if (e.target === doc.body || e.target.tagName === 'HTML') return;
        e.target.classList.add('ve-hover-outline');
    });

    doc.body.addEventListener('mouseout', (e) => {
        e.stopPropagation();
        e.target.classList.remove('ve-hover-outline');
    });

    doc.body.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (e.target === doc.body) return;
        selectElement(e.target);
    });

    // Drag and Drop Logic
    doc.body.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';

        // Highlight potential drop target
        let target = e.target;
        if (target !== doc.body) {
            target.classList.add('ve-drop-zone');
        }
    });

    doc.body.addEventListener('dragleave', (e) => {
        e.target.classList.remove('ve-drop-zone');
    });

    doc.body.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.target.classList.remove('ve-drop-zone');

        const html = e.dataTransfer.getData('text/html');
        if (html) {
            // If dropping on body/main, append to end or closest structure
            // If dropping on a container, append to it
            // Simple logic: insert After the dropped target

            const wrapper = doc.createElement('div');
            wrapper.innerHTML = html;
            const newContent = wrapper.firstElementChild;

            if (e.target === doc.body || e.target.tagName === 'MAIN') {
                e.target.appendChild(newContent);
            } else {
                // Insert after the hovered element
                e.target.parentNode.insertBefore(newContent, e.target.nextSibling);
            }

            selectElement(newContent);
            markChanged();
        }
    });
}

function selectElement(el) {
    if (selectedElement) {
        selectedElement.classList.remove('ve-selected-outline');
        if (selectedElement.isContentEditable) selectedElement.contentEditable = "false";
    }

    selectedElement = el;
    selectedElement.classList.add('ve-selected-outline');
    updatePropertiesPanel(el);
}

// ... (Rest of existing Properties Panel code: updatePropertiesPanel, setupColorBinding etc.) ...
// We need to keep the remaining existing functions below.

function updatePropertiesPanel(el) {
    const panel = document.getElementById('propertiesContent');
    const tagNameDisplay = document.getElementById('selectedTag');

    tagNameDisplay.textContent = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '');
    panel.innerHTML = '';

    // --- Code Editor Mode ---
        if (activePropTab === 'code') {
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
    }

    // 1. Text Properties
    if (['H1', 'H2', 'H3', 'P', 'SPAN', 'DIV', 'A', 'LI', 'BUTTON', 'TH', 'TD'].includes(el.tagName)) {
        // ... (Basic text content binding - keeping existing functionality) ...
        const contentTmpl = document.getElementById('text-props-template').content.cloneNode(true);
        const txtArea = contentTmpl.querySelector('[data-bind="textContent"]');
        if (txtArea) { // Check if template exists (it might have been replaced)
            txtArea.value = el.innerText;
            txtArea.addEventListener('input', (e) => {
                el.innerText = e.target.value;
                markChanged();
            });
            contentTmpl.querySelector('.color-picker-wrapper')?.remove(); // Remove old color picker from basictmpl if present, as it's in typography now
            panel.appendChild(contentTmpl);
        }

        // --- NEW: Typography Binding ---
        const typeTmpl = document.getElementById('typography-props-template').content.cloneNode(true);
        setupStyleBinding(typeTmpl, el, 'fontFamily');
        setupStyleBinding(typeTmpl, el, 'fontSize', 'px'); // Auto-append px if number
        setupStyleBinding(typeTmpl, el, 'fontWeight');
        setupStyleBinding(typeTmpl, el, 'textAlign');
        setupColorBinding(typeTmpl, el, 'color', 'color'); // Reuse existing color logic but map to correct input
        panel.appendChild(typeTmpl);

        el.contentEditable = "true";
        el.addEventListener('input', () => {
            if (txtArea) txtArea.value = el.innerText;
            markChanged();
        });
    }

    // 2. Image Properties
    if (el.tagName === 'IMG') {
        const tmpl = document.getElementById('image-props-template').content.cloneNode(true);
        const srcInput = tmpl.querySelector('[data-bind="src"]');
        srcInput.value = el.getAttribute('src');
        const altInput = tmpl.querySelector('[data-bind="alt"]');
        altInput.value = el.getAttribute('alt');
        altInput.addEventListener('input', (e) => {
            el.setAttribute('alt', e.target.value);
            markChanged();
        });
        panel.appendChild(tmpl);
    }

    // 3. Spacing & Effects (Available for almost all block elements)
    if (['SECTION', 'DIV', 'HEADER', 'FOOTER', 'BODY', 'MAIN', 'BUTTON', 'IMG'].includes(el.tagName)) {
        // Spacing
        const spacingTmpl = document.getElementById('spacing-props-template').content.cloneNode(true);
        setupRangeBinding(spacingTmpl, el, 'padding', 'paddingVal');
        setupRangeBinding(spacingTmpl, el, 'margin', 'marginVal');
        panel.appendChild(spacingTmpl);

        // Effects
        const effectsTmpl = document.getElementById('effects-props-template').content.cloneNode(true);
        setupStyleBinding(effectsTmpl, el, 'borderRadius', 'px');

        // Box Shadow Toggle Logic
        const shadowCheck = effectsTmpl.querySelector('[data-bind="boxShadow"]');
        const currentShadow = window.getComputedStyle(el).boxShadow;
        shadowCheck.checked = currentShadow !== 'none';
        shadowCheck.addEventListener('change', (e) => {
            const val = e.target.checked ? '0 4px 6px rgba(0,0,0,0.1)' : 'none';
            el.style.boxShadow = val;
            trackStyleChange(el, 'boxShadow', val);
            markChanged();
        });
        panel.appendChild(effectsTmpl);
    }

    // 4. Background Properties
    if (['SECTION', 'DIV', 'HEADER', 'FOOTER', 'BODY', 'MAIN'].includes(el.tagName)) {
        const tmpl = document.getElementById('bg-props-template').content.cloneNode(true);
        setupColorBinding(tmpl, el, 'backgroundColor', 'bgColorText');
        panel.appendChild(tmpl);
    }
}

// --- Binding Helpers ---

function setupStyleBinding(tmpl, el, styleProp, suffix = '') {
    const input = tmpl.querySelector(`[data-bind="${styleProp}"]`);
    if (!input) return;

    let currentVal = window.getComputedStyle(el)[styleProp];
    // Clean up value (e.g. remove 'px' for number inputs)
    if (suffix && currentVal.endsWith(suffix)) {
        currentVal = currentVal.replace(suffix, '');
    }
    // Handle font family quotes cleanup
    if (styleProp === 'fontFamily') {
        currentVal = currentVal.replace(/"/g, '');
    }

    input.value = currentVal;

    input.addEventListener('input', (e) => {
        let val = e.target.value;
        if (suffix && val !== '') val += suffix;
        el.style[styleProp] = val;
        trackStyleChange(el, styleProp, val);
        markChanged();
    });
}

function setupRangeBinding(tmpl, el, styleProp, displayRel) {
    const input = tmpl.querySelector(`[data-bind="${styleProp}"]`);
    const display = tmpl.querySelector(`[data-bind="${displayRel}"]`);

    // Parse current value (handle "10px" -> 10)
    let currentVal = parseInt(window.getComputedStyle(el)[styleProp]) || 0;
    input.value = currentVal;
    display.textContent = currentVal + 'px';

    input.addEventListener('input', (e) => {
        const val = e.target.value + 'px';
        el.style[styleProp] = val;
        display.textContent = val;
        trackStyleChange(el, styleProp, val);
        markChanged();
    });
}

function setupColorBinding(tmpl, el, styleProp, textInputRel) {
    // Handling case where textInputRel might be same as styleProp input or separate
    const colorInput = tmpl.querySelector(`[data-bind="${styleProp}"]`);
    // If textInputRel is provided, try to find it, otherwise ignore
    const textInput = textInputRel ? tmpl.querySelector(`[data-bind="${textInputRel}"]`) : null;

    if (!colorInput) return; // Guard clause

    const rgb2hex = (rgb) => {
        if (!rgb || rgb === 'rgba(0, 0, 0, 0)') return '#ffffff';
        if (rgb.startsWith('#')) return rgb;
        rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
        function hex(x) { return ("0" + parseInt(x).toString(16)).slice(-2); }
        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    };

    const currentVal = window.getComputedStyle(el)[styleProp];
    const hexVal = rgb2hex(currentVal);

    colorInput.value = hexVal;
    textInput.value = hexVal;

    const update = (val) => {
        el.style[styleProp] = val;
        colorInput.value = val;
        textInput.value = val;
        trackStyleChange(el, styleProp, val);
        markChanged();
    };

    colorInput.addEventListener('input', (e) => update(e.target.value));
    textInput.addEventListener('change', (e) => update(e.target.value));
}

function trackStyleChange(el, prop, val) {
    let selector = el.tagName.toLowerCase();
    if (el.id) selector = '#' + el.id;
    else if (el.className) selector += '.' + el.className.split(' ').join('.');

    if (!currentStyles[selector]) currentStyles[selector] = {};
    currentStyles[selector][prop] = val;
}

function markChanged() {
    hasUnsavedChanges = true;
    document.getElementById('saveBtn').innerHTML = '💾 Save Changes <span style="color: #fbbf24; font-size: 0.8rem;">●</span>';
}

function triggerImageUpload() {
    document.getElementById('globalImageUpload').click();
}

document.getElementById('globalImageUpload').addEventListener('change', function (e) {
    if (this.files && this.files[0] && selectedElement && selectedElement.tagName === 'IMG') {
        const file = this.files[0];
        const formData = new FormData();
        formData.append('upload', file); // Use 'upload' key as per app.py

        fetch('/upload-image', { // Correct endpoint
            method: 'POST',
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.url) {
                    selectedElement.src = data.url;
                    updatePropertiesPanel(selectedElement);
                    markChanged();
                }
            })
            .catch(err => {
                console.error('Upload failed', err);
                alert('Upload failed: ' + err.message);
            });
    }
});

function saveChanges() {
    const btn = document.getElementById('saveBtn');
    const originalText = btn.innerHTML;
    btn.textContent = '⏳ Saving...';
    btn.disabled = true;

    // 1. Save Styles (CSS)
    const saveStyles = fetch('/api/save_styles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ styles: currentStyles })
    });

    // 2. Save HTML Content
    const iframe = document.getElementById('editorFrame');
    let saveHtml = Promise.resolve(); // Default if not applicable

    if (iframe.contentDocument) {
        // Clone doc to clean up editor artifacts
        const clone = iframe.contentDocument.documentElement.cloneNode(true);

        // Remove editor-specific adjustments
        clone.querySelectorAll('.ve-hover-outline, .ve-selected-outline, .ve-drop-zone').forEach(el => {
            el.classList.remove('ve-hover-outline', 've-selected-outline', 've-drop-zone');
            if (el.getAttribute('class') === '') el.removeAttribute('class');
            if (el.contentEditable === 'true') el.removeAttribute('contentEditable');
        });

        // Remove injected editor styles
        const styles = clone.querySelectorAll('style');
        styles.forEach(s => {
            if (s.innerHTML.includes('ve-hover-outline')) s.remove();
        });

        const pageName = new URLSearchParams(window.location.search).get('page') || 'homepage';
        const pageMap = {
            'homepage': 'index.html', // Fixed mapping for filename
            'branches': 'branches.html',
            'faculty': 'faculty.html',
            'admissions': 'admissions.html',
            'contact': 'contact.html'
        };
        const targetFile = pageMap[pageName] || 'index.html';
        const finalHtml = "<!DOCTYPE html>\n" + clone.outerHTML;

        saveHtml = fetch('/api/save_html', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ page: targetFile, content: finalHtml })
        });
    }

    Promise.all([saveStyles, saveHtml])
        .then(([res1, res2]) => {
            if (res1.ok && (res2 ? res2.ok : true)) {
                hasUnsavedChanges = false;
                btn.innerHTML = '💾 Save Changes';
                btn.disabled = false;
                alert('All changes (Visual & Code) saved successfully!');
            } else {
                throw new Error('Partial save failure. Check console.');
            }
        })
        .catch(err => {
            alert('Error saving changes: ' + err.message);
            console.error(err);
            btn.innerHTML = originalText;
            btn.disabled = false;
        });
}

function setDevice(mode) {
    const f = document.getElementById('editorFrame');
    const btns = document.querySelectorAll('.device-btn');
    btns.forEach(b => b.classList.remove('active'));

    if (mode === 'mobile') {
        f.className = 'preview-mobile';
        btns[1].classList.add('active');
    } else {
        f.className = 'preview-desktop';
        btns[0].classList.add('active');
    }
}

// --- Stock Photos ---
const StockImages = [
    { name: 'Campus', url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80' },
    { name: 'Library', url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80' },
    { name: 'Student', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80' },
    { name: 'Graduation', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80' },
    { name: 'Classroom', url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80' },
    { name: 'Study', url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80' },
    { name: 'Laboratory', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80' },
    { name: 'Books', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80' },
    { name: 'University', url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3dab?auto=format&fit=crop&w=600&q=80' },
    { name: 'Seminar', url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80' },
    { name: 'Technology', url: 'https://images.unsplash.com/photo-1531297461136-82lwDe8y91-645?auto=format&fit=crop&w=600&q=80' },
    { name: 'Group', url: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=600&q=80' }
];

window.openStockModal = () => {
    document.getElementById('stockModal').style.display = 'flex';
    filterStockPhotos('');
};

window.closeStockModal = () => {
    document.getElementById('stockModal').style.display = 'none';
};

window.filterStockPhotos = (query) => {
    const grid = document.getElementById('stockGrid');
    grid.innerHTML = '';

    const filtered = StockImages.filter(img => img.name.toLowerCase().includes(query.toLowerCase()));

    filtered.forEach(img => {
        const div = document.createElement('div');
        div.style = "cursor: pointer; border-radius: 8px; overflow: hidden; height: 120px; position: relative;";
        div.innerHTML = `
            <img src="${img.url}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" />
            <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); color: white; padding: 4px 8px; font-size: 0.75rem;">${img.name}</div>
        `;
        div.onclick = () => {
            selectStockPhoto(img.url);
        };
        grid.appendChild(div);
    });
};

function selectStockPhoto(url) {
    if (selectedElement && selectedElement.tagName === 'IMG') {
        selectedElement.src = url;
        updatePropertiesPanel(selectedElement);
        markChanged();
        closeStockModal();
    }
}

function renderLayerTree(container) {
    const iframe = document.getElementById('editorFrame');
    if (!iframe.contentDocument) return;
    const root = iframe.contentDocument.body;

    function buildTree(node, parentEl) {
        // Skip script/style/hidden
        if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'svg', 'path'].includes(node.tagName) || node.nodeType !== 1) return;

        const item = document.createElement('div');
        item.className = 'layer-item';
        if (selectedElement === node) item.classList.add('active');

        // Label
        let label = node.tagName.toLowerCase();
        if (node.id) label += `<span style="color:#6b7280">#${node.id}</span>`;
        else if (node.className && typeof node.className === 'string' && node.className.trim()) {
            // Filter out our internal classes
            const cls = node.className.replace('ve-hover-outline', '').replace('ve-selected-outline', '').replace('ve-drop-zone', '').trim();
            if (cls) label += `<span style="color:#6b7280; font-size:0.75rem">.${cls.split(' ')[0]}</span>`;
        }

        item.innerHTML = `<span>${label}</span>`;
        item.onclick = (e) => {
            e.stopPropagation();
            selectElement(node);
            renderLibrary(); // Re-render to update active state
        };

        parentEl.appendChild(item);

        if (node.children.length > 0) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'layer-children';
            Array.from(node.children).forEach(child => buildTree(child, childrenContainer));
            parentEl.appendChild(childrenContainer);
        }
    }

    if (root) {
        buildTree(root, container);
    }
}

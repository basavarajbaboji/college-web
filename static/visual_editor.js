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
window.switchTab = (tab) => {
    activeTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active'); // Assume click event context
    renderLibrary();
};

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

    // 1. Text Properties
    if (['H1', 'H2', 'H3', 'P', 'SPAN', 'DIV', 'A', 'LI', 'BUTTON', 'TH', 'TD'].includes(el.tagName)) {
        const tmpl = document.getElementById('text-props-template').content.cloneNode(true);
        const txtArea = tmpl.querySelector('[data-bind="textContent"]');
        txtArea.value = el.innerText;
        txtArea.addEventListener('input', (e) => {
            el.innerText = e.target.value;
            markChanged();
        });
        setupColorBinding(tmpl, el, 'color', 'colorText');
        panel.appendChild(tmpl);

        el.contentEditable = "true";
        el.addEventListener('input', () => {
            txtArea.value = el.innerText;
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

    // 3. Background Properties
    if (['SECTION', 'DIV', 'HEADER', 'FOOTER', 'BODY', 'MAIN'].includes(el.tagName)) {
        const tmpl = document.getElementById('bg-props-template').content.cloneNode(true);
        setupColorBinding(tmpl, el, 'backgroundColor', 'bgColorText');
        panel.appendChild(tmpl);
    }
}

// ... (Existing Helpers: setupColorBinding, trackStyleChange, markChanged, imageUpload, saveChanges, setDevice) ...

function setupColorBinding(tmpl, el, styleProp, textInputRel) {
    const colorInput = tmpl.querySelector(`[data-bind="${styleProp}"]`);
    const textInput = tmpl.querySelector(`[data-bind="${textInputRel}"]`);

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

    fetch('/api/save_styles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ styles: currentStyles })
    })
        .then(res => {
            if (res.ok) {
                hasUnsavedChanges = false;
                btn.innerHTML = '💾 Save Changes';
                btn.disabled = false;
                alert('Visual changes saved successfully!');
            } else {
                throw new Error('Save failed');
            }
        })
        .catch(err => {
            alert('Error saving changes: ' + err.message);
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

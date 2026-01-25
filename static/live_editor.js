/**
 * live_editor.js
 * This script is injected or loaded when the admin views a page in "Live Edit" mode.
 */

(function () {
    console.log("🛠️ Live Editor: Initialized");

    // Add styles for editable elements
    const style = document.createElement('style');
    style.innerHTML = `
        [data-db-field] {
            outline: 2px dashed rgba(59, 130, 246, 0.3);
            outline-offset: 4px;
            transition: all 0.2s;
            cursor: pointer;
        }
        [data-db-field]:hover {
            outline: 2px dashed rgba(59, 130, 246, 0.8);
            background: rgba(59, 130, 246, 0.05);
        }
        [data-db-field]:focus {
            outline: 2px solid #3b82f6;
            background: white;
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.2);
        }
    `;
    document.head.appendChild(style);

    // Initialize all editable fields
    function initEditing() {
        const fields = document.querySelectorAll('[data-db-field]');
        fields.forEach(field => {
            field.contentEditable = "true";

            field.addEventListener('input', () => {
                const fieldName = field.getAttribute('data-db-field');
                const index = field.getAttribute('data-db-index');

                // Notify parent that content has changed
                window.parent.postMessage({
                    type: 'CONTENT_CHANGED',
                    field: fieldName,
                    index: index,
                    value: field.innerHTML
                }, '*');
            });
        });

        console.log(`🛠️ Live Editor: Enabled editing for ${fields.length} fields.`);
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEditing);
    } else {
        initEditing();
    }

})();

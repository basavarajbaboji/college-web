document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('edit-section-container');
    const landing = document.getElementById('dashboard-landing');


    // Unified click handler for navigation and dashboard cards
    document.addEventListener('click', (e) => {
        // Handle data-section button clicks (Nav links & Dashboard cards)
        const link = e.target.closest('[data-section]');
        if (link) {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            console.log("🚀 Admin Portal: Loading section", section);
            loadSectionEditor(section);

            // Auto-hide mobile menu after selection
            const nav = document.getElementById('adminNavLinks') || document.querySelector('.nav-links');
            if (nav) nav.classList.remove('show');
            const toggle = document.querySelector('.menu-toggle');
            if (toggle) toggle.innerHTML = '☰';

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Handle Back button
        const backBtn = e.target.closest('.back-btn');
        if (backBtn) {
            showDashboard();
            return;
        }

    });

    function showDashboard() {
        container.classList.add('hidden');
        landing.classList.remove('hidden');
    }

    function loadSectionEditor(section) {
        // Reset layout expansion
        const mainContainer = container.closest('.container');
        if (mainContainer) mainContainer.classList.remove('admin-wide');

        // Hide landing, show container
        landing.classList.add('hidden');
        container.classList.remove('hidden');

        container.innerHTML = `
            <button class="back-btn">← Back to Dashboard</button>
            <div style="padding: 2rem; text-align: center;"><div class="loading-spinner"></div><p>Loading Section...</p></div>
        `;

        switch (section) {
            case 'homepage': loadHomepageManager(); break;
            case 'branches': loadLiveEditor('/branches.html', 'branches'); break;
            case 'faculty': loadFacultyEditor(); break;
            case 'admissions': loadLiveEditor('/admissions.html', 'admissions'); break;
            case 'contact': loadLiveEditor('/contact.html', 'contact'); break;
            case 'manage_applications': loadApplicationsManager(); break;
            case 'student_count': loadStudentCountEditor(); break;
            case 'change_credentials': loadChangeCredentialsEditor(); break;
            case 'forgot_password': loadForgotPasswordEditor(); break;
            default: container.innerHTML = '<p>Invalid section selected.</p>';
        }
    }

    function injectBackButton(content) {
        return `<button class="back-btn">← Back to Dashboard</button>${content}`;
    }

    // Redirect to Full-Screen Visual Editor
    function loadLiveEditor(pageUrl, section) {
        window.location.href = `/admin/visual_editor?page=${section}`;
    }

    // Legacy form editor (kept for fallback or other non-live sections)
    // Legacy form editor removed (replaced by Live Editor)

    // Load branches editor
    function loadBranchesEditor() {
        fetch('/admin/edit/branches')
            .then(res => res.json())
            .then(data => {
                container.innerHTML = injectBackButton(`
                    <div class="editor-header" style="margin-bottom: 2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem;">
                        <h2>🎓 Edit Branch Details</h2>
                    </div>
                    <form id="branchesForm">
                        <div id="branchesList"></div>
                        <button type="button" id="addBranchBtn" class="admin-add-btn">+ Add New Branch</button>
                        <hr style="margin: 2rem 0; border: none; border-top: 1px solid #e2e8f0;">
                        <button type="submit" class="admin-save-btn">Save All Branches</button>
                    </form>
                `);
                const branchesList = document.getElementById('branchesList');
                data.forEach(branch => { addBranchInput(branch.name, branch.description, branch.future_tech, branch.current_usage, branch.career_roles, branch.core_subjects, branch.key_skills, branch.eligibility, branch.duration, branch.intake, branch.labs); });
                document.getElementById('addBranchBtn').addEventListener('click', () => { addBranchInput('', '', '', '', '', '', '', '', '', '', ''); });
                document.getElementById('branchesForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    const branchesData = [];
                    branchesList.querySelectorAll('.branch-entry').forEach(entry => {
                        const name = entry.querySelector('input[name="branchName"]').value.trim();
                        const description = entry.querySelector('textarea[name="branchDescription"]').value.trim();
                        const future_tech = entry.querySelector('textarea[name="futureTech"]').value.trim();
                        const current_usage = entry.querySelector('textarea[name="currentUsage"]').value.trim();
                        const career_roles = entry.querySelector('input[name="careerRoles"]').value.trim();
                        const core_subjects = entry.querySelector('textarea[name="coreSubjects"]').value.trim();
                        const key_skills = entry.querySelector('textarea[name="key_skills"]').value.trim();
                        const eligibility = entry.querySelector('input[name="eligibility"]').value.trim();
                        const duration = entry.querySelector('input[name="duration"]').value.trim();
                        const intake = entry.querySelector('input[name="intake"]').value.trim();
                        const labs = entry.querySelector('textarea[name="labs"]').value.trim();
                        if (name && description) branchesData.push({ name, description, future_tech, current_usage, career_roles, core_subjects, key_skills, eligibility, duration, intake, labs });
                    });
                    fetch('/admin/edit/branches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ branches: branchesData }) })
                        .then(res => { if (res.ok) alert('Branches updated successfully.'); });
                });

                function addBranchInput(name, description, future_tech, current_usage, career_roles, core_subjects, key_skills, eligibility, duration, intake, labs) {
                    const div = document.createElement('div');
                    div.classList.add('admin-form-card', 'branch-entry');

                    div.innerHTML = `
                        <button type="button" class="removeBtn admin-delete-btn">🗑️ Delete Entry</button>
                        
                        <div style="margin-bottom: 1.5rem;">
                            <label style="display:block; margin-bottom:0.5rem; font-weight:600; color:var(--gray-700);">Branch Name</label>
                            <input type="text" class="admin-input" name="branchName" placeholder="e.g. Computer Science Engineering" value="${name}" required style="font-weight: 700; font-size: 1.1rem;" />
                        </div>

                        <div style="margin-bottom: 1.5rem;">
                            <label style="display:block; margin-bottom:0.5rem; font-weight:600; color:var(--gray-700);">Description</label>
                            <textarea class="admin-textarea" name="branchDescription" placeholder="Brief description of the branch...">${description}</textarea>
                        </div>
                        
                        <div class="admin-form-grid" style="grid-template-columns: repeat(3, 1fr);">
                            <input type="text" class="admin-input" name="duration" placeholder="Duration (e.g. 3 Years)" value="${duration || ''}" />
                            <input type="text" class="admin-input" name="eligibility" placeholder="Eligibility (e.g. SSLC)" value="${eligibility || ''}" />
                            <input type="number" class="admin-input" name="intake" placeholder="Intake Capacity" value="${intake || ''}" />
                        </div>

                        <div class="admin-form-grid" style="grid-template-columns: 1fr 1fr;">
                            <div>
                                <label style="display:block; margin-bottom:0.5rem; font-weight:600; color:var(--gray-700);">Future Tech</label>
                                <textarea class="admin-textarea" name="futureTech" placeholder="Future scope...">${future_tech || ''}</textarea>
                            </div>
                            <div>
                                <label style="display:block; margin-bottom:0.5rem; font-weight:600; color:var(--gray-700);">Current Usage</label>
                                <textarea class="admin-textarea" name="currentUsage" placeholder="Industry usage...">${current_usage || ''}</textarea>
                            </div>
                        </div>

                        <div style="margin-bottom: 1rem;">
                            <label style="display:block; margin-bottom:0.5rem; font-weight:600; color:var(--gray-700);">Labs</label>
                            <textarea class="admin-textarea" name="labs" placeholder="Laboratories (comma separated)..." style="min-height: 60px;">${labs || ''}</textarea>
                        </div>

                        <div class="admin-form-grid" style="grid-template-columns: 1fr 1fr;">
                            <textarea class="admin-textarea" name="coreSubjects" placeholder="Core Subjects..." style="min-height: 60px;">${core_subjects || ''}</textarea>
                            <textarea class="admin-textarea" name="key_skills" placeholder="Key Skills..." style="min-height: 60px;">${key_skills || ''}</textarea>
                        </div>
                        
                        <input type="text" class="admin-input" name="careerRoles" placeholder="Career Roles (comma separated)" value="${career_roles || ''}" />
                    `;
                    branchesList.appendChild(div);
                    div.querySelector('.removeBtn').addEventListener('click', () => {
                        if (confirm('Delete this branch?')) div.remove();
                    });
                }
            });
    }

    // Load faculty editor
    function loadFacultyEditor() {
        fetch('/admin/edit/faculty')
            .then(res => res.json())
            .then(data => {
                const facultyList = data.faculty || [];
                container.innerHTML = injectBackButton(`
                    <div class="editor-header" style="margin-bottom: 2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem;">
                        <h2>👨‍🏫 Edit Faculty Profiles</h2>
                    </div>
                    <form id="facultyForm">
                        <div id="facultyList"></div>
                        <button type="button" id="addFacultyBtn" class="admin-add-btn">+ Add New Faculty</button>
                        <hr style="margin: 2rem 0; border: none; border-top: 1px solid #e2e8f0;">
                        <button type="submit" class="admin-save-btn">Save All Faculty</button>
                    </form>
                `);
                const facultyListDiv = document.getElementById('facultyList');
                facultyList.forEach(f => { addFacultyInput(f.name, f.phone, f.email, f.role, f.description, f.qualification, f.experience, f.specialization, f.achievements, f.subjects, f.branch, f.image_url); });
                document.getElementById('addFacultyBtn').addEventListener('click', () => { addFacultyInput('', '', '', '', '', '', '', '', '', '', '', ''); });
                document.getElementById('facultyForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    const facultyData = [];
                    facultyListDiv.querySelectorAll('.faculty-entry').forEach(entry => {
                        facultyData.push({
                            name: entry.querySelector('input[name="name"]').value.trim(),
                            role: entry.querySelector('input[name="role"]').value.trim(),
                            branch: entry.querySelector('select[name="branch"]').value,
                            image_url: entry.querySelector('input[name="image_url"]').value.trim(),
                            qualification: entry.querySelector('input[name="qualification"]').value.trim(),
                            specialization: entry.querySelector('input[name="specialization"]').value.trim(),
                            achievements: entry.querySelector('input[name="achievements"]').value.trim(),
                            subjects: entry.querySelector('input[name="subjects"]').value.trim(),
                            experience: entry.querySelector('input[name="experience"]').value.trim(),
                            phone: entry.querySelector('input[name="phone"]').value.trim(),
                            email: entry.querySelector('input[name="email"]').value.trim(),
                            description: entry.querySelector('textarea[name="description"]').value.trim()
                        });
                    });
                    fetch('/admin/edit/faculty', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ faculty: facultyData }) })
                        .then(res => { if (res.ok) alert('Faculty updated successfully.'); });
                });

                function addFacultyInput(name, phone, email, role, description, qualification, experience, specialization, achievements, subjects, branch, image_url) {
                    const div = document.createElement('div');
                    div.classList.add('admin-form-card', 'faculty-entry');

                    const branches = ['Non-Teaching', 'Artificial Intelligence', 'Computer Science Engineering', 'Electrical and Electronics Engineering', 'Electronics and Communication Engineering'];
                    const branchOptions = branches.map(b => `<option value="${b}" ${branch === b ? 'selected' : ''}>${b}</option>`).join('');

                    div.innerHTML = `
                        <button type="button" class="removeBtn admin-delete-btn">🗑️ Delete Entry</button>
                        
                        <div class="admin-form-header">
                            <div class="admin-photo-upload">
                                <div class="admin-photo-preview">
                                    <img src="${image_url || '/placeholder-avatar.png'}" style="width: 100%; height: 100%; object-fit: cover;" class="faculty-img-preview" onerror="this.src='https://via.placeholder.com/100'" />
                                </div>
                                <input type="file" class="faculty-upload" style="display: none;" accept="image/*" />
                                <button type="button" class="upload-btn admin-upload-btn">Change Photo</button>
                                <input type="hidden" name="image_url" value="${image_url || ''}" />
                            </div>
                            
                            <div class="admin-main-details">
                                <input type="text" class="admin-input" name="name" placeholder="Full Name" value="${name}" required />
                                <input type="text" class="admin-input" name="role" placeholder="Role (e.g. Principal, HOD)" value="${role}" required />
                                <select class="admin-input" name="branch">
                                    <option value="" disabled ${!branch ? 'selected' : ''}>Select Branch</option>
                                    ${branchOptions}
                                </select>
                                <input type="text" class="admin-input" name="qualification" placeholder="Qualification" value="${qualification || ''}" />
                            </div>
                        </div>

                        <div class="admin-form-grid" style="grid-template-columns: repeat(3, 1fr);">
                            <input type="text" class="admin-input" name="experience" placeholder="Experience" value="${experience || ''}" />
                            <input type="text" class="admin-input" name="specialization" placeholder="Specialization" value="${specialization || ''}" />
                            <input type="text" class="admin-input" name="subjects" placeholder="Subjects Handled" value="${subjects || ''}" />
                            <input type="text" class="admin-input" name="phone" placeholder="Phone Number" value="${phone || ''}" />
                            <input type="email" class="admin-input" name="email" placeholder="Email Address" value="${email || ''}" />
                            <input type="text" class="admin-input" name="achievements" placeholder="Achievements" value="${achievements || ''}" />
                        </div>

                        <textarea class="admin-textarea" name="description" placeholder="Short Bio / Description">${description || ''}</textarea>
                    `;

                    // Handle internal upload
                    const uploadInput = div.querySelector('.faculty-upload');
                    const uploadBtn = div.querySelector('.upload-btn');
                    const hiddenInput = div.querySelector('input[name="image_url"]');
                    const previewImg = div.querySelector('.faculty-img-preview');

                    uploadBtn.onclick = () => uploadInput.click();

                    uploadInput.onchange = (e) => {
                        const file = e.target.files[0];
                        if (!file) return;

                        const formData = new FormData();
                        formData.append('upload', file);
                        uploadBtn.textContent = 'Uploading...';

                        fetch('/upload-image', {
                            method: 'POST',
                            body: formData
                        })
                            .then(res => res.json())
                            .then(data => {
                                uploadBtn.textContent = 'Change Photo';
                                if (data.url) {
                                    hiddenInput.value = data.url;
                                    previewImg.src = data.url;
                                }
                            })
                            .catch(err => {
                                uploadBtn.textContent = 'Change Photo';
                                alert('Upload failed');
                            });
                    };

                    facultyListDiv.appendChild(div);
                    div.querySelector('.removeBtn').addEventListener('click', () => {
                        if (confirm('Are you sure you want to remove this faculty entry?')) {
                            div.remove();
                        }
                    });
                }
            });
    }

    // Load admissions editor
    function loadAdmissionsEditor() {
        fetch('/admin/edit/admissions')
            .then(res => res.json())
            .then(data => {
                const admissions = data.admissions || {};
                container.innerHTML = injectBackButton(`
            < div class="editor-header" style = "margin-bottom: 2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem;" >
                <h2>📋 Edit Admissions Information</h2>
                    </div >
            <form id="admissionsForm">
                <div style="display: grid; gap: 1.5rem;">
                    <textarea name="eligibility" placeholder="Eligibility" style="width: 100%; height: 100px; padding: 0.8rem; border-radius: 8px; border: 1px solid #cbd5e1;">${admissions.eligibility || ''}</textarea>
                    <textarea name="courses" placeholder="Courses" style="width: 100%; height: 100px; padding: 0.8rem; border-radius: 8px; border: 1px solid #cbd5e1;">${admissions.courses || ''}</textarea>
                    <textarea name="process" placeholder="Process" style="width: 100%; height: 100px; padding: 0.8rem; border-radius: 8px; border: 1px solid #cbd5e1;">${admissions.process || ''}</textarea>
                    <textarea name="documents" placeholder="Documents" style="width: 100%; height: 100px; padding: 0.8rem; border-radius: 8px; border: 1px solid #cbd5e1;">${admissions.documents || ''}</textarea>
                </div>
                <button type="submit" style="background: #1e40af; color: white; padding: 0.75rem 2.5rem; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; margin-top: 2rem;">Save Details</button>
            </form>
        `);
                document.getElementById('admissionsForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    const admissionsData = { eligibility: e.target.eligibility.value.trim(), courses: e.target.courses.value.trim(), process: e.target.process.value.trim(), documents: e.target.documents.value.trim(), dates: admissions.dates || '', contact: admissions.contact || '' };
                    fetch('/admin/edit/admissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ admissions: admissionsData }) })
                        .then(res => { if (res.ok) alert('Admissions updated successfully.'); });
                });
            });
    }

    // Load Applications Manager
    function loadApplicationsManager() {
        fetch('/api/admin/applications')
            .then(res => res.json())
            .then(data => {
                console.log("🚀 Admin Dashboard: Loaded applications:", data);
                let apps = data.applications || [];
                console.log("📊 Total Apps Found:", apps.length);

                // Sort by marks (highest first) - THE DEFAULT SORT
                apps.sort((a, b) => b.sslc_percentage - a.sslc_percentage);

                // Store sorted apps for filtering
                window.allApplications = apps;

                renderApplicationsTable(apps);
            });
    }

    function renderApplicationsTable(apps) {
        // Expand the container for merit list
        const mainContainer = container.closest('.container');
        if (mainContainer) mainContainer.classList.add('admin-wide');

        // Get unique values for filters
        const categories = [...new Set(window.allApplications.map(a => a.category))].sort();
        const statuses = [...new Set(window.allApplications.map(a => a.status))].sort();
        const courses = [...new Set(window.allApplications.map(a => a.preference1))].sort();
        const genders = [...new Set(window.allApplications.map(a => a.gender))].filter(g => g).sort();

        let html = injectBackButton(`
            <!-- Header Row -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <div>
                    <h2 style="color: #1e293b; margin: 0; font-size: 1.2rem; font-weight: 700;">📋 Merit List 2026</h2>
                    <p style="color: #64748b; margin: 0.2rem 0 0 0; font-size: 0.75rem;">${apps.length}/${window.allApplications.length} · Sorted by marks</p>
                </div>
            </div>
            
            <!-- Filter Chips - Like reference image -->
            <div style="display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: center; background: #f8fafc; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0;">
                <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
                    <button onclick="filterByStatus('all')" style="width: auto; padding: 0.5rem 1.25rem; border: 1px solid #e2e8f0; border-radius: 20px; font-size: 0.75rem; font-weight: 600; cursor: pointer; background: white; color: #1e293b; transition: all 0.2s;">All</button>
                    <button onclick="filterByStatus('Verified')" style="width: auto; padding: 0.5rem 1.25rem; border: 1px solid #e2e8f0; border-radius: 20px; font-size: 0.75rem; font-weight: 600; cursor: pointer; background: white; color: #16a34a; transition: all 0.2s;">Verified</button>
                    <button onclick="filterByStatus('Pending')" style="width: auto; padding: 0.5rem 1.25rem; border: 1px solid #e2e8f0; border-radius: 20px; font-size: 0.75rem; font-weight: 600; cursor: pointer; background: white; color: #d97706; transition: all 0.2s;">Pending</button>
                    <button onclick="filterByStatus('Rejected')" style="width: auto; padding: 0.5rem 1.25rem; border: 1px solid #e2e8f0; border-radius: 20px; font-size: 0.75rem; font-weight: 600; cursor: pointer; background: white; color: #dc2626; transition: all 0.2s;">Rejected</button>
                </div>
                
                <div style="width: 1px; height: 24px; background: #cbd5e1; margin: 0 0.25rem;"></div>
                
                <div style="display: flex; gap: 0.4rem; flex-wrap: wrap; align-items: center;">
                    <select id="filterCategory" onchange="applyAdvancedFilters()" style="padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 20px; font-size: 0.75rem; background: white; width: auto; cursor: pointer; font-weight: 500;">
                        <option value="">Category</option>
                        ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                    <select id="filterCourse" onchange="applyAdvancedFilters()" style="padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 20px; font-size: 0.75rem; background: white; width: auto; cursor: pointer; font-weight: 500;">
                        <option value="">Course</option>
                        ${courses.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                    <select id="filterGender" onchange="applyAdvancedFilters()" style="padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 20px; font-size: 0.75rem; background: white; width: auto; cursor: pointer; font-weight: 500;">
                        <option value="">Gender</option>
                        ${genders.map(g => `<option value="${g}">${g}</option>`).join('')}
                    </select>
                </div>

                <div style="margin-left: auto;">
                    <button onclick="clearAllFilters()" style="width: auto; padding: 0.5rem 1.5rem; border: none; border-radius: 20px; font-size: 0.75rem; font-weight: 700; cursor: pointer; background: #1e40af; color: white; box-shadow: 0 2px 4px rgba(30,64,175,0.2); transition: all 0.2s;">Clear Filters</button>
                </div>
            </div>
        `);

        if (apps.length === 0) {
            html += '<div style="text-align: center; padding: 5rem 2rem; background: white; border-radius: 16px; border: 2px dashed #cbd5e1;"><h3 style="color: #64748b;">📭 No applications match your filters.</h3><p style="color: #94a3b8;">Try adjusting your filter criteria.</p></div>';
        } else {
            html += `<div style="overflow-x: auto; background: white; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; min-width: 1050px;">
                <thead>
                    <tr style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%);">
                        <th style="padding: 1.25rem 1rem; color: white; font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">Rank</th>
                        <th style="padding: 1.25rem 1rem; color: white; font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">Student</th>
                        <th style="padding: 1.25rem 1rem; color: white; font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">Category</th>
                        <th style="padding: 1.25rem 1rem; color: white; font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">SSLC %</th>
                        <th style="padding: 1.25rem 1rem; color: white; font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">Course</th>
                        <th style="padding: 1.25rem 1rem; color: white; font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">Status</th>
                        <th style="padding: 1.25rem 1rem; color: white; font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; text-align: center;">Actions</th>
                    </tr>
                </thead>
                <tbody>`;
            apps.forEach((app, index) => {
                const rankIcon = `#${index + 1}`;
                const categoryColors = {
                    'GM': { bg: '#dcfce7', color: '#166534' },
                    'SC': { bg: '#fef3c7', color: '#92400e' },
                    'ST': { bg: '#fee2e2', color: '#991b1b' },
                    'Cat-1': { bg: '#e0e7ff', color: '#3730a3' },
                    '2A': { bg: '#fce7f3', color: '#9d174d' },
                    '2B': { bg: '#f3e8ff', color: '#7c3aed' },
                    '3A': { bg: '#cffafe', color: '#0e7490' },
                    '3B': { bg: '#d1fae5', color: '#047857' }
                };
                const catStyle = categoryColors[app.category] || { bg: '#f1f5f9', color: '#475569' };
                const statusStyles = {
                    'Pending': { bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', color: '#92400e', icon: '⏳' },
                    'Verified': { bg: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', color: '#166534', icon: '✅' },
                    'Rejected': { bg: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', color: '#991b1b', icon: '❌' }
                };
                const statusStyle = statusStyles[app.status] || statusStyles['Pending'];

                html += `<tr style="border-bottom: 1px solid #f1f5f9; transition: all 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
                        <td style="padding: 1rem; text-align: center;">
                            <span style="font-size: ${index < 3 ? '1.5rem' : '1rem'}; font-weight: 800; color: ${index < 3 ? '#1e40af' : '#64748b'};">${rankIcon}</span>
                        </td>
                        <td style="padding: 1rem;">
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1rem;">${app.candidate_name ? app.candidate_name.charAt(0).toUpperCase() : '?'}</div>
                                <div>
                                    <strong style="color: #1e293b; display: block;">${app.candidate_name}</strong>
                                    <small style="color: #94a3b8; font-family: monospace;">${app.app_no}</small>
                                </div>
                            </div>
                        </td>
                        <td style="padding: 1rem;">
                            <span style="background: ${catStyle.bg}; color: ${catStyle.color}; padding: 0.4rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700;">${app.category}</span>
                        </td>
                        <td style="padding: 1rem;">
                            <span style="font-size: 1.1rem; font-weight: 800; color: #1e40af;">${app.sslc_percentage}%</span>
                        </td>
                        <td style="padding: 1rem;">
                            <span style="background: #f1f5f9; padding: 0.35rem 0.65rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; color: #475569;">${app.preference1}</span>
                        </td>
                        <td style="padding: 1rem;">
                            <span style="background: ${statusStyle.bg}; color: ${statusStyle.color}; padding: 0.5rem 0.85rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; display: inline-flex; align-items: center; gap: 0.35rem;">
                                <span>${statusStyle.icon}</span> ${app.status}
                            </span>
                        </td>
                        <td style="padding: 1rem; text-align: center;">
                            <div style="display: flex; gap: 0.5rem; justify-content: center;">
                                <button onclick="viewApplication('${app.app_no}')" style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.8rem; box-shadow: 0 2px 6px rgba(30,64,175,0.25); transition: all 0.2s;" title="View Details">👁️</button>
                                <button onclick="deleteApplication('${app.app_no}', '${app.candidate_name}')" style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.8rem; box-shadow: 0 2px 6px rgba(220,38,38,0.25); transition: all 0.2s;" title="Delete Application">🗑️</button>
                            </div>
                        </td>
                    </tr>`;
            });
            html += `</tbody></table></div>`;
        }
        container.innerHTML = html;

        // Add Modal Container if not exists
        if (!document.getElementById('appModal')) {
            const modal = document.createElement('div');
            modal.id = 'appModal';
            modal.style.cssText = "display:none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000; align-items: center; justify-content: center;";
            document.body.appendChild(modal);
        }

        // Attach View Function globally
        window.viewApplication = (appNo) => {
            fetch(`/api/admin/application/${appNo}`)
                .then(res => res.json())
                .then(app => {
                    const modal = document.getElementById('appModal');
                    modal.style.display = 'flex';
                    modal.innerHTML = `
                            <div style="background: white; width: 850px; max-width: 95vw; max-height: 90vh; overflow-y: auto; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4); position: relative;">
                                <!-- Header with Clear Close Button -->
                                <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 1.5rem 2rem; color: white; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 10;">
                                    <h2 style="margin: 0; font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
                                        <span style="font-size: 1.5rem;">📄</span> Application: ${app.app_no}
                                    </h2>
                                    <button onclick="document.getElementById('appModal').style.display='none'" style="background: white; border: none; color: #1e40af; font-size: 1.5rem; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.15); transition: all 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">&times;</button>
                                </div>
                                
                                <div style="padding: 2rem;">
                                    
                                    <!-- Profile Card Section -->
                                    <div style="display: flex; gap: 2rem; align-items: flex-start; margin-bottom: 2rem; padding: 1.5rem; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 16px; border: 1px solid #e2e8f0;">
                                        <!-- Avatar -->
                                        <div style="flex-shrink: 0;">
                                            <div style="width: 100px; height: 100px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: white; font-weight: bold; box-shadow: 0 4px 12px rgba(30,64,175,0.3);">
                                                ${app.candidate_name ? app.candidate_name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                        </div>
                                        <!-- Basic Info -->
                                        <div style="flex: 1;">
                                            <h3 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; color: #1e293b;">${app.candidate_name}</h3>
                                            <p style="margin: 0 0 0.25rem 0; color: #64748b;">📧 ${app.email || 'N/A'}</p>
                                            <p style="margin: 0; color: #64748b;">📱 ${app.mobile || 'N/A'}</p>
                                            <div style="display: flex; gap: 0.75rem; margin-top: 1rem;">
                                                <span style="background: #e0e7ff; color: #3730a3; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600;">${app.gender || 'N/A'}</span>
                                                <span style="background: ${app.category === 'GM' ? '#dcfce7' : '#fef3c7'}; color: ${app.category === 'GM' ? '#166534' : '#92400e'}; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600;">${app.category}</span>
                                                <span style="background: #f3e8ff; color: #7c3aed; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600;">🎓 ${app.preference1}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Status Bar -->
                                    <div style="background: ${app.status === 'Verified' ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' : app.status === 'Rejected' ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'}; padding: 1.25rem 1.5rem; border-radius: 12px; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; border: 1px solid ${app.status === 'Verified' ? '#86efac' : app.status === 'Rejected' ? '#fca5a5' : '#fcd34d'};">
                                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                                            <span style="font-size: 1.5rem;">${app.status === 'Verified' ? '✅' : app.status === 'Rejected' ? '❌' : '⏳'}</span>
                                            <div>
                                                <p style="margin: 0; font-weight: 700; color: #1e293b;">Current Status</p>
                                                <p style="margin: 0; font-size: 0.9rem; color: #475569;">${app.status}</p>
                                            </div>
                                        </div>
                                        <div style="display: flex; gap: 0.75rem;">
                                            ${app.status !== 'Verified' ? `<button onclick="updateStatus('${app.app_no}', 'Verified')" style="background: #059669; color: white; border: none; padding: 0.65rem 1.25rem; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; box-shadow: 0 2px 8px rgba(5,150,105,0.3);"><span>✅</span> Verify</button>` : ''}
                                            ${app.status !== 'Rejected' ? `<button onclick="updateStatus('${app.app_no}', 'Rejected')" style="background: #dc2626; color: white; border: none; padding: 0.65rem 1.25rem; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; box-shadow: 0 2px 8px rgba(220,38,38,0.3);"><span>❌</span> Reject</button>` : ''}
                                        </div>
                                    </div>

                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                                        <!-- Personal Info Card -->
                                        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem;">
                                            <h3 style="color: #1e40af; font-size: 1rem; margin: 0 0 1.25rem 0; display: flex; align-items: center; gap: 0.5rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.75rem;">
                                                <span>👤</span> Candidate Info
                                            </h3>
                                            <div style="display: grid; gap: 0.75rem;">
                                                <p style="margin: 0; display: flex; justify-content: space-between;"><span style="color: #64748b;">Name:</span> <strong style="color: #1e293b;">${app.candidate_name}</strong></p>
                                                <p style="margin: 0; display: flex; justify-content: space-between;"><span style="color: #64748b;">Father:</span> <strong style="color: #1e293b;">${app.father_name || 'N/A'}</strong></p>
                                                <p style="margin: 0; display: flex; justify-content: space-between;"><span style="color: #64748b;">DOB:</span> <strong style="color: #1e293b;">${app.dob || 'N/A'}</strong></p>
                                                <p style="margin: 0; display: flex; justify-content: space-between;"><span style="color: #64748b;">Gender:</span> <strong style="color: #1e293b;">${app.gender || 'N/A'}</strong></p>
                                                <p style="margin: 0; display: flex; justify-content: space-between;"><span style="color: #64748b;">Category:</span> <strong style="color: #1e293b;">${app.category}</strong></p>
                                            </div>
                                        </div>

                                        <!-- Academic Info Card -->
                                        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem;">
                                            <h3 style="color: #1e40af; font-size: 1rem; margin: 0 0 1.25rem 0; display: flex; align-items: center; gap: 0.5rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.75rem;">
                                                <span>📚</span> Academic Details
                                            </h3>
                                            <p style="margin: 0 0 1rem 0; display: flex; justify-content: space-between;"><span style="color: #64748b;">SSLC Reg:</span> <strong style="color: #1e293b;">${app.sslc_reg_no || 'N/A'}</strong></p>
                                            <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 1.25rem; border-radius: 10px; text-align: center; margin-bottom: 1rem;">
                                                <p style="font-size: 2rem; font-weight: 800; color: white; margin: 0;">${app.sslc_percentage}%</p>
                                                <small style="color: rgba(255,255,255,0.8);">Overall Percentage</small>
                                            </div>
                                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                                                <div style="background: #f8fafc; padding: 0.75rem; border-radius: 8px; text-align: center;">
                                                    <p style="margin: 0; font-size: 1.25rem; font-weight: 700; color: #1e40af;">${app.maths_marks || 0}</p>
                                                    <small style="color: #64748b;">Maths</small>
                                                </div>
                                                <div style="background: #f8fafc; padding: 0.75rem; border-radius: 8px; text-align: center;">
                                                    <p style="margin: 0; font-size: 1.25rem; font-weight: 700; color: #1e40af;">${app.science_marks || 0}</p>
                                                    <small style="color: #64748b;">Science</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Documents Section -->
                                    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; margin-top: 2rem;">
                                        <h3 style="color: #1e40af; font-size: 1rem; margin: 0 0 1.25rem 0; display: flex; align-items: center; gap: 0.5rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.75rem;">
                                            <span>📎</span> Submitted Documents (${(app.documents) ? JSON.parse(app.documents).length : 0})
                                        </h3>
                                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem;">
                                            ${app.documents ? JSON.parse(app.documents).map(doc => `
                                                <div style="border: 2px solid #e2e8f0; border-radius: 10px; padding: 1rem; text-align: center; cursor: pointer; transition: all 0.2s; background: #fafafa;" onmouseover="this.style.borderColor='#3b82f6'; this.style.background='#eff6ff'; this.style.transform='translateY(-2px)';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.background='#fafafa'; this.style.transform='translateY(0)';" onclick="window.open('${doc.url}', '_blank')">
                                                    <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">${doc.name.toLowerCase().includes('photo') ? '📷' : '📄'}</div>
                                                    <p style="margin: 0; font-size: 0.75rem; font-weight: 600; color: #475569; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${doc.name}">${doc.name.replace(/_/g, ' ')}</p>
                                                    <small style="color: #3b82f6; font-weight: 600;">View →</small>
                                                </div>
                                            `).join('') : '<p style="color: #94a3b8; font-style: italic; text-align: center; padding: 2rem;">No documents uploaded.</p>'}
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>
                        `;
                });
        };

        window.updateStatus = (appNo, status) => {
            fetch('/api/admin/application/update_status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ app_no: appNo, status: status })
            })
                .then(res => res.json())
                .then(data => {
                    alert(data.message);
                    document.getElementById('appModal').style.display = 'none';
                    loadApplicationsManager(); // Refresh list
                });
        };

        // Global filter function
        window.applyFilters = () => {
            const category = document.getElementById('filterCategory')?.value || '';
            const status = document.getElementById('filterStatus')?.value || '';
            const course = document.getElementById('filterCourse')?.value || '';
            const gender = document.getElementById('filterGender')?.value || '';

            let filtered = [...window.allApplications];

            // Apply filters
            if (category) filtered = filtered.filter(a => a.category === category);
            if (status) filtered = filtered.filter(a => a.status === status);
            if (course) filtered = filtered.filter(a => a.preference1 === course);
            if (gender) filtered = filtered.filter(a => a.gender === gender);

            // Always sort by marks (high to low)
            filtered.sort((a, b) => b.sslc_percentage - a.sslc_percentage);

            renderApplicationsTable(filtered);
        };

        // Store current status filter
        window.currentStatusFilter = 'all';

        // Filter by status button
        window.filterByStatus = (status) => {
            window.currentStatusFilter = status;
            applyAllFilters();
        };

        // Apply advanced dropdown filters
        window.applyAdvancedFilters = () => {
            applyAllFilters();
        };

        // Combined filter function
        function applyAllFilters() {
            let filtered = [...window.allApplications];

            // Apply status filter
            if (window.currentStatusFilter && window.currentStatusFilter !== 'all') {
                filtered = filtered.filter(a => a.status === window.currentStatusFilter);
            }

            // Apply dropdown filters
            const category = document.getElementById('filterCategory')?.value || '';
            const course = document.getElementById('filterCourse')?.value || '';
            const gender = document.getElementById('filterGender')?.value || '';

            if (category) filtered = filtered.filter(a => a.category === category);
            if (course) filtered = filtered.filter(a => a.preference1 === course);
            if (gender) filtered = filtered.filter(a => a.gender === gender);

            // Sort by marks (highest first) - THIS IS THE DEFAULT
            filtered.sort((a, b) => b.sslc_percentage - a.sslc_percentage);

            renderApplicationsTable(filtered);
        }

        // Clear all filters
        window.clearAllFilters = () => {
            window.currentStatusFilter = 'all';
            document.getElementById('filterCategory').value = '';
            document.getElementById('filterCourse').value = '';
            document.getElementById('filterGender').value = '';
            renderApplicationsTable(window.allApplications);
        };

        // Global reset function
        window.resetFilters = () => {
            clearAllFilters();
        };

        // Global delete function
        window.deleteApplication = (appNo, candidateName) => {
            if (!confirm(`⚠️ Delete application for "${candidateName}"?\n\nApplication No: ${appNo}\n\nThis action cannot be undone!`)) {
                return;
            }

            fetch('/api/admin/application/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ app_no: appNo })
            })
                .then(res => res.json())
                .then(data => {
                    alert(data.message);
                    loadApplicationsManager(); // Refresh list
                })
                .catch(err => {
                    alert('Error deleting application: ' + err);
                });
        };
    }

    // Load student count editor
    function loadStudentCountEditor() {
        fetch('/admin/edit/student_count')
            .then(res => res.json())
            .then(data => {
                const listArr = data.student_details || [];
                container.innerHTML = injectBackButton(`
                        <div class="editor-header" style="margin-bottom: 2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem;"> <h2>📊 Student Enrollment Data</h2></div>
                            <form id="studentDetailsForm">
                                <div style="overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 8px;">
                                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                                        <thead style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                                            <tr>
                                                <th style="padding: 1rem; color: #64748b; font-weight: 600;">🎓 Branch</th>
                                                <th style="padding: 1rem; color: #64748b; font-weight: 600;">📅 Semester</th>
                                                <th style="padding: 1rem; color: #64748b; font-weight: 600;">👥 Students</th>
                                                <th style="padding: 1rem; width: 50px;"></th>
                                            </tr>
                                        </thead>
                                        <tbody id="studentDetailsList">
                                            <!-- Rows injected here -->
                                        </tbody>
                                    </table>
                                </div>
                                <button type="button" id="addStudentDetailBtn" style="background: #059669; color: white; padding: 0.5rem 1rem; border: none; border-radius: 6px; cursor: pointer; margin-top: 1rem;">+ Add Row</button>
                                <hr style="margin: 2rem 0; border: none; border-top: 2px solid #e2e8f0;">
                                <button type="submit" style="background: #1e40af; color: white; padding: 0.75rem 2.5rem; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">Save Stats</button>
                            </form>
                `);

                const list = document.getElementById('studentDetailsList');
                listArr.forEach(d => { addStudentDetailInput(d.branch, d.semester, d.count); });

                document.getElementById('addStudentDetailBtn').addEventListener('click', () => { addStudentDetailInput('', '', ''); });

                document.getElementById('studentDetailsForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    const stats = [];
                    list.querySelectorAll('tr').forEach(row => {
                        const inputs = row.querySelectorAll('input');
                        if (inputs.length === 3) {
                            stats.push({
                                branch: inputs[0].value.trim(),
                                semester: parseInt(inputs[1].value.trim(), 10),
                                count: parseInt(inputs[2].value.trim(), 10)
                            });
                        }
                    });

                    fetch('/admin/edit/student_count', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ student_details: stats }) })
                        .then(res => { if (res.ok) alert('Updated successfully.'); });
                });

                function addStudentDetailInput(branch, semester, count) {
                    const tr = document.createElement('tr');
                    tr.style.borderBottom = "1px solid #f1f5f9";
                    tr.innerHTML = `
                        <td style="padding: 0.75rem;"><input type="text" value="${branch}" placeholder="Branch" required style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px;" /></td>
                        <td style="padding: 0.75rem;"><input type="number" value="${semester}" placeholder="Sem" min="1" max="6" required style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px;" /></td>
                        <td style="padding: 0.75rem;"><input type="number" value="${count}" placeholder="Count" min="0" required style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px;" /></td>
                        <td style="padding: 0.75rem; text-align: center;">
                            <button type="button" class="removeBtn" style="background: #fee2e2; color: #ef4444; border: none; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-size: 1.2rem;">×</button>
                        </td>
                    `;
                    list.appendChild(tr);
                    tr.querySelector('.removeBtn').addEventListener('click', () => { tr.remove(); });
                }
            });
    }

    // Change Credentials
    function loadChangeCredentialsEditor() {
        container.innerHTML = injectBackButton(`
            <div class="editor-header" style="margin-bottom: 2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem;"> <h2>🔑 Security Settings</h2></div>
                <form id="credForm" style="max-width: 400px;">
                    <input type="text" id="newU" placeholder="New Username" required style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid #cbd5e1; margin-bottom: 1.5rem;" />
                    <input type="password" id="newP" placeholder="New Password" required style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid #cbd5e1; margin-bottom: 2rem;" />
                    <button type="submit" style="background: #ea580c; color: white; padding: 0.75rem 2rem; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">Update</button>
                </form>
        `);
        document.getElementById('credForm').addEventListener('submit', (e) => {
            e.preventDefault();
            fetch('/admin/change_credentials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: document.getElementById('newU').value.trim(), password: document.getElementById('newP').value.trim() }) })
                .then(res => { if (res.ok) { alert('Updated. Logging out...'); window.location.href = '/admin/logout'; } });
        });
    }

    function loadForgotPasswordEditor() {
        container.innerHTML = injectBackButton('<h2>🔑 Reset Access</h2><form id="forgotForm"><input type="text" id="forgotU" placeholder="Username" required/><button type="submit">Send Reset</button></form><div id="forgotMsg"></div>');
        document.getElementById('forgotForm').addEventListener('submit', (e) => {
            e.preventDefault();
            fetch('/admin/forgot_password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: document.getElementById('forgotU').value.trim() }) })
                .then(res => res.json()).then(data => { document.getElementById('forgotMsg').textContent = data.message; });
        });
    }
    // Homepage Manager (Hybrid: Visual Editor + Slider Manager)
    function loadHomepageManager() {
        fetch('/api/homepage')
            .then(res => res.json())
            .then(data => {
                const homepage = data.homepage || {};
                let galleryImages = [];
                try {
                    galleryImages = homepage.gallery_images ? JSON.parse(homepage.gallery_images) : [];
                } catch (e) { console.error(e); }

                container.innerHTML = injectBackButton(`
                    <div class="editor-header" style="margin-bottom: 2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem;">
                        <h2>🏠 Manage Home Page</h2>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 3rem;">
                        <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 2rem; border-radius: 16px; border: 1px solid #bfdbfe;">
                            <h3 style="color: #1e40af; margin-top: 0;">🎨 Visual Editor</h3>
                            <p style="color: #60a5fa; margin-bottom: 1.5rem;">Edit text, colors, and layout visually like a pro.</p>
                            <button onclick="window.location.href='/admin/visual_editor?page=homepage'" style="background: #1e40af; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; width: 100%;">Launch Editor →</button>
                        </div>
                        <div style="background: #f8fafc; padding: 2rem; border-radius: 16px; border: 1px solid #e2e8f0;">
                            <h3 style="color: #475569; margin-top: 0;">🖼️ Slider Gallery</h3>
                            <p style="color: #94a3b8; margin-bottom: 1.5rem;">Manage the images in the main slider.</p>
                            <a href="#sliderForm" style="display: block; text-align: center; color: #475569; padding: 0.75rem; background: white; border-radius: 8px; border: 1px solid #e2e8f0; text-decoration: none; font-weight: 600;">Scroll to Manager ↓</a>
                        </div>
                    </div>

                    <h3 id="sliderForm" style="border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 1.5rem;">Slider Images</h3>
                    <form id="homeGalleryForm">
                        <div id="galleryList" style="display: grid; gap: 1rem; margin-bottom: 1.5rem;"></div>
                        
                        <div style="display: flex; gap: 1rem; margin-bottom: 2rem; align-items: center;">
                            <input type="text" id="newImgUrl" placeholder="Enter Image URL" style="flex: 1; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px;" />
                            <span style="color: #94a3b8;">or</span>
                            <input type="file" id="sliderUpload" style="display: none;" accept="image/*" />
                            <button type="button" onclick="document.getElementById('sliderUpload').click()" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 0.75rem 1rem; border-radius: 6px; cursor: pointer;">📂 Upload</button>
                            <button type="button" id="addImgBtn" style="background: #059669; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 6px; cursor: pointer;">+ Add URL</button>
                        </div>

                        <button type="submit" style="background: #1e40af; color: white; padding: 0.75rem 2.5rem; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">Save Gallery</button>
                    </form>
                `);

                const list = document.getElementById('galleryList');

                function renderGallery() {
                    list.innerHTML = '';
                    galleryImages.forEach((url, index) => {
                        const div = document.createElement('div');
                        div.style = "display: flex; align-items: center; gap: 1rem; background: white; padding: 1rem; border: 1px solid #e2e8f0; border-radius: 8px;";
                        div.innerHTML = `
                            <img src="${url}" style="width: 80px; height: 50px; object-fit: cover; border-radius: 4px; background: #eee;" />
                            <input type="text" value="${url}" readonly style="flex: 1; padding: 0.5rem; border: 1px solid #f1f5f9; background: #f8fafc; color: #64748b; border-radius: 4px;" />
                            <button type="button" class="del-btn" style="background: #fee2e2; color: #ef4444; border: none; width: 32px; height: 32px; border-radius: 4px; cursor: pointer;">×</button>
                        `;
                        div.querySelector('.del-btn').onclick = () => {
                            galleryImages.splice(index, 1);
                            renderGallery();
                        };
                        list.appendChild(div);
                    });
                }
                renderGallery();


                // File Upload handler
                document.getElementById('sliderUpload').onchange = (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const formData = new FormData();
                    formData.append('upload', file);

                    const btn = e.target.nextElementSibling;
                    const originalText = btn.textContent;
                    btn.textContent = '⏳';

                    fetch('/upload-image', {
                        method: 'POST',
                        body: formData
                    })
                        .then(res => res.json())
                        .then(data => {
                            btn.textContent = originalText;
                            if (data.url) {
                                galleryImages.push(data.url);
                                renderGallery();
                            } else {
                                alert('Upload failed');
                            }
                        })
                        .catch(err => {
                            btn.textContent = originalText;
                            alert('Error uploading: ' + err);
                        });
                };

                document.getElementById('addImgBtn').onclick = () => {
                    const input = document.getElementById('newImgUrl');
                    const url = input.value.trim();
                    if (url) {
                        galleryImages.push(url);
                        input.value = '';
                        renderGallery();
                    }
                };

                document.getElementById('homeGalleryForm').onsubmit = (e) => {
                    e.preventDefault();
                    // We need to send the FULL homepage object back, slightly awkward API design but works
                    const newHomepageCore = {
                        title: homepage.title || '',
                        subtitle: homepage.subtitle || '',
                        about: homepage.about || '',
                        gallery_images: galleryImages
                    };

                    fetch('/admin/edit/homepage', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ homepage: newHomepageCore })
                    })
                        .then(res => { if (res.ok) alert('Gallery updated successfully!'); });
                };
            });
    }

});

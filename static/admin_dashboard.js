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

                    const branches = ['Non-Teaching', 'Computer Science Engineering', 'Electrical and Electronics Engineering', 'Electronics and Communication Engineering', 'Mechanical Engineering'];
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
                const apps = data.applications || [];
                console.log("📊 Total Apps Found:", apps.length);
                let html = injectBackButton(`
            <div class="applicants-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem;">
                        <div><h2 style="color: #1e40af;">📋 Admission Merit List (2026)</h2></div>
                        <div class="stats-badge" style="background: #1e40af; color: white; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 800; font-size: 1.1rem;">Total: ${apps.length}</div>
                    </div>
            `);

                if (apps.length === 0) {
                    html += '<div style="text-align: center; padding: 5rem 2rem; background: white; border-radius: 16px; border: 2px dashed #cbd5e1;"><h3>No applications found.</h3></div>';
                } else {
                    html += `<div style="overflow-x: auto; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <table style="width: 100%; border-collapse: collapse; text-align: left; min-width: 900px;">
                <thead style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                    <tr><th style="padding: 1rem;">Rank</th><th style="padding: 1rem;">Student</th><th style="padding: 1rem;">Category</th><th style="padding: 1rem;">SSLC %</th><th style="padding: 1rem;">Choice</th><th style="padding: 1rem;">Status</th><th style="padding: 1rem;">Actions</th></tr>
                </thead>
                <tbody>`;
                    apps.forEach((app, index) => {
                        html += `<tr style="border-bottom: 1px solid #f1f5f9; background: ${app.category === 'SC' || app.category === 'ST' ? '#fffbeb' : 'white'}">
                                <td style="padding: 1rem; font-weight: 800;">#${index + 1}</td>
                                <td style="padding: 1rem;"><strong>${app.candidate_name}</strong><br/><small>${app.app_no}</small></td>
                                <td style="padding: 1rem;"><span style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">${app.category}</span></td>
                                <td style="padding: 1rem; font-weight: 800; color: #1e40af;">${app.sslc_percentage}%</td>
                                <td style="padding: 1rem;">${app.preference1}</td>
                                <td style="padding: 1rem;"><span style="background: ${app.status === 'Pending' ? '#fef3c7' : '#dcfce7'}; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 800;">${app.status}</span></td>
                                <td style="padding: 1rem;"><button onclick="viewApplication('${app.app_no}')" style="background: #1e40af; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">View</button></td></tr>`;
                    });
                    html += `</tbody></table></div> `;
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
                            <div style="background: white; width: 800px; max-height: 90vh; overflow-y: auto; border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
                                <div style="background: #1e40af; padding: 1.5rem; color: white; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0;">
                                    <h2 style="margin: 0; font-size: 1.25rem;">📄 Application Details: ${app.app_no}</h2>
                                    <button onclick="document.getElementById('appModal').style.display='none'" style="background: transparent; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
                                </div>
                                <div style="padding: 2rem;">
                                    
                                    <!-- Status Bar -->
                                    <div style="background: ${app.status === 'Verified' ? '#dcfce7' : app.status === 'Rejected' ? '#fee2e2' : '#fef3c7'}; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
                                        <span><strong>Current Status:</strong> ${app.status}</span>
                                        <div style="display: flex; gap: 0.5rem;">
                                            ${app.status !== 'Verified' ? `<button onclick="updateStatus('${app.app_no}', 'Verified')" style="background: #059669; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 600;">✅ Verify</button>` : ''}
                                            ${app.status !== 'Rejected' ? `<button onclick="updateStatus('${app.app_no}', 'Rejected')" style="background: #dc2626; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 600;">❌ Reject</button>` : ''}
                                        </div>
                                    </div>

                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                                        <!-- Personal Info -->
                                        <div>
                                            <h3 style="color: #64748b; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 1rem;">Candidate Info</h3>
                                            <p><strong>Name:</strong> ${app.candidate_name}</p>
                                            <p><strong>Father's Name:</strong> ${app.father_name}</p>
                                            <p><strong>DOB:</strong> ${app.dob || 'N/A'}</p>
                                            <p><strong>Gender:</strong> ${app.gender}</p>
                                            <p><strong>Category:</strong> ${app.category}</p>
                                            <p><strong>Contact:</strong> ${app.mobile}</p>
                                            <p><strong>Email:</strong> ${app.email}</p>
                                        </div>

                                        <!-- Academic Info -->
                                        <div>
                                            <h3 style="color: #64748b; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 1rem;">Academic Details</h3>
                                            <p><strong>SSLC Reg No:</strong> ${app.sslc_reg_no || 'N/A'}</p>
                                            <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-top: 0.5rem;">
                                                <p style="font-size: 1.5rem; font-weight: 800; color: #1e40af; margin-bottom: 0;">${app.sslc_percentage}%</p>
                                                <small style="color: #64748b;">Overall Percentage</small>
                                            </div>
                                            <p style="margin-top: 1rem;"><strong>Maths Score:</strong> ${app.maths_marks || 0}</p>
                                            <p><strong>Science Score:</strong> ${app.science_marks || 0}</p>
                                            <p><strong>Preference:</strong> ${app.preference1}</p>
                                        </div>
                                    </div>

                                    <!-- Documents -->
                                    <h3 style="color: #64748b; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 1rem; margin-top: 2rem;">Submitted Documents (${(app.documents) ? JSON.parse(app.documents).length : 0})</h3>
                                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem;">
                                        ${app.documents ? JSON.parse(app.documents).map(doc => `
                                            <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; text-align: center; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='white'" onclick="window.open('${doc.url}', '_blank')">
                                                <div style="font-size: 2rem;">${doc.name.toLowerCase().includes('photo') ? '📷' : '📄'}</div>
                                                <p style="margin: 0.5rem 0 0 0; font-size: 0.8rem; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${doc.name}">${doc.name.replace(/_/g, ' ')}</p>
                                                <small style="color: #3b82f6;">View File</small>
                                            </div>
                                        `).join('') : '<p style="color: #94a3b8; font-style: italic;">No documents uploaded.</p>'}
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
            });
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

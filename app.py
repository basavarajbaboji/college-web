from flask import Flask, send_from_directory, jsonify, request, session, redirect, url_for, g
import sqlite3
import os
import json
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from werkzeug.utils import secure_filename

# Email Configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
# IMPORTANT: Use environment variables or a config file for these in production
EMAIL_ADDRESS = os.environ.get('EMAIL_USER', 'your-email@gmail.com')
EMAIL_PASSWORD = os.environ.get('EMAIL_PASS', 'your-app-password')
ADMIN_EMAIL = "bm4248757@gmail.com"

app = Flask(__name__, static_folder='static', static_url_path='')
app.secret_key = 'your_secret_key_here'



UPLOAD_FOLDER = os.path.join(app.static_folder, 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload-image', methods=['POST'])
def upload_image():
    if 'upload' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['upload']
    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    # Send the public URL path back
    return jsonify({'url': f'/uploads/{filename}'})




basedir = os.path.abspath(os.path.dirname(__file__))
DATABASE = os.path.join(basedir, 'college.db')

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    with app.app_context():
        db = get_db()
        cursor = db.cursor()

        # Create admin table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS admin (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        ''')

        # Create content tables
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS branches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                future_tech TEXT,
                current_usage TEXT,
                career_roles TEXT,
                core_subjects TEXT,
                key_skills TEXT,
                eligibility TEXT,
                duration TEXT,
                intake INTEGER,
                labs TEXT
            )
        ''')
        
        # Migration for branches columns
        cursor.execute("PRAGMA table_info(branches)")
        columns = [col[1] for col in cursor.fetchall()]
        for col in ['future_tech', 'current_usage', 'career_roles', 'core_subjects', 'key_skills', 'eligibility', 'duration', 'intake', 'labs']:
            if col not in columns:
                cursor.execute(f'ALTER TABLE branches ADD COLUMN {col} TEXT')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS faculty (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT,
                email TEXT,
                role TEXT,
                description TEXT,
                qualification TEXT,
                experience TEXT,
                specialization TEXT,
                achievements TEXT,
                subjects TEXT
            )
        ''')
        
        # Migration for faculty columns
        cursor.execute("PRAGMA table_info(faculty)")
        faculty_columns = [col[1] for col in cursor.fetchall()]
        for col in ['qualification', 'experience', 'specialization', 'achievements', 'subjects', 'branch', 'image_url']:
            if col not in faculty_columns:
                cursor.execute(f'ALTER TABLE faculty ADD COLUMN {col} TEXT')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS admissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                info TEXT NOT NULL
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS student_details (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                branch TEXT NOT NULL,
                semester INTEGER NOT NULL,
                count INTEGER NOT NULL
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS homepage (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                title TEXT NOT NULL,
                subtitle TEXT,
                about TEXT,
                gallery_images TEXT
            )
        ''')
        
        # Migration for homepage gallery_images
        cursor.execute("PRAGMA table_info(homepage)")
        hp_columns = [col[1] for col in cursor.fetchall()]
        if 'gallery_images' not in hp_columns:
            cursor.execute('ALTER TABLE homepage ADD COLUMN gallery_images TEXT')
            # Set default images
            default_images = json.dumps([
                "https://imgs.search.brave.com/9xAZEA1ObMq2GHjKL3_Tu41hB7fbltuQqB_MnNWF-Yc/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTQ4/MzI3Mjc5Ni9waG90/by9zZW1pbmFyLWNv/ZGluZy10YWxraW5n/LmpwZz9zPTYxMng2/MTImdz0wJms9MjAm/Yz0xVDRXVk9JX1J6/UGFRQkF5QzF6MDJo/UjBjeWNBcDJSZ2JB/UzJfRW9pZm5FPQ",
                "https://imgs.search.brave.com/xHmkH2VnPu3TcLbKfY-obHe8FU6A2YL6-5agMx7Uey0/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMudW5zcGxhc2gu/Y29tL3Bob3RvLTE1/MjIwNzE4MjAwODEt/MDA5ZjAxMjljNzFj/P2ZtPWpwZyZxPTYw/Jnc9MzAwMCZpeGxp/Yj1yYi00LjEuMCZp/eGlkPU0zd3hNakEz/ZkRCOE1IeHpaV0Z5/WTJoOE1UWjhmR052/Ykd4bFoyVWxNakJ6/ZEhWa1pXNTBjM3hs/Ym53d2ZId3dmSHg4/TUE9PQ",
                "https://imgs.search.brave.com/Zu3XdD1LcPTt2IbbJ5X0zzWPVeFULoHH1Grk94DilVE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA2LzcyLzg4Lzgy/LzM2MF9GXzY3Mjg4/ODI2MV94NjFveXYz/STV0UzdoakFRd251/U2VXUHdKNzVXYU1q/RS5qcGc"
            ])
            cursor.execute('UPDATE homepage SET gallery_images = ? WHERE id = 1', (default_images,))

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                app_no TEXT UNIQUE,
                candidate_name TEXT,
                father_name TEXT,
                dob TEXT,
                gender TEXT,
                category TEXT,
                mobile TEXT,
                email TEXT,
                sslc_reg_no TEXT,
                sslc_percentage REAL,
                maths_marks INTEGER,
                science_marks INTEGER,
                preference1 TEXT,
                status TEXT DEFAULT 'Pending'
            )
        ''')
        
        # Migration for applications columns
        cursor.execute("PRAGMA table_info(applications)")
        app_columns = [col[1] for col in cursor.fetchall()]
        if 'documents' not in app_columns:
            cursor.execute('ALTER TABLE applications ADD COLUMN documents TEXT')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS site_styles (
                selector TEXT PRIMARY KEY,
                rules TEXT
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS contact (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                address TEXT,
                phone TEXT,
                email TEXT
            )
        ''')
        cursor.execute('SELECT * FROM admin WHERE username = ?', ('gptholealuradmin',))
        if cursor.fetchone() is None:
            cursor.execute(
                'INSERT INTO admin (username, password) VALUES (?, ?)',
                ('gptholealuradmin', 'Gpt@2024#Secure!')
            )

        # Default homepage content
        cursor.execute('SELECT * FROM homepage WHERE id = 1')
        if cursor.fetchone() is None:
            default_imgs = json.dumps([
                "https://imgs.search.brave.com/9xAZEA1ObMq2GHjKL3_Tu41hB7fbltuQqB_MnNWF-Yc/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTQ4/MzI3Mjc5Ni9waG90/by9zZW1pbmFyLWNv/ZGluZy10YWxraW5n/LmpwZz9zPTYxMng2/MTImdz0wJms9MjAm/Yz0xVDRXVk9JX1J6/UGFRQkF5QzF6MDJo/UjBjeWNBcDJSZ2JB/UzJfRW9pZm5FPQ",
                "https://imgs.search.brave.com/xHmkH2VnPu3TcLbKfY-obHe8FU6A2YL6-5agMx7Uey0/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMudW5zcGxhc2gu/Y29tL3Bob3RvLTE1/MjIwNzE4MjAwODEt/MDA5ZjAxMjljNzFj/P2ZtPWpwZyZxPTYw/Jnc9MzAwMCZpeGxp/Yj1yYi00LjEuMCZp/eGlkPU0zd3hNakEz/ZkRCOE1IeHpaV0Z5/WTJoOE1UWjhmR052/Ykd4bFoyVWxNakJ6/ZEhWa1pXNTBjM3hs/Ym53d2ZId3dmSHg4/TUE9PQ",
                "https://imgs.search.brave.com/Zu3XdD1LcPTt2IbbJ5X0zzWPVeFULoHH1Grk94DilVE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA2LzcyLzg4Lzgy/LzM2MF9GXzY3Mjg4/ODI2MV94NjFveXYz/STV0UzdoakFRd251/U2VXUHdKNzVXYU1q/RS5qcGc"
            ])
            cursor.execute('''
                INSERT INTO homepage (id, title, subtitle, about, gallery_images)
                VALUES (1, 'Welcome to Government Polytechnic College Hole Alur', 'Empowering future engineers with innovative education', 'Our mission is to provide quality technical education and foster innovation. We offer various diploma programs in engineering and technology, preparing students for successful careers in the industry.', ?)
            ''', (default_imgs,))

        # Sample branches initialization / update
        branches_data = [
            (
                'Artificial Intelligence', 
                'Master the art of machine intelligence, from neural networks and deep learning to natural language processing and computer vision.', 
                'Development of Artificial General Intelligence (AGI), brain-computer interfaces, and AI-driven autonomous societies.', 
                'Pervasive in modern fintech for fraud detection, personalized medicine in healthcare, and sophisticated autonomous drone navigation.', 
                'AI Research Scientist, Machine Learning Engineer, Data Architect, Computer Vision Expert, NLP Specialist.',
                'Machine Learning, Neural Networks, Python for AI, Data Structures & Algorithms, Deep Learning, Natural Language Processing.',
                'Predictive Modeling, Neural Network Architecture, Big Data Analytics, Statistical Programming, AI Ethics & Governance.',
                'SSLC/10th Pass with 35% minimum in Math and Science.',
                '3 Years (6 Semesters)',
                60,
                'AI Research Lab, Deep Learning Studio, Robotics Simulation Centre'
            ),
            (
                'Computer Science Engineering', 
                'Dive deep into algorithm design, full-stack software development, cloud architecture, and the fundamentals of modern computing systems.', 
                'Hyper-scale edge computing, post-quantum cryptography, and the implementation of decentralized Web3 ecosystems.', 
                'The backbone of the global digital economy, powering everything from high-frequency trading platforms to global social networks and enterprise SaaS.', 
                'Full-Stack Developer, Systems Architect, Cybersecurity Analyst, Cloud Solutions Architect, Blockchain Developer.',
                'Database Management Systems, Operating Systems, Web Development (HTML/CSS/JS), Computer Networks, Cyber Security, Software Engineering.',
                'Full-Stack Development, Cloud Computing (AWS/Azure), Cyber Defense, Network Security, Agile Methodology, DevOps.',
                'SSLC/10th Pass with 35% minimum in Math and Science.',
                '3 Years (6 Semesters)',
                60,
                'Advanced Computing Lab, Networks & Security Lab, Web Development Hub'
            ),
            (
                'Electrical and Electronics Engineering', 
                'Explore the world of power electronics, renewable energy systems, micro-grids, and advanced control systems.', 
                'Fusion energy management systems, high-efficiency wireless energy harvesting, and the development of city-scale smart electricity grids.', 
                'Crucial for the electric vehicle (EV) revolution, renewable energy integration (Solar/Wind), and modern industrial factory automation systems.', 
                'Power Systems Engineer, EV Powertrain Designer, Renewable Energy Consultant, Control Systems Analyst, Smart Grid Architect.',
                'Electric Circuits, Power Electronics, Control Systems, Power Systems Analysis, Electrical Machines, High Voltage Engineering.',
                'Power System Simulation, Industrial Automation (PLC/SCADA), EV Drivetrain Tuning, Energy Auditing, PCB Design.',
                'SSLC/10th Pass with 35% (General) / 30% (SC/ST).',
                '3 Years (6 Semesters)',
                40,
                'Electrical Machines Lab, Power Electronics Lab, Renewable Energy Simulation Suite'
            ),
            (
                'Electronics and Communication Engineering', 
                'Focus on the future of connectivity, including VLSI design, embedded systems, 5G/6G networks, and satellite communication.', 
                'Implementation of 6G Terahertz communication, bio-electronics for medical implants, and flexible, transparent wearable technology.', 
                'Essential for global telecommunications, aerospace navigation systems, IoT ecosystem development, and high-performance semiconductor manufacturing.', 
                'VLSI Design Engineer, Embedded Firmware Developer, Telecommunications Specialist, IoT Solutions Architect, RF Engineer.',
                'Analog & Digital Communication, VLSI Design, Embedded Systems, Microprocessors, Signal Processing, Fiber Optics.',
                'VLSI Physical Design, Embedded C Coding, RF Circuit Design, Signal Analysis, IoT Sensor Integration, Hardware Debugging.',
                'SSLC/10th Pass with 35% minimum in Math and Science.',
                '3 Years (6 Semesters)',
                60,
                'VLSI Design Lab, Embedded Systems Workshop, Communication Systems Lab'
            ),
            (
                'Mechanical Engineering', 
                'Learn the principles of thermodynamics, robotics, advanced materials, and precise mechanical design.', 
                'Nanobotics for precision surgery, 4D printing of adaptive materials, and hyperloop transportation infrastructure.', 
                'Driving innovation in Tesla-style aerospace manufacturing, sophisticated robotics in logistics, and high-efficiency thermal management for data centers.', 
                'Robotics Engineer, Aerospace Design Analyst, Manufacturing Systems Manager, Thermal Engineer, CAD/CAM Specialist.',
                'Thermodynamics, Fluid Mechanics, Manufacturing Technology, Kinematics of Machinery, Heat Transfer, Robotics & CAD.',
                'Computer-Aided Design (CAD), Thermal Analysis, Robot Programming, CNC Operations, Structural Mechanics, Advanced Manufacturing.',
                'SSLC/10th Pass with 35% aggregate.',
                '3 Years (6 Semesters)',
                60,
                'Robotics & Automation Lab, Advanced Thermal Engineering Lab, CAD/CAM Design Studio'
            ),
            (
                'Civil Engineering', 
                'Study the design and construction of resilient infrastructure, smart cities, sustainable architecture, and structural engineering.', 
                '3D-printed sustainable housing, self-healing concrete, and the engineering of climate-resilient floating cities.', 
                'At the forefront of building modern smart-city infrastructures, high-speed rail networks, and sustainable green buildings with zero carbon footprint.', 
                'Urban Planner, Structural Engineer, Sustainable Design Consultant, Transportation Infrastructure Lead, Geo-technical Analyst.',
                'Structural Analysis, Construction Technology, Environmental Engineering, Transportation Engineering, Surveying, GIS & Remote Sensing.',
                'BIM (Building Information Modeling), Structural Design, Project Management, Land Surveying, GIS Analysis, Environmental Assessment.',
                'SSLC/10th Pass with 35% aggregate.',
                '3 Years (6 Semesters)',
                40,
                'Structural Engineering Lab, GIS & Surveying Centre, Fluid Mechanics Lab'
            )
        ]
        
        for name, desc, tech, usage, career, subjects, skills, eligibility, duration, intake, labs in branches_data:
            cursor.execute('SELECT id FROM branches WHERE name = ?', (name,))
            row = cursor.fetchone()
            if row:
                cursor.execute('UPDATE branches SET description = ?, future_tech = ?, current_usage = ?, career_roles = ?, core_subjects = ?, key_skills = ?, eligibility = ?, duration = ?, intake = ?, labs = ? WHERE name = ?', (desc, tech, usage, career, subjects, skills, eligibility, duration, intake, labs, name))
            else:
                cursor.execute('INSERT INTO branches (name, description, future_tech, current_usage, career_roles, core_subjects, key_skills, eligibility, duration, intake, labs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', (name, desc, tech, usage, career, subjects, skills, eligibility, duration, intake, labs))

        # Sample faculty initialization / update
        faculty_data = [
            ('Dr. Rajesh Kumar', '+91-9876543210', 'rajesh.kumar@gpcholealur.edu.in', 'Principal', 'Experienced educator with 15+ years in technical education.', 'PhD in Computer Science', '22 Years', 'Cloud Computing & Distributed Systems', 'Published 20+ International Papers, Best Principal Award 2022.', 'Advanced OS, Distributed Systems, Cloud Architecture'),
            ('Prof. Priya Sharma', '+91-9876543211', 'priya.sharma@gpcholealur.edu.in', 'HOD Computer Science', 'Specialist in software engineering and data structures.', 'M.Tech in CSE', '15 Years', 'Data Science & Big Data', 'Recognized for excellent student mentorship and curriculum development.', 'Software Engineering, Data Structures, Python Programming'),
            ('Mr. Amit Singh', '+91-9876543212', 'amit.singh@gpcholealur.edu.in', 'Lecturer Electrical and Electronics', 'Expert in power electronics and renewable energy.', 'M.E in Power Systems', '10 Years', 'Solar Energy & Smart Grids', 'Certified Green Energy Consultant.', 'Power Electronics, Network Analysis, Energy Management'),
            ('Ms. Sunita Patel', '+91-9876543213', 'sunita.patel@gpcholealur.edu.in', 'Lecturer Electronics and Communication', 'Focus on communication systems and signal processing.', 'M.Tech in VLSI', '8 Years', 'Embedded Systems', 'Expert in IoT hardware design.', 'Digital Electronics, Signal Processing, Embedded C'),
            ('Dr. Vikram Rao', '+91-9876543214', 'vikram.rao@gpcholealur.edu.in', 'HOD Artificial Intelligence', 'Expert in machine learning and AI applications.', 'PhD in AI & ML', '18 Years', 'Deep Learning & Robotics', 'Keynote speaker at national AI conferences.', 'Neural Networks, AI Ethics, Computer Vision'),
            ('Prof. Meera Joshi', '+91-9876543215', 'meera.joshi@gpcholealur.edu.in', 'Lecturer Computer Science', 'Focus on algorithms and programming languages.', 'M.Tech in Algorithms', '12 Years', 'Competitive Programming', 'Coach for state-level coding competitions.', 'Design & Analysis of Algorithms, C++, Java Programming'),
            ('Mr. Ramesh Gupta', '+91-9876543216', 'ramesh.gupta@gpcholealur.edu.in', 'Workshop Instructor', 'Specialist in mechanical workshops and CAD.', 'B.E in Mechanical Engineering', '14 Years', 'Industrial Safety & CAD', 'Safety Excellence Award 2023.', 'Workshop Practice, Engineering Drawing, CAD Tooling'),
            ('Ms. Kavita Nair', '+91-9876543217', 'kavita.nair@gpcholealur.edu.in', 'Lecturer Mathematics', 'Expert in applied mathematics for engineering.', 'M.Sc in Mathematics', '9 Years', 'Stochastic Processes', 'Recipient of the Teacher of the Year award 2021.', 'Engineering Mathematics I & II, Statistics, Numerical Methods')
        ]
        
        for name, phone, email, role, desc, qual, exp, spec, ach, subjects in faculty_data:
            cursor.execute('SELECT id FROM faculty WHERE name = ?', (name,))
            row = cursor.fetchone()
            if row:
                cursor.execute('UPDATE faculty SET role = ?, phone = ?, email = ?, description = ?, qualification = ?, experience = ?, specialization = ?, achievements = ?, subjects = ? WHERE name = ?', (role, phone, email, desc, qual, exp, spec, ach, subjects, name))
            else:
                cursor.execute('INSERT INTO faculty (name, phone, email, role, description, qualification, experience, specialization, achievements, subjects) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', (name, phone, email, role, desc, qual, exp, spec, ach, subjects))

        # Sample admissions info
        cursor.execute('SELECT COUNT(*) FROM admissions')
        if cursor.fetchone()[0] == 0:
            default_admissions = {
                'eligibility': 'Anyone who has passed 10th standard (SSLC) from a recognized board. Minimum age requirement: 16 years. Students who have completed ITI & PUC (Science background only) can apply for lateral entry directly to the 3rd semester. Students from other PUC backgrounds must take admission from 1st year. No CET or entrance exam is required – direct admissions only.',
                'courses': '<ul><li>🧠 Artificial Intelligence (AI)</li><li>💻 Computer Science & Engineering (CSE)</li><li>⚡ Electrical & Electronics Engineering (EEE)</li><li>📡 Electronics & Communication Engineering (ECE)</li></ul>',
                'process': '<ol><li>Collect / Download Application Form – Available at college office or online portal.</li><li>Submit Required Documents – Along with application form.</li><li>Merit & Verification – Documents are verified as per eligibility.</li><li>Fee Payment & Confirmation – Admission confirmed after payment.</li></ol>',
                'documents': '<ul><li>SSLC / 10th Marks Card</li><li>Transfer Certificate (TC)</li><li>PUC Marks Card (for lateral entry only)</li><li>Caste / Income / EWS Certificate (if applicable)</li><li>Aadhaar Card Copy</li><li>Passport Size Photos</li></ul>',
                'dates': '<ul><li>Application Opens: Update Soon</li><li>Last Date to Apply: Update Soon</li><li>Counseling & Verification: Update Soon</li><li>Classes Begin: Update Soon</li></ul>',
                'contact': '<ul><li>📞 Phone: +91 98765 43210</li><li>📧 Email: admissions@college.edu</li><li>📍 Address: Government Polytechnic College Hole Alur, Karnataka, India</li></ul>'
            }
            cursor.execute('INSERT INTO admissions (info) VALUES (?)', (json.dumps(default_admissions),))

        # Sample student details
        cursor.execute('SELECT COUNT(*) FROM student_details')
        if cursor.fetchone()[0] == 0:
            student_data = [
                ('Artificial Intelligence', 1, 40),
                ('Artificial Intelligence', 2, 38),
                ('Artificial Intelligence', 3, 35),
                ('Computer Science Engineering', 1, 45),
                ('Computer Science Engineering', 2, 42),
                ('Computer Science Engineering', 3, 38),
                ('Electrical and Electronics Engineering', 1, 50),
                ('Electrical and Electronics Engineering', 2, 48),
                ('Electrical and Electronics Engineering', 3, 45),
                ('Electronics and Communication Engineering', 1, 35),
                ('Electronics and Communication Engineering', 2, 32),
                ('Electronics and Communication Engineering', 3, 30)
            ]
            cursor.executemany('INSERT INTO student_details (branch, semester, count) VALUES (?, ?, ?)', student_data)

        db.commit()

init_db()

@app.route('/')
def serve_index():
    return send_from_directory('static', 'index.html')

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        db = get_db()
        cursor = db.cursor()
        cursor.execute('SELECT * FROM admin WHERE username = ? AND password = ?', (username, password))
        admin = cursor.fetchone()
        if admin:
            session['admin_logged_in'] = True
            return redirect(url_for('admin_dashboard'))
        return "Invalid credentials", 401
    return send_from_directory('static', 'admin.html')

@app.route('/admin/dashboard')
def admin_dashboard():
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin_login'))
    return send_from_directory('static', 'admin_dashboard.html')

@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_logged_in', None)
    return redirect(url_for('admin_login'))

@app.route('/admin/<path:filename>')
def admin_static_files(filename):
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin_login'))
    return send_from_directory('static', filename)

@app.route('/admin/edit/<section>', methods=['GET', 'POST'])
def admin_edit_section(section):
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin_login'))
    db = get_db()
    cursor = db.cursor()

    if request.method == 'POST':
        data = request.json

        if section == 'branches':
            branches = data.get('branches')
            if not branches: return "Invalid data", 400
            cursor.execute('DELETE FROM branches')
            for b in branches:
                cursor.execute('INSERT INTO branches (name, description, future_tech, current_usage, career_roles, core_subjects, key_skills, eligibility, duration, intake, labs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', (b['name'], b['description'], b.get('future_tech'), b.get('current_usage'), b.get('career_roles'), b.get('core_subjects'), b.get('key_skills'), b.get('eligibility'), b.get('duration'), b.get('intake'), b.get('labs')))
            db.commit()
            return "Branches updated successfully"

        elif section == 'faculty':
            faculty = data.get('faculty')
            if not faculty: return "Invalid data", 400
            cursor.execute('DELETE FROM faculty')
            for f in faculty:
                cursor.execute('''
                    INSERT INTO faculty (name, phone, email, role, description, qualification, experience, specialization, achievements, subjects, branch, image_url)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', (f['name'], f.get('phone'), f.get('email'), f['role'], f.get('description'), f.get('qualification'), f.get('experience'), f.get('specialization'), f.get('achievements'), f.get('subjects'), f.get('branch'), f.get('image_url')))
            db.commit()
            return "Faculty updated successfully"

        elif section == 'admissions':
            admissions = data.get('admissions')
            if not admissions: return "Invalid data", 400
            info = json.dumps(admissions)
            cursor.execute('DELETE FROM admissions')
            cursor.execute('INSERT INTO admissions (info) VALUES (?)', (info,))
            db.commit()
            return "Admissions info updated successfully"

        elif section == 'student_count':
            student_details = data.get('student_details')
            if not student_details: return "Invalid data", 400
            cursor.execute('DELETE FROM student_details')
            for s in student_details:
                cursor.execute('''
                    INSERT INTO student_details (branch, semester, count)
                    VALUES (?, ?, ?)''', (s['branch'], s['semester'], s['count']))
            db.commit()
            return "Student details updated successfully"

        elif section == 'homepage':
            homepage = data.get('homepage')
            if not homepage: return "Invalid data", 400
            
            # Serialize gallery_images
            gallery_images = json.dumps(homepage.get('gallery_images', []))
            
            cursor.execute('DELETE FROM homepage')
            cursor.execute('INSERT INTO homepage (id, title, subtitle, about, gallery_images) VALUES (1, ?, ?, ?, ?)',
                           (homepage.get('title'), homepage.get('subtitle'), homepage.get('about'), gallery_images))
            db.commit()
            return "Homepage updated successfully"

        elif section == 'contact':
            contact = data.get('contact')
            if not contact: return "Invalid data", 400
            cursor.execute('DELETE FROM contact')
            cursor.execute('INSERT INTO contact (id, address, phone, email) VALUES (1, ?, ?, ?)',
                           (contact.get('address'), contact.get('phone'), contact.get('email')))
            db.commit()
            return "Contact updated successfully"
            
        return "Invalid section", 400

    # GET section data
    if section == 'branches':
        cursor.execute('SELECT * FROM branches')
        return jsonify([dict(row) for row in cursor.fetchall()])

    elif section == 'faculty':
        cursor.execute('SELECT * FROM faculty')
        return jsonify({'faculty': [dict(row) for row in cursor.fetchall()]})

    elif section == 'admissions':
        cursor.execute('SELECT * FROM admissions')
        row = cursor.fetchone()
        if row:
            try:
                admissions = json.loads(row['info'])
            except:
                admissions = {}
        else:
            admissions = {}
        return jsonify({'admissions': admissions})

    elif section == 'student_count':
        cursor.execute('SELECT * FROM student_details')
        return jsonify({'student_details': [dict(row) for row in cursor.fetchall()]})

    elif section == 'homepage':
        cursor.execute('SELECT * FROM homepage WHERE id = 1')
        row = cursor.fetchone()
        return jsonify({'homepage': dict(row) if row else {}})

    elif section == 'contact':
        cursor.execute('SELECT * FROM contact WHERE id = 1')
        row = cursor.fetchone()
        return jsonify({'contact': dict(row) if row else {}})

    return "Invalid section", 400

@app.route('/admin/visual_editor')
def visual_editor_page():
    if 'admin_logged_in' not in session:
        return redirect('/admin/login')
    return send_from_directory('static', 'visual_editor.html')

@app.route('/api/save_styles', methods=['POST'])
def save_styles():
    if 'admin_logged_in' not in session:
        return jsonify({"error": "Unauthorized"}), 403
    
    data = request.json
    styles = data.get('styles', {})
    
    db = get_db()
    cursor = db.cursor()
    
    try:
        for selector, rules in styles.items():
            # Store rules as JSON string
            cursor.execute('INSERT OR REPLACE INTO site_styles (selector, rules) VALUES (?, ?)', 
                          (selector, json.dumps(rules)))
        db.commit()
        return jsonify({"message": "Styles saved"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/get_styles', methods=['GET'])
def get_styles():
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM site_styles')
    rows = cursor.fetchall()
    
    styles = {}
    for row in rows:
        try:
            styles[row['selector']] = json.loads(row['rules'])
        except:
            pass
            
    return jsonify(styles)

@app.route('/api/save_html', methods=['POST'])
def save_html():
    if 'admin_logged_in' not in session:
        return jsonify({"error": "Unauthorized"}), 403
    
    data = request.json
    page = data.get('page')
    content = data.get('content')
    
    if not page or not content:
        return jsonify({"error": "Missing data"}), 400
        
    # Security check: only allow specific static files
    allowed_pages = ['index.html', 'branches.html', 'faculty.html', 'admissions.html', 'contact.html']
    if page not in allowed_pages:
        return jsonify({"error": "Invalid page"}), 400
        
    try:
        filepath = os.path.join(app.static_folder, page)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return jsonify({"message": "Content saved successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/admin/change_credentials', methods=['POST'])
def change_credentials():
    if not session.get('admin_logged_in'):
        return "Unauthorized", 401
    data = request.json
    new_username = data.get('username')
    new_password = data.get('password')
    if not new_username or not new_password:
        return "Invalid data", 400
    db = get_db()
    cursor = db.cursor()
    cursor.execute('UPDATE admin SET username = ?, password = ? WHERE id = 1', (new_username, new_password))
    db.commit()
    return "Credentials updated successfully"

# Public API routes
@app.route('/api/branches', methods=['GET'])
def get_branches_info():
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM branches')
    branches = [dict(row) for row in cursor.fetchall()]
    return jsonify({'branches': branches})

@app.route('/api/admissions', methods=['GET'])
def get_admission_info():
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM admissions')
    row = cursor.fetchone()
    if row:
        try:
            admissions = json.loads(row['info'])
        except:
            admissions = {}
    else:
        admissions = {}
    return jsonify({'admissions': admissions})

@app.route('/api/faculty_details', methods=['GET'])
def api_faculty_details():
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM faculty')
    faculty_list = [dict(row) for row in cursor.fetchall()]
    return jsonify({'faculty': faculty_list})

@app.route('/api/student_details', methods=['GET'])
def api_student_details():
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT branch, semester, count FROM student_details')
    return jsonify({'student_details': [dict(row) for row in cursor.fetchall()]})

@app.route('/api/contact', methods=['GET'])
def get_contact_info():
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM contact WHERE id = 1')
    row = cursor.fetchone()
    if row:
        return jsonify(dict(row))
    return jsonify({
        "address": "Government Polytechnic College Hole Alur, Karnataka, India",
        "phone": "+91-12345-67890",
        "email": "info@gpcholealur.edu.in"
    })

@app.route('/api/contact', methods=['POST'])
def submit_contact():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')

    if not all([name, email, message]):
        return jsonify({"error": "All fields required."}), 400

    # Send Notification Email
    subject = f"New Contact Form Submission from {name}"
    body = f"Name: {name}\nEmail: {email}\n\nMessage:\n{message}"
    
    try:
        send_email(subject, body)
    except Exception as e:
        print(f"Error sending email: {e}")
        # We still return 200 as we might have saved it elsewhere or just for UX
        # but in a real app we'd handle this better

    return jsonify({"message": "Thank you! We'll get back to you soon."}), 200

def send_email(subject, body, files=None):
    if not EMAIL_ADDRESS or not EMAIL_PASSWORD or EMAIL_ADDRESS == 'your-email@gmail.com':
        print("Email configuration missing. Skipping email send.")
        return

    msg = MIMEMultipart()
    msg['From'] = EMAIL_ADDRESS
    msg['To'] = ADMIN_EMAIL
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'plain'))

    if files:
        for filename, file_data in files.items():
            attachment = MIMEApplication(file_data.read(), _subtype=filename.split('.')[-1])
            attachment.add_header('Content-Disposition', 'attachment', filename=filename)
            msg.attach(attachment)
            file_data.seek(0) # Reset file pointer for other uses if needed

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.send_message(msg)
            print(f"Email sent successfully to {ADMIN_EMAIL}")
    except Exception as e:
        print(f"Failed to send email: {e}")
        raise e

@app.route('/api/submit_application', methods=['POST'])
def submit_application():
    try:
        # Extract form data
        form_data = request.form
        name = form_data.get('candidateName', 'Unknown')
        
        # Build email body from all fields
        body = "New Diploma Admission Application\n"
        body += "===============================\n\n"
        for key, value in form_data.items():
            if key != 'declaration': # Skip declaration checkbox
                body += f"{key.replace('_', ' ').title()}: {value}\n"
        
        # Save to Database
        db = get_db()
        cursor = db.cursor()
        
        # Calculate merit score (simple example: percentage)
        sslc_percentage = float(form_data.get('percentage', 0))
        maths_marks = int(form_data.get('mathsMarks', 0))
        science_marks = int(form_data.get('scienceMarks', 0))
        
        app_no = f"GPC-HA-{name[:3].upper()}-{os.urandom(2).hex().upper()}"
        
        # Handle File Uploads
        uploaded_docs = []
        if 'files' in request.files: # Checks if files were sent
             # In a real scenario, we'd loop through request.files
             # For this demo, let's assume keys like 'doc_sslc', 'doc_caste', etc.
             pass

        # Since we are using standard form submission, files come as MultiDict
        # We'll save any file found in request.files
        for key, file in request.files.items():
            if file and file.filename:
                filename = secure_filename(f"{app_no}_{file.filename}")
                file.save(os.path.join(UPLOAD_FOLDER, filename))
                uploaded_docs.append({'name': key, 'url': f'/uploads/{filename}'})
        
        # If no files (e.g. text only submission), let's insert some dummy ones for the demo if user requests
        # But for now, we just save what we got. 
        # For the existing dummy data, we'll run a migration script update later.

        cursor.execute('''
            INSERT INTO applications (
                app_no, candidate_name, father_name, dob, gender, 
                category, mobile, email, sslc_reg_no, sslc_percentage, 
                maths_marks, science_marks, preference1, documents
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            app_no, name, form_data.get('fatherName'), form_data.get('dob'),
            form_data.get('gender'), form_data.get('category'), 
            form_data.get('mobile'), form_data.get('email'),
            form_data.get('sslcRegNo'), sslc_percentage,
            maths_marks, science_marks, form_data.get('preference1'),
            json.dumps(uploaded_docs)
        ))
        db.commit()

        # Send Email
        subject = f"New Admission Application: {name} ({app_no})"
        try:
             # attachments not implemented for now to avoid complexity with saved files
            send_email(subject, body) 
        except:
            pass # Don't block submission if email fails

        return jsonify({
            "message": "Application submitted successfully",
            "reference": app_no
        }), 200
    except Exception as e:
        print(f"Error processing application: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/applications', methods=['GET'])
def get_admin_applications():
    if not session.get('admin_logged_in'):
        return "Unauthorized", 401
    
    db = get_db()
    cursor = db.cursor()
    
    # Sorting logic: Category Hierarchy + Percentage
    # Hierarchy: GM -> SC -> ST -> Cat-1 -> 2A -> 2B -> 3A -> 3B
    category_order = "CASE category WHEN 'GM' THEN 1 WHEN 'SC' THEN 2 WHEN 'ST' THEN 3 WHEN 'Cat-1' THEN 4 WHEN '2A' THEN 5 WHEN '2B' THEN 6 WHEN '3A' THEN 7 WHEN '3B' THEN 8 ELSE 9 END"
    
    query = f"SELECT * FROM applications ORDER BY {category_order} ASC, sslc_percentage DESC"
    
    try:
        print(f"DEBUG: Executing query on {os.path.abspath(DATABASE)}")
        cursor.execute(query)
        rows = cursor.fetchall()
        print(f"DEBUG: Found {len(rows)} applications")
        apps = [dict(row) for row in rows]
    except Exception as e:
        print(f"DEBUG: Query failed: {e}")
        apps = []
        
    return jsonify({'applications': apps})

@app.route('/api/admin/application/<app_no>', methods=['GET'])
def get_application_details(app_no):
    if not session.get('admin_logged_in'):
        return "Unauthorized", 401
    
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM applications WHERE app_no = ?', (app_no,))
    row = cursor.fetchone()
    if row:
        return jsonify(dict(row))
    return "Not Found", 404

@app.route('/api/admin/application/update_status', methods=['POST'])
def update_application_status():
    if not session.get('admin_logged_in'):
        return "Unauthorized", 401
    
    data = request.json
    app_no = data.get('app_no')
    status = data.get('status') # 'Verified' or 'Rejected'
    
    if not app_no or not status:
        return "Invalid data", 400
        
    db = get_db()
    cursor = db.cursor()
    cursor.execute('UPDATE applications SET status = ? WHERE app_no = ?', (status, app_no))
    db.commit()
    return jsonify({"message": f"Status updated to {status}"})

@app.route('/api/homepage', methods=['GET'])
def get_homepage():
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM homepage WHERE id = 1')
    row = cursor.fetchone()
    return jsonify({'homepage': dict(row) if row else {}})

if __name__ == '__main__':
    app.run(debug=True)
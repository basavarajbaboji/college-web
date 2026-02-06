import sqlite3

# Connect to database
conn = sqlite3.connect('c:/Users/bm424/Downloads/college-web-main/college-web-main/college.db')
cursor = conn.cursor()

# ============ BRANCHES ============
print("=== Updating Branches ===")
cursor.execute("DELETE FROM branches")

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
    )
]

for name, desc, tech, usage, career, subjects, skills, eligibility, duration, intake, labs in branches_data:
    cursor.execute('''
        INSERT INTO branches (name, description, future_tech, current_usage, career_roles, core_subjects, key_skills, eligibility, duration, intake, labs) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (name, desc, tech, usage, career, subjects, skills, eligibility, duration, intake, labs))

print("Branches updated!")

# ============ STUDENT DETAILS ============
print("\n=== Updating Student Details ===")
cursor.execute("DELETE FROM student_details")

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
print("Student details updated!")

conn.commit()

# ============ VERIFY ============
print("\n=== Final Verification ===")
cursor.execute('SELECT name FROM branches')
print("Branches:", [row[0] for row in cursor.fetchall()])

cursor.execute('SELECT DISTINCT branch FROM student_details')
print("Student branches:", [row[0] for row in cursor.fetchall()])

conn.close()
print("\n✅ Database fully updated with 4 courses only!")

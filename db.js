/* ============================================================
   VIRTUAL MOCK DATABASE LAYER (js/db.js)
   - Simulates MySQL relational backend via localStorage
   ============================================================ */

const DB_VERSION = 2;

const STORAGE_KEYS = {
    CUSTOM_BOT_RESPONSES: "uem_custom_bot_responses",
    STUDENTS:             "uem_students",
    DASHBOARD_SETTINGS:   "uem_settings",
    TELEMETRY:            "uem_telemetry",
    CHAT_HISTORY:         "uem_chat_history",
    RESULTS:              "uem_results",
    TIMETABLE:            "uem_timetable",
    ATTENDANCE_RECORDS:   "uem_attendance_records",
    QR_SESSIONS:          "uem_qr_sessions",
    PLACEMENTS:           "uem_placements",
    INTERNSHIPS:          "uem_internships",
    ASSIGNMENTS:          "uem_assignments",
    SCHEDULED_ANNOUNCEMENTS: "uem_announcements",
    DB_META:              "uem_db_meta"
};

// Safe localStorage access wrapper
const safeStorage = {
    getItem: (key) => {
        try { return localStorage.getItem(key); }
        catch (e) { console.error("Storage read error:", key, e); return null; }
    },
    setItem: (key, value) => {
        try { localStorage.setItem(key, value); return true; }
        catch (e) {
            console.error("Storage write error:", key, e);
            if (e.name === 'QuotaExceededError' || e.code === 22) pruneDatabaseQuota();
            return false;
        }
    }
};

function pruneDatabaseQuota() {
    console.warn("Storage quota: pruning old data...");
    const history = JSON.parse(safeStorage.getItem(STORAGE_KEYS.CHAT_HISTORY) || "[]");
    if (history.length > 20) safeStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(history.slice(-15)));
    const telemetry = JSON.parse(safeStorage.getItem(STORAGE_KEYS.TELEMETRY) || "{}");
    if (telemetry.logs && telemetry.logs.length > 100) {
        telemetry.logs = telemetry.logs.slice(-50);
        safeStorage.setItem(STORAGE_KEYS.TELEMETRY, JSON.stringify(telemetry));
    }
}

// ============================================================
//  DATABASE SEED DATA
// ============================================================

const SEED_RESULTS = [
    {
        rollNumber: "UEM-2026-CSE001",
        semesters: [
            {
                sem: 1, year: "2022-23", subjects: [
                    { code: "CS101", name: "Engineering Mathematics I", credits: 4, grade: "A+", gradePoints: 10 },
                    { code: "CS102", name: "Programming Fundamentals (C)", credits: 4, grade: "A+", gradePoints: 10 },
                    { code: "CS103", name: "Digital Electronics", credits: 3, grade: "A", gradePoints: 9 },
                    { code: "CS104", name: "Communication Skills", credits: 2, grade: "O", gradePoints: 10 },
                    { code: "CS105", name: "Physics", credits: 3, grade: "A", gradePoints: 9 }
                ],
                sgpa: 9.75, totalCredits: 16
            },
            {
                sem: 2, year: "2022-23", subjects: [
                    { code: "CS201", name: "Data Structures", credits: 4, grade: "A+", gradePoints: 10 },
                    { code: "CS202", name: "Engineering Mathematics II", credits: 4, grade: "A", gradePoints: 9 },
                    { code: "CS203", name: "Computer Organization", credits: 3, grade: "A+", gradePoints: 10 },
                    { code: "CS204", name: "Object Oriented Programming", credits: 4, grade: "A+", gradePoints: 10 },
                    { code: "CS205", name: "Environmental Sciences", credits: 2, grade: "B+", gradePoints: 8 }
                ],
                sgpa: 9.53, totalCredits: 17
            },
            {
                sem: 3, year: "2023-24", subjects: [
                    { code: "CS301", name: "Algorithms Design", credits: 4, grade: "A", gradePoints: 9 },
                    { code: "CS302", name: "Database Management", credits: 4, grade: "A+", gradePoints: 10 },
                    { code: "CS303", name: "Operating Systems", credits: 4, grade: "A", gradePoints: 9 },
                    { code: "CS304", name: "Computer Networks", credits: 3, grade: "B+", gradePoints: 8 },
                    { code: "CS305", name: "Discrete Mathematics", credits: 3, grade: "A", gradePoints: 9 }
                ],
                sgpa: 9.11, totalCredits: 18
            },
            {
                sem: 4, year: "2023-24", subjects: [
                    { code: "CS401", name: "Artificial Intelligence", credits: 4, grade: "A+", gradePoints: 10 },
                    { code: "CS402", name: "Software Engineering", credits: 4, grade: "A", gradePoints: 9 },
                    { code: "CS403", name: "Web Technologies", credits: 3, grade: "A+", gradePoints: 10 },
                    { code: "CS404", name: "Theory of Computation", credits: 4, grade: "A", gradePoints: 9 },
                    { code: "CS405", name: "Machine Learning", credits: 3, grade: "A+", gradePoints: 10 }
                ],
                sgpa: 9.61, totalCredits: 18
            }
        ],
        cgpa: 9.25, totalCredits: 69, backlogs: 0
    },
    {
        rollNumber: "UEM-2026-ECE002",
        semesters: [
            {
                sem: 1, year: "2022-23", subjects: [
                    { code: "EC101", name: "Engineering Mathematics I", credits: 4, grade: "A", gradePoints: 9 },
                    { code: "EC102", name: "Basic Electronics", credits: 4, grade: "A", gradePoints: 9 },
                    { code: "EC103", name: "Circuit Theory", credits: 3, grade: "B+", gradePoints: 8 },
                    { code: "EC104", name: "Communication Skills", credits: 2, grade: "A+", gradePoints: 10 },
                    { code: "EC105", name: "Physics", credits: 3, grade: "B+", gradePoints: 8 }
                ],
                sgpa: 8.88, totalCredits: 16
            },
            {
                sem: 2, year: "2022-23", subjects: [
                    { code: "EC201", name: "Signals & Systems", credits: 4, grade: "A", gradePoints: 9 },
                    { code: "EC202", name: "Engineering Mathematics II", credits: 4, grade: "B+", gradePoints: 8 },
                    { code: "EC203", name: "Analog Electronics", credits: 3, grade: "A", gradePoints: 9 },
                    { code: "EC204", name: "Digital Logic Design", credits: 4, grade: "A+", gradePoints: 10 },
                    { code: "EC205", name: "Electromagnetic Theory", credits: 3, grade: "B", gradePoints: 7 }
                ],
                sgpa: 8.65, totalCredits: 18
            }
        ],
        cgpa: 8.76, totalCredits: 34, backlogs: 0
    }
];

const SEED_TIMETABLE = {
    "B.Tech Computer Science Engineering": [
        { day: "Monday",    period: 1, subject: "Data Structures Lab",   room: "CS-LAB-1",   faculty: "Dr. Sharma",   type: "lab",      time: "9:00-11:00" },
        { day: "Monday",    period: 2, subject: "Algorithms",            room: "CS-201",      faculty: "Prof. Gupta",  type: "lecture",  time: "11:00-12:00" },
        { day: "Monday",    period: 3, subject: "DBMS",                  room: "CS-202",      faculty: "Dr. Verma",    type: "lecture",  time: "12:00-1:00" },
        { day: "Monday",    period: 4, subject: "Lunch Break",           room: "",            faculty: "",             type: "break",    time: "1:00-2:00" },
        { day: "Monday",    period: 5, subject: "Machine Learning",      room: "CS-203",      faculty: "Prof. Mehta",  type: "lecture",  time: "2:00-3:00" },
        { day: "Monday",    period: 6, subject: "Soft Skills",           room: "CS-101",      faculty: "Ms. Joshi",   type: "lecture",  time: "3:00-4:00" },

        { day: "Tuesday",   period: 1, subject: "Operating Systems",     room: "CS-201",      faculty: "Dr. Sharma",   type: "lecture",  time: "9:00-10:00" },
        { day: "Tuesday",   period: 2, subject: "Computer Networks",     room: "CS-202",      faculty: "Prof. Singh",  type: "lecture",  time: "10:00-11:00" },
        { day: "Tuesday",   period: 3, subject: "ML Lab",                room: "CS-LAB-2",    faculty: "Prof. Mehta",  type: "lab",      time: "11:00-1:00" },
        { day: "Tuesday",   period: 4, subject: "Lunch Break",           room: "",            faculty: "",             type: "break",    time: "1:00-2:00" },
        { day: "Tuesday",   period: 5, subject: "Algorithms",            room: "CS-201",      faculty: "Prof. Gupta",  type: "lecture",  time: "2:00-3:00" },
        { day: "Tuesday",   period: 6, subject: "Elective: AI Ethics",   room: "CS-101",      faculty: "Dr. Roy",      type: "lecture",  time: "3:00-4:00" },

        { day: "Wednesday", period: 1, subject: "DBMS Lab",              room: "CS-LAB-1",    faculty: "Dr. Verma",    type: "lab",      time: "9:00-11:00" },
        { day: "Wednesday", period: 2, subject: "Machine Learning",      room: "CS-203",      faculty: "Prof. Mehta",  type: "lecture",  time: "11:00-12:00" },
        { day: "Wednesday", period: 3, subject: "Web Technologies",      room: "CS-202",      faculty: "Ms. Patel",    type: "lecture",  time: "12:00-1:00" },
        { day: "Wednesday", period: 4, subject: "Lunch Break",           room: "",            faculty: "",             type: "break",    time: "1:00-2:00" },
        { day: "Wednesday", period: 5, subject: "Computer Networks",     room: "CS-202",      faculty: "Prof. Singh",  type: "lecture",  time: "2:00-3:00" },
        { day: "Wednesday", period: 6, subject: "Free Period",           room: "",            faculty: "",             type: "free",     time: "3:00-4:00" },

        { day: "Thursday",  period: 1, subject: "Web Tech Lab",          room: "CS-LAB-3",    faculty: "Ms. Patel",    type: "lab",      time: "9:00-11:00" },
        { day: "Thursday",  period: 2, subject: "Operating Systems",     room: "CS-201",      faculty: "Dr. Sharma",   type: "lecture",  time: "11:00-12:00" },
        { day: "Thursday",  period: 3, subject: "Algorithms",            room: "CS-201",      faculty: "Prof. Gupta",  type: "lecture",  time: "12:00-1:00" },
        { day: "Thursday",  period: 4, subject: "Lunch Break",           room: "",            faculty: "",             type: "break",    time: "1:00-2:00" },
        { day: "Thursday",  period: 5, subject: "DBMS",                  room: "CS-202",      faculty: "Dr. Verma",    type: "lecture",  time: "2:00-3:00" },
        { day: "Thursday",  period: 6, subject: "Seminar",               room: "AUDI-1",      faculty: "HOD",          type: "special",  time: "3:00-4:00" },

        { day: "Friday",    period: 1, subject: "Machine Learning",      room: "CS-203",      faculty: "Prof. Mehta",  type: "lecture",  time: "9:00-10:00" },
        { day: "Friday",    period: 2, subject: "Computer Networks",     room: "CS-202",      faculty: "Prof. Singh",  type: "lecture",  time: "10:00-11:00" },
        { day: "Friday",    period: 3, subject: "OS Lab",                room: "CS-LAB-2",    faculty: "Dr. Sharma",   type: "lab",      time: "11:00-1:00" },
        { day: "Friday",    period: 4, subject: "Lunch Break",           room: "",            faculty: "",             type: "break",    time: "1:00-2:00" },
        { day: "Friday",    period: 5, subject: "Project Work",          room: "CS-LAB-3",    faculty: "Project Guide","type": "project","time": "2:00-4:00" }
    ]
};

const SEED_ATTENDANCE = [
    {
        rollNumber: "UEM-2026-CSE001",
        subjects: [
            { code: "CS401", name: "Artificial Intelligence",  totalClasses: 42, attended: 40, percentage: 95.2 },
            { code: "CS402", name: "Software Engineering",     totalClasses: 40, attended: 36, percentage: 90.0 },
            { code: "CS403", name: "Web Technologies",         totalClasses: 35, attended: 30, percentage: 85.7 },
            { code: "CS404", name: "Theory of Computation",    totalClasses: 38, attended: 30, percentage: 78.9 },
            { code: "CS405", name: "Machine Learning",         totalClasses: 40, attended: 28, percentage: 70.0 }
        ]
    }
];

const SEED_QR_SESSIONS = [
    { sessionId: "QRS-20260531-001", subject: "Machine Learning", faculty: "Prof. Mehta", date: new Date().toISOString().split("T")[0], time: "9:00 AM", room: "CS-203", attendees: ["UEM-2026-CSE001"] },
    { sessionId: "QRS-20260530-001", subject: "Algorithms", faculty: "Prof. Gupta", date: new Date(Date.now()-86400000).toISOString().split("T")[0], time: "11:00 AM", room: "CS-201", attendees: ["UEM-2026-CSE001", "UEM-2026-ECE002"] }
];

const SEED_PLACEMENTS = [
    { id: "PL001", company: "TCS",       role: "System Engineer",         package: "7.5 LPA",  minCGPA: 7.0, branches: ["CSE","ECE","IT"],  deadline: "2026-07-15", logo: "🔷", description: "Full stack development, system design and cloud solutions.", status: "open",   applied: [] },
    { id: "PL002", company: "Infosys",   role: "Software Engineer",       package: "8.5 LPA",  minCGPA: 7.5, branches: ["CSE","ECE","IT"],  deadline: "2026-07-20", logo: "🟣", description: "Java/Python backend and enterprise app development.", status: "open",   applied: [] },
    { id: "PL003", company: "Wipro",     role: "Project Engineer",        package: "6.5 LPA",  minCGPA: 6.5, branches: ["CSE","ECE","ME"],  deadline: "2026-07-10", logo: "🟤", description: "On-site client project delivery and infrastructure support.", status: "open",   applied: [] },
    { id: "PL004", company: "Cognizant", role: "Junior Analyst",          package: "7.0 LPA",  minCGPA: 6.0, branches: ["CSE","ECE","MBA"], deadline: "2026-07-25", logo: "⚫", description: "Data analytics, reporting and client stakeholder management.", status: "open",   applied: [] },
    { id: "PL005", company: "Capgemini", role: "Technology Analyst",      package: "9.0 LPA",  minCGPA: 7.5, branches: ["CSE","IT"],        deadline: "2026-08-01", logo: "🔴", description: "Agile development, microservices architecture and DevOps.", status: "open",   applied: [] },
    { id: "PL006", company: "Accenture","role": "Associate Software Eng", package: "10.5 LPA", minCGPA: 7.5, branches: ["CSE","ECE","IT"],  deadline: "2026-08-10", logo: "🟡", description: "Cloud-native development and digital transformation projects.", status: "open",   applied: [] },
    { id: "PL007", company: "Amazon",    role: "SDE-1",                   package: "32 LPA",   minCGPA: 8.5, branches: ["CSE","IT"],        deadline: "2026-07-05", logo: "🟠", description: "Distributed systems, backend APIs and AWS infrastructure.", status: "closed", applied: [] },
    { id: "PL008", company: "Google",    role: "Software Engineer L3",    package: "45 LPA",   minCGPA: 9.0, branches: ["CSE"],             deadline: "2026-06-30", logo: "🔵", description: "Large-scale systems, ML platform and product development.", status: "closed", applied: [] }
];

const SEED_INTERNSHIPS = [
    { id: "INT001", company: "Google", role: "Software Engineering Intern", stipend: "₹75,000 / Month", minCGPA: 8.0, branches: ["CSE", "IT"], deadline: "2026-07-31", logo: "🔵", description: "Work on real-world engineering problems in Search, Cloud or YouTube.", status: "open", skills: ["Python", "C++", "Data Structures", "Algorithms"], applied: [] },
    { id: "INT002", company: "Microsoft", role: "Machine Learning Intern", stipend: "₹80,000 / Month", minCGPA: 8.5, branches: ["CSE", "IT"], deadline: "2026-07-25", logo: "🟣", description: "Research and develop deep learning algorithms and LLM applications.", status: "open", skills: ["Python", "PyTorch", "TensorFlow", "Machine Learning"], applied: [] },
    { id: "INT003", company: "Intel", role: "VLSI & Hardware Intern", stipend: "₹50,000 / Month", minCGPA: 7.5, branches: ["ECE"], deadline: "2026-08-15", logo: "🔷", description: "Contribute to microarchitecture design, Verilog simulation, and silicon debugging.", status: "open", skills: ["Verilog", "Embedded Systems", "Hardware", "C++"], applied: [] },
    { id: "INT004", company: "Amazon", role: "Cloud Support Intern", stipend: "₹60,000 / Month", minCGPA: 7.0, branches: ["CSE", "ECE", "IT"], deadline: "2026-08-05", logo: "🟠", description: "Design cloud architectures and support high-availability AWS deployments.", status: "open", skills: ["AWS", "Networking", "Linux", "Cloud"], applied: [] },
    { id: "INT005", company: "Tata Motors", role: "Embedded Systems Intern", stipend: "₹35,000 / Month", minCGPA: 6.5, branches: ["ECE", "ME"], deadline: "2026-08-20", logo: "⚪", description: "Develop and test firmware for autonomous vehicular steering and IoT sensors.", status: "open", skills: ["Embedded Systems", "C", "Microcontrollers", "RTOS"], applied: [] },
    { id: "INT006", company: "Cognizant", role: "Business Analytics Intern", stipend: "₹30,000 / Month", minCGPA: 6.0, branches: ["CSE", "ECE", "MBA", "IT"], deadline: "2026-09-01", logo: "⚫", description: "Leverage PowerBI and SQL queries to perform business intelligence analysis.", status: "open", skills: ["SQL", "Analytics", "PowerBI", "Communication"], applied: [] }
];

// ============================================================
//  DATABASE INITIALIZATION
// ============================================================

window.initDatabase = function() {
    const meta = JSON.parse(safeStorage.getItem(STORAGE_KEYS.DB_META) || "{}");

    // 1. Custom Bot Responses
    if (!safeStorage.getItem(STORAGE_KEYS.CUSTOM_BOT_RESPONSES)) {
        const initial = { en: { ...window.DEFAULT_BOT_RESPONSES.en }, hi: { ...window.DEFAULT_BOT_RESPONSES.hi } };
        safeStorage.setItem(STORAGE_KEYS.CUSTOM_BOT_RESPONSES, JSON.stringify(initial));
    }

    // 2. Settings
    if (!safeStorage.getItem(STORAGE_KEYS.DASHBOARD_SETTINGS)) {
        safeStorage.setItem(STORAGE_KEYS.DASHBOARD_SETTINGS, JSON.stringify(window.UEM_CONFIG));
    }

    // 3. Students
    if (!safeStorage.getItem(STORAGE_KEYS.STUDENTS)) {
        const defaultStudents = [
            { rollNumber: "UEM-2026-CSE001", password: "password123", fullName: "Vaibhav Tanwar", course: "B.Tech Computer Science Engineering", attendance: 85, gpa: 9.15, feeDues: 45000, registrationDate: new Date().toISOString() },
            { rollNumber: "UEM-2026-ECE002", password: "password123", fullName: "Amit Sharma",    course: "B.Tech Electronics Engineering",      attendance: 78, gpa: 8.42, feeDues: 32000, registrationDate: new Date().toISOString() }
        ];
        safeStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(defaultStudents));
    }

    // 4. Telemetry
    if (!safeStorage.getItem(STORAGE_KEYS.TELEMETRY)) {
        const t = { totalQueries: 48, successfulMatches: 42, activeStudentsCount: 2, voiceRequestsCount: 14, logs: [
            { timestamp: Date.now() - 3600000*5, keyword: "fees",        matched: true,  type: "text" },
            { timestamp: Date.now() - 3600000*4, keyword: "hostel",      matched: true,  type: "voice" },
            { timestamp: Date.now() - 3600000*3, keyword: "exams",       matched: false, type: "text" },
            { timestamp: Date.now() - 3600000*2, keyword: "scholarship", matched: true,  type: "text" },
            { timestamp: Date.now() - 3600000*1, keyword: "placement",   matched: true,  type: "text" }
        ]};
        safeStorage.setItem(STORAGE_KEYS.TELEMETRY, JSON.stringify(t));
    }

    // 5. Results (NEW)
    if (!safeStorage.getItem(STORAGE_KEYS.RESULTS)) {
        safeStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(SEED_RESULTS));
    }

    // 6. Timetable (NEW)
    if (!safeStorage.getItem(STORAGE_KEYS.TIMETABLE)) {
        safeStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(SEED_TIMETABLE));
    }

    // 7. Attendance Records (NEW)
    if (!safeStorage.getItem(STORAGE_KEYS.ATTENDANCE_RECORDS)) {
        safeStorage.setItem(STORAGE_KEYS.ATTENDANCE_RECORDS, JSON.stringify(SEED_ATTENDANCE));
    }

    // 8. QR Sessions (NEW)
    if (!safeStorage.getItem(STORAGE_KEYS.QR_SESSIONS)) {
        safeStorage.setItem(STORAGE_KEYS.QR_SESSIONS, JSON.stringify(SEED_QR_SESSIONS));
    }

    // 9. Placements (NEW)
    if (!safeStorage.getItem(STORAGE_KEYS.PLACEMENTS)) {
        safeStorage.setItem(STORAGE_KEYS.PLACEMENTS, JSON.stringify(SEED_PLACEMENTS));
    }

    // 10. Internships (NEW)
    if (!safeStorage.getItem(STORAGE_KEYS.INTERNSHIPS)) {
        safeStorage.setItem(STORAGE_KEYS.INTERNSHIPS, JSON.stringify(SEED_INTERNSHIPS));
    }

    // 11. Assignments (NEW)
    if (!safeStorage.getItem(STORAGE_KEYS.ASSIGNMENTS)) {
        const defaultAssignments = [
            { id: "asm-1", rollNumber: "UEM-2026-CSE001", title: "ML Project Proposal", subject: "Machine Learning", dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], completed: false },
            { id: "asm-2", rollNumber: "UEM-2026-CSE001", title: "DBMS Lab Report 4", subject: "Database Management", dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], completed: true },
            { id: "asm-3", rollNumber: "UEM-2026-CSE001", title: "OS Threads Assignment", subject: "Operating Systems", dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0], completed: false }
        ];
        safeStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(defaultAssignments));
    }

    // 12. Scheduled Announcements (NEW)
    if (!safeStorage.getItem(STORAGE_KEYS.SCHEDULED_ANNOUNCEMENTS)) {
        const defaultAnnouncements = [
            { id: "ann-1", message: "Placement drive registration deadline extended!", scheduledTime: new Date(Date.now() + 60000).toISOString(), status: "pending", icon: "📢", type: "placement" }
        ];
        safeStorage.setItem(STORAGE_KEYS.SCHEDULED_ANNOUNCEMENTS, JSON.stringify(defaultAnnouncements));
    }

    safeStorage.setItem(STORAGE_KEYS.DB_META, JSON.stringify({ version: DB_VERSION, seededAt: new Date().toISOString() }));
};

window.initDatabase();

// ============================================================
//  DATABASE API
// ============================================================

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

window.db = {
    // ---- SETTINGS ----
    getSettings: async () => { await wait(200); return JSON.parse(safeStorage.getItem(STORAGE_KEYS.DASHBOARD_SETTINGS)) || window.UEM_CONFIG; },
    saveSettings: async (cfg) => { await wait(400); return safeStorage.setItem(STORAGE_KEYS.DASHBOARD_SETTINGS, JSON.stringify(cfg)); },

    // ---- KNOWLEDGE BASE ----
    getBotResponses: async () => { await wait(150); return JSON.parse(safeStorage.getItem(STORAGE_KEYS.CUSTOM_BOT_RESPONSES)); },
    saveBotResponse: async (lang, key, value) => {
        await wait(300);
        const r = JSON.parse(safeStorage.getItem(STORAGE_KEYS.CUSTOM_BOT_RESPONSES));
        if (!r[lang]) r[lang] = {};
        r[lang][key.toLowerCase().trim()] = value;
        return safeStorage.setItem(STORAGE_KEYS.CUSTOM_BOT_RESPONSES, JSON.stringify(r));
    },
    deleteBotResponse: async (lang, key) => {
        await wait(300);
        const r = JSON.parse(safeStorage.getItem(STORAGE_KEYS.CUSTOM_BOT_RESPONSES));
        if (r[lang] && r[lang][key]) { delete r[lang][key]; return safeStorage.setItem(STORAGE_KEYS.CUSTOM_BOT_RESPONSES, JSON.stringify(r)); }
        return false;
    },
    resetBotResponses: async () => {
        await wait(500);
        const initial = { en: { ...window.DEFAULT_BOT_RESPONSES.en }, hi: { ...window.DEFAULT_BOT_RESPONSES.hi } };
        return safeStorage.setItem(STORAGE_KEYS.CUSTOM_BOT_RESPONSES, JSON.stringify(initial));
    },

    // ---- STUDENTS ----
    getStudents: async () => { await wait(200); return JSON.parse(safeStorage.getItem(STORAGE_KEYS.STUDENTS)) || []; },
    saveStudent: async (data) => {
        await wait(450);
        const students = JSON.parse(safeStorage.getItem(STORAGE_KEYS.STUDENTS)) || [];
        const idx = students.findIndex(s => s.rollNumber === data.rollNumber);
        if (idx > -1) { students[idx] = { ...students[idx], ...data }; }
        else {
            students.push(data);
            const t = JSON.parse(safeStorage.getItem(STORAGE_KEYS.TELEMETRY));
            t.activeStudentsCount = students.length;
            safeStorage.setItem(STORAGE_KEYS.TELEMETRY, JSON.stringify(t));
        }
        return safeStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    },

    // ---- RESULTS (NEW) ----
    getStudentResults: async (rollNumber) => {
        await wait(250);
        const all = JSON.parse(safeStorage.getItem(STORAGE_KEYS.RESULTS)) || [];
        return all.find(r => r.rollNumber === rollNumber) || null;
    },
    saveStudentResult: async (resultData) => {
        await wait(400);
        const all = JSON.parse(safeStorage.getItem(STORAGE_KEYS.RESULTS)) || [];
        const idx = all.findIndex(r => r.rollNumber === resultData.rollNumber);
        if (idx > -1) { all[idx] = { ...all[idx], ...resultData }; }
        else { all.push(resultData); }
        return safeStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(all));
    },

    // ---- TIMETABLE (NEW) ----
    getTimetable: async (course) => {
        await wait(200);
        const all = JSON.parse(safeStorage.getItem(STORAGE_KEYS.TIMETABLE)) || {};
        return all[course] || [];
    },
    saveTimetableEntry: async (course, entry) => {
        await wait(300);
        const all = JSON.parse(safeStorage.getItem(STORAGE_KEYS.TIMETABLE)) || {};
        if (!all[course]) all[course] = [];
        const idx = all[course].findIndex(e => e.day === entry.day && e.period === entry.period);
        if (idx > -1) { all[course][idx] = entry; }
        else { all[course].push(entry); }
        return safeStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(all));
    },
    deleteTimetableEntry: async (course, day, period) => {
        await wait(250);
        const all = JSON.parse(safeStorage.getItem(STORAGE_KEYS.TIMETABLE)) || {};
        if (all[course]) {
            all[course] = all[course].filter(e => !(e.day === day && e.period === period));
            return safeStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(all));
        }
        return false;
    },

    // ---- ATTENDANCE RECORDS (NEW) ----
    getAttendanceRecords: async (rollNumber) => {
        await wait(200);
        const all = JSON.parse(safeStorage.getItem(STORAGE_KEYS.ATTENDANCE_RECORDS)) || [];
        return all.find(r => r.rollNumber === rollNumber) || null;
    },
    updateSubjectAttendance: async (rollNumber, subjectCode, attended) => {
        await wait(300);
        const all = JSON.parse(safeStorage.getItem(STORAGE_KEYS.ATTENDANCE_RECORDS)) || [];
        const idx = all.findIndex(r => r.rollNumber === rollNumber);
        if (idx > -1) {
            const subIdx = all[idx].subjects.findIndex(s => s.code === subjectCode);
            if (subIdx > -1) {
                if (attended) all[idx].subjects[subIdx].attended++;
                all[idx].subjects[subIdx].totalClasses++;
                all[idx].subjects[subIdx].percentage = parseFloat(((all[idx].subjects[subIdx].attended / all[idx].subjects[subIdx].totalClasses) * 100).toFixed(1));
                
                const success = safeStorage.setItem(STORAGE_KEYS.ATTENDANCE_RECORDS, JSON.stringify(all));
                if (success) {
                    // Re-aggregate and update the overall attendance percentage for the student record
                    const subjects = all[idx].subjects;
                    const totalPctSum = subjects.reduce((sum, sub) => sum + sub.percentage, 0);
                    const avgPct = Math.round(totalPctSum / subjects.length);

                    const students = JSON.parse(safeStorage.getItem(STORAGE_KEYS.STUDENTS)) || [];
                    const stIdx = students.findIndex(s => s.rollNumber === rollNumber);
                    if (stIdx > -1) {
                        students[stIdx].attendance = avgPct;
                        safeStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
                    }
                    return true;
                }
            }
        }
        return false;
    },

    // ---- QR SESSIONS (NEW) ----
    getQRSessions: async () => { await wait(200); return JSON.parse(safeStorage.getItem(STORAGE_KEYS.QR_SESSIONS)) || []; },
    createQRSession: async (session) => {
        await wait(300);
        const sessions = JSON.parse(safeStorage.getItem(STORAGE_KEYS.QR_SESSIONS)) || [];
        sessions.unshift(session);
        return safeStorage.setItem(STORAGE_KEYS.QR_SESSIONS, JSON.stringify(sessions));
    },
    markQRAttendance: async (sessionId, rollNumber) => {
        await wait(350);
        const sessions = JSON.parse(safeStorage.getItem(STORAGE_KEYS.QR_SESSIONS)) || [];
        const idx = sessions.findIndex(s => s.sessionId === sessionId);
        if (idx > -1) {
            if (!sessions[idx].attendees.includes(rollNumber)) {
                sessions[idx].attendees.push(rollNumber);
                safeStorage.setItem(STORAGE_KEYS.QR_SESSIONS, JSON.stringify(sessions));
                return true;
            }
            return false;
        }
        return false;
    },

    // ---- PLACEMENTS (NEW) ----
    getPlacements: async () => { await wait(200); return JSON.parse(safeStorage.getItem(STORAGE_KEYS.PLACEMENTS)) || []; },
    applyForPlacement: async (placementId, rollNumber) => {
        await wait(400);
        const pl = JSON.parse(safeStorage.getItem(STORAGE_KEYS.PLACEMENTS)) || [];
        const idx = pl.findIndex(p => p.id === placementId);
        if (idx > -1 && !pl[idx].applied.includes(rollNumber)) {
            pl[idx].applied.push(rollNumber);
            return safeStorage.setItem(STORAGE_KEYS.PLACEMENTS, JSON.stringify(pl));
        }
        return false;
    },

    // ---- CHAT HISTORY ----
    getChatHistory: () => JSON.parse(safeStorage.getItem(STORAGE_KEYS.CHAT_HISTORY) || "[]"),
    saveChatHistory: (history) => {
        const limit = window.UEM_CONFIG.chatHistoryLimit;
        const truncated = history.length > limit ? history.slice(-limit) : history;
        safeStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(truncated));
    },
    clearChatHistory: () => safeStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify([])),

    // ---- TELEMETRY ----
    getTelemetry: async () => { await wait(200); return JSON.parse(safeStorage.getItem(STORAGE_KEYS.TELEMETRY)); },
    logQuery: (keyword, matched, type = "text") => {
        const t = JSON.parse(safeStorage.getItem(STORAGE_KEYS.TELEMETRY)) || { totalQueries:0, successfulMatches:0, activeStudentsCount:0, voiceRequestsCount:0, logs:[] };
        t.totalQueries++;
        if (matched) t.successfulMatches++;
        if (type === "voice") t.voiceRequestsCount++;
        t.logs.push({ timestamp: Date.now(), keyword: keyword.substring(0, 30), matched, type });
        if (t.logs.length > 200) t.logs = t.logs.slice(-100);
        safeStorage.setItem(STORAGE_KEYS.TELEMETRY, JSON.stringify(t));
    },

    // ---- INTERNSHIPS (NEW) ----
    getInternships: async () => { await wait(200); return JSON.parse(safeStorage.getItem(STORAGE_KEYS.INTERNSHIPS)) || []; },
    applyForInternship: async (internshipId, rollNumber) => {
        await wait(400);
        const list = JSON.parse(safeStorage.getItem(STORAGE_KEYS.INTERNSHIPS)) || [];
        const idx = list.findIndex(i => i.id === internshipId);
        if (idx > -1 && !list[idx].applied.includes(rollNumber)) {
            list[idx].applied.push(rollNumber);
            safeStorage.setItem(STORAGE_KEYS.INTERNSHIPS, JSON.stringify(list));
            
            // Also append to student record for fast dashboard state matching
            const students = JSON.parse(safeStorage.getItem(STORAGE_KEYS.STUDENTS)) || [];
            const stIdx = students.findIndex(s => s.rollNumber === rollNumber);
            if (stIdx > -1) {
                if (!students[stIdx].appliedInternships) students[stIdx].appliedInternships = [];
                if (!students[stIdx].appliedInternships.includes(internshipId)) {
                    students[stIdx].appliedInternships.push(internshipId);
                    safeStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
                }
            }
            return true;
        }
        return false;
    },

    // ---- RESUME BUILDER (NEW) ----
    saveStudentResume: async (rollNumber, resumeData) => {
        await wait(300);
        const students = JSON.parse(safeStorage.getItem(STORAGE_KEYS.STUDENTS)) || [];
        const idx = students.findIndex(s => s.rollNumber === rollNumber);
        if (idx > -1) {
            students[idx].resume = resumeData;
            safeStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
            return true;
        }
        return false;
    },

    // ---- ASSIGNMENTS (NEW) ----
    getAssignments: async (rollNumber) => {
        await wait(150);
        const all = JSON.parse(safeStorage.getItem(STORAGE_KEYS.ASSIGNMENTS)) || [];
        return all.filter(a => a.rollNumber === rollNumber);
    },
    saveAssignment: async (rollNumber, assignment) => {
        await wait(250);
        const all = JSON.parse(safeStorage.getItem(STORAGE_KEYS.ASSIGNMENTS)) || [];
        const idx = all.findIndex(a => a.id === assignment.id);
        if (idx > -1) {
            all[idx] = { ...all[idx], ...assignment, rollNumber };
        } else {
            all.push({ ...assignment, rollNumber });
        }
        return safeStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(all));
    },
    deleteAssignment: async (rollNumber, assignmentId) => {
        await wait(200);
        let all = JSON.parse(safeStorage.getItem(STORAGE_KEYS.ASSIGNMENTS)) || [];
        all = all.filter(a => !(a.id === assignmentId && a.rollNumber === rollNumber));
        return safeStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(all));
    },

    // ---- SCHEDULED ANNOUNCEMENTS (NEW) ----
    getScheduledAnnouncements: async () => {
        await wait(150);
        return JSON.parse(safeStorage.getItem(STORAGE_KEYS.SCHEDULED_ANNOUNCEMENTS)) || [];
    },
    saveScheduledAnnouncement: async (announcement) => {
        await wait(250);
        const all = JSON.parse(safeStorage.getItem(STORAGE_KEYS.SCHEDULED_ANNOUNCEMENTS)) || [];
        all.push(announcement);
        return safeStorage.setItem(STORAGE_KEYS.SCHEDULED_ANNOUNCEMENTS, JSON.stringify(all));
    },
    updateScheduledAnnouncementStatus: async (id, status) => {
        const all = JSON.parse(safeStorage.getItem(STORAGE_KEYS.SCHEDULED_ANNOUNCEMENTS)) || [];
        const idx = all.findIndex(a => a.id === id);
        if (idx > -1) {
            all[idx].status = status;
            return safeStorage.setItem(STORAGE_KEYS.SCHEDULED_ANNOUNCEMENTS, JSON.stringify(all));
        }
        return false;
    },
    deleteScheduledAnnouncement: async (id) => {
        await wait(200);
        let all = JSON.parse(safeStorage.getItem(STORAGE_KEYS.SCHEDULED_ANNOUNCEMENTS)) || [];
        all = all.filter(a => a.id !== id);
        return safeStorage.setItem(STORAGE_KEYS.SCHEDULED_ANNOUNCEMENTS, JSON.stringify(all));
    },

    // ---- BULK IMPORT & TELEMETRY STATS (NEW) ----
    importBotResponsesCSV: async (csvText, lang) => {
        await wait(400);
        const lines = csvText.split('\n');
        let count = 0;
        const responses = JSON.parse(safeStorage.getItem(STORAGE_KEYS.CUSTOM_BOT_RESPONSES)) || {};
        if (!responses[lang]) responses[lang] = {};
        for (let line of lines) {
            if (!line.trim()) continue;
            const parts = line.split(',');
            if (parts.length >= 2) {
                const key = parts[0].replace(/"/g, '').trim().toLowerCase();
                const val = parts.slice(1).join(',').replace(/"/g, '').trim();
                if (key && val) {
                    responses[lang][key] = val;
                    count++;
                }
            }
        }
        safeStorage.setItem(STORAGE_KEYS.CUSTOM_BOT_RESPONSES, JSON.stringify(responses));
        return count;
    },
    getKeywordStats: async () => {
        await wait(200);
        const telemetry = JSON.parse(safeStorage.getItem(STORAGE_KEYS.TELEMETRY)) || { logs: [] };
        const statsMap = {};
        telemetry.logs.forEach(log => {
            if (log.keyword) {
                const kw = log.keyword.toLowerCase().trim();
                statsMap[kw] = (statsMap[kw] || 0) + 1;
            }
        });
        const list = Object.keys(statsMap).map(kw => ({ keyword: kw, count: statsMap[kw] }));
        return list.sort((a, b) => b.count - a.count);
    },

    // ---- BIOMETRICS / FACE ID (NEW) ----
    registerFaceBiometric: async (rollNumber, faceSignature) => {
        await wait(400);
        const students = JSON.parse(safeStorage.getItem(STORAGE_KEYS.STUDENTS)) || [];
        const idx = students.findIndex(s => s.rollNumber === rollNumber);
        if (idx > -1) {
            students[idx].faceSignature = faceSignature;
            safeStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
            return true;
        }
        return false;
    },

    // ---- QUERY HELPER (JOIN-style) ----
    query: {
        // Get student with their results
        getStudentWithResults: async (rollNumber) => {
            const [students, results] = await Promise.all([
                window.db.getStudents(),
                (async () => JSON.parse(safeStorage.getItem(STORAGE_KEYS.RESULTS)) || [])()
            ]);
            const student = students.find(s => s.rollNumber === rollNumber);
            const result  = results.find(r => r.rollNumber === rollNumber);
            return { student, result };
        },
        // Get all active placement opportunities for a student's branch/CGPA
        getEligiblePlacements: async (cgpa, course) => {
            const pl = JSON.parse(safeStorage.getItem(STORAGE_KEYS.PLACEMENTS)) || [];
            const branchAbbr = course.includes("Computer") ? "CSE" : course.includes("Electronics") ? "ECE" : course.includes("MBA") ? "MBA" : "IT";
            return pl.filter(p => p.minCGPA <= cgpa && p.branches.includes(branchAbbr) && p.status === "open");
        },
        // Get all active internship opportunities for a student's branch/CGPA
        getEligibleInternships: async (cgpa, course) => {
            const list = JSON.parse(safeStorage.getItem(STORAGE_KEYS.INTERNSHIPS)) || [];
            const branchAbbr = course.includes("Computer") ? "CSE" : course.includes("Electronics") ? "ECE" : course.includes("MBA") ? "MBA" : "IT";
            return list.filter(i => i.minCGPA <= cgpa && i.branches.includes(branchAbbr) && i.status === "open");
        }
    }
};

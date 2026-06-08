/* ============================================================
   STUDENT AUTHENTICATION CONTROL (js/auth.js)
   ============================================================ */

const SESSION_KEY = "uem_current_student_session";

let currentStudent = null;

window.loadSessionOnStart = function() {
    try {
        const savedSession = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
        if (savedSession) {
            currentStudent = JSON.parse(savedSession);
        }
    } catch (e) {
        console.error("Failed to recover login session:", e);
    }
    return currentStudent;
};

window.auth = {
    getCurrentStudent: () => currentStudent,
    
    login: async (rollNumber, password, rememberMe = false) => {
        const upperRoll = rollNumber.toUpperCase().trim();
        const lockUntilKey = `uem_lock_until_${upperRoll}`;
        const attemptsKey = `uem_failed_attempts_${upperRoll}`;

        const lockTime = localStorage.getItem(lockUntilKey);
        if (lockTime && Date.now() < parseInt(lockTime)) {
            const secondsLeft = Math.ceil((parseInt(lockTime) - Date.now()) / 1000);
            throw new Error(`Account locked due to too many failed attempts. Try again in ${secondsLeft} seconds.`);
        }

        const students = await window.db.getStudents();
        const student = students.find(
            s => s.rollNumber.toUpperCase() === upperRoll && s.password === password
        );
        
        if (!student) {
            let attempts = parseInt(localStorage.getItem(attemptsKey) || "0") + 1;
            localStorage.setItem(attemptsKey, attempts.toString());
            if (attempts >= 5) {
                localStorage.setItem(lockUntilKey, (Date.now() + 300000).toString()); // Lock for 5 mins
                localStorage.removeItem(attemptsKey); // Reset attempts after lock
                throw new Error("Too many failed attempts. Account locked for 5 minutes.");
            }
            throw new Error(`Invalid Roll Number or Password! (Attempt ${attempts}/5)`);
        }

        localStorage.removeItem(attemptsKey);
        localStorage.removeItem(lockUntilKey);
        
        currentStudent = student;
        const serialized = JSON.stringify(student);
        sessionStorage.setItem(SESSION_KEY, serialized);
        if (rememberMe) {
            localStorage.setItem(SESSION_KEY, serialized);
        }
        
        return student;
    },
    
    register: async (fullName, rollNumber, password, course, attendance, securityQuestion, securityAnswer) => {
        const students = await window.db.getStudents();
        const exists = students.some(
            s => s.rollNumber.toUpperCase() === rollNumber.toUpperCase()
        );
        
        if (exists) {
            throw new Error("Student Roll Number already registered!");
        }
        
        const newStudent = {
            rollNumber: rollNumber.toUpperCase().trim(),
            password,
            fullName: fullName.trim(),
            course,
            attendance: Math.min(100, Math.max(0, parseInt(attendance) || 80)),
            gpa: parseFloat((7.5 + Math.random() * 2.3).toFixed(2)),
            feeDues: Math.random() > 0.5 ? 45000 : 0,
            registrationDate: new Date().toISOString(),
            securityQuestion: securityQuestion || "What is your birthplace?",
            securityAnswer: (securityAnswer || "jaipur").trim().toLowerCase()
        };
        
        const success = await window.db.saveStudent(newStudent);
        if (!success) {
            throw new Error("Database error during student creation!");
        }
        
        return newStudent;
    },
    
    logout: () => {
        currentStudent = null;
        sessionStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(SESSION_KEY);
    },
    
    payDues: async () => {
        if (!currentStudent) throw new Error("No authenticated session active!");
        
        currentStudent.feeDues = 0;
        const success = await window.db.saveStudent(currentStudent);
        if (!success) {
            throw new Error("Payment transaction error.");
        }
        
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(currentStudent));
        return true;
    },
    
    getQRBadgeUrl: (student = currentStudent) => {
        if (!student) return "";
        const qrData = `STUDENT_ID:${student.rollNumber}|NAME:${student.fullName}|COURSE:${student.course}`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}&color=003366&bgcolor=ffffff&qzone=1`;
    },

    getSecurityQuestionForRollNumber: async (rollNumber) => {
        const students = await window.db.getStudents();
        const upperRoll = rollNumber.toUpperCase().trim();
        const student = students.find(s => s.rollNumber === upperRoll);
        if (!student) {
            throw new Error("Roll Number not found!");
        }
        return student.securityQuestion || "What is your birthplace? (Seed default is 'jaipur')";
    },

    resetPasswordWithSecurityAnswer: async (rollNumber, answer, newPassword) => {
        const students = await window.db.getStudents();
        const upperRoll = rollNumber.toUpperCase().trim();
        const idx = students.findIndex(s => s.rollNumber === upperRoll);
        if (idx === -1) {
            throw new Error("Roll Number not found!");
        }
        const student = students[idx];
        const correctAnswer = student.securityAnswer ? student.securityAnswer : "jaipur";
        if (correctAnswer !== answer.trim().toLowerCase()) {
            throw new Error("Incorrect security answer!");
        }
        student.password = newPassword;
        const success = await window.db.saveStudent(student);
        if (!success) {
            throw new Error("Database error during password reset!");
        }
        return true;
    }
};

// Immediate recovery
window.loadSessionOnStart();

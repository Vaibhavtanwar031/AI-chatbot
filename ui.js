/* ============================================================
   GLOBAL DOM & INTERFACE BINDINGS (js/ui.js)
   ============================================================ */

let currentLanguage = "en";
let currentTheme = "dark";

// ============================================================
//  1. UNIFIED UI ERROR ROUNDS (Graceful Toast Catchers)
// ============================================================

window.safeUIAction = async function(actionFn, defaultErrorMsg = "Action failed!") {
    try {
        await actionFn();
        return true;
    } catch (e) {
        console.error("UI Action Error:", e);
        window.toast.show(e.message || defaultErrorMsg, "error");
        return false;
    }
};

// ============================================================
//  2. THEME CONTROLLER (Dark / Light)
// ============================================================

window.initTheme = function() {
    try {
        const saved = localStorage.getItem("uem_theme") || "dark";
        window.setTheme(saved);
    } catch (e) {}
};

window.setTheme = function(theme) {
    currentTheme = theme;
    const body = document.body;
    const themeIcon = document.getElementById("themeIcon");
    
    if (theme === "light") {
        body.classList.add("light-theme");
        if (themeIcon) themeIcon.textContent = "🌙";
    } else {
        body.classList.remove("light-theme");
        if (themeIcon) themeIcon.textContent = "☀️";
    }
    
    try {
        localStorage.setItem("uem_theme", theme);
    } catch (e) {}
    
    const analyticsModal = document.getElementById("analyticsModal");
    if (analyticsModal && analyticsModal.classList.contains("open")) {
        window.analytics.drawLineChart("lineChartCanvas", currentTheme);
        window.analytics.drawDonutChart("donutChartCanvas", currentTheme);
    }
};

window.toggleTheme = function() {
    window.setTheme(currentTheme === "dark" ? "light" : "dark");
};

window.getTheme = function() {
    return currentTheme;
};

// ============================================================
//  3. DYNAMIC TRANSLATION ENGINE (Bilingual English / Hindi)
// ============================================================

window.setLanguage = function(lang) {
    currentLanguage = lang;
    const dict = window.UI_TRANSLATIONS[lang];
    if (!dict) return;
    
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (dict[key]) {
            if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
                el.placeholder = dict[key];
            } else {
                el.textContent = dict[key];
            }
        }
    });
    
    try {
        sessionStorage.setItem("uem_language", lang);
    } catch (e) {}
};

window.getLanguage = function() {
    return currentLanguage;
};

// ============================================================
//  4. MODALS & PANELS ROUTING
// ============================================================

window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add("open");
    
    if (modalId === "analyticsModal") {
        window.safeUIAction(async () => {
            const stats = await window.analytics.getStats();
            document.getElementById("statTotalQueries").textContent = stats.totalQueries;
            document.getElementById("statMatchRate").textContent = stats.matchRate;
            document.getElementById("statActiveStudents").textContent = stats.activeStudents;
            document.getElementById("statVoiceRequests").textContent = stats.voiceRequests;
            
            window.analytics.drawLineChart("lineChartCanvas", currentTheme);
            window.analytics.drawDonutChart("donutChartCanvas", currentTheme);
        }, "Failed to compile live analytics.");
    }
    
    if (modalId === "adminModal") {
        renderAdminResponsesList();
        window.renderKeywordUsageStats();
        window.renderScheduledAnnouncementsList();
    }
};

window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove("open");
    }
};

// ============================================================
//  5. STUDENT DASHBOARD ACTIONS
// ============================================================

window.updateAuthView = function() {
    const student = window.auth.getCurrentStudent();
    const portalBtn = document.getElementById("navStudentPortalBtn");
    const portalAuthView = document.getElementById("portalAuthView");
    const portalDashboardView = document.getElementById("portalDashboardView");
    
    if (student) {
        if (portalBtn) {
            portalBtn.innerHTML = `👤 ${student.fullName.split(" ")[0]}`;
            portalBtn.className = "nav-btn primary";
        }
        
        if (portalAuthView) portalAuthView.style.display = "none";
        if (portalDashboardView) portalDashboardView.style.display = "grid";
        
        document.getElementById("dbStudentName").textContent = student.fullName;
        document.getElementById("dbStudentRoll").textContent = student.rollNumber;
        document.getElementById("dbStudentCourse").textContent = student.course;
        
        document.getElementById("dbAttendanceVal").textContent = `${student.attendance}%`;
        document.getElementById("dbAttendanceFill").style.width = `${student.attendance}%`;
        
        document.getElementById("dbGpaVal").textContent = `${student.gpa} / 10.00`;
        const gpaFillPercent = (student.gpa / 10) * 100;
        document.getElementById("dbGpaFill").style.width = `${gpaFillPercent}%`;
        
        const dues = student.feeDues;
        const duesContainer = document.getElementById("dbDuesContainer");
        if (dues > 0) {
            duesContainer.innerHTML = `
                <div class="stat-val" style="color: #ef4444;">₹${dues.toLocaleString('en-IN')}</div>
                <button class="nav-btn primary" id="payDuesBtn" style="margin-top:8px; padding: 6px 12px; font-size:0.8rem;" data-i18n="btnPayDues">Pay Fees Dues</button>
            `;
            const payBtn = document.getElementById("payDuesBtn");
            if (payBtn) payBtn.onclick = handlePayFees;
        } else {
            duesContainer.innerHTML = `
                <div class="stat-val" style="color: #10b981;" data-i18n="duesPaidMsg">All fees cleared! ✅</div>
            `;
        }
        
        const qrImg = document.getElementById("dbQrCodeBadge");
        if (qrImg) {
            qrImg.src = window.auth.getQRBadgeUrl(student);
        }
        
        renderDashboardTimetable(student);
        renderDashboardAssignments(student);
        resetInactivityTimer();
        
        window.setLanguage(currentLanguage);
    } else {
        if (portalBtn) {
            portalBtn.innerHTML = `🔐 <span data-i18n="navStudentPortal">Student Portal</span>`;
            portalBtn.className = "nav-btn";
        }
        if (portalAuthView) portalAuthView.style.display = "flex";
        if (portalDashboardView) portalDashboardView.style.display = "none";
        
        if (inactivityTimer) clearTimeout(inactivityTimer);
        if (inactivityWarningTimer) clearTimeout(inactivityWarningTimer);
        
        window.setLanguage(currentLanguage);
    }
};

async function handlePayFees() {
    await window.safeUIAction(async () => {
        const payBtn = document.getElementById("payDuesBtn");
        if (payBtn) {
            payBtn.disabled = true;
            payBtn.textContent = currentLanguage === "hi" ? "भुगतान प्रक्रिया में..." : "Processing...";
        }
        
        await window.auth.payDues();
        window.updateAuthView();
        
        const successMsg = currentLanguage === "hi" 
            ? "फीस का सफलतापूर्वक भुगतान किया गया! रसीद आपके छात्र ईमेल पर भेजी गई है।" 
            : "Fees paid successfully! Receipt dispatched to student email.";
        window.toast.show(successMsg, "success");
    }, "Payment transaction failed. Please retry.");
}

// ============================================================
//  6. ADMIN PANEL CONTROLLER
// ============================================================

async function renderAdminResponsesList() {
    const list = document.getElementById("adminResponsesList");
    if (!list) return;
    
    list.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-secondary);">Loading KB...</div>`;
    
    try {
        const responses = await window.db.getBotResponses();
        const currentLangResponses = responses[currentLanguage] || {};
        list.innerHTML = "";
        
        const keys = Object.keys(currentLangResponses);
        if (keys.length === 0) {
            list.innerHTML = `<div class="notif-empty">No custom responses trained.</div>`;
            return;
        }
        
        keys.forEach(key => {
            const item = document.createElement("div");
            item.className = "admin-response-item";
            item.innerHTML = `
                <div>
                    <strong>${key}</strong>
                    <span>${currentLangResponses[key]}</span>
                </div>
                <button class="delete-btn" data-key="${key}">Delete</button>
            `;
            
            const delBtn = item.querySelector(".delete-btn");
            delBtn.onclick = () => handleDeleteResponse(key);
            
            list.appendChild(item);
        });
    } catch (e) {
        list.innerHTML = `<div style="color:#ef4444; padding:10px;">Error loading custom dataset.</div>`;
    }
}

async function handleDeleteResponse(key) {
    const confirmed = confirm(currentLanguage === "hi" ? `क्या आप '${key}' के जवाब को हटाना चाहते हैं?` : `Are you sure you want to delete the response for keyword '${key}'?`);
    if (!confirmed) return;
    
    await window.safeUIAction(async () => {
        const success = await window.db.deleteBotResponse(currentLanguage, key);
        if (success) {
            renderAdminResponsesList();
            window.toast.show(currentLanguage === "hi" ? "कीवर्ड हटा दिया गया!" : "Keyword training deleted!", "success");
        }
    });
}

window.saveAdminForm = async function() {
    const keywordInput = document.getElementById("adminKey");
    const responseInput = document.getElementById("adminValue");
    
    const key = keywordInput.value.trim().toLowerCase();
    const val = responseInput.value.trim();
    
    if (!key || !val) {
        window.toast.show(window.UI_TRANSLATIONS[currentLanguage].errorEmptyField, "error");
        return;
    }
    
    await window.safeUIAction(async () => {
        const saveBtn = document.querySelector(".admin-save-btn");
        if (saveBtn) saveBtn.disabled = true;
        
        await window.db.saveBotResponse(currentLanguage, key, val);
        
        keywordInput.value = "";
        responseInput.value = "";
        if (saveBtn) saveBtn.disabled = false;
        
        renderAdminResponsesList();
        window.toast.show(currentLanguage === "hi" ? "ज्ञान आधार सफलतापूर्वक प्रशिक्षित किया गया!" : "Bot knowledge trained successfully!", "success");
    });
};

window.resetAdminDefaults = async function() {
    const confirmed = confirm(currentLanguage === "hi" ? "सभी प्रतिक्रियाओं को फ़ैक्टरी सेटिंग्स पर रीसेट करें?" : "Reset all bot knowledge back to factory defaults?");
    if (!confirmed) return;
    
    await window.safeUIAction(async () => {
        await window.db.resetBotResponses();
        renderAdminResponsesList();
        window.toast.show(currentLanguage === "hi" ? "रीसेट सफल रहा!" : "System responses reset successful!", "success");
    });
};

// ============================================================
//  7. NOTIFICATION TRAY PANEL
// ============================================================

window.updateNotificationBadge = function(unreadCount) {
    const badge = document.getElementById("notifBadge");
    if (!badge) return;
    
    if (unreadCount > 0) {
        badge.style.display = "flex";
        badge.textContent = unreadCount;
    } else {
        badge.style.display = "none";
    }
};

window.renderNotificationTray = function(unreadCount, list) {
    window.updateNotificationBadge(unreadCount);
    
    const container = document.getElementById("notifList");
    if (!container) return;
    
    container.innerHTML = "";
    
    if (list.length === 0) {
        container.innerHTML = `<div class="notif-empty">No current notifications.</div>`;
        window.setLanguage(currentLanguage);
        return;
    }
    
    list.forEach(item => {
        const row = document.createElement("div");
        row.className = `notif-item ${item.read ? '' : 'unread'}`;
        row.style.background = item.read ? 'transparent' : 'rgba(var(--accent-rgb), 0.05)';
        
        const elapsed = Math.round((Date.now() - item.timestamp) / 60000);
        let timeText = currentLanguage === "hi" ? "अभी-अभी" : "Just now";
        if (elapsed > 0) {
            timeText = currentLanguage === "hi" ? `${elapsed} मिनट पहले` : `${elapsed}m ago`;
        }
        if (elapsed > 60) {
            const hrs = Math.round(elapsed / 60);
            timeText = currentLanguage === "hi" ? `${hrs} घंटे पहले` : `${hrs}h ago`;
        }
        
        row.innerHTML = `
            <span class="notif-icon">${item.icon}</span>
            <div class="notif-body">
                <span class="notif-msg">${item.message}</span>
                <span class="notif-time">${timeText}</span>
            </div>
        `;
        
        container.appendChild(row);
    });
};

window.toggleNotificationDropdown = function() {
    const dropdown = document.getElementById("notificationDropdown");
    if (!dropdown) return;
    
    const isOpen = dropdown.classList.contains("open");
    if (isOpen) {
        dropdown.classList.remove("open");
    } else {
        dropdown.classList.add("open");
        window.notices.markAllRead();
    }
};

// ============================================================
//  8. NEW DASHBOARD & UTILITIES MODULES
// ============================================================

async function renderDashboardTimetable(student) {
    const container = document.getElementById("dbTodayTimetable");
    if (!container) return;
    
    container.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-secondary);">Loading schedule...</div>`;
    
    try {
        const todayWeekday = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const timetable = await window.db.getTimetable(student.course);
        const todayClasses = timetable.filter(c => c.day === todayWeekday).sort((a, b) => a.period - b.period);
        
        if (todayClasses.length === 0) {
            container.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 6px;">🎉 No classes scheduled for today (${todayWeekday})!</div>`;
            return;
        }
        
        let html = `<div class="timetable-wrap">`;
        todayClasses.forEach(c => {
            const isBreak = c.type === "break";
            html += `
                <div class="timetable-item" style="${isBreak ? 'opacity: 0.7; background: rgba(255,255,255,0.01);' : ''}">
                    <div class="timetable-meta">
                        <span class="timetable-subject">${c.subject}</span>
                        <span class="timetable-info">${isBreak ? 'Rest Period' : `${c.room} · ${c.faculty}`}</span>
                    </div>
                    <span class="timetable-time">${c.time}</span>
                </div>
            `;
        });
        html += `</div>`;
        container.innerHTML = html;
    } catch (e) {
        console.error("Timetable render error:", e);
        container.innerHTML = `<div style="color: #ef4444; font-size: 0.8rem;">Failed to load timetable.</div>`;
    }
}

async function renderDashboardAssignments(student) {
    const container = document.getElementById("dbAssignmentsContainer");
    if (!container) return;
    
    container.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-secondary);">Loading assignments...</div>`;
    
    try {
        const assignments = await window.db.getAssignments(student.rollNumber);
        if (assignments.length === 0) {
            container.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 6px;">No upcoming assignments.</div>`;
            return;
        }
        
        let html = `<div class="assignments-list">`;
        assignments.forEach(a => {
            const dueDate = new Date(a.dueDate);
            const today = new Date();
            today.setHours(0,0,0,0);
            const diffTime = dueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let daysClass = "days-safe";
            let daysText = `${diffDays} days left`;
            if (diffDays < 0) {
                daysClass = "days-urgent";
                daysText = "Overdue";
            } else if (diffDays === 0) {
                daysClass = "days-urgent";
                daysText = "Due Today";
            } else if (diffDays <= 2) {
                daysClass = "days-urgent";
            } else if (diffDays <= 4) {
                daysClass = "days-normal";
            }
            
            if (a.completed) {
                daysClass = "days-safe";
                daysText = "Done";
            }
            
            html += `
                <div class="assignment-item ${a.completed ? 'completed' : ''}">
                    <div class="assignment-item-left">
                        <input type="checkbox" ${a.completed ? 'checked' : ''} onchange="window.toggleAssignmentComplete('${a.id}', this.checked)">
                        <div>
                            <div class="assignment-title">${a.title}</div>
                            <div class="assignment-meta">${a.subject} · Due ${a.dueDate}</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="assignment-days-left ${daysClass}">${daysText}</span>
                        <span class="cursor-pointer text-danger" onclick="window.deleteAssignmentEntry('${a.id}')" style="font-size: 1.1rem; font-weight:700;">✕</span>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
        container.innerHTML = html;
    } catch (e) {
        console.error("Assignments render error:", e);
        container.innerHTML = `<div style="color: #ef4444; font-size: 0.8rem;">Failed to load assignments.</div>`;
    }
}

window.toggleAssignmentComplete = async function(id, completed) {
    const student = window.auth.getCurrentStudent();
    if (!student) return;
    
    await window.safeUIAction(async () => {
        const assignments = await window.db.getAssignments(student.rollNumber);
        const idx = assignments.findIndex(a => a.id === id);
        if (idx > -1) {
            assignments[idx].completed = completed;
            await window.db.saveAssignment(student.rollNumber, assignments[idx]);
            renderDashboardAssignments(student);
            window.toast.show(completed ? "Assignment marked as completed!" : "Assignment marked as pending.", "success");
        }
    });
};

window.deleteAssignmentEntry = async function(id) {
    const student = window.auth.getCurrentStudent();
    if (!student) return;
    
    const confirmed = confirm("Are you sure you want to delete this assignment?");
    if (!confirmed) return;
    
    await window.safeUIAction(async () => {
        await window.db.deleteAssignment(student.rollNumber, id);
        renderDashboardAssignments(student);
        window.toast.show("Assignment deleted successfully.", "info");
    });
};

window.addNewAssignment = async function() {
    const student = window.auth.getCurrentStudent();
    if (!student) return;
    
    const title = document.getElementById("newAsgTitle").value.trim();
    const subject = document.getElementById("newAsgSubject").value.trim();
    const dueDate = document.getElementById("newAsgDueDate").value;
    
    if (!title || !subject || !dueDate) {
        window.toast.show("Please fill out all fields!", "error");
        return;
    }
    
    await window.safeUIAction(async () => {
        const newAsg = {
            id: "asm-" + Date.now(),
            title,
            subject,
            dueDate,
            completed: false
        };
        await window.db.saveAssignment(student.rollNumber, newAsg);
        
        document.getElementById("newAsgTitle").value = "";
        document.getElementById("newAsgSubject").value = "";
        document.getElementById("newAsgDueDate").value = "";
        document.getElementById("addAsgFormContainer").style.display = "none";
        
        renderDashboardAssignments(student);
        window.toast.show("Assignment added successfully!", "success");
    });
};

window.openCgpaCalculator = async function() {
    const student = window.auth.getCurrentStudent();
    if (!student) return;
    
    const modal = document.getElementById("cgpaModal");
    if (!modal) return;
    modal.classList.add("open");
    
    const results = await window.db.getStudentResults(student.rollNumber);
    const container = document.getElementById("cgpaCalculatorGrid");
    if (!container) return;
    
    container.innerHTML = "";
    if (results && results.semesters) {
        const latestSem = results.semesters[results.semesters.length - 1];
        let html = "";
        latestSem.subjects.forEach((sub, idx) => {
            html += `
                <div class="cgpa-row" data-code="${sub.code}" data-credits="${sub.credits}">
                    <span style="font-size:0.8rem; font-weight:500;">${sub.name} (${sub.code})</span>
                    <span style="font-size:0.8rem; text-align:center;">${sub.credits} Credits</span>
                    <select class="cgpa-grade-select" onchange="window.recalculateCgpa()" style="padding:4px; border-radius:6px; font-size:0.8rem;">
                        <option value="10" ${sub.gradePoints === 10 ? 'selected' : ''}>O / A+ (10)</option>
                        <option value="9" ${sub.gradePoints === 9 ? 'selected' : ''}>A (9)</option>
                        <option value="8" ${sub.gradePoints === 8 ? 'selected' : ''}>B+ (8)</option>
                        <option value="7" ${sub.gradePoints === 7 ? 'selected' : ''}>B (7)</option>
                        <option value="6" ${sub.gradePoints === 6 ? 'selected' : ''}>C (6)</option>
                        <option value="0" ${sub.gradePoints === 0 ? 'selected' : ''}>F (0)</option>
                    </select>
                    <span></span>
                </div>
            `;
        });
        container.innerHTML = html;
        window.recalculateCgpa();
    } else {
        container.innerHTML = `<div style="font-size:0.8rem; color:var(--text-muted);">No academic grade history found.</div>`;
    }
};

window.recalculateCgpa = function() {
    const rows = document.querySelectorAll("#cgpaCalculatorGrid .cgpa-row");
    let totalPoints = 0;
    let totalCredits = 0;
    
    rows.forEach(row => {
        const credits = parseInt(row.getAttribute("data-credits")) || 3;
        const select = row.querySelector(".cgpa-grade-select");
        const points = parseInt(select.value) || 0;
        
        totalPoints += (points * credits);
        totalCredits += credits;
    });
    
    const computedGpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
    const valEl = document.getElementById("cgpaCalculatedVal");
    if (valEl) valEl.textContent = computedGpa;
};

window.saveCalculatedCgpa = async function() {
    const student = window.auth.getCurrentStudent();
    if (!student) return;
    
    const valEl = document.getElementById("cgpaCalculatedVal");
    if (!valEl) return;
    const computedGpa = parseFloat(valEl.textContent) || 0.0;
    
    await window.safeUIAction(async () => {
        student.gpa = computedGpa;
        await window.db.saveStudent(student);
        sessionStorage.setItem("uem_current_student_session", JSON.stringify(student));
        
        window.closeModal("cgpaModal");
        window.updateAuthView();
        window.toast.show(`Academic record updated successfully! CGPA: ${computedGpa}`, "success");
    });
};

window.downloadExamHallTicket = async function() {
    const student = window.auth.getCurrentStudent();
    if (!student) {
        window.toast.show("Please log in to student portal first!", "error");
        return;
    }
    
    window.toast.show("Generating hall ticket PDF...", "info");
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });
        
        doc.setDrawColor(0, 51, 102);
        doc.setLineWidth(1.5);
        doc.rect(5, 5, 200, 287);
        doc.setLineWidth(0.5);
        doc.rect(7, 7, 196, 283);
        
        doc.setFillColor(0, 51, 102);
        doc.rect(8, 8, 194, 25, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(14);
        doc.text("UNIVERSITY OF ENGINEERING & MANAGEMENT, JAIPUR", 105, 17, { align: "center" });
        doc.setFontSize(10);
        doc.setFont("Helvetica", "normal");
        doc.text("ESTABLISHED UNDER ACT NO. 5 OF 2012 OF GOVT. OF RAJASTHAN", 105, 23, { align: "center" });
        doc.setFontSize(9);
        doc.text("NH-11C, Sikar Road, Jaipur, Rajasthan 303007", 105, 28, { align: "center" });
        
        doc.setTextColor(0, 51, 102);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(14);
        doc.text("EXAM HALL TICKET (ADMIT CARD)", 105, 45, { align: "center" });
        doc.setFontSize(10);
        doc.text("END-SEMESTER EXAMINATIONS - JUNE 2026", 105, 51, { align: "center" });
        
        doc.setDrawColor(200, 200, 200);
        doc.line(15, 55, 195, 55);
        
        doc.rect(15, 60, 180, 50);
        doc.line(15, 72, 195, 72);
        doc.line(15, 84, 195, 84);
        doc.line(15, 96, 195, 96);
        doc.line(125, 60, 125, 110);
        
        doc.setFillColor(240, 240, 240);
        doc.rect(135, 63, 35, 42, 'F');
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(9);
        doc.text("STUDENT PHOTO", 152.5, 85, { align: "center" });
        
        doc.setTextColor(0, 0, 0);
        doc.setFont("Helvetica", "bold");
        doc.text("STUDENT NAME:", 18, 67);
        doc.text("ROLL NUMBER:", 18, 79);
        doc.text("COURSE NAME:", 18, 91);
        doc.text("CAMPUS LOCATION:", 18, 103);
        
        doc.setFont("Helvetica", "normal");
        doc.text(student.fullName.toUpperCase(), 55, 67);
        doc.text(student.rollNumber, 55, 79);
        doc.text(student.course.toUpperCase(), 55, 91);
        doc.text("UEM JAIPUR MAIN CAMPUS", 55, 103);
        
        doc.setFillColor(240, 244, 250);
        doc.rect(15, 120, 180, 8, 'F');
        doc.rect(15, 120, 180, 60);
        
        doc.line(15, 128, 195, 128);
        doc.line(15, 138, 195, 138);
        doc.line(15, 148, 195, 148);
        doc.line(15, 158, 195, 158);
        doc.line(15, 168, 195, 168);
        
        doc.line(40, 120, 40, 180);
        doc.line(125, 120, 125, 180);
        doc.line(160, 120, 160, 180);
        
        doc.setTextColor(0, 51, 102);
        doc.setFont("Helvetica", "bold");
        doc.text("DATE", 27.5, 125, { align: "center" });
        doc.text("SUBJECT", 82.5, 125, { align: "center" });
        doc.text("ROOM", 142.5, 125, { align: "center" });
        doc.text("FACULTY", 177.5, 125, { align: "center" });
        
        doc.setTextColor(0, 0, 0);
        doc.setFont("Helvetica", "normal");
        
        const subjects = [
            { date: "15-06-2026", sub: "Artificial Intelligence", room: "CS-201", fac: "Dr. Sharma" },
            { date: "17-06-2026", sub: "Software Engineering", room: "CS-202", fac: "Prof. Singh" },
            { date: "19-06-2026", sub: "Web Technologies", room: "CS-LAB-3", fac: "Ms. Patel" },
            { date: "22-06-2026", sub: "Theory of Computation", room: "CS-201", fac: "Dr. Roy" },
            { date: "24-06-2026", sub: "Machine Learning", room: "CS-203", fac: "Prof. Mehta" }
        ];
        
        subjects.forEach((s, idx) => {
            const y = 134 + idx * 10;
            doc.text(s.date, 27.5, y, { align: "center" });
            doc.text(s.sub, 45, y);
            doc.text(s.room, 142.5, y, { align: "center" });
            doc.text(s.fac, 177.5, y, { align: "center" });
        });
        
        doc.rect(15, 190, 180, 45);
        doc.setFillColor(240, 240, 240);
        doc.rect(15, 190, 180, 7, 'F');
        doc.line(15, 197, 195, 197);
        
        doc.setTextColor(0, 51, 102);
        doc.setFont("Helvetica", "bold");
        doc.text("IMPORTANT INSTRUCTIONS FOR EXAMINEES", 105, 195, { align: "center" });
        
        doc.setTextColor(50, 50, 50);
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.text("1. Candidates must carry this printed admit card along with their valid University Photo ID.", 18, 203);
        doc.text("2. Please report to the examination center at least 30 minutes before the scheduled time.", 18, 208);
        doc.text("3. Electronic gadgets, smart watches, mobile phones and unauthorized material are strictly prohibited.", 18, 213);
        doc.text("4. Minimum 75% attendance is verified and mandatory for admission to the exam hall.", 18, 218);
        doc.text("5. Any student found using unfair means will be subject to disciplinary actions under University code.", 18, 223);
        
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.setFont("Helvetica", "bold");
        doc.text("STUDENT SIGNATURE", 35, 260, { align: "center" });
        doc.text("CONTROLLER OF EXAMINATIONS", 155, 260, { align: "center" });
        
        doc.setDrawColor(150, 150, 150);
        doc.line(15, 255, 55, 255);
        doc.line(130, 255, 180, 255);
        
        doc.save(`UEM_AdmitCard_${student.rollNumber}.pdf`);
        window.toast.show("Exam Admit Card downloaded successfully!", "success");
    } catch (err) {
        console.error("PDF generation failed:", err);
        window.toast.show("PDF download failed: " + err.message, "error");
    }
};

window.triggerForgotPassword = function() {
    window.closeModal("authModal");
    window.openModal("forgotPasswordModal");
};

window.submitSecurityCheck = async function() {
    const roll = document.getElementById("forgotRollNumber").value.trim();
    if (!roll) {
        window.toast.show("Please enter your Roll Number first!", "error");
        return;
    }
    
    await window.safeUIAction(async () => {
        const question = await window.auth.getSecurityQuestionForRollNumber(roll);
        document.getElementById("forgotSecurityQuestionText").textContent = question;
        document.getElementById("forgotSecurityVerificationForm").style.display = "flex";
    }, "Incorrect Roll Number or database lookup failed.");
};

window.submitPasswordReset = async function() {
    const roll = document.getElementById("forgotRollNumber").value.trim();
    const answer = document.getElementById("forgotSecurityAnswer").value.trim();
    const newPass = document.getElementById("forgotNewPassword").value.trim();
    
    if (!roll || !answer || !newPass) {
        window.toast.show("Please fill out all required fields!", "error");
        return;
    }
    
    await window.safeUIAction(async () => {
        await window.auth.resetPasswordWithSecurityAnswer(roll, answer, newPass);
        
        document.getElementById("forgotRollNumber").value = "";
        document.getElementById("forgotSecurityAnswer").value = "";
        document.getElementById("forgotNewPassword").value = "";
        document.getElementById("forgotSecurityVerificationForm").style.display = "none";
        
        window.closeModal("forgotPasswordModal");
        window.openModal("authModal");
        window.toast.show("Password reset successfully! Log in now.", "success");
    });
};

// Session inactivity tracker
let inactivityTimer = null;
let inactivityWarningTimer = null;
const INACTIVITY_LIMIT = 600000;
const WARNING_LIMIT = 540000;

window.resetInactivityTimer = function() {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    if (inactivityWarningTimer) clearTimeout(inactivityWarningTimer);
    
    const student = window.auth.getCurrentStudent();
    if (!student) return;
    
    inactivityWarningTimer = setTimeout(() => {
        window.toast.show("⚠️ Inactivity Warning: You will be logged out in 1 minute due to inactivity.", "info", 8000);
    }, WARNING_LIMIT);
    
    inactivityTimer = setTimeout(() => {
        window.auth.logout();
        window.closeModal("studentDashboardModal");
        window.updateAuthView();
        window.toast.show("❌ Session expired: You have been logged out due to inactivity.", "error");
    }, INACTIVITY_LIMIT);
};

['mousemove', 'click', 'keydown', 'touchstart'].forEach(evt => {
    window.addEventListener(evt, () => window.resetInactivityTimer());
});

// Offline detection
window.updateOnlineStatus = function() {
    const banner = document.getElementById("offlineBanner");
    if (!banner) return;
    
    if (navigator.onLine) {
        banner.classList.remove("active");
    } else {
        banner.classList.add("active");
        window.toast.show("⚠️ Disconnected: You are currently offline.", "error");
    }
};

window.addEventListener('online', () => window.updateOnlineStatus());
window.addEventListener('offline', () => window.updateOnlineStatus());

// Announcement scheduled trigger daemon
async function checkScheduledAnnouncements() {
    try {
        const list = await window.db.getScheduledAnnouncements();
        const pending = list.filter(a => a.status === "pending");
        
        let updated = false;
        for (let ann of pending) {
            if (new Date() >= new Date(ann.scheduledTime)) {
                window.notices.pushNotice(ann.message, ann.icon || "📢", ann.type || "general");
                await window.db.updateScheduledAnnouncementStatus(ann.id, "sent");
                updated = true;
            }
        }
        
        if (updated) {
            window.renderScheduledAnnouncementsList();
        }
    } catch (e) {
        console.error("Scheduled announcements trigger error:", e);
    }
}
setInterval(checkScheduledAnnouncements, 10000);

window.startOnboardingTour = function() {
    const isHi = window.getLanguage() === "hi";
    window.introJs().setOptions({
        steps: [
            {
                element: document.querySelector('.nav-brand'),
                intro: isHi ? 'यूईएम जयपुर वर्चुअल पोर्टल में स्वागत है!' : 'Welcome to the UEM Jaipur Virtual Portal!'
            },
            {
                element: document.querySelector('#navStudentPortalBtn'),
                intro: isHi ? 'स्टूडेंट पोर्टल में लॉगिन करें।' : 'Click here to sign in and access student dashboard.'
            },
            {
                element: document.querySelector('.circle-icon-btn[title="Notice Board"]'),
                intro: isHi ? 'महत्वपूर्ण विश्वविद्यालय नोटिस यहाँ देखें।' : 'Check notices and announcements here.'
            },
            {
                element: document.querySelector('.chat-toggle-btn'),
                intro: isHi ? 'सहायता से चैट करने के लिए यहाँ क्लिक करें।' : 'Click this floating button to toggle the chatbot.'
            }
        ]
    }).start();
};

window.autoTriggerOnboarding = function() {
    try {
        const onboarded = localStorage.getItem("uem_onboarded");
        if (!onboarded) {
            localStorage.setItem("uem_onboarded", "true");
            setTimeout(() => {
                window.startOnboardingTour();
            }, 2500);
        }
    } catch (e) {}
};

window.handleCSVBulkImport = function() {
    const fileInput = document.getElementById("adminCSVFileInput");
    if (!fileInput || !fileInput.files[0]) {
        window.toast.show("Please select a valid CSV file first!", "error");
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target.result;
        await window.safeUIAction(async () => {
            const count = await window.db.importBotResponsesCSV(text, currentLanguage);
            fileInput.value = "";
            renderAdminResponsesList();
            window.toast.show(`Successfully imported ${count} custom response triggers!`, "success");
        }, "Failed to parse CSV file.");
    };
    reader.readAsText(file);
};

window.renderKeywordUsageStats = async function() {
    const container = document.getElementById("adminKeywordUsageStats");
    if (!container) return;
    
    container.innerHTML = `<div style="font-size:0.8rem; color:var(--text-secondary);">Loading usage stats...</div>`;
    
    try {
        const stats = await window.db.getKeywordStats();
        if (stats.length === 0) {
            container.innerHTML = `<div style="font-size:0.8rem; color:var(--text-muted);">No keyword logs registered.</div>`;
            return;
        }
        
        const maxCount = Math.max(...stats.map(s => s.count));
        let html = `<div class="admin-usage-list">`;
        stats.slice(0, 5).forEach(s => {
            const pct = maxCount > 0 ? (s.count / maxCount) * 100 : 0;
            html += `
                <div>
                    <div class="admin-usage-bar-row">
                        <strong>${s.keyword}</strong>
                        <span>${s.count} hits</span>
                    </div>
                    <div class="admin-usage-bar-container">
                        <div class="admin-usage-bar-fill" style="width: ${pct}%"></div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = `<div style="color:#ef4444; font-size:0.8rem;">Failed to load statistics.</div>`;
    }
};

window.submitNewAnnouncement = async function() {
    const msg = document.getElementById("announcementMsg").value.trim();
    const timeVal = document.getElementById("announcementTime").value;
    
    if (!msg || !timeVal) {
        window.toast.show("Please fill out all fields!", "error");
        return;
    }
    
    await window.safeUIAction(async () => {
        const newAnn = {
            id: "ann-" + Date.now(),
            message: msg,
            scheduledTime: new Date(timeVal).toISOString(),
            status: "pending",
            icon: "📢",
            type: "general"
        };
        await window.db.saveScheduledAnnouncement(newAnn);
        
        document.getElementById("announcementMsg").value = "";
        document.getElementById("announcementTime").value = "";
        
        window.renderScheduledAnnouncementsList();
        window.toast.show("Announcement scheduled successfully!", "success");
    });
};

window.renderScheduledAnnouncementsList = async function() {
    const container = document.getElementById("adminScheduledAnnouncementsList");
    if (!container) return;
    
    container.innerHTML = `<div style="font-size:0.8rem; color:var(--text-secondary);">Loading schedule...</div>`;
    
    try {
        const list = await window.db.getScheduledAnnouncements();
        if (list.length === 0) {
            container.innerHTML = `<div style="font-size:0.8rem; color:var(--text-muted);">No announcements scheduled.</div>`;
            return;
        }
        
        let html = `<div style="display:flex; flex-direction:column; gap:6px;">`;
        list.forEach(a => {
            const timeStr = new Date(a.scheduledTime).toLocaleString();
            html += `
                <div class="admin-response-item" style="font-size:0.75rem;">
                    <div>
                        <strong>${timeStr} (${a.status.toUpperCase()})</strong>
                        <span>${a.message}</span>
                    </div>
                    <button class="delete-btn" onclick="window.deleteAnnouncementEntry('${a.id}')" style="background:#ff4757; color:white; border:none; padding:2px 6px; border-radius:4px; font-size:0.7rem; cursor:pointer;">Delete</button>
                </div>
            `;
        });
        html += `</div>`;
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = `<div style="color:#ef4444; font-size:0.8rem;">Failed to load announcements.</div>`;
    }
};

window.deleteAnnouncementEntry = async function(id) {
    const confirmed = confirm("Are you sure you want to delete this scheduled announcement?");
    if (!confirmed) return;
    
    await window.safeUIAction(async () => {
        await window.db.deleteScheduledAnnouncement(id);
        window.renderScheduledAnnouncementsList();
        window.toast.show("Announcement deleted successfully.", "info");
    });
};

// Auto-run offline check on script load
setTimeout(() => {
    if (window.updateOnlineStatus) window.updateOnlineStatus();
    if (window.autoTriggerOnboarding) window.autoTriggerOnboarding();
}, 2000);

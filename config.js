/* ============================================================
   GLOBAL DYNAMIC SETTINGS & TRANSLATIONS (js/config.js)
   ============================================================ */

window.UEM_SECURITY_QUESTIONS = [
    "What is your high school name?",
    "What is your pet's name?",
    "What is your birthplace?"
];

window.UEM_CONFIG = {
    contactPhone:    "+91-141-3819000",
    contactEmail:    "admissions@uemj.edu.in",
    location:        "UEM Jaipur Campus, NH-11C, Sikar Road, Jaipur, Rajasthan 303007",
    libraryHours:    "9:00 AM – 7:00 PM (Mon-Fri) | 9:00 AM – 1:00 PM (Sat)",

    // Fee Structures
    feesBTechCSE:    "₹1,20,000 / Year",
    feesBTechOther:  "₹1,10,000 / Year",
    feesMTech:       "₹75,000 / Year",
    feesMBA:         "₹90,000 / Year",
    hostelDues:      "₹95,000 / Year (Mess included)",

    // AI Configuration
    aiProvider:      "gemini", // "gemini" or "openai"
    geminiApiKey:    "",  // Set this in Admin Panel to enable Real AI Chatbot
    geminiModel:     "gemini-1.5-flash",
    geminiEndpoint:  "https://generativelanguage.googleapis.com/v1beta/models/",
    openaiApiKey:    "",  // Set this in Admin Panel to enable OpenAI Chatbot
    openaiModel:     "gpt-4o-mini",
    openaiEndpoint:  "https://api.openai.com/v1/chat/completions",
    useAI:           false,

    // System states
    chatHistoryLimit: 50
};

window.UI_TRANSLATIONS = {
    en: {
        navBrand:             "UEM Jaipur",
        navStudentPortal:     "Student Portal",
        navAnalytics:         "Analytics",
        navAdmin:             "Admin Panel",
        heroTitle:            "🎓 UEM Jaipur",
        heroSubtitle:         "Your Virtual Intelligent Assistant is online. Click the chat button to begin →",
        chatHeaderTitle:      "UEM Virtual Assistant",
        chatHeaderStatus:     "Online · Admissions, Fees & more",
        chatInputPlaceholder: "Ask me anything...",
        btnSend:              "Send",
        btnSummarizeChat:     "✨ Summarize",

        // Student Portal Form
        loginTitle:           "🔐 Student Portal Login",
        rollNumberLabel:      "Roll Number / Student ID",
        passwordLabel:        "Password",
        btnLogin:             "Sign In",
        btnRegister:          "Register Account",
        registerTitle:        "📝 Student Registration",
        fullNameLabel:        "Full Name",
        courseLabel:          "Select Course",
        attendanceLabel:      "Initial Attendance (%)",
        btnSignUp:            "Sign Up",
        btnBackToLogin:       "Back to Login",

        // Student Dashboard
        dashboardTitle:       "🎓 Student Dashboard",
        btnSignOut:           "Sign Out",
        studentIdBadge:       "STUDENT ID",
        attendanceHeader:     "Attendance Tracker",
        gpaHeader:            "Academic Progress",
        feeDuesHeader:        "Outstanding Fee Dues",
        btnPayDues:           "Pay Fees Dues",
        duesPaidMsg:          "All fees cleared! ✅",

        // Analytics Dashboard
        analyticsTitle:       "📊 AI Analytics Telemetry",
        totalQueriesLabel:    "Total Queries",
        matchRateLabel:       "Match Accuracy",
        activeStudentsLabel:  "Authenticated Students",
        voiceUsageLabel:      "Voice Requests",
        volumeOverTime:       "Chat Interactions Volume",
        topicDistribution:    "Topic Distribution",

        // Control / Admin panel
        adminTitle:           "⚙️ Global Settings & Bot Trainer",
        adminAddResponse:     "Add / Edit Custom Bot Response",
        adminKeywordLabel:    "Trigger Keyword",
        adminResponseLabel:   "Bot Answer String",
        adminSaveBtn:         "Save Training",
        adminExistingResponses: "Active Custom Answers",
        adminResetBtn:        "Reset Default Knowledge Base",

        // Document summaries
        docSummaryTitle:      "✨ AI Document Analysis",
        docSummaryLoading:    "AI is analyzing document structure...",
        docSummaryResult:     "AI Summarization Result",

        // Common buttons/actions
        close:                "Close",
        save:                 "Save",
        errorEmptyField:      "Please fill out all required fields!",
        errorInvalidLogin:    "Invalid Roll Number or Password!",
        successLogin:         "Logged in successfully!",
        successRegister:      "Account created! You can now log in.",
        successDuesPaid:      "Dues paid successfully! Receipt sent.",
        successConfigSaved:   "Configuration updated successfully!",
        forgotPasswordLink:   "Forgot Password?",
        securityQuestionLabel:"Security Question",
        securityAnswerLabel:  "Your Answer",
        newPasswordLabel:     "New Password",
        btnResetPassword:     "Reset Password",
        successPasswordReset: "Password reset successfully!",
        errorInvalidReset:    "Incorrect security answer or roll number!"
    },
    hi: {
        navBrand:             "यूईएम जयपुर",
        navStudentPortal:     "छात्र पोर्टल",
        navAnalytics:         "विश्लेषण",
        navAdmin:             "प्रशासक पैनल",
        heroTitle:            "🎓 यूईएम जयपुर",
        heroSubtitle:         "आपका वर्चुअल इंटेलिजेंट सहायक ऑनलाइन है। शुरू करने के लिए चैट बटन पर क्लिक करें →",
        chatHeaderTitle:      "यूईएम वर्चुअल सहायक",
        chatHeaderStatus:     "ऑनलाइन · प्रवेश, फीस और बहुत कुछ",
        chatInputPlaceholder: "मुझसे कुछ भी पूछें...",
        btnSend:              "भेजें",
        btnSummarizeChat:     "✨ सारांश",

        loginTitle:           "🔐 छात्र पोर्टल लॉगिन",
        rollNumberLabel:      "रोल नंबर / छात्र आईडी",
        passwordLabel:        "पासवर्ड",
        btnLogin:             "साइन इन करें",
        btnRegister:          "नया खाता बनाएं",
        registerTitle:        "📝 छात्र पंजीकरण",
        fullNameLabel:        "पूरा नाम",
        courseLabel:          "कोर्स चुनें",
        attendanceLabel:      "प्रारंभिक उपस्थिति (%)",
        btnSignUp:            "पंजीकरण करें",
        btnBackToLogin:       "लॉगिन पर वापस जाएं",

        dashboardTitle:       "🎓 छात्र डैशबोर्ड",
        btnSignOut:           "साइन आउट",
        studentIdBadge:       "छात्र आईडी कार्ड",
        attendanceHeader:     "उपस्थिति ट्रैकर",
        gpaHeader:            "शैक्षणिक प्रगति (GPA)",
        feeDuesHeader:        "शेष फीस देय राशि",
        btnPayDues:           "फीस का भुगतान करें",
        duesPaidMsg:          "सभी फीस चुकता! ✅",

        analyticsTitle:       "📊 एआई विश्लेषिकी डैशबोर्ड",
        totalQueriesLabel:    "कुल प्रश्न",
        matchRateLabel:       "सटीकता दर",
        activeStudentsLabel:  "प्रमाणित छात्र",
        voiceUsageLabel:      "आवाज अनुरोध",
        volumeOverTime:       "चैट वॉल्यूम इतिहास",
        topicDistribution:    "विषय वितरण",

        adminTitle:           "⚙️ वैश्विक सेटिंग्स और बॉट ट्रेनर",
        adminAddResponse:     "कस्टम बॉट प्रतिक्रिया जोड़ें / संपादित करें",
        adminKeywordLabel:    "ट्रिगर कीवर्ड",
        adminResponseLabel:   "बॉट का उत्तर",
        adminSaveBtn:         "प्रशिक्षण सहेजें",
        adminExistingResponses:"सक्रिय कस्टम उत्तर",
        adminResetBtn:        "ज्ञान आधार रीसेट करें",

        docSummaryTitle:      "✨ एआई दस्तावेज़ विश्लेषण",
        docSummaryLoading:    "एआई दस्तावेज़ संरचना का विश्लेषण कर रहा है...",
        docSummaryResult:     "एआई सारांश परिणाम",

        close:                "बंद करें",
        save:                 "सहेजें",
        errorEmptyField:      "कृपया सभी आवश्यक फ़ील्ड भरें!",
        errorInvalidLogin:    "अमान्य रोल नंबर या पासवर्ड!",
        successLogin:         "सफलतापूर्वक लॉगिन किया गया!",
        successRegister:      "खाता बन गया! अब आप लॉगिन कर सकते हैं।",
        successDuesPaid:      "फीस का भुगतान सफल रहा! रसीद भेजी गई।",
        successConfigSaved:   "कॉन्फ़िगरेशन सफलतापूर्वक अपडेट किया गया!",
        forgotPasswordLink:   "पासवर्ड भूल गए?",
        securityQuestionLabel:"सुरक्षा प्रश्न",
        securityAnswerLabel:  "आपका उत्तर",
        newPasswordLabel:     "नया पासवर्ड",
        btnResetPassword:     "पासवर्ड रीसेट करें",
        successPasswordReset: "पासवर्ड सफलतापूर्वक रीसेट हो गया!",
        errorInvalidReset:    "गलत सुरक्षा उत्तर या रोल नंबर!"
    }
};

window.DEFAULT_BOT_RESPONSES = {
    en: {
        "admissions":     "For Admissions, UEM Jaipur accepts JEE Main, state engineering scores, and the IEMJEE exam. Direct admissions depend on board percentage limits.",
        "eligibility":    "B.Tech: Minimum 60% in 10+2 with Physics, Chemistry & Maths. MBA: Bachelor's degree with 50% + CAT/MAT score. M.Tech: B.Tech in relevant stream + GATE score.",
        "fees":           `Approximate annual B.Tech fee (CSE/IT) is ${window.UEM_CONFIG.feesBTechCSE}. Other branches are ${window.UEM_CONFIG.feesBTechOther}. M.Tech fee is around ${window.UEM_CONFIG.feesMTech}.`,
        "hostel":         `UEM Jaipur provides separate boys and girls hostels with full dining facilities, power backup, high-speed Wi-Fi, and sports fields. Hostel fees are ${window.UEM_CONFIG.hostelDues}.`,
        "library":        `Our Central Library is equipped with 50k+ books, research journals, and digital portals. Hours: ${window.UEM_CONFIG.libraryHours}.`,
        "transport":      "We provide bus services covering key pickup hubs and residential blocks across Jaipur. Contact transport office for monthly passes.",
        "placement":      "UEM maintains a 100% placement record. Top recruiters include TCS, Wipro, Infosys, Cognizant, and Capgemini, with packages reaching up to ₹72 LPA. Use the Placement Assistant to track active drives!",
        "scholarship":    "UEM awards generous scholarships based on board percentages and JEE/IEMJEE marks, ranging from 25% to 100% tuition waivers.",
        "contact":        `You can reach UEM Jaipur Administration at ${window.UEM_CONFIG.contactPhone} or email us at ${window.UEM_CONFIG.contactEmail}. Physical address: ${window.UEM_CONFIG.location}.`,
        "exam":           "Mid-semester exams occur in October/March, and end-semester exams are in December/May. Timetables are published on the Student Portal.",
        "result":         "You can view your semester-wise results, SGPA, CGPA and subject grades in the Student Result Portal. Login to your Student Portal and click 'View Results'.",
        "attendance":     "To check your attendance percentage and predict future attendance, use the Attendance Predictor tool in your Student Dashboard. Minimum 75% attendance is mandatory for exams.",
        "timetable":      "Your weekly class schedule is available in the Timetable Manager. You can view subject-wise timings, rooms and faculty details for all days.",
        "career":         "For career guidance, UEM offers an AI-powered Career Advisor that recommends career paths based on your CGPA, branch and interests. Open it from the nav menu!",
        "qr":             "QR Attendance System allows you to mark attendance for each lecture by scanning the session QR code. Access it from the Student Dashboard.",
        "default":        "I'm sorry, I didn't quite catch that. Try asking about 💰 Fees, 🏠 Hostel, 📚 Admissions, 📝 Results, 🎯 Career Guidance, or 🎓 Placements!"
    },
    hi: {
        "admissions":     "प्रवेश के लिए, यूईएम जयपुर जेईई मेन, राज्य इंजीनियरिंग स्कोर और आईईएमजेईई परीक्षा स्वीकार करता है।",
        "eligibility":    "बी.टेक: भौतिकी, रसायन विज्ञान और गणित के साथ 10+2 में न्यूनतम 60% अंक। एमबीए: 50% अंकों के साथ स्नातक डिग्री + कैट/मैट स्कोर।",
        "fees":           `बी.टेक (CSE/IT) की अनुमानित वार्षिक फीस ${window.UEM_CONFIG.feesBTechCSE} है। एम.टेक की फीस लगभग ${window.UEM_CONFIG.feesMTech} है।`,
        "hostel":         `यूईएम जयपुर लड़कों और लड़कियों के लिए अलग-अलग छात्रावास प्रदान करता है। छात्रावास शुल्क ${window.UEM_CONFIG.hostelDues} है।`,
        "library":        `हमारा केंद्रीय पुस्तकालय 50,000+ पुस्तकों से लैस है। समय: ${window.UEM_CONFIG.libraryHours}।`,
        "transport":      "हम जयपुर भर के प्रमुख पिकअप केंद्रों को कवर करने वाली बस सेवाएं प्रदान करते हैं।",
        "placement":      "यूईएम 100% प्लेसमेंट रिकॉर्ड बनाए रखता है। शीर्ष नियोक्ताओं में टीसीएस, विप्रो, इंफोसिस शामिल हैं।",
        "scholarship":    "यूईएम बोर्ड प्रतिशत के आधार पर 25% से 100% ट्यूशन छूट प्रदान करता है।",
        "contact":        `आप यूईएम जयपुर से ${window.UEM_CONFIG.contactPhone} पर संपर्क कर सकते हैं।`,
        "exam":           "मध्य-सेमेस्टर परीक्षाएं अक्टूबर/मार्च में और अंतिम-सेमेस्टर परीक्षाएं दिसंबर/मई में होती हैं।",
        "result":         "अपने सेमेस्टर-वार परिणाम, SGPA और CGPA देखने के लिए स्टूडेंट पोर्टल में 'रिजल्ट देखें' पर क्लिक करें।",
        "attendance":     "उपस्थिति प्रतिशत और भविष्य की भविष्यवाणी के लिए अटेंडेंस प्रेडिक्टर टूल का उपयोग करें।",
        "timetable":      "साप्ताहिक कक्षा अनुसूची टाइमटेबल मैनेजर में उपलब्ध है।",
        "career":         "करियर मार्गदर्शन के लिए एआई करियर सलाहकार का उपयोग करें जो आपके सीजीपीए और रुचि के आधार पर सुझाव देता है।",
        "default":        "क्षमा करें, मुझे समझ नहीं आया। कृपया 💰 फीस, 🏠 हॉस्टल, 📚 प्रवेश, 📝 परिणाम, या 🎓 प्लेसमेंट के बारे में पूछें!"
    }
};

// Gemini API system prompt for UEM context
window.GEMINI_SYSTEM_PROMPT = `You are UEM Virtual Assistant, the official AI chatbot for UEM Jaipur (University of Engineering and Management, Jaipur). You help students, parents and visitors with:
- Admissions, eligibility criteria, JEE/IEMJEE process
- Fee structures (B.Tech CSE: ₹1,20,000/yr, ECE/ME: ₹1,10,000/yr, MBA: ₹90,000/yr, M.Tech: ₹75,000/yr)
- Hostel facilities (₹95,000/yr, separate boys & girls, Wi-Fi, mess)
- Placement records (100% placement, top recruiters: TCS, Infosys, Wipro, Amazon, Google, packages up to ₹72 LPA)
- Library, transport, student services
- Exams: Mid-sem (Oct/Mar), End-sem (Dec/May)
- Scholarships: 25%-100% waivers based on merit
- Contact: +91-141-3819000, admissions@uemj.edu.in, NH-11C Sikar Road Jaipur 303007
Be friendly, concise, professional. Reply in the same language as the user's question (English or Hindi). Keep responses under 150 words. Do not make up information not listed above.`;

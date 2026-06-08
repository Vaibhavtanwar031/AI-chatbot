/* ============================================================
   NOTIFICATION & TOAST ALERTS TRACER (js/notifications.js)
   ============================================================ */

const NOTIF_STORAGE_KEY = "uem_notifications_list";

const DEFAULT_NOTIFICATIONS = [
    { id: 1, type: "exam", icon: "📝", message: "Mid-Semester exam timetable published. Check details in portal!", timestamp: Date.now() - 3600000 * 2, read: false },
    { id: 2, type: "placement", icon: "💼", message: "TCS placement recruitment drive begins next Monday. Registers open!", timestamp: Date.now() - 3600000 * 24, read: false },
    { id: 3, type: "fee", icon: "💰", message: "Tuition fee payment portal is open. Clear dues by June 15 to avoid late fee.", timestamp: Date.now() - 3600000 * 48, read: true }
];

let notificationsList = [];
let onNotifUpdateCallback = null;

try {
    const saved = localStorage.getItem(NOTIF_STORAGE_KEY);
    if (saved) {
        notificationsList = JSON.parse(saved);
    } else {
        notificationsList = [...DEFAULT_NOTIFICATIONS];
        localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notificationsList));
    }
} catch (e) {
    notificationsList = [...DEFAULT_NOTIFICATIONS];
}

// ============================================================
//  1. SLIDE-OUT TOAST POPUP BANNERS
// ============================================================

window.toast = {
    show: (message, type = "info", duration = 4000) => {
        let container = document.getElementById("toastContainer");
        if (!container) {
            container = document.createElement("div");
            container.id = "toastContainer";
            container.className = "toast-container";
            document.body.appendChild(container);
        }
        
        const card = document.createElement("div");
        card.className = `toast-card ${type}`;
        
        let icon = "🔔";
        if (type === "success") icon = "✅";
        if (type === "error") icon = "❌";
        if (type === "info") icon = "ℹ️";
        
        card.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <div class="toast-content">${message}</div>
            <button class="toast-close">✕</button>
        `;
        
        container.appendChild(card);
        
        const closeBtn = card.querySelector(".toast-close");
        const removeCard = () => {
            card.style.animation = "toastOut 0.3s ease forwards";
            card.addEventListener("animationend", () => card.remove());
        };
        
        closeBtn.onclick = removeCard;
        
        const timeoutId = setTimeout(removeCard, duration);
        card.dataset.timeoutId = timeoutId;
    }
};

// ============================================================
//  2. IN-APP NOTICE BOARD
// ============================================================

window.notices = {
    getNotices: () => notificationsList,
    
    getUnreadCount: () => {
        return notificationsList.filter(n => !n.read).length;
    },
    
    registerUpdateCallback: (cb) => {
        onNotifUpdateCallback = cb;
        if (cb) cb(window.notices.getUnreadCount(), notificationsList);
    },
    
    markAllRead: () => {
        notificationsList = notificationsList.map(n => ({ ...n, read: true }));
        window.notices.syncAndNotify();
    },
    
    clearAll: () => {
        notificationsList = [];
        window.notices.syncAndNotify();
    },
    
    pushNotice: (message, icon = "📢", type = "general") => {
        const newNotif = {
            id: Date.now(),
            type,
            icon,
            message,
            timestamp: Date.now(),
            read: false
        };
        
        notificationsList.unshift(newNotif);
        window.notices.syncAndNotify();
        
        window.toast.show(message, "info");
    },
    
    syncAndNotify: () => {
        try {
            localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notificationsList));
        } catch (e) {}
        
        if (onNotifUpdateCallback) {
            onNotifUpdateCallback(window.notices.getUnreadCount(), notificationsList);
        }
    }
};

window.triggerDuesAlert = function(studentName) {
    setTimeout(() => {
        window.notices.pushNotice(`Welcome back ${studentName}! outstanding tuition fees are pending payment.`, "⚠️", "fee");
    }, 3000);
};


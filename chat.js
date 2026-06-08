/* ============================================================
   CHAT DIALOGUE STATE MACHINE (js/chat.js)
   - Real Gemini AI + Keyword fallback
   ============================================================ */

let chatHistory = [];
const activeFileUploads = new Map();

// ============================================================
//  1. CHAT HISTORY INITIALIZATION & DOM RENDERING
// ============================================================

window.initChat = function() {
    chatHistory = window.db.getChatHistory();
    window.restoreChatWindow();
    
    // Render persistent quick replies chips above input box
    if (window.renderChatQuickReplyChips) window.renderChatQuickReplyChips();

    window.initSpeechRecognition(
        (text) => {
            document.getElementById("userInput").value = text;
            window.sendMessage();
        },
        (isListening) => {
            const waves = document.getElementById("voiceWaveContainer");
            if (waves) isListening ? waves.classList.add("active") : waves.classList.remove("active");
        },
        (error) => window.toast.show(`Voice Input Error: ${error}`, "error")
    );
};

window.restoreChatWindow = function() {
    const messagesDiv = document.getElementById("chatMessages");
    if (!messagesDiv) return;
    messagesDiv.innerHTML = "";

    if (chatHistory.length === 0) {
        window.showDateSeparator();
        window.renderQuickRepliesWelcome();
    } else {
        window.showDateSeparator();
        chatHistory.forEach(msg => {
            if (msg.isFileCard) renderUploadedFileCard(msg.fileName, msg.fileSize, msg.id, msg.sender, msg.time, true);
            else window.renderMessageBubble(msg.text, msg.sender, msg.time);
        });
    }
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
};

function getTimeStamp() {
    return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function getDateSeparatorText() {
    const d = new Date();
    const lang = window.getLanguage();
    return lang === "hi"
        ? (d.toDateString() === new Date().toDateString() ? "आज" : d.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' }))
        : (d.toDateString() === new Date().toDateString() ? "Today" : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
}

window.showDateSeparator = function() {
    const messagesDiv = document.getElementById("chatMessages");
    if (!messagesDiv) return;
    const sep = document.createElement("div");
    sep.className = "date-separator";
    sep.innerHTML = `<span>${getDateSeparatorText()}</span>`;
    messagesDiv.appendChild(sep);
};

// ============================================================
//  2. DIALOGUE RENDERERS
// ============================================================

window.renderMessageBubble = function(text, sender, time = null) {
    const messagesDiv = document.getElementById("chatMessages");
    if (!messagesDiv) return;

    const isUser = sender === "user";
    const row    = document.createElement("div");
    row.className = `message-row ${isUser ? 'user-row' : 'bot-row'}`;

    const avatar = document.createElement("div");
    avatar.className = "msg-avatar";
    avatar.textContent = isUser ? "🧑" : "🤖";

    const content = document.createElement("div");
    content.className = "msg-content";

    const bubble = document.createElement("div");
    bubble.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    bubble.innerHTML = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');

    const timestamp = document.createElement("div");
    timestamp.className = "msg-time";
    timestamp.textContent = time || getTimeStamp();

    // Add AI badge for Gemini responses
    if (!isUser && window.UEM_CONFIG.geminiApiKey && !time) {
        const aiBadge = document.createElement("span");
        aiBadge.className = "ai-badge";
        aiBadge.textContent = "✨ AI";
        content.appendChild(bubble);
        content.appendChild(aiBadge);
        content.appendChild(timestamp);
    } else {
        content.appendChild(bubble);
        content.appendChild(timestamp);
    }

    if (isUser) { row.appendChild(content); row.appendChild(avatar); }
    else        { row.appendChild(avatar);  row.appendChild(content); }

    messagesDiv.appendChild(row);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
};

window.renderQuickRepliesWelcome = function() {
    const messagesDiv = document.getElementById("chatMessages");
    if (!messagesDiv) return;

    const lang = window.getLanguage();
    const isHi = lang === "hi";
    const hasAI = !!window.UEM_CONFIG.geminiApiKey;

    const row    = document.createElement("div");
    row.className = "message-row bot-row";

    const avatar = document.createElement("div");
    avatar.className = "msg-avatar";
    avatar.textContent = "🤖";

    const content = document.createElement("div");
    content.className = "msg-content";

    const bubble = document.createElement("div");
    bubble.className = "message bot-message";
    bubble.innerHTML = isHi
        ? `नमस्ते! मैं आपका यूईएम वर्चुअल सहायक हूं${hasAI ? ' <span class="ai-badge">✨ AI Powered</span>' : ''}। मैं प्रवेश, हॉस्टल, परिणाम, उपस्थिति और करियर मार्गदर्शन में मदद कर सकता हूं! 👋`
        : `Hello! I'm your UEM Virtual Assistant${hasAI ? ' <span class="ai-badge">✨ AI Powered</span>' : ''}. I can guide you on admissions, results, attendance, career paths & more! 👋`;

    const quickReplies = document.createElement("div");
    quickReplies.className = "quick-replies";

    const chips = isHi
        ? ["💰 फीस", "🏠 हॉस्टल", "📝 प्रवेश", "🎓 प्लेसमेंट", "📊 उपस्थिति", "🎯 करियर"]
        : ["Admissions", "Fees", "Results", "Placements", "Attendance", "Career"];

    chips.forEach(chip => {
        const btn = document.createElement("button");
        btn.className = "quick-btn";
        btn.textContent = chip;
        btn.onclick = () => {
            const cleanText = chip.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '').trim();
            document.getElementById("userInput").value = cleanText;
            window.sendMessage();
        };
        quickReplies.appendChild(btn);
    });

    const timestamp = document.createElement("div");
    timestamp.className = "msg-time";
    timestamp.textContent = getTimeStamp();

    content.appendChild(bubble);
    content.appendChild(quickReplies);
    content.appendChild(timestamp);

    row.appendChild(avatar);
    row.appendChild(content);
    messagesDiv.appendChild(row);
};

// ============================================================
//  3. MESSAGE PROCESSING – GEMINI AI + KEYWORD FALLBACK
// ============================================================

window.sendMessage = async function() {
    const input = document.getElementById("userInput");
    const text  = input.value.trim();
    if (!text) return;

    const lang = window.getLanguage();
    const time = getTimeStamp();

    window.renderMessageBubble(text, "user", time);
    chatHistory.push({ text, sender: "user", time });
    window.db.saveChatHistory(chatHistory);
    input.value = "";

    window.setAvatarThinking(true);
    showTypingIndicator();

    try {
        let responseText = null;
        let matched      = false;
        let usedAI       = false;

        // ── ATTEMPT 1: Gemini AI ──
        if (window.UEM_CONFIG.geminiApiKey) {
            try {
                responseText = await window.ai.askGemini(text, chatHistory.slice(-14), lang);
                matched = true;
                usedAI  = true;
                window.db.logQuery(text.substring(0, 30), true, "ai");
            } catch (aiErr) {
                if (aiErr.message !== "NO_API_KEY") {
                    console.warn("Gemini failed, using keyword fallback:", aiErr.message);
                    window.toast.show("AI unavailable, using local responses.", "info");
                }
            }
        }

        // ── ATTEMPT 2: Keyword Matching ──
        if (!responseText) {
            const customKb       = await window.db.getBotResponses();
            const activeResponses = customKb[lang] || {};
            const cleanLower      = text.toLowerCase().trim();

            // Multi-turn context memory lookup for pronoun queries
            const pronouns = ["it", "that", "this", "them", "they", "its", "there", "details", "eligibility", "fees", "rules", "schedule"];
            const isFollowUp = pronouns.some(p => cleanLower.split(/\s+/).includes(p)) || cleanLower.length < 15;
            
            let queryText = cleanLower;
            if (isFollowUp && window.chatSessionTopic) {
                queryText = `${window.chatSessionTopic} ${cleanLower}`;
            }

            let bestKey     = null;
            let longestMatch = 0;

            for (const key in activeResponses) {
                if (queryText.includes(key) && key.length > longestMatch) {
                    bestKey      = key;
                    longestMatch = key.length;
                }
            }

            if (bestKey) {
                responseText = activeResponses[bestKey];
                matched      = true;
                window.chatSessionTopic = bestKey; // Set current session topic context
                window.db.logQuery(bestKey, true, "text");
            } else {
                responseText = activeResponses["default"] || (lang === "hi" ? "क्षमा करें, मुझे समझ नहीं आया।" : "I'm sorry, I couldn't understand that. Try asking about fees, hostel, admissions, or placements!");
                window.db.logQuery(text.substring(0, 30), false, "text");
            }
        }

        const latency = usedAI ? 200 : 600 + Math.random() * 500;

        setTimeout(() => {
            removeTypingIndicator();
            const botTime = getTimeStamp();

            window.renderMessageBubble(responseText, "bot", usedAI ? null : botTime);
            chatHistory.push({ text: responseText, sender: "bot", time: botTime });
            window.db.saveChatHistory(chatHistory);

            window.tts.speak(responseText, lang);
            window.setAvatarThinking(false);
            if (usedAI) window.setAvatarEmotion("happy");
        }, latency);

    } catch (e) {
        removeTypingIndicator();
        window.setAvatarThinking(false);
        window.toast.show("Message delivery error.", "error");
    }
};

function showTypingIndicator() {
    const messagesDiv = document.getElementById("chatMessages");
    if (!messagesDiv || document.getElementById("typingRow")) return;

    const row = document.createElement("div");
    row.className = "message-row bot-row";
    row.id = "typingRow";

    const avatar = document.createElement("div");
    avatar.className = "msg-avatar";
    avatar.textContent = "🤖";

    const bubble = document.createElement("div");
    bubble.className = "typing-bubble";
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement("div");
        dot.className = "typing-dot";
        bubble.appendChild(dot);
    }

    // Show AI thinking label if Gemini is active
    if (window.UEM_CONFIG.geminiApiKey) {
        const label = document.createElement("span");
        label.className = "ai-thinking-label";
        label.textContent = "✨ AI thinking...";
        bubble.appendChild(label);
    }

    row.appendChild(avatar);
    row.appendChild(bubble);
    messagesDiv.appendChild(row);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById("typingRow");
    if (indicator) indicator.remove();
}

// ============================================================
//  4. SPEECH CONTROLS
// ============================================================

window.handleVoiceToggle = function() {
    const active = window.tts.toggle();
    const speakerBtn = document.getElementById("speakerToggleBtn");

    if (speakerBtn) {
        if (active) {
            speakerBtn.classList.add("active");
            speakerBtn.innerHTML = "🔊";
            window.toast.show(window.getLanguage() === "hi" ? "आवाज आउटपुट चालू! 🔊" : "Speech output active! 🔊", "info");
        } else {
            speakerBtn.classList.remove("active");
            speakerBtn.innerHTML = "🔇";
            window.toast.show(window.getLanguage() === "hi" ? "आवाज आउटपुट बंद! 🔇" : "Speech output muted! 🔇", "info");
        }
    }
};

window.handleMicrophoneClick = function() {
    const lang = window.getLanguage();
    window.safeUIAction(() => window.startListening(lang), "Microphone access blocked or API unsupported.");
};

window.handleCancelListening = function() { window.stopListening(); };

// ============================================================
//  5. FILE ATTACHMENTS (PDF.js + Simulated Upload)
// ============================================================

window.triggerFileUploadSelector = function() {
    const hiddenInput = document.createElement("input");
    hiddenInput.type   = "file";
    hiddenInput.accept = ".pdf,.docx,.xlsx,.txt,.jpg,.png";
    hiddenInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) window.handleFileUpload(file);
    };
    hiddenInput.click();
};

window.handleFileUpload = function(file) {
    const name   = file.name;
    const sizeKb = Math.round(file.size / 1024);

    if (sizeKb > 5120) {
        window.toast.show(window.getLanguage() === "hi" ? "फ़ाइल बहुत बड़ी है! अधिकतम 5MB।" : "File size exceeded! Max 5MB.", "error");
        return;
    }

    const fileId = "file-" + Date.now();
    const time   = getTimeStamp();

    renderUploadedFileCard(name, `${sizeKb} KB`, fileId, "user", time, false, file);
    chatHistory.push({ isFileCard: true, fileName: name, fileSize: `${sizeKb} KB`, id: fileId, sender: "user", time });
    window.db.saveChatHistory(chatHistory);

    simulateFileStreamProgress(fileId, name, sizeKb, file);
};

function renderUploadedFileCard(name, size, id, sender, time, alreadyLoaded = false, fileObj = null) {
    const messagesDiv = document.getElementById("chatMessages");
    if (!messagesDiv) return;

    const isUser = sender === "user";
    const row    = document.createElement("div");
    row.className = `message-row ${isUser ? 'user-row' : 'bot-row'}`;
    row.id = `card-row-${id}`;

    const avatar = document.createElement("div");
    avatar.className = "msg-avatar";
    avatar.textContent = isUser ? "🧑" : "🤖";

    const content = document.createElement("div");
    content.className = "msg-content";

    let fileIcon = "📎";
    if (name.endsWith(".pdf"))                          fileIcon = "📕";
    if (name.endsWith(".docx") || name.endsWith(".txt")) fileIcon = "📘";
    if (name.endsWith(".xlsx"))                          fileIcon = "📗";
    if (name.endsWith(".jpg")  || name.endsWith(".png")) fileIcon = "🖼️";

    const card = document.createElement("div");
    card.className = "file-card";
    const isHi = window.getLanguage() === "hi";

    card.innerHTML = `
        <div class="file-info">
            <span class="file-icon">${fileIcon}</span>
            <div class="file-details">
                <span class="file-name" title="${name}">${name}</span>
                <span class="file-size">${size}</span>
            </div>
        </div>
        ${alreadyLoaded ? '' : `
            <div class="file-progress-bar" id="progress-bar-${id}">
                <div class="file-progress-fill" id="progress-fill-${id}"></div>
            </div>
        `}
        <div class="file-actions" id="actions-${id}" style="display: ${alreadyLoaded ? 'flex' : 'none'};">
            <button class="file-action-btn summarize-btn" data-id="${id}" data-name="${name}" data-size="${size}">
                ${isHi ? '✨ एआई सारांश' : '🤖 AI Summarize'}
            </button>
        </div>
    `;

    const timestamp = document.createElement("div");
    timestamp.className = "msg-time";
    timestamp.textContent = time;

    content.appendChild(card);
    content.appendChild(timestamp);

    if (isUser) { row.appendChild(content); row.appendChild(avatar); }
    else        { row.appendChild(avatar);  row.appendChild(content); }

    messagesDiv.appendChild(row);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    if (alreadyLoaded) {
        const btn = card.querySelector(".summarize-btn");
        if (btn) btn.onclick = () => handleAiSummarizeDocument(name, size, null);
    }
}

function simulateFileStreamProgress(id, name, sizeKb, fileObj = null) {
    const fill    = document.getElementById(`progress-fill-${id}`);
    const bar     = document.getElementById(`progress-bar-${id}`);
    const actions = document.getElementById(`actions-${id}`);

    let percent = 0;
    const interval = setInterval(() => {
        percent += 10;
        if (fill) fill.style.width = `${percent}%`;

        if (percent >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                if (bar) bar.style.display = "none";
                if (actions) {
                    actions.style.display = "flex";
                    const btn = actions.querySelector(".summarize-btn");
                    if (btn) btn.onclick = () => handleAiSummarizeDocument(name, sizeKb, fileObj);
                }
                window.toast.show(window.getLanguage() === "hi" ? "फ़ाइल अपलोड सफल! ✅" : "File upload successful! ✅", "success");
            }, 300);
        }
    }, 120);
}

async function handleAiSummarizeDocument(name, sizeKb, fileObj = null) {
    const lang   = window.getLanguage();
    const body   = document.getElementById("docSummaryBody");
    const isHi   = lang === "hi";

    body.innerHTML = `
        <div style="text-align:center; padding: 40px 0;">
            <div class="typing-dot" style="display:inline-block; float:none; margin:0 3px;"></div>
            <div class="typing-dot" style="display:inline-block; float:none; margin:0 3px; animation-delay:0.2s;"></div>
            <div class="typing-dot" style="display:inline-block; float:none; margin:0 3px; animation-delay:0.4s;"></div>
            <p style="margin-top:16px; color:var(--text-secondary);">
                ${isHi ? 'एआई दस्तावेज़ का विश्लेषण कर रहा है...' : 'AI is analyzing document...'}
                ${window.UEM_CONFIG.geminiApiKey ? '<br><small style="color:var(--accent)">✨ Using Gemini AI</small>' : ''}
            </p>
        </div>
    `;

    document.getElementById("docSummaryModal").classList.add("open");

    await window.safeUIAction(async () => {
        const summary = await window.ai.summarizeDocument(name, sizeKb, lang, fileObj);

        body.innerHTML = `
            <h4 style="margin-bottom:12px; font-family:var(--font-heading);">
                ${isHi ? 'एआई सारांश परिणाम' : 'AI Summarization Result'}
            </h4>
            <div class="message bot-message" style="border-radius:12px; padding:16px; line-height:1.6; word-break:break-word;">
                ${summary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}
            </div>
        `;
    }, "Document AI analysis failed.");
}

// ============================================================
//  6. TRANSCRIPT SUMMARIZATION
// ============================================================

window.summarizeActiveChatTranscript = async function() {
    const lang = window.getLanguage();
    const isHi = lang === "hi";

    if (chatHistory.length === 0) {
        window.toast.show(isHi ? "सारांश के लिए कोई चैट नहीं मिली।" : "No conversation logs found to summarize.", "info");
        return;
    }

    const body = document.getElementById("docSummaryBody");
    body.innerHTML = `
        <div style="text-align:center; padding: 40px 0;">
            <div class="typing-dot" style="display:inline-block; float:none; margin:0 3px;"></div>
            <div class="typing-dot" style="display:inline-block; float:none; margin:0 3px; animation-delay:0.2s;"></div>
            <div class="typing-dot" style="display:inline-block; float:none; margin:0 3px; animation-delay:0.4s;"></div>
            <p style="margin-top:16px; color:var(--text-secondary);">
                ${isHi ? 'संवाद इतिहास का विश्लेषण...' : 'Synthesizing dialogue history...'}
            </p>
        </div>
    `;

    document.getElementById("docSummaryModal").classList.add("open");

    await window.safeUIAction(async () => {
        const summary = await window.ai.summarizeChat(chatHistory.filter(m => !m.isFileCard), lang);

        body.innerHTML = `
            <h4 style="margin-bottom:12px; font-family:var(--font-heading);">
                ${isHi ? 'संवाद सारांश' : 'Dialogue Synthesis Result'}
            </h4>
            <div class="message bot-message" style="border-radius:12px; padding:16px; line-height:1.6; word-break:break-word;">
                ${summary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}
            </div>
        `;
    }, "Dialog synthesis failed.");
};

// ============================================================
//  7. CHAT EXPORTS & CHIPS MODULES (NEW)
// ============================================================

window.renderChatQuickReplyChips = function() {
    const container = document.getElementById("chatQuickChips");
    if (!container) return;
    
    const isHi = window.getLanguage() === "hi";
    const chips = isHi
        ? [
            { text: "📝 प्रवेश", val: "admissions" },
            { text: "💰 फीस", val: "fees" },
            { text: "🏠 हॉस्टल", val: "hostel" },
            { text: "🎓 प्लेसमेंट", val: "placement" },
            { text: "📚 पुस्तकालय", val: "library" }
          ]
        : [
            { text: "Admissions 📝", val: "admissions" },
            { text: "Fees 💰", val: "fees" },
            { text: "Hostel 🏠", val: "hostel" },
            { text: "Placements 🎓", val: "placement" },
            { text: "Library 📚", val: "library" }
          ];
    
    container.innerHTML = "";
    chips.forEach(c => {
        const btn = document.createElement("button");
        btn.className = "chat-quick-chip";
        btn.textContent = c.text;
        btn.onclick = () => {
            document.getElementById("userInput").value = c.val;
            window.sendMessage();
        };
        container.appendChild(btn);
    });
};

window.toggleChatExportDropdown = function() {
    const confirmed = confirm("Do you want to export chat as PDF? (Cancel to export as TXT)");
    if (confirmed) {
        window.exportChatHistoryPdf();
    } else {
        window.exportChatHistoryTxt();
    }
};

window.exportChatHistoryTxt = function() {
    if (chatHistory.length === 0) {
        window.toast.show("No chat history to export.", "info");
        return;
    }
    let txt = "UEM Chatbot Assistant - Transcript Export\n";
    txt += "Exported on: " + new Date().toLocaleString() + "\n\n";
    chatHistory.forEach(m => {
        if (m.isFileCard) {
            txt += `[${m.time}] ${m.sender.toUpperCase()}: [Uploaded File: ${m.fileName}]\n`;
        } else {
            txt += `[${m.time}] ${m.sender.toUpperCase()}: ${m.text}\n`;
        }
    });
    
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `uem_chat_transcript_${Date.now()}.txt`;
    link.click();
    window.toast.show("Chat history exported as TXT!", "success");
};

window.exportChatHistoryPdf = function() {
    if (chatHistory.length === 0) {
        window.toast.show("No chat history to export.", "info");
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(0, 51, 102);
        doc.text("UEM Virtual Assistant - Chat Transcript", 15, 20);
        
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text("Exported on: " + new Date().toLocaleString(), 15, 26);
        
        doc.line(15, 30, 195, 30);
        
        let y = 38;
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        chatHistory.forEach((m, idx) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            
            const timeStr = m.time || "";
            const senderStr = m.sender === "user" ? "Student" : "Bot";
            const textStr = m.isFileCard ? `[File Uploaded: ${m.fileName}]` : m.text;
            
            doc.setFont("Helvetica", "bold");
            if (m.sender === "user") {
                doc.setTextColor(0, 68, 255);
            } else {
                doc.setTextColor(139, 92, 246);
            }
            doc.text(`[${timeStr}] ${senderStr}:`, 15, y);
            
            doc.setFont("Helvetica", "normal");
            doc.setTextColor(50, 50, 50);
            
            const splitText = doc.splitTextToSize(textStr, 135);
            doc.text(splitText, 50, y);
            
            y += (splitText.length * 5) + 3;
        });
        
        doc.save(`uem_chat_transcript_${Date.now()}.pdf`);
        window.toast.show("Chat history exported as PDF!", "success");
    } catch (err) {
        console.error("PDF export failed:", err);
        window.toast.show("PDF export failed: " + err.message, "error");
    }
};

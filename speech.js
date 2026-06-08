/* ============================================================
   SPEECH RECOGNITION & SYNTHESIS (js/speech.js)
   ============================================================ */

let recognition = null;
let ttsEnabled = false;
let activeUtterance = null;

try {
    ttsEnabled = sessionStorage.getItem("uem_tts_enabled") === "true";
} catch (e) {}

// ============================================================
//  1. VOICE INPUT (SPEECH RECOGNITION)
// ============================================================

window.initSpeechRecognition = function(onResult, onStatusChange, onError) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.warn("Speech recognition is not supported in this browser.");
        return false;
    }
    
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
        if (onStatusChange) onStatusChange(true);
    };
    
    recognition.onend = () => {
        if (onStatusChange) onStatusChange(false);
    };
    
    recognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        if (onError) onError(event.error);
    };
    
    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        if (onResult) onResult(text);
    };
    
    return true;
};

window.startListening = function(lang = "en") {
    if (!recognition) {
        throw new Error("Speech recognition is unsupported or uninitialized.");
    }
    try {
        recognition.lang = lang === "hi" ? "hi-IN" : "en-IN";
        recognition.start();
        return true;
    } catch (e) {
        console.error("Failed to start Speech Recognition:", e);
        recognition.stop();
        return false;
    }
};

window.stopListening = function() {
    if (recognition) {
        try {
            recognition.stop();
        } catch (e) {}
    }
};

// ============================================================
//  2. SPEECH OUTPUT (TEXT TO SPEECH)
// ============================================================

window.tts = {
    isEnabled: () => ttsEnabled,
    
    toggle: (state) => {
        ttsEnabled = state !== undefined ? state : !ttsEnabled;
        try {
            sessionStorage.setItem("uem_tts_enabled", ttsEnabled);
        } catch (e) {}
        if (!ttsEnabled) {
            window.tts.stop();
        }
        return ttsEnabled;
    },
    
    speak: (text, lang = "en") => {
        if (!ttsEnabled || !window.speechSynthesis) return;
        
        window.tts.stop();
        
        const cleanText = text
            .replace(/<[^>]*>/g, '')
            .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '')
            .trim();
            
        if (!cleanText) return;
        
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = lang === "hi" ? "hi-IN" : "en-IN";
        
        const voices = window.speechSynthesis.getVoices();
        let voice = null;
        
        if (lang === "hi") {
            voice = voices.find(v => v.lang.includes("hi-IN") || v.lang.includes("hi"));
        } else {
            voice = voices.find(v => v.lang.includes("en-IN") || v.lang.includes("en-GB") || v.lang.includes("en-US"));
        }
        
        if (voice) {
            utterance.voice = voice;
        }
        
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        activeUtterance = utterance;
        window.speechSynthesis.speak(utterance);
    },
    
    stop: () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            activeUtterance = null;
        }
    }
};

if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {};
}

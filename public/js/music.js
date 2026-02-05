// ===== OPTIMIZED SEAMLESS MUSIC (ZERO DELAY) =====

// 1. Create Audio Object IMMEDIATELY (Before DOM)
if (!window.bgMusic) {
    window.bgMusic = new Audio("asset/music/noi-nay-co-anh.mp3");
    window.bgMusic.loop = true;
    window.bgMusic.volume = 0.6;
    window.bgMusic.preload = "auto";
    
    // Low-latency setting if supported
    if(window.bgMusic.mozPreservesPitch !== undefined) window.bgMusic.mozPreservesPitch = false;
}

const audio = window.bgMusic;

// 2. Play Logic (Self-Executing)
(function fastPlay() {
    if (window.musicInitialized) return;
    window.musicInitialized = true;

    // Restore state
    const storedTime = parseFloat(sessionStorage.getItem("music_time")) || 0;
    const shouldPlay = sessionStorage.getItem("music_playing") !== "false";

    // Immediate Seek
    if (storedTime > 0) {
        audio.currentTime = storedTime;
    }

    // Attempt Play
    if (shouldPlay) {
        const p = audio.play();
        if (p) {
            p.catch(e => {
                console.log("Autoplay blocked, waiting for interaction.");
                const forcePlay = () => {
                    audio.play();
                    sessionStorage.setItem("music_playing", "true");
                    if (window.updateMusicUI) window.updateMusicUI(true);
                    ['click', 'touchstart'].forEach(ev => document.removeEventListener(ev, forcePlay));
                };
                ['click', 'touchstart'].forEach(ev => document.addEventListener(ev, forcePlay));
            });
        }
    }

    // State Saver
    const save = () => {
        sessionStorage.setItem("music_time", audio.currentTime);
        sessionStorage.setItem("music_playing", !audio.paused);
    };
    window.addEventListener("borderwidth", save); // Fallback
    window.addEventListener("beforeunload", save);
    window.addEventListener("pagehide", save);
})();

// 3. UI Helpers
window.toggleMusic = function() {
    if (audio.paused) {
        audio.play();
        sessionStorage.setItem("music_playing", "true");
        if (window.updateMusicUI) window.updateMusicUI(true);
    } else {
        audio.pause();
        sessionStorage.setItem("music_playing", "false");
        if (window.updateMusicUI) window.updateMusicUI(false);
    }
};

window.updateMusicUI = function(isPlaying) {
    const btn = document.getElementById("music-btn");
    if (btn) {
        btn.innerHTML = isPlaying 
            ? `⏸ <span class="hidden md:inline">Nhạc</span>` 
            : `▶ <span class="hidden md:inline">Nhạc</span>`;
    }
};

// 4. Dom Ready Validations (Update UI)
// We use 'readystatechange' to catch it earlier than DOMContentLoaded if possible, or fallback
document.addEventListener('readystatechange', () => {
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        if (window.updateMusicUI) window.updateMusicUI(!audio.paused);
    }
});
document.addEventListener('DOMContentLoaded', () => {
    if (window.updateMusicUI) window.updateMusicUI(!audio.paused);
});

// Alias for old calls (backwards compatibility)
function initMusic() { /* No-op, already running */ }

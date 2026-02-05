// ===== OPTIMIZED SEAMLESS MUSIC =====
// Create Audio object immediately (don't wait for DOM)
if (!window.bgMusic) {
    window.bgMusic = new Audio("asset/music/noi-nay-co-anh.mp3");
    window.bgMusic.loop = true;
    window.bgMusic.volume = 0.6;
    window.bgMusic.preload = "auto";
}

// State Management
const audio = window.bgMusic;

function initMusic() {
  // Check if already handled to prevent double-init issues
  if (window.musicInitialized) return;
  window.musicInitialized = true;

  // Restore State immediately
  const storedTime = parseFloat(sessionStorage.getItem("music_time")) || 0;
  // Default to TRUE (Auto Play).
  const shouldPlay = sessionStorage.getItem("music_playing") !== "false";

  // Immediate Seek (Attempt minimal delay)
  // We set currentTime even before metadata if possible, standard HTML5 Audio supports this.
  if (storedTime > 0) {
      audio.currentTime = storedTime;
  }

  // Handle Playback
  if (shouldPlay) {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            // Success
            if (typeof updateMusicUI === 'function') updateMusicUI(true);
        }).catch((error) => {
            console.log("Autoplay blocked, waiting for interaction...");
            const resume = () => {
                audio.play();
                sessionStorage.setItem("music_playing", "true");
                if (typeof updateMusicUI === 'function') updateMusicUI(true);
                document.removeEventListener("click", resume);
                document.removeEventListener("touchstart", resume);
            };
            document.addEventListener("click", resume);
            document.addEventListener("touchstart", resume);
        });
    }
  }

  // Update UI if button exists
  if (typeof updateMusicUI === 'function') updateMusicUI(!audio.paused);

  // Save loop
  const saveState = () => {
    sessionStorage.setItem("music_time", audio.currentTime);
    sessionStorage.setItem("music_playing", !audio.paused);
  };
  window.addEventListener("beforeunload", saveState);
  window.addEventListener("pagehide", saveState);
}

// Global Toggle Function
function toggleMusic() {
  if (audio.paused) {
    audio.play();
    sessionStorage.setItem("music_playing", "true");
    if (typeof updateMusicUI === 'function') updateMusicUI(true);
  } else {
    audio.pause();
    sessionStorage.setItem("music_playing", "false");
    if (typeof updateMusicUI === 'function') updateMusicUI(false);
  }
}

function updateMusicUI(isPlaying) {
  const btn = document.getElementById("music-btn");
  if (btn) {
      btn.innerHTML = isPlaying ? `⏸ <span class="hidden md:inline">Nhạc</span>` : `▶ <span class="hidden md:inline">Nhạc</span>`;
  }
}

initMusic();

document.addEventListener('DOMContentLoaded', () => {
    if (typeof updateMusicUI === 'function' && window.bgMusic) {
        updateMusicUI(!window.bgMusic.paused);
    }

});

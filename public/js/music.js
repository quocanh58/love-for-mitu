let music = null;
let isPlaying = false;

function initMusic() {
  if (music) return;

  music = new Audio("asset/music/noi-nay-co-anh.mp3");
  music.loop = true;
  music.volume = 0.7;

  // 1. Tạo hoặc lấy Audio Element
  if (!document.getElementById("bg-music")) {
    bgMusic = document.createElement("audio");
    bgMusic.id = "bg-music";
    bgMusic.src = "asset/music/noi-nay-co-anh.mp3"; // Đường dẫn nhạc
    bgMusic.loop = true;
    bgMusic.volume = 0.6; // Âm lượng vừa phải
    document.body.appendChild(bgMusic);
  } else {
    bgMusic = document.getElementById("bg-music");
  }

  // 2. Khôi phục trạng thái từ Session (để không bị ngắt quãng khi chuyển trang)
  const storedTime = parseFloat(sessionStorage.getItem("music_time")) || 0;
  // Default to TRUE (Auto Play) if not set. Only stop if user explicitly paused ('false').
  const shouldPlay = sessionStorage.getItem("music_playing") !== "false";

  // Set tua nhạc đến đúng đoạn cũ
  // Kiểm tra nếu savedTime hợp lệ (tránh NaN)
  if (!isNaN(storedTime)) {
      bgMusic.currentTime = storedTime;
  }

  // 3. Xử lý UI nút nhạc
  // Mặc định hiển thị là Đang Phát (để khớp với logic autoplay)
  updateMusicUI(shouldPlay);

  // 4. Tự động phát
  if (shouldPlay) {
    bgMusic.play().catch((error) => {
      console.log("Autoplay bị chặn, chờ tương tác...");
      // Nếu browser chặn autoplay, chờ click đầu tiên để phát
      const resumeAudio = () => {
        bgMusic.play();
        updateMusicUI(true);
        // Save state as true
        sessionStorage.setItem("music_playing", "true");
        
        document.removeEventListener("click", resumeAudio);
        document.removeEventListener("touchstart", resumeAudio);
      };
      document.addEventListener("click", resumeAudio);
      document.addEventListener("touchstart", resumeAudio);
    });
  }

  // 5. Lưu thời gian khi rời trang (unload)
  // 5. Lưu thời gian khi rời trang (unload)
  const saveState = () => {
    if(bgMusic) {
        sessionStorage.setItem("music_time", bgMusic.currentTime);
        sessionStorage.setItem("music_playing", !bgMusic.paused);
    }
  };
  window.addEventListener("beforeunload", saveState);
  window.addEventListener("pagehide", saveState);
}

function toggleMusic() {
  if (bgMusic.paused) {
    bgMusic.play();
    sessionStorage.setItem("music_playing", "true");
    updateMusicUI(true);
  } else {
    bgMusic.pause();
    sessionStorage.setItem("music_playing", "false");
    updateMusicUI(false);
  }
}

function updateMusicUI(isPlaying) {
  const btn = document.getElementById("music-btn");
  if (!btn) return;
  btn.innerText = playing ? "⏸ Nhạc" : "▶ Nhạc";
}

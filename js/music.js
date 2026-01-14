let music = null;
let isPlaying = false;

function initMusic() {
  if (music) return;

  music = new Audio("asset/music/noi-nay-co-anh.mp3");
  music.loop = true;
  music.volume = 0.7;

  const shouldPlay = localStorage.getItem("music_playing") === "true";

  if (shouldPlay) {
    music
      .play()
      .then(() => {
        isPlaying = true;
        updateMusicButton(true);
      })
      .catch(() => {
        updateMusicButton(false);
      });
  } else {
    updateMusicButton(false);
  }
}

function toggleMusic() {
  if (!music) initMusic();

  if (isPlaying) {
    music.pause();
    isPlaying = false;
    localStorage.setItem("music_playing", "false");
    updateMusicButton(false);
  } else {
    music
      .play()
      .then(() => {
        isPlaying = true;
        localStorage.setItem("music_playing", "true");
        updateMusicButton(true);
      })
      .catch(() => {});
  }
}

function updateMusicButton(playing) {
  const btn = document.getElementById("music-btn");
  if (!btn) return;
  btn.innerText = playing ? "⏸ Nhạc" : "▶ Nhạc";
}

/* ===== MUSIC ===== */
const audio = new Audio("assets/music/noi-nay-co-anh.mp3");
audio.loop = true;
audio.volume = 0.6;

// function startMusic() {
//   audio.play();
//   document.getElementById("music-btn").classList.add("hidden");
// }

/* ===== HEART FLY ===== */
const heartContainer = document.getElementById("heart-container");

function createHeart() {
  const heart = document.createElement("div");
  heart.innerText = "💗";
  heart.className = "heart";
  heart.style.left = Math.random() * 100 + "vw";
  heart.style.animationDuration = 3 + Math.random() * 2 + "s";
  heartContainer.appendChild(heart);

  setTimeout(() => heart.remove(), 5000);
}

setInterval(createHeart, 300);

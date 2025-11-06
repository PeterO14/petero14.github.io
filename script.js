const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Simple scaling for smaller screens (optional)
function fitCanvasToWindow() {
  const maxWidth = Math.min(window.innerWidth - 20, 800);
  const aspect = canvas.width / canvas.height;
  canvas.style.width = maxWidth + "px";
  canvas.style.height = Math.round(maxWidth / aspect) + "px";
}
fitCanvasToWindow();
window.addEventListener("resize", fitCanvasToWindow);

let player = { x: 50, y: 250, size: 20, vy: 0, jump: -9, gravity: 0.5, grounded: true };
let obstacles = [{ x: 600, width: 20, height: 30 }];
let speed = 4;

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.fillStyle = "skyblue";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Ground
  ctx.fillStyle = "green";
  ctx.fillRect(0, 270, canvas.width, 30);

  // Player
  ctx.fillStyle = "red";
  ctx.fillRect(player.x, player.y, player.size, player.size);

  // Obstacles
  ctx.fillStyle = "black";
  for (let obs of obstacles) {
    obs.x -= speed;
    ctx.fillRect(obs.x, 270 - obs.height, obs.width, obs.height);
    if (obs.x + obs.width < 0) obs.x = 600 + Math.random() * 400;
  }

  // Physics
  player.vy += player.gravity;
  player.y += player.vy;
  if (player.y + player.size >= 270) {
    player.y = 250;
    player.vy = 0;
    player.grounded = true;
  }

  // Collision detection
  for (let obs of obstacles) {
    if (
      player.x < obs.x + obs.width &&
      player.x + player.size > obs.x &&
      player.y + player.size > 270 - obs.height
    ) {
      alert("Game Over!");
      document.location.reload();
    }
  }

  requestAnimationFrame(draw);
}

function jump() {
  if (player.grounded) {
    player.vy = player.jump
    player.grounded = false;
  }
}

// Spacebar jump
document.addEventListener("keydown", e => {
  if (e.code === "Space") {
    e.preventDefault();
    jump();
  }
});

// Works on laptops, phones, tablets — covers all input types
function handleInput(e) {
  e.preventDefault();
  jump();
}

// Listen on the entire document
document.addEventListener("mousedown", handleInput);
document.addEventListener("touchstart", handleInput, { passive: false });
document.addEventListener("pointerdown", handleInput);

draw();

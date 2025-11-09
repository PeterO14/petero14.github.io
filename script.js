const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const gameOverScreen = document.getElementById("gameOverScreen");
const playAgainButton = document.getElementById("playAgainButton");

let gameStarted = false;
let score = 0;

// Constants
const GRAVITY = 0.5;
const JUMP_VELOCITY = -9;
const PLAYER_SIZE = 20;
const GROUND_Y = 270;
const OBSTACLE_SPEED = 4;

// Scaling for smaller screens
function fitCanvasToWindow() {
  const maxWidth = Math.min(window.innerWidth - 20, 800);
  const aspect = canvas.width / canvas.height;
  canvas.style.width = maxWidth + "px";
  canvas.style.height = Math.round(maxWidth / aspect) + "px";
}
fitCanvasToWindow();
window.addEventListener("resize", fitCanvasToWindow);

// Player and obstacles
let player = { x: 50, y: GROUND_Y - PLAYER_SIZE, size: PLAYER_SIZE, vy: 0, grounded: true };
let obstacles = [{ x: 600, width: 20, height: -10 }];


// Game loop
function draw() {
  if (!gameStarted) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawPlayer();
  drawObstacles();
  updatePhysics();
  checkCollisions();
  updateScore();  
  requestAnimationFrame(draw);
}

// Draw functions
function drawBackground() {
  ctx.fillStyle = "skyblue";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "green";
  ctx.fillRect(0, GROUND_Y, canvas.width, 30);
}

function drawPlayer() {
  ctx.fillStyle = "red";
  ctx.fillRect(player.x, player.y, player.size, player.size);
}

function drawObstacles() {
  ctx.fillStyle = "black";
  for (let obs of obstacles) {
    obs.x -= OBSTACLE_SPEED;
    ctx.fillRect(obs.x, GROUND_Y - obs.height, obs.width, obs.height);
    if (obs.x + obs.width < 0) obs.x = 600 + Math.random() * 400;
  }
}

// Physics and collision
function updatePhysics() {
  player.vy += GRAVITY;
  player.y += player.vy;
  if (player.y + player.size >= GROUND_Y) {
    player.y = GROUND_Y - PLAYER_SIZE;
    player.vy = 0;
    player.grounded = true;
  }
}

function checkCollisions() {
  for (let obs of obstacles) {
    if (
      player.x < obs.x + obs.width &&
      player.x + player.size > obs.x &&
      player.y + player.size > GROUND_Y - obs.height
    ) {
      gameOver();
    }
  }
}

// Update the leadership function
function updateLeaderboard() {
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  leaderboard.push(score);
  leaderboard.sort((a, b) => b - a);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard.slice(0, 5)));

  const leaderboardList = document.getElementById("leaderboardList");
  leaderboardList.innerHTML = "";
  leaderboard.forEach((s) => {
    const li = document.createElement("li");
    li.textContent = s;
    leaderboardList.appendChild(li);
  });
}

// Game over function
function gameOver() {
  gameStarted = false;
  gameOverScreen.style.display = "block";
  startButton.style.display = "none";

  // Display the final score
  document.getElementById("finalScore").textContent = score;

  // Update and display leaderboard
  updateLeaderboard();
}

// Play again button handler
playAgainButton.addEventListener("click", () => {
  resetGame();
});
  
// Reset game function
function resetGame() {
  player = { x: 50, y: GROUND_Y - PLAYER_SIZE, size: PLAYER_SIZE, vy: 0, grounded: true };
  obstacles = [{ x: 600, width: 20, height: 20 }];
  gameOverScreen.style.display = "none";
  startButton.style.display = "block";
  initializeGame();
  gameStarted = true;
}

// Jump function
function jump() {
  if (player.grounded) {
    player.vy = JUMP_VELOCITY
    player.grounded = false;
  }
}

function updateScore() {
  score++;
}

// Input handling
function handleInput(e) {
  if (!gameStarted) return;
  if (e.target === canvas || e.type === 'keydown') {
    e.preventDefault();
    jump();
  }
}

// Event listeners
document.addEventListener("mousedown", handleInput);
document.addEventListener("touchstart", handleInput, { passive: false });
document.addEventListener("pointerdown", handleInput);
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    handleInput(e);
  }
});

// Initial game state
function initializeGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawPlayer();
}

// Start button with click handler
startButton.addEventListener("click", () => {
  gameStarted = true;
  startButton.style.display = "none";
  draw();
});

// Initialize the game state
initializeGame();
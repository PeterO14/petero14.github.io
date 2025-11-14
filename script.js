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
const PLAYER_SPEED = 4;
const LEVEL_END_X = 2000;

// Scaling for smaller screens
function fitCanvasToWindow() {
    const maxWidth = Math.min(window.innerWidth - 100, 800);
    const aspect = canvas.width / canvas.height;
    canvas.style.width = maxWidth + "px";
    canvas.style.height = Math.round(maxWidth / aspect) + "px";
}
fitCanvasToWindow();
window.addEventListener("resize", fitCanvasToWindow);

// Player, camera, and obstacles
let cameraX = 0;
let player = {
    x: 50,
    y: GROUND_Y - PLAYER_SIZE,
    size: PLAYER_SIZE,
    vy: 0,
    grounded: true,
    jumpsRemaining: 2
};

let obstacles = [
    { x: 300, width: 20, height: 40 },
    { x: 700, width: 20, height: 80 },
    { x: 1200, width: 20, height: 40 }
];

// Main game loop
function draw() {
    if (!gameStarted) return;

    if (player.x >= LEVEL_END_X) {
        gameOver();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    updatePlayer();
    updatePhysics();
    updateCamera();

    drawBackground();
    drawObstacles();
    drawPlayer();

    checkCollisions();
    updateScore();

    requestAnimationFrame(draw);
}

// Camera
function updateCamera() {
    cameraX = player.x - 100;
}

// Player movement
function updatePlayer() {
    player.x += PLAYER_SPEED;
}

// Background
function drawBackground() {
    ctx.fillStyle = "skyblue";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "green";
    ctx.fillRect(0, canvas.height-30, canvas.width, 30);
}

// Draw player
function drawPlayer() {
    ctx.fillStyle = "red";
    ctx.fillRect(player.x - cameraX, player.y, player.size, player.size);
}

// Draw obstacles
function drawObstacles() {
    ctx.fillStyle = "black";
    for (let obs of obstacles) {
        ctx.fillRect(
            obs.x - cameraX,
            GROUND_Y - obs.height,
            obs.width,
            obs.height
        );
    }
}

// Physics
function updatePhysics() {
    player.vy += GRAVITY;
    player.y += player.vy;
    
    if (player.y + player.size >= GROUND_Y) {
        player.y = GROUND_Y - PLAYER_SIZE;
        player.vy = 0;
        player.grounded = true;
        player.jumpsRemaining = 2;
    }
}

// Collision detection
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

// Game over
function gameOver() {
    gameStarted = false;
    gameOverScreen.style.display = "block";
    startButton.style.display = "none";
    document.getElementById("finalScore").textContent = score;
}
  
// Reset
function resetGame() {
    score = 0;
    player = {
        x: 50,
        y: GROUND_Y - PLAYER_SIZE,
        size: PLAYER_SIZE,
        vy: 0,
        grounded: true,
        jumpsRemaining: 2
    };
    cameraX = 0;

    obstacles = [
        { x: 300, width: 20, height: 40 },
        { x: 700, width: 20, height: 80 },
        { x: 1200, width: 20, height: 40 }
    ];    

    gameOverScreen.style.display = "none";
    startButton.style.display = "block";
    
    gameStarted = true;
    draw();
}

// Double jump
function jump() {
    if (player.jumpsRemaining > 0) {
        player.vy = JUMP_VELOCITY
        player.grounded = false;
        player.jumpsRemaining--;
    }
}

// Score
function updateScore() {
  score++;
}

// Input
function handleInput(e) {
    if (!gameStarted) return;
    jump();
}

document.addEventListener("mousedown", handleInput);
document.addEventListener("touchstart", handleInput, { passive: false });
document.addEventListener("pointerdown", handleInput);
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") handleInput(e);
});

// Initialize
function initializeGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawPlayer();
}

startButton.addEventListener("click", () => {
    score = 0;
    gameStarted = true;
    startButton.style.display = "none";
    draw();
});

playAgainButton.addEventListener("click", resetGame);

initializeGame();

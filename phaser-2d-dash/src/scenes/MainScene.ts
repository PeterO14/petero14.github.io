import Phaser from "phaser";

type Obstacle = { x: number; width: number; height: number; sprite?: Phaser.GameObjects.Rectangle };

export default class MainScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private playerBody!: Phaser.Physics.Arcade.Body;
  private obstacles: Obstacle[] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private jumpKey!: Phaser.Input.Keyboard.Key;
  private jumpsRemaining = 2;
  private gravityDirection = 1; // 1 = down, -1 = up
  private flipZones = [900, 1700]; // world x positions to flip gravity
  private flipTriggered: Set<number> = new Set();
  private levelEndX = 2200;
  private score = 0;
  private scoreText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "MainScene" });
  }

  preload(): void {}

  create(): void {
    // World bounds larger than screen
    this.physics.world.setBounds(0, 0, 3000, 450);

    // Add background & ground visuals (simple)
    this.add.rectangle(400, 225, 800, 450, 0x87ceeb).setScrollFactor(0);

    // Player:
    this.player = this.add.rectangle(100, 270 - 20, 20, 20, 0xff0000);
    this.physics.add.existing(this.player);
    this.playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    this.playerBody.setCollideWorldBounds(true);
    this.playerBody.setAllowGravity(false); // we'll handle gravity manually

    // Obstacles in world coords
    this.obstacles = [
      { x: 300, width: 20, height: 40 },
      { x: 700, width: 20, height: 10 },
      { x: 1200, width: 20, height: 40 },
      { x: 1500, width: 20, height: 70 },
      { x: 1900, width: 20, height: 40 }
    ];
    for (const o of this.obstacles) {
      o.sprite = this.add.rectangle(o.x, 270 - o.height, o.width, o.height, 0x000000).setOrigin(0, 1);
      o.sprite.setData("obstacle", true);
    }

    // Camera follow
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setLerp(0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 3000, 450);

    // Input
    this.input.on("pointerdown", () => this.handleJump());
    this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.cursors = this.input.keyboard.createCursorKeys();

    // Score text (fixed to camera)
    this.scoreText = this.add.text(16, 16, "Score: 0", { fontSize: "20px", color: "#000" }).setScrollFactor(0);

    // initial player velocity to simulate forward movement
    this.playerBody.setVelocityX(160); // speed
  }

  update(time: number, delta: number): void {
    // Keyboard jump
    if (Phaser.Input.Keyboard.JustDown(this.jumpKey)) this.handleJump();

    // manual gravity: apply vy
    const GRAVITY = 0.5;
    this.playerBody.velocity.y += GRAVITY * this.gravityDirection;
    this.player.y += this.playerBody.velocity.y * (delta / 16.666);

    // Ground/ceiling collision (manual)
    const GROUND_Y = 270;
    const CEILING_Y = 10;

    if (this.gravityDirection === 1) {
      if (this.player.y + 10 >= GROUND_Y) {
        this.player.y = GROUND_Y - 10;
        this.playerBody.velocity.y = 0;
        this.jumpsRemaining = 2;
      }
    } else {
      if (this.player.y <= CEILING_Y) {
        this.player.y = CEILING_Y;
        this.playerBody.velocity.y = 0;
        this.jumpsRemaining = 2;
      }
    }

    // Update obstacles: collision detection (AABB)
    for (const obs of this.obstacles) {
      if (!obs.sprite) continue;
      const ox = obs.x;
      const oyTop = GROUND_Y - obs.height;
      // Convert player and obstacle to world coords
      if (
        this.player.x < ox + obs.width &&
        this.player.x + 20 > ox &&
        this.player.y + 20 > oyTop
      ) {
        // collision
        this.scene.pause();
        this.showGameOver();
        return;
      }
    }

    // Flip zones
    for (const fx of this.flipZones) {
      if (this.player.x >= fx && !this.flipTriggered.has(fx)) {
        this.flipTriggered.add(fx);
        this.doFlip();
      }
    }

    // Level end
    if (this.player.x >= this.levelEndX) {
      this.scene.pause();
      this.showWin();
      return;
    }

    // Score update (distance-based)
    this.score = Math.floor(this.player.x / 10);
    this.scoreText.setText(`Score: ${this.score}`);
  }

  private handleJump(): void {
    if (this.jumpsRemaining > 0) {
      const jumpVel = -9 * this.gravityDirection; // invert jump when upside down
      this.playerBody.velocity.y = jumpVel;
      this.jumpsRemaining--;
    }
  }

  private doFlip(): void {
    // Flip gravity direction and visually signal it
    this.gravityDirection *= -1;

    // optional quick pop or tint
    this.cameras.main.flash(200, 200, 200);

    // snap player to surface so a flip isn't lethal (or animate)
    if (this.gravityDirection === -1) {
      // go to ceiling
      this.player.y = 10;
      this.playerBody.velocity.y = 0;
    } else {
      this.player.y = 270 - 20;
      this.playerBody.velocity.y = 0;
    }
    this.jumpsRemaining = 2;
  }

  private showGameOver(): void {
    const go = this.add.text(this.cameras.main.worldView.centerX, 200, "Game Over", {
      fontSize: "48px",
      color: "#fff",
      backgroundColor: "#000"
    });
    go.setOrigin(0.5);
    go.setScrollFactor(0);
  }

  private showWin(): void {
    const win = this.add.text(this.cameras.main.worldView.centerX, 200, "You Win!", {
      fontSize: "48px",
      color: "#fff",
      backgroundColor: "#006400"
    });
    win.setOrigin(0.5);
    win.setScrollFactor(0);
  }
}
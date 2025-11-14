import Phaser from "phaser";
import MainScene from "./scenes/MainScene";

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    parent: "game-container",
    physics: {
        default: "arcade",
        arcade: { gravity: { y: 0 }, debug: false } // we'll control gravity manually
    },
    scene: [MainScene]
};

new Phaser.Game(config);
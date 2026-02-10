import Phaser from 'phaser';

export class TimerBar {
  scene: Phaser.Scene;
  x: number;
  y: number;
  graphics: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
  seconds: number = 0;

  private width = 160;
  private height = 14;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;

    this.label = scene.add
      .text(x, y - 14, 'TIME', { fontSize: '10px', color: '#aaaaaa' })
      .setOrigin(0.5, 0)
      .setDepth(100);

    this.graphics = scene.add.graphics().setDepth(100);
  }

  setSeconds(seconds: number, graceSeconds: number): void {
    this.seconds = seconds;

    this.graphics.clear();
    const left = this.x - this.width / 2;

    // Background
    this.graphics.fillStyle(0x222222);
    this.graphics.fillRect(left, this.y, this.width, this.height);

    // Grace zone indicator
    const maxDisplay = 25;
    const gracePct = Math.min(1, graceSeconds / maxDisplay);
    this.graphics.fillStyle(0x224422);
    this.graphics.fillRect(left, this.y, this.width * gracePct, this.height);

    // Current time marker
    const timePct = Math.min(1, seconds / maxDisplay);
    const color = seconds <= graceSeconds ? 0x44ff44 : 0xff6644;
    this.graphics.fillStyle(color);
    this.graphics.fillRect(
      left + this.width * timePct - 2,
      this.y,
      4,
      this.height
    );

    this.label.setText(`TIME: ${seconds}s`);
  }
}

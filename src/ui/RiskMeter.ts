import Phaser from 'phaser';
import { lerpColor } from '../utils/math';

export class RiskMeter {
  scene: Phaser.Scene;
  x: number;
  y: number;
  graphics: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
  value: number = 0;

  private width = 160;
  private height = 18;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;

    this.label = scene.add
      .text(x, y - 16, 'DANGER', { fontSize: '11px', color: '#ff6666' })
      .setOrigin(0.5, 0)
      .setDepth(100);

    this.graphics = scene.add.graphics().setDepth(100);
  }

  setValue(percent: number): void {
    this.value = Phaser.Math.Clamp(percent, 0, 100);
    this.draw();
  }

  private draw(): void {
    this.graphics.clear();

    const left = this.x - this.width / 2;

    // Background
    this.graphics.fillStyle(0x222222);
    this.graphics.fillRect(left, this.y, this.width, this.height);

    // Fill
    const t = this.value / 100;
    const color = lerpColor(0x44ff44, 0xff2200, t);
    this.graphics.fillStyle(color);
    this.graphics.fillRect(left, this.y, this.width * t, this.height);

    // Border
    this.graphics.lineStyle(1, 0x666666);
    this.graphics.strokeRect(left, this.y, this.width, this.height);

    // Pulse effect at high danger
    if (this.value > 60) {
      const alpha = 0.3 + Math.sin(this.scene.time.now / 150) * 0.2;
      this.label.setAlpha(alpha + 0.5);
    } else {
      this.label.setAlpha(1);
    }
  }
}

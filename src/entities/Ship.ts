import Phaser from 'phaser';

export class Ship extends Phaser.GameObjects.Container {
  shipBody: Phaser.GameObjects.Triangle;
  isMoving: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.shipBody = scene.add.triangle(0, 0, 0, -15, 10, 10, -10, 10, 0x00ff88);
    this.shipBody.setStrokeStyle(1, 0x00ffaa);

    this.add([this.shipBody]);
    scene.add.existing(this);
  }

  travelTo(x: number, y: number, duration: number): Promise<void> {
    return new Promise((resolve) => {
      this.isMoving = true;

      const angle = Phaser.Math.Angle.Between(this.x, this.y, x, y);
      this.shipBody.setRotation(angle + Math.PI / 2);

      this.scene.tweens.add({
        targets: this,
        x,
        y,
        duration,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          this.isMoving = false;
          resolve();
        },
      });
    });
  }
}

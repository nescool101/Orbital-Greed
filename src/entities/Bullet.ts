import Phaser from 'phaser';
import { BULLET } from '../config/constants';

export class Bullet extends Phaser.GameObjects.Arc {
  declare body: Phaser.Physics.Arcade.Body;
  private spawnTime: number;

  constructor(scene: Phaser.Scene, x: number, y: number, angle: number) {
    super(scene, x, y, BULLET.RADIUS, 0, 360, false, 0x00ffcc);
    scene.add.existing(this);
    scene.physics.world.enable(this);

    this.spawnTime = scene.time.now;

    const vx = Math.cos(angle) * BULLET.SPEED;
    const vy = Math.sin(angle) * BULLET.SPEED;
    this.body.setVelocity(vx, vy);
    this.body.setCircle(BULLET.RADIUS);

    this.setDepth(10);
  }

  preUpdate(): void {
    if (this.scene && this.scene.time.now - this.spawnTime > BULLET.LIFESPAN) {
      this.destroy();
    }
  }
}

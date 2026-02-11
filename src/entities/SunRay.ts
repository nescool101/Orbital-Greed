import Phaser from 'phaser';
import { SUN } from '../config/constants';

export class SunRay extends Phaser.GameObjects.Arc {
  declare body: Phaser.Physics.Arcade.Body;
  private spawnTime: number;

  constructor(scene: Phaser.Scene, x: number, y: number, angle: number) {
    super(scene, x, y, 5, 0, 360, false, 0xffee44);
    scene.add.existing(this);
    scene.physics.world.enable(this);

    this.spawnTime = scene.time.now;
    this.setAlpha(0.8);
    this.setDepth(5);

    const vx = Math.cos(angle) * SUN.RAY_SPEED;
    const vy = Math.sin(angle) * SUN.RAY_SPEED;
    this.body.setVelocity(vx, vy);
    this.body.setCircle(5);
  }

  preUpdate(): void {
    if (this.scene && this.scene.time.now - this.spawnTime > SUN.RAY_LIFESPAN) {
      this.destroy();
    }
  }
}

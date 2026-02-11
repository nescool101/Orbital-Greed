import Phaser from 'phaser';
import { DEFENSE_PROJECTILE } from '../config/constants';

export class DefenseProjectile extends Phaser.GameObjects.Arc {
  declare body: Phaser.Physics.Arcade.Body;
  private spawnTime: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    targetX: number,
    targetY: number
  ) {
    super(scene, x, y, DEFENSE_PROJECTILE.RADIUS, 0, 360, false, 0xff4444);
    scene.add.existing(this);
    scene.physics.world.enable(this);

    this.spawnTime = scene.time.now;
    this.setDepth(10);

    const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
    this.body.setVelocity(
      Math.cos(angle) * DEFENSE_PROJECTILE.SPEED,
      Math.sin(angle) * DEFENSE_PROJECTILE.SPEED
    );
    this.body.setCircle(DEFENSE_PROJECTILE.RADIUS);
  }

  preUpdate(): void {
    if (
      this.scene &&
      this.scene.time.now - this.spawnTime > DEFENSE_PROJECTILE.LIFESPAN
    ) {
      this.destroy();
    }
  }
}

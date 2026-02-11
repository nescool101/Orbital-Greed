import Phaser from 'phaser';
import { ASTEROID, WORLD } from '../config/constants';

export class Asteroid extends Phaser.GameObjects.Polygon {
  declare body: Phaser.Physics.Arcade.Body;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Generate irregular polygon points
    const points = Asteroid.generateShape();
    super(scene, x, y, points, 0x888899);
    this.setStrokeStyle(1, 0xaaaabb);

    scene.add.existing(this);
    scene.physics.world.enable(this);

    // Random drift velocity
    const speed = Phaser.Math.Between(ASTEROID.MIN_SPEED, ASTEROID.MAX_SPEED);
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    this.body.setVelocity(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed
    );
    this.body.setCircle(ASTEROID.RADIUS, -ASTEROID.RADIUS, -ASTEROID.RADIUS);
    this.setDepth(5);
  }

  private static generateShape(): number[] {
    const points: number[] = [];
    const segments = 7;
    for (let i = 0; i < segments; i++) {
      const a = (Math.PI * 2 * i) / segments;
      const r = ASTEROID.RADIUS * (0.7 + Math.random() * 0.6);
      points.push(Math.cos(a) * r, Math.sin(a) * r);
    }
    return points;
  }

  preUpdate(): void {
    // Wrap around world edges
    if (this.x < -50) this.x = WORLD.WIDTH + 50;
    else if (this.x > WORLD.WIDTH + 50) this.x = -50;
    if (this.y < -50) this.y = WORLD.HEIGHT + 50;
    else if (this.y > WORLD.HEIGHT + 50) this.y = -50;
  }

  static spawnRandom(scene: Phaser.Scene): Asteroid {
    const x = Phaser.Math.Between(50, WORLD.WIDTH - 50);
    const y = Phaser.Math.Between(50, WORLD.HEIGHT - 50);
    return new Asteroid(scene, x, y);
  }
}

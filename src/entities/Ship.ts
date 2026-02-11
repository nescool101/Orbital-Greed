import Phaser from 'phaser';
import { SHIP, BULLET } from '../config/constants';
import { Bullet } from './Bullet';

export class Ship extends Phaser.GameObjects.Container {
  shipBody: Phaser.GameObjects.Triangle;
  declare body: Phaser.Physics.Arcade.Body;
  private lastShotTime: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.shipBody = scene.add.triangle(0, 0, 0, -15, 10, 10, -10, 10, 0x00ff88);
    this.shipBody.setStrokeStyle(1, 0x00ffaa);

    this.add([this.shipBody]);
    scene.add.existing(this);

    // Enable physics on this container
    scene.physics.world.enable(this);
    this.body.setCircle(SHIP.BODY_RADIUS, -SHIP.BODY_RADIUS, -SHIP.BODY_RADIUS);
    this.body.setDrag(SHIP.DRAG, SHIP.DRAG);
    this.body.setMaxSpeed(SHIP.MAX_SPEED);
    this.body.setCollideWorldBounds(true);
  }

  handleMovement(
    up: boolean,
    down: boolean,
    left: boolean,
    right: boolean
  ): void {
    let ax = 0;
    let ay = 0;

    if (up) ay -= SHIP.ACCELERATION;
    if (down) ay += SHIP.ACCELERATION;
    if (left) ax -= SHIP.ACCELERATION;
    if (right) ax += SHIP.ACCELERATION;

    this.body.setAcceleration(ax, ay);

    // Rotate ship to face movement direction
    if (ax !== 0 || ay !== 0) {
      const angle = Math.atan2(ay, ax);
      this.shipBody.setRotation(angle + Math.PI / 2);
    }
  }

  isMoving(): boolean {
    const speed = this.body.speed;
    return speed > 10;
  }

  shoot(time: number, bullets: Phaser.Physics.Arcade.Group): Bullet | null {
    if (time - this.lastShotTime < SHIP.SHOOT_COOLDOWN) return null;
    this.lastShotTime = time;

    const angle = this.shipBody.rotation - Math.PI / 2;
    const bullet = new Bullet(this.scene, this.x, this.y, angle);
    bullets.add(bullet);
    return bullet;
  }
}

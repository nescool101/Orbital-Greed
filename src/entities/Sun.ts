import Phaser from 'phaser';
import { SUN, WORLD } from '../config/constants';
import { SunRay } from './SunRay';

export class Sun extends Phaser.GameObjects.Container {
  private glow: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, sunRays: Phaser.Physics.Arcade.Group) {
    super(scene, WORLD.CENTER_X, WORLD.CENTER_Y);

    // Outer glow
    this.glow = scene.add.circle(0, 0, SUN.RADIUS + 20, 0xffcc00, 0.15);
    // Main body
    const body = scene.add.circle(0, 0, SUN.RADIUS, 0xffdd00);
    // Inner bright spot
    const core = scene.add.circle(0, 0, SUN.RADIUS * 0.4, 0xffffaa);

    this.add([this.glow, body, core]);
    scene.add.existing(this);

    // Pulse animation on glow
    scene.tweens.add({
      targets: this.glow,
      alpha: 0.3,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Emit rays on a timer
    scene.time.addEvent({
      delay: SUN.RAY_INTERVAL,
      callback: () => this.emitRays(sunRays),
      loop: true,
    });
  }

  private emitRays(sunRays: Phaser.Physics.Arcade.Group): void {
    for (let i = 0; i < SUN.RAY_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / SUN.RAY_COUNT;
      const ray = new SunRay(this.scene, WORLD.CENTER_X, WORLD.CENTER_Y, angle);
      sunRays.add(ray);
    }
  }
}

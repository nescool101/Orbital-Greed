import Phaser from 'phaser';
import { PlanetData } from '../state/GameState';

export class Planet extends Phaser.GameObjects.Container {
  planetData: PlanetData;
  circle: Phaser.GameObjects.Arc;
  label: Phaser.GameObjects.Text;
  riskLabel: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, planetData: PlanetData) {
    super(scene, planetData.x, planetData.y);
    this.planetData = planetData;

    const radius = 20 + planetData.riskLevel * 5;

    // Orbit ring
    const ring = scene.add.circle(0, 0, radius + 8);
    ring.setStrokeStyle(1, 0x444466);

    // Planet body
    this.circle = scene.add.circle(0, 0, radius, planetData.color);
    this.circle.setInteractive({ useHandCursor: true });

    // Name
    this.label = scene.add
      .text(0, radius + 14, planetData.name, {
        fontSize: '11px',
        color: '#aaaacc',
        align: 'center',
      })
      .setOrigin(0.5);

    // Risk indicator
    const riskText = '\u26A0'.repeat(planetData.riskLevel);
    this.riskLabel = scene.add
      .text(0, -(radius + 12), riskText, {
        fontSize: '10px',
        align: 'center',
      })
      .setOrigin(0.5);

    this.add([ring, this.circle, this.label, this.riskLabel]);
    scene.add.existing(this);
  }
}

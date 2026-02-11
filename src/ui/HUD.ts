import Phaser from 'phaser';
import { GameState } from '../state/GameState';
import { ECONOMY } from '../config/constants';

export class HUD {
  scene: Phaser.Scene;
  state: GameState;

  healthBar!: Phaser.GameObjects.Graphics;
  healthText!: Phaser.GameObjects.Text;
  fuelBar!: Phaser.GameObjects.Graphics;
  fuelText!: Phaser.GameObjects.Text;
  creditsText!: Phaser.GameObjects.Text;

  private barWidth = 120;
  private barHeight = 14;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.state = GameState.getInstance();
    this.create();
  }

  private create(): void {
    // Health
    this.scene.add
      .text(10, 10, 'HP', { fontSize: '12px', color: '#ff4444' })
      .setScrollFactor(0)
      .setDepth(100);
    this.healthBar = this.scene.add.graphics().setScrollFactor(0).setDepth(100);
    this.healthText = this.scene.add
      .text(140, 10, '', { fontSize: '12px', color: '#ffffff' })
      .setScrollFactor(0)
      .setDepth(100);

    // Fuel
    this.scene.add
      .text(10, 30, 'FUEL', { fontSize: '12px', color: '#4488ff' })
      .setScrollFactor(0)
      .setDepth(100);
    this.fuelBar = this.scene.add.graphics().setScrollFactor(0).setDepth(100);
    this.fuelText = this.scene.add
      .text(140, 30, '', { fontSize: '12px', color: '#ffffff' })
      .setScrollFactor(0)
      .setDepth(100);

    // Credits
    this.creditsText = this.scene.add
      .text(10, 55, '', { fontSize: '14px', color: '#ffdd00' })
      .setScrollFactor(0)
      .setDepth(100);
  }

  update(): void {
    const s = this.state;

    // Health bar
    this.healthBar.clear();
    this.healthBar.fillStyle(0x333333);
    this.healthBar.fillRect(40, 10, this.barWidth, this.barHeight);
    const healthPct = Math.max(0, s.health / s.maxHealth);
    const healthColor = healthPct > 0.5 ? 0x44ff44 : healthPct > 0.25 ? 0xffaa00 : 0xff2222;
    this.healthBar.fillStyle(healthColor);
    this.healthBar.fillRect(40, 10, this.barWidth * healthPct, this.barHeight);
    this.healthText.setText(`${Math.ceil(s.health)}/${s.maxHealth}`);

    // Fuel bar
    this.fuelBar.clear();
    this.fuelBar.fillStyle(0x333333);
    this.fuelBar.fillRect(40, 30, this.barWidth, this.barHeight);
    const fuelPct = Math.max(0, s.fuel / s.maxFuel);
    this.fuelBar.fillStyle(0x4488ff);
    this.fuelBar.fillRect(40, 30, this.barWidth * fuelPct, this.barHeight);
    this.fuelText.setText(`${Math.ceil(s.fuel)}/${s.maxFuel}`);

    // Credits
    this.creditsText.setText(
      `Credits: ${s.credits} / ${ECONOMY.HYPERDRIVE_COST}`
    );
  }
}

import Phaser from 'phaser';
import { GAME, ECONOMY } from '../config/constants';
import { GameState } from '../state/GameState';
import { PlanetGenerator } from '../systems/PlanetGenerator';
import { EconomySystem } from '../systems/EconomySystem';
import { Ship } from '../entities/Ship';
import { Planet } from '../entities/Planet';
import { HUD } from '../ui/HUD';
import { SaveManager } from '../state/SaveManager';
import { UPGRADES, getUpgradeCost } from '../config/upgradeData';

export class GameScene extends Phaser.Scene {
  ship!: Ship;
  planets: Planet[] = [];
  state!: GameState;
  hud!: HUD;
  shopPanel: Phaser.GameObjects.Container | null = null;

  constructor() {
    super('Game');
  }

  init(data?: { loadSave?: boolean }): void {
    this.state = GameState.getInstance();
    if (data?.loadSave) {
      const saved = SaveManager.load();
      if (saved) {
        Object.assign(this.state, saved);
      }
    } else if (this.state.planets.length === 0) {
      this.state.reset();
    }
  }

  create(): void {
    // Starfield background
    this.createStarfield();

    // Generate planets if needed
    if (this.state.planets.length === 0) {
      this.state.planets = PlanetGenerator.generate(6);
    }

    // Create planet entities
    this.planets = this.state.planets.map((pd) => new Planet(this, pd));

    // Create ship at center
    this.ship = new Ship(this, GAME.WIDTH / 2, GAME.HEIGHT / 2);

    // HUD
    this.hud = new HUD(this);
    this.hud.update();

    // Planet click handlers
    this.planets.forEach((planet) => {
      planet.circle.on('pointerdown', () => {
        if (this.ship.isMoving) return;
        if (this.shopPanel) return;
        this.travelToPlanet(planet);
      });
    });

    // Shop button
    this.createShopButton();

    // Auto-save when returning to map
    SaveManager.save(this.state);

    // Check fuel death
    if (this.state.fuel <= 0) {
      this.scene.start('GameOver', { reason: 'fuel' });
    }
  }

  update(): void {
    this.hud.update();
  }

  private async travelToPlanet(planet: Planet): Promise<void> {
    const fuelCost = EconomySystem.getFuelCost(this.state);

    if (this.state.fuel < fuelCost) {
      this.scene.start('GameOver', { reason: 'fuel' });
      return;
    }

    this.state.fuel -= fuelCost;
    this.hud.update();

    const distance = Phaser.Math.Distance.Between(
      this.ship.x,
      this.ship.y,
      planet.x,
      planet.y
    );
    const duration = (distance / GAME.SHIP_SPEED) * 1000;

    await this.ship.travelTo(planet.x, planet.y, duration);
    this.state.currentPlanet = planet.planetData;

    this.scene.start('Harvest', { planet: planet.planetData });
  }

  private createShopButton(): void {
    const btn = this.add
      .text(GAME.WIDTH - 10, 10, 'UPGRADES', {
        fontSize: '14px',
        color: '#ffdd00',
        backgroundColor: '#333355',
        padding: { x: 12, y: 6 },
      })
      .setOrigin(1, 0)
      .setDepth(100)
      .setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setStyle({ color: '#ffffff' }));
    btn.on('pointerout', () => btn.setStyle({ color: '#ffdd00' }));
    btn.on('pointerdown', () => this.toggleShop());
  }

  private toggleShop(): void {
    if (this.shopPanel) {
      this.shopPanel.destroy();
      this.shopPanel = null;
      return;
    }

    this.shopPanel = this.add.container(GAME.WIDTH / 2, GAME.HEIGHT / 2).setDepth(200);

    // Background panel
    const bg = this.add.graphics();
    bg.fillStyle(0x111133, 0.95);
    bg.fillRoundedRect(-200, -180, 400, 360, 12);
    bg.lineStyle(2, 0x4444aa);
    bg.strokeRoundedRect(-200, -180, 400, 360, 12);
    this.shopPanel.add(bg);

    // Title
    const title = this.add
      .text(0, -155, 'UPGRADES', {
        fontSize: '20px',
        color: '#ffdd00',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.shopPanel.add(title);

    // Credits display
    const creditsLabel = this.add
      .text(0, -125, `Credits: ${this.state.credits}`, {
        fontSize: '14px',
        color: '#ffdd00',
      })
      .setOrigin(0.5);
    this.shopPanel.add(creditsLabel);

    // Upgrades
    let yOffset = -85;
    UPGRADES.forEach((upgrade) => {
      const currentLevel = (this.state as any)[`${upgrade.id}Level`] as number;
      const maxed = currentLevel >= upgrade.maxLevel;
      const cost = maxed ? 0 : getUpgradeCost(currentLevel);
      const canAfford = this.state.credits >= cost && !maxed;

      // Name + level
      const nameText = this.add
        .text(-170, yOffset, `${upgrade.name} [${currentLevel}/${upgrade.maxLevel}]`, {
          fontSize: '13px',
          color: '#ccccee',
        })
        .setOrigin(0, 0);
      this.shopPanel!.add(nameText);

      // Effect
      const effectText = this.add
        .text(-170, yOffset + 18, upgrade.getEffect(currentLevel), {
          fontSize: '11px',
          color: '#888899',
        })
        .setOrigin(0, 0);
      this.shopPanel!.add(effectText);

      // Buy button
      const btnLabel = maxed ? 'MAXED' : `BUY (${cost})`;
      const btnColor = maxed ? '#666666' : canAfford ? '#44ff44' : '#ff4444';
      const buyBtn = this.add
        .text(170, yOffset + 8, btnLabel, {
          fontSize: '13px',
          color: btnColor,
          backgroundColor: '#222244',
          padding: { x: 8, y: 4 },
        })
        .setOrigin(1, 0);

      if (canAfford) {
        buyBtn.setInteractive({ useHandCursor: true });
        buyBtn.on('pointerdown', () => {
          if (EconomySystem.buyUpgrade(this.state, upgrade.id)) {
            // Refresh shop
            this.shopPanel!.destroy();
            this.shopPanel = null;
            this.toggleShop();
            this.hud.update();
          }
        });
      }
      this.shopPanel!.add(buyBtn);

      yOffset += 55;
    });

    // Hyperdrive
    yOffset += 10;
    const hdCost = ECONOMY.HYPERDRIVE_COST;
    const canBuyHD = this.state.credits >= hdCost;
    const hdText = this.add
      .text(0, yOffset, `HYPERDRIVE - ${hdCost} credits`, {
        fontSize: '15px',
        color: canBuyHD ? '#ffdd00' : '#666666',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.shopPanel.add(hdText);

    if (canBuyHD) {
      const hdBtn = this.add
        .text(0, yOffset + 28, 'ESCAPE THE SYSTEM', {
          fontSize: '14px',
          color: '#ffdd00',
          backgroundColor: '#444400',
          padding: { x: 16, y: 6 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      hdBtn.on('pointerdown', () => {
        this.state.credits -= hdCost;
        this.scene.start('GameOver', { reason: 'win' });
      });
      this.shopPanel.add(hdBtn);
    }

    // Close button
    const closeBtn = this.add
      .text(180, -170, 'X', {
        fontSize: '18px',
        color: '#ff4444',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.toggleShop());
    this.shopPanel.add(closeBtn);
  }

  private createStarfield(): void {
    const g = this.add.graphics();
    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(0, GAME.WIDTH);
      const y = Phaser.Math.Between(0, GAME.HEIGHT);
      const size = Phaser.Math.FloatBetween(0.5, 1.5);
      const alpha = Phaser.Math.FloatBetween(0.2, 0.6);
      g.fillStyle(0xffffff, alpha);
      g.fillCircle(x, y, size);
    }
  }
}

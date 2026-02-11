import Phaser from 'phaser';
import {
  GAME,
  WORLD,
  SHIP,
  ECONOMY,
  SUN as SUN_CONST,
  ASTEROID as AST_CONST,
  DEFENSE_PROJECTILE as DP_CONST,
  PLANET_PROXIMITY,
} from '../config/constants';
import { GameState } from '../state/GameState';
import { PlanetGenerator } from '../systems/PlanetGenerator';
import { Ship } from '../entities/Ship';
import { Planet } from '../entities/Planet';
import { Sun } from '../entities/Sun';
import { Asteroid } from '../entities/Asteroid';
import { DefenseProjectile } from '../entities/DefenseProjectile';
import { HUD } from '../ui/HUD';
import { MobileControls } from '../ui/MobileControls';
import { EconomySystem } from '../systems/EconomySystem';
import { SaveManager } from '../state/SaveManager';
import { UPGRADES, getUpgradeCost } from '../config/upgradeData';

export class GameScene extends Phaser.Scene {
  ship!: Ship;
  planets: Planet[] = [];
  state!: GameState;
  hud!: HUD;
  shopPanel: Phaser.GameObjects.Container | null = null;

  // Input
  private keys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
  };
  private mobileControls!: MobileControls;

  // Physics groups
  private bullets!: Phaser.Physics.Arcade.Group;
  private sunRays!: Phaser.Physics.Arcade.Group;
  private asteroids!: Phaser.Physics.Arcade.Group;
  private defenseProjectiles!: Phaser.Physics.Arcade.Group;

  // UI
  private promptText!: Phaser.GameObjects.Text;
  private nearestLandable: Planet | null = null;

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
    // Set world bounds
    this.physics.world.setBounds(0, 0, WORLD.WIDTH, WORLD.HEIGHT);

    // Starfield background
    this.createStarfield();

    // Physics groups
    this.bullets = this.physics.add.group({ runChildUpdate: true });
    this.sunRays = this.physics.add.group({ runChildUpdate: true });
    this.asteroids = this.physics.add.group({ runChildUpdate: true });
    this.defenseProjectiles = this.physics.add.group({ runChildUpdate: true });

    // Generate planets if needed
    if (this.state.planets.length === 0) {
      this.state.planets = PlanetGenerator.generate(6);
    }

    // Create planet entities
    this.planets = this.state.planets.map((pd) => new Planet(this, pd));

    // Create sun at world center
    new Sun(this, this.sunRays);

    // Create ship at last known position
    this.ship = new Ship(this, this.state.lastShipX, this.state.lastShipY);

    // Spawn asteroids
    for (let i = 0; i < AST_CONST.COUNT; i++) {
      const ast = Asteroid.spawnRandom(this);
      this.asteroids.add(ast);
    }

    // Camera follows ship
    this.cameras.main.setBounds(0, 0, WORLD.WIDTH, WORLD.HEIGHT);
    this.cameras.main.startFollow(this.ship, true, 0.08, 0.08);

    // HUD (fixed to camera)
    this.hud = new HUD(this);
    this.hud.update();

    // Input keys
    this.keys = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      E: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      SPACE: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    };

    // Mobile controls
    this.mobileControls = new MobileControls(this);

    // Landing prompt text (fixed to camera via scrollFactor)
    this.promptText = this.add
      .text(GAME.WIDTH / 2, GAME.HEIGHT - 50, '', {
        fontSize: '16px',
        color: '#44ff44',
        backgroundColor: '#000000aa',
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100)
      .setVisible(false);

    // Shop button (fixed to camera)
    this.createShopButton();

    // Setup collisions
    this.setupCollisions();

    // Auto-save when returning to map
    SaveManager.save(this.state);

    // Check fuel death
    if (this.state.fuel <= 0 && this.state.health <= 0) {
      this.scene.start('GameOver', { reason: 'fuel' });
    }
  }

  update(time: number, delta: number): void {
    if (this.shopPanel) {
      this.ship.handleMovement(false, false, false, false);
      this.hud.update();
      return;
    }

    // Combined input: keyboard OR mobile
    const up = this.keys.W.isDown || this.mobileControls.moveUp;
    const down = this.keys.S.isDown || this.mobileControls.moveDown;
    const left = this.keys.A.isDown || this.mobileControls.moveLeft;
    const right = this.keys.D.isDown || this.mobileControls.moveRight;
    const shooting =
      this.keys.SPACE.isDown || this.mobileControls.shooting;
    const interact =
      Phaser.Input.Keyboard.JustDown(this.keys.E) ||
      this.mobileControls.interact;

    // Ship movement
    this.ship.handleMovement(up, down, left, right);

    // Drain fuel while moving
    if (this.ship.isMoving() && this.state.fuel > 0) {
      this.state.fuel -= SHIP.FUEL_DRAIN_RATE * (delta / 1000);
      this.state.fuel = Math.max(0, this.state.fuel);
    }

    // Shooting
    if (shooting) {
      this.ship.shoot(time, this.bullets);
    }

    // Planet proximity check
    this.nearestLandable = null;
    let minDist = Infinity;

    for (const planet of this.planets) {
      const dist = Phaser.Math.Distance.Between(
        this.ship.x,
        this.ship.y,
        planet.x,
        planet.y
      );

      // Landing range
      if (dist < PLANET_PROXIMITY.LAND_RANGE && dist < minDist) {
        minDist = dist;
        this.nearestLandable = planet;
      }

      // Planet defense firing
      if (dist < PLANET_PROXIMITY.DEFENSE_RANGE) {
        const cooldown =
          DP_CONST.BASE_COOLDOWN / (0.5 + planet.planetData.riskLevel * 0.3);
        if (time - planet.lastFiredTime > cooldown) {
          planet.lastFiredTime = time;
          const proj = new DefenseProjectile(
            this,
            planet.x,
            planet.y,
            this.ship.x,
            this.ship.y
          );
          this.defenseProjectiles.add(proj);
        }
      }
    }

    // Show/hide landing prompt
    if (this.nearestLandable) {
      this.promptText
        .setText(`Press E to land on ${this.nearestLandable.planetData.name}`)
        .setVisible(true);
    } else {
      this.promptText.setVisible(false);
    }

    // Interact — land on planet
    if (interact && this.nearestLandable) {
      this.mobileControls.interact = false;
      this.state.lastShipX = this.ship.x;
      this.state.lastShipY = this.ship.y;
      this.state.currentPlanet = this.nearestLandable.planetData;
      this.scene.start('Harvest', {
        planet: this.nearestLandable.planetData,
      });
      return;
    }

    // Fuel death
    if (this.state.fuel <= 0 && this.state.health <= 0) {
      this.scene.start('GameOver', { reason: 'fuel' });
      return;
    }

    // HP death
    if (this.state.health <= 0) {
      this.scene.start('GameOver', { reason: 'death' });
      return;
    }

    // Persist ship position
    this.state.lastShipX = this.ship.x;
    this.state.lastShipY = this.ship.y;

    this.hud.update();
  }

  private setupCollisions(): void {
    // Ship + SunRay → restore fuel
    this.physics.add.overlap(
      this.ship,
      this.sunRays,
      (_ship, ray) => {
        this.state.fuel = Math.min(
          this.state.maxFuel,
          this.state.fuel + SUN_CONST.FUEL_RESTORE
        );
        this.spawnPopup(this.ship.x, this.ship.y - 20, `+${SUN_CONST.FUEL_RESTORE} FUEL`, '#ffee44');
        (ray as Phaser.GameObjects.Arc).destroy();
      }
    );

    // Bullet + Asteroid → credits + destroy both
    this.physics.add.overlap(
      this.bullets,
      this.asteroids,
      (bullet, asteroid) => {
        const ax = (asteroid as Phaser.GameObjects.Polygon).x;
        const ay = (asteroid as Phaser.GameObjects.Polygon).y;
        this.state.credits += AST_CONST.CREDIT_REWARD;
        this.spawnPopup(ax, ay - 20, `+${AST_CONST.CREDIT_REWARD}`, '#ffdd00');
        (bullet as Phaser.GameObjects.Arc).destroy();
        (asteroid as Phaser.GameObjects.Polygon).destroy();

        // Respawn asteroid after delay
        this.time.delayedCall(AST_CONST.RESPAWN_DELAY, () => {
          if (this.scene.isActive()) {
            const ast = Asteroid.spawnRandom(this);
            this.asteroids.add(ast);
          }
        });
      }
    );

    // Bullet + DefenseProjectile → destroy both
    this.physics.add.overlap(
      this.bullets,
      this.defenseProjectiles,
      (bullet, proj) => {
        (bullet as Phaser.GameObjects.Arc).destroy();
        (proj as Phaser.GameObjects.Arc).destroy();
      }
    );

    // Ship + DefenseProjectile → damage ship
    this.physics.add.overlap(
      this.ship,
      this.defenseProjectiles,
      (_ship, proj) => {
        this.state.health -= DP_CONST.DAMAGE;
        this.spawnPopup(this.ship.x, this.ship.y - 20, `-${DP_CONST.DAMAGE} HP`, '#ff2222');
        this.cameras.main.shake(100, 0.005);
        (proj as Phaser.GameObjects.Arc).destroy();
      }
    );

    // Ship + Asteroid → minor damage
    this.physics.add.overlap(
      this.ship,
      this.asteroids,
      (_ship, asteroid) => {
        this.state.health -= AST_CONST.SHIP_DAMAGE;
        this.spawnPopup(
          this.ship.x,
          this.ship.y - 20,
          `-${AST_CONST.SHIP_DAMAGE} HP`,
          '#ff2222'
        );
        this.cameras.main.shake(150, 0.008);
        (asteroid as Phaser.GameObjects.Polygon).destroy();

        // Respawn
        this.time.delayedCall(AST_CONST.RESPAWN_DELAY, () => {
          if (this.scene.isActive()) {
            const ast = Asteroid.spawnRandom(this);
            this.asteroids.add(ast);
          }
        });
      }
    );
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
      .setScrollFactor(0)
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

    this.shopPanel = this.add
      .container(GAME.WIDTH / 2, GAME.HEIGHT / 2)
      .setScrollFactor(0)
      .setDepth(200);

    // Background panel
    const bg = this.add.graphics().setScrollFactor(0);
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

      const nameText = this.add
        .text(-170, yOffset, `${upgrade.name} [${currentLevel}/${upgrade.maxLevel}]`, {
          fontSize: '13px',
          color: '#ccccee',
        })
        .setOrigin(0, 0);
      this.shopPanel!.add(nameText);

      const effectText = this.add
        .text(-170, yOffset + 18, upgrade.getEffect(currentLevel), {
          fontSize: '11px',
          color: '#888899',
        })
        .setOrigin(0, 0);
      this.shopPanel!.add(effectText);

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
    for (let i = 0; i < 300; i++) {
      const x = Phaser.Math.Between(0, WORLD.WIDTH);
      const y = Phaser.Math.Between(0, WORLD.HEIGHT);
      const size = Phaser.Math.FloatBetween(0.5, 1.5);
      const alpha = Phaser.Math.FloatBetween(0.2, 0.6);
      g.fillStyle(0xffffff, alpha);
      g.fillCircle(x, y, size);
    }
  }

  private spawnPopup(x: number, y: number, text: string, color: string): void {
    const popup = this.add
      .text(x, y, text, {
        fontSize: '14px',
        color,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(110);

    this.tweens.add({
      targets: popup,
      y: y - 30,
      alpha: 0,
      duration: 800,
      ease: 'Sine.easeOut',
      onComplete: () => popup.destroy(),
    });
  }
}

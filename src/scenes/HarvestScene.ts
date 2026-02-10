import Phaser from 'phaser';
import { GAME, DEFENSE, ECONOMY } from '../config/constants';
import { GameState, PlanetData } from '../state/GameState';
import { DefenseSystem } from '../systems/DefenseSystem';
import { EconomySystem } from '../systems/EconomySystem';
import { RiskMeter } from '../ui/RiskMeter';
import { TimerBar } from '../ui/TimerBar';
import { WarningOverlay } from '../ui/WarningOverlay';

export class HarvestScene extends Phaser.Scene {
  state!: GameState;
  planet!: PlanetData;
  secondsStayed: number = 0;
  creditsCollected: number = 0;
  damagePerTick: number = 0;
  isCollecting: boolean = true;

  riskMeter!: RiskMeter;
  timerBar!: TimerBar;
  warningOverlay!: WarningOverlay;

  creditsText!: Phaser.GameObjects.Text;
  healthText!: Phaser.GameObjects.Text;
  planetNameText!: Phaser.GameObjects.Text;

  tickTimer!: Phaser.Time.TimerEvent;

  constructor() {
    super('Harvest');
  }

  init(data: { planet: PlanetData }): void {
    this.planet = data.planet;
    this.secondsStayed = 0;
    this.creditsCollected = 0;
    this.damagePerTick = 0;
    this.isCollecting = true;
  }

  create(): void {
    this.state = GameState.getInstance();

    // Draw planet surface
    this.drawSurface();

    // Planet name & risk
    this.planetNameText = this.add
      .text(
        GAME.WIDTH / 2,
        30,
        `${this.planet.name} - Risk ${this.planet.riskLevel}`,
        {
          fontSize: '18px',
          color: '#ffffff',
          fontStyle: 'bold',
        }
      )
      .setOrigin(0.5);

    // Credits counter (big, center)
    this.creditsText = this.add
      .text(GAME.WIDTH / 2, GAME.HEIGHT / 2 - 30, '+0', {
        fontSize: '48px',
        color: '#ffdd00',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Health display
    this.healthText = this.add
      .text(GAME.WIDTH / 2, GAME.HEIGHT / 2 + 30, '', {
        fontSize: '16px',
        color: '#ff4444',
      })
      .setOrigin(0.5);

    // Risk meter
    this.riskMeter = new RiskMeter(this, GAME.WIDTH / 2, 70);

    // Timer bar
    this.timerBar = new TimerBar(this, GAME.WIDTH / 2, 110);

    // Warning overlay
    this.warningOverlay = new WarningOverlay(this);

    // Leave button
    this.createLeaveButton();

    // Hint text
    const graceSeconds = DefenseSystem.getGraceSeconds(this.state.shieldLevel);
    this.add
      .text(
        GAME.WIDTH / 2,
        GAME.HEIGHT - 30,
        `${graceSeconds}s grace period | Damage escalates exponentially`,
        {
          fontSize: '11px',
          color: '#666688',
        }
      )
      .setOrigin(0.5);

    // Start tick timer
    this.tickTimer = this.time.addEvent({
      delay: DEFENSE.TICK_INTERVAL,
      callback: this.onTick,
      callbackScope: this,
      loop: true,
    });
  }

  private onTick(): void {
    if (!this.isCollecting) return;

    this.secondsStayed++;

    // Collect credits
    const reward = EconomySystem.calculateReward(this.planet.riskLevel);
    this.creditsCollected += reward;
    this.creditsText.setText(`+${this.creditsCollected}`);

    // Floating credit popup
    this.spawnPopup(
      GAME.WIDTH / 2 + Phaser.Math.Between(-50, 50),
      GAME.HEIGHT / 2 - 70,
      `+${reward}`,
      '#ffdd00'
    );

    // Defense damage
    const damage = DefenseSystem.calculateDamage(
      this.secondsStayed,
      this.planet.riskLevel,
      this.state.armorLevel,
      this.state.shieldLevel
    );

    if (damage > 0) {
      this.state.health -= damage;

      // Floating damage popup
      this.spawnPopup(
        GAME.WIDTH / 2 + Phaser.Math.Between(-80, 80),
        GAME.HEIGHT / 2 + 70,
        `-${Math.ceil(damage)} HP`,
        '#ff2222'
      );

      // Screen shake proportional to damage
      const intensity = Math.min(0.02, 0.003 * damage);
      this.cameras.main.shake(100, intensity);

      // Flash on heavy damage
      if (damage > 10) {
        this.cameras.main.flash(150, 255, 0, 0, true);
      }
    }

    // Update danger meter
    const dangerPercent = Math.min(
      100,
      (this.damagePerTick / this.state.maxHealth) * 300
    );
    this.damagePerTick = damage;
    this.riskMeter.setValue(
      Math.min(100, (damage / this.state.maxHealth) * 300)
    );

    // Update timer
    const graceSeconds = DefenseSystem.getGraceSeconds(this.state.shieldLevel);
    this.timerBar.setSeconds(this.secondsStayed, graceSeconds);

    // Update health display
    this.healthText.setText(
      `HP: ${Math.ceil(Math.max(0, this.state.health))} / ${this.state.maxHealth}`
    );

    // Shift background color toward red
    if (damage > 0) {
      const t = Math.min(1, damage / 30);
      const r = Math.floor(10 + t * 60);
      const g = Math.floor(10 - t * 10);
      const b = Math.floor(46 - t * 30);
      const hexStr = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      this.cameras.main.setBackgroundColor(hexStr);
    }

    // Warning
    if (
      this.state.health <
      this.state.maxHealth * DEFENSE.WARNING_THRESHOLD
    ) {
      this.warningOverlay.show();
    }

    // Death check
    if (this.state.health <= 0) {
      this.state.health = 0;
      this.isCollecting = false;
      this.tickTimer.remove();
      this.warningOverlay.destroy();
      this.time.delayedCall(500, () => {
        this.scene.start('GameOver', { reason: 'death' });
      });
    }
  }

  private leavePlanet(): void {
    if (!this.isCollecting) return;
    this.isCollecting = false;
    this.tickTimer.remove();
    this.warningOverlay.hide();

    this.state.credits += this.creditsCollected;
    this.state.totalEarned += this.creditsCollected;
    this.state.planetsVisited++;

    // Check win condition
    if (this.state.credits >= ECONOMY.HYPERDRIVE_COST) {
      // Don't auto-win; let player buy it from shop
    }

    this.scene.start('Game');
  }

  private createLeaveButton(): void {
    const btn = this.add
      .text(GAME.WIDTH / 2, GAME.HEIGHT - 70, 'LEAVE PLANET', {
        fontSize: '22px',
        color: '#ffffff',
        backgroundColor: '#224422',
        padding: { x: 30, y: 12 },
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(80)
      .setInteractive({ useHandCursor: true });

    btn.on('pointerover', () =>
      btn.setStyle({ backgroundColor: '#336633', color: '#44ff44' })
    );
    btn.on('pointerout', () =>
      btn.setStyle({ backgroundColor: '#224422', color: '#ffffff' })
    );
    btn.on('pointerdown', () => this.leavePlanet());
  }

  private drawSurface(): void {
    const g = this.add.graphics();

    // Ground
    g.fillStyle(this.planet.color, 0.15);
    g.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);

    // Terrain dots
    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(0, GAME.WIDTH);
      const y = Phaser.Math.Between(0, GAME.HEIGHT);
      g.fillStyle(this.planet.color, Phaser.Math.FloatBetween(0.05, 0.2));
      g.fillCircle(x, y, Phaser.Math.Between(3, 15));
    }
  }

  private spawnPopup(x: number, y: number, text: string, color: string): void {
    const popup = this.add
      .text(x, y, text, {
        fontSize: '16px',
        color,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(110);

    this.tweens.add({
      targets: popup,
      y: y - 40,
      alpha: 0,
      duration: 800,
      ease: 'Sine.easeOut',
      onComplete: () => popup.destroy(),
    });
  }
}

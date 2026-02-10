import Phaser from 'phaser';
import { GAME } from '../config/constants';
import { GameState } from '../state/GameState';
import { SaveManager } from '../state/SaveManager';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create(data: { reason: string }): void {
    const state = GameState.getInstance();
    const cx = GAME.WIDTH / 2;
    const cy = GAME.HEIGHT / 2;

    const isWin = data.reason === 'win';

    // Background
    if (isWin) {
      this.cameras.main.setBackgroundColor('#0a0a2e');
      // Gold particles
      for (let i = 0; i < 60; i++) {
        const star = this.add
          .circle(
            Phaser.Math.Between(0, GAME.WIDTH),
            Phaser.Math.Between(0, GAME.HEIGHT),
            Phaser.Math.Between(1, 3),
            0xffdd00,
            Phaser.Math.FloatBetween(0.3, 1)
          )
          .setDepth(0);

        this.tweens.add({
          targets: star,
          alpha: 0,
          y: star.y - 50,
          duration: Phaser.Math.Between(1000, 3000),
          repeat: -1,
          yoyo: true,
        });
      }
    } else {
      this.cameras.main.setBackgroundColor('#1a0000');
    }

    // Title
    const title = isWin ? 'HYPERDRIVE ACTIVATED' : 'SHIP DESTROYED';
    const titleColor = isWin ? '#ffdd00' : '#ff2222';

    this.add
      .text(cx, cy - 100, title, {
        fontSize: '32px',
        color: titleColor,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Subtitle
    const subtitle = isWin
      ? 'You escaped the system!'
      : data.reason === 'fuel'
        ? 'You ran out of fuel...'
        : 'The defenses were too strong...';

    this.add
      .text(cx, cy - 60, subtitle, {
        fontSize: '16px',
        color: '#aaaacc',
      })
      .setOrigin(0.5);

    // Stats
    const stats = [
      `Planets Visited: ${state.planetsVisited}`,
      `Total Earned: ${state.totalEarned} credits`,
      `Final Credits: ${state.credits}`,
      `Armor Level: ${state.armorLevel}`,
      `Engine Level: ${state.engineLevel}`,
      `Shield Level: ${state.shieldLevel}`,
    ];

    stats.forEach((line, i) => {
      this.add
        .text(cx, cy - 10 + i * 24, line, {
          fontSize: '14px',
          color: '#ccccee',
        })
        .setOrigin(0.5);
    });

    // Play again button
    const btn = this.add
      .text(cx, cy + 160, 'PLAY AGAIN', {
        fontSize: '22px',
        color: '#ffffff',
        backgroundColor: '#333355',
        padding: { x: 24, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setStyle({ color: '#ffdd00' }));
    btn.on('pointerout', () => btn.setStyle({ color: '#ffffff' }));
    btn.on('pointerdown', () => {
      SaveManager.clear();
      state.reset();
      this.scene.start('Menu');
    });
  }
}

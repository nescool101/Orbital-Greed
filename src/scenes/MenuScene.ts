import Phaser from 'phaser';
import { GAME } from '../config/constants';
import { SaveManager } from '../state/SaveManager';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create(): void {
    const cx = GAME.WIDTH / 2;
    const cy = GAME.HEIGHT / 2;

    // Starfield background
    this.createStarfield();

    // Title
    this.add
      .text(cx, cy - 120, 'ORBITAL GREED', {
        fontSize: '42px',
        color: '#ffdd00',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(cx, cy - 70, 'How long will you stay?', {
        fontSize: '16px',
        color: '#8888aa',
      })
      .setOrigin(0.5);

    // New Game button
    this.createButton(cx, cy + 20, 'NEW GAME', () => {
      SaveManager.clear();
      this.scene.start('Game');
    });

    // Continue button (if save exists)
    if (SaveManager.hasSave()) {
      this.createButton(cx, cy + 70, 'CONTINUE', () => {
        this.scene.start('Game', { loadSave: true });
      });
    }
  }

  private createButton(
    x: number,
    y: number,
    label: string,
    callback: () => void
  ): void {
    const btn = this.add
      .text(x, y, label, {
        fontSize: '22px',
        color: '#ffffff',
        backgroundColor: '#333355',
        padding: { x: 24, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setStyle({ color: '#ffdd00' }));
    btn.on('pointerout', () => btn.setStyle({ color: '#ffffff' }));
    btn.on('pointerdown', callback);
  }

  private createStarfield(): void {
    const g = this.add.graphics();
    for (let i = 0; i < 120; i++) {
      const x = Phaser.Math.Between(0, GAME.WIDTH);
      const y = Phaser.Math.Between(0, GAME.HEIGHT);
      const size = Phaser.Math.FloatBetween(0.5, 2);
      const alpha = Phaser.Math.FloatBetween(0.2, 0.8);
      g.fillStyle(0xffffff, alpha);
      g.fillCircle(x, y, size);
    }
  }
}

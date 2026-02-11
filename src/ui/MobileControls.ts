import Phaser from 'phaser';
import { GAME } from '../config/constants';

export class MobileControls {
  moveUp = false;
  moveDown = false;
  moveLeft = false;
  moveRight = false;
  shooting = false;
  interact = false;

  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Only show on touch devices
    if (!scene.sys.game.device.input.touch) return;

    this.createDPad();
    this.createActionButtons();
  }

  private createDPad(): void {
    this.container = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(150);

    const baseX = 80;
    const baseY = GAME.HEIGHT - 100;
    const size = 44;
    const gap = 4;

    // Up
    this.addButton(baseX, baseY - size - gap, size, '\u25B2', () => {
      this.moveUp = true;
    }, () => {
      this.moveUp = false;
    });

    // Down
    this.addButton(baseX, baseY + size + gap, size, '\u25BC', () => {
      this.moveDown = true;
    }, () => {
      this.moveDown = false;
    });

    // Left
    this.addButton(baseX - size - gap, baseY, size, '\u25C0', () => {
      this.moveLeft = true;
    }, () => {
      this.moveLeft = false;
    });

    // Right
    this.addButton(baseX + size + gap, baseY, size, '\u25B6', () => {
      this.moveRight = true;
    }, () => {
      this.moveRight = false;
    });
  }

  private createActionButtons(): void {
    const shootX = GAME.WIDTH - 80;
    const shootY = GAME.HEIGHT - 100;

    // Shoot button
    this.addButton(shootX, shootY, 54, 'FIRE', () => {
      this.shooting = true;
    }, () => {
      this.shooting = false;
    });

    // Interact button (E)
    this.addButton(shootX, shootY - 70, 44, 'E', () => {
      this.interact = true;
    }, () => {
      // interact is consumed by GameScene update
    });
  }

  private addButton(
    x: number,
    y: number,
    size: number,
    label: string,
    onDown: () => void,
    onUp: () => void
  ): void {
    const bg = this.scene.add
      .rectangle(x, y, size, size, 0x444466, 0.5)
      .setScrollFactor(0)
      .setDepth(150)
      .setInteractive();

    const txt = this.scene.add
      .text(x, y, label, {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(151);

    bg.on('pointerdown', () => {
      bg.setFillStyle(0x6666aa, 0.7);
      onDown();
    });
    bg.on('pointerup', () => {
      bg.setFillStyle(0x444466, 0.5);
      onUp();
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(0x444466, 0.5);
      onUp();
    });

    if (this.container) {
      this.container.add([bg, txt]);
    }
  }
}

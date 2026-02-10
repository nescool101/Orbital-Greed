import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    // No external assets — all generated graphics
    this.scene.start('Menu');
  }
}

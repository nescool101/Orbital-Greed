import Phaser from 'phaser';
import { GAME } from '../config/constants';

export class WarningOverlay {
  scene: Phaser.Scene;
  vignette: Phaser.GameObjects.Graphics;
  warningText: Phaser.GameObjects.Text;
  visible: boolean = false;
  private pulseTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Red vignette overlay
    this.vignette = scene.add.graphics().setDepth(90).setAlpha(0);
    this.vignette.fillStyle(0xff0000, 0.15);
    this.vignette.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);

    // Warning text
    this.warningText = scene.add
      .text(GAME.WIDTH / 2, GAME.HEIGHT - 80, 'LEAVE NOW', {
        fontSize: '28px',
        color: '#ff2222',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(95)
      .setAlpha(0);
  }

  show(): void {
    if (this.visible) return;
    this.visible = true;

    this.pulseTween = this.scene.tweens.add({
      targets: [this.vignette, this.warningText],
      alpha: { from: 0.3, to: 1 },
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  hide(): void {
    this.visible = false;
    if (this.pulseTween) {
      this.pulseTween.stop();
      this.pulseTween = null;
    }
    this.vignette.setAlpha(0);
    this.warningText.setAlpha(0);
  }

  destroy(): void {
    this.hide();
    this.vignette.destroy();
    this.warningText.destroy();
  }
}

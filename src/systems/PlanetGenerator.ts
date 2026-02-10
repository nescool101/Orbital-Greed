import Phaser from 'phaser';
import { PLANETS, ECONOMY } from '../config/constants';
import { PlanetData } from '../state/GameState';

export class PlanetGenerator {
  static generate(count: number): PlanetData[] {
    const planets: PlanetData[] = [];
    const usedPositions: { x: number; y: number }[] = [];

    const shuffledNames = Phaser.Utils.Array.Shuffle([...PLANETS.NAMES]);

    for (let i = 0; i < count; i++) {
      let x: number, y: number;
      let attempts = 0;

      do {
        x = Phaser.Math.Between(100, 700);
        y = Phaser.Math.Between(100, 500);
        attempts++;
      } while (
        usedPositions.some(
          (p) => Phaser.Math.Distance.Between(p.x, p.y, x, y) < 120
        ) &&
        attempts < 100
      );

      usedPositions.push({ x, y });

      const riskLevel = Phaser.Math.Between(PLANETS.MIN_RISK, PLANETS.MAX_RISK);

      planets.push({
        id: i,
        x,
        y,
        name: shuffledNames[i] || `Planet-${i}`,
        riskLevel,
        rewardRate: ECONOMY.BASE_REWARD_RATE * (1 + riskLevel * 0.5),
        defenseMultiplier: 0.8 + riskLevel * 0.4,
        color: this.riskToColor(riskLevel),
      });
    }

    return planets;
  }

  static riskToColor(risk: number): number {
    const colors = [0x44ff44, 0x88ff00, 0xffff00, 0xff8800, 0xff2200];
    return colors[risk - 1] || 0xffffff;
  }
}

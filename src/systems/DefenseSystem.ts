import { DEFENSE } from '../config/constants';

export class DefenseSystem {
  static calculateDamage(
    secondsStayed: number,
    planetRisk: number,
    armorLevel: number,
    shieldLevel: number
  ): number {
    const graceSeconds = DEFENSE.SAFE_SECONDS + shieldLevel * 2;
    if (secondsStayed <= graceSeconds) return 0;

    const elapsed = secondsStayed - graceSeconds;
    const planetMultiplier = 0.8 + planetRisk * 0.4;
    const rawDamage =
      DEFENSE.BASE_DAMAGE *
      Math.pow(DEFENSE.ESCALATION_BASE, elapsed) *
      planetMultiplier;

    const armorReduction = 1 - armorLevel * 0.08;
    return Math.max(1, rawDamage * armorReduction);
  }

  static getGraceSeconds(shieldLevel: number): number {
    return DEFENSE.SAFE_SECONDS + shieldLevel * 2;
  }
}

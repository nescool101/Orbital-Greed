import { GAME, ECONOMY } from '../config/constants';
import { UPGRADES, getUpgradeCost } from '../config/upgradeData';
import { GameState } from '../state/GameState';

export class EconomySystem {
  static getUpgradeCost(level: number): number {
    return getUpgradeCost(level);
  }

  static getUpgrades() {
    return UPGRADES;
  }

  static calculateReward(riskLevel: number): number {
    return Math.floor(
      ECONOMY.BASE_REWARD_RATE * (1 + riskLevel * ECONOMY.RISK_REWARD_MULTIPLIER)
    );
  }

  static getFuelCost(state: GameState): number {
    const reduction = 1 - state.engineLevel * 0.15;
    return Math.max(2, Math.floor(GAME.FUEL_PER_TRAVEL * reduction));
  }

  static canAffordHyperdrive(state: GameState): boolean {
    return state.credits >= ECONOMY.HYPERDRIVE_COST;
  }

  static buyUpgrade(state: GameState, upgradeId: string): boolean {
    const upgrade = UPGRADES.find((u) => u.id === upgradeId);
    if (!upgrade) return false;

    const currentLevel = (state as any)[`${upgradeId}Level`] as number;
    if (currentLevel >= upgrade.maxLevel) return false;

    const cost = getUpgradeCost(currentLevel);
    if (state.credits < cost) return false;

    state.credits -= cost;
    (state as any)[`${upgradeId}Level`] = currentLevel + 1;
    return true;
  }
}

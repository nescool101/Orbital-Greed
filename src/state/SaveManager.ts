import { GameState } from './GameState';

export class SaveManager {
  private static KEY = 'orbital-greed-save';

  static save(state: GameState): void {
    const data = {
      health: state.health,
      maxHealth: state.maxHealth,
      fuel: state.fuel,
      maxFuel: state.maxFuel,
      credits: state.credits,
      lastShipX: state.lastShipX,
      lastShipY: state.lastShipY,
      armorLevel: state.armorLevel,
      engineLevel: state.engineLevel,
      shieldLevel: state.shieldLevel,
      planetsVisited: state.planetsVisited,
      totalEarned: state.totalEarned,
      planets: state.planets,
    };
    localStorage.setItem(this.KEY, JSON.stringify(data));
  }

  static load(): Partial<GameState> | null {
    const raw = localStorage.getItem(this.KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static clear(): void {
    localStorage.removeItem(this.KEY);
  }

  static hasSave(): boolean {
    return localStorage.getItem(this.KEY) !== null;
  }
}

export interface PlanetData {
  id: number;
  x: number;
  y: number;
  name: string;
  riskLevel: number;
  rewardRate: number;
  defenseMultiplier: number;
  color: number;
}

export class GameState {
  private static instance: GameState;

  // Ship
  health: number = 100;
  maxHealth: number = 100;
  fuel: number = 100;
  maxFuel: number = 100;
  credits: number = 0;

  // Progress
  currentPlanet: PlanetData | null = null;
  planetsVisited: number = 0;
  totalEarned: number = 0;

  // Upgrades
  armorLevel: number = 0;
  engineLevel: number = 0;
  shieldLevel: number = 0;

  // Win condition
  hyperdrivePrice: number = 5000;

  // Planets
  planets: PlanetData[] = [];

  static getInstance(): GameState {
    if (!GameState.instance) {
      GameState.instance = new GameState();
    }
    return GameState.instance;
  }

  reset(): void {
    this.health = 100;
    this.maxHealth = 100;
    this.fuel = 100;
    this.maxFuel = 100;
    this.credits = 0;
    this.currentPlanet = null;
    this.planetsVisited = 0;
    this.totalEarned = 0;
    this.armorLevel = 0;
    this.engineLevel = 0;
    this.shieldLevel = 0;
    this.planets = [];
  }
}

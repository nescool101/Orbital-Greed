export const GAME = {
  WIDTH: 800,
  HEIGHT: 600,
  SHIP_SPEED: 200,
  FUEL_PER_TRAVEL: 10,
};

export const DEFENSE = {
  BASE_DAMAGE: 2,
  TICK_INTERVAL: 1000,
  ESCALATION_BASE: 1.18,
  SAFE_SECONDS: 3,
  WARNING_THRESHOLD: 0.6,
};

export const ECONOMY = {
  BASE_REWARD_RATE: 5,
  RISK_REWARD_MULTIPLIER: 2.5,
  HYPERDRIVE_COST: 5000,
  UPGRADE_BASE_COST: 200,
  UPGRADE_COST_SCALE: 1.8,
};

export const PLANETS = {
  COUNT: 6,
  MIN_RISK: 1,
  MAX_RISK: 5,
  NAMES: [
    'Pyraxis', 'Celdros', 'Venmara',
    'Kothurn', 'Zephylos', 'Dravonis',
    'Igloria', 'Nexoth', 'Balmera',
  ],
};

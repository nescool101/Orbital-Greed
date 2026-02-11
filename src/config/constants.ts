export const GAME = {
  WIDTH: 800,
  HEIGHT: 600,
  SHIP_SPEED: 200,
  FUEL_PER_TRAVEL: 10,
};

export const WORLD = {
  WIDTH: 1600,
  HEIGHT: 1200,
  CENTER_X: 800,
  CENTER_Y: 600,
};

export const SHIP = {
  ACCELERATION: 300,
  MAX_SPEED: 250,
  DRAG: 150,
  SHOOT_COOLDOWN: 300,
  FUEL_DRAIN_RATE: 0.5,
  BODY_RADIUS: 12,
};

export const BULLET = {
  SPEED: 450,
  LIFESPAN: 2000,
  RADIUS: 3,
};

export const SUN = {
  RADIUS: 40,
  RAY_INTERVAL: 2000,
  RAY_COUNT: 8,
  RAY_SPEED: 120,
  RAY_LIFESPAN: 6000,
  FUEL_RESTORE: 8,
};

export const ASTEROID = {
  COUNT: 15,
  MIN_SPEED: 20,
  MAX_SPEED: 60,
  RADIUS: 14,
  CREDIT_REWARD: 15,
  SHIP_DAMAGE: 8,
  RESPAWN_DELAY: 3000,
};

export const DEFENSE_PROJECTILE = {
  SPEED: 180,
  LIFESPAN: 3000,
  RADIUS: 5,
  FIRE_RANGE: 200,
  BASE_COOLDOWN: 2000,
  DAMAGE: 10,
};

export const PLANET_PROXIMITY = {
  LAND_RANGE: 100,
  DEFENSE_RANGE: 200,
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

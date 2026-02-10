import { ECONOMY } from './constants';

export interface UpgradeDefinition {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  getEffect: (level: number) => string;
}

export function getUpgradeCost(level: number): number {
  return Math.floor(
    ECONOMY.UPGRADE_BASE_COST * Math.pow(ECONOMY.UPGRADE_COST_SCALE, level)
  );
}

export const UPGRADES: UpgradeDefinition[] = [
  {
    id: 'armor',
    name: 'Hull Plating',
    description: 'Reduces damage taken',
    maxLevel: 5,
    getEffect: (level: number) => `${level * 8}% damage reduction`,
  },
  {
    id: 'engine',
    name: 'Ion Thrusters',
    description: 'Reduces fuel cost per trip',
    maxLevel: 5,
    getEffect: (level: number) => `${level * 15}% fuel savings`,
  },
  {
    id: 'shield',
    name: 'Energy Shield',
    description: 'Extends safe period on planets',
    maxLevel: 3,
    getEffect: (level: number) => `+${level * 2}s grace period`,
  },
];

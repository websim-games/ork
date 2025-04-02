// Helper functions for monster-related calculations
export function getOrkMaxHealth(level, config) {
  return config.monsters.ork.baseHealth + (config.monsters.ork.upgrade.healthIncreasePerLevel * level);
}


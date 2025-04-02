export const config = {
  // Base game settings
  baseGold: 1,
  baseDamage: 1,
  orkMaxHealth: 25,
  
  // Visual settings
  animations: {
    hit: {
      scaleDuration: 90,
      scaleAmount: 0.9
    },
    defeat: {
      duration: 320,
      scale: 0
    },
    superHit: {
      duration: 800,
      glowBrightness: 1.5,
      glowSaturation: 1.5,
      glowDuration: 100,
      emoji: '🥊',
      fontSize: '100px'
    }
  },

  // Game progression
  upgrades: {
    gloves: {
      name: "Better Gloves",
      description: "Increase damage by {damage}",
      baseCost: 10,
      costMultiplier: 1.2, 
      damage: 1,
      unlockCondition: null 
    },
    training: {
      name: "Training",
      description: "Increase damage by {damage}",
      baseCost: 25,
      costMultiplier: 1.2,
      damage: 2,
      unlockCondition: null
    },
    powerGloves: {
      name: "Power Gloves",
      description: "Increase damage by {damage}",
      baseCost: 50,
      costMultiplier: 1.25,
      damage: 5,
      unlockCondition: {
        type: 'orkLevel',
        level: 2
      }
    },
    martialArts: {
      name: "Martial Arts",
      description: "Increase damage by {damage}",
      baseCost: 100,
      costMultiplier: 1.3,
      damage: 10,
      unlockCondition: {
        type: 'orkLevel',
        level: 2
      }
    }
  },

  boosts: {
    'double-damage': {
      name: "Double Damage",
      description: "2x damage for {duration} seconds",
      cost: 50,
      duration: 30,
      multiplier: 2,
      stackable: false,
      refreshDuration: true 
    },
    'gold-rush': {
      name: "Gold Rush", 
      description: "2x gold for {duration} seconds",
      cost: 50,
      duration: 30,
      multiplier: 2,
      stackable: false,
      refreshDuration: true
    }
  },

  abilities: {
    'super-hit': {
      name: "Super Hit",
      description: "{chance}% chance to deal +{power}% damage",
      initialCost: 100,
      unlockCondition: null,
      chanceUpgrade: {
        name: "Improve Super Hit Chance",
        description: "Current chance: {chance}%",
        baseChance: 2,
        costPerLevel: 50,
        increasePerLevel: 2,
        maxLevel: null 
      },
      powerUpgrade: {
        name: "Improve Super Hit Power",
        description: "Current power: +{power}%",
        basePower: 20,
        costPerLevel: 75,
        increasePerLevel: 20,
        maxLevel: null
      }
    }
  },

  monsters: {
    'ork': {
      name: "Ork",
      description: "A basic ork",
      baseHealth: 25,
      baseGold: 1,
      upgrade: {
        name: "Upgrade Ork",
        description: "Current: HP {health}, Gold +{gold}\nNext Level: HP {nextHealth}, Gold +{nextGold}",
        costPerLevel: 75,
        healthIncreasePerLevel: 25,
        goldIncreasePerLevel: 1,
        maxLevel: null
      }
    }
  },

  // UI Settings
  ui: {
    numberFormatting: {
      maxDecimals: 3,
      trimTrailingZeros: true
    },
    defaultTheme: 'dark',
    defaultEffectsLevel: 'all',
    shopTabs: [
      {id: 'upgrades', label: 'Upgrades'},
      {id: 'boosts', label: 'Boosts'},
      {id: 'abilities', label: 'Special Abilities'},
      {id: 'monsters', label: 'Monsters'}
    ]
  }
};
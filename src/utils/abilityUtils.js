import { config } from '../config.js';

export function getSuperHitChanceText(level) {
    const currentChance = config.abilities['super-hit'].chanceUpgrade.baseChance +
        (config.abilities['super-hit'].chanceUpgrade.increasePerLevel * level);
    return `Current chance: ${currentChance}%`;
}

export function getSuperHitPowerText(level) {
    const currentPower = config.abilities['super-hit'].powerUpgrade.basePower +
        (config.abilities['super-hit'].powerUpgrade.increasePerLevel * level);
    return `Current power: +${currentPower}%`;
}
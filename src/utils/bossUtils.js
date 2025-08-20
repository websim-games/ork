import { config } from '../config.js';

export function isBossMonster(killCount) {
    const frequency = config.monsters.ork.boss.frequency;
    return (killCount + 1) % frequency === 0;
}

export function getBossHealth(baseHealth) {
    return baseHealth * config.monsters.ork.boss.healthMultiplier;
}

export function getBossGold(baseGold) {
    return baseGold * config.monsters.ork.boss.goldMultiplier;
}

export function getKillCountForMonster(type, data) {
    return data.orksKilled;
}


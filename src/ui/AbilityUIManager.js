import { formatNumber } from '../utils/formatUtils.js';
import { getSuperHitChanceText, getSuperHitPowerText } from '../utils/abilityUtils.js';

export class AbilityUIManager {
    static updateAbilityButtons(data, config) {
        const superHitChanceBtn = document.querySelector('[data-item="super-hit-chance"]');
        if (superHitChanceBtn) {
            const level = data.abilities['super-hit'].chanceLevel;
            const maxLevel = config.abilities['super-hit'].chanceUpgrade.maxLevel;
            
            if (level >= maxLevel) {
                superHitChanceBtn.textContent = "MAX LEVEL";
                superHitChanceBtn.disabled = true;
            } else {
                const cost = config.abilities['super-hit'].chanceUpgrade.costPerLevel * (level + 1);
                superHitChanceBtn.textContent = `Upgrade (${formatNumber(cost)} gold)`;
                superHitChanceBtn.disabled = data.gold < cost;
            }

            const chanceDesc = superHitChanceBtn.closest('.shop-item-content').querySelector('p');
            if (chanceDesc) {
                chanceDesc.textContent = getSuperHitChanceText(level);
            }
        }
    }
}


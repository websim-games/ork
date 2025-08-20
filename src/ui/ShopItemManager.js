import { formatNumber } from '../utils/formatUtils.js';

export class ShopItemManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.buyButtons = [];
        
        this.initializeElements();
        this.initializeEventListeners();
    }

    initializeElements() {
        this.buyButtons = document.querySelectorAll('.buy-btn');
    }

    initializeEventListeners() {
        this.buyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.uiManager.game.buyItem(e.target.dataset.item));
        });
    }

    updateBuyButtonStates() {
        this.buyButtons = document.querySelectorAll('.buy-btn');
        
        this.buyButtons.forEach(btn => {
            const item = btn.dataset.item;
            let cost;

            if (this.uiManager.config.upgrades[item]) {
                const purchaseCount = this.uiManager.data.upgradeCounts[item] || 0;
                cost = Math.floor(this.uiManager.config.upgrades[item].baseCost * Math.pow(this.uiManager.config.upgrades[item].costMultiplier, purchaseCount));
                btn.disabled = this.uiManager.data.gold < cost;
                btn.textContent = `Buy (${cost} gold)`;
            } else if (this.uiManager.config.boosts[item]) {
                const isBoostActive = this.uiManager.data.activeBoosts.has(item);
                cost = this.uiManager.config.boosts[item].cost;
                btn.disabled = this.uiManager.data.gold < cost || isBoostActive;
                btn.textContent = isBoostActive ? "Active" : `Buy (${cost} gold)`;
            } else if (item === 'super-hit') {
                cost = this.uiManager.config.abilities['super-hit'].initialCost;
                btn.disabled = this.uiManager.data.gold < cost || this.uiManager.data.abilities['super-hit'].owned;
                btn.textContent = this.uiManager.data.abilities['super-hit'].owned ? "Owned" : `Buy (${cost} gold)`;
            } else if (item === 'super-hit-chance') {
                const maxLevel = this.uiManager.config.abilities['super-hit'].chanceUpgrade.maxLevel;
                const level = this.uiManager.data.abilities['super-hit'].chanceLevel;
                if (level >= maxLevel) {
                    btn.textContent = "MAX LEVEL";
                    btn.disabled = true;
                } else {
                    cost = this.uiManager.config.abilities['super-hit'].chanceUpgrade.costPerLevel * (level + 1);
                    btn.disabled = this.uiManager.data.gold < cost;
                    btn.textContent = `Upgrade (${formatNumber(cost)} gold)`;
                }
            } else if (item === 'super-hit-power') {
                const level = this.uiManager.data.abilities['super-hit'].powerLevel;
                cost = this.uiManager.config.abilities['super-hit'].powerUpgrade.costPerLevel * (level + 1);
                btn.disabled = this.uiManager.data.gold < cost;
                btn.textContent = `Upgrade (${formatNumber(cost)} gold)`;
            }
        });
    }

    updateMonsterUpgradeDisplay() {
        const orkStats = document.getElementById('ork-stats');
        const orkNextLevel = document.getElementById('ork-next-level');
        const orkUpgradeBtn = document.querySelector('[data-item="ork-upgrade"]');

        if (orkStats && orkNextLevel && orkUpgradeBtn) {
            const currentLevel = this.uiManager.data.monsters.ork.level;
            const currentHealth = this.uiManager.config.monsters.ork.baseHealth + 
                (this.uiManager.config.monsters.ork.upgrade.healthIncreasePerLevel * currentLevel);
            const currentGold = this.uiManager.config.monsters.ork.baseGold + 
                (this.uiManager.config.monsters.ork.upgrade.goldIncreasePerLevel * currentLevel);

            const nextHealth = currentHealth + this.uiManager.config.monsters.ork.upgrade.healthIncreasePerLevel;
            const nextGold = currentGold + this.uiManager.config.monsters.ork.upgrade.goldIncreasePerLevel;
            const nextCost = this.uiManager.config.monsters.ork.upgrade.costPerLevel * (currentLevel + 1);

            orkStats.textContent = `Current: HP ${formatNumber(currentHealth)}, Gold +${formatNumber(currentGold)}`;
            orkNextLevel.textContent = `Next Level: HP ${formatNumber(nextHealth)}, Gold +${formatNumber(nextGold)}`;
            orkUpgradeBtn.textContent = `Upgrade (${formatNumber(nextCost)} gold)`;
            orkUpgradeBtn.disabled = this.uiManager.data.gold < nextCost;
        }
    }
}
import { config } from '../config.js';

export class SectionUnlockManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.data = uiManager.data;
    }

    updateSectionUnlocks() {
        const boostsTab = document.querySelector('[data-tab="boosts"]');
        if (boostsTab) {
            const boostsUnlocked = this.data.totalGoldEarned >= config.unlocks.boosts.requiredGold;
            this.updateTabVisibility(boostsTab, 'boosts', boostsUnlocked);
        }

        const abilitiesTab = document.querySelector('[data-tab="abilities"]');
        if (abilitiesTab) {
            const abilitiesUnlocked = this.data.totalGoldEarned >= config.unlocks.abilities.requiredGold;
            this.updateTabVisibility(abilitiesTab, 'abilities', abilitiesUnlocked);
        }

        const monstersTab = document.querySelector('[data-tab="monsters"]');
        if (monstersTab) {
            const monstersUnlocked = this.data.bossesKilled >= config.unlocks.monsters.requiredBossKills;
            this.updateTabVisibility(monstersTab, 'monsters', monstersUnlocked);
            
            // If monsters tab is active but gets locked, switch to upgrades tab
            if (!monstersUnlocked && monstersTab.classList.contains('active')) {
                const upgradesTab = document.querySelector('[data-tab="upgrades"]');
                if (upgradesTab) {
                    upgradesTab.click();
                }
            }
        }
    }

    updateTabVisibility(tabButton, tabId, isUnlocked) {
        tabButton.style.display = isUnlocked ? 'block' : 'none';
        const tabContent = document.getElementById(tabId);
        
        if (tabContent) {
            if (isUnlocked) {
                tabContent.classList.remove('locked');
            } else {
                tabContent.classList.add('locked');
                
                if (tabButton.classList.contains('active')) {
                    const upgradesTab = document.querySelector('[data-tab="upgrades"]');
                    if (upgradesTab) {
                        upgradesTab.click();
                    }
                }
            }
        }
    }
}
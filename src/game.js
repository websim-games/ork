import { config } from './config.js';
import UIManager from './ui/UIManager.js';
import { getOrkMaxHealth } from './utils/monsterUtils.js';
import { formatNumber } from './utils/formatUtils.js';
import { GameState } from './GameState.js';
import { checkUnlockConditions } from './utils/unlockUtils.js';
import { isBossMonster, getBossHealth, getBossGold, getKillCountForMonster } from './utils/bossUtils.js';
import { StatsManager } from './ui/StatsManager.js';

class Game {
    constructor() {
        this.room = new WebsimSocket();
        
        // Initialize data structure 
        this.data = {
            gameStateId: null,
            gold: null,
            damage: null,
            orkHealth: null,
            activeBoosts: new Map(),
            totalDamageDealt: 0,
            orksKilled: 0,
            totalGoldEarned: 0,
            bossesKilled: 0,
            totalGoldSpent: 0,
            currentTheme: 'dark', // Default theme
            isResetting: false, // Add this new property
            abilities: {
                'super-hit': {
                    owned: false,
                    chanceLevel: 0,
                    powerLevel: 0
                }
            },
            effectsEnabled: true,
            effectsLevel: 'all',  // Update default to 'all'
            monsters: {
                'ork': {
                    level: 0
                }
            },
            upgradeCounts: {}, // Add upgrade counts
            currentBoss: null
        };

        // Initialize UI Manager and Stats Manager
        this.uiManager = new UIManager(this, config);
        this.statsManager = new StatsManager(this.uiManager);
        
        // After UIManager initialization and before loading game state
        this.initialized = false;
        
        // Load game state
        this.gameState = new GameState(this.room, this.data);
        this.gameState.loadGameState(this.uiManager).then(() => {
            this.initialized = true;
            this.uiManager.setTheme(this.data.currentTheme);
            this.uiManager.updateUI();
            // Update coin display after game state loads
            if (this.uiManager.coinManager) {
                this.uiManager.coinManager.updateGoldAmount(this.data.gold);
            }
        });
        
        this.checkUnlockConditions = () => {
            const shopBtn = document.querySelector('[data-button="shop"]');
            const statsBtn = document.querySelector('[data-button="stats"]');
            
            // Handle shop button unlock
            if (shopBtn) {
                const shopUnlocked = this.data.orksKilled >= config.unlocks.shop.requiredKills;
                shopBtn.classList.toggle('unlocked', shopUnlocked);
                shopBtn.disabled = !shopUnlocked;
            }
            
            // Handle stats button unlock
            if (statsBtn) {
                const statsUnlocked = this.data.orksKilled >= config.unlocks.stats.requiredKills;
                statsBtn.classList.toggle('unlocked', statsUnlocked);
                statsBtn.disabled = !statsUnlocked;
            }
            
            // Call the existing unlock conditions checker
            checkUnlockConditions(this.data);
        };
    }

    // Helper function to get the current state as a plain object 
    getCurrentStateObject() {
        const activeBoostsObj = {};
        this.data.activeBoosts.forEach((timeoutData, boostType) => {
            // Check if timeoutData and timeoutData.timeout exist before accessing properties
            if (timeoutData && timeoutData.timeout) {
                // Accessing _idleTimeout might be fragile, calculate based on stored endTime if available
                // For simplicity, let's assume we store endTime correctly or approximate
                // If we stored endTime directly:
                // if (timeoutData.endTime && timeoutData.endTime > Date.now()) {
                //	 activeBoostsObj[boostType] = timeoutData.endTime;
                // }
                // Using timeout._idleTimeout (less robust):
                const remainingTime = timeoutData.timeout._idleTimeout;
                if (remainingTime > 0) {
                    const endTime = Date.now() + remainingTime;
                    activeBoostsObj[boostType] = endTime;
                }
            }
        });

        return {
            gold: this.data.gold,
            damage: this.data.damage,
            orkHealth: this.data.orkHealth,
            activeBoosts: activeBoostsObj,
            totalDamageDealt: this.data.totalDamageDealt,
            orksKilled: this.data.orksKilled,
            totalGoldEarned: this.data.totalGoldEarned,
            currentTheme: this.data.currentTheme,
            effectsEnabled: this.data.effectsEnabled,
            effectsLevel: this.data.effectsLevel,
            abilities: this.data.abilities,
            monsters: this.data.monsters
        };
    }

    async saveGameState() {
        await this.gameState.saveGameState(this.uiManager); 
    }

    async hitOrk() {
        if (!this.initialized || !this.uiManager.ui.orkImage || this.data.isResetting) return;

        let totalDamage = Number(formatNumber(this.data.damage));

        // Apply existing boosts
        if (this.data.activeBoosts.has('double-damage')) {
            totalDamage = Number(formatNumber(totalDamage * config.boosts['double-damage'].multiplier));
        }

        // Check for Super Hit proc
        if (this.data.abilities['super-hit'].owned) {
            const chance = config.abilities['super-hit'].chanceUpgrade.baseChance +
                (config.abilities['super-hit'].chanceUpgrade.increasePerLevel * this.data.abilities['super-hit'].chanceLevel);

            if (Math.random() * 100 <= chance) {
                const powerBonus = config.abilities['super-hit'].powerUpgrade.basePower +
                    (config.abilities['super-hit'].powerUpgrade.increasePerLevel * this.data.abilities['super-hit'].powerLevel);
                totalDamage = Number(formatNumber(totalDamage * (1 + powerBonus / 100)));

                // Visual feedback for Super Hit proc
                this.uiManager.showSuperHitEffect();
            }
        }

        this.data.orkHealth = Number(formatNumber(this.data.orkHealth - totalDamage));
        this.data.totalDamageDealt = Number(formatNumber(this.data.totalDamageDealt + totalDamage));

        // Trigger visual feedback on the image directly, only if ork isn't defeated
        if (!this.uiManager.ui.orkImage.classList.contains('defeated')) {
            if (this.data.currentBoss) {
                // Add special boss hit effect if desired
                this.uiManager.ui.orkImage.style.transform = 'scale(0.95)'; // Bosses resist more
            } else {
                this.uiManager.ui.orkImage.style.transform = 'scale(0.9)';
            }
            setTimeout(() => {
                if (!this.uiManager.ui.orkImage.classList.contains('defeated')) {
                    this.uiManager.ui.orkImage.style.transform = 'scale(1)';
                }
            }, 90);
        }

        this.uiManager.updateHealthBar();

        if (this.data.orkHealth <= 0) {
            await this.orkDefeated();
        } else {
            await this.saveGameState();
        }
        this.uiManager.updateUI();
    }

    async orkDefeated() {
        if (!this.initialized || !this.uiManager.ui.orkImage) return;

        this.data.isResetting = true;
        this.data.orksKilled++;

        // Clear any existing inline transform style
        this.uiManager.ui.orkImage.style.transform = '';
        // Add defeated class for shrink animation
        this.uiManager.ui.orkImage.classList.add('defeated');

        // Wait for shrink animation to complete
        await new Promise(resolve => setTimeout(resolve, 320));

        // Calculate gold earned based on monster level and boss status
        let goldEarned = config.monsters.ork.baseGold + 
            (config.monsters.ork.upgrade.goldIncreasePerLevel * this.data.monsters.ork.level);
            
        if (this.data.currentBoss) {
            goldEarned = getBossGold(goldEarned);
            this.data.bossesKilled++; // Increment boss kills
            this.data.currentBoss = null; // Reset boss status
        }
            
        if (this.data.activeBoosts.has('gold-rush')) {
            goldEarned *= config.boosts['gold-rush'].multiplier;
        }

        // Get ork position before defeat animation
        const orkRect = this.uiManager.ui.orkImage.getBoundingClientRect();
        const orkCenterX = orkRect.left + (orkRect.width / 2);
        const orkCenterY = orkRect.top + (orkRect.height / 2);

        // Add coin animation before updating gold
        if (this.uiManager.coinManager) {
            this.uiManager.coinManager.createCoinAnimation(orkCenterX, orkCenterY, goldEarned);
        }

        this.data.gold += goldEarned;
        this.data.totalGoldEarned += goldEarned;
        
        // Check if next monster should be a boss
        const nextIsBoss = isBossMonster(this.data.orksKilled);
    
        // Reset health using the helper function, applying boss multiplier if needed
        let newHealth = getOrkMaxHealth(this.data.monsters.ork.level, config);
        if (nextIsBoss) {
            newHealth = getBossHealth(newHealth);
            this.data.currentBoss = 'ork';
        }
    
        this.data.orkHealth = newHealth;

        // Reset image visual state
        this.uiManager.ui.orkImage.classList.remove('defeated');
        if (nextIsBoss) {
            this.uiManager.ui.orkImage.classList.add('boss');
        } else {
            this.uiManager.ui.orkImage.classList.remove('boss');
        }

        this.data.isResetting = false;

        this.checkUnlockConditions();
        this.statsManager.updateStats(); // Make sure stats are updated when an ork is defeated
        this.uiManager.updateUI();
        await this.saveGameState();
    }

    async buyItem(itemType) {
        if (!this.initialized) return;

        let purchased = false;
        let cost = 0;

        const trackPurchase = (purchaseCost) => {
            this.data.gold -= purchaseCost;
            this.data.totalGoldSpent += purchaseCost;
            return true;
        };

        if (itemType === 'ork-upgrade') {
            const nextLevel = this.data.monsters.ork.level + 1;
            cost = config.monsters.ork.upgrade.costPerLevel * nextLevel;
            
            if (this.data.gold >= cost) {
                purchased = trackPurchase(cost);
                this.data.monsters.ork.level++;
                this.data.orkHealth = getOrkMaxHealth(this.data.monsters.ork.level, config);
                this.checkUnlockConditions();
            }
        } else if (config.upgrades[itemType]) {
            const upgrade = config.upgrades[itemType];
            const purchaseCount = this.data.upgradeCounts[itemType] || 0;
            cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, purchaseCount));
            
            if (this.data.gold >= cost) {
                purchased = trackPurchase(cost);
                this.data.damage += upgrade.damage;
                this.data.upgradeCounts[itemType] = (this.data.upgradeCounts[itemType] || 0) + 1;
            }
        } else if (config.boosts[itemType]) {
            const boost = config.boosts[itemType];
            cost = boost.cost;
            if (this.data.gold >= cost && !this.data.activeBoosts.has(itemType)) {
                purchased = trackPurchase(cost);
                this.activateBoost(itemType, boost.duration, true);
            }
        } else if (itemType === 'super-hit' || itemType.startsWith('super-hit-')) {
            if (itemType === 'super-hit') {
                cost = config.abilities['super-hit'].initialCost;
                if (this.data.gold >= cost && !this.data.abilities['super-hit'].owned) {
                    purchased = trackPurchase(cost);
                    this.data.abilities['super-hit'].owned = true;
                }
            } else if (itemType === 'super-hit-chance' && this.data.abilities['super-hit'].owned) {
                const maxLevel = config.abilities['super-hit'].chanceUpgrade.maxLevel;
                if (this.data.abilities['super-hit'].chanceLevel >= maxLevel) {
                    return;
                }
                cost = config.abilities['super-hit'].chanceUpgrade.costPerLevel * (this.data.abilities['super-hit'].chanceLevel + 1);
                if (this.data.gold >= cost) {
                    purchased = trackPurchase(cost);
                    this.data.abilities['super-hit'].chanceLevel++;
                }
            } else if (itemType === 'super-hit-power' && this.data.abilities['super-hit'].owned) {
                cost = config.abilities['super-hit'].powerUpgrade.costPerLevel * (this.data.abilities['super-hit'].powerLevel + 1);
                if (this.data.gold >= cost) {
                    purchased = trackPurchase(cost);
                    this.data.abilities['super-hit'].powerLevel++;
                }
            }
        }

        if (purchased) {
            this.uiManager.updateUI();
            this.statsManager.updateStats(); 
            await this.saveGameState();
        } else {
            console.log(`Purchase failed for ${itemType}. Cost: ${cost}, Gold: ${this.data.gold}`);
        }
    }

    async activateBoost(boostType, durationSeconds, shouldSave = true) {
        if (!this.initialized) return;

        if (this.data.activeBoosts.has(boostType)) {
            const existingTimeoutData = this.data.activeBoosts.get(boostType);
            clearTimeout(existingTimeoutData.timeout);
            console.log(`Cleared existing timeout for boost: ${boostType}`);
        }

        console.log(`Activating boost ${boostType} for ${durationSeconds} seconds.`);

        const timeoutId = setTimeout(async () => {
            console.log(`Boost ${boostType} expired.`);
            this.data.activeBoosts.delete(boostType);
            await this.saveGameState();
            this.uiManager.updateUI();
        }, durationSeconds * 1000);

        this.data.activeBoosts.set(boostType, { timeout: timeoutId });

        if (shouldSave) {
            await this.saveGameState();
        }
        this.uiManager.updateUI();
    }

    toggleEffects(level) {
        this.data.effectsLevel = level;
        this.saveGameState();
        this.uiManager.updateUI();
    }
}

export default Game;
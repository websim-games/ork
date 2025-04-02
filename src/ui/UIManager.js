import { getOrkMaxHealth } from '../utils/monsterUtils.js';
import { formatNumber } from '../utils/formatUtils.js';
import { getSuperHitChanceText, getSuperHitPowerText } from '../utils/abilityUtils.js';

class UIManager {
    constructor(gameInstance, config) {
        this.game = gameInstance; // Reference to the main game logic
        this.config = config;    // Reference to the game config
        this.data = gameInstance.data; // Shortcut to game data
        this.data.effectsEnabled = true; // Add default effects setting
        this.data.effectsLevel = 'all'; // Update default to 'all'

        // Structure for UI elements
        this.ui = {
            orkImage: null, // Specifically the image
            healthBarFill: null, // The fill part of the health bar
            goldDisplay: null,
            damageDisplay: null,
            modals: {
                shop: null,
                stats: null,
                settings: null,
            },
            buttons: {
                shop: null,
                stats: null,
                settings: null,
                shopClose: null,
                statsClose: null,
                settingsClose: null,
                buy: [],
                tab: [],
                theme: [],
                effects: null
            },
            statsDisplays: {
                totalDamage: null,
                orksKilled: null,
                totalGold: null
            }
        };

        this.initializeElements();
        this.initializeEventListeners();
        this.initializeTheme();
    }

    // Populate the this.ui object with DOM element references
    initializeElements() {
        this.ui.orkImage = document.getElementById('ork-image'); // Target the image
        this.ui.healthBarFill = document.getElementById('health-fill'); // Target the fill div
        this.ui.goldDisplay = document.getElementById('gold-amount');
        this.ui.damageDisplay = document.getElementById('damage-amount');

        // Modals
        this.ui.modals.shop = document.getElementById('shop-modal');
        this.ui.modals.stats = document.getElementById('stats-modal');
        this.ui.modals.settings = document.getElementById('settings-modal');

        // Buttons
        this.ui.buttons.shop = document.getElementById('shop-btn');
        this.ui.buttons.stats = document.getElementById('stats-btn');
        this.ui.buttons.settings = document.getElementById('settings-btn');

        // Close buttons
        this.ui.buttons.shopClose = this.ui.modals.shop?.querySelector('.close-btn');
        this.ui.buttons.statsClose = this.ui.modals.stats?.querySelector('.close-btn'); // Use the existing query selector logic
        this.ui.buttons.settingsClose = this.ui.modals.settings?.querySelector('.close-btn'); // Use the existing query selector logic

        this.ui.buttons.buy = document.querySelectorAll('.buy-btn');
        this.ui.buttons.tab = document.querySelectorAll('.tab-btn');
        this.ui.buttons.theme = document.querySelectorAll('.theme-btn');
        this.ui.buttons.effects = document.querySelector('.effects-btn');

        // Stats Displays
        this.ui.statsDisplays.totalDamage = document.getElementById('total-damage-stat');
        this.ui.statsDisplays.orksKilled = document.getElementById('orks-killed-stat');
        this.ui.statsDisplays.totalGold = document.getElementById('total-gold-stat');

        // Error checking
        if (!this.ui.orkImage) console.error("Ork image element not found!");
        if (!this.ui.healthBarFill) console.error("Health bar fill element not found!");
        if (!this.ui.modals.shop) console.error("Shop modal not found!");
        if (!this.ui.modals.stats) console.error("Stats modal not found!");
        if (!this.ui.modals.settings) console.error("Settings modal not found!");
        // Add checks for close buttons if needed
    }

    createParticle(x, y) {
        // Only create particles if effects are minimal or all
        if (this.data.effectsLevel === 'none') return;

        const particle = document.createElement('div');
        particle.className = 'particle';

        // Random size between 5-15px
        const size = 5 + Math.random() * 10;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        // Position at click point
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        // Random direction
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 50;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);

        document.body.appendChild(particle);

        // Remove after animation
        setTimeout(() => particle.remove(), 500);
    }

    spawnParticles(x, y) {
        if (!this.data.effectsEnabled) return;

        // Create multiple particles
        for (let i = 0; i < 8; i++) {
            this.createParticle(x, y);
        }
    }

    // Add event listeners using elements from this.ui
    initializeEventListeners() {
        // Modify existing ork click handler to include particle effects
        this.ui.orkImage?.addEventListener('mousedown', (e) => {
            // Only spawn particles if not defeated
            if (!this.ui.orkImage.classList.contains('defeated')) {
                const rect = this.ui.orkImage.getBoundingClientRect();
                // Calculate relative click position on the ork
                const x = e.clientX;
                const y = e.clientY;
                this.spawnParticles(x, y);
            }
            this.game.hitOrk();
        });

        // Modal Open Buttons
        this.ui.buttons.shop?.addEventListener('click', () => this.openModal('shop'));
        this.ui.buttons.stats?.addEventListener('click', () => this.openModal('stats'));
        this.ui.buttons.settings?.addEventListener('click', () => this.openModal('settings'));

        // Modal Close Buttons
        this.ui.buttons.shopClose?.addEventListener('click', () => this.closeModal('shop'));
        this.ui.buttons.statsClose?.addEventListener('click', () => this.closeModal('stats'));
        this.ui.buttons.settingsClose?.addEventListener('click', () => this.closeModal('settings'));

        // Other Buttons
        this.ui.buttons.tab.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e));
        });
        this.ui.buttons.buy.forEach(btn => {
            // Pass the item type to the game's buyItem method
            btn.addEventListener('click', (e) => this.game.buyItem(e.target.dataset.item));
        });
        this.ui.buttons.theme.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleThemeButtonClick(e));
        });
    }

    // Generic modal opener
    openModal(modalName) {
        if (this.ui.modals[modalName]) {
            if (modalName === 'stats') {
                this.updateStatsUI(); // Ensure stats are fresh when opening
            }
            this.ui.modals[modalName].style.display = 'block';
        } else {
            console.error(`Modal "${modalName}" not found in ui.modals`);
        }
    }

    // Generic modal closer
    closeModal(modalName) {
        if (this.ui.modals[modalName]) {
            this.ui.modals[modalName].style.display = 'none';
        } else {
            console.error(`Modal "${modalName}" not found in ui.modals`);
        }
    }

    switchTab(e) {
        const tabId = e.target.dataset.tab;
        const modalContent = e.target.closest('.modal-content');
        if (!modalContent || !tabId) return;

        const currentActiveBtn = modalContent.querySelector('.tab-btn.active');
        const currentActiveContent = modalContent.querySelector('.tab-content.active');
        currentActiveBtn?.classList.remove('active');
        currentActiveContent?.classList.remove('active');

        e.target.classList.add('active');
        const newTabContent = modalContent.querySelector(`#${tabId}`);
        newTabContent?.classList.add('active');
    }

    // Central UI update function
    updateUI() {
        if (!this.game.initialized) return;

        // Update Gold and Damage display
        this.ui.goldDisplay.textContent = formatNumber(this.data.gold);

        let displayDamage = this.data.damage;
        const damageBoostMultiplier = this.config.boosts['double-damage']?.multiplier || 1;
        const damageElement = this.ui.damageDisplay.parentElement;

        if (this.data.activeBoosts.has('double-damage')) {
            displayDamage *= damageBoostMultiplier;
            damageElement?.classList.add('boosted');
        } else {
            damageElement?.classList.remove('boosted');
        }
        this.ui.damageDisplay.textContent = formatNumber(displayDamage);

        // Update Buy Button states
        this.ui.buttons.buy.forEach(btn => {
            const item = btn.dataset.item;
            let cost;

            if (this.config.upgrades[item]) {
                const purchaseCount = this.data.upgradeCounts[item] || 0;
                cost = Math.floor(this.config.upgrades[item].baseCost * Math.pow(this.config.upgrades[item].costMultiplier, purchaseCount));
                btn.disabled = this.data.gold < cost;
                btn.textContent = `Buy (${cost} gold)`;
            } else if (this.config.boosts[item]) {
                const isBoost = true;
                const isBoostActive = isBoost && this.data.activeBoosts.has(item);
                cost = this.config.boosts[item].cost;
                btn.disabled = this.data.gold < cost || isBoostActive;
                btn.textContent = isBoostActive ? "Active" : `Buy (${cost} gold)`;
            }
        });

        // Update ability button states and visibility
        const superHitOwned = this.data.abilities['super-hit'].owned;
        document.getElementById('abilities').setAttribute('data-super-hit-owned', superHitOwned);

        const superHitBtn = document.querySelector('[data-item="super-hit"]');
        const superHitChanceBtn = document.querySelector('[data-item="super-hit-chance"]');
        const superHitPowerBtn = document.querySelector('[data-item="super-hit-power"]');

        if (superHitBtn) {
            if (!superHitOwned) {
                superHitBtn.textContent = `Buy (${this.config.abilities['super-hit'].initialCost} gold)`;
                superHitBtn.disabled = this.data.gold < this.config.abilities['super-hit'].initialCost;
            } else {
                superHitBtn.textContent = "Purchased";
                superHitBtn.disabled = true;
            }
        }

        if (superHitChanceBtn && superHitOwned) {
            const level = this.data.abilities['super-hit'].chanceLevel;
            const cost = this.config.abilities['super-hit'].chanceUpgrade.costPerLevel * (level + 1);
            superHitChanceBtn.textContent = `Upgrade (${cost} gold)`;
            superHitChanceBtn.disabled = this.data.gold < cost;

            const chanceDesc = superHitChanceBtn.closest('.shop-item-content').querySelector('p');
            if (chanceDesc) {
                chanceDesc.textContent = getSuperHitChanceText(level);
            }
        }

        if (superHitPowerBtn && superHitOwned) {
            const level = this.data.abilities['super-hit'].powerLevel;
            const cost = this.config.abilities['super-hit'].powerUpgrade.costPerLevel * (level + 1);
            superHitPowerBtn.textContent = `Upgrade (${cost} gold)`;
            superHitPowerBtn.disabled = this.data.gold < cost;

            const powerDesc = superHitPowerBtn.closest('.shop-item-content').querySelector('p');
            if (powerDesc) {
                powerDesc.textContent = getSuperHitPowerText(level);
            }
        }

        this.updateHealthBar();
        this.updateStatsUI();

        // Update effects buttons state
        const effectsBtns = document.querySelectorAll('.effects-btn');
        effectsBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.effectsBtn === this.data.effectsLevel) {
                btn.classList.add('active');
            }
        });

        // Update monster upgrade stats and button
        const orkStats = document.getElementById('ork-stats');
        const orkNextLevel = document.getElementById('ork-next-level');
        const orkUpgradeBtn = document.querySelector('[data-item="ork-upgrade"]');

        if (orkStats && orkNextLevel && orkUpgradeBtn) {
            const currentLevel = this.data.monsters.ork.level;
            const currentHealth = this.config.monsters.ork.baseHealth + 
                (this.config.monsters.ork.upgrade.healthIncreasePerLevel * currentLevel);
            const currentGold = this.config.monsters.ork.baseGold + 
                (this.config.monsters.ork.upgrade.goldIncreasePerLevel * currentLevel);

            const nextHealth = currentHealth + this.config.monsters.ork.upgrade.healthIncreasePerLevel;
            const nextGold = currentGold + this.config.monsters.ork.upgrade.goldIncreasePerLevel;
            const nextCost = this.config.monsters.ork.upgrade.costPerLevel * (currentLevel + 1);

            orkStats.textContent = `Current: HP ${formatNumber(currentHealth)}, Gold +${formatNumber(currentGold)}`;
            orkNextLevel.textContent = `Next Level: HP ${formatNumber(nextHealth)}, Gold +${formatNumber(nextGold)}`;
            orkUpgradeBtn.textContent = `Upgrade (${formatNumber(nextCost)} gold)`;
            orkUpgradeBtn.disabled = this.data.gold < nextCost;
        }
    }

    // Specific function to update only the health bar visual
    updateHealthBar() {
        if (!this.game.initialized || !this.ui.healthBarFill) return;
        // Calculate max health based on current ork level
        const maxHealth = getOrkMaxHealth(this.data.monsters.ork.level, this.config);
        // Ensure health doesn't go below 0 visually
        const healthPercentage = Math.max(0, (this.data.orkHealth / maxHealth) * 100);
        this.ui.healthBarFill.style.width = `${healthPercentage}%`;

        // Reset health bar instantly if ork was defeated and health is full
        if (this.data.orkHealth === maxHealth && healthPercentage === 100) {
            void this.ui.healthBarFill.offsetWidth;
            this.ui.healthBarFill.style.width = '100%';
        }
    }

    // Update the stats displayed in the Stats modal
    updateStatsUI() {
        if (!this.game.initialized || !this.ui.statsDisplays.totalDamage) return;
        this.ui.statsDisplays.totalDamage.textContent = this.data.totalDamageDealt;
        this.ui.statsDisplays.orksKilled.textContent = this.data.orksKilled;
        this.ui.statsDisplays.totalGold.textContent = this.data.totalGoldEarned;
    }

    // Initialize theme based on saved preference or system setting
    initializeTheme() {
        // Apply initial theme based on game data (which is loaded before UIManager is fully ready)
        // The actual application happens in loadGameState calling setTheme -> applyThemePreference
        // This mainly sets up the listener for system changes.
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (this.data.currentTheme === 'system') {
                this.applyThemePreference();
            }
        });
    }

    // Handles clicking on a theme button
    handleThemeButtonClick(e) {
        const theme = e.target.dataset.themeBtn;
        if (theme) {
            this.setTheme(theme);
            this.game.saveGameState(); // Tell the game to save the state
        }
    }

    // Sets the theme preference in data, updates UI, and applies the theme
    setTheme(theme) {
        if (!['light', 'dark', 'system'].includes(theme)) {
            console.warn(`Invalid theme selected: ${theme}. Defaulting to dark.`);
            theme = 'dark';
        }

        this.data.currentTheme = theme;

        // Update button active states
        this.ui.buttons.theme.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.themeBtn === theme);
        });

        this.applyThemePreference();
    }

    // Applies the actual 'light' or 'dark' theme based on the current preference
    applyThemePreference() {
        let themeToApply = this.data.currentTheme;
        if (themeToApply === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            themeToApply = prefersDark ? 'dark' : 'light';
        }
        document.documentElement.setAttribute('data-theme', themeToApply);
        localStorage.setItem('activeTheme', themeToApply);
    }

    showSuperHitEffect() {
        if (!this.ui.orkImage || this.data.effectsLevel === 'none' || this.data.effectsLevel === 'minimal') return;

        // Add a flash effect - only shown when effects are set to 'all'
        this.ui.orkImage.style.filter = 'brightness(1.5) saturate(1.5)';
        setTimeout(() => {
            this.ui.orkImage.style.filter = '';
        }, 100);

        // Show glove punch animation only when effects are set to 'all'
        if (this.data.effectsLevel === 'all') {
            const glove = document.createElement('div');
            glove.className = 'super-hit-glove';
            glove.textContent = '🥊';
            document.body.appendChild(glove);
            
            // Remove the glove after animation completes
            glove.addEventListener('animationend', () => {
                glove.remove();
            });
        }
    }
}

export default UIManager;
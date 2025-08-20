import { getOrkMaxHealth } from '../utils/monsterUtils.js';
import { formatNumber } from '../utils/formatUtils.js';
import { getSuperHitChanceText, getSuperHitPowerText } from '../utils/abilityUtils.js';
import { getBossHealth } from '../utils/bossUtils.js';
import { HealthLabels } from './HealthLabels.js';
import { StrengthManager } from './StrengthManager.js';
import { CoinManager } from './CoinManager.js';
import { AbilityUIManager } from './AbilityUIManager.js';
import { SectionUnlockManager } from './SectionUnlockManager.js';
import { ModalManager } from './ModalManager.js';
import { ThemeManager } from './ThemeManager.js';
import { EffectsManager } from './EffectsManager.js';
import { ShopItemManager } from './ShopItemManager.js';

class UIManager {
    constructor(gameInstance, config) {
        this.game = gameInstance; 
        this.config = config;    
        this.data = gameInstance.data; 
        
        // Initialize focused managers
        this.coinManager = new CoinManager(this);
        this.healthLabels = new HealthLabels(this);
        this.strengthManager = new StrengthManager(this);
        this.sectionUnlockManager = new SectionUnlockManager(this);
        this.modalManager = new ModalManager(this);
        this.themeManager = new ThemeManager(this);
        this.effectsManager = new EffectsManager(this);
        this.shopItemManager = new ShopItemManager(this);
        
        this.data.effectsEnabled = true; 
        this.data.effectsLevel = 'all'; 
        
        // Structure for core UI elements
        this.ui = {
            orkImage: null, 
            healthBarFill: null, 
            goldDisplay: null,
            damageDisplay: null,
            buttons: {
                shop: null,
                stats: null,
                settings: null,
                tab: [],
                effects: []
            },
            statsDisplays: {
                totalDamage: null,
                orksKilled: null,
                totalGold: null
            }
        };

        this.initializeCoreElements();
        this.initializeEventListeners();
        this.initializeTheme(); // Uses ThemeManager internally
    }

    // Populate the this.ui object with DOM element references
    initializeCoreElements() {
        this.ui.orkImage = document.getElementById('ork-image'); 
        this.ui.healthBarFill = document.getElementById('health-fill'); 
        this.ui.goldDisplay = document.getElementById('gold-amount');
        this.ui.damageDisplay = document.getElementById('damage-amount');

        // Core Buttons
        this.ui.buttons.shop = document.getElementById('shop-btn');
        this.ui.buttons.stats = document.getElementById('stats-btn');
        this.ui.buttons.settings = document.getElementById('settings-btn');

        // Other Buttons
        this.ui.buttons.tab = document.querySelectorAll('.tab-btn');
        this.ui.buttons.effects = document.querySelectorAll('.effects-btn');

        // Stats Displays
        this.ui.statsDisplays.totalDamage = document.getElementById('total-damage-stat');
        this.ui.statsDisplays.orksKilled = document.getElementById('orks-killed-stat');
        this.ui.statsDisplays.totalGold = document.getElementById('total-gold-stat');

        // Error checking
        if (!this.ui.orkImage) console.error("Ork image element not found!");
        if (!this.ui.healthBarFill) console.error("Health bar fill element not found!");
    }

    // Core event listeners remain in UIManager
    initializeEventListeners() {
        // Ork image click handler
        this.ui.orkImage?.addEventListener('mousedown', (e) => {
            if (!this.ui.orkImage.classList.contains('defeated')) {
                const rect = this.ui.orkImage.getBoundingClientRect();
                const x = e.clientX;
                const y = e.clientY;
                this.effectsManager.spawnParticles(x, y);
            }
            this.game.hitOrk();
        });

        // Modal buttons
        this.ui.buttons.shop?.addEventListener('click', (e) => {
            if (!e.target.disabled) this.modalManager.openModal('shop');
        });
        this.ui.buttons.stats?.addEventListener('click', (e) => {
            if (!e.target.disabled) this.modalManager.openModal('stats');
        });
        this.ui.buttons.settings?.addEventListener('click', () => this.modalManager.openModal('settings'));

        // Tab and effects buttons
        this.ui.buttons.tab.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e));
        });

        this.ui.buttons.effects.forEach(btn => {
            btn.addEventListener('click', () => this.game.toggleEffects(btn.dataset.effectsBtn));
        });
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

    // Central UI update function - delegates to managers
    updateUI() {
        if (!this.game.initialized) return;

        this.modalManager.updateModalButtonStates();
        this.effectsManager.updateEffectsButtonsState();
        this.shopItemManager.updateBuyButtonStates();
        this.shopItemManager.updateMonsterUpgradeDisplay();
        this.healthLabels.update();

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

        // Update ability button states
        const superHitOwned = this.data.abilities['super-hit'].owned;
        document.getElementById('abilities')?.setAttribute('data-super-hit-owned', superHitOwned);

        if (this.game.statsManager) {
            this.game.statsManager.updateStats();
        }

        this.sectionUnlockManager.updateSectionUnlocks();
        
        this.updateHealthBar();
    }

    getBaseMaxHealth() {
        return getOrkMaxHealth(this.data.monsters.ork.level, this.config);
    }

    updateHealthBar() {
        if (!this.game.initialized || !this.ui.healthBarFill) return;
        
        const baseMaxHealth = getOrkMaxHealth(this.data.monsters.ork.level, this.config);
        const maxHealth = this.data.currentBoss ? getBossHealth(baseMaxHealth) : baseMaxHealth;
        
        const healthPercentage = Math.max(0, (this.data.orkHealth / maxHealth) * 100);
        this.ui.healthBarFill.style.width = `${healthPercentage}%`;

        const healthBar = this.ui.healthBarFill.parentElement;
        if (this.data.currentBoss) {
            healthBar.classList.add('boss');
        } else {
            healthBar.classList.remove('boss');
        }

        if (this.data.orkHealth === maxHealth && healthPercentage === 100) {
            void this.ui.healthBarFill.offsetWidth;
            this.ui.healthBarFill.style.width = '100%';
        }
    }

    // Delegated to ThemeManager
    setTheme(theme) {
        this.themeManager.setTheme(theme);
    }

    // Delegated to EffectsManager
    showSuperHitEffect() {
        this.effectsManager.showSuperHitEffect();
    }

    // Delegated to ThemeManager
    applyThemePreference() {
        this.themeManager.applyThemePreference();
    }

    // Delegated to EffectsManager
    initializeTheme() {
        // Handled by ThemeManager
    }
}

export default UIManager;
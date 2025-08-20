import { formatNumber } from '../utils/formatUtils.js';
import { HealthLabels } from './HealthLabels.js';
import { CoinManager } from './CoinManager.js';
import { StrengthManager } from './StrengthManager.js';
import { SectionUnlockManager } from './SectionUnlockManager.js';

export class ModalManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.modals = {};
        this.buttons = {
            shop: null,
            stats: null,
            settings: null,
            shopClose: null,
            statsClose: null,
            settingsClose: null
        };
        
        this.initializeElements();
        this.initializeEventListeners();
    }

    initializeElements() {
        // Modals
        this.modals.shop = document.getElementById('shop-modal');
        this.modals.stats = document.getElementById('stats-modal');
        this.modals.settings = document.getElementById('settings-modal');

        // Close buttons
        this.buttons.shopClose = this.modals.shop?.querySelector('.close-btn');
        this.buttons.statsClose = this.modals.stats?.querySelector('.close-btn');
        this.buttons.settingsClose = this.modals.settings?.querySelector('.close-btn');
    }

    initializeEventListeners() {
        // Modal Close Buttons
        this.buttons.shopClose?.addEventListener('click', () => this.closeModal('shop'));
        this.buttons.statsClose?.addEventListener('click', () => this.closeModal('stats'));
        this.buttons.settingsClose?.addEventListener('click', () => this.closeModal('settings'));
    }

    openModal(modalName) {
        if (this.modals[modalName]) {
            if (modalName === 'stats') {
                // Ensure stats are fresh when opening
            }
            this.modals[modalName].style.display = 'block';
        } else {
            console.error(`Modal "${modalName}" not found`);
        }
    }

    closeModal(modalName) {
        if (this.modals[modalName]) {
            this.modals[modalName].style.display = 'none';
        } else {
            console.error(`Modal "${modalName}" not found`);
        }
    }

    updateModalButtonStates() {
        const { orksKilled } = this.uiManager.game.data;
        const shopBtn = document.getElementById('shop-btn');
        const statsBtn = document.getElementById('stats-btn');

        if (shopBtn && statsBtn) {
            const shopUnlocked = orksKilled >= this.uiManager.config.unlocks.shop.requiredKills;
            const statsUnlocked = orksKilled >= this.uiManager.config.unlocks.stats.requiredKills;
            
            shopBtn.style.display = shopUnlocked ? 'block' : 'none';
            shopBtn.disabled = !shopUnlocked;
            
            statsBtn.disabled = !statsUnlocked;
        }
    }
}
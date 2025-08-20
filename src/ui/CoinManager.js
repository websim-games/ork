import { formatNumber } from '../utils/formatUtils.js';
import { config } from '../config.js';

export class CoinManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.container = document.createElement('div');
        this.container.className = 'coin-container';
        document.body.appendChild(this.container);
        this.setupCoinDisplay();
        
        this.updateGoldAmount(this.uiManager.data.gold || 0);
    }

    setupCoinDisplay() {
        const goldDisplay = document.querySelector('.gold');
        if (goldDisplay) {
            goldDisplay.innerHTML = `
                <img src="/coin.png" alt="Gold" class="top-bar-stat-icon" style="--size: ${config.animations.coins.iconSize}">
                <span id="gold-amount">0</span>
            `;
        }
    }

    updateGoldAmount(amount) {
        const goldAmount = document.getElementById('gold-amount');
        if (goldAmount) {
            goldAmount.textContent = formatNumber(amount);
        }
    }

    createCoinAnimation(x, y, amount) {
        if (this.uiManager.data.effectsLevel === 'none') return;

        const coinElement = document.createElement('div');
        coinElement.className = 'floating-coin';
        coinElement.innerHTML = `
            <img src="/coin.png" alt="Gold" class="coin-icon" style="--size: ${config.animations.coins.iconSize}">
            <span class="coin-amount">+${formatNumber(amount)}</span>
        `;

        coinElement.style.left = `${x}px`;
        coinElement.style.top = `${y}px`;
        
        this.container.appendChild(coinElement);

        const goldDisplay = document.querySelector('.gold');
        const targetRect = goldDisplay.getBoundingClientRect();

        coinElement.style.transform = 'translate(0, 0)';
        
        // Drop down slightly
        setTimeout(() => {
            coinElement.style.transform = `translate(0, ${config.animations.coins.dropDistance}px)`;
        }, config.animations.coins.initialDelay);

        // Bounce up higher
        setTimeout(() => {
            coinElement.style.transform = `translate(0, -${config.animations.coins.bounceHeight}px)`;
        }, config.animations.coins.dropDuration);

        // Move to gold display
        setTimeout(() => {
            coinElement.style.transform = `translate(${targetRect.left - x}px, ${targetRect.top - y}px)`;
            coinElement.style.opacity = '0';
        }, config.animations.coins.bounceUpDuration);

        // Remove after animation
        setTimeout(() => {
            coinElement.remove();
        }, config.animations.coins.removeDelay);
    }
}
export class StrengthManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.container = document.createElement('div');
        this.container.className = 'strength-container';
        document.body.appendChild(this.container);
        this.setupStrengthDisplay();
    }

    setupStrengthDisplay() {
        const damageDisplay = document.querySelector('.damage');
        if (damageDisplay) {
            damageDisplay.innerHTML = `
                <img src="/strength-icon.png" alt="Damage" class="top-bar-stat-icon">
                <span id="damage-amount">1</span>
            `;
        }
    }
}
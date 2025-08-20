export class HealthLabels {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.data = uiManager.data;
        this.config = uiManager.config;
        this.labels = this.createLabelsContainer();
        this.insertLabels();
    }

    createLabelsContainer() {
        const container = document.createElement('div');
        container.className = 'health-labels';
        container.innerHTML = `
            <div class="health-label" id="current-health">Health: 0</div>
            <div class="health-label boss-label" id="boss-label" style="display: none">BOSS</div>
        `;
        return container;
    }

    insertLabels() {
        const orkArea = document.querySelector('.ork-area');
        orkArea.insertBefore(this.labels, orkArea.firstChild);
    }

    update() {
        const currentHealth = document.getElementById('current-health');
        const bossLabel = document.getElementById('boss-label');

        if (!currentHealth || !bossLabel) return;

        currentHealth.textContent = `Health: ${Math.max(0, Math.floor(this.data.orkHealth))}`;
        bossLabel.style.display = this.data.currentBoss ? 'block' : 'none';
    }
}


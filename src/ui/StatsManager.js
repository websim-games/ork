import { formatNumber } from '../utils/formatUtils.js';

export class StatsManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.data = uiManager.data;
        this.initializeStats();
        this.initializeElements();
    }

    initializeStats() {
        // Initialize new stats if they don't exist
        if (this.data.bossesKilled === undefined) {
            this.data.bossesKilled = 0;
        }
        if (this.data.totalGoldSpent === undefined) {
            this.data.totalGoldSpent = 0;
        }
    }

    initializeElements() {
        // Create new stat elements
        const statsContent = document.querySelector('.stats-content');
        if (!statsContent) return;

        const bossKillsItem = document.createElement('div');
        bossKillsItem.className = 'content-item stat-item';
        bossKillsItem.innerHTML = `
            <h3>Boss Orks Killed</h3>
            <p id="bosses-killed-stat">0</p>
        `;
        
        const goldSpentItem = document.createElement('div');
        goldSpentItem.className = 'content-item stat-item';
        goldSpentItem.innerHTML = `
            <h3>Total Gold Spent</h3>
            <p id="total-gold-spent-stat">0</p>
        `;

        statsContent.appendChild(bossKillsItem);
        statsContent.appendChild(goldSpentItem);
    }

    updateStats() {
        // Get all stat elements
        const totalDamageStat = document.getElementById('total-damage-stat');
        const orksKilledStat = document.getElementById('orks-killed-stat');
        const totalGoldStat = document.getElementById('total-gold-stat');
        const bossKillsStat = document.getElementById('bosses-killed-stat');
        const goldSpentStat = document.getElementById('total-gold-spent-stat');

        // Update each stat if the element exists
        if (totalDamageStat) {
            totalDamageStat.textContent = formatNumber(this.data.totalDamageDealt);
        }
        if (orksKilledStat) {
            orksKilledStat.textContent = formatNumber(this.data.orksKilled);
        }
        if (totalGoldStat) {
            totalGoldStat.textContent = formatNumber(this.data.totalGoldEarned);
        }
        if (bossKillsStat) {
            bossKillsStat.textContent = formatNumber(this.data.bossesKilled);
        }
        if (goldSpentStat) {
            goldSpentStat.textContent = formatNumber(this.data.totalGoldSpent);
        }
    }
}
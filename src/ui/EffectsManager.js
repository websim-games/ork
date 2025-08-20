import { config } from '../config.js';

export class EffectsManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.setupEffectsUI();
    }

    setupEffectsUI() {
        // Event listeners for effects buttons are handled in UIManager
        // This manager focuses on visual effects
    }

    createParticle(x, y) {
        if (this.uiManager.data.effectsLevel === 'none') return;

        const particle = document.createElement('div');
        particle.className = 'particle';

        const size = config.animations.particles.minSize + 
            Math.random() * (config.animations.particles.maxSize - config.animations.particles.minSize);
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        const angle = Math.random() * Math.PI * 2;
        const distance = config.animations.particles.minDistance + 
            Math.random() * (config.animations.particles.maxDistance - config.animations.particles.minDistance);
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);

        document.body.appendChild(particle);

        setTimeout(() => particle.remove(), config.animations.particles.duration);
    }

    spawnParticles(x, y) {
        if (!this.uiManager.data.effectsEnabled || this.uiManager.data.effectsLevel === 'none') return;

        for (let i = 0; i < config.animations.particles.count; i++) {
            this.createParticle(x, y);
        }
    }

    showSuperHitEffect() {
        if (!this.uiManager.ui.orkImage || this.uiManager.data.effectsLevel === 'none') return;

        // Add flash effect
        this.uiManager.ui.orkImage.style.filter = 'brightness(1.5) saturate(1.5)';
        setTimeout(() => {
            this.uiManager.ui.orkImage.style.filter = '';
        }, 100);

        // Show glove punch animation for all effects
        if (this.uiManager.data.effectsLevel === 'all') {
            const glove = document.createElement('div');
            glove.className = 'super-hit-glove';
            glove.textContent = '🥊';
            document.body.appendChild(glove);
            
            glove.addEventListener('animationend', () => {
                glove.remove();
            });
        }
    }

    updateEffectsButtonsState() {
        const effectsBtns = document.querySelectorAll('.effects-btn');
        effectsBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.effectsBtn === this.uiManager.data.effectsLevel) {
                btn.classList.add('active');
            }
        });
    }
}
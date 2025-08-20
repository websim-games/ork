export class ThemeManager {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.themeButtons = [];
        
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeTheme();
    }

    initializeElements() {
        this.themeButtons = document.querySelectorAll('.theme-btn');
    }

    initializeEventListeners() {
        this.themeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleThemeButtonClick(e));
        });
    }

    initializeTheme() {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (this.uiManager.data.currentTheme === 'system') {
                this.applyThemePreference();
            }
        });
    }

    handleThemeButtonClick(e) {
        const theme = e.target.dataset.themeBtn;
        if (theme) {
            this.setTheme(theme);
            this.uiManager.game.saveGameState();
        }
    }

    setTheme(theme) {
        if (!['light', 'dark', 'system'].includes(theme)) {
            console.warn(`Invalid theme: ${theme}`);
            theme = 'dark';
        }

        this.uiManager.data.currentTheme = theme;

        this.themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.themeBtn === theme);
        });

        this.applyThemePreference();
    }

    applyThemePreference() {
        let themeToApply = this.uiManager.data.currentTheme;
        if (themeToApply === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            themeToApply = prefersDark ? 'dark' : 'light';
        }
        document.documentElement.setAttribute('data-theme', themeToApply);
        localStorage.setItem('activeTheme', themeToApply);
    }
}
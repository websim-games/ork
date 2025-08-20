import { config } from './config.js';

export class GameState {
    constructor(room, data) {
        this.room = room;
        this.data = data;
        // Add upgrade counts tracking
        this.data.upgradeCounts = {
            gloves: 0,
            training: 0,
            powerGloves: 0,
            martialArts: 0
        };
        // Add new stats tracking
        this.data.bossesKilled = 0;
        this.data.totalGoldSpent = 0;
    }

    async loadGameState(uiManager) {
        console.log('Loading game state...');

        let dbStates = [];
        try {
            dbStates = await this.room.collection('game_state_v2').getList();
        } catch (error) {
            console.error("Error fetching from database:", error);
        }
        const dbState = dbStates.length > 0 ? dbStates[0] : null;
        const dbSaveTime = dbState?.saved_at ? new Date(dbState.saved_at).getTime() : 0;

        const localState = localStorage.getItem('gameState');
        const localStateData = localState ? JSON.parse(localState) : null;
        const localSaveTime = localStateData?.saved_at || 0;

        console.log('Database state:', dbState);
        console.log('localStorage state:', localStateData);
        console.log('DB save time:', dbSaveTime);
        console.log('Local save time:', localSaveTime);

        let stateToLoad = null;
        if (dbSaveTime > localSaveTime && dbState) {
            console.log('Using database state (more recent)');
            stateToLoad = dbState;
            this.data.gameStateId = dbState.id;
        } else if (localStateData) {
            console.log('Using localStorage state (more recent or only option)');
            stateToLoad = localStateData;
            if (dbState) {
                this.data.gameStateId = dbState.id; // Keep DB ID if available, even if older
            }
        }

        if (stateToLoad) {
            console.log('Loading existing game state:', stateToLoad);

            this.data.gold = stateToLoad.gold ?? 0;
            this.data.damage = stateToLoad.damage ?? config.baseDamage;
            this.data.orkHealth = stateToLoad.orkHealth ?? config.orkMaxHealth;
            this.data.totalDamageDealt = stateToLoad.totalDamageDealt ?? 0;
            this.data.orksKilled = stateToLoad.orksKilled ?? 0;
            this.data.totalGoldEarned = stateToLoad.totalGoldEarned ?? 0;
            this.data.currentTheme = stateToLoad.currentTheme ?? 'dark';
            this.data.effectsEnabled = stateToLoad.effectsEnabled ?? true;
            this.data.effectsLevel = stateToLoad.effectsLevel ?? 'all';

            // Load abilities state
            this.data.abilities = stateToLoad.abilities || {
                'super-hit': {
                    owned: false,
                    chanceLevel: 0,
                    powerLevel: 0
                }
            };

            this.data.monsters = stateToLoad.monsters || {
                'ork': {
                    level: 0
                }
            };

            this.data.activeBoosts.clear();
            if (stateToLoad.activeBoosts && typeof stateToLoad.activeBoosts === 'object') {
                console.log('Restoring active boosts:', stateToLoad.activeBoosts);
                Object.entries(stateToLoad.activeBoosts).forEach(([boostType, endTime]) => {
                    const now = Date.now();
                    if (typeof endTime === 'number' && endTime > now) {
                        const timeLeft = endTime - now;
                        console.log(`Activating boost ${boostType} with ${timeLeft/1000}s remaining`);
                    } else {
                        console.warn(`Invalid or expired boost endTime for ${boostType}:`, endTime);
                    }
                });
            }

            // Load upgrade counts
            this.data.upgradeCounts = stateToLoad.upgradeCounts || {
                gloves: 0,
                training: 0,
                powerGloves: 0,
                martialArts: 0
            };

            this.data.bossesKilled = stateToLoad.bossesKilled ?? 0;
            this.data.totalGoldSpent = stateToLoad.totalGoldSpent ?? 0;

            // Add boss state loading
            this.data.currentBoss = stateToLoad.currentBoss || null;

        } else {
            console.log('No saved state found, initializing with defaults...');
            this.data.gold = 0;
            this.data.damage = config.baseDamage;
            this.data.orkHealth = config.orkMaxHealth;
            this.data.totalDamageDealt = 0;
            this.data.orksKilled = 0;
            this.data.totalGoldEarned = 0;
            this.data.activeBoosts.clear();
            this.data.currentTheme = 'dark';
            this.data.effectsEnabled = true;
            this.data.effectsLevel = 'all';
            this.data.abilities = {
                'super-hit': {
                    owned: false,
                    chanceLevel: 0,
                    powerLevel: 0
                }
            };
            this.data.monsters = {
                'ork': {
                    level: 0
                }
            };

            // Initialize upgrade counts
            this.data.upgradeCounts = {
                gloves: 0,
                training: 0,
                powerGloves: 0,
                martialArts: 0
            };

            this.data.bossesKilled = 0;
            this.data.totalGoldSpent = 0;

            this.data.currentBoss = null;

            const initialState = {
                gold: this.data.gold,
                damage: this.data.damage,
                orkHealth: this.data.orkHealth,
                activeBoosts: {}, // Ensure it's an empty object for initial state
                totalDamageDealt: this.data.totalDamageDealt,
                orksKilled: this.data.orksKilled,
                totalGoldEarned: this.data.totalGoldEarned,
                currentTheme: this.data.currentTheme,
                effectsEnabled: this.data.effectsEnabled,
                effectsLevel: this.data.effectsLevel,
                abilities: this.data.abilities,
                monsters: this.data.monsters,
                upgradeCounts: this.data.upgradeCounts,
                bossesKilled: this.data.bossesKilled,
                totalGoldSpent: this.data.totalGoldSpent,
                currentBoss: this.data.currentBoss
            };
            initialState.saved_at = Date.now();

            console.log('Creating initial state:', initialState);

            try {
                const createdDbState = await this.room.collection('game_state_v2').create(initialState);
                this.data.gameStateId = createdDbState.id;
                console.log('Initial state created in database, ID:', this.data.gameStateId);
            } catch (error) {
                console.error("Error creating initial state in database:", error);
            }

            localStorage.setItem('gameState', JSON.stringify(initialState));
            console.log('Initial state saved to localStorage');
        }

        // Check unlock conditions after data is loaded
        if (uiManager.game.checkUnlockConditions) {
            uiManager.game.checkUnlockConditions();
        }

        // this.initialized = true; // moved out of this file
        uiManager.setTheme(this.data.currentTheme); // Apply theme via UIManager
        uiManager.updateUI(); // Update UI with loaded/initial data via UIManager
    }

    async saveGameState(uiManager) {
        if (!uiManager.game.initialized) {
            console.log('Game not initialized, skipping save');
            return;
        }

        const state = {
            gold: this.data.gold,
            damage: this.data.damage,
            orkHealth: this.data.orkHealth,
            activeBoosts: {}, // Ensure it's an empty object
            totalDamageDealt: this.data.totalDamageDealt,
            orksKilled: this.data.orksKilled,
            totalGoldEarned: this.data.totalGoldEarned,
            currentTheme: this.data.currentTheme,
            effectsEnabled: this.data.effectsEnabled,
            effectsLevel: this.data.effectsLevel,
            abilities: this.data.abilities,
            monsters: this.data.monsters,
            upgradeCounts: this.data.upgradeCounts,
            bossesKilled: this.data.bossesKilled,
            totalGoldSpent: this.data.totalGoldSpent,
            currentBoss: this.data.currentBoss
        };

        const activeBoostsObj = {};
        this.data.activeBoosts.forEach((timeoutData, boostType) => {
            // Check if timeoutData and timeoutData.timeout exist before accessing properties
            if (timeoutData && timeoutData.timeout) {
                // Accessing _idleTimeout might be fragile, calculate based on stored endTime if available
                // For simplicity, let's assume we store endTime correctly or approximate
                // If we stored endTime directly:
                // if (timeoutData.endTime && timeoutData.endTime > Date.now()) {
                //   activeBoostsObj[boostType] = timeoutData.endTime;
                // }
                // Using timeout._idleTimeout (less robust):
                const remainingTime = timeoutData.timeout._idleTimeout;
                if (remainingTime > 0) {
                    const endTime = Date.now() + remainingTime;
                    activeBoostsObj[boostType] = endTime;
                }
            }
        });

        state.activeBoosts = activeBoostsObj;
        state.saved_at = Date.now();

        console.log('Saving game state:', state);
        console.log('Using DB ID for save:', this.data.gameStateId);

        localStorage.setItem('gameState', JSON.stringify(state));
        console.log('Game state saved to localStorage');

        const collection = this.room.collection('game_state_v2');
        if (this.data.gameStateId) {
            try {
                await collection.update(this.data.gameStateId, state);
                console.log('Game state updated in database');
            } catch (error) {
                console.error('Error updating game state in database:', error);
                try {
                    console.log("Update failed, attempting to create new record...");
                    const createdDbState = await collection.create(state);
                    this.data.gameStateId = createdDbState.id;
                    console.log('New game state created in database, new ID:', this.data.gameStateId);
                } catch (createError) {
                    console.error('Error creating new game state in database after update failed:', createError);
                }
            }
        } else {
            console.warn('No gameStateId found, attempting to create a new record in database.');
            try {
                const createdDbState = await collection.create(state);
                this.data.gameStateId = createdDbState.id;
                console.log('New game state created in database, ID:', this.data.gameStateId);
            } catch (createError) {
                console.error('Error creating new game state in database:', createError);
            }
        }
    }
}
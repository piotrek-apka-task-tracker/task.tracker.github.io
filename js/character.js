console.log('CHARACTER.JS LOADED');

// ================================
// Character System
// ================================

const Character = {
    data: null,

    init() {
        console.log('Character module initialized');
        // Data is loaded by Auth.loadUserData()
    },

    // Create a new character
    createCharacter(name, characterClass) {
        const classData = GameData.characterClasses[characterClass];
        
        if (!classData) {
            console.error('Invalid character class:', characterClass);
            return null;
        }

        // Base stats - all start at 10
        const baseStats = {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10
        };

        // Apply class bonuses
        for (const [stat, bonus] of Object.entries(classData.bonus)) {
            baseStats[stat] += bonus;
        }

        this.data = {
            name: name,
            class: characterClass,
            level: 1,
            experience: 0,
            
            // Base stats (from class)
            baseStats: baseStats,
            
            // Stat XP (earned from tasks)
            statXP: {
                strength: 0,
                dexterity: 0,
                constitution: 0,
                intelligence: 0,
                wisdom: 0,
                charisma: 0
            },
            
            // Stat levels (from XP)
            statLevels: {
                strength: 0,
                dexterity: 0,
                constitution: 0,
                intelligence: 0,
                wisdom: 0,
                charisma: 0
            },
            
            // Combat stats (calculated)
            hp: 0,
            maxHp: 0,
            mp: 0,
            maxMp: 0,
            attack: 0,
            defense: 0,
            speed: 0,
            luck: 0,
            
            // Timestamps
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString()
        };

        // Calculate initial combat stats
        this.calculateCombatStats();

        // Set HP and MP to max
        this.data.hp = this.data.maxHp;
        this.data.mp = this.data.maxMp;

        Auth.saveUserData();
        
        App.notify(`${name} the ${classData.name} has been created!`, 'success');
        
        return this.data;
    },

    // Get total stat value (base + levels)
    getStat(statName) {
        if (!this.data) return 10;
        
        const base = this.data.baseStats[statName] || 10;
        const levels = this.data.statLevels[statName] || 0;
        
        return base + levels;
    },

    // Get all stats with totals
    getAllStats() {
        if (!this.data) return null;
        
        const stats = {};
        for (const statName of Object.keys(GameData.stats)) {
            stats[statName] = {
                base: this.data.baseStats[statName] || 10,
                bonus: this.data.statLevels[statName] || 0,
                total: this.getStat(statName),
                xp: this.data.statXP[statName] || 0,
                xpToNext: this.getStatXPRequired(this.data.statLevels[statName] || 0)
            };
        }
        return stats;
    },

    // Calculate XP required for next stat level
    getStatXPRequired(currentLevel) {
        // Each stat level requires more XP: 50 * (level + 1)
        return 50 * (currentLevel + 1);
    },

    // Add experience points
    addExperience(xp) {
        if (!this.data) {
            console.log(`Would add ${xp} XP, but no character exists`);
            return;
        }

        this.data.experience += xp;
        this.data.lastActive = new Date().toISOString();

        // Check for level up
        this.checkLevelUp();

        Auth.saveUserData();
    },

    // Check and process level ups
    checkLevelUp() {
        if (!this.data) return;

        let leveledUp = false;
        let xpNeeded = this.getXPForNextLevel();

        while (this.data.experience >= xpNeeded) {
            this.data.experience -= xpNeeded;
            this.data.level++;
            leveledUp = true;
            
            // Recalculate combat stats on level up
            this.calculateCombatStats();
            
            // Heal to full on level up
            this.data.hp = this.data.maxHp;
            this.data.mp = this.data.maxMp;

            App.notify(`🎉 LEVEL UP! You are now level ${this.data.level}!`, 'success');
            
            xpNeeded = this.getXPForNextLevel();
        }

        if (leveledUp) {
            this.render();
        }
    },

    // Get XP required for next level
    getXPForNextLevel() {
        if (!this.data) return 100;
        return GameData.calculateExpForLevel(this.data.level);
    },

    // Get XP progress percentage
    getXPProgress() {
        if (!this.data) return 0;
        const needed = this.getXPForNextLevel();
        return Math.floor((this.data.experience / needed) * 100);
    },

    // Add stat experience
    addStatExperience(statName, xp) {
        if (!this.data) return;
        if (!GameData.stats[statName]) return;

        if (!this.data.statXP[statName]) this.data.statXP[statName] = 0;
        if (!this.data.statLevels[statName]) this.data.statLevels[statName] = 0;

        this.data.statXP[statName] += xp;

        // Check for stat level up
        this.checkStatLevelUp(statName);

        Auth.saveUserData();
    },

    // Check and process stat level ups
    checkStatLevelUp(statName) {
        if (!this.data) return;

        let leveledUp = false;
        let xpNeeded = this.getStatXPRequired(this.data.statLevels[statName]);

        while (this.data.statXP[statName] >= xpNeeded) {
            this.data.statXP[statName] -= xpNeeded;
            this.data.statLevels[statName]++;
            leveledUp = true;

            const statInfo = GameData.stats[statName];
            App.notify(`${statInfo.icon} ${statInfo.name} increased to ${this.getStat(statName)}!`, 'success');

            xpNeeded = this.getStatXPRequired(this.data.statLevels[statName]);
        }

        if (leveledUp) {
            this.calculateCombatStats();
            this.render();
        }
    },

    // Calculate combat stats from attributes
    calculateCombatStats() {
        if (!this.data) return;

        const str = this.getStat('strength');
        const dex = this.getStat('dexterity');
        const con = this.getStat('constitution');
        const int = this.getStat('intelligence');
        const wis = this.getStat('wisdom');
        const cha = this.getStat('charisma');
        const level = this.data.level;

        // Max HP: Base 50 + (CON * 5) + (Level * 10)
        this.data.maxHp = 50 + (con * 5) + (level * 10);

        // Max MP: Base 20 + (INT * 3) + (WIS * 2) + (Level * 5)
        this.data.maxMp = 20 + (int * 3) + (wis * 2) + (level * 5);

        // Attack: STR * 2 + DEX + Level
        this.data.attack = (str * 2) + dex + level;

        // Defense: CON * 2 + STR / 2 + Level
        this.data.defense = (con * 2) + Math.floor(str / 2) + level;

        // Speed: DEX * 2 + Level
        this.data.speed = (dex * 2) + level;

        // Luck: CHA + WIS / 2
        this.data.luck = cha + Math.floor(wis / 2);

        // Make sure current HP/MP don't exceed max
        if (this.data.hp > this.data.maxHp) this.data.hp = this.data.maxHp;
        if (this.data.mp > this.data.maxMp) this.data.mp = this.data.maxMp;
    },

    // Heal character
    heal(amount) {
        if (!this.data) return;
        
        this.data.hp = Math.min(this.data.hp + amount, this.data.maxHp);
        Auth.saveUserData();
    },

    // Restore MP
    restoreMp(amount) {
        if (!this.data) return;
        
        this.data.mp = Math.min(this.data.mp + amount, this.data.maxMp);
        Auth.saveUserData();
    },

    // Full rest (restore HP and MP)
    fullRest() {
        if (!this.data) return;
        
        this.data.hp = this.data.maxHp;
        this.data.mp = this.data.maxMp;
        Auth.saveUserData();
    },

    // Show character creation modal
    showCreationModal() {
        const classOptions = Object.entries(GameData.characterClasses).map(([key, cls]) => `
            <div class="class-option" data-class="${key}">
                <div class="class-icon">${cls.icon}</div>
                <div class="class-info">
                    <h4>${cls.name}</h4>
                    <p>${cls.description}</p>
                    <div class="class-bonuses">
                        ${Object.entries(cls.bonus).map(([stat, val]) => `
                            <span class="class-bonus">
                                ${GameData.stats[stat].icon} +${val} ${GameData.stats[stat].abbr}
                            </span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');

        const content = `
            <div class="modal-header">
                <h2>⚔️ Create Your Hero</h2>
                <button class="modal-close" onclick="App.closeModal()">&times;</button>
            </div>

            <form id="character-form">
                <div class="form-group">
                    <label for="character-name">Hero Name</label>
                    <input type="text" id="character-name" required minlength="2" maxlength="20"
                           placeholder="Enter your hero's name...">
                </div>

                <div class="form-group">
                    <label>Choose Your Class</label>
                    <div class="class-selection" id="class-selection">
                        ${classOptions}
                    </div>
                    <input type="hidden" id="selected-class" required>
                </div>

                <div id="class-preview" class="class-preview hidden">
                    <!-- Preview will be shown here -->
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="App.closeModal()">
                        Cancel
                    </button>
                    <button type="submit" class="btn btn-primary" id="create-hero-btn" disabled>
                        Create Hero
                    </button>
                </div>
            </form>
        `;

        App.openModal(content);

        // Bind class selection
        document.querySelectorAll('.class-option').forEach(option => {
            option.addEventListener('click', () => {
                // Remove previous selection
                document.querySelectorAll('.class-option').forEach(o => {
                    o.classList.remove('selected');
                });
                
                // Select this class
                option.classList.add('selected');
                const selectedClass = option.dataset.class;
                document.getElementById('selected-class').value = selectedClass;
                
                // Enable submit button
                document.getElementById('create-hero-btn').disabled = false;
                
                // Show preview
                this.showClassPreview(selectedClass);
            });
        });

        // Bind form submit
        document.getElementById('character-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('character-name').value.trim();
            const characterClass = document.getElementById('selected-class').value;

            if (!name || !characterClass) {
                App.notify('Please enter a name and select a class.', 'error');
                return;
            }

            this.createCharacter(name, characterClass);
            App.closeModal();
            this.render();
            App.renderDashboard();
        });
    },

    // Show class preview with calculated stats
    showClassPreview(classKey) {
        const cls = GameData.characterClasses[classKey];
        const preview = document.getElementById('class-preview');
        
        // Calculate preview stats
        const stats = { ...{
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10
        }};
        
        for (const [stat, bonus] of Object.entries(cls.bonus)) {
            stats[stat] += bonus;
        }

        // Calculate combat stats preview
        const hp = 50 + (stats.constitution * 5) + 10;
        const mp = 20 + (stats.intelligence * 3) + (stats.wisdom * 2) + 5;
        const attack = (stats.strength * 2) + stats.dexterity + 1;
        const defense = (stats.constitution * 2) + Math.floor(stats.strength / 2) + 1;

        preview.classList.remove('hidden');
        preview.innerHTML = `
            <h4>${cls.icon} ${cls.name} Preview</h4>
            <div class="preview-stats">
                ${Object.entries(GameData.stats).map(([key, stat]) => `
                    <div class="preview-stat" style="border-left: 3px solid ${stat.color};">
                        <span class="stat-icon">${stat.icon}</span>
                        <span class="stat-name">${stat.abbr}</span>
                        <span class="stat-value">${stats[key]}</span>
                    </div>
                `).join('')}
            </div>
            <div class="preview-combat">
                <span>❤️ HP: ${hp}</span>
                <span>💧 MP: ${mp}</span>
                <span>⚔️ ATK: ${attack}</span>
                <span>🛡️ DEF: ${defense}</span>
            </div>
        `;
    },

    // Show delete character confirmation
    showDeleteConfirmation() {
        if (!this.data) return;

        const content = `
            <div class="modal-header">
                <h2 style="color: var(--danger);">⚠️ Delete Character</h2>
                <button class="modal-close" onclick="App.closeModal()">&times;</button>
            </div>

            <p style="margin-bottom: var(--space-lg);">
                Are you sure you want to delete <strong>${this.data.name}</strong>?
                <br><br>
                This will permanently delete your Level ${this.data.level} ${GameData.characterClasses[this.data.class].name}.
                <br>
                All progress, stats, and achievements will be lost!
            </p>

            <div class="form-group">
                <label>Type "${this.data.name}" to confirm:</label>
                <input type="text" id="delete-confirm-name" placeholder="Enter character name">
            </div>

            <div class="form-actions">
                <button class="btn btn-secondary" onclick="App.closeModal()">
                    Cancel
                </button>
                <button class="btn btn-danger" id="confirm-delete-btn">
                    Delete Forever
                </button>
            </div>
        `;

        App.openModal(content);

        document.getElementById('confirm-delete-btn').addEventListener('click', () => {
            const input = document.getElementById('delete-confirm-name').value;
            
            if (input === this.data.name) {
                this.data = null;
                Auth.saveUserData();
                App.closeModal();
                App.notify('Character deleted.', 'info');
                this.render();
                App.renderDashboard();
            } else {
                App.notify('Name does not match. Character not deleted.', 'error');
            }
        });
    },

    // Render character sheet
    render() {
        const container = document.getElementById('character-display');
        if (!container) return;

        if (!this.data) {
            container.innerHTML = `
                <div class="no-character">
                    <div class="no-character-icon">🛡️</div>
                    <h2>No Hero Yet</h2>
                    <p>Create your character to begin your adventure!</p>
                    <button class="btn btn-primary btn-large" onclick="Character.showCreationModal()">
                        ⚔️ Create Your Hero
                    </button>
                </div>
            `;
            return;
        }

        const cls = GameData.characterClasses[this.data.class];
        const stats = this.getAllStats();
        const xpProgress = this.getXPProgress();
        const xpNeeded = this.getXPForNextLevel();

        container.innerHTML = `
            <div class="character-sheet">
                <!-- Header -->
                <div class="character-header">
                    <div class="character-avatar">
                        <span class="avatar-icon">${cls.icon}</span>
                        <span class="avatar-level">${this.data.level}</span>
                    </div>
                    <div class="character-title">
                        <h2>${this.data.name}</h2>
                        <p class="character-class">${cls.name}</p>
                    </div>
                    <button class="btn btn-small btn-secondary" onclick="Character.showDeleteConfirmation()">
                        🗑️
                    </button>
                </div>

                <!-- XP Bar -->
                <div class="xp-section">
                    <div class="xp-header">
                        <span>Level ${this.data.level}</span>
                        <span>${this.data.experience} / ${xpNeeded} XP</span>
                    </div>
                    <div class="xp-bar">
                        <div class="xp-fill" style="width: ${xpProgress}%"></div>
                    </div>
                </div>

                <!-- Combat Stats -->
                <div class="combat-stats">
                    <div class="combat-stat hp">
                        <span class="combat-icon">❤️</span>
                        <div class="combat-bar-container">
                            <div class="combat-bar hp-bar">
                                <div class="combat-fill" style="width: ${(this.data.hp / this.data.maxHp) * 100}%"></div>
                            </div>
                            <span class="combat-value">${this.data.hp} / ${this.data.maxHp}</span>
                        </div>
                    </div>
                    <div class="combat-stat mp">
                        <span class="combat-icon">💧</span>
                        <div class="combat-bar-container">
                            <div class="combat-bar mp-bar">
                                <div class="combat-fill" style="width: ${(this.data.mp / this.data.maxMp) * 100}%"></div>
                            </div>
                            <span class="combat-value">${this.data.mp} / ${this.data.maxMp}</span>
                        </div>
                    </div>
                </div>

                <!-- Derived Stats -->
                <div class="derived-stats">
                    <div class="derived-stat">
                        <span class="derived-icon">⚔️</span>
                        <span class="derived-label">Attack</span>
                        <span class="derived-value">${this.data.attack}</span>
                    </div>
                    <div class="derived-stat">
                        <span class="derived-icon">🛡️</span>
                        <span class="derived-label">Defense</span>
                        <span class="derived-value">${this.data.defense}</span>
                    </div>
                    <div class="derived-stat">
                        <span class="derived-icon">💨</span>
                        <span class="derived-label">Speed</span>
                        <span class="derived-value">${this.data.speed}</span>
                    </div>
                    <div class="derived-stat">
                        <span class="derived-icon">🍀</span>
                        <span class="derived-label">Luck</span>
                        <span class="derived-value">${this.data.luck}</span>
                    </div>
                </div>

                <!-- Main Stats -->
                <div class="stats-section">
                    <h3>Attributes</h3>
                    <div class="stats-grid">
                        ${Object.entries(GameData.stats).map(([key, stat]) => {
                            const statData = stats[key];
                            const progress = (statData.xp / statData.xpToNext) * 100;
                            
                            return `
                                <div class="stat-card" style="border-color: ${stat.color};">
                                    <div class="stat-header">
                                        <span class="stat-icon" style="background: ${stat.color}20; color: ${stat.color};">
                                            ${stat.icon}
                                        </span>
                                        <div class="stat-info">
                                            <span class="stat-name">${stat.name}</span>
                                            <span class="stat-total">${statData.total}</span>
                                        </div>
                                    </div>
                                    <div class="stat-breakdown">
                                        <span>Base: ${statData.base}</span>
                                        ${statData.bonus > 0 ? `<span class="stat-bonus">+${statData.bonus}</span>` : ''}
                                    </div>
                                    <div class="stat-xp">
                                        <div class="stat-xp-bar">
                                            <div class="stat-xp-fill" style="width: ${progress}%; background: ${stat.color};"></div>
                                        </div>
                                        <span class="stat-xp-text">${statData.xp} / ${statData.xpToNext}</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- Rest Button -->
                <div class="rest-section">
                    <button class="btn btn-secondary" onclick="Character.fullRest(); Character.render();">
                        🏕️ Rest (Restore HP & MP)
                    </button>
                </div>
            </div>
        `;
    },

    // Get quick view for dashboard
    getQuickView() {
        if (!this.data) {
            return `
                <div class="quick-no-character">
                    <p>No hero created yet.</p>
                    <button class="btn btn-small btn-primary" onclick="App.switchView('character')">
                        Create Hero
                    </button>
                </div>
            `;
        }

        const cls = GameData.characterClasses[this.data.class];
        const xpProgress = this.getXPProgress();

        return `
            <div class="quick-character">
                <div class="quick-avatar">
                    <span class="quick-icon">${cls.icon}</span>
                </div>
                <div class="quick-info">
                    <p class="quick-name">${this.data.name}</p>
                    <p class="quick-class">${cls.name} • Lvl ${this.data.level}</p>
                </div>
                <div class="quick-bars">
                    <div class="quick-bar">
                        <span>❤️</span>
                        <div class="quick-bar-track hp">
                            <div class="quick-bar-fill" style="width: ${(this.data.hp / this.data.maxHp) * 100}%"></div>
                        </div>
                        <span class="quick-bar-value">${this.data.hp}</span>
                    </div>
                    <div class="quick-bar">
                        <span>⭐</span>
                        <div class="quick-bar-track xp">
                            <div class="quick-bar-fill" style="width: ${xpProgress}%"></div>
                        </div>
                        <span class="quick-bar-value">${xpProgress}%</span>
                    </div>
                </div>
            </div>
        `;
    }
};

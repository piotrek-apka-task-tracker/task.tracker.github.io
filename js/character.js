console.log('CHARACTER.JS LOADED');

// ================================
// Character System (Polished)
// ================================

const Character = {
    data: null,

    // transient (not saved)
    _highlightStats: {},

    init() {
        console.log('Character module initialized');
        this.migrateData();
        this.ensureDailyProgress();
    },

    // ---------- Migration / Defaults ----------
    migrateData() {
        if (!this.data) return;

        // Add missing keys for older saves
        if (!this.data.baseStats) {
            this.data.baseStats = {
                strength: 10, dexterity: 10, constitution: 10,
                intelligence: 10, wisdom: 10, charisma: 10
            };
        }

        if (!this.data.statXP) {
            this.data.statXP = {
                strength: 0, dexterity: 0, constitution: 0,
                intelligence: 0, wisdom: 0, charisma: 0
            };
        }

        if (!this.data.statLevels) {
            this.data.statLevels = {
                strength: 0, dexterity: 0, constitution: 0,
                intelligence: 0, wisdom: 0, charisma: 0
            };
        }

        if (!this.data.activityLog) this.data.activityLog = [];
        if (!this.data.dailyProgress) {
            this.data.dailyProgress = {
                date: new Date().toDateString(),
                xp: 0,
                tasksCompleted: 0,
                habitsCompleted: 0
            };
        }

        // Ensure derived stats exist
        this.calculateCombatStats();
        if (typeof this.data.hp !== 'number') this.data.hp = this.data.maxHp;
        if (typeof this.data.mp !== 'number') this.data.mp = this.data.maxMp;

        Auth.saveUserData();
    },

    ensureDailyProgress() {
        if (!this.data) return;

        const today = new Date().toDateString();
        if (!this.data.dailyProgress) {
            this.data.dailyProgress = { date: today, xp: 0, tasksCompleted: 0, habitsCompleted: 0 };
            Auth.saveUserData();
            return;
        }

        if (this.data.dailyProgress.date !== today) {
            // reset for a new day
            this.data.dailyProgress = { date: today, xp: 0, tasksCompleted: 0, habitsCompleted: 0 };
            Auth.saveUserData();
        }
    },

    // ---------- Creation ----------
    createCharacter(name, characterClass) {
        const classData = GameData.characterClasses[characterClass];
        if (!classData) return null;

        const baseStats = {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10
        };

        for (const [stat, bonus] of Object.entries(classData.bonus)) {
            baseStats[stat] += bonus;
        }

        this.data = {
            name,
            class: characterClass,

            level: 1,
            experience: 0,

            baseStats,

            statXP: {
                strength: 0, dexterity: 0, constitution: 0,
                intelligence: 0, wisdom: 0, charisma: 0
            },

            statLevels: {
                strength: 0, dexterity: 0, constitution: 0,
                intelligence: 0, wisdom: 0, charisma: 0
            },

            // derived
            hp: 0,
            maxHp: 0,
            mp: 0,
            maxMp: 0,
            attack: 0,
            defense: 0,
            speed: 0,
            luck: 0,

            // tracking
            activityLog: [],
            dailyProgress: {
                date: new Date().toDateString(),
                xp: 0,
                tasksCompleted: 0,
                habitsCompleted: 0
            },

            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString()
        };

        this.calculateCombatStats();
        this.data.hp = this.data.maxHp;
        this.data.mp = this.data.maxMp;

        this.addLog('system', `Created ${name} the ${classData.name}.`);

        Auth.saveUserData();
        App.notify(`${name} the ${classData.name} has been created!`, 'success');
        return this.data;
    },

    // ---------- Stats ----------
    getStat(statName) {
        if (!this.data) return 10;
        const base = this.data.baseStats[statName] ?? 10;
        const bonus = this.data.statLevels[statName] ?? 0;
        return base + bonus;
    },

    getAllStats() {
        if (!this.data) return null;

        const out = {};
        for (const statName of Object.keys(GameData.stats)) {
            const base = this.data.baseStats[statName] ?? 10;
            const bonus = this.data.statLevels[statName] ?? 0;
            const xp = this.data.statXP[statName] ?? 0;
            const xpToNext = this.getStatXPRequired(bonus);

            out[statName] = { base, bonus, total: base + bonus, xp, xpToNext };
        }
        return out;
    },

    getStatXPRequired(currentStatLevel) {
        // configurable base (defaults to 50 if not present)
        const base = GameData.statXPBase ?? 50;
        return base * (currentStatLevel + 1);
    },

    // ---------- XP / Leveling ----------
    getXPForNextLevel() {
        if (!this.data) return 100;
        return GameData.calculateExpForLevel(this.data.level);
    },

    getXPProgress() {
        if (!this.data) return 0;
        const needed = this.getXPForNextLevel();
        return Math.floor((this.data.experience / needed) * 100);
    },

    addExperience(xp, meta = {}) {
        if (!this.data) return;

        this.ensureDailyProgress();

        this.data.experience += xp;
        this.data.lastActive = new Date().toISOString();

        // daily stats
        this.data.dailyProgress.xp += xp;
        if (meta.source === 'task') {
            if (meta.isHabit) this.data.dailyProgress.habitsCompleted += 1;
            else this.data.dailyProgress.tasksCompleted += 1;
        }

        // log
        if (meta.source === 'task') {
            const label = meta.taskName ? `"${meta.taskName}"` : 'a task';
            this.addLog(
                'xp',
                `Gained +${xp} XP from ${label}.`,
                { xp, ...meta }
            );
        } else {
            this.addLog('xp', `Gained +${xp} XP.`, { xp, ...meta });
        }

        const levelResult = this.checkLevelUp(); // may show modal
        Auth.saveUserData();

        // re-render if leveled or if we’re currently on character page
        if (levelResult.leveledUp || App.currentView === 'character') this.render();
        App.renderDashboard();
    },

    checkLevelUp() {
        if (!this.data) return { leveledUp: false, levelsGained: 0 };

        let levelsGained = 0;

        // snapshot derived stats BEFORE
        const before = this.getDerivedSnapshot();

        let xpNeeded = this.getXPForNextLevel();
        while (this.data.experience >= xpNeeded) {
            this.data.experience -= xpNeeded;
            this.data.level++;
            levelsGained++;

            // recalc each level
            this.calculateCombatStats();
            this.data.hp = this.data.maxHp;
            this.data.mp = this.data.maxMp;

            xpNeeded = this.getXPForNextLevel();
        }

        if (levelsGained > 0) {
            const after = this.getDerivedSnapshot();
            this.addLog('level', `Leveled up +${levelsGained}! Now level ${this.data.level}.`, {
                levelsGained,
                level: this.data.level
            });

            // One clean notification instead of spamming multiple
            App.notify(`🎉 Level Up! +${levelsGained} (Now level ${this.data.level})`, 'success');

            // Show a modal summary (polish)
            this.showLevelUpModal(levelsGained, before, after);

            return { leveledUp: true, levelsGained };
        }

        return { leveledUp: false, levelsGained: 0 };
    },

    addStatExperience(statName, xp, meta = {}) {
        if (!this.data) return;
        if (!GameData.stats[statName]) return;

        if (typeof this.data.statXP[statName] !== 'number') this.data.statXP[statName] = 0;
        if (typeof this.data.statLevels[statName] !== 'number') this.data.statLevels[statName] = 0;

        this.data.statXP[statName] += xp;

        if (meta.source === 'task') {
            const label = meta.taskName ? `"${meta.taskName}"` : 'a task';
            this.addLog(
                'statxp',
                `+${xp} ${GameData.stats[statName].abbr} XP from ${label}.`,
                { statName, xp, ...meta }
            );
        }

        const changed = this.checkStatLevelUp(statName);
        Auth.saveUserData();

        if (changed || App.currentView === 'character') this.render();
        App.renderDashboard();
    },

    checkStatLevelUp(statName) {
        if (!this.data) return false;

        let levelsGained = 0;
        let xpNeeded = this.getStatXPRequired(this.data.statLevels[statName]);

        while (this.data.statXP[statName] >= xpNeeded) {
            this.data.statXP[statName] -= xpNeeded;
            this.data.statLevels[statName]++;
            levelsGained++;

            xpNeeded = this.getStatXPRequired(this.data.statLevels[statName]);
        }

        if (levelsGained > 0) {
            this.calculateCombatStats();

            // highlight pulse for a few seconds
            this._highlightStats[statName] = Date.now();
            setTimeout(() => {
                delete this._highlightStats[statName];
                if (App.currentView === 'character') this.render();
            }, 2500);

            const statInfo = GameData.stats[statName];
            this.addLog(
                'stat',
                `${statInfo.name} increased by +${levelsGained} (now ${this.getStat(statName)}).`,
                { statName, levelsGained, newTotal: this.getStat(statName) }
            );

            App.notify(`${statInfo.icon} ${statInfo.abbr} +${levelsGained} (now ${this.getStat(statName)})`, 'success');
            return true;
        }

        return false;
    },

    // ---------- Derived stats ----------
    calculateCombatStats() {
        if (!this.data) return;

        const str = this.getStat('strength');
        const dex = this.getStat('dexterity');
        const con = this.getStat('constitution');
        const int = this.getStat('intelligence');
        const wis = this.getStat('wisdom');
        const cha = this.getStat('charisma');
        const level = this.data.level;

        this.data.maxHp = 50 + (con * 5) + (level * 10);
        this.data.maxMp = 20 + (int * 3) + (wis * 2) + (level * 5);

        this.data.attack = (str * 2) + dex + level;
        this.data.defense = (con * 2) + Math.floor(str / 2) + level;
        this.data.speed = (dex * 2) + level;
        this.data.luck = cha + Math.floor(wis / 2);

        if (this.data.hp > this.data.maxHp) this.data.hp = this.data.maxHp;
        if (this.data.mp > this.data.maxMp) this.data.mp = this.data.maxMp;
    },

    getDerivedSnapshot() {
        if (!this.data) return null;
        return {
            level: this.data.level,
            maxHp: this.data.maxHp,
            maxMp: this.data.maxMp,
            attack: this.data.attack,
            defense: this.data.defense,
            speed: this.data.speed,
            luck: this.data.luck
        };
    },

    showLevelUpModal(levelsGained, before, after) {
        if (!before || !after) return;

        const delta = (k) => after[k] - before[k];
        const row = (label, key, icon) => `
            <div class="levelup-row">
                <span class="levelup-label">${icon} ${label}</span>
                <span class="levelup-before">${before[key]}</span>
                <span class="levelup-arrow">→</span>
                <span class="levelup-after">${after[key]}</span>
                <span class="levelup-delta ${delta(key) >= 0 ? 'pos' : 'neg'}">
                    (${delta(key) >= 0 ? '+' : ''}${delta(key)})
                </span>
            </div>
        `;

        const content = `
            <div class="modal-header">
                <h2>🎉 Level Up!</h2>
                <button class="modal-close" onclick="App.closeModal()">&times;</button>
            </div>

            <p class="levelup-subtitle">
                You gained <strong>+${levelsGained}</strong> level${levelsGained > 1 ? 's' : ''}.
                You are now <strong>Level ${this.data.level}</strong>.
            </p>

            <div class="levelup-grid">
                ${row('Max HP', 'maxHp', '❤️')}
                ${row('Max MP', 'maxMp', '💧')}
                ${row('Attack', 'attack', '⚔️')}
                ${row('Defense', 'defense', '🛡️')}
                ${row('Speed', 'speed', '💨')}
                ${row('Luck', 'luck', '🍀')}
            </div>

            <div class="form-actions">
                <button class="btn btn-primary" onclick="App.closeModal()">Continue</button>
            </div>
        `;

        App.openModal(content);
    },

    // ---------- Rest ----------
    fullRest() {
        if (!this.data) return;
        this.data.hp = this.data.maxHp;
        this.data.mp = this.data.maxMp;
        this.addLog('system', 'Took a rest and restored HP/MP.');
        Auth.saveUserData();
        App.renderDashboard();
    },

    // ---------- Activity log ----------
    addLog(type, message, details = {}) {
        if (!this.data) return;

        const entry = {
            id: 'log_' + Date.now() + '_' + Math.random().toString(36).slice(2),
            type,
            message,
            details,
            ts: new Date().toISOString()
        };

        this.data.activityLog.unshift(entry);
        if (this.data.activityLog.length > 50) this.data.activityLog.length = 50;
    },

    timeAgo(iso) {
        const then = new Date(iso).getTime();
        const now = Date.now();
        const s = Math.floor((now - then) / 1000);
        if (s < 10) return 'just now';
        if (s < 60) return `${s}s ago`;
        const m = Math.floor(s / 60);
        if (m < 60) return `${m}m ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h}h ago`;
        const d = Math.floor(h / 24);
        return `${d}d ago`;
    },

    // ---------- UI ----------
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

                <div id="class-preview" class="class-preview hidden"></div>

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

        document.querySelectorAll('.class-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.class-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');

                const selectedClass = option.dataset.class;
                document.getElementById('selected-class').value = selectedClass;

                document.getElementById('create-hero-btn').disabled = false;
                this.showClassPreview(selectedClass);
            });
        });

        document.getElementById('character-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('character-name').value.trim();
            const characterClass = document.getElementById('selected-class').value;

            this.createCharacter(name, characterClass);
            App.closeModal();
            this.render();
            App.renderDashboard();
        });
    },

    showClassPreview(classKey) {
        const cls = GameData.characterClasses[classKey];
        const preview = document.getElementById('class-preview');

        const stats = {
            strength: 10, dexterity: 10, constitution: 10,
            intelligence: 10, wisdom: 10, charisma: 10
        };
        for (const [stat, bonus] of Object.entries(cls.bonus)) stats[stat] += bonus;

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

        this.ensureDailyProgress();

        const cls = GameData.characterClasses[this.data.class];
        const stats = this.getAllStats();
        const xpProgress = this.getXPProgress();
        const xpNeeded = this.getXPForNextLevel();

        const log = (this.data.activityLog || []).slice(0, 10);

        container.innerHTML = `
            <div class="character-sheet">
                <div class="character-header">
                    <div class="character-avatar">
                        <span class="avatar-icon">${cls.icon}</span>
                        <span class="avatar-level">${this.data.level}</span>
                    </div>
                    <div class="character-title">
                        <h2>${this.data.name}</h2>
                        <p class="character-class">${cls.name}</p>
                        <p class="character-sub">
                            Today: <strong>+${this.data.dailyProgress.xp} XP</strong> •
                            Tasks: <strong>${this.data.dailyProgress.tasksCompleted}</strong> •
                            Habits: <strong>${this.data.dailyProgress.habitsCompleted}</strong>
                        </p>
                    </div>
                </div>

                <div class="xp-section">
                    <div class="xp-header">
                        <span>Level ${this.data.level}</span>
                        <span>${this.data.experience} / ${xpNeeded} XP</span>
                    </div>
                    <div class="xp-bar">
                        <div class="xp-fill" style="width: ${xpProgress}%"></div>
                    </div>
                </div>

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

                <div class="derived-stats">
                    <div class="derived-stat"><span class="derived-icon">⚔️</span><span class="derived-label">Attack</span><span class="derived-value">${this.data.attack}</span></div>
                    <div class="derived-stat"><span class="derived-icon">🛡️</span><span class="derived-label">Defense</span><span class="derived-value">${this.data.defense}</span></div>
                    <div class="derived-stat"><span class="derived-icon">💨</span><span class="derived-label">Speed</span><span class="derived-value">${this.data.speed}</span></div>
                    <div class="derived-stat"><span class="derived-icon">🍀</span><span class="derived-label">Luck</span><span class="derived-value">${this.data.luck}</span></div>
                </div>

                <div class="stats-section">
                    <h3>Attributes</h3>
                    <div class="stats-grid">
                        ${Object.entries(GameData.stats).map(([key, stat]) => {
                            const s = stats[key];
                            const progress = Math.min(100, (s.xp / s.xpToNext) * 100);
                            const isHot = this._highlightStats[key] && (Date.now() - this._highlightStats[key] < 2600);

                            return `
                                <div class="stat-card ${isHot ? 'highlight' : ''}" style="border-color: ${stat.color};">
                                    <div class="stat-header">
                                        <span class="stat-icon" style="background: ${stat.color}20; color: ${stat.color};">
                                            ${stat.icon}
                                        </span>
                                        <div class="stat-info">
                                            <span class="stat-name">${stat.name}</span>
                                            <span class="stat-total">${s.total}</span>
                                        </div>
                                    </div>
                                    <div class="stat-breakdown">
                                        <span>Base: ${s.base}</span>
                                        ${s.bonus > 0 ? `<span class="stat-bonus">+${s.bonus}</span>` : ''}
                                    </div>
                                    <div class="stat-xp">
                                        <div class="stat-xp-bar">
                                            <div class="stat-xp-fill" style="width: ${progress}%; background: ${stat.color};"></div>
                                        </div>
                                        <span class="stat-xp-text">${s.xp} / ${s.xpToNext}</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <div class="activity-section">
                    <h3>Recent Activity</h3>
                    <div class="activity-log">
                        ${log.length === 0 ? `<p class="text-muted">No activity yet. Complete quests to grow stronger.</p>` : ''}
                        ${log.map(e => `
                            <div class="log-entry">
                                <span class="log-msg">${e.message}</span>
                                <span class="log-time">${this.timeAgo(e.ts)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="rest-section">
                    <button class="btn btn-secondary" onclick="Character.fullRest(); Character.render();">
                        🏕️ Rest (Restore HP & MP)
                    </button>
                </div>
            </div>
        `;
    },

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

        this.ensureDailyProgress();

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
                    <p class="quick-today">Today: +${this.data.dailyProgress.xp} XP</p>
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

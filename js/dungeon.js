console.log('DUNGEON.JS LOADED');

// ================================
// Dungeon System
// ================================

const Dungeon = {
    data: {
        currentLevel: 1,
        highestLevel: 1,
        bossesDefeated: [],
        artifacts: [],
        loreUnlocked: [],
        currentRun: null
    },

    // Combat state (transient, not saved)
    combat: null,

    init() {
        console.log('Dungeon module initialized');
        this.migrateData();
    },

    migrateData() {
        if (!this.data) {
            this.data = {
                currentLevel: 1,
                highestLevel: 1,
                bossesDefeated: [],
                artifacts: [],
                loreUnlocked: [],
                currentRun: null
            };
        }

        // Ensure arrays exist
        if (!Array.isArray(this.data.bossesDefeated)) this.data.bossesDefeated = [];
        if (!Array.isArray(this.data.artifacts)) this.data.artifacts = [];
        if (!Array.isArray(this.data.loreUnlocked)) this.data.loreUnlocked = [];
    },

    // ================================
    // Monster Generation
    // ================================

    generateMonster(floor, isBoss = false) {
        const types = Object.keys(GameData.monsterTypes);
        const type = types[Math.floor(Math.random() * types.length)];
        const typeData = GameData.monsterTypes[type];

        // Generate name
        let name;
        if (isBoss) {
            const titles = GameData.bossNames.titles;
            const names = GameData.bossNames.names;
            const epithets = GameData.bossNames.epithets;
            name = `${titles[Math.floor(Math.random() * titles.length)]} ${names[Math.floor(Math.random() * names.length)]} ${epithets[Math.floor(Math.random() * epithets.length)]}`;
        } else {
            const prefixes = GameData.monsterNames.prefixes;
            const baseNames = GameData.monsterNames[type];
            name = `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${baseNames[Math.floor(Math.random() * baseNames.length)]}`;
        }

        // Calculate stats based on floor
        const scaleFactor = 1 + (floor * 0.15);
        const bossMultiplier = isBoss ? 2.5 : 1;

        const baseHp = 30 + (floor * 8);
        const baseAttack = 5 + (floor * 2);
        const baseDefense = 3 + Math.floor(floor * 1.5);
        const baseSpeed = 8 + Math.floor(floor * 0.8);

        const monster = {
            id: 'monster_' + Date.now() + '_' + Math.random().toString(36).slice(2),
            name,
            type,
            icon: typeData.icon,
            color: typeData.color,
            isBoss,
            floor,

            maxHp: Math.floor(baseHp * scaleFactor * bossMultiplier * (typeData.statBias.constitution || 1)),
            hp: 0,
            attack: Math.floor(baseAttack * scaleFactor * bossMultiplier * (typeData.statBias.strength || 1)),
            defense: Math.floor(baseDefense * scaleFactor * bossMultiplier * (typeData.statBias.constitution || 1)),
            speed: Math.floor(baseSpeed * scaleFactor * (typeData.statBias.dexterity || 1)),

            xpReward: Math.floor((10 + floor * 5) * bossMultiplier),
            goldReward: Math.floor((5 + floor * 3) * bossMultiplier)
        };

        monster.hp = monster.maxHp;

        return monster;
    },

    // ================================
    // Combat System
    // ================================

    startCombat(monster) {
        if (!Character.data) {
            App.notify('Create a character first!', 'error');
            return;
        }

        this.combat = {
            monster,
            turn: 'player',
            log: [],
            isOver: false,
            result: null,
            turnNumber: 1
        };

        this.addCombatLog(`⚔️ Battle begins against ${monster.name}!`);
        this.renderCombat();
    },

    addCombatLog(message) {
        if (!this.combat) return;

        this.combat.log.push({
            message,
            turn: this.combat.turnNumber,
            timestamp: Date.now()
        });

        // Keep only last 50 entries
        if (this.combat.log.length > 50) {
            this.combat.log = this.combat.log.slice(-50);
        }
    },

    calculateDamage(attacker, defender, isPlayer) {
        // Base damage
        let damage = attacker.attack;

        // Defense reduction (diminishing returns)
        const defenseReduction = defender.defense / (defender.defense + 50);
        damage = damage * (1 - defenseReduction * 0.5);

        // Random variance (±20%)
        const variance = 0.8 + Math.random() * 0.4;
        damage = Math.floor(damage * variance);

        // Critical hit chance (based on luck/speed)
        const critChance = isPlayer
            ? (Character.data.luck || 0) / 100
            : 0.05;

        const isCrit = Math.random() < critChance;
        if (isCrit) {
            damage = Math.floor(damage * 1.5);
        }

        // Minimum 1 damage
        damage = Math.max(1, damage);

        return { damage, isCrit };
    },

    playerAttack() {
        if (!this.combat || this.combat.isOver || this.combat.turn !== 'player') return;

        const player = Character.data;
        const monster = this.combat.monster;

        const { damage, isCrit } = this.calculateDamage(player, monster, true);

        monster.hp = Math.max(0, monster.hp - damage);

        const critText = isCrit ? ' 💥 CRITICAL!' : '';
        this.addCombatLog(`You deal ${damage} damage to ${monster.name}.${critText}`);

        if (monster.hp <= 0) {
            this.endCombat('victory');
        } else {
            this.combat.turn = 'monster';
            this.combat.turnNumber++;
            this.renderCombat();

            // Monster attacks after short delay
            setTimeout(() => this.monsterAttack(), 800);
        }
    },

    playerDefend() {
        if (!this.combat || this.combat.isOver || this.combat.turn !== 'player') return;

        // Defending reduces incoming damage and restores some MP
        this.combat.playerDefending = true;

        const mpRestore = Math.floor(Character.data.maxMp * 0.1);
        Character.data.mp = Math.min(Character.data.maxMp, Character.data.mp + mpRestore);

        this.addCombatLog(`You take a defensive stance. (+${mpRestore} MP)`);

        this.combat.turn = 'monster';
        this.combat.turnNumber++;
        this.renderCombat();

        setTimeout(() => this.monsterAttack(), 800);
    },

    playerHeal() {
        if (!this.combat || this.combat.isOver || this.combat.turn !== 'player') return;

        const mpCost = 20;
        if (Character.data.mp < mpCost) {
            App.notify('Not enough MP!', 'error');
            return;
        }

        Character.data.mp -= mpCost;

        // Heal based on wisdom and level
        const healAmount = Math.floor(20 + Character.data.level * 5 + (Character.getStat('wisdom') * 2));
        const actualHeal = Math.min(healAmount, Character.data.maxHp - Character.data.hp);

        Character.data.hp += actualHeal;

        this.addCombatLog(`You cast Heal! Restored ${actualHeal} HP. (-${mpCost} MP)`);

        this.combat.turn = 'monster';
        this.combat.turnNumber++;
        this.renderCombat();

        setTimeout(() => this.monsterAttack(), 800);
    },

    playerFlee() {
        if (!this.combat || this.combat.isOver || this.combat.turn !== 'player') return;

        // Flee chance based on speed comparison
        const playerSpeed = Character.data.speed;
        const monsterSpeed = this.combat.monster.speed;
        const fleeChance = 0.3 + (playerSpeed - monsterSpeed) / 100;

        if (Math.random() < fleeChance) {
            this.addCombatLog('You successfully fled from battle!');
            this.endCombat('fled');
        } else {
            this.addCombatLog('Failed to flee!');
            this.combat.turn = 'monster';
            this.combat.turnNumber++;
            this.renderCombat();

            setTimeout(() => this.monsterAttack(), 800);
        }
    },

    monsterAttack() {
        if (!this.combat || this.combat.isOver) return;

        const player = Character.data;
        const monster = this.combat.monster;

        let { damage, isCrit } = this.calculateDamage(monster, player, false);

        // Reduce damage if player was defending
        if (this.combat.playerDefending) {
            damage = Math.floor(damage * 0.5);
            this.combat.playerDefending = false;
        }

        player.hp = Math.max(0, player.hp - damage);

        const critText = isCrit ? ' 💥 CRITICAL!' : '';
        this.addCombatLog(`${monster.name} deals ${damage} damage to you.${critText}`);

        if (player.hp <= 0) {
            this.endCombat('defeat');
        } else {
            this.combat.turn = 'player';
            this.renderCombat();
        }

        Auth.saveUserData();
    },

    endCombat(result) {
        if (!this.combat) return;

        this.combat.isOver = true;
        this.combat.result = result;

        const monster = this.combat.monster;

        if (result === 'victory') {
            this.addCombatLog(`🎉 Victory! You defeated ${monster.name}!`);

            // Award XP
            Character.addExperience(monster.xpReward, {
                source: 'dungeon',
                monsterName: monster.name,
                floor: monster.floor,
                isBoss: monster.isBoss
            });

            // Update progress
            if (monster.floor >= this.data.currentLevel) {
                this.data.currentLevel = monster.floor + 1;
                if (this.data.currentLevel > this.data.highestLevel) {
                    this.data.highestLevel = this.data.currentLevel;
                }
            }

            // Boss rewards
            if (monster.isBoss) {
                this.data.bossesDefeated.push({
                    name: monster.name,
                    floor: monster.floor,
                    defeatedAt: new Date().toISOString()
                });

                // Award artifact
                const artifact = GameData.getArtifactForFloor(monster.floor);
                if (artifact && !this.data.artifacts.find(a => a.id === artifact.id)) {
                    this.data.artifacts.push({
                        ...artifact,
                        obtainedAt: new Date().toISOString(),
                        fromFloor: monster.floor
                    });
                    this.addCombatLog(`🏆 Obtained artifact: ${artifact.icon} ${artifact.name}!`);
                }

                // Unlock lore
                const lore = GameData.getLoreForFloor(monster.floor);
                if (lore && !this.data.loreUnlocked.includes(lore.id)) {
                    this.data.loreUnlocked.push(lore.id);
                    this.addCombatLog(`📜 New lore discovered: "${lore.title}"`);
                }
            }

            // Small heal after victory
            const healAmount = Math.floor(Character.data.maxHp * 0.1);
            Character.data.hp = Math.min(Character.data.maxHp, Character.data.hp + healAmount);

        } else if (result === 'defeat') {
            this.addCombatLog(`💀 Defeated by ${monster.name}...`);

            // Restore some HP so player can continue
            Character.data.hp = Math.floor(Character.data.maxHp * 0.25);

        } else if (result === 'fled') {
            // No penalty for fleeing
        }

        Auth.saveUserData();
        this.renderCombat();
    },

    // ================================
    // Artifact System
    // ================================

    getArtifactBonuses() {
        const bonuses = {
            attack: 0,
            defense: 0,
            speed: 0,
            luck: 0,
            maxHp: 0,
            maxMp: 0
        };

        for (const artifact of this.data.artifacts) {
            for (const [stat, value] of Object.entries(artifact.stats || {})) {
                if (bonuses.hasOwnProperty(stat)) {
                    bonuses[stat] += value;
                }
            }
        }

        return bonuses;
    },

    getEffectiveStats() {
        if (!Character.data) return null;

        const bonuses = this.getArtifactBonuses();

        return {
            attack: Character.data.attack + bonuses.attack,
            defense: Character.data.defense + bonuses.defense,
            speed: Character.data.speed + bonuses.speed,
            luck: Character.data.luck + bonuses.luck,
            maxHp: Character.data.maxHp + bonuses.maxHp,
            maxMp: Character.data.maxMp + bonuses.maxMp
        };
    },

    // ================================
    // UI Rendering
    // ================================

    render() {
        const container = document.getElementById('dungeon-display');
        if (!container) return;

        if (!Character.data) {
            container.innerHTML = `
                <div class="dungeon-no-hero">
                    <div class="no-hero-icon">🏰</div>
                    <h2>The Dungeon Awaits</h2>
                    <p>Create a hero before entering the dungeon!</p>
                    <button class="btn btn-primary" onclick="App.switchView('character')">
                        Create Hero
                    </button>
                </div>
            `;
            return;
        }

        // Check if in combat
        if (this.combat && !this.combat.isOver) {
            this.renderCombat();
            return;
        }

        const effectiveStats = this.getEffectiveStats();

        container.innerHTML = `
            <div class="dungeon-main">
                <!-- Dungeon Header -->
                <div class="dungeon-header">
                    <div class="dungeon-level">
                        <span class="level-icon">🏰</span>
                        <div class="level-info">
                            <h2>Floor ${this.data.currentLevel}</h2>
                            <p>Highest: Floor ${this.data.highestLevel}</p>
                        </div>
                    </div>
                    <div class="dungeon-stats">
                        <span class="dstat">👹 ${this.data.bossesDefeated.length} Bosses</span>
                        <span class="dstat">⚔️ ${this.data.artifacts.length} Artifacts</span>
                        <span class="dstat">📜 ${this.data.loreUnlocked.length} Lore</span>
                    </div>
                </div>

                <!-- Hero Status -->
                <div class="dungeon-hero-status">
                    <div class="hero-bars">
                        <div class="hero-bar">
                            <span class="bar-label">❤️ HP</span>
                            <div class="bar-track hp">
                                <div class="bar-fill" style="width: ${(Character.data.hp / effectiveStats.maxHp) * 100}%"></div>
                            </div>
                            <span class="bar-value">${Character.data.hp}/${effectiveStats.maxHp}</span>
                        </div>
                        <div class="hero-bar">
                            <span class="bar-label">💧 MP</span>
                            <div class="bar-track mp">
                                <div class="bar-fill" style="width: ${(Character.data.mp / effectiveStats.maxMp) * 100}%"></div>
                            </div>
                            <span class="bar-value">${Character.data.mp}/${effectiveStats.maxMp}</span>
                        </div>
                    </div>
                    <div class="hero-combat-stats">
                        <span>⚔️ ${effectiveStats.attack}</span>
                        <span>🛡️ ${effectiveStats.defense}</span>
                        <span>💨 ${effectiveStats.speed}</span>
                        <span>🍀 ${effectiveStats.luck}</span>
                    </div>
                </div>

                <!-- Dungeon Actions -->
                <div class="dungeon-actions">
                    <button class="btn btn-primary btn-large" onclick="Dungeon.enterFloor(${this.data.currentLevel})">
                        ⚔️ Enter Floor ${this.data.currentLevel}
                    </button>
                    ${this.data.currentLevel > 1 ? `
                        <button class="btn btn-secondary" onclick="Dungeon.showFloorSelect()">
                            📋 Select Floor
                        </button>
                    ` : ''}
                </div>

                <!-- Floor Info -->
                <div class="floor-info">
                    ${this.getFloorInfo(this.data.currentLevel)}
                </div>

                <!-- Tabs for Artifacts/Lore -->
                <div class="dungeon-tabs">
                    <button class="dtab active" onclick="Dungeon.showTab('artifacts')">
                        ⚔️ Artifacts (${this.data.artifacts.length})
                    </button>
                    <button class="dtab" onclick="Dungeon.showTab('lore')">
                        📜 Lore (${this.data.loreUnlocked.length})
                    </button>
                    <button class="dtab" onclick="Dungeon.showTab('bosses')">
                        👹 Bosses (${this.data.bossesDefeated.length})
                    </button>
                </div>

                <div class="dungeon-tab-content" id="dungeon-tab-content">
                    ${this.renderArtifactsTab()}
                </div>
            </div>
        `;
    },

    getFloorInfo(floor) {
        const isBossFloor = floor % 5 === 0;
        const monsterLevel = Math.ceil(floor * 1.5);

        let difficulty = 'Normal';
        let diffClass = 'normal';
        if (floor > 50) { difficulty = 'Nightmare'; diffClass = 'nightmare'; }
        else if (floor > 25) { difficulty = 'Hard'; diffClass = 'hard'; }
        else if (floor > 10) { difficulty = 'Challenging'; diffClass = 'challenging'; }

        return `
            <div class="floor-details">
                <span class="floor-difficulty ${diffClass}">${difficulty}</span>
                <span>Monster Lvl: ~${monsterLevel}</span>
                ${isBossFloor ? '<span class="boss-warning">👹 BOSS FLOOR</span>' : ''}
            </div>
        `;
    },

    showTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.dtab').forEach(t => t.classList.remove('active'));
        event.target.classList.add('active');

        // Update content
        const content = document.getElementById('dungeon-tab-content');
        if (!content) return;

        switch (tabName) {
            case 'artifacts':
                content.innerHTML = this.renderArtifactsTab();
                break;
            case 'lore':
                content.innerHTML = this.renderLoreTab();
                break;
            case 'bosses':
                content.innerHTML = this.renderBossesTab();
                break;
        }
    },

    renderArtifactsTab() {
        if (this.data.artifacts.length === 0) {
            return `
                <div class="tab-empty">
                    <p>No artifacts collected yet.</p>
                    <p class="text-muted">Defeat bosses to earn powerful artifacts!</p>
                </div>
            `;
        }

        const bonuses = this.getArtifactBonuses();

        return `
            <div class="artifacts-summary">
                <h4>Total Bonuses:</h4>
                <div class="bonus-list">
                    ${bonuses.attack > 0 ? `<span>⚔️ +${bonuses.attack}</span>` : ''}
                    ${bonuses.defense > 0 ? `<span>🛡️ +${bonuses.defense}</span>` : ''}
                    ${bonuses.speed > 0 ? `<span>💨 +${bonuses.speed}</span>` : ''}
                    ${bonuses.luck > 0 ? `<span>🍀 +${bonuses.luck}</span>` : ''}
                    ${bonuses.maxHp > 0 ? `<span>❤️ +${bonuses.maxHp}</span>` : ''}
                    ${bonuses.maxMp > 0 ? `<span>💧 +${bonuses.maxMp}</span>` : ''}
                </div>
            </div>
            <div class="artifacts-list">
                ${this.data.artifacts.map(a => `
                    <div class="artifact-card tier-${a.tier}">
                        <span class="artifact-icon">${a.icon}</span>
                        <div class="artifact-info">
                            <h4>${a.name}</h4>
                            <p class="artifact-desc">${a.description}</p>
                            <div class="artifact-stats">
                                ${Object.entries(a.stats).map(([stat, val]) => {
                                    const icons = { attack: '⚔️', defense: '🛡️', speed: '💨', luck: '🍀', maxHp: '❤️', maxMp: '💧' };
                                    return `<span>${icons[stat] || ''} +${val}</span>`;
                                }).join('')}
                            </div>
                        </div>
                        <span class="artifact-floor">Floor ${a.fromFloor}</span>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderLoreTab() {
        if (this.data.loreUnlocked.length === 0) {
            return `
                <div class="tab-empty">
                    <p>No lore discovered yet.</p>
                    <p class="text-muted">Defeat bosses on special floors to uncover the story!</p>
                </div>
            `;
        }

        const unlockedLore = GameData.lore.filter(l => this.data.loreUnlocked.includes(l.id));

        return `
            <div class="lore-list">
                ${unlockedLore.map(l => `
                    <div class="lore-card" onclick="Dungeon.showLoreDetail('${l.id}')">
                        <span class="lore-floor">Floor ${l.floor}</span>
                        <h4>${l.title}</h4>
                        <p class="lore-preview">${l.text.substring(0, 80)}...</p>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderBossesTab() {
        if (this.data.bossesDefeated.length === 0) {
            return `
                <div class="tab-empty">
                    <p>No bosses defeated yet.</p>
                    <p class="text-muted">Bosses appear every 5 floors!</p>
                </div>
            `;
        }

        return `
            <div class="bosses-list">
                ${this.data.bossesDefeated.map(b => `
                    <div class="boss-card">
                        <span class="boss-icon">👹</span>
                        <div class="boss-info">
                            <h4>${b.name}</h4>
                            <p>Defeated on Floor ${b.floor}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    showLoreDetail(loreId) {
        const lore = GameData.lore.find(l => l.id === loreId);
        if (!lore) return;

        const content = `
            <div class="modal-header">
                <h2>📜 ${lore.title}</h2>
                <button class="modal-close" onclick="App.closeModal()">&times;</button>
            </div>
            <p class="lore-floor-badge">Discovered on Floor ${lore.floor}</p>
            <div class="lore-text">
                ${lore.text.split('\n').map(p => `<p>${p}</p>`).join('')}
            </div>
            <div class="form-actions">
                <button class="btn btn-secondary" onclick="App.closeModal()">Close</button>
            </div>
        `;

        App.openModal(content);
    },

    showFloorSelect() {
        let floorButtons = '';
        for (let i = 1; i <= this.data.highestLevel; i++) {
            const isBoss = i % 5 === 0;
            const isCurrentMax = i === this.data.highestLevel;
            floorButtons += `
                <button class="floor-btn ${isBoss ? 'boss' : ''} ${isCurrentMax ? 'current' : ''}"
                        onclick="Dungeon.enterFloor(${i}); App.closeModal();">
                    ${i} ${isBoss ? '👹' : ''}
                </button>
            `;
        }

        const content = `
            <div class="modal-header">
                <h2>📋 Select Floor</h2>
                <button class="modal-close" onclick="App.closeModal()">&times;</button>
            </div>
            <p class="text-muted">Choose a floor to challenge (up to your highest reached).</p>
            <div class="floor-grid">
                ${floorButtons}
            </div>
        `;

        App.openModal(content);
    },

    enterFloor(floor) {
        App.closeModal();

        const isBoss = floor % 5 === 0;
        const monster = this.generateMonster(floor, isBoss);

        this.startCombat(monster);
    },

    renderCombat() {
        const container = document.getElementById('dungeon-display');
        if (!container || !this.combat) return;

        const monster = this.combat.monster;
        const player = Character.data;
        const effectiveStats = this.getEffectiveStats();

        const isPlayerTurn = this.combat.turn === 'player' && !this.combat.isOver;
        const combatLog = this.combat.log.slice(-8);

        container.innerHTML = `
            <div class="combat-arena">
                <!-- Monster Section -->
                <div class="combat-monster ${this.combat.isOver && this.combat.result === 'victory' ? 'defeated' : ''}">
                    <div class="monster-header">
                        <span class="monster-icon" style="background: ${monster.color}20; border-color: ${monster.color};">
                            ${monster.icon}
                        </span>
                        <div class="monster-info">
                            <h3>${monster.name}</h3>
                            <p class="monster-type">${monster.isBoss ? '👹 BOSS • ' : ''}Floor ${monster.floor}</p>
                        </div>
                    </div>
                    <div class="monster-hp">
                        <div class="hp-bar-container">
                            <div class="hp-bar monster-hp-bar">
                                <div class="hp-fill" style="width: ${(monster.hp / monster.maxHp) * 100}%"></div>
                            </div>
                            <span class="hp-text">${monster.hp} / ${monster.maxHp}</span>
                        </div>
                    </div>
                    <div class="monster-stats">
                        <span>⚔️ ${monster.attack}</span>
                        <span>🛡️ ${monster.defense}</span>
                        <span>💨 ${monster.speed}</span>
                    </div>
                </div>

                <!-- VS Divider -->
                <div class="combat-vs">
                    <span>⚔️</span>
                    <span class="turn-indicator">${this.combat.isOver ? (this.combat.result === 'victory' ? 'VICTORY!' : this.combat.result === 'defeat' ? 'DEFEAT' : 'FLED') : (isPlayerTurn ? 'Your Turn' : 'Enemy Turn')}</span>
                </div>

                <!-- Player Section -->
                <div class="combat-player ${this.combat.isOver && this.combat.result === 'defeat' ? 'defeated' : ''}">
                    <div class="player-header">
                        <span class="player-icon">${GameData.characterClasses[player.class].icon}</span>
                        <div class="player-info">
                            <h3>${player.name}</h3>
                            <p>Level ${player.level} ${GameData.characterClasses[player.class].name}</p>
                        </div>
                    </div>
                    <div class="player-bars">
                        <div class="combat-bar-row">
                            <span>❤️</span>
                            <div class="bar-track hp">
                                <div class="bar-fill" style="width: ${(player.hp / effectiveStats.maxHp) * 100}%"></div>
                            </div>
                            <span>${player.hp}/${effectiveStats.maxHp}</span>
                        </div>
                        <div class="combat-bar-row">
                            <span>💧</span>
                            <div class="bar-track mp">
                                <div class="bar-fill" style="width: ${(player.mp / effectiveStats.maxMp) * 100}%"></div>
                            </div>
                            <span>${player.mp}/${effectiveStats.maxMp}</span>
                        </div>
                    </div>
                    <div class="player-stats">
                        <span>⚔️ ${effectiveStats.attack}</span>
                        <span>🛡️ ${effectiveStats.defense}</span>
                        <span>💨 ${effectiveStats.speed}</span>
                        <span>🍀 ${effectiveStats.luck}</span>
                    </div>
                </div>

                <!-- Combat Log -->
                <div class="combat-log">
                    ${combatLog.map(entry => `
                        <div class="log-line">${entry.message}</div>
                    `).join('')}
                </div>

                <!-- Combat Actions -->
                <div class="combat-actions">
                    ${this.combat.isOver ? `
                        <button class="btn btn-primary btn-large" onclick="Dungeon.exitCombat()">
                            ${this.combat.result === 'victory' ? '🎉 Continue' : '🏠 Return'}
                        </button>
                    ` : `
                        <button class="btn btn-primary ${!isPlayerTurn ? 'disabled' : ''}" 
                                onclick="Dungeon.playerAttack()" ${!isPlayerTurn ? 'disabled' : ''}>
                            ⚔️ Attack
                        </button>
                        <button class="btn btn-secondary ${!isPlayerTurn ? 'disabled' : ''}" 
                                onclick="Dungeon.playerDefend()" ${!isPlayerTurn ? 'disabled' : ''}>
                            🛡️ Defend
                        </button>
                        <button class="btn btn-secondary ${!isPlayerTurn || player.mp < 20 ? 'disabled' : ''}" 
                                onclick="Dungeon.playerHeal()" ${!isPlayerTurn || player.mp < 20 ? 'disabled' : ''}>
                            💚 Heal (20 MP)
                        </button>
                        <button class="btn btn-secondary ${!isPlayerTurn ? 'disabled' : ''}" 
                                onclick="Dungeon.playerFlee()" ${!isPlayerTurn ? 'disabled' : ''}>
                            🏃 Flee
                        </button>
                    `}
                </div>
            </div>
        `;
    },

    exitCombat() {
        this.combat = null;
        this.render();
        App.renderDashboard();
    },

    // Quick view for dashboard
    getQuickView() {
        const bossCount = this.data.bossesDefeated.length;
        const artifactCount = this.data.artifacts.length;

        return `
            <div class="dungeon-quick">
                <div class="dq-level">
                    <span class="dq-icon">🏰</span>
                    <span class="dq-floor">Floor ${this.data.currentLevel}</span>
                </div>
                <div class="dq-stats">
                    <span>👹 ${bossCount}</span>
                    <span>⚔️ ${artifactCount}</span>
                    <span>📜 ${this.data.loreUnlocked.length}</span>
                </div>
                <button class="btn btn-small btn-primary" onclick="App.switchView('dungeon')">
                    Enter Dungeon
                </button>
            </div>
        `;
    }
};

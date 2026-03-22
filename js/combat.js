// ================================
// COMBAT SYSTEM
// ================================
const CombatSystem = {
    heroState: null,
    enemyState: null,
    isPlayerTurn: true,
    isCombatActive: false,
    isDefending: false,
    combatCallback: null,

    // Start a combat encounter
    startCombat(enemy, callback) {
        const userData = Storage.getUserData(App.currentUser);
        const char = userData.character;
        const combat = CharacterSystem.getCombatStats(userData);
        const classData = CharacterSystem.classData[char.class];

        this.heroState = {
            name: char.name,
            emoji: classData.emoji,
            hp: char.hp,
            maxHP: combat.maxHP,
            attack: combat.attack,
            defense: combat.defense,
            speed: combat.speed,
            crit: combat.crit,
            magic: combat.magic,
            class: char.class
        };

        this.enemyState = { ...enemy };
        this.isPlayerTurn = this.heroState.speed >= this.enemyState.speed;
        this.isCombatActive = true;
        this.isDefending = false;
        this.combatCallback = callback;

        // Update display
        this.updateCombatUI();
        this.clearLog();
        
        const bossText = enemy.isBoss ? '⚠️ BOSS ENCOUNTER!' : '';
        this.addLog(`${bossText} ${enemy.name} appears!`, 'system');
        
        if (!this.isPlayerTurn) {
            this.addLog(`${enemy.name} moves first!`, 'system');
            setTimeout(() => this.enemyTurn(), 1000);
        } else {
            this.addLog('Your turn! Choose an action.', 'system');
        }

        this.showCombatActions(true);
    },

    // Player actions
    playerAttack() {
        if (!this.isCombatActive || !this.isPlayerTurn) return;
        
        this.isDefending = false;
        let damage = Math.max(1, this.heroState.attack - this.enemyState.defense * 0.5);
        
        // Randomize
        damage = Math.floor(damage * (0.85 + Math.random() * 0.3));
        
        // Crit check
        let isCrit = Math.random() * 100 < this.heroState.crit;
        if (isCrit) {
            damage = Math.floor(damage * 1.5);
            this.addLog(`⚡ CRITICAL HIT! You strike for ${damage} damage!`, 'crit');
        } else {
            this.addLog(`⚔️ You attack for ${damage} damage!`, 'hero');
        }

        this.enemyState.hp = Math.max(0, this.enemyState.hp - damage);
        this.updateCombatUI();

        if (this.enemyState.hp <= 0) {
            this.endCombat(true);
            return;
        }

        this.isPlayerTurn = false;
        setTimeout(() => this.enemyTurn(), 800);
    },

    playerSkill() {
        if (!this.isCombatActive || !this.isPlayerTurn) return;

        this.isDefending = false;
        const classData = CharacterSystem.classData[this.heroState.class];

        let damage = 0;

        if (classData.usesMagic) {
            damage = Math.max(1, this.heroState.magic * classData.skillMultiplier - this.enemyState.defense * 0.3);
        } else {
            damage = Math.max(1, this.heroState.attack * classData.skillMultiplier - this.enemyState.defense * 0.5);
        }

        damage = Math.floor(damage * (0.9 + Math.random() * 0.2));

        // Ranger bonus crit
        if (classData.skillCritBonus) {
            const critChance = this.heroState.crit + classData.skillCritBonus;
            if (Math.random() * 100 < critChance) {
                damage = Math.floor(damage * 1.5);
                this.addLog(`⚡ CRITICAL ${classData.skillName}! ${damage} damage!`, 'crit');
            } else {
                this.addLog(`✨ ${classData.skillName}! ${damage} damage!`, 'hero');
            }
        } else {
            this.addLog(`✨ ${classData.skillName}! ${damage} damage!`, 'hero');
        }

        // Bard healing
        if (classData.healsPercent) {
            const healAmount = Math.floor(this.heroState.maxHP * classData.healsPercent / 100);
            this.heroState.hp = Math.min(this.heroState.maxHP, this.heroState.hp + healAmount);
            this.addLog(`💚 You heal for ${healAmount} HP!`, 'hero');
        }

        this.enemyState.hp = Math.max(0, this.enemyState.hp - damage);
        this.updateCombatUI();

        if (this.enemyState.hp <= 0) {
            this.endCombat(true);
            return;
        }

        this.isPlayerTurn = false;
        setTimeout(() => this.enemyTurn(), 800);
    },

    playerDefend() {
        if (!this.isCombatActive || !this.isPlayerTurn) return;
        
        this.isDefending = true;
        this.addLog('🛡️ You brace for the attack! (50% damage reduction)', 'hero');
        
        // Small heal on defend
        const healAmount = Math.floor(this.heroState.maxHP * 0.05);
        this.heroState.hp = Math.min(this.heroState.maxHP, this.heroState.hp + healAmount);
        if (healAmount > 0) {
            this.addLog(`💚 You recover ${healAmount} HP.`, 'hero');
        }
        
        this.updateCombatUI();
        this.isPlayerTurn = false;
        setTimeout(() => this.enemyTurn(), 800);
    },

    playerFlee() {
        if (!this.isCombatActive || !this.isPlayerTurn) return;

        const fleeChance = 40 + (this.heroState.speed - this.enemyState.speed) * 2;
        
        if (this.enemyState.isBoss) {
            this.addLog('🚫 You cannot flee from a boss!', 'system');
            return;
        }

        if (Math.random() * 100 < fleeChance) {
            this.addLog('🏃 You fled successfully!', 'system');
            this.isCombatActive = false;
            this.showCombatActions(false);
            
            // Save current HP
            const userData = Storage.getUserData(App.currentUser);
            userData.character.hp = this.heroState.hp;
            Storage.saveUserData(App.currentUser, userData);
            
            if (this.combatCallback) this.combatCallback('fled');
        } else {
            this.addLog('🏃 Failed to flee!', 'system');
            this.isPlayerTurn = false;
            setTimeout(() => this.enemyTurn(), 800);
        }
    },

    // Enemy turn
    enemyTurn() {
        if (!this.isCombatActive) return;

        let damage = Math.max(1, this.enemyState.attack - this.heroState.defense * 0.4);
        damage = Math.floor(damage * (0.8 + Math.random() * 0.4));

        if (this.isDefending) {
            damage = Math.floor(damage * 0.5);
            this.addLog(`🛡️ ${this.enemyState.name} attacks but you deflect! Only ${damage} damage!`, 'enemy');
        } else {
            // Enemy crit
            if (Math.random() < 0.1) {
                damage = Math.floor(damage * 1.3);
                this.addLog(`💥 ${this.enemyState.name} lands a heavy blow for ${damage} damage!`, 'crit');
            } else {
                this.addLog(`👹 ${this.enemyState.name} attacks for ${damage} damage!`, 'enemy');
            }
        }

        this.heroState.hp = Math.max(0, this.heroState.hp - damage);
        this.isDefending = false;
        this.updateCombatUI();

        if (this.heroState.hp <= 0) {
            this.endCombat(false);
            return;
        }

        this.isPlayerTurn = true;
        this.addLog('Your turn! Choose an action.', 'system');
    },

    endCombat(victory) {
        this.isCombatActive = false;
        this.showCombatActions(false);

        const userData = Storage.getUserData(App.currentUser);

        if (victory) {
            this.addLog(`🏆 ${this.enemyState.name} has been defeated!`, 'system');
            userData.stats.monstersSlain++;
            
            // Save HP
            userData.character.hp = this.heroState.hp;
            Storage.saveUserData(App.currentUser, userData);

            // Show victory result
            this.showResult(true, this.enemyState);
        } else {
            this.addLog('💀 You have been defeated...', 'system');
            
            // On defeat, restore to 50% HP
            const combat = CharacterSystem.getCombatStats(userData);
            userData.character.hp = Math.floor(combat.maxHP * 0.5);
            Storage.saveUserData(App.currentUser, userData);

            this.showResult(false, this.enemyState);
        }
    },

    showResult(victory, enemy) {
        const resultDiv = document.getElementById('combat-result');
        const contentDiv = document.getElementById('result-content');
        
        if (victory) {
            contentDiv.innerHTML = `
                <div class="result-victory">
                    <h2>⚔️ Victory!</h2>
                    <p>${enemy.name} has been vanquished!</p>
                    ${enemy.isBoss ? '<p class="result-boss-text">🏆 Boss defeated! Artifact and lore await!</p>' : '<p>The path forward is clear.</p>'}
                </div>
            `;
        } else {
            contentDiv.innerHTML = `
                <div class="result-defeat">
                    <h2>💀 Defeated</h2>
                    <p>You were overwhelmed by ${enemy.name}.</p>
                    <p>Complete more tasks and habits to grow stronger!</p>
                </div>
            `;
        }

        resultDiv.classList.remove('hidden');

        document.getElementById('result-continue-btn').onclick = () => {
            resultDiv.classList.add('hidden');
            if (this.combatCallback) {
                this.combatCallback(victory ? 'victory' : 'defeat');
            }
        };
    },

    // UI Updates
    updateCombatUI() {
        // Hero
        document.getElementById('hero-combat-avatar').textContent = this.heroState.emoji;
        document.getElementById('hero-combat-name').textContent = this.heroState.name;
        const heroHPPercent = Math.max(0, (this.heroState.hp / this.heroState.maxHP) * 100);
        document.getElementById('hero-hp-bar').style.width = heroHPPercent + '%';
        document.getElementById('hero-hp-text').textContent = `${Math.max(0, this.heroState.hp)}/${this.heroState.maxHP}`;

        // Enemy
        document.getElementById('enemy-combat-avatar').textContent = this.enemyState.emoji;
        document.getElementById('enemy-combat-name').textContent = this.enemyState.name;
        const enemyHPPercent = Math.max(0, (this.enemyState.hp / this.enemyState.maxHP) * 100);
        document.getElementById('enemy-hp-bar').style.width = enemyHPPercent + '%';
        document.getElementById('enemy-hp-text').textContent = `${Math.max(0, this.enemyState.hp)}/${this.enemyState.maxHP}`;
    },

    showCombatActions(show) {
        document.getElementById('combat-actions').style.display = show ? 'grid' : 'none';
    },

    addLog(message, type) {
        const log = document.getElementById('combat-log');
        const entry = document.createElement('div');
        entry.className = `log-entry log-${type}`;
        entry.textContent = message;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
    },

    clearLog() {
        document.getElementById('combat-log').innerHTML = '';
    }
};

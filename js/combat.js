// ==========================================
// Combat System
// ==========================================

const Combat = {
    state: null,

    startCombat(floorData) {
        const data = Auth.getData();
        const heroStats = Character.getCombatStats(data);

        this.state = {
            floor: floorData.floor,
            enemies: floorData.enemies,
            currentEnemyIndex: 0,
            hero: {
                name: data.character.name,
                icon: Character.classIcons[data.character.class],
                hp: heroStats.hp,
                maxHp: heroStats.hp,
                attack: heroStats.attack,
                defense: heroStats.defense,
                speed: heroStats.speed,
                magic: heroStats.magic,
                crit: heroStats.crit,
                defending: false
            },
            isBossFloor: floorData.isBossFloor,
            log: [],
            inCombat: true,
            playerTurn: true,
            monstersSlain: 0
        };

        UI.showDungeonSection('combat-screen');
        this.setupCombatUI();
        this.addLog(`⚔️ Floor ${this.state.floor} — Combat begins!`);
        this.nextEnemy();
    },

    setupCombatUI() {
        const hero = this.state.hero;
        document.getElementById('combat-hero-name').textContent = hero.name;
        document.getElementById('combat-hero-avatar').textContent = hero.icon;
        this.updateHealthBars();
        document.getElementById('combat-log').innerHTML = '';
        this.enableControls(true);
    },

    nextEnemy() {
        if (this.state.currentEnemyIndex >= this.state.enemies.length) {
            // All enemies defeated - floor complete!
            this.floorComplete();
            return;
        }

        const enemy = this.getCurrentEnemy();
        document.getElementById('combat-enemy-name').textContent = enemy.name;
        document.getElementById('combat-enemy-avatar').textContent = enemy.icon;
        document.getElementById('enemy-level').textContent = `Level ${enemy.level}${enemy.isBoss ? ' ★ BOSS' : ''}`;
        this.updateHealthBars();

        if (enemy.isBoss) {
            this.addLog(`🔥 <span class="log-enemy">BOSS: ${enemy.name}</span> appears!`);
        } else {
            this.addLog(`A <span class="log-enemy">${enemy.name}</span> appears!`);
        }

        this.state.playerTurn = true;
        this.enableControls(true);
    },

    getCurrentEnemy() {
        return this.state.enemies[this.state.currentEnemyIndex];
    },

    playerAction(action) {
        if (!this.state || !this.state.inCombat || !this.state.playerTurn) return;

        this.state.playerTurn = false;
        this.enableControls(false);
        this.state.hero.defending = false;

        const enemy = this.getCurrentEnemy();
        let damage = 0;

        switch (action) {
            case 'attack':
                damage = this.calculateDamage(this.state.hero.attack, enemy.defense);
                const isCrit = Math.random() * 100 < this.state.hero.crit;
                if (isCrit) {
                    damage = Math.floor(damage * 1.8);
                    this.addLog(`⚔️ <span class="log-hero">${this.state.hero.name}</span> lands a <span class="log-crit">CRITICAL HIT</span> for <span class="log-damage">${damage}</span> damage!`);
                } else {
                    this.addLog(`⚔️ <span class="log-hero">${this.state.hero.name}</span> attacks for <span class="log-damage">${damage}</span> damage!`);
                }
                enemy.hp = Math.max(0, enemy.hp - damage);
                break;

            case 'heavy':
                // High damage but might miss
                if (Math.random() > 0.3) {
                    damage = this.calculateDamage(this.state.hero.attack * 1.8, enemy.defense);
                    this.addLog(`💥 <span class="log-hero">${this.state.hero.name}</span> unleashes a heavy strike for <span class="log-damage">${damage}</span> damage!`);
                    enemy.hp = Math.max(0, enemy.hp - damage);
                } else {
                    this.addLog(`💥 <span class="log-miss">${this.state.hero.name}'s heavy strike misses!</span>`);
                }
                break;

            case 'defend':
                this.state.hero.defending = true;
                const healAmount = Math.floor(this.state.hero.maxHp * 0.05);
                this.state.hero.hp = Math.min(this.state.hero.maxHp, this.state.hero.hp + healAmount);
                this.addLog(`🛡️ <span class="log-hero">${this.state.hero.name}</span> takes a defensive stance and recovers <span class="log-heal">${healAmount}</span> HP!`);
                break;

            case 'magic':
                damage = this.calculateDamage(this.state.hero.magic, enemy.defense * 0.5);
                this.addLog(`🔮 <span class="log-hero">${this.state.hero.name}</span> casts a spell for <span class="log-damage">${damage}</span> damage!`);
                enemy.hp = Math.max(0, enemy.hp - damage);
                break;
        }

        this.updateHealthBars();

        // Check if enemy is dead
        if (enemy.hp <= 0) {
            this.state.monstersSlain++;
            const data = Auth.getData();
            data.stats.monstersSlain++;
            Auth.saveData(data);

            if (enemy.isBoss) {
                this.addLog(`🏆 <span class="log-crit">${enemy.name} has been defeated!</span>`);
            } else {
                this.addLog(`💀 <span class="log-enemy">${enemy.name}</span> is slain!`);
            }

            setTimeout(() => {
                this.state.currentEnemyIndex++;
                this.nextEnemy();
            }, 1000);
            return;
        }

        // Enemy turn after delay
        setTimeout(() => this.enemyTurn(), 800);
    },

    enemyTurn() {
        if (!this.state || !this.state.inCombat) return;

        const enemy = this.getCurrentEnemy();
        let damage = this.calculateDamage(enemy.attack, this.state.hero.defense);

        if (this.state.hero.defending) {
            damage = Math.floor(damage * 0.4);
            this.addLog(`🛡️ <span class="log-enemy">${enemy.name}</span> attacks but ${this.state.hero.name}'s defense holds! Only <span class="log-damage">${damage}</span> damage taken.`);
        } else {
            // Enemy crit chance
            const enemyCrit = Math.random() < 0.1;
            if (enemyCrit) {
                damage = Math.floor(damage * 1.5);
                this.addLog(`💥 <span class="log-enemy">${enemy.name}</span> lands a critical hit for <span class="log-damage">${damage}</span> damage!`);
            } else {
                this.addLog(`⚔️ <span class="log-enemy">${enemy.name}</span> attacks for <span class="log-damage">${damage}</span> damage!`);
            }
        }

        this.state.hero.hp = Math.max(0, this.state.hero.hp - damage);
        this.updateHealthBars();

        // Check if hero is dead
        if (this.state.hero.hp <= 0) {
            this.addLog(`💀 <span class="log-hero">${this.state.hero.name}</span> has fallen!`);
            setTimeout(() => this.heroDefeated(), 1000);
            return;
        }

        // Player's turn
        this.state.playerTurn = true;
        this.enableControls(true);
    },

    calculateDamage(attack, defense) {
        const baseDmg = Math.max(1, attack - defense * 0.5);
        const variance = 0.2;
        const multiplier = 1 + (Math.random() * variance * 2 - variance);
        return Math.max(1, Math.floor(baseDmg * multiplier));
    },

    updateHealthBars() {
        if (!this.state) return;

        const hero = this.state.hero;
        const heroPercent = Math.max(0, (hero.hp / hero.maxHp) * 100);
        document.getElementById('hero-health-bar').style.width = heroPercent + '%';
        document.getElementById('hero-health-text').textContent = `${hero.hp} / ${hero.maxHp}`;

        const enemy = this.getCurrentEnemy();
        if (enemy) {
            const enemyPercent = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
            document.getElementById('enemy-health-bar').style.width = enemyPercent + '%';
            document.getElementById('enemy-health-text').textContent = `${enemy.hp} / ${enemy.maxHp}`;
        }
    },

    addLog(message) {
        const logEl = document.getElementById('combat-log');
        const entry = document.createElement('div');
        entry.className = 'combat-log-entry';
        entry.innerHTML = message;
        logEl.appendChild(entry);
        logEl.scrollTop = logEl.scrollHeight;
    },

    enableControls(enabled) {
        document.querySelectorAll('.combat-btn').forEach(btn => {
            btn.disabled = !enabled;
        });
    },

    floorComplete() {
        this.state.inCombat = false;
        const data = Auth.getData();
        const result = Dungeon.completeFloor(data);

        if (result.isBossFloor) {
            // Show boss victory screen
            let detailsHtml = `<p>You have conquered Floor ${this.state.floor}!</p>`;
            detailsHtml += `<p>Monsters slain: ${this.state.monstersSlain}</p>`;

            document.getElementById('boss-victory-details').innerHTML = detailsHtml;

            // Show artifact
            if (result.artifact) {
                document.getElementById('artifact-reveal').innerHTML = `
                    <div class="artifact-reveal-icon">${result.artifact.icon}</div>
                    <div class="artifact-reveal-name">${result.artifact.name}</div>
                    <div class="artifact-reveal-effect">${result.artifact.description}</div>
                `;
            }

            // Show lore
            if (result.lore) {
                document.getElementById('lore-reveal').innerHTML = `
                    <h4>📜 ${result.lore.title}</h4>
                    <p>${result.lore.text.substring(0, 300)}...</p>
                    <p style="margin-top:10px; color: var(--accent-blue); font-style: normal;">Full chapter available in the Lore section.</p>
                `;
            } else {
                document.getElementById('lore-reveal').innerHTML = '';
            }

            UI.showDungeonSection('boss-victory-screen');
        } else {
            // Regular victory
            let detailsHtml = `<p>Floor ${this.state.floor} cleared!</p>`;
            detailsHtml += `<p>Monsters slain: ${this.state.monstersSlain}</p>`;

            const nextFloor = data.dungeon.currentFloor;
            if (nextFloor % 5 === 0) {
                detailsHtml += `<p style="color: var(--accent-gold); margin-top: 10px;">⚠️ Next floor has a BOSS! Prepare yourself!</p>`;
            }

            document.getElementById('victory-details').innerHTML = detailsHtml;
            document.getElementById('victory-continue-btn').onclick = () => {
                // Ask if they want to continue or return
                const data = Auth.getData();
                Combat.startCombat(Dungeon.enterFloor(data));
            };

            // Add a return button
            let returnBtn = document.getElementById('victory-return-btn');
            if (!returnBtn) {
                returnBtn = document.createElement('button');
                returnBtn.id = 'victory-return-btn';
                returnBtn.className = 'btn btn-ghost btn-large';
                returnBtn.textContent = 'Return to Hub';
                returnBtn.style.marginTop = '10px';
                returnBtn.style.marginLeft = '10px';
                returnBtn.onclick = () => Dungeon.returnToHub();
                document.getElementById('victory-continue-btn').parentNode.appendChild(returnBtn);
            }

            UI.showDungeonSection('victory-screen');
        }

        UI.showToast(`🏰 Floor ${this.state.floor} Complete!`, 'success');
    },

    heroDefeated() {
        this.state.inCombat = false;

        let detailsHtml = `<p>Defeated on Floor ${this.state.floor}</p>`;
        detailsHtml += `<p>You managed to slay ${this.state.monstersSlain} monster(s) before falling.</p>`;
        detailsHtml += `<p style="margin-top: 15px; color: var(--text-secondary);">Complete more quests and build better habits to strengthen your hero!</p>`;

        document.getElementById('defeat-details').innerHTML = detailsHtml;
        UI.showDungeonSection('defeat-screen');
    },

    endCombat() {
        this.state = null;
    }
};

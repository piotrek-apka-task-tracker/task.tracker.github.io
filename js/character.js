// ==========================================
// Character System
// ==========================================

const Character = {
    classIcons: {
        warrior: '🗡️',
        mage: '🔮',
        ranger: '🏹',
        paladin: '🛡️',
        bard: '🎵'
    },

    classBonuses: {
        warrior: { strength: 3, constitution: 1 },
        mage: { intelligence: 3, wisdom: 1 },
        ranger: { dexterity: 3, wisdom: 1 },
        paladin: { constitution: 3, charisma: 1 },
        bard: { charisma: 3, dexterity: 1 }
    },

    createNew(name, heroClass) {
        const bonuses = this.classBonuses[heroClass] || {};
        return {
            name: name,
            class: heroClass,
            level: 1,
            xp: 0,
            xpToNext: 100,
            totalXp: 0,
            stats: {
                strength: 10 + (bonuses.strength || 0),
                dexterity: 10 + (bonuses.dexterity || 0),
                constitution: 10 + (bonuses.constitution || 0),
                intelligence: 10 + (bonuses.intelligence || 0),
                wisdom: 10 + (bonuses.wisdom || 0),
                charisma: 10 + (bonuses.charisma || 0)
            },
            statXp: {
                strength: 0,
                dexterity: 0,
                constitution: 0,
                intelligence: 0,
                wisdom: 0,
                charisma: 0
            }
        };
    },

    getXpToNextLevel(level) {
        // Exponential growth: 100, 150, 225, 337, 506...
        return Math.floor(100 * Math.pow(1.5, level - 1));
    },

    getStatXpToNext(currentStatValue) {
        // Each stat level requires more XP
        return Math.floor(50 * Math.pow(1.3, currentStatValue - 10));
    },

    addXp(data, amount, statName) {
        const char = data.character;
        char.xp += amount;
        char.totalXp += amount;
        data.stats.totalXpEarned += amount;

        let leveledUp = false;
        let newLevel = char.level;

        // Check for level up
        while (char.xp >= char.xpToNext) {
            char.xp -= char.xpToNext;
            char.level++;
            char.xpToNext = this.getXpToNextLevel(char.level);
            leveledUp = true;
            newLevel = char.level;
        }

        // Add stat XP
        let statLeveledUp = false;
        let statLeveledName = '';
        if (statName && char.statXp[statName] !== undefined) {
            char.statXp[statName] += amount;
            const needed = this.getStatXpToNext(char.stats[statName]);

            while (char.statXp[statName] >= needed) {
                char.statXp[statName] -= needed;
                char.stats[statName]++;
                statLeveledUp = true;
                statLeveledName = statName;
            }
        }

        Auth.saveData(data);

        return {
            leveledUp,
            newLevel,
            statLeveledUp,
            statLeveledName,
            statNewValue: statLeveledUp ? char.stats[statName] : 0
        };
    },

    getCombatStats(data) {
        const char = data.character;
        const stats = char.stats;
        const artifacts = data.dungeon.artifacts || [];

        let bonuses = { hp: 0, attack: 0, defense: 0, speed: 0, magic: 0, crit: 0 };

        // Apply artifact bonuses
        artifacts.forEach(a => {
            if (a.effect) {
                if (a.effect.hp) bonuses.hp += a.effect.hp;
                if (a.effect.attack) bonuses.attack += a.effect.attack;
                if (a.effect.defense) bonuses.defense += a.effect.defense;
                if (a.effect.speed) bonuses.speed += a.effect.speed;
                if (a.effect.magic) bonuses.magic += a.effect.magic;
                if (a.effect.crit) bonuses.crit += a.effect.crit;
                // Stat bonuses from artifacts
                if (a.effect.stat && a.effect.bonus) {
                    if (a.effect.stat === 'all') {
                        // Applied already visually, handle in combat
                    }
                }
            }
        });

        // Calculate total stat bonuses from artifacts with stat === 'all'
        let allStatBonus = 0;
        artifacts.forEach(a => {
            if (a.effect && a.effect.stat === 'all') {
                allStatBonus += a.effect.bonus || 0;
            }
        });

        // Also add individual stat bonuses
        let artifactStatBonuses = { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0 };
        artifacts.forEach(a => {
            if (a.effect && a.effect.stat && a.effect.stat !== 'all' && a.effect.bonus) {
                artifactStatBonuses[a.effect.stat] = (artifactStatBonuses[a.effect.stat] || 0) + a.effect.bonus;
            }
        });

        const effStr = stats.strength + artifactStatBonuses.strength + allStatBonus;
        const effDex = stats.dexterity + artifactStatBonuses.dexterity + allStatBonus;
        const effCon = stats.constitution + artifactStatBonuses.constitution + allStatBonus;
        const effInt = stats.intelligence + artifactStatBonuses.intelligence + allStatBonus;
        const effWis = stats.wisdom + artifactStatBonuses.wisdom + allStatBonus;
        const effCha = stats.charisma + artifactStatBonuses.charisma + allStatBonus;

        return {
            hp: Math.floor(50 + (effCon * 5) + (char.level * 10) + bonuses.hp),
            attack: Math.floor(5 + (effStr * 2) + (char.level * 2) + bonuses.attack),
            defense: Math.floor(3 + (effCon * 1.5) + (char.level * 1) + bonuses.defense),
            speed: Math.floor(5 + (effDex * 1.5) + bonuses.speed),
            magic: Math.floor(5 + (effInt * 2) + (effWis * 1) + bonuses.magic),
            crit: Math.min(50, Math.floor(5 + (effDex * 0.5) + (effCha * 0.3) + bonuses.crit)),
            effectiveStats: { strength: effStr, dexterity: effDex, constitution: effCon, intelligence: effInt, wisdom: effWis, charisma: effCha }
        };
    },

    getPowerLevel(data) {
        const combat = this.getCombatStats(data);
        return Math.floor((combat.hp + combat.attack * 3 + combat.defense * 2 + combat.speed + combat.magic * 2) / 5);
    }
};

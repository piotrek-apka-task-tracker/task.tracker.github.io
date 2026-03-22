// ================================
// CHARACTER SYSTEM
// ================================
const CharacterSystem = {
    classData: {
        warrior: {
            name: "Warrior",
            emoji: "🗡️",
            bonusStats: { strength: 2, vitality: 1 },
            skillName: "Power Strike",
            skillDesc: "Deal 150% damage",
            skillMultiplier: 1.5
        },
        ranger: {
            name: "Ranger",
            emoji: "🏹",
            bonusStats: { dexterity: 2, wisdom: 1 },
            skillName: "Precise Shot",
            skillDesc: "High crit chance attack",
            skillMultiplier: 1.2,
            skillCritBonus: 30
        },
        mage: {
            name: "Mage",
            emoji: "🔮",
            bonusStats: { intelligence: 2, wisdom: 1 },
            skillName: "Arcane Blast",
            skillDesc: "Magic-based damage",
            skillMultiplier: 1.8,
            usesMagic: true
        },
        bard: {
            name: "Bard",
            emoji: "🎵",
            bonusStats: { charisma: 2, dexterity: 1 },
            skillName: "Inspiring Melody",
            skillDesc: "Heal 20% HP and attack",
            skillMultiplier: 1.0,
            healsPercent: 20
        }
    },

    createNewCharacter(name, heroClass) {
        const classInfo = this.classData[heroClass];
        const baseStats = {
            strength: 5,
            dexterity: 5,
            intelligence: 5,
            wisdom: 5,
            charisma: 5,
            vitality: 5
        };

        // Apply class bonuses
        Object.keys(classInfo.bonusStats).forEach(stat => {
            baseStats[stat] += classInfo.bonusStats[stat];
        });

        return {
            name: name,
            class: heroClass,
            level: 1,
            xp: 0,
            xpToNext: 100,
            stats: baseStats,
            hp: 100,
            maxHP: 100,
            statPoints: 0 // We won't use manual stat points - stats grow from tasks
        };
    },

    // Calculate XP needed for next level
    getXPForLevel(level) {
        return Math.floor(100 * Math.pow(1.15, level - 1));
    },

    // Calculate combat stats from character stats + artifacts
    getCombatStats(userData) {
        const char = userData.character;
        const stats = char.stats;
        const artifacts = userData.artifacts || [];

        let attack = stats.strength * 2 + stats.dexterity * 0.5;
        let defense = stats.vitality * 1.5 + stats.strength * 0.5;
        let maxHP = 80 + stats.vitality * 10 + char.level * 5;
        let speed = 5 + stats.dexterity * 1.2 + stats.wisdom * 0.3;
        let crit = 5 + stats.dexterity * 0.5 + stats.wisdom * 0.3;
        let magic = stats.intelligence * 2 + stats.wisdom * 0.8;

        // Apply artifact bonuses
        artifacts.forEach(art => {
            if (art.bonus.attack) attack += art.bonus.attack;
            if (art.bonus.defense) defense += art.bonus.defense;
            if (art.bonus.maxHP) maxHP += art.bonus.maxHP;
            if (art.bonus.speed) speed += art.bonus.speed;
            if (art.bonus.crit) crit += art.bonus.crit;
            if (art.bonus.magic) magic += art.bonus.magic;
        });

        return {
            attack: Math.floor(attack),
            defense: Math.floor(defense),
            maxHP: Math.floor(maxHP),
            speed: Math.floor(speed),
            crit: Math.min(Math.floor(crit), 75), // cap at 75%
            magic: Math.floor(magic)
        };
    },

    // Calculate total power rating
    getPowerRating(userData) {
        const combat = this.getCombatStats(userData);
        return Math.floor(
            combat.attack * 1.5 + 
            combat.defense * 1.2 + 
            combat.maxHP * 0.1 + 
            combat.speed * 0.8 + 
            combat.crit * 0.5 + 
            combat.magic * 1.0
        );
    },

    // Get floor difficulty rating
    getFloorDifficulty(floor) {
        return Math.floor(15 + (floor - 1) * 12 + Math.pow(floor, 1.3));
    },

    // Add XP to character and handle level ups
    addXP(userData, amount, statName) {
        const char = userData.character;
        char.xp += amount;
        userData.stats.totalXPEarned += amount;

        // Add stat point for the chosen stat
        const statGain = Math.max(1, Math.floor(amount / 15));
        if (char.stats[statName] !== undefined) {
            char.stats[statName] += statGain;
        }

        // Check for level up
        let leveled = false;
        while (char.xp >= char.xpToNext) {
            char.xp -= char.xpToNext;
            char.level++;
            char.xpToNext = this.getXPForLevel(char.level);
            leveled = true;

            // Bonus stats on level up
            Object.keys(char.stats).forEach(stat => {
                char.stats[stat] += 1;
            });
        }

        // Recalculate max HP
        const combat = this.getCombatStats(userData);
        char.maxHP = combat.maxHP;
        char.hp = Math.min(char.hp, char.maxHP);

        return { leveled, statGain, statName };
    },

    // Heal character to full
    fullHeal(userData) {
        const combat = this.getCombatStats(userData);
        userData.character.maxHP = combat.maxHP;
        userData.character.hp = combat.maxHP;
    }
};

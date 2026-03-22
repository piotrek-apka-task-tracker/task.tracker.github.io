// ============================================
// CHARACTER SYSTEM
// ============================================

const CharacterSystem = {
    classIcons: {
        warrior: '⚔️',
        ranger: '🏹',
        mage: '🔮',
        bard: '🎵'
    },

    // XP required for a given level
    xpForLevel(level) {
        return Math.floor(100 * Math.pow(1.15, level - 1));
    },

    // Get title based on level
    getTitle(level) {
        if (level < 5) return 'Novice Adventurer';
        if (level < 10) return 'Apprentice Hero';
        if (level < 15) return 'Journeyman Champion';
        if (level < 20) return 'Seasoned Warrior';
        if (level < 30) return 'Veteran Conqueror';
        if (level < 40) return 'Master of Discipline';
        if (level < 50) return 'Grandmaster of Will';
        if (level < 75) return 'Legendary Questborne';
        if (level < 100) return 'Mythical Ascendant';
        return 'Eternal Legend';
    },

    // Award XP and check for level up
    async addXP(userData, amount, statType) {
        const character = userData.character;
        character.xp += amount;
        character.totalXp = (character.totalXp || 0) + amount;

        // Add stat points
        if (statType && character.stats[statType] !== undefined) {
            const statGain = this.getStatGain(amount);
            character.stats[statType] += statGain;
        }

        // Check for level up(s)
        const levelUps = [];
        while (character.xp >= character.xpToNext) {
            character.xp -= character.xpToNext;
            character.level += 1;
            character.xpToNext = this.xpForLevel(character.level);
            character.title = this.getTitle(character.level);

            // Bonus stats on level up
            const levelUpBonuses = this.getLevelUpBonuses(character);
            Object.entries(levelUpBonuses).forEach(([stat, bonus]) => {
                character.stats[stat] += bonus;
            });

            // Increase max HP
            character.maxHp = 80 + (character.stats.constitution * 8) + (character.level * 5);
            character.hp = character.maxHp;

            levelUps.push({
                level: character.level,
                bonuses: levelUpBonuses
            });
        }

        // Update max HP
        character.maxHp = 80 + (character.stats.constitution * 8) + (character.level * 5);

        return levelUps;
    },

    getStatGain(xpAmount) {
        if (xpAmount >= 100) return 3;
        if (xpAmount >= 50) return 2;
        if (xpAmount >= 25) return 1;
        return 1;
    },

    getLevelUpBonuses(character) {
        // Small bonus to all stats on level up
        return {
            strength: 1,
            dexterity: 1,
            constitution: 1,
            intelligence: 1,
            wisdom: 1,
            charisma: 1
        };
    },

    // Difficulty XP rewards
    difficultyXP: {
        easy: 10,
        medium: 25,
        hard: 50,
        epic: 100
    },

    // Habit XP
    habitXP: {
        positive: 15,
        negative_success: 20, // Avoided bad habit
        negative_fail: -10    // Gave in to bad habit
    }
};

window.CharacterSystem = CharacterSystem;

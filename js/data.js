// ================================
// Game Data & Constants
// ================================

const GameData = {
    // Character Stats
    stats: {
        strength: {
            name: 'Strength',
            abbr: 'STR',
            icon: '💪',
            color: 'var(--strength)',
            description: 'Physical power and combat damage'
        },
        dexterity: {
            name: 'Dexterity',
            abbr: 'DEX',
            icon: '🎯',
            color: 'var(--dexterity)',
            description: 'Agility, speed, and dodge chance'
        },
        constitution: {
            name: 'Constitution',
            abbr: 'CON',
            icon: '❤️',
            color: 'var(--constitution)',
            description: 'Health points and endurance'
        },
        intelligence: {
            name: 'Intelligence',
            abbr: 'INT',
            icon: '📚',
            color: 'var(--intelligence)',
            description: 'Magical power and learning speed'
        },
        wisdom: {
            name: 'Wisdom',
            abbr: 'WIS',
            icon: '🔮',
            color: 'var(--wisdom)',
            description: 'Perception and mana regeneration'
        },
        charisma: {
            name: 'Charisma',
            abbr: 'CHA',
            icon: '✨',
            color: 'var(--charisma)',
            description: 'Influence and luck'
        }
    },

    // Task Categories with stat associations
    taskCategories: {
        work: {
            name: 'Work',
            icon: '💼',
            color: '#3b82f6',
            primaryStat: 'intelligence',
            secondaryStat: 'wisdom',
            description: 'Professional projects and career goals'
        },
        fitness: {
            name: 'Fitness',
            icon: '💪',
            color: '#ef4444',
            primaryStat: 'strength',
            secondaryStat: 'constitution',
            description: 'Physical exercise and health'
        },
        music: {
            name: 'Music',
            icon: '🎵',
            color: '#a855f7',
            primaryStat: 'dexterity',
            secondaryStat: 'charisma',
            description: 'Musical practice and performance'
        },
        habits: {
            name: 'Habits',
            icon: '🔄',
            color: '#22c55e',
            primaryStat: 'wisdom',
            secondaryStat: 'constitution',
            description: 'Daily disciplines and routines'
        },
        other: {
            name: 'Other',
            icon: '📌',
            color: '#f59e0b',
            primaryStat: 'charisma',
            secondaryStat: 'intelligence',
            description: 'Miscellaneous tasks and goals'
        }
    },

    // Experience calculation
    calculateExpForLevel(level) {
        // Each level requires more XP: 100 * level * (level + 1) / 2
        return Math.floor(100 * level * (level + 1) / 2);
    },

    calculateTotalExpForLevel(level) {
        let total = 0;
        for (let i = 1; i < level; i++) {
            total += this.calculateExpForLevel(i);
        }
        return total;
    },

    // Task XP rewards based on difficulty
    taskXP: {
        trivial: 5,
        easy: 15,
        medium: 30,
        hard: 50,
        epic: 100
    },

    // Habit streak bonuses
    streakBonuses: {
        3: 1.1,   // 10% bonus after 3 days
        7: 1.25,  // 25% bonus after a week
        14: 1.5,  // 50% bonus after 2 weeks
        30: 2.0,  // 100% bonus after a month
        90: 3.0   // 200% bonus after 3 months
    },

    // Character classes (for visual customization)
    characterClasses: {
        warrior: {
            name: 'Warrior',
            icon: '⚔️',
            description: 'Master of physical combat',
            bonus: { strength: 2, constitution: 1 }
        },
        mage: {
            name: 'Mage',
            icon: '🔮',
            description: 'Wielder of arcane powers',
            bonus: { intelligence: 2, wisdom: 1 }
        },
        rogue: {
            name: 'Rogue',
            icon: '🗡️',
            description: 'Swift and cunning',
            bonus: { dexterity: 2, charisma: 1 }
        },
        paladin: {
            name: 'Paladin',
            icon: '🛡️',
            description: 'Holy warrior of light',
            bonus: { constitution: 2, wisdom: 1 }
        },
        bard: {
            name: 'Bard',
            icon: '🎸',
            description: 'Artist and performer',
            bonus: { charisma: 2, dexterity: 1 }
        },
        monk: {
            name: 'Monk',
            icon: '👊',
            description: 'Disciplined mind and body',
            bonus: { wisdom: 2, strength: 1 }
        }
    }
};

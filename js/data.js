// ================================
// Game Data & Constants
// ================================

const GameData = {
    // XP tuning (Segment 5)
    xpBase: 100,       // used by calculateExpForLevel (same as before if kept at 100)
    statXPBase: 50,    // used by Character.getStatXPRequired()

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
    },
    // ================================
    // DUNGEON DATA (Segment 6)
    // ================================

    // Monster types by category
    monsterTypes: {
        beast: {
            name: 'Beast',
            icon: '🐺',
            color: '#8b4513',
            statBias: { strength: 1.2, constitution: 1.1, dexterity: 1.0 }
        },
        undead: {
            name: 'Undead',
            icon: '💀',
            color: '#4a5568',
            statBias: { constitution: 1.3, strength: 1.0, wisdom: 0.8 }
        },
        demon: {
            name: 'Demon',
            icon: '👹',
            color: '#dc2626',
            statBias: { strength: 1.3, intelligence: 1.1, charisma: 0.7 }
        },
        elemental: {
            name: 'Elemental',
            icon: '🔥',
            color: '#f59e0b',
            statBias: { intelligence: 1.3, dexterity: 1.1, constitution: 0.9 }
        },
        construct: {
            name: 'Construct',
            icon: '🗿',
            color: '#6b7280',
            statBias: { constitution: 1.4, strength: 1.1, dexterity: 0.7 }
        },
        dragon: {
            name: 'Dragon',
            icon: '🐉',
            color: '#7c3aed',
            statBias: { strength: 1.2, intelligence: 1.2, constitution: 1.2 }
        }
    },

    // Monster name parts for generation
    monsterNames: {
        prefixes: [
            'Shadow', 'Crimson', 'Frost', 'Ancient', 'Corrupted', 'Feral',
            'Cursed', 'Infernal', 'Spectral', 'Savage', 'Dire', 'Venom',
            'Storm', 'Iron', 'Bone', 'Blood', 'Dark', 'Chaos', 'Void', 'Doom'
        ],
        beast: ['Wolf', 'Bear', 'Boar', 'Spider', 'Serpent', 'Bat', 'Rat', 'Scorpion', 'Hound', 'Warg'],
        undead: ['Skeleton', 'Zombie', 'Wraith', 'Ghoul', 'Revenant', 'Wight', 'Specter', 'Lich'],
        demon: ['Imp', 'Fiend', 'Demon', 'Hellspawn', 'Succubus', 'Tormentor', 'Defiler'],
        elemental: ['Wisp', 'Elemental', 'Golem', 'Spirit', 'Phoenix', 'Djinn', 'Salamander'],
        construct: ['Golem', 'Automaton', 'Guardian', 'Sentinel', 'Colossus', 'Juggernaut'],
        dragon: ['Wyrm', 'Drake', 'Wyvern', 'Dragon', 'Serpent', 'Hydra']
    },

    // Boss name parts
    bossNames: {
        titles: [
            'Lord', 'King', 'Queen', 'Emperor', 'Overlord', 'Master',
            'Archon', 'Sovereign', 'Tyrant', 'Champion', 'Warden', 'Harbinger'
        ],
        names: [
            'Malachar', 'Vexoria', 'Drakthos', 'Nethris', 'Zarvok', 'Kelmora',
            'Ashenbane', 'Grimhold', 'Shadowmere', 'Bloodthorn', 'Doomweaver',
            'Soulreaver', 'Nightbringer', 'Hellforge', 'Deathwhisper', 'Voidwalker',
            'Ironclad', 'Frostbane', 'Flameheart', 'Stormcaller', 'Earthshaker'
        ],
        epithets: [
            'the Destroyer', 'the Eternal', 'the Merciless', 'the Undying',
            'of the Abyss', 'the Corrupted', 'the Ancient', 'the Terrible',
            'the Devourer', 'of Shadows', 'the Accursed', 'the Relentless',
            'of Chaos', 'the Forsaken', 'the Immortal', 'of Darkness'
        ]
    },

    // Artifacts (boss rewards)
    artifacts: [
        // Tier 1 (Floors 1-10)
        { id: 'sword_of_dawn', name: 'Sword of Dawn', icon: '🗡️', tier: 1, stats: { attack: 5 }, description: 'A blade that glows with morning light.' },
        { id: 'shield_of_valor', name: 'Shield of Valor', icon: '🛡️', tier: 1, stats: { defense: 5 }, description: 'Worn by heroes of old.' },
        { id: 'boots_of_swiftness', name: 'Boots of Swiftness', icon: '👢', tier: 1, stats: { speed: 5 }, description: 'Light as a feather, fast as wind.' },
        { id: 'amulet_of_fortune', name: 'Amulet of Fortune', icon: '📿', tier: 1, stats: { luck: 5 }, description: 'Lady luck smiles upon you.' },
        { id: 'ring_of_vitality', name: 'Ring of Vitality', icon: '💍', tier: 1, stats: { maxHp: 25 }, description: 'Pulses with life energy.' },
        { id: 'circlet_of_wisdom', name: 'Circlet of Wisdom', icon: '👑', tier: 1, stats: { maxMp: 20 }, description: 'Enhances mental fortitude.' },

        // Tier 2 (Floors 11-25)
        { id: 'blade_of_fury', name: 'Blade of Fury', icon: '⚔️', tier: 2, stats: { attack: 12, speed: 3 }, description: 'Rage incarnate in steel.' },
        { id: 'armor_of_titans', name: 'Armor of the Titans', icon: '🦺', tier: 2, stats: { defense: 10, maxHp: 30 }, description: 'Forged by giants.' },
        { id: 'cloak_of_shadows', name: 'Cloak of Shadows', icon: '🧥', tier: 2, stats: { speed: 8, luck: 5 }, description: 'Blend into darkness itself.' },
        { id: 'orb_of_power', name: 'Orb of Power', icon: '🔮', tier: 2, stats: { attack: 8, maxMp: 30 }, description: 'Crackles with arcane energy.' },
        { id: 'helm_of_insight', name: 'Helm of Insight', icon: '⛑️', tier: 2, stats: { defense: 5, luck: 8 }, description: 'See through deception.' },
        { id: 'gauntlets_of_might', name: 'Gauntlets of Might', icon: '🧤', tier: 2, stats: { attack: 10, defense: 5 }, description: 'Crush stone with ease.' },

        // Tier 3 (Floors 26-50)
        { id: 'excalibur', name: 'Excalibur', icon: '🗡️', tier: 3, stats: { attack: 25, luck: 10 }, description: 'The legendary sword of kings.' },
        { id: 'aegis_shield', name: 'Aegis Shield', icon: '🛡️', tier: 3, stats: { defense: 20, maxHp: 50 }, description: 'Blessed by the gods.' },
        { id: 'hermes_sandals', name: "Hermes' Sandals", icon: '👟', tier: 3, stats: { speed: 20, luck: 8 }, description: 'Walk upon the wind.' },
        { id: 'crown_of_ages', name: 'Crown of Ages', icon: '👑', tier: 3, stats: { maxHp: 40, maxMp: 40, luck: 5 }, description: 'Worn by eternal rulers.' },
        { id: 'dragon_heart', name: 'Dragon Heart', icon: '❤️‍🔥', tier: 3, stats: { attack: 15, defense: 15, maxHp: 30 }, description: 'Still beats with draconic fire.' },
        { id: 'void_crystal', name: 'Void Crystal', icon: '💎', tier: 3, stats: { attack: 18, maxMp: 50, speed: 5 }, description: 'Contains infinite darkness.' },

        // Tier 4 (Floors 51+)
        { id: 'godslayer', name: 'Godslayer', icon: '⚔️', tier: 4, stats: { attack: 50, speed: 15 }, description: 'Even immortals fear this blade.' },
        { id: 'infinity_armor', name: 'Armor of Infinity', icon: '🛡️', tier: 4, stats: { defense: 40, maxHp: 100 }, description: 'Woven from the fabric of reality.' },
        { id: 'cosmic_boots', name: 'Cosmic Boots', icon: '👢', tier: 4, stats: { speed: 35, luck: 20 }, description: 'Step between dimensions.' },
        { id: 'soul_gem', name: 'Soul Gem', icon: '💠', tier: 4, stats: { maxHp: 75, maxMp: 75, luck: 15 }, description: 'Contains countless souls.' },
        { id: 'world_ender', name: 'World Ender', icon: '🌑', tier: 4, stats: { attack: 40, defense: 25, speed: 10 }, description: 'The final weapon.' }
    ],

    // Lore entries (unlocked by defeating bosses)
    lore: [
        {
            id: 'lore_1',
            floor: 5,
            title: 'The Sundering',
            text: `Long ago, the world was whole. Then came the Sundering—a cataclysm that tore reality asunder. The dungeons appeared that day, rifts into realms of chaos and nightmare. No one knows what caused it, but the old kingdom fell, and darkness crept into the land.`
        },
        {
            id: 'lore_2',
            floor: 10,
            title: 'The First Heroes',
            text: `In the aftermath of the Sundering, heroes arose. They delved into the dungeons, seeking to close the rifts. Many fell, but those who survived grew powerful beyond measure. They became legends—the Godforged, humanity's shield against the abyss.`
        },
        {
            id: 'lore_3',
            floor: 15,
            title: 'The Corruption Spreads',
            text: `The Godforged sealed many rifts, but they could not close them all. Slowly, corruption seeped into the world. Monsters emerged from the depths. Villages fell silent. The dungeons grew deeper, darker, hungrier.`
        },
        {
            id: 'lore_4',
            floor: 20,
            title: 'The Order of Dawn',
            text: `A new order was founded—the Order of Dawn. Unlike the solitary Godforged, they trained armies. They built fortresses around dungeon entrances. For centuries, they held the line, but their numbers dwindled with each passing year.`
        },
        {
            id: 'lore_5',
            floor: 25,
            title: 'The Void Beckons',
            text: `At the deepest levels of the dungeons lies the Void—a realm of pure chaos. Those who glimpse it are forever changed. Some go mad. Others gain terrible power. The Void whispers promises of strength to those brave or foolish enough to listen.`
        },
        {
            id: 'lore_6',
            floor: 30,
            title: 'The Artifact Wars',
            text: `The dungeons contain treasures of immense power—artifacts from before the Sundering. Nations warred over these relics. The Artifact Wars lasted a century and left the world scarred. Now, only the brave dare claim these prizes.`
        },
        {
            id: 'lore_7',
            floor: 35,
            title: 'The Dragon Lords',
            text: `Deep within the dungeons, dragons rule. Not the beasts of legend, but ancient intelligences who remember the world before. They guard secrets older than humanity and test all who seek passage deeper.`
        },
        {
            id: 'lore_8',
            floor: 40,
            title: 'The Last Godforged',
            text: `Only one of the original Godforged still lives—Eldara the Eternal. She guards the deepest seal, holding back what lies beyond. Some say she waits for a worthy successor. Others say she has become something no longer human.`
        },
        {
            id: 'lore_9',
            floor: 45,
            title: 'The Heart of Darkness',
            text: `At floor fifty lies the Heart of Darkness—a crystallized shard of the Sundering itself. It pulses with malevolent energy, spawning endless horrors. Many believe destroying it would close all rifts. None have succeeded.`
        },
        {
            id: 'lore_10',
            floor: 50,
            title: 'Beyond the Veil',
            text: `You have reached the depths where reality frays. Beyond floor fifty, the dungeon changes. It responds to your presence, reshaping itself, growing stronger as you do. Here, the true challenge begins. Here, legends are forged or forgotten.`
        }
    ],

    // Get artifact by tier (for boss rewards)
    getArtifactForFloor(floor) {
        let tier = 1;
        if (floor > 50) tier = 4;
        else if (floor > 25) tier = 3;
        else if (floor > 10) tier = 2;

        const available = this.artifacts.filter(a => a.tier === tier);
        return available[Math.floor(Math.random() * available.length)];
    },

    // Get lore for floor (if any)
    getLoreForFloor(floor) {
        return this.lore.find(l => l.floor === floor) || null;
    }
};

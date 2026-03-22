// ==========================================
// Artifacts System
// ==========================================

const ArtifactSystem = {
    // Predefined artifacts for the first 50 floors' bosses
    predefined: {
        5: {
            name: "Grundar's Broken Crown",
            icon: "👑",
            effect: { stat: "constitution", bonus: 3, hp: 20 },
            description: "+3 Constitution, +20 HP"
        },
        10: {
            name: "Thessara's Shadow Cloak",
            icon: "🧥",
            effect: { stat: "dexterity", bonus: 4, speed: 5 },
            description: "+4 Dexterity, +5 Speed"
        },
        15: {
            name: "Fragment of Aethon's Hammer",
            icon: "🔨",
            effect: { stat: "strength", bonus: 5, attack: 8 },
            description: "+5 Strength, +8 Attack"
        },
        20: {
            name: "Tome of Infinite Pages",
            icon: "📖",
            effect: { stat: "intelligence", bonus: 5, magic: 10 },
            description: "+5 Intelligence, +10 Magic"
        },
        25: {
            name: "Verdanthis' Living Seed",
            icon: "🌱",
            effect: { stat: "wisdom", bonus: 4, hp: 30 },
            description: "+4 Wisdom, +30 HP"
        },
        30: {
            name: "Chronax's Frozen Moment",
            icon: "⏳",
            effect: { stat: "dexterity", bonus: 6, crit: 5 },
            description: "+6 Dexterity, +5% Crit"
        },
        35: {
            name: "The Mirror Shard of Truth",
            icon: "🪞",
            effect: { stat: "charisma", bonus: 6, attack: 5, defense: 5 },
            description: "+6 Charisma, +5 Attack, +5 Defense"
        },
        40: {
            name: "Void Mother's Tear",
            icon: "💧",
            effect: { stat: "wisdom", bonus: 7, magic: 15 },
            description: "+7 Wisdom, +15 Magic"
        },
        45: {
            name: "Chain of the Unbound",
            icon: "⛓️",
            effect: { stat: "strength", bonus: 8, defense: 10 },
            description: "+8 Strength, +10 Defense"
        },
        50: {
            name: "Dawn's First Light",
            icon: "☀️",
            effect: { stat: "all", bonus: 5, hp: 50, attack: 10, defense: 10, magic: 10 },
            description: "+5 All Stats, +50 HP, +10 ATK/DEF/MAG"
        }
    },

    // Generate procedural artifacts for floors beyond 50
    generateArtifact(floor) {
        if (this.predefined[floor]) {
            return { ...this.predefined[floor], floor: floor };
        }

        const icons = ["⚔️", "🗡️", "🛡️", "💎", "🔮", "📿", "🏺", "⚱️", "🪄", "🎭", "👁️", "🌟", "💀", "🐉", "🦅", "⭐", "🔱", "🪬", "🧿", "💍"];
        const prefixes = ["Ancient", "Cursed", "Divine", "Shattered", "Ethereal", "Abyssal", "Celestial", "Primordial", "Forgotten", "Legendary"];
        const types = ["Blade", "Amulet", "Ring", "Helm", "Gauntlet", "Orb", "Relic", "Trinket", "Talisman", "Scepter"];
        const suffixes = ["of the Depths", "of Echoing Power", "of Lost Ages", "of Infinite Night", "of the Unbroken", "of Shattered Dawn", "of the Wanderer", "of Eternal Flame", "of Frozen Stars", "of Silent Thunder"];

        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const type = types[Math.floor(Math.random() * types.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const icon = icons[Math.floor(Math.random() * icons.length)];

        const stats = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];
        const primaryStat = stats[Math.floor(Math.random() * stats.length)];
        const scaling = Math.floor(floor / 10) + 2;

        const effect = {
            stat: primaryStat,
            bonus: scaling + Math.floor(Math.random() * 3),
            hp: Math.floor(floor / 5) * 5,
            attack: Math.floor(scaling * 1.5),
            defense: Math.floor(scaling * 1.2)
        };

        const description = `+${effect.bonus} ${primaryStat.charAt(0).toUpperCase() + primaryStat.slice(1)}, +${effect.hp} HP, +${effect.attack} ATK, +${effect.defense} DEF`;

        return {
            name: `${prefix} ${type} ${suffix}`,
            icon: icon,
            effect: effect,
            description: description,
            floor: floor
        };
    }
};

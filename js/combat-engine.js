// ============================================
// COMBAT ENGINE
// ============================================

const CombatEngine = {
    // Calculate player combat stats from character stats + artifacts
    calculatePlayerCombatStats(character) {
        const stats = character.stats;
        const artifacts = character.artifacts || {};

        let combatStats = {
            maxHp: 80 + (stats.constitution * 8) + (character.level * 5),
            attack: 5 + (stats.strength * 2) + Math.floor(stats.dexterity * 0.5),
            defense: 2 + (stats.constitution * 1.5) + Math.floor(stats.strength * 0.3),
            speed: 3 + (stats.dexterity * 1.5) + Math.floor(stats.wisdom * 0.3),
            critChance: 3 + (stats.dexterity * 0.8) + Math.floor(stats.wisdom * 0.3),
            magic: 3 + (stats.intelligence * 2) + Math.floor(stats.wisdom * 0.5),
            healPower: 5 + (stats.wisdom * 1.5) + Math.floor(stats.intelligence * 0.5)
        };

        // Apply artifact bonuses
        Object.values(artifacts).forEach(artifact => {
            if (artifact && artifact.bonuses) {
                Object.entries(artifact.bonuses).forEach(([key, value]) => {
                    if (combatStats[key] !== undefined) {
                        combatStats[key] += value;
                    }
                });
            }
        });

        return combatStats;
    },

    // Calculate total power level
    calculatePowerLevel(character) {
        const stats = this.calculatePlayerCombatStats(character);
        return Math.floor(
            stats.maxHp * 0.3 + 
            stats.attack * 2 + 
            stats.defense * 1.5 + 
            stats.speed * 1 + 
            stats.magic * 1.5 +
            stats.critChance * 0.5
        );
    },

    // Generate monsters for a floor
    generateFloorMonsters(floorNumber) {
        const monsterTemplates = [
            { name: "Goblin", emoji: "👹", type: "basic" },
            { name: "Skeleton", emoji: "💀", type: "basic" },
            { name: "Slime", emoji: "🟢", type: "basic" },
            { name: "Bat Swarm", emoji: "🦇", type: "basic" },
            { name: "Spider", emoji: "🕷️", type: "basic" },
            { name: "Wraith", emoji: "👻", type: "magic" },
            { name: "Dark Knight", emoji: "🗡️", type: "melee" },
            { name: "Fire Imp", emoji: "😈", type: "magic" },
            { name: "Wolf", emoji: "🐺", type: "basic" },
            { name: "Zombie", emoji: "🧟", type: "basic" },
            { name: "Orc", emoji: "👺", type: "melee" },
            { name: "Banshee", emoji: "😱", type: "magic" },
            { name: "Minotaur", emoji: "🐂", type: "melee" },
            { name: "Gargoyle", emoji: "🗿", type: "melee" },
            { name: "Shadow", emoji: "🌑", type: "magic" }
        ];

        const bossTemplates = [
            { name: "Grukk the Idle", emoji: "🧌", type: "boss" },
            { name: "Doubt Wraith", emoji: "😰", type: "boss" },
            { name: "Kalthraz the Oathbreaker", emoji: "⚒️", type: "boss" },
            { name: "Scrollos the Infinite", emoji: "🐍", type: "boss" },
            { name: "Shadow Self", emoji: "🪞", type: "boss" },
            { name: "Manyana, Tomorrow Witch", emoji: "🧙‍♀️", type: "boss" },
            { name: "Flawless the Unfinished", emoji: "💎", type: "boss" },
            { name: "Kozyrak, Comfort Dragon", emoji: "🐲", type: "boss" },
            { name: "Envius Rex", emoji: "👑", type: "boss" },
            { name: "Void Sentinel", emoji: "🕳️", type: "boss" }
        ];

        const scaleFactor = 1 + (floorNumber - 1) * 0.35;
        const monsterCount = Math.min(2 + Math.floor(floorNumber / 3), 5);

        // Generate regular monsters
        const monsters = [];
        for (let i = 0; i < monsterCount; i++) {
            const template = monsterTemplates[Math.floor(Math.random() * monsterTemplates.length)];
            monsters.push(this.createMonster(template, floorNumber, scaleFactor, false));
        }

        // Generate boss
        const bossIndex = (floorNumber - 1) % bossTemplates.length;
        const bossTemplate = bossTemplates[bossIndex];
        const cycle = Math.floor((floorNumber - 1) / bossTemplates.length);
        const bossName = cycle > 0 
            ? `${bossTemplate.name} (Awakened ${cycle + 1})` 
            : bossTemplate.name;

        const boss = this.createMonster(
            { ...bossTemplate, name: bossName }, 
            floorNumber, 
            scaleFactor * 1.8, 
            true
        );

        return { monsters, boss };
    },

    createMonster(template, floor, scale, isBoss) {
        const baseHp = isBoss ? 100 : 40;
        const baseAtk = isBoss ? 15 : 8;
        const baseDef = isBoss ? 8 : 3;
        const baseSpd = isBoss ? 6 : 4;

        return {
            name: template.name,
            emoji: template.emoji,
            type: template.type,
            isBoss: isBoss,
            maxHp: Math.floor(baseHp * scale),
            hp: Math.floor(baseHp * scale),
            attack: Math.floor(baseAtk * scale),
            defense: Math.floor(baseDef * scale),
            speed: Math.floor(baseSpd * scale),
            critChance: isBoss ? 10 + floor : 5,
            xpReward: isBoss ? 0 : 0, // No XP from dungeon fighting
            goldReward: Math.floor((isBoss ? 20 : 5) * scale)
        };
    },

    // Get recommended power for a floor
    getRecommendedPower(floorNumber) {
        return Math.floor(30 + (floorNumber - 1) * 25);
    },

    // Get floor name
    getFloorName(floorNumber) {
        const floorNames = [
            "The Whispering Caves",
            "The Echoing Halls",
            "The Forge of Broken Promises",
            "The Garden of Endless Scrolling",
            "The Mirror Labyrinth",
            "The Procrastination Swamp",
            "The Perfectionist's Tower",
            "The Comfort Catacombs",
            "The Comparison Colosseum",
            "The Void Gate"
        ];

        const index = (floorNumber - 1) % floorNames.length;
        const cycle = Math.floor((floorNumber - 1) / floorNames.length);

        if (cycle > 0) {
            return `${floorNames[index]} (Depth ${cycle + 1})`;
        }
        return floorNames[index];
    },

    // Perform attack action
    performAttack(attacker, defender, isPlayerAttacking) {
        const results = [];
        const rawDamage = attacker.attack;
        const defense = defender.defense;

        // Check for critical hit
        const isCrit = Math.random() * 100 < attacker.critChance;
        const critMultiplier = isCrit ? 1.8 : 1;

        // Calculate damage (minimum 1)
        let damage = Math.max(1, Math.floor((rawDamage * critMultiplier) - (defense * 0.6)));

        // Add some randomness (±15%)
        const variance = 0.85 + (Math.random() * 0.3);
        damage = Math.floor(damage * variance);
        damage = Math.max(1, damage);

        defender.hp = Math.max(0, defender.hp - damage);

        results.push({
            type: isPlayerAttacking ? 'player-action' : 'monster-action',
            text: isCrit 
                ? `💥 CRITICAL! ${attacker.name || 'Hero'} deals ${damage} damage!`
                : `${isPlayerAttacking ? '⚔️' : '🔥'} ${attacker.name || 'Hero'} attacks for ${damage} damage!`,
            isCrit: isCrit,
            damage: damage
        });

        return results;
    },

    // Perform skill action (magic-based attack)
    performSkill(attacker, defender, isPlayerAttacking) {
        const results = [];
        const magicPower = attacker.magic || Math.floor(attacker.attack * 0.8);

        // Magic bypasses some defense
        let damage = Math.max(1, Math.floor(magicPower * 1.4 - defender.defense * 0.3));
        const variance = 0.9 + (Math.random() * 0.2);
        damage = Math.floor(damage * variance);
        damage = Math.max(1, damage);

        defender.hp = Math.max(0, defender.hp - damage);

        results.push({
            type: isPlayerAttacking ? 'player-action' : 'monster-action',
            text: `✨ ${attacker.name || 'Hero'} uses a magical skill for ${damage} damage!`,
            isCrit: false,
            damage: damage
        });

        return results;
    },

    // Perform defend action
    performDefend(defender) {
        const healAmount = Math.floor(defender.maxHp * 0.08) + (defender.healPower || 3);
        defender.hp = Math.min(defender.maxHp, defender.hp + healAmount);
        
        // Temporary defense boost is handled in the combat flow
        return [{
            type: 'heal',
            text: `🛡️ ${defender.name || 'Hero'} defends and recovers ${healAmount} HP!`,
            heal: healAmount
        }];
    },

    // Monster AI action
    monsterAction(monster, player) {
        const roll = Math.random();

        if (roll < 0.7) {
            // Regular attack (70%)
            return this.performAttack(monster, player, false);
        } else if (roll < 0.85 && monster.type === 'magic') {
            // Magic attack for magic types (15%)
            return this.performSkill(monster, player, false);
        } else {
            // Heavy attack (15-30%)
            const results = this.performAttack(monster, player, false);
            results[0].text = `💀 ${monster.name} unleashes a powerful strike for ${results[0].damage} damage!`;
            return results;
        }
    },

    // Generate artifact from boss
    generateArtifact(floorNumber, bossName) {
        const weaponNames = [
            "Blade of Resolve", "Discipline's Edge", "Will Breaker", 
            "Dawn Slicer", "Purpose's Fang", "Conviction Cutter",
            "Hope's Razor", "Tenacity's Bite", "Glory Reaver", "Destiny's Point"
        ];
        const armorNames = [
            "Bulwark of Habit", "Consistency's Guard", "Shield of Routine",
            "Fortress Plate", "Endurance Aegis", "Resilience Vest",
            "Patience Mail", "Stalwart Carapace", "Iron Will Armor", "Growth Shell"
        ];
        const trinketNames = [
            "Ring of Focus", "Amulet of Clarity", "Gem of Determination",
            "Pendant of Progress", "Circlet of Growth", "Charm of Purpose",
            "Stone of Balance", "Crystal of Intent", "Orb of Ambition", "Eye of Truth"
        ];
        const relicNames = [
            "Tome of Ancient Wisdom", "Chalice of Renewal", "Compass of Direction",
            "Hourglass of Mastery", "Lantern of Insight", "Scale of Justice",
            "Mirror of Reflection", "Seed of Potential", "Crown of Persistence", "Star of Destiny"
        ];

        const types = ['weapon', 'armor', 'trinket', 'relic'];
        const type = types[Math.floor(Math.random() * types.length)];

        const nameList = {
            weapon: weaponNames,
            armor: armorNames,
            trinket: trinketNames,
            relic: relicNames
        };

        const icons = {
            weapon: ['⚔️', '🗡️', '🪓', '🔱', '🏹'],
            armor: ['🛡️', '🪖', '🧥', '⛑️', '🦺'],
            trinket: ['💍', '📿', '🔮', '💎', '🧿'],
            relic: ['📖', '🏆', '🧭', '⏳', '🔦']
        };

        const nameIndex = (floorNumber - 1) % nameList[type].length;
        const cycle = Math.floor((floorNumber - 1) / nameList[type].length);
        const name = cycle > 0 
            ? `${nameList[type][nameIndex]} +${cycle}`
            : nameList[type][nameIndex];

        const icon = icons[type][Math.floor(Math.random() * icons[type].length)];

        // Generate bonuses based on floor level
        const bonusPower = Math.floor(5 + floorNumber * 3);
        const bonuses = {};
        const possibleBonuses = ['maxHp', 'attack', 'defense', 'speed', 'critChance', 'magic'];

        // Primary bonus
        const primaryBonus = possibleBonuses[Math.floor(Math.random() * possibleBonuses.length)];
        bonuses[primaryBonus] = Math.floor(bonusPower * 0.6);

        // Secondary bonus
        let secondaryBonus;
        do {
            secondaryBonus = possibleBonuses[Math.floor(Math.random() * possibleBonuses.length)];
        } while (secondaryBonus === primaryBonus);
        bonuses[secondaryBonus] = Math.floor(bonusPower * 0.4);

        return {
            id: `artifact_floor${floorNumber}_${Date.now()}`,
            name: name,
            type: type,
            icon: icon,
            floor: floorNumber,
            bossName: bossName,
            bonuses: bonuses,
            bonusText: Object.entries(bonuses)
                .map(([key, val]) => `+${val} ${key.replace(/([A-Z])/g, ' $1').trim()}`)
                .join(', '),
            equipped: false
        };
    }
};

window.CombatEngine = CombatEngine;

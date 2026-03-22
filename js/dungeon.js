// ==========================================
// Dungeon System
// ==========================================

const Dungeon = {
    enemies: {
        // Regular enemies with scaling
        regular: [
            { name: "Shadow Rat", icon: "🐀", baseHp: 30, baseAtk: 5, baseDef: 2 },
            { name: "Skeleton Warrior", icon: "💀", baseHp: 50, baseAtk: 8, baseDef: 4 },
            { name: "Dark Spider", icon: "🕷️", baseHp: 35, baseAtk: 10, baseDef: 3 },
            { name: "Cave Troll", icon: "👹", baseHp: 80, baseAtk: 12, baseDef: 6 },
            { name: "Phantom", icon: "👻", baseHp: 40, baseAtk: 15, baseDef: 2 },
            { name: "Goblin Shaman", icon: "🧙", baseHp: 45, baseAtk: 14, baseDef: 3 },
            { name: "Stone Golem", icon: "🗿", baseHp: 100, baseAtk: 8, baseDef: 12 },
            { name: "Dark Knight", icon: "⚫", baseHp: 70, baseAtk: 15, baseDef: 8 },
            { name: "Fire Imp", icon: "😈", baseHp: 30, baseAtk: 18, baseDef: 2 },
            { name: "Wraith", icon: "💀", baseHp: 55, baseAtk: 16, baseDef: 4 },
            { name: "Basilisk", icon: "🐍", baseHp: 65, baseAtk: 14, baseDef: 7 },
            { name: "Harpy", icon: "🦅", baseHp: 40, baseAtk: 17, baseDef: 3 },
            { name: "Minotaur", icon: "🐂", baseHp: 90, baseAtk: 18, baseDef: 8 },
            { name: "Dark Mage", icon: "🧙‍♂️", baseHp: 50, baseAtk: 20, baseDef: 4 },
            { name: "Demon Hound", icon: "🐕", baseHp: 55, baseAtk: 16, baseDef: 5 }
        ],
        // Boss names for specific floors
        bosses: {
            5: { name: "Grundar the Hollow", icon: "👹" },
            10: { name: "Thessara, Weaver of Shadows", icon: "🕸️" },
            15: { name: "Korrath, the Living Furnace", icon: "🔥" },
            20: { name: "Archivius, Keeper of Forbidden Knowledge", icon: "📚" },
            25: { name: "Verdanthis, the Bloom of Agony", icon: "🌺" },
            30: { name: "Chronax, Lord of Stolen Moments", icon: "⏰" },
            35: { name: "The Reflection King", icon: "🪞" },
            40: { name: "Void Mother Nyx", icon: "🌑" },
            45: { name: "The Prisoner, Unbound", icon: "⛓️" },
            50: { name: "Aeternus, the End of All Stories", icon: "☀️" }
        }
    },

    getFloorScaling(floor) {
        // Enemies scale with floor level
        return 1 + (floor - 1) * 0.25;
    },

    generateFloorEnemies(floor) {
        const isBossFloor = floor % 5 === 0;
        const scaling = this.getFloorScaling(floor);
        const enemies = [];

        // Regular enemies: 2-4 per floor
        const numRegular = isBossFloor ? 2 : Math.min(2 + Math.floor(floor / 10), 4);

        for (let i = 0; i < numRegular; i++) {
            const template = this.enemies.regular[Math.floor(Math.random() * this.enemies.regular.length)];
            enemies.push({
                name: template.name,
                icon: template.icon,
                hp: Math.floor(template.baseHp * scaling),
                maxHp: Math.floor(template.baseHp * scaling),
                attack: Math.floor(template.baseAtk * scaling),
                defense: Math.floor(template.baseDef * scaling),
                isBoss: false,
                level: floor
            });
        }

        // Boss on every 5th floor
        if (isBossFloor) {
            let bossTemplate;
            if (this.enemies.bosses[floor]) {
                bossTemplate = this.enemies.bosses[floor];
            } else {
                // Generate procedural boss
                const bossAdj = ["Ancient", "Dread", "Shadow", "Infernal", "Void", "Chaos", "Doom", "Nightmare", "Phantom", "Blood"];
                const bossType = ["Lord", "Beast", "Dragon", "Titan", "Abomination", "Archon", "Leviathan", "Colossus", "Horror", "Sovereign"];
                const adj = bossAdj[Math.floor(Math.random() * bossAdj.length)];
                const type = bossType[Math.floor(Math.random() * bossType.length)];
                const bossIcons = ["🐉", "👿", "💀", "🦷", "🌋", "⚡", "🔥", "❄️", "🌊", "🌪️"];
                bossTemplate = {
                    name: `${adj} ${type}`,
                    icon: bossIcons[Math.floor(Math.random() * bossIcons.length)]
                };
            }

            const bossScaling = scaling * 2.5;
            enemies.push({
                name: bossTemplate.name,
                icon: bossTemplate.icon,
                hp: Math.floor(200 * bossScaling),
                maxHp: Math.floor(200 * bossScaling),
                attack: Math.floor(25 * bossScaling),
                defense: Math.floor(15 * bossScaling),
                isBoss: true,
                level: floor
            });
        }

        return enemies;
    },

    getRecommendedPower(floor) {
        // Returns recommended power level for a floor
        return Math.floor(20 + floor * 15);
    },

    enterFloor(data) {
        const floor = data.dungeon.currentFloor;
        const enemies = this.generateFloorEnemies(floor);
        return {
            floor: floor,
            enemies: enemies,
            currentEnemyIndex: 0,
            isBossFloor: floor % 5 === 0
        };
    },

    completeFloor(data) {
        const floor = data.dungeon.currentFloor;
        const isBossFloor = floor % 5 === 0;

        if (floor > data.dungeon.deepestFloor) {
            data.dungeon.deepestFloor = floor;
        }

        let artifact = null;
        let lore = null;

        if (isBossFloor) {
            data.dungeon.bossesDefeated.push(floor);
            data.stats.bossesSlain++;

            // Generate artifact
            artifact = ArtifactSystem.generateArtifact(floor);
            data.dungeon.artifacts.push(artifact);

            // Get lore
            lore = LoreSystem.getLoreForFloor(floor);
            if (lore) {
                data.dungeon.loreUnlocked.push({
                    floor: floor,
                    title: lore.title,
                    text: lore.text,
                    bossName: lore.bossName,
                    unlockedAt: Date.now()
                });
            }
        }

        data.dungeon.currentFloor++;
        Auth.saveData(data);

        return { artifact, lore, isBossFloor };
    },

    returnToHub() {
        Combat.endCombat();
        UI.showDungeonSection('dungeon-hub');
        UI.updateDungeonView();
    }
};

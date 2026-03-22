// ================================
// LORE & STORY SYSTEM
// ================================
const LoreSystem = {
    // The Chronicle of Shadows - An ever-expanding fantasy saga
    chapters: [
        {
            floor: 1,
            title: "The Awakening Beneath",
            text: "In the age before memory, when the world of Aethermoor was young, the first shadows crept from the cracks between realms. You awaken in the Sunken Vestibule—a forgotten chamber beneath the ruins of Valdris Keep. The air tastes of ancient dust and fading enchantments. Upon the wall, faded glyphs pulse with a dying light, and you realize with sudden clarity: you were summoned here. Not by chance, but by the desperate will of a world unraveling. The Shard of Dawn, first of many fragments of the shattered Eternis Crystal, lies before you, guarded by the Hollow Sentinel—a suit of armor animated by lingering sorrow.",
            bossName: "The Hollow Sentinel",
            bossEmoji: "🛡️",
            artifactName: "Shard of Dawn",
            artifactIcon: "💎",
            artifactDesc: "A crystalline fragment that glows with the first light of creation.",
            artifactBonus: { attack: 3, defense: 1 }
        },
        {
            floor: 2,
            title: "Whispers of the Fungal Deep",
            text: "Below the vestibule, the earth opens into the Mycelium Caverns—a labyrinth of bioluminescent fungi and whispering spores. The walls breathe, and the mushrooms hum an ancient lullaby that nearly lulls you to sleep. Here, the Sporelord Xytha holds dominion, a creature born from the nightmares of the forest above when the Eternis Crystal shattered. Xytha speaks in riddles: 'The world above rots because the light was broken. You carry a shard, little flame. Will you gather them all, or will you too become compost for my garden?' The battle is fierce, but within Xytha's remains you find another truth—and another fragment of power.",
            bossName: "Sporelord Xytha",
            bossEmoji: "🍄",
            artifactName: "Fungal Crown",
            artifactIcon: "👑",
            artifactDesc: "A living crown of luminescent mushrooms that enhances perception.",
            artifactBonus: { attack: 2, magic: 3 }
        },
        {
            floor: 3,
            title: "The Drowned Library",
            text: "Water seeps through every crack as you descend into what was once the Grand Library of the Mage-King Thovren. Shelves of waterlogged tomes stretch endlessly, their knowledge bleeding into the rising waters. Ghostly scholars still wander the aisles, trapped in loops of study, unable to accept that their world ended centuries ago. The Archivist, a specter of immense intellect twisted by grief, guards the Quill of Binding—an artifact that can rewrite small portions of reality. 'Knowledge without wisdom,' the Archivist rasps, 'is what shattered the crystal in the first place. The Mage-King sought to know everything and understood nothing.'",
            bossName: "The Archivist",
            bossEmoji: "👻",
            artifactName: "Quill of Binding",
            artifactIcon: "🪶",
            artifactDesc: "A spectral quill that can inscribe protection runes on the bearer's skin.",
            artifactBonus: { defense: 4, magic: 2 }
        },
        {
            floor: 4,
            title: "Forge of the Broken Oath",
            text: "The temperature rises as you enter the ancient dwarven Forge of Khuldran. Once, the greatest weapons in Aethermoor were crafted here—including the very blade that struck the Eternis Crystal. The forge still burns with guilt-fire, a flame that feeds on broken promises. Dwarven automatons patrol the halls, endlessly hammering at anvils, trying to forge a weapon that could undo their ancestors' mistake. At the forge's heart stands Grothek the Oathbreaker, the ghost of the dwarf who forged the Shattering Blade. He fights not to defeat you, but to test if you are worthy of forgiveness.",
            bossName: "Grothek the Oathbreaker",
            bossEmoji: "⚒️",
            artifactName: "Ember of Guilt",
            artifactIcon: "🔥",
            artifactDesc: "A never-dying flame that burns hotter when wielded with conviction.",
            artifactBonus: { attack: 5, speed: 2 }
        },
        {
            floor: 5,
            title: "Garden of Stone Dreams",
            text: "The fifth level reveals an impossible sight: a garden of petrified trees and crystallized flowers, beautiful and terrible. This was once the Everbloom—a garden maintained by the nature spirits of Aethermoor. When the crystal shattered, the garden's magic went wild, turning everything it touched to stone, preserving beauty while destroying life. The Petrified Dryad, last guardian of the Everbloom, weeps tears of granite. She begs for release from her eternal vigil. In defeating her—gently, mercifully—you free her spirit, and she gifts you a seed of impossible hope.",
            bossName: "The Petrified Dryad",
            bossEmoji: "🌿",
            artifactName: "Seed of Rebirth",
            artifactIcon: "🌱",
            artifactDesc: "A tiny seed that pulses with the promise of renewal and regeneration.",
            artifactBonus: { defense: 3, maxHP: 25 }
        },
        {
            floor: 6,
            title: "The Clockwork Abyss",
            text: "Gears the size of houses turn in the darkness. You have entered the Temporal Mechanism—a device built by the Mage-King to control time itself. It was his grandest folly. The mechanism still runs, creating pockets where time flows backward, forward, or not at all. Creatures trapped in temporal loops attack without understanding why. At the center, the Chronophage—a being that devours moments—has grown fat on stolen seconds. It speaks with the voices of everyone whose time it has eaten: 'Every moment you waste feeds me. Every hour lost to hesitation makes me stronger. Show me that your moments have meaning.'",
            bossName: "The Chronophage",
            bossEmoji: "⏰",
            artifactName: "Hourglass of Purpose",
            artifactIcon: "⏳",
            artifactDesc: "An hourglass where sand flows upward, granting clarity of purpose.",
            artifactBonus: { speed: 5, crit: 3 }
        },
        {
            floor: 7,
            title: "The Choir of Chains",
            text: "The seventh floor resonates with music—discordant, painful, and hauntingly beautiful. Chains hang from the ceiling like harp strings, and imprisoned souls provide the vocals for an eternal, tortured symphony. This was the prison of the Mage-King, where he kept those who opposed his quest for omniscience. The Warden of Chains, a being made entirely of interlocking shackles, conducts this orchestra of suffering with genuine artistic passion. It does not see cruelty in its work—only art. Your battle against it is as much a philosophical argument as a physical confrontation. When the Warden falls, the chains shatter, and the freed souls sing one pure note of gratitude that heals wounds you didn't know you carried.",
            bossName: "The Warden of Chains",
            bossEmoji: "⛓️",
            artifactName: "Resonance Bell",
            artifactIcon: "🔔",
            artifactDesc: "A silver bell whose ring shatters illusions and strengthens resolve.",
            artifactBonus: { attack: 3, defense: 3, magic: 2 }
        },
        {
            floor: 8,
            title: "Mirror of the Fractured Self",
            text: "The eighth level is a maze of mirrors, each reflecting a different version of you—who you could have been, who you fear becoming, who you were in lives unlived. The Mirror Wraith is not a separate entity but a dark reflection of yourself, wielding every weakness you've ever hidden, every doubt you've ever whispered in the small hours. It knows your fears because they are its substance. It knows your failures because it was born from them. The battle forces you to confront everything you've avoided. Victory comes not from strength alone, but from acceptance. When the Mirror Wraith shatters, you see clearly—perhaps for the first time.",
            bossName: "The Mirror Wraith",
            bossEmoji: "🪞",
            artifactName: "Lens of Truth",
            artifactIcon: "🔍",
            artifactDesc: "A crystal monocle that reveals hidden truths and grants insight in battle.",
            artifactBonus: { crit: 5, magic: 3, attack: 2 }
        },
        {
            floor: 9,
            title: "The Feast of Shadows",
            text: "A great banquet hall stretches before you, tables laden with food that smells divine but turns to ash on the tongue. Shadow courtiers dance an endless waltz, their forms flickering between beauty and horror. This is the court of the Shadow Prince, a fragment of darkness given form when the Eternis Crystal's light shattered. The Shadow Prince is charming, witty, and utterly without substance. He offers you everything—power, knowledge, rest—and means none of it. 'Why struggle?' he whispers. 'The comfortable darkness asks nothing of you. No effort, no growth, no risk of failure.' His words are the sweetest poison, and his defeat requires rejecting the easiest path.",
            bossName: "The Shadow Prince",
            bossEmoji: "🌑",
            artifactName: "Mantle of Resolve",
            artifactIcon: "🧥",
            artifactDesc: "A cloak woven from conquered shadows that shields against despair.",
            artifactBonus: { defense: 5, maxHP: 30, speed: 2 }
        },
        {
            floor: 10,
            title: "The First Convergence",
            text: "The tenth floor is a vast chamber where threads of light converge from the shards you've collected. Here, at the First Nexus, the true scope of your quest reveals itself. The dungeon is not merely deep—it is infinite, reaching down into the very foundations of reality. The Nexus Guardian, a being of pure crystallized will, tests whether you have the determination to continue. It shows you visions: thousands more floors, each with greater challenges, each hiding another piece of the shattered crystal. The world above grows darker with each passing day. 'The journey never ends,' the Guardian intones. 'That is both the curse and the gift. Will you continue knowing there is no final destination—only the path?' You raise your weapon. The answer was never in doubt.",
            bossName: "The Nexus Guardian",
            bossEmoji: "💫",
            artifactName: "Heart of the Nexus",
            artifactIcon: "💠",
            artifactDesc: "A pulsing crystal core that connects all shards and amplifies their power.",
            artifactBonus: { attack: 5, defense: 5, magic: 5, maxHP: 50 }
        }
    ],

    // Generate procedural lore for floors beyond the written chapters
    generateProceduralLore(floor) {
        const themes = [
            { name: "The Abyssal", type: "depths", elements: ["darkness", "pressure", "forgotten things"] },
            { name: "The Burning", type: "fire", elements: ["flame", "ash", "rebirth"] },
            { name: "The Frozen", type: "ice", elements: ["crystal", "preservation", "silence"] },
            { name: "The Living", type: "organic", elements: ["growth", "mutation", "hunger"] },
            { name: "The Void", type: "nothing", elements: ["emptiness", "potential", "fear"] },
            { name: "The Radiant", type: "light", elements: ["blinding truth", "purification", "revelation"] },
            { name: "The Mechanical", type: "construct", elements: ["precision", "purpose", "obsolescence"] },
            { name: "The Dream", type: "psychic", elements: ["illusion", "memory", "desire"] },
            { name: "The Storm", type: "elemental", elements: ["chaos", "power", "unpredictability"] },
            { name: "The Ancient", type: "time", elements: ["wisdom", "decay", "cycles"] }
        ];

        const locations = [
            "Sanctum", "Depths", "Halls", "Caverns", "Chambers", "Throne Room",
            "Labyrinth", "Catacombs", "Observatory", "Armory", "Chapel", "Arena",
            "Vault", "Garden", "Workshop", "Dungeon", "Spire", "Ruins"
        ];

        const bossTypes = [
            { prefix: "Elder", suffix: "Lord", emoji: "👹" },
            { prefix: "Corrupted", suffix: "Knight", emoji: "⚔️" },
            { prefix: "Ancient", suffix: "Wyrm", emoji: "🐉" },
            { prefix: "Phantom", suffix: "King", emoji: "👑" },
            { prefix: "Infernal", suffix: "Beast", emoji: "😈" },
            { prefix: "Celestial", suffix: "Fallen", emoji: "😇" },
            { prefix: "Primordial", suffix: "Horror", emoji: "🦑" },
            { prefix: "Undying", suffix: "Revenant", emoji: "💀" },
            { prefix: "Storm", suffix: "Titan", emoji: "⛈️" },
            { prefix: "Crystal", suffix: "Golem", emoji: "🤖" }
        ];

        const artifactTypes = [
            { name: "Blade", icon: "⚔️", mainStat: "attack" },
            { name: "Shield", icon: "🛡️", mainStat: "defense" },
            { name: "Ring", icon: "💍", mainStat: "magic" },
            { name: "Amulet", icon: "📿", mainStat: "maxHP" },
            { name: "Gauntlet", icon: "🧤", mainStat: "attack" },
            { name: "Helm", icon: "⛑️", mainStat: "defense" },
            { name: "Staff", icon: "🪄", mainStat: "magic" },
            { name: "Boots", icon: "👢", mainStat: "speed" },
            { name: "Orb", icon: "🔮", mainStat: "crit" },
            { name: "Tome", icon: "📖", mainStat: "magic" }
        ];

        const seededRandom = (seed) => {
            let x = Math.sin(seed * 9301 + 49297) * 49297;
            return x - Math.floor(x);
        };

        const pick = (arr, seed) => arr[Math.floor(seededRandom(seed) * arr.length)];

        const theme = pick(themes, floor * 7);
        const location = pick(locations, floor * 13);
        const boss = pick(bossTypes, floor * 17);
        const artifact = pick(artifactTypes, floor * 23);

        const adjectives = ["Shattered", "Eternal", "Cursed", "Blessed", "Forgotten", "Twisted", "Sacred", "Unholy", "Ancient", "Awakened"];
        const adj = pick(adjectives, floor * 31);

        const tierMultiplier = Math.floor(floor / 10) + 1;
        const baseBonus = Math.floor(floor * 0.8) + 2;

        const bonuses = {};
        bonuses[artifact.mainStat] = baseBonus + tierMultiplier;
        
        const secondaryStat = ['attack', 'defense', 'magic', 'speed', 'crit', 'maxHP'].filter(s => s !== artifact.mainStat);
        bonuses[pick(secondaryStat, floor * 41)] = Math.floor(baseBonus * 0.6) + tierMultiplier;

        const storyTemplates = [
            `Floor ${floor} of the Endless Dungeon reveals ${theme.name} ${location}—a place where ${theme.elements[0]} and ${theme.elements[1]} intertwine in maddening patterns. The deeper you descend, the more the dungeon feels alive, responding to your presence with equal parts curiosity and malice. Fragments of the Eternis Crystal pulse stronger here, drawing ${theme.elements[2]} from the walls like blood from a wound. The ${boss.prefix} ${boss.suffix} awaits at the chamber's heart, a being forged from the dungeon's deepest ${theme.elements[0]}. It speaks a challenge that resonates in your bones: 'You have come far, bearer of shards. But distance traveled means nothing—only the distance yet to go.'`,
            `The walls of floor ${floor} weep with ${theme.elements[1]}. You have entered the ${adj} ${location}, a realm where the boundary between ${theme.elements[0]} and ${theme.elements[2]} has dissolved completely. Echoes of previous adventurers' footsteps still sound in the corridors—or perhaps those are your own steps, bouncing back from a future that hasn't happened yet. The ${boss.prefix} ${boss.suffix} does not attack immediately. It studies you, measuring the weight of your determination against the gravity of your doubts. When it finally strikes, it does so with the force of every abandoned dream and every broken resolution.`,
            `They called this place the ${adj} ${location} in the old texts, though no text could capture the ${theme.elements[0]} that permeates every stone. Floor ${floor} challenges not just your strength but your understanding of why you fight. The ${boss.prefix} ${boss.suffix}, ancient beyond measure, has watched civilizations rise and crumble from this very spot. 'Another seeker,' it rumbles. 'They all come seeking something—power, meaning, escape. What do you seek, little hero? And is it worth what the dungeon will take from you?' The answer, you've learned, is always yes. The answer is always to keep going.`
        ];

        return {
            floor: floor,
            title: `${theme.name} ${location}`,
            text: pick(storyTemplates, floor * 53),
            bossName: `${boss.prefix} ${boss.suffix}`,
            bossEmoji: boss.emoji,
            artifactName: `${adj} ${artifact.name} of the ${theme.name.replace('The ', '')}`,
            artifactIcon: artifact.icon,
            artifactDesc: `An artifact infused with the essence of ${theme.elements[0]}, recovered from floor ${floor} of the Endless Dungeon.`,
            artifactBonus: bonuses
        };
    },

    // Get lore for a specific floor
    getLore(floor) {
        if (floor <= this.chapters.length) {
            return this.chapters[floor - 1];
        }
        return this.generateProceduralLore(floor);
    },

    // Get monster data for a floor room (non-boss)
    getMonster(floor, room) {
        const monsters = [
            { name: "Shadow Wisp", emoji: "👤", tier: 1 },
            { name: "Bone Crawler", emoji: "🦴", tier: 1 },
            { name: "Fungal Creeper", emoji: "🍄", tier: 1 },
            { name: "Stone Gargoyle", emoji: "🗿", tier: 2 },
            { name: "Flame Imp", emoji: "🔥", tier: 2 },
            { name: "Frost Wraith", emoji: "❄️", tier: 2 },
            { name: "Venomous Drake", emoji: "🐍", tier: 3 },
            { name: "Iron Golem", emoji: "🤖", tier: 3 },
            { name: "Dark Sorcerer", emoji: "🧙", tier: 3 },
            { name: "Abyssal Stalker", emoji: "👁️", tier: 4 },
            { name: "Thunder Elemental", emoji: "⚡", tier: 4 },
            { name: "Plague Bearer", emoji: "☠️", tier: 4 },
            { name: "Void Spawn", emoji: "🌀", tier: 5 },
            { name: "Elder Vampire", emoji: "🧛", tier: 5 },
            { name: "Chaos Knight", emoji: "♞", tier: 5 }
        ];

        const scaledTier = Math.min(Math.floor((floor - 1) / 2) + 1, 5);
        const available = monsters.filter(m => m.tier <= scaledTier);
        
        const seed = floor * 100 + room;
        const seededRandom = (s) => {
            let x = Math.sin(s * 9301 + 49297) * 49297;
            return x - Math.floor(x);
        };
        
        const monster = available[Math.floor(seededRandom(seed) * available.length)];
        const levelScale = 1 + (floor - 1) * 0.3 + room * 0.1;
        
        return {
            name: monster.name,
            emoji: monster.emoji,
            hp: Math.floor(40 * levelScale),
            maxHP: Math.floor(40 * levelScale),
            attack: Math.floor(8 * levelScale),
            defense: Math.floor(3 * levelScale),
            speed: Math.floor(5 + floor * 0.5),
            xpReward: 0 // No XP from monsters
        };
    },

    // Get boss data for a floor
    getBoss(floor) {
        const lore = this.getLore(floor);
        const levelScale = 1 + (floor - 1) * 0.5;
        
        return {
            name: lore.bossName,
            emoji: lore.bossEmoji,
            hp: Math.floor(100 * levelScale),
            maxHP: Math.floor(100 * levelScale),
            attack: Math.floor(15 * levelScale),
            defense: Math.floor(8 * levelScale),
            speed: Math.floor(8 + floor * 0.8),
            isBoss: true,
            floor: floor,
            lore: lore
        };
    }
};

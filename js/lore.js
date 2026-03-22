// ============================================
// LORE & STORY SYSTEM
// ============================================

const LORE_DATA = [
    // Prologue (index 0) - unlocked by default
    {
        chapter: "Prologue",
        title: "The Awakening",
        text: `You awaken in a world between worlds — the Realm of QuestBorne. Here, willpower 
manifests as physical strength, discipline forges unbreakable armor, and every challenge 
conquered in the waking world empowers your spirit. You stand before the Eternal Dungeon, 
an infinite labyrinth that descends into the heart of the earth. Its depths are filled with 
creatures born from entropy — manifestations of procrastination, doubt, and chaos. The ancient 
guardian at the gate speaks: "Only through mastering yourself can you descend deeper. No blade 
forged in darkness can replace the power of a disciplined soul." Your journey begins now.`
    },
    // Floor 1 Boss (index 1)
    {
        chapter: "Chapter I",
        title: "The Whispering Caves",
        text: `Deep within the first caverns, you encounter Grukk the Idle — a massive cave troll 
who has sat motionless for a thousand years, growing fat on the stagnation of those who 
wandered in and gave up. His very presence saps motivation, making your limbs heavy and 
your mind foggy. But you push through. As Grukk falls, his body crumbles to reveal a 
crystallized heart — proof that even the most stubborn inertia can be shattered. On the 
wall behind him, ancient runes glow: "The first step is always the hardest. You have taken it."`
    },
    // Floor 2 Boss (index 2)
    {
        chapter: "Chapter II",
        title: "The Echoing Halls",
        text: `The second floor opens into vast halls of black marble, where every sound echoes 
infinitely. Here dwells the Doubt Wraith — a spectral figure that whispers your failures 
back to you in your own voice. "Remember when you quit? Remember when you weren't good enough?" 
Its attacks are not physical but psychological, each hit making you question why you even 
descended into the dungeon. But you've built resilience through daily discipline. You've 
proven yourself through action, not words. The wraith screams as your conviction tears 
through its ethereal form. In the silence that follows, you find a journal entry from a 
previous adventurer: "The voices never truly stop, but they become quieter the louder your 
actions speak."`
    },
    // Floor 3 Boss (index 3)
    {
        chapter: "Chapter III",
        title: "The Forge of Broken Promises",
        text: `The third floor burns with the heat of a thousand abandoned commitments. Here, in 
a forge fueled by broken promises, works Kalthraz the Oathbreaker — a demon-smith who 
crafts weapons from failed resolutions and shields from excuses. The floor is littered 
with half-finished swords and cracked armor — the remnants of those who started strong 
but could not maintain their resolve. Kalthraz laughs as you approach: "Another one who 
thinks they're different?" But you ARE different. Every task completed, every habit maintained, 
has been a promise KEPT. Your consistency is your ultimate weapon. As Kalthraz falls, 
his forge transforms — no longer burning with failure, but glowing with potential. You 
claim a weapon forged from your own determination.`
    },
    // Floor 4 Boss (index 4)
    {
        chapter: "Chapter IV",
        title: "The Garden of Endless Scrolling",
        text: `You descend into a bizarre floor — an infinite garden where flowers bloom into 
glowing screens, each showing something fascinating, something that demands "just five 
more minutes." The guardian here is Scrollos, the Infinite — a serpentine creature made 
entirely of tangled notification threads and algorithm chains. It doesn't attack directly; 
instead, it shows you interesting things, funny things, outrage-inducing things — anything 
to keep you standing still while hours dissolve into nothing. You've seen this enemy before 
in the waking world. Every time you chose to put down the phone, every time you chose 
practice over consumption, you were training for this fight. Scrollos unravels as you 
refuse its offerings, and beneath its coils you find an artifact pulsing with reclaimed time.`
    },
    // Floor 5 Boss (index 5)
    {
        chapter: "Chapter V",
        title: "The Mirror Labyrinth",
        text: `The fifth floor is a maze of mirrors, each reflecting a different version of you — 
the you who never started, the you who gave up, the you who chose comfort over growth. 
At its center waits your Shadow Self, an exact copy of you but twisted by every compromise 
and shortcut you ever took. It knows all your moves because it IS you — or rather, it's 
who you would have been without discipline. The battle is the hardest yet, because your 
Shadow matches you blow for blow. But there's one crucial difference: your Shadow can 
only mirror your past self. Every new skill gained, every stat improved through real effort, 
gives you the edge. When it finally shatters, you see your true reflection for the first 
time — scarred, tired, but unbroken. The inscription reads: "Your greatest enemy was 
always yourself. Your greatest ally is who you chose to become."`
    },
    // Floor 6 Boss (index 6)
    {
        chapter: "Chapter VI",
        title: "The Procrastination Swamp",
        text: `Below the Mirror Labyrinth lies a vast, treacherous swamp where time moves strangely. 
What feels like minutes turns out to be hours, and the thick fog makes every direction 
look the same. The master of this domain is Manyana, the Tomorrow Witch — a haggard 
figure who eternally promises to start tomorrow. Her magic is seductive: "Rest now, hero. 
You've earned it. Tomorrow you'll be stronger, more prepared." Her spells don't damage 
your body but slow your mind, making every action feel like it can wait. You've fought 
this battle countless times in the waking world. Every morning you chose to begin despite 
not feeling ready, you were building immunity to her curse. As she falls, the swamp 
drains, revealing solid ground beneath — it was always there, hidden by the fog of delay.`
    },
    // Floor 7 Boss (index 7)
    {
        chapter: "Chapter VII",
        title: "The Perfectionist's Tower",
        text: `A gleaming tower rises from the dungeon's depths — impossibly perfect in its 
construction, every brick precisely placed, every surface polished to a mirror shine. 
At its peak waits Flawless, the Unfinished — a being of pure crystal that has spent 
eternity perfecting a single room while the rest of its tower crumbles from neglect. 
Its attacks are surgical and precise, each one designed to exploit the smallest weakness 
in your form. But perfection is its prison, not its power. While it calculated the 
mathematically optimal strike, you simply struck. While it hesitated because conditions 
weren't perfect, you acted with what you had. Flawless shatters — not because you were 
perfect, but because you were persistent. In its remains you find a note: "Done is better 
than perfect. Consistent beats exceptional. Progress over perfection, always."`
    },
    // Floor 8 Boss (index 8)
    {
        chapter: "Chapter VIII",
        title: "The Comfort Catacombs",
        text: `The eighth floor is warm and cozy — disturbingly so. Soft couches line the walls, 
gentle music plays, and the air smells of home cooking. This is the domain of Kozyrak, 
the Comfort Dragon — a massive beast that doesn't breathe fire but warmth, doesn't 
threaten with claws but wraps you in velvet wings. "Stay," it purrs. "Why struggle? 
Why push yourself? Everything you need is right here." Its lair is filled with the 
preserved remains of adventurers who chose comfort — eternally resting, eternally 
unchanging, eternally unfulfilled. You recognize the trap because you've escaped it 
before. Every cold morning you chose to exercise, every evening you practiced instead 
of relaxing — those were victories against this very creature. Kozyrak doesn't roar 
when defeated; it sighs, and its warmth transforms into a forge-fire that tempers 
your resolve into steel.`
    },
    // Floor 9 Boss (index 9)
    {
        chapter: "Chapter IX",
        title: "The Comparison Colosseum",
        text: `An enormous arena stretches before you, its stands filled with ghostly spectators — 
each one a version of someone you've compared yourself to. Someone more talented, 
more successful, more disciplined. They whisper and point and judge. The champion of 
this arena is Envius Rex, a shape-shifting gladiator who constantly morphs into someone 
better than you at whatever you're trying to do. Faster, stronger, smarter — always one 
step ahead, always making you feel inadequate. But you've learned the truth: comparison 
is a rigged game with no winners. Your journey is your own. Your progress is measured 
against your yesterday, not someone else's today. When you stop trying to be better 
than Envius and simply focus on being better than you were, it loses its power — because 
it can only copy others, never generate its own strength. The arena crumbles, and beneath 
it you find a trophy inscribed: "The only race worth running is against who you were yesterday."`
    },
    // Floor 10 Boss (index 10)
    {
        chapter: "Chapter X",
        title: "The Void Gate",
        text: `At the tenth floor, the dungeon opens into a vast void — an infinite darkness broken 
only by a single point of golden light. Here, at the boundary between the known and 
unknown, waits the Void Sentinel — an ancient guardian neither good nor evil, but a test 
of everything you've become. It doesn't speak, doesn't taunt, doesn't deceive. It simply 
fights with the accumulated power of ten floors of darkness. The battle is long and 
grueling, testing every stat, every skill, every artifact you've earned. And when 
it finally falls, the void doesn't brighten — instead, you realize that the light 
was coming from YOU all along. The golden glow was your own discipline made manifest. 
A gateway opens to deeper floors, and a voice echoes: "You have passed the first trial. 
But the Eternal Dungeon has no end, as your potential for growth has no ceiling. 
Descend further, grow stronger, become the legend you were meant to be." 
The real journey begins now.`
    }
];

// Generate infinite lore for floors beyond 10
function generateLore(floorNumber) {
    if (floorNumber <= 10 && floorNumber < LORE_DATA.length) {
        return LORE_DATA[floorNumber];
    }

    // Procedural lore generation for floors beyond the pre-written content
    const themes = [
        { name: "The Shattered Timeline", enemy: "Chronos, the Time Eater", 
          text: "In a realm where past and future collide, you face a creature that feeds on wasted time. Every second squandered in the waking world gave it power, but every productive hour weakened its hold. Your discipline across time itself becomes your weapon." },
        { name: "The Burnout Wastes", enemy: "Ashara, Flame of Excess",
          text: "A scorched landscape where overwork burns as hot as laziness freezes. The guardian here teaches a different lesson — that rest is not weakness, and balance is the sharpest blade. You defeat it not with force alone, but with the wisdom of knowing when to push and when to recover." },
        { name: "The Echo Chamber", enemy: "Narcissus, the Self-Deceiver",
          text: "A hall where only your own voice echoes back, amplified and distorted. The creature here feeds on self-deception — the lies we tell ourselves about our progress, our abilities, our commitment. Only honest self-reflection can pierce its defenses." },
        { name: "The Gravity Well", enemy: "Heavius, the Burden Lord",
          text: "Every responsibility, every obligation, every 'should' materializes as physical weight on this floor. The guardian is made of accumulated pressure. You learn that carrying burdens isn't about strength alone — it's about prioritization, delegation, and the courage to set down what doesn't serve you." },
        { name: "The Distortion Fields", enemy: "Parallax, the Perspective Shifter",
          text: "Reality bends on this floor — what seems close is far, what seems easy is hard, and vice versa. The guardian distorts your perception, making small victories feel meaningless and minor setbacks feel catastrophic. Defeating it requires maintaining clarity of purpose regardless of circumstances." },
        { name: "The Forgotten Library", enemy: "Amnesia, the Knowledge Thief",
          text: "An infinite library where books write themselves and erase just as quickly. The guardian steals not memories, but lessons learned — making you repeat the same mistakes. Only by truly internalizing your growth can you resist its power." },
        { name: "The Jealousy Mines", enemy: "Covetous Rex, the Green Dragon",
          text: "Deep mines where crystals reflect others' achievements, making your own seem dim by comparison. The dragon hoards not gold but others' accomplishments, using them as weapons. You learn that admiration can fuel growth, but jealousy only poisons it." },
        { name: "The Anxiety Maze", enemy: "The What-If Hydra",
          text: "A maze that changes based on your fears, with a hydra that grows two heads for every worry you feed. The only path through is forward — not avoiding anxiety, but acting despite it. Each head you cut with decisive action stays severed." },
        { name: "The Monotony Plains", enemy: "The Grey Sovereign",
          text: "An endless, featureless plain where everything is exactly the same. The guardian thrives on boredom and routine's dark side — when discipline becomes joyless obligation. You defeat it by finding purpose within consistency, meaning within repetition." },
        { name: "The Pride Pinnacle", enemy: "Hubris, the Fallen Champion",
          text: "A mountain peak where a once-great hero fell to arrogance. The guardian is what you could become if you let achievements go to your head — powerful but brittle, confident but blind. True strength lies in the humility to keep learning, keep growing, keep beginning again." }
    ];

    const themeIndex = (floorNumber - 11) % themes.length;
    const cycle = Math.floor((floorNumber - 11) / themes.length) + 1;
    const theme = themes[themeIndex];

    return {
        chapter: `Chapter ${toRomanNumerals(floorNumber)}`,
        title: cycle > 1 ? `${theme.name} (Cycle ${cycle})` : theme.name,
        text: cycle > 1 
            ? `${theme.text}\n\nIn this deeper cycle, ${theme.enemy} returns more powerful than before, twisted by the accumulated darkness of ${(cycle - 1) * 10} additional floors. Yet you too have grown. The battle is fiercer, the stakes higher, but the lesson remains eternal.`
            : theme.text
    };
}

function toRomanNumerals(num) {
    const romanNumerals = [
        [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
        [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
        [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
    ];
    let result = '';
    for (const [value, symbol] of romanNumerals) {
        while (num >= value) {
            result += symbol;
            num -= value;
        }
    }
    return result;
}

// Export for use in other files
window.LoreSystem = {
    getLore: generateLore,
    LORE_DATA: LORE_DATA
};

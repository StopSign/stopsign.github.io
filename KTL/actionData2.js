


//After Hermit
actionData = {
    ...actionData,

    meditate: {
        tier:1, plane:0,
        progressMaxBase:1e30, progressMaxIncrease:40,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:1,
        unlockCost:1e22, visible:false, unlocked:false, purchased: true,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            if(data.actions.meditate.level >= 10) {
                unveilAction('standStraighter');
            }
        },
        onLevelAtts:[["awareness", 3000], ["cycle", 10]],
        expAtts:[["curiosity", 1], ["flow", 1], ["concentration", 1], ["discernment", 1]],
        efficiencyAtts:[["integration", 10]],
        iconText: {english:Raw.html`
        Level 10: Reveal Stand Straighter
`}
    },
    journal: {
        tier:1, plane:0,
        progressMaxBase:1e30, progressMaxIncrease:40,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:4,
        unlockCost:1e22, visible:false, unlocked:false, purchased: true,
        onLevelCustom: function() {
            addMaxLevel("meditate", 1);
        },
        onUnlock: function() {
        },
        onLevelAtts:[["curiosity", 5000], ["awareness", 3000]],
        expAtts:[["energy", 1], ["observation", 1]],
        efficiencyAtts:[["cycle", 2]],
        iconText: {english:Raw.html`
        On Level: +1 max level to meditate
`}
    },
    processEmotions: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e30, progressMaxIncrease:3,
        expToLevelBase:1, expToLevelIncrease:2,
        efficiencyBase:.01, maxLevel:0,
        unlockCost:1e29, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('readTheWritten')
            unveilAction('siftExcess')
            addMaxLevel("readTheWritten", 1)
            addMaxLevel("siftExcess", 1)
        },
        onLevelAtts:[["concentration", 10000]],
        expAtts:[["valor", 1]],
        efficiencyAtts:[["cycle", .5]],
        iconText: {english:Raw.html`
        Level 1: Reveal Read The Written<br>
        Level 1: Reveal Sift Excess<br>
        On Level: +1 max level to Read The Written<br>
        On Level: +1 max level to Sift Excess
`}
    },
    readTheWritten: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:2e40, progressMaxIncrease:6,
        expToLevelBase:1, expToLevelIncrease:2,
        efficiencyBase:.01, maxLevel:0,
        unlockCost:2e29, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["awareness", 10000]],
        expAtts:[["energy", 1], ["curiosity", 1], ["valor", 1]],
        efficiencyAtts:[["cycle", .5]]
    },
    siftExcess: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e46, progressMaxIncrease:6,
        expToLevelBase:1, expToLevelIncrease:2,
        efficiencyBase:.01, maxLevel:0,
        unlockCost:4e29, visible:false, unlocked:false, purchased: false,
        onLevelCustom: function() {
        },
        onLevelAtts:[["flow", 200], ["cycle", 100], ["control", 20]],
        expAtts:[["energy", 1], ["awareness", 1], ["observation", 1]],
        efficiencyAtts:[["cycle", .5]]
    },
    feelAGentleTug: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:5e35, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:3,
        unlockCost:5e26, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
            unveilAction('leaveTheOpenRoad')
            addMaxLevel("journal", 1);
        },
        onLevelCustom: function() {

        },
        onLevelAtts:[["curiosity", 30000]],
        expAtts:[["observation", 1], ["concentration", 1]],
        efficiencyAtts:[["navigation", 1]],
        unlockMessage:{english:"On unlock, +1 max level for Journal."},
        iconText: {english:Raw.html`
        On Unlock: Reveal Leave The Open Road<br>
        On Unlock: +1 max level for Journal
    `}
    },
    leaveTheOpenRoad: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e34, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:3,
        unlockCost:1e27, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
            unveilAction('findOverlook')
            addMaxLevel("journal", 1);
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["observation", 200000], ["endurance", 20000]],
        expAtts:[["might", 1], ["endurance", 1]],
        efficiencyAtts:[["navigation", 1]],
        unlockMessage:{english:"On unlock, +1 max level for Journal."},
        iconText: {english:Raw.html`
        On Unlock: Reveal Find Overlook<br>
        On Unlock: +1 max level for Journal
`}
    },
    findOverlook: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e31, progressMaxIncrease:1000,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.02, maxLevel:1,
        unlockCost:5e27, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
            addMaxLevel("journal", 1);
        },
        onLevelCustom: function() {
            unveilAction('discoverBurntTown')
        },
        onLevelAtts:[["concentration", 5000], ["vision", 300], ["navigation", 300]],
        expAtts:[["might", 1]],
        efficiencyAtts:[["geared", .001]],
        unlockMessage:{english:"On unlock, +1 max level for Journal."},
        iconText: {english:Raw.html`
            On Unlock: +1 max level for Journal<br>
            Level 1: Reveal Discover Burnt Town
    `}
    },
    discoverBurntTown: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:5e32, progressMaxIncrease:4,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.03, maxLevel:10,
        unlockCost:2e29, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
            addMaxLevel("journal", 1);
        },
        onLevelCustom: function() {
            unveilAction('stepThroughAsh');
            if(data.actions.discoverBurntTown.level >= 2) {
                unveilAction('resonanceCompass')
            }
            if(data.actions.discoverBurntTown.level >= 3) {
                unveilAction('feelTheDespair')
            }
            if(data.actions.discoverBurntTown.level >= 4) {
                unveilAction('repairShatteredShrine')
            }
        },
        onLevelAtts:[["valor", 1]],
        expAtts:[["endurance", 1]],
        efficiencyAtts:[["geared", .001]],
        unlockMessage:{english:"On unlock, +1 max level for Journal."},
        iconText: {english:Raw.html`
            On Unlock: +1 max level for Journal<br>
            Level 1: Reveal Step Through Ash<br>
            Level 2: Reveal Resonance Compass<br>
            Level 3: Reveal Feel The Despair<br>
            Level 4: Reveal Repair Shattered Shrine
    `}
    },
    feelTheDespair: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:2e29, progressMaxIncrease:3,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:2,
        unlockCost:2e29, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["legacy", 300]],
        expAtts:[],
        efficiencyAtts:[]
    },
    repairShatteredShrine: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e30, progressMaxIncrease:3,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:2,
        unlockCost:1e30, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["legacy", 500]],
        expAtts:[],
        efficiencyAtts:[]
    },
    stepThroughAsh: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e28, progressMaxIncrease:6,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:5,
        unlockCost:2e29, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('processEmotions')
            addMaxLevel("processEmotions", 1)
            if(data.actions.stepThroughAsh.level >= 3) {
                unveilAction('graspTheTragedy')
            }
        },
        onLevelAtts:[["valor", 3]],
        expAtts:[["valor", 10]],
        efficiencyAtts:[["awareness", .001], ["flow", .1]],
        onLevelText:{english:"+1 max level for Process Emotions."},
        iconText: {english:Raw.html`
        On Level: +1 max level for Process Emotions<br>
        Level 1: Reveal Process Emotions<br>
        Level 3: Reveal Grasp The Tragedy
`}
    },
    graspTheTragedy: {
        tier:2, plane:0, creationVersion:2, 
        progressMaxBase:3e31, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:2,
        unlockCost:3e30, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["integration", 400], ["valor", 5]],
        expAtts:[["valor", 10]],
        efficiencyAtts:[["valor", 10]]
    },
    resonanceCompass: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:3e28, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:5,
        unlockCost:5e29, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('clearIvyWall')
        },
        onLevelAtts:[["curiosity", 7e4]],
        expAtts:[["legacy", .001]],
        efficiencyAtts:[["curiosity", .01]],
        iconText: {english:Raw.html`
        Level 1: Reveal Clear Ivy Wall
`}
    },
    clearIvyWall: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:3e35, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:5,
        unlockCost:5e29, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('findPulsingShard')
            if(data.actions.clearIvyWall.level >= 3) {
                unveilAction('scavengeForSupplies')
            }
        },
        onLevelAtts:[["coordination", 2000]],
        expAtts:[["might", 1], ["endurance", 1]],
        efficiencyAtts:[["curiosity", .0005]],
        iconText: {english:Raw.html`
        Level 1: Reveal Find Pulsing Shard<br>
        Level 3: Reveal Scavenge For Supplies
`}
    },
    findPulsingShard: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e36, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:1,
        unlockCost:5e30, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["legacy", 3000], ["pulse", 200]],
        expAtts:[["observation", 1]],
        efficiencyAtts:[["curiosity", .0005]]
    },
    scavengeForSupplies: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e39, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:5,
        unlockCost:3e30, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
            addMaxLevel("stepThroughAsh", 1)
        },
        onLevelCustom: function() {
            unveilAction('skimAHeavyTome')
        },
        onLevelAtts:[["observation", 3e5], ["might", 5000]],
        expAtts:[["coordination", 1], ["endurance", 1]],
        efficiencyAtts:[["curiosity", .001]],
        unlockMessage:{english:"On unlock, +1 max level for Step Through Ash."},
        iconText: {english:Raw.html`
        On Unlock: +1 max level for Step Through Ash<br>
        Level 1: Reveal Skim A Heavy Tome
`}
    },
    skimAHeavyTome: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:8e41, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:5,
        unlockCost:2e31, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
            addMaxLevel("stepThroughAsh", 1)
            addMaxLevel("meditate", 1)
        },
        onLevelCustom: function() {
            unveilAction('clearRubble')
        },
        onLevelAtts:[["discernment", 100]],
        expAtts:[["concentration", 1], ["flow", 1], ["endurance", 1]],
        efficiencyAtts:[["curiosity", .01]],
        unlockMessage:{english:"On unlock, +1 max level for Step Through Ash and Meditate."},
        iconText: {english:Raw.html`
        On Unlock: +1 max level for Step Through Ash<br>
        On Unlock: +1 max level for Meditate<br>
        Level 1: Reveal Clear Rubble
`}
    },
    clearRubble: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:2e38, progressMaxIncrease:5,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.002, maxLevel:10,
        unlockCost:3e31, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
            addMaxLevel("stepThroughAsh", 1)
        },
        onLevelCustom: function() {
            unveilAction('readFadedMarkers')
        },
        onLevelAtts:[["endurance", 3e4], ["coordination", 4000]],
        expAtts:[["might", 1], ["discernment", 1]],
        efficiencyAtts:[["navigation", 1]],
        unlockMessage:{english:"On unlock, +1 max level for Step Through Ash."},
        iconText: {english:Raw.html`
        On Unlock: +1 max level for Step Through Ash<br>
        Level 1: Reveal Read Faded Markers
`}
    },
    readFadedMarkers: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e37, progressMaxIncrease:6,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.002, maxLevel:5,
        unlockCost:6e31, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
            addMaxLevel("stepThroughAsh", 1)
        },
        onLevelCustom: function() {
            unveilAction('mapOutTraps')
        },
        onLevelAtts:[["concentration", 3e4], ["navigation", 200]],
        expAtts:[["observation", 1]],
        efficiencyAtts:[["navigation", 1]],
        unlockMessage:{english:"On unlock, +1 max level for Step Through Ash."},
        iconText: {english:Raw.html`
        On Unlock: +1 max level for Step Through Ash<br>
        Level 1: Reveal Map Out Traps
`}
    },
    mapOutTraps: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:2e33, progressMaxIncrease:1.2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.002, maxLevel:10,
        unlockCost:1e32, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
            addMaxLevel("stepThroughAsh", 1)
        },
        onLevelCustom: function() {
            unveilAction('accessForbiddenArea')
        },
        onLevelAtts:[["observation", 2e5], ["flow", 100]],
        expAtts:[["discernment", 1]],
        efficiencyAtts:[["navigation", 1]],
        unlockMessage:{english:"On unlock, +1 max level for Step Through Ash."},
        iconText: {english:Raw.html`
        On Unlock: +1 max level for Step Through Ash<br>
        Level 1: Reveal Access Forbidden Area
`}
    },
    accessForbiddenArea: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:2e36, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.002, maxLevel:1,
        unlockCost:2e32, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('collectSpellBooks')
        },
        onLevelAtts:[["awareness", 5e4]],
        expAtts:[["coordination", 1]],
        efficiencyAtts:[["navigation", 1]],
        iconText: {english:Raw.html`
        Level 1: Reveal Collect Spell Books
`}
    },
    collectSpellBooks: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e32, progressMaxIncrease:5,
        expToLevelBase:1, expToLevelIncrease:2,
        efficiencyBase:.002, maxLevel:4,
        unlockCost:3e32, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('readBooks');
            addMaxLevel('catalogNewBooks', 1);
            unveilAction('catalogNewBooks');
            unveilAction('findAFamiliarLanguage');
        },
        onLevelAtts:[["wizardry", 5000], ["spellcraft", 1]],
        expAtts:[],
        efficiencyAtts:[["navigation", 1]],
        iconText: {english:Raw.html`
        Level 1: Reveal Read Books<br>
        Level 1: Reveal Catalog New Books<br>
        Level 1: Reveal Find A Familiar Language<br>
        On Level: +1 max level for Catalog New Books
`}
    },
    findAFamiliarLanguage: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e46, progressMaxIncrease:100,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.02, maxLevel:5,
        unlockCost:1e35, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('searchForRelevantBooks');
        },
        onLevelAtts:[["observation", 1e6]],
        expAtts:[["awareness", 1], ["adaptability", 1], ["curiosity", 1]],
        efficiencyAtts:[["navigation", .01]],
        iconText: {english:Raw.html`
        Level 1: Reveal Search For Relevant Books
`}
    },
    searchForRelevantBooks: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e44, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.02, maxLevel:5,
        unlockCost:3e35, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('collectInterestingBooks');
        },
        onLevelAtts:[["curiosity", 3e5]],
        expAtts:[["observation", 1], ["discernment", 1], ["logistics", 1]],
        efficiencyAtts:[["navigation", .01]],
        iconText: {english:Raw.html`
        Level 1: Reveal Collect Interesting Books
`}
    },
    collectInterestingBooks: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e42, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.02, maxLevel:3,
        unlockCost:1e36, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('collectHistoryBooks');
        },
        onLevelAtts:[["intellect", 1]],
        expAtts:[["discernment", 1], ["curiosity", 1], ["logistics", 1]],
        efficiencyAtts:[["navigation", .01]],
        iconText: {english:Raw.html`
        Level 1: Reveal Collect History Books
`}
    },
    collectHistoryBooks: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e42, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:3,
        unlockCost:1e37, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
            addMaxLevel('catalogNewBooks', 3);
        },
        onLevelCustom: function() {
            unveilAction('studyHistory');
            if(data.actions.collectHistoryBooks.level >= 2) {
                unveilAction('readOldStories');
            }
            if(data.actions.collectHistoryBooks.level >= 3) {
                unveilAction('readWarJournals');
            }
            if(data.actions.collectHistoryBooks.level >= 4) {
                unveilAction('readOldReligiousTexts');
            }
            if(data.actions.collectHistoryBooks.level >= 5) {
                unveilAction('collectMathBooks');
                unveilAction('readOldPoetry');
            }
            if(data.actions.collectHistoryBooks.level >= 6) {
                unveilAction('readOldProphecies');
                unveilAction('browseFantasyNovels');
            }
            if(data.actions.collectHistoryBooks.level >= 7) {
                unveilAction('readOldPhilosophy');
                unveilAction('complainAboutDifficulty');
            }
        },
        onLevelAtts:[["intellect", 2]],
        expAtts:[["curiosity", 1], ["logistics", 1]],
        efficiencyAtts:[["logistics", 1]],
        unlockMessage:{english:"On unlock, +3 max levels for Catalog New Books."},
        iconText: {english:Raw.html`
        On Unlock: +3 max levels to Catalog New Books<br>
        Level 1: Reveal Study History<br>
        Level 2: Reveal Read Old Stories<br>
        Level 3: Reveal Read War Journals<br>
        Level 4: Reveal Read Old Religious Texts<br>
        Level 5: Reveal Read Old Poetry<br>
        Level 5: Reveal Collect Math Books<br>
        Level 6: Reveal Read Old Prophecies<br>
        Level 6: Reveal Browse Fantasy Novels<br>
        Level 7: Reveal Read Old Philosophy<br>
        Level 7: Reveal Complain About Difficulty
`}
    },
    browseFantasyNovels: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:2e46, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:5,
        unlockCost:2e41, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["curiosity", 1e6], ["charm", 5e4], ["valor", 40]],
        expAtts:[["observation", 1]],
        efficiencyAtts:[["navigation", .01]]
    },
    recognizeRunicLanguages: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:4e41, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:5,
        unlockCost:4e41, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["observation", 5e6], ["pulse", 750]],
        expAtts:[["spellcraft", 1]],
        efficiencyAtts:[["navigation", .01]]
    },
    catalogUnknownLanguages: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e49, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:4,
        unlockCost:1e44, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["concentration", 3e5], ["discernment", 300]],
        expAtts:[["curiosity", 1]],
        efficiencyAtts:[["navigation", .01]]
    },
    complainAboutDifficulty: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e48, progressMaxIncrease:100,
        expToLevelBase:100, expToLevelIncrease:1,
        efficiencyBase:.005, maxLevel:3,
        unlockCost:1e44, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["amplification", 5e5], ["legacy", 1e5]],
        expAtts:[["curiosity", 1]],
        efficiencyAtts:[["navigation", .01]]
    },
    decipherOrganization: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:3e50, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:4,
        unlockCost:3e44, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["navigation", 3000], ["logistics", 20]],
        expAtts:[["observation", 1]],
        efficiencyAtts:[["navigation", .01]]
    },
    collectMathBooks: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e47, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:3,
        unlockCost:1e40, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            addMaxLevel('catalogNewBooks', 2);
            addMaxLevel('studyCryptology', 1);

            if(data.actions.collectMathBooks.level >= 4) {
                unveilAction('clearTheDust');
            }
        },
        onLevelAtts:[["cycle", 5000], ["intellect", 5]],
        expAtts:[["curiosity", 1], ["logistics", 1]],
        efficiencyAtts:[["logistics", 1]],
        iconText: {english:Raw.html`
        On Level: +2 max levels for Catalog New Books<br>
        On Level: +1 max level for Study Cryptology<br>
        Level 4: Reveal Clear The Dust
`}
    },

    clearTheDust: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e50, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.005, maxLevel:10,
        unlockCost:1e46, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["coordination", 1e4], ["vision", 2000]],
        expAtts:[["endurance", 1]],
        efficiencyAtts:[["navigation", 1]]
    },
    markTheLayout: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:3e52, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.005, maxLevel:5,
        unlockCost:3e46, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["awareness", 4e6], ["endurance", 1e5], ["navigation", 6000]],
        expAtts:[["coordination", 1], ["observation", 1]],
        efficiencyAtts:[["navigation", 1]]
    },
    dismantleShelves: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e52, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.005, maxLevel:5,
        unlockCost:1e47, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["coordination", 1.5e4], ["might", 1e4]],
        expAtts:[["endurance", 1]],
        efficiencyAtts:[["navigation", 1]]
    },
    comprehendDifficultTexts: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e53, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.005, maxLevel:5,
        unlockCost:1e48, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["concentration", 1e6], ["wizardry", 1e5]],
        expAtts:[["endurance", 1]],
        efficiencyAtts:[["navigation", 1]]
    },
    examineTheArchitecture: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:3e53, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.005, maxLevel:5,
        unlockCost:3e48, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["observation", 1e7], ["logistics", 40]],
        expAtts:[["concentration", 1]],
        efficiencyAtts:[["navigation", 1]]
    },

    pryGemLoose: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e50, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:1,
        unlockCost:1e50, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["legacy", 1e6]],
        expAtts:[],
        efficiencyAtts:[["might", .001]]
    },



    readBooks: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e37, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:1,
        unlockCost:5e32, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["intellect", 5]],
        expAtts:[["comfort", 1]],
        efficiencyAtts:[["curiosity", .1]]
    },
    catalogNewBooks: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:5e44, progressMaxIncrease:12,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:0,
        unlockCost:6e32, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            unveilAction('study')
            unveilAction('researchBySubject')
            if(data.actions.catalogNewBooks.level >= 2) {
                unveilAction('studyMagic')
            }
            if(data.actions.catalogNewBooks.level >= 3) {
                unveilAction('studySupportSpells')
            }
            if(data.actions.catalogNewBooks.level >= 4) {
                unveilAction('studyEarthMagic')
            }
            if(data.actions.catalogNewBooks.level >= 7) {
                unveilAction('studyPracticalMagic');
            }
            if(data.actions.catalogNewBooks.level >= 9) {
                unveilAction('studyMath');
            }
            if(data.actions.catalogNewBooks.level >= 11) {
                unveilAction('studyCryptology');
            }
            if(data.actions.catalogNewBooks.level >= 13) {
                unveilAction('studyAdvancedEarthMagic');
            }
            if(data.actions.catalogNewBooks.level >= 15) {
                unveilAction('studyArchitecture');
            }
            // if(data.actions.catalogNewBooks.level >= 17) {
            //     unveilAction('studyAdvancedPracticalMagic');
            // }
        },
        onLevelAtts:[["concentration", 4e4]],
        expAtts:[["curiosity", 1], ["observation", 1], ["comfort", 1], ["intellect", 1], ["logistics", 1]],
        efficiencyAtts:[["curiosity", .1]],
        iconText: {english:Raw.html`
        Level 1: Reveal Study<br>
        Level 1: Reveal Research By Subject<br>
        Level 2: Reveal Study Magic<br>
        Level 3: Reveal Study Support Spells<br>
        Level 4: Reveal Study Dirt Magic<br>
        Level 7: Reveal Study Practical Magic<br>
        Level 9: Reveal Study Math<br>
        Level 11: Reveal Study Cryptology<br>
        Level 13: Reveal Study Advanced Dirt Magic<br>
        Level 15: Reveal Study Architecture
`}
    },
    buildPersonalLibrary: {
        tier:1, plane:0, creationVersion:2, title: "Craft Spell Shack",
        progressMaxBase:3e37, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:0,
        unlockCost:3e38, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["integration", 300], ["spellcraft", 10], ["intellect", 3]],
        expAtts:[["logistics", 1]],
        efficiencyAtts:[["logistics", 1]]
    },
    expandPersonalLibrary: {
        tier:1, plane:0, creationVersion:2, title: "Craft Sturdy Practice Den",
        progressMaxBase:3e40, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:0,
        unlockCost:3e38, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["integration", 400], ["comfort", 20], ["intellect", 10]],
        expAtts:[["logistics", 1]],
        efficiencyAtts:[["logistics", 1]]
    },
    study: {
        tier:2, plane:0, creationVersion:2, 
        progressMaxBase:3e35, progressMaxIncrease:1.1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1,
        unlockCost:1e33, visible:false, unlocked:false, purchased: false, showToAdd:true,
        onUnlock: function() {
            data.actions.study.resourceToAdd = 1;
        },
        onLevelCustom: function() {
            let actionObj = data.actions.study;
            actionObj.resourceToAdd = Math.pow((1+actionObj.level/10), 3) * data.actions.study.upgradeMult;

            addResourceTo(data.actions.researchBySubject, actionObj.resourceToAdd);
        },
        updateUpgradeMult: function () {
            let upgradeMult = 1;
            upgradeMult *= Math.pow(1.25, data.upgrades.studyHarder.upgradePower);
            data.actions.study.upgradeMult = upgradeMult;
        },
        onLevelAtts:[],
        expAtts:[["integration", 1], ["intellect", 1], ["comfort", 1], ["logistics", 1], ["peace", 1]],
        efficiencyAtts:[],
        extraInfo: {english:Raw.html`When this action levels up, it generates (1 + level/10)^3 Research onto Resarch By Subject.`},
        iconText: {english:Raw.html`
        On Level: Generates Research based on level
`}
    },
    researchBySubject: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, 
        progressMaxBase:10, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:1,
        unlockCost:5, visible:false, unlocked:false, purchased: false, hasUpstream:false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["comfort", 5]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]]
    },
    studyMagic: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, 
        progressMaxBase:20, progressMaxIncrease:3,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:2,
        unlockCost:10, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["spark", 20], ["spellcraft", 3], ["intellect", 1]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]]
    },
    studySupportSpells: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, 
        progressMaxBase:200, progressMaxIncrease:3,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:3,
        unlockCost:200, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            purchaseAction('listenToTheMana');
            unveilAction('listenToTheMana');
            if(data.actions.studySupportSpells.level >= 2) {
                purchaseAction('manaVisualizations')
                unveilAction('manaVisualizations');
            }
            if(data.actions.studySupportSpells.level >= 3) {
                purchaseAction('auraControl')
                unveilAction('auraControl');
            }
        },
        onLevelAtts:[["spellcraft", 4]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]],
        iconText: {english:Raw.html`
        Level 1: Purchase Listen To The Mana Action<br>
        Level 1: Reveal Listen To The Mana<br>
        Level 2: Purchase Mana Visualizations<br>
        Level 2: Reveal Mana Visualizations<br>
        Level 3: Purchase Aura Control<br>
        Level 3: Reveal Aura Control<br>
        Listen to the Mana and Mana Visualizations can be revealed from Magic Actions, but Aura Control only is revealed from this action.
`}
    },
    studyEarthMagic: {
        tier:1, plane:0, resourceName:"research", creationVersion:2,  title:"Study Dirt Magic",
        progressMaxBase:2000, progressMaxIncrease:4,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:3,
        unlockCost:2000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            purchaseAction('moveEarth')
            unveilAction('moveEarth');
            if(data.actions.studyEarthMagic.level >= 2) {
                purchaseAction('hardenEarth')
                unveilAction('hardenEarth');
            }
            if(data.actions.studyEarthMagic.level >= 3) {
                purchaseAction('shapeEarth')
                unveilAction('shapeEarth');
            }
        },
        onLevelAtts:[["spellcraft", 6]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]],
        iconText: {english:Raw.html`
        Level 1: Purchase Move Dirt<br>
        Level 1: Reveal Move Dirt<br>
        Level 2: Purchase Harden Dirt<br>
        Level 2: Reveal Harden Dirt<br>
        Level 3: Purchase Shape Dirt<br>
        Level 3: Reveal Shape Dirt
`}
    },
    studyPracticalMagic: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, 
        progressMaxBase:11000, progressMaxIncrease:4,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:2,
        unlockCost:11000, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            purchaseAction('practicalMagic')
            unveilAction('practicalMagic');
            if(data.actions.studyPracticalMagic.level >= 2) {
                purchaseAction('illuminate')
                unveilAction('illuminate');
            }
        },
        onLevelAtts:[["spellcraft", 15]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]],
        iconText: {english:Raw.html`
        Level 1: Purchase Practical Magic<br>
        Level 1: Reveal Practical Magic<br>
        Level 2: Purchase Illuminate<br>
        Level 2: Reveal Illuminate<br>
`}
    },
    studyMath: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, 
        progressMaxBase:6e4, progressMaxIncrease:2,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.025, maxLevel:2,
        unlockCost:6e4, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            if(data.actions.studyMath.level >= 2) {
                unveilAction('recognizeRunicLanguages');
            }
        },
        onLevelAtts:[["logistics", 10]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]],
        iconText: {english:Raw.html`
        Level 2: Reveal Recognize Runic Languages
`}
    },
    studyCryptology: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, 
        progressMaxBase:1e5, progressMaxIncrease:1.5,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.025, maxLevel:0,
        unlockCost:1e5, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            if(data.actions.studyCryptology.level >= 1) {
                unveilAction('catalogUnknownLanguages');
            }
            if(data.actions.studyCryptology.level >= 3) {
                unveilAction('decipherOrganization');
            }
            if(data.actions.studyCryptology.level >= 5) {
                unveilAction('comprehendDifficultTexts');
            }
        },
        onLevelAtts:[["intellect", 10]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]],
        iconText: {english:Raw.html`
        Level 1: Reveal Catalog Unknown Languages<br>
        Level 3: Reveal Decipher Organization<br>
        Level 5: Reveal Comprehend Difficult Texts
`}
    },
    studyAdvancedEarthMagic: {
        tier:1, plane:0, resourceName:"research", creationVersion:2,  title:"Study Advanced Dirt Magic",
        progressMaxBase:1.5e5, progressMaxIncrease:3,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.025, maxLevel:3,
        unlockCost:1.5e5, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            purchaseAction('moveIron');
            unveilAction('moveIron');
            if(data.actions.studyAdvancedEarthMagic.level >= 2) {
                purchaseAction('reinforceArmor')
                unveilAction('reinforceArmor');
            }
            if(data.actions.studyAdvancedEarthMagic.level >= 3) {
                purchaseAction('restoreEquipment')
                unveilAction('restoreEquipment');
            }
        },
        onLevelAtts:[["spellcraft", 20]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]],
        iconText: {english:Raw.html`
        Level 1: Purchase Move Iron<br>
        Level 1: Reveal Move Iron<br>
        Level 2: Purchase Reinforce Armor<br>
        Level 2: Reveal Reinforce Armor<br>
        Level 3: Purchase Restore Equipment<br>
        Level 3: Reveal Restore Equipment<br>
`}
    },
    studyArchitecture: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, 
        progressMaxBase:2e5, progressMaxIncrease:1.5,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.025, maxLevel:5,
        unlockCost:2e5, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            addMaxLevel("expandPersonalLibrary", 1);
            if(data.actions.studyArchitecture.level >= 1) {
                unveilAction('expandPersonalLibrary');
            }
            if(data.actions.studyArchitecture.level >= 2) {
                unveilAction('markTheLayout');
            }
            if(data.actions.studyArchitecture.level >= 3) {
                unveilAction('dismantleShelves');
            }
            if(data.actions.studyArchitecture.level >= 4) {
                unveilAction('examineTheArchitecture');
            }
            if(data.actions.studyArchitecture.level >= 5) {
                unveilAction('pryGemLoose');
            }
        },
        onLevelAtts:[["logistics", 20]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]],
        iconText: {english:Raw.html`
        On Level: +1 max level for Craft Sturdy Practice Den<br>
        Level 1: Reveal Craft Sturdy Practice Den<br>
        Level 2: Reveal Mark The Layout<br>
        Level 3: Reveal Dismantle Shelves<br>
        Level 4: Reveal Examine The Architecture<br>
        Level 5: Reveal Pry Gem Loose
`}
    },
    studyAdvancedPracticalMagic: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, 
        progressMaxBase:5e5, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:3,
        unlockCost:5e5, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]]
    },
    studyHistory: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, 
        progressMaxBase:2e4, progressMaxIncrease:1.5,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:2,
        unlockCost:2e4, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            if(data.actions.studyHistory.level >= 2) {
                unveilAction("reviewOldMemories")
            }
        },
        onLevelAtts:[["navigation", 4000], ["integration", 300]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]],
        iconText: {english:Raw.html`
        Level 2: Reveal Review Old Memories
`}
    },
    readOldStories: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, 
        progressMaxBase:2.5e4, progressMaxIncrease:1.5,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:2,
        unlockCost:2.5e4, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            if(data.actions.readOldStories.level >= 2) {
                unveilAction("rememberFriends")
            }
        },
        onLevelAtts:[["vision", 4000]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]],
        iconText: {english:Raw.html`
        Level 2: Reveal Remember Friends
`}
    },
    readWarJournals: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, 
        progressMaxBase:3e4, progressMaxIncrease:1.5,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:2,
        unlockCost:3e4, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            if(data.actions.readWarJournals.level >= 2) {
                unveilAction("rememberTheWar")
            }
        },
        onLevelAtts:[["valor", 25]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]],
        iconText: {english:Raw.html`
        Level 2: Reveal Remember The War
`}
    },
    readOldReligiousTexts: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, 
        progressMaxBase:4e4, progressMaxIncrease:1.5,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.03, maxLevel:2,
        unlockCost:4e4, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            if(data.actions.readOldReligiousTexts.level >= 2) {
                unveilAction("honorTheLost")
            }
        },
        onLevelAtts:[["curiosity", 1e6]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]],
        iconText: {english:Raw.html`
        Level 2: Reveal Honor The Lost
`}
    },
    readOldProphecies: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, 
        progressMaxBase:6e4, progressMaxIncrease:2,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.03, maxLevel:2,
        unlockCost:6e4, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["legacy", 20000]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]]
    },
    readOldPoetry: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, 
        progressMaxBase:5e4, progressMaxIncrease:1.5,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.03, maxLevel:3,
        unlockCost:5e4, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["pulse", 500], ["intellect", 10]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]]
    },
    readOldPhilosophy: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, 
        progressMaxBase:1e5, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.03, maxLevel:1,
        unlockCost:1e5, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
            purchaseAction('overponder')
            unveilAction('overponder')
            unveilAction('letGoOfGuilt')
        },
        onLevelAtts:[["intellect", 30], ["peace", 10]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]],
        iconText: {english:Raw.html`
        Level 1: Purchase Overponder<br>
        Level 1: Reveal Overponder<br>
        Level 1: Reveal Let Go Of Guilt
`}
    },
    reviewOldMemories: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e38, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:2,
        efficiencyBase:.0001, maxLevel:5,
        unlockCost:2e37, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["awareness", 1e5], ["flow", 500], ["cycle", 3000]],
        expAtts:[["valor", 1]],
        efficiencyAtts:[["cycle", 1]]
    },
    rememberFriends: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e41, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:5,
        unlockCost:5e37, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["awareness", 2e5], ["integration", 300], ["peace", 1]],
        expAtts:[["cycle", 1], ["valor", 1]],
        efficiencyAtts:[["cycle", 1]]
    },
    rememberTheWar: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e42, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:5,
        unlockCost:3e38, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["awareness", 4e5], ["flow", 800], ["valor", 20]],
        expAtts:[["cycle", 1], ["peace", 10]],
        efficiencyAtts:[["cycle", 1]]
    },
    honorTheLost: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e42, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.00005, maxLevel:5,
        unlockCost:1e41, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["awareness", 1e6], ["flow", 3000], ["peace", 2]],
        expAtts:[["peace", 10]],
        efficiencyAtts:[["cycle", 1]]
    },
    letGoOfGuilt: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e49, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.00005, maxLevel:5,
        unlockCost:1e43, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
        },
        onLevelCustom: function() {
        },
        onLevelAtts:[["awareness", 5e6], ["valor", 50], ["peace", 5]],
        expAtts:[["flow", 1]],
        efficiencyAtts:[["cycle", 1]]
    },
}

//==== plane3 ====
actionData = {
    ...actionData,

    absorbStarseed: {
        tier:1, plane:3, creationVersion:2, 
        progressMaxBase:60, progressMaxIncrease:1,
        expToLevelBase:60, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true,
        unlockCost:0, visible:true, unlocked:true, isGenerator:true, generatorSpeed:1,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
}
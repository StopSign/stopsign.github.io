


//After Hermit
actionData = {
    ...actionData,

    meditate: {
        tier:1, plane:0,
        progressMaxBase:1e30, progressMaxIncrease:40,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:1,
        unlockCost:1e22, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["awareness", 3000], ["cycle", 10]],
        expAtts:[["curiosity", 1], ["flow", 1], ["concentration", 1], ["discernment", 1]],
        efficiencyAtts:[["integration", 10]],
        actionTriggers: [
            ["level_10", "reveal", "standStraighter"]
        ]
    },
    journal: {
        tier:1, plane:0,
        progressMaxBase:1e30, progressMaxIncrease:40,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:4,
        unlockCost:1e22, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["curiosity", 5000], ["awareness", 3000]],
        expAtts:[["energy", 1], ["observation", 1]],
        efficiencyAtts:[["cycle", 2]],
        actionTriggers: [
            ["level", "addMaxLevels", "meditate", 1]
        ]
    },
    processEmotions: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e30, progressMaxIncrease:3,
        expToLevelBase:1, expToLevelIncrease:2,
        efficiencyBase:.01, maxLevel:0,
        unlockCost:1e29, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["concentration", 10000]],
        expAtts:[["valor", 1]],
        efficiencyAtts:[["cycle", .5]],
        actionTriggers: [
            ["level_1", "reveal", "readTheWritten"],
            ["level_1", "reveal", "siftExcess"],
            ["level", "addMaxLevels", "readTheWritten", 1],
            ["level", "addMaxLevels", "siftExcess", 1]
        ]
    },
    readTheWritten: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:2e40, progressMaxIncrease:6,
        expToLevelBase:1, expToLevelIncrease:2,
        efficiencyBase:.01, maxLevel:0,
        unlockCost:2e29, visible:false, unlocked:false, purchased: false,
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
        onLevelAtts:[["curiosity", 30000]],
        expAtts:[["observation", 1], ["concentration", 1]],
        efficiencyAtts:[["navigation", 1]],
        actionTriggers: [
            ["unlock", "reveal", "leaveTheOpenRoad"],
            ["unlock", "addMaxLevels", "journal", 1]
        ]
    },
    leaveTheOpenRoad: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e34, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:3,
        unlockCost:1e27, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["observation", 200000], ["endurance", 20000]],
        expAtts:[["might", 1], ["endurance", 1]],
        efficiencyAtts:[["navigation", 1]],
        actionTriggers: [
            ["unlock", "reveal", "findOverlook"],
            ["unlock", "addMaxLevels", "journal", 1]
        ]
    },
    findOverlook: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e31, progressMaxIncrease:1000,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.02, maxLevel:1,
        unlockCost:5e27, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["concentration", 5000], ["vision", 300], ["navigation", 300]],
        expAtts:[["might", 1]],
        efficiencyAtts:[["geared", .001]],
        actionTriggers: [
            ["unlock", "reveal", "discoverBurntTown"],
            ["unlock", "addMaxLevels", "journal", 1]
        ]
    },
    discoverBurntTown: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:5e32, progressMaxIncrease:4,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.03, maxLevel:10,
        unlockCost:2e29, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["valor", 1]],
        expAtts:[["endurance", 1]],
        efficiencyAtts:[["geared", .001]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "journal", 1],
            ["level_1", "reveal", "stepThroughAsh"],
            ["level_2", "reveal", "resonanceCompass"],
            ["level_3", "reveal", "feelTheDespair"],
            ["level_4", "reveal", "repairShatteredShrine"],
        ]
    },
    feelTheDespair: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:2e29, progressMaxIncrease:3,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1, maxLevel:2,
        unlockCost:2e29, visible:false, unlocked:false, purchased: false,
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
        onLevelAtts:[["valor", 3]],
        expAtts:[["valor", 10]],
        efficiencyAtts:[["awareness", .001], ["flow", .1]],
        actionTriggers: [
            ["level_1", "reveal", "processEmotions"],
            ["level_3", "reveal", "graspTheTragedy"],
            ["level", "addMaxLevels", "processEmotions", 1]
        ]

    },
    graspTheTragedy: {
        tier:2, plane:0, creationVersion:2, 
        progressMaxBase:3e31, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:2,
        unlockCost:3e30, visible:false, unlocked:false, purchased: false,
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
        onLevelAtts:[["curiosity", 7e4]],
        expAtts:[["legacy", .001]],
        efficiencyAtts:[["curiosity", .01]],
        actionTriggers: [
            ["level_1", "reveal", "clearIvyWall"]
        ]
    },
    clearIvyWall: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:3e35, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:5,
        unlockCost:5e29, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["coordination", 2000]],
        expAtts:[["might", 1], ["endurance", 1]],
        efficiencyAtts:[["curiosity", .0005]],
        actionTriggers: [
            ["level_1", "reveal", "findPulsingShard"],
            ["level_3", "reveal", "scavengeForSupplies"]
        ]
    },
    findPulsingShard: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e36, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:1,
        unlockCost:5e30, visible:false, unlocked:false, purchased: false,
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
        onLevelAtts:[["observation", 3e5], ["might", 5000]],
        expAtts:[["coordination", 1], ["endurance", 1]],
        efficiencyAtts:[["curiosity", .001]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "stepThroughAsh", 1],
            ["level_1", "reveal", "skimAHeavyTome"]
        ]
    },
    skimAHeavyTome: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:8e41, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:5,
        unlockCost:2e31, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["discernment", 100]],
        expAtts:[["concentration", 1], ["flow", 1], ["endurance", 1]],
        efficiencyAtts:[["curiosity", .01]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "stepThroughAsh", 1],
            ["unlock", "addMaxLevels", "meditate", 1],
            ["level_1", "reveal", "clearRubble"]
        ]
    },
    clearRubble: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:2e38, progressMaxIncrease:5,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.002, maxLevel:10,
        unlockCost:3e31, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["endurance", 3e4], ["coordination", 4000]],
        expAtts:[["might", 1], ["discernment", 1]],
        efficiencyAtts:[["navigation", 1]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "stepThroughAsh", 1],
            ["level_1", "reveal", "readFadedMarkers"]
        ]
    },
    readFadedMarkers: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e37, progressMaxIncrease:6,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.002, maxLevel:5,
        unlockCost:6e31, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["concentration", 3e4], ["navigation", 200]],
        expAtts:[["observation", 1]],
        efficiencyAtts:[["navigation", 1]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "stepThroughAsh", 1],
            ["level_1", "reveal", "mapOutTraps"]
        ]
    },
    mapOutTraps: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:2e33, progressMaxIncrease:1.2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.002, maxLevel:10,
        unlockCost:1e32, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["observation", 2e5], ["flow", 100]],
        expAtts:[["discernment", 1]],
        efficiencyAtts:[["navigation", 1]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "stepThroughAsh", 1],
            ["level_1", "reveal", "accessForbiddenArea"]
        ]
    },
    accessForbiddenArea: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:2e36, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.002, maxLevel:1,
        unlockCost:2e32, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["awareness", 5e4]],
        expAtts:[["coordination", 1]],
        efficiencyAtts:[["navigation", 1]],
        actionTriggers: [
            ["level_1", "reveal", "collectSpellBooks"]
        ]
    },
    collectSpellBooks: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e32, progressMaxIncrease:5,
        expToLevelBase:1, expToLevelIncrease:2,
        efficiencyBase:.002, maxLevel:4,
        unlockCost:3e32, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["wizardry", 5000], ["spellcraft", 1]],
        expAtts:[],
        efficiencyAtts:[["navigation", 1]],
        actionTriggers: [
            ["level", "addMaxLevels", "catalogNewBooks", 1],
            ["level_1", "reveal", "findAFamiliarLanguage"],
            ["level_1", "reveal", "readBooks"],
            ["level_1", "reveal", "catalogNewBooks"]
        ]
    },
    findAFamiliarLanguage: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e46, progressMaxIncrease:100,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.02, maxLevel:5,
        unlockCost:1e35, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["observation", 1e6]],
        expAtts:[["awareness", 1], ["adaptability", 1], ["curiosity", 1]],
        efficiencyAtts:[["navigation", .01]],
        actionTriggers: [
            ["level_1", "reveal", "searchForRelevantBooks"],
        ]
    },
    searchForRelevantBooks: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e44, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.02, maxLevel:5,
        unlockCost:3e35, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["curiosity", 3e5]],
        expAtts:[["observation", 1], ["discernment", 1], ["logistics", 1]],
        efficiencyAtts:[["navigation", .01]],
        actionTriggers: [
            ["level_1", "reveal", "collectInterestingBooks"]
        ]
    },
    collectInterestingBooks: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e42, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.02, maxLevel:3,
        unlockCost:1e36, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["intellect", 1]],
        expAtts:[["discernment", 1], ["curiosity", 1], ["logistics", 1]],
        efficiencyAtts:[["navigation", .01]],
        actionTriggers: [
            ["level_1", "reveal", "collectHistoryBooks"]
        ]
    },
    collectHistoryBooks: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e42, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:3,
        unlockCost:1e37, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["intellect", 2]],
        expAtts:[["curiosity", 1], ["logistics", 1]],
        efficiencyAtts:[["logistics", 1]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "catalogNewBooks", 3],
            ["level_1", "reveal", "studyHistory"],
            ["level_2", "reveal", "readOldStories"],
            ["level_3", "reveal", "readWarJournals"],
            ["level_4", "reveal", "readOldReligiousTexts"],
            ["level_5", "reveal", "collectMathBooks"],
            ["level_5", "reveal", "readOldPoetry"],
            ["level_6", "reveal", "readOldProphecies"],
            ["level_6", "reveal", "browseFantasyNovels"],
            ["level_7", "reveal", "readOldPhilosophy"],
            ["level_7", "reveal", "complainAboutDifficulty"]
        ]
    },
    browseFantasyNovels: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:2e46, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:5,
        unlockCost:2e41, visible:false, unlocked:false, purchased: false,
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
        onLevelAtts:[["cycle", 5000], ["intellect", 5]],
        expAtts:[["curiosity", 1], ["logistics", 1]],
        efficiencyAtts:[["logistics", 1]],
        actionTriggers: [
            ["level_4", "reveal", "clearTheDust"],
            ["level", "addMaxLevels", "catalogNewBooks", 2],
            ["level", "addMaxLevels", "studyCryptology", 1]
        ]
    },
    clearTheDust: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e50, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.005, maxLevel:10,
        unlockCost:1e46, visible:false, unlocked:false, purchased: false,
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
        onLevelAtts:[["concentration", 4e4]],
        expAtts:[["curiosity", 1], ["observation", 1], ["comfort", 1], ["intellect", 1], ["logistics", 1]],
        efficiencyAtts:[["curiosity", .1]],
        actionTriggers: [
            ["level_1", "reveal", "study"],
            ["level_1", "reveal", "researchBySubject"],
            ["level_2", "reveal", "studyMagic"],
            ["level_3", "reveal", "studySupportSpells"],
            ["level_4", "reveal", "studyEarthMagic"],
            ["level_7", "reveal", "studyPracticalMagic"],
            ["level_9", "reveal", "studyMath"],
            ["level_11", "reveal", "studyCryptology"],
            ["level_13", "reveal", "studyAdvancedEarthMagic"],
            ["level_15", "reveal", "studyArchitecture"],
            // ["level_17", "reveal", "studyAdvancedPracticalMagic"]
        ]
    },
    buildPersonalLibrary: {
        tier:1, plane:0, creationVersion:2, title: "Craft Spell Shack",
        progressMaxBase:3e37, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:0,
        unlockCost:3e38, visible:false, unlocked:false, purchased: false,
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
        onLevelAtts:[["integration", 400], ["comfort", 20], ["intellect", 10]],
        expAtts:[["logistics", 1]],
        efficiencyAtts:[["logistics", 1]]
    },
    study: {
        tier:2, plane:0, creationVersion:2, 
        progressMaxBase:3e35, progressMaxIncrease:1.1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:1,
        unlockCost:1e33, visible:false, unlocked:false, purchased: false, showToAdd:true, ignoreMaxLevelAutomation:true,
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
        actionTriggers: [
            ["info", "text", "On Level: Generates Research (more in info)"],
        ]
    },
    researchBySubject: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, 
        progressMaxBase:10, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:1,
        unlockCost:5, visible:false, unlocked:false, purchased: false, hasUpstream:false, keepParentAutomation:true,
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
        onLevelAtts:[["spellcraft", 4]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]],
        actionTriggers: [
            ["level_1", "purchase", "listenToTheMana"],
            ["level_1", "reveal", "listenToTheMana"],
            ["level_2", "purchase", "manaVisualizations"],
            ["level_2", "reveal", "manaVisualizations"],
            ["level_3", "purchase", "auraControl"],
            ["level_3", "reveal", "auraControl"]
        ]
    },
    studyEarthMagic: {
        tier:1, plane:0, resourceName:"research", creationVersion:2,  title:"Study Dirt Magic",
        progressMaxBase:2000, progressMaxIncrease:4,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:3,
        unlockCost:2000, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["spellcraft", 6]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]],
        actionTriggers: [
            ["level_1", "purchase", "moveEarth"],
            ["level_1", "reveal", "moveEarth"],
            ["level_2", "purchase", "hardenEarth"],
            ["level_2", "reveal", "hardenEarth"],
            ["level_3", "purchase", "shapeEarth"],
            ["level_3", "reveal", "shapeEarth"]
        ]
    },
    studyPracticalMagic: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, 
        progressMaxBase:11000, progressMaxIncrease:4,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:2,
        unlockCost:11000, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["spellcraft", 15]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]],
        actionTriggers: [
            ["level_1", "purchase", "practicalMagic"],
            ["level_1", "reveal", "practicalMagic"],
            ["level_2", "purchase", "illuminate"],
            ["level_2", "reveal", "illuminate"]
        ]
    },
    studyMath: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, 
        progressMaxBase:6e4, progressMaxIncrease:2,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.025, maxLevel:2,
        unlockCost:6e4, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["logistics", 10]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]],
        actionTriggers: [
            ["level_2", "reveal", "recognizeRunicLanguages"]
        ]
    },
    studyCryptology: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, 
        progressMaxBase:1e5, progressMaxIncrease:1.5,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.025, maxLevel:0,
        unlockCost:1e5, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["intellect", 10]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]],
        actionTriggers: [
            ["level_1", "reveal", "catalogUnknownLanguages"],
            ["level_3", "reveal", "decipherOrganization"],
            ["level_5", "reveal", "comprehendDifficultTexts"]
        ]
    },
    studyAdvancedEarthMagic: {
        tier:1, plane:0, resourceName:"research", creationVersion:2,  title:"Study Advanced Dirt Magic",
        progressMaxBase:1.5e5, progressMaxIncrease:3,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.025, maxLevel:3,
        unlockCost:1.5e5, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["spellcraft", 20]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]],
        actionTriggers: [
            ["level_1", "purchase", "moveIron"],
            ["level_1", "reveal", "moveIron"],
            ["level_2", "purchase", "reinforceArmor"],
            ["level_2", "reveal", "reinforceArmor"],
            ["level_3", "purchase", "restoreEquipment"],
            ["level_3", "reveal", "restoreEquipment"]
        ]
    },
    studyArchitecture: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, 
        progressMaxBase:2e5, progressMaxIncrease:1.5,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.025, maxLevel:5,
        unlockCost:2e5, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["logistics", 20]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]],
        actionTriggers: [
            ["level_1", "reveal", "expandPersonalLibrary"],
            ["level_2", "reveal", "markTheLayout"],
            ["level_3", "reveal", "dismantleShelves"],
            ["level_4", "reveal", "examineTheArchitecture"],
            ["level_5", "reveal", "pryGemLoose"],
            ["level", "addMaxLevels", "expandPersonalLibrary", 1],
        ]
    },
    studyAdvancedPracticalMagic: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, 
        progressMaxBase:5e5, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:3,
        unlockCost:5e5, visible:false, unlocked:false, purchased: false,
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
        onLevelAtts:[["navigation", 4000], ["integration", 300]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]],
        actionTriggers: [
            ["level_2", "reveal", "reviewOldMemories"]
        ]
    },
    readOldStories: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, 
        progressMaxBase:2.5e4, progressMaxIncrease:1.5,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:2,
        unlockCost:2.5e4, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["vision", 4000]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]],
        actionTriggers: [
            ["level_2", "reveal", "rememberFriends"]
        ]
    },
    readWarJournals: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, 
        progressMaxBase:3e4, progressMaxIncrease:1.5,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:2,
        unlockCost:3e4, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["valor", 25]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]],
        actionTriggers: [
            ["level_2", "reveal", "rememberTheWar"]
        ]
    },
    readOldReligiousTexts: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, 
        progressMaxBase:4e4, progressMaxIncrease:1.5,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.03, maxLevel:2,
        unlockCost:4e4, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["curiosity", 1e6]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]],
        actionTriggers: [
            ["level_2", "reveal", "honorTheLost"]
        ]
    },
    readOldProphecies: {
        tier:1, plane:0, resourceName:"research", creationVersion:2, 
        progressMaxBase:6e4, progressMaxIncrease:2,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.03, maxLevel:2,
        unlockCost:6e4, visible:false, unlocked:false, purchased: false,
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
        onLevelAtts:[["intellect", 30], ["peace", 10]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]],
        actionTriggers: [
            ["level_1", "purchase", "overponder"],
            ["level_1", "reveal", "overponder"],
            ["level_1", "reveal", "letGoOfGuilt"]
        ]
    },
    reviewOldMemories: {
        tier:1, plane:0, creationVersion:2, 
        progressMaxBase:1e38, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:2,
        efficiencyBase:.0001, maxLevel:5,
        unlockCost:2e37, visible:false, unlocked:false, purchased: false,
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
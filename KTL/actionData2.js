


//After Hermit
actionData = {
    ...actionData,

    meditate: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:3e34, progressMaxIncrease:100,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:1,
        unlockCost:2e26, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["awareness", 20]],
        expAtts:[["observation", 1]],
        efficiencyAtts:[["resonance", 70]],
        actionTriggers: [
            ["level_10", "reveal", "standStraighter"]
        ]
    },
    journal: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:5e30, progressMaxIncrease:80,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:4,
        unlockCost:5e25, visible:false, unlocked:false, purchased: true,
        onLevelAtts:[["observation", 20], ["concentration", 10]],
        expAtts:[["awareness", 1]],
        efficiencyAtts:[["energy", 900]],
        actionTriggers: [
            ["level", "addMaxLevels", "meditate", 1]
        ]
    },
    feelAGentleTug: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:5e46, progressMaxIncrease:20,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:10,
        unlockCost:5e31, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["integration", 10]],
        expAtts:[["observation", 1], ["concentration", 1]],
        efficiencyAtts:[["navigation", 700]],
        actionTriggers: [
            ["unlock", "reveal", "leaveTheOpenRoad"],
            ["unlock", "addMaxLevels", "journal", 1]
        ]
    },
    leaveTheOpenRoad: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:6e44, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:5,
        unlockCost:1e32, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["observation", 10], ["endurance", 10]],
        expAtts:[["might", 1], ["endurance", 1]],
        efficiencyAtts:[["navigation", 750]],
        actionTriggers: [
            ["unlock", "reveal", "climbATallTree"],
            ["unlock", "addMaxLevels", "journal", 1]
        ]
    },
    climbATallTree: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:3e38, progressMaxIncrease:20000,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:1,
        unlockCost:5e32, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["concentration", 20], ["pulse", 20], ["navigation", 100]],
        expAtts:[["might", 1], ["vision", 1]],
        efficiencyAtts:[["energy", 1000]],
        actionTriggers: [
            ["unlock", "reveal", "clearTheWreckage"],
            ["level", "addMaxLevels", "journal", 2],
            ["level", "addMaxLevels", "stepThroughAsh", 1]
        ]
    },
    clearTheWreckage: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:4e48, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:5,
        unlockCost:2e35, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["might", 20]],
        expAtts:[["endurance", 1], ["might", 1]],
        efficiencyAtts:[["navigation", 850]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "climbATallTree", 1],
            ["level_1", "reveal", "discoverBurntTown"],
        ]
    },
    discoverBurntTown: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:3e58, progressMaxIncrease:15,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:10,
        unlockCost:1e36, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["observation", 10]],
        expAtts:[["endurance", 1], ["observation", 1], ["valor", 1]],
        efficiencyAtts:[["navigation", 1000]],
        actionTriggers: [
            ["level_2", "reveal", "feelTheDespair"],
            ["level_6", "reveal", "stepThroughAsh"],
        ]
    },
    feelTheDespair: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:3e40, progressMaxIncrease:100,
        expToLevelBase:1, expToLevelIncrease:10,
        efficiencyBase:.1, maxLevel:2,
        unlockCost:3e38, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["legacy", 1500], ["awareness", 10]],
        expAtts:[["resonance", 1], ["valor", 1]],
        efficiencyAtts:[["valor", 60]]
    },
    stepThroughAsh: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:4e61, progressMaxIncrease:1000,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:1,
        unlockCost:2e41, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["valor", 20]],
        expAtts:[["awareness", 1], ["endurance", 1]],
        efficiencyAtts:[["resonance", 150]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "climbATallTree", 2],
            ["level_1", "reveal", "processEmotions"],
            ["level_2", "reveal", "graspTheTragedy"],
            ["level_6", "reveal", "repairShatteredShrine"],
            ["level_6", "reveal", "resonanceCompass"],
            ["level", "addMaxLevels", "processEmotions", 1]
        ]
    },
    processEmotions: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:2e61, progressMaxIncrease:120,
        expToLevelBase:6, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:0,
        unlockCost:2e46, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["awareness", 20]],
        expAtts:[["observation", 1], ["valor", 1]],
        efficiencyAtts:[["energy", 1400]],
        actionTriggers: [
            ["level_2", "reveal", "readTheWritten"],
            ["level_4", "reveal", "siftExcess"],
            ["level", "addMaxLevels", "readTheWritten", 1],
            ["level", "addMaxLevels", "siftExcess", 1]
        ]
    },
    readTheWritten: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:1e66, progressMaxIncrease:120,
        expToLevelBase:6, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:0,
        unlockCost:2e49, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["observation", 20], ["integration", 10]],
        expAtts:[["awareness", 1], ["concentration", 1]],
        efficiencyAtts:[["energy", 1500]]
    },
    siftExcess: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:4e72, progressMaxIncrease:120,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:0,
        unlockCost:2e52, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["concentration", 20]],
        expAtts:[["observation", 1], ["valor", 1]],
        efficiencyAtts:[["energy", 1600]]
    },
    graspTheTragedy: {
        tier:2, plane:0, creationVersion: 6,
        progressMaxBase:2e48, progressMaxIncrease:1000,
        expToLevelBase:1, expToLevelIncrease:2,
        efficiencyBase:.001, maxLevel:2,
        unlockCost:2e46, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["integration", 20], ["valor", 20]],
        expAtts:[["valor", 1]],
        efficiencyAtts:[["valor", 150]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "climbATallTree", 1],
        ]
    },
    repairShatteredShrine: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:1e66, progressMaxIncrease:1e4,
        expToLevelBase:1, expToLevelIncrease:10,
        efficiencyBase:.001, maxLevel:2,
        unlockCost:2e53, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["legacy", 30000], ["integration", 10]],
        expAtts:[["integration", 1], ["resonance", 1], ["valor", 1]],
        efficiencyAtts:[["valor", 300]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "graspTheTragedy", 1],
            ["level", "addMaxLevels", "graspTheTragedy", 1]
        ]
    },
    resonanceCompass: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:3e67, progressMaxIncrease:20,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.00001, maxLevel:5,
        unlockCost:1e54, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["resonance", 6]],
        expAtts:[["resonance", 1], ["navigation", 1]],
        efficiencyAtts:[["navigation", 1300], ["pulse", 950]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "stepThroughAsh", 1],
            ["unlock", "reveal", "clearIvyWall"],
            ["unlock", "reveal", "scavengeForSupplies"]
        ]
    },
    clearIvyWall: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:3e66, progressMaxIncrease:15,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.00001, maxLevel:5,
        unlockCost:3e55, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["endurance", 10], ["concentration", 10]],
        expAtts:[["might", 1]],
        efficiencyAtts:[["navigation", 1300]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "stepThroughAsh", 1],
        ]
    },
    scavengeForSupplies: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:1e90, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:5,
        unlockCost:1e57, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["navigation", 20], ["might", 10]],
        expAtts:[["observation", 1], ["endurance", 1]],
        efficiencyAtts:[["navigation", 1300]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "stepThroughAsh", 1],
            ["level_1", "reveal", "skimAHeavyTome"],
            ["level_5", "reveal", "pullPulsingShard"],
        ]
    },
    pullPulsingShard: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:1e62, progressMaxIncrease:100,
        expToLevelBase:1, expToLevelIncrease:10,
        efficiencyBase:.000001, maxLevel:2,
        unlockCost:3e62, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["legacy", 1.5e5], ["pulse", 50]],
        expAtts:[["might", 1], ["resonance", 1]],
        efficiencyAtts:[["observation", 1500]]
    },
    skimAHeavyTome: {
        tier:1, plane:0, creationVersion: 6, 
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
        tier:1, plane:0, creationVersion: 6, 
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
        tier:1, plane:0, creationVersion: 6, 
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
        tier:1, plane:0, creationVersion: 6, 
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
        tier:1, plane:0, creationVersion: 6, 
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
        tier:1, plane:0, creationVersion: 6, 
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
        tier:1, plane:0, creationVersion: 6, 
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
        tier:1, plane:0, creationVersion: 6, 
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
        tier:1, plane:0, creationVersion: 6, 
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
        tier:1, plane:0, creationVersion: 6, 
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
        tier:1, plane:0, creationVersion: 6, 
        progressMaxBase:2e46, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:5,
        unlockCost:2e41, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["curiosity", 1e6], ["charm", 5e4], ["valor", 40]],
        expAtts:[["observation", 1]],
        efficiencyAtts:[["navigation", .01]]
    },
    recognizeRunicLanguages: {
        tier:1, plane:0, creationVersion: 6, 
        progressMaxBase:4e41, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:5,
        unlockCost:4e41, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["observation", 5e6], ["pulse", 750]],
        expAtts:[["spellcraft", 1]],
        efficiencyAtts:[["navigation", .01]]
    },
    catalogUnknownLanguages: {
        tier:1, plane:0, creationVersion: 6, 
        progressMaxBase:1e49, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:4,
        unlockCost:1e44, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["concentration", 3e5], ["discernment", 300]],
        expAtts:[["curiosity", 1]],
        efficiencyAtts:[["navigation", .01]]
    },
    complainAboutDifficulty: {
        tier:1, plane:0, creationVersion: 6, 
        progressMaxBase:1e48, progressMaxIncrease:100,
        expToLevelBase:100, expToLevelIncrease:1,
        efficiencyBase:.005, maxLevel:3,
        unlockCost:1e44, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["amplification", 5e5], ["legacy", 1e5]],
        expAtts:[["curiosity", 1]],
        efficiencyAtts:[["navigation", .01]]
    },
    decipherOrganization: {
        tier:1, plane:0, creationVersion: 6, 
        progressMaxBase:3e50, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:4,
        unlockCost:3e44, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["navigation", 3000], ["logistics", 20]],
        expAtts:[["observation", 1]],
        efficiencyAtts:[["navigation", .01]]
    },
    collectMathBooks: {
        tier:1, plane:0, creationVersion: 6, 
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
        tier:1, plane:0, creationVersion: 6, 
        progressMaxBase:1e50, progressMaxIncrease:2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.005, maxLevel:10,
        unlockCost:1e46, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["coordination", 10], ["vision", 10]],
        expAtts:[["endurance", 1]],
        efficiencyAtts:[["navigation", 1]]
    },
    markTheLayout: {
        tier:1, plane:0, creationVersion: 6, 
        progressMaxBase:3e52, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.005, maxLevel:5,
        unlockCost:3e46, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["awareness", 4e6], ["endurance", 1e5], ["navigation", 6000]],
        expAtts:[["coordination", 1], ["observation", 1]],
        efficiencyAtts:[["navigation", 1]]
    },
    dismantleShelves: {
        tier:1, plane:0, creationVersion: 6, 
        progressMaxBase:1e52, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.005, maxLevel:5,
        unlockCost:1e47, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["coordination", 1.5e4], ["might", 1e4]],
        expAtts:[["endurance", 1]],
        efficiencyAtts:[["navigation", 1]]
    },
    comprehendDifficultTexts: {
        tier:1, plane:0, creationVersion: 6, 
        progressMaxBase:1e53, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.005, maxLevel:5,
        unlockCost:1e48, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["concentration", 1e6], ["wizardry", 1e5]],
        expAtts:[["endurance", 1]],
        efficiencyAtts:[["navigation", 1]]
    },
    examineTheArchitecture: {
        tier:1, plane:0, creationVersion: 6, 
        progressMaxBase:3e53, progressMaxIncrease:4,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.005, maxLevel:5,
        unlockCost:3e48, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["observation", 1e7], ["logistics", 40]],
        expAtts:[["concentration", 1]],
        efficiencyAtts:[["navigation", 1]]
    },
    pryGemLoose: {
        tier:1, plane:0, creationVersion: 6, 
        progressMaxBase:1e50, progressMaxIncrease:1,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:1,
        unlockCost:1e50, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["legacy", 1e6]],
        expAtts:[],
        efficiencyAtts:[["might", .001]]
    },
    readBooks: {
        tier:1, plane:0, creationVersion: 6, 
        progressMaxBase:1e37, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:1,
        unlockCost:5e32, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["intellect", 5]],
        expAtts:[["comfort", 1]],
        efficiencyAtts:[["curiosity", .1]]
    },
    catalogNewBooks: {
        tier:1, plane:0, creationVersion: 6, 
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
        tier:1, plane:0, creationVersion: 6, title: "Craft Spell Shack",
        progressMaxBase:3e37, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:0,
        unlockCost:3e38, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["integration", 300], ["spellcraft", 10], ["intellect", 3]],
        expAtts:[["logistics", 1]],
        efficiencyAtts:[["logistics", 1]]
    },
    expandPersonalLibrary: {
        tier:1, plane:0, creationVersion: 6, title: "Craft Sturdy Practice Den",
        progressMaxBase:3e40, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.001, maxLevel:0,
        unlockCost:3e38, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["integration", 400], ["comfort", 20], ["intellect", 10]],
        expAtts:[["logistics", 1]],
        efficiencyAtts:[["logistics", 1]]
    },
    study: {
        tier:2, plane:0, creationVersion: 6, 
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
        actionTriggers: [
            ["info", "text", "On Level: Generates Research (more in info)"],
        ]
    },
    researchBySubject: {
        tier:1, plane:0, resourceName:"research", creationVersion: 6, 
        progressMaxBase:10, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:1,
        unlockCost:5, visible:false, unlocked:false, purchased: false, hasUpstream:false, keepParentAutomation:true,
        onLevelAtts:[["comfort", 5]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]]
    },
    studyMagic: {
        tier:1, plane:0, resourceName:"research", creationVersion: 6, 
        progressMaxBase:20, progressMaxIncrease:3,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:2,
        unlockCost:10, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["spark", -2], ["spellcraft", 3], ["intellect", 1]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]]
    },
    studySupportSpells: {
        tier:1, plane:0, resourceName:"research", creationVersion: 6, 
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
        tier:1, plane:0, resourceName:"research", creationVersion: 6,  title:"Study Dirt Magic",
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
        tier:1, plane:0, resourceName:"research", creationVersion: 6, 
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
        tier:1, plane:0, resourceName:"research", creationVersion: 6, 
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
        tier:1, plane:0, resourceName:"research", creationVersion: 6, 
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
        tier:1, plane:0, resourceName:"research", creationVersion: 6,  title:"Study Advanced Dirt Magic",
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
        tier:1, plane:0, resourceName:"research", creationVersion: 6, 
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
        tier:1, plane:0, resourceName:"research", creationVersion: 6, 
        progressMaxBase:5e5, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:3,
        unlockCost:5e5, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]]
    },
    studyHistory: {
        tier:1, plane:0, resourceName:"research", creationVersion: 6, 
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
        tier:1, plane:0, resourceName:"research", creationVersion: 6, 
        progressMaxBase:2.5e4, progressMaxIncrease:1.5,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:2,
        unlockCost:2.5e4, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["vision", 10]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]],
        actionTriggers: [
            ["level_2", "reveal", "rememberFriends"]
        ]
    },
    readWarJournals: {
        tier:1, plane:0, resourceName:"research", creationVersion: 6, 
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
        tier:1, plane:0, resourceName:"research", creationVersion: 6, 
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
        tier:1, plane:0, resourceName:"research", creationVersion: 6, 
        progressMaxBase:6e4, progressMaxIncrease:2,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.03, maxLevel:2,
        unlockCost:6e4, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["legacy", 20000]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]]
    },
    readOldPoetry: {
        tier:1, plane:0, resourceName:"research", creationVersion: 6, 
        progressMaxBase:5e4, progressMaxIncrease:1.5,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.03, maxLevel:3,
        unlockCost:5e4, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["pulse", 500], ["intellect", 10]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]]
    },
    readOldPhilosophy: {
        tier:1, plane:0, resourceName:"research", creationVersion: 6, 
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
        tier:1, plane:0, creationVersion: 6, 
        progressMaxBase:1e38, progressMaxIncrease:10,
        expToLevelBase:1, expToLevelIncrease:2,
        efficiencyBase:.0001, maxLevel:5,
        unlockCost:2e37, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["awareness", 1e5], ["flow", 500], ["cycle", 3000]],
        expAtts:[["valor", 1]],
        efficiencyAtts:[["cycle", 1]]
    },
    rememberFriends: {
        tier:1, plane:0, creationVersion: 6, 
        progressMaxBase:1e41, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:5,
        unlockCost:5e37, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["awareness", 2e5], ["integration", 300], ["peace", 1]],
        expAtts:[["cycle", 1], ["valor", 1]],
        efficiencyAtts:[["cycle", 1]]
    },
    rememberTheWar: {
        tier:1, plane:0, creationVersion: 6, 
        progressMaxBase:1e42, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:5,
        unlockCost:3e38, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["awareness", 4e5], ["flow", 800], ["valor", 20]],
        expAtts:[["cycle", 1], ["peace", 10]],
        efficiencyAtts:[["cycle", 1]]
    },
    honorTheLost: {
        tier:1, plane:0, creationVersion: 6, 
        progressMaxBase:1e42, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.00005, maxLevel:5,
        unlockCost:1e41, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["awareness", 1e6], ["flow", 3000], ["peace", 2]],
        expAtts:[["peace", 10]],
        efficiencyAtts:[["cycle", 1]]
    },
    letGoOfGuilt: {
        tier:1, plane:0, creationVersion: 6, 
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

    

    reposeRebounded: {
        tier:1, plane:3, resourceName:"deathEnergy", creationVersion: 6,
        progressMaxBase:60, progressMaxIncrease:1,
        expToLevelBase:60, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true,
        unlockCost:0, visible:true, unlocked:true, isGenerator:true, generatorSpeed:1,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    turnTheWheel: {
        tier:1, plane:3, resourceName:"lifeEnergy", creationVersion: 6,
        progressMaxBase:60, progressMaxIncrease:1,
        expToLevelBase:60, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, hasUpstream:false,
        unlockCost:0, visible:true, unlocked:true, isGenerator:true, generatorSpeed:1,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    tidalBurden: {
        tier:1, plane:3, resourceName:"decay", creationVersion: 6,
        progressMaxBase:60, progressMaxIncrease:1,
        expToLevelBase:60, expToLevelIncrease:1, maxLevel: 100,
        efficiencyBase:1, isKTL:true, purchased: true,
        unlockCost:0, visible:true, unlocked:true, isGenerator:true, generatorSpeed:1,
        hideUpstreamLine: true, hasUpstream:false,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    dipInTheRiver: {
        tier:1, plane:3, resourceName:"essence", creationVersion: 6, title: "Dip in the River",
        progressMaxBase:60, progressMaxIncrease:1,
        expToLevelBase:60, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true, hasUpstream:false,
        unlockCost:0, visible:true, unlocked:true, isGenerator:true, generatorSpeed:1,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    prepareInfusion: {
        tier:1, plane:3, resourceName:"essence", creationVersion: 6,
        progressMaxBase:60, progressMaxIncrease:1,
        expToLevelBase:60, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true,
        unlockCost:0, visible:true, unlocked:true, isGenerator:true, generatorSpeed:1,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    infuseBody: {
        tier:1, plane:3, resourceName:"essence", creationVersion: 6,
        progressMaxBase:60, progressMaxIncrease:1,
        expToLevelBase:60, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true,
        unlockCost:0, visible:true, unlocked:true, isGenerator:true, generatorSpeed:1,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    infuseMind: {
        tier:1, plane:3, resourceName:"essence", creationVersion: 6,
        progressMaxBase:60, progressMaxIncrease:1,
        expToLevelBase:60, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true,
        unlockCost:0, visible:true, unlocked:true, isGenerator:true, generatorSpeed:1,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    infuseSenses: {
        tier:1, plane:3, resourceName:"essence", creationVersion: 6,
        progressMaxBase:60, progressMaxIncrease:1,
        expToLevelBase:60, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true,
        unlockCost:0, visible:true, unlocked:true, isGenerator:true, generatorSpeed:1,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
    infuseMagic: {
        tier:1, plane:3, resourceName:"essence", creationVersion: 6,
        progressMaxBase:60, progressMaxIncrease:1,
        expToLevelBase:60, expToLevelIncrease:1,
        efficiencyBase:1, isKTL:true, purchased: true,
        unlockCost:0, visible:true, unlocked:true, isGenerator:true, generatorSpeed:1,
        onLevelAtts:[],
        expAtts:[],
        efficiencyAtts:[]
    },
}
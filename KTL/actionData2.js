


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
        onLevelAtts:[["concentration", 15], ["pulse", 10], ["navigation", 100]],
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
        progressMaxBase:4e71, progressMaxIncrease:120,
        expToLevelBase:1, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:0,
        unlockCost:2e51, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["concentration", 15]],
        expAtts:[["observation", 1], ["valor", 1]],
        efficiencyAtts:[["energy", 1600]],
        actionTriggers: [
            ["unlock", "reveal", "standStraighter"],
            ["level", "addMaxLevels", "standStraighter", 1]
        ]
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
        efficiencyAtts:[["navigation", 1200], ["pulse", 950]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "stepThroughAsh", 1],
            ["unlock", "reveal", "clearIvyWall"],
            ["unlock", "reveal", "scavengeForSupplies"]
        ]
    },
    clearIvyWall: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:3e66, progressMaxIncrease:20,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.00001, maxLevel:5,
        unlockCost:3e55, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["endurance", 10], ["concentration", 10]],
        expAtts:[["might", 1]],
        efficiencyAtts:[["navigation", 1200]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "stepThroughAsh", 1],
            ["level_3", "reveal", "breakWeakenedWall"],
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
            ["level_5", "reveal", "pullPulsingShard"],
        ]
    },
    pullPulsingShard: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:1e74, progressMaxIncrease:1e5,
        expToLevelBase:1, expToLevelIncrease:10,
        efficiencyBase:.000001, maxLevel:2,
        unlockCost:3e62, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["legacy", 1.5e5], ["pulse", 50]],
        expAtts:[["might", 1], ["resonance", 1]],
        efficiencyAtts:[["observation", 2100]]
    },
    breakWeakenedWall: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:1e75, progressMaxIncrease:20,
        expToLevelBase:12, expToLevelIncrease:1,
        efficiencyBase:.00001, maxLevel:5,
        unlockCost:1e62, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["might", 10]],
        expAtts:[["endurance", 1]],
        efficiencyAtts:[["navigation", 1300]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "stepThroughAsh", 1],
            ["level", "addMaxLevels", "clearIvyWall", 1],
            ["level_2", "reveal", "skimAHeavyTome"]
        ]
    },
    skimAHeavyTome: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:1e83, progressMaxIncrease:20,
        expToLevelBase:12, expToLevelIncrease:1,
        efficiencyBase:.00001, maxLevel:10,
        unlockCost:2e63, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["endurance", 10]],
        expAtts:[["observation", 1]],
        efficiencyAtts:[["navigation", 1350]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "stepThroughAsh", 1],
            ["level_1", "reveal", "findAFamiliarLanguage"],
            ["level_1", "reveal", "readBooks"],
        ]
    },
    findAFamiliarLanguage: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:2e94, progressMaxIncrease:15,
        expToLevelBase:12, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:5,
        unlockCost:6e63, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["awareness", 10]],
        expAtts:[["observation", 1], ["concentration", 1]],
        efficiencyAtts:[["navigation", 1400]],
        actionTriggers: [
            ["level_1", "reveal", "decipherOrganization"],
            ["level_3", "reveal", "collectHistoryBooks"],
        ]
    },
    decipherOrganization: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:3e87, progressMaxIncrease:10,
        expToLevelBase:12, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:20,
        unlockCost:1e64, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["navigation", 15]],
        expAtts:[["awareness", 1], ["concentration", 1]],
        efficiencyAtts:[["observation", 2300]],
        actionTriggers: [
            ["level_5", "reveal", "readFadedMarkers"],
        ]
    },
    collectHistoryBooks: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:1e76, progressMaxIncrease:120,
        expToLevelBase:12, expToLevelIncrease:1,
        efficiencyBase:.000000001, maxLevel:5,
        unlockCost:2e64, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["observation", 10]],
        expAtts:[["concentration", 1]],
        efficiencyAtts:[["navigation", 1500]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "researchBySubject", 2],
            ["level_1", "reveal", "catalogNewBooks"],
            ["level", "addMaxLevels", "catalogNewBooks", 1],
            ["level", "addMaxLevels", "studyHistory", 10],
        ]
    },
    readFadedMarkers: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:1e78, progressMaxIncrease:15,
        expToLevelBase:12, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:10,
        unlockCost:2e66, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["observation", 10], ["navigation", 10]],
        expAtts:[["navigation", 1]],
        efficiencyAtts:[["navigation", 1500]],
        actionTriggers: [
            ["level_4", "reveal", "accessBasementPassage"]
        ]
    },
    accessBasementPassage: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:1e91, progressMaxIncrease:8,
        expToLevelBase:12, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:5,
        unlockCost:2e67, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["valor", 10]],
        expAtts:[["coordination", 1], ["observation", 1]],
        efficiencyAtts:[["navigation", 1550]],
        actionTriggers: [
            ["level_1", "reveal", "inspectAllCorners"]
        ]
    },
    inspectAllCorners: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:1e83, progressMaxIncrease:4,
        expToLevelBase:12, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:5,
        unlockCost:1e69, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["concentration", 10], ["observation", 5]],
        expAtts:[["navigation", 1]],
        efficiencyAtts:[["navigation", 1600]],
        actionTriggers: [
            ["level_1", "reveal", "mapOutTraps"],
            ["level", "addMaxLevels", "mapOutTraps", 1]
        ]
    },
    mapOutTraps: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:1e92, progressMaxIncrease:6,
        expToLevelBase:12, expToLevelIncrease:1,
        efficiencyBase:.00001, maxLevel:0,
        unlockCost:1e70, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["awareness", 10]],
        expAtts:[["observation", 1]],
        efficiencyAtts:[["navigation", 1600]],
        actionTriggers: [
            ["level_5", "reveal", "accessForbiddenArea"]
        ]
    },
    accessForbiddenArea: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:1e122, progressMaxIncrease:2,
        expToLevelBase:6, expToLevelIncrease:1,
        efficiencyBase:.00001, maxLevel:10,
        unlockCost:1e72, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["integration", 4]],
        expAtts:[["observation", 1], ["wizardry", 1], ["archmagery", 1], ["spellcraft", 1], ["resonance", 1]],
        efficiencyAtts:[["navigation", 1700]],
        actionTriggers: [
            ["level_9", "reveal", "collectSpellBooks"]
        ]
    },
    collectSpellBooks: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:4e86, progressMaxIncrease:120,
        expToLevelBase:12, expToLevelIncrease:2,
        efficiencyBase:.00001, maxLevel:5,
        unlockCost:8e72, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["observation", 10]],
        expAtts:[["concentration", 1]],
        efficiencyAtts:[["navigation", 1700]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "researchBySubject", 2],
            ["level", "addMaxLevels", "catalogNewBooks", 1],
            ["level", "addMaxLevels", "studyMagic", 5],
            ["level", "addMaxLevels", "studyMagicalExercises", 4],
        ]
    },
    clearTheDust: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:1e50, progressMaxIncrease:2,
        expToLevelBase:12, expToLevelIncrease:1,
        efficiencyBase:.005, maxLevel:10,
        unlockCost:1e46, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["coordination", 10], ["vision", 10]],
        expAtts:[["endurance", 1]],
        efficiencyAtts:[["navigation", 1]]
    },
    dismantleShelves: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:1e52, progressMaxIncrease:4,
        expToLevelBase:12, expToLevelIncrease:1,
        efficiencyBase:.005, maxLevel:5,
        unlockCost:1e47, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["coordination", 1.5e4], ["might", 1e4]],
        expAtts:[["endurance", 1]],
        efficiencyAtts:[["navigation", 1]]
    },
    discoverLuckyCache: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:1e52, progressMaxIncrease:4,
        expToLevelBase:12, expToLevelIncrease:1,
        efficiencyBase:.005, maxLevel:5,
        unlockCost:1e47, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["coordination", 1.5e4], ["might", 1e4]],
        expAtts:[["endurance", 1]],
        efficiencyAtts:[["navigation", 1]]
    },
    clearRubble: {
        tier:1, plane:0, creationVersion: 6, 
        progressMaxBase:2e38, progressMaxIncrease:5,
        expToLevelBase:12, expToLevelIncrease:1,
        efficiencyBase:.002, maxLevel:10,
        unlockCost:3e31, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["endurance", 3e4], ["coordination", 4000]],
        expAtts:[["might", 1], ["discernment", 1]],
        efficiencyAtts:[["navigation", 1]],
        actionTriggers: [
        ]
    },
    searchForRelevantBooks: {
        tier:1, plane:0, creationVersion: 6, 
        progressMaxBase:1e44, progressMaxIncrease:10,
        expToLevelBase:12, expToLevelIncrease:1,
        efficiencyBase:.02, maxLevel:5,
        unlockCost:3e35, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["curiosity", 3e5]],
        expAtts:[["observation", 1], ["discernment", 1], ["logistics", 1]],
        efficiencyAtts:[["navigation", .01]],
        actionTriggers: [
            ["level_1", "reveal", "collectInterestingBooks"]
        ]
    },
    collectRunicBooks: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:1e44, progressMaxIncrease:10,
        expToLevelBase:12, expToLevelIncrease:1,
        efficiencyBase:.02, maxLevel:5,
        unlockCost:3e35, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["curiosity", 3e5]],
        expAtts:[["observation", 1], ["discernment", 1], ["logistics", 1]],
        efficiencyAtts:[["navigation", .01]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "researchBySubject", 2],
        ]
    },
    collectInterestingBooks: {
        tier:1, plane:0, creationVersion: 6, 
        progressMaxBase:1e42, progressMaxIncrease:10,
        expToLevelBase:12, expToLevelIncrease:1,
        efficiencyBase:.02, maxLevel:3,
        unlockCost:1e36, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["intellect", 1]],
        expAtts:[["discernment", 1], ["curiosity", 1], ["logistics", 1]],
        efficiencyAtts:[["navigation", .01]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "researchBySubject", 2],
        ]
    },
    browseFantasyNovels: {
        tier:1, plane:0, creationVersion: 6, 
        progressMaxBase:2e46, progressMaxIncrease:4,
        expToLevelBase:12, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:5,
        unlockCost:2e41, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["curiosity", 1e6], ["charm", 5e4], ["valor", 40]],
        expAtts:[["observation", 1]],
        efficiencyAtts:[["navigation", .01]]
    },
    recognizeRunicLanguages: {
        tier:1, plane:0, creationVersion: 6, 
        progressMaxBase:4e41, progressMaxIncrease:10,
        expToLevelBase:12, expToLevelIncrease:1,
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
    collectPoeticBooks: {
        tier:1, plane:0, creationVersion: 6,
        progressMaxBase:1e48, progressMaxIncrease:100,
        expToLevelBase:100, expToLevelIncrease:1,
        efficiencyBase:.005, maxLevel:3,
        unlockCost:1e44, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["amplification", 5e5], ["legacy", 1e5]],
        expAtts:[["curiosity", 1]],
        efficiencyAtts:[["navigation", .01]],
        actionTriggers: [
            ["unlock", "addMaxLevels", "researchBySubject", 2],
        ]
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
            ["unlock", "addMaxLevels", "researchBySubject", 2],
            ["level_4", "reveal", "clearTheDust"],
            ["level", "addMaxLevels", "catalogNewBooks", 2],
            ["level", "addMaxLevels", "studyCryptology", 1]
        ]
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
        progressMaxBase:5e62, progressMaxIncrease:200,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.01, maxLevel:3,
        unlockCost:1e64, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["concentration", 20]],
        expAtts:[["comfort", 1]],
        efficiencyAtts:[["calm", 400]]
    },
    catalogNewBooks: {
        tier:1, plane:0, creationVersion: 6, 
        progressMaxBase:1e113, progressMaxIncrease:40,
        expToLevelBase:6, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:0,
        unlockCost:4e65, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["intellect", 5]],
        expAtts:[["awareness", 1], ["observation", 1], ["concentration", 1], ["comfort", 1]],
        efficiencyAtts:[["comfort", 100]],
        actionTriggers: [
            ["level_1", "reveal", "study"],
            ["level_1", "reveal", "researchBySubject"],
            ["level_2", "reveal", "studyHistory"],
            ["level_6", "reveal", "studyMagic"],
            ["level_10", "addMaxLevels", "studyMagic", 20],
        ]
    },
    craftSpellShack: {
        tier:1, plane:0, creationVersion: 6, title: "Craft Spell Shack",
        progressMaxBase:3e37, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:0,
        unlockCost:3e38, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["integration", 300], ["spellcraft", 10], ["intellect", 3]],
        expAtts:[["logistics", 1]],
        efficiencyAtts:[["logistics", 1]]
    },
    craftSturdyPracticeDen: {
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
        progressMaxBase:1e66, progressMaxIncrease:1.2,
        expToLevelBase:9, expToLevelIncrease:1,
        efficiencyBase:.05,
        unlockCost:5e66, visible:false, unlocked:false, purchased: false,
        onUnlock: function() {
            let actionObj = data.actions.study;
            actionObj.resourceToAdd = Math.pow((1+actionObj.level/10), 3) * actionObj.upgradeMult;
            data.actions.researchBySubject.showResourceAdded = actionObj.resourceToAdd;
        },
        onLevelCustom: function() {
            let actionObj = data.actions.study;
            actionObj.resourceToAdd = Math.pow((1+actionObj.level/10), 3) * data.actions.study.upgradeMult;

            addResourceTo(data.actions.researchBySubject, actionObj.resourceToAdd);
            data.actions.researchBySubject.showResourceAdded = actionObj.resourceToAdd;
        },
        updateUpgradeMult: function () {
            let upgradeMult = 1;
            upgradeMult *= Math.pow(1.25, data.upgrades.studyHarder.upgradePower);
            data.actions.study.upgradeMult = upgradeMult;
        },
        onLevelAtts:[],
        expAtts:[["calm", 1], ["intellect", 1], ["comfort", 1]],
        efficiencyAtts:[["comfort", 300]],
        extraInfo: {english:Raw.html`When this action levels up, it generates (1 + level/10)^3 Research onto Resarch By Subject.`},
        actionTriggers: [
            ["info", "text", "On Level: Generates Research (more in info)"],
        ]
    },
    researchBySubject: {
        tier:1, plane:0, resourceName:"research", creationVersion: 6, 
        progressMaxBase:10, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.1, maxLevel:1, showResourceAdded:true,
        unlockCost:5, visible:false, unlocked:false, purchased: false, hasUpstream:false, keepParentAutomation:true,
        onLevelAtts:[["comfort", 10]],
        expAtts:[],
        efficiencyAtts:[["comfort", 30]],
        actionTriggers: [
            ["level", "addMaxLevels", "readBooks", 1],
        ]
    },
    studyHistory: {
        tier:1, plane:0, resourceName:"research", creationVersion: 6,
        progressMaxBase:10, progressMaxIncrease:1.1,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:0,
        unlockCost:100, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["intellect", 1]],
        expAtts:[],
        efficiencyAtts:[["comfort", 40]],
        actionTriggers: [
            ["level_25", "reveal", "reviewOldMemories"],
            // ["level_55", "reveal", "readOldStories"],
            // ["level_55", "reveal", "readWarJournals"],
            // ["level_55", "reveal", "readOldReligiousTexts"],
            // ["level_55", "reveal", "readOldPoetry"],
            // ["level_55", "reveal", "readOldProphecies"],
            // ["level_55", "reveal", "readOldPhilosophy"],
        ]
    },
    readOldStories: {
        tier:1, plane:0, resourceName:"research", creationVersion: 6,
        progressMaxBase:2.5e4, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelIncrease:1,
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
        expToLevelBase:10, expToLevelIncrease:1,
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
        expToLevelBase:10, expToLevelIncrease:1,
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
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.03, maxLevel:2,
        unlockCost:6e4, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["legacy", 20000]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]]
    },
    readOldPoetry: {
        tier:1, plane:0, resourceName:"research", creationVersion: 6,
        progressMaxBase:5e4, progressMaxIncrease:1.5,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.03, maxLevel:3,
        unlockCost:5e4, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["pulse", 500], ["intellect", 10]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]]
    },
    readOldPhilosophy: {
        tier:1, plane:0, resourceName:"research", creationVersion: 6,
        progressMaxBase:1e5, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.03, maxLevel:1,
        unlockCost:1e5, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["intellect", 30], ["calm", 10]],
        expAtts:[],
        efficiencyAtts:[["comfort", 1]],
        actionTriggers: [
            ["level_2", "reveal", "letGoOfGuilt"]
        ]
    },
    studyMagic: {
        tier:1, plane:0, resourceName:"research", creationVersion: 6, 
        progressMaxBase:300, progressMaxIncrease:1.2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:0,
        unlockCost:1000, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["wizardry", 3], ["intellect", 1]],
        expAtts:[],
        efficiencyAtts:[["comfort", 60]],
        actionTriggers: [
            ["level_5", "reveal", "studyMagicalExercises"],
        ]
    },
    studyMagicalExercises: {
        tier:1, plane:0, resourceName:"research", creationVersion: 6,
        progressMaxBase:600, progressMaxIncrease:1.2,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.05, maxLevel:0,
        unlockCost:2000, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["archmagery", 3], ["impedance", -1]],
        expAtts:[],
        efficiencyAtts:[["comfort", 70]],
        actionTriggers: [
            ["level_5", "purchase", "practiceIncantations"],
            ["level_5", "reveal", "practiceIncantations"],
            ["level_15", "purchase", "practicePronunciation"],
            ["level_15", "reveal", "practicePronunciation"],
        ]
    },
    studySupportSpells: {
        tier:1, plane:0, resourceName:"research", creationVersion: 6, 
        progressMaxBase:200, progressMaxIncrease:3,
        expToLevelBase:10, expToLevelIncrease:1,
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
            ["level_1", "reveal", "craftSturdyPracticeDen"],
            ["level", "addMaxLevels", "craftSturdyPracticeDen", 1],
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
    reviewOldMemories: {
        tier:1, plane:0, creationVersion: 6, 
        progressMaxBase:2e74, progressMaxIncrease:40,
        expToLevelBase:6, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:10,
        unlockCost:2e70, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["awareness", 15]],
        expAtts:[["valor", 1]],
        efficiencyAtts:[["cycle", 500]]
    },
    rememberFriends: {
        tier:1, plane:0, creationVersion: 6, 
        progressMaxBase:1e75, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:5,
        unlockCost:5e70, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["awareness", 10], ["integration", 5]],
        expAtts:[["valor", 1]],
        efficiencyAtts:[["cycle", 450]]
    },
    rememberTheWar: {
        tier:1, plane:0, creationVersion: 6, 
        progressMaxBase:1e77, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.0001, maxLevel:5,
        unlockCost:3e72, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["awareness", 10], ["valor", 5]],
        expAtts:[["cycle", 1], ["calm", 1]],
        efficiencyAtts:[["cycle", 450]]
    },
    honorTheLost: {
        tier:1, plane:0, creationVersion: 6, 
        progressMaxBase:1e79, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.00005, maxLevel:5,
        unlockCost:1e74, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["awareness", 10], ["calm", 2]],
        expAtts:[["calm", 1]],
        efficiencyAtts:[["cycle", 450]]
    },
    letGoOfGuilt: {
        tier:1, plane:0, creationVersion: 6, 
        progressMaxBase:1e81, progressMaxIncrease:10,
        expToLevelBase:10, expToLevelIncrease:1,
        efficiencyBase:.00005, maxLevel:5,
        unlockCost:1e76, visible:false, unlocked:false, purchased: false,
        onLevelAtts:[["awareness", 10], ["valor", 5], ["calm", 5]],
        expAtts:[["flow", 1]],
        efficiencyAtts:[["cycle", 450]]
    },
}

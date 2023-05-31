data.species.beavers = {
    name: "Beavers",
    stats: {off: .4, def: .6},
    enemy:
        {
            "name": "Nutria",
            "stats": {off: .9, def: .5}
        },
    spawnerName: "Floodplain",
    researchName: "Burrow",
    levelType: "river",
    ability: {
        name: "Lodge Fortress",
        desc: "Place a building in a location with at least <span id='beaverAbilityRequirement'>100</span> Beavers in it. It spawns at a rate of 25% of the primary spawner per second, for <span id='beaverAbilityduration'>8</span> seconds. Additionally, units within a distance of <span id='beaverAbilityDistance'>3</span> have <span id='beaverAbilityDefense'>0.3</span> more defense." +
            "<br><br><span id=<span id='beaverAbilityCooldownCurrent'>30</span>s/'beaverAbilityCooldownMax'>30</span>s cooldown, <span id='beaverAbilityChargesCurrent'>0</span> out of <span id='beaverAbilityChargesMax'>3</span> charges remaining.",
        data: {
            requirement: 100,
            duration: 8,
            distance: 3,
            defense: .3,
            cooldownCurrent: 30,
            cooldownMax: 30,
            chargesCurrent: 0,
            chargesMax: 3
        }
    },
    special: [
        {
            name: "Forward Construction",
            desc: "Gives all beavers +0.1 defense, can be upgraded 3 times.",
            data: {
                bought: 0,
                amount: 0
            },
            effect: function () {
                return data.species.beavers.special[0].data.bought / 10;
            },
            cost: function () {
                return 1000 * Math.exp(10, bought + 1)
            },
            isDone: function () {
                return bought === 3
            }
        },
        {
            name: "Dam Efficiency",
            desc: "Allows 1 more dam to be placed.",
            data: {
                bought: 0,
                amount: 0,
            },
            effect: function () {
                return data.species.beavers.special[1].data.bought + 1;
            },
            cost: function () {
                return 1000 * Math.exp(10, data.species.beavers.special[1].data.bought);
            },
            isDone: function () {
                return false;
            }
        }
    ],
    upgrades: [
        //Upgrade effects are somewhere else
        {
            name: "Mating Season", //x4 spawn rate for 30 seconds, with a cooldown of 2 minutes
            requires: null,
            cost: 0
        },
        {
            name: "Fertility Boost", //Mating season duration increased by 10 seconds per upgrade
            requires: "Mating Season",
            cost: 30000,
            costScaleRate: 3
        },
        {
            name: "Hibernation", //When mating season finishes the duration, for 30 seconds defense is x1.5
            requires: "Mating Season",
            cost: 100000
        },
        {
            name: "Organization", //All units are moved 1 space closer to a building being built, if there is one within 3 spaces
            requires: null,
            cost: 1000
        },
        {
            name: "Stronger Together", //Units used to build with Organization are 50% more effective
            requires: "Organization",
            cost: 10000
        },
        {
            name: "Rally Points", //All buildings increase offense of nearby 5 squares by 10%. Does not stack.
            requires: "Organization",
            cost: 20000
        },
        {
            name: "Social Learning", //The more enemies you kill, the more that offense increases
            requires: null,
            cost: 50000
        },
        {
            name: "Opportunistic Mating", //When a building finishes being built, and it increases the maximum number built of that type, give an x8 breeding boost for 2 seconds.
            requires: null,
            cost: 100
        },
        {
            name: "Fast Build.", //Buildings take from one extra distance when building.
            requires: null,
            cost: 100000
        }
        //etc.
    ]
}
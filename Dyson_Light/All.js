let data = {
    systems:[],
    curSystem:0,
    curPlanet:0,
    selectedCol:null,
    selectedRow:null,
    research:[
        {
            req:null,
            title:"Unlock House",
            desc:"Get population and workers! Each worker assigned to an industry increases output by 5%!",
            cost:100,
            unlocked:false
        },
        {
            req:0,
            title:"Unlock Servers",
            desc:"Houses taking too much space? Upload your population instead!",
            cost:1000,
            unlocked:false
        },
        {
            req:1,
            title:"Unlock Quantum Transport",
            desc:"Send resources to other planets, kick-starting them into eventually sending resources back!",
            cost:10000,
            unlocked:false
        },
        {
            req:2,
            title:"Unlock Radio Telescope",
            desc:"Receive virtual population from other planets, and later power from your Dyson Sphere",
            cost:100000,
            unlocked:false
        },
        {
            req:3,
            title:"Unlock Launch Pad",
            desc:"Build and launch solar sails that orbit 3 times around the sun before becoming part of the dyson sphere!",
            cost:1000000,
            unlocked:false
        },
    ],
    science:0,
    scienceD:0,
};

let errorMessages = [];
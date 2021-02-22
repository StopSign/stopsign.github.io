let data = {
    systems:[],
    curSystem:0,
    curPlanet:0,
    selectedCol:null,
    selectedRow:null,
    research:[
        {
            req:null,
            title:"Unlock Servers",
            desc:"Houses taking too much space? Upload your population instead!",
            cost:1000,
            unlocked:false
        },
        {
            req:0,
            title:"Unlock Quantum Transport",
            desc:"Send resources to other planets, kick-starting them into eventually sending resources back!",
            cost:10000,
            unlocked:false
        },
        {
            req:null,
            title:"Unlock Radio Telescope",
            desc:"Receive virtual population from other planets, and later power from your Dyson Sphere",
            cost:1000,
            unlocked:false
        },
    ]
};

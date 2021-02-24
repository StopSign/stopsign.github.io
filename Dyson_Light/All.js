let data = {
    systems:[],
    curSystem:0,
    curPlanet:0,
    selectedCol:null,
    selectedRow:null,
    research:[
        { //0
            req:null,
            title:"Unlock House",
            desc:"Get population and workers! Each worker assigned to an industry increases output by 5%!",
            cost:100,
            unlocked:false
        },
        { //1
            req:0,
            title:"Unlock Servers",
            desc:"Houses taking too much space? Upload your population instead!",
            cost:1000,
            unlocked:false
        },
        { //2
            req:1,
            title:"Unlock Quantum Transport",
            desc:"Send resources to other planets, kick-starting them into eventually sending resources back!",
            cost:10000,
            unlocked:false
        },
        { //3
            req:2,
            title:"Unlock Radio Telescope",
            desc:"Receive virtual population from other planets, and later power from your Dyson Sphere",
            cost:100000,
            unlocked:false
        },
        { //4
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

let poweredCells = {
    ore:[],
    mine:[],
    //solarPanel:[],
    factory:[],
    lab:[],
    house:[],
    server:[],
    quantumTransport:[],
    radioTelescope:[],
    launchPad:[]
};

let info = {
    mine: {
        oreCost:[0, 0, 0, 0],
        electronicCost:[0, 0, 0, 0],
        panelCost:[0, 0, 0, 0],
        power:[0, 0, 0, 0],
        gain:[1],
        title:"Mine",
        infoDiv:"Gain 1 ore per second.",
        extra:"",
        pausable:false,
        buildTitle:"(M)ine",
        buildDesc:"Free to build. Gain ore per second.<br>Can use up to 5 population."
    },
    solarPanel: {
        oreCost:[0],
        electronicCost:[0],
        panelCost:[1],
        power:[1],
        title:"Solar Panel",
        infoDiv:"Harness the light of the sun! Gain 1 electricity. Buildings will not work without electricity.",
        extra:"",
        pausable:false,
        buildTitle:"Build Solar (P)anel",
        buildDesc:"Costs 1 solar panel. Provides 1 electricity."
    },
    factory: {
        oreCost:[50],
        electronicCost:[0],
        panelCost:[0],
        power:[1],
        gain:[.1],
        gain2:[.1],
        title:"Factory",
        infoDiv:"Create .1 electronics using 1 ore per second, or .1 solar panels using .2 electronics per second",
        extra:"<div class='pressedSelectOption' id='option0' onclick='selectOption(0)'>Create<br>Electronics (1)</div><div class='selectOption' id='option1' onclick='selectOption(1)'>Create<br>Solar Panels (2)</div>",
        pausable:true,
        buildTitle:"Build (F)actory",
        buildDesc:"Costs 50 ore. Creates electronics from ore, <br>or solar panels from electronics.<br>Uses 1 electricity."
    },
    lab: {
        oreCost:[0],
        electronicCost:[20],
        panelCost:[0],
        power:[5],
        gain:[1],
        title:"Lab",
        infoDiv:"Gain 1 science per second.",
        extra:"",
        pausable:true,
        buildTitle:"Build (L)ab",
        buildDesc:"Costs 20 electronics and 5 electricity. Provides 1 science per second.."
    },
    house: {
        oreCost:[100],
        electronicCost:[0],
        panelCost:[5],
        power:[0],
        gain:[10],
        title:"House",
        infoDiv:"Pop increases by .1% per second. Assign workers to other buildings to improve their efficiency by 5% per worker.",
        extra:"",
        pausable:false,
        buildTitle:"Build (H)ouse",
        buildDesc:"Costs 100 ore and 5 panels. Increases max pop by 10. Pop increases by .1% <br>of current population every second. <br>Minimum 2 population."
    },
    server: {
        oreCost:[0],
        electronicCost:[1000],
        panelCost:[0],
        power:[50],
        title:"Server",
        infoDiv:"",
        extra:"",
        pausable:true,
        buildTitle:"Build S(e)rver",
        buildDesc:"Costs 1k electronics and uses 50 electricity. Creates virtual population with all excess population growth. Holds 1k virtual population."
    },
    quantumTransport: {
        oreCost:[0],
        electronicCost:[10000],
        panelCost:[0],
        power:[50],
        title:"Quantum Transport",
        infoDiv:"",
        extra:"",
        pausable:true,
        buildTitle:"Build (Q)uantum Transport",
        buildDesc:"Costs 10k electronics and 50 electricity. Can send resources to any planet in range using power."
    },
    radioTelescope: {
        oreCost:[20000],
        electronicCost:[20000],
        panelCost:[0],
        power:[],
        title:"Radio Telescope",
        infoDiv:"",
        extra:"",
        pausable:true,
        buildTitle:"Build (R)adio Telescope",
        buildDesc:"Costs 20k electronics, 20k ore. Can receive virtual population, or power from the Dyson Sphere."
    },
    launchPad: {
        oreCost:[0],
        electronicCost:[100000],
        panelCost:[0],
        power:[1000],
        title:"Launch Pad",
        infoDiv:"",
        extra:"",
        pausable:true,
        buildTitle:"Build L(a)unch Pad",
        buildDesc:"Costs 100k electronics. Creates and launches solar sails from solar panels & ore."
    }

};
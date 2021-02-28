let data = {
    systems:[],
    curSystem:0,
    curPlanet:0,
    selectedCol:null,
    selectedRow:null,
    science:0,
    scienceD:0,
    sailId: 0,
    SsailId: 0,
    research:{
        unlock:[],
        mine:[],
        solarPanel:[],
        factory:[],
        lab:[],
        house:[],
        server:[],
        quantumTransport:[],
        radioTelescope:[],
        launchPad:[]
    },
};


let errorMessages = [];

let researchInfo = [
    {
        req:null,
        title:"Unlock House",
        desc:"Get population and workers! Each worker assigned to an industry increases output by 5%!",
        cost:100,
        unlocks:{type:"unlock",num:0},
    },
    {
        req:{type:"unlock", num:2},
        title:"Unlock Radio Telescope",
        desc:"Receive virtual population from other planets, and later power from your Dyson Sphere",
        cost:100000,
        unlocks:{type:"unlock",num:3},
    },
    { //4
        req:{type:"unlock", num:3},
        title:"Unlock Launch Pad",
        desc:"Build and launch solar sails that orbit 3 times around the sun before becoming part of the dyson sphere!",
        cost:1000000,
        unlocks:{type:"unlock",num:4},
    },
    { //5
        req:{type:"unlock", num:0},
        title:"Unlock Mine Mk. 2",
        desc:"An upgrade to the mine. Double production, but more expensive to build. Comes with solar panels instead of an electricity requirement.",
        cost:300,
        unlocks:{type:"mine",num:0},
    },
    { //6
        req:{type:"unlock", num:0},
        title:"Unlock Solar Mk. 2",
        desc:"Let the light shine upon the non-believers.",
        cost:600,
        unlocks:{type:"solarPanel",num:0},
    },
    {
        req:{type:"solarPanel", num:0},
        title:"Unlock Mine Mk. 3",
        desc:"More ore already? Well alright, but it'll cost ya.",
        cost:1200,
        unlocks:{type:"mine",num:1},
    },
    {
        req:{type:"solarPanel", num:0},
        title:"Unlock Factory Mk. 2",
        desc:"Upgrade the factory, doubling efficiency.",
        cost:1500,
        unlocks:{type:"factory",num:0},
    },
    {
        req:{type:"factory", num:0},
        title:"Unlock Solar Panel Mk. 3",
        desc:"Within you is the light of a thousand suns.",
        cost:3000,
        unlocks:{type:"solarPanel",num:1},
    },
    {
        req:{type:"factory", num:0},
        title:"Unlock Lab Mk. 2",
        desc:"Upgrade the lab, triple the gain at only double the power! You get the idea.",
        cost:2000,
        unlocks:{type:"lab",num:0},
    },
    {
        req:{type:"lab", num:0},
        title:"Unlock Mine Mk. 4",
        desc:"Even more efficiency! You get the drill",
        cost:8000,
        unlocks:{type:"mine",num:2},
    },
    {
        req:{type:"solarPanel", num:1},
        title:"Unlock Servers",
        desc:"New houses taking too much space? Upload your extra population instead!",
        cost:10000,
        unlocks:{type:"unlock",num:1},
    },
    {
        req:{type:"unlock", num:1},
        title:"Unlock Factory Mk. 3",
        desc:"The next in the line.",
        cost:15000,
        unlocks:{type:"factory",num:1},
    },
    {
        req:{type:"unlock", num:1},
        title:"Unlock Solar Panel Mk. 4",
        desc:"It is during our darkest moments that we must focus to see the light.",
        cost:20000,
        unlocks:{type:"solarPanel",num:2},
    },
    {
        req:{type:"unlock", num:1},
        title:"Unlock House Mk. 2",
        desc:"Finally, improvements to housing technology - 2 floors",
        cost:30000,
        unlocks:{type:"house",num:0},
    },
    {
        req:{type:"unlock", num:1},
        title:"Unlock Quantum Transport",
        desc:"Send resources to other planets, kick-starting them into eventually sending resources back! Electricity cost is dependent on distance.",
        cost:50000,
        unlocks:{type:"unlock",num:2},
    },
    {
        req:{type:"unlock", num:2},
        title:"Unlock Lab Mk. 3",
        desc:"Significant improvement to efficiency!",
        cost:80000,
        unlocks:{type:"lab",num:1},
    },
];

let info = {
    mine: {
        oreCost:[0, 0, 0, 0],
        electronicCost:[0, 10, 40, 300],
        panelCost:[0, 5, 30, 100],
        power:[0, 0, 0, 0],
        gain:[1, 2, 4, 10],
        title:"Mine",
        infoDiv:"Gain <div id='infoGain'></div> ore per second.",
        extra:"",
        pausable:false,
        buildTitle:"(M)ine",
        buildDesc:"Free to build. Gain ore per second.<br>Can use up to 5 population."
    },
    solarPanel: {
        oreCost:[0, 0, 0, 0],
        electronicCost:[0, 0, 0, 0],
        panelCost:[1, 10, 200, 1000],
        power:[0, 0, 0, 0],
        gain:[1, 2, 5, 10],
        title:"Solar Panel",
        infoDiv:"Harness the light of the sun for electricity! Buildings will not work without electricity.<br>Gain <div id='infoGain'></div> electricity.",
        extra:"",
        pausable:false,
        buildTitle:"Build Solar (P)anel",
        buildDesc:"Costs 1 solar panel. Provides 1 electricity."
    },
    factory: {
        oreCost:[50, 300, 2000],
        electronicCost:[0, 10, 300],
        panelCost:[0, 0, 10],
        power:[1, 2, 6],
        gain:[.1, .2, .6],
        gain2:[.1, .2, .6],
        title:"Factory",
        infoDiv:"Create <div id='infoGain'></div> electronics using 10x the ore per second, or <div id='infoGain2'></div> solar panels using 2x the electronics per second",
        extra:"<div class='pressedSelectOption' id='option0' onclick='selectOption(0)'>Create<br>Electronics (1)</div>" +
            "<div class='selectOption' id='option1' onclick='selectOption(1)'>Create<br>Solar Panels (2)</div>",
        optionText:["E", "SP"],
        pausable:true,
        buildTitle:"Build (F)actory",
        buildDesc:"Costs 50 ore. Creates electronics from ore, <br>or solar panels from electronics.<br>Uses 1 electricity."
    },
    lab: {
        oreCost:[0, 0, 0],
        electronicCost:[20, 150, 6000],
        panelCost:[0, 0, 0],
        power:[5, 10, 20],
        gain:[1, 3, 10],
        title:"Lab",
        infoDiv:"Gain <div id='infoGain'></div> science per second.",
        extra:"",
        pausable:true,
        buildTitle:"Build (L)ab",
        buildDesc:"Costs 20 electronics and 5 electricity. Provides 1 science per second.."
    },
    house: {
        oreCost:[100, 5000],
        electronicCost:[0, 0],
        panelCost:[5, 200],
        power:[0, 0],
        gain:[10, 20],
        title:"House",
        infoDiv:"Holds <div id='infoGain'></div> people in it. Population increases by .1% per second. Assign workers to other buildings to improve their efficiency by 5% per worker.",
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
        gain:[1000],
        title:"Server",
        infoDiv:"Server",
        extra:"Holds <div id='infoGain'></div> virtual people in it. Extra population growth becomes virtual people. Virtual people can be workers, but they don't contribute to population growth. Can only hold 1 server per planet.",
        pausable:false,
        buildTitle:"Build S(e)rver",
        buildDesc:"Costs 1k electronics and uses 50 electricity. Creates virtual population with all excess population growth. Holds 1k virtual population."
    },
    quantumTransport: {
        oreCost:[0],
        electronicCost:[10000],
        panelCost:[0],
        power:[0],
        gain:[1],
        title:"Quantum Transport",
        infoDiv:"Send resources to other planets. Base transfer rate is <div id='infoGain'></div>. Send 1 ore, .1 electronic, .05 solar panels, .005 solar sails, or .01 virtual population per transfer rate. Virtual population will only transfer if the target planet has a Radio Telescope. Improve the rate with workers!",
        extra:"<div class='pressedSelectOption' id='option0' onclick='selectOption(0)'>Send<br>Ore (1)</div>" +
            "<div class='selectOption' id='option1' onclick='selectOption(1)'>Send<br>Electronics (2)</div>"+
            "<div class='selectOption' id='option2' onclick='selectOption(2)'>Send<br>Solar Panels (3)</div>"+
            "<div class='selectOption' id='option3' onclick='selectOption(3)'>Send<br>V. Population (4)</div>"+
            "<div class='selectOption' id='option4' onclick='selectOption(4)'>Send<br>Solar Sails (5)</div><br><br>" +
            "<div>Send to planet:</div><br>" +
            "<div class='pressedSelectOption' id='targetOption0' onclick='selectTargetOption(0)'>Planet 1</div>" +
            "<div class='selectOption' id='targetOption1' onclick='selectTargetOption(1)'>Planet 2</div><br>"+
            "<div class='selectOption' id='targetOption2' onclick='selectTargetOption(2)'>Planet 3</div>"+
            "<div class='selectOption' id='targetOption3' onclick='selectTargetOption(3)'>Planet 4</div><br>"+
            "<div>Costs <div id='qTransPower' class='bold'></div> power to send resources a distance of <div id='qTransDistance' class='bold'></div><br>Turns off when you switch planets.</div>",
        optionText:["O", "E", "SP", "VP", "SS"],
        optionText2:["P1","P2","P3","P4"],
        pausable:true,
        buildTitle:"Build (Q)uantum Transport",
        buildDesc:"Costs 10k electronics. Can send resources to any planet in range using power, but uses more power for more distance."
    },
    radioTelescope: {
        oreCost:[20000],
        electronicCost:[20000],
        panelCost:[5000],
        power:[0],
        gain:[100],
        title:"Radio Telescope",
        infoDiv:"Allows for virtual population to be sent to this planet via Quantum Transporters. Alternatively, can receive up to <div id='infoGain'></div> electricity from the Dyson Sphere.",
        extra:"<div class='pressedSelectOption' id='option0' onclick='selectOption(0)'>Receive<br>Population (1)</div>" +
            "<div class='selectOption' id='option1' onclick='selectOption(1)'>Receive<br>Electricity (2)</div>",
        optionText:["VP", "E"],
        pausable:false,
        buildTitle:"Build (R)adio Telescope",
        buildDesc:"Costs 20k electronics, 20k ore, 5k solar panels. Can receive virtual population, or up to 100 power from the Dyson Sphere from the closest planet onwards."
    },
    launchPad: {
        oreCost:[0],
        electronicCost:[100000],
        panelCost:[0],
        power:[100],
        gain:[.01],
        gain2:[.02],
        title:"Launch Pad",
        infoDiv:"Create <div id='infoGain'></div> solar sails using 100x the solar panels per second, or launch <div id='infoGain2'></div> solar sails per second to join the Dyson Sphere. The solar sails launch once the launch pad has used 1 solar sail, and once in place, they give 1 electricity to whoever can receive them. When they start orbiting the sun, it takes 2-3 minutes before finding their permanent resting spot on the Dyson Sphere.",
        extra:"<div class='pressedSelectOption' id='option0' onclick='selectOption(0)'>Create<br>Solar Sails (1)</div>" +
            "<div class='selectOption' id='option1' onclick='selectOption(1)'>Launch<br>Solar Sails (2)</div>",
        optionText:["SS", "L"],
        pausable:true,
        buildTitle:"Build L(a)unch Pad",
        buildDesc:"Costs 100k electronics. Creates and launches solar sails from solar panels & ore."
    }

};
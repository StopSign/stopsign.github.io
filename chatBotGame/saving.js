let data = {};
data.ice = 0;
data.money = 100;
data.reserve = 0;
data.pump = 2;
data.mountainLake = 0;
data.greatLake = 0;
data.pumpProgress = 0;
data.pumpRate = .5;
data.numOfRivers = 20;
data.pumpCost = 10;
data.rivers = Array.from({length: data.numOfRivers}, () => 0);

let saving = {
    load() {
        view.createRiverDivs();
    }
};


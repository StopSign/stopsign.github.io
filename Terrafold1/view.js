function View() {

    this.update = function() {
        //should run no more than once per frame
        this.updateInfo();
        this.updateIce();
        this.updateWater();
        this.updateClouds();
        this.updateLand();
        this.updateTrees();
        this.updateFarms();
        this.updatePopulation();
        this.updateComputerRowProgress();
        this.updateRobotsRowProgress();
        this.updateEnergy();
        this.updateSpaceStation();
        this.updateTractorBeam();
        this.progressBar1.tick(game.clouds.initialStormTimer - game.clouds.stormTimer, game.clouds.initialStormTimer);
        this.progressBar2.tick(game.clouds.stormDuration, game.clouds.initialStormDuration);
        updateSpace();
        this.updateHangar();
    };

    this.updateInfo = function() {
        document.getElementById('totalWater').innerHTML = intToString(game.ice.ice + game.water.indoor + game.water.outdoor + game.clouds.water + game.land.water + game.trees.water + game.farms.water);
        document.getElementById('cash').innerHTML = intToString(game.cash);
        document.getElementById('oxygen').innerHTML = intToString(game.oxygen);
        document.getElementById('science').innerHTML = intToString(game.science);
        document.getElementById('wood').innerHTML = intToString(game.wood);
        document.getElementById('metal').innerHTML = intToString(game.metal);
        document.getElementById('oxygenLeak').innerHTML = intToString(game.oxygenLeak, 4);
    };

    this.updateIce = function() {
        document.getElementById('ice').innerHTML = intToString(game.ice.ice);
        document.getElementById('buyableIce').innerHTML = intToString(game.ice.buyable);
        document.getElementById('iceTransferred').innerHTML = intToString(game.ice.transferred, 4);
        document.getElementById('indoorWaterReceived').innerHTML = intToString(game.ice.transferred, 4);
        document.getElementById('iceBuyerAmount').innerHTML = game.ice.gain+"";
    };

    this.updateWater = function() {
        document.getElementById('indoorWater').innerHTML = intToString(game.water.indoor);
        document.getElementById('indoorWaterMax').innerHTML = intToString(game.water.maxIndoor);
        document.getElementById('indoorWaterSelling').innerHTML = intToString(game.water.selling);
        document.getElementById('indoorWaterProfits').innerHTML = intToString(game.water.gain);
        document.getElementById('excessWater').innerHTML = intToString(game.water.excess, 4);
        document.getElementById('lakeWaterFromStorage').innerHTML = intToString(game.water.excess, 4);

        document.getElementById('outdoorWater').innerHTML = intToString(game.water.outdoor);
        document.getElementById('waterTransferred').innerHTML = intToString(game.water.transferred, 4);
        document.getElementById('cloudsReceived').innerHTML = intToString(game.water.transferred, 4);
    };

    this.updateClouds = function() {
        document.getElementById('clouds').innerHTML = intToString(game.clouds.water);
        document.getElementById('stormTimer').innerHTML = game.clouds.stormTimer+"";
        document.getElementById('stormRate').innerHTML = game.clouds.stormRate+"%";
        document.getElementById('intensityPB').style.height = game.clouds.stormRate+"%";
        document.getElementById('stormDuration').innerHTML = game.clouds.stormDuration+"";
        document.getElementById('rain').innerHTML = intToString(game.clouds.transferred, 4);
        document.getElementById('landReceived').innerHTML = intToString(game.clouds.transferred, 4);
        document.getElementById('lightningChance').innerHTML = intToString(game.clouds.lightningChance);
        document.getElementById('lightningStrength').innerHTML = intToString(game.clouds.lightningStrength);
    };

    this.updateLand = function() {
        document.getElementById('landWater').innerHTML = intToString(game.land.water);
        document.getElementById('optimizedLand').innerHTML = intToString(game.land.optimizedLand);
        document.getElementById('baseLand').innerHTML = intToString(game.land.baseLand);
        document.getElementById('land').innerHTML = intToString(game.land.land);
        document.getElementById('soil').innerHTML = intToString(game.land.soil);
        document.getElementById('landConverted').innerHTML = intToString(game.land.convertedLand, 4);
        document.getElementById('landWaterToForest').innerHTML = intToString(game.land.transferred, 4);
        document.getElementById('forestReceived').innerHTML = intToString(game.land.transferred, 4);
        document.getElementById('landWaterToFarm').innerHTML = intToString(game.land.transferred, 4);
        document.getElementById('farmReceived').innerHTML = intToString(game.land.transferred, 4);
    };

    this.updateTrees = function() {
        document.getElementById('forestWater').innerHTML = intToString(game.trees.water);
        document.getElementById('ferns').innerHTML = intToString(game.trees.ferns);
        document.getElementById('fernsDelta').innerHTML = intToString(game.trees.fernsDelta, 4);
        document.getElementById('smallTrees').innerHTML = intToString(game.trees.smallTrees);
        document.getElementById('smallTreesDelta').innerHTML = intToString(game.trees.smallTreesDelta, 4);
        document.getElementById('trees').innerHTML = intToString(game.trees.trees);
        document.getElementById('treesDelta').innerHTML = intToString(game.trees.treesDelta, 4);
        document.getElementById('totalPlants').innerHTML = intToString(game.trees.totalPlants);
        document.getElementById('oxygenGain').innerHTML = intToString(game.trees.oxygenGain, 4);
        document.getElementById('forestWaterToLake').innerHTML = intToString(game.trees.transferred, 4);
        document.getElementById('lakeWaterFromForest').innerHTML = intToString(game.trees.transferred, 4);
        document.getElementById('fernWater').innerHTML = intToString(game.trees.fernsWaterUse, 4);
        document.getElementById('smallTreesWater').innerHTML = intToString(game.trees.smallTreesWaterUse, 4);
        document.getElementById('treesWater').innerHTML = intToString(game.trees.treesWaterUse, 4);
    };

    this.updateFarms = function() {
        document.getElementById('farmsWater').innerHTML = intToString(game.farms.water);
        document.getElementById('farms').innerHTML = intToString(game.farms.farms);
        document.getElementById('food').innerHTML = intToString(game.farms.food);
        document.getElementById('foodCreated').innerHTML = intToString(game.farms.foodCreated, 4);
        document.getElementById('farmFoodEaten').innerHTML = intToString(game.population.foodEaten, 4);
        document.getElementById('efficiency').innerHTML = intToString(game.farms.efficiency*100, 1);
        document.getElementById('farmWaterToLake').innerHTML = intToString(game.farms.transferred, 4);
        document.getElementById('lakeWaterFromFarm').innerHTML = intToString(game.farms.transferred, 4);
    };

    this.updatePopulation = function() {
        document.getElementById('population').innerHTML = intToString(game.population.people);
        document.getElementById('foodEaten').innerHTML = intToString(game.population.foodEaten, 4);
        document.getElementById('populationGrowth').innerHTML = intToStringNegative(game.population.popGrowth, 4);
        document.getElementById('starving').innerHTML = intToString(game.population.starving, 4);
        document.getElementById('scienceDelta').innerHTML = intToString(game.population.scienceDelta, 4);
        document.getElementById('cashDelta').innerHTML = intToString(game.population.cashDelta, 4);
        document.getElementById('scienceRatio').innerHTML = game.population.scienceRatio+"% science";
        document.getElementById('scienceRatio').innerHTML = game.population.scienceRatio < 50 ? 100-game.population.scienceRatio+"% science" : game.population.scienceRatio+"% cash";

        document.getElementById('happiness').innerHTML = intToString(game.population.happiness, 4);
        document.getElementById('happinessFromHouse').innerHTML = intToString(game.population.houseBonus);
        document.getElementById('happinessFromTrees').innerHTML = intToString(game.population.happinessFromTrees, 4);
        document.getElementById('happinessFromOxygen').innerHTML = intToString(game.population.happinessFromOxygen, 4);
    };

    this.checkComputerUnlocked = function() {
        if(game.computer.unlocked) {
            document.getElementById('unlockedComputer').style.display = "inline-block";
            document.getElementById('unlockComputer').style.display = "none";
            document.getElementById('robotsContainer').style.display = "inline-block";
        } else {
            document.getElementById('unlockedComputer').style.display = "none";
            document.getElementById('unlockComputer').style.display = "inline-block";
            document.getElementById('robotsContainer').style.display = "none";
        }
    };

    this.checkRobotsUnlocked = function() {
        if(game.robots.unlocked) {
            if(game.robots.failed) {
                document.getElementById('unlockedRobots').style.display = "none";
                document.getElementById('failRobots').style.display = "inline-block";
            } else {
                document.getElementById('unlockedRobots').style.display = "inline-block";
                document.getElementById('unlockRobots').style.display = "none";
                document.getElementById('failRobots').style.display = "none";
                document.getElementById('lightningContainer').style.display = "inline-block";
                document.getElementById('lightningTooltip').style.display = "inline-block";
                document.getElementById('energyContainer').style.display = "inline-block";
                document.getElementById('woodContainer').style.display = "inline-block";
                document.getElementById('metalContainer').style.display = "inline-block";
            }
        } else {
            document.getElementById('unlockedRobots').style.display = "none";
            document.getElementById('unlockRobots').style.display = "inline-block";
            document.getElementById('lightningContainer').style.display = "none";
            document.getElementById('lightningTooltip').style.display = "none";
            document.getElementById('energyContainer').style.display = "none";
            document.getElementById('woodContainer').style.display = "none";
            document.getElementById('metalContainer').style.display = "none";
        }
    };

    this.updateComputerRowProgress = function() {
        if(!game.computer.unlocked) {
            return;
        }
        for(var i = 0; i < game.computer.processes.length; i++) {
            var row = game.computer.processes[i];
            var baseId = "computerRow" + i;
            document.getElementById(baseId+"PB").style.width = (row.currentTicks / row.ticksNeeded)*100 + "%";
            document.getElementById(baseId+"PB").style.backgroundColor = row.isMoving ? "yellow" : "red";
            document.getElementById(baseId+"CurrentTicks").innerHTML = row.currentTicks+"";
            document.getElementById(baseId+"TicksNeeded").innerHTML = row.ticksNeeded+"";
            if(row.cost !== 0) {
                document.getElementById(baseId+"Cost").style.display = "block";
                document.getElementById(baseId+"Cost").innerHTML = "Each tick costs "+intToString(row.cost) + " "+row.costType;
            } else {
                document.getElementById(baseId+"Cost").style.display = "none";
            }
        }
        document.getElementById('landOptimized').innerHTML = round2((game.land.optimizedLand / (game.land.baseLand * 10))*100)+"%";
    };

    this.updateComputer = function() {
        document.getElementById('freeThreads').innerHTML = game.computer.freeThreads+"";
        document.getElementById('threads').innerHTML = game.computer.threads+"";
        document.getElementById('speed').innerHTML = game.computer.speed+"";
        document.getElementById('threadCost').innerHTML = intToString(game.computer.getThreadCost(), 1);
        document.getElementById('speedCost').innerHTML = intToString(game.computer.getSpeedCost(), 1);
        for(var i = 0; i < game.computer.processes.length; i++) {
            var row = game.computer.processes[i];
            document.getElementById('computerRow'+i+'Threads').innerHTML = row.threads;
            document.getElementById('computerRow'+i+'Container').style.display = row.showing() ? "block" : "none";
        }
    };

    this.addComputerRow = function(dataPos) {
        var containerDiv = document.getElementById('computerRows');
        var rowContainer = document.createElement("div");
        rowContainer.className = "computerRow";
        var baseId = "computerRow" + dataPos;
        rowContainer.id = baseId + 'Container';
        var plusButton = "<div id='"+baseId+"Plus' class='button' onclick='game.computer.addThread("+dataPos+", 1)'>+</div>";
        var minusButton = "<div id='"+baseId+"Minus' class='button' onclick='game.computer.removeThread("+dataPos+", 1)'>-</div>";
        var threads = " <div id='"+baseId+"Threads' class='small' style='margin-right:4px'></div>" ;
        var text = "<div>" + processesView[dataPos].text + "</div>";
        var progressBar = "<div class='rowProgressBarOuter'><div class='rowProgressBarInner' id='"+baseId+"PB'></div></div>";

        var tooltip = "<div id='"+baseId+"CurrentTicks'></div> ticks<br>" +
            "<div id='"+baseId+"TicksNeeded'></div> ticks needed<br>" +
            "<div id='"+baseId+"Cost'></div><br>";
        var tooltipContainer = "<div class='computerTooltipContainer' id='"+baseId+"Tooltip'><div class='rowTooltip'>" + tooltip +  processesView[dataPos].tooltip + "</div></div>";
        rowContainer.onmouseover = function () {
            document.getElementById(baseId+"Tooltip").style.display = "block";
        };
        rowContainer.onmouseout = function() {
            document.getElementById(baseId+"Tooltip").style.display = "none";
        };

        rowContainer.innerHTML = plusButton + threads + minusButton + text + progressBar + tooltipContainer;
        containerDiv.appendChild(rowContainer);
    };

    this.updateRobots = function() {
        document.getElementById('robots').innerHTML = game.robots.robots+"";
        document.getElementById('robotsFree').innerHTML = game.robots.robotsFree+"";
        document.getElementById('robotMax').innerHTML = game.robots.robotMax+"";
        for(var i = 0; i < game.robots.jobs.length; i++) {
            var row = game.robots.jobs[i];
            document.getElementById('robotRow'+i+'Workers').innerHTML = row.workers;
            document.getElementById('robotRow'+i+'Container').style.display = row.showing() ? "block" : "none";
        }
    };

    this.updateRobotsRowProgress = function() {
        document.getElementById('ore').innerHTML = intToString(game.robots.ore);
        for(var i = 0; i < game.robots.jobs.length; i++) {
            var row = game.robots.jobs[i];
            var baseId = "robotRow" + i;
            if(!row.ticksNeeded) { //Has a progress bar
                continue;
            }
            document.getElementById(baseId+"PB").style.width = (row.currentTicks / row.ticksNeeded)*100 + "%";
            document.getElementById(baseId+"PB").style.backgroundColor = row.isMoving ? "yellow" : "red";
            document.getElementById(baseId+"CurrentTicks").innerHTML = row.currentTicks+"";
            document.getElementById(baseId+"TicksNeeded").innerHTML = intToString(row.ticksNeeded,1);
            if(row.cost) {
                document.getElementById(baseId+"Cost").style.display = "block";
                var costString = "Each tick costs "+intToString(row.cost[0]) + " "+row.costType[0];
                costString += row.cost.length > 1 ? " and " + intToString(row.cost[1]) + " " + row.costType[1] : "";
                document.getElementById(baseId+"Cost").innerHTML = costString;
            } else {
                document.getElementById(baseId+"Cost").style.display = "none";
            }
        }
        document.getElementById('totalDirtFromOre').innerHTML = intToString(game.robots.jobs[5].completions * 5);

    };

    this.addRobotRow = function(dataPos) {
        var containerDiv = document.getElementById('robotRows');
        var rowContainer = document.createElement("div");
        rowContainer.className = "robotRow";
        var baseId = "robotRow" + dataPos;
        rowContainer.id = baseId + 'Container';
        var plusButton = "<div id='"+baseId+"Plus' class='button' onclick='game.robots.addWorker("+dataPos+", 1)'>+</div>";
        var minusButton = "<div id='"+baseId+"Minus' class='button' onclick='game.robots.removeWorker("+dataPos+", 1)'>-</div>";
        var workers = " <div id='"+baseId+"Workers' class='small' style='margin-right:4px'></div>" ;
        var text = "<div>" + jobsView[dataPos].text + "</div>";

        if(game.robots.jobs[dataPos].ticksNeeded) {
            var tooltip = "<div id='"+baseId+"CurrentTicks'></div> ticks<br>" +
                "<div id='"+baseId+"TicksNeeded'></div> ticks needed<br>" +
                "<div id='"+baseId+"Cost'></div><br>";
            var progressBar = "<div class='rowProgressBarOuter'><div class='rowProgressBarInner' id='" + baseId + "PB'></div></div>";
        } else {
            tooltip = "";
            progressBar = "";
        }

        var tooltipContainer = "<div class='computerTooltipContainer' id='"+baseId+"Tooltip'><div class='rowTooltip'>" + tooltip + jobsView[dataPos].tooltip + "</div></div>";
        rowContainer.onmouseover = function () {
            document.getElementById(baseId+"Tooltip").style.display = "block";
        };
        rowContainer.onmouseout = function() {
            document.getElementById(baseId+"Tooltip").style.display = "none";
        };

        rowContainer.innerHTML = plusButton + workers + minusButton + text + progressBar + tooltipContainer;
        containerDiv.appendChild(rowContainer);
    };

    this.checkEnergyUnlocked = function() {
        if(game.energy.unlocked) {
            document.getElementById('unlockedEnergy').style.display = "inline-block";
            document.getElementById('unlockEnergy').style.display = "none";
            if(document.getElementById('spaceDockContainer').classList.contains("disabled")) {
                document.getElementById('spaceDockContainer').classList.remove("disabled");
            }
            this.updateRobots();
        } else {
            document.getElementById('unlockedEnergy').style.display = "none";
            document.getElementById('unlockEnergy').style.display = "inline-block";
            if(!document.getElementById('spaceDockContainer').classList.contains("disabled")) {
                document.getElementById('spaceDockContainer').classList.add("disabled");
            }
        }
    };

    this.updateEnergy = function() {
        document.getElementById('energy').innerHTML = intToString(game.power);
        document.getElementById('battery').innerHTML = intToString(game.energy.battery, 1);
        document.getElementById('spaceBattery').innerHTML = intToString(game.energy.battery, 1);
        document.getElementById('drain').innerHTML = intToString(game.energy.drain);
    };

    this.checkSpaceStationUnlocked = function() {
        if(game.energy.unlocked) {
            document.getElementById('spaceStationContainer').style.display = "inline-block";
        } else {
            document.getElementById('spaceStationContainer').style.display = "none";
        }

        if(game.spaceStation.unlocked) {
            document.getElementById('unlockedSpaceStation').style.display = "inline-block";
            document.getElementById('unlockSpaceStation').style.display = "none";
        } else {
            document.getElementById('unlockedSpaceStation').style.display = "none";
            document.getElementById('unlockSpaceStation').style.display = "inline-block";
        }
    };

    this.updateSpaceStation = function() {
        var orbitString = "";
        var orbitSendString = "";
        for(var i = 0; i < game.spaceStation.orbiting.length; i++) {
            orbitString += intToString(game.spaceStation.orbiting[i].amount) + " " + game.spaceStation.orbiting[i].type;
            orbitSendString += intToString(game.spaceStation.orbiting[i].amount / 10000, 4) + " " + game.spaceStation.orbiting[i].type;
            if(i !== game.spaceStation.orbiting.length - 1) {
                orbitString += ", ";
                orbitSendString += ", ";
            }
        }
        document.getElementById('orbitingResources').innerHTML = orbitString;
        document.getElementById('orbitSending').innerHTML = orbitSendString;
    };

    this.checkTractorBeamUnlocked = function() {
        if(game.spaceStation.unlocked) {
            document.getElementById('tractorBeamContainer').style.display = "inline-block";
        } else {
            document.getElementById('tractorBeamContainer').style.display = "none";
        }

        if(game.tractorBeam.unlocked) {
            document.getElementById('unlockedTractorBeam').style.display = "inline-block";
            document.getElementById('unlockTractorBeam').style.display = "none";
        } else {
            document.getElementById('unlockedTractorBeam').style.display = "none";
            document.getElementById('unlockTractorBeam').style.display = "inline-block";
        }
    };


    this.updateTractorBeam = function() {
        document.getElementById('tractorBeamEnergy').innerHTML = intToString(game.tractorBeam.energy, 2);
        document.getElementById('tractorBeamEnergyNeeded').innerHTML = intToString(game.tractorBeam.energyNeeded, 1);

        var container = document.getElementById("allPassing");
        var text = "";
        var comets = game.tractorBeam.comets;
        for(var i = 0; i < comets.length; i++) {
            text += comets[i].name + " with " +
                intToString(comets[i].amount, 1) +
                " " + comets[i].amountType +
                " passing in " + comets[i].duration + "<br>";
            this.drawComet(comets[i]);
        }
        container.innerHTML = text;
        document.getElementById('takeAmount').innerHTML = game.tractorBeam.takeAmount;
    };

    this.drawComet = function(cometData) {
        var cometDivName = 'comet'+cometData.id;
        var cometDiv = document.getElementById(cometDivName);
        if(!cometDiv) {
            cometDiv = document.createElement("div");
            cometDiv.className = cometData.name.toLowerCase();
            cometDiv.id = cometDivName;

            var totalDistance = cometData.speed * cometData.duration;
            cometData.startingY = Math.random() * (totalDistance * .4) + totalDistance * .1;

            cometData.left = 0;
            cometData.top = cometData.endingX = Math.pow(Math.pow(totalDistance, 2) - Math.pow(cometData.startingY, 2), .5); //c^2 = a^2 + b^2, a = sqrt(c^2 - b^2)
            //y = mx + b, m = (y-b)/x
            cometData.slope = (0 - cometData.startingY) / (cometData.endingX);
            document.getElementById('cometsContainer').appendChild(cometDiv);
        }
        cometData.left = (cometData.initialDuration - cometData.duration) / cometData.initialDuration * cometData.endingX;
        cometData.top = cometData.slope * cometData.left + cometData.startingY;
        cometDiv.style.left = cometData.left + "px";
        cometDiv.style.top = cometData.top + "px";

    };

    this.removeComet = function(cometData) {
        var cometDivName = 'comet'+cometData.id;
        var cometDiv = document.getElementById(cometDivName);
        if(cometDiv) {
            document.getElementById('cometsContainer').removeChild(cometDiv);
        } else {
            console.log('not found: '+cometData.id);
        }
    };

    this.updateSpaceDock = function() {
        document.getElementById('battleships').innerHTML = game.spaceDock.battleships+"";
    };

    this.checkSpaceDockUnlocked = function() {
        if(game.spaceDock.unlocked) {
            document.getElementById('spaceDockContainer').style.display = "inline-block";
            document.getElementById('hangarContainer').style.display = "inline-block";
            document.getElementById('spaceCanvas').style.display = "inline-block";
            document.getElementById('spaceContainer').style.display = "inline-block";
            document.getElementById('spaceTransition').style.display = "inline-block";
            document.getElementById('shipSpawnSlidersContainer').style.display = "inline-block";
        } else {
            document.getElementById('spaceDockContainer').style.display = "none";
            document.getElementById('hangarContainer').style.display = "none";
            document.getElementById('spaceCanvas').style.display = "none";
            document.getElementById('spaceContainer').style.display = "none";
            document.getElementById('spaceTransition').style.display = "none";
            document.getElementById('shipSpawnSlidersContainer').style.display = "none";
        }
    };

    this.updateHangar = function() {
        document.getElementById("hangar0Sending").innerHTML = game.hangars[0].sendRate + " in "+round1(game.hangars[0].timeRemaining/10) +" seconds.";
    };


    this.progressBar1 = new ProgressBar('nextStormProgress', '#21276a');
    this.progressBar2 = new ProgressBar('stormDurationProgress', '#1c7682');
}


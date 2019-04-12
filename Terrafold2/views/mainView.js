let view = {
    initialize: function() {
        //auto generated elements
        this.create.atmo();
        this.create.rivers();
        this.create.lakes();
        this.create.cbotRows();

    },
    updating: {
        update: function () {
            view.updating.atmo();
            view.updating.resources();
            view.updating.rivers();
            view.updating.lakes();
            view.updating.clouds();
            view.updating.cbotRows();
            view.updating.unique();

            view.updating.saveCurrentState();
        },
        saveCurrentState: function () {
            prevState.totalWater = totalWater;
            prevState.res = copyArray(res);
            prevState.localAtmo = copyArray(localAtmo);
            prevState.globalAtmo = copyArray(globalAtmo);
            prevState.rivers = copyArray(rivers);
            prevState.lakes = copyArray(lakes);
            prevState.clouds = copyArray(clouds);
            prevState.cbotRows = copyArray(cbotRows);
            prevState.unique = copyArray(unique);
        },
        resources: function() {
            if(intToString(prevState.totalWater, 1) !== intToString(totalWater, 1)) {
                document.getElementById("totalWater").innerHTML = intToString(totalWater, 1);
            }
            if(!prevState.res || prevState.res.cash !== res.cash) {
                document.getElementById("cash").innerHTML = res.cash;
            }
            if(!prevState.res || intToString(prevState.res.ice, 4) !== intToString(res.ice, 4)) {
                document.getElementById("ice").innerHTML = intToString(res.ice, 4);
            }
            if(!prevState.res || prevState.res.cbots !== res.cbots) {
                document.getElementById("cbots").innerHTML = res.cbots;
            }
            if(!prevState.res || prevState.res.cbotsMax !== res.cbotsMax) {
                document.getElementById("cbotsMax").innerHTML = res.cbotsMax;
            }
            if(!prevState.res || prevState.res.fbots !== res.fbots) {
                document.getElementById("fbots").innerHTML = res.fbots;
            }
            if(!prevState.res || prevState.res.fbotsMax !== res.fbotsMax) {
                document.getElementById("fbotsMax").innerHTML = res.fbotsMax;
            }
            if(!prevState.res || prevState.res.ore !== res.ore) {
                document.getElementById("ore").innerHTML = intToString(res.ore, 1);
            }
            if(!prevState.res || prevState.res.iron !== res.iron) {
                document.getElementById("iron").innerHTML = intToString(res.iron, 1);
            }
            if(!prevState.res || prevState.res.dirt !== res.dirt) {
                document.getElementById("dirt").innerHTML = intToString(res.dirt, 1);
            }
            if(!prevState.res || prevState.res.steel !== res.steel) {
                document.getElementById("steel").innerHTML = intToString(res.steel, 1);
            }
            if(!prevState.res || prevState.res.land !== res.land) {
                document.getElementById("land").innerHTML = intToString(res.land, 1);
            }
            if(!prevState.res || prevState.res.baseLand !== res.baseLand) {
                document.getElementById("baseLand").innerHTML = intToString(res.baseLand, 1);
            }
            if(!prevState.res || prevState.res.stations !== res.stations) {
                document.getElementById("stations").innerHTML = intToString(res.stations*50, 1);
            }
        },
        atmo: function() {
            for(let property in localAtmo) {
                if(localAtmo.hasOwnProperty(property)) {
                    if(!prevState.localAtmo || intToString(prevState.localAtmo[property], 4) !== intToString(localAtmo[property], 4)) {
                        document.getElementById("local"+property).innerHTML = intToString(localAtmo[property], 4);
                    }
                    if(!prevState.globalAtmo || intToString(prevState.globalAtmo[property], 4) !== intToString(globalAtmo[property], 4)) {
                        document.getElementById("global"+property).innerHTML = intToString(globalAtmo[property], 4);
                    }
                }
            }
        },
        rivers: function() {
            for(let i = 0; i < rivers.length; i++) {
                for(let j = 0; j < rivers[i].chunks.length; j++) {
                    if(!prevState.rivers || intToString(prevState.rivers[i].chunks[j].water, 2) !== intToString(rivers[i].chunks[j].water, 2)) {
                        document.getElementById(i + "_riverwater_" + j).innerHTML = intToString(rivers[i].chunks[j].water, 2);
                    }
                }
            }
        },
        lakes: function() {
            for(let i = 0; i < lakes.length; i++) {
                //efficiency over 5s
                addAndCapList(lakes[i].intakeList, lakes[i].intake, 100);

                let average = getAvgFromInts(lakes[i].intakeList);
                document.getElementById("lakeintakeavg_"+i).innerHTML = "<b>" + intToString(average, 4) + "</b> ("+intToString(average / lakes[i].intakeRate() * 100, 1) + ")%";

                if(!prevState.lakes || intToString(prevState.lakes[i].water, 4) !== intToString(lakes[i].water, 4)) {
                    document.getElementById("lakewater_"+i).innerHTML = intToString(lakes[i].water, 4);
                }
                if(!prevState.lakes || intToString(prevState.lakes[i].water, 1) !== intToString(lakes[i].water, 1)) {
                    document.getElementById("lakeminimum_"+i).innerHTML = intToString(lakes[i].minimum, 1);
                }
                if(!prevState.lakes || prevState.lakes[i].capacity !== lakes[i].capacity) {
                    document.getElementById("lakecapacity_"+i).innerHTML = intToString(lakes[i].capacity, 1);
                }
                if(!prevState.lakes || prevState.lakes[i].intake !== lakes[i].intake) {
                    document.getElementById("lakeintake_"+i).innerHTML = intToString(lakes[i].intake, 4);
                }
                if(!prevState.lakes || intToString(prevState.lakes[i].overflow, 4) !== intToString(lakes[i].overflow, 4)) {
                    document.getElementById("lakeoverflow_"+i).innerHTML = intToString(lakes[i].overflow, 4);
                }
                if(!prevState.lakes || prevState.lakes[i].electricity !== lakes[i].electricity) {
                    document.getElementById("lakeelectricity_"+i).innerHTML = intToString(lakes[i].electricity, 4);
                }
                if(!prevState.lakes || intToString(prevState.lakes[i].evaporated, 5) !== intToString(lakes[i].evaporated, 5)) {
                    document.getElementById("lakeevaporated_"+i).innerHTML = intToString(lakes[i].evaporated, 5);
                }
                if(!prevState.lakes || prevState.lakes[i].upgrade.generator !== lakes[i].upgrade.generator) {
                    document.getElementById("lakeefficiency_"+i).innerHTML = intToString(lakes[i].efficiency() * 100, 1) + "%";
                    document.getElementById("lakeefficiencycost_"+i).innerHTML = intToString(lakes[i].generatorCost(), 1);
                }
                if(!prevState.lakes || prevState.lakes[i].upgrade.intake !== lakes[i].upgrade.intake) {
                    document.getElementById("lakeintakeRate_"+i).innerHTML = intToString(lakes[i].intakeRate(), 5);
                    document.getElementById("lakeintakeRatecost_"+i).innerHTML = intToString(lakes[i].intakeCost(), 1);
                }
                if(!prevState.lakes || prevState.lakes[i].built !== lakes[i].built) {
                    if(lakes[i].built) {
                        addClassToDiv(document.getElementById("lakeToBuild_" + i), "gone");
                        removeClassFromDiv(document.getElementById("lakebuilt_" + i), "gone");
                    } else {
                        removeClassFromDiv(document.getElementById("lakeToBuild_" + i), "gone");
                        addClassToDiv(document.getElementById("lakebuilt_" + i), "gone");
                    }
                }
            }
        },
        clouds: function() {
            for(let i = 0; i < clouds.length; i++) {
                if(!prevState.clouds || intToString(prevState.clouds[i].water, 2) !== intToString(clouds[i].water, 2)) {
                    document.getElementById("cloudwater_"+i).innerHTML = intToString(clouds[i].water, 2);
                }
                if(i === 0 && (!prevState.clouds || intToString(prevState.clouds[i].rain, 4) !== intToString(clouds[i].rain, 4))) {
                    document.getElementById("cloudrain_"+i).innerHTML = intToString(clouds[i].rain, 4);
                }
                if(i === 0 && (!prevState.clouds || intToString(prevState.clouds[i].rainTimer/20, 1) !== intToString(clouds[i].rainTimer/20, 1))) {
                    document.getElementById("cloudrainTimer_"+i).innerHTML = intToString(clouds[i].rainTimer/20, 1)+"s";
                }
                if(i === 0 && (!prevState.clouds || intToString(prevState.clouds[i].rainDuration/20, 1) !== intToString(clouds[i].rainDuration/20, 1))) {
                    document.getElementById("cloudrainDuration_"+i).innerHTML = intToString(clouds[i].rainDuration/20, 1)+"s";
                }
                if(i !== 0 && (!prevState.clouds || intToString(prevState.clouds[i].windTimer/20, 1) !== intToString(clouds[i].windTimer/20, 1))) {
                    document.getElementById("cloudwindTimer_"+i).innerHTML = intToString(clouds[i].windTimer/20, 1)+"s";
                }
            }
        },
        cbotRows: function() {
            for(let i = 0; i < cbotRows.length; i++) {
                if(!prevState.cbotRows || prevState.cbotRows[i].pCurrent !== cbotRows[i].pCurrent) {
                    document.getElementById("progress" + cbotRows[i].id).style.width = (cbotRows[i].pCurrent / cbotRows[i].pNeeded * 100) + "%";
                    document.getElementById("pSecs"+cbotRows[i].id).innerHTML = intToString((cbotRows[i].pNeeded - cbotRows[i].pCurrent)/20/(cbotRows[i].cbotCount ? cbotRows[i].cbotCount : 1), 2) + "s";
                }
                if(!prevState.cbotRows || prevState.cbotRows[i].numLeft !== cbotRows[i].numLeft) {
                    document.getElementById("numLeft" + cbotRows[i].id).innerHTML = cbotRows[i].numLeft;
                }
                if(!prevState.cbotRows || prevState.cbotRows[i].cbotCount !== cbotRows[i].cbotCount) {
                    document.getElementById("cbotCount"+cbotRows[i].id).innerHTML = cbotRows[i].cbotCount;
                }
                if(!prevState.cbotRows || prevState.cbotRows[i].auto !== cbotRows[i].auto) {
                    document.getElementById("auto"+i).checked = cbotRows[i].auto;
                }
                if(!prevState.cbotRows || prevState.cbotRows[i].unlocked !== cbotRows[i].unlocked) {
                    if(i === 3 && donationList[47]) {
                        removeClassFromDiv(document.getElementById("cbotContainer" + i), "gone"); //unlocked
                    } else if(cbotRows[i].hidden) {
                        addClassToDiv(document.getElementById("cbotContainer" + i), "gone");
                    } else if(!lakes[cbotRows[i].lake].built) {
                        addClassToDiv(document.getElementById("cbotContainer" + i), "gone");
                    } else if(cbotRows[i].unlocked === false) { //hidden
                        removeClassFromDiv(document.getElementById("unlockButton" + i), "gone");
                        addClassToDiv(document.getElementById("cbotContainer" + i), "gone");
                    } else {
                        addClassToDiv(document.getElementById("unlockButton" + i), "gone");
                        removeClassFromDiv(document.getElementById("cbotContainer" + i), "gone");
                    }

                }
                if(!prevState.cbotRows || JSON.stringify(prevState.cbotRows[i].cost) === JSON.stringify(cbotRows[i].cost)) {
                    let costString = " Costs ";
                    for(let property in cbotRows[i].cost) {
                        if(cbotRows[i].cost.hasOwnProperty(property)) {
                            costString +=  capitalizeFirst(property) + ": " + "<b>" + cbotRows[i].cost[property] + "</b> ";
                        }
                    }
                    costString = costString.substring(0, costString.length - 2) + ". ";
                    document.getElementById("cbotCost"+i).innerHTML = costString;
                }
            }
        },
        unique: function() {
            if(!prevState.unique || prevState.unique.depth !== unique.depth) {
                document.getElementById("depth").innerHTML = unique.depth+"m";
            }
            if(!prevState.unique || prevState.unique.pressure !== unique.pressure) {
                document.getElementById("pressure").innerHTML = intToString(unique.pressure*100, 3) + "%";
                let actualDepth = unique.depthNeeded / unique.pressure;
                document.getElementById("depthNeeded").innerHTML = intToString(actualDepth, 2)+"m";
            }
            if(!prevState.unique || intToString(prevState.unique.volcDur/20, 1) !== intToString(unique.volcDur/20, 1)) {
                document.getElementById("volcDur").innerHTML = intToString(unique.volcDur/20, 1)+"s";
            }
            if(!prevState.unique || prevState.unique.volcMult !== unique.volcMult) {
                let output = cbotData.helpers.getVolcanoOutput();
                document.getElementById("volcOutput").innerHTML = "Spewing Water: <div class='preciseNum'>" + output.water + "</div> and CO2: <div class='preciseNum'>" + output.co2 + "</div>";
            }
        }
    },
    create: {
        atmo: function() {
            let localDivText = "<div style='width:110px'>Local Atmosphere</div>";
            let globalDivText = "<br><div style='width:110px'>Global Atmosphere</div>";
            for(let property in localAtmo) {
                if(localAtmo.hasOwnProperty(property)) {
                    localDivText += property.toUpperCase() + ": <div id='local"+property+"' class='preciseNum'></div>";
                    globalDivText += property.toUpperCase() + ": <div id='global"+property+"' class='preciseNum'></div>";
                }
            }

            document.getElementById("atmoContainer").innerHTML = localDivText + globalDivText;
        },
        rivers: function() {
            for(let i = 0; i < rivers.length; i++) {
                let divText = "";
                let river = rivers[i];
                for(let j = 0; j < river.chunks.length; j++) {
                    divText += "River "+i+"_" + j + " water: <div id='"+i+"_riverwater_"+j+"' class='preciseNum'></div><br>";
                }

                document.getElementById("riverContainer" + i).innerHTML = divText;
            }
        },
        lakes: function() {
            for(let i = 0; i < lakes.length; i++) {
                let divText = "";

                let costString = "";
                if(lakes[i].buildCost) {
                    for(let property in lakes[i].buildCost) {
                        if(lakes[i].buildCost.hasOwnProperty(property)) {
                            costString += lakes[i].buildCost[property] + " " + capitalizeFirst(property) + ", ";
                        }
                    }
                    costString = costString.substring(0, costString.length - 2);
                }

                divText += "Lake "+i+
                    " water: <div id='lakewater_"+i+"' class='preciseNum'></div>" +
                    " evaporated: <div id='lakeevaporated_"+i+"' class='preciseNum'></div>" +
                    "<div id='lakebuilt_"+i+"' class='"+(lakes[i].built ? "" : "gone")+"'> minimum: <div id='lakeminimum_"+i+"' class='preciseNum'></div>" +
                    " capacity: <div id='lakecapacity_"+i+"' class='preciseNum'></div>" +
                    " intake: <div id='lakeintake_"+i+"' class='preciseNum'></div>" +
                    " intake average: <div id='lakeintakeavg_"+i+"' style='width:90px;'></div>" +
                    " overflow: <div id='lakeoverflow_"+i+"' class='preciseNum'></div>" +
                    " electricity: <div id='lakeelectricity_"+i+"' class='preciseNum'></div></div>" +
                    "<div id='lakeToBuild_"+i+"' class='button "+(!lakes[i].built ? "" : "gone")+"' onclick='clickBuildDam("+i+")'>Build Dam for "+costString+"</div>" +
                    "<br>";

                divText += "<div id='lakeiron_"+i+"' class='block gone'>Upgrades " +
                    "<div class='button' onclick='buyGenerator("+i+")'>Upgrade Generator (+1%)</div> Iron Cost: <div class='preciseNum' id='lakeefficiencycost_"+i+"'></div> Current: <div class='preciseNum' id='lakeefficiency_"+i+"'></div>" +
                    "<div id='lakesteel_"+i+"' class='hidden'><div class='button' onclick='buyIntake("+i+")'>Upgrade Intake (+"+lakes[i].intakeRate()+")</div> Steel Cost: <div class='preciseNum' id='lakeintakeRatecost_"+i+"'></div> Current: <div class='preciseNum' id='lakeintakeRate_"+i+"'></div></div>" +
                    "</div>";

                divText += "Cloud "+i+
                    " water: <div id='cloudwater_"+i+"' class='preciseNum'></div>" +
                    (i !== 0 ? "" : " rain: <div id='cloudrain_"+i+"' class='preciseNum'></div>") +
                    (i !== 0 ? "" : " next rain: <div id='cloudrainTimer_"+i+"' class='preciseNum'></div>") +
                    (i !== 0 ? "" : " rain stops: <div id='cloudrainDuration_"+i+"' class='preciseNum'></div>") +
                    (i === 0 ? "" : " next wind: <div id='cloudwindTimer_"+i+"' class='preciseNum'></div>") +
                    "<br>";

                document.getElementById("lakeContainer" + i).innerHTML = divText;
            }
        },
        cbotRows: function() {
            for(let i = 0; i < cbotRows.length; i++) {
                let divText = "";
                let cbotRow = cbotRows[i];

                divText += (cbotRow.unlockButton ? cbotRow.unlockButton : "") +
                    "<div id='cbotContainer"+cbotRow.id+"' style='display:block' class='"+(cbotRow.hidden ? "gone" : "")+"'><div class='bold' style='width:110px'>" + cbotRow.name + "</div>" +
                    " "+cbotRow.type.toUpperCase()+".Bots <div id='cbotCount"+cbotRow.id+"' class='bold'></div> <div class='fa fa-plus clickable' onclick='addCbots("+cbotRow.id+")'></div> <div class='fa fa-minus clickable' onclick='subtractCbots("+cbotRow.id+")'></div>" +
                    " Num Left <div id='numLeft"+cbotRow.id+"' class='bold'></div> <div class='fa fa-plus clickable' onclick='addNumLeft("+cbotRow.id+")'></div> <div class='fa fa-minus clickable' onclick='subtractNumLeft("+cbotRow.id+")'></div>" +
                    " <div class='progressOuter'><div class='progressInner' id='progress"+cbotRow.id+"'></div><div id='pSecs"+cbotRow.id+"' style='color:white;' class='abs bold small'></div></div>" +
                    " <label for='auto"+cbotRow.id+"'>Auto</label><input type='checkbox' id='auto"+cbotRow.id+"' onchange='changeAuto("+cbotRow.id+")'>" +
                    "<div id='cbotCost"+cbotRow.id+"'></div>" +
                    cbotRow.uniqueDiv +
                    "</div>";

                document.getElementById("lakeContainer" + cbotRows[i].lake).innerHTML += divText;
            }

        },
        donationMessage: function() {
            let divText = "";
            for(let i = 0; i < donationsShowing.length; i++) {
                divText += "<div class='donationContainer' onclick='removeDonation("+i+")'>" +
                    "<div class='donationReward'>Got <b>"+donationsShowing[i].reward+"</b> from " + donationsShowing[i].user + "</div><br>" +
                    "<div class='donationMessage'>"+donationsShowing[i].message+"</div><br>" +
                    "<div class='donationReason'>(Reason: "+donationsShowing[i].reason+")</div>" +
                    "</div><br>";
            }
            document.getElementById("donationsContainer").innerHTML = divText;
        }
    }
};

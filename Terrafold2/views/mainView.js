let view = {
    initialize: function() {
        //auto generated elements
        this.create.rivers();
        this.create.lakes();

    },
    updating: {
        update: function () {
            view.updating.resources();
            view.updating.rivers();
            view.updating.lakes();
            view.updating.clouds();

            view.updating.saveCurrentState();
        },
        saveCurrentState: function () {
            prevState.cash = cash;
            prevState.ice = ice;
            prevState.totalWater = totalWater;
            prevState.rivers = copyArray(rivers);
            prevState.lakes = copyArray(lakes);
            prevState.clouds = copyArray(clouds);
        },
        resources: function() {
            if(prevState.totalWater !== totalWater) {
                document.getElementById("totalWater").innerHTML = intToString(totalWater, 1);
            }
            if(prevState.cash !== cash) {
                document.getElementById("cash").innerHTML = cash;
            }
            if(prevState.ice !== ice) {
                document.getElementById("ice").innerHTML = intToString(ice, 4);
            }
        },
        rivers: function() {
            for(let i = 0; i < rivers.length; i++) {
                for(let j = 0; j < rivers[i].chunks.length; j++) {
                    if(!prevState.rivers || prevState.rivers[i].chunks[j].water !== rivers[i].chunks[j].water) {
                        document.getElementById(i + "_riverwater_" + j).innerHTML = intToString(rivers[i].chunks[j].water, 4);
                    }
                }
            }
        },
        lakes: function() {
            for(let i = 0; i < lakes.length; i++) {
                if(!prevState.lakes || prevState.lakes[i].water !== lakes[i].water) {
                    document.getElementById("lakewater_"+i).innerHTML = intToString(lakes[i].water, 4);
                }
                if(!prevState.lakes || prevState.lakes[i].water !== lakes[i].water) {
                    document.getElementById("lakeminimum_"+i).innerHTML = intToString(lakes[i].minimum, 1);
                }
                if(!prevState.lakes || prevState.lakes[i].capacity !== lakes[i].capacity) {
                    document.getElementById("lakecapacity_"+i).innerHTML = intToString(lakes[i].capacity, 1);
                }
                if(!prevState.lakes || prevState.lakes[i].intake !== lakes[i].intake) {
                    document.getElementById("lakeintake_"+i).innerHTML = intToString(lakes[i].intake, 4);
                }
                if(!prevState.lakes || prevState.lakes[i].overflow !== lakes[i].overflow) {
                    document.getElementById("lakeoverflow_"+i).innerHTML = intToString(lakes[i].overflow, 4);
                }
                if(!prevState.lakes || prevState.lakes[i].electricity !== lakes[i].electricity) {
                    document.getElementById("lakeelectricity_"+i).innerHTML = intToString(lakes[i].electricity, 4);
                }
                if(!prevState.lakes || prevState.lakes[i].evaporated !== lakes[i].evaporated) {
                    document.getElementById("lakeevaporated_"+i).innerHTML = intToString(lakes[i].evaporated, 5);
                }
            }
        },
        clouds: function() {
            for(let i = 0; i < clouds.length; i++) {
                if(!prevState.clouds || prevState.clouds[i].water !== clouds[i].water) {
                    document.getElementById("cloudwater_"+i).innerHTML = intToString(clouds[i].water, 4);
                }
                if(i === 0 && (!prevState.clouds || prevState.clouds[i].rain !== clouds[i].rain)) {
                    document.getElementById("cloudrain_"+i).innerHTML = intToString(clouds[i].rain, 4);
                }
                if(i === 0 && (!prevState.clouds || prevState.clouds[i].rainTimer !== clouds[i].rainTimer)) {
                    document.getElementById("cloudrainTimer_"+i).innerHTML = intToString(clouds[i].rainTimer/20, 1)+"s";
                }
                if(i === 0 && (!prevState.clouds || prevState.clouds[i].rainDuration !== clouds[i].rainDuration)) {
                    document.getElementById("cloudrainDuration_"+i).innerHTML = intToString(clouds[i].rainDuration/20, 1)+"s";
                }
                if(i !== 0 && (!prevState.clouds || prevState.clouds[i].windTimer !== clouds[i].windTimer)) {
                    document.getElementById("cloudwindTimer_"+i).innerHTML = intToString(clouds[i].windTimer/20, 1)+"s";
                }

            }
        }
    },
    create: {
        rivers: function() {
            for(let i = 0; i < rivers.length; i++) {
                let divText = "";
                let river = rivers[i];
                for(let j = 0; j < river.chunks.length; j++) {
                    divText += "River "+i+" Chunk " + j + ": <div id='"+i+"_riverwater_"+j+"' class='preciseNum'></div> water<br>";
                }

                document.getElementById("riverContainer" + i).innerHTML = divText;
            }
        },
        lakes: function() {
            for(let i = 0; i < lakes.length; i++) {
                let divText = "";
                divText += "Lake "+i+
                    " water: <div id='lakewater_"+i+"' class='preciseNum'></div>" +
                    " minimum: <div id='lakeminimum_"+i+"' class='preciseNum'></div>" +
                    " capacity: <div id='lakecapacity_"+i+"' class='preciseNum'></div>" +
                    " intake: <div id='lakeintake_"+i+"' class='preciseNum'></div>" +
                    " overflow: <div id='lakeoverflow_"+i+"' class='preciseNum'></div>" +
                    " electricity: <div id='lakeelectricity_"+i+"' class='preciseNum'></div>" +
                    " evaporated: <div id='lakeevaporated_"+i+"' class='preciseNum'></div>" +
                    "<br>";

                divText += "Cloud "+i+
                    " water: <div id='cloudwater_"+i+"' class='preciseNum'></div>" +
                    (i !== 0 ? "" : " rain: <div id='cloudrain_"+i+"' class='preciseNum'></div>") +
                    (i !== 0 ? "" : " next rain: <div id='cloudrainTimer_"+i+"' class='preciseNum'></div>") +
                    (i !== 0 ? "" : " rain stops: <div id='cloudrainDuration_"+i+"' class='preciseNum'></div>") +
                    (i === 0 ? "" : " next wind: <div id='cloudwindTimer_"+i+"' class='preciseNum'></div>") +
                    "<br>";

                document.getElementById("lakeContainer" + i).innerHTML = divText;
            }
        }
    }
};

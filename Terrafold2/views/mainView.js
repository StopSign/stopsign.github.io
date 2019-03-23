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

            view.updating.saveCurrentState();
        },
        saveCurrentState: function () {
            prevState.cash = cash;
            prevState.ice = ice;
            prevState.totalWater = totalWater;
            prevState.rivers = copyArray(rivers);
            prevState.lakes = copyArray(lakes);
        },
        resources: function() {
            // if(prevState.totalWater !== totalWater) {
            //     document.getElementById("totalWater").innerHTML = round5(totalWater);
            // }
            if(prevState.cash !== cash) {
                document.getElementById("cash").innerHTML = cash;
            }
            if(prevState.ice !== ice) {
                document.getElementById("ice").innerHTML = round5(ice);
            }
        },
        rivers: function() {
            for(let i = 0; i < rivers.length; i++) {
                for(let j = 0; j < rivers[i].chunks.length; j++) {
                    if(!prevState.rivers || prevState.rivers[i].chunks[j].water !== rivers[i].chunks[j].water) {
                        document.getElementById(i + "_riverwater_" + j).innerHTML = round5(rivers[i].chunks[j].water);
                    }
                }
            }
        },
        lakes: function() {
            for(let i = 0; i < lakes.length; i++) {
                if(!prevState.lakes || prevState.lakes[i].capacity !== lakes[i].capacity) {
                    document.getElementById("lakecapacity_"+i).innerHTML = intToString(lakes[i].capacity, 1);
                }
                if(!prevState.lakes || prevState.lakes[i].water !== lakes[i].water) {
                    document.getElementById("lakewater_"+i).innerHTML = round5(lakes[i].water);
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
                    divText += "River "+i+" Chunk " + j + ": <div id='"+i+"_riverwater_"+j+"'></div> water<br>";
                }

                document.getElementById("riverContainer" + i).innerHTML = divText;
            }
        },
        lakes: function() {
            for(let i = 0; i < lakes.length; i++) {
                let divText = "";
                divText += "Lake "+i+" capacity: <div id='lakecapacity_"+i+"'></div> water: <div id='lakewater_"+i+"'></div><br>";

                document.getElementById("lakeContainer" + i).innerHTML = divText;
            }
        }
    }
};

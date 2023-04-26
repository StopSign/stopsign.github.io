let view = {
    initialize: function() {
        //auto generated elements
        // this.create.atmo();
    },
    updating: {
        update: function () {
            view.updating.resources();

            view.updating.saveCurrentState();
        },
        saveCurrentState: function () {
            prevState.res = copyArray(res);
            // prevState.localAtmo = copyArray(localAtmo);
        },
        resources: function() {
            // if(intToString(prevState.totalWater, 1) !== intToString(totalWater, 1)) {
            //     document.getElementById("totalWater").innerHTML = intToString(totalWater, 1);
            // }
            if(intToString(prevState.popTax, 3) !== intToString(res.popTax, 3)) {
                document.getElementById("popTax").innerHTML = intToString(res.popTax, 3);
            }
            if(intToString(prevState.pop, 2) !== intToString(res.pop, 2)) {
                document.getElementById("pop").innerHTML = intToString(res.pop, 2);
            }
            if(intToString(prevState.popNet, 3) !== intToString(res.popNet, 3)) {
                document.getElementById("popNet").innerHTML = intToString(res.popNet, 3);
            }
            if(intToString(prevState.popGrowth, 2) !== intToString(res.popGrowth, 2)) {
                document.getElementById("popGrowth").innerHTML = intToString(res.popGrowth, 2);
            }
            if(intToString(prevState.civTime, 2) !== intToString(res.civTime, 2)) {
                document.getElementById("civTime").innerHTML = intToString(res.civTime/ticksPerSecond, 2);
            }
            if(intToString(prevState.jobs, 1) !== intToString(res.jobs, 1)) {
                document.getElementById("jobs").innerHTML = intToString(res.jobs, 1);
            }
            if(intToString(prevState.vSouls, 3) !== intToString(res.vSouls, 3)) {
                document.getElementById("vSouls").innerHTML = intToString(res.vSouls, 3);
            }
            if(intToString(prevState.vSoulGain, 4) !== intToString(res.vSoulGain, 4)) {
                document.getElementById("vSoulGain").innerHTML = intToString(res.vSoulGain, 4);
            }


            if(intToString(prevState.jobs, 1) !== intToString(res.jobs, 1)) {
                document.getElementById("jobs").innerHTML = intToString(res.jobs, 1);
            }
            if(intToString(prevState.hunters, 1) !== intToString(res.hunters, 1)) {
                document.getElementById("hunters").innerHTML = intToString(res.hunters, 1);
            }
            if(intToString(prevState.hunterMax, 1) !== intToString(res.hunterMax, 1)) {
                document.getElementById("hunterMax").innerHTML = intToString(res.hunterMax, 1);
                document.getElementById("hunterGain").innerHTML = intToString(res.hunterMax/2, 1);
            }
        }
    },
    create: {
        createButton(buttonDatum, pos) {
            let buttonHTML = "<div class='button abs showthat' onclick='buttonData[" + pos + "].onclick()' " +
                "style='top:" + buttonDatum.y + "px;left:" + buttonDatum.x + "px'>" +
                buttonDatum.text +
                "<div class='showthis'>" + buttonDatum.tooltip + "</div>" +
                "</div>";

            let elem = document.createElement("div");
            elem.innerHTML = buttonHTML;
            document.getElementById("modulesDiv").append(elem);
        }
    },
    finishLoop:  function() {
        document.getElementById("vSoulDiff").innerHTML = res.vSoulDiff;
    }
};

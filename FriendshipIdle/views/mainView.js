let view = {
    triggered: {
        changeGlassVisibility: function() {
            glassIds.forEach((id) => {
                const element = document.getElementById(id);
                if (element) {
                    element.style.visibility = data.showGlass ? 'visible' : 'hidden';
                }
            });
        },
        changeDoorsVisibility: function() {
            doorIds.forEach((id) => {
                const element = document.getElementById(id);
                if (element) {
                    element.style.visibility = data.showDoors ? 'visible' : 'hidden';
                }
            });
        }
    },
    update: {
        tick: function () {

            view.update.saveCurrentState();
            view.update.numberLabels();
        },
        saveCurrentState: function () {
            prevState.res = copyArray(res);
            // prevState.localAtmo = copyArray(localAtmo);
        },
        resources: function() {
            // if(intToString(prevState.totalWater, 1) !== intToString(totalWater, 1)) {
            //     document.getElementById("totalWater").innerHTML = intToString(totalWater, 1);
            // }
        },
        numberLabels: function() {
            for(let i = 0; i < labels.numbers.length; i++) {
                let obj = labels.numbers[i];

                let displayText = data[obj.variableName];
                if(obj.modifiers.type === "money") {
                    displayText = "$" + intToString(displayText, 3);
                }
                if(document.getElementById(obj.id).innerHTML !== displayText) {
                    document.getElementById(obj.id).innerHTML = displayText;
                }
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
    }
};



function registerNumberLabel(id, modifiers, variableName) {
    if(variableName && !data[variableName]) {
        data[variableName] = 0;
    } else if(!data[id]) {
        data[id] = 0;
        variableName = id;
    }
    labels.numbers.push({id:id, variableName:variableName, modifiers:modifiers});
}

let view = {
    initialize: function() {
        //auto generated elements
        // this.create.atmo();
        document.getElementById("modulesDiv").innerHTML = buttonHTML;
    },
    updating: {
        update: function () {
            // view.updating.atmo();

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
        }
    },
    create: {

    }
};

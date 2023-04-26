const game = {
    update() {
        // Decrease river by 3% and increase great lake by 3%
        let toTake = data.rivers[data.numOfRivers-1] * .01;
        data.rivers[data.numOfRivers-1] -= toTake;
        data.greatLake += toTake;

        for(let i = 0; i < data.numOfRivers-1; i++) {
            toTake = data.rivers[i] * .01;
            data.rivers[i] -= toTake;
            data.rivers[i+1] += toTake;
        }

        // Decrease mountain lake by 1% and increase river by 1%
        toTake = data.mountainLake * .001;
        data.mountainLake -= toTake;
        data.rivers[0] += toTake;

        // Take water from the reserve and pump it to the mountain lake
        data.pumpProgress += data.pumpRate;
        progressBar.style.width = `${data.pumpProgress}%`;

        if (data.pumpProgress >= 100) {
            data.pumpProgress = 0;
            if(data.reserve <= data.pump) {
                data.mountainLake += data.reserve;
                data.reserve = 0;
            } else {
                data.reserve -= data.pump;
                data.mountainLake += data.pump;
            }
        }

        // Decrease ice by 1% and increase reserve by 1%
        toTake = data.ice * .001;
        data.ice -= toTake;
        data.reserve += toTake;
    }
};
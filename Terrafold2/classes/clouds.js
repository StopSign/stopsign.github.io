window.cloudData = {
    create: function() {
        let cloud = {
            water:0,
            rain: 0,
            rainTimer: 2000 + (1200 * clouds.length),
            rainDuration: 400,
            windTimer: 9600 - 1200 * clouds.length
        };
        clouds.push(cloud);
    },
    tick: function() {
        for(let i = 0; i < clouds.length; i++) {
            let cloud = clouds[i];
            if(i !== 0) {  //no wind on cloud 0
                cloud.windTimer--;
                if(cloud.windTimer <= 0) {
                    cloud.windTimer += 5 * 60 * 20;
                    let transfer = cloud.water * .8;
                    cloud.water -= transfer;
                    clouds[i - 1].water += transfer;
                }
            }
            if(i === 0) { //only rain on cloud 0
                if(cloud.rainDuration === 400) {
                    cloud.rainTimer--;
                    if(cloud.rainTimer === 0) {
                        cloud.rainTimer += 2000;
                        cloud.rainDuration--;
                    }
                } else {
                    //raining
                    cloud.rainDuration--;
                    if(cloud.rainDuration === 0) {
                        cloud.rainDuration = 400;
                        cloud.rain = 0;
                    } else {
                        cloud.rain = cloud.water * .001;
                        cloud.water -= cloud.rain;
                        lakes[i].water += cloud.rain;
                    }
                }
            }
        }
        cloudData.tickAtmo()
    },
    tickAtmo: function() {
        for(let property in localAtmo) {
            if(localAtmo.hasOwnProperty(property)) {
                let toGlobal = localAtmo[property] * .0001;
                let toLocal = globalAtmo[property] * .000001;
                localAtmo[property] = localAtmo[property] - toGlobal + toLocal;
                globalAtmo[property] = globalAtmo[property] - toLocal + toGlobal;
            }
        }
    }
};
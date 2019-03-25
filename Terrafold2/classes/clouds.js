window.cloudData = {
    create: function() {
        let cloud = {
            water:0,
            rain: 0,
            rainTimer: 2000 + (1200 * clouds.length),
            rainDuration: 400,
            windTimer: 18000 - 3600 * clouds.length //3 minutes
        };
        clouds.push(cloud);
    },
    tick: function() {
        for(let i = 0; i < clouds.length; i++) {
            let cloud = clouds[i];
            if(i !== 0) {  //no wind on cloud 0
                cloud.windTimer--;
                if(cloud.windTimer <= 0) {
                    cloud.windTimer += 18000; //15 minutes
                    let transfer = cloud.water * .9;
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
                    } else {
                        cloud.rain = cloud.water * .001;
                        cloud.water -= cloud.rain;
                        lakes[i].water += cloud.rain;
                    }
                }
            }
        }
    }
};
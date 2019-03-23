

function tick() {
    if(stop) {
        return;
    }
    timer++;
    handleFPSDifference();

    game.tick();
    view.update();

    if(timer % 100 === 0) {
        save();
    }
}

function recalcInterval(newSpeed) {
    doWork.postMessage({stop:true});
    doWork.postMessage({start:true,ms:(1000 / newSpeed)});
}

function handleFPSDifference() {
    timeList.push(new Date().getTime());
    if(timeList.length > 10) {
        timeList.splice(0, 1);
        //var fps = msWaitTime/((timeList[timeList.length-1] - timeList[0]) / (timeList.length-1))*100;
        //multFromFps = 100/fps;
        //$scope.fps = round(fps)+"%";
    } else {
        //multFromFps = 1;
        //$scope.fps = "...";
    }
}
function pauseGame() {
    stop = !stop;
}
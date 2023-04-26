let bonusSpeed = 1;
let ticksPerSecond = 50;
let stop = 0;

let isFileSystem = !!location.href.match("file");
let gameSpeed = 1;

let curTime = new Date();
let gameTicksLeft = 0;
let radarUpdateTime = 0;
// let prevState = {};


function tick() {
    let newTime = new Date();
    gameTicksLeft += newTime - curTime;
    radarUpdateTime += newTime - curTime;
    curTime = newTime;
    if(stop) {
        // addOffline(gameTicksLeft * offlineRatio);
        // gameTicksLeft = 0;
        return;
    }
    // prevState.stats = JSON.parse(JSON.stringify(stats));

    while (gameTicksLeft > (1000 / ticksPerSecond)) {
        if(gameTicksLeft > 2000) {
            window.fps /= 2;
            console.warn('too fast! (${gameTicksLeft})');
            // statGraph.graphObject.options.animation.duration = 0;
            gameTicksLeft = 0;
        }
        if(stop) {
            return;
        }

        game.update();

        timer++;

        if(timer % (300*gameSpeed) === 0) {
            //save();
        }
        gameTicksLeft -= (1000 / 50) / gameSpeed / bonusSpeed;

        if(bonusSpeed > 1) {
            // addOffline(-1 * gameTicksLeft * ((bonusSpeed - 1)/bonusSpeed));
        }
    }

    view.update();
}

// function recalcInterval(fps) {
//     window.fps = fps;
//     if(mainTickLoop !== undefined) {
//         clearInterval(mainTickLoop);
//     }
//     if(isFileSystem) {
//         mainTickLoop = setInterval(tick, 1000/fps);
//     } else {
//         doWork.postMessage({stop: true});
//         doWork.postMessage({start: true, ms: (1000 / fps)});
//     }
// }
//
// function pauseGame() {
//     stop = !stop;
//     document.title = stop ? "*PAUSED* Idle Loops" : "Idle Loops";
//     document.getElementById('pausePlay').innerHTML = _txt("time_controls>"+ (stop ? 'play_button' : 'pause_button'));
//     if(!stop && (shouldRestart || timer >= timeNeeded)) {
//         restart();
//     }
// }



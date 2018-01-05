var myKeyQueue = [];
document.addEventListener("keydown", function(e) {
    var code = {key:(e.charCode !== 0 ? e.charCode : e.keyCode), shift:e.shiftKey};
    myKeyQueue.push(code);
    processKeyQueue();
});

function processKeyQueue() {
    var key = myKeyQueue[0].key;
    var shift = myKeyQueue[0].shift;
    myKeyQueue.splice(0, 1);
    if(key === 27) { //escape
    } else if(key === 13 || key === 32) { //enter / space
    } else if(key === 38 || key === 87) { //w
    } else if(key === 40 || key === 83) { //s
    } else if(key === 37 || key === 65) { //a
    } else if(key === 39 || key === 68) { //d
    } else if(key === 66) { //b
        game.buyIce()
    } else if(key === 81) { //q
    } else if(key === 69) { //e
    } else if(key === 82) { //r
    } else if(key === 76) { //l
    } else if(key === 72) { //h
    } else if(key === 73) { //i
    } else if(key === 85) { //u
    } else if(key === 49) { //1
    } else if(key === 50) { //2
    } else if(key === 51) { //3
    } else if(key === 52) { //4
    } else if(key === 53) { //5
    } else if(key === 54) { //6
    } else if(key === 55) { //7
    }
}

var keys = {32: 1, 37: 1, 38: 1, 39: 1, 40: 1};

function preventDefault(e) {
    e = e || window.event;
    if (e.preventDefault)
        e.preventDefault();
    e.returnValue = false;
}

function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}

function disableScroll() {
    document.onkeydown  = preventDefaultForScrollKeys;
}
disableScroll();



var backgroundGrid = document.getElementById('mainContainer');
var rclickStartingPoint;

backgroundGrid.onmousedown  = function(e) {
    if((e.which && e.which === 3) || (e.buttons && e.buttons === 2)) { //Right click
        rclickStartingPoint = {x:e.pageX, y:e.pageY};
    }
};

backgroundGrid.onmousemove = function(e) {
    if((e.which && e.which === 3) || (e.buttons && e.buttons === 2)) {
        var dragToPoint = {x:e.pageX, y:e.pageY};
        var offsetx = Math.ceil((dragToPoint.x - rclickStartingPoint.x)/1.5);
        var offsety = Math.ceil((dragToPoint.y - rclickStartingPoint.y)/1.5);
        window.scrollBy(offsetx, offsety);
        rclickStartingPoint = dragToPoint;
    }
};

backgroundGrid.onmouseup  = function(e) {
    if((e.which && e.which === 3) || (e.buttons && e.buttons === 2)) {
        return;
    }
};


document.getElementById('shipSpawnSlider1').oninput = function() {
    game.hangars[0].y = (100 - this.value) * 3.5;
};
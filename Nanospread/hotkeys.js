var myKeyQueue = [];
document.addEventListener("keydown", function(e) {
    var code = (e.charCode !== 0 ? e.charCode : e.keyCode);
    myKeyQueue.push(code);
    processKeyQueue();
});

var selectedButton = [-1, 0];
function processKeyQueue() {
    var key = myKeyQueue[0];
    myKeyQueue.splice(0, 1);
    if(key === 27) { //escape
        deselectAll()
    }
    if(key === 13 || key === 32) { //enter / space
        buyNanitesButtonPressed()
    }
    if(key === 38 || key === 87) { //up
        changeDirectionOfSelected('North')
    }
    if(key === 40 || key === 83) { //down
        changeDirectionOfSelected('South')
    }
    if(key === 37 || key === 65) { //left / a
        changeDirectionOfSelected('West')
    }
    if(key === 39 || key === 68) { //right
        changeDirectionOfSelected('East')
    }
//            if(myKeyQueue.length > 0) {
//                $scope.pbars[selectedButton[0]].changeSelect(selectedButton[1]);
//            }
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
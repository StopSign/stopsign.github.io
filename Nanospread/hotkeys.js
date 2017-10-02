var myKeyQueue = [];
document.addEventListener("keydown", function(e) {
    var code = (e.charCode !== 0 ? e.charCode : e.keyCode);
    myKeyQueue.push(code);
    processKeyQueue();
});

function processKeyQueue() {
    var key = myKeyQueue[0];
    myKeyQueue.splice(0, 1);
    // console.log(key);
    if(key === 27) { //escape
        select.deselectAll()
        menuOpen = "";
        adjustMenus();
    } else if(key === 13 || key === 32) { //enter / space
        buyNanitesButtonPressed()
    } else if(key === 38 || key === 87) { //up
        changeDirectionOfSelected('North')
    } else if(key === 40 || key === 83) { //down
        changeDirectionOfSelected('South')
    } else if(key === 37 || key === 65) { //left / a
        changeDirectionOfSelected('West')
    } else if(key === 39 || key === 68) { //right
        changeDirectionOfSelected('East')
    } else if(key === 66) { //b
        // toggleBuild();
    } else if(key === 81) { //q
        toggleSettingsBox();
    } else if(key === 69) { //e
        select.selectAllActive()
    } else if(key === 82) { //r

    } else if(key === 76) { //l
        toggleLevelMenu();
    } else if(key === 72) { //h
        toggleHelp();
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
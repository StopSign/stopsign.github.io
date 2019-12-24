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
        select.deselectAll();
        menuOpen = "";
        adjustMenus();
    } else if(key === 13 || key === 32) { //enter / space
        buyNanitesButtonPressed()
    } else if(key === 38 || key === 87) { //up
        if(!shift) {
            changeDirectionOfSelected('North')
        } else {
            singleSelect(0, -1);
        }
    } else if(key === 40 || key === 83) { //down
        if(!shift) {
            changeDirectionOfSelected('South')
        } else {
            singleSelect(0, 1);
        }
    } else if(key === 37 || key === 65) { //left / a
        if(!shift) {
            changeDirectionOfSelected('West')
        } else {
            singleSelect(-1, 0);
        }
    } else if(key === 39 || key === 68) { //right
        if(!shift) {
            changeDirectionOfSelected('East')
        } else {
            singleSelect(1, 0);
        }
    } else if(key === 88 || key === 191) { //x or /
        if(!shift) {
            changeDirectionOfSelected('')
        }
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
    } else if(key === 73) { //i
        toggleStatsMenu();
    } else if(key === 85) { //u
        toggleUpgradeMenu();
    } else if(key === 49) { //1
        buyAmountOption(1);
    } else if(key === 50) { //2
        buyAmountOption(5);
    } else if(key === 51) { //3
        buyAmountOption(10);
    } else if(key === 52) { //4
        buyAmountOption(25);
    } else if(key === 53) { //5
        buyAmountOption(50);
    } else if(key === 54) { //6
        buyAmountOption(100);
    } else if(key === 55) { //7
        buyAmountOption('Next');
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
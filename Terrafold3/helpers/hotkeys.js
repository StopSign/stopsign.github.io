let myKeyQueue = [];
document.addEventListener("keydown", function(e) {
    let code = {key:(e.charCode !== 0 ? e.charCode : e.keyCode), shift:e.shiftKey};
    myKeyQueue.push(code);
    processKeyQueue();
});

function processKeyQueue() {
    let key = myKeyQueue[0].key;
    // var shift = myKeyQueue[0].shift;
    myKeyQueue.splice(0, 1);
    if(key === 27) { //escape
        // deselect();
    }
}

// let keys = {32: 1, 37: 1, 38: 1, 39: 1, 40: 1};
//
// function preventDefault(e) {
//     e = e || window.event;
//     if (e.preventDefault)
//         e.preventDefault();
//     e.returnValue = false;
// }

// function preventDefaultForScrollKeys(e) {
//     if (keys[e.keyCode]) {
//         preventDefault(e);
//         return false;
//     }
// }
//
// function disableScroll() {
//     document.onkeydown = preventDefaultForScrollKeys;
// }
// disableScroll();
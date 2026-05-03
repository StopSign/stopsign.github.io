
let idsToCache = [];

let createView = {
    initializeDisplay: function() {
        createView.setAllCaches(); //happens after generation
    },

    setAllCaches: function() {
        //uses createView.queueCache("<element ID>") for elements created in index.html

        createView.clearCacheQueue();
    },
    clearCacheQueue: function() {
        for(let id of idsToCache) {
            viewData.cached[id] = document.getElementById(id);
        }
        idsToCache = [];
    },
    queueCache: function() {
        Array.prototype.push.apply(idsToCache, arguments);
    }
}
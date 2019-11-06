let actions = {
    queue:[],
    addSendToQueue: function(pos) {
        let action = {};
        action.timeNeeded = moduleData[pos].send.time;

        actions.addToQueue(action);
    },
    addRecallToQueue: function(pos) {
        let action = {};
        action.timeNeeded = moduleData[pos].recall.time;
        
        actions.addToQueue(action);
    },
    addToQueue: function(action) {
        action.timeCur = 0;

        action.tickSlow = function() {
            action.timeCur ++;
            if(action.timeCur >= action.timeNeeded) {
                action.timeCur -= action.timeNeeded;
            }
        };

        actions.queue.push(action);
    }

};
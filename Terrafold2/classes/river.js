window.riverData = {
    create: function(chunks, target) {
        let newRiver = {};
        newRiver.chunks = [];
        for(let i = 0; i < chunks; i++) {
            newRiver.chunks.push({water:0});
        }
        newRiver.getTarget = function() {
            return getTarget(target);
        };
        rivers.push(newRiver);
    },
    tick: function() {
        for(let river of rivers) {
            for(let i = river.chunks.length - 1; i >= 0; i--) {
                let chunk = river.chunks[i];
                let transfer = chunk.water / 1000;
                chunk.water -= transfer;

                if(river.chunks[i+1]) {
                    river.chunks[i+1].water += transfer;
                } else {
                    river.getTarget().water += transfer;
                }
            }
        }
    }

};


window.riverData = {
    create: function(chunks, target) {
        let newRiver = {};
        newRiver.chunks = [];
        newRiver.target = target;
        for(let i = 0; i < chunks; i++) {
            newRiver.chunks.push({water:0});
        }
        rivers.push(newRiver);
    },
    tick: function() {
        for(let river of rivers) {
            for(let i = river.chunks.length - 1; i >= 0; i--) {
                let chunk = river.chunks[i];
                let transfer = chunk.water / 1000;
                if(transfer === 0) {
                    continue;
                }
                chunk.water -= transfer;

                if(river.chunks[i+1]) {
                    river.chunks[i+1].water += transfer;
                } else {
                    addWaterTo(river.target, transfer);
                }
            }
        }
    }

};


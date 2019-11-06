let moduleData = [];

function addModuleData(dataObj) {
    dataObj.pos = moduleData.length;

    // dataObj.action.onclick = function() {
    //     actions.addActionToQueue(dataObj.pos, "action");
    // };

    dataObj.getWorker = function() {
        return dataObj.workerType + capitalizeFirst(dataObj.varName);
    };
    dataObj.send.canStart = function() {
        return res[dataObj.workerType + "Cur"] > 0;
    };
    dataObj.send.oncomplete = function() {
        res[dataObj.workerType + "Cur"]--;
        res[dataObj.getWorker()]++;
    };
    dataObj.recall.canStart = function() {
        return res[dataObj.getWorker()] > 0;
    };
    dataObj.recall.oncomplete = function() {
        res[dataObj.workerType + "Cur"]--;
        res[dataObj.getWorker()]++;
    };



    moduleData.push(dataObj);
}

addModuleData(
    {
        coords:[50, 50],
        visible:true,
        workerType:"robot",
        varName:"dig",
        resName:"dirt",
        tooltip:"Assign a Robot to dig for dirt. Gain +1 dirt per quarry",
        send:{
            time:2
        },
        recall: {
            time:2
        },
        progress: {
            needed:100,
            oncomplete:function() {
                res.dirt += res.quarry;
                res.depth += 1;
            }
        }
    });

    // {
    //     x:113,
    //     y:50,
    //     visible:true,
    //     text:"<i class='fa fa-times smallIcon'>",
    //     tooltip:"Recall your robot back from digging",
    //     onclick:function() {
    //         console.log('queue the action');
    //     },
    //     action:{
    //         time:2,
    //         canStart:function() {
    //             return res.robotDig > 0;
    //         },
    //         oncomplete: function() {
    //             res.robotCur++;
    //             res.robotDig--;
    //         }
    //     }
    // }
// ];
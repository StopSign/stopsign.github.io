let moduleData = [];

function addModuleData(dataObj) {
    dataObj.pos = moduleData.length;

    moduleData.push(dataObj);
}

addModuleData({
        name:"test"
    });
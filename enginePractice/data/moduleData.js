let moduleData = [];

function addModuleData(dataObj) {
    dataObj.pos = moduleData.length;

    //Access by using a for loop using moduleData.length and moduleData[num] OR moduleData.<name>
    moduleData.push(dataObj);
    moduleData[dataObj.name] = dataObj;
}

addModuleData({
    name:"test"
});
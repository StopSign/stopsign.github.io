let view = {
    initialize: function() {

    },
    updating: {
        update:function() {

        }
    },
    create: {
    }
};


function toggleCultivate(newMethod) {
    let button = document.getElementById("method" + newMethod);

    //if(currCulMethod === "" || )
    currCulMethod = newMethod;
    //toggleSelectMethod =
    if(cultivating) {
        removeClassFromDiv(button, "button");
        addClassToDiv(button, "buttonPressed");
    } else {
        removeClassFromDiv(button, "buttonPressed");
        addClassToDiv(button, "button");
    }
}
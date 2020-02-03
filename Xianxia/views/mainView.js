let view = {
    initialize: function() {
        changeCultivationMethod();
    },
    updating: {
        update:function() {

        }
    },
    create: {
    }
};

function changeCultivationMethod() {
    let curMethod = scrollMethods[currCulMethod];

    // theDiv.innerHTML = "<div><b>" +
    //         scrollLevelToText(currentScrollMethod.level) + " " + currentScrollMethod.element + " Dao</b><br>" +
    //         "Collect Unrefined Qi: <b>" + currentScrollMethod.unrefinedGain + "</b>/s<br>" +
    //         "Refine Qi: <b>" + currentScrollMethod.refineRate + "</b>/s<br>" +
    //         "Max Unrefined Qi: <b>" + currentScrollMethod.maxUnrefined + "</b><br>" +
    //         "Max Refined Qi: <b>" + currentScrollMethod.maxRefined + "</b><br>" +
    //         "Purity: <b>" + (currentScrollMethod.purity*100) + "</b>%<br>" +
    //         '<div class="button" onclick="toggleCultivate(this)">Cultivate</div><br>' +
    //     "</div>";
}

function scrollLevelToText(level) {
    return ["Mortal", "Profound", "Spirit", "Earth", "Sky", "Emperor", "Tyrant", "Sovereign", "God"][level];
}


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

function openChangeScroll() {

}
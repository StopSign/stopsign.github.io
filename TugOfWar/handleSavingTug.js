function loadDefaults() {
}

function saveIntoStorage() {
    localStorage.allVariables100 = "";
    localStorage.allVariables100 = theCookie;
}

function loadFromStorage() {
	document.getElementById("mainBox").style.display="inline-block";
    if(localStorage.allVariables100) {
        expandedCookie = (','+localStorage.allVariables100).split(',');
        x = 1;
    }
	else {
		loadDefaults();
	}
}

function clearStorage() {
    localStorage.allVariables100="";
    loadDefaults();
}

loadFromStorage()
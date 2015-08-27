

showNextMessage = 0;
higherZ = 9999999999999
function startTutorial() {
	if(localStorage.doneTutorial == 1) return
	localStorage.doneTutorial = 1;
	greyBox = document.getElementById("greyBox");
	addGreyBox()
	//addVisibleElement(
	addMessage("Welcome to Pull of War, this is the tutorial. Click OK", 500, 283);
	addOKButton(258, 373)
}

function forceTutorial() {
	localStorage.doneTutorial = 0;
	showNextMessage = 0;
	showUnitsScreen()
	startTutorial()
}

function addMessage(msg, x, y) {
	greyBox.innerHTML += "<div class='message' style='left:"+x+"px;top:"+y+"px;'>"+msg+"</div>"
	shown = 1
}

function addOKButton(x, y) {
	buttonsToClick++;
	greyBox.innerHTML += "<button onclick='clickedOKButton()' class='OKButton' style='left:"+x+"px;top:"+y+"px;'>OK</button>"
}

function clickedOKButton() {
	buttonsToClick--
	if(buttonsToClick == 0) {
		showNextMessage++
		shown = 0;
		greyBox.innerHTML = ""
		if(showNextMessage == 1) {
			addMessage("Units come from both sides. Your units come from the left and go to the right.", 500, 283);
			addOKButton(260, 400)
		}
		if(showNextMessage == 2) {
			addMessage("When your units make it to the red line, you gain some score, reflected by the progress bar. When you beat the stage, it restarts.", 500, 239);
			document.getElementById("captureProgressBar").style.zIndex = higherZ
			document.getElementById("score").style.zIndex = higherZ
			addOKButton(200, 400)
		}
		if(showNextMessage == 3) {
			addMessage("When you beat a stage, you can click on the right side of the battle area to go to the next stage.", 500, 283);
			document.getElementById("captureProgressBar").style.zIndex = higherZ
			document.getElementById("score").style.zIndex = higherZ
			addOKButton(529, 214)
		}
		if(showNextMessage == 4) {
			addMessage("When enemies make it to your red line, you lose score. If you are less than -200%, the stage restarts.", 500, 283);
			document.getElementById("captureProgressBar").style.zIndex = higherZ
			document.getElementById("score").style.zIndex = higherZ
			addOKButton(529, 234)
		}
		if(showNextMessage == 5) {
			addMessage("When you reach 100%, you gain some territory", 500, 283);
			document.getElementById("captureProgressBar").style.zIndex = 0
			document.getElementById("score").style.zIndex = 0
			document.getElementById("territoryGainContainer").style.zIndex=higherZ
			document.getElementById("territoryContainer").style.zIndex=higherZ
			addOKButton(200, 400)
		}
		if(showNextMessage == 6) {
			addMessage("Territory is the maximum amount of Families you can have", 690, 455);
			document.getElementById("territoryGainContainer").style.zIndex=0
			document.getElementById("rightSpace").style.zIndex=higherZ
			addOKButton(432, 532)
		}
		if(showNextMessage == 7) {
			addMessage("Open your soldier window.", 606, 573);
			buttonsToClick++
			document.getElementById("unitContainer0").style.zIndex = higherZ
			document.getElementById("rightSpace").style.zIndex=0
			document.getElementById("territoryContainer").style.zIndex=0
		}
		if(showNextMessage == 8) {
			addMessage("Get gold by killing enemies. Gold is spent on upgrade points, which can be allocated to upgrades.", 500, 452);
			document.getElementById("middleSpace").style.zIndex = higherZ
			addOKButton(543, 470)
		}
		if(showNextMessage == 9) {
			addMessage("Spawn Rate is based on how many families you have. This isn't obvious yet, but future updates will change that.", 526, 871);
			document.getElementById("rightSpace").style.zIndex=higherZ
			document.getElementById("middleSpace").style.zIndex = "initial"
			document.getElementById("spawnRateContainer").style.zIndex = higherZ
			addOKButton(375, 690)
		}
		if(showNextMessage == 10) {
			addMessage("Click one of the 6 lanes to send 2 archers to that lane every 10 seconds. Future updates will give upgrades to increase this number.", 382, 291);
			document.getElementById("rightSpace").style.zIndex=0
			document.getElementById("spawnRateContainer").style.zIndex = 0
			document.getElementById("clickSpace0").style.zIndex = higherZ
			document.getElementById("clickSpace1").style.zIndex = higherZ
			document.getElementById("clickSpace2").style.zIndex = higherZ
			document.getElementById("clickSpace3").style.zIndex = higherZ
			document.getElementById("clickSpace4").style.zIndex = higherZ
			document.getElementById("clickSpace5").style.zIndex = higherZ
			addOKButton(404, 247)
		}
		if(showNextMessage == 11) {
			addMessage("Have Fun!", 382, 291);
			document.getElementById("clickSpace0").style.zIndex = "initial"
			document.getElementById("clickSpace1").style.zIndex = "initial"
			document.getElementById("clickSpace2").style.zIndex = "initial"
			document.getElementById("clickSpace3").style.zIndex = "initial"
			document.getElementById("clickSpace4").style.zIndex = "initial"
			document.getElementById("clickSpace5").style.zIndex = "initial"
			addOKButton(398, 298)
		}
		if(!shown) {
			removeGreyBox()
		}
	}
}

function addGreyBox() {
		document.getElementById("greyBox").style.display="block";
}
function removeGreyBox() {
		document.getElementById("greyBox").style.display="none";
}
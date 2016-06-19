
function Logger(movementPattern) {
	this.curSpeed = 10
	this.target = 0
	this.movementPattern = movementPattern
	this.isVisible = true
}
	
function Miner(movementPattern) {
	this.curSpeed = 10
	this.x = 0
	this.y = 0
	this.mineCounter = 0
	this.miningWidth = 2
	this.movementPattern = movementPattern
	this.isVisible = true
}

function Dirt(x, y) {
	this.toughness = this.toughnessMax = 10
	this.x = x
	this.y = y
	this.id = id++
	
	this.value = 1
	
	var theDiv = document.createElement("div");
	theDiv.id = 'material'+this.id
	theDiv.className = 'dirt'
	theDiv.style.backgroundColor = 'rgb(109, 67, 67)'
	this.theDiv = theDiv
	this.isDrawn = false
	this.isUpdating = true
	this.hasGivenGold = 0;
}


function Tree(size) {
	this.id = treeId++
	this.healthMax = this.health = (20*Math.pow(1.3, size))|0 + 40
	//console.log("healthMax: "+this.healthMax+", size: "+size)
	this.x = (Math.random() * maxX)|0
	this.y = 100 - this.id*1.4
	
	this.woodValue = (2+(size*.4001))|0
	
	var theDiv = document.createElement("div");
	theDiv.id = 'tree'+this.id
	theDiv.className = 'tree'
	theDiv.style.borderBottom = (35+this.id*.8)+'px solid rgba(31,88,31,.9)'
	//theDiv.style.backgroundColor = 'rgb(109, 67, 67)'
	this.theDiv = theDiv
	this.isDrawn = false
	this.isUpdating = true
	this.hasGivenGold = 0;
}

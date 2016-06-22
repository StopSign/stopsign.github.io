
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
	this.movementPattern = movementPattern
	this.isVisible = true
}

function Tree(size) {
	this.id = treeId++
	this.healthMax = this.health = (20*Math.pow(1.3, size))|0 + 40
	//console.log("healthMax: "+this.healthMax+", size: "+size)
	this.x = (Math.random() * maxX)|0
	this.y = 100 - this.id*1.4
	
	this.woodValue = (2+(size*.4001))|0
	
	TreeGraphics(this)
	
	this.hasGivenGold = 0;
	this.isDead = 0
	this.stop = 0
}


function Material(x, y) {
	this.toughness = this.toughnessMax = 10
	this.x = x
	this.y = y
	this.id = id++
	
	var theDiv = document.createElement("div");
	theDiv.id = 'material'+this.id
	this.theDiv = theDiv
	
	this.isDrawn = false
	this.isUpdating = true
	this.hasGivenGold = 0;
	this.isDead = 0
	this.stop = 0
}

function Dirt(theMaterial, depth) {
	theMaterial.toughness = 10 + depth
	theMaterial.toughnessMax = theMaterial.toughness
	theMaterial.value = 1
	
	var theDiv = theMaterial.theDiv
	theDiv.className = 'dirt'
	theMaterial.theDiv = theDiv
	theMaterial.isUpdating = true
	
	return theMaterial
}


function Stone(theDirt, depth) {
	theDirt.toughness = theDirt.toughnessMax = 11 + (depth * 2)
	theDirt.value = 3
	
	var theDiv = theDirt.theDiv
	theDiv.className = 'stone'
	theDirt.theDiv = theDiv
	theDirt.isUpdating = true
	
	return theDirt
}
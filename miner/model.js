
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
	this.healthMax = this.health = (20*Math.pow(1.30001, size))|0 + 40 + size*10
	//console.log("healthMax: "+this.healthMax+", size: "+size)
	this.x = (Math.random() * maxX)|0
	this.y = 100 - this.id*1.4
	
	this.woodValue = (2 + size * Math.pow(1.30001, size) * .3)|0
	
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
	
	MaterialGraphics(this)
	
	
	this.hasGivenGold = 0;
	this.isDead = 0
	this.stop = 0
}

function Dirt(theMaterial, depth) {
	theMaterial.toughness = 10 + depth
	theMaterial.toughnessMax = theMaterial.toughness
	theMaterial.value = 1
	
	var theDirt = theMaterial.theMaterial
	theDirt.className = 'dirt'
	theMaterial.theMaterial = theDirt
	theMaterial.isUpdating = true
	
	return theMaterial
}


function Stone(theMaterial, depth) {
	theMaterial.toughness = theMaterial.toughnessMax = 11 + (depth * 2)
	theMaterial.value = 3
	
	var theStone = theMaterial.theMaterial
	theStone.className = 'stone'
	theMaterial.theDiv = theStone
	theMaterial.isUpdating = true
	
	return theMaterial
}
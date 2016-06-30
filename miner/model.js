
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

//There are over 4000 different types of minerals currently classified by the International Mineralogical Association (IMA).
//Let's start with hard coding but later let's update thing later.

/*
  Antimony
  Barium
  Bauxite
  Beryllium
  Chromite
  Clays
  Cobalt
  Copper
  Feldspar
  Flourite (fluorspar)
  Gallium
  Gold
  Gypsum
  Halite (sodium Chloride -- Salt)
  Indium
  Iron Ore
  Lead
  Lithium
  Manganese
  Mica
  Molybdenum
  Nickel
  Perlite
  Platinum Group Metals (PGM)
  Phosphate Rock
  Potash
  Pyrite
  Quartz (silica)
  Rare Earth Metals (lanthanum, cerium, praseodymium, neodymium, promethium, samarium, europium, gadolinium, terbium, dysprosium, holmium, erbium, thulium ytterbium and lutetium)
  Silica
  Silver
  Sodium Carbonate (soda ash or trona)
  Sulfur
  Tantalum
  Titanium
  Tungsten
  Uranium
  Vanadium
  Zeolites
  Zinc
*/

function Aluminum(theMaterial, depth) {
    theMaterial.toughness = theMaterial.toughnessMax = 12 + (depth * 5)
    theMaterial.value = 5

    var theAluminum = theMaterial.theMaterial
    theStone.className = 'Aluminum'
    theMaterial.theDiv = theAluminum
    theMaterial.isUpdating = true

    return theMaterial
}

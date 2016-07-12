
//graphics
var goldDiv = document.getElementById('gold')

function draw() {
	theGridGraphics.forEach(updateMaterialVisual)
	theForest.forEach(updateForestVisual);
}

function updateMaterialVisual(material, index) {
	if(!theGrid[index].isUpdating) {
		return
	}
	newWidth = (maxX / maxWidth) < 15 ? (maxX / maxWidth) : 15
	newHeight = (maxY / maxDepth) < 15 ? (maxY / maxDepth) : 15
	material.theMaterial.style.width = newWidth+'px'
	material.theMaterial.style.height = newHeight+'px'
	material.theMaterial.style.left = (theGrid[index].x * newWidth)+'px'
	material.theMaterial.style.top = (theGrid[index].y * newHeight)+'px'
	if(theGrid[index].materialHealth <= 0) {
		material.theMaterial.style.opacity = 0
	} else {
		material.theMaterial.style.opacity = theGrid[index].materialHealth/theGrid[index].materialHealthMax * .8 + .2
	}
	
	material.healthBar.style.height = 15*theGrid[index].materialHealth/theGrid[index].materialHealthMax + 'px'
	material.healthBar.style.left = ((theGrid[index].x+1) * newWidth - 2)+'px'
	material.healthBar.style.top = (theGrid[index].y * newHeight)+'px'
	if(theGrid[index].materialHealth === theGrid[index].materialHealthMax) {
		material.healthBar.style.opacity = 0
	} else {
		material.healthBar.style.opacity = 1
	}
	
	//material.theDiv.style.backgroundColor = hslToRgb(0, 55, 50, material.materialHealth/material.materialHealthMax)
	material.isUpdating = false;
}

//used in the above updateMaterialVisual
function MaterialGraphics(theid) {
	theMaterialObj = {}
	
	var theDiv = document.createElement("div");
	theMaterialObj.theDiv = theDiv
	
	var theMaterial = document.createElement("div");
	theMaterial.id = 'material'+theid
	theMaterialObj.theMaterial = theMaterial
	theDiv.appendChild(theMaterial)
	
	var healthBar = document.createElement("div");
	healthBar.style.position = 'absolute';
	healthBar.className = 'healthBar';
	theDiv.appendChild(healthBar)
	theMaterialObj.healthBar = healthBar
	
	theMaterialObj.isUpdating = true
	
	return theMaterialObj
}










function TreeGraphics(theTreeObj) {
	
	var theDiv = document.createElement("div");
	theDiv.style.position = 'relative';
	theTreeObj.theDiv = theDiv
	
	var theTree = document.createElement("div");
	theTree.id = 'tree'+theTreeObj.id
	theTree.className = 'tree'
	theTree.style.borderBottom = (35+theTreeObj.id*.8)+'px solid rgba(31,88,31,.9)'
	theTreeObj.theTree = theTree
	theDiv.appendChild(theTree)
	
	var treeHealthBarOuter = document.createElement("div");
	treeHealthBarOuter.style.position = 'absolute';
	treeHealthBarOuter.className = 'treeHealthBarOuter';
	theDiv.appendChild(treeHealthBarOuter)
	theTreeObj.treeHealthBarOuter = treeHealthBarOuter
	
	var treeHealthBar = document.createElement("div");
	treeHealthBar.style.position = 'absolute';
	treeHealthBar.className = 'treeHealthBar';
	theDiv.appendChild(treeHealthBar)
	theTreeObj.treeHealthBar = treeHealthBar
	
	theTreeObj.isDrawn = false
	theTreeObj.isUpdating = true
}

function updateForestVisual(tree, index) {
	if(!tree.isUpdating) {
		return
	}
	if(!tree.isDrawn) {
		document.getElementById('theForest').appendChild(tree.theDiv)
		tree.isDrawn = true
	}
	tree.theTree.style.left = (tree.x)+'px'
	tree.theTree.style.top = (tree.y)+'px'
	tree.theTree.style.opacity = (tree.health/tree.healthMax)*.7+.3
	if(tree.health <= 0) {
		tree.theTree.style.opacity = 0
	}
	
	tree.treeHealthBarOuter.style.left = (tree.x)+'px'
	tree.treeHealthBarOuter.style.top = (tree.y-3+tree.id*.8+35)+'px'
	if(tree.health <= 0 || tree.health === tree.healthMax) { //show when under damage
		tree.treeHealthBarOuter.style.opacity = 0
	} else {
		tree.treeHealthBarOuter.style.opacity = 1
	}
	
	tree.treeHealthBar.style.left = (tree.x+2)+'px'
	tree.treeHealthBar.style.top = (tree.y+tree.id*.8+35)+'px'
	tree.treeHealthBar.style.width = (tree.health / tree.healthMax * 24)+'px'
	if(tree.health <= 0 || tree.health === tree.healthMax) {
		tree.treeHealthBar.style.opacity = 0
	} else {
		tree.treeHealthBar.style.opacity = 1
	}
	
	tree.isUpdating = false;
}


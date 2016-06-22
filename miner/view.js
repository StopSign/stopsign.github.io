
//graphics
var goldDiv = document.getElementById('gold')

function draw() {
	theGrid.forEach(updateVisual)
	theForest.forEach(updateForestVisual);
}

function updateVisual(material, index) {
	if(!material.isUpdating) {
		return
	}
	if(!material.isDrawn) {
		document.getElementById('theGrid').appendChild(material.theDiv)
		material.isDrawn = true 
	}
	newWidth = (maxX / maxWidth) < 15 ? (maxX / maxWidth) : 15
	newHeight = (maxY / maxDepth) < 15 ? (maxY / maxDepth) : 15
	material.theDiv.style.width = newWidth+'px'
	material.theDiv.style.height = newHeight+'px'
	material.theDiv.style.left = (material.x * newWidth)+'px'
	material.theDiv.style.top = (material.y * newHeight)+'px'
	material.theDiv.style.opacity = material.toughness/material.toughnessMax
	
	//material.theDiv.style.backgroundColor = hslToRgb(0, 55, 50, material.toughness/material.toughnessMax)
	material.isUpdating = false;
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
	
	var healthBarOuter = document.createElement("div");
	healthBarOuter.style.position = 'absolute';
	healthBarOuter.className = 'healthBarOuter';
	theDiv.appendChild(healthBarOuter)
	theTreeObj.healthBarOuter = healthBarOuter
	
	var healthBar = document.createElement("div");
	healthBar.style.position = 'absolute';
	healthBar.className = 'healthBar';
	theDiv.appendChild(healthBar)
	theTreeObj.healthBar = healthBar
	
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
	tree.theTree.style.opacity = tree.health/tree.healthMax
	
	tree.healthBarOuter.style.left = (tree.x)+'px'
	tree.healthBarOuter.style.top = (tree.y-3)+'px'
	if(tree.health <= 0 && tree.health != tree.healthMax) { //show when under damage
		tree.healthBarOuter.style.opacity = 0
	} else {
		tree.healthBarOuter.style.opacity = 1
	}
	
	tree.healthBar.style.left = (tree.x+2)+'px'
	tree.healthBar.style.top = (tree.y)+'px'
	tree.healthBar.style.width = (tree.health / tree.healthMax * 24)+'px'
	if(tree.health <= 0 && tree.health != tree.healthMax) {
		tree.healthBar.style.opacity = 0
	} else {
		tree.healthBar.style.opacity = 1
	}
	
	tree.isUpdating = false;
}



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
	
	function updateForestVisual(tree, index) {
		if(!tree.isUpdating) {
			return
		}
		if(!tree.isDrawn) {
			document.getElementById('theForest').appendChild(tree.theDiv)
			tree.isDrawn = true
		}
		//newWidth = (maxX / maxWidth) < 15 ? (maxX / maxWidth) : 15
		//newHeight = (maxY / maxDepth) < 15 ? (maxY / maxDepth) : 15
		//tree.theDiv.style.width = newWidth+'px'
		//tree.theDiv.style.height = newHeight+'px'
		tree.theDiv.style.left = (tree.x)+'px'
		tree.theDiv.style.top = (tree.y)+'px'
		tree.theDiv.style.opacity = tree.health/tree.healthMax
		tree.isUpdating = false;
	}
function updateManaGain() {
	if(curMana === maxMana) {
		maxMana += manaGain/480; 
		curMana = maxMana
	}
	if(curMana < maxMana) {
		curMana+= manaGain; //mana gain
	}
	if(curMana >= maxMana) {
		curMana = maxMana
	}
	
	updateManaVisual()
}

function clickedSpell(num) {
	if(holdingSpell >= 0) {
		document.getElementById("spell"+holdingSpell).style.border="2px solid white"
		if(holdingSpell != num) {
			document.getElementById("spell"+num).style.border="2px solid red"
			holdingSpell = num;
		} else {
			holdingSpell = -1
		}
	}
	else {
		document.getElementById("spell"+num).style.border="2px solid red"
		holdingSpell = num;
	}
}

function clickAUnit(id) {
	unit = getUnitById(id)
	if(unit.direction != "right" && holdingSpell >= 0 && curMana >= spellCosts[holdingSpell]) {
		document.getElementById("spell"+holdingSpell).style.border="2px solid white"
		updateSpellVisuals()
		if(holdingSpell == 0) {
			spendMana(spellCosts[0])
			unit.actualMaxHealth -= 5
			if(unit.curHealth > unit.actualMaxHealth)
				unit.curHealth = unit.actualMaxHealth
			unit.takeDamage(17)
			holdingSpell = -1
		}
		if(holdingSpell == 1) {
			spendMana(spellCosts[1])
			unit.takeDamage(45)
			holdingSpell = -1
		}
		updateHover(id)
		document.getElementById("count"+id).innerHTML = unit.unitCount
		
		handleDeadUnit(unit)
	}
}

function spendMana(amount) {
	curMana -= amount
	spellExp += amount
	if(spellExp >= expNeededToLevel) { //levelUp
		spellLevel++
		spellExp -= expNeededToLevel
		expNeededToLevel = expNeededToLevel*1.3*Math.pow(1.02, spellLevel)
		maxMana+=10
		curMana+=10
		manaGain += .002
		for(q = 0; q < spellCosts.length; q++) {
			spellCosts[q] *= .99;
		}
	}
}

function updateSpellCooldowns(num) {
	
}
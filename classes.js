function Unit (line, pos, type, direction, unitCount, goldWorth) {
    this.type = type;
    this.pos = pos;
	this.direction=direction;
	this.shouldMove = 1;
	this.id = globalId++;
	this.engaged = [];
	this.line = line;
	this.unitCount = unitCount;
	this.goldWorth = goldWorth;
	this.totalDamageDone = 0;
	this.kills = 0;
	this.timeAlive = totalTicks;
	this.typeNum = convertTypeToNum(type, direction)
	this.attackCounter = unitValues[this.typeNum][1]
	this.curHealth = this.typeNum%2==0?unitValues[this.typeNum][3]*deadUnitBonus[this.typeNum]:unitValues[this.typeNum][3]
	this.maxHealth = this.typeNum%2==0?unitValues[this.typeNum][3]*deadUnitBonus[this.typeNum]:unitValues[this.typeNum][3]
	this.actualMaxHealth = this.maxHealth
	this.damage = this.typeNum%2==0?unitValues[this.typeNum][0]*deadUnitBonus[this.typeNum]:unitValues[this.typeNum][0]
	this.range = unitValues[this.typeNum][5]
	this.shouldAttack = 1
	this.takeDamage = function(dmg) {
		unitsDead = Math.floor(dmg / this.actualMaxHealth);
		dmg = dmg % this.actualMaxHealth;
		this.curHealth -= dmg
		if(this.curHealth <= 0) {
			this.curHealth = this.actualMaxHealth + this.curHealth
			unitsDead++;
		}
		unitsActuallyDead = this.unitCount
		this.unitCount -= unitsDead;
		if(this.unitCount <= 0) {
			this.curHealth = -10
			this.unitCount = 0;
		}
		unitsActuallyDead -= this.unitCount
		if(unitsDead > 0) {
			gold += unitsActuallyDead * this.goldWorth;
			totalDead[this.typeNum] += unitsActuallyDead
			updateGoldVisual()
			if(this.direction != "right") { //respawn the unit when it dies
				//addUnit("soldier", this.line, this.direction, unitsDead);
			}
		}
	}
	
    this.getDamageRoll = function(targetNum) {
		if(this.attackCounter > 0) {
			this.attackCounter--;
			return 0;
		}
		dmgPerUnit = this.damage
		if(targetNum)
			dmgPerUnit = this.damage - unitValues[targetNum][4]
		if(dmgPerUnit < 0) dmgPerUnit = 0
		dmg = dmgPerUnit*this.unitCount;
		this.totalDamageDone+=dmg
		this.attackCounter = unitValues[this.typeNum][1]
		return dmg
    };
	
	this.equals = function(unit) {
		if(!unit) {
			return false
		}
		return (this.id === unit.id)
	};
}

function Battle(y, x, z, w, id1, id2) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.w = w;
	this.id1 = id1;
	this.id2 = id2;
}

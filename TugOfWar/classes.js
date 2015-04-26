function Unit (line, pos, type, direction, health, armor, damage, damageRange, unitCount, attackCooldown, h, g) {
    this.type = type;
    this.pos = pos;
	this.health = health;
	this.curHealth = health;
	this.armor = armor;
	this.damage = damage;
	this.damageRange = damageRange;
	this.direction=direction;
	this.shouldMove = 1;
	this.id = globalId++;
	this.engaged = [];
	this.line = line;
	this.unitCount = unitCount;
	this.attackCooldown = attackCooldown;
	this.attackCounter = attackCooldown;
	if(type == "soldier") {
		this.speed = 1
		if(direction != "right") {
			this.speed = .1
		}
	}
	else if(type == "spear") {
		this.speed = .6
		if(direction != "right") {
			this.speed = .1
		}
	}
	
	this.takeDamage = function(dmg) {
		unitsDead = Math.floor(dmg / this.health);
		dmg = dmg % this.health;
		this.curHealth -= dmg
		if(this.curHealth <= 0) {
			this.curHealth = this.health + this.curHealth
			unitsDead++;
		}
		this.unitCount -= unitsDead;
		if(unitsDead > 0) {
			if(this.direction != "right") { //respawn the unit when it dies
				//addUnit("soldier", this.line, this.direction, unitsDead);
			}
		}
		if(this.unitCount <= 0)
			this.curHealth = -10
	}
	
    this.getDamageRoll = function() {
		if(this.attackCounter > 0) {
			this.attackCounter--;
			return 0;
		}
		this.attackCounter = this.attackCooldown;
		return (this.damage + Math.random() * this.damageRange)*this.unitCount;
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
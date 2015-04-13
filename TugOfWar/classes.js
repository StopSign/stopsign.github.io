function Unit (line, pos, type, direction, health, armor, damage, damageRange, unitCount) {
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
	if(type == "soldier") {
		this.speed = 1
		if(direction != "right") {
			this.speed = .1
		}
	}
	
    this.getDamageRoll = function() {
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
function Unit (pos, type, direction, health, armor, damage, damageRange) {
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
	
    this.getDamageRoll = function() {
		return this.damage + Math.random() * this.damageRange;
    };
}

function Battle(y, x, z, w) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.w = w;
}
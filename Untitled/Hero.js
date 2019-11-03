function makeHeroObject() {
    let newHero = {};

    newHero.exp = 0;
    newHero.level = function() {
        return hero.levelFromExp(hero.exp);
    };

    newHero.levelFromExp = function(exp) {
        return Math.floor((Math.sqrt(8*exp/100+1)-1)/2);
    };

    newHero.expOfLevel = function(level) {
        return level * (level + 1) * 50;
    };

    newHero.baseDodge = 0;
    newHero.calcDodge = function() {
        return hero.baseDodge / buffs.adjustShadow.level
    };

    newHero.baseAttack = 1;
    newHero.calcDodge = function() {
        return hero.baseAttack
    };

    newHero.health = 10;
    newHero.calcDodge = function() {
        return hero.health
    };

    newHero.manaRegen = 3;
    newHero.calcDodge = function() {
        return hero.health
    };



    return newHero;
}
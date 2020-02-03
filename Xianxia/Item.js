function Item(element, level, type) {
    this.quantity = 1;
    this.type = type; //scroll, art, plant, pill, sword, spear, staff
    this.element = element;
    this.level = level;


    this.getValue = function() {
        return 0;
    };

    this.createAsScroll = function(unrefinedGain, maxUnrefined, refineRate, maxRefined, purity) {
        this.type = "scroll";
        this.unrefinedGain = unrefinedGain;
        this.maxUnrefined = maxUnrefined;
        this.refineRate = refineRate;
        this.maxRefined = maxRefined;
        this.purity = purity;
    };

    this.createAsWeapon = function(type, element, damage, arc, range) {
        this.type = type;
        this.damage = damage;
        this.arc = arc;
        this.range = range;
    };

    this.getName = function() {
        if(type === "scroll") {
            return scrollLevelToText(this.level) + " " + this.element + " Dao";
        } else {
            return bodyLevelToText(this.level) + " " + (this.element !== "Body" ? this.element + " " : "")  + this.type;
        }
    }
}

//12 stages
function culLevelToText(level) {
    let rank = ["Early", "Mid", "Late", "Peak"][Math.floor(level / 5)];
    let stage = ["Qi Condensation", "Foundation Establishment", "Core Formation", "Nascent Soul", "Divine Soul", "False Immortal", "Earth Immortal", "Heaven Immortal", "Golden Immortal", "God", "God King", "God Empereror"][level % 5];
    return rank + " " + stage + " Stage";
}

//11 stages
function scrollLevelToText(level) {
    return ["Mortal", "Profound", "Spirit", "Earth", "Sky", "King", "Emperor", "Tyrant", "Sovereign", "Heavenly", "God"][level];
}

//15 stages
function bodyLevelToText(level) {
    return ["Copper", "Iron", "Bronze", "Silver", "Gold", "Titanium", "Jade", "Mithril", "Orichalcum", "Adamantium", "Meteoric", "Starmetal", "Quicksilver", "Chronosteel", "Divine"][level];
}
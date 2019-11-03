

function createStandardBuff(buffObj) {
    //X by 1 % level, lasts 5 seconds * level, stacks by adding the time
    buffObj.level = 0;
    buffObj.exp = 0;
    buffObj.expNeeded = buffObj.row * 10;

    buffs[buffObj.varName] = buffObj;
}

createStandardBuff({
    magicType: "shadow",
    varName:"adjustShadow",
    row:1,
    name: "Adjust Shadow",
    expMult: 10,
    manaCost:1,
    buff:"dodge"
});


const canvas = document.getElementById("talentTreeCanvas");
const ctx = canvas.getContext("2d");

const talents = {
    spent: 0,
    totalPoints() { return getTotalTalentLevel(); },
    spendablePoints() { return this.totalPoints() - playerTalents.spentPoints; },
    1: {
        name() { return _txt("talents>calculated_shattering>name"); },
        desc() { return _txt("talents>calculated_shattering>desc"); },
        cost: 1,
        points: 0,
        maxPoints: 5
    },
    2: {
        name() { return _txt("talents>no_frill_frames"); },
        desc() { return _txt("talents>no_frill_frames>desc"); },
        cost: 1,
        points: 0,
        maxPoints: 2
    }
};

const playerTalents = {
    spentPoints: 0,
    1: 0,
    2: 0,
};

function drawTreeBranch(num1, num2) {
    if (document.getElementById("talentTreeCanvas").style.display === "none") return;
    const start = document.getElementById(num1).getBoundingClientRect();
    const end = document.getElementById(num2).getBoundingClientRect();
    const x1 = start.left + (start.width / 2) + (document.documentElement.scrollLeft || document.body.scrollLeft);
    const y1 = start.top + (start.height / 2) + (document.documentElement.scrollTop || document.body.scrollTop);
    const x2 = end.left + (end.width / 2) + (document.documentElement.scrollLeft || document.body.scrollLeft);
    const y2 = end.top + (end.height / 2) + (document.documentElement.scrollTop || document.body.scrollTop);
    ctx.lineWidth = 15;
    ctx.strokeStyle = "#000000";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawTalentTree() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // drawTreeBranch("talent11", "talent21");
}
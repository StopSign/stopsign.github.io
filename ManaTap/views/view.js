
let view = {
    update: function() {
        let part1 = .7;
        let part2 = .2;
        if(data.timer < data.maxTimer * part1) {
            let ratio = 1 - data.timer / (data.maxTimer * part1);
            document.getElementById("spireFront").style.height = ratio * 150 + "px";
            document.getElementById("spireInner").style.height = "0px";
            document.getElementById("spirePulse").style.display = "none";
        } else if(data.timer < data.maxTimer * (part2+part1)) {
            let ratio = (data.timer - data.maxTimer * part1) / (data.maxTimer * part2);
            document.getElementById("spireFront").style.height = "0px";
            document.getElementById("spireInner").style.height =  ratio * 150 + "px";
            document.getElementById("spirePulse").style.display = "none";
        } else {
            let ratio = (data.timer - data.maxTimer * (part1+part2)) / (data.maxTimer - data.maxTimer * (part1+part2));
            document.getElementById("spireFront").style.height = "0px";
            document.getElementById("spireInner").style.height = "150px";
            document.getElementById("spirePulse").style.display = "inline-block";
            document.getElementById("spirePulse").style.background = "radial-gradient(circle at 50%, transparent, transparent "+(ratio*40)+"%, #00ecffb5 "+(ratio*48+2)+"%, transparent 0%)";
        }
    }

};
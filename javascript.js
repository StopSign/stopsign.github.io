skillCount = 0;
skillArray = new Array();
selected = 0;
sharedExpEnabled = 1;
baseRate = 1;

skills = [
{index:0,level:1,cost:10,count:0,curProg:0,name:"Intelligence"},
{index:1,level:1,cost:5,count:0,curProg:0,name:"Hold flip flops to feet"}
]

function addSkill(num) {
if(!skills[num] || skills[num].level==0)
return;
skillToAdd = "<div class='skill' id='skill"+num+"' onclick='selectSkill("+num+")'>" +
"<h3 style='float:left;'>"+skills[num].name+"</h3>"+
"<div style='float:right;'>Cost <h4 id='cost"+num+"' class='number'>"+skills[num].cost+"</h4></div>"+
"<progress id='progress"+num+"' class='progressBar' max='"+skills[num].cost+"' value='"+skills[num].curProg+"' ></progress>"+
"</div><br>";
skillArray[num] = skillToAdd;
$("#skills").empty().append(skillArray.toString().replace(/,/g," "));
selectSkill(selected);
}

function selectSkill(num) {
$(".skill").css("box-shadow","none");
$("#skill"+num).css("box-shadow", "0px 0px 3pt 2pt red");
if(sharedExpEnabled) {
	if(num == 0) {
		target1 = $("#skill"+(num+1));
		target2 = $("#skill"+(num+2));
	}
	else if(num+1 == skillArray.length) {
		target1 = $("#skill"+(num-1));
		target2 = $("#skill"+(num-2));
	}
	else {
		target1 = $("#skill"+(num+1));
		target2 = $("#skill"+(num-1));
	}
	target1.css("box-shadow", "0px 0px 3pt 2pt #FFA8A8 ");
	target2.css("box-shadow", "0px 0px 3pt 2pt #FFA8A8 ");
}

selected = num;
}

addSkill(0);
addSkill(1);
function countUp(x) {
	skills[x].curProg = 0;
	skills[x].count++;
	if(x == 0) {
		skills[x].cost++;
		$("#progress"+x).attr("max", skills[x].cost);
	}
	$("#cost"+x).html(skills[x].cost);
}

function timerTick() {
	skills[selected].curProg += baseRate / 100;
	if(skills[selected].curProg > skills[selected].cost) {
		countUp(selected);
	}
	$("#progress"+selected).val(skills[selected].curProg);
}
setInterval(timerTick, 10);


//alert(skillArray.toString().replace(/,/g," "));
//arrays for skill values

/*unique things about skills:
placement
cost
name
count - times progressed
current progress

level - 0 for off, 1 for first stage, 2 for second stage, etc.
*/
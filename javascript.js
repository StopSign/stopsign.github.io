skillCount = 0;
skillArray = new Array();
selected = 0;
sharedExpEnabled = 1;

skills = [
{index:0,level:1,cost:10,count:0,curProg:0,name:"Intelligence"},
{index:1,level:1,cost:5,count:0,curProg:0,name:"Hold flip flops to feet"}
]

function addSkill(num) {
if(!skills[num])
return;
skillToAdd = "<div class='skill' id='skill"+num+"' onclick='selectSkill("+num+")'>" + 1+
"<progress class='progressBar' max='"+skills[num].cost+"' value='"+2+"' ></progress>"+
"</div><br>";
skillArray[num] = skillToAdd;
$("#skills").empty().append("<div>2</div>");
selectSkill(selected);
}

function selectSkill(num) {
$(".skill").css("box-shadow","none");
$("#skill"+num).css("box-shadow", "0px 0px 3pt 2pt red");
if(sharedExpEnabled) {
	if(num == 0) {
	$("#skill"+(num+1)).css("box-shadow", "0px 0px 3pt 2pt #FFA8A8 ");
	$("#skill"+(num+2)).css("box-shadow", "0px 0px 3pt 2pt #FFA8A8 ");
	}
	else if(num+1 == skillArray.length) {
	$("#skill"+(num-1)).css("box-shadow", "0px 0px 3pt 2pt #FFA8A8 ");
	$("#skill"+(num-2)).css("box-shadow", "0px 0px 3pt 2pt #FFA8A8 ");
	}
	else {
	$("#skill"+(num+1)).css("box-shadow", "0px 0px 3pt 2pt #FFA8A8 ");
	$("#skill"+(num-1)).css("box-shadow", "0px 0px 3pt 2pt #FFA8A8 ");
	}
}

selected = num;
}

//addSkill(0);
//addSkill(1);
$("#skills").empty().append("<div>2</div>");
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
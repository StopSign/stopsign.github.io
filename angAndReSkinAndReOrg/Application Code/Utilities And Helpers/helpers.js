//Brought to you by the department of redundancy department



function convertTypeToNum(type, direction) {
	if(type == "soldier" && direction == "right") return 0;
	if(type == "soldier" && direction != "right") return 1;
	if(type == "spear" && direction == "right") return 2;
	if(type == "spear" && direction != "right") return 3;
	return -1;
}




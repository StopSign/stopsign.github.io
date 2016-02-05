 

function calcAverageTime() {
	total = 0;
	for(x = 1; x < timeList.length; x++) {
		total += timeList[x] - timeList[x-1]
	}
	return total / timeList.length
}

function round3(num) {
	return Math.floor(num*1000)/1000
}
function round2(num) {
	return Math.floor(num*100)/100
}
function round1(num) {
	return Math.floor(num*10)/10
}

function formatNumber(num) {
    return Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
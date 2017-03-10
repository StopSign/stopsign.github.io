

function intToString (value) {
  if (value>=10000)
  {
    value=Math.round(value);
    var suffixes = ["", "K", "M", "B","T","C","Q","S"];
    var suffixNum = Math.floor(((""+value).length-1)/3);
    var shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000,suffixNum)) : value).toPrecision(3));
    if (shortValue % 1 != 0)  shortNum = shortValue.toFixed(1);
    return shortValue+suffixes[suffixNum];
  }
  else {
    return parseFloat(value).toFixed(2);
  }
}

function intToStringRound(value) {
  if (value>=10000)
  {
    value=Math.round(value);
    var suffixes = ["", "K", "M", "B","T","C","Q","S"];
    var suffixNum = Math.floor(((""+value).length-1)/3);
    var shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000,suffixNum)) : value).toPrecision(3));
    if (shortValue % 1 != 0)  shortNum = shortValue.toFixed(1);
    return shortValue+suffixes[suffixNum];
  }
  else {
    return Math.floor(value);
  }
}

//TODO: research on effectiveness and value
function addbyinteger(toAdd1, toAdd2, precision, isAdd) {
	precisionMult = Math.pow(10, precision)
	toAdd1 *= precisionMult;
	toAdd2 *= precisionMult * (isAdd==0?-1:1)
	//make toAdd2 negative when isAdd is false.
	toReturn = Math.floor(toAdd1 + toAdd2)
	return toReturn / precisionMult
	
}
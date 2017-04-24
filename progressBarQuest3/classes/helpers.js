/**
 * Created by Jim on 4/23/2017.
 */

//because I hate IE so much
Math.log2 = Math.log2 || function(x){return Math.log(x)*Math.LOG2E;};

function round1(num) {
    return Math.floor(num*10)/10
}
function round2(num) {
    return Math.floor(num*100)/100
}

function round(num) {
    return formatNumber(num);
} function formatNumber(num) {
    return Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


function intToString (value) {
    if (value>=10000)
    {
        return toSuffix(value);
    }
    else {
        return parseFloat(value).toFixed(2);
    }
}

function intToStringRound(value) {
    if (value>=10000)
    {
        return toSuffix(value);
    }
    else {
        return Math.floor(value);
    }
}

function toSuffix(value) {
    value=Math.round(value);
    var suffixes = ["", "K", "M", "B","T","C","Q","S"];
    var suffixNum = Math.floor(((""+value).length-1)/3);
    var shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000,suffixNum)) : value).toPrecision(3));
    if (shortValue % 1 != 0)  shortNum = shortValue.toFixed(1);
    return shortValue+suffixes[suffixNum];
}
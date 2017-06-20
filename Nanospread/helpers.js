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

function intToStringNegative(value, amount) {
    var isPositive = 1;
    if(value < 0) {
        isPositive = -1;
        value *= -1;
    }
    if (value>=10000) {
        return (isPositive===1 ? "+" : "-") + nFormatter(value, 3);
    } else {
        var baseValue = 3;
        if(amount) {
            baseValue = amount;
        }
        return (isPositive===1 ? "+" : "-") + parseFloat(value).toFixed(baseValue-1);
    }
}

function intToString (value, amount) {
    if (value>=10000) {
        return nFormatter(value, 3);
    } else {
        var baseValue = 3;
        if(amount) {
            baseValue = amount;
        }
        return parseFloat(value).toFixed(baseValue-1);
    }
}

function intToStringRound(value) {
    if (value>=10000) {
        return nFormatter(value, 3);
    } else {
        return Math.floor(value);
    }
}

function toSuffix(value) {
    value=Math.round(value);
    var suffixes = ["", "K", "M", "B","T","Qu","Qi","Sx","Sp","O","N","Dc","Ud","Dd","Td","qd","Qd","sd","Sd","Od","Nd","V"];
    var suffixNum = Math.floor(((""+value).length-1)/3);
    var shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000,suffixNum)) : value).toPrecision(3));
    if (shortValue % 1 != 0)  shortNum = shortValue.toFixed(1);
    return shortValue+suffixes[suffixNum];
}

function nFormatter(num, digits) {
    var si = [
        { value: 1E63, symbol: "V" },
        { value: 1E60, symbol: "Nd" },
        { value: 1E57, symbol: "Od" },
        { value: 1E54, symbol: "Sd" },
        { value: 1E51, symbol: "sd" },
        { value: 1E48, symbol: "Qd" },
        { value: 1E45, symbol: "qd" },
        { value: 1E42, symbol: "Td" },
        { value: 1E39, symbol: "Dd" },
        { value: 1E36, symbol: "Ud" },
        { value: 1E33, symbol: "Dc" },
        { value: 1E30, symbol: "N" },
        { value: 1E27, symbol: "O" },
        { value: 1E24, symbol: "Sp" },
        { value: 1E21, symbol: "Sx" },
        { value: 1E18, symbol: "Qi" },
        { value: 1E15, symbol: "Qu" },
        { value: 1E12, symbol: "T" },
        { value: 1E9,  symbol: "B" },
        { value: 1E6,  symbol: "M" },
        { value: 1E3,  symbol: "K" }
    ], rx = /\.0+$|(\.[0-9]*[1-9])0+$/, i;
    for (i = 0; i < si.length; i++) {
        if (num >= si[i].value) {
            return (num / si[i].value).toPrecision(digits).replace(rx, "$1") + si[i].symbol;
        }
    }
    return num.toPrecision(digits).replace(rx, "$1");
}
//because I hate IE so much
Math.log2 = Math.log2 || function(x){return Math.log(x)*Math.LOG2E;};
Math.log10 = Math.log10 || function(x) { return Math.log(x) * Math.LOG10E; };

function round1(num) {
    return Math.floor(num*10)/10
}
function round2(num) {
    return Math.floor(num*100)/100
}

function precision2(num) {
    return Number(num.toPrecision(2));
}
function precision3(num) {
    return Number(num.toPrecision(3));
}

function pxToInt(num) {
    return parseFloat(num.substring(0, num.indexOf('px')));
}

function round(num) {
    return formatNumber(num);
} function formatNumber(num) {
    return Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function withinDistance(x1, y1, x2, y2, radius) {
    return getDistance(x1, y1, x2, y2) < radius;
}

function getDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(Math.abs(x1-x2), 2) + Math.pow(Math.abs(y1-y2), 2));
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
    var suffixes = ["", "K", "M", "B","T","Qa","Qi","Sx","Sp","O","N","Dc","Ud","Dd","Td","qd","Qd","sd","Sd","Od","Nd","V"];
    var suffixNum = Math.floor(((""+value).length-1)/3);
    var shortValue = parseFloat((suffixNum !== 0 ? (value / Math.pow(1000,suffixNum)) : value).toPrecision(3));
    if (shortValue % 1 !== 0)  shortValue = shortValue.toPrecision(2);
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
        { value: 1E15, symbol: "Qa" },
        { value: 1E12, symbol: "T" },
        { value: 1E9,  symbol: "B" },
        { value: 1E6,  symbol: "M" },
        { value: 1E3,  symbol: "K" }
    ], rx = /\.0+$|(\.[0-9]*[1-9])0+$/, i;
    for (i = 0; i < si.length; i++) {
        if ((num) >= si[i].value / 1.000501) { // /1.000501 to handle rounding
            return (num / si[i].value).toPrecision(digits).replace(rx, "$1") + si[i].symbol;
        }
    }
    return num.toPrecision(digits).replace(rx, "$1");
}

var factorials = [];
function factorial(n) {
    if (n === 0 || n === 1)
        return 1;
    if (factorials[n] > 0)
        return factorials[n];
    return factorials[n] = factorial(n-1) * n;
}

function sortArrayObjectsByValue(arr, valueName) {
    var n = arr.length;

    // One by one move boundary of unsorted subarray
    for (var i = 0; i < n-1; i++) {
        // Find the minimum element in unsorted array
        var min_idx = i;
        for (var j = i+1; j < n; j++) {
            if (arr[j][valueName] < arr[min_idx][valueName])
                min_idx = j;
        }

        // Swap the found minimum element with the first
        // element
        var temp = arr[min_idx];
        arr[min_idx] = arr[i];
        arr[i] = temp;
    }
}

function encode(theSave) {
    return Base64.encode(lzw_encode(theSave));
}

function decode(encodedSave) {
    return lzw_decode(Base64.decode(encodedSave))
}

// LZW-compress a string
function lzw_encode(s) {
    var dict = {};
    var data = (s + "").split("");
    var out = [];
    var currChar;
    var phrase = data[0];
    var code = 256;
    for (var i=1; i<data.length; i++) {
        currChar=data[i];
        if (dict[phrase + currChar] != null) {
            phrase += currChar;
        }
        else {
            out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
            dict[phrase + currChar] = code;
            code++;
            phrase=currChar;
        }
    }
    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
    for (var i=0; i<out.length; i++) {
        out[i] = String.fromCharCode(out[i]);
    }
    return out.join("");
}

// Decompress an LZW-encoded string
function lzw_decode(s) {
    var dict = {};
    var data = (s + "").split("");
    var currChar = data[0];
    var oldPhrase = currChar;
    var out = [currChar];
    var code = 256;
    var phrase;
    for (var i=1; i<data.length; i++) {
        var currCode = data[i].charCodeAt(0);
        if (currCode < 256) {
            phrase = data[i];
        }
        else {
            phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
        }
        out.push(phrase);
        currChar = phrase.charAt(0);
        dict[code] = oldPhrase + currChar;
        code++;
        oldPhrase = phrase;
    }
    return out.join("");
}

var Base64 = {

    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode : function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
                this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        }
        return output;
    },

    // public method for decoding
    decode : function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = Base64._utf8_decode(output);
        return output;
    },

    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;
        while ( i < utftext.length ) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
};
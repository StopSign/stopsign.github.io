'use strict';

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
function precision4(num) {
    return Number(num.toPrecision(4));
}

function pxToInt(num) {
    return parseFloat(num.substring(0, num.indexOf('px')));
}

function round(num) {
    return formatNumber(num);
} function formatNumber(num) {
    return Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function copyArray(arr) {
    return JSON.parse(JSON.stringify(arr));
}

function withinDistance(x1, y1, x2, y2, radius) {
    return getDistance(x1, y1, x2, y2) < radius;
}

function getDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(Math.abs(x1-x2), 2) + Math.pow(Math.abs(y1-y2), 2));
}

function intToStringNegative(value, amount) {
    let isPositive = 1;
    if(value < 0) {
        isPositive = -1;
        value *= -1;
    }
    if (value>=10000) {
        return (isPositive===1 ? "+" : "-") + nFormatter(value, 3);
    } else {
        let baseValue = 3;
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
        let baseValue = 3;
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
    let suffixes = ["", "K", "M", "B","T","Qa","Qi","Sx","Sp","O","N","Dc","Ud","Dd","Td","qd","Qd","sd","Sd","Od","Nd","V"];
    let suffixNum = Math.floor(((""+value).length-1)/3);
    let shortValue = parseFloat((suffixNum !== 0 ? (value / Math.pow(1000,suffixNum)) : value).toPrecision(3));
    if (shortValue % 1 !== 0)  shortValue = shortValue.toPrecision(2);
    return shortValue+suffixes[suffixNum];
}

let si = [
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
], rx = /\.0+$|(\.[0-9]*[1-9])0+$/;

function nFormatter(num, digits) {
    for (let i = 0; i < si.length; i++) {
        if ((num) >= si[i].value / 1.000501) { // /1.000501 to handle rounding
            return (num / si[i].value).toPrecision(digits).replace(rx, "$1") + si[i].symbol;
        }
    }
    return num.toPrecision(digits).replace(rx, "$1");
}

function camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
        if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
        return index == 0 ? match.toLowerCase() : match.toUpperCase();
    });
}

function isVisible(obj) {
    return obj.offsetWidth > 0 && obj.offsetHeight > 0;
}

let factorials = [];
function factorial(n) {
    if (n === 0 || n === 1)
        return 1;
    if (factorials[n] > 0)
        return factorials[n];
    return factorials[n] = factorial(n-1) * n;
}


let fibonaccis = [];
function fibonacci(n) {
    if (n === 0 || n === 1 || n === undefined)
        return 1;
    if (fibonaccis[n] > 0)
        return fibonaccis[n];
    return fibonaccis[n] = fibonacci(n-1) + fibonacci(n-2);
}

function sortArrayObjectsByValue(arr, valueName) {
    let n = arr.length;

    // One by one move boundary of unsorted subarray
    for (let i = 0; i < n-1; i++) {
        // Find the minimum element in unsorted array
        let min_idx = i;
        for (let j = i+1; j < n; j++) {
            if (arr[j][valueName] < arr[min_idx][valueName])
                min_idx = j;
        }

        // Swap the found minimum element with the first
        // element
        let temp = arr[min_idx];
        arr[min_idx] = arr[i];
        arr[i] = temp;
    }
}

function addClassToDiv(div, className) {
    const arr = div.className.split(" ");
    if (arr.indexOf(className) === -1) {
        div.className += " " + className;
    }
}

function removeClassFromDiv(div, className) {
    div.classList.remove(className);
}

let numbers = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split(" ");
let tens = "twenty thirty forty fifty sixty seventy eighty ninety".split(" ");

function number2Words(n) {
    if (n < 20) return numbers[n];
    let digit = n%10;
    if (n < 100) return tens[~~(n/10)-2] + (digit? "-" + numbers[digit]: "");
    if (n < 1000) return numbers[~~(n/100)] +" hundred" + (n%100 === 0? "": " " + number2Words(n%100));
    return number2Words(~~(n/1000)) + " thousand" + (n%1000 !== 0? " " + number2Words(n%1000): "");
}

function capitalizeFirst(s) {
    return s.charAt(0).toUpperCase() + s.substr(1)
}

function numberToWords(n) {
    return capitalizeFirst(number2Words(n));
}

function encode(theSave) {
    return Base64.encode(lzw_encode(theSave));
}

function decode(encodedSave) {
    return lzw_decode(Base64.decode(encodedSave))
}

// LZW-compress a string
function lzw_encode(s) {
    let dict = {};
    let data = (s + "").split("");
    let out = [];
    let currChar;
    let phrase = data[0];
    let code = 256;
    for (let i=1; i<data.length; i++) {
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
    for (let i=0; i<out.length; i++) {
        out[i] = String.fromCharCode(out[i]);
    }
    return out.join("");
}

// Decompress an LZW-encoded string
function lzw_decode(s) {
    let dict = {};
    let data = (s + "").split("");
    let currChar = data[0];
    let oldPhrase = currChar;
    let out = [currChar];
    let code = 256;
    let phrase;
    for (let i=1; i<data.length; i++) {
        let currCode = data[i].charCodeAt(0);
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

let Base64 = {

    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode : function (input) {
        let output = "";
        let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        let i = 0;

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
        let output = "";
        let chr1, chr2, chr3;
        let enc1, enc2, enc3, enc4;
        let i = 0;

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
        let utftext = "";

        for (let n = 0; n < string.length; n++) {
            let c = string.charCodeAt(n);
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
        let string = "";
        let i = 0;
        let c = 0, c2 = 0;
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
                let c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
};


function roughSizeOfObject( object ) {

    let objectList = [];
    let stack = [ object ];
    let bytes = 0;

    while ( stack.length ) {
        let value = stack.pop();

        if ( typeof value === 'boolean' ) {
            bytes += 4;
        }
        else if ( typeof value === 'string' ) {
            bytes += value.length * 2;
        }
        else if ( typeof value === 'number' ) {
            bytes += 8;
        }
        else if
        (
            typeof value === 'object'
            && objectList.indexOf( value ) === -1
        )
        {
            objectList.push( value );

            for( let i in value ) {
                stack.push( value[ i ] );
            }
        }
    }
    return bytes;
}
// modified from: https://stackoverflow.com/questions/879152/how-do-i-make-javascript-beep/13194087#13194087
let beep = (function () {
    let ctxClass = window.audioContext || window.AudioContext || window.AudioContext || window.webkitAudioContext;
    let ctx = new ctxClass();
    return function (duration) {
        if (duration <= 0) return;

        let osc = ctx.createOscillator();
        osc.type = "sine";

        osc.connect(ctx.destination);
        if (osc.noteOn) osc.noteOn(0);
        if (osc.start) osc.start();

        setTimeout(function () {
            if (osc.noteOff) osc.noteOff(0);
            if (osc.stop) osc.stop();
        }, duration);
    };
})();
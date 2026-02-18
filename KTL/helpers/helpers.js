"use strict";

// because I hate IE so much
/* eslint-disable max-statements-per-line */
Math.log2 = Math.log2 || function(x) { return Math.log(x) * Math.LOG2E; };
Math.log10 = Math.log10 || function(x) { return Math.log(x) * Math.LOG10E; };

function round1(num) {
    return Math.floor(num * 10 + .000000001) / 10;
}
function round2(num) {
    return Math.floor(num * 100 + .000000001) / 100;
}
function round5(num) {
    return Math.floor(num * 100000 + .000000001) / 100000;
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
    return parseFloat(num.substring(0, num.indexOf("px")));
}

function round(num) {
    return formatNumber(num);
}

function formatNumber(num) {
    return Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/gu, ",");
}

function formatTime(seconds) {
    secondsToTime(seconds);
}

function copyArray(arr) {
    return JSON.parse(JSON.stringify(arr));
}

function copyObject(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function withinDistance(x1, y1, x2, y2, radius) {
    return getDistance(x1, y1, x2, y2) < radius;
}

function getDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2));
}

function intToStringNegative(value, amount) {
    let isPositive = 1;
    if (value < 0) {
        isPositive = -1;
        value *= -1;
    }
    if (value >= 10000) {
        return (isPositive === 1 ? "+" : "-") + nFormatter(value, 3);
    }
    let baseValue = 3;
    if (amount) {
        baseValue = amount;
    }
    return (isPositive === 1 ? "+" : "-") + parseFloat(value).toFixed(baseValue - 1);
}


function intToString2(value, sigFigs) {
    value += 0.0000001; // Anti floating point rounding issues

    let fixedDigits; // Number of digits after the decimal point

    if (value < 10) {
        // Ensure fixedDigits is at least 0
        fixedDigits = Math.max(0, sigFigs - 1);
        return value.toFixed(fixedDigits);
    } else if (value < 100) {
        fixedDigits = Math.max(0, sigFigs - 2);
        return value.toFixed(fixedDigits);
    } else if (value < 1000) {
        fixedDigits = Math.max(0, sigFigs - 3);
        return value.toFixed(fixedDigits);
    } else if (value < 10000) {
        fixedDigits = Math.max(0, sigFigs - 4);
        return value.toFixed(fixedDigits);
    } else if (value < 1000000) {
        // For thousands, adjust and append 'k'
        let scaledValue = value / 1000;
        fixedDigits = Math.max(0, sigFigs - (Math.floor(Math.log10(scaledValue)) + 1));
        return scaledValue.toFixed(fixedDigits) + 'k';
    } else {
        // Use nFormatter for very large numbers
        return nFormatter(value, sigFigs);
    }
}

function formatEngineering(value) {
    const absVal = Math.abs(value);
    const sign   = value < 0 ? "-" : "";

    if (absVal >= 1e5) {
        const exp      = Math.floor(Math.log10(absVal) / 3) * 3;
        const mantissa = absVal / Math.pow(10, exp);
        const mantStr  = Number(mantissa.toFixed(2)).toString();
        return sign + mantStr + "e" + exp;
    }

    return sign + Number(absVal.toFixed(2)).toString();
}


function intToString(value, amount, hideSmall) {
    let baseValue = amount ? amount : 3;
    if(value === 0) {
        if(baseValue > 1) {
            return "0.0"
        }
        if(baseValue > 0) {
            return "0"
        }
    }
    let isNeg = value < 0;
    value *= isNeg ? -1 : 1;
    if (value + .0000001 >= 10000) {
        value += .0000001; //anti floating point rounding issues
        if(data.gameSettings.numberType === "numberSuffix") {
            return (isNeg ? "-" : "") + nFormatter(value, 3);
        } else if(data.gameSettings.numberType === "scientific") {
            return (isNeg ? "-" : "") + Math.abs(value).toExponential(2).replace("+", "");
        } else if(data.gameSettings.numberType === "engineering") {
            return formatEngineering(value * (isNeg ? -1 : 1));
        }
    }
    if (value + .0000001 >= 1000) { //1000 - 10000, should be 6,512 (.1) - 1 if base is > 2
        value += .0000001; //anti floating point rounding issues
        if(amount >= 2) {
            baseValue = 1;
        } else {
            baseValue = 0;
        }
        const returnVal = parseFloat(value).toFixed(baseValue);
        return (isNeg?"-":"") + `${returnVal[0]},${returnVal.substring(1)}`;
    }
    if(value < 1) {
        if(value < .0001) {
            if(hideSmall) {
                return parseFloat("0").toFixed(baseValue);
            }
            return (isNeg ? "-" : "") + Math.abs(value).toExponential(2).replace("+", "");
        }
        return (isNeg?"-":"") + parseFloat(value).toPrecision(baseValue);
    }

    return (isNeg?"-":"") + parseFloat(value).toFixed(baseValue - 1);
}


function intToStringRound(value) {
    if (value >= 10000) {
        return nFormatter(value, 3);
    }
    return Math.floor(value);
}

function numToOrdinal(n) {
    const j = n % 10;
    const k = n % 100;

    if (j === 1 && k !== 11) {
        return n + "st";
    }
    if (j === 2 && k !== 12) {
        return n + "nd";
    }
    if (j === 3 && k !== 13) {
        return n + "rd";
    }
    return n + "th";
}

function secondsToTime(seconds, useInfinity) {
    if(!seconds || seconds < 0) {
        seconds = "0";
    }
    if(useInfinity && (seconds === Infinity || seconds > 3.5e6)) {
        return "∞"
    }
    seconds = Math.floor(seconds);
    const hours = Math.floor(seconds / 3600);
    const remainder = seconds % 3600;
    const minutes = Math.floor(remainder / 60);
    const secs = remainder % 60;

    if (hours > 0) {
        // If 60 minutes or more, use "hh:mm:ss"
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    } else {
        // Otherwise, use "m:ss"
        return `${minutes}:${String(secs).padStart(2, '0')}`;
    }
}

function toSuffix(value) {
    value = Math.round(value);
    const suffixes = ["", "k", "m", "b", "t", "Qa", "Qi", "Sx", "Sp", "o", "n", "Dc", "Ud", "Dd", "Td", "Qid", "Qad", "sd", "Sd", "Od", "Nd", "V"];
    const suffixNum = Math.floor(((String(value)).length - 1) / 3);
    let shortValue = parseFloat((suffixNum === 0 ? value : (value / Math.pow(1000, suffixNum))).toPrecision(3));
    if (shortValue % 1 !== 0) shortValue = shortValue.toPrecision(3);
    return shortValue + suffixes[suffixNum];
}

const si = [
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
    { value: 1E9, symbol: "B" },
    { value: 1E6, symbol: "M" },
    { value: 1E3, symbol: "K" }
];
const rx = /\.0+$|(\.[0-9]*[1-9])0+$/u;

function nFormatter(num, digits) {
    for (let i = 0; i < si.length; i++) {
        if ((num) >= si[i].value / 1.000501) {
            return (num / si[i].value).toPrecision(digits).replace(rx, "$1") + si[i].symbol;
        }
    }
    return num.toPrecision(digits).replace(rx, "$1");
}

function decamelize(str) {
    return str
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .replace(/^./, first => first.toUpperCase());
}

function decamelizeWithSpace(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
        .replace(/\b\w/g, char => char.toUpperCase());
}


function camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/gu, (match, index) => {
        if (Number(match) === 0) return "";
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
}

function isVisible(obj) {
    return obj.offsetWidth > 0 && obj.offsetHeight > 0;
}

//#ffdd00 -> [r, g, b]
function hexToRgb(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3) {
        hex = hex.split("").map(c => c + c).join("");
    }
    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return [r, g, b];
}

const factorials = [];
function factorial(n) {
    if (n === 0 || n === 1)
        return 1;
    if (factorials[n] > 0)
        return factorials[n];
    return factorials[n] = factorial(n - 1) * n;
}


const fibonaccis = [];
function fibonacci(n) {
    if (n === 0 || n === 1 || n === undefined)
        return 1;
    if (fibonaccis[n] > 0)
        return fibonaccis[n];
    return fibonaccis[n] = fibonacci(n - 1) + fibonacci(n - 2);
}

function sortArrayObjectsByValue(arr, valueName) {
    const n = arr.length;

    // one by one move boundary of unsorted subarray
    for (let i = 0; i < n - 1; i++) {
        // find the minimum element in unsorted array
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            if (arr[j][valueName] < arr[minIdx][valueName])
                minIdx = j;
        }

        // swap the found minimum element with the first element
        const swap = arr[minIdx];
        arr[minIdx] = arr[i];
        arr[i] = swap;
    }
}

function addClassToDiv(div, className) {
    const arr = div.className.split(" ");
    if (arr.indexOf(className) === -1) {
        div.className += ` ${className}`;
    }
}

function removeClassFromDiv(div, className) {
    div.classList.remove(className);
}

const numbers = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split(" ");
const tens = "twenty thirty forty fifty sixty seventy eighty ninety".split(" ");

function number2Words(n) {
    if (n < 20) return numbers[n];
    const digit = n % 10;
    if (n < 100) return tens[~~(n / 10) - 2] + (digit ? `-${numbers[digit]}` : "");
    if (n < 1000) return `${numbers[~~(n / 100)]} hundred${n % 100 === 0 ? "" : ` ${number2Words(n % 100)}`}`;
    return `${number2Words(~~(n / 1000))} thousand${n % 1000 === 0 ? "" : ` ${number2Words(n % 1000)}`}`;
}

function capitalizeFirst(s) {
    return s.charAt(0).toUpperCase() + s.substr(1);
}

function numberToWords(n) {
    return capitalizeFirst(number2Words(n));
}

function encode64(theSave) {
    return Base64.encode(theSave);
}

function decode64(encodedSave) {
    try {
        return Base64.decode(encodedSave);
    } catch(e) {
        return {};
    }
}

function encode(theSave) {
    return Base64.encode(LZWEncode(theSave));
}

function decode(encodedSave) {
    try {
        return LZWDecode(Base64.decode(encodedSave))
    } catch(e) {
        return {};
    }
}

// lzw-compress a string
function LZWEncode(s) {
    const dict = {};
    const data = String(s).split("");
    const out = [];
    let phrase = data[0];
    let code = 256;
    for (let i = 1; i < data.length; i++) {
        const currChar = data[i];
        if (dict[phrase + currChar] === undefined) {
            out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
            dict[phrase + currChar] = code;
            code++;
            phrase = currChar;
        } else {
            phrase += currChar;
        }
    }
    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
    for (let i = 0; i < out.length; i++) {
        out[i] = String.fromCharCode(out[i]);
    }
    return out.join("");
}

// decompress an LZW-encoded string
function LZWDecode(s) {
    const dict = {};
    const data = (String(s)).split("");
    let currChar = data[0];
    let oldPhrase = currChar;
    const out = [currChar];
    let code = 256;
    let phrase;
    for (let i = 1; i < data.length; i++) {
        const currCode = data[i].charCodeAt(0);
        if (currCode < 256) {
            phrase = data[i];
        } else {
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

const Base64 = {
    // private property
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode(input) {
        let output = "";
        let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        let i = 0;

        input = Base64.UTF8Encode(input);

        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = 64;
                enc4 = 64;
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
    decode(input) {
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

            output += String.fromCharCode(chr1);
            if (enc3 !== 64) {
                output += String.fromCharCode(chr2);
            }
            if (enc4 !== 64) {
                output += String.fromCharCode(chr3);
            }
        }
        output = Base64.UTF8Decode(output);
        return output;
    },

    // private method for UTF-8 encoding
    UTF8Encode(string) {
        string = string.replace(/\r\n/gu, "\n");
        let utftext = "";

        for (let n = 0; n < string.length; n++) {
            const c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    },

    // private method for UTF-8 decoding
    UTF8Decode(utftext) {
        let string = "";
        let i = 0;
        let c = 0, c2 = 0;
        while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                const c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
};


function roughSizeOfObject(object) {

    const objectList = [];
    const stack = [object];
    let bytes = 0;

    while (stack.length) {
        const value = stack.pop();
        if (typeof value === "boolean") {
            bytes += 4;
        } else if (typeof value === "string") {
            bytes += value.length * 2;
        } else if (typeof value === "number") {
            bytes += 8;
        } else if (typeof value === "object" && objectList.indexOf(value) === -1) {
            objectList.push(value);
            for (const i in value) {
                stack.push(value[i]);
            }
        }
    }
    return bytes;
}

// modified from: https://stackoverflow.com/questions/879152/how-do-i-make-javascript-beep/13194087#13194087
function beep(duration) {
    const ctxClass = window.audioContext || window.AudioContext || window.AudioContext || window.webkitAudioContext;
    const ctx = new ctxClass();
    const osc = ctx.createOscillator();

    // stop/start for new browsers, on/off for old
    osc.connect(ctx.destination);
    if (osc.noteOn) osc.noteOn(0);
    if (osc.start) osc.start();

    setTimeout(() => {
        if (osc.noteOff) osc.noteOff(0);
        if (osc.stop) osc.stop();
    }, duration);
}

function statistics() {
    let actionCount = 0;
    let actionWithStoryCount = 0;
    let multiPartActionCount = 0;
    let PBAActionCount = 0;
    let limitedActionCount = 0;
    let storyCount = 0;
    // let skillCount = 0;
    // let buffCount = 0;
    for (const action of totalActionList) {
        if (action.storyReqs !== undefined) {
            const name = action.name.toLowerCase().replace(/ /gu, "_");
            storyCount += _txt(`actions>${name}`, "fallback").split("⮀").length - 1;
            actionWithStoryCount++;
        }
        if (action.type === "progress") PBAActionCount++;
        else if (action.type === "limited") limitedActionCount++;
        else if (action.type === "multipart") multiPartActionCount++;
        actionCount++;
    }

    const list = 
`Actions: ${actionCount} (${actionWithStoryCount} with story)
 Multi part actions: ${multiPartActionCount}
 Progress based actions: ${PBAActionCount}
 Limited actions: ${limitedActionCount}
 Training actions: ${trainingActions.length}/9
 Stories: ${storyCount} (~${(storyCount / actionCount).toFixed(2)} avg per action)
 Skills: ${skillList.length}
 Buffs: ${buffList.length}`;
    return list;
}

function benchmark(code, iterations) {
    // supposed to kinda account for the cost of just running the eval
    const baseCost = iterations / 20;
    const before = Date.now();
    for (let i = 0; i < iterations; i++) {
        // eslint-disable-next-line no-eval
        eval(code);
    }
    const after = Date.now();
    return `Total cost: ${after - before - baseCost}ms\n Cost per iteration: ~${(after - before - baseCost) / iterations}ms`;
}

// make a lazy getter for an object (most useful for prototypes), which executes the
// provided function once upon first attempting to get the property, and in the future has
// the computed result as an own property of the instance
// usage: defineLazyGetter(A.prototype, 'prop', function() { return ...; })
function defineLazyGetter(object, name, getter) {
    Object.defineProperty(object, name, {
        get() {
            if (Object.prototype.hasOwnProperty.call(this, name)) {
                // only used if this getter itself is own
                // otherwise, shadowing the property is enough
                delete this[name];
            }
            Object.defineProperty(this, name, {
                value: getter.call(this)
            });
            return this[name];
        },
        configurable: true,
    });
}

const Raw = {
    html(strings, ...exprs) {
        let htmlString = String.raw(strings, ...exprs);
        if (strings.raw[0][0] === '\n' || strings.raw[0][0] === '\r') { // if this starts with an explicit linebreak, strip early whitespace
            htmlString = htmlString.trimStart();
        }
        return htmlString;
    },
    css(strings, ...exprs) {
        return String.raw(strings, ...exprs);
    },
}
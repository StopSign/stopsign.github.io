//because I hate IE so much
Math.log2 = Math.log2 || function(x){return Math.log(x)*Math.LOG2E;};
Math.logx = function(num, x) {
  return Math.log(num) / Math.log(x);
}

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

function round(num) {
  return formatNumber(num);
} function formatNumber(num) {
  return Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

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
  

/*
  Converts an HSL color value to RGB. Conversion formula
  adapted from http://en.wikipedia.org/wiki/HSL_color_space.
  Assumes h, s, and l are contained in the set [0, 1] and
  returns r, g, and b in the set [0, 255].
 
  @param   Number  h       The hue
  @param   Number  s       The saturation
  @param   Number  l       The lightness
  @return  Array           The RGB representation
 */
function hslToRgb(h, s, l){
  var r, g, b;

  if(s == 0){
    r = g = b = l; // achromatic
  }else{
    var hue2rgb = function hue2rgb(p, q, t){
      if(t < 0) t += 1;
      if(t > 1) t -= 1;
      if(t < 1/6) return p + (q - p) * 6 * t;
      if(t < 1/2) return q;
      if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/*
  Converts an RGB color value to HSL. Conversion formula
  adapted from http://en.wikipedia.org/wiki/HSL_color_space.
  Assumes r, g, and b are contained in the set [0, 255] and
  returns h, s, and l in the set [0, 1].
 
  @param   Number  r       The red color value
  @param   Number  g       The green color value
  @param   Number  b       The blue color value
  @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b){
  r /= 255, g /= 255, b /= 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if(max == min){
    h = s = 0; // achromatic
  }else{
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch(max){
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h, s, l];
}
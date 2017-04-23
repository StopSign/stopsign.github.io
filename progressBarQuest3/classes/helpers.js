/**
 * Created by Jim on 4/23/2017.
 */

//because I hate IE so much
Math.log2 = Math.log2 || function(x){return Math.log(x)*Math.LOG2E;};

function round1(num) {
    return Math.floor(num*10)/10
}

function round(num) {
    return formatNumber(num);
} function formatNumber(num) {
    return Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
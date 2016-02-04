

function round3(num) {
    return (Math.floor(num * 1000) / 1000).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function round2(num) {
    return (Math.floor(num * 100) / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function round1(num) {
    return (Math.floor(num * 10) / 10).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function round(num) {
    return Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function roundtoFormat1(num) {
    return num.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function roundtoFormat2(num) {
    return num.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
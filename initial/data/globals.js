//Driver globals
let gameSpeed = 1;
let bonusSpeed = 1;

let curTime = new Date();
let gameTicksLeft = 0;
let sudoStop = false;
let saveTimer = 2000;
let ticksPerSecond = 50;
let totalTime = 0;
let ticksForSeconds = 0;

//Saving globals
let isFileSystem = !!location.href.match("file");
let saveName = "";

let stop = false;
let res = {};

let prevState = {};

//Game globals
let data = {};

function loadDefaults() {

}
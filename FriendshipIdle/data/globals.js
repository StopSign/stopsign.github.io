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
//need to be instantiated before load
data.ingredients = {};
data.recipes = {};

let labels = {};
labels.numbers = [];

let displayItemCount = 0;
let prevDisplayItemCount = 0;

let breadDivs = [];
let visibleBreadDivs = [];
let trayDivs = [];

let expertiseNames = ["Untrained", "Novice", "Beginner", "Apprentice", "Competent", "Proficient", "Trained", "Skilled", "Seasoned", "Adept", "Expert", "Senior Expert", "Master", "Grandmaster"];
let familiarityNames = ["Stranger", "Contact", "Acquaintance", "New Customer", "Regular", "Returning Customer", "Regular", "Recognized Shopper", "Valued Customer", "Frequent Buyer", "Preferred Customer", "Trusted Client", "Consultant", "Advisor", "Business Ally", "Partner", "Collaborator", "Insider", "Business Family", "Confidant"];

let language = "english";

function loadDefaults() {
    data.showGlass = true;
    data.showDoors = true;
    data.eggTimerSeconds = 0;
    data.ingredients = {};
    data.ingredientLength = 0;
    data.recipes = {};
    data.emily = {};
    data.emily.money = 0;
    data.emily.sellProfitRatio = 1.1;
}
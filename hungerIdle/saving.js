function startGame() {
    if (isFileSystem) {
    } else {
        window.doWork = new Worker('helpers/interval.js');
        window.doWork.onmessage = function (event) {
            if (event.data === 'interval.start') {
                tick();
            }
        };
    }
    window.localStorage[saveName] = "";
    //window.localStorage[saveName] = "eyJhbGwiOsSAY2hhcsSFxIBuYW1lxIUiVm9pZGxpbmciLCJzdGF0c8SMxIF0xKBja1NwZWVkTWF4xIUyMMS0xJ1oZcSCdGjEr8SxOjUzLjHEtsS4bMS6UmVnZW7EhTDEncSfcsWKZ8S6xIU2LjIyxJ1jb27En2l0dXRpxZvEhcWAMznEnWFnacSYdHnFjMSdZGV4dGVyxZ7FrjrFjSLEq3JjZXDFocWjxbnEncWQZmzFssWvIsaFxodjdMaJxIlyxbHFi8aDxJ5jYXbFkcSRxbkuMMWYImh1bsaOxpTEn8SPxJlhxLzGiXDElXPGgsW6xZDFmsaYxIvGm8adfcSdYmFzxprEgMS3xLnEu8SwxIXEv8WBxY50xZDEmsWTOsWVxZfFmcWbxZ3Fn8aBxpPFpcWnxpXGl8aZxYzGnMaexrBvxrLHl8a1xajEpmHEqMSqxKxkQ3XGs8W6xqtpxq3Gk8W6xr3FhWjHpsazx4LFgsSexKBtxqfHssWMxrYixYplbcW4xI3Ej8aaIk1vc8Sjx4TEocSjxIbGn8ahdMapOsSzxLUixZrFnHXEkMiRyJPHrsWExLrIkTHGnsShxKfEqcSrxK3IkTbEtMiUx6/FhsWIxYrGicWPxZHHiMW6yJbHjsWgxaLHrcWoxarFrMW4xbrFscWzxbXFt8aqxbXFvsaAyLfGicaLxojGlMmIxo3Gj8SKxpLIr8aWxpjEmsaax67Ij8ivx7fGp8iRx6nGrMauxoRlxrHFtce7yZ53yY7EpMirxr/EvTXHvMagxqLHusaUyLTImGXJrsW6x6tIyI/ErcSFZsSCxrrEncerQ8eNybFkybnJu2XHjMSEyYpvd8aJyKLHocikx6TJs8Sdx6rHrMaPyJ3HscenxIXIoMiKx7jEjsmzx7xsb2fIjFtdx7xmaWdodEzHq8ajW8SAcXVhxqLJgToiMcScIsSOxJDEkkZydcWeyrjFmsqHxq/KicSyxJ1mb3XKqMajxbrFocSQxrM3OMipxrbKr8qxyrPFrcSSMTDKuMq6yITIhsiIy4Fvy4PGhMuFxpTLiMuKyqnGicuOyaE6Mcioy5Msy5XKssWhy5jKtcq3xJ3LncSSVG9hyoLKhsqYy6TKisumy4nLi8uqacuPx7tdxJ3HvsiAU2XGjMeQRMShYcSFW8quyrnIg8SSy5/IicaKyrJrxonGocqfxKjJuDrHhXXKhciVyoDEkMqCxbnLlMyYyrvKtUbKn3fJocaEzJ7MoG7MomvMpMymzKjJsMyryaLIgsywIsq9yr/Gjsy2bsyfxpTMoW/Mo8yszL3HjMiXzYDMrcyKzJfLucq1y7vLvcq4csy3zYvMuc2NzLvNj8q+zL7MqsykMH1dzIoidG/EoGxUzIfGmjQxyKAyfQ==";
    load();
}


let isFileSystem = !!location.href.match("file");
let saveName = "hunger";

let stop = false;

let prevState;

let all = {char: {}, enemy:{}};
let isCombat = false, isHunt = false, isFight = false, isConsume = false;
let combatTime;
let enemySelectionData = [];
let fightList = [];
let selectedFight = {col:-1, row:-1};


function clearSave() { //Doesn't work atm
    window.localStorage[saveName] = "";
    load();
}

function loadDefaults() {
    all.char = {
        name: "Voidling",
        stats: {
            attackSpeedMax:2000
        },
        base: {
            healthMax: 5,
            strength: 5
        }
    };
    fixStartingStats(all.char);

    all.logs = [];
    createAllEnemySelection();
}

function load() {
    loadDefaults();
    let toLoad = {};
    if(window.localStorage[saveName]) { //has a save file
        toLoad = JSON.parse(window.localStorage[saveName]);

        for (let property in toLoad.all.char.stats) {
            if (toLoad.all.char.stats.hasOwnProperty(property)) {
                all.char.stats[property] = toLoad.all.char.stats[property];
            }
        }
        for (let property in toLoad.all.char.base) {
            if (toLoad.all.char.base.hasOwnProperty(property)) {
                all.char.base[property] = toLoad.all.char.base[property];
            }
        }
        all.char.healthCur = toLoad.all.char.healthCur;
        all.char.staminaCur = toLoad.all.char.staminaCur;
        if(toLoad.fightList) {
            fightList = toLoad.fightList;
            for(let i = 0; i < fightList.length; i++) { //clear out fought
                fightList[i].fought = 0;
            }
            view.create.fightList();
        }
        if(toLoad.enemySelectionData) {
            for (let i = 0; i < enemySelectionData.length; i++) {
                for (let j = 0; j < enemySelectionData[i].length; j++) {
                    if (toLoad.enemySelectionData[i] && toLoad.enemySelectionData[i][j]) {
                        enemySelectionData[i][j] = toLoad.enemySelectionData[i][j];
                    }
                }
            }
        }
        totalTime = toLoad.totalTime === undefined ? 0 : toLoad.totalTime;
    }

    view.initialize();
    selectFight(0, 0);

    all.enemy = createEnemy(0, 0);
    recalcInterval(60);
    toLoad = {};
}

function save() {
    let toSave = {};
    toSave.all = all;
    toSave.fightList = fightList;
    toSave.enemySelectionData = enemySelectionData;
    toSave.totalTime = totalTime;

    window.localStorage[saveName] = JSON.stringify(toSave);
}

function exportSave() {
    save();
    let encoded = encode(window.localStorage[saveName]);
    console.log(encoded);
    // document.getElementById("exportImportSave").value = encoded;
    // document.getElementById("exportImportSave").select();
    // document.execCommand('copy');
    // document.getElementById("exportImportSave").value = "";
}

// function importSave() {
//     window.localStorage[saveName] = decode(document.getElementById("exportImportSave").value);
//
//     load();
// }
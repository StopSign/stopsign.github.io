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

    // window.localStorage[saveName] = decode("eyJ0b3RhbFRpbWUiOjU1OTM5MCzEgcSDxIVWb2xjxIsxNcSTcmVzxIvEgGNhc2jEi8SSImljxIo6MjAuxJw1MsSzNzQwMTM2NzUzxJNjYsSDxKE6xKnFgMWCTWF4xIs0MsSTZsWBdMWDxKnFj8WHxYnEqMSTb8SfxZfEqnJvbsSLNTbEk2RpcnTEizMwxY0ic3RlZWzFm2xhbmTFm3VzZWRMxbTFtsWExJNixKVlxbzFtcWbc29pxbHFv8WsxIR0acWexYMxfcSTbG/EpGxBdG1vxKIiY28yxIsyOS4wNDk5xqczxaE3xLs0xJ0ixqDEqMaTImfGlcaBxpjGmsacOsSjxrLEjDHEsDk1MDDHgzY0M8S0OcWixrHGocWExrRyaXZlcsWDW8SjaHVua8eWxIB3YcWucsaiLjLEkDQ3xLQyNjY4MTg2xpIsx57HoMeUx6M0ODjFqTI4MMS2MsWMN8eCxpPHs8ehx6PGrcenx7w4OTfEuce8xI82fV3Ek8SEcmdlxac6IsWza2VfMCLIg8aex5nHm8edIsefyIU6ODTGpTUxxqnFjDgyxJw2MjfIocinx7U6Nzcux7nEusarx67EuMexyITIucS7LsarxqM3M8ixx73EjTLIt8e0x6I6x4cuxLU0MTHHqjDIizHHqMiRyJNhyJXIl8SLyJphyJxfMcigx7LIoseax5zEi8eXyKbJkcWgxqTGozPEvMe3MDbGpjXIismQyKg2My7IiznHr8mKx4cwM8avyLbJq8i4yZLHrMmVOcmZx6jHucesx63Kkcm+yLnHqMi9yL7HvDTEu8WqyonKi8mEyZLGrcqCyKoxxLfHicixxJDGqMmfxIHJociWyJjJpcmnxqHIoWPIo8muOsmwyo3Gs8qMybLHj8q+yKgwypjJksuDy4HIucuGyqPGs8iSyq/JosqyyJvInTPIoMuMy5DIpW1pbsSIdW3Em8WFYXBhY2l0ecudx4TEk8uYxITInEnLmcaOxIXEqMSxxJNlZmbEq2llbmN5y6zLo2nLr8WExqUxyaDLjsmkx5HHk3LJqCLGgHXGiciYdHJ1Zcuoxb7Eqcq8OseAxqXJi8S6xI/JvMSOyp7KkcuybGVjzI/LtsukxJvHqi7KnsajxqjMrcenMMe4y6huy6rErcSpb8yHZsaVd8WbZXbLn8WZx7TMlMalx4THgMqIyKo2yIvHiMajyLLEtMWYzLjMulLHtMuwzYTEk3VwZ3JhZMStxIDIlm7HlMegxZnFqMyyzLTGs8ihy5fLmW3Lm8SLx7zLnsugy6LMp8yXx4TLp8SqzLPJpmXLvMuuxorEsMWry7PLtcuiy7jLus25y77Nu8yBzIPKscyFx5LHlF/GocyLzI3Ei8yPzJHMk8SbxJPMls2txLHItceAyYozMTbFoTnMocyjzKXNsMulOsqBN8eFzK3OqsapyqDNpM23xZvMt8eUzLlvzLvGi8y9zL/NmcWuzYLHhM2txLnIrcywx6zItceIOM2OzrLNkM2SzIDNlCLNls2YzZrNnMa1y7jNoMSCyZLFq8upzq/Hj82ny5jLmsucxK7Ns8S/y5/LocujzqXHg8+ezbXMtM6Dy7/EsDTLssu0y7bOgcu7y63OhM2TzILLjc6IyJnMhs6Ly5LOjmxkQ2/FrcadxaXFnsWgxKnFpMWmxqLHhMa0acW+xavMlsitxqvIvceKybbItDLHqs6gIsWwzqLHkc6kxZvPlsiczrDNj860zLzMvnDNgM66zZPQj8m8yLvGo8qAx4LHpcS+xrHQoXfNkcWuzZPEuM2VzZfNmc2bxp3Nns+SzaLGi9CezLXGtGLMjGzImGbEhcW5z5nNqc2rz53Ns9GP0Y/Pn82vz6LFqNGQ0ZbEqdGBz6jOhc+E0JjPrc6Ay7nPsMu9z6nOhs+1yaPImcyKItGExonPvc+/yJjEgMWtxa/Gis+kxaPFpciYz6TQic6TzqbOlcq/xKnQmcyk0JvRlNGAzbbQn8aLzrFyzrPOtdG90KTQpsW60KDPhs600LTMtc2Dz7TPjNC6z4/Qvc650L/RmNKD0YLPu9GH0Yllyq5jxpV1ZMilzJbFjDbMqsavOce/zKzEs8m2N8SeYcuYxZvNmcuYxIfEicmSx67SsiLSt25Edc65xo/FnzrEt8yVy5hk0rnIuceL0bjLisyXyK7EsciLyK3HqMqEyI/Hi9Kz0rXGi9K/04vJkseJzbTSv9OB04PQg9OGzbR304nTncWoyLLIkMuHz5TEtsekx67Hgsenx6vJiM+00r/SttK0btOp04bTh9OZ04DTgseg04TFi9Om06jEiMi5xK/OncuE07jTmsSp05zUhsmSxaHToNO506LUgdOk073IptSF0rrNrNSJy4zFhnRSzrTIpW5hxInJpE3LmGUgT8WaxJNwTsWvzZvFvs2txL/Rrcad0b7Oo9KBx7HKs8y1zZXLmXHMkUTHksmk1KrEnzogPMWkdiDQiz0nxZllJyDSo8Slc9WNxYHPvCc+PC/ViT7RqGF1xILEi9GIbMW5xL/FkM++x5rImNCwbsubTMuzyJjEqXBD04LEn8yz0J3MlMSTaNCLzZvThdWk0YrJq9Sj1KXImVDFncSsc3PVhMSK1K3Ur8W60o3RjtS00IDGvNCYzKLRv8ymzqXFq9WPxJvGtMuQxZvVoNWiOs6RzJLGntWob9WqzaMi1a1t1a9m1bHUrdW0ctW21q7EqsW+0pTUvtWA1YLRp9W61bzLuNWj0qDIodaCxK0iQtGFZCBDLkLEg9Go1K7UsNaP1LPGntS11pPUt9KAzbHQsNCC04XUutadxovWn8a71b/Wo9Se1anVt8yXxJPWqtas1rPVs9W1y7jWs9CLxqLUvWnUv2XVgXbJpNGo1btk1b3WvtWl0qHWgdSk14JDaMqwy5hnIFPGjdSC1ozXjta1xK/Ppcaf1pLEgNeU1pfQhNCF0bXLptacz5fEqcea17DWuNe0yJnWsNay14fXicSDIG3FidWG1YjHktWLZNWNxa3UlW5z1ZnVm9Wd17bWvNOF1qLEk9ed17rVptakxIPXotaz16bVsMWb16nWsder1bjFqNeA177JpETHkWxsIEjEmNaLIteN1o7QjNOHxKnYudahzJDXoNeS2JDWldS4zbHJj8aUz5fWttib17LWuSI8YnI+RGVwdGjYp9WJ2KrVjc2b2bBo1ZHVk9aI1Y1wxJ/LosW5Tsub2LHVnMeSPsSXxJnFtG8gx6DZs9ip1Ywn2bfZsdaN1LHZusWz2bwn2b7Mo2nagdqD1ZrahXY+1oXEoHPTgmXajtWK2pDamtaI2qbaltWU2b3Zv9qcZdqCbdqE1Z3aiMSkbtqL16faqNm1J3bEmGPTotqu2pjamtqA2rPantiy2obYqNqp2Kvav9uBT9WhcNWh2rbahtGo16HWptejxqvXpdWu2YHGi9mD1rLMqMS20ZjFvs+rIte317k615/ZiNaDIlDFs8SsINWB0IfYidmVxIvJus202I7RrtaU0JrYktekItCGyJjHgNiX0oTFq8eaxpVjyJzFvtef1L3ciGvXhHTEgtOF2anZtNqQ3IfGltyP1aHckjTbhNWVJ9GE3JHFniBnxZ7VkCDFntKjxKtr1Y3cqdyJUtmv0rRyRsmhbdeKdCh71YvFnW7VhjUgfSnVmdyvy6DFpSDcs3JtINy2IGbFmSDcvteY24raodGo2JrXsdezyaTEpWRm1Z/Vodee0qDVp9i925nYv9ud1q3Zgtif2YXRgMW+xrDbqNa926rWv8uM3ZXMkcad2pLEp9OQzbTdtNqU1o/Rs9mTxJ/arMWazIDEusS0yqnEnMSPx7fEucWr24DEmdOixZveiWNNddGG1pvFo8We2K5M2pzImFvYt96a2Zss3pvOkt6ezJLeoN6d3pzeoti31a3Zjd6j3p/epN6r3qrerd6h3qzMkt6nbCzest6p3q/ert623rTekN6z3qXesN62y4xk3pTGjsaQU2jOtNiDya9dfQ==");

    load();
}


let username = "Anon";
let isFileSystem = !!location.href.match("file");
let saveName = "terrafold21";

let stop = false;
let totalTime;
let totalWater, buyAmount, totalVolc;

let res, unique, localAtmo, globalAtmo;
let rivers, lakes, clouds, cbotRows, donationList, donationsShowing;

let dirtName;

let prevState = {};
let loadDonations = true;

function clearSave() { //Doesn't work atm
    window.localStorage[saveName] = "";
    load();
}

function loadDefaults() {
    totalTime = 0;
    res = {
        cash:0,
        ice:0,
        cbots:1,
        cbotsMax:1,
        fbots:0,
        fbotsMax:0,
        ore:0,
        iron:0,
        dirt:0,
        steel:0,
        land:0,
        usedLand:0,
        baseLand:0,
        soil:0,
        stations:1,
        sp:0
    };
    unique = {
        depth:0,
        depthNeeded:500,
        pressure:1,
        volcDur: 0,
        volcMult: 1
    };
    localAtmo = {
        co2:0,
        o2:0
    };
    globalAtmo = copyArray(localAtmo);
    totalWater = 0;
    totalVolc = 0;
    buyAmount = 1;

    rivers = [];
    lakes = [];
    clouds = [];
    cbotRows = [];
    donationList = []; //boolean vars for unlocking donations
    donationsShowing = [];
    dirtName = getRandomUsername();

    loadData();
}

function load() {
    loadDefaults();
    let toLoad = {};
    if(window.localStorage[saveName]) { //has a save file
        // toLoad = JSON.parse(window.localStorage[saveName]);
    }

    if(toLoad.totalTime !== undefined) {totalTime = toLoad.totalTime; }
    if(toLoad.totalVolc !== undefined) {totalVolc = toLoad.totalVolc; }

    if(toLoad.res !== undefined) { res = toLoad.res; }
    if(toLoad.localAtmo !== undefined) {localAtmo = toLoad.localAtmo; }
    if(toLoad.globalAtmo !== undefined) {globalAtmo = toLoad.globalAtmo; }
    if(toLoad.rivers !== undefined) {
        for(let i = 0; i < toLoad.rivers.length; i++) {
            for(let property in toLoad.rivers[i]) {
                if(toLoad.rivers[i].hasOwnProperty(property) && toLoad.rivers[i][property] !== "noload") {
                    rivers[i][property] = toLoad.rivers[i][property];
                }
            }
        }
    }
    if(toLoad.lakes !== undefined) {
        for(let i = 0; i < toLoad.lakes.length; i++) {
            for(let property in toLoad.lakes[i]) {
                if(toLoad.lakes[i].hasOwnProperty(property) && toLoad.lakes[i][property] !== "noload") {
                    lakes[i][property] = toLoad.lakes[i][property];
                }
            }
        }
    }
    if(toLoad.clouds !== undefined) {
        for(let i = 0; i < toLoad.clouds.length; i++) {
            for(let property in toLoad.clouds[i]) {
                if(toLoad.clouds[i].hasOwnProperty(property) && toLoad.clouds[i][property] !== "noload") {
                    clouds[i][property] = toLoad.clouds[i][property];
                }
            }
        }
    }
    if(toLoad.cbotRows !== undefined) {
        for(let i = 0; i < toLoad.cbotRows.length; i++) {
            for(let property in toLoad.cbotRows[i]) {
                if(toLoad.cbotRows[i].hasOwnProperty(property) && toLoad.cbotRows[i][property] !== "noload") {
                    cbotRows[i][property] = toLoad.cbotRows[i][property];
                }
            }
        }
    }
    if(toLoad.unique !== undefined) { unique = toLoad.unique; }
    if(toLoad.donationList !== undefined) { donationList = toLoad.donationList; }
    if(toLoad.donationsShowing !== undefined) { donationsShowing = toLoad.donationsShowing; }

    view.initialize();
    recalcInterval(50);
}

function save() {
    let toSave = {};

    toSave.totalTime = totalTime;
    toSave.totalVolc = totalVolc;

    toSave.res = res;
    toSave.localAtmo = localAtmo;
    toSave.globalAtmo = globalAtmo;
    toSave.rivers = rivers;
    toSave.lakes = copyArray(lakes);
    for(let lake of toSave.lakes) {
        lake.intakeList = "noload";
    }
    toSave.clouds = clouds;
    toSave.cbotRows = copyArray(cbotRows);
    for(let cbotRow of toSave.cbotRows) {
        cbotRow.unlockButton = "noload";
        cbotRow.uniqueDiv = "noload";
    }
    toSave.unique = unique;
    toSave.donationList = donationList;
    toSave.donationsShowing = donationsShowing;

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
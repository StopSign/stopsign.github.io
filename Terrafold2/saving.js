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

    // window.localStorage[saveName] = decode("eyJ0b3RhbFRpbWUiOjU0OTAwNjMsxIHEg8SFVm9sY8SLMjMyxJRyZXPEi8SAY2FzaMSLMMSUaWPEijowLsSQxLMzxLXEkDE4NjU5ODI0Nzk1xJRjYsSDxKPEsMWDxYV0c01heMSLxJ4xxJ8iZsWKxYfEq8WUxZbFjcWPxYgib8ShxJw3xYIiaXJvbsSLMcWiNMSUZMWldMWpMzU3xJMic3RlZWzEqsSUbGFuZMW8InVzZWRMxb/GgcWdYsSnZcaIxoDGgnNvacW7xLB9xb1vxKZsQXRtb8SkImNvMsWpOTQuOTnEtcapxbQxOcWiN8SUxqPEqsaXImdsb8aMxpvGncafOsSlxrM6McS6MDnEssSRNsSQMjY4N8S+xrLGpMaWxKBpdmVyxYdbxKVodW5rx5fEgHdhxbhyxZAuN8SzMjDFtDMxM8S5xLtlLTfGl8efx6HHlcSLxqcxx7nHrDQxxL/GqsS4NDbHsMeyLMe0x6LHty41NsWAx4o4x6swxbLHrTQ0yIN9XcSUxIRyZ2XFsDoixb5rZV8wIsezxqHHmsecx54ix6DIhzrHqzjIiTbHijcxMMS+xJ02OcimyKzHtsiuxLkuODDHgjjFgciKxqbEtTbIu8e1x6PIvjLHpceKNjQwNci3xLw2yYnIhciryYvFkMmXx6U1McWzx4LHhMeIyJPHssiXxIFhyJrInMSLyJ9hyKFfMcilyZljyKjHncSLx5jJmsitMjU1LjPHjceMxqnFqsSPx7vJism6ybzHpTPEjsSQNzTKisetyI7Khsi9ybvJvTbHvcmSNcSex64yOcmYyIbKk8qZxqjIsseox4LIi8mIyLbKksmMybvEscSPypnFqsS1xaLHucetyJbImMmpyJvIncmtya/GpMimybTHm8m2Osm4yLzKqi7Ev8ewxZHKqcScy4Q3y4YyMcuIOsmOy4Uty4fJmcuCy4nLksuUyp/Lg8uYy43Lj8uRy4vLk8udyafImcq3yazIoMiiM8ilyafLp8iqbWluxIh1bcWpxZjEpnBhY2l0ecu0xJDErG7EhMihScuwdGnEhcSqLjHElGVmZsStaWVuY3nMg8u6zIbGlcSxyYLKtcmqyrhyx5PHlcmwIsSUYnXGlMiddHJ1ZcSsxorFmMuWx4EwyJPJvsqcNDjJgcizy43Fo8W6ZWPMqMyPy7vFqcyJN8mByYLFkjfNg8eoxL7MisWkzIDJrsSvxLHNi2/HlHJmxrh3zIjMscqOOMqOyaDKjcWqzYfKmcyLdmFwxZ/HtcytxLLItciTxqvHvzTHisiQNTjGss2TzZVvd1LHtc2YzJrGg3BncmFkxK/EgMibbseVx6HFn8SLzbLNjMyBzY99yKbLrsuwbcuyzonLvsahzaTLuMu6y7zMsMSzy7/OjMyVzIXMh8SwxLLMusyNzI/MkcyTzp/Ml82YzYvLpMmryJ7Mns2TX8akzKPMpWzMp8ypzKvFpMaKzYvMr8i1x6g2LsiyxJLEujLJu8mgzLpszLzMvsu5zYDOosepxL7GqTnJoDkyN8eLxYHFtcuvzozNmMWjzZLHlc21zZfOos6/xqrKmciLx4zFtMiKzZvNos2kzabFuM2ozr7EkcqAyo7Kq8amxYDNs8+fzZbNuMW4zbrNi3XNvc2/zoHGoM6EzobEgsmMNs6dzY7GtM6Py6/Lscuzy5DOnM6Wy7fPjM6aNcSzxZjPms2OzqnOocyZybvMi86ly7nOp8yUzITOqs+OzqzKts6uIs6wzKDLqc60xpRkQ2/Ft8agxaXFp8WpxaPFrnLInci1MMa1acaKxZPMr8S+xI0zy4TNsTLJgcS5xZLHqcyLz4nMvcye0JPEi8eFzLjQldCWyYLHqcaxzovQicWdz57NlM2WxoJlzaPNpc2/z67MiNGCyo7Hpsm/xarJhMiOzLbPt9GdzbbPus2Px4bPvc+/zoDOgsa2zJHQhM6IxZ3QmMihxrTQrc62xItmxIXGhdCLzpHOk9CP0ZXSisWDzpfRkMiu0orSi9GZzILQo9CbxLLFk8yMzI7QoMyS0KLMltKVzbvOrcq4zKIizKTQrtCw0LLGvsW2xbjFusSL0ZTFrcWv0qzQltC9xorFtcyvyLDHvciKx4TMtc+WxLrIgTPHsMau0YzPitGPzpnGgtG9zY/Rrs+g0Z/Roc+txobOicyJNMmG0rnTkMqNxI85x7DHjsWezbTPuc25z47Nu8++zb7RttCC0bnRo9G70JfNjdG+x5HSo861yJ3Sg2zShcmnY8a4dWTIqs69xqrHhci5yYXEnc+SxLzEvcSgYcuvxoLNv8uvxIfEicmMxJ7FmNSDbkR10aNp0LU6yZLMrsuvZNSFyL3KncSQy4/Gr8SxxL3Hq8m8M8iLzbHHgtO/1IHFndSK1JbUh8eo1InUgNSL1I3HodSPxajUkc6Vd9SU1KjFqci0M8uPxarHvc+BMzDHjDjQlcS7ypzOitSK1ILUrNS21JHUktSk1K3UjtSQ1YvIq9S1xIjIvcmf1LnLlcmbx4HJgMSOyb/EkMWyx6zIr8iCLceo1YzVh9SE1ZPJjNK41KvLr9SM1Y7UsdWQ1LTGgNWJyq7UudOwxYpSzbbIqm5hxInJrE3Lr2UgT8WgxJRwTsW5zoHGis2ExYPQscidxIDMu9GOzL/OmsuOxb3RmsWYx5tpccyqRMeTyazWgcShOiA8xa52INC+PSfFn2UnPjwv1qM+0qJhdcSC0oLShM65xYTEg9Cwx5vIncmSxJRuy7JMzIzIncWYcEPUjcShzIDThcytyKbVutW8yJ5QxabErnNz1p7EitaE1obGhtON0onWi9Kn1o7Rjc+L04TLkMayxaDHgca1y6fGgtay1rQ6zKjMqsWJ1rlv1rvLtNa+14DXgsaC14XXh8yR14PMrMWpxJTWl9aZZdabdsmsybLEgNeNxK8iQs61ZCBDLkLEg9Ki1oXWh9ea1orGodaMxqDWj9egz43PmcWm1LHWk8q504ci16nGvdOtxoXXrnTWuteJ1LLXs23XgWbXuiLXt3LXiNiw0L7EnNe9y7DXv9iB2IPXjNW72IdEzJ5sbCBIxJnXltix15jWiMSc1JLFmNijxIvXrNa32JfSqNiZ04PPjdif16fHgdi41pjWmtacyJ48YnI+RGVwdGjWoNaix5PWpWTWp86B2aVoJyDTscSnc9ancMShy7nGhU7Lstar1q3Wr8SYxJrFv28gx6HZqNaj2avZrdmk2abZicaG2bHZs9eT2bbZuGnZutm81qzWrseTPteQxKJz1I1l2obZqtamJ9m32pvandqOxb7akNqi2pLalG3ZvdqXdj7agMSmbtqD2K502p/WpNqhdsSZY9Ws2qbZtNqRzLzak2XZu9qs2pbWr9mp2rjZrCfausSaT9azcNaz2q3Wr9Ki1rjYqNew2KrHq8+F2Kzatde214bYs9e514rFkNi9144iUMW+xK4g1pvQudiR2ozGiseIzpXGotedItmU1pHXvCLQuNC60LzWlNOoxZPHm8a4Y8ihxorYpc65277GmWvYiXTEgtSxItuI2ogn3IXcgNyI3Io02r7aqMyk3InFpyBnxafWqiDFp9OxxK1r1qfcoNyAUtmk1IByRsmpbdiPdCh71qXYndagNSB9Kdar3KbLt8WlINyqcm0g3K0gZsWfINy00LRu2b7amNKi177ZnNiCyJ7Ep2Rm1rHWs9ik1rbYp9ip2LDWv9it17XFndiy2LTbodSRyrTGg9i5zKrGoNmu2abHt9CQ3ado263SsNeExKHXk9qdz5zTk8+Fza7HqcetyIzUoMSU24zavNSNxoLdvE110oHXpcWtxafUr8WnTNqTyJ1b2ZAs3o3ej8643o7ekd6Q163elMyr3pbekt6V3pPem96a3p3el96c3p/ent6ZZcmnZN6GzIXFp3NTaM22y69nybddfQ==");

    load();
}

let isFileSystem = !!location.href.match("file");
let saveName = "terrafold2";

let stop = false;
let totalTime;
let totalWater, buyAmount, totalVolc;

let res, unique, localAtmo, globalAtmo;
let rivers, lakes, clouds, cbotRows, donationList, donationsShowing;

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
        stations:1
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
                if(toLoad.rivers[i].hasOwnProperty(property)) {
                    rivers[i][property] = toLoad.rivers[i][property];
                }
            }
        }
    }
    if(toLoad.lakes !== undefined) {
        for(let i = 0; i < toLoad.lakes.length; i++) {
            for(let property in toLoad.lakes[i]) {
                if(toLoad.lakes[i].hasOwnProperty(property)) {
                    lakes[i][property] = toLoad.lakes[i][property];
                }
            }
        }
    }
    if(toLoad.clouds !== undefined) {
        for(let i = 0; i < toLoad.clouds.length; i++) {
            for(let property in toLoad.clouds[i]) {
                if(toLoad.clouds[i].hasOwnProperty(property)) {
                    clouds[i][property] = toLoad.clouds[i][property];
                }
            }
        }
    }
    if(toLoad.cbotRows !== undefined) {
        for(let i = 0; i < toLoad.cbotRows.length; i++) {
            for(let property in toLoad.cbotRows[i]) {
                if(toLoad.cbotRows[i].hasOwnProperty(property)) {
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
    toSave.lakes = lakes;
    toSave.clouds = clouds;
    toSave.cbotRows = cbotRows;
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
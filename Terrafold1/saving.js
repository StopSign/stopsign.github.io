var doWork = new Worker('interval.js');
doWork.onmessage = function (event) {
    if (event.data === 'interval.start') {
        tick();
    }
};

var view;
var game;
var timer = 0;
var stop = 0;
var cometId = 0;

var timeList = [];

function clearSave() {
    window.localStorage.terrafold2 = "";
    load();
}

function loadDefaults() {
    view = new View();
    game = new Game();
    game.initialize();
}

function setInitialView() {
    view.checkSpaceDockUnlocked();
    view.updateSpaceDock();
    view.checkTractorBeamUnlocked();
    view.checkSpaceStationUnlocked();
    view.checkEnergyUnlocked();
    view.updateComputer();
    view.checkComputerUnlocked();
    view.updateRobots();
    view.checkRobotsUnlocked();
}


function load() {
    loadDefaults();
    if (!window.localStorage.terrafold2) { //New players to the game
        setInitialView();
        recalcInterval(10);
        return;
    }
    var toLoad = JSON.parse(window.localStorage.terrafold2);
    for(var property in toLoad.game) {
        if (toLoad.game.hasOwnProperty(property) && typeof toLoad.game[property] !== 'object') {
            game[property] = toLoad.game[property];
        }
    }
    loadGameVar(toLoad, "ice");
    loadGameVar(toLoad, "water");
    loadGameVar(toLoad, "clouds");
    loadGameVar(toLoad, "land");
    loadGameVar(toLoad, "trees");
    loadGameVar(toLoad, "farms");
    loadGameVar(toLoad, "population");
    loadGameVar(toLoad, "energy");
    loadGameVar(toLoad, "spaceStation");
    loadGameVar(toLoad, "tractorBeam");
    loadGameVar(toLoad, "spaceDock");

    game.computer.unlocked = toLoad.game.computer.unlocked;
    game.computer.threads = toLoad.game.computer.threads;
    game.computer.freeThreads = toLoad.game.computer.freeThreads;
    game.computer.speed = toLoad.game.computer.speed;
    for(var i = 0; i < toLoad.game.computer.processes.length; i++) {
        var rowData = toLoad.game.computer.processes[i];
        var row = game.computer.processes[i];
        row.currentTicks = rowData.currentTicks;
        row.ticksNeeded = rowData.ticksNeeded;
        row.threads = rowData.threads;
        row.cost = rowData.cost;
        row.isMoving = rowData.isMoving;
        row.completions = rowData.completions;
    }

    game.robots.unlocked = toLoad.game.robots.unlocked;
    game.robots.robots = toLoad.game.robots.robots;
    game.robots.robotsFree = toLoad.game.robots.robotsFree;
    game.robots.robotMax = toLoad.game.robots.robotMax;
    game.robots.ore = toLoad.game.robots.ore;
    game.robots.mines = toLoad.game.robots.mines;
    for(i = 0; i < toLoad.game.robots.jobs.length; i++) {
        rowData = toLoad.game.robots.jobs[i];
        row = game.robots.jobs[i];
        row.currentTicks = rowData.currentTicks;
        row.ticksNeeded = rowData.ticksNeeded;
        row.workers = rowData.workers;
        row.cost = rowData.cost;
        row.isMoving = rowData.isMoving;
        row.completions = rowData.completions;
    }

    document.getElementById('scienceSlider').value = game.population.scienceRatio;

    setInitialView();
    recalcInterval(10);
}

function loadGameVar(toLoad, theVar) {
    for(var property in toLoad.game[theVar]) {
        if (toLoad.game[theVar].hasOwnProperty(property)) {
            game[theVar][property] = toLoad.game[theVar][property];
        }
    }
}

function save() {
    var toSave = {};
    toSave.game = game;
    window.localStorage.terrafold2 = JSON.stringify(toSave);
}

function exportSave() {
    save();
    document.getElementById("exportImportSave").value = encode(window.localStorage.terrafold2);
    document.getElementById("exportImportSave").select();
    document.execCommand('copy');
    document.getElementById("exportImportSave").value = "";
}

function importSave() {
    window.localStorage.terrafold2 = decode(document.getElementById("exportImportSave").value);

    load();
}

window.localStorage.terrafold2 = decode("eyJnYW1lIjrEgHRvdGFsTGFuZMSGMTDElCwiY2FzaMSSNzAuOTYwNDA2MTg3NTY4xKvElm94eWdlbsSGMMSWc2NpxLJjxIU6xLUid29vxJHEvcSWxITEi2zEtMSWcG93ZXLFiSJoxI/EgnJzxIZbxIBudW3FkHPEsmRSYXTEvDHElsSJxYdUacSExIbEo8WmxaplUmVtYWluxbVnxZB5xIYzNTB9XcS2cGHEu8SGxIBwbMSPZXTFljrFmCJpc0Jvc8aMxL52xLl3xoUicsSKxaJpb8SzOjIuxKoxMsSoxKUyMTPEkzk1xJbGnMSLdMafblNwZWXFg8SeMjgwMsSjNTU0xqc2xKnEqcSWY29sb8WPOjHGq8SWbGlnaHTFrDd9xJZ4xawzLjczOcehxKA3xqcwNTM2NsSWxbo6Nsajxrw0N8ePxKQ5MzQ5xaUibcW1ZcaVxYXHvMWpY2vHviLHjMS8xL5ixIrIhGbGg8SJcnnIgciDxZ3HimFyyJHIhHPIlMeNxL7EssWOZ8esxL7HiWlsZ3VuyJfFkMiiyKTIpkPFknLEscipb8ijyKVuyK3IlcSxTWHHm8eOxJTEvmnGusWKxYzFjsSSxYXIukF0bW/EksSVIsWiyYnJi8S+xbN4SGXEjHTEm8i8yYxoyZVsyZfJkMS+ZGlyx5bGosi9x79uZciXyLnIuzE3xKwiyIxjyI7IkGnIgnPJq8SGODk0NMmFeE3HvMaMMsS2yJrJqsi6yZ/HiMiyyKvIp8m1yIPJuDrJvMekxLZoxYxUxYHJnWlwxIbIjGzFnseZxIDGkMaSxpTFkMaXZcaZxIfGm8adxrPGoMSGxqM2NMamx7XGqsSdMcexN8SgxrDKqsa0xrbGuMa6LsanOca/x7bEp8Skx6k4xqvJvcSXx4rHjMW7xKbHkceTx5XEhsW9x5kiyLvHqS7JusegMzfKt8mtxqvHgseryq01OceexbzGqjIwMzDEq8egyafHvcWQx7vJqMioxYTIhXLIh8SWyInGi8WQybHJs8uzxL7ImcaIyJbKjciYyJrFkMidyK/IoMqJyLPIpsu+zIrKi8i2yK/Lt8uKzIvItciuyLjKh8mZyL7Fg8e5xYvFjceNx7nJksmHyY/JmcSWyY7Jisykx7rIusmUyZbJmMSTyZrJnMmezJnElsmhyaPKrcmmx7rIgMyDyo/Jrcmvy7zHjMm0ybbKj8m6ybzJvsqAyajKgsqEzIHKhsmszLfIqsi0zYvFrMexyoMixJrKlcqXxrPKmjrKnMqeLMqgxpHGk8iEyqXKp8SAxrHGnsqsxqLKv8q2McuBOMSqx4LGpsanyrnGssq7xrfGucS0LseDxKUxx4XEq8efyrc3x4UzyonHi8eNMseoy4/HlMmkNDXLlMi7y4EuNcamM8m6y4HKsMa/ya7LoceOM8ajODTEoTLHgsSky4c4zZPLscuvy7TOpsyNy7XMksu5yIvIjcy/zqrMgMiVzrHMhcu0zIfIn8ixzJTOqs2OyKzMlsySzrzMlci3Zcy7zLfIv8qtyYHMnsmEzKl4zKLMp8yuzKXJiM+OyYzJksyryZ3Mrcy3yZvMrMqIIsy0yaTLqM+TzLnNgcyYzLw4xJbMvsiPzZA6zYPLicmSzYbOp82TzrLMgs+izYzJjM+Az6nKkc+wypR3ypbHis2YypvEjM2czZ7Kos2hxpjGms2lyqvGocSex7bLqzLJu8egx4HLgcSiN82yzabGtc21yr4yxqrEp8enxqvEpDXQjcenzoPLjMaizZPHks6Jy5LFvseaxJLJrc6QNjPOm8Smzos5x5/GvM6ZNMedx7fGvceFxKXHp8ubzp7LrsiEzqnMg8WQyIbFkM6ty7vOr8+o0YPLtM+xzrTMgcyGyajMiM65yovOu8qKyLTMkMiwy7TPgNGYz4PPo8+FxYPOgiLMncmDx47Jvs+NyZDPkMyjz4/Pi8+VzLHMrsS+z5nPls+bz53Mts+gy7LMus+jya7Ppcmw0YnNgMqOzJjPq82FyoHPh82UyoXRuM+0yKHRlsyM0ofNkcqSzZTPus+8ypjNmc2bZcqfxo/Nn8qjy7TNotCGyrrNp8ed0JvEk8SqzqDHhNCfxq7QlNCIyrzNtsS9LjHQvc6Gx6HQr8a80IzHuceJzoTEksuqzojLkTrHp86NxJLOj825y5vOgM6AzqDEk8uJx6zLqMajx7HQr8SUzobSpc6Gx6rMuM2Hy7DPociSy7TRhcu00YfLtM+n0b7MhM2K0YvLv861yJzRkc640ZrSisqMybbRk9GXzr7Tqc69z4LPhMmMz4bKkM+I0aTMoMmGz5HRqMmN07fMqM+UzLDPl8yvz5rMss+cyaLPnsy30YLPs8SczL3Rvc+p0oHPi8+uzYjShdOe1IfUgc+20ozKkM2SypPNls+9ypnPv8qd0pXNndKX0IPKpNCFyqjQh8a0zbfLq8efx6bQmcq3zobLq8ub0qfNtMq9zbfHoc6UzqDJrsSUybvGvcuJ0rXQo86S0rnOijnSvcaizpvHntCdzqHKsMmt04bLksakzobHsceux4LNrce3OdGA05PRt9Oo05bLttGGyIrRiMmyzrDTn82JzrPVn9SQyJXRkMiezInMk9GU1aLRm9Or06XMlNGc06/MmsuS07PMn9Gm07rRq8ym07jTvNSA0a/EltGx0a7Mt9G0yaXRtsmp1JXPpM+m1IrUldSMz63Sg8ai1aDPstG/0ojMjs2P1JXPuNSYz7vNl9SbzZrQgNSe0ILNoNSiyqbSnM2z0p4uMM6Ax7jHhcW9xKnJuseP05DUpcag0qnKvsm8Nsq3NM6kx7HEo86dxKLQos6Fyrgi0KbSus6R1YLEo8a7Oc6iya7Soseh05DThzU4yr/Xhcqwx7fHpsSpzpPVlM6o05TIhNOXyIjVm9Oa1ojVl9Og1JHTldef1aTOttOj1afUlNee1pLTrcyR06zPgcyR1bDEltOx05DRo9W0z4vRp8yo1bjTu8yq073Pm9W+077JoNSD0bXJkdeXzLvRutaH1Z3RitSS1orIutSO0oTRjdaFzY3Tps+31JfSj9SZ0pLUnNCB1KDWntKa1KPNpNKdxqHHncm7x4bLqM6b0JnHhjjGr8qp1qLQltSy0qvSrcW9ONikx4LGqjXOgNOQ1LzOhcuO1r7LkM6KzozQqsqQxqvEn86g0L7VksuB0I3OmcaqzbjWs8e20K/EoNi0zp7QrteV2ILVltehxK3VmdOY15vEvtOb0Y7Vodeo1aPIm8SWzrfXptiR1arTptGc16zVr9Ge07DFg9CT0aLJgte0zKHVtsmM17jRq9W60bLUgde90bPYgNaC2ZLWhNSS1obRvNiH05zNgsm7z6zYi9aMz7DShtm+2JDOutaU2JPNldaX1JrSk9ab0pbKodiaxpbYnNip0JXNt9mKxJPEpsW9zpPHj86b0aHWrtir0qrEntinNse4y6rLo8Sqx6THt82T2LfFu8eB1L/FrDbVgs6Ry6TEocaszp7YsM6Lxr3HudOHx7fLmMq1x6jGv8a+2LDYuc6m0YHXl9GE2ZbXmsu615zagdmb1o/Tndej06LVptes0ZXVrtWs0onbm9Ou2anVsc+q1bPPitmw0arZstmxyZHXutW7z5jXu9SB1oHPn9m8z6nZv9ma1onahNKC05LWjdme27Lai9Wp1JLWldiU2pDYltaa1J3alNKYxox0cnVlxJbSm9Sk2J7EktKszb7Wpday0J/arzDVk9qZ0qjQl823x7LHpdeFzoDNrdiwx6HasMuL2LjLida/yaTQn9q3y6PSrMenx7jGpsePya3SpiLHrMexx57TjceEzp7Hg8q1zqXWjNux1aLXmcu42ZjYhsu91aLYjtmdz7HVpdGS1a3bvdmU1ajTqs+C2afOvtevxo/Fg9yY17PckNCZ1rfWtceyx6DSrcm61bXRqtCZ0anPjt2j0azbrc2w0bDdqNCZ17/Mtcaizovcv9m+0LPcmNu01JI5zpTbt8+v1o7bu8+12aPbvsm73Jjaj9KRz77cg8qexoDSj8qZxoxb3ofFntiHxLTLlMm1xLzKoMaEzprWpMa9ybrLhzLaqcqvya3LuHV5YWJsxaTMt8SCxbXJi8m+z5vciMSPc2bFjsu2yr4w0J3Htdyjx4/XhdiwzqA0y5R3xaLRpMqgxJDFgcyfzbjOk96Yy5zLgc6R0K7RoW91dGTfgcuwyLpJ34DQo8W9xLZlbMeSbsW40qvess6L2YvGrMSTxbzOkdin2aB4xLvSmcS+3qbQidak0I3Oosep3azHssup2azeq27erd6v2qbLlGPHi3VkxozEgN68xaPZn8aPxbbGs8SMU8iObcWpxITHjcuqy7/goIjgoIrRpOCgjseMbcWhxaPTuHPgoIjFt8WQxbVp4KCFbOCgh+Cgk0R1ctqax63goJJybeCgouCgpNCIxbvTkN+037Zy3rDFkNyoxbbfmsi2bt6UxqPEoMei4KC84KC914zUv+CgtWfgoIfLtt+azLHQqda+xI/Fg8SAxojEkM+bYsSZZcSO4KGN1IFvcMazx7t6xrngoZLMm8y34KCA4KCRyoTIo8WQ4KCv3q7goLHapsqJbnbFjsWjZOChm96PxabLts6n37/eveCgguChpN+1y7vFjt+1RN+XxIvgobdy37VX4KGzVcWexZ3Fs9+YVOChsMiY4KKFbOCih8a4c+ChusmdYeCihMSM4KKL4KKI4KKA4KCB4KKCzJLciOCijeChouCiiOCij+ChvMu04KKax73gopbFjuCimOChosadbFDgoYzbkMS+xK7EsMSyR8W00Ingoa/erOChpOCgssS9y5TIjOCgqN++xL/gobPRiOCiusu7xYHJgMmw4KOBQ8u23r3go4JlZmbJtcS54KC4x6zHueCho9+3xrrLlMWLcHXGiOCgrMqoxrfgoZXeo+CjgMWCRd694KKy2a1wR8acd+ChhsS2xItyxpffmsWdxLjEusWwzabgo67go43Eu+CinuCikdGaxJlo4KO2xZDFknBwyoHGjMe5ypR1xZ7GksWa4KSB1b1h4KO+4KSARsac4KCJ4KKI4KO84KSK4KO/zYdz4KSNb21PxK/EsdCJ37ngpJfgo5bgoIHGmsimx4vIguChpiLJl+Cjht+9z4pm4KGwVGjgpKjgpIjNlNyb0aXRosac36fFnt6KxIBj4KCj4KGEdM6qxrPJtk7KvdKqxKHEvuCkp8mV4KSp06XgoJjIseCgmFR5xrfEhiIi17DJt2/go6zfm9KJbcaHxorGtMaV0pbgpLrgoaVu4KS91aLgpL/Ig+Clgca50qrfleCkpuCkruClh8iEx4ngpYrgpYngpL3gpY7EvOClkeClk03gpZXgoJrTpeClmd6j0IjgpZ3Un+Cln+CkvOCkvsyD4KWmZOClqOClheClq2HgpYjSieClr+CmiuClseCljzrgpbTSl+CltuCllsix4KW64KWbxqDgpb3gpLngpLvEsuClotmd4KWkc+Cmg9Kqxa3gpargpK/gpYvJpOCmjOCljeCmjuCmkMaQ4KaS4KW44KWY4KWa4KW84KGu4KaZ4KWg4Kac3Y7gpp7gpqDFg9uwxabgpofgponKieCmi86Q4Ka94KaN4KWzxJjEmuClkuCmkeClt+CjreClueCmr+ClnOCmscSX4Kaa4KWh4KaB4KWA4KWCxYPgpYTgprrgpqTgpbDShOClruCngeClkMS34KO0xIXgpbXgp4fgpZfKieCmleCmsOCit+ClvuCnjuCmtMiE4Ka24KeSyZ/gpobgp5bgpozUp9K0xpPgp5rgpo/FhsSM4KeF4Kar4Keg4KaU4KeK4KaX4KeM4KW/4Kab4KeQ4KWl4Ker2bvgp63gpazgpqXeqMuK4KWM4KWy4Keb4KOv4KC44Kee4KeG4KaT4KeJ4KW74KeL4Kel4Kay4KaA4KWj4KaC4KiC4KCN4KiE4KaI4KWt4KeyzbfYqOCnmeCmqOCls8WAxYLgp7fgpZTgqJDgpq7gqJLgp7zgorddy5TGnNOZ2J3TmcS+4KivyIrgpI3GuMWQ4Ki0dMqP2KjgpKJv4KSk4KOC3YHTkc6n2ZnFtN6j4KOCam9i4KS4xL/HjGvFjuConeCno+Cok8i+4Kin4Kat4KWe4Ken4KiA4Kaf4KiZ4KGd4KmN4KmP4KiGxo3EnjHeh+CooeCoisaNx7rGiuCntuCpouCknuCoquChtsu04Ke44Kio4KmW4Kaz4KmY4Ka3xbvJjMWAcuCpjsWV4KmeW+CpoeCngOCoosWX4KmM4Kil4Kmp4KmR4Kir4KmT4Kas4KeI0Knfv+CpnOCpueCokeCmluCprOCqheCnueColOCpjOCpt+CpneCqjOCnpOCqj+Cpr+CnpuCpseCol+CnkeClp+ChnOCpteCqiuCpkOCnu+CqjuCnn+Cpr+Cordmg16XgpKFu4KSj4KmO4KOC4KGPdOCggeCjj8mMZOCgpN6n4Kel4KSxxoNl4KCH4KClxIDgqL3gqL/bjWLgoJ3gpbjGjnTgqaTGj8aEzKXJicimyaTRr8i90pbgq4TgpqnRtOCriN+L4KWh0KjFvuCqpuCkpuCgpNiHQsmVxZzKqOCqveCqrOCmlMaKxrbEiuCgt96UxJ7ElMuJ2aHdisif4KmzzKjEi+CpjkHgq4ngq5Tgpo/gp4XHicWG3orgq5dzxoLgo7XgqL5rxprgqq503qPEmt6JxZDgq5/gpKXgq6rgqrbgoq3gpJtMyZXgq77gord9");

load();

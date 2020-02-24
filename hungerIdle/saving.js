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
    // window.localStorage[saveName] = "";
    // window.localStorage[saveName] = decode("eyJhbGwiOsSAY2hhcsSFxIBuYW1lxIUiVm9pZGxpbmciLCJzdGF0c8SMxIF0xKBja1NwZWVkTWF4xIUyMMS0xJ1oZcSCdGjEr8SxOjg4LjbEtsS4bMS6UmVnZW7EhTDEncSfcsWKZ8S6xIU3LjLFgiJjb27En2l0dXRpxZvEhTMuMznEnWFnacSYdHnFjMSdZGV4dGVyxZ7FrzrFjSLEq3JjZXDFocWjxbrEncWQZmzFs8WwIsaGxohjdMaKxIlyxbLFi8aExJ5jYXbFkcSRxbouMDLEtnVuxo/GlcSfxI/EmWHEvMaKcMSVc8aDxbvFkMWaxpnEi8acxp59xJ1iYXPGm8SAxLfEucS7xLDEhTXFpTk1xY50xZDEmsWTOjbFljfEncWaxZzFocWfxoLGlMWlxafFjsaXxpnEmsabMMadxp/Gi2XGscW2xYzHnsa2xKXEp8SpxKvErUN1xrPFu8aracatxpTFu8a9xYVox6zGszXFlTgwOTIzMTA2NjgzNMiAx4XEnsSgbcanx7jFjMemxYplbcW5xI3Ej8abIk1vc8Sjx4bEocSjxIYiaMahdMapOsSzxLXFmcWbc3XEkMilyKfHtMWExLrIpTHHn8Shx6jEqsSsxK7HgMeLxLTIqMe1xYbFiMWKxorFj8WRx4rFu8eQxZ3Hk8Wix7PFqcWrxa3FucW7xbLFtMW2xbjGqsW2xb/GgcmLxorGjMaJxpXJnMaOxpDEisaTyYPHmcaaxpDIo8mDyIvGp8ilx6/GrMauxoXHoW/GssiPybB3yaLEpMi/xr/EvTXHpsiixqLIjsimyL3Hj8iqyKxlyoAxNDXFu8exSMijxK3EhWbEgsa6xJ3HsUPKhMSQZMqQypJlyoPEhMmeb3fGisi2YcSoyLjHq8etxIU0yoLFvMmuyYzIocixx7fKqMakyarEjsqAMMembG9nyJ9bxIDEkMibxarIlzxkaXYgxJ95xog9J2bFm3Qtd2VpZ2h0OmJvbGQ7xZrKuXLLl2zKpGs7Jz4xLjkzPC/LhHY+IMm5IMq5xJ8gZnJvbSDLg8uFy4fFrsuKy4zLjsuQy5LLlMuWy5jLmsucy5lvy59iy6HEqMukPsmfdMury60+Icu6y63LvcuJZcuLy43GosyCy5PLlcuXy5nLm8udzIo6I8aXxZcxNcyPM8edMzjMk8uFy6/FkG1hxJnEmWfLsMqwIcScIsWhxJDGs8WXyqtjxZDEocetyJfEiMSKIsa2yr5ly4DFicSSy7vLhsuIy7/MncuPy5HMoMyFzKPMiMuey6DLosyPx4zFl8yyy64gZMSPy4HNpsixIHfFnmjMl8u8zZXMm8yAzJ7NmcyEzKLMh8ylzIvMjcujy6VwaHlzacaXbM2kzJXNsM2Uy77Ns82XzJ/Nt8yGzKTMicufzKhhzKrMrMulyIHFgTLOhiDMtcy3bsy5zLvGvsy9xJ3NgMejyKbHvMiozYXEuMWfxZDEks2KxIvNjSLKv3PLgc2SzJjNssyczIHNtsyhzo/NncymzIzNoM6Xy6jLqsuszLPOoce2y7LImnTLtcu3y7nNk8yZzZbOusyDzrzNnM26zZ/MjsulzJHOhsyWz4/OuM20zZjPk82bzbnOkcynzKk2zKvMjzLFgMqJzpvOncy4xJrPh8S6zqPMv2nNgcSyzqjJh82GzqzNicaRzYwszY7NkMuCzrfOis65zbXPoc24zpDNns+Az5g+zaI2zpvNp8y2xYnNqsS5zazNrs6Iz5DOi8+SzZrQiM6+zbvPgT7Nv86BzoPEgs+b0JjPns6MzrvPotCJzKbOk86VzI81xabQj8+FzaXPrs6fz7DJuc+zzqXGs8yuzYTPus2Izq7Pvc6xzrPOtToiz53QhM+fzo3PlM+j0IrNvMyPy6fLqc6by7HLs8+Ly7bLuNCn0YnQqdCHzr3PltCLzb3MkGXGh8ehzJLQtM6H0YjMmtCFz6DQnNGdz6TQrs+nzpY+xZcuNTHPrciSzp7OoNC5zL7Qu8WkyL3Puc6r0YDRhs6vz77QgM60zZHRhtGoz5HQhtGsz5XPpNGfzaHFltCzzJTNps2o0JPFstCVza3EutGZ0anRitCq0J3RntGPzb7OgM6CzoTQptKK0JrSjM6O0o7NntGvz6jLpced0bbRps6c0bjPr8y60bvOpM+1zqYzyK/Hj9C/zq3Sg9GCz7/Oss2P0ofQgs2x0ZrQm9Kr0Y3Ov9Kiy6bPg9GTyrDPicu00ZfPjtCD0p3Rm9KN04zQn9CMz5rRps+c05fSi9Gr04vQrM6Sz6bSr9GyNNG0zLHSs9C20brMvNG80rrQvNK9xZnSv8+8zYvRg9OF0YXRh9Oh0qnTo9GM06XPl9Gg0I7QkNKWZdCUxYXQltKb0qjRqtGL0KvQntSCzI/QotKl0KXTn9Kc06LUjtKg0a7Tp9GxMNG3zLbSts+xaNC607LFpMqqzqnTttGB07jTg9GE0ojTvNOI05jTitSA1JDSkM+C0ZLSs9GUz4rPjNGY1IzSntGc0qzTjdCg057MlNOg1LDUmNKf0a3SrdScz6kyxYE01J/RudC407DSuc+2OsiG0L7SgdOAxZnTgtKG07tFbsiSeSBrxazGiGTUpNWV1ZfEtNO50IHOttWG077UmdWJ1YHQjNKy0pQgZ86exK3LtcyK1JfVsNWI1YDTnNGgU8eHyYVozobMvs6qzYfVmtKE1ZTSuznIvdWs04bEktaDxIrFoc+wxLrUh2bNmtWozqbIr9aR07vUvdOZ06TUtNOOxZXNo9Kz0JHNqdKY1InSms2v1qHUstSP0qHQoNST0KTOhdSW1q/SqtSzz5bSrtGx06o31Y/TrdK10LfSt9WTz7TVldSn0oDWitO3zrDUrNO61K7WuNO/1rHSj9al0pLUhdCS1IfWq8+L1q3VvdSN1b/Tm9SR0qPQo9Km1rfTvded1L/Xn9a8zI/UnteB1KDXg9Si1pzGszbVmNeK1KrXjNWd1K7Vn9Wh1aPVpcSt17DEhdey1avXjdWt0onXpdS+05rUgdS1PjXOm9W31blk1bty15zYhtaj1rLQjEjTksS81ofSvtWZ14vTsdWVz7jWn9Su1pRy1pbMutaYy7XWm9ie1p3WkNiC1pLYhNWv16bYh9ak0KDWptKTz4bWqdKXzavXm9eQ1bHWgNeg0KHSpNa10qfYhdai1rrUm86U0bDMj9a+14DSlNOu1ZLOotiqxrPXiNib17TTgdSr17fTh86J1LHWudeS0Y7YtNeV1qjUhtSI15rQl9i8157YiNOO1rTXo9WE2JLZhdmd0K3Vi9Kw1ZDUodK414bOptiA14nPu9e10oXThNiDIte5yJPXu8SD173Zkde/2KzZmNWu2ZrVh9en2ajQoNiL0rPYjcSZ1brLjdiR2abajNiz2JbYmMSw2JrTtdic2bvWjcaz2KDYrdO72KPYpSDYp9aazITXvsqB2IHaiNiv2orVvtqX2JXRoNi115bWqti62aXZhNaw1JrZntCM2arUldms2pbYsta72bE+2YvZs9eu2bXRvTrZk9qd2ZXVm9mX2b3YrtSv2rDYsdiU15PZn9an0pTYuNeY2rjUi9q62ZzavNWz0aDav9a224HboNeR26LTptmI06jXq9mN14LTr9mQ2qDahtSo2p7Zlte225LVntWg2oHVpNqD1afahci82q3budeP26jYvdef2Inaj9W21bjaktiP2pTZrdq71bLWgcyP2JfGviDYmdGm1ojUqdu33IDaotquItqlzqDaqNip27ParMq32qPchNiw2JPZhtq92rTZoNub2aLXmdSK1q7chdmn2pjbpNmB2avMs9WF25Xcqtmv26vQr8ul24fXrNWR14Tbstm22ZLXs9m63JvYodmZ0Jnbltyr26PMj9q12aHXl9mj3LLcj9uh3JHYv9ul2YPcqdmu26rPpdus1J3biNuxx7baq9m42ZTdituQ27jUrciX2oDVotu91abdp9qH3IPdjdCo3JDYvtyI2Izci9Wg3I3VvNuC25fcrNyT2pp42pzWid2q1ozdh8SF3J3dtdaTxKDYpNyhxLfYqNqq3IDWntyn3bbTid2Z3bnXlNua2LfcsNue3LPdnt243IfZqdy424Dcut2Y26ndmtep3YEu1r/dpNmP3abcgNuN3ofSgt2r2bzdrdqJ3Y7cvd2g2Indk9yv3ZXcsdi73LTastuY2r7eptum3qjegN2Q3L/Zidmy3YPZtNeF24vdqNuO3ojVnN6N0Ybdr9qC3bLcgNm43Yzeut233prepNqO3bvYjtiQ3qnchtqN2pncldyXzJTcmdu23rfcpN6M3rnRhtyg1pfektqpy5Xaq96W3J7fi9y+2L/ev96e34HeoN+o3LXas9SS34jdndy83Z/eq9uF3YLbr9et3aXPst6z3YnettKE35/ar9674KCM3pvbmdi2zaXbnN2W34Peot+i36rct9ei3qfLrty74KCa3qPUgd6sPtuuz4bZjt2F3rLcpN+U3rXWi9+X37TZv9u73bDXvNu/4KC13bTgoLrfvt69047cic+G2pHdvd+n4KGD3ZrYidyUz4jfrcyz36/bj96J24vfs9eOyJffttim37jco96K3KXgoJjblOCgq+CgpNy23ZLcruCggtq30pnaueCgo96q4KCc34fgoKffieCgqeCghd+F1YrdotmK3q7ZjOCgsduw3rHgoJPcpN603Jret+Chn+Chi+ChrNyt3p3goJ/en+ChqNuf4KGq36ngoaPXodSU4KGv0affhNuD2YfdgOCgr96w4KCz4KG74KGd4KC24KG+4KCX3pfEkt+a3bHahOChgNyC4KGC4KKQ3oHdkcul4KGGzaXgoYjak92/4KKk34zYv+ChjtKb4KGQy67goZLfls2L37LgoYHgoZfejtaV3pHWmeChnNuL37zfmOChoN+h4KGr36PQjOCggeCiheCgg+Cih96h4KCL4KCs4KKL2YDgoa7goIrgoaHgo4TgoK3goI7gobbgopXXr+CglNu14KGT4KC54KK54KCZ4KOD4KKK4KCHy6Xgo4fLr+CgoN+C4KGp4KOM4KGi4KOh4KOP4KKN4KOR4KOf4KCG4KKS347gopTfkNuJ35LUpdyB2bngoJbgo5zZvuCinuCgvt2z1atdx6bfuXRMx7HGo8q9InF1YcaiyZXRhjHMvsSOxJDEkkZydcWe1ojLmcmbyqDEssSdy411zITEhTHcpMyr357Tg+CkieCki8eSxbkiyIHgpJDIlsSSyJnIm+CkmMqexq/gpJvGleCknuCkoDrHjuChnTI54KSlxIDgpKfgpIzFrsSS4KSPxJ3gpJHIl+CklOCklsaPyp3gpJrKocim4KSdb+Ckn8uVxorbizPQvdym4KS/4KSK4KWB4KSq4KWEIuClhuCkk+CkleCkl+Cli8qf4KWNx5/gpLfgpZLGleCiv9aP3ILgpYDgpKngpYPgpK3gpJLRhuCliOClocip4KSzxoXgpLXgpaXgpZDgpLjFu+CivzfdtOClrOCkjeCkq+Clr+Clh+CloOCliuCltOCljOCknCLgpabGo+Clu+CjtuCll+CkiOClmeClreCkjuCmguCln+ClieCksuCmh+CljuCmieClueClp+CmjNWV4KaO4KW/4KWC4KaS4KWF4KSu4KWx4KaE4KaW4KWj4KaI4KaK4KWT4KaNfV3EnciRyJNTZcaNx5RExKFhxIVb4KSH4KWe0YbgpLDInMaL4KSLa8aKxqHKucSoyo86x4d1ypzIqcWcyoXKmeCkuc6x4Ka7IkbKucuRxIvGheCngOCngm7gp4Rr4KeG4KeI4KeKyYjgp43JtMiV4KWw4KeS4Kal4KeXbuCngcaV4KeDb+CnheCnjuCnnsqD4KeMypjgpKHgpqws4Ka64KajIlRvYcqZ4Ken4Kepxbvgp6vgp63EheCnr+Cni8ir4Keyxbrgpqzgpq3Mv2/EoGxU0rrKqdaPNjR9");
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
let fightList;
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
    fightList = [];
    enemySelectionData = [];
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
        all.char.manaCur = toLoad.all.char.manaCur;
        all.char.staminaCur = toLoad.all.char.staminaCur;
        if(toLoad.fightList) {
            fightList = toLoad.fightList;
            for(let i = 0; i < fightList.length; i++) { //clear out fought
                fightList[i].fought = 0;
            }
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
    }
    totalTime = toLoad.totalTime === undefined ? 0 : toLoad.totalTime;

    view.initialize();
    view.create.fightList();
    selectFight(0, 0);

    all.enemy = createEnemy(0, 0);
    recalcInterval(60);
    toLoad = {};
}

function save() {
    saveTimer = 10000;
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
    // console.log(encoded);
    document.getElementById("exportImportSave").value = encoded;
    document.getElementById("exportImportSave").select();
    document.execCommand('copy');
    document.getElementById("exportImportSave").value = "";
}

function importSave() {
    window.localStorage[saveName] = decode(document.getElementById("exportImportSave").value);

    load();
}
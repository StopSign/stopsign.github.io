/**
 * Created by Jim on 4/23/2017.
 */
function Graphics() {
    this.createProgressBarUI = function(curRowCount) {
        var pbar = "pbars[" + curRowCount + "]";
        var progressPrc = "{{ isProgressStopped ? 100 : " + //force to 100
            "(toggledBarsLeft ? " +
            pbar+".progress/"+pbar+".progressReq * 100  :" + //go left
            "100 - ("+pbar+".progress/"+pbar+".progressReq * 100))" //go right
            + "}}";

        return "<div class='progressOuter' ng-class="+'"'+"{ 'leveling' : "+pbar+".isLeveling }"+'"'+">" +
                "<div id='progressInner" + curRowCount + "' class='progressInner'" +
                    " style='width:" + progressPrc + "%;background-color:{{"+pbar+".color}};'>" +
                "</div>" +
                "<div class='exp hyperVisible'>" +
                    "<div class='level'>Level {{"+pbar+".level}}</div>" +
                    "{{intToStringRound("+pbar+".exp)+' / '+intToStringRound("+pbar+".expToNextLevel)}} exp" +
                "</div>" +
                "<div class='hyperVisible resources'>{{intToStringRound("+pbar+".resources)}}</div>" +
                "<div class='hyperVisible resGain' style='opacity:{{"+pbar+".resGainOpacity}}'>+{{intToStringRound("+pbar+".tempResGain)}}</div>" +
                "<div class='pbarNum'>#{{"+pbar+".row+1}}</div>" +
                "<div class='speedMult'>Speed: {{intToStringRound("+pbar+".speedMult)}}%</div>" +
                "<div class='gainAmount'>Gain: {{"+pbar+".resGain}}</div>" +
                "<div class='pbuyButton buySpeed' ng-click='"+pbar+".buySpeed()' " +
                    "ng-class="+'"'+"{ 'pbuyButtonReady' : "+pbar+".speedBuyable }"+'"'+">" +
                    "*110% Speed: {{intToStringRound("+pbar+".calcSpeedCost())}}" +
                "</div>" +
            "</div>";
    };

    this.createButton = function(buttonText, topNumVarName,topNumColor,
                                 onClickFunctionName, costVarName, botNumColor) {
        return "<div class='buttonContainer'>"+
                "<div class='resource hyperVisible' style='color:"+topNumColor+"'>{{"+topNumVarName+"}}</div>"+
                "<button class='buyButton' data-ng-click='"+onClickFunctionName+"()'>"+buttonText+"</button>"+
                "<div class='middleLabel'>It costs <div class='countCost hyperVisible' style='color:"+botNumColor+"'>{{"+costVarName+"}}</div></div>"+
            "</div>";
    };

}
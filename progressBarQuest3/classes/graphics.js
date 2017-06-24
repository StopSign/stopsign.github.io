/**
 * Created by Jim on 4/23/2017.
 */
function Graphics() {
    this.pbarNext = function(pbar, num) {
        var pbarNext = "{{"+pbar+".row+"+num+"}}";
    }
    this.createProgressBarUI = function(curRowCount) {
        var pbar = "pbars[" + curRowCount + "]";
        var progressPrc = "{{ isProgressStopped ? 100 : " + //force to 100
            "(toggledBarsLeft ? " +
            pbar+".progress/"+pbar+".progressReq * 100  :" + //go left
            "100 - ("+pbar+".progress/"+pbar+".progressReq * 100))" //go right
            + "}}";
        var isFirst = "pbars[pbars.length-1].row === "+pbar+".row";

        return "<div class='progressOuter' ng-class=\" { 'leveling' : "+pbar+".isLeveling  } \">" +
                "<div class='pbarNum'>#{{"+pbar+".row+1}}</div>" +
                "<div id='progressInner" + curRowCount + "' class='progressInner'" +
                    " style='width:" + progressPrc + "%;background-color:{{"+pbar+".color}};'>" +
                "</div>" +
                "<div class='exp hyperVisible'>" +
                    "<div class='level'>Level {{"+pbar+".level}}</div>" +
                    "{{intToStringRound("+pbar+".exp)+' / '+intToStringRound("+pbar+".expToNextLevel)}} exp" +
                "</div>" +
                "<div class='hyperVisible resGain' style='opacity:{{"+pbar+".resGainOpacity}}'>{{intToStringNegative("+pbar+".tempResGain, 2)}}</div>" +
                "<div class='hyperVisible resources' ng-class='{ \"hovered\" : "+pbar+".isHovered }' >" +
                    "{{intToString("+pbar+".resources, 2)}}" +
                "</div>" +
                "<div class='coin silver' ng-class='{\"gold\" : "+isFirst+"}'><p>{{"+pbar+".row+1}}</p></div>" +
                "<div class='gainAmount'>+{{intToStringRound("+pbar+".totalResGain)}}</div>" +
                "<img class='speedIcon' src='icons/speed.png' height='100%' width='100%'/>"+
                "<div class='speedMult'>{{intToStringRound("+pbar+".speedMult)}}%</div>" +
                "<div class='pbuyButton buySpeed' ng-click='"+pbar+".buySpeed()' " +
                    "ng-mouseover=\""+pbar+".mouseOverUpgrade(0)\" " +
                    "ng-mouseleave=\""+pbar+".mouseLeaveUpgrade(0)\" " +
                    "ng-class="+'"'+"{ 'pbuyButtonReady' : "+pbar+".speedBuyable , " +
                    "'selectedButton' : "+pbar+".isSelected[0] }"+'"'+
                    ">" +
                    "x1.3 Speed: {{intToStringRound("+pbar+".calcSpeedCost())}}" +
                "</div>" +
                "<div class='pbuyButton buyGain' ng-click='"+pbar+".buyGain()' " +
                    "ng-mouseover=\""+pbar+".mouseOverUpgrade(0)\" " +
                    "ng-mouseleave=\""+pbar+".mouseLeaveUpgrade(0)\" " +
                    "ng-class="+'"'+"{ 'pbuyButtonReady' : "+pbar+".gainBuyable , " +
                    "'selectedButton' : "+pbar+".isSelected[1] }"+'"'+
                    ">" +
                    "+1 | {{intToStringRound("+pbar+".calcGainCost())}}" +
                "</div>" +
                "<div class='pbuyButton mult1' ng-click='"+pbar+".buyGainMult(1)' " +
                    "ng-mouseover=\""+pbar+".mouseOverUpgrade(1)\" " +
                    "ng-mouseleave=\""+pbar+".mouseLeaveUpgrade(1)\" " +
                    "ng-class="+'"'+"{ 'pbuyButtonReady' : "+pbar+".gainMultFrom1Buyable , " +
                    "'selectedButton' : "+pbar+".isSelected[2] }"+'"'+
                    ">" +
                    "x2 | {{intToStringRound("+pbar+".calcGainMultCost(1))}} from #{{"+pbar+".row+2}}" +
                "</div>" +
                "<div class='pbuyButton mult2' ng-click='"+pbar+".buyGainMult(4)' " +
                    "ng-mouseover=\""+pbar+".mouseOverUpgrade(4)\" " +
                    "ng-mouseleave=\""+pbar+".mouseLeaveUpgrade(4)\" " +
                    "ng-class="+'"'+"{ 'pbuyButtonReady' : "+pbar+".gainMultFrom4Buyable , " +
                    "'selectedButton' : "+pbar+".isSelected[3] }"+'"'+
                    ">" +
                    "x3 | {{intToStringRound("+pbar+".calcGainMultCost(4))}} from #{{"+pbar+".row+5}}" +
                "</div>" +
                "<div class='pbuyButton mult3' ng-click='"+pbar+".buyGainMult(7)' " +
                    "ng-mouseover=\""+pbar+".mouseOverUpgrade(7)\" " +
                    "ng-mouseleave=\""+pbar+".mouseLeaveUpgrade(7)\" " +
                    "ng-class="+'"'+"{ 'pbuyButtonReady' : "+pbar+".gainMultFrom7Buyable , " +
                    "'selectedButton' : "+pbar+".isSelected[4] }"+'"'+
                    ">" +
                    "x4 | {{intToStringRound("+pbar+".calcGainMultCost(7))}} from #{{"+pbar+".row+8}}" +
            "</div>" +
            "</div>";
    };

    this.createButton = function(buttonText, topNumVarName,topNumColor,
                                 onClickFunctionName, costVarName, botNumColor) {
        return "<div class='buttonContainer'>"+
                "<div class='resource' style='color:"+topNumColor+"'>{{intToStringRound("+topNumVarName+")}}</div>"+
                "<button class='buyButton' ng-click='"+onClickFunctionName+"()' ng-mouseover='buttonMouseOver()' ng-mouseleave='buttonMouseLeave()'>"+buttonText+"</button>"+
                "<div class='middleLabel'>" +
                    "It costs: <div class='hyperVisible countCost' style='color:"+botNumColor+"'>{{intToStringRound("+costVarName+")}}</div>" +
                    "<div class='coin gold'><p>1</p></div>" +
                "</div>"+
            "</div>";
    };

}
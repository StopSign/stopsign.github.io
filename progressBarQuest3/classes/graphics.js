/**
 * Created by Jim on 4/23/2017.
 */
function Graphics() {
    this.createProgressBarUI = function(curRowCount) {
        var progressPrc = "{{ !hasProgressMovement ? 75 : " + //force to 100
            "(toggledBarsLeft ? " +
            "pbars[" + (curRowCount) + "].progress/pbars[" + curRowCount + "].progressReq * 100  :" + //go left
            "100 - (pbars[" + curRowCount + "].progress/pbars[" + curRowCount + "].progressReq * 100))" //go right
            + "}}";

        return "<div class='progressOuter' ng-class=" + '"' + "{ 'leveling' : pbars[" + curRowCount + "].isLeveling }" + '"' + ">" +
                "<div id='progressInner" + curRowCount + "' class='progressInner'" +
                    " style='width:" + progressPrc + "%;background-color:{{pbars[" + curRowCount + "].color}};'>" +
                "</div>" +
                "<div class='exp hyperVisible'>" +
                    "<div class='level'>Level {{pbars[" + curRowCount + "].level}}</div>" +
                    "{{pbars[" + curRowCount + "].exp+' / '+pbars[" + curRowCount + "].expToNextLevel}} exp" +
                "</div>" +
                "<div class='hyperVisible speedMult'>{{pbars[" + curRowCount + "].speedMult}}%</div>" +
                "<div class='hyperVisible speedGain' style='opacity:{{pbars[" + curRowCount + "].speedGainOpacity}}'>+{{pbars[" + curRowCount + "].speedGain}}</div>" +
                "<div class='hyperVisible resources'>" +
                    "Resource {{pbars[" + curRowCount + "].row+1}} = {{pbars[" + curRowCount + "].resources}}" +
                    ", Gain = {{pbars[" + curRowCount + "].resGain}}" +
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
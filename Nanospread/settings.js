function openSettingsBox() {
    document.getElementById('settingsBox').style.display = "block";
    document.getElementById('infoBox').style.display = "none";
}
function closeSettingsBox() {
    document.getElementById('settingsBox').style.display = "none";
    document.getElementById('infoBox').style.display = "block";
}
function openHelpBox() {
    document.getElementById('helpBox').style.display = "block";
    document.getElementById('infoBox').style.display = "none";
}
function closeHelpBox() {
    document.getElementById('helpBox').style.display = "none";
    document.getElementById('infoBox').style.display = "block";
}
function selectOneOrMultipleSetting(num) {
    settings.selectOneOrMultiple = num;
}
function selectBuyLowestOrAll(num) {
    settings.buyLowestOrAll = num;
}
function selectLastOrLowest(num) {
    settings.showLastOrLowest = num;
}
function selectAllOrLowestBorderColor(num) {
    settings.selectAllOrLowestBorderColor = num;
}
function selectShowNoneOrNanitesOrAmount(num) {
    settings.selectShowNoneOrNanitesOrAmount = num;
}

function buyAmountOption(num) {
    var highlighted = document.getElementById('buy'+settings.buyPerClick);
    if(highlighted) {
        highlighted.style.backgroundColor = "grey";
    }
    settings.buyPerClick = num;
    document.getElementById('buy'+num).style.backgroundColor = "#ff4400";


    theView.updateInfoBox();

}
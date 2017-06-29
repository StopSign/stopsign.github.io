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


let buttonHTML = "";
function createButton(buttonData) {

    buttonHTML += "<div class='button abs' style='top:"+buttonData.y+"px;left:"+buttonData.x+"px'>" +
            buttonData.text +
        "</div>";
}

createButton({
    x:50,
    y:50,
    "text":"<img src='img/robot.svg' class='smallIcon'> to Dig",

});
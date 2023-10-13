
function attachPanel(targetId, id, fromLeft, fromTop, width, height, color) {
    const div = document.createElement('div');

    div.style.position = "absolute";
    div.style.left = fromLeft + "px";
    div.style.top = fromTop + "px";
    div.style.width = width + "px";
    div.style.height = height + "px";
    div.style.backgroundColor = color;
    div.id = targetId + "-" + id;

    document.getElementById(targetId).appendChild(div);
}


function attachCheckbox(targetId, variableName, fromLeft, fromTop, text, fontSize, updateFunction, border="none") {
    const div = document.createElement('div');
    const checkbox = document.createElement('input');
    const label = document.createElement('label');
    document.getElementById(targetId).style.transformStyle = "preserve-3d";

    // Configure div
    div.style.position = "absolute";
    div.style.left = fromLeft + "px";
    div.style.top = fromTop + "px";
    div.style.border = border;
    div.style.fontSize = fontSize;
    div.id = targetId + "-" + variableName;

    // Configure checkbox
    checkbox.type = 'checkbox';
    checkbox.checked = data[variableName];
    checkbox.id = variableName;
    checkbox.addEventListener('click', () => {
        // Toggle the corresponding global data variable
        data[variableName] = !data[variableName];
        updateFunction();
    });

    // Configure label
    label.htmlFor = variableName;
    label.innerText = text;

    // Append all elements
    div.appendChild(checkbox);
    div.appendChild(label);
    document.getElementById(targetId).appendChild(div);
}

function attachButton(targetId, variableName, fromLeft, fromTop, text, fontSize, clickFunction, border="none") {
    const div = document.createElement('div');
    const button = document.createElement('button');
    document.getElementById(targetId).style.transformStyle = "preserve-3d";

    // Configure div
    div.style.position = "absolute";
    div.style.left = fromLeft + "px";
    div.style.top = fromTop + "px";
    div.style.border = border;
    div.style.fontSize = fontSize;
    div.style.transformStyle = "preserve-3d"
    div.id = targetId + "-" + variableName;

    // Configure button
    button.innerText = text;
    button.id = variableName;
    button.style.fontSize = fontSize;
    button.classList.add("button");
    button.addEventListener('click', () => {
        // Execute the update function
        clickFunction();
    });

    // Append all elements
    div.appendChild(button);
    document.getElementById(targetId).appendChild(div);
}
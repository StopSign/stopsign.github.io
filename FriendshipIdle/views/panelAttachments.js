
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


function attachCheckbox(targetId, id, fromLeft, fromTop, text, variableName, border="none") {
    const div = document.createElement('div');
    const checkbox = document.createElement('input');
    const label = document.createElement('label');

    // Configure div
    div.style.position = "absolute";
    div.style.left = fromLeft + "px";
    div.style.top = fromTop + "px";
    div.style.border = border;
    div.id = targetId + "-" + id;

    // Configure checkbox
    checkbox.type = 'checkbox';
    checkbox.checked = data[variableName];
    checkbox.id = id;
    checkbox.addEventListener('click', () => {
        // Toggle the corresponding global data variable
        data[variableName] = !data[variableName];
    });

    // Configure label
    label.htmlFor = id;
    label.innerText = text;

    // Append all elements
    div.appendChild(checkbox);
    div.appendChild(label);
    document.getElementById(targetId).appendChild(div);
}
//logs and charts


function drawChart() {
    if(selectedMenu !== "statistics") {
        return;
    }

    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;
    const padding = 50;

    // Clear the canvas and fill with dark background
    ctx.fillStyle = '#2d3748';
    ctx.globalAlpha = 1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (data.chartData.length < 2) {
        ctx.fillStyle = '#a0aec0'; // Light gray text for placeholder
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Waiting for more data...', canvasWidth / 2, canvasHeight / 2);
        return;
    }

    // --- Determine Data Range ---
    const minTime = data.chartData[0].time;
    const maxTime = data.chartData[data.chartData.length - 1].time;

    // --- Draw Axes ---
    ctx.strokeStyle = '#4a5568'; // Subtle gray for axes
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvasHeight - padding);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(padding, canvasHeight - padding);
    ctx.lineTo(canvasWidth - padding, canvasHeight - padding);
    ctx.stroke();

    ctx.fillStyle = '#a0aec0'; // Light gray for labels
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    // --- Draw Data Line ---
    ctx.strokeStyle = '#63b3ed'; // Vibrant, contrasting blue for the line
    ctx.lineWidth = 3; // Thicker line
    ctx.lineJoin = 'round'; // Smoother corners
    ctx.beginPath();

    let lastLabelX = -1000;
    let lastHATL = 0;
    if (graphType === "momentum") {
        const values = data.chartData.map(d => d.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        for (let i = 0; i < data.chartData.length; i++) {
            const dataPoint = data.chartData[i];
            const HATL = dataPoint.HATL ? dataPoint.HATL : 0;
            const x = padding + ((dataPoint.time - minTime) / (maxTime - minTime)) * (canvasWidth - 2 * padding);
            if ((x - lastLabelX) >= ((canvasWidth - 2 * padding) / 8)) {
                lastLabelX = x;
                ctx.fillStyle = '#a0aec0'; // Light gray for labels
                ctx.font = '12px sans-serif';
                ctx.fillText(secondsToTime(dataPoint.time), x, canvasHeight - padding + 20);
            }
            const logMinValue = Math.log1p(minValue);
            const logMaxValue = Math.log1p(maxValue);
            const logValue = Math.log1p(dataPoint.value) - logMinValue;
            let y = (canvasHeight - padding) - ((logValue / (logMaxValue - logMinValue)) * (canvasHeight - 2 * padding));
            if (isNaN(y)) y = canvasHeight - padding;
            if (HATL > 0 && HATL > lastHATL) {
                lastHATL = HATL;
                ctx.fillStyle = 'red'; // Light gray for labels
                ctx.font = '14px sans-serif bold';
                ctx.fillText(HATL, x, y - 4);
                if (y < (canvasHeight - padding - 10)) {
                    ctx.fillStyle = '#a0aec0'; // Light gray for labels
                    ctx.font = '12px sans-serif';
                    ctx.fillText(secondsToTime(dataPoint.time), x, y + 18);
                }
            }
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // --- Draw Labels and Grid ---
        ctx.fillStyle = '#a0aec0'; // Light gray for labels
        ctx.font = '12px sans-serif';
        const numYLabels = 5;
        for (let i = 0; i <= numYLabels; i++) {
            const yPos = padding + (i / numYLabels) * (canvasHeight - 2 * padding);
            const labelValue = Math.expm1((Math.log1p(maxValue) - Math.log1p(minValue)) * (1 - (i / numYLabels)) + Math.log1p(minValue));
            ctx.globalAlpha = 1;
            ctx.fillText(intToString(labelValue, 1), padding - 20, yPos + 4);

            // Horizontal grid line
            ctx.strokeStyle = '#4a5568'; // Subtle gray for grid
            ctx.globalAlpha = 0.25;
            ctx.beginPath();
            ctx.moveTo(padding, yPos);
            ctx.lineTo(canvasWidth - padding, yPos);
            ctx.stroke();
        }
    } else {
        // Magic Quality graph
        const values = data.chartData.map(d => d.MQ);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        for (let i = 0; i < data.chartData.length; i++) {
            const dataPoint = data.chartData[i];
            const HATL = dataPoint.HATL ? dataPoint.HATL : 0;
            const x = padding + ((dataPoint.time - minTime) / (maxTime - minTime)) * (canvasWidth - 2 * padding);
            if ((x - lastLabelX) >= ((canvasWidth - 2 * padding) / 8)) {
                lastLabelX = x;
                ctx.fillStyle = '#a0aec0'; // Light gray for labels
                ctx.font = '12px sans-serif';
                ctx.fillText(secondsToTime(dataPoint.time), x, canvasHeight - padding + 20);
            }
            let y = (canvasHeight - padding) - ((dataPoint.MQ / maxValue) * (canvasHeight - 2 * padding));
            if (isNaN(y)) y = canvasHeight - padding;
            if (HATL > 0 && HATL > lastHATL) {
                lastHATL = HATL;
                ctx.fillStyle = 'red'; // Light gray for labels
                ctx.font = '14px sans-serif bold';
                ctx.fillText(HATL, x, y - 4);
                if (y < (canvasHeight - padding - 10)) {
                    ctx.fillStyle = '#a0aec0'; // Light gray for labels
                    ctx.font = '12px sans-serif';
                    ctx.fillText(secondsToTime(dataPoint.time), x, y + 18);
                }
            }
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // --- Draw Labels and Grid ---
        ctx.fillStyle = '#a0aec0'; // Light gray for labels
        ctx.font = '12px sans-serif';
        const numYLabels = 5;
        for (let i = 0; i <= numYLabels; i++) {
            const yPos = padding + (i / numYLabels) * (canvasHeight - 2 * padding);
            const labelValue = (maxValue - minValue) * (1 - (i / numYLabels)) + minValue;
            ctx.globalAlpha = 1;
            ctx.fillText(intToString(labelValue, 1), padding - 20, yPos + 4);

            // Horizontal grid line
            ctx.strokeStyle = '#4a5568'; // Subtle gray for grid
            ctx.globalAlpha = 0.25;
            ctx.beginPath();
            ctx.moveTo(padding, yPos);
            ctx.lineTo(canvasWidth - padding, yPos);
            ctx.stroke();
        }
    }
}

function addLogMessage(text, type) {
    const logContainer = document.getElementById('logContainer');
    const logMessages = document.getElementById('logMessages');
    const timestamp = secondsToTime(data.secondsPerReset);
    let logData = {
        theVar: text,
        type: type,
        timestamp: timestamp
    }
    const fullMessage = expandLogMessage(logData);
    data.currentLog.push(logData);
    const messageElement = document.createElement('div');
    messageElement.innerHTML = fullMessage;
    messageElement.style.padding = '2px 8px';
    const isScrolledToBottom = logContainer.scrollTop + logContainer.clientHeight >= logContainer.scrollHeight - 10;
    logMessages.appendChild(messageElement);
    if(isScrolledToBottom) {
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    const logWrapper = document.getElementById('logWrapper');
    const openLogButton = document.getElementById('openLogButton');
    if(logWrapper.style.display === 'none') {
        openLogButton.innerHTML = `<span style="color:yellow">•</span> Open Log`
    }
}

function expandLogMessage(logData) {
    let theVar = logData.theVar;
    let type = logData.type;
    let timestamp = logData.timestamp;
    if(type === "purchaseAction") {
        let dataObj = actionData[theVar];
        return `${timestamp}: Permanently unlocked action: ${dataObj.title} in ${getPlaneNameFromNum(dataObj.plane)}`;
    } else if(type === "unlockAction") {
        let dataObj = actionData[theVar];
        let planeName = getPlaneNameFromNum(dataObj.plane);
        return `${timestamp}: New Action: <span style="font-weight:bold;cursor:pointer;" onclick="actionTitleClicked('${theVar}');">${dataObj.title}</span> in ${planeName}`
    } else if(type === "purchaseUpgrade") {
        let upgradeDataObj = upgradeData[theVar];
        return `${timestamp}: New Upgrade Available: ${upgradeDataObj.title}!`;
    } else if(type === "info") {
        return logData.theVar;
    }
}

function toggleLog() {
    const logWrapper = document.getElementById('logWrapper');
    const openLogButton = document.getElementById('openLogButton');
    if (logWrapper.style.display === 'none') {
        logWrapper.style.display = 'block';
        openLogButton.style.display = 'none';
    } else {
        logWrapper.style.display = 'none';
        openLogButton.style.display = 'block';
    }
}

function hoverLog() {
    const openLogButton = document.getElementById('openLogButton');
    openLogButton.innerHTML = `Open Log`
}

function clearLog() {
    const logMessages = document.getElementById('logMessages');
    logMessages.replaceChildren();
    data.currentLog = [];
    const openLogButton = document.getElementById('openLogButton');
    openLogButton.innerHTML = `Open Log`
}

function rebuildLog() {
    clearLog();
    const logContainer = document.getElementById('logContainer');
    const logMessages = document.getElementById('logMessages');
    for (let message of data.currentLog) {
        const messageElement = document.createElement('div');
        messageElement.innerHTML = expandLogMessage(message);
        messageElement.style.padding = '2px 8px';
        logMessages.appendChild(messageElement);
    }
    logContainer.scrollTop = logContainer.scrollHeight;
}


function togglePinned() {
    const pinnedWrapper = document.getElementById('pinnedWrapper');
    const openPinnedButton = document.getElementById('openPinnedButton');
    if (pinnedWrapper.style.display === 'none') {
        pinnedWrapper.style.display = 'block';
        openPinnedButton.style.display = 'none';
    } else {
        pinnedWrapper.style.display = 'none';
        openPinnedButton.style.display = 'block';
    }
}

function rebuildPinned() {
    let tempArray = copyArray(data.currentPinned);
    data.currentPinned = [];
    for(let actionVar of tempArray) {
        addPinnedAction(actionVar);
    }
}

function addPinnedActionClick(event, actionVar) {
    event.stopPropagation();
    addPinnedAction(actionVar);
}

function addPinnedAction(actionVar) {
    let dataObj = actionData[actionVar];
    let actionObj = data.actions[actionVar];
    if(data.currentPinned.indexOf(actionVar) !== -1) {
        return;
    }
    data.currentPinned.push(actionVar);

    queueCache(`${actionVar}PinnedLevels`)
    queueCache(`${actionVar}Level3`)
    queueCache(`${actionVar}MaxLevel3`)

    const messageElement = document.createElement('div');
    //remove button (X) removes all listeners
    messageElement.innerHTML = `<span id="${actionVar}PinContainer">
        [${dataObj.plane+1}]
        <span id="${actionVar}PinnedLevels">
            <span style="font-weight:bold;cursor:pointer;" onclick="actionTitleClicked('${actionVar}');">${dataObj.title}</span> 
            (<span id="${actionVar}Level3"></span>${actionObj.maxLevel >= 0?`/<span id="${actionVar}MaxLevel3"></span>`:""})
        </span>
        <span style="border:2px solid #840000;cursor:pointer;" class="mouseoverRed" onclick="removePinnedAction('${actionVar}')">X</span>
    </span>`;
    messageElement.style.padding = '2px 8px';

    document.getElementById("pinnedActions").appendChild(messageElement);

    clearCacheQueue();
}

function removePinnedAction(actionVar) {
    const pinElement = document.getElementById(`${actionVar}PinContainer`);
    if (pinElement) {
        pinElement.parentElement.remove();
        delete view.cached[actionVar];
    }

    const index = data.currentPinned.indexOf(actionVar);
    if (index !== -1) {
        data.currentPinned.splice(index, 1);
    }
}

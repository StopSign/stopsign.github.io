const iceSpan = document.getElementById("ice");
const moneySpan = document.getElementById("money");
const buyIceButton = document.getElementById("buyIceButton");
const buyMaxIceButton = document.getElementById("buyMaxIceButton");
const iceValueInput = document.getElementById("iceValue");
const reserveSpan = document.getElementById("reserve");
const pumpSpan = document.getElementById("pump");
const upgradePumpButton = document.getElementById("upgradePumpButton");
const mountainLakeSpan = document.getElementById("mountainLake");
const greatLakeSpan = document.getElementById("greatLake");
const sellWaterButton = document.getElementById("sellWaterButton");
const riverColumnsContainer = document.getElementById("riverColumns");
const riverBottomImg = document.getElementById("riverBottomImg");
const riverColumnWidth = riverBottomImg.offsetWidth / data.numOfRivers;


const progressBar = document.getElementById("progressBar");

const view = {
    maxValue: 0,
    riverValues: [],
    riverWaves: [],
    update() {
        iceSpan.textContent = data.ice.toFixed(2);
        moneySpan.textContent = data.money.toFixed(2);
        reserveSpan.textContent = data.reserve.toFixed(2);
        pumpSpan.textContent = data.pump;
        mountainLakeSpan.textContent = data.mountainLake.toFixed(2);

        // this.maxValue = 0;
        for (let i = 0; i < data.numOfRivers; i++) {
            this.maxValue = Math.max(this.maxValue, data.rivers[i]);
            this.riverValues[i].textContent = data.rivers[i].toFixed(2);
        }

        //River is <formula based on maxHeight> up to a maxValue of <formula based on number>
        for (let i = 0; i < data.numOfRivers; i++) {
            let allowedMax;
            if(data.rivers[i] < 10) {//convert it to 0-100. After 10, which gives 30% height,
                allowedMax = 30;
            } else {
                allowedMax = 20 + (Math.log(data.rivers[i]) / Math.log(10)) * 10; //each 10% needs 10x more
                if(allowedMax > 100) {
                    allowedMax = 100;
                }
            }
            if(i === 0) {
                // console.log(data.rivers[i], this.maxValue, allowedMax);
            }
            const barHeight = (1 - (data.rivers[i] / this.maxValue * allowedMax / 100)) * riverBottomImg.offsetHeight;
            this.riverWaves[i].style.height = `${barHeight}px`;
        }

        greatLakeSpan.textContent = data.greatLake.toFixed(2);
    },
    createRiverDivs() {
        // Create the columns
        for (let i = 0; i < data.numOfRivers; i++) {
            const column = document.createElement("div");
            column.classList.add("column");
            column.style.width = `${riverColumnWidth}px`;
            riverColumnsContainer.appendChild(column);

            const value = document.createElement('span');
            value.id = `river${i}Value`;
            value.className = 'valueText';
            value.textContent = '0';
            column.appendChild(value);
            this.riverValues[i] = value;

            const wave = document.createElement("wave");
            wave.classList.add("wave");
            column.appendChild(wave);
            this.riverWaves[i] = wave;

        }

        // Update the columns to show the correct percentage of the image
        riverColumnsContainer.childNodes.forEach((column) => {
            const bar = document.createElement("div");
            bar.classList.add("bar");
            bar.style.height = "100%";
            column.appendChild(bar);
        });
    }

};
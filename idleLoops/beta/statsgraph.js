let statGraph = {
    init : function () {
        let statChartCtx = document.getElementById("statChartCtx");
        let dataset = this.getGraphDatasets();
        var statLabels = [];
        $(statList).each(function(x,stat) {
          statLabels.push(_txt("stats>"+stat+">short_form"))
        })
        this.graphObject = new Chart(statChartCtx, {
            type: 'radar',
            options: {
                elements: {
                    line: {
                        tension: 0,
                        borderWidth: 3
                    }
                },
                scale: {
                    ticks: {
                        beginAtZero: true,
                        display: false,
                    },
                },
                tooltips: {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            let label = data.datasets[tooltipItem.datasetIndex].label || '';

                            if (label) {
                                label += ': ';
                            }
                            label += intToString(tooltipItem.yLabel / (data.datasets[tooltipItem.datasetIndex].label === "Bonus XP" ? radarModifier : 1), 1);
                            label += data.datasets[tooltipItem.datasetIndex].tooltipComplement || '';
                            return label;
                        }
                    }
                }
            },
            data: {
                labels : statLabels,
                datasets : dataset,
            }
        });
    },
    graphObject : null,
    getGraphDatasets : function() {
        let dataset = [
            {
                label: _txt("stats>tooltip>level"),
                data: [],
                fill: true,
                backgroundColor: "rgba(157, 103, 205, 0.2)",
                borderColor: "rgb(157, 103, 205)",
                pointBackgroundColor: "rgb(157, 103, 205)",
                pointBorderColor: "#fff",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "rgb(157, 103, 205)"
            },
            {
                label: _txt("stats>tooltip>total_multiplier"),
                data: [],
                backgroundColor: "rgba(255, 180, 91, 0.2)",
                borderColor: "rgb(255, 180, 91)",
                pointBackgroundColor: "rgb(255, 180, 91)",
                pointBorderColor: "#fff",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "rgb(255, 180, 91)",
                tooltipComplement: "%",
            }
        ];
        let highestLevel = 0;
        let highestXP = 0;
        for(let i = 0; i < statList.length; i++) {
            let newLevel = getLevel(statList[i]);
            let newXP = (getTotalBonusXP(statList[i])-1)*100;
            if(newLevel > highestLevel) {
                highestLevel = newLevel;
            }
            if(newXP > highestXP) {
                highestXP = newXP;
            }
        }
        if(highestLevel === 0 || highestXP === 0) {
            radarModifier = 1;
        } else {
            radarModifier = highestLevel / highestXP;
        }
        for (let i = 0; i < statList.length; i++) {
            dataset[0].data.push(getLevel(statList[i]));
            dataset[1].data.push((getTotalBonusXP(statList[i])-1)*100 * radarModifier);
        }
        return dataset;
    },
    update: function () {
        let newDatasets = this.getGraphDatasets();
        this.graphObject.data.datasets.forEach(function(dataset, x) {
            dataset.data = newDatasets[x].data;
        });
        this.graphObject.update();
        view.updateStatGraphNeeded = false;
    }
};

let radarModifier;
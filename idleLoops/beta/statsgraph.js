let statGraph = {
    init : function () {
        let statChartCtx = document.getElementById("statChartCtx");
        let dataset = this.getGraphDatasets();
        this.graphObject = new Chart(statChartCtx, {
            type: 'radar',
            options: {
              elements: {
                line: {
                  tension:0,
                  borderWidth:3
                }
              },
              scale: {
                  ticks: {
                      beginAtZero: true,
                      display:false,
                  },
              },
                tooltips: {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            let label = data.datasets[tooltipItem.datasetIndex].label || '';

                            if (label) {
                                label += ': ';
                            }
                            label += intToString(tooltipItem.yLabel, 1);
                            label += data.datasets[tooltipItem.datasetIndex].tooltipComplement || '';
                            return label;
                        }
                    }
                }
            },
            data: {
                labels : statList,
                datasets : dataset,
            }
        });
    },
    graphObject : null,
    getGraphDatasets : function() {
          let dataset = [
            {
              label : "Level",
              data : [],
              fill:true,
              backgroundColor:"rgba(157, 103, 205, 0.2)",
              borderColor:"rgb(157, 103, 205)",
              pointBackgroundColor:"rgb(157, 103, 205)",
              pointBorderColor:"#fff",
              pointHoverBackgroundColor:"#fff",
              pointHoverBorderColor:"rgb(157, 103, 205)"
            },
            {
              label : "Bonus XP",
              data : [],
              backgroundColor:"rgba(255, 180, 91, 0.2)",
              borderColor:"rgb(255, 180, 91)",
              pointBackgroundColor:"rgb(255, 180, 91)",
              pointBorderColor:"#fff",
              pointHoverBackgroundColor:"#fff",
              pointHoverBorderColor:"rgb(255, 180, 91)",
              tooltipComplement : "%",
            }
          ];
          for(let i = 0; i < statList.length; i++) {
              dataset[0].data.push(getLevel(statList[i]));
              dataset[1].data.push(getTotalBonusXP(statList[i]));
          }
          return dataset;
    },
    update : function () {
        let newDatasets = this.getGraphDatasets();
        this.graphObject.data.datasets.forEach((dataset,x) => {
            dataset.data = newDatasets[x].data;
        });
        this.graphObject.update();
        view.updateStatGraphNeeded = false;
    }
};

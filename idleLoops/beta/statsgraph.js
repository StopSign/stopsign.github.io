let statGraph = {
    init : function () {
        var statChartCtx = document.getElementById("statChartCtx");
        var dataset = this.getGraphDatasets();
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
                      display:false
                  },
              },
              tooltips: {
                  callbacks: {
                      label: function(tooltipItem, data) {
                          var label = data.datasets[tooltipItem.datasetIndex].label || '';

                          if (label) {
                              label += ': ';
                          }
                          label += Math.round(tooltipItem.yLabel * 100) / 100;
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
          var dataset = [
            {
              label : "Level",
              data : [],
              fill:true,
              backgroundColor:"rgba(255, 99, 132, 0.2)",
              borderColor:"rgb(255, 99, 132)",
              pointBackgroundColor:"rgb(255, 99, 132)",
              pointBorderColor:"#fff",
              pointHoverBackgroundColor:"#fff",
              pointHoverBorderColor:"rgb(255, 99, 132)"
            },
            {
              label : "Bonus XP",
              data : [],
              backgroundColor:"rgba(54, 162, 235, 0.2)",
              borderColor:"rgb(54, 162, 235)",
              pointBackgroundColor:"rgb(54, 162, 235)",
              pointBorderColor:"#fff",
              pointHoverBackgroundColor:"#fff",
              pointHoverBorderColor:"rgb(54, 162, 235)",
              tooltipComplement : "%",
            }
          ];
          for(let i = 0; i < statList.length; i++) {
              dataset[0].data.push(getLevel(statList[i]));
              dataset[1].data.push(getTotalBonusXP(statList[i],2));
          };
          return dataset;
    },
    update : function () {
        var newDatasets = this.getGraphDatasets();
        this.graphObject.data.datasets.forEach((dataset,x) => {
            dataset.data = newDatasets[x].data;
        });
        this.graphObject.update();
        view.updateStatGraphNeeded = false;
    }
}

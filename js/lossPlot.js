window.lossPlot = {
    chart:null,
    validationLoss:[],
    trainingLoss:[],
    epochCounter:0,
    epochsArray:[],
    addLosses : function(tLoss, vLoss) {
        lossPlot.epochCounter += 1;

        lossPlot.validationLoss.push([lossPlot.epochCounter,vLoss]);
        lossPlot.trainingLoss.push([lossPlot.epochCounter,tLoss]);
        // lossPlot.epochsArray.push(lossPlot.epochCounter);

    },

    plotChart: function() {
        // if (lossPlot.chart == null) {
            const options = {
                chart: {height: 350, type: 'line', zoom: {enabled: false}},
                dataLabels: {enabled: false},
                stroke: {curve: 'straight'},
                series: [{
                    name: "Val Loss",
                    data: lossPlot.validationLoss
                }, {
                    name: "Train Loss",
                    data: lossPlot.trainingLoss
                }],
                title: {text: 'Loss', align: 'left'},
                grid: {row: {colors: ['#f3f3f3', 'transparent']},},
                xaxis: {
                    type: 'category',
                    min:0,
                    floating: false
                }
            };
            lossPlot.chart = new ApexCharts(document.querySelector("#chart"), options);
            lossPlot.chart.render();

        // } else {
        //     lossPlot.chart = new ApexCharts(document.querySelector("#chart"), options);
        //     lossPlot.chart.render();
        //
        // }




    },
    resetChart: function() {
        if (lossPlot.chart != null) {
            lossPlot.chart.destroy();
            lossPlot.chart = null;
            lossPlot.validationLoss = [];
            lossPlot.trainingLoss = [];
            lossPlot.epochCounter = 0;
            lossPlot.epochsArray = [];
        }
    },
};


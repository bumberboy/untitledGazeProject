window.gridValidation = {
    startValidation: function() {
        grid = new Grid();
        grid.setup();
        // grid.gridBoxes[4][7].setBackgroundColor('red');
        grid.recordAccuracy();
    }

};

class Grid {
    constructor() {}

    setup() {
        var canvas = document.getElementById('grid');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.ctx = canvas.getContext('2d');
        const aspectRatio = window.innerWidth/window.innerHeight;
        this.verticalBoxCount = 5;
        const lineWidth = 1;
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeStyle = 'rgb(20,20,20)';
        this.horizontalBoxCount = Math.ceil(this.verticalBoxCount * aspectRatio);
        this.boxWidth = window.innerWidth/this.horizontalBoxCount;
        this.boxHeight = window.innerHeight/this.verticalBoxCount;

        this.drawGrid();
        this.gridBoxes = this.generateGridBoxes(lineWidth);
    }

    drawGrid() {
        for (var x=1;x<this.horizontalBoxCount;x+=1) {
            this.ctx.moveTo(this.boxWidth*x, 0);
            this.ctx.lineTo(this.boxWidth*x, window.innerHeight);
        }
        for (x=1;x<this.verticalBoxCount;x+=1) {
            this.ctx.moveTo(0, this.boxHeight*x);
            this.ctx.lineTo(window.innerWidth, this.boxHeight*x);

        }
        this.ctx.stroke();

    }

    async recordAccuracy() {
        for (var i=0; i<this.verticalBoxCount; i+=1) {
            for (var j=0; j<this.horizontalBoxCount; j+=1) {
                await this.gridBoxes[i][j].recordPredictions();
            }
        }
    }

    generateGridBoxes(lineWidth) {
        var result = [];
        for (var y=0; y<this.verticalBoxCount; y+=1) {
            var temp = [];
            for (var x=0; x<this.horizontalBoxCount; x += 1) {
                temp.push(new GridBox(this, {x:x*this.boxWidth+lineWidth,
                    y:y*this.boxHeight+lineWidth, width:this.boxWidth-2*lineWidth,
                    height:this.boxHeight-2*lineWidth}))
            }
            result.push(temp);
        }
        return result;
    }
}

class GridBox {
    constructor(grid, frame) {
        this.frame = frame;
        this.grid = grid;
        this.accuracy = {};
        const xx = ((this.frame.x + (this.frame.width/2))/window.innerWidth*2)-1;
        const yy = ((this.frame.y + (this.frame.height/2))/window.innerHeight*2)-1;
        this.normalizedMidPoint = {x:xx, y:yy}
    }


    setBackgroundColor(color) {
        grid.ctx.lineWidth = 0;
        grid.ctx.fillStyle = color;
        grid.ctx.fillRect(this.frame.x, this.frame.y, this.frame.width, this.frame.height);
    }

    async recordPredictions() {
        this.xAccuracyForMeanCalc = 0.0;
        this.yAccuracyForMeanCalc = 0.0;
        this.countForMeanCalc = 0;
        const ball = $("#ball");
        // ball.css('left', this.frame.x+this.frame.width/2-12.5 + 'px');
        // ball.css('top', this.frame.y+this.frame.height/2-12.5 + 'px');
        // var animGrid = $("div.grid");
        // var animGridContainer = $(".staggering-grid-demo");
        //
        // animGridContainer.css("position", "absolute");
        // animGridContainer.css("left", 1 + "px");
        // animGridContainer.css("top", 1 + "px");
        // animGridContainer.css("height", 170 + "px");
        // animGridContainer.css("width", 170 + "px");
        //
        //
        // var htmlString = "";
        // for (var i=0; i<50; i++) {htmlString += "<div class=\"small square el\"></div>"}
        // animGrid.html(htmlString);
        // anime({
        //     targets: '.staggering-grid-demo .el',
        //     scale: [
        //         {value: .1, easing: 'easeOutSine', duration: 500},
        //         {value: 1, easing: 'easeInOutQuad', duration: 500}
        //     ],
        //     delay: anime.stagger(100, {grid: [7, 7], from: 'center'})
        // });
        for (var i = 0; i < 60; i++) {
            this.recordPrediction();
            await timer(16.6);
        }

        this.xAccuracyForMeanCalc = this.xAccuracyForMeanCalc/this.countForMeanCalc;
        this.yAccuracyForMeanCalc = this.yAccuracyForMeanCalc/this.countForMeanCalc;
        const setColor = 'hsl(' + (Math.max(0,0.5-this.xAccuracyForMeanCalc))*120 +',90%, 90%)';
        this.setBackgroundColor(setColor);

    }

    recordPrediction() {
        const xAccuracy = prediction.x - this.normalizedMidPoint.x;
        const yAccuracy = prediction.y - this.normalizedMidPoint.y;
        this.xAccuracyForMeanCalc += Math.abs(xAccuracy);
        this.yAccuracyForMeanCalc += Math.abs(yAccuracy);
        this.countForMeanCalc += 1;
        const x = (Math.round(xAccuracy*10)/10);
        const y = (Math.round(yAccuracy*10)/10);
        if (x <= 1 && y <= 1) {
            const key = 'x'+ x + 'y'+ y;
            if (key in this.accuracy) {
                this.accuracy[key] += 1;
            } else {
                this.accuracy[key] = 1;
            }
        }
    }
}
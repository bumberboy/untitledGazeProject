window.gridValidation = {
    testRan: 0,
    running:false,
    isPaused: false,

    toggleGridValidation: function() {
        if (gridValidation.running && gridValidation.isPaused) {
            gridValidation.isPaused = false;

        } else if (gridValidation.running && !gridValidation.isPaused) {
            gridValidation.isPaused = true;

        } else {
            gridValidation.running = true;
            gridValidation.startValidation();
        }
    },

    clearGridValidation: function() {

    },

    startValidation: function() {
        grid = new Grid();
        grid.setup();
        // grid.gridBoxes[4][7].setBackgroundColor('red');
        grid.recordAccuracy();
        gridValidation.testRan += 1;
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
        var odd = true;
        for (var i=0; i<this.verticalBoxCount; i+=1) {
            if (odd) {
                for (var j=0; j<this.horizontalBoxCount; j+=1) {
                    this.setValidationTargetTo(this.gridBoxes[i][j].midPoint);
                    await this.gridBoxes[i][j].recordPredictions();
                    // console.log(this.gridBoxes[i][j].xAccuracyForMeanCalc, this.gridBoxes[i][j].yAccuracyForMeanCalc);

                }
                odd = false;
            } else {
                for (var j=this.horizontalBoxCount-1; j>=0; j-=1) {
                    this.setValidationTargetTo(this.gridBoxes[i][j].midPoint);
                    await this.gridBoxes[i][j].recordPredictions();
                    // console.log(this.gridBoxes[i][j].xAccuracyForMeanCalc, this.gridBoxes[i][j].yAccuracyForMeanCalc);

                }
                odd = true;
            }

        }
    }

    setValidationTargetTo(midPoint) {
        console.log(midPoint);
        const validationTarget = $('#validationTarget');
        const targetWidth = validationTarget.outerWidth();
        const targetHeight = validationTarget.outerHeight();


        // Move target there:
        validationTarget.css('left', midPoint.x - targetWidth/2 + 'px');
        validationTarget.css('top', midPoint.y - targetHeight/2 + 'px');

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
        this.testRan = 0;
        this.grid = grid;
        this.accuracy = {};
        const midX = this.frame.x + this.frame.width/2;
        const midY = this.frame.y + this.frame.height/2;
        this.midPoint = {x:midX,y:midY};
        const xx = (midX/window.innerWidth*2)-1;
        const yy = (midY/window.innerHeight*2)-1;
        this.normalizedMidPoint = {x:xx, y:yy};
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

        await timer(1000);
        for (var i = 0; i < 20; i++) {
            while (gridValidation.isPaused) {
                await timer(1000)
            }
            this.recordPrediction();
            await timer(60);
        }

        this.xAccuracyForMeanCalc = this.xAccuracyForMeanCalc/this.countForMeanCalc;
        this.yAccuracyForMeanCalc = this.yAccuracyForMeanCalc/this.countForMeanCalc;
        const setColor = 'hsl(' + (Math.max(0,1-this.xAccuracyForMeanCalc))*180 +',100%, 50%)';
        this.setBackgroundColor(setColor);
        this.displayAccuracy();

    }

    displayAccuracy() {
        console.log(this.testRan);
        var label = document.createElement("div");
        label.className = 'grid-validation-label';
        label.style.position = 'absolute';
        label.style.left = this.frame.x + 'px';
        label.style.top = (this.frame.y + gridValidation.testRan*40) + 'px';
        const pixelErrorX = this.xAccuracyForMeanCalc * window.innerWidth;
        const pixelErrorY = this.yAccuracyForMeanCalc * window.innerHeight;
        const metricErrorX =pixelErrorX*cmPerPixel;
        const metricErrorY = pixelErrorY*cmPerPixel;
        // const labelText = Math.sqrt(metricErrorX*metricErrorX +
        //                             metricErrorY*metricErrorY).toFixed(2);
        const labelText = Math.sqrt(metricErrorX*metricErrorX +
                                    metricErrorY*metricErrorY).toFixed(2);
        label.innerHTML = labelText;
        document.body.appendChild(label);
    }

    recordPrediction() {

        // prediction.x = this.normalizedMidPoint.x + 0.1;
        // prediction.y = this.normalizedMidPoint.y + 0.1;
        console.log(predictions["1"].x, this.normalizedMidPoint.x);
        const p_x = (predictions["1"].x + 1)/2;
        const mp_x = (this.normalizedMidPoint.x + 1)/2;
        const p_y = (predictions["1"].y + 1)/2;
        const mp_y = (this.normalizedMidPoint.y + 1)/2;
        const xAccuracy = p_x - mp_x;
        const yAccuracy = p_y - mp_y;
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
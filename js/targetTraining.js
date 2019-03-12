window.targetTraining = {
    x:0,
    y:0,
    trainingTargetTimer: null,
    captureTimer: null,

    getTargetPos: function() {
        return [targetTraining.x, targetTraining.y];
    },

    runTargetTraining: function(type) {
        if (type === 'rect') {
            targetTraining.displayRectangleTrainingTarget();

        } else if (type === 'circle') {
            targetTraining.displayCircularTrainingTarget();
        }



        function captureExample() {
            // console.log(targetTraining.getTargetPos());
            // console.log(mouse.getMousePos());
            dataset.captureExample(targetTraining.getTargetPos());
        }

        targetTraining.captureTimer = setInterval(captureExample,200);


    },

    stopTargetTraining: function() {
        clearInterval(targetTraining.trainingTargetTimer);
        clearInterval(targetTraining.captureTimer);
    },

    displayCircularTrainingTarget: function() {
        // var element = document.getElementById('ball');
        var angle = 0;
        var absoluteX = 0;
        var absoluteY = 0;

        var w = (window.innerWidth - 50) / 2;
        var h = (window.innerHeight - 50) / 2;


        function ballCircle() {
            absoluteX = w + w * Math.cos(angle * Math.PI / 180);
            absoluteY = h + h * Math.sin(angle * Math.PI / 180);

            ball.style.left = absoluteX + 'px';
            ball.style.top = absoluteY + 'px';

            angle = angle + 0.3;
            if (angle > 360) {
                angle = 0;
            }

            targetTraining.x = Math.cos(angle * Math.PI / 180);
            targetTraining.y = Math.sin(angle * Math.PI / 180);
        }
        targetTraining.trainingTargetTimer = setInterval(ballCircle,5);
    },

    displayRectangleTrainingTarget: function() {

        var w = window.innerWidth - 50;
        var h = window.innerHeight - 50;

        var absoluteX = 0;
        var absoluteY = 0;
        var firstHalfDone = false;
        var trainingTimer = null;
        var runCount = 0;
        var minX = 0;
        var minY = 0;


        function drawRect() {
            ball.style.left = absoluteX + 'px';
            ball.style.top = absoluteY + 'px';
            targetTraining.x = (absoluteX/(window.innerWidth - 50)*2 - 1);
            targetTraining.y = (absoluteY/(window.innerHeight - 50)*2 - 1);

            if (firstHalfDone === false) {
                if (absoluteX < w) {
                    absoluteX += 5;
                } else if (absoluteY < h) {
                    absoluteY += 5;
                } else {
                    firstHalfDone = true

                }
            } else {
                console.log(absoluteX, w);
                if (absoluteX > minX) {
                    absoluteX -= 5;
                } else if (absoluteY > minY) {
                    absoluteY -= 5;
                } else {
                    if (runCount > 0) {
                        clearInterval(trainingTimer);
                        clearInterval(targetTraining.captureTimer);
                    }
                    firstHalfDone = false;


                    absoluteX = minX = w/4;
                    absoluteY = minY = h/4;
                    w = w*3/4;
                    h = h*3/4;
                    runCount++;

                }
            }

        }

        trainingTimer = setInterval(drawRect, 5);






    }



};
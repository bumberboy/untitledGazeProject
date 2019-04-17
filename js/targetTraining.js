window.targetTraining = {
    x:0,
    y:0,
    trainingTargetTimer: null,
    captureTimer: null,
    trainingInProgress: false,
    gridAnim:null,

    getTargetPos: function() {
        return [targetTraining.x, targetTraining.y];
    },

    captureExample: function() {
        // console.log(targetTraining.getTargetPos());

        dataset.captureExample(targetTraining.getTargetPos());
    },

    runTargetTraining: function(type) {
        if (type === 'rect') {
            targetTraining.displayRectangleTrainingTarget();

        } else if (type === 'circle') {
            targetTraining.displayCircularTrainingTarget();

        } else if (type === 'grid') {
            targetTraining.displayGridTargetTraining();

        }


    },
    startRecording: function() {
        targetTraining.captureTimer = setInterval(targetTraining.captureExample,300);
    },

    stopRecording: function() {
        // clearInterval(targetTraining.trainingTargetTimer);
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
            targetTraining.x = (absoluteX/(w)*2 - 1);
            targetTraining.y = (absoluteY/(h)*2 - 1);

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


    },

    displayGridTargetTraining: function() {
        var w = window.innerWidth - 35;
        var h = window.innerHeight - 35;
        targetTraining.gridAnim = anime({
            targets: '#trainingTarget',
            keyframes: [
                {translateX: w, duration: 10000},
                {translateY: h, duration: 8000},
                {translateX: 0, duration: 10000},
                {translateY: 200, duration: 8000},
                {translateX: w - 200, duration: 4000},
                {translateY: h - 200, duration: 2500},
                {translateX: 200, duration: 4000},
                {translateY: 400, duration: 2500},
                {translateX: w - 400, duration: 2000},
                {translateY: h - 400, duration: 1000},
                {translateX: 400, duration: 2000},
                {translateY: 600, duration: 1000},
            ],
            easing: 'linear',
            loop: true,
            direction: 'alternate',
            update: function(anim) {
                const translation = anim.animatables[0].transforms.list;
                absoluteX = parseFloat(translation.get("translateX"));
                absoluteY = parseFloat(translation.get("translateY"));
                targetTraining.x = (absoluteX/(w)*2 - 1);
                targetTraining.y = (absoluteY/(h)*2 - 1);

            },
            complete: function(anim) {
                clearInterval(targetTraining.captureTimer);
            }
        });

    }



};

function timer(ms) {
    return new Promise(res => setTimeout(res, ms));
}
let forwardTimes = [];
let cmPerPixel = 0.023347; // for 27inch iMAC;
// var eyesRect = null;
function updateTimeStats(timeInMs) {
    // For displaying inference time
    forwardTimes = [timeInMs].concat(forwardTimes).slice(0, 30);
    const avgTimeInMs = forwardTimes.reduce((total, t) => total + t) / forwardTimes.length;
    $('#time').val(`${Math.round(avgTimeInMs)} ms`);
    $('#fps').val(`${faceapi.round(1000 / avgTimeInMs)}`)
}

currentLandmarks = null;

async function onPlay() {
    const videoEl = $('#inputVideo').get(0);

    if(videoEl.paused || videoEl.ended || !isFaceDetectionModelLoaded())
        return setTimeout(() => onPlay());

    const inputSize = 256;
    const scoreThreshold = 0.5;
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
    const ts = Date.now();
    const result = await faceapi.detectSingleFace(videoEl, options).withFaceLandmarks()


    updateTimeStats(Date.now() - ts);

    if (result) {
        if ('landmarks' in result) {
            const rotationAngle = getEyeRotation(result.landmarks);
            // displayEyesRotated(rotationAngle,eyesRect);

            currentLandmarks = result.landmarks;

            const leftEyeRect = getLeftEyeRect(result.landmarks);
            const rightEyeRect = getRightEyeRect(result.landmarks);
            const bothEyesRect = getEyesRect(result.landmarks);
            const faceRect = getFaceRect(result.landmarks);

            displayEyes(leftEyeRect, rightEyeRect);

        }
        if ('detection' in result) {
            displayFace(result.detection.box);
            displayMask(result.detection.box);
        }
        drawLandmarks(videoEl, $('#overlay').get(0), [result], true)
    }

    setTimeout(() => onPlay())

}

function angleBetweenTwoPoints(p1,p2) {
        if (p1.x > p2.x) {
            var p3 = p1;
            p1 = p2;
            p2 = p3;
        }
    return Math.atan((p2.y-p1.y)/(p2.x-p1.x)) * 180 / Math.PI;
}


function getFaceRotationAngle(landmarks) {
    const jawOutline = landmarks.getJawOutline();
    const p1=jawOutline[0];
    const p2=jawOutline[16];
    return angleBetweenTwoPoints(p1,p2);

}

function getEyeRotation(landmarks) {
    const leftEye = landmarks.getLeftEye();

    return  angleBetweenTwoPoints(leftEye[0],leftEye[3]);
}

function getEyesRect(landmarks) {
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const minX = Math.min(leftEye[0].x, leftEye[1].x, leftEye[2].x, leftEye[3].x, leftEye[4].x, leftEye[5].x,
        rightEye[0].x, rightEye[1].x, rightEye[2].x, rightEye[3].x, rightEye[4].x, rightEye[5].x) - 10;
    const maxX = Math.max(leftEye[0].x, leftEye[1].x, leftEye[2].x, leftEye[3].x, leftEye[4].x, leftEye[5].x,
        rightEye[0].x, rightEye[1].x, rightEye[2].x, rightEye[3].x, rightEye[4].x, rightEye[5].x) + 10;
    const minY = Math.min(leftEye[0].y, leftEye[1].y, leftEye[2].y, leftEye[3].y, leftEye[4].y, leftEye[5].y,
        rightEye[0].y, rightEye[1].y, rightEye[2].y, rightEye[3].y, rightEye[4].y, rightEye[5].y) - 3;
    const maxY = Math.max(leftEye[0].y, leftEye[1].y, leftEye[2].y, leftEye[3].y, leftEye[4].y, leftEye[5].y,
        rightEye[0].y, rightEye[1].y, rightEye[2].y, rightEye[3].y, rightEye[4].y, rightEye[5].y) + 3;

    const width = maxX - minX;
    const height = maxY - minY;
    return [minX, minY, width, height * 1.25];

}


function getLeftEyeRect(landmarks) {
    var leftEye = landmarks.getLeftEye();

    const minX = Math.min(leftEye[0].x, leftEye[1].x, leftEye[2].x, leftEye[3].x, leftEye[4].x, leftEye[5].x) - 10;
    const maxX = Math.max(leftEye[0].x, leftEye[1].x, leftEye[2].x, leftEye[3].x, leftEye[4].x, leftEye[5].x) + 10;
    const minY = Math.min(leftEye[0].y, leftEye[1].y, leftEye[2].y, leftEye[3].y, leftEye[4].y, leftEye[5].y) - 4;
    const maxY = Math.max(leftEye[0].y, leftEye[1].y, leftEye[2].y, leftEye[3].y, leftEye[4].y, leftEye[5].y) + 4;

    const width = maxX - minX;
    const height = maxY - minY;
    return [minX, minY, width, height * 1.25];

}

function getRightEyeRect(landmarks) {
    var rightEye = landmarks.getRightEye();

    const minX = Math.min(rightEye[0].x, rightEye[1].x, rightEye[2].x, rightEye[3].x, rightEye[4].x, rightEye[5].x) - 10;
    const maxX = Math.max(rightEye[0].x, rightEye[1].x, rightEye[2].x, rightEye[3].x, rightEye[4].x, rightEye[5].x) + 10;
    const minY = Math.min(rightEye[0].y, rightEye[1].y, rightEye[2].y, rightEye[3].y, rightEye[4].y, rightEye[5].y) - 4
    const maxY = Math.max(rightEye[0].y, rightEye[1].y, rightEye[2].y, rightEye[3].y, rightEye[4].y, rightEye[5].y) + 4;
    const width = maxX - minX;
    const height = maxY - minY;
    return [minX, minY, width, height * 1.25];

}

function getFaceRect(landmarks) {
    var face = landmarks.getJawOutline();

}


async function loadFaceDetector() {
    //load face detection model
    const MODEL_URL = '/untitledGazeProject';
    await faceapi.loadTinyFaceDetectorModel(MODEL_URL);
    await faceapi.loadFaceLandmarkTinyModel(MODEL_URL);
    await faceapi.loadFaceLandmarkModel(MODEL_URL);
    await changeFaceDetector(TINY_FACE_DETECTOR);
    changeInputSize(224);


}

async function loadWebCam() {
    //access user's webcam and stream feed to the video element
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    const videoEl = $('#inputVideo').get(0);
    videoEl.srcObject = stream
}



function convertImage(image) {
    // Convert to grayscale and add spatial info
    const imageShape = image.shape;
    const w = imageShape[1];
    const h = imageShape[2];

    const data = [new Array(w)];
    for (let x = 0; x < w; x++) {
        data[0][x] = new Array(h);

        for (let y = 0; y < h; y++) {
            data[0][x][y] = [
                dataset.rgbToGrayscale(image, 0, x, y),
                (x / w) * 2 - 1,
                (y / h) * 2 - 1,
            ];
        }
    }

    return tf.tensor(data);
}

async function useTrainedModel(modelName) {
    console.log(tf.version);
    const model = await tf.loadModel('/untitledGazeProject/'+modelName+'.json');
    training.currentModel = model
}


function setupKeys() {
    $('body').keyup(function(event) {
        // On space key:
        if (event.key === ' ') {
            dataset.captureExample(mouse.getMousePos());

            event.preventDefault();
            return false;
        } else if (event.key === 'r') {
            targetTraining.runTargetTraining('rect');
        } else if (event.key === 't') {
            targetTraining.stopRecording();
        } else if (event.key === 'f') {
            targetTraining.runTargetTraining('circle');

        } else if (event.key === 'b') {
            if (targetTraining.gridAnim == null) {
                console.log("Begin target training...");
                targetTraining.trainingInProgress = true;
                targetTraining.runTargetTraining('grid');
                targetTraining.startRecording();

            } else if (!targetTraining.trainingInProgress) {
                console.log("Continue target training...");
                targetTraining.gridAnim.play();
                targetTraining.trainingInProgress = true;
                targetTraining.startRecording();

            }
            else {
                console.log("Target training paused...");
                targetTraining.gridAnim.pause();
                targetTraining.stopRecording();
                targetTraining.trainingInProgress = false;
                targetTraining.stopRecording();
            }

        } else if (event.key === 'p') {
            useTrainedModel('model');
        } else if (event.key === 'o') {
            useTrainedModel('model2');
        } else if (event.key === 'n') {
            gridValidation.startValidation();

        }
    });



    $('#train').click(function() {
        training.fitModel();
    });
}

var prediction = {x: 0, y: 0};

function moveTarget() {
    if (training.currentModel == null) {
        return;
    }
    tf.tidy(function() {
        const metaInfos = dataset.getMetaInfos();
        var _prediction = null;

        if (training.useMetaData) {
            const image = dataset.getImage();

            _prediction = training.currentModel.predict([image,metaInfos]);
        } else if (training.useTwoEyes) {
            const images = dataset.getImages();
            _prediction = training.currentModel.predict([images[0], images[1], metaInfos]);


        } else if (training.useTwoEyesAndFace) {
            const images = dataset.getImages();
            _prediction = training.currentModel.predict([images[0], images[1], images[2]]);


        } else if (training.useEyesFaceFacePos) {
            const images = dataset.getAllInputs();
            _prediction = training.currentModel.predict([images[0], images[1], images[2], images[3]]);


        } else {
            const image = dataset.getImage();

            _prediction = training.currentModel.predict(image);
        }


        // Convert normalized position back to screen position:
        const target = $('#gazeTarget');
        const targetWidth = target.outerWidth();
        const targetHeight = target.outerHeight();

        prediction.x = _prediction.get(0,0);
        prediction.y = _prediction.get(0,1);

        const xx = Math.min(((prediction.x + 1) / 2), 1);
        const yy = Math.min(((prediction.y + 1) / 2), 1);

        const x = xx * ($(window).width() - targetWidth);
        const y = yy * ($(window).height() - targetHeight);

        // Move target there:
        target.css('left', x + 'px');
        target.css('top', y + 'px');

        heatmap.addData({ x: x, y: y, value: 0.1  })
    });
}

var heatmap = null;

function drawHeatmap() {
    heatmap = h337.create({
        container: document.getElementById('heatmapContainer'),
        maxOpacity: .6,
        radius: 40,
        blur: .950,
        // backgroundColor with alpha so you can see through it
    });
}

$(document).ready(function() {

    loadFaceDetector();
    loadWebCam();
    setupKeys();
    // targetTraining.runTargetTraining();
    setInterval(moveTarget, 100);
    console.log("Model uses metadata:", training.useMetaData);
    console.log("Model uses 2 eyes:", training.useTwoEyes);
    console.log("Model uses 2 eyes and face:", training.useTwoEyesAndFace);

    drawHeatmap();


});



(function () {
    'use strict';

    var module = {
        options: [],
        header: [navigator.platform, navigator.userAgent, navigator.appVersion, navigator.vendor, window.opera],
        dataos: [
            { name: 'Windows Phone', value: 'Windows Phone', version: 'OS' },
            { name: 'Windows', value: 'Win', version: 'NT' },
            { name: 'iPhone', value: 'iPhone', version: 'OS' },
            { name: 'iPad', value: 'iPad', version: 'OS' },
            { name: 'Kindle', value: 'Silk', version: 'Silk' },
            { name: 'Android', value: 'Android', version: 'Android' },
            { name: 'PlayBook', value: 'PlayBook', version: 'OS' },
            { name: 'BlackBerry', value: 'BlackBerry', version: '/' },
            { name: 'Macintosh', value: 'Mac', version: 'OS X' },
            { name: 'Linux', value: 'Linux', version: 'rv' },
            { name: 'Palm', value: 'Palm', version: 'PalmOS' }
        ],
        databrowser: [
            { name: 'Chrome', value: 'Chrome', version: 'Chrome' },
            { name: 'Firefox', value: 'Firefox', version: 'Firefox' },
            { name: 'Safari', value: 'Safari', version: 'Version' },
            { name: 'Internet Explorer', value: 'MSIE', version: 'MSIE' },
            { name: 'Opera', value: 'Opera', version: 'Opera' },
            { name: 'BlackBerry', value: 'CLDC', version: 'CLDC' },
            { name: 'Mozilla', value: 'Mozilla', version: 'Mozilla' }
        ],
        init: function () {
            var agent = this.header.join(' '),
                os = this.matchItem(agent, this.dataos),
                browser = this.matchItem(agent, this.databrowser);

            return { os: os, browser: browser };
        },
        matchItem: function (string, data) {
            var i = 0,
                j = 0,
                html = '',
                regex,
                regexv,
                match,
                matches,
                version;

            for (i = 0; i < data.length; i += 1) {
                regex = new RegExp(data[i].value, 'i');
                match = regex.test(string);
                if (match) {
                    regexv = new RegExp(data[i].version + '[- /:;]([\\d._]+)', 'i');
                    matches = string.match(regexv);
                    version = '';
                    if (matches) { if (matches[1]) { matches = matches[1]; } }
                    if (matches) {
                        matches = matches.split(/[._]+/);
                        for (j = 0; j < matches.length; j += 1) {
                            if (j === 0) {
                                version += matches[j] + '.';
                            } else {
                                version += matches[j];
                            }
                        }
                    } else {
                        version = '0';
                    }
                    return {
                        name: data[i].name,
                        version: parseFloat(version)
                    };
                }
            }
            return { name: 'unknown', version: 0 };
        }
    };

    var e = module.init(),
        debug = '';

    debug += 'os.name = ' + e.os.name + '<br/>';
    debug += 'os.version = ' + e.os.version + '<br/>';
    debug += 'browser.name = ' + e.browser.name + '<br/>';
    debug += 'browser.version = ' + e.browser.version + '<br/>';

    debug += '<br/>';
    debug += 'navigator.userAgent = ' + navigator.userAgent + '<br/>';
    debug += 'navigator.appVersion = ' + navigator.appVersion + '<br/>';
    debug += 'navigator.platform = ' + navigator.platform + '<br/>';
    debug += 'navigator.vendor = ' + navigator.vendor + '<br/>';

    document.getElementById('log').innerHTML = debug;
}());
let forwardTimes = [];
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
            targetTraining.stopTargetTraining();
        } else if (event.key === 'f') {
            targetTraining.runTargetTraining('circle');
        } else if (event.key === 'p') {
            useTrainedModel('model');
        } else if (event.key === 'o') {
            useTrainedModel('model2');
        }
    });



    $('#train').click(function() {
        training.fitModel();
    });
}


function moveTarget() {
    if (training.currentModel == null) {
        return;
    }
    tf.tidy(function() {
        const metaInfos = dataset.getMetaInfos();
        var prediction = null;

        if (training.useMetaData) {
            const image = dataset.getImage();

            prediction = training.currentModel.predict([image,metaInfos]);
        } else if (training.useTwoEyes) {
            const images = dataset.getImages();
            prediction = training.currentModel.predict([images[0], images[1], metaInfos]);


        } else if (training.useTwoEyesAndFace) {
            const images = dataset.getImages();
            prediction = training.currentModel.predict([images[0], images[1], images[2]]);


        } else if (training.useEyesFaceFacePos) {
            const images = dataset.getAllInputs();
            prediction = training.currentModel.predict([images[0], images[1], images[2], images[3]]);


        } else {
            const image = dataset.getImage();

            prediction = training.currentModel.predict(image);
        }


        // Convert normalized position back to screen position:
        const target = $('#target');
        const targetWidth = target.outerWidth();
        const targetHeight = target.outerHeight();
        console.log(prediction.get(0,0), prediction.get(0,1));
        const xx = Math.min(((prediction.get(0, 0) + 1) / 2), 1);
        const yy = Math.min(((prediction.get(0, 1) + 1) / 2), 1);

        const x = xx * ($(window).width() - targetWidth);
        const y = yy * ($(window).height() - targetHeight);

        // Move target there:
        target.css('left', x + 'px');
        target.css('top', y + 'px');

        heatmap.addData({ x: x, y: y, value: 0.1     })
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

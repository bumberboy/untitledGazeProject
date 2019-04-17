let forwardTimes = [];
let cmPerPixel = 0.023347; // for 27inch iMAC;
// let cmPerPixel = 0.01966; // for 15inch MBP;

var model1 = new Model1('1');
// var model2 = new Model1('2');

// var eyesRect = null;
function updateTimeStats(timeInMs) {
    // For displaying inference time
    forwardTimes = [timeInMs].concat(forwardTimes).slice(0, 30);
    const avgTimeInMs = forwardTimes.reduce((total, t) => total + t) / forwardTimes.length;
    $('#time').val(`${Math.round(avgTimeInMs)} ms`);
    $('#fps').text(`${faceapi.round(1000 / avgTimeInMs)}`)
}

currentLandmarks = null;

async function onPlay() {
    const videoEl = $('#inputVideo').get(0);

    if(videoEl.paused || videoEl.ended || !isFaceDetectionModelLoaded())
        return setTimeout(() => onPlay());

    const inputSize = 256;
    const scoreThreshold = 0.5;
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold });
    const ts = Date.now();
    const result = await faceapi.detectSingleFace(videoEl, options).withFaceLandmarks();


    updateTimeStats(Date.now() - ts);

    if (result) {
        if ('landmarks' in result) {

            ui.onFoundFace();
            const rotationAngle = getEyeRotation(result.landmarks);
            // displayEyesRotated(rotationAngle,eyesRect);

            currentLandmarks = result.landmarks;

            const leftEyeRect = getLeftEyeRect(result.landmarks);
            const rightEyeRect = getRightEyeRect(result.landmarks);
            const bothEyesRect = getEyesRect(result.landmarks);

            displayEyesSeparately(leftEyeRect, rightEyeRect);
            displayEyes(bothEyesRect);


        }
        if ('detection' in result) {
            displayFace(result.detection.box);
            displayMask(result.detection.box);
        }
        if (shouldDrawLandmarks) {
            drawLandmarks(videoEl, $('#landmarksCanvas').get(0), [result], true);
        }
    }

    setTimeout(() => onPlay())

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
    ui.onWebcamEnabled();
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

// async function useTrainedModel(modelName) {
//     console.log(tf.version);
//     const model = await tf.loadModel('/untitledGazeProject/'+modelName+'.json');
//     training.currentModel = model
// }



var camViewIsHidden = true;
var targetHeatMapIsHidden = false;
var predictions = [];
var shouldDrawLandmarks = false;
var panelIsHidden = false;

function moveTargets() {
    if (model1.isTrained) {
        model1.moveTarget();
    }
    // if (model2.isTrained) {
    //     model2.moveTarget();
    // }

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
    setInterval(moveTargets, 100);

    drawHeatmap();


});

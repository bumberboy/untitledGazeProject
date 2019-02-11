let forwardTimes = [];
// var eyesRect = null;
function updateTimeStats(timeInMs) {
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
            // eyesRect = getEyesRect(result.landmarks);
            rotationAngle = getEyeRotation(result.landmarks);
            // displayEyesRotated(rotationAngle,eyesRect);

            currentLandmarks = result.landmarks;

            leftEyeRect = getLeftEyeRect(result.landmarks);
            rightEyeRect = getRightEyeRect(result.landmarks);
            displayEyes(leftEyeRect, rightEyeRect);


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


function getRotationAngle(landmarks) {
    var jawOutline = landmarks.getJawOutline();
    var p1=jawOutline[0];
    var p2=jawOutline[16];
    return angleBetweenTwoPoints(p1,p2);

}

function getEyeRotation(landmarks) {
    var leftEye = landmarks.getLeftEye();

    return  angleBetweenTwoPoints(leftEye[0],leftEye[3]);
}

// function getEyesRect(landmarks) {
//     var leftEye = landmarks.getLeftEye();
//     var rightEye = landmarks.getRightEye();
//
//     const minX = Math.min(leftEye[0].x, leftEye[1].x, leftEye[2].x, leftEye[3].x, leftEye[4].x, leftEye[5].x) - 10;
//     const maxX = Math.max(leftEye[0].x, leftEye[1].x, leftEye[2].x, leftEye[3].x, leftEye[4].x, leftEye[5].x) + 10;
//     const minY = Math.min(leftEye[0].y, leftEye[1].y, leftEye[2].y, leftEye[3].y, leftEye[4].y, leftEye[5].y) - 3;
//     const maxY = Math.max(leftEye[0].y, leftEye[1].y, leftEye[2].y, leftEye[3].y, leftEye[4].y, leftEye[5].y) + 3;
//     // const minX = Math.min(leftEye[0].x, leftEye[1].x, leftEye[2].x, leftEye[3].x, leftEye[4].x, leftEye[5].x,
//     //     rightEye[0].x, rightEye[1].x, rightEye[2].x, rightEye[3].x, rightEye[4].x, rightEye[5].x) - 5;
//     // const maxX = Math.max(leftEye[0].x, leftEye[1].x, leftEye[2].x, leftEye[3].x, leftEye[4].x, leftEye[5].x,
//     //     rightEye[0].x, rightEye[1].x, rightEye[2].x, rightEye[3].x, rightEye[4].x, rightEye[5].x) + 5;
//     // const minY = Math.min(leftEye[0].y, leftEye[1].y, leftEye[2].y, leftEye[3].y, leftEye[4].y, leftEye[5].y,
//     //     rightEye[0].y, rightEye[1].y, rightEye[2].y, rightEye[3].y, rightEye[4].y, rightEye[5].y) - 5;
//     // const maxY = Math.max(leftEye[0].y, leftEye[1].y, leftEye[2].y, leftEye[3].y, leftEye[4].y, leftEye[5].y,
//     //     rightEye[0].y, rightEye[1].y, rightEye[2].y, rightEye[3].y, rightEye[4].y, rightEye[5].y) + 5;
//     const width = maxX - minX;
//     const height = maxY - minY;
//     return [minX, minY, width, height * 1.25];
//
// }

function getLeftEyeRect(landmarks) {
    var leftEye = landmarks.getLeftEye();

    const minX = Math.min(leftEye[0].x, leftEye[1].x, leftEye[2].x, leftEye[3].x, leftEye[4].x, leftEye[5].x) - 10;
    const maxX = Math.max(leftEye[0].x, leftEye[1].x, leftEye[2].x, leftEye[3].x, leftEye[4].x, leftEye[5].x) + 10;
    const minY = Math.min(leftEye[0].y, leftEye[1].y, leftEye[2].y, leftEye[3].y, leftEye[4].y, leftEye[5].y) - 3;
    const maxY = Math.max(leftEye[0].y, leftEye[1].y, leftEye[2].y, leftEye[3].y, leftEye[4].y, leftEye[5].y) + 3;

    const width = maxX - minX;
    const height = maxY - minY;
    return [minX, minY, width, height * 1.25];

}

function getRightEyeRect(landmarks) {
    var rightEye = landmarks.getRightEye();

    const minX = Math.min(rightEye[0].x, rightEye[1].x, rightEye[2].x, rightEye[3].x, rightEye[4].x, rightEye[5].x) - 10;
    const maxX = Math.max(rightEye[0].x, rightEye[1].x, rightEye[2].x, rightEye[3].x, rightEye[4].x, rightEye[5].x) + 10;
    const minY = Math.min(rightEye[0].y, rightEye[1].y, rightEye[2].y, rightEye[3].y, rightEye[4].y, rightEye[5].y) - 3;
    const maxY = Math.max(rightEye[0].y, rightEye[1].y, rightEye[2].y, rightEye[3].y, rightEye[4].y, rightEye[5].y) + 3;
    const width = maxX - minX;
    const height = maxY - minY;
    return [minX, minY, width, height * 1.25];

}


async function run() {
    //load face detection model
    const MODEL_URL = '/untitledGazeProject';
    await faceapi.loadTinyFaceDetectorModel(MODEL_URL);
    await faceapi.loadFaceLandmarkTinyModel(MODEL_URL);
    await faceapi.loadFaceLandmarkModel(MODEL_URL);
    await changeFaceDetector(TINY_FACE_DETECTOR);
    changeInputSize(224);


    //access user's webcam and stream feed to the video element
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    const videoEl = $('#inputVideo').get(0);
    videoEl.srcObject = stream
}



function getImage() {
    // Capture the current image in the eyes canvas as a tensor.
    return tf.tidy(function() {
        const image = tf.fromPixels(document.getElementById('eyes'));
        // Add a batch dimension:
        const batchedImage = image.expandDims(0);
        // Normalize and return it:
        return batchedImage.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
    });
}

function addToDataset(image, metaInfo, target, key) {
    const set = dataset[key];
    if (set.x == null) {
        set.x = [tf.keep(image), tf.keep(metaInfos)];
        set.y = tf.keep(target);
    } else {
        const oldImage = set.x[0];
        console.log(oldImage);
        console.log(set);

        set.x[0] = tf.keep(oldImage.concat(image, 0));

        const oldEyePos = set.x[1];
        set.x[1] = tf.keep(oldEyePos.concat(metaInfos, 0));

        const oldY = set.y;
        set.y = tf.keep(oldY.concat(target, 0));

        oldImage.dispose();
        oldEyePos.dispose();
        oldY.dispose();
        target.dispose();
    }

    set.n += 1;

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

function addExample(image, metaInfo, target) {
    // Given an image, eye pos and target coordinates, adds them to our dataset.

    target[0] = target[0] - 0.5;
    target[1] = target[1] = 0.5;
    target = tf.tidy(function() {
        return tf.tensor1d(target).expandDims(0);
    });

    const key = Math.random() > 0.2 ? 'train' : 'val';

    image = convertImage(image);

    addToDataset(image, metaInfo, target, key);
}

function getMetaInfo() {
    // Get some meta info about the rectangle as a tensor:
    // - middle x, y of the eye rectangle, relative to video size TODO
    // - size of eye rectangle, relative to video size TODO
    // - angle of rectangle (TODO)

    return tf.tidy(function() {
        return tf.tensor1d([x, y, rectWidth, rectHeight]).expandDims(0);
    });
}
function captureExample() {

    tf.tidy(function() {
        const img = getImage();
        const mousePos = mouse.getMousePos();
        const metaInfo = getMetaInfo();
        addExample(img, metaInfo, mousePos);
    });

    // console.log('Example captured.');
    // // Take the latest image from the eyes canvas and add it to our dataset.
    // tf.tidy(function() {
    //     const image = getImage();
    //     image.print(true);
    //     const mousePos = tf.tensor1d([mouse.x, mouse.y]).expandDims(0);
    //     // Choose whether to add it to training (80%) or validation (20%) set:
    //     const subset = dataset[Math.random() > 0.2 ? 'train' : 'val'];
    //
    //     if (subset.x == null) {
    //         // Create new tensors
    //         subset.x = tf.keep(image);
    //         subset.y = tf.keep(mousePos);
    //     } else {
    //         // Concatenate it to existing tensors
    //         const oldX = subset.x;
    //         const oldY = subset.y;
    //
    //         subset.x = tf.keep(oldX.concat(image, 0));
    //         subset.y = tf.keep(oldY.concat(mousePos, 0));
    //     }
    //
    //     // Increase counter
    //     subset.n += 1;
    // });
}

function setupKeys() {
    $('body').keyup(function(event) {
        // On space key:
        if (event.keyCode == 32) {
            captureExample();

            event.preventDefault();
            return false;
        }
    });

    $('#train').click(function() {
        fitModel();
    });
}


function moveTarget() {
    if (currentModel == null) {
        return;
    }
    tf.tidy(function() {
        const image = getImage();
        const prediction = currentModel.predict(image);

        // Convert normalized position back to screen position:
        const target = $('#target');
        const targetWidth = target.outerWidth();
        const targetHeight = target.outerHeight();
        const x = (prediction.get(0, 0) + 1) / 2 * ($(window).width() - targetWidth);
        const y = (prediction.get(0, 1) + 1) / 2 * ($(window).height() - targetHeight);

        // Move target there:
        target.css('left', x + 'px');
        target.css('top', y + 'px');
    });
}

$(document).ready(function() {

    run();
    setupKeys();
    setInterval(moveTarget, 100);

    const ctx = $("#overlay").getContext('2d')
    ctx.scale(-1,1)




});

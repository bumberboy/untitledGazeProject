function resizeCanvasAndResults(dimensions, canvas, results) {
    const { width, height } = dimensions instanceof HTMLVideoElement
        ? faceapi.getMediaDimensions(dimensions)
        : dimensions
    canvas.width = width
    canvas.height = height

    // resize detections (and landmarks) in case displayed image is smaller than
    // original size
    return faceapi.resizeResults(results, { width, height })
}

function drawDetections(dimensions, canvas, detections) {
    const resizedDetections = resizeCanvasAndResults(dimensions, canvas, detections)
    faceapi.drawDetection(canvas, resizedDetections)
}

function drawLandmarks(dimensions, canvas, results, withBoxes = true) {
    const resizedResults = resizeCanvasAndResults(dimensions, canvas, results)

    if (withBoxes) {
        faceapi.drawDetection(canvas, resizedResults.map(det => det.detection))
    }

    const faceLandmarks = resizedResults.map(det => det.landmarks)
    const drawLandmarksOptions = {
        lineWidth: 2,
        drawLines: true,
        color: 'green'
    }
    faceapi.drawLandmarks(canvas, faceLandmarks, drawLandmarksOptions)
}

function drawExpressions(dimensions, canvas, results, thresh, withBoxes = true) {
    const resizedResults = resizeCanvasAndResults(dimensions, canvas, results)

    if (withBoxes) {
        faceapi.drawDetection(canvas, resizedResults.map(det => det.detection), { withScore: false })
    }

    faceapi.drawFaceExpressions(canvas, resizedResults.map(({ detection, expressions }) => ({ position: detection.box, expressions })))
}

function displayEyes(leftEye, rightEye) {
    const eyesCanvas = $('#eyes').get(0);
    const eyesCanvasContext = eyesCanvas.getContext('2d');
    const video = $('#inputVideo').get(0);
    eyesCanvasContext.drawImage(video, leftEye[0], leftEye[1], leftEye[2], leftEye[3], 0, 0, eyesCanvas.height/2, eyesCanvas.width);
    eyesCanvasContext.drawImage(video, rightEye[0], rightEye[1], rightEye[2], rightEye[3], 0, eyesCanvas.height/2, eyesCanvas.height/2, eyesCanvas.width);


}

function displayEyesRotated(rotationAngle, eyesRect) {
    const eyesCanvas = $('canvas#eyesRotated').get(0);
    const eyesCanvasContext = eyesCanvas.getContext('2d');
    const video = $('#inputVideo').get(0);
    const sideLength = Math.sqrt(Math.pow(eyesCanvas.height,2)/2)*2;

    eyesCanvasContext.clearRect(0, 0, eyesCanvas.width, eyesCanvas.height);
    eyesCanvasContext.translate(eyesCanvas.height/2,eyesCanvas.height/2);

    eyesCanvasContext.rotate(-rotationAngle*Math.PI/180);
    eyesCanvasContext.translate(-eyesCanvas.height/2,-eyesCanvas.height/2);


    const growthRatio = sideLength/eyesCanvas.height;
    eyesCanvasContext.drawImage(video, eyesRect[0], eyesRect[1], eyesRect[2], eyesRect[3],
        0,0, eyesCanvas.height, eyesCanvas.height);

    eyesCanvasContext.translate(eyesCanvas.height/2,eyesCanvas.height/2);

    eyesCanvasContext.rotate(rotationAngle*Math.PI/180)
    eyesCanvasContext.translate(-eyesCanvas.height/2,-eyesCanvas.height/2);

}

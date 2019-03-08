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
        // console.log(resizedResults.map(det => det.detection)[0].box)
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



function displayFace(faceBox) {
    const faceCanvas = $('#face').get(0);
    const faceCanvasContext = faceCanvas.getContext('2d');
    const video = $('#inputVideo').get(0);
    faceCanvasContext.drawImage(video, faceBox.x, faceBox.y, faceBox.width, faceBox.height,0,0, faceCanvas.width, faceCanvas.height);

}
function displayMask(faceBox) {
    const maskCanvas = $('#mask').get(0);
    const faceCanvasContext = maskCanvas.getContext('2d');
    // const video = $('#inputVideo').get(0);
    // faceCanvasContext.drawImage(video, 0, 0, 640, 480,0,0,maskCanvas.width , maskCanvas.height);
    const xRatio = maskCanvas.width/640;
    const yRatio = maskCanvas.height/480;
    faceCanvasContext.clearRect(0 ,0 , maskCanvas.width, maskCanvas.height);
    faceCanvasContext.fillStyle = '#FFFFFF';
    faceCanvasContext.fillRect(0 ,0 , maskCanvas.width, maskCanvas.height);
    faceCanvasContext.fillStyle = '#000000';
    faceCanvasContext.fillRect(faceBox.x*xRatio, faceBox.y*yRatio, faceBox.width*xRatio, faceBox.height*yRatio);

}

// function displayEye(eyes) {
//     const eyesCanvas = $('#eyes').get(0);
//     const eyesCanvasContext = eyesCanvas.getContext('2d');
//     const video = $('#inputVideo').get(0);
//     eyesCanvasContext.drawImage(video, eyes[0], eyes[1], eyes[2], eyes[3], 0, 0, eyesCanvas.width, eyesCanvas.height);
// }

function displayEyes(leftEye, rightEye) {
    const leftEyeCanvas = $('#leftEye').get(0);
    const leftEyeCanvasContext = leftEyeCanvas.getContext('2d');
    const rightEyeCanvas = $('#rightEye').get(0);
    const rightEyeCanvasContext = rightEyeCanvas.getContext('2d');
    const video = $('#inputVideo').get(0);

    leftEyeCanvasContext.drawImage(video, leftEye[0], leftEye[1], leftEye[2], leftEye[3], 0, 0, leftEyeCanvas.width, leftEyeCanvas.height);
    rightEyeCanvasContext.drawImage(video, rightEye[0], rightEye[1], rightEye[2], rightEye[3], 0, 0, rightEyeCanvas.width, rightEyeCanvas.height);
    // rightEyeCanvasContext.drawImage(leftEyeCanvas, 0, 0);
    // grayscale(leftEyeCanvas, leftEyeCanvas);
    // grayscale(rightEyeCanvas, rightEyeCanvas);

}


// var biggestGray = 0;
// var smallestGray = 400;

// function grayscale (input,output) {
//     //Get the context for the loaded image
//     var inputContext = input.getContext("2d");
//     //get the image data;
//     var imageData = inputContext.getImageData(0, 0, input.width, input.height);
//     //Get the CanvasPixelArray
//     var data = imageData.data;
//
//     //Get length of all pixels in image each pixel made up of 4 elements for each pixel, one for Red, Green, Blue and Alpha
//     var arraylength = input.width * input.height * 4;
//     //Go through each pixel from bottom right to top left and alter to its gray equiv
//
//     //Common formula for converting to grayscale.
//     //gray = 0.3*R + 0.59*G + 0.11*B
//
//     for (var i=arraylength-1; i>0;i-=4)
//     {
//         //R= i-3, G = i-2 and B = i-1
//         //Get our gray shade using the formula
//         var gray = 0.3 * data[i-3] + 0.59 * data[i-2] + 0.11 * data[i-1];
//
//         // // Store gray values so that we can increase contrast
//         if (gray > biggestGray) {biggestGray = gray};
//         if (gray < smallestGray) { smallestGray = gray};
//
//         const midGray = (biggestGray - smallestGray)/2 + smallestGray - 30;
//         if (gray > midGray) { gray = gray + 10 }
//         else { gray = gray - 10};
//
//         //Set our 3 RGB channels to the computed gray.
//         data[i-3] = gray + 40;
//         data[i-2] = gray + 40;
//         data[i-1] = gray + 40;
//
//     }
//
//
//     //get the output context
//     var outputContext = output.getContext("2d");
//
//     //Display the output image
//     outputContext.putImageData(imageData, 0, 0);
// }

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

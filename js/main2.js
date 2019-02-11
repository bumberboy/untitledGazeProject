// async function run() {
//     //load face detection model
//     const MODEL_URL = '/untitledGazeProject';
//     await faceapi.loadTinyFaceDetectorModel(MODEL_URL);
//     await faceapi.loadFaceLandmarkTinyModel(MODEL_URL);
//     await faceapi.loadFaceLandmarkModel(MODEL_URL);
//     changeFaceDetector(TINY_FACE_DETECTOR);
//     changeInputSize(224);
//
//
//     //access user's webcam and stream feed to the video element
//     navigator.mediaDevices.getUserMedia({ video: true }).then(onStreaming);
// }
//
// function onStreaming(stream) {
//     const videoEl = $('#inputVideo').get(0);
//     videoEl.srcObject = stream;
//     trackingLoop();
// }
// async function trackingLoop() {
//     requestAnimationFrame(trackingLoop);
//     const videoEl = $('#inputVideo').get(0);
//
//     const inputSize = 128;
//     const scoreThreshold = 0.5;
//     const options = new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold });
//     const ts = Date.now();
//     const result = await faceapi.detectSingleFace(videoEl, options).withFaceLandmarks();
//
//
//
//     if (result) {
//         if ('landmarks' in result) {
//             eyesRect = getEyesRect(result.landmarks);
//             displayEyes(eyesRect);
//
//         }
//         drawLandmarks(videoEl, $('#overlay').get(0), [result], false)
//     }
//
// }
//
// function getImage() {
//     // Capture the current image in the eyes canvas as a tensor.
//     return tf.tidy(function() {
//         const image = tf.fromPixels(document.getElementById('eyes'));
//         // Add a batch dimension:
//         const batchedImage = image.expandDims(0);
//         // Normalize and return it:
//         return batchedImage.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
//     });
// }
//
// let currentModel;
//
// const dataset = {
//     train: {
//         n: 0,
//         x: null,
//         y: null,
//     },
//     val: {
//         n: 0,
//         x: null,
//         y: null,
//     },
// }
//
//
// // Track mouse movement:
// const mouse = {
//     x: 0,
//     y: 0,
//
//     handleMouseMove: function(event) {
//         // Get the mouse position and normalize it to [-1, 1]
//         mouse.x = (event.clientX / $(window).width()) * 2 - 1;
//         mouse.y = (event.clientY / $(window).height()) * 2 - 1;
//     },
// }
//
// document.onmousemove = mouse.handleMouseMove;
//
// function captureExample() {
//     console.log('Example captured.')
//     // Take the latest image from the eyes canvas and add it to our dataset.
//     tf.tidy(function() {
//         const image = getImage();
//         console.log(image);
//         const mousePos = tf.tensor1d([mouse.x, mouse.y]).expandDims(0);
//
//         // Choose whether to add it to training (80%) or validation (20%) set:
//         const subset = dataset[Math.random() > 0.2 ? 'train' : 'val'];
//
//         if (subset.x == null) {
//             // Create new tensors
//             subset.x = tf.keep(image);
//             subset.y = tf.keep(mousePos);
//         } else {
//             // Concatenate it to existing tensors
//             const oldX = subset.x;
//             const oldY = subset.y;
//
//             subset.x = tf.keep(oldX.concat(image, 0));
//             subset.y = tf.keep(oldY.concat(mousePos, 0));
//         }
//
//         // Increase counter
//         subset.n += 1;
//     });
// }
//
// function fitModel() {
//     console.log('Attempting to fit model...');
//     let batchSize = Math.floor(dataset.train.n * 0.1);
//     if (batchSize < 4) {
//         batchSize = 4;
//     } else if (batchSize > 64) {
//         batchSize = 64;
//     }
//
//     if (currentModel == null) {
//         console.log('No current model... create Model.');
//         currentModel = createModel();
//         console.log('Model created.')
//     }
//
//     console.log('Fitting to model.')
//     console.log(dataset)
//     console.log(currentModel);
//     currentModel.fit(dataset.train.x, dataset.train.y, {
//         batchSize: batchSize,
//         epochs: 20,
//         shuffle: true,
//         validationData: [dataset.val.x, dataset.val.y],
//     });
//     setTimeout(()=>{
//         console.log(currentModel);
//     });
// }
//
//
// function getEyesRect(landmarks) {
//     var leftEye = landmarks.getLeftEye();
//     var rightEye = landmarks.getRightEye();
//     const minX = Math.min(leftEye[0].x, leftEye[1].x, leftEye[2].x, leftEye[3].x, leftEye[4].x, leftEye[5].x,
//         rightEye[0].x, rightEye[1].x, rightEye[2].x, rightEye[3].x, rightEye[4].x, rightEye[5].x) - 5;
//     const maxX = Math.max(leftEye[0].x, leftEye[1].x, leftEye[2].x, leftEye[3].x, leftEye[4].x, leftEye[5].x,
//         rightEye[0].x, rightEye[1].x, rightEye[2].x, rightEye[3].x, rightEye[4].x, rightEye[5].x) + 5;
//     const minY = Math.min(leftEye[0].y, leftEye[1].y, leftEye[2].y, leftEye[3].y, leftEye[4].y, leftEye[5].y,
//         rightEye[0].y, rightEye[1].y, rightEye[2].y, rightEye[3].y, rightEye[4].y, rightEye[5].y) - 5;
//     const maxY = Math.max(leftEye[0].y, leftEye[1].y, leftEye[2].y, leftEye[3].y, leftEye[4].y, leftEye[5].y,
//         rightEye[0].y, rightEye[1].y, rightEye[2].y, rightEye[3].y, rightEye[4].y, rightEye[5].y) + 5;
//     const width = maxX - minX;
//     const height = maxY - minY;
//     return [minX, minY, width, height * 1.25];
//
// }
//
//
// function createModel() {
//     const model = tf.sequential();
//
//     model.add(tf.layers.conv2d({
//         kernelSize: 5,
//         filters: 20,
//         strides: 1,
//         activation: 'relu',
//         inputShape: [$('#eyes').height(), $('#eyes').width(), 3],
//     }));
//
//     model.add(tf.layers.maxPooling2d({
//         poolSize: [2, 2],
//         strides: [2, 2],
//     }));
//
//     model.add(tf.layers.flatten());
//
//     model.add(tf.layers.dropout(0.2));
//
//     // Two output values x and y
//     model.add(tf.layers.dense({
//         units: 2,
//         activation: 'tanh',
//     }));
//
//     // Use ADAM optimizer with learning rate of 0.0005 and MSE loss
//     model.compile({
//         optimizer: tf.train.adam(0.0005),
//         loss: 'meanSquaredError',
//     });
//
//     return model;
// }
//
// function setupKeys() {
//     $('body').keyup(function(event) {
//         // On space key:
//         if (event.keyCode == 32) {
//             captureExample();
//
//             event.preventDefault();
//             return false;
//         }
//     });
//
//     $('#train').click(function() {
//         fitModel();
//     });
// }
//
// function moveTarget() {
//     if (currentModel == null) {
//         return;
//     }
//     tf.tidy(function() {
//         const image = getImage();
//         console.log('2');
//         const prediction = currentModel.predict(image);
//         console.log('1');
//
//         // Convert normalized position back to screen position:
//         const targetWidth = $('#target').outerWidth();
//         const targetHeight = $('#target').outerHeight();
//         const x = (prediction.get(0, 0) + 1) / 2 * ($(window).width() - targetWidth);
//         const y = (prediction.get(0, 1) + 1) / 2 * ($(window).height() - targetHeight);
//
//         // Move target there:
//         const $target = $('#target');
//         $target.css('left', x + 'px');
//         $target.css('top', y + 'px');
//     });
// }
//
// $(document).ready(function() {
//
//
//     run();
//     setupKeys();
//     setInterval(moveTarget, 100);
//
//
//
// })

window.dataset = {
    eyeCanvasWidth: 30,
    eyeCanvasHeight: 30,
    eyesCanvasWidth: 60,
    eyesCanvasHeight: 30,
    faceCanvasWidth: 40,
    faceCanvasHeight: 40,
    faceGrid: {width: 15, height: 15},
    train: {
        n: 0,
        x: null,
        y: null,
    },
    val: {
        n: 0,
        x: null,
        y: null,
    },

    getEyes: function() {
        // Capture the current image in the eyes canvas as a tensor.
        return tf.tidy(function() {
            const image = tf.fromPixels(document.getElementById('eyes'));

            // Add a batch dimension:
            const batchedImage = image.expandDims(0);
            // Normalize and return it:
            return [batchedImage.toFloat().div(tf.scalar(127)).sub(tf.scalar(1))];
        });
    },

    getEyesFace: function() {
        // Capture the current image in the eyes canvas as a tensor.
        return tf.tidy(function() {
            const imageA = tf.fromPixels(document.getElementById('eyes'));
            const imageB = tf.fromPixels(document.getElementById('face'));

            // Add a batch dimension:
            const batchedImageA = imageA.expandDims(0);
            const batchedImageB = imageB.expandDims(0);


            // Normalize and return it:
            return [batchedImageA.toFloat().div(tf.scalar(127)).sub(tf.scalar(1)),
                batchedImageB.toFloat().div(tf.scalar(127)).sub(tf.scalar(1))]
        });
    },

    getLeftRightFace: function() {
        // Capture the current image in the eyes canvas as a tensor.
        return tf.tidy(function() {
            const imageA = tf.fromPixels(document.getElementById('leftEye'));
            const imageB = tf.fromPixels(document.getElementById('rightEye'));
            const imageC = tf.fromPixels(document.getElementById('face'));

            // Add a batch dimension:
            const batchedImageA = imageA.expandDims(0);
            const batchedImageB = imageB.expandDims(0);
            const batchedImageC = imageC.expandDims(0);


            // Normalize and return it:
            return [batchedImageA.toFloat().div(tf.scalar(127)).sub(tf.scalar(1)),
                batchedImageB.toFloat().div(tf.scalar(127)).sub(tf.scalar(1)),
                batchedImageC.toFloat().div(tf.scalar(127)).sub(tf.scalar(1))];
        });
    },
    getLeftRightFaceGrid: function() {

        return tf.tidy(function() {

            const imageB = tf.fromPixels(document.getElementById('leftEye'));
            const imageC = tf.fromPixels(document.getElementById('rightEye'));
            const imageD = tf.fromPixels(document.getElementById('face'));
            const imageE = tf.fromPixels(document.getElementById('mask'));


            // Add a batch dimension:
            const batchedImageB = imageB.expandDims(0);
            const batchedImageC = imageC.expandDims(0);
            const batchedImageD = imageD.expandDims(0);
            const batchedImageE = imageE.expandDims(0);


            // Normalize and return it:
            return [
                batchedImageB.toFloat().div(tf.scalar(127)).sub(tf.scalar(1)),
                batchedImageC.toFloat().div(tf.scalar(127)).sub(tf.scalar(1)),
                batchedImageD.toFloat().div(tf.scalar(127)).sub(tf.scalar(1)),
                batchedImageE.toFloat().div(tf.scalar(127)).sub(tf.scalar(1))
            ];
        });
    },

    getAllInputs: function() {

        return tf.tidy(function() {

            const imageA = tf.fromPixels(document.getElementById('eyes'));
            const imageB = tf.fromPixels(document.getElementById('leftEye'));
            const imageC = tf.fromPixels(document.getElementById('rightEye'));
            const imageD = tf.fromPixels(document.getElementById('face'));
            const imageE = tf.fromPixels(document.getElementById('mask'));


            // Add a batch dimension:
            const batchedImageA = imageA.expandDims(0);
            const batchedImageB = imageB.expandDims(0);
            const batchedImageC = imageC.expandDims(0);
            const batchedImageD = imageD.expandDims(0);
            const batchedImageE = imageE.expandDims(0);


            // Normalize and return it:
            return [batchedImageA.toFloat().div(tf.scalar(127)).sub(tf.scalar(1)),
                    batchedImageB.toFloat().div(tf.scalar(127)).sub(tf.scalar(1)),
                    batchedImageC.toFloat().div(tf.scalar(127)).sub(tf.scalar(1)),
                    batchedImageD.toFloat().div(tf.scalar(127)).sub(tf.scalar(1)),
                    batchedImageE.toFloat().div(tf.scalar(127)).sub(tf.scalar(1))
                    ];
        });
    },


    getMetaInfos: function(mirror) {
        // Get some meta info about the rectangle as a tensor:
        // - middle x, y of the eye rectangle, relative to video size
        // - size of eye rectangle, relative to video size
        // - angle of rectangle (TODO)
        const nose = currentLandmarks.getNose();
        const video = $('#inputVideo');
        let x = nose[0].x/video.width() * 2 - 1;
        let y = nose[0].y/video.height() * 2 - 1;

        const allPositions = currentLandmarks.positions;
        const allXs = allPositions.map(function(x) {return x.x});
        const allYs = allPositions.map(function(x) {return x.y});
        const rectWidth = (Math.max(...allXs) - Math.min(...allXs))/video.width();
        const rectHeight = (Math.max(...allYs) - Math.min(...allYs))/video.height();

        if (mirror) {
            x = 1 - x;
            y = 1 - y;
        }
        return tf.tidy(function() {

            return tf.tensor1d([x, y, rectWidth, rectHeight]).expandDims(0);
        });
    },

    whichDataset: function() {
        // Returns 'train' or 'val' depending on what makes sense / is random.
        if (dataset.train.n == 0) {
            return 'train';
        }
        if (dataset.val.n == 0) {
            return 'val';
        }
        return Math.random() < 0.2 ? 'val' : 'train';
    },
//
//     rgbToGrayscale(image, n, x, y) {
//         // Given an rgb tensor, returns a grayscale value.
//         // Inspired by http://journals.plos.org/plosone/article?id=10.1371/journal.pone.0029740
//         let r = (image.get(n, x, y, 0) + 1) / 2;
//         let g = (image.get(n, x, y, 1) + 1) / 2;
//         let b = (image.get(n, x, y, 2) + 1) / 2;
//
//         // Gamma correction:
//         const exponent = 1 / 2.2;
//         r = Math.pow(r, exponent);
//         g = Math.pow(g, exponent);
//         b = Math.pow(b, exponent);
//
//         // Gleam:
//         const gleam = (r + g + b) / 3;
//         return gleam * 2 - 1;
//     },
//
//     convertImage: function(image) {
//         // Convert to grayscale and add spatial info
//         const imageShape = image.shape;
//         const w = imageShape[1];
//         const h = imageShape[2];
//
//         const data = [new Array(w)];
//         for (let x = 0; x < w; x++) {
//             data[0][x] = new Array(h);
//
//             for (let y = 0; y < h; y++) {
//                 data[0][x][y] = [
//                     dataset.rgbToGrayscale(image, 0, x, y),
//                     (x / w) * 2 - 1,
//                     (y / h) * 2 - 1,
//                 ];
//             }
//         }
//
//         return tf.tensor(data);
//     },
//
    addToDataset: function(img, metaInfos, target, key) {
        // Add the given x, y to either 'train' or 'val'.
        const set = dataset[key];
        // console.log("Adding...: ", img, metaInfos);

        if (set.x == null) {
            set.x = [   tf.keep(img[0]), tf.keep(img[1]), tf.keep(img[2]),
                        tf.keep(img[3]), tf.keep(img[4]), tf.keep(metaInfos)];
            set.y = tf.keep(target);
        } else {

            const oldImageA = set.x[0];
            set.x[0] = tf.keep(oldImageA.concat(img[0], 0));

            const oldImageB = set.x[1];
            set.x[1] = tf.keep(oldImageB.concat(img[1], 0));

            const oldImageC = set.x[2];
            set.x[2] = tf.keep(oldImageC.concat(img[2], 0));

            const oldImageD = set.x[3];
            set.x[3] = tf.keep(oldImageD.concat(img[3], 0));

            const oldImageE = set.x[4];
            set.x[4] = tf.keep(oldImageE.concat(img[4], 0));

            const oldMeta = set.x[5];
            set.x[5] = tf.keep(oldMeta.concat(metaInfos, 0));


            oldMeta.dispose();
            oldImageA.dispose();
            oldImageB.dispose();
            oldImageC.dispose();
            oldImageD.dispose();
            oldImageE.dispose();


            const oldY = set.y;
            set.y = tf.keep(oldY.concat(target, 0));


            oldY.dispose();
            target.dispose();

        }

        set.n += 1;
    },

    // downloadExample: function(targetPosition) {
    //     const faceCanvas = $('#face').get(0);
    //     const leftEyeCanvas = $('#leftEye').get(0);
    //     const rightEyeCanvas = $('#rightEye').get(0);
    //     const maskCanvas = $('#mask').get(0);
    //
    //     dataset.counter += 1;
    //     saveAs(faceCanvas.toDataURL('image/jpeg'),"face"+dataset.counter+".jpg");
    //     saveAs(leftEyeCanvas.toDataURL('image/jpeg'),"leftEye"+dataset.counter+".jpg");
    //     saveAs(rightEyeCanvas.toDataURL('image/jpeg'),"rightEye"+dataset.counter+".jpg");
    //     saveAs(maskCanvas.toDataURL('image/jpeg'),"mask"+dataset.counter+".jpg");
    //     var blob = new Blob([targetPosition], {type: "text/plain;charset=utf-8"});
    //     saveAs(blob,"target"+dataset.counter+".txt");
    //     ui.setContent('n-downloaded', dataset.counter);
    //
    // },

    addExample: function(img, metaInfos, target) {
        // Given an image, eye pos and target coordinates, adds them to our dataset.
        target = tf.tidy(function() {
            return tf.tensor1d(target).expandDims(0);
        });
        const key = dataset.whichDataset();

        dataset.addToDataset(img, metaInfos, target, key);

        ui.onAddExample(dataset.train.n, dataset.val.n);
    },

    captureExample: function(targetPosition) {
        // Take the latest image from the eyes canvas and add it to our dataset along with the supposed gaze position.

        tf.tidy(function() {
            const metaInfos = dataset.getMetaInfos();
            const imgs = dataset.getAllInputs();

            dataset.addExample(imgs,metaInfos,targetPosition);

            // console.log("Gaze position captured:",targetPosition);

        });


    },

    toJSON: function() {
        const tensorToArray = function(t) {
            const typedArray = t.dataSync();
            return Array.prototype.slice.call(typedArray);
        };

        return {
            train: {
                shapes: {
                    x0: dataset.train.x[0].shape,
                    x1: dataset.train.x[1].shape,
                    x2: dataset.train.x[2].shape,
                    x3: dataset.train.x[3].shape,
                    x4: dataset.train.x[4].shape,
                    x5: dataset.train.x[5].shape,
                    y: dataset.train.y.shape,
                },
                n: dataset.train.n,
                x: dataset.train.x && [
                    tensorToArray(dataset.train.x[0]),
                    tensorToArray(dataset.train.x[1]),
                    tensorToArray(dataset.train.x[2]),
                    tensorToArray(dataset.train.x[3]),
                    tensorToArray(dataset.train.x[4]),
                    tensorToArray(dataset.train.x[5])
                ],
                y: tensorToArray(dataset.train.y),
            },
            val: {
                shapes: {
                    x0: dataset.val.x[0].shape,
                    x1: dataset.val.x[1].shape,
                    x2: dataset.val.x[2].shape,
                    x3: dataset.val.x[3].shape,
                    x4: dataset.val.x[4].shape,
                    x5: dataset.val.x[5].shape,
                    y: dataset.val.y.shape,
                },
                n: dataset.val.n,
                x: dataset.val.x && [
                    tensorToArray(dataset.val.x[0]),
                    tensorToArray(dataset.val.x[1]),
                    tensorToArray(dataset.val.x[2]),
                    tensorToArray(dataset.val.x[3]),
                    tensorToArray(dataset.val.x[4]),
                    tensorToArray(dataset.val.x[5]),
                ],
                y: tensorToArray(dataset.val.y),
            },
        };
    },

    fromJSON: function(data) {

        dataset.train.n = data.train.n;
        dataset.train.x = data.train.x && [
            tf.tensor(data.train.x[0], data.train.shapes.x0),
            tf.tensor(data.train.x[1], data.train.shapes.x1),
            tf.tensor(data.train.x[2], data.train.shapes.x2),
            tf.tensor(data.train.x[3], data.train.shapes.x3),
            tf.tensor(data.train.x[4], data.train.shapes.x4),
            tf.tensor(data.train.x[5], data.train.shapes.x5),
        ];
        dataset.train.y = tf.tensor(data.train.y, data.train.shapes.y);
        dataset.val.n = data.val.n;
        dataset.val.x = data.val.x && [
            tf.tensor(data.val.x[0], data.val.shapes.x0),
            tf.tensor(data.val.x[1], data.val.shapes.x1),
            tf.tensor(data.val.x[2], data.val.shapes.x2),
            tf.tensor(data.val.x[3], data.val.shapes.x3),
            tf.tensor(data.val.x[4], data.val.shapes.x4),
            tf.tensor(data.val.x[5], data.val.shapes.x5),
        ];
        dataset.val.y = tf.tensor(data.val.y, data.val.shapes.y);

        ui.onAddExample(dataset.train.n, dataset.val.n);
    },

};

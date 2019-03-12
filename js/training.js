window.training = {
    useMetaData: false,
    useTwoEyes: false,
    useOnlineModel: true,


    useTwoEyesAndFace: true,
    useEyesFaceFacePos: false,
    useMultipleModels: false,
    currentModel: null,
    currentModels:null,
    epochsTrained: 0,

    fitModel: function() {
        const epochs = 10;

        let batchSize = Math.floor(dataset.train.n * 0.1);
        if (batchSize < 4) {
            batchSize = 4;
        } else if (batchSize > 64) {
            batchSize = 64;
        }

        if (training.currentModel == null) {
            if (training.useMetaData) {
                training.currentModel = training.createModelWithMeta();

            } else if (training.useTwoEyes) {

            } else if (training.useTwoEyesAndFace) {
                console.log("Training 2 eyes and face model")
                training.currentModel = training.createModelBothEyesFace();

            } else if (training.useEyesFaceFacePos) {
                training.currentModel = training.createModelBothEyesFaceFacePos();

            } else {
                training.currentModel = training.createModel();

            }
        }


        let bestEpoch = -1;
        let bestTrainLoss = Number.MAX_SAFE_INTEGER;
        let bestValLoss = Number.MAX_SAFE_INTEGER;
        const bestModelPath = 'localstorage://best-model';


        training.currentModel.compile({
            optimizer: tf.train.sgd(0.1),

            // optimizer: tf.train.adam(0.0005),
            loss: 'meanSquaredError',
        });

        training.currentModel.fit(dataset.train.x, dataset.train.y, {
            batchSize: batchSize,
            epochs: epochs,
            shuffle: true,
            validationData: [dataset.val.x, dataset.val.y],
            callbacks: {
                onEpochEnd: async function(epoch, logs) {
                    console.info('Epoch', epoch, 'losses:', logs);
                    training.epochsTrained += 1;
                    ui.setContent('n-epochs', training.epochsTrained);
                    ui.setContent('train-loss', logs.loss.toFixed(5));
                    ui.setContent('val-loss', logs.val_loss.toFixed(5));

                    if (logs.val_loss < bestValLoss) {
                        // Save model
                        bestEpoch = epoch;
                        bestTrainLoss = logs.loss;
                        bestValLoss = logs.val_loss;

                        // Store best model:
                        await training.currentModel.save(bestModelPath);
                    }

                    return await tf.nextFrame();
                },
                onTrainEnd: async function() {
                    console.info('Finished training');

                    // Load best model:
                    training.epochsTrained -= epochs - bestEpoch;
                    console.info('Loading best epoch:', training.epochsTrained);
                    ui.setContent('n-epochs', training.epochsTrained);
                    ui.setContent('train-loss', bestTrainLoss.toFixed(5));
                    ui.setContent('val-loss', bestValLoss.toFixed(5));

                    training.currentModel = await tf.loadModel(bestModelPath);

                    // $('#start-training').prop('disabled', false);
                    // $('#start-training').html('Start Training');
                    // training.inTraining = false;
                    // ui.onFinishTraining();
                }
            }
        });


    },

    createModelWithMeta: function() {

        const inputImage = tf.input({
            name: 'image',
            shape: [dataset.inputHeight, dataset.inputWidth, 3],
        });

        const inputMeta = tf.input({
            name: 'metaInfo',
            shape: [4],
        });

        const conv = tf.layers.conv2d({
            kernelSize: 5,
            filters: 20,
            strides: 1,
            activation: 'relu',
            kernelInitializer: 'varianceScaling'
        }).apply(inputImage);

        const maxpool = tf.layers.maxPooling2d({
            poolSize: [2, 2],
            strides: [2, 2],
        })
            .apply(conv);

        const flat = tf.layers.flatten().apply(maxpool);

        const dropout = tf.layers.dropout(0.2).apply(flat);

        const concat = tf.layers.concatenate().apply([dropout, inputMeta]);

        const output = tf.layers.dense({
            units: 2,
            activation: 'tanh',
            kernelInitializer: 'varianceScaling',
        })
            .apply(concat);

        // Create the model based on the inputs
        return tf.model({inputs: [inputImage, inputMeta], outputs: output});

    },

    createModelWithBothEyesMeta: function() {

        const inputImageA = tf.input({name: 'imageA', shape: [dataset.inputHeight, dataset.inputWidth, 3],});
        const convA = tf.layers.conv2d({
            kernelSize: 5,
            filters: 20,
            strides: 1,
            activation: 'relu',
            kernelInitializer: 'varianceScaling'
        }).apply(inputImageA);
        const maxpoolA = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convA);
        const convA2 = tf.layers.conv2d({
            kernelSize: 5,
            filters: 20,
            strides: 1,
            activation: 'relu',
            kernelInitializer: 'varianceScaling'
        }).apply(maxpoolA);
        const maxpoolA2 = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convA2);
        const flatA = tf.layers.flatten().apply(maxpoolA2);
        const dropoutA = tf.layers.dropout(0.2).apply(flatA);


        const inputImageB = tf.input({name: 'imageB', shape: [dataset.inputHeight, dataset.inputWidth, 3],});
        const convB = tf.layers.conv2d({
            kernelSize: 5,
            filters: 20,
            strides: 1,
            activation: 'relu',
            kernelInitializer: 'varianceScaling'
        }).apply(inputImageB);
        const maxpoolB = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convB);
        const convB2 = tf.layers.conv2d({
            kernelSize: 5,
            filters: 20,
            strides: 1,
            activation: 'relu',
            kernelInitializer: 'varianceScaling'
        }).apply(maxpoolB);
        const maxpoolB2 = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convB2);
        const flatB = tf.layers.flatten().apply(maxpoolB2);
        const dropoutB = tf.layers.dropout(0.2).apply(flatB);

        const inputMeta = tf.input({
            name: 'metaInfo',
            shape: [4],
        });

        const concat = tf.layers.concatenate().apply([dropoutA, dropoutB, inputMeta]);

        const output = tf.layers.dense({
            units: 2,
            activation: 'tanh',
            kernelInitializer: 'varianceScaling',
        })
            .apply(concat);

        // Create the model based on the inputs
        return tf.model({inputs: [inputImageA, inputImageB, inputMeta], outputs: output});

    },

    createModel: function() {

        const inputImage = tf.input({
            name: 'image',
            shape: [dataset.inputHeight, dataset.inputWidth, 3],
        });


        const conv = tf.layers.conv2d({
            kernelSize: 5,
            filters: 20,
            strides: 1,
            activation: 'relu',
            kernelInitializer: 'varianceScaling'
        }).apply(inputImage);

        const maxpool = tf.layers.maxPooling2d({
            poolSize: [2, 2],
            strides: [2, 2],
        })
            .apply(conv);

        const flat = tf.layers.flatten().apply(maxpool);

        const dropout = tf.layers.dropout(0.2).apply(flat);

        // const concat = tf.layers.concatenate().apply([dropout, inputMeta]);

        const output = tf.layers.dense({
            units: 2,
            activation: 'tanh',
            kernelInitializer: 'varianceScaling',
        })
            .apply(dropout);

        // Create the model based on the inputs
        return tf.model({inputs: inputImage, outputs: output});

    },

    createModelBothEyesFace: function() {
        const inputImageA = tf.input({name: 'imageA', shape: [dataset.eyeCanvasHeight, dataset.eyeCanvasWidth, 3],});
        const convA = tf.layers.conv2d({kernelSize: 5, filters: 20, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputImageA);
        const maxpoolA = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convA);
        // const convA2 = tf.layers.conv2d({kernelSize: 5, filters: 10, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(maxpoolA);
        // const maxpoolA2 = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convA2);
        const flatA2 = tf.layers.flatten().apply(maxpoolA);
        const dropoutA2 = tf.layers.dropout(0.2).apply(flatA2);


        const inputImageB = tf.input({name: 'imageB', shape: [dataset.eyeCanvasHeight, dataset.eyeCanvasWidth, 3],});
        const convB = tf.layers.conv2d({kernelSize: 5, filters: 20, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputImageB);
        const maxpoolB = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convB);
        // const convB2 = tf.layers.conv2d({kernelSize: 5, filters: 10, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(maxpoolB);
        // const maxpoolB2 = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convB2);
        const flatB2 = tf.layers.flatten().apply(maxpoolB);
        const dropoutB2 = tf.layers.dropout(0.2).apply(flatB2);

        const inputImageC = tf.input({name: 'imageC', shape: [dataset.faceCanvasHeight, dataset.faceCanvasWidth, 3],});
        const convC = tf.layers.conv2d({kernelSize: 5, filters: 20, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputImageC);
        const maxpoolC = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convC);
        // const convC2 = tf.layers.conv2d({kernelSize: 5, filters: 10, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(maxpoolC);
        // const maxpoolC2 = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convC2);
        const flatC2 = tf.layers.flatten().apply(maxpoolC);
        const dropoutC2 = tf.layers.dropout(0.2).apply(flatC2);


        const concat = tf.layers.concatenate().apply([dropoutA2, dropoutB2, dropoutC2]);

        const output = tf.layers.dense({units: 2, activation: 'tanh', kernelInitializer: 'varianceScaling',}).apply(concat);
        // const concat2 = tf.layers.concatenate().apply([dense1, dropoutC2]);
        //
        // const output = tf.layers.dense({units: 2, activation: 'relu', kernelInitializer: 'varianceScaling',}).apply(concat2);

        // Create the model based on the inputs
        return tf.model({inputs: [inputImageA, inputImageB, inputImageC], outputs: output});

    },

    createModelBothEyesFaceFacePos: function() {
        const inputImageA = tf.input({name: 'imageA', shape: [dataset.eyeCanvasHeight, dataset.eyeCanvasWidth, 3],});
        const convA = tf.layers.conv2d({kernelSize: 5, filters: 10, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputImageA);
        const maxpoolA = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convA);
        const convA2 = tf.layers.conv2d({kernelSize: 5, filters: 10, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(maxpoolA);
        const maxpoolA2 = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convA2);
        const flatA2 = tf.layers.flatten().apply(maxpoolA2);
        const dropoutA2 = tf.layers.dropout(0.2).apply(flatA2);


        const inputImageB = tf.input({name: 'imageB', shape: [dataset.eyeCanvasHeight, dataset.eyeCanvasWidth, 3],});
        const convB = tf.layers.conv2d({kernelSize: 5, filters: 10, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputImageB);
        const maxpoolB = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convB);
        const convB2 = tf.layers.conv2d({kernelSize: 5, filters: 10, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(maxpoolB);
        const maxpoolB2 = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convB2);
        const flatB2 = tf.layers.flatten().apply(maxpoolB2);
        const dropoutB2 = tf.layers.dropout(0.2).apply(flatB2);

        const inputImageC = tf.input({name: 'imageC', shape: [dataset.faceCanvasHeight, dataset.faceCanvasWidth, 3],});
        const convC = tf.layers.conv2d({kernelSize: 5, filters: 10, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputImageC);
        const maxpoolC = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convC);
        const convC2 = tf.layers.conv2d({kernelSize: 5, filters: 10, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(maxpoolC);
        const maxpoolC2 = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convC2);
        const flatC2 = tf.layers.flatten().apply(maxpoolC2);
        const dropoutC2 = tf.layers.dropout(0.2).apply(flatC2);

        const inputFaceGrid = tf.input({name: 'faceGrid', shape:[dataset.faceGrid.height, dataset.faceGrid.width, 3],});
        const convFaceGrid = tf.layers.conv2d({kernelSize: 5, filters:10, strides:1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputFaceGrid);
        const maxpoolFaceGrid = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convFaceGrid);
        const convFaceGrid2 = tf.layers.conv2d({kernelSize: 5, filters:10, strides:1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(maxpoolFaceGrid);
        const flatFaceGrid2 = tf.layers.flatten().apply(convFaceGrid2);
        const dropoutFaceGrid2 = tf.layers.dropout(0.2).apply(flatFaceGrid2);

        const concat1 = tf.layers.concatenate().apply([dropoutA2, dropoutB2]);
        const concat2 = tf.layers.concatenate().apply([dropoutC2, dropoutFaceGrid2]);


        const dense1 = tf.layers.dense({units: 2, activation: 'tanh', kernelInitializer: 'varianceScaling',}).apply(concat1);
        const dense2 = tf.layers.dense({units: 2, activation: 'tanh', kernelInitializer: 'varianceScaling',}).apply(concat2);

        const concat3 = tf.layers.concatenate().apply([dense1, dense2]);
        const output = tf.layers.dense({units: 2, activation: 'tanh', kernelInitializer: 'varianceScaling',}).apply(concat3);



        // Create the model based on the inputs
        return tf.model({inputs: [inputImageA, inputImageB, inputImageC, inputFaceGrid], outputs: output});

    }

}
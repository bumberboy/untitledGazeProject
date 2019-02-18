window.training = {
    useMetaData: false,
    useTwoEyes: true,
    currentModel: null,
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
                training.currentModel = training.createModelWithBothEyesMeta();

            }else {
                training.currentModel = training.createModel();

            }
        }

        console.log(training.currentModel);

        let bestEpoch = -1;
        let bestTrainLoss = Number.MAX_SAFE_INTEGER;
        let bestValLoss = Number.MAX_SAFE_INTEGER;
        const bestModelPath = 'localstorage://best-model';


        training.currentModel.compile({
            optimizer: tf.train.sgd(0.15),

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
    }
}
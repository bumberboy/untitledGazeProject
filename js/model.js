function Model1(id) {
    this.id = id;
    this.epochsTrained = 0;
    this.currentModel = null;
    this.inTraining = false;
    this.isTrained = false;
    this.timeStarted = 0;


    this.setType = function(type) {
        this.type = type;
        console.log('Type for model', this.id, 'changed to ', this.type);
        this.currentModel = null;
    };
    this.fitModel = function() {
        this.timeStarted = Date.now();

        console.log("MY ID IS:", this.id);

        const epochs = 10;

        let batchSize = Math.floor(dataset.train.n * 0.1);
        if (batchSize < 4) {batchSize = 4;} else if (batchSize > 64) {batchSize = 64;}

        let bestEpoch = -1;
        let bestTrainLoss = Number.MAX_SAFE_INTEGER;
        let bestValLoss = Number.MAX_SAFE_INTEGER;
        const bestModelPath = 'localstorage://best-model' + this.id;

        if (this.currentModel == null) {
            console.log("type set:", this.type);

            if (this.type === 'model-A') {

                this.currentModel = new ModelFactory.createModel();

            } else if (this.type === 'model-B') {

                this.currentModel = new ModelFactory.createModelWithMeta();

            } else  if (this.type === 'model-C') {

                this.currentModel = new ModelFactory.createModelBothEyesFace();
            } else  if (this.type === 'model-C-F10') {

                this.currentModel = new ModelFactory.createModelBothEyesFaceF10();
            } else  if (this.type === 'model-C-F40') {

                this.currentModel = new ModelFactory.createModelBothEyesFaceF40();

            } else if (this.type === 'model-D') {

                this.currentModel = new ModelFactory.createModelBothEyesFaceTwoDeep();

            } else if (this.type === 'model-E') {
                this.currentModel = new ModelFactory.createModelBothEyesFaceTwoDeep2();
            } else if (this.type === 'model-F') {
                this.currentModel = new ModelFactory.createModelEyesFace();
            } else if (this.type === 'model-G') {
                this.currentModel = new ModelFactory.createModelBothEyesFaceFacePos();

            }
        }
        this.currentModel.summary();
        this.currentModel.compile({
            // optimizer: 'sgd',

            optimizer: tf.train.adam(0.0005),
            loss: 'meanSquaredError',
        });
        m = this;
        xDataset = null;
        xValDataset = null;
        if (this.type === 'model-A') {
            xDataset = [dataset.train.x[0]];
            xValDataset = [dataset.val.x[0]];

        } else if (this.type === 'model-B') {
            xDataset = [dataset.train.x[0], dataset.train.x[5]];
            xValDataset = [dataset.val.x[0], dataset.val.x[5]];

        } else if (this.type === "model-C" || this.type ==="model-D" || this.type ==="model-E"
            || this.type === "model-C-F10" || this.type === "model-C-F40") {
            xDataset = [dataset.train.x[1], dataset.train.x[2], dataset.train.x[3]];
            xValDataset = [dataset.val.x[1], dataset.val.x[2], dataset.val.x[3]];


        } else if (this.type === "model-F") {
            xDataset = [dataset.train.x[0], dataset.train.x[3]];
            xValDataset = [dataset.val.x[0], dataset.val.x[3]];
        } else if (this.type === "model-G") {
            xDataset = [dataset.train.x[1], dataset.train.x[2], dataset.train.x[3], dataset.train.x[4]];
            xValDataset = [dataset.val.x[1], dataset.val.x[2], dataset.val.x[3], dataset.val.x[4]];
        }

        this.isTrained = false;
        this.inTraining = true;
        console.log("mid", m.id, bestModelPath);
        this.currentModel.fit(xDataset, dataset.train.y, {
            batchSize: batchSize,
            epochs: epochs,
            shuffle: true,
            validationData: [xValDataset, dataset.val.y],
            callbacks: {


                onEpochEnd: async function (epoch, logs) {
                    console.info('Epoch', epoch, 'losses:', logs, 'id:', m.id);
                    m.epochsTrained += 1;
                    ui.setContent('n-epochs' + m.id, m.epochsTrained);
                    ui.setContent('train-loss' + m.id, logs.loss.toFixed(5));
                    ui.setContent('val-loss' + m.id, logs.val_loss.toFixed(5));

                    lossPlot.addLosses(logs.loss.toFixed(5),logs.val_loss.toFixed(5));

                    if (logs.val_loss < bestValLoss) {
                        // Save model
                        bestEpoch = epoch;
                        bestTrainLoss = logs.loss;
                        bestValLoss = logs.val_loss;

                        // Store best model:
                        await m.currentModel.save(bestModelPath);
                    }

                    return await tf.nextFrame();
                },
                onTrainEnd: async function () {
                    const timeElapsed = Date.now() - m.timeStarted;
                    console.info('Finished training. Total time elapsed: ', timeElapsed);

                    // Load best model:
                    m.epochsTrained -= epochs - bestEpoch;
                    console.info('Loading best epoch:', m.epochsTrained);
                    ui.setContent('n-epochs' + m.id, m.epochsTrained);
                    ui.setContent('train-loss' + m.id, bestTrainLoss.toFixed(5));
                    ui.setContent('val-loss' + m.id, bestValLoss.toFixed(5));
                    // lossPlot.addLosses(logs.loss.toFixed(5),logs.val_loss.toFixed(5));
                    lossPlot.plotChart();

                    m.currentModel = await tf.loadModel

                    (bestModelPath);

                    $('#start-training' + m.id).prop('disabled', false);
                    $('#start-training' + m.id).html('Start Training');
                    m.inTraining = false;
                    m.isTrained = true;
                    ui.onFinishTraining(m.id);
                }
            }
        })


    };

    this.resetModel = function() {
        $('#reset-model'+this.id).prop('disabled', true);
        this.currentModel = null;
        this.epochsTrained = 0;
        this.isTrained = false;
        ui.setContent('n-epochs'+this.id, this.epochsTrained);
        ui.setContent('train-loss'+this.id, '?');
        ui.setContent('vthis.al-loss'+this.id, '?');
        $('#reset-model'+this.id).prop('disabled', false);
        lossPlot.resetChart();
    };
    this.target = $('#gazeTarget'+this.id);
    this.targetWidth = this.target.outerWidth();
    this.targetHeight = this.target.outerHeight();
    this.ema = {x:[], y:[]};
    this.emaSize = 4;

    this.moveTarget = function() {
        // Convert normalized position back to screen position:

        this.getPrediction();
        const xx = Math.min(((predictions[this.id].x + 1) / 2), 1);
        const yy = Math.min(((predictions[this.id].y + 1) / 2), 1);

        var x = xx * ($(window).width() - this.targetWidth);
        var y = yy * ($(window).height() - this.targetHeight);



        if (this.ema.x.length === this.emaSize) {
            this.ema.x.shift();
            this.ema.x.push(x);
            this.ema.y.shift();
            this.ema.y.push(y);
        } else {
            this.ema.x.push(x);
            this.ema.y.push(y);
        }

        x = arrAvg(this.ema.x);
        y = arrAvg(this.ema.y);

        // Move target there:
        this.target.css('left', x + 'px');
        this.target.css('top', y + 'px');


        heatmap.addData({x:x,y:y,value:100})
    };

    this.getPrediction = function() {
        m = this;
        tf.tidy (function() {
            if (m.type === 'model-A') {
                _prediction = m.currentModel.predict(dataset.getEyes());
                predictions[m.id] = {x:_prediction.get(0,0), y: _prediction.get(0,1)};

            } else if (m.type === 'model-B') {
                s = dataset.getEyes();
                s.push(dataset.getMetaInfos());
                _prediction = m.currentModel.predict(s);

            } else if (m.type === "model-C" || m.type ==="model-D" || m.type ==="model-E"
                || m.type === "model-C-F10" || m.type === "model-C-F40") {
                _prediction = m.currentModel.predict(dataset.getLeftRightFace());

            } else if (m.type === 'model-F') {
                _prediction = m.currentModel.predict(dataset.getEyesFace());

            } else if (m.type === 'model-G') {
                _prediction = m.currentModel.predict(dataset.getLeftRightFaceGrid());

            }

            predictions[m.id] = {x:_prediction.get(0,0), y: _prediction.get(0,1)};


        });


    }

}


ModelFactory = {
    createModelWithMeta: function() {

        const inputImage = tf.input({name: 'image', shape: [dataset.eyesCanvasHeight, dataset.eyesCanvasWidth, 3],});
        const inputMeta = tf.input({name: 'metaInfo', shape: [4]});
        const conv = tf.layers.conv2d({kernelSize: 5, filters: 20, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputImage);
        const maxpool = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(conv);
        const flat = tf.layers.flatten().apply(maxpool);
        const dropout = tf.layers.dropout(0.2).apply(flat);

        const concat = tf.layers.concatenate().apply([dropout, inputMeta]);
        const output = tf.layers.dense({units: 2, activation: 'tanh', kernelInitializer: 'varianceScaling',}).apply(concat);

        // Create the model based on the inputs
        return new tf.model({inputs: [inputImage, inputMeta], outputs: output});

    },

    createModelWithBothEyesMeta: function() {

        const inputImageA = tf.input({name: 'imageA', shape: [dataset.inputHeight, dataset.inputWidth, 3],});
        const convA = tf.layers.conv2d({kernelSize: 5, filters: 20, strides: 1, activation: 'relu',}).apply(inputImageA);
        const maxpoolA = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convA);
        const convA2 = tf.layers.conv2d({kernelSize: 5, filters: 20, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(maxpoolA);
        const maxpoolA2 = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convA2);
        const flatA = tf.layers.flatten().apply(maxpoolA2);
        const dropoutA = tf.layers.dropout(0.2).apply(flatA);


        const inputImageB = tf.input({name: 'imageB', shape: [dataset.inputHeight, dataset.inputWidth, 3],});
        const convB = tf.layers.conv2d({kernelSize: 5, filters: 20, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputImageB);
        const maxpoolB = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convB);
        const convB2 = tf.layers.conv2d({kernelSize: 5, filters: 20, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(maxpoolB);
        const maxpoolB2 = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convB2);
        const flatB = tf.layers.flatten().apply(maxpoolB2);
        const dropoutB = tf.layers.dropout(0.2).apply(flatB);

        const inputMeta = tf.input({name: 'metaInfo', shape: [4],});

        const concat = tf.layers.concatenate().apply([dropoutA, dropoutB, inputMeta]);

        const output = tf.layers.dense({units: 2, activation: 'tanh', kernelInitializer: 'varianceScaling',}).apply(concat);

        // Create the model based on the inputs
        return new tf.model({inputs: [inputImageA, inputImageB, inputMeta], outputs: output});

    },

    createModel: function() {

        const inputImage = tf.input({name: 'image', shape: [dataset.eyesCanvasHeight, dataset.eyesCanvasWidth, 3],});


        const conv = tf.layers.conv2d({kernelSize: 5, filters: 20, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputImage);
        const maxpool = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(conv);
        const flat = tf.layers.flatten().apply(maxpool);
        const dropout = tf.layers.dropout(0.2).apply(flat);

        // const concat = tf.layers.concatenate().apply([dropout, inputMeta]);

        const output = tf.layers.dense({units: 2, activation: 'tanh', kernelInitializer: 'varianceScaling',}).apply(dropout);

        // Create the model based on the inputs
        return new tf.model({inputs: [inputImage], outputs: output});

    },

    createModelEyesFace: function() {

        const inputImage = tf.input({name: 'eyes', shape: [dataset.eyesCanvasHeight, dataset.eyesCanvasWidth, 3],});
        const conv = tf.layers.conv2d({kernelSize: 5, filters: 20, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputImage);
        const maxpool = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(conv);
        const flat = tf.layers.flatten().apply(maxpool);
        const dropout = tf.layers.dropout(0.2).apply(flat);

        const inputImageB = tf.input({name: 'face', shape: [dataset.faceCanvasHeight, dataset.faceCanvasWidth, 3],});
        const convB = tf.layers.conv2d({kernelSize: 5, filters: 20, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputImageB);
        const maxpoolB = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convB);
        const flatB = tf.layers.flatten().apply(maxpoolB);
        const dropoutB = tf.layers.dropout(0.2).apply(flatB);
        const concat = tf.layers.concatenate().apply([dropout, dropoutB]);

        const output = tf.layers.dense({units: 2, activation: 'tanh', kernelInitializer: 'varianceScaling',}).apply(concat);

        // Create the model based on the inputs
        return new tf.model({inputs: [inputImage, inputImageB], outputs: output});

    },

    createModelBothEyesFaceTwoDeep2: function() {
        const inputImageA = tf.input({name: 'imageA', shape: [dataset.eyeCanvasHeight, dataset.eyeCanvasWidth, 3],});
        const convA = tf.layers.conv2d({kernelSize: 5, filters: 20, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputImageA);
        const maxpoolA = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convA);
        const convA2 = tf.layers.conv2d({kernelSize: 5, filters: 10, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(maxpoolA);
        const maxpoolA2 = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convA2);
        const convA3 = tf.layers.conv2d({kernelSize: 5, filters: 10, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(maxpoolA2);
        const maxpoolA3 = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convA3);
        const flatA3 = tf.layers.flatten().apply(maxpoolA3);
        const dropoutA2 = tf.layers.dropout(0.2).apply(flatA3);


        const inputImageB = tf.input({name: 'imageB', shape: [dataset.eyeCanvasHeight, dataset.eyeCanvasWidth, 3],});
        const convB = tf.layers.conv2d({kernelSize: 5, filters: 20, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputImageB);
        const maxpoolB = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convB);
        const convB2 = tf.layers.conv2d({kernelSize: 5, filters: 10, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(maxpoolB);
        const maxpoolB2 = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convB2);
        const convB3 = tf.layers.conv2d({kernelSize: 5, filters: 10, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(maxpoolB2);
        const maxpoolB3 = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convB3);
        const flatB2 = tf.layers.flatten().apply(maxpoolB3);
        const dropoutB2 = tf.layers.dropout(0.2).apply(flatB2);

        const inputImageC = tf.input({name: 'imageC', shape: [dataset.faceCanvasHeight, dataset.faceCanvasWidth, 3],});
        const convC = tf.layers.conv2d({kernelSize: 5, filters: 20, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputImageC);
        const maxpoolC = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convC);
        const convC2 = tf.layers.conv2d({kernelSize: 5, filters: 10, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(maxpoolC);
        const maxpoolC2 = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convC2);
        const convC3 = tf.layers.conv2d({kernelSize: 5, filters: 10, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(maxpoolC2);
        const maxpoolC3 = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convC3);
        const flatC2 = tf.layers.flatten().apply(maxpoolC3);
        const dropoutC2 = tf.layers.dropout(0.2).apply(flatC2);


        const concat = tf.layers.concatenate().apply([dropoutA2, dropoutB2]);

        const dense1 = tf.layers.dense({units: 2, activation: 'tanh', kernelInitializer: 'varianceScaling',}).apply(concat);
        const concat2 = tf.layers.concatenate().apply([dense1, dropoutC2]);
        //
        const output = tf.layers.dense({units: 2, activation: 'tanh', kernelInitializer: 'varianceScaling',}).apply(concat2);

        // Create the model based on the inputs
        return new tf.model({inputs: [inputImageA, inputImageB, inputImageC], outputs: output});

    },

    createModelBothEyesFaceTwoDeep: function() {
        const inputImageA = tf.input({name: 'imageA', shape: [dataset.eyeCanvasHeight, dataset.eyeCanvasWidth, 3],});
        const convA = tf.layers.conv2d({kernelSize: 5, filters: 20, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputImageA);
        const maxpoolA = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convA);
        const convA2 = tf.layers.conv2d({kernelSize: 5, filters: 10, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(maxpoolA);
        const maxpoolA2 = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convA2);
        const flatA2 = tf.layers.flatten().apply(maxpoolA2);
        const dropoutA2 = tf.layers.dropout(0.2).apply(flatA2);


        const inputImageB = tf.input({name: 'imageB', shape: [dataset.eyeCanvasHeight, dataset.eyeCanvasWidth, 3],});
        const convB = tf.layers.conv2d({kernelSize: 5, filters: 20, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputImageB);
        const maxpoolB = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convB);
        const convB2 = tf.layers.conv2d({kernelSize: 5, filters: 10, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(maxpoolB);
        const maxpoolB2 = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convB2);
        const flatB2 = tf.layers.flatten().apply(maxpoolB2);
        const dropoutB2 = tf.layers.dropout(0.2).apply(flatB2);

        const inputImageC = tf.input({name: 'imageC', shape: [dataset.faceCanvasHeight, dataset.faceCanvasWidth, 3],});
        const convC = tf.layers.conv2d({kernelSize: 5, filters: 20, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputImageC);
        const maxpoolC = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convC);
        const convC2 = tf.layers.conv2d({kernelSize: 5, filters: 10, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(maxpoolC);
        const maxpoolC2 = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convC2);
        const flatC2 = tf.layers.flatten().apply(maxpoolC2);
        const dropoutC2 = tf.layers.dropout(0.2).apply(flatC2);


        const concat = tf.layers.concatenate().apply([dropoutA2, dropoutB2, dropoutC2]);

        const output = tf.layers.dense({units: 2, activation: 'tanh', kernelInitializer: 'varianceScaling',}).apply(concat);
        // const concat2 = tf.layers.concatenate().apply([dense1, dropoutC2]);
        //
        // const output = tf.layers.dense({units: 2, activation: 'relu', kernelInitializer: 'varianceScaling',}).apply(concat2);

        // Create the model based on the inputs
        return new tf.model({inputs: [inputImageA, inputImageB, inputImageC], outputs: output});

    },

    createModelBothEyesFace: function() {
        const inputImageA = tf.input({name: 'imageA', shape: [dataset.eyeCanvasHeight, dataset.eyeCanvasWidth, 3],});
        const convA = tf.layers.conv2d({kernelSize: 5, filters: 20, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputImageA);
        const maxpoolA = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convA);
        const flatA2 = tf.layers.flatten().apply(maxpoolA);
        const dropoutA2 = tf.layers.dropout(0.2).apply(flatA2);


        const inputImageB = tf.input({name: 'imageB', shape: [dataset.eyeCanvasHeight, dataset.eyeCanvasWidth, 3],});
        const convB = tf.layers.conv2d({kernelSize: 5, filters: 20, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputImageB);
        const maxpoolB = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convB);
        const flatB2 = tf.layers.flatten().apply(maxpoolB);
        const dropoutB2 = tf.layers.dropout(0.2).apply(flatB2);

        const inputImageC = tf.input({name: 'imageC', shape: [dataset.faceCanvasHeight, dataset.faceCanvasWidth, 3],});
        const convC = tf.layers.conv2d({kernelSize: 5, filters: 20, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputImageC);
        const maxpoolC = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convC);

        const flatC2 = tf.layers.flatten().apply(maxpoolC);
        const dropoutC2 = tf.layers.dropout(0.2).apply(flatC2);


        const concat = tf.layers.concatenate().apply([dropoutA2, dropoutB2, dropoutC2]);
        const output = tf.layers.dense({units: 2, activation: 'tanh', kernelInitializer: 'varianceScaling',}).apply(concat);

        return new tf.model({inputs: [inputImageA, inputImageB, inputImageC], outputs: output});

    },

    createModelBothEyesFaceF40: function() {
        const inputImageA = tf.input({name: 'imageA', shape: [dataset.eyeCanvasHeight, dataset.eyeCanvasWidth, 3],});
        const convA = tf.layers.conv2d({kernelSize: 5, filters: 20, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputImageA);
        const maxpoolA = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convA);
        const flatA2 = tf.layers.flatten().apply(maxpoolA);
        const dropoutA2 = tf.layers.dropout(0.2).apply(flatA2);


        const inputImageB = tf.input({name: 'imageB', shape: [dataset.eyeCanvasHeight, dataset.eyeCanvasWidth, 3],});
        const convB = tf.layers.conv2d({kernelSize: 5, filters: 20, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputImageB);
        const maxpoolB = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convB);
        const flatB2 = tf.layers.flatten().apply(maxpoolB);
        const dropoutB2 = tf.layers.dropout(0.2).apply(flatB2);

        const inputImageC = tf.input({name: 'imageC', shape: [dataset.faceCanvasHeight, dataset.faceCanvasWidth, 3],});
        const convC = tf.layers.conv2d({kernelSize: 5, filters: 20, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputImageC);
        const maxpoolC = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convC);

        const flatC2 = tf.layers.flatten().apply(maxpoolC);
        const dropoutC2 = tf.layers.dropout(0.2).apply(flatC2);


        const concat = tf.layers.concatenate().apply([dropoutA2, dropoutB2, dropoutC2]);
        const output = tf.layers.dense({units: 2, activation: 'tanh', kernelInitializer: 'varianceScaling',}).apply(concat);

        return new tf.model({inputs: [inputImageA, inputImageB, inputImageC], outputs: output});

    },

    createModelBothEyesFaceF10: function() {
        const inputImageA = tf.input({name: 'imageA', shape: [dataset.eyeCanvasHeight, dataset.eyeCanvasWidth, 3],});
        const convA = tf.layers.conv2d({kernelSize: 5, filters: 20, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputImageA);
        const maxpoolA = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convA);
        const flatA2 = tf.layers.flatten().apply(maxpoolA);
        const dropoutA2 = tf.layers.dropout(0.2).apply(flatA2);


        const inputImageB = tf.input({name: 'imageB', shape: [dataset.eyeCanvasHeight, dataset.eyeCanvasWidth, 3],});
        const convB = tf.layers.conv2d({kernelSize: 5, filters: 20, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputImageB);
        const maxpoolB = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convB);
        const flatB2 = tf.layers.flatten().apply(maxpoolB);
        const dropoutB2 = tf.layers.dropout(0.2).apply(flatB2);

        const inputImageC = tf.input({name: 'imageC', shape: [dataset.faceCanvasHeight, dataset.faceCanvasWidth, 3],});
        const convC = tf.layers.conv2d({kernelSize: 5, filters: 20, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputImageC);
        const maxpoolC = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convC);

        const flatC2 = tf.layers.flatten().apply(maxpoolC);
        const dropoutC2 = tf.layers.dropout(0.2).apply(flatC2);


        const concat = tf.layers.concatenate().apply([dropoutA2, dropoutB2, dropoutC2]);
        const output = tf.layers.dense({units: 2, activation: 'tanh', kernelInitializer: 'varianceScaling',}).apply(concat);

        return new tf.model({inputs: [inputImageA, inputImageB, inputImageC], outputs: output});

    },

    createModelBothEyesFaceFacePos: function() {
        const inputImageA = tf.input({name: 'imageA', shape: [dataset.eyeCanvasHeight, dataset.eyeCanvasWidth, 3],});
        const convA = tf.layers.conv2d({kernelSize: 5, filters: 10, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputImageA);
        const maxpoolA = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convA);
        const flatA2 = tf.layers.flatten().apply(maxpoolA);
        const dropoutA2 = tf.layers.dropout(0.2).apply(flatA2);


        const inputImageB = tf.input({name: 'imageB', shape: [dataset.eyeCanvasHeight, dataset.eyeCanvasWidth, 3],});
        const convB = tf.layers.conv2d({kernelSize: 5, filters: 10, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputImageB);
        const maxpoolB = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convB);
        const flatB2 = tf.layers.flatten().apply(maxpoolB);
        const dropoutB2 = tf.layers.dropout(0.2).apply(flatB2);

        const inputImageC = tf.input({name: 'imageC', shape: [dataset.faceCanvasHeight, dataset.faceCanvasWidth, 3],});
        const convC = tf.layers.conv2d({kernelSize: 5, filters: 10, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputImageC);
        const maxpoolC = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convC);
        const flatC2 = tf.layers.flatten().apply(maxpoolC);
        const dropoutC2 = tf.layers.dropout(0.2).apply(flatC2);

        const inputFaceGrid = tf.input({name: 'faceGrid', shape:[dataset.faceGrid.height, dataset.faceGrid.width, 3],});
        const convFaceGrid = tf.layers.conv2d({kernelSize: 5, filters:10, strides:1, activation: 'relu', kernelInitializer: 'varianceScaling'}).apply(inputFaceGrid);
        const maxpoolFaceGrid = tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2],}).apply(convFaceGrid);
        const flatFaceGrid2 = tf.layers.flatten().apply(maxpoolFaceGrid);
        const dropoutFaceGrid2 = tf.layers.dropout(0.2).apply(flatFaceGrid2);

        const concat1 = tf.layers.concatenate().apply([dropoutA2, dropoutB2]);
        const concat2 = tf.layers.concatenate().apply([dropoutC2, dropoutFaceGrid2]);


        const dense1 = tf.layers.dense({units: 2, activation: 'tanh', kernelInitializer: 'varianceScaling',}).apply(concat1);
        const dense2 = tf.layers.dense({units: 2, activation: 'tanh', kernelInitializer: 'varianceScaling',}).apply(concat2);

        const concat3 = tf.layers.concatenate().apply([dense1, dense2]);
        const output = tf.layers.dense({units: 2, activation: 'tanh', kernelInitializer: 'varianceScaling',}).apply(concat3);



        // Create the model based on the inputs
        return new tf.model({inputs: [inputImageA, inputImageB, inputImageC, inputFaceGrid], outputs: output});

    }
};

const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length;
let currentModel;

// function createModel() {
//     const model = tf.sequential();
//     const eyeWindow = $('#eyes');
//
//     model.add(tf.layers.conv2d({
//         kernelSize: 5,
//         filters: 20,
//         strides: 1,
//         activation: 'relu',
//         inputShape: [eyeWindow.height(), eyeWindow.width(), 3],
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

function fitModel() {
    let batchSize = Math.floor(dataset.train.n * 0.1);
    if (batchSize < 4) {
        batchSize = 4;
    } else if (batchSize > 64) {
        batchSize = 64;
    }

    if (currentModel == null) {
        currentModel = training.createModel();
    }

    training.currentModel.compile({
        optimizer: tf.train.adam(0.0005),
        loss: 'meanSquaredError',
    });

    currentModel.fit(dataset.train.x, dataset.train.y, {
        batchSize: batchSize,
        epochs: 20,
        shuffle: true,
        validationData: [dataset.val.x, dataset.val.y],
    });
}


window.training = {
    createModel: function() {


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
        const model = tf.model({inputs: input, outputs: output});

        return model;
    }
}
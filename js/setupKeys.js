
function setupKeys() {
    $('body').keyup(function(event) {
        // On space key:
        if (event.key === ' ') {
            dataset.captureExample(mouse.getMousePos());

            event.preventDefault();
            return false;
        } else if (event.key === 'r') {
            targetTraining.runTargetTraining('rect');
        } else if (event.key === 't') {
            targetTraining.stopRecording();
        } else if (event.key === 'f') {
            targetTraining.runTargetTraining('circle');

        } else if (event.key === 'b') {
            if (targetTraining.gridAnim == null) {
                console.log("Begin target training...");
                targetTraining.trainingInProgress = true;
                targetTraining.runTargetTraining('grid');
                targetTraining.startRecording();

            } else if (!targetTraining.trainingInProgress) {
                console.log("Continue target training...");
                targetTraining.gridAnim.play();
                targetTraining.trainingInProgress = true;
                targetTraining.startRecording();

            }
            else {
                console.log("Target training paused...");
                targetTraining.gridAnim.pause();
                targetTraining.stopRecording();
                targetTraining.trainingInProgress = false;
                targetTraining.stopRecording();
            }

            // } else if (event.key === 'p') {
            //     useTrainedModel('model');
            // } else if (event.key === 'o') {
            //     useTrainedModel('model2');
        } else if (event.key === 'n') {
            gridValidation.toggleGridValidation();

        } else if (event.key === 'q') {
            if (panelIsHidden) {
                panelIsHidden = false;
                $('#training').css("visibility", "unset");


            } else {
                panelIsHidden = true;
                $('#training').css("visibility", "hidden");

            }
        }
    });
    $("select#model-select1").change(function() {model1.setType($("select#model-select1").val())});
    $('#start-training1').click(function() {console.log("START TRAINGING1"); model1.fitModel();});
    $('#reset-model1').click(function() {model1.resetModel();});
    $('#store-model1').click(async function(e) {await training.currentModel.save('downloads://model1');});
    $('#load-model1').click(function(e) {$('#model-uploader').trigger('click');});
    $('#model-uploader1').change(async function(e) {
        const files = e.target.files;
        training.currentModel = await tf.loadModel(
            tf.io.browserFiles([files[0], files[1]]),
        );
        ui.onFinishTraining(1);
    });

    // $("select#model-select2").change(function() {model2.setType($("select#model-select2").val())});
    // $('#start-training2').click(function() {console.log("START TRAINGING2"); model2.fitModel();});
    // $('#reset-model2').click(function() {model2.resetModel();});
    // $('#store-model2').click(async function(e) {await training.currentModel.save('downloads://model');});
    // $('#load-model2').click(function(e) {$('#model-uploader').trigger('click');});
    // $('#model-uploader2').change(async function(e) {
    //     const files = e.target.files;
    //     training.currentModel = await tf.loadModel(
    //         tf.io.browserFiles([files[0], files[1]]),
    //     );
    //     ui.onFinishTraining(2);
    // });

    $('#toggle-camview').click(function() {
        console.log('toggle cam');
        if (camViewIsHidden) {
            camViewIsHidden = false;
            $('#inputVideo').css("visibility", "unset");
            $('#landmarksCanvas').css("visibility", "unset");
            $('#eyes').css("visibility", "unset");
            $('#leftEye').css("visibility", "unset");
            $('#rightEye').css("visibility", "unset");
            $('#face').css("visibility", "unset");
            $('#mask').css("visibility", "unset");



        } else {
            $('#inputVideo').css("visibility", "hidden");
            $('#landmarksCanvas').css("visibility", "hidden");
            $('#eyes').css("visibility", "hidden");
            $('#leftEye').css("visibility", "hidden");
            $('#rightEye').css("visibility", "hidden");
            $('#face').css("visibility", "hidden");
            $('#mask').css("visibility", "hidden");

            camViewIsHidden = true;
        }
    });

    $('#toggle-landmark-drawing').click(function() {
        console.log('toggle landmark drawing');
        if (shouldDrawLandmarks) {
            shouldDrawLandmarks = false;

            const landmark = $("#landmarksCanvas").get(0);
            const landmarkContext = landmark.getContext('2d');
            landmarkContext.clearRect(0,0,landmark.width,landmark.height);

        } else {
            shouldDrawLandmarks = true;
        }
    });

    $('#toggle-grid-validation').click(function() {
        console.log('toggle grid validation');
        gridValidation.toggleGridValidation();

    });

    $('#toggle-target-heatmap').click(function() {
        console.log('toggle heatmap');
        if (targetHeatMapIsHidden) {
            $('#heatmapContainerWrapper').css("visibility", "unset");
            targetHeatMapIsHidden = false;
        } else {
            $('#heatmapContainerWrapper').css("visibility", "hidden");
            targetHeatMapIsHidden = true;

        }
    })

    $('#store-data').click(function(e) {
        const data = dataset.toJSON();
        const json = JSON.stringify(data);
        download(json, 'dataset.json', 'text/plain');
    });

    $('#load-data').click(function(e) {
        $('#data-uploader').trigger('click');
    });

    $('#data-uploader').change(function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = function() {
            const data = reader.result;
            const json = JSON.parse(data);
            dataset.fromJSON(json);
        };

        reader.readAsBinaryString(file);
    });

    // $('#bg-uploader').change(function(e) {
    //     const file = e.target.files[0];
    //     const reader = new FileReader();
    //
    //     reader.onload = function() {
    //         const data = reader.readAsDataURL(file);
    //         const json = JSON.parse(data);
    //         dataset.fromJSON(json);
    //     };
    //
    //     reader.readAsBinaryString(file);
    // });


}

function download(content, fileName, contentType) {
    const a = document.createElement('a');
    const file = new Blob([content], {
        type: contentType,
    });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}
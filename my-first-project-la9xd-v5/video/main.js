/*jshint esversion:6*/

$(function () {
    const { InferenceEngine, CVImage } = inferencejs;
    const inferEngine = new InferenceEngine();
    const video = $("#video")[0];
    var workerId;

    // Load AI Model
    const loadModelPromise = inferEngine
        .startWorker("my-first-project-la9xd", "5", "rf_PJa5CqEWARUe88POnbX2eAIOFoB3")
        .then((id) => { workerId = id; });

    // Handle Video Upload
    $("#videoUpload").on("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            video.src = url;
            video.onloadeddata = function () {
                video.play();
                resizeCanvas();
                detectFrame();
            };
        }
    });

    var canvas, ctx;
    const font = "16px sans-serif";

    const resizeCanvas = function () {
        $("canvas").remove();
        canvas = $("<canvas/>");
        ctx = canvas[0].getContext("2d");

        canvas[0].width = video.videoWidth;
        canvas[0].height = video.videoHeight;
        canvas.css({
            width: video.clientWidth,
            height: video.clientHeight
        });

        $("body").append(canvas);
    };

    const renderPredictions = function (predictions) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        predictions.forEach(function (prediction) {
            let { x, y, width, height } = prediction.bbox;
            let scaleX = ctx.canvas.width / video.videoWidth;
            let scaleY = ctx.canvas.height / video.videoHeight;

            ctx.strokeStyle = prediction.color;
            ctx.lineWidth = 4;
            ctx.strokeRect(x * scaleX, y * scaleY, width * scaleX, height * scaleY);

            ctx.fillStyle = prediction.color;
            ctx.fillRect(x * scaleX, y * scaleY - 20, ctx.measureText(prediction.class).width + 10, 20);

            ctx.font = font;
            ctx.fillStyle = "#000";
            ctx.fillText(prediction.class, x * scaleX + 5, y * scaleY - 15);
        });
    };

    const detectFrame = function () {
        if (!workerId || video.paused || video.ended) return;
        const image = new CVImage(video);
        inferEngine
            .infer(workerId, image)
            .then((predictions) => {
                renderPredictions(predictions);
                requestAnimationFrame(detectFrame);
            })
            .catch((e) => {
                console.error("Error:", e);
                requestAnimationFrame(detectFrame);
            });
    };
});

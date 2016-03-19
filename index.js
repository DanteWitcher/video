(function() {
    var filterSelect = document.querySelector('.controls__filter'),
        filterName = filterSelect.value,
        video = document.querySelector('.camera__video'),
        canvas = document.querySelector('.camera__canvas'),
        output = canvas.getContext('2d'),
        width, height;

    // listen change
    filterSelect.addEventListener('change', function(e) {
        filterName = e.target.value;
    });

    var requestAnimationFrame =
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };

    var getVideoStream = function(callback) {
        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;

        if (navigator.getUserMedia) {
            navigator.getUserMedia({ video: true },
                function(stream) {
                    video.src = window.URL.createObjectURL(stream);
                    video.onloadedmetadata = function(e) {
                        width = canvas.width = video.videoWidth;
                        height = canvas.height = video.videoHeight;

                        video.play();

                        callback();
                    };
                },
                function(err) {
                    console.log("The following error occured: " + err.name);
                }
            );
        } else {
            console.log("getUserMedia not supported");
        }
    };

    var filters = {
        invert: function(pixels, index) {
            pixels[index] = 255 - pixels[index];
            pixels[index + 1] = 255 - pixels[index + 1];
            pixels[index + 2] = 255 - pixels[index + 2];

            return pixels;
        },
        grayscale: function(pixels, index) {
            var r = pixels[index];
            var g = pixels[index + 1];
            var b = pixels[index + 2];
            var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;

            pixels[index] = pixels[index + 1] = pixels[index + 2] = v;

            return pixels;
        },
        threshold: function(pixels, index) {
            var r = pixels[index];
            var g = pixels[index + 1];
            var b = pixels[index + 2];
            var v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= 128) ? 255 : 0;
            pixels[index] = pixels[index + 1] = pixels[index + 2] = v;

            return pixels;
        }
    };

    var applyFilterToPixel = function(pixels, index) {
        return filters[filterName](pixels, index);
    };

    var applyFilter = function(pixels) {
        for (var i = 0; i < pixels.data.length; i += 4) {
            applyFilterToPixel(pixels.data, i);
        }
    };

    var captureFrame = function() {
        requestAnimationFrame(captureFrame);

        output.drawImage(video, 0, 0, width, height, 0, 0, width, height);
        var pixels = output.getImageData(0, 0, width, height);

        applyFilter(pixels);

        output.putImageData(pixels, 0, 0);
    };

    getVideoStream(function() {
        captureFrame();
    });
})();
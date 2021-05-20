"use strict";


$(document).ready(() => {
    console.log("Document ready");

    const URL = window.URL || window.webkitURL
    const socket = io.connect(window.location.host, { path: window.location.pathname+"socket.io" });


    let player = null;
    let html = `
<video class="video-js" id="my-video">
<source id="video" src="{{url}}" type="video/mp4" />
<p class="vjs-no-js">
To view this video please enable JavaScript, and consider upgrading to a
web browser that
<a href="https://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
</p>
</video>
`;

    let changing = {
        time: false,
        pause: false,
        play: false
    };
    let timeout = null;
    socket.on('update', data => {
        console.log('data: ', data);
        if (player) {
            if (data.t || data.t === 0) {
                changing.time = true;
                player.currentTime(data.t);
            }
            if (data.p) {
                changing.pause = true;
                player.play();
            }
            if (data.s) {
                changing.play = true;
                player.pause();
            }
        }
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            changing.time = false;
            changing.pause = false;
            changing.play = false;
        }, 300);
    });

    $('#video_input').on('change', (e) => {
        let to_send = { name: $('#ID_input').val() };
        socket.emit('start', to_send);


        const file = e.target.files[0];
        console.log('file: ', file);
        const fileURL = URL.createObjectURL(file);
        console.log('fileURL: ', fileURL);

        let new_html = html.replace('{{url}}', fileURL);


        if (player) player.dispose();
        $('#main-div').html(new_html);

        player = videojs('my-video', {
            controls: true,
            autoplay: false
        });

        player.on("seeking", () => {
            if (changing.time) {
                changing.time = false;
                return;
            }
            console.log("Updated");
            socket.emit('update', {
                t: player.currentTime()
            });
            // # Send seeking to all
        });
        player.on("pause", () => {
            if (changing.pause) {
                changing.pause = false;
                return;
            }
            console.log("Stopped");
            socket.emit('update', {
                s: true,
                t: player.currentTime()
            });
            // # Send pause to all
        });
        player.on("play", () => {
            if (changing.play) {
                changing.play = false;
                return;
            }
            console.log("Play");
            socket.emit('update', {
                p: true,
                t: player.currentTime(),
            });
            // # Send play to all
        });

        player.ready(function () {
            console.log("I'm ready!");
            var howMuchIsDownloaded = player.bufferedPercent();
            console.log('howMuchIsDownloaded: ', howMuchIsDownloaded);
            // # Send ready
        });


        player.on("ended", () => {
            player.exitFullscreen();
        });
    });
});


function displayMessage(message, isError) {
    let message_div = $('#message');
    message_div.html(message);
    message_div.removeClass('error');
    message_div.removeClass('info');
    message_div.addClass(isError ? 'error' : 'info');
}



function createVideo() {
    //     <video src="http://v2v.cc/~j/theora_testsuite/320x240.ogg" controls>
    //   Tu navegador no implementa el elemento <code>video</code>.
    // </video>
}
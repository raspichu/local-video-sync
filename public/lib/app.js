"use strict";


$(document).ready(() => {
    console.log("Document ready");

    const URL = window.URL || window.webkitURL
    const socket = io();


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

    let changing_time = false;
    socket.on('update', data => {
        console.log('data: ', data);
        if (player) {
            if (data.t || data.t === 0) {
                changing_time = true;
                player.currentTime(data.t);
            }
            if (data.p) player.play();
            if (data.s) player.pause();
        }
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
            console.log("Updated");
            if (changing_time) {
                changing_time = false;
                return;
            }
            console.log("Sending update")
            socket.emit('update', {
                t: player.currentTime()
            });
            // # Send seeking to all
        });
        player.on("pause", () => {
            console.log("Stopped");
            socket.emit('update', {
                s: true,
                t: player.currentTime()
            });
            // # Send pause to all
        });
        player.on("play", () => {
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
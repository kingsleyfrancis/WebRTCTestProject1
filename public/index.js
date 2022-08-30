window.onload = function() {
    const socket = io();

    const fromSocket = document.getElementById('userId');

    //Get socket Id
    socket.on('connect', () => {
        fromSocket.innerHTML = socket.id;
    });

    //create mediastream using constructor
    let mediastream = new MediaStream();
    console.log('Stream 1: ', mediastream);

    //create mediastream using media devices
    navigator.mediaDevices.getUserMedia({video: true, audio: true})
        .then(stream => {
            console.log('Stream 2: ', stream);
        })
};
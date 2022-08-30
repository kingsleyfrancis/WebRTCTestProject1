window.onload = () => {
    const socket = io();

    const fromSocket = document.getElementById('userId');

    // Global variables
    let isStarted = false;
    let tracks;
    let fromSocketId;

    // Rtc connection
    const configuration = {iceServers: [{urls: 'stun:stun.l.google.com:19302'}]};
    let peer = new RTCPeerConnection(configuration);

    //Get video elements
    const localVideo = document.getElementById('localvideo');
    const remoteVideo = document.getElementById('remotevideo');

    // Get all buttons
    const startBtn = document.getElementById('start');
    const stopBtn = document.getElementById('stop');
    const muteBtn = document.getElementById('mute');
    const unmuteBtn = document.getElementById('unmute');

    const inputElem = document.getElementById('mobileid');


    //Get socket Id
    socket.on('connect', () => {
        fromSocket.innerHTML = socket.id;
        fromSocketId = socket.id;
    });

    //Recieve offer
    socket.on('offer', (data) => {
        peer.setRemoteDescription(data.offer);

        let strm = new MediaStream();
        //create answer
        createAnswer(data.senderId);
        peer.ontrack = e => {
            strm.addTrack(e.track);
            remoteVideo.srcObject = strm;
        };
    });

    //Receive answer
    socket.on('answer', data => {
        peer.setRemoteDescription(data.answer);
        let strm = new MediaStream();

        peer.ontrack = e => {
            strm.addTrack(e.track);
            remoteVideo.srcObject = strm;
        };
    });

    //Receive caller candidate
    socket.on('callerCandidate', data => {
        peer.addIceCandidate(data);
    });

    socket.on('receiverCandidate', data => {
        peer.addIceCandidate(data);
    });


    //get local media
    const openMediaDevices = async () => {
        try{
            let stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
            if(stream.active) {
                tracks = stream.getTracks();

                localVideo.srcObject = stream;
                //remoteVideo.srcObject = clonedStream;

                isStarted = true;
            }
            return stream;
        } catch(error) {
            console.error(error);
            return null;
        }
    };

    // Create offer async function
    const createOffer = async (stream, receiverId) => {
        try {
            if(stream.active) {
                let localTracks = stream.getTracks();

                // Add track to peer
                localTracks.forEach(track => peer.addTrack(track));

                let offer = await peer.createOffer();
                peer.setLocalDescription(new RTCSessionDescription(offer));

                // connect to ice candidate
                peer.addEventListener('icecandidate', e => {
                    socket.emit('callerCandidate', {'candidate': e.candidate, senderId: fromSocketId, receiverId });
                });

                console.log('rtc offer created');

                //send offer to signalling server
                socket.emit('offer', {senderId: fromSocketId, receiverId,  offer});
            }
        } catch(error) {
            console.log('Error: ', error);
        }
    };

    const createAnswer = async (senderId) => {
        try {
            let localStream = await openMediaDevices();
            localStream.getTracks().forEach(track => peer.addTrack(track));
            let answer = await peer.createAnswer();
            peer.setLocalDescription(new RTCSessionDescription(answer));

            // connect to ice candidate
            peer.addEventListener('icecandidate', e => {
                socket.emit('receiverCandidate', {'candidate': e.candidate, senderId: fromSocketId, receiverId: senderId });
            });

            socket.emit('answer', {answer, senderId: fromSocketId, receiverId: senderId});
        } catch(error) {
            console.error('CreateAnswer failed: ', error);
        }
    }

   //start a call
   startBtn.addEventListener('click', async () => {
       console.log('Starting a call');
       let receiverId = inputElem.value;
       if(!receiverId) {
            alert("Please provide the receiver's id before starting call");
            return;
       }

       let stream = await openMediaDevices();

       //create offer
       if(stream) {
            await createOffer(stream, receiverId);
       }

       //Setup the other events
       stopBtn.addEventListener('click', stopCall); 
       unmuteBtn.addEventListener('click', unmuteCall);
       muteBtn.addEventListener('click', muteCall);
   })

   //stop a call
   const stopCall = () => {
        if(isStarted && tracks) {
            console.log('Stopping a call');
            tracks.forEach(track => track.stop());
            isStarted = false;
        }
   };

   const muteCall = () => {
       if(isStarted && tracks) {
            console.log('Muting the speaker');
            tracks.forEach(track => track.enabled = false);
       }
   };

   const unmuteCall = () => {
       if(isStarted && tracks) {
           console.log('Unmuting the speaker');
           tracks.forEach(track => track.enabled = true);
       }
   };

   
};

const express = require('express');
const http = require('http');
const socketio = require('socket.io');

//create express server
const app = express();
const httpServer = http.createServer(app);
const port = process.env.PORT || 4200;

//serve public folder
app.use(express.static('public'));

httpServer.listen(port,  () => {
    console.log('Server is running on port: ', port);
});


const io = socketio(httpServer);
io.on('connection', (socket) => {
    console.log('User Connected ', socket.id);

    socket.on('offer', data => {
        console.log('Sending offer to: ', data.receiverId);
        io.to(data.receiverId).emit('offer', data);
    });

    socket.on('answer', data => {
        console.log('Sending answer to: ', data.receiverId);
        io.to(data.receiverId).emit('answer', data);
    });

    socket.on('callerCandidate', data => {
        io.to(data.receiverId).emit('callerCandidate', data.candidate);
    });

    socket.on('receiverCandidate', data => {
        io.to(data.receiverId).emit('receiverCandidate', data.candidate);
    })
});



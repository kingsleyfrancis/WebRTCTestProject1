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
});

"use strict";

const express = require('express');
const cors = require('cors');
const moment = require('moment-timezone');
const bodyParser = require('body-parser');

const app = express();
const server = require('http').createServer(app);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.use(cors());

const PORT = process.env.PORT || 8005;


const io = require('socket.io')(server);
io.on('connection', socket => {
    console.log('Clinet connected');
    socket.on('start', (data) => {
        console.log('data: ', data);
        let room = data.name || 'default';
        socket.join(room);
        socket.room = room;
    });
    socket.on("update", (data) => {
        socket.to(socket.room).emit('update', data);
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});


console.log("[ ----- Iniciando", moment().format('YYYY-MM-DD HH:mm:ss'), '----- ]');



server.listen(PORT, (err) => {
    if (err) {
        return console.log('Something bad happened', err);
    }
    console.log('Server is listening on port', PORT);
});
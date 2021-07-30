import {Game} from "./game";
import {Socket} from "socket.io";
import {Request, Response} from "express";
import cors from 'cors';
import bodyParser from 'body-parser';

const game = new Game();

const express = require('express');
const app = express();
app.use(cors())
// parse application/json
app.use(bodyParser.json())
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io")
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.get('/', (req:Request, res:Response) => {
    res.send('<h1>Hello Poyais!</h1>');
});

app.post('/miner', (req:Request, res:Response) => {
    const {x, y} = req.body;
    game.addMiner(x, y);
    res.json({});
})

io.on('connection', (socket:Socket) => {
    console.log('a user connected');

    socket.emit('initial-state', JSON.stringify(game.getInitialState()));

    const emitStatic = setInterval(() => {
        socket.emit('initial-state', JSON.stringify(game.getInitialState()));
    }, 2000)

    const emitInterval = setInterval(() => {
        socket.emit('state', JSON.stringify(game.getState()));
    }, 1000 / 20)

    socket.on('disconnect', () => {
        console.log('user disconnected');
        clearInterval(emitInterval)
    });

});

server.listen(3000, () => {
    console.log('listening on *:3000');
});


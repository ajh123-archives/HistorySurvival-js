import Player from '../core/player.js';

import express from 'express';
import path from 'path'
const app = express();
import http from 'http';
const server = http.createServer(app);
import { Server } from "socket.io";
const io = new Server(server);


app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '..', '..', 'dist', 'index.html'),);
});

app.get('/*', (req, res) => {
	res.sendFile(path.join(__dirname, '..', '..', 'dist', req.path),);
});

io.on('connection', (socket) => {
	console.log('a user connected');
	new Player(socket);
	socket.on('disconnect', () => {
		console.log('user disconnected');
	});
});

server.listen(3000, () => {
	console.log('listening on http://localhost:3000');
});

import Player from '../core/player.js';

import express from 'express';
import path from 'path'
import http from 'http';
import { fileURLToPath } from 'url';
import { Server } from "socket.io";
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const __dirname = path.dirname(fileURLToPath(import.meta.url));


app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '..', '..', 'dist', 'index.html'),);
});

app.get('/*', (req, res) => {
	res.sendFile(path.join(__dirname, '..', '..', 'dist', req.path),);
});

io.on('connection', (socket) => {
	console.log('a user connected');
	new Player({socket});
	socket.on('disconnect', () => {
		console.log('user disconnected');
	});
});

server.listen(3000, () => {
	console.log('listening on http://localhost:3000');
});

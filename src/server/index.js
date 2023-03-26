import express from 'express';
import path from 'path'
import http from 'http';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';

import Player from '../core/player';
import Planet from '../core/world'


const app = express();
const server = http.createServer(app);
const io = new Server(server);
const planet = new Planet({chunkSize: 16, numChunks: 4});
planet.generate();

const __dirname = path.dirname(fileURLToPath(import.meta.url));


app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'),);
});

app.get('/*', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'dist', req.path),);
});

io.on('connection', (socket) => {
	console.log('a user connected');
	var player = new Player({socket});
	player.position.set(0, (planet.chunkSize*planet.numChunks), 0);
	player.sendPosition();
	socket.on('loadTerrain', (callback) => {
		callback([planet.serialise()]);
	});
	socket.on('disconnect', () => {
		console.log('user disconnected');
	});
});

server.listen(3000, () => {
	console.log('listening on http://localhost:3000');
});

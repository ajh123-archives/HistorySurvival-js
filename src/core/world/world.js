import {
	Group, Vector3,
} from 'three';

import Chunk from './chunk';


class Planet extends Group {
	constructor({chunkSize, numChunks}) {
		super();
		this.chunkSize = chunkSize; // the size of each chunk in voxels
		this.numChunks = numChunks; // the number of chunks in each dimension (i.e. 4 x 4 x 4 chunks)
		this.terrain = [];
	}

	generate() {
		for (var x = 0; x < this.numChunks; x++) {
			this.terrain[x] = [];
			for (var y = 0; y < this.numChunks; y++) {
				this.terrain[x][y] = [];
				for (var z = 0; z < this.numChunks; z++) {
					 // create an empty container for the voxels
					var chunk = new Chunk({chunkPos: new Vector3(x, y, z), chunkSize: this.chunkSize});
					this.terrain[x][y][z] = chunk;
					for (var cx = 0; cx < this.chunkSize; cx++) {
						for (var cy = 0; cy < this.chunkSize; cy++) {
							for (var cz = 0; cz < this.chunkSize; cz++) {
								var voxel = {
									color: 0x00ff00
								}
								chunk.setVoxel(cx, cy, cz, voxel); // add the voxel to the chunk
							}
						}
					}
				}
			}
		}
	}

	serialise() {
		var newData = []
		for (var x = 0; x < this.numChunks; x++) {
			for (var y = 0; y < this.numChunks; y++) {
				for (var z = 0; z < this.numChunks; z++) {
					console.log(x, y, z);
					newData[x] = [];
					newData[x][y] = [];
					newData[x][y][z] = this.terrain[x][y][z].serialise();
				}
			}
		}

		return {
			position: {x: this.position.x, y: this.position.y, z: this.position.z},
			chunkSize: this.chunkSize,
			numChunks: this.numChunks,
			terrain: newData,
		}
	}

	deserialise(planet) {
		this.position.set(planet.position.x, planet.position.y, planet.position.z);
		this.chunkSize = planet.chunkSize;
		this.numChunks = planet.numChunks;

		var newData = [];
		for (var x = 0; x < this.numChunks; x++) {
			for (var y = 0; y < this.numChunks; y++) {
				for (var z = 0; z < this.numChunks; z++) {
					console.log(x, y, z);
					newData[x] = [];
					newData[x][y] = [];
					newData[x][y][z] = new Chunk({chunkPos: new Vector3(x, y, z), chunkSize: planet.chunkSize}).deserialise(planet.terrain[x][y][z]);
				}
			}
		}
		this.terrain = newData;
	}
}

export default Planet;

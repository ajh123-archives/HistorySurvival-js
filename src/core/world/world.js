import {
	Group, Vector3,
} from 'three';

import Chunk from './chunk';
import Voxel from './voxel'


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
								var amount = -1;
								if (cx == 0 && cx == this.chunkSize) {
									amount = 1;
									console.log("t")
								} else if (cy == 0 && cy == this.chunkSize) {
									amount = 1;
									console.log("t")
								} else if (cz == 0 && cz == this.chunkSize) {
									amount = 1;
									console.log("t")
								}
								
								chunk.setVoxel(cx, cy, cz, new Voxel({
									color: 0x00ff00,
									amount: amount
								})); // add the voxel to the chunk
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
			newData[x] = [];
			for (var y = 0; y < this.numChunks; y++) {
				newData[x][y] = [];
				for (var z = 0; z < this.numChunks; z++) {
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

		this.terrain = [];
		for (var x = 0; x < this.numChunks; x++) {
			this.terrain[x] = [];
			for (var y = 0; y < this.numChunks; y++) {
				this.terrain[x][y] = [];
				for (var z = 0; z < this.numChunks; z++) {
					this.terrain[x][y][z] = new Chunk({
						chunkPos: new Vector3(x, y, z), 
						chunkSize: planet.chunkSize
					});
					this.terrain[x][y][z].deserialise(planet.terrain[x][y][z]);
				}
			}
		}
	}
}

export default Planet;

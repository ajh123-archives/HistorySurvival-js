import {
	Group,
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
				for (var z = 0; z <this. numChunks; z++) {
					 // create an empty container for the voxels
					this.terrain[x][y][z] = [];
					var chunk = this.terrain[x][y][z];
					for (var cx = 0; cx < this.chunkSize; cx++) {
						chunk[cx] = [];
						for (var cy = 0; cy < this.chunkSize; cy++) {
							chunk[cx][cy] = [];
							for (var cz = 0; cz < this.chunkSize; cz++) {
								chunk[cx][cy][cz] = [];
								var voxel = {
									color: 0x00ff00
								}
								chunk[cx][cy][cz] = voxel; // add the voxel to the chunk
							}
						}
					}
				}
			}
		}
	}

	serialise() {
		return {
			position: {x: this.position.x, y: this.position.y, z: this.position.z},
			chunkSize: this.chunkSize,
			numChunks: this.numChunks,
			terrain: this.terrain,
		}
	}

	deserialise(planet) {
		this.position.set(planet.position.x, planet.position.y, planet.position.z);
		this.chunkSize = planet.chunkSize;
		this.numChunks = planet.numChunks,
		this.terrain = planet.terrain;
	}
}

export default Planet;

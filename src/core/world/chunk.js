import {
	BufferGeometry,
	MeshStandardMaterial,
	Mesh,
	Color,
} from 'three';
import MarchingCubes from './marching_cubes/marching_cubes';
import Voxel from './voxel'


class Chunk {
	constructor({chunkPos, chunkSize}) {
		this.chunkSize = chunkSize; // the size of each chunk in voxels
		this.chunkPos = chunkPos;
		this.data = [];
		this.userData = {};

		this.geometry = new BufferGeometry();
		this.material = new MeshStandardMaterial({color: 0xFFFFFF});
		this.mesh = new Mesh(this.geometry, this.material);
		this.mesh.position.set(
			chunkPos.x, 
			chunkPos.y, 
			chunkPos.z
		);
		this.marchingCubes = new MarchingCubes(chunkSize, chunkSize, chunkSize, this);
	}

	setVoxel(cx, cy, cz, voxel) {
		if (cx > this.chunkSize && cy > this.chunkSize && cz > this.chunkSize) {
			throw Error("Paramaters (cx, cy, or cz) are bigger than " + this.chunkSize);
		}

		if (this.data[cx] == undefined) {
			this.data[cx] = [];
		}
		if (this.data[cx][cy] == undefined) {
			this.data[cx][cy] = [];
		}
		this.data[cx][cy][cz] = voxel;
		this.marchingCubes.set(cx, cy, cz, voxel.amount);
		var color = new Color(voxel.color);
		this.marchingCubes.setColor(cx, cy, cz, color.r, color.g, color.b);
	}

	getVoxel(cx, cy, cz) {
		if (cx > this.chunkSize && cy > this.chunkSize && cz > this.chunkSize) {
			throw Error("Paramaters (cx, cy, or cz) are bigger than " + this.chunkSize);
		}

		if (this.data[cx] == undefined) {
			return undefined;
		}
		if (this.data[cx][cy] == undefined) {
			return undefined;
		}
		return this.data[cx][cy][cz];
	}

	serialise() {
		var newData = []
		for (var x = 0; x < this.chunkSize; x++) {
			newData[x] = [];
			for (var y = 0; y < this.chunkSize; y++) {
				newData[x][y] = [];
				for (var z = 0; z < this.chunkSize; z++) {
					newData[x][y][z] = this.data[x][y][z].serialise();
				}
			}
		}

		return {
			chunkPos: {x: this.chunkPos.x, y: this.chunkPos.y, z: this.chunkPos.z},
			chunkSize: this.chunkSize,
			data: newData,
		}
	}

	deserialise(chunk) {
		this.chunkPos.set(chunk.chunkPos.x, chunk.chunkPos.y, chunk.chunkPos.z);
		this.chunkSize = chunk.chunkSize;
		this.data = [];

		for (var x = 0; x < this.chunkSize; x++) {
			this.data[x] = [];
			for (var y = 0; y < this.chunkSize; y++) {
				this.data[x][y] = [];
				for (var z = 0; z < this.chunkSize; z++) {
					this.setVoxel(x, y, z, new Voxel({
						color: chunk.data[x][y][z].color, 
						amount: chunk.data[x][y][z].amount
					}));
					this.data[x][y][z].deserialise(chunk.data[x][y][z]);
				}
			}
		}
	}

	buildMesh() {
		this.marchingCubes.setMesh(this.geometry, 0);
	}
}

export default Chunk;

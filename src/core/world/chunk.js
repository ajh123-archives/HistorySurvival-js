class Chunk {
	constructor({chunkSize}) {
		this.chunkSize = chunkSize; // the size of each chunk in voxels
		this.data = [];
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
}

export default Chunk;

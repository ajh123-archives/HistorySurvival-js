import {
	// BufferAttribute,
	Float32BufferAttribute,
	// Color,
} from 'three';
import {triangulationTable, edgeTable} from './variables'


class MarchingCubes {
	constructor(chunk, sampleSize = 1) {
		this.sampleSize = sampleSize;
		this.chunk = chunk;

		this.vertices = [];
		this.colors = [];

		this.edges = [];
		for (let i = 0; i < 12; i++) {
			this.edges.push(new Float32Array(3));
		}
	}

	generateMesh(geometry, surfaceLevel, chunk) {
		let x, y, z;

		let vIdx = 0;

		for (let i = 0; i < this.chunk.chunkSize; i++) {
			x = i * this.sampleSize;
			for (let j = 0; j < this.chunk.chunkSize; j++) {
				y = j * this.sampleSize;
				for (let k = 0; k < this.chunk.chunkSize; k++) {
					z = k * this.sampleSize;

					const v0 = chunk.getVoxel(i, j, k);
					const v1 = chunk.getVoxel(i + 1, j, k);
					const v2 = chunk.getVoxel(i + 1, j, k + 1);
					const v3 = chunk.getVoxel(i, j, k + 1);
					const v4 = chunk.getVoxel(i, j + 1, k);
					const v5 = chunk.getVoxel(i + 1, j + 1, k);
					const v6 = chunk.getVoxel(i + 1, j + 1, k + 1);
					const v7 = chunk.getVoxel(i, j + 1, k + 1)

					// console.log(v0, i, j, k);
					// console.log(v1, i + 1, j, k);
					// console.log(v2, i + 1, j, k + 1);
					// console.log(v3, i, j, k + 1);
					// console.log(v4, i, j + 1, k);
					// console.log(v5, i + 1, j + 1, k);
					// console.log(v6, i + 1, j + 1, k + 1);
					// console.log(v7, i, j + 1, k + 1);
					// console.log("----");

					// var color = new Color(v0.color);

					let cubeIndex = this.#getCubeIndex(surfaceLevel, v0, v1, v2, v3, v4, v5, v6, v7);
					let edgeIndex = edgeTable[cubeIndex];
					if (edgeIndex == 0) {
						continue;
					}
					let mu = this.sampleSize / 2;
					if (edgeIndex & 1) {
						mu = (surfaceLevel - v0) / (v1 - v0);
						this.#setFloatArray(this.edges[0], this.#lerp(x, x + this.sampleSize, mu), y, z);
					}
					if (edgeIndex & 2) {
						mu = (surfaceLevel - v1) / (v2 - v1);
						this.#setFloatArray(this.edges[1], x + this.sampleSize, y, this.#lerp(z, z + this.sampleSize, mu));
					}
					if (edgeIndex & 4) {
						mu = (surfaceLevel - v3) / (v2 - v3);
						this.#setFloatArray(this.edges[2], this.#lerp(x, x + this.sampleSize, mu), y, z + this.sampleSize);
					}
					if (edgeIndex & 8) {
						mu = (surfaceLevel - v0) / (v3 - v0);
						this.#setFloatArray(this.edges[3], x, y, this.#lerp(z, z + this.sampleSize, mu));
					}
					if (edgeIndex & 16) {
						mu = (surfaceLevel - v4) / (v5 - v4);
						this.#setFloatArray(this.edges[4], this.#lerp(x, x + this.sampleSize, mu), y + this.sampleSize, z);
					}
					if (edgeIndex & 32) {
						mu = (surfaceLevel - v5) / (v6 - v5);
						this.#setFloatArray(this.edges[5], x + this.sampleSize, y + this.sampleSize, this.#lerp(z, z + this.sampleSize, mu));
					}
					if (edgeIndex & 64) {
						mu = (surfaceLevel - v7) / (v6 - v7);
						this.#setFloatArray(this.edges[6], this.#lerp(x, x + this.sampleSize, mu), y + this.sampleSize, z + this.sampleSize);
					}
					if (edgeIndex & 128) {
						mu = (surfaceLevel - v4) / (v7 - v4);
						this.#setFloatArray(this.edges[7], x, y + this.sampleSize, this.#lerp(z, z + this.sampleSize, mu));
					}
					if (edgeIndex & 256) {
						mu = (surfaceLevel - v0) / (v4 - v0);
						this.#setFloatArray(this.edges[8], x, this.#lerp(y, y + this.sampleSize, mu), z);
					}
					if (edgeIndex & 512) {
						mu = (surfaceLevel - v1) / (v5 - v1);
						this.#setFloatArray(this.edges[9], x + this.sampleSize, this.#lerp(y, y + this.sampleSize, mu), z);
					}
					if (edgeIndex & 1024) {
						mu = (surfaceLevel - v2) / (v6 - v2);
						this.#setFloatArray(this.edges[10], x + this.sampleSize, this.#lerp(y, y + this.sampleSize, mu), z + this.sampleSize);
					}
					if (edgeIndex & 2048) {
						mu = (surfaceLevel - v3) / (v7 - v3);
						this.#setFloatArray(this.edges[11], x, this.#lerp(y, y + this.sampleSize, mu), z + this.sampleSize);
					}

					const triLen = triangulationTable[cubeIndex];
					for (let i = 0; i < triLen.length; i++) {
						if (triLen[i] === -1) {
							break;
						}
						const e = this.edges[triLen[i]];
						this.vertices.push(e[0], e[1], e[2]);
						// Add a color for each voxel
						// for (let i = 0; i < 24; i++) {
						// 	this.colors.push(color.r, color.g, color.b);
						// }
						// indices[idxCounter] = idxCounter;
						// idxCounter++;
						vIdx += 3;
					}
				}
			}
		}

		console.log(this.vertices);
		geometry.setAttribute('position', new Float32BufferAttribute(this.vertices, 3));
		// geometry.setAttribute('color', new Float32BufferAttribute(this.colors, 3));
		geometry.computeVertexNormals();

		// tell three.js that mesh has been updated
		geometry.attributes.position.needsUpdate = true;
		geometry.attributes.normal.needsUpdate = true;
	}

	#getCubeIndex(isoLevel, a, b, c, d, e, f, g, h) {
		let cubeIndex = 0;

		if (a < isoLevel) cubeIndex |= 1;
		if (b < isoLevel) cubeIndex |= 2;
		if (c < isoLevel) cubeIndex |= 4;
		if (d < isoLevel) cubeIndex |= 8;
		if (e < isoLevel) cubeIndex |= 16;
		if (f < isoLevel) cubeIndex |= 32;
		if (g < isoLevel) cubeIndex |= 64;
		if (h < isoLevel) cubeIndex |= 128;

		return cubeIndex;
	}

	#setFloatArray(arr, a, b, c) {
		arr[0] = a;
		arr[1] = b;
		arr[2] = c;
	}

	#lerp(start, end, amt) {
		return (1 - amt) * start + amt * end;
	}
}

export default MarchingCubes;

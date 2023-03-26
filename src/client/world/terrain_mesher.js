import {
	BufferGeometry,
	Float32BufferAttribute,
	Uint32BufferAttribute,
	Object3D,
	MeshStandardMaterial,
	Mesh,
	FrontSide,
} from 'three';


class ChunkMesher {
	constructor({debugGui, world, renderer}) {
		this.world = world;
		this.debugGui = debugGui;
		this.renderer = renderer;
		this.chunks = [];

		this.folder = this.debugGui.datGUI.addFolder('Terrain');
		// this.info = {useInterpolation: true};
		// this.folder.add(this.info, 'useInterpolation').onFinishChange(() => {
		// 	this.world.updateMesh();
		// });
	}

	buildVertices() {
		for(let x = 0; x < this.world.numChunks; x++) {
			for(let y = 0; y < this.world.numChunks; y++) {
				for(let z = 0; z < this.world.numChunks; z++) {
					var chunk = new Object3D();

					var positions = [];
					var normals = [];
					var indices = [];
					var colors = [];

					for (var i = 0; i < this.world.chunkSize; i++) {
						for (var j = 0; j < this.world.chunkSize; j++) {
							for (var k = 0; k < this.world.chunkSize; k++) {
								var vx = i + x * this.world.chunkSize;
								var vy = j + y * this.world.chunkSize;
								var vz = k + z * this.world.chunkSize;
								var index = positions.length / 3;
								positions.push(
									vx, vy, vz,
									vx + 1, vy, vz,
									vx + 1, vy + 1, vz,
									vx, vy + 1, vz,
									vx, vy, vz + 1,
									vx + 1, vy, vz + 1,
									vx + 1, vy + 1, vz + 1,
									vx, vy + 1, vz + 1,
									// Duplicate vertices with inverted normals
									vx, vy, vz,
									vx + 1, vy, vz,
									vx + 1, vy + 1, vz,
									vx, vy + 1, vz,
									vx, vy, vz + 1,
									vx + 1, vy, vz + 1,
									vx + 1, vy + 1, vz + 1,
									vx, vy + 1, vz + 1
								);
								normals.push(
									0, 0, -1,
									0, 0, -1,
									0, 0, -1,
									0, 0, -1,
									0, 0, 1,
									0, 0, 1,
									0, 0, 1,
									0, 0, 1,
									// Inverted normals
									0, 0, 1,
									0, 0, 1,
									0, 0, 1,
									0, 0, 1,
									0, 0, -1,
									0, 0, -1,
									0, 0, -1,
									0, 0, -1
								);
								indices.push(
									// Front face
									index, index + 1, index + 2,
									index, index + 2, index + 3,
									index + 16, index + 18, index + 17,
									index + 16, index + 19, index + 18,

									// Back face
									index + 4, index + 6, index + 5,
									index + 4, index + 7, index + 6,
									index + 20, index + 21, index + 22,
									index + 20, index + 22, index + 23,

									// Top face
									index + 3, index + 2, index + 6,
									index + 3, index + 6, index + 7,
									index + 19, index + 17, index + 21,
									index + 19, index + 21, index + 23,

									// Bottom face
									index, index + 4, index + 5,
									index, index + 5, index + 1,
									index + 16, index + 22, index + 18,
									index + 16, index + 20, index + 22,

									// Right face
									index + 1, index + 5, index + 6,
									index + 1, index + 6, index + 2,
									index + 17, index + 18, index + 22,
									index + 17, index + 22, index + 21,

									// Left face
									index, index + 3, index + 7,
									index, index + 7, index + 4,
									index + 16, index + 19, index + 23,
									index + 16, index + 23, index + 20,
								);
								colors.push(0x00ff00);
							}
						}
					}
					var geometry = new BufferGeometry();
					geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
					geometry.setAttribute('color', new Float32BufferAttribute(colors, 1));
					geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
					geometry.setIndex(new Uint32BufferAttribute(indices, 1));
					geometry.computeBoundingSphere();

					var material = new MeshStandardMaterial({
						vertexColors: true,
						side: FrontSide
					});
					var mesh = new Mesh(geometry, material);
					chunk.add(mesh);
					this.chunks.push({
						object: chunk,
						mesh: mesh,
						boundingSphere: geometry.boundingSphere,
						data: this.world.terrain[x][y][z],
					});
				}
			}
		}
	}

	renderChunks() {
		var chunks = [];

		for (let i = 0; i < this.chunks.length; i++) {
			const chunk = this.chunks[i];
			this.world.remove(chunk.object);

			// Check if chunk intersects with camera frustum
			if (!this.renderer.getFrustum().intersectsSphere(chunk.boundingSphere)) {
				// Skip rendering if chunk is entirely outside frustum
				continue;
			}
		  
			// Render chunk if it's inside or partially inside frustum
			chunks.push(chunk);
		}

		// Sort chunks by distance to camera
		chunks.sort((a, b) => {
			const distanceA = this.getDistanceToCamera(a);
			const distanceB = this.getDistanceToCamera(b);
			return distanceB - distanceA;
		});


		var count = 0;
		// Render chunks from front to back
		for (let i = 0; i < chunks.length; i++) {
			const chunk = chunks[i];
			this.world.add(chunk.object);
			count ++;
		}
		console.log(count);
	}

	// Calculate distance between chunk mesh and camera
	getDistanceToCamera(chunk) {
		const cameraPosition = this.renderer.camera.position;
		const meshPosition = chunk.mesh.position;
		const distance = cameraPosition.distanceTo(meshPosition);
		return distance;
	}
}

export default ChunkMesher;

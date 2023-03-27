import {
	BufferGeometry,
	Float32BufferAttribute,
	Object3D,
	BoxGeometry,
	MeshStandardMaterial,
	Mesh,
	FrontSide,
	Color,
} from 'three';


class ChunkMesher {
	constructor({debugGui, world, renderer}) {
		this.world = world;
		this.debugGui = debugGui;
		this.renderer = renderer;
		this.chunkQueue = [];
		this.meshedChunks = [];

		// this.folder = this.debugGui.datGUI.addFolder('Terrain');
		// this.info = {useInterpolation: true};
		// this.folder.add(this.info, 'useInterpolation').onFinishChange(() => {
		// 	this.world.updateMesh();
		// });
	}

	buildChunkVertices(chunk) {
		const x = chunk.chunkPos.x;
		const y = chunk.chunkPos.y;
		const z = chunk.chunkPos.z;

		// Create voxel mesh for each voxel in chunk
		const positions = [];
		const normals = [];
		const colors = [];
		const indices = [];
		let index = 0;
		for (let cx = 0; cx < this.world.chunkSize; cx++) {
			for (let cy = 0; cy < this.world.chunkSize; cy++) {
				for (let cz = 0; cz < this.world.chunkSize; cz++) {
					if (chunk !== undefined) {
						const voxelValue = chunk.getVoxel(cx, cy, cz);
						if (voxelValue !== undefined) {
							const color = new Color(voxelValue.color);
							const voxelGeometry = new BoxGeometry(1, 1, 1);
							voxelGeometry.translate(cx, cy, cz);
							const voxelPosition = voxelGeometry.attributes.position.array;
							const voxelNormal = voxelGeometry.attributes.normal.array;
							const voxelIndex = voxelGeometry.index.array;
							for (let i = 0; i < voxelPosition.length; i++) {
								positions.push(voxelPosition[i]);
							}
							for (let i = 0; i < voxelNormal.length; i++) {
								normals.push(voxelNormal[i]);
							}
							for (let i = 0; i < voxelIndex.length; i++) {
								indices.push(voxelIndex[i] + index);
							}
							// Add a color for each voxel
							for (let i = 0; i < 24; i++) {
								colors.push(color.r, color.g, color.b);
							}
							index += voxelPosition.length / 3;
						}
					}
				}
			}
		}

		var voxelMaterial = new MeshStandardMaterial({
			vertexColors: true,
			side: FrontSide
		});

		const chunkObject = new Object3D();
		// Create chunk mesh from merged voxel mesh
		const meshGeometry = new BufferGeometry();
		meshGeometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
		meshGeometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
		meshGeometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
		meshGeometry.setIndex(indices);
		meshGeometry.computeVertexNormals();
		const chunkMesh = new Mesh(meshGeometry, voxelMaterial);
		chunkMesh.position.set(x * this.world.chunkSize, y * this.world.chunkSize, z * this.world.chunkSize);
		chunkObject.mesh = chunkMesh;

		chunkObject.add(chunkMesh);
		chunk.userData = {
			object: chunkObject,
			mesh: chunkMesh,
		}
		this.meshedChunks.push(chunk);
	}

	async renderChunks() {
		var promises = [];
		for (let i = 0; i < this.chunkQueue.length; i++) {
			const build = new Promise((resolve) => {
				const chunk = this.chunkQueue.pop();
				this.buildChunkVertices(chunk);
				resolve();
			});
			promises.push(build);
		}
		await Promise.all(promises);

		const build = new Promise((resolve) => {
			var chunks = [];

			for (let i = 0; i < this.meshedChunks.length; i++) {
				const chunk = this.meshedChunks[i];
				this.world.remove(chunk.userData.object);
				chunks.push(chunk);
			}

			// Sort chunks by distance to camera
			chunks.sort((a, b) => {
				const distanceA = this.getDistanceToCamera(a);
				const distanceB = this.getDistanceToCamera(b);
				return distanceB - distanceA;
			});

			// Render chunks from front to back
			for (let i = 0; i < chunks.length; i++) {
				const chunk = chunks[i];
				this.world.add(chunk.userData.object);
			}
			resolve();
		});
		await Promise.all([build]);
	}

	// Calculate distance between chunk mesh and camera
	getDistanceToCamera(chunk) {
		const cameraPosition = this.renderer.camera.position;
		const meshPosition = chunk.userData.mesh.position;
		const distance = cameraPosition.distanceTo(meshPosition);
		return distance;
	}
}

export default ChunkMesher;

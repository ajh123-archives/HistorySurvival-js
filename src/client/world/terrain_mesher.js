class ChunkMesher {
	constructor({debugGui, world, renderer}) {
		this.world = world;
		this.debugGui = debugGui;
		this.renderer = renderer;
		// this.folder = this.debugGui.datGUI.addFolder('Terrain');
		// this.info = {useInterpolation: true};
		// this.folder.add(this.info, 'useInterpolation').onFinishChange(() => {
		// 	this.world.updateMesh();
		// });
	}

	buildWorldVertices() {
		for (var x = 0; x < this.world.numChunks; x++) {
			for (var y = 0; y < this.world.numChunks; y++) {
				for (var z = 0; z < this.world.numChunks; z++) {
					var chunk = this.world.terrain[x][y][z];
					chunk.buildMesh();
					if (chunk.userData.isAdded == undefined) {
						this.world.add(chunk.mesh);
						chunk.userData.isAdded = true;
					}
				}
			}
		}
	}
}

export default ChunkMesher;

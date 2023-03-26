import Planet from '../../core/world/world';
import TerrainMessher from './terrain_mesher';


class ClientPlanet extends Planet {
	constructor({
		socket,
		scene,
		debugGui,
		renderer
	}) {
		super({size: 0});
		this.mesh = null;
		this.socket = socket;
		this.mesher = new TerrainMessher({debugGui: debugGui, world: this, renderer:renderer});
		this.scene = scene;

		this.socket.emit('loadTerrain', (msg) => {
			this.deserialise(msg[0]);
			this.buildMesh();
		});
		this.scene.add(this);
	}

	updateMesh() {
		this.scene.remove(this);
		this.remove(this.mesh);
		this.mesh = null;
		this.socket.emit('loadTerrain', (msg) => {
			this.deserialise(msg[0]);
			this.buildMesh();
		});
		this.scene.add(this);
	}

	buildMesh() {
		this.mesher.buildVertices();
	}

	renderChunks() {
		this.mesher.renderChunks();
	}
}

export default ClientPlanet;

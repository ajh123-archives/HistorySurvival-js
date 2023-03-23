import {
	Vector3,
	MeshPhongMaterial,
	DoubleSide,
	BufferGeometry,
	BufferAttribute,
	Mesh,
} from 'three';

import Planet from '../../core/world';
import TerrainMessher from './terrain_mesher';


class ClientPlanet extends Planet {
	constructor({
		socket,
		scene,
	}) {
		super({size: 0});
		this.socket = socket;
		this.mesher = new TerrainMessher();
		socket.emit('loadTerrain');
		socket.on('loadTerrain', (msg) => {
			this.deserialise(msg[0]);
			this.buildMesh();
			scene.add(this);
		});
	}

	buildMesh() {
		this.mesher.colors = [];
		this.mesher.vertices = [];
		this.mesher.indecies = [];
		let center = this.getCenter();

		for(let x = 0; x < this.size - 1; x++) {
			for(let y = 0; y < this.size - 1; y++) {
				for(let z = 0; z < this.size - 1; z++) {
					let marchingIdx = this.mesher.getCubeIndexAt(this.terrain, x, y, z); 
					let pos = new Vector3(x - center.x, y - center.y, z - center.z)
					this.mesher.buildVertices(marchingIdx, pos, this.size);
				}	
			}				
		}

		var geometry = new BufferGeometry();
		console.log(this.mesher.vertices);
		geometry.setIndex(this.mesher.indecies);
		geometry.setAttribute('position', new BufferAttribute(new Float32Array(this.mesher.vertices), 3));
		geometry.setAttribute('color', new BufferAttribute(new Float32Array(this.mesher.colors), 3));
		geometry.computeVertexNormals();
		var material = new MeshPhongMaterial({
			side: DoubleSide,
			vertexColors: true
		});
		var mesh = new Mesh(geometry, material);
		mesh.position.set(0, 0, 0);
		this.add(mesh);
	}
}

export default ClientPlanet;

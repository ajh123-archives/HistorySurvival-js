import World, { WorldGen } from 'softxels/softxels.js';
import {
	MeshStandardMaterial,
} from 'three';

import Planet from '../core/world.js';


export const chunkSize = 32;
const chunkMaterial = new MeshStandardMaterial({
	metalness: 0.2,
	roughness: 0.8,
	vertexColors: true,
	envMapIntensity: 0.1,
});

class ClientPlanet extends Planet {
	constructor({
		socket,
	}) {
		super();
		this.socket = socket;

		this.world = new World({
			chunkMaterial,
			chunkSize,
			worldgen: WorldGen({generator: "terrain"})
		});
		this.add(this.world);
	}
}

export default ClientPlanet;

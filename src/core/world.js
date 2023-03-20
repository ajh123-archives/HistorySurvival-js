import { WorldGen } from 'softxels/softxels.js';
import World from 'softxels/softxels.js';
import {
	Group,
	MeshStandardMaterial,
} from 'three';


const chunkSize = 32;
const chunkMaterial = new MeshStandardMaterial({
	metalness: 0.2,
	roughness: 0.8,
	vertexColors: true,
	envMapIntensity: 0.1,
});


class Planet extends Group {
	constructor() {
		super();

		this.world = new World({
			chunkMaterial,
			chunkSize,
			worldgen: WorldGen({generator: "terrain"})
		});
		this.add(this.world);
	}
}

export default Planet;

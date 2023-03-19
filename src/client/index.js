import World, { WorldGen } from 'softxels';
import { 
	Scene, 
	MeshStandardMaterial, 
	SpotLight, 
	Color,
	PMREMGenerator,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import ClientPlayer from './player.js';
import Renderer from './renderer.js';
import io from 'socket.io/client-dist/socket.io'


Renderer.patchFog();
const renderer = new Renderer({
	info_entry: document.getElementById('info'),
	renderer: document.getElementById('app'),
});


class Main extends Scene {
	constructor() {
		super();

		const chunkSize = 32;
		const chunkMaterial = new MeshStandardMaterial({
			metalness: 0.2,
			roughness: 0.8,
			vertexColors: true,
			envMapIntensity: 0.1,
		});

		this.socket = io();
		this.player = new ClientPlayer({
			camera: renderer.camera,
			renderer: renderer.dom.renderer,
			dom: {info_entry: document.getElementById('info'),},
			socket: this.socket,
		});
		this.player.position.setScalar(chunkSize * 0.5);
		this.player.targetPosition.copy(this.player.position);
		this.player.camera.rotation.set(0, 0, 0, 'YXZ');
		this.player.targetRotation.copy(this.player.camera.rotation);
		this.player.raycaster.far = chunkSize * 1.5;
		this.add(this.player);
		this.environment = (new PMREMGenerator(renderer.renderer)).fromScene(new RoomEnvironment(), 0.04).texture;


		this.background = new Color(0x0A1A2A);
		const light = new SpotLight(0xFFFFFF, 2, 32, Math.PI / 3, 1);
		light.target.position.set(0, 0, -1);
		light.add(light.target);
		this.player.camera.add(light);


		this.world = new World({
			chunkMaterial,
			chunkSize,
			worldgen: WorldGen({generator: "terrain"})
		});
		this.add(this.world);
	}

	onAnimationTick(animation) {
		const {player, world } = this;
		player.onAnimationTick(animation);
		world.updateChunks(player.position);
	};

	onResize() {}
	onFirstInteraction() {}
}

renderer.scene = new Main();
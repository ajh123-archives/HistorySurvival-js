import Planet from '../core/world.js';


class ClientPlanet extends Planet {
	constructor({
		socket,
	}) {
		super();
		this.socket = socket;
	}
}

export default ClientPlanet;

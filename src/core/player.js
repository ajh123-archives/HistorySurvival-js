import {
	Group,
} from 'three';


class Player extends Group {
	constructor({
		socket,
	}) {
		super();
		this.socket = socket;

		socket.on('player_position', (msg) => {
			console.log('player_position: %d %d %d ', msg.x, msg.y, msg.z);
			this.position.setX(msg.x);
			this.position.setY(msg.y);
			this.position.setZ(msg.z);
		});
	}

	sendPosition() {
		this.socket.emit('player_position', {x:this.position.x, y:this.position.y, z:this.position.z});
	}
}

export default Player;

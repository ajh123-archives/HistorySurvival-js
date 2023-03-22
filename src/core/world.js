import {
	Group,
	Vector3
} from 'three';


class Planet extends Group {
	constructor({size}) {
		super();
		this.size = size;
		this.terrain = [];
	}

	build() {
		let center = this.getCenter();
		let radius = 2 * this.size/6;
		for(let x = 0; x < this.size; x++) {
			this.terrain[x] = [];
			for(let y = 0; y < this.size; y++) {
				this.terrain[x][y]=[];
				for(let z = 0; z < this.size; z++) {
					let point = new Vector3(x, y ,z);
					this.terrain[x][y][z] = point.distanceTo(center) < radius ? 1 : 0;
				}	
			}				
		}
	}

	getCenter() {
		return new Vector3(this.size / 2, this.size / 2, this.size / 2);
	}
}

export default Planet;

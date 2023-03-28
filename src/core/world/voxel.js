class Voxel {
	constructor({color, amount}) {
		this.color = color;
		this.amount = amount;
	}

	serialise() {
		return {
			color: this.color,
			amount: this.amount,
		}
	}

	deserialise(voxel) {
		this.color = voxel.color;
		this.amount = voxel.amount;
	}
}

export default Voxel;

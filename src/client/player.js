import {
	MathUtils,
	Raycaster,
	Vector2,
	Vector3,
} from 'three';

import Player from '../core/player';


class ClientPlayer extends Player {
	constructor({
		camera,
		viewport,
		debugGui,
		socket,
	}) {
		super({socket});

		this.aux = {
			center: new Vector2(),
			direction: new Vector3(),
			forward: new Vector3(),
			right: new Vector3(),
			worldUp: new Vector3(0, 1, 0),
		};
		this.buttons = {
			primary: false,
			secondary: false,
			tertiary: false,
		};
		this.buttonState = { ...this.buttons };
		this.camera = camera;
		this.keyboard = new Vector3(0, 0, 0);
		this.pointer = new Vector2(0, 0);
		this.raycaster = new Raycaster();
		this.speed = 8;
		this.targetRotation = camera.rotation.clone();
		this.add(camera);

		this.onBlur = this.onBlur.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.onKeyUp = this.onKeyUp.bind(this);
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
		this.onMouseWheel = this.onMouseWheel.bind(this);
		this.onPointerLock = this.onPointerLock.bind(this);
		this.requestPointerLock = this.requestPointerLock.bind(this);
		window.addEventListener('blur', this.onBlur);
		document.addEventListener('keydown', this.onKeyDown);
		document.addEventListener('keyup', this.onKeyUp);
		document.addEventListener('mousedown', this.onMouseDown);
		document.addEventListener('mousemove', this.onMouseMove);
		document.addEventListener('mouseup', this.onMouseUp);
		document.addEventListener('wheel', this.onMouseWheel, false);
		document.addEventListener('pointerlockchange', this.onPointerLock);
		viewport.addEventListener('mousedown', this.requestPointerLock);

        this.debugGui = debugGui;
        this.folder = this.debugGui.datGUI.addFolder('Player');
        this.info = {x: 0, y: 0, z: 0};
        this.folder.add(this.info, 'x');
		this.folder.add(this.info, 'y');
		this.folder.add(this.info, 'z');
	}

	onAnimationTick(animation) {
		const {
			aux: {
				center,
				direction,
				forward,
				right,
				worldUp,
			},
            info,
            folder,
			buttons,
			buttonState,
			camera,
			keyboard,
			isLocked,
			pointer,
			position,
			speed,
			targetPosition,
			targetRotation,
			raycaster,
		} = this;
		if (isLocked) {
			if (pointer.x !== 0 || pointer.y !== 0) {
				targetRotation.y += pointer.x;
				targetRotation.x += pointer.y;
				targetRotation.x = Math.min(Math.max(targetRotation.x, Math.PI * -0.5), Math.PI * 0.5);
				pointer.set(0, 0);
			}
			camera.rotation.y = MathUtils.damp(camera.rotation.y, targetRotation.y, 20, animation.delta);
			camera.rotation.x = MathUtils.damp(camera.rotation.x, targetRotation.x, 20, animation.delta);
			['primary', 'secondary', 'tertiary'].forEach((button) => {
				const state = buttonState[button];
				buttons[`${button}Down`] = state && buttons[button] !== state;
				buttons[`${button}Up`] = !state && buttons[button] !== state;
				buttons[button] = state;
			});
			if (
				keyboard.x !== 0
				|| keyboard.y !== 0
				|| keyboard.z !== 0
			) {
				camera.getWorldDirection(forward);
				right.crossVectors(worldUp, forward);
				targetPosition.addScaledVector(
					direction
						.set(0, 0, 0)
						.addScaledVector(right, -keyboard.x)
						.addScaledVector(worldUp, keyboard.y)
						.addScaledVector(forward, keyboard.z)
						.normalize(),
					animation.delta * speed
				);
				this.updateMatrixWorld();
			}
		}
		position.x = MathUtils.damp(position.x, targetPosition.x, 10, animation.delta);
		position.y = MathUtils.damp(position.y, targetPosition.y, 10, animation.delta);
		position.z = MathUtils.damp(position.z, targetPosition.z, 10, animation.delta);

		this.updateMatrixWorld();
		raycaster.setFromCamera(center, camera);

		const x = Math.round(position.x * 100) / 100;
		const y = Math.round(position.y * 100) / 100;
		const z = Math.round(position.z * 100) / 100;

		info.x = x;
		info.y = y;
		info.z = z;
		folder.updateDisplay();
		this.sendPosition();
	}

	onBlur() {
		const { buttonState, keyboard } = this;
		buttonState.primary = false;
		buttonState.secondary = false;
		buttonState.tertiary = false;
		keyboard.set(0, 0, 0);
	}

	onKeyDown({ keyCode, repeat }) {
		const { buttonState, keyboard } = this;
		if (repeat) return;
		switch (keyCode) {
			case 16:
				keyboard.y = -1;
				break;
			case 32:
				keyboard.y = 1;
				break;
			case 87:
				keyboard.z = 1;
				break;
			case 83:
				keyboard.z = -1;
				break;
			case 65:
				keyboard.x = -1;
				break;
			case 68:
				keyboard.x = 1;
				break;
			case 70:
				buttonState.tertiary = true;
				break;
			default:
				break;
		}
	}

	onKeyUp({ keyCode, repeat }) {
		const { buttonState, keyboard } = this;
		if (repeat) return;
		switch (keyCode) {
			case 16:
				if (keyboard.y < 0) keyboard.y = 0;
				break;
			case 32:
				if (keyboard.y > 0) keyboard.y = 0;
				break;
			case 87:
				if (keyboard.z > 0) keyboard.z = 0;
				break;
			case 83:
				if (keyboard.z < 0) keyboard.z = 0;
				break;
			case 65:
				if (keyboard.x < 0) keyboard.x = 0;
				break;
			case 68:
				if (keyboard.x > 0) keyboard.x = 0;
				break;
			case 70:
				buttonState.tertiary = false;
				break;
			default:
				break;
		}
	}

	onMouseDown({ button }) {
		const { buttonState, isLocked } = this;
		if (!isLocked) {
			return;
		}
		switch (button) {
			case 0:
				buttonState.primary = true;
				break;
			case 1:
				buttonState.tertiary = true;
				break;
			case 2:
				buttonState.secondary = true;
				break;
			default:
				break;
		}
	}

	onMouseMove({ movementX, movementY }) {
		const { isLocked, pointer } = this;
		if (!isLocked) {
			return;
		}
		pointer.x -= movementX * 0.003;
		pointer.y -= movementY * 0.003;
	}

	onMouseUp({ button }) {
		const { buttonState, isLocked } = this;
		if (!isLocked) {
			return;
		}
		switch (button) {
			case 0:
				buttonState.primary = false;
				break;
			case 1:
				buttonState.tertiary = false;
				break;
			case 2:
				buttonState.secondary = false;
				break;
			default:
				break;
		}
	}

	onMouseWheel({ deltaY }) {
		const { speed, isLocked } = this;
		if (!isLocked) {
			return;
		}
		const { minSpeed, speedRange } = ClientPlayer;
		const logSpeed = Math.min(
			Math.max(
				((Math.log(speed) - minSpeed) / speedRange) - (deltaY * 0.0003),
				0
			),
			1
		);
		this.speed = Math.exp(minSpeed + logSpeed * speedRange);
	}

	onPointerLock() {
		this.isLocked = !!document.pointerLockElement;
		document.body.classList[this.isLocked ? 'add' : 'remove']('pointerlock');
		if (!this.isLocked) {
			this.onBlur();
		}
	}

	requestPointerLock() {
		const { isLocked } = this;
		if (isLocked) {
			return;
		}
		document.body.requestPointerLock();
	}
}

ClientPlayer.minSpeed = Math.log(4);
ClientPlayer.maxSpeed = Math.log(40);
ClientPlayer.speedRange = ClientPlayer.maxSpeed - ClientPlayer.minSpeed;

export default ClientPlayer;

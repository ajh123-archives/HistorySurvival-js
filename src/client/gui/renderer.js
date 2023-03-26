import {
	ACESFilmicToneMapping,
	AudioListener,
	Clock,
	PerspectiveCamera,
	ShaderChunk,
	sRGBEncoding,
	WebGLRenderer,
	Frustum,
	Matrix4,
} from 'three';
	
class Renderer {
	constructor({debugGui, viewport}) {
		this.clock = new Clock();
		this.clock.localStartTime = Date.now();

		this.debugGui = debugGui;
		// this.folder = this.debugGui.datGUI.addFolder('Rendering');
		// this.info = {fps: 0};
		// this.folder.add(this.info, 'fps');

		this.viewport = viewport;
		this.camera = new PerspectiveCamera(70, 1, 0.1, 1000);
		this.renderer = new WebGLRenderer({
			antialias: true,
			stencil: false,
			powerPreference: 'high-performance',
		});
		this.renderer.outputEncoding = sRGBEncoding;
		this.renderer.toneMapping = ACESFilmicToneMapping;
		// this.renderer.setPixelRatio(window.devicePixelRatio || 1);
		this.renderer.setAnimationLoop(this.onAnimationTick.bind(this));
		this.viewport.appendChild(this.renderer.domElement);
		
		this.onFirstInteraction = this.onFirstInteraction.bind(this);
		window.addEventListener('click', this.onFirstInteraction, false);
		window.addEventListener('keydown', this.onFirstInteraction, false);
		
		window.addEventListener('resize', this.onResize.bind(this), false);
		document.addEventListener('visibilitychange', this.onVisibilityChange.bind(this));
		requestAnimationFrame(this.onResize.bind(this));
	}

	onAnimationTick() {
		const {
			camera,
			clock,
			debugGui,
			listener,
			renderer,
			scene,
		} = this;

		const animation = {
			delta: Math.min(clock.getDelta(), 1),
			time: clock.oldTime / 1000,
		};

		scene.onAnimationTick(animation);
		if (listener) {
			camera.matrixWorld.decompose(listener.position, listener.quaternion, listener.scale);
			listener.updateMatrixWorld();
		}
		debugGui.stats.begin();
		renderer.render(scene, camera);
		debugGui.stats.end();
	}

	onFirstInteraction() {
		const { scene } = this;
		window.removeEventListener('click', this.onFirstInteraction);
		window.removeEventListener('keydown', this.onFirstInteraction);
		this.listener = new AudioListener();
		scene.onFirstInteraction();
	}

	onResize() {
		const {
			camera,
			viewport,
			renderer,
			scene,
		} = this;

		const { width, height } = viewport.getBoundingClientRect();
		renderer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		scene.onResize();
	}

	onVisibilityChange() {
		const { clock } = this;
		const isVisible = document.visibilityState === 'visible';
		if (isVisible) {
			clock.start();
		}
	}

	getFrustum() {
		const frustum = new Frustum();
		const cameraViewProjectionMatrix = new Matrix4();
		
		// Update frustum with current camera settings
		this.camera.updateMatrixWorld();
		cameraViewProjectionMatrix.multiplyMatrices(
			this.camera.projectionMatrix,
			this.camera.matrixWorldInverse
		);
		frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);
		return frustum;
	}

	static patchFog() {
		ShaderChunk.fog_pars_vertex = ShaderChunk.fog_pars_vertex.replace(
			'varying float vFogDepth;',
			'varying vec3 vFogPosition;'
		);

		ShaderChunk.fog_vertex = ShaderChunk.fog_vertex.replace(
			'vFogDepth = - mvPosition.z;',
			'vFogPosition = - mvPosition.xyz;'
		);

		ShaderChunk.fog_pars_fragment = ShaderChunk.fog_pars_fragment.replace(
			'varying float vFogDepth;',
			'varying vec3 vFogPosition;'
		);

		ShaderChunk.fog_fragment = ShaderChunk.fog_fragment.replace(
			'#ifdef USE_FOG',
			[
				'#ifdef USE_FOG',
				'  float vFogDepth = length(vFogPosition);',
			].join('\n')
		);
	}
}

export default Renderer;
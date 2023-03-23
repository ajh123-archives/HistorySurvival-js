import * as dat from 'dat.gui';
import Stats from 'stats.js';


class DebugGui {
	constructor() {
		this.datGUI = new dat.GUI({name: 'Debug'});
		this.stats = new Stats();
		this.stats.showPanel(0);
		document.body.appendChild(this.stats.dom);
	}
}

export default DebugGui;

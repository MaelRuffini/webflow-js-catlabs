import * as THREE from 'three'
import Experience from '../Experience'

export default class Environment {
	constructor() {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.debug = this.experience.debug

		if (this.debug.active) {
			this.debugFolder = this.debug.ui.addFolder('environment')
			this.debugFolder.close()
		}

		this.setSunLight()
	}

	setSunLight() {
		this.directionalLight = new THREE.DirectionalLight('#ffffff', 4)
		this.directionalLight.position.set(3.5, 2, -1.25)
		this.scene.add(this.directionalLight)
	}
}

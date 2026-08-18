import * as THREE from 'three'
import Experience from '../Experience'

export default class Environment {
	constructor() {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.resources = this.experience.resources
		this.time = this.experience.time
		this.debug = this.experience.debug

		this.params = {
			rotationSpeed: 0.02,
			backgroundIntensity: 1,
		}

		if (this.debug.active) {
			this.debugFolder = this.debug.ui.addFolder('environment')
			this.debugFolder.close()
		}

		this.setSunLight()
		this.setBackground()
		this.setDebug()
	}

	setSunLight() {
		this.directionalLight = new THREE.DirectionalLight('#ffffff', 4)
		this.directionalLight.position.set(3.5, 2, -1.25)
		this.scene.add(this.directionalLight)
	}

	setBackground() {
		this.environmentMap = this.resources.items.environmentMap
		this.environmentMap.colorSpace = THREE.SRGBColorSpace

		this.scene.background = this.environmentMap
		this.scene.backgroundIntensity = this.params.backgroundIntensity
	}

	setDebug() {
		if (!this.debug.active) return

		this.debugFolder
			.add(this.params, 'rotationSpeed')
			.min(0)
			.max(0.2)
			.step(0.001)
			.name('sky rotation')

		this.debugFolder
			.add(this.params, 'backgroundIntensity')
			.min(0)
			.max(3)
			.step(0.01)
			.name('sky intensity')
			.onChange((value) => {
				this.scene.backgroundIntensity = value
			})
	}

	update() {
		this.scene.backgroundRotation.y += this.params.rotationSpeed * this.time.delta * 0.001
	}
}

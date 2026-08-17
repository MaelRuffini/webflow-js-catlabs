import * as THREE from 'three'
import Experience from '../Experience'

export default class Environment {
	constructor() {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.resources = this.experience.resources
		this.debug = this.experience.debug

		//Debug
		if (this.debug.active) {
			this.debugFolder = this.debug.ui.addFolder('environment')
		}

		this.setSunLight()
		this.setEnvironmentMap()
	}

	setSunLight() {
		this.directionalLight = new THREE.DirectionalLight('#ffffff', 4)
		this.directionalLight.castShadow = true
		this.directionalLight.shadow.camera.far = 15
		this.directionalLight.shadow.mapSize.set(1024, 1024)
		this.directionalLight.shadow.normalBias = 0.05
		this.directionalLight.position.set(3.5, 2, -1.25)
		this.scene.add(this.directionalLight)
	}

	setEnvironmentMap() {
		this.environmentMap = {}
		this.environmentMap.intensity = 0.1
		this.environmentMap.texture = this.resources.items.environmentMapTexture
		this.environmentMap.texture.encoding = THREE.SRGBColorSpace

		this.scene.environment = this.environmentMap.texture

		this.environmentMap.updateMaterial = () => {
			this.scene.traverse((child) => {
				if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
					child.material.envMap = this.environmentMap.texture
					child.material.envMapIntensity = this.environmentMap.intensity
					child.material.needsUpdate = true
				}
			})
		}

		this.environmentMap.updateMaterial()

		if (this.debug.active) {
			this.debugFolder
				.add(this.environmentMap, 'intensity')
				.name('envMapIntensity')
				.min(0)
				.max(4)
				.step(0.001)
				.onChange(this.environmentMap.updateMaterial)
		}
	}
}

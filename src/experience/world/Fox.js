import * as THREE from 'three'
import Experience from '../Experience'

export default class Fox {
	constructor() {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.resources = this.experience.resources
		this.time = this.experience.time

		this.ressource = this.resources.items.foxModel

		this.setModel()
		this.setAnimation()
	}

	setModel() {
		this.model = this.ressource.scene
		this.model.scale.set(0.02, 0.02, 0.02)
		this.scene.add(this.model)

		this.model.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				child.castShadow = true
			}
		})
	}

	setAnimation() {
		this.animation = {}
		this.animation.mixer = new THREE.AnimationMixer(this.model)
		this.animation.action = this.animation.mixer.clipAction(this.ressource.animations[0])
		this.animation.action.play()
	}

	update() {
		this.animation.mixer.update(this.time.delta * 0.001)
	}
}

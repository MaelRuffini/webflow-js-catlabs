import * as THREE from 'three'
import Experience from '../Experience'

export default class BakedModel {
	constructor(modelKey, textureKey) {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.resources = this.experience.resources

		this.gltf = this.resources.items[modelKey]
		this.texture = this.resources.items[textureKey]

		this.setTexture()
		this.setMaterial()
		this.setModel()
	}

	setTexture() {
		this.texture.flipY = false
		this.texture.colorSpace = THREE.SRGBColorSpace
	}

	setMaterial() {
		this.material = new THREE.MeshBasicMaterial({
			map: this.texture,
		})
	}

	setModel() {
		this.model = this.gltf.scene
		this.meshes = {}

		this.model.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				child.material = this.material
				this.meshes[child.name] = child
			}
		})

		this.scene.add(this.model)
	}
}

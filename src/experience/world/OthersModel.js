import * as THREE from 'three'
import Experience from '../Experience'

export default class OthersModel {
	constructor() {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.resources = this.experience.resources
		this.postProcessing = this.experience.postProcessing
		this.debug = this.experience.debug

		this.gltf = this.resources.items.othersModel

		this.params = {
			tvColor: '#000000',
			tvRoughness: 0,
			tvMetalness: 1,
			lampColor: '#ec9465',
			lampEmissiveIntensity: 0.75,
		}

		this.setMaterials()
		this.setModel()
		this.setDebug()
	}

	setMaterials() {
		this.tvMaterial = new THREE.MeshStandardMaterial({
			color: this.params.tvColor,
			roughness: this.params.tvRoughness,
			metalness: this.params.tvMetalness,
		})

		this.lampMaterial = new THREE.MeshStandardMaterial({
			color: this.params.lampColor,
			emissive: this.params.lampColor,
			emissiveIntensity: this.params.lampEmissiveIntensity,
			roughness: 1,
			metalness: 0,
		})
	}

	setModel() {
		this.model = this.gltf.scene
		this.meshes = {}

		this.model.traverse((child) => {
			if (!(child instanceof THREE.Mesh)) return

			this.meshes[child.name] = child

			if (child.name === 'tv') {
				child.material = this.tvMaterial
			}

			if (child.name === 'lamp') {
				child.material = this.lampMaterial
				this.postProcessing.addBloomObject(child)
			}
		})

		this.scene.add(this.model)
	}

	setDebug() {
		if (!this.debug.active) return

		this.debugFolder = this.debug.ui.addFolder('others')

		this.debugFolder
			.addColor(this.params, 'tvColor')
			.name('tv color')
			.onChange((value) => {
				this.tvMaterial.color.set(value)
			})

		this.debugFolder
			.add(this.params, 'tvRoughness')
			.min(0)
			.max(1)
			.step(0.01)
			.name('tv roughness')
			.onChange((value) => {
				this.tvMaterial.roughness = value
			})

		this.debugFolder
			.add(this.params, 'tvMetalness')
			.min(0)
			.max(1)
			.step(0.01)
			.name('tv metalness')
			.onChange((value) => {
				this.tvMaterial.metalness = value
			})

		this.debugFolder
			.addColor(this.params, 'lampColor')
			.name('lamp color')
			.onChange((value) => {
				this.lampMaterial.color.set(value)
				this.lampMaterial.emissive.set(value)
			})

		this.debugFolder
			.add(this.params, 'lampEmissiveIntensity')
			.min(0)
			.max(10)
			.step(0.1)
			.name('lamp emissive')
			.onChange((value) => {
				this.lampMaterial.emissiveIntensity = value
			})
	}
}

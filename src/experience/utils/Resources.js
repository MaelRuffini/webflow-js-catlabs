import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { TinyEmitter } from 'tiny-emitter'

export default class Resources extends TinyEmitter {
	constructor(sources) {
		super()

		this.sources = sources

		this.items = {}
		this.toLoad = this.sources.length
		this.loaded = 0
		this.ready = false

		this.setLoaders()
		this.startLoading()
	}

	setLoaders() {
		this.loaders = {}

		this.loadingManager = new THREE.LoadingManager(
			undefined,
			(_itemUrl, itemsLoaded, itemsTotal) => {
				this.emit('progress', itemsLoaded / itemsTotal)
			}
		)

		const dracoLoader = new DRACOLoader()
		dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.185.1/examples/jsm/libs/draco/gltf/')

		this.loaders.gltfLoader = new GLTFLoader(this.loadingManager)
		this.loaders.gltfLoader.setDRACOLoader(dracoLoader)
		this.loaders.textureLoader = new THREE.TextureLoader(this.loadingManager)
		this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader(this.loadingManager)
	}

	startLoading() {
		// Load each source
		for (const source of this.sources) {
			if (source.type === 'gltfModel') {
				this.loaders.gltfLoader.load(source.path, (file) => {
					this.sourceLoaded(source, file)
				})
			} else if (source.type === 'texture') {
				this.loaders.textureLoader.load(source.path, (file) => {
					this.sourceLoaded(source, file)
				})
			} else if (source.type === 'cubeTexture') {
				this.loaders.cubeTextureLoader.load(source.path, (file) => {
					this.sourceLoaded(source, file)
				})
			}
		}
	}

	sourceLoaded(source, file) {
		this.items[source.name] = file

		this.loaded++

		if (this.loaded === this.toLoad) {
			this.ready = true
			this.emit('ready')
		}
	}
}

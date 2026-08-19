import * as THREE from 'three'
import Sizes from './utils/Sizes'
import Time from './utils/Time'
import Camera from './Camera'
import Renderer from './Renderer'
import CssRenderer from './CssRenderer'
import PostProcessing from './PostProcessing'
import World from './world/World'
import sources from './sources'
import Debug from './utils/Debug'
import Resources from './utils/Resources'
import Loader from './utils/Loader'

let instance = null

export default class Experience {
	constructor(canvas) {
		// Global access
		window.experience = this

		if (instance) {
			return instance
		}
		instance = this

		// Options
		this.canvas = canvas

		// Setup
		this.debug = new Debug()
		this.sizes = new Sizes()
		this.time = new Time()
		this.scene = new THREE.Scene()
		this.resources = new Resources(sources)
		this.loader = new Loader(this.resources)
		this.camera = new Camera()
		this.renderer = new Renderer()
		this.cssRenderer = new CssRenderer()
		this.postProcessing = new PostProcessing()
		this.world = new World()

		// Sizes resize event
		this.sizes.on('resize', () => {
			this.resize()
		})

		// Time tick event
		this.time.on('tick', () => {
			this.update()
		})
	}

	resize() {
		this.camera.resize()
		this.renderer.resize()
		this.cssRenderer.resize()
		this.postProcessing.resize()
	}

	update() {
		this.camera.update()
		this.world.update()
		this.postProcessing.update()
		this.cssRenderer.update()
	}

	destroy() {
		this.sizes.destroy()
		this.time.destroy()
		this.camera.destroy()
		this.cssRenderer.destroy()
		this.postProcessing.dispose()

		// Traverse the whole scene
		this.scene.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				child.geometry.dispose()

				for (const key in child.material) {
					const value = child.material[key]
					if (value && typeof value.dispose === 'function') {
						value.dispose()
					}
				}
			}

			this.renderer.instance.dispose()
			if (this.debug.active) {
				this.debug.ui.destroy()
			}
		})
	}
}

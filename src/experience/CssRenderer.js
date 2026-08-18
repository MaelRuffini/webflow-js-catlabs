import * as THREE from 'three'
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import Experience from './Experience'

export default class CssRenderer {
	constructor() {
		this.experience = new Experience()
		this.canvas = this.experience.canvas
		this.sizes = this.experience.sizes
		this.camera = this.experience.camera

		this.scene = new THREE.Scene()

		this.setInstance()
	}

	setInstance() {
		this.instance = new CSS3DRenderer()
		this.instance.setSize(this.sizes.width, this.sizes.height)

		this.element = this.instance.domElement
		this.element.classList.add('css3d')

		this.wrapper = this.canvas.closest('.webgl__wrapper') || this.canvas.parentElement
		this.wrapper.insertBefore(this.element, this.canvas)

		this.canvas.style.pointerEvents = 'none'
	}

	resize() {
		this.instance.setSize(this.sizes.width, this.sizes.height)
	}

	update() {
		this.instance.render(this.scene, this.camera.instance)
	}

	destroy() {
		this.element.remove()
	}
}

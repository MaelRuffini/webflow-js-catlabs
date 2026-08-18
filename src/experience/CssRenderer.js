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
		this.active = this.sizes.width >= 992

		this.setInstance()
		this.applyActive()
	}

	setInstance() {
		this.instance = new CSS3DRenderer()
		this.instance.setSize(this.sizes.width, this.sizes.height)

		this.element = this.instance.domElement
		this.element.classList.add('css3d')

		this.wrapper = this.canvas.closest('.webgl__wrapper') || this.canvas.parentElement
		this.wrapper.insertBefore(this.element, this.canvas)
	}

	applyActive() {
		this.element.style.display = this.active ? '' : 'none'
		this.canvas.style.pointerEvents = this.active ? 'none' : ''
	}

	setActive(active) {
		if (this.active === active) return
		this.active = active
		this.applyActive()
	}

	resize() {
		this.instance.setSize(this.sizes.width, this.sizes.height)
		this.setActive(this.sizes.width >= 992)
	}

	update() {
		if (!this.active) return
		this.instance.render(this.scene, this.camera.instance)
	}

	destroy() {
		this.element.remove()
	}
}

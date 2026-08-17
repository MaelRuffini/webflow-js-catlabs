import { TinyEmitter } from 'tiny-emitter'

export default class Sizes extends TinyEmitter {
	constructor() {
		super()

		// Setup
		this.width = window.innerWidth
		this.height = window.innerHeight

		this.pixelRatio = Math.min(window.devicePixelRatio, 2)

		// Resize event
		window.addEventListener('resize', () => {
			this.width = window.innerWidth
			this.height = window.innerHeight

			this.pixelRatio = Math.min(window.devicePixelRatio, 2)

			this.emit('resize')
		})
	}

	destroy() {
		window.removeEventListener('resize', this.resize)
		this.off('resize')
	}
}

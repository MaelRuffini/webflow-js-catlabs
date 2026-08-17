import { TinyEmitter } from 'tiny-emitter'

export default class Time extends TinyEmitter {
	constructor() {
		super()

		this.start = Date.now()
		this.current = this.start
		this.elapsed = 0
		this.delta = 16
		this.animationFrame = null

		this.animationFrame = window.requestAnimationFrame(() => {
			this.tick()
		})
	}

	tick() {
		const currentTime = Date.now()
		this.delta = currentTime - this.current
		this.current = currentTime
		this.elapsed = this.current - this.start

		this.emit('tick')

		this.animationFrame = window.requestAnimationFrame(() => {
			this.tick()
		})
	}

	destroy() {
		if (this.animationFrame) {
			window.cancelAnimationFrame(this.animationFrame)
		}
		this.off('tick')
	}
}

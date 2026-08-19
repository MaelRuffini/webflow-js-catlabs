import gsap from 'gsap'
import { lenis } from '../../lenis.js'

export default class Loader {
	constructor(resources) {
		this.resources = resources
		this.element = document.querySelector('.loader__wrapper')
		this.progressElement = document.querySelector('.loader__progress')
		this.body = document.body

		this.body.classList.add('disable-scroll')

		if (this.progressElement) {
			this.progressElement.style.transformOrigin = 'left center'
			this.progressElement.style.transform = 'scaleX(0)'
		}

		this.resources.on('progress', (progressRatio) => {
			if (!this.progressElement) return
			this.progressElement.style.transform = `scaleX(${progressRatio})`
		})

		this.resources.on('ready', () => {
			if (this.progressElement) {
				this.progressElement.style.transform = 'scaleX(1)'
			}

			gsap.delayedCall(0.5, () => this.hide())
		})
	}

	hide() {
		const reveal = () => {
			this.body.classList.remove('disable-scroll')
			lenis?.start()

			if (this.element) {
				this.element.style.display = 'none'
			}
		}

		if (!this.element) {
			reveal()
			return
		}

		gsap.to(this.element, {
			opacity: 0,
			duration: 0.8,
			ease: 'power3.inOut',
			onComplete: reveal,
		})
	}
}

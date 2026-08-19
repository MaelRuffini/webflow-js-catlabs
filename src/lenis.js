import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export let lenis = null

function onTick(time) {
	lenis?.raf(time * 1000)
}

export function initLenis() {
	if (lenis) return lenis

	lenis = new Lenis({
		autoRaf: false,
		anchors: true,
		stopInertiaOnNavigate: true,
		prevent: (node) => Boolean(node.closest?.('.screen-page, .css3d, [data-lenis-prevent]')),
	})

	lenis.on('scroll', ScrollTrigger.update)
	gsap.ticker.add(onTick)
	gsap.ticker.lagSmoothing(0)

	if (!window.experience?.resources?.ready) {
		lenis.stop()
	}

	return lenis
}

import gsap from 'gsap'

const DURATION = 0.8
const EASE = 'power3.inOut'
const DELAY = 0.12
const UNDERLINE_DELAY = 0.28

function wrapAndClone(element, wrapperClass) {
	const clip = document.createElement('span')
	clip.className = wrapperClass
	element.replaceWith(clip)

	const clone = element.cloneNode(true)
	clone.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'))
	clone.setAttribute('aria-hidden', 'true')

	clip.append(element, clone)

	return { original: element, clone }
}

function cloneInPlace(element) {
	const clone = element.cloneNode(true)
	clone.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'))
	clone.setAttribute('aria-hidden', 'true')
	element.after(clone)

	return clone
}

function setupHover(root) {
	if (root.dataset.hoverInit === 'true') return

	const svg = root.querySelector('svg')
	const divider = root.querySelector('.link__divider')

	if (!svg && !divider) return

	root.dataset.hoverInit = 'true'

	const timeline = gsap.timeline({
		paused: true,
		defaults: { duration: DURATION, ease: EASE },
		onComplete: () => timeline.pause(0),
	})

	if (svg) {
		const { original, clone } = wrapAndClone(svg, 'button__arrow')

		gsap.set(clone, { xPercent: -100, yPercent: 100 })
		timeline.to(original, { xPercent: 100, yPercent: -100 }, 0)
		timeline.to(clone, { xPercent: 0, yPercent: 0 }, DELAY)
	}

	if (divider) {
		const clone = cloneInPlace(divider)

		gsap.set(divider, { transformOrigin: 'right center' })
		gsap.set(clone, { scaleX: 0, transformOrigin: 'left center' })
		timeline.to(divider, { scaleX: 0, ease: 'power3.inOut' }, 0)
		timeline.to(clone, { scaleX: 1, ease: 'power3.inOut' }, UNDERLINE_DELAY)
	}

	root.addEventListener('mouseenter', () => {
		if (timeline.isActive()) return
		timeline.play(0)
	})
}

export function initButtons(scope = document) {
	scope.querySelectorAll('.button, .link').forEach(setupHover)
}

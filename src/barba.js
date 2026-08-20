import barba from '@barba/core'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { lenis } from './lenis.js'
import { initButtons } from './button.js'

const FADE_DURATION = 0.6
const PAGE_CONTAINER = 'main[data-barba="container"]'
const CONTACT_SECTION = '.section--contact'

function findPageContainer(scope) {
	const root = scope || document

	if (root.nodeType === 1 && root.matches?.(PAGE_CONTAINER)) return root

	return root.querySelector?.(PAGE_CONTAINER) || null
}

function getContactSection() {
	return document.querySelector(CONTACT_SECTION)
}

function isContactNamespace(namespace) {
	return namespace === 'contact'
}

function setContactVisible(visible, { opacity } = {}) {
	const contact = getContactSection()
	if (!contact) return

	gsap.killTweensOf(contact)

	if (visible) {
		gsap.set(contact, { display: 'block', opacity: opacity ?? 1 })
		return
	}

	gsap.set(contact, { display: 'none', opacity: 0 })
}

function getFadeTargets(container, namespace) {
	const targets = container ? [container] : []

	if (isContactNamespace(namespace)) {
		const contact = getContactSection()
		if (contact) targets.push(contact)
	}

	return targets
}

function readTransitionNamespace(side) {
	if (!side) return null
	if (side.namespace && side.namespace !== 'tmp') return side.namespace

	return readNamespace(side.container) || namespaceFromUrl(side.url?.href)
}

function readNamespace(root) {
	if (!root) return null

	return (
		root.getAttribute?.('data-barba-namespace') ||
		root.getAttribute?.('data-namespace') ||
		root.querySelector?.('[data-barba-namespace]')?.getAttribute('data-barba-namespace') ||
		root.querySelector?.('[data-namespace]')?.getAttribute('data-namespace') ||
		null
	)
}

function normalizePathname(pathname) {
	return String(pathname || '/').replace(/\/+$/, '').toLowerCase() || '/'
}

function parseUrl(href) {
	try {
		return new URL(href, window.location.origin)
	} catch {
		return null
	}
}

function isCurrentPageUrl(href) {
	const next = parseUrl(href)
	if (!next) return false

	const current = window.location

	return (
		next.origin === current.origin &&
		normalizePathname(next.pathname) === normalizePathname(current.pathname) &&
		next.search === current.search
	)
}

function preventSamePageClick(event) {
	if (event.defaultPrevented || event.button !== 0) return
	if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

	const link = event.target?.closest?.('a[href]')
	if (!link) return
	if (link.hasAttribute('download') || (link.target && link.target !== '_self')) return

	const href = link.getAttribute('href')
	if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return

	const next = parseUrl(link.href)
	if (!next) return
	if (next.hash && next.hash !== window.location.hash) return
	if (!isCurrentPageUrl(link.href)) return

	event.preventDefault()
	event.stopPropagation()
}

function namespaceFromUrl(href) {
	if (!href) return null

	const parsed = parseUrl(href)
	let path = parsed ? parsed.pathname : String(href)

	path = normalizePathname(path)

	if (path === '/' || path === '/home') return 'home'
	if (path === '/contact' || path.endsWith('/contact')) return 'contact'
	if (path === '/creators' || path.endsWith('/creators')) return 'creators'
	if (path.includes('/creator')) return 'creator'

	return null
}

function resolveNamespace(data) {
	const next = data?.next
	const fromBarba = next?.namespace && next.namespace !== 'tmp' ? next.namespace : null
	const fromContainer = readNamespace(next?.container)

	let fromHtml = null

	if (next?.html) {
		const doc = new DOMParser().parseFromString(next.html, 'text/html')
		fromHtml =
			readNamespace(doc.querySelector(PAGE_CONTAINER)) ||
			readNamespace(doc.body) ||
			readNamespace(doc.documentElement)
	}

	return fromBarba || fromContainer || fromHtml || namespaceFromUrl(next?.url?.href) || 'home'
}

function resetWebflow(data) {
	try {
		const html = new DOMParser().parseFromString(data.next.html, 'text/html')
		const wfPage = html.documentElement.getAttribute('data-wf-page')

		if (wfPage) {
			document.documentElement.setAttribute('data-wf-page', wfPage)
		}

		if (html.body) {
			document.body.className = html.body.className

				;['data-namespace', 'data-barba-namespace'].forEach((attr) => {
					const value = html.body.getAttribute(attr)
					if (value) document.body.setAttribute(attr, value)
					else document.body.removeAttribute(attr)
				})
		}

		window.Webflow?.destroy()
		window.Webflow?.ready()
		window.Webflow?.require('ix2')?.init()
	} catch (error) {
		console.warn('[barba] Webflow reset skipped', error)
	}
}

export function initBarba(experience) {
	document.addEventListener('click', preventSamePageClick, true)

	const originalGetContainer = barba.dom.getContainer.bind(barba.dom)
	barba.dom.getContainer = (element) => {
		return findPageContainer(element || barba.dom.wrapper || document) || originalGetContainer(element)
	}

	barba.init({
		preventRunning: true,
		prevent: ({ href }) => isCurrentPageUrl(href),
		sync: false,
		transitions: [
			{
				name: 'opacity-transition',
				once(data) {
					const namespace = resolveNamespace(data)
					setContactVisible(isContactNamespace(namespace))
					document.body.classList.toggle('body--contact', isContactNamespace(namespace))
				},
				leave(data) {
					const container = findPageContainer(data.current.container) || data.current.container
					const currentNamespace = readTransitionNamespace(data.current)
					experience.camera.goTo(resolveNamespace(data))

					if (isContactNamespace(currentNamespace)) {
						document.body.classList.remove('body--contact')
						setContactVisible(true, { opacity: 1 })
					}

					return new Promise((resolve) => {
						gsap.to(getFadeTargets(container, currentNamespace), {
							opacity: 0,
							duration: FADE_DURATION,
							ease: 'power2.in',
							onComplete: resolve,
						})
					})
				},
				afterLeave({ current }) {
					if (isContactNamespace(readTransitionNamespace(current))) {
						setContactVisible(false)
					}

					current.container.remove()
				},
				beforeEnter(data) {
					const namespace = resolveNamespace(data)
					const container = findPageContainer(data.next.container) || data.next.container

					gsap.set(container, { opacity: 0 })
					setContactVisible(isContactNamespace(namespace), { opacity: 0 })
				},
				enter(data) {
					const container = findPageContainer(data.next.container) || data.next.container
					const namespace = resolveNamespace(data)
					lenis?.scrollTo(0, { immediate: true })

					return new Promise((resolve) => {
						const fadeIn = () => {
							gsap.to(getFadeTargets(container, namespace), {
								opacity: 1,
								duration: FADE_DURATION,
								ease: 'power2.out',
								onComplete: resolve,
							})
						}

						const cameraTween = experience.camera.timeline
						if (cameraTween) {
							cameraTween.then(fadeIn)
							return
						}

						fadeIn()
					})
				},
				after(data) {
					const namespace = resolveNamespace(data)
					resetWebflow(data)
					document.body.classList.toggle('body--contact', isContactNamespace(namespace))
					initButtons(findPageContainer(data.next.container) || data.next.container)
					experience.world?.screen?.syncFromPage()
					lenis?.resize()
					ScrollTrigger.refresh()
				},
			},
		],
	})
}

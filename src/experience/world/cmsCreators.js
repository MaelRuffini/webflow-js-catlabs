import barba from '@barba/core'

const fallbackFiles = [
	{ name: 'lab-cat.jpg', color: '#d4a574' },
	{ name: 'portrait.png', color: '#e8c9a8' },
	{ name: 'sky-sample.bmp', color: '#6eb3e0' },
	{ name: 'experiment-01.png', color: '#8fbf88' },
	{ name: 'render-02.jpg', color: '#c47a7a' },
	{ name: 'notes.gif', color: '#cfc07a' },
]

export const profileFields = [
	{ key: 'detail', label: 'Detail', selector: '.computer-cms__detail' },
	{ key: 'superpower', label: 'Superpower', selector: '.computer-cms__superpower' },
	{ key: 'make', label: 'What they make', selector: '.computer-cms__make' },
	{ key: 'want', label: 'What they want', selector: '.computer-cms__want' },
]

function escapeHtml(value) {
	const el = document.createElement('div')
	el.textContent = value
	return el.innerHTML
}

function imageSrc(img) {
	if (!img) return ''

	return (
		img.currentSrc ||
		img.getAttribute('src') ||
		img.getAttribute('data-src') ||
		(img.getAttribute('srcset') || '').split(',')[0].trim().split(' ')[0] ||
		''
	)
}

function fieldText(item, selector) {
	return (item.querySelector(selector)?.textContent || '').trim()
}

function toAbsoluteUrl(href) {
	if (!href) return ''

	const value = String(href).trim()
	if (!value || value === '#') return ''

	try {
		return new URL(value, window.location.origin).href
	} catch {
		return ''
	}
}

function pathnameOf(href) {
	try {
		return new URL(href, window.location.origin).pathname.replace(/\/+$/, '').toLowerCase() || '/'
	} catch {
		return ''
	}
}

export function isCurrentPageUrl(href) {
	return Boolean(href) && pathnameOf(href) === pathnameOf(window.location.href)
}

export function findCreatorFileForCurrentPage(files) {
	const path = pathnameOf(window.location.href)
	const byPage = files.find((file) => file.page && pathnameOf(file.page) === path)
	if (byPage) return byPage

	const heading = document.querySelector('.creators__name')?.textContent?.trim().toLowerCase()
	if (!heading) return null

	return files.find((file) => file.name?.trim().toLowerCase() === heading) || null
}

function elementHref(el) {
	if (!el) return ''

	return toAbsoluteUrl(el.getAttribute('href') || (el.href && el.href !== window.location.href ? el.href : ''))
}

function creatorPageUrl(item) {
	const pageEl = item.querySelector('a.computer-cms__page, .computer-cms__page')
	const fromPage = elementHref(pageEl)
	if (fromPage) return fromPage

	const slug = fieldText(item, '.computer-cms__slug')
	if (!slug) return ''

	const clean = slug.replace(/^\/+|\/+$/g, '')
	return toAbsoluteUrl(clean.includes('/') ? `/${clean}` : `/creators/${clean}`)
}

function creatorProjectsUrl(item) {
	const el = item.querySelector('a.computer-cms__link, .computer-cms__link')
	if (!el) return ''

	const link = el.matches('a[href]') ? el : el.querySelector('a[href]')
	return elementHref(link || el) || toAbsoluteUrl(el.textContent)
}

export function getCreatorFiles() {
	const items = document.querySelectorAll(
		'.creators__data .creators__cl-item, .computer-cms .creators__cl-item, .computer-cms .computer-cms__item, [data-computer-file]'
	)
	const files = []

	items.forEach((item) => {
		const img = item.querySelector('.computer-cms__image, img')
		const nameEl = item.querySelector('.computer-cms__name, [data-computer-name]')
		const name = (nameEl?.textContent || img?.getAttribute('alt') || item.getAttribute('data-name') || '').trim()
		const image = imageSrc(img) || item.getAttribute('data-image') || ''

		if (!name && !image) return

		const file = {
			name: name || 'untitled',
			image,
			link: creatorProjectsUrl(item),
			page: creatorPageUrl(item),
		}

		profileFields.forEach(({ key, selector }) => {
			file[key] = fieldText(item, selector)
		})

		files.push(file)
	})

	return files.length ? files : fallbackFiles
}

export function fileThumb(color) {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="#fff" stroke="#111" d="M7.5 3.5h13l6 6v19h-19z"/><path fill="#c0c0c0" stroke="#111" d="M20.5 3.5v6h6"/><rect x="10" y="12" width="14" height="10" fill="${color}" stroke="#333"/></svg>`
	return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export function fileIconHtml(file, index) {
	const src = file.image || fileThumb(file.color || '#c0c0c0')
	const name = escapeHtml(file.name)

	return `
		<div class="file-icon" role="button" tabindex="0" data-index="${index}" data-name="${name}">
			<img src="${src}" alt="" draggable="false" />
			<span>${name}</span>
		</div>
	`
}

export function profileFieldsHtml(file) {
	return profileFields
		.filter(({ key }) => file[key])
		.map(
			({ key, label }) => `
			<div class="field-row-stacked profile-field">
				<label>${escapeHtml(label)}</label>
				<textarea readonly rows="3">${escapeHtml(file[key])}</textarea>
			</div>
		`
		)
		.join('')
}

export function navigateToCreatorPage(url) {
	if (!url) return false

	if (typeof barba.go === 'function') {
		barba.go(url)
		return true
	}

	window.location.assign(url)
	return true
}

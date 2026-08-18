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

function isUrl(value) {
	return /^https?:\/\//i.test(value)
}

export function getCreatorFiles() {
	const items = document.querySelectorAll(
		'.creators__cl-item, .computer-cms .computer-cms__item, [data-computer-file]'
	)
	const files = []

	items.forEach((item) => {
		const img = item.querySelector('.computer-cms__image, img')
		const nameEl = item.querySelector('.computer-cms__name, [data-computer-name]')
		const name = (nameEl?.textContent || img?.getAttribute('alt') || item.getAttribute('data-name') || '').trim()
		const image = imageSrc(img) || item.getAttribute('data-image') || ''
		const link = fieldText(item, '.computer-cms__link')

		if (!name && !image) return

		const file = {
			name: name || 'untitled',
			image,
			link: isUrl(link) ? link : '',
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

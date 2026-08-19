import * as THREE from 'three'
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import Experience from '../Experience'
import { ASSET_BASE } from '../sources'
import desktopCss from './screenDesktop.css?inline'
import {
	fileIconHtml,
	fileThumb,
	findCreatorFileForCurrentPage,
	getCreatorFiles,
	isCurrentPageUrl,
	navigateToCreatorPage,
	profileFieldsHtml,
} from './cmsCreators'

const computerBase = `${ASSET_BASE}/computer`
const DESKTOP_MIN_WIDTH = 992

export default class Screen {
	constructor(targetMesh) {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.cssScene = this.experience.cssRenderer.scene
		this.debug = this.experience.debug
		this.sizes = this.experience.sizes
		this.cssRenderer = this.experience.cssRenderer

		this.targetMesh = targetMesh

		this.pageWidth = 800

		this.worldPosition = new THREE.Vector3()
		this.worldQuaternion = new THREE.Quaternion()
		this.worldScale = new THREE.Vector3()

		this.params = {
			positionX: -0.226,
			positionY: 1.394,
			positionZ: -0.163,
			rotationX: -0.0705,
			rotationY: 0,
			rotationZ: 0,
			width: 0.353,
			height: 0.279,
			offset: 0.002,
		}

		this.setAnchor()
		this.setHole()
		this.setPage()
		this.applyTransform()
		this.setDebug()
		this.setActive(this.sizes.width >= DESKTOP_MIN_WIDTH)

		this.sizes.on('resize', () => {
			this.setActive(this.sizes.width >= DESKTOP_MIN_WIDTH)
		})
	}

	setAnchor() {
		this.anchor = new THREE.Object3D()
		this.anchor.name = 'screenAnchor'
		this.targetMesh.add(this.anchor)
	}

	setHole() {
		this.geometry = new THREE.PlaneGeometry(1, 1)
		this.material = new THREE.MeshBasicMaterial({
			color: 0x000000,
			opacity: 0,
			blending: THREE.NoBlending,
		})

		this.hole = new THREE.Mesh(this.geometry, this.material)
		this.hole.name = 'screenHole'
		this.anchor.add(this.hole)
	}

	setPage() {
		this.files = getCreatorFiles()

		this.element = document.createElement('div')
		this.element.className = 'screen-page'
		this.element.setAttribute('data-lenis-prevent', '')
		this.element.style.backgroundImage = `url(${computerBase}/background.jpg)`

		this.shadow = this.element.attachShadow({ mode: 'open' })
		this.shadow.innerHTML = `
			<link rel="stylesheet" href="https://unpkg.com/98.css@0.1.21/dist/98.css" />
			<style>${desktopCss}</style>
			<div class="desktop">
				<div class="desktop-icon" role="button" tabindex="0">
					<img src="${computerBase}/folder-icon.svg" alt="" draggable="false" />
					<span>Creators</span>
				</div>
				<div class="window creators-window">
					<div class="title-bar">
						<div class="title-bar-text">
							<img class="title-bar-icon" src="${computerBase}/folder-icon.svg" alt="" />
							Creators
						</div>
						<div class="title-bar-controls">
							<button aria-label="Minimize"></button>
							<button aria-label="Maximize"></button>
							<button aria-label="Close"></button>
						</div>
					</div>
					<div class="window-body">
						<div class="file-grid">
							${this.files.map((file, index) => fileIconHtml(file, index)).join('')}
						</div>
					</div>
					<div class="status-bar">
						<p class="status-bar-field">${this.files.length} object(s)</p>
						<p class="status-bar-field"></p>
					</div>
				</div>
				<div class="window profile-window is-hidden">
					<div class="title-bar">
						<div class="title-bar-text" data-profile-title>Creator profile</div>
						<div class="title-bar-controls">
							<button aria-label="Minimize"></button>
							<button aria-label="Maximize"></button>
							<button aria-label="Close" data-profile-close></button>
						</div>
					</div>
					<div class="window-body profile-body">
						<div class="profile-photo">
							<img data-profile-image alt="" draggable="false" />
						</div>
						<div class="profile-info">
							<div class="profile-name" data-profile-name></div>
							<button type="button" class="profile-projects is-hidden" data-profile-link>
								See Projects
							</button>
							<div class="profile-fields" data-profile-fields></div>
						</div>
					</div>
				</div>
			</div>
		`

		this.desktop = this.shadow.querySelector('.desktop')
		this.folder = this.shadow.querySelector('.desktop-icon')
		this.windowEl = this.shadow.querySelector('.creators-window')
		this.profileEl = this.shadow.querySelector('.profile-window')
		this.profileTitle = this.shadow.querySelector('[data-profile-title]')
		this.profileName = this.shadow.querySelector('[data-profile-name]')
		this.profileImage = this.shadow.querySelector('[data-profile-image]')
		this.profileFields = this.shadow.querySelector('[data-profile-fields]')
		this.profileLink = this.shadow.querySelector('[data-profile-link]')

		this.folder.addEventListener('click', (event) => {
			event.stopPropagation()
			this.openFolder()
		})

		this.desktop.addEventListener('click', (event) => {
			if (event.target !== this.desktop) return
			this.folder.classList.remove('is-selected')
			this.clearFileSelection()
		})

		this.shadow.querySelectorAll('.file-icon').forEach((el) => {
			el.addEventListener('click', (event) => {
				event.stopPropagation()
				this.clearFileSelection()
				el.classList.add('is-selected')
				this.openProfile(this.files[Number(el.dataset.index)])
			})
		})

		this.windowEl.querySelector('[aria-label="Close"]').addEventListener('click', () => {
			this.closeFolder()
		})
		this.windowEl.querySelector('[aria-label="Minimize"]').addEventListener('click', () => {
			this.closeFolder()
		})
		this.profileEl.querySelector('[data-profile-close]').addEventListener('click', () => {
			this.closeProfile()
		})
		this.profileEl.querySelector('[aria-label="Minimize"]').addEventListener('click', () => {
			this.closeProfile()
		})
		this.profileLink.addEventListener('click', (event) => {
			event.stopPropagation()
			this.goToProjectsLink()
		})

		this.profileInfo = this.shadow.querySelector('.profile-info')
		this.profileScrollY = 0
		this.profileInfo.addEventListener(
			'wheel',
			(event) => {
				event.preventDefault()
				event.stopPropagation()
				this.scrollProfile(event)
			},
			{ capture: true, passive: false }
		)

		this.openFolder()
		this.syncFromPage()

		this.cssObject = new CSS3DObject(this.element)
		this.cssScene.add(this.cssObject)
	}

	setActive(active) {
		this.active = active
		this.hole.visible = active
		if (this.cssObject) this.cssObject.visible = active
		if (this.element) this.element.style.display = active ? '' : 'none'
		this.cssRenderer.setActive(active)
	}

	applyPageScale() {
		const aspect = this.params.height / this.params.width
		this.element.style.width = `${this.pageWidth}px`
		this.element.style.height = `${this.pageWidth * aspect}px`
		this.cssObject.scale.setScalar(this.params.width / this.pageWidth)
	}

	applyTransform() {
		this.anchor.position.set(this.params.positionX, this.params.positionY, this.params.positionZ)
		this.anchor.rotation.set(
			this.params.rotationX,
			this.params.rotationY,
			this.params.rotationZ
		)
		this.hole.scale.set(this.params.width, this.params.height, 1)
		this.hole.position.z = this.params.offset
		this.applyPageScale()
		this.syncPage()
	}

	syncPage() {
		this.hole.updateWorldMatrix(true, false)
		this.hole.matrixWorld.decompose(this.worldPosition, this.worldQuaternion, this.worldScale)
		this.cssObject.position.copy(this.worldPosition)
		this.cssObject.quaternion.copy(this.worldQuaternion)
	}

	update() {
		if (!this.active) return
		this.syncPage()
	}

	openFolder() {
		this.windowEl.classList.remove('is-hidden')
		this.folder.classList.add('is-selected')
	}

	closeFolder() {
		this.closeProfile()
		this.windowEl.classList.add('is-hidden')
	}

	selectFile(file) {
		this.clearFileSelection()
		const index = this.files.indexOf(file)
		if (index < 0) return
		this.shadow.querySelector(`.file-icon[data-index="${index}"]`)?.classList.add('is-selected')
	}

	openProfile(file, { navigate = true } = {}) {
		if (!file) return

		const alreadyOpen =
			this.currentFile &&
			!this.profileEl.classList.contains('is-hidden') &&
			this.currentFile.name === file.name &&
			this.currentFile.page === file.page

		if (alreadyOpen) {
			if (navigate && file.page && !isCurrentPageUrl(file.page)) {
				this.goToCreatorPage(file)
			}
			return
		}

		this.currentFile = file
		this.selectFile(file)
		this.profileTitle.textContent = `${file.name} – Creator profile`
		this.profileName.textContent = file.name
		this.profileImage.src = file.image || fileThumb(file.color || '#c0c0c0')
		this.profileImage.alt = file.name
		this.profileFields.innerHTML = `<div class="profile-fields-content">${profileFieldsHtml(file)}</div>`
		this.profileFieldsContent = this.profileFields.querySelector('.profile-fields-content')

		if (file.link) {
			this.profileLink.dataset.href = file.link
			this.profileLink.classList.remove('is-hidden')
		} else {
			delete this.profileLink.dataset.href
			this.profileLink.classList.add('is-hidden')
		}

		this.profileEl.classList.remove('is-hidden')
		this.profileFields.querySelectorAll('textarea').forEach((field) => {
			field.style.height = 'auto'
			field.style.height = `${field.scrollHeight}px`
		})
		this.profileScrollY = 0
		this.applyProfileScroll()

		if (navigate && file.page && !isCurrentPageUrl(file.page)) {
			this.goToCreatorPage(file)
		}
	}

	scrollProfile(event) {
		const delta =
			event.deltaMode === 1
				? event.deltaY * 16
				: event.deltaMode === 2
					? event.deltaY * (this.profileFields?.clientHeight || 0)
					: event.deltaY

		this.profileScrollY += delta
		this.applyProfileScroll()
	}

	applyProfileScroll() {
		const content = this.profileFieldsContent
		const viewport = this.profileFields
		if (!content || !viewport) return

		const max = Math.max(0, content.offsetHeight - viewport.clientHeight)
		this.profileScrollY = Math.min(max, Math.max(0, this.profileScrollY))
		content.style.top = `${-this.profileScrollY}px`
	}

	syncFromPage() {
		const files = getCreatorFiles()
		if (files.length) this.files = files

		const file = findCreatorFileForCurrentPage(this.files)
		if (!file) {
			this.closeProfile()
			return
		}

		this.openFolder()
		this.openProfile(file, { navigate: false })
	}

	closeProfile() {
		this.profileScrollY = 0
		this.applyProfileScroll()
		this.profileEl.classList.add('is-hidden')
	}

	goToCreatorPage(file = this.currentFile) {
		if (!file?.page) return
		navigateToCreatorPage(file.page)
	}

	goToProjectsLink(file = this.currentFile) {
		const url = file?.link
		if (!url) return
		window.open(url, '_blank', 'noopener,noreferrer')
	}

	clearFileSelection() {
		this.shadow.querySelectorAll('.file-icon.is-selected').forEach((el) => {
			el.classList.remove('is-selected')
		})
	}

	setDebug() {
		if (!this.debug.active) return

		const apply = () => this.applyTransform()

		this.debugFolder = this.debug.ui.addFolder('screen')

		this.debugFolder
			.add(this.params, 'positionX')
			.min(-5)
			.max(5)
			.step(0.001)
			.onChange(apply)
		this.debugFolder
			.add(this.params, 'positionY')
			.min(-5)
			.max(5)
			.step(0.001)
			.onChange(apply)
		this.debugFolder
			.add(this.params, 'positionZ')
			.min(-5)
			.max(5)
			.step(0.001)
			.onChange(apply)

		this.debugFolder
			.add(this.params, 'rotationX')
			.min(-Math.PI)
			.max(Math.PI)
			.step(0.001)
			.onChange(apply)
		this.debugFolder
			.add(this.params, 'rotationY')
			.min(-Math.PI)
			.max(Math.PI)
			.step(0.001)
			.onChange(apply)
		this.debugFolder
			.add(this.params, 'rotationZ')
			.min(-Math.PI)
			.max(Math.PI)
			.step(0.001)
			.onChange(apply)

		this.debugFolder.add(this.params, 'width').min(0.01).max(5).step(0.001).onChange(apply)
		this.debugFolder.add(this.params, 'height').min(0.01).max(5).step(0.001).onChange(apply)
		this.debugFolder
			.add(this.params, 'offset')
			.min(-0.2)
			.max(0.2)
			.step(0.0005)
			.name('z offset')
			.onChange(apply)
	}
}

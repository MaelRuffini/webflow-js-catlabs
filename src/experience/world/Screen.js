import * as THREE from 'three'
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import Experience from '../Experience'
import { ASSET_BASE } from '../sources'
import desktopCss from './screenDesktop.css?inline'
import { fileIconHtml, fileThumb, getCreatorFiles, profileFieldsHtml } from './cmsCreators'

const computerBase = `${ASSET_BASE}/computer`

export default class Screen {
	constructor(targetMesh) {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.cssScene = this.experience.cssRenderer.scene
		this.debug = this.experience.debug

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
			if (this.profileLink.dataset.href) {
				window.open(this.profileLink.dataset.href, '_blank', 'noopener,noreferrer')
			}
		})

		this.openFolder()

		this.cssObject = new CSS3DObject(this.element)
		this.cssScene.add(this.cssObject)
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

	openProfile(file) {
		if (!file) return

		this.profileTitle.textContent = `${file.name} – Creator profile`
		this.profileName.textContent = file.name
		this.profileImage.src = file.image || fileThumb(file.color || '#c0c0c0')
		this.profileImage.alt = file.name
		this.profileFields.innerHTML = profileFieldsHtml(file)

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
	}

	closeProfile() {
		this.profileEl.classList.add('is-hidden')
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

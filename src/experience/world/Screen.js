import * as THREE from 'three'
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import Experience from '../Experience'

export default class Screen {
	constructor(targetMesh) {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.cssScene = this.experience.cssRenderer.scene
		this.debug = this.experience.debug
		this.camera = this.experience.camera

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
			height: 0.267,
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
		this.element = document.createElement('div')
		this.element.className = 'screen-page'

		this.element.innerHTML = `
			<header class="screen-page__header">
				<span>CATLABS</span>
				<span class="screen-page__live">LIVE</span>
			</header>
			<div class="screen-page__body">
				<p class="screen-page__title">Interactive screen</p>
				<input class="screen-page__input" type="text" placeholder="Type something…" />
				<button class="screen-page__button" type="button">Run experiment</button>
				<p class="screen-page__status">Ready.</p>
			</div>
		`

		this.input = this.element.querySelector('.screen-page__input')
		this.button = this.element.querySelector('.screen-page__button')
		this.status = this.element.querySelector('.screen-page__status')

		this.button.addEventListener('click', () => {
			const value = this.input.value.trim()
			this.status.textContent = value ? `Running “${value}”…` : 'Running default protocol…'
		})

		this.input.addEventListener('keydown', (event) => {
			if (event.key === 'Enter') {
				this.button.click()
			}
		})

		this.cssObject = new CSS3DObject(this.element)
		this.cssScene.add(this.cssObject)

		this.element.addEventListener('pointerenter', () => {
			this.camera.followEnabled = false
		})
		this.element.addEventListener('pointerleave', () => {
			this.camera.followEnabled = true
		})
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

import * as THREE from 'three'
import gsap from 'gsap'
import Experience from './Experience'

const NAMESPACES = ['home', 'creators', 'creator', 'contact']

export default class Camera {
	constructor() {
		this.experience = new Experience()
		this.sizes = this.experience.sizes
		this.scene = this.experience.scene
		this.canvas = this.experience.canvas
		this.debug = this.experience.debug
		this.time = this.experience.time

		// Blender default full-frame sensor (mm). Camera.fov in Three.js is vertical.
		this.sensorWidth = 36
		this.focalLength = 55.2

		this.params = {
			animationStrength: 0.5,
			floatStrength: 2.0,
			transitionDuration: 2,
		}

		this.views = {
			home: {
				positionX: 0,
				positionY: 2.06,
				positionZ: 15.58,
				rotationX: 0,
				rotationY: 0,
				rotationZ: 0,
				focalLength: 55.2,
			},
			creators: {
				positionX: -0.23,
				positionY: 1.389,
				positionZ: 0.835,
				rotationX: 0,
				rotationY: 0,
				rotationZ: 0,
				focalLength: 55.2,
			},
			creator: {
				positionX: -0.23,
				positionY: 1.389,
				positionZ: 0.835,
				rotationX: 0,
				rotationY: 0,
				rotationZ: 0,
				focalLength: 55.2,
			},
			contact: {
				positionX: 1.807,
				positionY: 1.807,
				positionZ: 0.332,
				rotationX: -0.02159,
				rotationY: 0,
				rotationZ: 0,
				focalLength: 55.2,
			},
		}

		this.mouse = { x: 0, y: 0 }
		this.targetX = 0
		this.targetY = 0
		this.followEnabled = true
		this.currentNamespace = null
		this.timeline = null
		this.motionScale = 1

		this.setInstance()
		this.goTo(this.getCurrentNamespace(), { immediate: true })
		this.setMouse()
		this.setDebug()
	}

	getCurrentNamespace() {
		const container = document.querySelector('main[data-barba="container"]')

		return (
			container?.getAttribute('data-barba-namespace') ||
			container?.getAttribute('data-namespace') ||
			document.body.getAttribute('data-barba-namespace') ||
			document.body.getAttribute('data-namespace') ||
			'home'
		)
	}

	focalLengthToFov(focalLength) {
		const sensorHeight = this.sensorWidth / this.instance.aspect
		return 2 * Math.atan(sensorHeight / (2 * focalLength)) * (180 / Math.PI)
	}

	fovToFocalLength(fov) {
		const sensorHeight = this.sensorWidth / this.instance.aspect
		return sensorHeight / (2 * Math.tan(((fov * Math.PI) / 180) * 0.5))
	}

	applyFocalLength() {
		this.instance.fov = this.focalLengthToFov(this.focalLength)
		this.instance.updateProjectionMatrix()
	}

	setInstance() {
		this.rig = new THREE.Group()

		this.baseRotationY = new THREE.Group()
		this.baseRotationX = new THREE.Group()
		this.mouseAnimation = new THREE.Group()

		this.instance = new THREE.PerspectiveCamera(35, this.sizes.width / this.sizes.height, 0.1, 100)
		this.applyFocalLength()

		this.mouseAnimation.add(this.instance)
		this.baseRotationX.add(this.mouseAnimation)
		this.baseRotationY.add(this.baseRotationX)
		this.rig.add(this.baseRotationY)
		this.scene.add(this.rig)
	}

	getPose() {
		return {
			positionX: this.rig.position.x,
			positionY: this.rig.position.y,
			positionZ: this.rig.position.z,
			rotationX: this.baseRotationX.rotation.x,
			rotationY: this.baseRotationY.rotation.y,
			rotationZ: this.rig.rotation.z,
			focalLength: this.focalLength,
		}
	}

	applyPose(pose) {
		this.rig.position.set(pose.positionX, pose.positionY, pose.positionZ)
		this.baseRotationX.rotation.x = pose.rotationX
		this.baseRotationY.rotation.y = pose.rotationY
		this.rig.rotation.z = pose.rotationZ
		this.focalLength = pose.focalLength
		this.applyFocalLength()
	}

	killTween() {
		this.timeline?.kill()
		this.timeline = null
		gsap.killTweensOf(this, 'motionScale')
	}

	motionScaleFor(namespace) {
		return namespace === 'creators' || namespace === 'creator' ? 0.03125 : 1
	}

	goTo(namespace, { immediate = false } = {}) {
		const view = this.views[namespace] || this.views.home

		if (!view) return this.timeline

		this.currentNamespace = namespace
		this.killTween()

		const targetScale = this.motionScaleFor(namespace)

		if (this.debugParams) {
			this.debugParams.view = this.views[namespace] ? namespace : 'home'
		}

		if (immediate) {
			this.motionScale = targetScale
			this.applyPose(view)
			this.rig.updateMatrixWorld(true)
			this.updateDebugDisplay()
			return this.timeline
		}

		const pose = this.getPose()
		const duration = this.params.transitionDuration
		const ease = 'power3.inOut'

		this.timeline = gsap.to(pose, {
			positionX: view.positionX,
			positionY: view.positionY,
			positionZ: view.positionZ,
			rotationX: view.rotationX,
			rotationY: view.rotationY,
			rotationZ: view.rotationZ,
			focalLength: view.focalLength,
			duration,
			ease,
			overwrite: true,
			onUpdate: () => {
				this.applyPose(pose)
				this.rig.updateMatrixWorld(true)
			},
			onComplete: () => {
				this.applyPose(view)
				this.motionScale = targetScale
				this.rig.updateMatrixWorld(true)
				this.updateDebugDisplay()
				this.timeline = null
			},
		})

		gsap.to(this, {
			motionScale: targetScale,
			duration,
			ease,
			overwrite: true,
		})

		return this.timeline
	}

	setMouse() {
		this.onMouseMove = (event) => {
			this.mouse.x = event.clientX - this.sizes.width * 0.5
			this.mouse.y = event.clientY - this.sizes.height * 0.5
		}

		document.addEventListener('mousemove', this.onMouseMove)
	}

	updateDebugDisplay() {
		this.debugFolder?.controllers.forEach((controller) => controller.updateDisplay())
	}

	setDebug() {
		if (!this.debug.active) return

		this.debugParams = {
			view: this.currentNamespace || 'home',
			goToView: () => {
				this.goTo(this.debugParams.view)
			},
			snapToView: () => {
				this.goTo(this.debugParams.view, { immediate: true })
			},
			savePose: () => {
				this.views[this.debugParams.view] = this.getPose()
				console.log(`[camera] saved ${this.debugParams.view}`, this.views[this.debugParams.view])
			},
		}

		this.debugFolder = this.debug.ui.addFolder('camera')
		this.debugFolder.close()

		this.debugFolder.add(this.debugParams, 'view', NAMESPACES).name('view')
		this.debugFolder.add(this.debugParams, 'goToView').name('animate to view')
		this.debugFolder.add(this.debugParams, 'snapToView').name('snap to view')
		this.debugFolder.add(this.debugParams, 'savePose').name('save pose to view')
		this.debugFolder
			.add(this.params, 'transitionDuration')
			.min(0.2)
			.max(4)
			.step(0.05)
			.name('transition duration')

		this.debugFolder.add(this.rig.position, 'x').min(-20).max(20).step(0.001).name('positionX')
		this.debugFolder.add(this.rig.position, 'y').min(-20).max(20).step(0.001).name('positionY')
		this.debugFolder.add(this.rig.position, 'z').min(-20).max(20).step(0.001).name('positionZ')

		this.debugFolder.add(this.baseRotationX.rotation, 'x').min(-Math.PI).max(Math.PI).step(0.01).name('rotationX')
		this.debugFolder.add(this.baseRotationY.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.01).name('rotationY')
		this.debugFolder.add(this.rig.rotation, 'z').min(-Math.PI).max(Math.PI).step(0.01).name('rotationZ')

		this.debugFolder
			.add(this, 'focalLength')
			.min(10)
			.max(200)
			.step(0.1)
			.name('focalLength (mm)')
			.onChange(() => {
				this.applyFocalLength()
			})

		this.debugFolder
			.add(this, 'sensorWidth')
			.min(1)
			.max(100)
			.step(0.1)
			.name('sensorWidth (mm)')
			.onChange(() => {
				this.applyFocalLength()
			})

		this.debugFolder
			.add(this.params, 'animationStrength')
			.min(0)
			.max(2)
			.step(0.01)
			.name('cursor strength')

		this.debugFolder
			.add(this.params, 'floatStrength')
			.min(0)
			.max(5)
			.step(0.01)
			.name('float strength')
	}

	resize() {
		this.instance.aspect = this.sizes.width / this.sizes.height
		this.applyFocalLength()
	}

	update() {
		if (!this.followEnabled) {
			this.rig.updateMatrixWorld(true)
			return
		}

		const rawTargetX = this.mouse.x * 0.0001
		const rawTargetY = this.mouse.y * 0.00015

		const mouseLerpFactor = 0.045
		this.targetX += mouseLerpFactor * (rawTargetX - this.targetX)
		this.targetY += mouseLerpFactor * (rawTargetY - this.targetY)

		const time = this.time.elapsed * 0.001
		const floatX = Math.sin(time * 0.5) * 0.025
		const floatY = Math.cos(time * 0.3) * 0.015

		this.baseRotationY.rotation.x = 0
		this.baseRotationY.rotation.z = 0
		this.baseRotationX.rotation.y = 0
		this.baseRotationX.rotation.z = 0

		const cursorScale = this.motionScale
		const verticalStrength = this.params.animationStrength * cursorScale
		const horizontalStrength = this.params.animationStrength * 0.75 * cursorScale
		const floatStrength = this.params.floatStrength * cursorScale

		this.mouseAnimation.rotation.x =
			this.targetY * 0.75 * verticalStrength + floatY * 0.01 * floatStrength
		this.mouseAnimation.rotation.y =
			this.targetX * 1.5 * horizontalStrength + floatX * 0.01 * floatStrength
		this.mouseAnimation.rotation.z = 0

		const positionLerpFactor = 0.03
		this.instance.position.y +=
			positionLerpFactor * (-this.targetY * 7.5 * verticalStrength - this.instance.position.y) +
			floatX * 0.1 * floatStrength
		this.instance.position.z +=
			positionLerpFactor * (this.targetY * 7.5 * verticalStrength - this.instance.position.z) +
			floatY * 0.01 * floatStrength
		this.instance.position.x +=
			positionLerpFactor * (this.targetX * 10 * horizontalStrength - this.instance.position.x) +
			floatX * 0.1 * floatStrength

		this.rig.updateMatrixWorld(true)
	}

	destroy() {
		this.killTween()
		document.removeEventListener('mousemove', this.onMouseMove)
	}
}

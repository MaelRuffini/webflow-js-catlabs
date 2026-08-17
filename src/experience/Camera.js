import * as THREE from 'three'
import Experience from './Experience'

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
		}

		this.mouse = { x: 0, y: 0 }
		this.targetX = 0
		this.targetY = 0

		this.setInstance()
		this.setMouse()
		this.setDebug()
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
		this.rig.position.set(0, 2.06, 15.58)

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

	setMouse() {
		this.onMouseMove = (event) => {
			this.mouse.x = event.clientX - this.sizes.width * 0.5
			this.mouse.y = event.clientY - this.sizes.height * 0.5
		}

		document.addEventListener('mousemove', this.onMouseMove)
	}

	setDebug() {
		if (!this.debug.active) return

		this.debugFolder = this.debug.ui.addFolder('camera')
		this.debugFolder.close()

		this.debugFolder.add(this.rig.position, 'x').min(-50).max(50).step(0.01).name('positionX')
		this.debugFolder.add(this.rig.position, 'y').min(-50).max(50).step(0.01).name('positionY')
		this.debugFolder.add(this.rig.position, 'z').min(-50).max(50).step(0.01).name('positionZ')

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

		const verticalStrength = this.params.animationStrength
		const horizontalStrength = this.params.animationStrength * 0.75

		this.mouseAnimation.rotation.x =
			this.targetY * 0.75 * verticalStrength + floatY * 0.01 * this.params.floatStrength
		this.mouseAnimation.rotation.y =
			this.targetX * 1.5 * horizontalStrength + floatX * 0.01 * this.params.floatStrength
		this.mouseAnimation.rotation.z = 0

		const positionLerpFactor = 0.03
		this.instance.position.y +=
			positionLerpFactor * (-this.targetY * 7.5 * verticalStrength - this.instance.position.y) +
			floatX * 0.1 * this.params.floatStrength
		this.instance.position.z +=
			positionLerpFactor * (this.targetY * 7.5 * verticalStrength - this.instance.position.z) +
			floatY * 0.01 * this.params.floatStrength
		this.instance.position.x +=
			positionLerpFactor * (this.targetX * 10 * horizontalStrength - this.instance.position.x) +
			floatX * 0.1 * this.params.floatStrength

		this.rig.updateMatrixWorld(true)
	}

	destroy() {
		document.removeEventListener('mousemove', this.onMouseMove)
	}
}

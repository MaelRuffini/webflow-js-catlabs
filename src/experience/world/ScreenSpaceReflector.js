import * as THREE from 'three'
import Experience from '../Experience'
import {
	screenSpaceReflectionVertexShader,
	screenSpaceReflectionFragmentShader,
} from '../shaders/screenSpaceReflectionShaders'

export default class ScreenSpaceReflector {
	constructor(mesh, { texture, excludeFromReflection = [] } = {}) {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.sizes = this.experience.sizes
		this.camera = this.experience.camera
		this.renderer = this.experience.renderer.instance
		this.debug = this.experience.debug

		this.mesh = mesh
		this.texture = texture
		this.excludeFromReflection = excludeFromReflection

		this.params = {
			metalness: 0.8,
			roughness: 0.1,
			reflectionStrength: 0.5,
			reflectionBlur: 1.0,
			resolution: 512,
			floorY: 0,
		}

		this.reflectionMatrix = new THREE.Matrix4()
		this.mirroredMatrix = new THREE.Matrix4()
		this.position = new THREE.Vector3()
		this.quaternion = new THREE.Quaternion()
		this.scale = new THREE.Vector3()
		this.hiddenObjects = []

		this.setFloorY()
		this.setRenderTarget()
		this.setMirrorCamera()
		this.setMaterial()
		this.setDebug()
	}

	setFloorY() {
		this.mesh.updateWorldMatrix(true, false)
		const boundingBox = new THREE.Box3().setFromObject(this.mesh)
		this.params.floorY = (boundingBox.min.y + boundingBox.max.y) * 0.5
	}

	setRenderTarget() {
		if (this.renderTarget) {
			this.renderTarget.dispose()
		}

		this.renderTarget = new THREE.WebGLRenderTarget(this.params.resolution, this.params.resolution, {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBAFormat,
			stencilBuffer: false,
			depthBuffer: true,
		})

		if (this.material) {
			this.material.uniforms.uScreenTexture.value = this.renderTarget.texture
		}
	}

	setMirrorCamera() {
		this.mirrorCamera = this.camera.instance.clone()
	}

	setMaterial() {
		this.material = new THREE.ShaderMaterial({
			vertexShader: screenSpaceReflectionVertexShader,
			fragmentShader: screenSpaceReflectionFragmentShader,
			uniforms: {
				uTexture: { value: this.texture },
				uScreenTexture: { value: this.renderTarget.texture },
				uMetalness: { value: this.params.metalness },
				uRoughness: { value: this.params.roughness },
				uReflectionStrength: { value: this.params.reflectionStrength },
				uReflectionBlur: { value: this.params.reflectionBlur },
				uCameraPosition: { value: this.camera.instance.position.clone() },
				uMirrorProjectionMatrix: { value: new THREE.Matrix4() },
				uMirrorViewMatrix: { value: new THREE.Matrix4() },
			},
			depthWrite: true,
		})

		this.mesh.material = this.material
		this.mesh.renderOrder = 10
	}

	setDebug() {
		if (!this.debug.active) return

		this.debugFolder = this.debug.ui.addFolder('floor reflection')
		this.debugFolder.close()

		this.debugFolder
			.add(this.params, 'metalness')
			.min(0)
			.max(1)
			.step(0.01)
			.onChange((value) => {
				this.material.uniforms.uMetalness.value = value
			})

		this.debugFolder
			.add(this.params, 'roughness')
			.min(0)
			.max(1)
			.step(0.01)
			.onChange((value) => {
				this.material.uniforms.uRoughness.value = value
			})

		this.debugFolder
			.add(this.params, 'reflectionStrength')
			.min(0)
			.max(1)
			.step(0.01)
			.name('strength')
			.onChange((value) => {
				this.material.uniforms.uReflectionStrength.value = value
			})

		this.debugFolder
			.add(this.params, 'reflectionBlur')
			.min(0)
			.max(8)
			.step(0.1)
			.name('blur')
			.onChange((value) => {
				this.material.uniforms.uReflectionBlur.value = value
			})

		this.debugFolder
			.add(this.params, 'floorY')
			.min(-5)
			.max(5)
			.step(0.01)
			.name('floor Y')

		this.debugFolder
			.add(this.params, 'resolution', [256, 512, 1024])
			.name('resolution')
			.onChange(() => {
				this.setRenderTarget()
			})
	}

	update() {
		if (!this.mesh || !this.material || !this.mirrorCamera) return

		const camera = this.camera.instance
		const uniforms = this.material.uniforms

		camera.getWorldPosition(uniforms.uCameraPosition.value)

		this.mirrorCamera.fov = camera.fov
		this.mirrorCamera.aspect = camera.aspect
		this.mirrorCamera.near = camera.near
		this.mirrorCamera.far = camera.far

		const floorY = this.params.floorY
		this.reflectionMatrix.set(1, 0, 0, 0, 0, -1, 0, 2 * floorY, 0, 0, 1, 0, 0, 0, 0, 1)
		this.mirroredMatrix.multiplyMatrices(this.reflectionMatrix, camera.matrixWorld)
		this.mirroredMatrix.decompose(this.position, this.quaternion, this.scale)

		this.mirrorCamera.position.copy(this.position)
		this.mirrorCamera.quaternion.copy(this.quaternion)
		this.mirrorCamera.updateProjectionMatrix()
		this.mirrorCamera.updateMatrixWorld()

		uniforms.uMirrorProjectionMatrix.value.copy(this.mirrorCamera.projectionMatrix)
		uniforms.uMirrorViewMatrix.value.copy(this.mirrorCamera.matrixWorldInverse)

		this.mesh.visible = false

		this.hiddenObjects.length = 0
		this.excludeFromReflection.forEach((item) => {
			const obj = item.current || item
			if (obj && obj.visible !== undefined) {
				this.hiddenObjects.push({ obj, wasVisible: obj.visible })
				obj.visible = false
			}
		})

		const currentRenderTarget = this.renderer.getRenderTarget()
		const currentAutoClear = this.renderer.autoClear

		this.renderer.setRenderTarget(this.renderTarget)
		this.renderer.autoClear = true
		this.renderer.clear()
		this.renderer.render(this.scene, this.mirrorCamera)

		this.renderer.setRenderTarget(currentRenderTarget)
		this.renderer.autoClear = currentAutoClear

		this.mesh.visible = true

		this.hiddenObjects.forEach(({ obj, wasVisible }) => {
			obj.visible = wasVisible
		})
	}

	dispose() {
		this.renderTarget.dispose()
		this.material.dispose()
	}
}

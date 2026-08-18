import * as THREE from 'three'
import {
	BlendFunction,
	ChromaticAberrationEffect,
	EffectComposer,
	EffectPass,
	NoiseEffect,
	RenderPass,
	SelectiveBloomEffect,
	VignetteEffect,
} from 'postprocessing'
import Experience from './Experience'

export default class PostProcessing {
	constructor() {
		this.experience = new Experience()
		this.renderer = this.experience.renderer.instance
		this.scene = this.experience.scene
		this.camera = this.experience.camera
		this.sizes = this.experience.sizes
		this.time = this.experience.time
		this.debug = this.experience.debug

		this.params = {
			vignetteEnabled: false,
			vignetteOffset: 0.4,
			vignetteDarkness: 0.6,
			noiseEnabled: true,
			noiseOpacity: 0.2,
			resolutionScale: 0.75,
			chromaticAberrationEnabled: true,
			chromaticAberrationOffset: 0.0001,
			bloomEnabled: true,
			bloomIntensity: 1.5,
			bloomThreshold: 0,
			bloomSmoothing: 0.2,
			bloomRadius: 0.7,
		}

		this.setComposer()
		this.setDebug()
	}

	setComposer() {
		this.composer = new EffectComposer(this.renderer, {
			multisampling: 0,
			stencilBuffer: true,
			frameBufferType: THREE.HalfFloatType,
		})

		this.chromaticAberrationEffect = new ChromaticAberrationEffect({
			offset: new THREE.Vector2(
				this.params.chromaticAberrationOffset,
				this.params.chromaticAberrationOffset
			),
		})

		this.vignetteEffect = new VignetteEffect({
			blendFunction: BlendFunction.NORMAL,
			offset: this.params.vignetteOffset,
			darkness: this.params.vignetteDarkness,
		})

		this.noiseEffect = new NoiseEffect({
			blendFunction: BlendFunction.OVERLAY,
		})
		this.noiseEffect.blendMode.opacity.value = this.params.noiseOpacity

		this.bloomEffect = new SelectiveBloomEffect(this.scene, this.camera.instance, {
			blendFunction: BlendFunction.ADD,
			mipmapBlur: true,
			luminanceThreshold: this.params.bloomThreshold,
			luminanceSmoothing: this.params.bloomSmoothing,
			intensity: this.params.bloomIntensity,
			radius: this.params.bloomRadius,
		})
		this.bloomEffect.ignoreBackground = true

		// Convolution effects cannot share an EffectPass
		this.bloomPass = new EffectPass(this.camera.instance, this.bloomEffect)
		this.chromaticAberrationPass = new EffectPass(
			this.camera.instance,
			this.chromaticAberrationEffect
		)
		this.effectsPass = new EffectPass(this.camera.instance, this.vignetteEffect, this.noiseEffect)

		this.renderPass = new RenderPass(this.scene, this.camera.instance)
		this.renderPass.clearPass.overrideClearAlpha = 0

		this.composer.addPass(this.renderPass)
		this.composer.addPass(this.bloomPass)
		this.composer.addPass(this.chromaticAberrationPass)
		this.composer.addPass(this.effectsPass)

		this.applyEnabledStates()
		this.resize()
	}

	applyEnabledStates() {
		this.bloomPass.enabled = this.params.bloomEnabled
		this.chromaticAberrationPass.enabled = this.params.chromaticAberrationEnabled
		this.vignetteEffect.blendMode.opacity.value = this.params.vignetteEnabled ? 1 : 0
		this.noiseEffect.blendMode.opacity.value = this.params.noiseEnabled ? this.params.noiseOpacity : 0
	}

	addBloomObject(object) {
		this.bloomEffect.selection.add(object)
	}

	setDebug() {
		if (!this.debug.active) return

		this.debugFolder = this.debug.ui.addFolder('post processing')
		this.debugFolder.close()

		this.debugFolder.add(this.params, 'bloomEnabled').name('bloom').onChange(() => {
			this.applyEnabledStates()
		})
		this.debugFolder
			.add(this.params, 'bloomIntensity')
			.min(0)
			.max(8)
			.step(0.1)
			.name('bloom intensity')
			.onChange((value) => {
				this.bloomEffect.intensity = value
			})
		this.debugFolder
			.add(this.params, 'bloomThreshold')
			.min(0)
			.max(1)
			.step(0.01)
			.name('bloom threshold')
			.onChange((value) => {
				this.bloomEffect.luminanceMaterial.threshold = value
			})
		this.debugFolder
			.add(this.params, 'bloomSmoothing')
			.min(0)
			.max(1)
			.step(0.01)
			.name('bloom smoothing')
			.onChange((value) => {
				this.bloomEffect.luminanceMaterial.smoothing = value
			})
		this.debugFolder
			.add(this.params, 'bloomRadius')
			.min(0)
			.max(1)
			.step(0.01)
			.name('bloom radius')
			.onChange((value) => {
				this.bloomEffect.mipmapBlurPass.radius = value
			})

		this.debugFolder.add(this.params, 'vignetteEnabled').name('vignette').onChange(() => {
			this.applyEnabledStates()
		})
		this.debugFolder
			.add(this.params, 'vignetteOffset')
			.min(0)
			.max(0.5)
			.step(0.01)
			.name('vignette start')
			.onChange((value) => {
				this.vignetteEffect.offset = value
			})
		this.debugFolder
			.add(this.params, 'vignetteDarkness')
			.min(0)
			.max(1)
			.step(0.01)
			.name('vignette intensity')
			.onChange((value) => {
				this.vignetteEffect.darkness = value
			})

		this.debugFolder.add(this.params, 'noiseEnabled').name('noise').onChange(() => {
			this.applyEnabledStates()
		})
		this.debugFolder
			.add(this.params, 'noiseOpacity')
			.min(0)
			.max(1)
			.step(0.01)
			.name('noise opacity')
			.onChange(() => {
				this.applyEnabledStates()
			})

		this.debugFolder
			.add(this.params, 'resolutionScale')
			.min(0.5)
			.max(1)
			.step(0.05)
			.name('resolution scale')
			.onChange(() => {
				this.resize()
			})

		this.debugFolder
			.add(this.params, 'chromaticAberrationEnabled')
			.name('chromatic aberration')
			.onChange(() => {
				this.applyEnabledStates()
			})
		this.debugFolder
			.add(this.params, 'chromaticAberrationOffset')
			.min(0)
			.max(0.005)
			.step(0.0001)
			.name('CA offset')
			.onChange((value) => {
				this.chromaticAberrationEffect.offset.set(value, value)
			})
	}

	resize() {
		this.renderer.setPixelRatio(this.sizes.pixelRatio * this.params.resolutionScale)
		this.composer.setSize(this.sizes.width, this.sizes.height)
	}

	update() {
		this.composer.render(this.time.delta * 0.001)
	}

	dispose() {
		this.composer.dispose()
	}
}

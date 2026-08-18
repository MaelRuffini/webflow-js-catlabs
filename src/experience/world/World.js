import Experience from '../Experience'
import Environment from './Environment'
import BakedModel from './BakedModel'
import ScreenSpaceReflector from './ScreenSpaceReflector'
import Screen from './Screen'

export default class World {
	constructor() {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.resources = this.experience.resources

		this.resources.on('ready', () => {
			this.dark = new BakedModel('darkModel', 'bakedDark')
			this.light = new BakedModel('lightModel', 'bakedLight')
			this.walls = new BakedModel('wallsModel', 'bakedWalls')
			this.wood = new BakedModel('woodModel', 'bakedWoods')
			this.lightBis = new BakedModel('lightBisModel', 'bakedLightBis')
			this.floor = new BakedModel('floorModel', 'bakedFloor')
			this.environment = new Environment()

			if (this.walls.meshes.floor) {
				this.floor = new ScreenSpaceReflector(this.walls.meshes.floor, {
					texture: this.walls.texture,
				})
			}

			if (this.light.meshes.computer) {
				this.screen = new Screen(this.light.meshes.computer)
			}
		})
	}

	update() {
		if (this.floor) {
			this.floor.update()
		}

		if (this.environment) {
			this.environment.update()
		}

		if (this.screen) {
			this.screen.update()
		}
	}
}

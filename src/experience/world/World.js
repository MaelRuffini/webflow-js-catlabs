import Experience from '../Experience'
import Environment from './Environment'
import BakedModel from './BakedModel'
import ScreenSpaceReflector from './ScreenSpaceReflector'

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
			this.environment = new Environment()

			if (this.walls.meshes.floor) {
				this.floor = new ScreenSpaceReflector(this.walls.meshes.floor, {
					texture: this.walls.texture,
				})
			}
		})
	}

	update() {
		if (this.floor) {
			this.floor.update()
		}
	}
}

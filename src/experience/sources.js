export const ASSET_BASE = 'https://webflow-js-catlabs.netlify.app'

export default [
	{
		name: 'darkModel',
		type: 'gltfModel',
		path: `${ASSET_BASE}/models/dark.glb`,
	},
	{
		name: 'lightModel',
		type: 'gltfModel',
		path: `${ASSET_BASE}/models/light.glb`,
	},
	{
		name: 'lightBisModel',
		type: 'gltfModel',
		path: `${ASSET_BASE}/models/lightBis.glb`,
	},
	{
		name: 'wallsModel',
		type: 'gltfModel',
		path: `${ASSET_BASE}/models/walls.glb`,
	},
	{
		name: 'floorModel',
		type: 'gltfModel',
		path: `${ASSET_BASE}/models/floor.glb`,
	},
	{
		name: 'woodModel',
		type: 'gltfModel',
		path: `${ASSET_BASE}/models/wood.glb`,
	},
	{
		name: 'othersModel',
		type: 'gltfModel',
		path: `${ASSET_BASE}/models/others.glb`,
	},
	{
		name: 'screenModel',
		type: 'gltfModel',
		path: `${import.meta.env.DEV ? 'http://localhost:3000' : ASSET_BASE}/models/screen.glb`,
	},
	{
		name: 'bakedDark',
		type: 'texture',
		path: `${ASSET_BASE}/textures/bakedDark.jpg`,
	},
	{
		name: 'bakedLight',
		type: 'texture',
		path: `${ASSET_BASE}/textures/bakedLight.jpg`,
	},
	{
		name: 'bakedLightBis',
		type: 'texture',
		path: `${ASSET_BASE}/textures/bakedLightBis.jpg`,
	},
	{
		name: 'bakedWalls',
		type: 'texture',
		path: `${ASSET_BASE}/textures/bakedWalls.jpg`,
	},
	{
		name: 'bakedFloor',
		type: 'texture',
		path: `${ASSET_BASE}/textures/bakedFloor.jpg`,
	},
	{
		name: 'bakedWoods',
		type: 'texture',
		path: `${ASSET_BASE}/textures/bakedWoods.jpg`,
	},
	{
		name: 'environmentMap',
		type: 'cubeTexture',
		path: [
			`${ASSET_BASE}/environment/px.png`,
			`${ASSET_BASE}/environment/nx.png`,
			`${ASSET_BASE}/environment/py.png`,
			`${ASSET_BASE}/environment/ny.png`,
			`${ASSET_BASE}/environment/pz.png`,
			`${ASSET_BASE}/environment/nz.png`,
		],
	},
]

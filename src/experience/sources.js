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
		name: 'wallsModel',
		type: 'gltfModel',
		path: `${ASSET_BASE}/models/walls.glb`,
	},
	{
		name: 'woodModel',
		type: 'gltfModel',
		path: `${ASSET_BASE}/models/wood.glb`,
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
		name: 'bakedWalls',
		type: 'texture',
		path: `${ASSET_BASE}/textures/bakedWalls.jpg`,
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
